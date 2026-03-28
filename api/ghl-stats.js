// api/ghl-stats.js — Vercel Serverless Function
// ✅ SOLO LECTURA — no modifica nada en ninguna subcuenta
// Arquitectura: agency token → location token (OAuth temporal 24h) → GET de datos
// Los location tokens son sesiones efímeras, NO son Private Integrations de subcuenta
 
const GHL_KEY = process.env.GHL_API_KEY;
const BASE    = 'https://services.leadconnectorhq.com';
 
// ── Caché en memoria del proceso (persiste entre requests en la misma instancia)
// Los location tokens duran 24h — se reutilizan hasta que expiran
const tokenCache = {}; // { [locationId]: { token, expiresAt } }
 
function agencyHdrs() {
  return {
    'Authorization': `Bearer ${GHL_KEY}`,
    'Version': '2021-07-28',
    'Accept': 'application/json',
  };
}
 
function locationHdrs(token) {
  return {
    'Authorization': `Bearer ${token}`,
    'Version': '2021-07-28',
    'Accept': 'application/json',
  };
}
 
// ── Rango de fechas ──────────────────────────────────────────────────────────
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
  return {
    start:   start.toISOString(),
    end:     end.toISOString(),
    startTs: start.getTime(),
  };
}
 
// ── Obtener subcuentas (agency token, solo lectura) ──────────────────────────
async function getLocations() {
  const res = await fetch(`${BASE}/locations/search?limit=100`, { headers: agencyHdrs() });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Locations ${res.status}: ${txt.slice(0, 200)}`);
  }
  const d = await res.json();
  return d.locations || [];
}
 
// ── Obtener location token con caché ─────────────────────────────────────────
// Genera un token OAuth temporal de 24h para una subcuenta.
// NO crea ni modifica Private Integrations — es un token de sesión efímero.
async function getLocationToken(companyId, locationId) {
  const cached = tokenCache[locationId];
  const now = Date.now();
 
  // Usar caché si el token sigue válido (con 5 min de margen)
  if (cached && cached.expiresAt > now + 5 * 60 * 1000) {
    return cached.token;
  }
 
  // Intercambiar agency token por location token (GET de sesión, no modifica nada)
  const body = new URLSearchParams({ companyId, locationId });
  const res = await fetch(`${BASE}/oauth/locationToken`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GHL_KEY}`,
      'Version': '2021-07-28',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
    },
    body: body.toString(),
  });
 
  if (!res.ok) {
    const txt = await res.text();
    console.error(`[locationToken] ${locationId} → ${res.status}: ${txt.slice(0, 150)}`);
    return null;
  }
 
  const data = await res.json();
  const token = data.access_token;
  if (!token) return null;
 
  // Cachear: expires_in es en segundos (normalmente 86400 = 24h)
  const expiresIn = (data.expires_in || 86400) * 1000;
  tokenCache[locationId] = { token, expiresAt: now + expiresIn };
 
  return token;
}
 
// ── Fetch de solo lectura con manejo de errores ──────────────────────────────
async function readFetch(url, token) {
  try {
    const res = await fetch(url, { headers: locationHdrs(token) });
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}
 
// ── Stats de una subcuenta (solo GET, solo lectura) ──────────────────────────
async function getLocationStats(loc, companyId, range) {
  const token = await getLocationToken(companyId, loc.id);
  if (!token) {
    return { id: loc.id, name: loc.name || 'Sin nombre', newLeads: 0, totalLeads: 0, conversations: 0, appointments: 0, _tokenError: true };
  }
 
  const [dTotal, dNew, dConv, dAppt] = await Promise.all([
    // Total contactos en CRM
    readFetch(`${BASE}/contacts/?locationId=${loc.id}&limit=1`, token),
    // Leads nuevos en el rango (contactos creados hoy/periodo)
    readFetch(`${BASE}/contacts/?locationId=${loc.id}&startDate=${encodeURIComponent(range.start)}&endDate=${encodeURIComponent(range.end)}&limit=1`, token),
    // Conversaciones con actividad en el rango
    readFetch(`${BASE}/conversations/search?locationId=${loc.id}&startAfterDate=${range.startTs}&limit=1`, token),
    // Citas agendadas en el rango
    readFetch(`${BASE}/calendars/events?locationId=${loc.id}&startTime=${encodeURIComponent(range.start)}&endTime=${encodeURIComponent(range.end)}&limit=100`, token),
  ]);
 
  const totalLeads    = dTotal?.total ?? dTotal?.meta?.total ?? 0;
  const newLeads      = dNew?.total   ?? dNew?.meta?.total   ?? 0;
  const conversations = dConv?.total  ?? dConv?.meta?.total  ?? dConv?.conversations?.length ?? 0;
  const appointments  = dAppt?.total  ?? dAppt?.meta?.total  ?? dAppt?.events?.length ?? dAppt?.data?.length ?? 0;
 
  return { id: loc.id, name: loc.name || 'Sin nombre', newLeads, totalLeads, conversations, appointments };
}
 
// ── Handler principal ────────────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 'no-store');
 
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET')     return res.status(405).json({ error: 'Method not allowed' });
  if (!GHL_KEY)                 return res.status(500).json({ error: 'GHL_API_KEY not configured' });
 
  const range     = req.query.range || 'today';
  const dateRange = getRange(range);
 
  try {
    const locations = await getLocations();
    if (!locations.length) {
      return res.status(200).json({ locations: [], totals: { newLeads:0, totalLeads:0, conversations:0, appointments:0 }, updatedAt: new Date().toISOString(), range });
    }
 
    const companyId = locations[0]?.companyId;
    if (!companyId) throw new Error('companyId not found in locations response');
 
    // Procesar en lotes de 4 (balance entre velocidad y no saturar la API)
    const BATCH = 4;
    const all = [];
    for (let i = 0; i < locations.length; i += BATCH) {
      const batch = locations.slice(i, i + BATCH);
      const results = await Promise.all(batch.map(loc => getLocationStats(loc, companyId, dateRange)));
      all.push(...results);
    }
 
    // ✅ Filtrar: solo mostrar subcuentas con al menos 1 dato > 0
    const active = all.filter(l =>
      l.newLeads > 0 || l.totalLeads > 0 || l.conversations > 0 || l.appointments > 0
    );
 
    // Ordenar por leads nuevos desc
    active.sort((a, b) => b.newLeads - a.newLeads);
 
    const totals = active.reduce((acc, l) => ({
      newLeads:      acc.newLeads      + (l.newLeads      || 0),
      totalLeads:    acc.totalLeads    + (l.totalLeads    || 0),
      conversations: acc.conversations + (l.conversations || 0),
      appointments:  acc.appointments  + (l.appointments  || 0),
    }), { newLeads:0, totalLeads:0, conversations:0, appointments:0 });
 
    return res.status(200).json({
      locations:  active,
      totals,
      updatedAt:  new Date().toISOString(),
      count:      active.length,
      total_accounts: locations.length,
      range,
      dateRange: { start: dateRange.start, end: dateRange.end },
    });
 
  } catch (err) {
    console.error('[FATAL]', err.message);
    return res.status(500).json({ error: err.message });
  }
}
