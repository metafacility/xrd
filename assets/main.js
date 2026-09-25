/* ============================================================
   XRD Facility – Shared JavaScript
   - Light/Dark theme toggle with localStorage persistence
   - Booking availability rendering (next two Wednesdays)
   ============================================================ */

// ── Theme toggle ──────────────────────────────────────────────
(function () {
  const STORAGE_KEY = 'xrd-theme';
  const html = document.documentElement;

  function getPreference() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
    const btn = document.getElementById('theme-toggle');
    if (btn) {
      const icon = btn.querySelector('.icon');
      const label = btn.querySelector('.label');
      if (theme === 'dark') {
        if (icon) icon.textContent = '☀️';
        if (label) label.textContent = 'Light mode';
        btn.setAttribute('aria-label', 'Switch to light mode');
      } else {
        if (icon) icon.textContent = '🌙';
        if (label) label.textContent = 'Dark mode';
        btn.setAttribute('aria-label', 'Switch to dark mode');
      }
    }
  }

  // Apply saved preference immediately (before paint)
  applyTheme(getPreference());

  document.addEventListener('DOMContentLoaded', function () {
    const btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.addEventListener('click', function () {
        const current = html.getAttribute('data-theme');
        applyTheme(current === 'dark' ? 'light' : 'dark');
      });
    }
  });
})();

// ── Mobile navigation hamburger ───────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
  const hamburger = document.getElementById('nav-hamburger');
  const navLinks  = document.getElementById('nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function () {
      const open = navLinks.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', String(open));
    });
  }

  // Mark active nav link
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(function (link) {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });
});

// ── Booking availability ───────────────────────────────────────
/**
 * CONFIGURATION — update remaining slots for each Wednesday here.
 *
 * Key format: "YYYY-MM-DD" (the Wednesday's date in local time).
 * If a date is not listed, capacity defaults to MAX_SLOTS (24).
 *
 * Supported formats:
 * 1) Number (backward compatible):
 *    "2025-04-02": 18
 *
 * 2) Object (recommended):
 *    "2025-04-09": {
 *      remaining: 0,
 *      bookingUrl: "https://forms.office.com/your-link",
 *      note: "Fully booked"
 *    }
 */
var SLOT_CONFIG = {
  // ↓ Add or update entries here when slot counts change ↓
};

var MAX_SLOTS = 24;

/**
 * Returns the next N Wednesdays (ISO date strings "YYYY-MM-DD") from today.
 */
function getNextWednesdays(count) {
  var results = [];
  var d = new Date();
  d.setHours(0, 0, 0, 0);
  // Advance to the next Wednesday (day 3); if today is Wednesday, advance to next one
  var day = d.getDay(); // 0=Sun … 6=Sat
  var daysUntilWed = (3 - day + 7) % 7;
  if (daysUntilWed === 0) daysUntilWed = 7; // if today is Wednesday, go to next week
  d.setDate(d.getDate() + daysUntilWed);
  for (var i = 0; i < count; i++) {
    var dateStr = d.toISOString().slice(0, 10);
    results.push(dateStr);
    d.setDate(d.getDate() + 7);
  }
  return results;
}

/**
 * Returns color class based on remaining slots.
 */
function slotColor(remaining) {
  if (remaining >= 12) return 'green';
  if (remaining >= 6)  return 'yellow';
  return 'red';
}

function getSlotDetails(dateStr) {
  var config = SLOT_CONFIG[dateStr];
  var remaining = MAX_SLOTS;
  var bookingUrl = MS_FORMS_LINK;
  var note = '';

  if (typeof config === 'number') {
    remaining = config;
  } else if (config && typeof config === 'object') {
    if (typeof config.remaining === 'number') remaining = config.remaining;
    if (typeof config.bookingUrl === 'string' && config.bookingUrl.trim()) bookingUrl = config.bookingUrl.trim();
    if (typeof config.note === 'string' && config.note.trim()) note = config.note.trim();
  }

  remaining = Math.max(0, Math.min(MAX_SLOTS, remaining));
  var hasValidFormLink = bookingUrl && bookingUrl.indexOf('your-form-link') === -1;
  var bookingOpen = remaining > 0 && hasValidFormLink;

  return {
    remaining: remaining,
    bookingUrl: bookingUrl,
    note: note,
    bookingOpen: bookingOpen
  };
}

/**
 * Formats "YYYY-MM-DD" → "Wednesday, DD Month YYYY"
 */
function formatDate(dateStr) {
  var d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Renders the availability cards into #availability-container.
 * Called on booking.html.
 *
 * MS FORMS LINK — replace the placeholder below with your real link:
 */
var MS_FORMS_LINK = 'https://forms.office.com/your-form-link'; // ← REPLACE THIS with your MS Forms URL

function renderAvailability() {
  var container = document.getElementById('availability-container');
  if (!container) return;

  var wednesdays = getNextWednesdays(2);
  var html = '';

  wednesdays.forEach(function (dateStr) {
    var slot = getSlotDetails(dateStr);
    var remaining = slot.remaining;
    var color = slotColor(remaining);
    var pct   = Math.round((remaining / MAX_SLOTS) * 100);
    var statusText = remaining === 0 ? 'Fully booked' : color === 'green' ? 'Available' : color === 'yellow' ? 'Filling up' : 'Almost full';

    html += '<div class="slot-card">';
    html += '  <div class="slot-card-date">' + formatDate(dateStr) + '</div>';
    html += '  <div class="slot-card-weekday">Operating date</div>';
    html += '  <div class="slot-indicator">';
    html += '    <span class="slot-badge ' + color + '">' + statusText + '</span>';
    html += '  </div>';
    html += '  <div class="slot-bar-track"><div class="slot-bar-fill ' + color + '" style="width:' + pct + '%" role="progressbar" aria-valuenow="' + remaining + '" aria-valuemin="0" aria-valuemax="' + MAX_SLOTS + '"></div></div>';
    html += '  <div class="slot-count">' + remaining + ' of ' + MAX_SLOTS + ' slots remaining</div>';
    if (slot.note) {
      html += '  <div class="slot-note">' + slot.note + '</div>';
    }
    if (slot.bookingOpen) {
      html += '  <a href="' + slot.bookingUrl + '" target="_blank" rel="noopener noreferrer" class="btn btn-action btn-sm">Book now →</a>';
    } else {
      html += '  <span class="btn btn-disabled btn-sm" aria-disabled="true">Booking closed</span>';
    }
    html += '</div>';
  });

  container.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', renderAvailability);
