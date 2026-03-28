// api/ghl-stats.js — Vercel Serverless Function — PRODUCCIÓN FINAL
// SOLO LECTURA — un token por subcuenta
// ✅ Calendar events: timestamps en milisegundos (ISO devuelve siempre 0)
// ✅ Appointments = citas AGENDADAS (dateAdded) en el periodo, no cuándo ocurren
 
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
 
// Citas AGENDADAS en el periodo (dateAdded dentro del rango)
// ✅ Usa timestamps en ms para startTime/endTime — ISO siempre devuelve 0
// ✅ Ventana amplia: 90 días atrás + 90 días adelante
async function getAppointmentsBooked(locationId, token, range) {
  try {
    const calData   = await safeGet(`${BASE}/calendars/?locationId=${locationId}`, token);
    const calendars = calData?.calendars || [];
    if (!calendars.length) return 0;
 
    // Ventana amplia en milisegundos (lo que acepta GHL)
    const wStartMs = Date.now() - 90 * 24 * 60 * 60 * 1000;
    const wEndMs   = Date.now() + 90 * 24 * 60 * 60 * 1000;
 
    let total = 0;
 
    for (const cal of calendars) {
      const d = await safeGet(
        `${BASE}/calendars/events?locationId=${locationId}&calendarId=${cal.id}&startTime=${wStartMs}&endTime=${wEndMs}`,
        token
      );
      const events = d?.events || [];
 
      // Filtrar por dateAdded (cuándo se agendó) dentro del rango del dashboard
      const booked = events.filter(ev => {
        if (!ev.dateAdded) return false;
        const ts = new Date(ev.dateAdded).getTime();
        return ts >= range.startTs && ts <= range.endTs;
      });
 
      total += booked.length;
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
 
  const results = await Promise.all(
    ACCOUNTS.map(acc => getAccountStats(acc, process.env[acc.tokenKey], dateRange))
  );
 
  // Solo mostrar cuentas con al menos 1 dato > 0
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
