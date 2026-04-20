const params = new URLSearchParams(window.location.search);
const venueId = params.get('id');
const API = window.location.origin;
if (!venueId) document.getElementById('venue-hero').innerHTML = '<h1>No venue selected</h1>';

const ZONE_SVG = `<svg viewBox="0 0 600 500" xmlns="http://www.w3.org/2000/svg">
<ellipse cx="300" cy="250" rx="280" ry="220" fill="#1a1f2e" stroke="#2d3348" stroke-width="2"/>
<ellipse cx="300" cy="250" rx="120" ry="95" fill="#2d5016" stroke="#4a7a2a" stroke-width="1"/>
<rect x="288" y="205" width="24" height="90" rx="2" fill="#8B7355" opacity="0.9"/>
<path id="zone-north" d="M 120,60 Q 300,20 480,60 Q 440,140 300,155 Q 160,140 120,60 Z" fill="#1e4a2e" stroke="#00E5C7" stroke-width="1.5" data-zone="north" data-name="Adani Pavilion Stand" data-capacity="35000" class="venue-zone"/>
<path id="zone-south" d="M 120,440 Q 300,480 480,440 Q 440,360 300,345 Q 160,360 120,440 Z" fill="#1e4a2e" stroke="#00E5C7" stroke-width="1.5" data-zone="south" data-name="Reliance Stand" data-capacity="32000" class="venue-zone"/>
<path id="zone-east" d="M 500,90 Q 570,250 500,410 Q 430,370 420,250 Q 430,130 500,90 Z" fill="#1e4a2e" stroke="#00E5C7" stroke-width="1.5" data-zone="east" data-name="BCCI Stand" data-capacity="35000" class="venue-zone"/>
<path id="zone-west" d="M 100,90 Q 30,250 100,410 Q 170,370 180,250 Q 170,130 100,90 Z" fill="#1e4a2e" stroke="#00E5C7" stroke-width="1.5" data-zone="west" data-name="Pavilion End Stand" data-capacity="30000" class="venue-zone"/>
<text x="300" y="90" text-anchor="middle" font-size="11" fill="#00E5C7" font-family="monospace">ADANI PAVILION</text>
<text x="300" y="425" text-anchor="middle" font-size="11" fill="#00E5C7" font-family="monospace">RELIANCE STAND</text>
<text x="520" y="255" text-anchor="middle" font-size="10" fill="#00E5C7" font-family="monospace" transform="rotate(90,520,255)">BCCI STAND</text>
<text x="80" y="255" text-anchor="middle" font-size="10" fill="#00E5C7" font-family="monospace" transform="rotate(-90,80,255)">PAVILION END</text>
<circle class="density-dot" data-zone="north" cx="240" cy="115" r="6" fill="#FFB800" opacity="0.8"/>
<circle class="density-dot" data-zone="north" cx="360" cy="115" r="6" fill="#FF4444" opacity="0.8"/>
<circle class="density-dot" data-zone="south" cx="240" cy="385" r="6" fill="#FFB800" opacity="0.8"/>
<circle class="density-dot" data-zone="south" cx="360" cy="385" r="6" fill="#00E5C7" opacity="0.8"/>
<circle class="density-dot" data-zone="east" cx="455" cy="200" r="6" fill="#00E5C7" opacity="0.8"/>
<circle class="density-dot" data-zone="west" cx="145" cy="200" r="6" fill="#FFB800" opacity="0.8"/>
</svg>`;

function zoneColor(pct) { return pct > 88 ? '#FF4444' : pct > 65 ? '#FFB800' : '#22c55e'; }
function zoneTint(pct) { return pct > 88 ? 'rgba(255,68,68,0.25)' : pct > 65 ? 'rgba(255,184,0,0.2)' : 'rgba(34,197,94,0.15)'; }
function trendIcon(t) { return t === 'INCREASING' ? '↑' : t === 'DECREASING' ? '↓' : '→'; }
function trendClass(t) { return t === 'INCREASING' ? 'trend-up' : t === 'DECREASING' ? 'trend-down' : 'trend-stable'; }

