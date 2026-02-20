# Simplification & Product Naming Precision Changes

## Overview

Complete revision to:
1. **Simplify to single free tier** - removed all references to Pro/Premium/licenses
2. **Update opt-out behavior** - entire extension deactivates (not just limits features)
3. **Fix product naming precision** - distinguish @ Filter™ (extension) from @ Map™ (platform)

---

## 1. SIMPLIFIED TO SINGLE FREE TIER

### What Was Removed:
- ❌ License key field
- ❌ Free/Pro tier selection
- ❌ User profile system
- ❌ Email collection
- ❌ Payment rails

### Current Structure:
- ✅ One user level: FREE
- ✅ No account required
- ✅ No payment processing
- ✅ API customers handled separately (offline or Stripe later)

---

## 2. OPT-OUT NOW DEACTIVATES ENTIRE EXTENSION

### Old Behavior:
**With participation:** Full features
**Without participation:** Basic filtering continues, @ Map™ features limited

### New Behavior:
**With participation:** Extension fully functional
**Without participation:** Extension becomes inactive (greyed out), content filtering deactivated

### Why:
@ Filter™ and @ Map™ fundamentally require community participation to function as a community-powered platform.

### Implementation Changes:

**IMPLEMENTATION_INSTRUCTIONS.md:**
- Product Context section: "If users opt-out... the entire @ Filter™ extension becomes inactive (greyed out)"
- Settings warning: "The entire @ Filter™ extension will be deactivated (greyed out)"
- Confirmation button changed: "I Understand - Deactivate Extension" (was "Disable Data Sharing")
- Settings.js requirements: "disable all extension functionality" on opt-out

**TERMS_OF_SERVICE.md Section 3.3:**
```
**Without Participation:**
- ⚪ @ Filter™ extension becomes inactive (greyed out)
- ⚪ Content filtering deactivated
- ⚪ @ Map™ features unavailable

**Why:** @ Filter™ and @ Map™ fundamentally require community 
participation to function. The extension operates as a 
community-powered platform.
```

**PRIVACY_POLICY.md Section 6.1:**
```
**Without Participation:**
- ⚪ @ Filter™ extension becomes inactive (greyed out)
- ⚪ Content filtering deactivated
- ⚪ @ Map™ features unavailable

**Why:** @ Filter™ and @ Map™ fundamentally require community 
participation to function as a community-powered platform.
```

---

## 3. PRODUCT NAMING PRECISION

### The Distinction:

**@ Filter™** = Browser extension users actively use
- Install, use, uninstall
- Content filtering functionality
- User-facing product

**@ Map™** = Insight platform powered by @ Filter™ data
- Global visualization
- API access
- Data analytics platform

**@ Filter™ and @ Map™** = Combined service (use when referring to both)

### Changes Made:

**TERMS_OF_SERVICE.md - 11 fixes:**

1. Section 1.1: "By installing or using **@ Filter™**" (was @ Map™)

2. Section 1.2: "Continued use of **the Service**" (was @ Map™)

3. Section 1.3: "use **@ Filter™ and @ Map™**" (was just @ Map™)

4. Section 2: Title changed to "**@ Filter™ and @ Map™**" (was "The @ Map™ Service")

5. Section 4.1: "use **@ Filter™ and @ Map™** to: Filter unwanted content (@ Filter™)" - clarified which product does what

6. Section 10.1: "stop using **@ Filter™ and @ Map™**" (was just @ Map™)

7. Section 10.3: "Your right to use **@ Filter™ and @ Map™** ends" (was just @ Map™)

8. Section 11.3: "within 30 days of first using **@ Filter™**" (was @ Map™)

9. Section 13: "By using **@ Filter™ and @ Map™**" (was just @ Map™)

10. Section 13: "use **@ Filter™ and @ Map™** responsibly" (was just @ Map™)

11. Section 15: "installing and using **@ Filter™**" (was @ Map™)

**PRIVACY_POLICY.md - 3 fixes:**

1. Section 6.4: "uninstall **@ Filter™**" (was @ Map™) - users uninstall the extension

2. Section 9: "**@ Filter™ and @ Map™** are operated from the United States" (was just @ Map™)

