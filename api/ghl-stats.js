// api/ghl-stats.js — Vercel Serverless Function
// Agency Private Integration Token — acceso directo a subcuentas con locationId
// DEBUG MODE: logs detallados para diagnosticar respuestas de GHL
 
const GHL_KEY = process.env.GHL_API_KEY;
const BASE    = 'https://services.leadconnectorhq.com';
 
function hdrs() {
  return {
    'Authorization': `Bearer ${GHL_KEY}`,
    'Version': '2021-07-28',
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
}
 
function getRange(range) {
  const now = new Date();
  const end = new Date(now);
  end.setUTCHours(23, 59, 59, 999);
  const start = new Date(now);
  switch (range) {
    case 'yesterday':
      start.setUTCDate(start.getUTCDate() - 1); start.setUTCHours(0, 0, 0, 0);
      end.setUTCDate(end.getUTCDate() - 1);     end.setUTCHours(23, 59, 59, 999);
      break;
    case '7d':
      start.setUTCDate(start.getUTCDate() - 6); start.setUTCHours(0, 0, 0, 0);
      break;
    case '30d':
      start.setUTCDate(start.getUTCDate() - 29); start.setUTCHours(0, 0, 0, 0);
      break;
    default:
      start.setUTCHours(0, 0, 0, 0);
  }
  return {
    start:   start.toISOString(),
    end:     end.toISOString(),
    startTs: start.getTime(),
    endTs:   end.getTime(),
  };
}
 
// ── Helper: fetch con log completo de respuesta ──────────────────────────────
async function fetchDebug(label, url, options) {
  try {
    const res = await fetch(url, options);
    const text = await res.text();
    let parsed;
    try { parsed = JSON.parse(text); } catch { parsed = text; }
 
    if (!res.ok) {
      console.error(`[${label}] HTTP ${res.status} — URL: ${url.slice(0, 120)} — BODY: ${text.slice(0, 300)}`);
      return { ok: false, status: res.status, data: parsed };
    }
 
    // Log de los campos clave de la respuesta para debug
    const keys = typeof parsed === 'object' ? Object.keys(parsed) : [];
    console.log(`[${label}] OK ${res.status} — keys: ${keys.join(', ')} — total/count: ${parsed?.total ?? parsed?.meta?.total ?? '?'}`);
    return { ok: true, status: res.status, data: parsed };
  } catch (e) {
    console.error(`[${label}] EXCEPTION — ${e.message}`);
    return { ok: false, status: 0, data: null };
  }
}
 
// ── Obtener subcuentas ───────────────────────────────────────────────────────
async function getLocations() {
  const result = await fetchDebug(
    'locations/search',
    `${BASE}/locations/search?limit=100`,
    { headers: hdrs() }
  );
  if (!result.ok) throw new Error(`Locations error ${result.status}`);
  return result.data?.locations || [];
}
 
// ── Leads nuevos en el rango ─────────────────────────────────────────────────
async function getNewLeads(loc, range) {
  // Intentar con startDate/endDate (formato ISO)
  const url = `${BASE}/contacts/?locationId=${loc.id}&startDate=${encodeURIComponent(range.start)}&endDate=${encodeURIComponent(range.end)}&limit=1`;
  const result = await fetchDebug(`contacts-new[${loc.name.slice(0,15)}]`, url, { headers: hdrs() });
  if (!result.ok) return 0;
  const d = result.data;
  return d?.total ?? d?.meta?.total ?? d?.contacts?.length ?? 0;
}
 
// ── Total contactos en CRM ───────────────────────────────────────────────────
async function getTotalLeads(loc) {
  const url = `${BASE}/contacts/?locationId=${loc.id}&limit=1`;
  const result = await fetchDebug(`contacts-total[${loc.name.slice(0,15)}]`, url, { headers: hdrs() });
  if (!result.ok) return 0;
  const d = result.data;
  return d?.total ?? d?.meta?.total ?? 0;
}
 
// ── Conversaciones activas ───────────────────────────────────────────────────
async function getConversations(loc, range) {
  // GHL conversations/search acepta startAfterDate en milisegundos
  const url = `${BASE}/conversations/search?locationId=${loc.id}&startAfterDate=${range.startTs}&limit=1`;
  const result = await fetchDebug(`conversations[${loc.name.slice(0,15)}]`, url, { headers: hdrs() });
  if (!result.ok) return 0;
  const d = result.data;
  return d?.total ?? d?.meta?.total ?? d?.conversations?.length ?? 0;
}
 
// ── Citas agendadas ──────────────────────────────────────────────────────────
async function getAppointments(loc, range) {
  const url = `${BASE}/calendars/events?locationId=${loc.id}&startTime=${encodeURIComponent(range.start)}&endTime=${encodeURIComponent(range.end)}&limit=100`;
  const result = await fetchDebug(`calendars[${loc.name.slice(0,15)}]`, url, { headers: hdrs() });
  if (!result.ok) return 0;
  const d = result.data;
  return d?.total ?? d?.meta?.total ?? d?.events?.length ?? d?.data?.length ?? 0;
}
 
// ── Stats de una location ────────────────────────────────────────────────────
async function locationStats(loc, range) {
  const [newLeads, totalLeads, conversations, appointments] = await Promise.all([
    getNewLeads(loc, range),
    getTotalLeads(loc, range),
    getConversations(loc, range),
    getAppointments(loc, range),
  ]);
  return {
    id:   loc.id,
    name: loc.name || loc.businessName || 'Sin nombre',
    newLeads,
    totalLeads,
    conversations,
    appointments,
  };
}
 
// ── Handler ──────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 'no-store');
 
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET')     return res.status(405).json({ error: 'Method not allowed' });
  if (!GHL_KEY)                 return res.status(500).json({ error: 'GHL_API_KEY not configured' });
 
  const range     = req.query.range || 'today';
  const dateRange = getRange(range);
 
  // Si debug=1 en la query, solo procesa las 2 primeras subcuentas para ir rápido
  const debugMode = req.query.debug === '1';
 
  console.log(`[START] range=${range} start=${dateRange.start} end=${dateRange.end} debug=${debugMode}`);
 
  try {
    const locations = await getLocations();
    if (!locations.length) {
      return res.status(200).json({ locations: [], totals: { newLeads:0, totalLeads:0, conversations:0, appointments:0 }, updatedAt: new Date().toISOString(), range });
    }
 
    console.log(`[INFO] ${locations.length} subcuentas encontradas`);
 
    // En modo debug solo procesamos las 2 primeras para ver la respuesta rápido
    const toProcess = debugMode ? locations.slice(0, 2) : locations;
 
    // Lotes de 5 para no saturar
    const BATCH = 5;
    const results = [];
    for (let i = 0; i < toProcess.length; i += BATCH) {
      const batch = toProcess.slice(i, i + BATCH);
      const batchResults = await Promise.all(batch.map(loc => locationStats(loc, dateRange)));
      results.push(...batchResults);
    }
 
    results.sort((a, b) => b.newLeads - a.newLeads);
 
    const totals = results.reduce((acc, l) => ({
      newLeads:      acc.newLeads      + (l.newLeads      || 0),
      totalLeads:    acc.totalLeads    + (l.totalLeads    || 0),
      conversations: acc.conversations + (l.conversations || 0),
      appointments:  acc.appointments  + (l.appointments  || 0),
    }), { newLeads:0, totalLeads:0, conversations:0, appointments:0 });
 
    console.log(`[TOTALS] newLeads=${totals.newLeads} totalLeads=${totals.totalLeads} conversations=${totals.conversations} appointments=${totals.appointments}`);
 
    return res.status(200).json({
      locations: results,
      totals,
      updatedAt:  new Date().toISOString(),
      count:      results.length,
      range,
      debug:      debugMode,
      dateRange:  { start: dateRange.start, end: dateRange.end },
    });
 
  } catch (err) {
    console.error('[FATAL]', err.message, err.stack?.slice(0, 300));
    return res.status(500).json({ error: err.message });
  }
}