async function loadVenue() {
  try {
    const res = await fetch(`${API}/api/v1/venues/${venueId}`);
    if (!res.ok) throw new Error('Not found');
    const v = await res.json();
    document.title = `${v.name} — VenueIQ`;
    document.getElementById('venue-hero').innerHTML = `<h1>${v.name}</h1><div class="venue-meta-row"><span>📍 ${v.city}, ${v.country}</span><span>👥 ${Number(v.capacity).toLocaleString()} capacity</span><span>🕐 ${v.timezone}</span></div>`;
    document.getElementById('venue-info').innerHTML = `<div class="info-row"><span class="info-label">Country</span><span class="info-value">${v.country}</span></div><div class="info-row"><span class="info-label">City</span><span class="info-value">${v.city}</span></div><div class="info-row"><span class="info-label">Timezone</span><span class="info-value">${v.timezone}</span></div><div class="info-row"><span class="info-label">Data Region</span><span class="info-value">${v.dataResidency}</span></div><div class="info-row"><span class="info-label">Coordinates</span><span class="info-value">${v.geo_lat}, ${v.geo_lng}</span></div>`;
    const sports = (v.sport_type || []).map(s => `<span class="sport-pill">${s}</span>`).join('');
    document.getElementById('venue-sports').innerHTML = `<div class="info-row"><span class="info-label">Capacity</span><span class="info-value">${Number(v.capacity).toLocaleString()}</span></div><div class="info-row"><span class="info-label">Sports</span></div><div style="margin-top:.8rem">${sports || '<span style="color:var(--text-muted)">Not specified</span>'}</div>`;
    document.getElementById('venue-live-status').innerHTML = `<div class="info-row"><span class="info-label">DB Status</span><span class="info-value" style="color:#55efc4">● Connected</span></div><div class="info-row"><span class="info-label">CrowdSense</span><span class="info-value" style="color:#FFB800">● Simulated Live</span></div><div class="info-row"><span class="info-label">QueueIQ</span><span class="info-value" style="color:#FFB800">● Simulated Live</span></div><div class="info-row"><span class="info-label">IoT Sensors</span><span class="info-value" style="color:var(--text-muted)">○ Not Yet Active</span></div>`;
    document.getElementById('detail-grid').style.display = 'grid';
    initZoneMap();
    loadCrowdSense();
    loadQueueIQ();
  } catch { document.getElementById('venue-hero').innerHTML = '<h1 style="color:#ff7675">Venue not found</h1>'; }
}

function initZoneMap() {
  document.getElementById('zone-map-container').innerHTML = ZONE_SVG;
  updateZoneMap();
  setInterval(updateZoneMap, 10000);
  document.querySelectorAll('.venue-zone').forEach(z => {
    z.addEventListener('mouseenter', showZoneTooltip);
    z.addEventListener('mouseleave', () => document.getElementById('zone-tooltip').style.display = 'none');
  });
}

async function updateZoneMap() {
  try {
    const res = await fetch(`${API}/api/v1/venues/current/crowdsense`);
    const data = await res.json();
    data.zones.forEach(z => {
      const el = document.getElementById('zone-' + z.zoneId);
      if (el) { el.style.fill = zoneTint(z.fillPct); el.dataset.fill = z.fillPct; el.dataset.persons = z.personCount; el.dataset.status = z.status; el.dataset.trend = z.trend; }
    });
    document.querySelectorAll('.density-dot').forEach(d => {
      const zone = data.zones.find(z => z.zoneId === d.dataset.zone);
      if (zone) d.setAttribute('fill', zoneColor(zone.fillPct));
    });
  } catch {}
}

function showZoneTooltip(e) {
  const t = document.getElementById('zone-tooltip');
  const z = e.target;
  const fill = z.dataset.fill || '—';
  const status = z.dataset.status || '—';
  t.innerHTML = `<strong>${z.dataset.name}</strong><br>Capacity: ${Number(z.dataset.capacity).toLocaleString()}<br>Current: ${Number(z.dataset.persons || 0).toLocaleString()} (${fill}%) ● ${status}<br>Trend: ${z.dataset.trend || '—'}`;
  t.style.display = 'block';
  const r = z.getBoundingClientRect();
  const c = document.querySelector('.zone-map-card').getBoundingClientRect();
  t.style.left = (r.left - c.left + r.width / 2) + 'px';
  t.style.top = (r.top - c.top - 10) + 'px';
}

