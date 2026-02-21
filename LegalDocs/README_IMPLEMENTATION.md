# @ Filter & @ Map Implementation Package

## What's Included

This package contains everything Claude Code needs to implement the @ Filter extension onboarding and @ Map consent system.

## Product Architecture

**Two-Product Model:**
- **@ Filter** = Browser extension (content filtering tool)
- **@ Map** = Data platform (global sentiment visualization)
- **Relationship:** @ Map powered by @ Filter users

**Branding Strategy:**
- **User-Facing:** "@ Filter" and "@ Map" (with @ symbol)
- **Technical:** `atfilter` and `atmap` (in code/files)

**User Journey:**
1. User installs @ Filter extension
2. Gets powerful content filtering
3. Chooses to contribute to @ Map
4. Joins global community
5. Accesses @ Map visualizations

### Files Created:

1. **IMPLEMENTATION_INSTRUCTIONS.md** - Complete step-by-step implementation guide for Claude Code
2. **BRANDING_GUIDE.md** - Critical naming convention guide (@ Filter vs atfilter)
3. **PRIVACY_POLICY.md** - Full privacy policy content (needs to be converted to HTML)
4. **TERMS_OF_SERVICE.md** - Full terms of service content (needs to be converted to HTML)
5. **This README** - Overview and usage instructions

---

## For You (Review Before Implementation)

### What You Need to Do:

**1. Review Legal Documents:**
- Open `PRIVACY_POLICY.md` and read through it
- Open `TERMS_OF_SERVICE.md` and read through it
- Make any changes you need (add your company name, address, contact info)
- Update placeholders like `[Your Company Name]`, `[Your Business Address]`, etc.

**2. Update Dates:**
In both documents, replace:
- `[Current Date]` with the actual effective date (e.g., "February 17, 2026")

**3. Update Contact Information:**
In both documents, add your actual:
- Company name
- Business address
- Email addresses (legal@atfilter.com, support@atfilter.com)
- Phone number (optional)

**4. Legal Review (Recommended):**
While I've written comprehensive policies, you should ideally have a lawyer review them before launch, especially:
- The arbitration clause
- The liability limitations
- State-specific requirements
- International provisions (GDPR, CCPA)

---

## For Claude Code (Implementation Instructions)

### How to Use This Package:

**Step 0:** Read `BRANDING_GUIDE.md` FIRST - Critical naming convention (@ Filter vs atfilter)

**Step 1:** Read `IMPLEMENTATION_INSTRUCTIONS.md` completely

**Step 2:** Convert the legal documents to HTML:
- Take `PRIVACY_POLICY.md` content → create `privacy.html`
- Take `TERMS_OF_SERVICE.md` content → create `terms.html`
- Add proper HTML structure, styling, navigation
- Make them readable and professional

**Step 3:** Follow the implementation order in IMPLEMENTATION_INSTRUCTIONS.md:
1. Create legal HTML pages
2. Build onboarding system
3. Update settings panel
4. Update background worker
5. Update manifest
6. Global search/replace
7. Testing

**Step 4:** Test everything according to the checklist

---

## Key Implementation Points

### The Model: Option A (All-In)

We're implementing the **all-in model**:
- Users MUST consent to data collection to use @ Map
- Clear explanation that data is essential to the service
- Opt-out available later in Settings (but limits features)
- No deceptive patterns - honest and transparent

### Legal Positioning

**The key legal argument:**
> "@ Map IS the data. Data collection is not a side feature - it's the core purpose. Without community data, there is no @ Map to provide. This is like saying Waze should work without location data."

**This is defensible because:**
- ✅ Value proposition is clear
- ✅ Data use is transparent
- ✅ Anonymization is real (differential privacy)
- ✅ Users get genuine value (free tool + visualizations)
- ✅ Alternative exists (uBlock Origin for privacy-focused users)

### Privacy Protection

**Must implement properly:**
- Differential privacy (minimum 100 users per data point)
- Geographic aggregation (city level, not precise)
- Temporal binning (hourly, not exact timestamps)
- Category generalization (broad categories, not specific)
- Noise injection (statistical protection)

