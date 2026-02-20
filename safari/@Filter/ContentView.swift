// ContentView.swift
// @Filter
//
// Template — Container app for the @Filter Safari Web Extension.
// TODO: Open this file in Xcode on a Mac to compile and run.

import SwiftUI

struct ContentView: View {
    var body: some View {
        VStack(spacing: 24) {
            Spacer()

            // Logo
            Image("logo-icon")
                .resizable()
                .aspectRatio(contentMode: .fit)
                .frame(width: 100, height: 100)

            // Title
            Text("Welcome to @Filter\u2122")
                .font(.largeTitle)
                .fontWeight(.bold)
                .multilineTextAlignment(.center)

            // Subtitle
            Text("Powerful content blocking, powering @Map\u2122")
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 32)

            Divider()
                .padding(.horizontal, 40)

            // Instructions
            VStack(alignment: .leading, spacing: 12) {
                Label("Open Safari Settings", systemImage: "gear")
                Label("Tap Extensions", systemImage: "puzzlepiece.extension")
                Label("Enable @Filter\u2122", systemImage: "checkmark.circle")
                Label("Grant permissions for all websites", systemImage: "globe")
            }
            .font(.body)
            .padding(.horizontal, 32)

            // Open Safari Settings button
            Button(action: openSafariSettings) {
                Text("Open Safari Settings")
                    .fontWeight(.semibold)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(
                        LinearGradient(
                            gradient: Gradient(colors: [
                                Color(red: 0.4, green: 0.49, blue: 0.92),
                                Color(red: 0.46, green: 0.29, blue: 0.64)
                            ]),
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .foregroundColor(.white)
                    .cornerRadius(12)
            }
            .padding(.horizontal, 32)

            Spacer()

            // Version info
            Text("@Filter\u2122 v1.1")
                .font(.caption)
                .foregroundColor(.secondary)
                .padding(.bottom, 16)
        }
    }

    private func openSafariSettings() {
        #if os(iOS)
        if let url = URL(string: UIApplication.openSettingsURLString) {
            UIApplication.shared.open(url)
        }
        #elseif os(macOS)
        // TODO: On macOS, guide user to Safari > Preferences > Extensions
        if let url = URL(string: "x-apple.systempreferences:com.apple.Safari.Extensions") {
            NSWorkspace.shared.open(url)
        }
        #endif
    }
}

#if DEBUG
struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
#endif