async function loadCrowdSense() {
  try {
    const res = await fetch(`${API}/api/v1/venues/current/crowdsense`);
    const d = await res.json();
    const o = d.overall;
    const barColor = o.fillPct > 88 ? '#FF4444' : o.fillPct > 65 ? '#FFB800' : '#22c55e';
    let html = `<div style="font-size:.95rem;font-weight:600">Overall: ${o.fillPct}% occupied · ${o.personCount.toLocaleString()} / ${o.totalCapacity.toLocaleString()}</div><div class="occ-bar"><div class="occ-bar-fill" style="width:${o.fillPct}%;background:${barColor}"></div></div><div style="font-size:.75rem;color:${barColor};font-weight:700;margin-bottom:1rem">${o.fillPct > 88 ? 'NEAR CAPACITY' : o.fillPct > 65 ? 'MODERATE' : 'LOW'}</div>`;
    d.zones.forEach(z => {
      html += `<div class="zone-row"><span>${z.name}</span><span style="font-weight:600">${z.fillPct}%</span><div class="zone-bar"><div class="zone-bar-fill" style="width:${z.fillPct}%;background:${zoneColor(z.fillPct)}"></div></div><span class="zone-status" style="background:${zoneTint(z.fillPct)};color:${zoneColor(z.fillPct)}">${z.status}</span></div>`;
    });
    if (d.alerts && d.alerts.length) {
      d.alerts.forEach(a => { html += `<div class="alert-row">⚠ ${a.message}</div>`; });
    }
    document.getElementById('crowdsense-panel').innerHTML = html;
    document.getElementById('panel-row').style.display = 'grid';
  } catch {}
  setInterval(loadCrowdSense_update, 10000);
}

async function loadCrowdSense_update() {
  try {
    const res = await fetch(`${API}/api/v1/venues/current/crowdsense`);
    const d = await res.json();
    const o = d.overall;
    const barColor = o.fillPct > 88 ? '#FF4444' : o.fillPct > 65 ? '#FFB800' : '#22c55e';
    let html = `<div style="font-size:.95rem;font-weight:600">Overall: ${o.fillPct}% occupied · ${o.personCount.toLocaleString()} / ${o.totalCapacity.toLocaleString()}</div><div class="occ-bar"><div class="occ-bar-fill" style="width:${o.fillPct}%;background:${barColor}"></div></div><div style="font-size:.75rem;color:${barColor};font-weight:700;margin-bottom:1rem">${o.fillPct > 88 ? 'NEAR CAPACITY' : 'MODERATE'}</div>`;
    d.zones.forEach(z => { html += `<div class="zone-row"><span>${z.name}</span><span style="font-weight:600">${z.fillPct}%</span><div class="zone-bar"><div class="zone-bar-fill" style="width:${z.fillPct}%;background:${zoneColor(z.fillPct)}"></div></div><span class="zone-status" style="background:${zoneTint(z.fillPct)};color:${zoneColor(z.fillPct)}">${z.status}</span></div>`; });
    if (d.alerts && d.alerts.length) d.alerts.forEach(a => { html += `<div class="alert-row">⚠ ${a.message}</div>`; });
    document.getElementById('crowdsense-panel').innerHTML = html;
  } catch {}
}

async function loadQueueIQ() {
  try {
    const res = await fetch(`${API}/api/v1/venues/current/queueliq`);
    const d = await res.json();
    let html = '';
    d.queues.forEach(q => {
      const tc = trendClass(q.trend);
      const ti = trendIcon(q.trend);
      const surge = q.surge ? ' ⚠' : '';
      html += `<div class="queue-row"><span>${q.name}</span><span style="font-weight:600">~${q.estimatedWaitMinutes} min</span><span class="${tc}">${ti} ${q.trend}${surge}</span></div>`;
    });
    if (d.recommendations && d.recommendations.length) {
      html += '<div style="margin-top:1rem;padding-top:.8rem;border-top:1px solid var(--border);font-size:.8rem;color:var(--text-secondary)">';
      d.recommendations.forEach(r => { html += `<div style="margin:.3rem 0">💡 ${r}</div>`; });
      html += '</div>';
    }
    document.getElementById('queueliq-panel').innerHTML = html;
  } catch {}
  setInterval(loadQueueIQ_update, 30000);
}

async function loadQueueIQ_update() {
  try {
    const res = await fetch(`${API}/api/v1/venues/current/queueliq`);
    const d = await res.json();
    let html = '';
    d.queues.forEach(q => { html += `<div class="queue-row"><span>${q.name}</span><span style="font-weight:600">~${q.estimatedWaitMinutes} min</span><span class="${trendClass(q.trend)}">${trendIcon(q.trend)} ${q.trend}${q.surge ? ' ⚠' : ''}</span></div>`; });
    if (d.recommendations) { html += '<div style="margin-top:1rem;padding-top:.8rem;border-top:1px solid var(--border);font-size:.8rem;color:var(--text-secondary)">'; d.recommendations.forEach(r => { html += `<div style="margin:.3rem 0">💡 ${r}</div>`; }); html += '</div>'; }
    document.getElementById('queueliq-panel').innerHTML = html;
  } catch {}
}

