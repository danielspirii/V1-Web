// api/ghl-stats.js — Vercel Serverless Function
// GoHighLevel API v2 con Private Integration Token
 
const GHL_KEY  = process.env.GHL_API_KEY;
const BASE     = 'https://services.leadconnectorhq.com';
 
function hdrs() {
  return {
    'Authorization': `Bearer ${GHL_KEY}`,
    'Version': '2021-07-28',
    'Content-Type': 'application/json',
  };
}
 
function getRange(range) {
  const now  = new Date();
  const end  = new Date(now); end.setUTCHours(23,59,59,999);
  const start = new Date(now);
  switch(range) {
    case 'yesterday':
      start.setUTCDate(start.getUTCDate() - 1); start.setUTCHours(0,0,0,0);
      end.setUTCDate(end.getUTCDate() - 1);     end.setUTCHours(23,59,59,999);
      break;
    case '7d':
      start.setUTCDate(start.getUTCDate() - 6); start.setUTCHours(0,0,0,0);
      break;
    case '30d':
      start.setUTCDate(start.getUTCDate() - 29); start.setUTCHours(0,0,0,0);
      break;
    default:
      start.setUTCHours(0,0,0,0);
      break;
  }
  return { start: start.toISOString(), end: end.toISOString(), startTs: start.getTime(), endTs: end.getTime() };
}
 
async function getLocations() {
  const res = await fetch(`${BASE}/locations/search?limit=100`, { headers: hdrs() });
  if (!res.ok) { const txt = await res.text(); throw new Error(`Locations ${res.status}: ${txt.slice(0,200)}`); }
  const d = await res.json();
  return d.locations || [];
}
 
async function getNewLeads(locationId, range) {
  try {
    const url = `${BASE}/contacts/?locationId=${locationId}&startDate=${range.start}&endDate=${range.end}&limit=1`;
    const res = await fetch(url, { headers: hdrs() });
    if (!res.ok) return 0;
    const d = await res.json();
    return d.total ?? d.meta?.total ?? 0;
  } catch { return 0; }
}
 
async function getTotalLeads(locationId) {
  try {
    const res = await fetch(`${BASE}/contacts/?locationId=${locationId}&limit=1`, { headers: hdrs() });
    if (!res.ok) return 0;
    const d = await res.json();
    return d.total ?? d.meta?.total ?? 0;
  } catch { return 0; }
}
 
async function getConversations(locationId, range) {
  try {
    const url = `${BASE}/conversations/search?locationId=${locationId}&startAfterDate=${range.startTs}&limit=1`;
    const res = await fetch(url, { headers: hdrs() });
    if (!res.ok) return 0;
    const d = await res.json();
    return d.total ?? d.meta?.total ?? 0;
  } catch { return 0; }
}
 
async function getAppointments(locationId, range) {
  try {
    const url = `${BASE}/calendars/events?locationId=${locationId}&startTime=${range.start}&endTime=${range.end}&limit=1`;
    const res = await fetch(url, { headers: hdrs() });
    if (!res.ok) return 0;
    const d = await res.json();
    return d.total ?? d.meta?.total ?? d.events?.length ?? d.data?.length ?? 0;
  } catch { return 0; }
}
 
async function locationStats(loc, range) {
  const [newLeads, totalLeads, conversations, appointments] = await Promise.all([
    getNewLeads(loc.id, range),
    getTotalLeads(loc.id),
    getConversations(loc.id, range),
    getAppointments(loc.id, range),
  ]);
  return { id: loc.id, name: loc.name || loc.businessName || 'Sin nombre', newLeads, totalLeads, conversations, appointments };
}
 
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
      return res.status(200).json({ locations:[], totals:{newLeads:0,totalLeads:0,conversations:0,appointments:0}, updatedAt:new Date().toISOString(), range });
    }
 
    const BATCH = 5;
    const results = [];
    for (let i = 0; i < locations.length; i += BATCH) {
      const batchRes = await Promise.all(locations.slice(i, i + BATCH).map(l => locationStats(l, dateRange)));
      results.push(...batchRes);
    }
 
    results.sort((a, b) => b.newLeads - a.newLeads);
 
    const totals = results.reduce((acc, l) => ({
      newLeads:      acc.newLeads      + l.newLeads,
      totalLeads:    acc.totalLeads    + l.totalLeads,
      conversations: acc.conversations + l.conversations,
      appointments:  acc.appointments  + l.appointments,
    }), { newLeads:0, totalLeads:0, conversations:0, appointments:0 });
 
    return res.status(200).json({ locations: results, totals, updatedAt: new Date().toISOString(), count: results.length, range, dateRange: { start: dateRange.start, end: dateRange.end } });
 
  } catch (err) {
    console.error('GHL Stats error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
