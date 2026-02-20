// @Filter Signal Engine — Background Service Worker
'use strict';

const FLUSH_INTERVAL_MINUTES = 5;
const MAX_QUEUE_SIZE = 500;
const INGEST_URL = 'https://atfilter.com/api/ingest/events';

// --- Event queues ---
let keywordEvents = [];
let suppressionEvents = [];

// --- On install: generate anonymous user ID + open onboarding ---
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.storage.local.set({
      anon_user_id: crypto.randomUUID(),
      install_ts: new Date().toISOString(),
      telemetry_enabled: false,
      session_id: crypto.randomUUID(),
    });
    // Open onboarding on first install
    chrome.storage.local.get(['onboarding_complete'], (result) => {
      if (!result.onboarding_complete) {
        chrome.tabs.create({ url: chrome.runtime.getURL('onboarding.html') });
      }
    });
    updateIconState();
  }
  // Set up periodic flush alarm
  chrome.alarms.create('flushEvents', { periodInMinutes: FLUSH_INTERVAL_MINUTES });
});

// Set icon state on startup (service worker restart)
updateIconState();

// Ensure alarms exist on startup
chrome.alarms.get('flushEvents', (alarm) => {
  if (!alarm) {
    chrome.alarms.create('flushEvents', { periodInMinutes: FLUSH_INTERVAL_MINUTES });
  }
});

// --- Consent helper ---
async function checkConsent() {
  const result = await chrome.storage.local.get(['consent_given', 'data_collection_active']);
  return result.consent_given === true && result.data_collection_active !== false;
}

// --- Icon state: grey out when inactive, full colour when active ---
const ICONS_ACTIVE = { 16: 'icon16.png', 48: 'icon48.png', 128: 'icon128.png' };
const ICONS_INACTIVE = { 16: 'icon16-inactive.png', 48: 'icon48-inactive.png', 128: 'icon128-inactive.png' };

async function updateIconState() {
  const active = await checkConsent();
  chrome.action.setIcon({ path: active ? ICONS_ACTIVE : ICONS_INACTIVE });
  chrome.action.setTitle({ title: active ? '@Filter™' : '@Filter™ — disconnected (enable community participation to reconnect)' });
}

// --- Message listener: accept events from content.js / popup.js / onboarding / settings ---
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'keyword_event' && msg.data) {
    if (keywordEvents.length < MAX_QUEUE_SIZE) {
      keywordEvents.push(msg.data);
    }
    sendResponse({ queued: true });
  } else if (msg.type === 'suppression_event' && msg.data) {
    if (suppressionEvents.length < MAX_QUEUE_SIZE) {
      suppressionEvents.push(msg.data);
    }
    sendResponse({ queued: true });
  } else if (msg.type === 'startDataCollection') {
    chrome.storage.local.set({ data_collection_active: true, telemetry_enabled: true }, updateIconState);
    sendResponse({ ok: true });
  } else if (msg.type === 'stopDataCollection') {
    chrome.storage.local.set({ data_collection_active: false, telemetry_enabled: false }, updateIconState);
    sendResponse({ ok: true });
  }
  return true;
});

// --- Alarm handler: flush queued events ---
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'flushEvents') {
    flushEvents();
  }
});

async function flushEvents() {
  // Check if telemetry is enabled and consent is active
  const storage = await chrome.storage.local.get([
    'telemetry_enabled',
    'anon_user_id',
    'session_id',
    'consent_given',
    'data_collection_active',
  ]);

  if (!storage.telemetry_enabled) return;
  // Guard: require active consent before sending telemetry
  if (storage.consent_given !== true || storage.data_collection_active === false) return;
  if (!storage.anon_user_id) return;
  if (keywordEvents.length === 0 && suppressionEvents.length === 0) return;

  // Snapshot and clear queues
  const kwBatch = keywordEvents.splice(0, keywordEvents.length);
  const supBatch = suppressionEvents.splice(0, suppressionEvents.length);

  const manifest = chrome.runtime.getManifest();

  const payload = {
    anon_user_id: storage.anon_user_id,
    client_version: manifest.version,
    browser_family: detectBrowser(),
    session_id: storage.session_id || undefined,
    keyword_events: kwBatch,
    suppression_events: supBatch,
  };

  // Fire-and-forget POST
  try {
    await fetch(INGEST_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    // Network error — re-queue events for next flush
    keywordEvents.unshift(...kwBatch);
    suppressionEvents.unshift(...supBatch);
    // Trim to max queue size
    if (keywordEvents.length > MAX_QUEUE_SIZE) keywordEvents.length = MAX_QUEUE_SIZE;
    if (suppressionEvents.length > MAX_QUEUE_SIZE) suppressionEvents.length = MAX_QUEUE_SIZE;
  }
}

function detectBrowser() {
  const ua = navigator.userAgent;
  if (ua.includes('Edg/')) return 'edge';
  if (ua.includes('Firefox/')) return 'firefox';
  if (ua.includes('Chrome/')) return 'chrome';
  return 'other';
}

