# Mobile @Filter Research Report
**Date:** February 20, 2026

## The Core Problem: HTTPS Encryption

@Filter works by reading the rendered DOM of web pages, scanning headline text for keywords, and hiding matching elements. On mobile, this requires access to decrypted HTML content — which HTTPS encryption blocks at the network level.

**There is no magic VPN that transparently filters HTTPS page content for keywords** without either:
- (a) MITM proxy with user-installed certificates, or
- (b) Running inside the browser's rendering engine (extensions/WebView)

---

## What a VPN Can Actually See

| Layer | Visible Data | Can Filter Keywords in HTML? |
|-------|-------------|------------------------------|
| DNS | Domain names only | No |
| TLS/SNI | Server hostname | No |
| URL (iOS 26 API) | Full URL path + query | Only if keyword appears in URL |
| HTTP body (requires MITM) | Full HTML content | Yes, but requires CA cert install |

---

## iOS Options

### Safari Web Extension (BEST PATH)
- Apple supports Safari Web Extensions that inject JS content scripts into pages — same mechanism as the current Chrome/Firefox extension
- Can read DOM, scan for keywords, hide elements
- No VPN, no MITM, no certificates needed
- Ships inside a companion iOS app (Swift/Xcode)
- Apple-approved, App Store safe
- **Limitation:** Safari only (not Chrome for iOS, not in-app browsers)
- **Timeline:** 2-3 months, 1-2 developers
- **Cost:** $10K-30K

### DNS/VPN Blocking (Supplementary Only)
- Can block entire domains but CANNOT filter individual headlines
- How Lockdown Privacy, 1Blocker DNS mode work
- Different product from @Filter's value proposition

### iOS 26 URL Filter API (New, Limited)
- Apple's new NEURLFilter can filter by full URL — system-wide, consumer devices
- Still URL-level only — cannot inspect HTML content for keywords
- Requires special entitlement, iOS 26+ only

### What's NOT Possible on iOS
- MITM HTTPS inspection (Apple blocks this on consumer devices)
- System-wide content filtering via NEFilterDataProvider (requires supervised/MDM devices)
- Safari Content Blocker rules can't do keyword-in-text matching (URL patterns + CSS selectors only)

---

## Android Options

### Option A: VPN + MITM Proxy (Most Powerful, Most Complex)
- How AdGuard works: local MITM proxy decrypts HTTPS, filters, re-encrypts
- Generates local root CA cert the user must install
- Works for browser traffic (Chrome, Edge, Samsung Internet trust user CAs)
- Does NOT work for cert-pinned apps (banking, Google apps)
- Since Android 7: apps targeting API 24+ don't trust user CAs by default
- **User friction:** Must install CA certificate manually
- **Trust barrier:** Users see you intercepting all encrypted traffic
- **Timeline:** 4-6 months, 2-3 developers, $30K-80K

### Option B: Custom Browser with WebView (RECOMMENDED)
- Build a lightweight "@Filter Browser" wrapping Android WebView
- Inject @Filter's JS filtering after page load — identical behavior to extension
- No VPN, no certificates, no policy risk
- **Trade-off:** Users must switch to your browser
- Could use Flutter InAppWebView for cross-platform (Android + iOS)
- **Timeline:** 3-4 months, 2-3 developers, $30K-60K

### Option C: Firefox for Android (Already Works!)
- Firefox manifest already has gecko_android with strict_min_version: "121.0"
- The extension should work on Firefox for Android TODAY
- Zero additional development, but limited audience (small market share)

### Accessibility Service — NOT RECOMMENDED
- Google severely restricting in 2025-2026
- Content filtering is NOT an approved use case
- High Play Store rejection risk

---

## Store Policies

### Google Play
- VPN content filtering allowed under parental control / security categories
- Must NOT block advertising (explicitly prohibited)
- Must disclose VPN usage, encrypt traffic
- VPN verification badge program launched Jan 2025

### Apple App Store
- VPN apps must use NEVPNManager and developer must be enrolled as organization (not individual)
- Safari Web Extensions are well-established and accepted
- Apple Developer Program: $99/year
- Must declare all data collection before any user action

---

## Cross-Platform Frameworks

### React Native
- Useful for app shell/UI, but core filtering must be native
- Native modules needed for VPN/network functionality

### Flutter
- Best option for custom browser approach (Flutter InAppWebView)
- Cross-platform UI with native platform channels
- Still needs native code for VPN service

### No cross-platform VPN framework exists
- Platform-specific networking code must be written natively

---

## Development Effort Estimates

| Approach | Timeline | Team Size | Cost Range |
|----------|----------|-----------|------------|
| Safari Web Extension (iOS only) | 2-3 months | 1-2 devs | $10K-30K |
| Android VPN + MITM proxy | 4-6 months | 2-3 devs | $30K-80K |
| Custom browser (Flutter, both) | 4-6 months | 2-3 devs | $30K-60K |
| Full VPN apps (both, native) | 6-12 months | 3-5 devs | $60K-150K+ |
| Safari Extension + Android VPN | 5-8 months | 2-4 devs | $40K-100K |

---

## Recommended Strategy

### Phase 1: Safari Web Extension for iOS
- Port existing content.js to Safari Web Extension
- Same JS keyword filtering logic, runs inside Safari
- Companion iOS app for settings/onboarding
- 2-3 months, lowest risk, highest value for iOS

### Phase 2: Custom Browser for Android (Flutter InAppWebView)
- Lightweight browser with @Filter's JS filtering injected
- No VPN, no certificates, no policy risk
- Position as "@Filter Browser"
- 3-4 months

### Phase 3: Supplement with DNS Blocking
- Domain-level blocking as complementary feature
- Works system-wide on both platforms
- Different from keyword filtering but adds value

---

## Key Takeaways

1. The fundamental problem is HTTPS encryption. @Filter's core feature requires access to decrypted HTML.
2. There is no magic VPN solution without MITM certificates or running inside the browser engine.
3. Safari Web Extension is the clear best path for iOS.
4. On Android, a custom browser app is the pragmatic choice (vs. VPN+MITM friction).
5. DNS/URL-level filtering is a supplement, not a replacement.
6. Apple's iOS 26 URL Filter API is promising but insufficient for keyword-in-content filtering.
7. Cross-platform frameworks help with UI but core filtering logic must be platform-native.

---

## Sources

- Android VpnService API: https://developer.android.com/reference/android/net/VpnService
- Google Play VpnService Policy: https://support.google.com/googleplay/android-developer/answer/12564964
- Apple App Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
- Apple NetworkExtension: https://developer.apple.com/documentation/networkextension
- WWDC 2025 URL Filter: https://developer.apple.com/videos/play/wwdc2025/234/
- AdGuard HTTPS Filtering: https://adguard.com/kb/general/https-filtering/what-is-https-filtering/
- AdGuard iOS: https://adguard.com/en/adguard-ios/overview.html
- DNS66: https://github.com/julian-klode/dns66
- Blokada: https://blokada.org/
- Lockdown Privacy: https://lockdownprivacy.com/
- Flutter InAppWebView: https://pub.dev/packages/flutter_inappwebview
- Apple Safari Web Extensions: https://developer.apple.com/documentation/safariservices/blocking-content-with-your-safari-web-extension
