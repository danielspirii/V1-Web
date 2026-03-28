// api/ghl-stats.js — Vercel Serverless Function
// Un token por subcuenta — SOLO LECTURA (GET únicamente)
// Variables de entorno requeridas:
//   GHL_TOKEN_1  ... token de Visa Homes SistemOS
//   GHL_TOKEN_2  ... token de Finca el Sarao
//   GHL_TOKEN_3  ... token de Tecnologia GenApp
//   GHL_TOKEN_4  ... token de Noble Art Official Corp
//   GHL_TOKEN_5  ... token de FondeateLab
 
const BASE = 'https://services.leadconnectorhq.com';
 
// Mapa estático de subcuentas: { locationId, nombre, tokenEnvVar }
const ACCOUNTS = [
  { id: 'UAsVjQixCImbKbde4VxU', name: 'Visa Homes SistemOS',       tokenKey: 'GHL_TOKEN_1' },
  { id: 'x1hCzi31wsdM1ILhtvMn', name: 'Finca el Sarao',             tokenKey: 'GHL_TOKEN_2' },
  { id: 'XOBCJ5KymRycK5c2VXvu', name: 'Tecnologia GenApp',          tokenKey: 'GHL_TOKEN_3' },
  { id: '6B2xSfU4hLqCz3D0w31W', name: 'Noble Art Official Corp',    tokenKey: 'GHL_TOKEN_4' },
  { id: 'HGwisOoHBMos8Tyrm7Ve', name: 'FondeateLab',                tokenKey: 'GHL_TOKEN_5' },
];
 
function hdrs(token) {
  return {
    'Authorization': `Bearer ${token}`,
    'Version': '2021-07-28',
    'Accept': 'application/json',
  };
}
 
function getRange(range) {
  const now = new Date();
  const end = new Date(now); end.setUTCHours(23, 59, 59, 999);
  const start = new Date(now);
  switch (range) {
    case 'yesterday':
      start.setUTCDate(start.getUTCDate() - 1); start.setUTCHours(0, 0, 0, 0);
      end.setUTCDate(end.getUTCDate() - 1);     end.setUTCHours(23, 59, 59, 999);
      break;
    case '7d':  start.setUTCDate(start.getUTCDate() - 6);  start.setUTCHours(0, 0, 0, 0); break;
    case '30d': start.setUTCDate(start.getUTCDate() - 29); start.setUTCHours(0, 0, 0, 0); break;
    default:    start.setUTCHours(0, 0, 0, 0);
  }
  return { start: start.toISOString(), end: end.toISOString(), startTs: start.getTime() };
}
 
async function safeGet(url, token) {
  try {
    const res = await fetch(url, { headers: hdrs(token) });
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}
 
async function getAccountStats(account, token, range) {
  const id = account.id;
 
  const [dTotal, dNew, dConv, dAppt] = await Promise.all([
    // Total contactos en CRM (sin filtro de fecha)
    safeGet(`${BASE}/contacts/?locationId=${id}&limit=1`, token),
    // Leads nuevos en el rango (creados en el periodo)
    safeGet(`${BASE}/contacts/?locationId=${id}&startDate=${encodeURIComponent(range.start)}&endDate=${encodeURIComponent(range.end)}&limit=1`, token),
    // Conversaciones activas en el rango
    safeGet(`${BASE}/conversations/search?locationId=${id}&startAfterDate=${range.startTs}&limit=1`, token),
    // Citas agendadas en el rango
    safeGet(`${BASE}/calendars/events?locationId=${id}&startTime=${encodeURIComponent(range.start)}&endTime=${encodeURIComponent(range.end)}&limit=100`, token),
  ]);
 
  return {
    id,
    name:          account.name,
    totalLeads:    dTotal?.total ?? dTotal?.meta?.total ?? 0,
    newLeads:      dNew?.total   ?? dNew?.meta?.total   ?? 0,
    conversations: dConv?.total  ?? dConv?.meta?.total  ?? dConv?.conversations?.length ?? 0,
    appointments:  dAppt?.total  ?? dAppt?.meta?.total  ?? dAppt?.events?.length ?? dAppt?.data?.length ?? 0,
  };
}
 
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 'no-store');
 
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET')     return res.status(405).json({ error: 'Method not allowed' });
 
  const range     = req.query.range || 'today';
  const dateRange = getRange(range);
 
  // Verificar que todos los tokens están configurados
  const missing = ACCOUNTS.filter(a => !process.env[a.tokenKey]).map(a => a.tokenKey);
  if (missing.length) {
    return res.status(500).json({ error: `Missing env vars: ${missing.join(', ')}` });
  }
 
  // Modo debug: devuelve respuestas raw de una cuenta para diagnóstico
  const debugMode = req.query.debug === '1';
  if (debugMode) {
    const acc   = ACCOUNTS[0]; // Visa Homes SistemOS
    const token = process.env[acc.tokenKey];
    const id    = acc.id;
    const [r1, r2, r3, r4] = await Promise.all([
      fetch(`${BASE}/contacts/?locationId=${id}&limit=1`, { headers: hdrs(token) }),
      fetch(`${BASE}/contacts/?locationId=${id}&startDate=${encodeURIComponent(dateRange.start)}&endDate=${encodeURIComponent(dateRange.end)}&limit=1`, { headers: hdrs(token) }),
      fetch(`${BASE}/conversations/search?locationId=${id}&startAfterDate=${dateRange.startTs}&limit=1`, { headers: hdrs(token) }),
      fetch(`${BASE}/calendars/events?locationId=${id}&startTime=${encodeURIComponent(dateRange.start)}&endTime=${encodeURIComponent(dateRange.end)}&limit=100`, { headers: hdrs(token) }),
    ]);
    const [d1, d2, d3, d4] = await Promise.all([r1.json(), r2.json(), r3.json(), r4.json()]);
    return res.status(200).json({
      debug: true, account: { id, name: acc.name }, dateRange,
      results: {
        contacts_total:  { status: r1.status, total: d1?.total ?? d1?.meta?.total ?? '?', sample: JSON.stringify(d1).slice(0, 400) },
        contacts_new:    { status: r2.status, total: d2?.total ?? d2?.meta?.total ?? '?', sample: JSON.stringify(d2).slice(0, 400) },
        conversations:   { status: r3.status, total: d3?.total ?? d3?.meta?.total ?? '?', sample: JSON.stringify(d3).slice(0, 400) },
        calendar_events: { status: r4.status, total: d4?.total ?? d4?.meta?.total ?? d4?.events?.length ?? '?', sample: JSON.stringify(d4).slice(0, 400) },
      }
    });
  }
 
  // Procesar todas las cuentas en paralelo
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
