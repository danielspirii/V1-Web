// api/ghl-stats.js — Vercel Serverless Function — PRODUCCIÓN
// SOLO LECTURA — un token por subcuenta
 
const BASE = 'https://services.leadconnectorhq.com';
 
const ACCOUNTS = [
  { id: 'UAsVjQixCImbKbde4VxU', name: 'Visa Homes SistemOS',    tokenKey: 'GHL_TOKEN_1' },
  { id: 'x1hCzi31wsdM1ILhtvMn', name: 'Finca el Sarao',          tokenKey: 'GHL_TOKEN_2' },
  { id: 'XOBCJ5KymRycK5c2VXvu', name: 'Tecnologia GenApp',       tokenKey: 'GHL_TOKEN_3' },
  { id: '6B2xSfU4hLqCz3D0w31W', name: 'Noble Art Official Corp', tokenKey: 'GHL_TOKEN_4' },
  { id: 'HGwisOoHBMos8Tyrm7Ve', name: 'FondeateLab',             tokenKey: 'GHL_TOKEN_5' },
];
 
function hdrs(token) {
  return { 'Authorization': `Bearer ${token}`, 'Version': '2021-07-28', 'Accept': 'application/json' };
}
 
function getRange(range) {
  const now = new Date();
  const end = new Date(now); end.setUTCHours(23, 59, 59, 999);
  const start = new Date(now);
  switch (range) {
    case 'yesterday':
      start.setUTCDate(start.getUTCDate()-1); start.setUTCHours(0,0,0,0);
      end.setUTCDate(end.getUTCDate()-1);     end.setUTCHours(23,59,59,999);
      break;
    case '7d':  start.setUTCDate(start.getUTCDate()-6);  start.setUTCHours(0,0,0,0); break;
    case '30d': start.setUTCDate(start.getUTCDate()-29); start.setUTCHours(0,0,0,0); break;
    case '90d': start.setUTCDate(start.getUTCDate()-89); start.setUTCHours(0,0,0,0); break;
    default:    start.setUTCHours(0,0,0,0);
  }
  return { start: start.toISOString(), end: end.toISOString(), startTs: start.getTime(), endTs: end.getTime() };
}
 
