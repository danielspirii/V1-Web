// api/ghl-stats.js — Vercel Serverless Function
// DEBUG v2: devuelve respuestas raw de GHL en el JSON para diagnóstico
 
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
  const end = new Date(now); end.setUTCHours(23, 59, 59, 999);
  const start = new Date(now);
  switch (range) {
    case 'yesterday':
      start.setUTCDate(start.getUTCDate()-1); start.setUTCHours(0,0,0,0);
      end.setUTCDate(end.getUTCDate()-1);     end.setUTCHours(23,59,59,999);
      break;
    case '7d':  start.setUTCDate(start.getUTCDate()-6);  start.setUTCHours(0,0,0,0); break;
    case '30d': start.setUTCDate(start.getUTCDate()-29); start.setUTCHours(0,0,0,0); break;
    default:    start.setUTCHours(0,0,0,0);
  }
  return { start: start.toISOString(), end: end.toISOString(), startTs: start.getTime() };
}
 
async function rawFetch(url) {
  try {
    const res = await fetch(url, { headers: hdrs() });
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { data = text; }
    return { status: res.status, data };
  } catch (e) {
    return { status: 0, error: e.message };
  }
}
 
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');
 
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!GHL_KEY) return res.status(500).json({ error: 'GHL_API_KEY not configured' });
 
  const range     = req.query.range || 'today';
  const dateRange = getRange(range);
  const debugMode = req.query.debug === '1';
 
  // 1. Locations
  const locResult = await rawFetch(`${BASE}/locations/search?limit=100`);
  if (!debugMode && locResult.status !== 200) {
    return res.status(500).json({ error: 'Locations failed', detail: locResult });
  }
 
  const locations = locResult.data?.locations || [];
 
  if (debugMode) {
    // En modo debug: solo probar Visa Homes SistemOS (sabemos su ID del JSON anterior)
    const visaHomes = locations.find(l => l.name?.toLowerCase().includes('visa homes sist'))
      || locations.find(l => l.id === 'UAsVjQixCImbKbde4VxU')
      || locations[0];
 
    if (!visaHomes) {
      return res.status(200).json({ error: 'No se encontró Visa Homes SistemOS', locations: locations.map(l => ({ id: l.id, name: l.name })) });
    }
 
    const locId = visaHomes.id;
    const locName = visaHomes.name;
 
    // Probar los 4 endpoints con sus respuestas RAW
    const [r1, r2, r3, r4] = await Promise.all([
      rawFetch(`${BASE}/contacts/?locationId=${locId}&limit=1`),
      rawFetch(`${BASE}/contacts/?locationId=${locId}&startDate=${encodeURIComponent(dateRange.start)}&endDate=${encodeURIComponent(dateRange.end)}&limit=1`),
      rawFetch(`${BASE}/conversations/search?locationId=${locId}&startAfterDate=${dateRange.startTs}&limit=1`),
      rawFetch(`${BASE}/calendars/events?locationId=${locId}&startTime=${encodeURIComponent(dateRange.start)}&endTime=${encodeURIComponent(dateRange.end)}&limit=100`),
    ]);
 
    return res.status(200).json({
      debug: true,
      location: { id: locId, name: locName },
      dateRange,
      results: {
        contacts_total:      { status: r1.status, keys: r1.data ? Object.keys(r1.data) : [], total: r1.data?.total ?? r1.data?.meta?.total ?? '?', sample: JSON.stringify(r1.data)?.slice(0, 400) },
        contacts_newleads:   { status: r2.status, keys: r2.data ? Object.keys(r2.data) : [], total: r2.data?.total ?? r2.data?.meta?.total ?? '?', sample: JSON.stringify(r2.data)?.slice(0, 400) },
        conversations:       { status: r3.status, keys: r3.data ? Object.keys(r3.data) : [], total: r3.data?.total ?? r3.data?.meta?.total ?? '?', sample: JSON.stringify(r3.data)?.slice(0, 400) },
        calendar_events:     { status: r4.status, keys: r4.data ? Object.keys(r4.data) : [], total: r4.data?.total ?? r4.data?.meta?.total ?? r4.data?.events?.length ?? '?', sample: JSON.stringify(r4.data)?.slice(0, 400) },
      }
    });
  }
 
  // ── MODO NORMAL (no debug) ────────────────────────────────────────────────
  const BATCH = 5;
  const results = [];
  for (let i = 0; i < locations.length; i += BATCH) {
    const batch = locations.slice(i, i + BATCH);
    const batchRes = await Promise.all(batch.map(async loc => {
      const [r1, r2, r3, r4] = await Promise.all([
        rawFetch(`${BASE}/contacts/?locationId=${loc.id}&limit=1`),
        rawFetch(`${BASE}/contacts/?locationId=${loc.id}&startDate=${encodeURIComponent(dateRange.start)}&endDate=${encodeURIComponent(dateRange.end)}&limit=1`),
        rawFetch(`${BASE}/conversations/search?locationId=${loc.id}&startAfterDate=${dateRange.startTs}&limit=1`),
        rawFetch(`${BASE}/calendars/events?locationId=${loc.id}&startTime=${encodeURIComponent(dateRange.start)}&endTime=${encodeURIComponent(dateRange.end)}&limit=100`),
      ]);
      return {
        id:   loc.id,
        name: loc.name || loc.businessName || 'Sin nombre',
        totalLeads:    r1.data?.total ?? r1.data?.meta?.total ?? 0,
        newLeads:      r2.data?.total ?? r2.data?.meta?.total ?? 0,
        conversations: r3.data?.total ?? r3.data?.meta?.total ?? r3.data?.conversations?.length ?? 0,
        appointments:  r4.data?.total ?? r4.data?.meta?.total ?? r4.data?.events?.length ?? r4.data?.data?.length ?? 0,
      };
    }));
    results.push(...batchRes);
  }
 
  results.sort((a, b) => b.newLeads - a.newLeads);
  const totals = results.reduce((acc, l) => ({
    newLeads:      acc.newLeads      + (l.newLeads||0),
    totalLeads:    acc.totalLeads    + (l.totalLeads||0),
    conversations: acc.conversations + (l.conversations||0),
    appointments:  acc.appointments  + (l.appointments||0),
  }), { newLeads:0, totalLeads:0, conversations:0, appointments:0 });
 
  return res.status(200).json({ locations: results, totals, updatedAt: new Date().toISOString(), count: results.length, range, dateRange: { start: dateRange.start, end: dateRange.end } });
}
