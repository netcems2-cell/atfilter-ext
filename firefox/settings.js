'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('data-toggle');
  const statusDot = document.querySelector('.status-dot');
  const statusText = document.getElementById('status-text');
  const warningBox = document.getElementById('warning-box');
  const warningList = document.getElementById('warning-list');
  const btnConfirm = document.getElementById('btn-confirm-disable');
  const btnCancel = document.getElementById('btn-cancel');
  const btnViewData = document.getElementById('btn-view-data');
  const btnDeleteData = document.getElementById('btn-delete-data');

  let isPro = false;

  // Load current state
  chrome.storage.local.get(['data_collection_active', 'consent_given', 'isPro'], (result) => {
    isPro = result.isPro || false;
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
    if (isPro) {
      // Pro: only lose @Map™ features, filtering continues
      warningList.innerHTML = `
        <li>Live @Map™ visualization</li>
        <li>Regional sentiment insights</li>
        <li>Trending filter patterns</li>
        <li>Community features</li>
      `;
      btnConfirm.textContent = 'I Understand \u2014 Disable Data Sharing';
    } else {
      // Free: extension fully deactivated
      warningList.innerHTML = `
        <li>Content filtering will stop working</li>
        <li>Live @Map™ visualization</li>
        <li>Regional sentiment insights</li>
        <li>Trending filter patterns</li>
        <li>Community features</li>
      `;
      btnConfirm.textContent = 'I Understand \u2014 Deactivate @Filter™';
    }
  }

  // Confirm disable
  btnConfirm.addEventListener('click', () => {
    chrome.storage.local.set({ data_collection_active: false }, () => {
      chrome.runtime.sendMessage({ type: 'stopDataCollection' });
      warningBox.style.display = 'none';
      toggle.checked = false;
      updateStatusDisplay(false);
      if (isPro) {
        showToast('Data sharing disabled. Filtering still works.');
      } else {
        showToast('@Filter™ deactivated. Re-enable data sharing to restore filtering.');
      }
    });
  });

  // Cancel — revert toggle
  btnCancel.addEventListener('click', () => {
    warningBox.style.display = 'none';
    toggle.checked = true;
    showToast('Great! Data sharing remains active.');
  });

  // View contributed data
  btnViewData.addEventListener('click', () => {
    showToast('Feature coming soon — check @Map™ for your regional data.');
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
      statusText.textContent = 'Data sharing is active';
    } else {
      statusDot.className = 'status-dot inactive';
      statusText.textContent = isPro ? 'Data sharing is paused' : '@Filter™ is inactive — enable data sharing to use';
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
