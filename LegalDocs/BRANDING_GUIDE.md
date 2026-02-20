# @ Filter & @ Map Branding Guide

## CRITICAL: Naming Convention

### User-Facing (What People See)
**Always use the @ symbol in these contexts:**

✅ **@ Filter** (with space)
- Extension display name in manifest.json
- All onboarding screens and popups
- Settings panels
- Legal documents (Privacy Policy, Terms)
- Marketing materials
- Help text and tooltips
- Error messages users see
- Browser extension store listings

✅ **@ Map** (with space)
- Platform name everywhere
- Visualizations
- API documentation (user-facing parts)
- All references to the data platform

### Technical (Code & Files)
**Use lowercase without @ symbol:**

✅ **atfilter** (no space, no symbol)
- File names: `atfilter.js`, `atfilter-background.js`
- Variable names: `atfilterSettings`, `atfilterVersion`
- Function names: `initAtfilter()`, `atfilterCollectData()`
- CSS classes: `.atfilter-container`, `#atfilter-toggle`
- DOM IDs: `atfilter-consent`, `atfilter-settings`
- Database table names
- API endpoint paths (if internal)

✅ **atmap** (no space, no symbol)
- Same rules as atfilter
- File names: `atmap-api.js`
- Variables: `atmapData`, `atmapEndpoint`

## Examples

### ✅ CORRECT:

**manifest.json:**
```json
{
  "name": "@ Filter",
  "description": "@ Filter - powerful content blocking, powering @ Map"
}
```

**onboarding.html:**
```html
<h1>Welcome to @ Filter</h1>
<p>@ Map powered by @ Filter</p>
```

**JavaScript:**
```javascript
// File: atfilter-consent.js
const atfilterConsent = {
  given: false,
  timestamp: null
};

function showAtfilterWelcome() {
  console.log("@ Filter: Showing welcome screen"); // User might see this
}
```

**CSS:**
```css
/* File: atfilter-styles.css */
.atfilter-container {
  /* Container for @ Filter UI */
}
```

### ❌ WRONG:

**Don't use @ in technical contexts:**
```javascript
// ❌ Don't do this
const @filterData = {};
function init@Filter() {}
```

**Don't use plain text in user-facing:**
```html
<!-- ❌ Don't do this -->
<h1>Welcome to ATFilter</h1>
<h1>Welcome to atfilter</h1>
```

## The Pattern

**Simple rule:**
- **Can a human user see it?** → Use **@ Filter** or **@ Map**
- **Is it in code/files/backend?** → Use **atfilter** or **atmap**

## Why This Matters

**Brand Recognition:**
- @ Filter + @ Map = cohesive family
- The @ symbol becomes the brand signature
- Distinctive and memorable

**Technical Compatibility:**
- @ symbol causes issues in:
  - JavaScript variable names
  - CSS selectors
  - File naming
  - URLs
  - Many programming contexts

**Trademark Protection:**
- Filing for "@ FILTER" and "@ MAP"
- User-facing materials establish the brand
- Technical names don't matter for trademark

## Quick Reference

| Context | Extension Name | Platform Name |
|---------|---------------|---------------|
| **What users see** | @ Filter | @ Map |
| **Code/files** | atfilter | atmap |
| **manifest.json "name"** | @ Filter | N/A |
| **File names** | atfilter-*.js | atmap-*.js |
| **Variables** | atfilter* | atmap* |
| **CSS classes** | .atfilter-* | .atmap-* |
| **Console logs (visible)** | @ Filter | @ Map |
| **Comments in code** | Either OK | Either OK |

---

**When in doubt:** If it appears in the UI or users might see it, use @ Filter / @ Map. Otherwise use atfilter / atmap.
