import Foundation
import Capacitor
import StoreKit

@objc(SubscriptionPlugin)
public class SubscriptionPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "SubscriptionPlugin"
    public let jsName = "SubscriptionPlugin"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "getProducts", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "purchase", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "restore", returnType: CAPPluginReturnPromise)
    ]
    
    @objc public func getProducts(_ call: CAPPluginCall) {
        guard let ids = call.getArray("ids", String.self), !ids.isEmpty else {
            call.reject("Missing product ids")
            return
        }
        
        if #available(iOS 15.0, *) {
            Task { @MainActor in
                do {
                    let products = try await Product.products(for: ids)
                    let mapped = products.map { p in
                        return [
                            "id": p.id,
                            "displayName": p.displayName,
                            "description": p.description,
                            "price": p.displayPrice
                        ]
                    }
                    call.resolve(["products": mapped])
                } catch {
                    call.reject("Failed to load products: \(error.localizedDescription)")
                }
            }
        } else {
            call.reject("StoreKit 2 requires iOS 15.0 or later")
        }
    }

    @objc public func purchase(_ call: CAPPluginCall) {
        guard let productId = call.getString("productId"), !productId.isEmpty else {
            call.reject("Missing productId")
            return
        }
        
        if #available(iOS 15.0, *) {
            Task { @MainActor in
                do {
                    let products = try await Product.products(for: [productId])
                    guard let product = products.first else {
                        call.reject("Product not found")
                        return
                    }

                    let result = try await product.purchase()
                    switch result {
                    case .success(let verification):
                        switch verification {
                        case .verified(let transaction):
                            await transaction.finish()
                            let originalId = String(transaction.originalID)
                            let prodId = transaction.productID
                            call.resolve([
                                "status": "success",
                                "originalTransactionId": originalId,
                                "productId": prodId
                            ])
                        case .unverified(_, let error):
                            call.reject("Purchase unverified: \(error.localizedDescription)")
                        }
                    case .userCancelled:
                        call.resolve(["status": "cancelled"])
                    case .pending:
                        call.resolve(["status": "pending"])
                    @unknown default:
                        call.reject("Unknown purchase result")
                    }
                } catch {
                    call.reject("Purchase failed: \(error.localizedDescription)")
                }
            }
        } else {
            call.reject("StoreKit 2 requires iOS 15.0 or later")
        }
    }

    @objc public func restore(_ call: CAPPluginCall) {
        if #available(iOS 15.0, *) {
            Task { @MainActor in
                var entitlements: [[String: Any]] = []
                for await result in Transaction.currentEntitlements {
                    switch result {
                    case .verified(let transaction):
                        entitlements.append([
                            "productId": transaction.productID,
                            "originalTransactionId": String(transaction.originalID),
                            "expiresDate": transaction.expirationDate?.timeIntervalSince1970 ?? NSNull()
                        ])
                    case .unverified(_, _):
                        continue
                    }
                }
                call.resolve(["entitlements": entitlements])
            }
        } else {
            call.reject("StoreKit 2 requires iOS 15.0 or later")
        }
    }
}