async function safeGet(url, token) {
  try {
    const res = await fetch(url, { headers: hdrs(token) });
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}
 
// Citas agendadas: consultamos con timestamps en ms (que es lo que GHL acepta)
// Ventana: 90 días atrás hasta 90 días adelante
// Filtramos los eventos por dateAdded dentro del rango del dashboard
async function getAppointmentsBooked(locationId, token, range) {
  try {
    const calData   = await safeGet(`${BASE}/calendars/?locationId=${locationId}`, token);
    const calendars = calData?.calendars || [];
    if (!calendars.length) return 0;
 
    const wStart = new Date(); wStart.setDate(wStart.getDate() - 90);
    const wEnd   = new Date(); wEnd.setDate(wEnd.getDate() + 90);
 
    // GHL acepta timestamps en milisegundos para este endpoint
    const startMs = wStart.getTime();
    const endMs   = wEnd.getTime();
 
    let total = 0;
 
    for (const cal of calendars) {
      const d = await safeGet(
        `${BASE}/calendars/events?locationId=${locationId}&calendarId=${cal.id}&startTime=${startMs}&endTime=${endMs}`,
        token
      );
      const events = d?.events || [];
 
      // Filtrar por fecha en que se agendó (dateAdded) dentro del rango solicitado
      const bookedInRange = events.filter(ev => {
        const raw = ev.dateAdded ?? ev.createdAt ?? ev.dateCreated ?? null;
        if (raw == null) return false;
        const ts = typeof raw === 'number' ? raw : new Date(raw).getTime();
        return ts >= range.startTs && ts <= range.endTs;
      });
 
      total += bookedInRange.length;
    }
 
    return total;
  } catch { return 0; }
}
 
async function getAccountStats(account, token, range) {
  const id = account.id;
 
  const [dTotal, dNew, dConv, appointments] = await Promise.all([
    safeGet(`${BASE}/contacts/?locationId=${id}&limit=1`, token),
    safeGet(`${BASE}/contacts/?locationId=${id}&startDate=${encodeURIComponent(range.start)}&endDate=${encodeURIComponent(range.end)}&limit=1`, token),
    safeGet(`${BASE}/conversations/search?locationId=${id}&startAfterDate=${range.startTs}&limit=1`, token),
    getAppointmentsBooked(id, token, range),
  ]);
 
  return {
    id,
    name:          account.name,
    totalLeads:    dTotal?.total ?? dTotal?.meta?.total ?? 0,
    newLeads:      dNew?.total   ?? dNew?.meta?.total   ?? 0,
    conversations: dConv?.total  ?? dConv?.meta?.total  ?? dConv?.conversations?.length ?? 0,
    appointments,
  };
}
 
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 'no-store');
 
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET')     return res.status(405).json({ error: 'Method not allowed' });
 
  const missing = ACCOUNTS.filter(a => !process.env[a.tokenKey]).map(a => a.tokenKey);
  if (missing.length) return res.status(500).json({ error: `Missing env vars: ${missing.join(', ')}` });
 
  const range     = req.query.range || 'today';
  const dateRange = getRange(range);
 
  // Modo debug: muestra respuesta raw con timestamps en ms
  if (req.query.debug === '1') {
    const acc   = ACCOUNTS[0];
    const token = process.env[acc.tokenKey];
    const id    = acc.id;
 
    const calData   = await safeGet(`${BASE}/calendars/?locationId=${id}`, token);
    const calendars = calData?.calendars || [];
 
    const wStart = new Date(); wStart.setDate(wStart.getDate() - 90);
    const wEnd   = new Date(); wEnd.setDate(wEnd.getDate() + 90);
    const startMs = wStart.getTime();
    const endMs   = wEnd.getTime();
 
    const calResults = await Promise.all(
      calendars.map(async (cal) => {
        // Probar tanto con ms como con ISO para ver cuál devuelve datos
        const [rMs, rIso] = await Promise.all([
          fetch(`${BASE}/calendars/events?locationId=${id}&calendarId=${cal.id}&startTime=${startMs}&endTime=${endMs}`, { headers: hdrs(token) }),
          fetch(`${BASE}/calendars/events?locationId=${id}&calendarId=${cal.id}&startTime=${encodeURIComponent(wStart.toISOString())}&endTime=${encodeURIComponent(wEnd.toISOString())}`, { headers: hdrs(token) }),
        ]);
        const [dMs, dIso] = await Promise.all([rMs.json(), rIso.json()]);
 
        const eventsMs  = dMs?.events  || [];
        const eventsIso = dIso?.events || [];
 
        // Mostrar muestra de campos de fecha del primer evento
        const sampleEvent = eventsMs[0] || eventsIso[0] || null;
        const dateFields = sampleEvent
          ? Object.entries(sampleEvent)
              .filter(([k]) => /date|creat|add|time/i.test(k))
              .reduce((o, [k,v]) => ({ ...o, [k]: v }), {})
          : null;
 
        return {
          calendarName:  cal.name,
          withMs:        { status: rMs.status, totalEvents: eventsMs.length },
          withIso:       { status: rIso.status, totalEvents: eventsIso.length },
          sampleDateFields: dateFields,
        };
      })
    );
 
    return res.status(200).json({
      debug: true,
      account: { id, name: acc.name },
      range,
      dateRange,
      windowMs:  { start: startMs, end: endMs },
      windowIso: { start: wStart.toISOString(), end: wEnd.toISOString() },
      calendar_results: calResults,
    });
  }
 
  // ── MODO NORMAL ──────────────────────────────────────────────────────────
  const results = await Promise.all(
    ACCOUNTS.map(acc => getAccountStats(acc, process.env[acc.tokenKey], dateRange))
  );
 
  const active = results.filter(l =>
    l.newLeads > 0 || l.totalLeads > 0 || l.conversations > 0 || l.appointments > 0
  );
 
  active.sort((a, b) => b.newLeads - a.newLeads);
 
  const totals = active.reduce((acc, l) => ({
    newLeads:      acc.newLeads      + (l.newLeads      || 0),
    totalLeads:    acc.totalLeads    + (l.totalLeads    || 0),
    conversations: acc.conversations + (l.conversations || 0),
    appointments:  acc.appointments  + (l.appointments  || 0),
  }), { newLeads: 0, totalLeads: 0, conversations: 0, appointments: 0 });
 
  return res.status(200).json({
    locations:      active,
    totals,
    updatedAt:      new Date().toISOString(),
    count:          active.length,
    total_accounts: ACCOUNTS.length,
    range,
    dateRange: { start: dateRange.start, end: dateRange.end },
  });
}
