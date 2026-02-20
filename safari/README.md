# @Filter Safari Web Extension (iOS & macOS)

This directory contains the Safari Web Extension port of @Filter. The web extension files (JS, HTML, CSS) are ready to use. The Swift templates and Xcode project setup require a Mac.

## Directory Structure

```
safari/
├── @Filter/                          # Container app (Swift)
│   ├── ContentView.swift             # Main app screen
│   ├── Assets.xcassets/              # App icons (add via Xcode)
│   └── Info.plist                    # App config
├── @Filter Extension/                # Web extension target
│   ├── SafariWebExtensionHandler.swift  # Native message handler
│   ├── Info.plist                    # Extension config
│   └── Resources/                    # Web extension files
│       ├── manifest.json
│       ├── background.js
│       ├── content.js
│       ├── popup.html / popup.js
│       ├── onboarding.html / .css / .js
│       ├── settings.html / .css / .js
│       ├── terms.html / privacy.html
│       ├── logo-icon.png / logo-full.png / logo-at.png
│       ├── images/                   # Extension icons
│       └── _locales/                 # Future i18n
└── README.md
```

## Xcode Setup Instructions

### Prerequisites

- macOS with Xcode 15+ installed
- Apple Developer account (free or paid)
- Paid account required for App Store submission and TestFlight

### Step 1: Create the Xcode Project

1. Open Xcode
2. File > New > Project
3. Select **Multiplatform** > **Safari Extension App**
4. Configure:
   - Product Name: `@Filter`
   - Team: Your Apple Developer team
   - Organization Identifier: `com.atfilter`
   - Bundle Identifier: `com.atfilter.app`
   - Language: Swift
   - Interface: SwiftUI
5. Choose a location and create the project

### Step 2: Replace Generated Files

Xcode generates template files. Replace them with ours:

1. **Container App:**
   - Replace the generated `ContentView.swift` with `safari/@Filter/ContentView.swift`
   - Replace the generated `Info.plist` with `safari/@Filter/Info.plist`

2. **Extension Target:**
   - Replace the generated `SafariWebExtensionHandler.swift` with `safari/@Filter Extension/SafariWebExtensionHandler.swift`
   - Replace the generated extension `Info.plist` with `safari/@Filter Extension/Info.plist`

3. **Resources:**
   - Delete the generated `Resources/` folder in the extension target
   - Copy the entire `safari/@Filter Extension/Resources/` folder into the extension target
   - Make sure all files appear in the Xcode project navigator

### Step 3: Configure App Icons

1. Open `Assets.xcassets` in the `@Filter` target
2. Add app icons at required sizes:
   - iOS: 60x60 @2x, 60x60 @3x, 76x76 @2x, 83.5x83.5 @2x, 1024x1024
   - macOS: 16x16, 32x32, 128x128, 256x256, 512x512 (all @1x and @2x)
3. Use the existing `logo-icon.png` as the source and resize as needed

### Step 4: Configure Code Signing

1. Select the `@Filter` project in the navigator
2. For each target (`@Filter` and `@Filter Extension`):
   - Select the target
   - Go to **Signing & Capabilities**
   - Select your Team
   - Ensure "Automatically manage signing" is checked
   - Verify bundle identifiers:
     - App: `com.atfilter.app`
     - Extension: `com.atfilter.app.extension`

### Step 5: Build and Test

#### iOS Simulator
1. Select an iOS Simulator device from the scheme menu
2. Press Cmd+R to build and run
3. The container app opens — follow its instructions to enable the extension
4. Open Safari > Settings > Extensions > Enable @Filter
5. Browse to a news site and verify filtering works

#### macOS
1. Select "My Mac" from the scheme menu
2. Press Cmd+R to build and run
3. Safari > Settings > Extensions > Enable @Filter
4. Test on news sites

#### Physical iOS Device
1. Connect your iPhone/iPad via USB
2. Select the device from the scheme menu
3. Build and run (requires paid developer account for device testing)
4. Trust the developer certificate on device: Settings > General > Device Management

### Step 6: Test Checklist

- [ ] Extension appears in Safari Settings > Extensions
- [ ] Extension can be enabled/disabled
- [ ] Popup appears when tapping the extension icon
- [ ] Keywords can be added and saved
- [ ] Content filtering works on news sites (CNN, BBC, etc.)
- [ ] Onboarding page opens on first install
- [ ] Settings page works correctly
- [ ] Terms and Privacy pages load
- [ ] Active/inactive icon states work
- [ ] Extension works in both normal and private browsing (if permitted)

### Step 7: App Store Submission

1. Archive the project: Product > Archive
2. In the Organizer, click "Distribute App"
3. Select "App Store Connect"
4. Follow the upload wizard
5. In App Store Connect:
   - Create a new app listing
   - Add screenshots for iPhone, iPad, and Mac
   - Write description and keywords
   - Submit for review

## Key Differences from Chrome Extension

| Feature | Chrome | Safari |
|---------|--------|--------|
| API Namespace | `chrome.*` | `browser.*` |
| Background | Service Worker | Non-persistent background script |
| Periodic Tasks | `chrome.alarms` | `setTimeout` (self-rescheduling) |
| Distribution | Chrome Web Store | App Store (via container app) |
| Manifest Background | `"service_worker"` | `"scripts": [...]` |
| Promise Support | Callbacks or Promises | Promises (native) |

## Troubleshooting

**Extension not appearing in Safari:**
- Ensure the extension target is properly embedded in the app target
- Check that `NSExtensionPointIdentifier` is `com.apple.Safari.web-extension` in the extension Info.plist
- On macOS: Enable "Allow unsigned extensions" in Safari > Develop menu (for development)

**Content scripts not running:**
- Verify permissions are granted for the website
- Check Safari > Settings > Extensions > @Filter > permissions
- Ensure `manifest.json` has correct `content_scripts` configuration

**Background script issues:**
- Safari may suspend non-persistent background scripts aggressively on iOS
- The `setTimeout`-based flush scheduler re-initializes on each wake
- Check the Web Inspector console for errors (Develop > device > extension)

**Build errors:**
- Clean build folder: Product > Clean Build Folder (Cmd+Shift+K)
- Ensure deployment targets match (iOS 15.0+, macOS 12.0+)
- Verify all Resources files are included in the extension target's "Copy Bundle Resources" build phase
