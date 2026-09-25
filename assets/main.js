/* ============================================================
   XRD Facility – Shared JavaScript
   - Light/Dark theme toggle with localStorage persistence
   - Public notification banner rendering
   - Site customization rendering from admin settings
   - Booking availability rendering (next two Wednesdays)
   - Admin panel (localStorage-backed foundation)
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

var STORAGE_KEYS = {
  slotConfig: 'xrd-slot-config',
  siteSettings: 'xrd-site-settings',
  announcement: 'xrd-announcement',
  paymentConfig: 'xrd-payment-config',
  resultLinks: 'xrd-result-links'
};

var DEFAULT_SITE_SETTINGS = {
  facilityName: 'XRD Facility',
  logoMark: '⚛',
  contactEmail: 'xrd-facility@institution.ac.in',
  contactPhone: '+91 [Phone Number]',
  contactLocation: 'Department of [Department Name], [Institution Name]',
  homeHeroTitle: 'X-Ray Diffractometer (XRD) Facility',
  homeHeroSubtitle: 'A shared analytical facility providing high-quality powder X-ray diffraction services for research and industry.'
};

var DEFAULT_PAYMENT_CONFIG = {
  paymentFormUrl: 'https://docs.google.com/forms/'
};

function readJSON(key, fallback) {
  try {
    var raw = localStorage.getItem(key);
    if (!raw) return fallback;
    var parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : fallback;
  } catch (e) {
    return fallback;
  }
}

function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function isSafeHttpUrl(url) {
  try {
    var parsed = new URL(url, window.location.origin);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch (e) {
    return false;
  }
}

function getSiteSettings() {
  var saved = readJSON(STORAGE_KEYS.siteSettings, {});
  return Object.assign({}, DEFAULT_SITE_SETTINGS, saved);
}

function getPaymentConfig() {
  var saved = readJSON(STORAGE_KEYS.paymentConfig, {});
  return Object.assign({}, DEFAULT_PAYMENT_CONFIG, saved);
}

function getResultLinks() {
  return readJSON(STORAGE_KEYS.resultLinks, {});
}

function applySiteSettings() {
  var settings = getSiteSettings();
  window.__xrdSiteSettings = settings;

  document.querySelectorAll('.nav-brand').forEach(function (el) {
    el.textContent = (settings.logoMark ? settings.logoMark + ' ' : '') + settings.facilityName;
  });

  document.querySelectorAll('[data-site-name]').forEach(function (el) {
    el.textContent = settings.facilityName;
  });

  var heroTitle = document.getElementById('hero-title');
  if (heroTitle && settings.homeHeroTitle) heroTitle.textContent = settings.homeHeroTitle;

  var heroSubtitle = document.getElementById('hero-subtitle');
  if (heroSubtitle && settings.homeHeroSubtitle) heroSubtitle.textContent = settings.homeHeroSubtitle;

  var contactEmailLink = document.getElementById('contact-email-link');
  if (contactEmailLink && settings.contactEmail) {
    contactEmailLink.textContent = settings.contactEmail;
    contactEmailLink.href = 'mailto:' + settings.contactEmail;
  }

  var contactPhoneText = document.getElementById('contact-phone-text');
  if (contactPhoneText && settings.contactPhone) contactPhoneText.textContent = settings.contactPhone;

  var contactLocationText = document.getElementById('contact-location-text');
  if (contactLocationText && settings.contactLocation) contactLocationText.textContent = settings.contactLocation;
}

function getAnnouncement() {
  var saved = readJSON(STORAGE_KEYS.announcement, {});
  if (!saved || typeof saved.message !== 'string' || !saved.message.trim()) return null;
  var type = saved.type === 'success' || saved.type === 'warning' ? saved.type : 'info';
  return {
    type: type,
    message: saved.message.trim()
  };
}

function renderAnnouncementBanner() {
  var announcement = getAnnouncement();
  if (!announcement) return;
  var nav = document.querySelector('.site-nav');
  if (!nav || document.querySelector('.site-notice')) return;

  var banner = document.createElement('div');
  banner.className = 'site-notice ' + announcement.type;
  banner.setAttribute('role', 'status');
  banner.setAttribute('aria-live', 'polite');
  banner.textContent = announcement.message;

  if (nav.parentNode) {
    nav.parentNode.insertBefore(banner, nav.nextSibling);
  }
}

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

  applySiteSettings();
  renderAnnouncementBanner();
  initAdminPanel();
  initPaymentPage();
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

function getMergedSlotConfig() {
  return Object.assign({}, SLOT_CONFIG, readJSON(STORAGE_KEYS.slotConfig, {}));
}

function getSlotDetails(dateStr) {
  var config = getMergedSlotConfig()[dateStr];
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
  var hasValidFormLink = bookingUrl && bookingUrl.indexOf('your-form-link') === -1 && isSafeHttpUrl(bookingUrl);
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
      html += '  <div class="slot-note">' + escapeHtml(slot.note) + '</div>';
    }
    if (slot.bookingOpen) {
      html += '  <a href="' + escapeHtml(slot.bookingUrl) + '" target="_blank" rel="noopener noreferrer" class="btn btn-action btn-sm">Book now →</a>';
    } else {
      html += '  <span class="btn btn-disabled btn-sm" aria-disabled="true">Booking closed</span>';
    }
    html += '</div>';
  });

  container.innerHTML = html;
}

function initAdminPanel() {
  var page = document.getElementById('admin-page');
  if (!page) return;

  var SESSION_KEY = 'xrd-admin-authenticated';
  var ADMIN_PASSWORD = 'change-me-admin-password';

  var loginSection = document.getElementById('admin-login-section');
  var panelSection = document.getElementById('admin-panel-section');
  var loginForm = document.getElementById('admin-login-form');
  var loginStatus = document.getElementById('admin-login-status');
  var saveStatus = document.getElementById('admin-save-status');
  var slotsContainer = document.getElementById('admin-slots-container');
  var slotForm = document.getElementById('admin-slot-form');
  var settingsForm = document.getElementById('admin-settings-form');
  var announcementForm = document.getElementById('admin-announcement-form');
  var clearAnnouncementBtn = document.getElementById('clear-announcement-btn');
  var paymentForm = document.getElementById('admin-payment-form');

  var slotDates = getNextWednesdays(4);

  function setAuthedUI(isAuthed) {
    loginSection.hidden = isAuthed;
    panelSection.hidden = !isAuthed;
  }

  function isAuthed() {
    return sessionStorage.getItem(SESSION_KEY) === '1';
  }

  function renderSlotInputs() {
    var mergedConfig = getMergedSlotConfig();
    var html = '';

    slotDates.forEach(function (dateStr) {
      var config = mergedConfig[dateStr];
      var remaining = '';
      var note = '';
      var bookingUrl = '';

      if (typeof config === 'number') {
        remaining = config;
      } else if (config && typeof config === 'object') {
        if (typeof config.remaining === 'number') remaining = config.remaining;
        if (typeof config.note === 'string') note = config.note;
        if (typeof config.bookingUrl === 'string') bookingUrl = config.bookingUrl;
      }

      html += '<div class="admin-slot-row">';
      html += '  <div class="admin-slot-date">' + formatDate(dateStr) + '</div>';
      html += '  <label>Remaining slots (0-' + MAX_SLOTS + ')<input type="number" min="0" max="' + MAX_SLOTS + '" data-field="remaining" data-date="' + dateStr + '" value="' + escapeHtml(remaining) + '" /></label>';
      html += '  <label>Per-date booking link (optional)<input type="url" data-field="bookingUrl" data-date="' + dateStr + '" value="' + escapeHtml(bookingUrl) + '" placeholder="https://forms.office.com/..." /></label>';
      html += '  <label>Note (optional)<input type="text" data-field="note" data-date="' + dateStr + '" value="' + escapeHtml(note) + '" placeholder="Fully booked / Rescheduled" /></label>';
      html += '</div>';
    });

    slotsContainer.innerHTML = html;
  }

  function loadSettingsForms() {
    var settings = getSiteSettings();
    document.getElementById('setting-facility-name').value = settings.facilityName;
    document.getElementById('setting-logo-mark').value = settings.logoMark;
    document.getElementById('setting-contact-email').value = settings.contactEmail;
    document.getElementById('setting-contact-phone').value = settings.contactPhone;
    document.getElementById('setting-contact-location').value = settings.contactLocation;
    document.getElementById('setting-home-title').value = settings.homeHeroTitle;
    document.getElementById('setting-home-subtitle').value = settings.homeHeroSubtitle;

    var announcement = getAnnouncement();
    document.getElementById('announcement-message').value = announcement ? announcement.message : '';
    document.getElementById('announcement-type').value = announcement ? announcement.type : 'info';

    var paymentConfig = getPaymentConfig();
    document.getElementById('setting-payment-form-url').value = paymentConfig.paymentFormUrl || '';

    var resultLinks = getResultLinks();
    var rows = Object.keys(resultLinks).map(function (identifier) {
      return identifier + '|' + resultLinks[identifier];
    });
    document.getElementById('setting-result-links').value = rows.join('\n');
  }

  function setSaveStatus(message, type) {
    saveStatus.textContent = message;
    saveStatus.className = 'admin-status ' + (type || 'success');
  }

  if (isAuthed()) {
    setAuthedUI(true);
    renderSlotInputs();
    loadSettingsForms();
  } else {
    setAuthedUI(false);
  }

  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var password = document.getElementById('admin-password').value;
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, '1');
      loginStatus.textContent = '';
      setAuthedUI(true);
      renderSlotInputs();
      loadSettingsForms();
      return;
    }

    loginStatus.textContent = 'Invalid password.';
    loginStatus.className = 'admin-status error';
  });

  slotForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var savedSlots = readJSON(STORAGE_KEYS.slotConfig, {});

    slotDates.forEach(function (dateStr) {
      var remainingInput = slotForm.querySelector('[data-field="remaining"][data-date="' + dateStr + '"]');
      var noteInput = slotForm.querySelector('[data-field="note"][data-date="' + dateStr + '"]');
      var bookingUrlInput = slotForm.querySelector('[data-field="bookingUrl"][data-date="' + dateStr + '"]');

      var remainingRaw = remainingInput ? remainingInput.value.trim() : '';
      var note = noteInput ? noteInput.value.trim() : '';
      var bookingUrl = bookingUrlInput ? bookingUrlInput.value.trim() : '';

      if (!remainingRaw && !note && !bookingUrl) {
        delete savedSlots[dateStr];
        return;
      }

      var remaining = parseInt(remainingRaw, 10);
      if (isNaN(remaining)) remaining = MAX_SLOTS;
      remaining = Math.max(0, Math.min(MAX_SLOTS, remaining));

      var entry = { remaining: remaining };
      if (note) entry.note = note;
      if (bookingUrl && isSafeHttpUrl(bookingUrl)) entry.bookingUrl = bookingUrl;
      savedSlots[dateStr] = entry;
    });

    writeJSON(STORAGE_KEYS.slotConfig, savedSlots);
    setSaveStatus('Slot settings saved.');
    renderSlotInputs();
  });

  settingsForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var settings = {
      facilityName: document.getElementById('setting-facility-name').value.trim() || DEFAULT_SITE_SETTINGS.facilityName,
      logoMark: document.getElementById('setting-logo-mark').value.trim(),
      contactEmail: document.getElementById('setting-contact-email').value.trim() || DEFAULT_SITE_SETTINGS.contactEmail,
      contactPhone: document.getElementById('setting-contact-phone').value.trim() || DEFAULT_SITE_SETTINGS.contactPhone,
      contactLocation: document.getElementById('setting-contact-location').value.trim() || DEFAULT_SITE_SETTINGS.contactLocation,
      homeHeroTitle: document.getElementById('setting-home-title').value.trim() || DEFAULT_SITE_SETTINGS.homeHeroTitle,
      homeHeroSubtitle: document.getElementById('setting-home-subtitle').value.trim() || DEFAULT_SITE_SETTINGS.homeHeroSubtitle
    };

    writeJSON(STORAGE_KEYS.siteSettings, settings);
    applySiteSettings();
    setSaveStatus('Site settings saved.');
  });

  announcementForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var message = document.getElementById('announcement-message').value.trim();
    var type = document.getElementById('announcement-type').value;

    if (!message) {
      setSaveStatus('Announcement message cannot be empty.', 'error');
      return;
    }

    writeJSON(STORAGE_KEYS.announcement, { message: message, type: type });
    setSaveStatus('Announcement saved.');
  });

  clearAnnouncementBtn.addEventListener('click', function () {
    localStorage.removeItem(STORAGE_KEYS.announcement);
    document.getElementById('announcement-message').value = '';
    document.getElementById('announcement-type').value = 'info';
    setSaveStatus('Announcement cleared.');
  });

  paymentForm.addEventListener('submit', function (e) {
    e.preventDefault();

    var paymentFormUrl = document.getElementById('setting-payment-form-url').value.trim();
    var mappingsRaw = document.getElementById('setting-result-links').value;
    var resultLinks = {};
    var invalidLines = 0;

    mappingsRaw.split('\n').forEach(function (line) {
      var trimmed = line.trim();
      if (!trimmed) return;

      var parts = trimmed.split('|');
      if (parts.length < 2) {
        invalidLines += 1;
        return;
      }

      var identifier = parts[0].trim().toLowerCase();
      var resultUrl = parts.slice(1).join('|').trim();

      if (!identifier || !isSafeHttpUrl(resultUrl)) {
        invalidLines += 1;
        return;
      }

      resultLinks[identifier] = resultUrl;
    });

    if (paymentFormUrl && !isSafeHttpUrl(paymentFormUrl)) {
      setSaveStatus('Payment form URL must be a valid http/https link.', 'error');
      return;
    }

    writeJSON(STORAGE_KEYS.paymentConfig, {
      paymentFormUrl: paymentFormUrl || DEFAULT_PAYMENT_CONFIG.paymentFormUrl
    });
    writeJSON(STORAGE_KEYS.resultLinks, resultLinks);

    if (invalidLines > 0) {
      setSaveStatus('Saved with ' + invalidLines + ' invalid mapping line(s) ignored.', 'error');
      return;
    }
    setSaveStatus('Payment and result settings saved.');
  });
}

function initPaymentPage() {
  var page = document.getElementById('payment-page');
  if (!page) return;

  var paymentFormLink = document.getElementById('payment-form-link');
  var paymentFormStatus = document.getElementById('payment-form-status');
  var resultForm = document.getElementById('result-access-form');
  var resultStatus = document.getElementById('result-access-status');

  var paymentConfig = getPaymentConfig();
  var paymentFormUrl = paymentConfig.paymentFormUrl;

  if (paymentFormLink) {
    if (paymentFormUrl && isSafeHttpUrl(paymentFormUrl)) {
      paymentFormLink.href = paymentFormUrl;
      paymentFormLink.classList.remove('btn-disabled');
      paymentFormLink.removeAttribute('aria-disabled');
    } else {
      paymentFormLink.removeAttribute('href');
      paymentFormLink.classList.add('btn-disabled');
      paymentFormLink.setAttribute('aria-disabled', 'true');
      if (paymentFormStatus) paymentFormStatus.textContent = 'Payment form link is not configured yet. Please contact the facility.';
    }
  }

  resultForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var identifierInput = document.getElementById('result-identifier');
    var identifier = identifierInput.value.trim().toLowerCase();
    var resultLinks = getResultLinks();

    if (!identifier) {
      resultStatus.textContent = 'Please enter your registered email or booking identifier.';
      resultStatus.className = 'admin-status error';
      return;
    }

    var resultUrl = resultLinks[identifier];
    if (!resultUrl || !isSafeHttpUrl(resultUrl)) {
      resultStatus.textContent = 'Result not found for this identifier. Please contact the facility team.';
      resultStatus.className = 'admin-status error';
      return;
    }

    resultStatus.textContent = 'Redirecting to your result download...';
    resultStatus.className = 'admin-status';
    window.location.href = resultUrl;
  });
}

document.addEventListener('DOMContentLoaded', renderAvailability);
