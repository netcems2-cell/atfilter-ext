document.addEventListener('DOMContentLoaded', function() {
  const keywordsTextarea = document.getElementById('keywords');
  const saveButton = document.getElementById('save');
  const clearButton = document.getElementById('clear');
  const statusDiv = document.getElementById('status');
  const keywordCountSpan = document.getElementById('keyword-count');
  const presetButtons = document.querySelectorAll('.preset-btn');

  // --- Telemetry toggle ---
  const telemetryToggle = document.getElementById('telemetry-toggle');
  chrome.storage.local.get(['telemetry_enabled'], function(result) {
    telemetryToggle.checked = result.telemetry_enabled || false;
  });
  telemetryToggle.addEventListener('change', function() {
    chrome.storage.local.set({ telemetry_enabled: telemetryToggle.checked });
  });

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
    const keywords = text
      .split('\n')
      .map(k => k.trim().toLowerCase())
      .filter(k => k.length > 0);

    if (keywords.length === 0) {
      showStatus('Please enter at least one keyword', false);
      return;
    }

    // Diff against previous keywords for event emission
    const added = keywords.filter(k => !previousKeywords.includes(k));
    const removed = previousKeywords.filter(k => !keywords.includes(k));

    chrome.storage.local.set({ filterKeywords: keywords }, function() {
      updateKeywordCount(keywords.length);
      showStatus(`Saved ${keywords.length} keyword${keywords.length === 1 ? '' : 's'}. Active tabs will update automatically.`);

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
  loadKeywords();
});
