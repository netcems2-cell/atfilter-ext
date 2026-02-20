'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('data-toggle');
  const statusDot = document.querySelector('.status-dot');
  const statusText = document.getElementById('status-text');
  const warningBox = document.getElementById('warning-box');
  const warningList = document.getElementById('warning-list');
  const btnConfirm = document.getElementById('btn-confirm-disable');
  const btnCancel = document.getElementById('btn-cancel');
  const btnDeleteData = document.getElementById('btn-delete-data');

  // Load current state
  chrome.storage.local.get(['data_collection_active', 'consent_given'], (result) => {
    const isActive = result.consent_given === true && result.data_collection_active !== false;
    toggle.checked = isActive;
    updateStatusDisplay(isActive);
  });

  // Toggle change: show warning instead of immediately disabling
  toggle.addEventListener('change', () => {
    if (!toggle.checked) {
      // Update warning content based on tier
      updateWarningContent();
      warningBox.style.display = 'block';
      warningBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
      // User wants to re-enable
      warningBox.style.display = 'none';
      chrome.storage.local.set({ data_collection_active: true }, () => {
        chrome.runtime.sendMessage({ type: 'startDataCollection' });
        updateStatusDisplay(true);
        showToast('Data sharing enabled — thank you for contributing!');
      });
    }
  });

  function updateWarningContent() {
    warningList.innerHTML = `
      <li>Content filtering will stop working</li>
      <li>Live @Map™ visualization</li>
      <li>Regional sentiment insights</li>
      <li>Trending filter patterns</li>
      <li>Community features</li>
    `;
    btnConfirm.textContent = 'I Understand \u2014 Disconnect @Filter\u2122';
  }

  // Confirm disable
  btnConfirm.addEventListener('click', () => {
    chrome.storage.local.set({ data_collection_active: false }, () => {
      chrome.runtime.sendMessage({ type: 'stopDataCollection' });
      warningBox.style.display = 'none';
      toggle.checked = false;
      updateStatusDisplay(false);
      showToast('@Filter™ disconnected from filter feed. Re-enable community participation to reconnect.');
    });
  });

  // Cancel — revert toggle
  btnCancel.addEventListener('click', () => {
    warningBox.style.display = 'none';
    toggle.checked = true;
    showToast('Great! Data sharing remains active.');
  });

  // Request data deletion
  btnDeleteData.addEventListener('click', () => {
    showToast('Deletion request noted. Aggregated data cannot be de-aggregated, but new collection has stopped.');
    chrome.storage.local.set({ data_collection_active: false });
    chrome.runtime.sendMessage({ type: 'stopDataCollection' });
    toggle.checked = false;
    updateStatusDisplay(false);
  });

  function updateStatusDisplay(active) {
    if (active) {
      statusDot.className = 'status-dot active';
      statusText.textContent = 'Community participation is active';
    } else {
      statusDot.className = 'status-dot inactive';
      statusText.textContent = '@Filter™ is disconnected — enable community participation to reconnect';
    }
  }

  function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.style.display = 'block';
    // Force reflow for transition
    toast.offsetHeight;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => { toast.style.display = 'none'; }, 300);
    }, 3000);
  }
});