async function loadMatches() {
  const listEl = document.getElementById('events-list');
  const badgeEl = document.getElementById('live-badge');
  try {
    const res = await fetch(`${API}/api/v1/venues/live-scores`);
    const data = await res.json();
    const events = data.events || [];
    if (!events.length) { listEl.innerHTML = '<p class="loading-text">No matches scheduled today.</p>'; return; }
    const liveCount = events.filter(e => (e.status || '').toUpperCase().includes('LIVE')).length;
    if (liveCount > 0) badgeEl.innerHTML = `<span class="live-badge">🔴 ${liveCount} Live Now</span>`;
    listEl.innerHTML = events.map((e, i) => {
      const isLive = (e.status || '').toUpperCase().includes('LIVE');
      const home = e.homeTeam || '';
      const away = e.awayTeam || '';
      const scoreHtml = (e.homeScore != null) ? `<div style="font-weight:700;font-size:1rem">${e.homeScore} — ${e.awayScore || ''}</div>` : '';
      return `<div class="event-row" onclick="openMatchModal(${i})" data-match-idx="${i}"><div><div class="event-teams">${home} vs ${away}</div><div class="event-league">${e.league || e.name || ''} ${e.venue ? '· ' + e.venue : ''}</div>${e.seriesInfo ? `<div style="font-size:.75rem;color:var(--accent-2);margin-top:.2rem">${e.seriesInfo}</div>` : ''}</div><div style="text-align:right">${scoreHtml}<div class="${isLive ? 'event-status-live' : 'event-status-done'}">${isLive ? '🔴 LIVE' : e.status || 'Scheduled'}</div><div style="color:var(--accent-glow);font-size:.85rem;margin-top:.3rem">View details →</div></div></div>`;
    }).join('');
  } catch { listEl.innerHTML = '<p class="loading-text" style="color:#ff7675">Could not load match data.</p>'; }
}

async function loadUpcoming() {
  const el = document.getElementById('upcoming-list');
  try {
    const res = await fetch(`${API}/api/v1/venues/cricket/upcoming`);
    const d = await res.json();
    const matches = d.matches || [];
    if (!matches.length) { el.innerHTML = '<p class="loading-text">No upcoming matches.</p>'; return; }
    el.innerHTML = matches.map(m => `<div class="event-row" style="cursor:default"><div><div class="event-teams">${m.homeTeam} vs ${m.awayTeam}</div><div class="event-league">${m.league} · ${m.venue}, ${m.city}</div></div><div style="text-align:right"><div style="font-weight:600;font-size:.9rem">${m.date}</div><div style="font-size:.8rem;color:var(--text-muted)">${m.time}</div><div style="font-size:.75rem;color:var(--accent-2)">${m.matchNumber}</div></div></div>`).join('');
  } catch { el.innerHTML = '<p class="loading-text" style="color:#ff7675">Could not load upcoming matches.</p>'; }
}

let currentMatchData = null;
let currentInning = 1;

window.openMatchModal = async function(idx) {
  try {
    const res = await fetch(`${API}/api/v1/venues/cricket/live`);
    const d = await res.json();
    currentMatchData = d.match;
  } catch { currentMatchData = null; }
  if (!currentMatchData) {
    const res2 = await fetch(`${API}/api/v1/venues/live-scores`);
    const d2 = await res2.json();
    const ev = (d2.events || [])[idx];
    if (!ev) return;
    currentMatchData = { matchId: ev.id, status: ev.status, tournament: ev.league, venue: ev.venue, matchNumber: ev.matchNumber || '', innings: [], winProbability: {} };
  }
  currentInning = currentMatchData.innings.length > 1 ? 1 : 0;
  renderModal();
  document.getElementById('match-modal').style.display = 'flex';
  document.body.style.overflow = 'hidden';
};

window.closeMatchModal = function() {
  document.getElementById('match-modal').style.display = 'none';
  document.body.style.overflow = '';
};