3. Section 6.1: Updated opt-out consequences to show **"@ Filter™ extension becomes inactive"**

---

## 4. SUMMARY OF PRODUCT USAGE RULES

### Use "@ Filter™" alone when:
- Users install/uninstall
- Users actively use the extension
- Referring to filtering functionality
- Settings and configuration
- Extension-specific features

### Use "@ Map™" alone when:
- Referring to the visualization platform
- API access and data licensing
- Global sentiment insights
- Research platform aspects

### Use "@ Filter™ and @ Map™" when:
- Welcome sections
- Combined service offerings
- Intellectual property statements
- Age requirements
- International operations
- Termination of service
- General service terms

### Use "the Service" when:
- Legal boilerplate
- Continuing after all products mentioned
- General terms and conditions

---

## 5. NO PRO TIER IN CURRENT STRUCTURE

### Current User Types:

**1. Free Users (Extension Users)**
- Install @ Filter™ extension
- Contribute to @ Map™ through community participation (opt-in by default)
- Free access to extension + visualizations
- No payment, no email, no account

**2. API Customers (Organizations)**
- Paid access to aggregated @ Map™ data
- Contract handled offline or via Stripe (future)
- Researchers, journalists, businesses
- Separate terms and pricing

### No Individual Pro/Premium Tier
- ✅ Keeps product simple
- ✅ No payment processing needed yet
- ✅ No tier management complexity
- ✅ Focus on community growth

---

## 6. KEY ARCHITECTURAL DECISIONS

### Why Opt-Out Deactivates Extension:

**Philosophy:** @ Filter™ and @ Map™ are fundamentally community-powered. Without community participation, the platform cannot function.

**User Choice:** Users can:
- Participate (default, extension works)
- Opt-out (extension deactivates)
- Uninstall (remove completely)
- Re-enable participation anytime

**Alternatives:** Users who want privacy-first filtering without data sharing should use uBlock Origin, Privacy Badger, or similar tools.

### Why Single Free Tier:

**Simplicity:** 
- No payment infrastructure needed
- No tier management
- No feature gating complexity
- Faster time to market

**Focus:**
- Grow community first
- Prove platform value
- Build API customer base
- Add Pro tier later if needed

**Revenue Model:**
- API access fees from organizations
- Keeps extension free for everyone
- Sustainable without individual subscriptions

---

## 7. FILES UPDATED

**✅ IMPLEMENTATION_INSTRUCTIONS.md**
- Removed any license/tier references (none found)
- Updated opt-out behavior to extension deactivation
- Added ™ symbols where needed

**✅ TERMS_OF_SERVICE.md**
- Fixed 11 product naming precision issues
- Updated opt-out consequences (Section 3.3)
- Clarified @ Filter™ vs @ Map™ usage throughout
- All ™ symbols already in place

**✅ PRIVACY_POLICY.md**
- Fixed 3 product naming issues
- Updated opt-out consequences (Section 6.1)
- Clarified extension vs platform distinction
- All ™ symbols already in place

---

## 8. DEVELOPER IMPLEMENTATION NOTES

When Claude Code implements this:

**Settings Panel:**
- Remove any license key input fields
- Remove any tier selection UI
- Opt-out warning: "Extension will become inactive (greyed out)"
- Confirmation button: "I Understand - Deactivate Extension"

**Background Script:**
- On opt-out: Set data_collection_active = false AND disable extension functionality
- Extension should visually grey out when inactive
- Content filtering should stop when opted out

**Onboarding:**
- No email collection
- No payment options
- Simple consent flow only
- Clear explanation that opt-out = deactivation

**No Implementation Needed:**
- License validation
- Tier checking
- Payment processing
- User accounts
- Email verification

---

## 9. BUSINESS MODEL CLARITY

### Current State:
**Free Extension → Community Participation → @ Map™ Data → API Sales → Revenue**

### User Flow:
1. User installs @ Filter™ (free)
2. User accepts Terms (opts in to community participation by default)
3. User filters content
4. Anonymous data powers @ Map™
5. Organizations pay for API access to aggregated data
6. Extension stays free for users

### Future Options:
- Add Pro tier later if needed
- Add premium features
- Add payment processing
- Keep current model working first

---

**Simplified. Precise. Ready for implementation.** ✅
