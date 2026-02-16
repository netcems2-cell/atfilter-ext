document.addEventListener('DOMContentLoaded', function() {
  const keywordsTextarea = document.getElementById('keywords');
  const saveButton = document.getElementById('save');
  const clearButton = document.getElementById('clear');
  const statusDiv = document.getElementById('status');
  const keywordCountSpan = document.getElementById('keyword-count');
  const keywordLimitSpan = document.getElementById('keyword-limit');
  const limitWarning = document.getElementById('limit-warning');
  const proBadge = document.getElementById('pro-badge');
  const presetButtons = document.querySelectorAll('.preset-btn');

  const FREE_KEYWORD_LIMIT = 5;
  const VALIDATE_URL = 'https://atfilter.com/api/license/validate';

  let isPro = false;

  // --- License UI elements ---
  const licenseInput = document.getElementById('license-key');
  const activateBtn = document.getElementById('activate-btn');
  const licenseStatusDiv = document.getElementById('license-status');
  const deactivateRow = document.getElementById('deactivate-row');
  const deactivateBtn = document.getElementById('deactivate-btn');

  // --- Telemetry toggle ---
  const telemetryToggle = document.getElementById('telemetry-toggle');
  chrome.storage.local.get(['telemetry_enabled'], function(result) {
    telemetryToggle.checked = result.telemetry_enabled || false;
  });
  telemetryToggle.addEventListener('change', function() {
    chrome.storage.local.set({ telemetry_enabled: telemetryToggle.checked });
  });

  // --- Pro status ---
  function updateProUI(pro) {
    isPro = pro;
    proBadge.style.display = pro ? 'inline' : 'none';
    keywordLimitSpan.style.display = pro ? 'none' : 'inline';
    limitWarning.style.display = 'none';
    if (pro) {
      licenseInput.style.display = 'none';
      activateBtn.style.display = 'none';
      deactivateRow.style.display = 'block';
      licenseStatusDiv.style.display = 'block';
      licenseStatusDiv.style.color = '#155724';
      licenseStatusDiv.textContent = 'Pro license active';
    } else {
      licenseInput.style.display = '';
      activateBtn.style.display = '';
      deactivateRow.style.display = 'none';
    }
  }

  // Load license state from storage
  function loadLicenseState() {
    chrome.storage.local.get(['licenseKey', 'isPro', 'licenseTier'], function(result) {
      if (result.isPro && result.licenseKey) {
        updateProUI(true);
        licenseInput.value = result.licenseKey;
      } else {
        updateProUI(false);
      }
    });
  }

  // Validate license key against server
  async function validateLicense(key) {
    try {
      const res = await fetch(VALIDATE_URL + '?key=' + encodeURIComponent(key));
      return await res.json();
    } catch {
      return { valid: false, reason: 'Network error — check your connection' };
    }
  }

  // Activate button click
  activateBtn.addEventListener('click', async function() {
    const key = licenseInput.value.trim();
    if (!key) {
      showLicenseStatus('Please enter a license key', false);
      return;
    }

    activateBtn.disabled = true;
    activateBtn.textContent = '...';
    const result = await validateLicense(key);
    activateBtn.disabled = false;
    activateBtn.textContent = 'Activate';

    if (result.valid) {
      chrome.storage.local.set({
        licenseKey: key,
        isPro: true,
        licenseTier: result.tier,
        licenseValidatedAt: Date.now(),
      });
      updateProUI(true);
      showLicenseStatus('Pro activated! Unlimited keywords unlocked.', true);
    } else {
      showLicenseStatus(result.reason || 'Invalid license key', false);
    }
  });

  // Deactivate button click
  deactivateBtn.addEventListener('click', function() {
    if (!confirm('Deactivate your Pro license on this device?')) return;
    chrome.storage.local.set({
      licenseKey: null,
      isPro: false,
      licenseTier: null,
      licenseValidatedAt: null,
    });
    licenseInput.value = '';
    updateProUI(false);
    licenseStatusDiv.style.display = 'none';

    // Enforce keyword limit on existing keywords
    chrome.storage.local.get(['filterKeywords'], function(result) {
      const keywords = result.filterKeywords || [];
      if (keywords.length > FREE_KEYWORD_LIMIT) {
        const trimmed = keywords.slice(0, FREE_KEYWORD_LIMIT);
        chrome.storage.local.set({ filterKeywords: trimmed });
        keywordsTextarea.value = trimmed.join('\n');
        updateKeywordCount(trimmed.length);
        showStatus(`Downgraded to Free: keeping first ${FREE_KEYWORD_LIMIT} keywords.`, false);
      }
    });
  });

  function showLicenseStatus(msg, isSuccess) {
    licenseStatusDiv.style.display = 'block';
    licenseStatusDiv.style.color = isSuccess ? '#155724' : '#721c24';
    licenseStatusDiv.textContent = msg;
  }

  // Load existing keywords
  let previousKeywords = [];
  function loadKeywords() {
    chrome.storage.local.get(['filterKeywords'], function(result) {
      if (result.filterKeywords && result.filterKeywords.length > 0) {
        previousKeywords = result.filterKeywords.slice();
        keywordsTextarea.value = result.filterKeywords.join('\n');
        updateKeywordCount(result.filterKeywords.length);
      } else {
        previousKeywords = [];
        updateKeywordCount(0);
      }
    });
  }

  // Update keyword count display
  function updateKeywordCount(count) {
    keywordCountSpan.textContent = count;
    if (!isPro && count > FREE_KEYWORD_LIMIT) {
      limitWarning.style.display = 'block';
    } else {
      limitWarning.style.display = 'none';
    }
  }

  // Show status message
  function showStatus(message, isSuccess = true) {
    statusDiv.textContent = message;
    statusDiv.className = isSuccess ? 'success' : 'error';

    setTimeout(() => {
      statusDiv.style.display = 'none';
      statusDiv.className = '';
    }, 3000);
  }

  // Save keywords
  function saveKeywords() {
    const text = keywordsTextarea.value;
    let keywords = text
      .split('\n')
      .map(k => k.trim().toLowerCase())
      .filter(k => k.length > 0);

    if (keywords.length === 0) {
      showStatus('Please enter at least one keyword', false);
      return;
    }

    // Enforce Free tier limit
    if (!isPro && keywords.length > FREE_KEYWORD_LIMIT) {
      keywords = keywords.slice(0, FREE_KEYWORD_LIMIT);
      keywordsTextarea.value = keywords.join('\n');
      showStatus(`Free plan: saved first ${FREE_KEYWORD_LIMIT} keywords. Upgrade to Pro for unlimited.`, false);
    }

    // Diff against previous keywords for event emission
    const added = keywords.filter(k => !previousKeywords.includes(k));
    const removed = previousKeywords.filter(k => !keywords.includes(k));

    chrome.storage.local.set({ filterKeywords: keywords }, function() {
      updateKeywordCount(keywords.length);
      if (isPro || keywords.length <= FREE_KEYWORD_LIMIT) {
        showStatus(`Saved ${keywords.length} keyword${keywords.length === 1 ? '' : 's'}. Active tabs will update automatically.`);
      }

      // Emit keyword config events
      for (const kw of added) {
        chrome.runtime.sendMessage({
          type: 'keyword_event',
          data: { event_type: 'added', keyword_raw: kw }
        });
      }
      for (const kw of removed) {
        chrome.runtime.sendMessage({
          type: 'keyword_event',
          data: { event_type: 'removed', keyword_raw: kw }
        });
      }

      previousKeywords = keywords.slice();
    });
  }

  // Clear all keywords
  function clearKeywords() {
    if (confirm('Clear all filter keywords?')) {
      chrome.storage.local.set({ filterKeywords: [] }, function() {
        keywordsTextarea.value = '';
        updateKeywordCount(0);
        showStatus('All keywords cleared. Reload pages to restore hidden content.');
      });
    }
  }

  // Add preset keyword
  function addPresetKeyword(keyword) {
    const currentText = keywordsTextarea.value;
    const currentKeywords = currentText
      .split('\n')
      .map(k => k.trim().toLowerCase())
      .filter(k => k.length > 0);

    if (!currentKeywords.includes(keyword.toLowerCase())) {
      currentKeywords.push(keyword.toLowerCase());
      keywordsTextarea.value = currentKeywords.join('\n');
      showStatus(`Added: ${keyword}`);
    } else {
      showStatus(`"${keyword}" already added`, false);
    }
  }

  // Event listeners
  saveButton.addEventListener('click', saveKeywords);
  clearButton.addEventListener('click', clearKeywords);

  presetButtons.forEach(button => {
    button.addEventListener('click', function() {
      const keyword = this.getAttribute('data-keyword');
      addPresetKeyword(keyword);
    });
  });

  // Allow Ctrl+Enter to save
  keywordsTextarea.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 'Enter') {
      saveKeywords();
    }
  });

  // Allow Enter in license input to activate
  licenseInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      activateBtn.click();
    }
  });

  // --- Debug log button ---
  const debugButton = document.getElementById('debug');
  const debugStatus = document.getElementById('debug-status');

  debugButton.addEventListener('click', function() {
    debugStatus.style.display = 'block';
    debugStatus.textContent = 'Running diagnostic on active tab...';

    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (!tabs[0]) {
        debugStatus.textContent = 'No active tab found.';
        return;
      }
      chrome.tabs.sendMessage(tabs[0].id, { action: 'getDiagnostic' }, function(response) {
        if (chrome.runtime.lastError) {
          debugStatus.textContent = 'Error: ' + chrome.runtime.lastError.message;
          return;
        }
        if (response && response.report) {
          navigator.clipboard.writeText(response.report).then(() => {
            debugStatus.textContent = 'Debug log copied to clipboard! Paste it to share.';
            setTimeout(() => { debugStatus.style.display = 'none'; }, 4000);
          }).catch(() => {
            // Fallback: open in a new window if clipboard fails
            const blob = new Blob([response.report], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            chrome.tabs.create({ url: url });
            debugStatus.textContent = 'Opened log in new tab (clipboard unavailable).';
          });
        } else {
          debugStatus.textContent = 'No response from content script. Try reloading the page.';
        }
      });
    });
  });

  // Initialize
  loadLicenseState();
  loadKeywords();
});
