'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const checkbox = document.getElementById('consent-checkbox');
  const btnJoin = document.getElementById('btn-join');
  const btnDecline = document.getElementById('btn-decline');
  const btnContinue = document.getElementById('btn-continue-without');
  const declineMessage = document.getElementById('decline-message');
  const buttonGroup = document.querySelector('.button-group');

  // Toggle "Join" button based on checkbox state
  checkbox.addEventListener('change', () => {
    btnJoin.disabled = !checkbox.checked;
  });

  // Accept: save consent and start data collection
  btnJoin.addEventListener('click', () => {
    chrome.storage.local.set({
      consent_given: true,
      consent_timestamp: Date.now(),
      data_collection_active: true,
      onboarding_complete: true,
    }, () => {
      // Notify background to start data collection
      chrome.runtime.sendMessage({ type: 'startDataCollection' });
      // Close onboarding tab
      window.close();
    });
  });

  // Decline: show alternatives message
  btnDecline.addEventListener('click', () => {
    buttonGroup.style.display = 'none';
    document.querySelector('.consent-section').style.display = 'none';
    declineMessage.style.display = 'block';
  });

  // Continue without data sharing
  btnContinue.addEventListener('click', () => {
    chrome.storage.local.set({
      consent_given: false,
      data_collection_active: false,
      onboarding_complete: true,
    }, () => {
      window.close();
    });
  });
});
