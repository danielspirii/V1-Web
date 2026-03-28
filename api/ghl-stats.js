// api/ghl-stats.js — Vercel Serverless Function
// Conecta con GoHighLevel Agency API y agrega stats de todas las subcuentas
 
const GHL_API_KEY = process.env.GHL_API_KEY;
const GHL_BASE    = 'https://services.leadconnectorhq.com';
 
// Headers comunes para GHL API v2
function headers() {
  return {
    'Authorization': `Bearer ${GHL_API_KEY}`,
    'Version': '2021-07-28',
    'Content-Type': 'application/json',
  };
}
 
// Fecha de inicio de hoy en UTC (00:00:00)
function todayStart() {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}
 
// Fecha fin de hoy (23:59:59)
function todayEnd() {
  const d = new Date();
  d.setUTCHours(23, 59, 59, 999);
  return d.toISOString();
}
 
// ── Obtener todas las subcuentas de la agencia ──
async function getLocations() {
  const res = await fetch(`${GHL_BASE}/locations/search?limit=100`, {
    headers: headers(),
  });
  if (!res.ok) throw new Error(`Locations error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.locations || [];
}
 
// ── Leads nuevos hoy en una location ──
async function getNewLeadsToday(locationId) {
  try {
    const url = `${GHL_BASE}/contacts/?locationId=${locationId}&startDate=${todayStart()}&endDate=${todayEnd()}&limit=100`;
    const res = await fetch(url, { headers: headers() });
    if (!res.ok) return 0;
    const data = await res.json();
    return data.total ?? data.contacts?.length ?? 0;
  } catch { return 0; }
}
 
// ── Total de contactos en una location ──
async function getTotalContacts(locationId) {
  try {
    const url = `${GHL_BASE}/contacts/?locationId=${locationId}&limit=1`;
    const res = await fetch(url, { headers: headers() });
    if (!res.ok) return 0;
    const data = await res.json();
    return data.total ?? 0;
  } catch { return 0; }
}
 
// ── Conversaciones activas hoy (leads trabajados) ──
async function getActiveConversationsToday(locationId) {
  try {
    // Filtramos conversaciones de WhatsApp con actividad desde hoy
    const url = `${GHL_BASE}/conversations/search?locationId=${locationId}&startAfterDate=${todayStart()}&limit=100`;
    const res = await fetch(url, { headers: headers() });
    if (!res.ok) return 0;
    const data = await res.json();
    return data.total ?? data.conversations?.length ?? 0;
  } catch { return 0; }
}
 
// ── Citas/llamadas agendadas hoy ──
async function getAppointmentsToday(locationId) {
  try {
    const url = `${GHL_BASE}/calendars/events?locationId=${locationId}&startTime=${todayStart()}&endTime=${todayEnd()}&limit=100`;
    const res = await fetch(url, { headers: headers() });
    if (!res.ok) return 0;
    const data = await res.json();
    return data.total ?? data.events?.length ?? 0;
  } catch { return 0; }
}
 
// ── Stats de una sola location en paralelo ──
async function getLocationStats(location) {
  const [newLeads, totalLeads, conversations, appointments] = await Promise.all([
    getNewLeadsToday(location.id),
    getTotalContacts(location.id),
    getActiveConversationsToday(location.id),
    getAppointmentsToday(location.id),
  ]);
 
  return {
    id:            location.id,
    name:          location.name || location.businessName || 'Sin nombre',
    newLeads,
    totalLeads,
    conversations,
    appointments,
  };
}
 
// ── Handler principal ──
export default async function handler(req, res) {
  // CORS — la página pública puede hacer fetch
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 'public, s-maxage=90, stale-while-revalidate=30');
 
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
 
  if (!GHL_API_KEY) {
    return res.status(500).json({ error: 'GHL_API_KEY not configured' });
  }
 
  try {
    // 1. Obtener todas las subcuentas
    const locations = await getLocations();
 
    if (!locations.length) {
      return res.status(200).json({ locations: [], totals: { newLeads:0, totalLeads:0, conversations:0, appointments:0 }, updatedAt: new Date().toISOString() });
    }
 
    // 2. Stats de cada subcuenta en paralelo (máx 20 a la vez)
    // Para ~20 subcuentas, todas en paralelo está bien
    const locationStats = await Promise.all(
      locations.map(loc => getLocationStats(loc))
    );
 
    // Ordenar por leads nuevos hoy desc
    locationStats.sort((a, b) => b.newLeads - a.newLeads);
 
    // 3. Totales agregados
    const totals = locationStats.reduce((acc, loc) => ({
      newLeads:      acc.newLeads      + loc.newLeads,
      totalLeads:    acc.totalLeads    + loc.totalLeads,
      conversations: acc.conversations + loc.conversations,
      appointments:  acc.appointments  + loc.appointments,
    }), { newLeads: 0, totalLeads: 0, conversations: 0, appointments: 0 });
 
    return res.status(200).json({
      locations:  locationStats,
      totals,
      updatedAt:  new Date().toISOString(),
      count:      locationStats.length,
    });
 
  } catch (err) {
    console.error('GHL Stats error:', err);
    return res.status(500).json({ error: err.message });
  }
}
