// ── Navbar scroll effect ──
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// ── Scroll-triggered fade-in ──
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 100);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// ── Animated stat counters ──
function animateCounter(id, target, suffix = '', prefix = '') {
  const el = document.getElementById(id);
  if (!el) return;
  let current = 0;
  const step = Math.max(1, Math.floor(target / 60));
  const interval = setInterval(() => {
    current += step;
    if (current >= target) { current = target; clearInterval(interval); }
    el.textContent = prefix + current.toLocaleString() + suffix;
  }, 25);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter('stat-venues', 48);
      animateCounter('stat-latency', 180, 'ms', '<');
      animateCounter('stat-accuracy', 94, '%');
      animateCounter('stat-regions', 4);
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

const statsBar = document.querySelector('.stats-bar');
if (statsBar) statsObserver.observe(statsBar);

// ── Smooth scroll for anchor links ──
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});

// ── Live Backend Integration ──
const API_BASE = window.location.origin;

async function checkService(url, statusEl) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      statusEl.textContent = '● Online';
      statusEl.style.color = '#55efc4';
    } else {
      statusEl.textContent = '● Error ' + res.status;
      statusEl.style.color = '#fdcb6e';
    }
  } catch {
    statusEl.textContent = '● Offline';
    statusEl.style.color = '#ff7675';
  }
}

async function loadVenues() {
  const container = document.getElementById('live-venues');
  if (!container) return;
  try {
    const res = await fetch(`${API_BASE}/api/v1/venues`);
    const data = await res.json();
    const venues = data.venues || [];
    if (venues.length === 0) {
      container.innerHTML = '<p style="color:var(--text-muted)">No venues loaded yet.</p>';
      return;
    }
    container.innerHTML = venues.map(v => `
      <a class="venue-card" href="/venue.html?id=${v.venueId}" style="text-decoration:none;color:inherit;display:block;cursor:pointer;">
        <div class="venue-header">
          <span class="venue-name">${v.name}</span>
          <span class="venue-badge">${v.country}</span>
        </div>
        <div class="venue-details">
          <span>📍 ${v.city}</span>
          <span>👥 ${v.capacity?.toLocaleString() || '—'}</span>
          <span>🏏 ${(v.sport_type || []).join(', ')}</span>
        </div>
        <div style="margin-top:0.8rem;font-size:0.8rem;color:var(--accent-glow)">View details & live scores →</div>
      </a>
    `).join('');
  } catch {
    container.innerHTML = '<p style="color:#ff7675">Could not reach Venue API.</p>';
  }
}

// Run on page load
document.addEventListener('DOMContentLoaded', () => {
  const gatewayStatus = document.getElementById('status-gateway');
  const authStatus = document.getElementById('status-auth');
  const venueStatus = document.getElementById('status-venue');

  if (gatewayStatus) checkService(`${API_BASE}/api/health`, gatewayStatus);
  if (authStatus) checkService(`${API_BASE}/api/v1/auth/health`, authStatus);
  if (venueStatus) checkService(`${API_BASE}/api/v1/venues/health`, venueStatus);

  loadVenues();

  // Refresh status every 10 seconds
  setInterval(() => {
    if (gatewayStatus) checkService(`${API_BASE}/api/health`, gatewayStatus);
    if (authStatus) checkService(`${API_BASE}/api/v1/auth/health`, authStatus);
    if (venueStatus) checkService(`${API_BASE}/api/v1/venues/health`, venueStatus);
  }, 10000);
});
