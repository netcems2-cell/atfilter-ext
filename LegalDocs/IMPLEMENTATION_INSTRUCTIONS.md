# @ Filter & @ Map - Implementation Instructions for Claude Code

## Overview
Implement the complete onboarding and consent system for @ Filter browser extension and @ Map platform. This includes first-run experience, settings panel, consent management, and legal documents.

**CRITICAL: Read BRANDING_GUIDE.md first** to understand the @ Filter / @ Map naming convention before writing any code.

## Product Context
@ Filter is a content filtering browser extension. @ Map is a community-powered sentiment platform that fundamentally requires essential data contribution. Collectively, our voices are heard around the globe. 

@ Filter™ users can choose to contribute anonymous filtering data to power @ Map™. Users must consent during installation. 

**Important:** If users opt-out of community participation, the entire @ Filter™ extension becomes inactive (greyed out). @ Filter™ and @ Map™ fundamentally require community participation to function.

---

## Task 1: Create Onboarding System

### 1.1 Create `onboarding.html`
**Location:** `/onboarding.html`

**Requirements:**
- Welcome screen shown on first install
- Displays @ Filter logo from `logo-icon.png`
- Explains value proposition clearly: @ Filter extension powers @ Map platform
- Shows what data is collected (and NOT collected)
- Single checkbox for Terms + Privacy Policy consent
- "Join @ Map Community" button (disabled until checkbox checked)
- "No Thanks" button that explains service cannot work without data
- Clean, modern design with gradient header

**Content sections needed:**
1. Logo and header: "Welcome to @ Filter - @ Map powered by @ Filter"
2. Tagline: "The Global Map of What We're Blocking"
3. "How It Works" - 4 bullet points explaining value exchange
4. "What We Collect (Anonymous Only)" - specific data types
5. "Why @ Map Needs Your Data" - explains community platform model
6. "Your Control" - mentions Settings panel for opt-out
7. Consent checkbox with links to Terms and Privacy
8. Action buttons

**Use the HTML structure I provided in previous response.**

### 1.2 Create `onboarding.css`
**Location:** `/onboarding.css`

**Requirements:**
- Modern, professional styling
- Gradient background (purple/blue theme)
- White card container with rounded corners
- Gradient header section
- Clear typography hierarchy
- Responsive design
- Accessible (good contrast, focus states)
- Smooth transitions

**Use the CSS I provided in previous response.**

### 1.3 Create `onboarding.js`
**Location:** `/onboarding.js`

**Requirements:**
- Enable "Join @ Map Community" button only when checkbox is checked
- On accept: Save consent to chrome.storage.local
  - `consent_given: true`
  - `consent_timestamp: Date.now()`
  - `data_collection_active: true`
  - `onboarding_complete: true`
- On decline: Show friendly message suggesting alternatives (uBlock Origin, Privacy Badger)
- Send message to background script to start/stop data collection
- Link to external privacy tech explanation page

**Use the JavaScript I provided in previous response.**

---

## Task 2: Update Settings Panel

### 2.1 Create/Update `settings.html`
**Location:** `/settings.html`

**Requirements:**
- Add "Community Participation" section
- Toggle switch: "Participate in @ Map™" (default ON - users are opted in by installation)
- Warning box (initially hidden) that shows when user tries to opt-out
- **Warning explains the entire @ Filter™ extension will be deactivated (greyed out)**
- Confirmation flow: user must explicitly confirm opt-out
- "View My Contributed Data" button
- "Request Data Deletion" button

**Important:** The default state is ON (opted in) because accepting Terms during installation = automatic consent to anonymous data participation. Opting out deactivates the entire extension as @ Filter™ and @ Map™ fundamentally require community participation.

**Label for toggle:** "Community Participation" or "Participate in @ Map™"

**Add the settings section HTML I provided in previous response.**

### 2.2 Create `settings.js`
**Location:** `/settings.js`

