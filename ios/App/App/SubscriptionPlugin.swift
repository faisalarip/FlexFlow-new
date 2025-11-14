import Foundation
import Capacitor
import StoreKit

@available(iOS 15.0, *)
@objc(SubscriptionPlugin)
public class SubscriptionPlugin: CAPPlugin {
    @objc public func getProducts(_ call: CAPPluginCall) {
        guard let ids = call.getArray("ids", String.self), !ids.isEmpty else {
            call.reject("Missing product ids")
            return
        }
        Task { [weak self] in
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
                self?.bridge?.saveCall(call)
                call.resolve(["products": mapped])
            } catch {
                call.reject("Failed to load products: \(error.localizedDescription)")
            }
        }
    }

    @objc public func purchase(_ call: CAPPluginCall) {
        guard let productId = call.getString("productId"), !productId.isEmpty else {
            call.reject("Missing productId")
            return
        }
        Task { [weak self] in
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
                        let productId = transaction.productID
                        self?.bridge?.saveCall(call)
                        call.resolve([
                            "status": "success",
                            "originalTransactionId": originalId,
                            "productId": productId
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
    }

    @objc public func restore(_ call: CAPPluginCall) {
        Task { [weak self] in
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
            self?.bridge?.saveCall(call)
            call.resolve(["entitlements": entitlements])
        }
    }
}