function renderModal() {
  const m = currentMatchData;
  if (!m) return;
  const isLive = (m.status || '').toUpperCase().includes('LIVE');
  document.getElementById('modal-title').innerHTML = `<div style="display:flex;align-items:center;gap:.8rem;font-family:Outfit,sans-serif;font-size:1.3rem;font-weight:700">${m.innings.length >= 2 ? m.innings[0].battingTeam + ' vs ' + m.innings[1].battingTeam : m.tournament} ${isLive ? '<span class="live-badge">🔴 LIVE</span>' : ''} <span style="font-size:.8rem;color:var(--text-muted);font-weight:400">${m.matchNumber}</span></div>`;
  document.getElementById('modal-meta').innerHTML = `<div style="font-size:.8rem;color:var(--text-secondary);margin-top:.3rem">${m.venue || ''} ${m.weather ? '· ' + m.weather.sky + ', ' + m.weather.temp : ''}</div>${m.toss ? `<div style="font-size:.75rem;color:var(--text-muted)">${m.toss}</div>` : ''}`;
  if (m.innings.length >= 2) {
    document.getElementById('modal-tabs').innerHTML = m.innings.map((inn, i) => `<button class="modal-tab ${i === currentInning ? 'active' : ''}" onclick="switchInning(${i})">${inn.battingTeam} — ${inn.score} (${inn.overs} ov)</button>`).join('');
  } else { document.getElementById('modal-tabs').innerHTML = ''; }
  renderInning();
}

window.switchInning = function(i) { currentInning = i; renderModal(); };

function renderInning() {
  const m = currentMatchData;
  if (!m || !m.innings.length) { document.getElementById('modal-body').innerHTML = '<div class="modal-section"><p class="loading-text">No detailed scorecard available for this match.</p></div>'; return; }
  const inn = m.innings[currentInning];
  let html = `<div class="modal-score-header"><div class="modal-score-big">${inn.battingTeam} ${inn.score}</div><div class="modal-score-detail">Overs: ${inn.overs} · Run Rate: ${inn.runRate}${inn.requiredRunRate ? ` · RRR: ${inn.requiredRunRate}` : ''}</div>`;
  if (inn.target) html += `<div class="modal-score-detail">Target: ${inn.target} · Need ${inn.toWin.runs} off ${inn.toWin.balls} balls</div>`;
  if (m.winProbability && m.winProbability.MI) {
    const mi = m.winProbability.MI, gt = m.winProbability.GT;
    html += `<div style="margin-top:.6rem;font-size:.75rem;color:var(--text-secondary)">Win Probability</div><div class="win-prob-bar"><div style="width:${mi}%;background:linear-gradient(90deg,#6c5ce7,#a29bfe)"></div><div style="width:${gt}%;background:linear-gradient(90deg,#00cec9,#55efc4)"></div></div><div style="display:flex;justify-content:space-between;font-size:.7rem;color:var(--text-muted)"><span>MI ${mi}%</span><span>GT ${gt}%</span></div>`;
  }
  html += '</div>';
  const batters = inn.currentBatters || inn.topBatters || [];
  if (batters.length) {
    html += '<div class="modal-section"><div style="font-size:.8rem;font-weight:700;color:var(--accent-glow);margin-bottom:.5rem">BATTING</div>';
    batters.forEach(b => { html += `<div class="batter-row"><span class="batter-name">${b.name}${b.status === 'not out' ? '*' : ''}</span><span>${b.runs} (${b.balls})</span><span style="color:var(--text-muted)">SR: ${b.strikeRate}</span><span style="color:var(--text-muted)">4s: ${b.fours}</span><span style="color:var(--text-muted)">6s: ${b.sixes}</span></div>`; });
    html += '</div>';
  }
  if (inn.dismissed && inn.dismissed.length) {
    html += '<div class="modal-section" style="padding-top:0"><div style="font-size:.75rem;font-weight:600;color:var(--text-muted);margin-bottom:.3rem;border-top:1px dashed var(--border);padding-top:.8rem">FALL OF WICKETS</div>';
    inn.dismissed.forEach(d => { html += `<div class="dismissed-row"><span>${d.name} ${d.runs}</span><span style="font-size:.7rem">${d.dismissal}</span></div>`; });
    html += '</div>';
  }
  const bowlers = inn.currentBowlers || inn.topBowlers || [];
  if (bowlers.length) {
    html += '<div class="modal-section" style="padding-top:0"><div style="font-size:.8rem;font-weight:700;color:var(--accent-glow);margin-bottom:.5rem">BOWLING (${inn.bowlingTeam || ""})</div>';
    bowlers.forEach(b => { html += `<div class="bowler-row"><span class="batter-name">${b.name}</span><span>${b.overs}-0-${b.runs}-${b.wickets}</span><span style="color:var(--text-muted)">Econ: ${b.economy}</span><span></span><span></span></div>`; });
    html += '</div>';
  }
  document.getElementById('modal-body').innerHTML = html;
}

if (venueId) loadVenue();
loadMatches();
loadUpcoming();
setInterval(loadMatches, 30000);
