// SafariWebExtensionHandler.swift
// @Filter Extension
//
// Template — Handles native messaging between the Safari extension and the container app.
// TODO: Open this file in Xcode on a Mac to compile and run.

import SafariServices
import os.log

class SafariWebExtensionHandler: NSObject, NSExtensionRequestHandling {

    func beginRequest(with context: NSExtensionContext) {
        let request = context.inputItems.first as? NSExtensionItem

        let profile: UUID?
        if #available(iOS 17.0, macOS 14.0, *) {
            profile = request?.userInfo?[SFExtensionProfileKey] as? UUID
        } else {
            profile = nil
        }

        let message: Any?
        if #available(iOS 15.0, macOS 11.0, *) {
            message = request?.userInfo?[SFExtensionMessageKey]
        } else {
            message = request?.userInfo?["message"]
        }

        os_log(.default, "[@Filter Extension] Received message from browser.runtime.sendNativeMessage(): %{public}@",
               String(describing: message))

        // TODO: Process messages from the web extension here.
        // For example, handle settings sync between the app and extension,
        // or pass native capabilities back to the JS layer.

        let response = NSExtensionItem()
        response.userInfo = [SFExtensionMessageKey: ["status": "ok"]]

        context.completeRequest(returningItems: [response], completionHandler: nil)
    }
}
