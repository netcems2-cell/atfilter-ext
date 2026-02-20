document.addEventListener('DOMContentLoaded', function() {
  const keywordsTextarea = document.getElementById('keywords');
  const saveButton = document.getElementById('save');
  const clearButton = document.getElementById('clear');
  const statusDiv = document.getElementById('status');
  const keywordCountSpan = document.getElementById('keyword-count');
  const presetButtons = document.querySelectorAll('.preset-btn');

  // Load existing keywords
  let previousKeywords = [];
  function loadKeywords() {
    browser.storage.local.get(['filterKeywords']).then(function(result) {
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
    let keywords = text
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

    browser.storage.local.set({ filterKeywords: keywords }).then(function() {
      updateKeywordCount(keywords.length);
      showStatus(`Saved ${keywords.length} keyword${keywords.length === 1 ? '' : 's'}. Active tabs will update automatically.`);

      // Emit keyword config events
      for (const kw of added) {
        browser.runtime.sendMessage({
          type: 'keyword_event',
          data: { event_type: 'added', keyword_raw: kw }
        });
      }
      for (const kw of removed) {
        browser.runtime.sendMessage({
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
      browser.storage.local.set({ filterKeywords: [] }).then(function() {
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

    browser.tabs.query({ active: true, currentWindow: true }).then(function(tabs) {
      if (!tabs[0]) {
        debugStatus.textContent = 'No active tab found.';
        return;
      }
      browser.tabs.sendMessage(tabs[0].id, { action: 'getDiagnostic' }).then(function(response) {
        if (response && response.report) {
          navigator.clipboard.writeText(response.report).then(() => {
            debugStatus.textContent = 'Debug log copied to clipboard! Paste it to share.';
            setTimeout(() => { debugStatus.style.display = 'none'; }, 4000);
          }).catch(() => {
            // Fallback: open in a new window if clipboard fails
            const blob = new Blob([response.report], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            browser.tabs.create({ url: url });
            debugStatus.textContent = 'Opened log in new tab (clipboard unavailable).';
          });
        } else {
          debugStatus.textContent = 'No response from content script. Try reloading the page.';
        }
      }).catch(function(error) {
        debugStatus.textContent = 'Error: ' + error.message;
      });
    });
  });

  // Settings link
  document.getElementById('open-settings').addEventListener('click', (e) => {
    e.preventDefault();
    browser.runtime.openOptionsPage();
  });

  // --- Inactive state banner ---
  function checkActiveState() {
    browser.storage.local.get(['consent_given', 'data_collection_active']).then((result) => {
      const active = result.consent_given === true && result.data_collection_active !== false;
      const banner = document.getElementById('inactive-banner');
      if (active) {
        banner.style.display = 'none';
        document.body.classList.remove('inactive-mode');
      } else {
        banner.style.display = 'block';
        document.body.classList.add('inactive-mode');
      }
    });
  }

  document.getElementById('go-onboarding').addEventListener('click', () => {
    browser.tabs.create({ url: browser.runtime.getURL('onboarding.html') });
  });

  document.getElementById('go-settings').addEventListener('click', () => {
    browser.runtime.openOptionsPage();
  });

  // Initialize
  checkActiveState();
  loadKeywords();
});
