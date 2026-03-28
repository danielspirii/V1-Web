// api/ghl-stats.js — Vercel Serverless Function
// Token de subcuenta "Sistemas con IA" con scopes:
//   contacts.readonly, conversations.readonly, calendars.readonly, calendars/events.readonly, locations.readonly
// Este token accede directamente a cada subcuenta pasando locationId — SOLO LECTURA
 
const GHL_SUBACCOUNT_TOKEN = process.env.GHL_SUBACCOUNT_TOKEN; // token de subcuenta
const GHL_AGENCY_TOKEN     = process.env.GHL_API_KEY;          // token de agencia (para listar locations)
const BASE = 'https://services.leadconnectorhq.com';
 
function agencyHdrs() {
  return {
    'Authorization': `Bearer ${GHL_AGENCY_TOKEN}`,
    'Version': '2021-07-28',
    'Accept': 'application/json',
  };
}
 
function subHdrs() {
  return {
    'Authorization': `Bearer ${GHL_SUBACCOUNT_TOKEN}`,
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
  return {
    start:   start.toISOString(),
    end:     end.toISOString(),
    startTs: start.getTime(),
  };
}
 
async function safeGet(url, hdrs) {
  try {
    const res = await fetch(url, { headers: hdrs });
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}
 
async function getLocations() {
  const res = await fetch(`${BASE}/locations/search?limit=100`, { headers: agencyHdrs() });
  if (!res.ok) throw new Error(`Locations error: ${res.status}`);
  const d = await res.json();
  return d.locations || [];
}
 
async function locationStats(loc, range) {
  const id = loc.id;
 
  const [dTotal, dNew, dConv, dAppt] = await Promise.all([
    // Total contactos — sin filtro de fecha
    safeGet(`${BASE}/contacts/?locationId=${id}&limit=1`, subHdrs()),
    // Leads nuevos en el rango
    safeGet(`${BASE}/contacts/?locationId=${id}&startDate=${encodeURIComponent(range.start)}&endDate=${encodeURIComponent(range.end)}&limit=1`, subHdrs()),
    // Conversaciones con actividad en el rango
    safeGet(`${BASE}/conversations/search?locationId=${id}&startAfterDate=${range.startTs}&limit=1`, subHdrs()),
    // Citas agendadas en el rango
    safeGet(`${BASE}/calendars/events?locationId=${id}&startTime=${encodeURIComponent(range.start)}&endTime=${encodeURIComponent(range.end)}&limit=100`, subHdrs()),
  ]);
 
  const totalLeads    = dTotal?.total ?? dTotal?.meta?.total ?? 0;
  const newLeads      = dNew?.total   ?? dNew?.meta?.total   ?? 0;
  const conversations = dConv?.total  ?? dConv?.meta?.total  ?? dConv?.conversations?.length ?? 0;
  const appointments  = dAppt?.total  ?? dAppt?.meta?.total  ?? dAppt?.events?.length ?? dAppt?.data?.length ?? 0;
 
  return {
    id,
    name: loc.name || loc.businessName || 'Sin nombre',
    newLeads,
    totalLeads,
    conversations,
    appointments,
  };
}
 
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 'no-store');
 
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET')     return res.status(405).json({ error: 'Method not allowed' });
  if (!GHL_AGENCY_TOKEN)        return res.status(500).json({ error: 'GHL_API_KEY not configured' });
  if (!GHL_SUBACCOUNT_TOKEN)    return res.status(500).json({ error: 'GHL_SUBACCOUNT_TOKEN not configured' });
 
  // Modo debug: solo prueba Visa Homes SistemOS y devuelve respuestas raw
  const debugMode = req.query.debug === '1';
  const range     = req.query.range || 'today';
  const dateRange = getRange(range);
 
  try {
    const locations = await getLocations();
    if (!locations.length) {
      return res.status(200).json({ locations: [], totals: { newLeads:0, totalLeads:0, conversations:0, appointments:0 }, updatedAt: new Date().toISOString(), range });
    }
 
    if (debugMode) {
      const loc = locations.find(l => l.id === 'UAsVjQixCImbKbde4VxU') || locations[0];
      const id  = loc.id;
      const h   = subHdrs();
      const [r1, r2, r3, r4] = await Promise.all([
        fetch(`${BASE}/contacts/?locationId=${id}&limit=1`, { headers: h }),
        fetch(`${BASE}/contacts/?locationId=${id}&startDate=${encodeURIComponent(dateRange.start)}&endDate=${encodeURIComponent(dateRange.end)}&limit=1`, { headers: h }),
        fetch(`${BASE}/conversations/search?locationId=${id}&startAfterDate=${dateRange.startTs}&limit=1`, { headers: h }),
        fetch(`${BASE}/calendars/events?locationId=${id}&startTime=${encodeURIComponent(dateRange.start)}&endTime=${encodeURIComponent(dateRange.end)}&limit=100`, { headers: h }),
      ]);
      const [d1, d2, d3, d4] = await Promise.all([r1.json(), r2.json(), r3.json(), r4.json()]);
      return res.status(200).json({
        debug: true,
        location: { id: loc.id, name: loc.name },
        dateRange,
        results: {
          contacts_total:  { status: r1.status, total: d1?.total ?? d1?.meta?.total ?? '?', keys: Object.keys(d1 || {}), sample: JSON.stringify(d1).slice(0, 400) },
          contacts_new:    { status: r2.status, total: d2?.total ?? d2?.meta?.total ?? '?', keys: Object.keys(d2 || {}), sample: JSON.stringify(d2).slice(0, 400) },
          conversations:   { status: r3.status, total: d3?.total ?? d3?.meta?.total ?? '?', keys: Object.keys(d3 || {}), sample: JSON.stringify(d3).slice(0, 400) },
          calendar_events: { status: r4.status, total: d4?.total ?? d4?.meta?.total ?? d4?.events?.length ?? '?', keys: Object.keys(d4 || {}), sample: JSON.stringify(d4).slice(0, 400) },
        }
      });
    }
 
    // Procesar todas en lotes de 5
    const BATCH = 5;
    const all = [];
    for (let i = 0; i < locations.length; i += BATCH) {
      const batch = locations.slice(i, i + BATCH);
      const results = await Promise.all(batch.map(loc => locationStats(loc, dateRange)));
      all.push(...results);
    }
 
    // Solo mostrar subcuentas con al menos 1 dato > 0
    const active = all.filter(l =>
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
      total_accounts: locations.length,
      range,
      dateRange: { start: dateRange.start, end: dateRange.end },
    });
 
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