**Requirements:**
- Load current data_collection_active state on page load
- When toggle switched OFF: show warning (don't actually disable yet)
- **Warning explains: The entire @ Filter™ extension will be deactivated (greyed out) if you opt out. @ Filter™ and @ Map™ fundamentally require community participation to function.**
- "I Understand - Deactivate Extension" button confirms opt-out
- "Keep Contributing" button cancels
- On opt-out confirmation: Set data_collection_active to false AND disable all extension functionality
- Toast notifications for state changes
- Communicate with background script to deactivate extension

**Use the JavaScript I provided in previous response.**

### 2.3 Create `settings.css`
**Location:** `/settings.css`

**Requirements:**
- Style the toggle switch
- Style warning box (yellow/orange theme for caution)
- Style data management buttons
- Toast notification styling
- Consistent with onboarding design

---

## Task 3: Update Background Service Worker

### 3.1 Update `background.js`
**Location:** `/background.js`

**Add these functions:**

1. **On install listener**: Open onboarding.html on first install
2. **checkConsent()**: Helper function that checks if consent was given and is still active
3. **Message listener**: Handle startDataCollection and stopDataCollection messages
4. **Data collection wrapper**: Before any data collection, check consent

**Key logic:**
```javascript
// Only collect data if:
// - consent_given === true
// - data_collection_active !== false
// Always perform filtering regardless of consent
```

**Use the background.js code I provided in previous response.**

---

## Task 4: Update Manifest

### 4.1 Update `manifest.json`
**Location:** `/manifest.json`

**Changes needed:**
- Update display name to "@ Filter" (this is what users see)
- Update description: "@ Filter - powerful content blocking, powering @ Map, the global sentiment platform"
- Ensure all icon references use `logo-icon.png`
- Add appropriate permissions (storage, webRequest, webNavigation)
- Reference settings.html as options_page
- Ensure service_worker points to background.js

**Note on naming:**
- User-facing name: "@ Filter" (with space and @ symbol)
- Technical references (file names, variables): use `atfilter` (no space, no symbol)

**Use the manifest structure I provided in previous response.**

---

## Task 5: Create Legal Documents

### 5.1 Create `terms.html`
**Location:** `/terms.html`

**Content:** See TERMS_OF_SERVICE.md (I will provide this separately)

**Requirements:**
- Full HTML page with navigation back to extension
- Professional styling
- Clear section headers
- Updated effective date
- Emphasizes data contribution requirement
- Links to Privacy Policy

### 5.2 Create `privacy.html`
**Location:** `/privacy.html`

**Content:** See PRIVACY_POLICY.md (I will provide this separately)

**Requirements:**
- Full HTML page with navigation back to extension
- Professional styling
- Clear explanations of:
  - What data is collected
  - What data is NOT collected
  - How data is anonymized (differential privacy)
  - Who data is shared with (API customers)
  - User control options
- Updated effective date
- Contact information

---

## Task 6: Global Updates

### 6.1 Product Name & Branding Strategy
**Critical:** Understand the naming convention:

**User-Facing (All visible text):**
- **@ Filter** = Browser extension (with space, with @ symbol)
- **@ Map** = Data platform (with space, with @ symbol)
- Relationship: "@ Map powered by @ Filter"

**Technical (Code, files, variables):**
- **atfilter** = Use in file names, code, variables (no space, no symbol)
- **atmap** = Same principle

**Where to use @ Filter:**
- Extension display name (manifest.json "name" field)
- All onboarding text
- Settings panels
- Legal documents
- User-facing UI text

**Where to use atfilter:**
- File names (atfilter.js, atfilter.css)
- Variable names
- Function names
- DOM IDs and classes
- Comments in code

**Example:**
```javascript
// File: atfilter-background.js
console.log("@ Filter background service started"); // User might see this
const atfilterVersion = "1.0.0"; // Technical reference
```

### 6.2 Verify Logo Integration
**Action:** Ensure `logo-icon.png` is used in:
- manifest.json (all icon sizes)
- onboarding.html
- popup.html
- settings.html
- Any other UI components

---

## Task 7: Testing Checklist

### 7.1 First Install Flow
Test that:
- [ ] Onboarding page opens on first install
- [ ] Logo displays correctly
- [ ] All content sections are readable
- [ ] Checkbox must be checked to enable "Join" button
- [ ] "Join" button saves consent and closes onboarding
- [ ] "No Thanks" shows decline message with alternatives
- [ ] Links to Terms and Privacy open in new tabs

### 7.2 Settings Flow
Test that:
- [ ] Settings page loads correctly
- [ ] Toggle shows current state (should be ON for new users)
- [ ] Switching toggle OFF shows warning (doesn't disable yet)
- [ ] Confirming opt-out disables data collection
- [ ] Canceling keeps data collection ON
- [ ] Re-enabling works correctly
- [ ] Toast notifications appear

### 7.3 Data Collection Flow
Test that:
- [ ] Background script only collects data when consent is active
- [ ] Filtering still works when data collection is disabled
- [ ] Messages between components work correctly
- [ ] Storage values persist correctly

### 7.4 Legal Documents
Test that:
- [ ] Terms page loads and displays correctly
- [ ] Privacy page loads and displays correctly
- [ ] Links from onboarding work
- [ ] All sections are readable
- [ ] Contact information is present

---

## Task 8: Code Quality

### 8.1 Code Review
- [ ] All console.log statements removed or converted to conditional debugging
- [ ] No hardcoded values that should be configurable
- [ ] Error handling in place for storage operations
- [ ] Proper async/await or callback handling
- [ ] Comments for complex logic

### 8.2 User Experience
- [ ] All text is clear and professional
- [ ] No spelling or grammar errors
- [ ] Loading states handled gracefully
- [ ] Transitions are smooth
- [ ] Mobile/small screen friendly (if applicable)

---

## Implementation Order

**Recommended sequence:**
1. Start with legal documents (terms.html, privacy.html)
2. Create onboarding system (HTML, CSS, JS)
3. Update settings panel
4. Update background service worker
5. Update manifest
6. Global search/replace for naming
7. Testing and refinement

---

## Important Notes

### Data Collection Philosophy
- **Always filter content** regardless of consent status
- **Only collect analytics** when user has consented
- **Be transparent** about what data is collected and why
- **Honor opt-outs** immediately

### Legal Compliance
- Privacy Policy must be specific about data types
- Terms must clearly state data contribution is required
- Must provide easy opt-out mechanism
- Must explain consequences of opting out

### User Trust
- No dark patterns
- No hidden toggles
- Clear, honest language
- Respect user choices

---

## Files to Create/Modify

**New Files:**
- [ ] onboarding.html
- [ ] onboarding.css
- [ ] onboarding.js
- [ ] settings.html (or update existing)
- [ ] settings.css
- [ ] settings.js
- [ ] terms.html
- [ ] privacy.html

**Modified Files:**
- [ ] manifest.json
- [ ] background.js
- [ ] Any files with "Q Map" references

**Assets:**
- [ ] Verify logo-icon.png is in root directory

---

## Success Criteria

The implementation is complete when:
1. ✅ First-time users see onboarding and must consent
2. ✅ Consent is properly saved and checked
3. ✅ Settings allows opt-out with clear warnings
4. ✅ Data collection only occurs with active consent
5. ✅ Filtering works regardless of consent status
6. ✅ Legal documents are complete and accessible
7. ✅ All "@ Map" branding is consistent
8. ✅ Logo appears correctly throughout
9. ✅ No console errors
10. ✅ Extension passes basic testing checklist

---

## Questions or Issues?

If you encounter any issues during implementation:
1. Check that all file paths are correct
2. Verify chrome.storage.local is available (requires storage permission)
3. Ensure manifest.json has all required permissions
4. Test in actual Chrome/Firefox browser, not just file system
5. Check browser console for errors

---

## Additional Context

**Business Model:**
@ Map collects anonymous filtering data and provides it via API to researchers, journalists, and businesses. This is a legitimate research platform similar to Google Trends or Waze.

**Privacy Approach:**
Uses differential privacy to ensure no individual can be identified. Data is aggregated by region (minimum 100 users), time-binned to hours, and generalized to broad categories.

**User Value:**
Users get free filtering tool + ability to see global sentiment map. Researchers get valuable insights into collective online behavior.

**Legal Position:**
Data collection is essential to the service (not optional), clearly disclosed, and properly anonymized. This is positioned as a community research platform, not traditional ad-supported service.

---

End of implementation instructions.