**This is not optional - it makes the "anonymous" claim legally defensible.**

---

## What Claude Code Will Create

### New Files:
- onboarding.html (first-run experience)
- onboarding.css (styling)
- onboarding.js (logic)
- settings.html (updated settings panel)
- settings.css (styling)
- settings.js (opt-out logic)
- terms.html (Terms of Service page)
- privacy.html (Privacy Policy page)

### Modified Files:
- manifest.json (add onboarding, update name/icons)
- background.js (consent checking)
- Any files with "Q Map" → "@ Map" changes

### Assets:
- Ensures logo-icon.png is properly referenced everywhere

---

## Testing Priority

### Critical Tests:

1. **First Install Flow:**
   - Does onboarding show?
   - Can user read everything before deciding?
   - Does consent save correctly?
   - Does decline work gracefully?

2. **Consent Management:**
   - Can user opt-out in Settings?
   - Does warning show consequences clearly?
   - Does re-enabling work?
   - Is data collection actually paused?

3. **Core Functionality:**
   - Does filtering work WITH consent?
   - Does filtering work WITHOUT consent?
   - Are @ Map features disabled when opted out?

4. **Legal Documents:**
   - Are they complete and readable?
   - Do all links work?
   - Is contact info correct?
   - Are dates current?

---

## Success Criteria

Implementation is complete when:

✅ First-time users see clear onboarding  
✅ Consent is required (but explained well)  
✅ Privacy Policy and Terms are accessible  
✅ Settings allow opt-out with clear warnings  
✅ Data collection respects consent status  
✅ Filtering works regardless of consent  
✅ All @ Map branding is consistent  
✅ Logo appears throughout  
✅ No console errors  
✅ Extension installs and runs properly  

---

## Important Notes

### For You (The Human):

**Before deploying:**
1. ✅ Review legal documents carefully
2. ✅ Update all placeholders with real info
3. ✅ Consider lawyer review (especially for US/EU)
4. ✅ Test in actual browser (Chrome/Firefox)
5. ✅ Verify anonymization is implemented properly
6. ✅ Have plan for API customer vetting
7. ✅ Set up proper data infrastructure

**After deploying:**
1. Monitor for user feedback
2. Watch for browser store issues
3. Respond to privacy concerns quickly
4. Publish transparency reports (as promised)
5. Keep improving differential privacy
6. Screen API customers carefully

### For Claude Code:

**Key reminders:**
- Don't skip the differential privacy implementation
- Test opt-out thoroughly
- Make sure consent is checked before ALL data collection
- Ensure filtering works when opted out
- Keep the UX professional and trustworthy
- Follow the implementation order
- Run all tests before considering complete

---

## Support and Questions

If Claude Code encounters issues:

**Check:**
1. File paths are correct
2. Permissions are in manifest
3. Chrome storage API is available
4. No console errors
5. All dependencies are loaded

**Common Issues:**
- Onboarding not showing → Check manifest for onboarding.html
- Storage not working → Check storage permission
- Links broken → Check file paths
- Styling wrong → Check CSS file is loaded

---

## Next Steps

**For You:**
1. Review the three files in this package
2. Make any necessary edits to legal documents
3. Give final approval to Claude Code to proceed
4. Prepare logo-icon.png if not already ready

**For Claude Code:**
1. Wait for human approval
2. Read IMPLEMENTATION_INSTRUCTIONS.md thoroughly
3. Ask clarifying questions if needed
4. Begin implementation following the guide
5. Test thoroughly
6. Report completion and any issues

---

## Legal Disclaimer

While I've created comprehensive legal documents, I am not a lawyer and this is not legal advice. These documents should be reviewed by a qualified attorney before use, especially regarding:

- Specific state/country requirements
- Industry-specific regulations
- Arbitration enforceability in your jurisdiction
- GDPR/CCPA compliance verification
- Liability limitation validity

Consider this a starting point, not final legal documents.

---

**Ready to build @ Map the right way.**

**Let's create something transparent, valuable, and legally defensible.**
