import { 
  AppStoreServerAPIClient, 
  Environment, 
  ReceiptUtility,
  SignedDataVerifier,
  TransactionHistoryRequest,
  Order,
  ProductType,
  ResponseBodyV2DecodedPayload,
  JWSTransactionDecodedPayload,
  GetTransactionHistoryVersion
} from "@apple/app-store-server-library";
import { readFileSync } from "fs";

interface AppleStoreConfig {
  privateKey: string;
  keyId: string;
  issuerId: string;
  bundleId: string;
  environment: 'sandbox' | 'production';
  appleId?: string;
}

export interface SubscriptionInfo {
  isActive: boolean;
  expiresDate?: Date;
  originalTransactionId?: string;
  productId?: string;
  autoRenewStatus?: boolean;
}

export class AppleStoreService {
  private client: AppStoreServerAPIClient;
  private verifier: SignedDataVerifier;
  private receiptUtil: ReceiptUtility;
  private config: AppleStoreConfig;

  constructor(config: AppleStoreConfig) {
    this.config = config;
    
    const environment = config.environment === 'production' 
      ? Environment.PRODUCTION 
      : Environment.SANDBOX;

    this.client = new AppStoreServerAPIClient(
      config.privateKey,
      config.keyId,
      config.issuerId,
      config.bundleId,
      environment
    );

    this.receiptUtil = new ReceiptUtility();

    const rootCAs = this.loadAppleRootCAs();
    const appleIdNum = config.appleId ? parseInt(config.appleId, 10) : undefined;
    this.verifier = new SignedDataVerifier(
      rootCAs,
      true,
      environment,
      config.bundleId,
      appleIdNum
    );
  }

  private loadAppleRootCAs(): Buffer[] {
    const rootCAG3 = `-----BEGIN CERTIFICATE-----
MIICQzCCAcmgAwIBAgIILcX8iNLFS5UwCgYIKoZIzj0EAwMwZzEbMBkGA1UEAwwS
QXBwbGUgUm9vdCBDQSAtIEczMSYwJAYDVQQLDB1BcHBsZSBDZXJ0aWZpY2F0aW9u
IEF1dGhvcml0eTETMBEGA1UECgwKQXBwbGUgSW5jLjELMAkGA1UEBhMCVVMwHhcN
MTQwNDMwMTgxOTA2WhcNMzkwNDMwMTgxOTA2WjBnMRswGQYDVQQDDBJBcHBsZSBS
b290IENBIC0gRzMxJjAkBgNVBAsMHUFwcGxlIENlcnRpZmljYXRpb24gQXV0aG9y
aXR5MRMwEQYDVQQKDApBcHBsZSBJbmMuMQswCQYDVQQGEwJVUzB2MBAGByqGSM49
AgEGBSuBBAAiA2IABJjpLz1AcqTtkyJygRMc3RCV8cWjTnHcFBbZDuWmBSp3ZHtf
TjjTuxxEtX/1H7YyYl3J6YRbTzBPEVoA/VhYDKX1DyxNB0cTddqXl5dvMVztK517
IDvYuVTZXpmkOlEKMaNCMEAwHQYDVR0OBBYEFLuw3qFYM4iapIqZ3r6966/ayySr
MA8GA1UdEwEB/wQFMAMBAf8wDgYDVR0PAQH/BAQDAgEGMAoGCCqGSM49BAMDA2gA
MGUCMQCD6cHEFl4aXTQY2e3v9GwOAEZLuN+yRhHFD/3meoyhpmvOwgPUnPWTxnS4
at+qIxUCMG1mihDK1A3UT82NQz60imOlM27jbdoXt2QfyFMm+YhidDkLF1vLUagM
6BgD56KyKA==
-----END CERTIFICATE-----`;

    const rootCAG2 = `-----BEGIN CERTIFICATE-----
MIIEuzCCA6OgAwIBAgIBAjANBgkqhkiG9w0BAQUFADBiMQswCQYDVQQGEwJVUzET
MBEGA1UEChMKQXBwbGUgSW5jLjEmMCQGA1UECxMdQXBwbGUgQ2VydGlmaWNhdGlv
biBBdXRob3JpdHkxFjAUBgNVBAMTDUFwcGxlIFJvb3QgQ0EwHhcNMDYwNDI1MjE0
MDM2WhcNMzUwMjA5MjE0MDM2WjBiMQswCQYDVQQGEwJVUzETMBEGA1UEChMKQXBw
bGUgSW5jLjEmMCQGA1UECxMdQXBwbGUgQ2VydGlmaWNhdGlvbiBBdXRob3JpdHkx
FjAUBgNVBAMTDUFwcGxlIFJvb3QgQ0EwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAw
ggEKAoIBAQDkkakJH5HbHkdQ6wXtXnmELes2oldMVeyLGYne+Uts9QerIjAC6Bg+
+FAJ039BqJj50cpmnCRrEdCju+QbKsMflZ56DKRHi1vUFjczy8QPTc4UadHJGXL1
XQ7Vf1+b8iUDulWPTV0N8WQ1IxVLFVkds5T39pyez1C6wVhQZ48ItCD3y6wsIG9w
tj8BMIy3Q88PnT3zK0koGsj+zrW5DtleHNbLPbU6rfQPDgCSC7EhFi501TwN22IW
q6NxkkdTVcGvL0Gz+PvjcM3mo0xFfh9Ma1CWQYnEdGILEINBhzOKgbEwWOxaBDKM
aLOPHd5lc/9nXmW8Sdh2nzMUZaF3lMktAgMBAAGjggF6MIIBdjAOBgNVHQ8BAf8E
BAMCAQYwDwYDVR0TAQH/BAUwAwEB/zAdBgNVHQ4EFgQUK9BpR5R2Cf70a40uQKb3
R01/CF4wHwYDVR0jBBgwFoAUK9BpR5R2Cf70a40uQKb3R01/CF4wggERBgNVHSAE
ggEIMIIBBDCCAQAGCSqGSIb3Y2QFATCB8jAqBggrBgEFBQcCARYeaHR0cHM6Ly93
d3cuYXBwbGUuY29tL2FwcGxlY2EvMIHDBggrBgEFBQcCAjCBthqBs1JlbGlhbmNl
IG9uIHRoaXMgY2VydGlmaWNhdGUgYnkgYW55IHBhcnR5IGFzc3VtZXMgYWNjZXB0
YW5jZSBvZiB0aGUgdGhlbiBhcHBsaWNhYmxlIHN0YW5kYXJkIHRlcm1zIGFuZCBj
b25kaXRpb25zIG9mIHVzZSwgY2VydGlmaWNhdGUgcG9saWN5IGFuZCBjZXJ0aWZp
Y2F0aW9uIHByYWN0aWNlIHN0YXRlbWVudHMuMA0GCSqGSIb3DQEBBQUAA4IBAQBc
NplMLXi37Yyb3PN3m/J20ncwT8EfhYOFG5k9RzfyqZtAjizUsZAS2L70c5vu0mQP
y3lPNNiiPvl4/2vIB+x9OYOLUyDTOMSxv5pPCmv/K/xZpwUJfBdAVhEedNO3iyM7
R6PVbyTi69G3cN8PReEnyvFteO3ntRcXqNx+IjXKJdXZD9Zr1KIkIxH3oayPc4Fg
xhtbCS+SsvhESPBgOJ4V9T0mZyCKM2r3DYLP3uujL/lTaltkwGMzd/c6ByxW69oP
IQ7aunMZT7XZNn/Bh1XZp5m5MkL72NVxnn6hUrcbvZNCJBIqxw8dtk2cXmPIS4AX
UKqK1drk/NAJBzewdXUh
-----END CERTIFICATE-----`;

    return [
      Buffer.from(rootCAG3, 'utf8'),
      Buffer.from(rootCAG2, 'utf8')
    ];
  }

  async verifyReceipt(receipt: string): Promise<SubscriptionInfo> {
    try {
      const transactionId = this.receiptUtil.extractTransactionIdFromAppReceipt(receipt);
      
      if (!transactionId) {
        throw new Error('Unable to extract transaction ID from receipt');
      }

      return await this.getSubscriptionStatus(transactionId);
    } catch (error) {
      console.error('Error verifying receipt:', error);
      throw new Error('Invalid receipt');
    }
  }

  async getSubscriptionStatus(originalTransactionId: string): Promise<SubscriptionInfo> {
    try {
      const request: TransactionHistoryRequest = {
        sort: Order.DESCENDING,
        revoked: false,
        productTypes: [ProductType.AUTO_RENEWABLE]
      };

      const response = await this.client.getTransactionHistory(
        originalTransactionId,
        null,
        request,
        GetTransactionHistoryVersion.V2
      );

      if (!response.signedTransactions || response.signedTransactions.length === 0) {
        return { isActive: false };
      }

      const latestTransaction = await this.decodeTransaction(
        response.signedTransactions[0]
      );

      const expiresDate = latestTransaction.expiresDate 
        ? new Date(latestTransaction.expiresDate) 
        : undefined;

      const isActive = expiresDate ? expiresDate > new Date() : false;

      return {
        isActive,
        expiresDate,
        originalTransactionId: latestTransaction.originalTransactionId,
        productId: latestTransaction.productId,
        autoRenewStatus: true
      };
    } catch (error) {
      console.error('Error getting subscription status:', error);
      throw new Error('Failed to get subscription status');
    }
  }

  private async decodeTransaction(signedTransaction: string): Promise<JWSTransactionDecodedPayload> {
    return await this.verifier.verifyAndDecodeTransaction(signedTransaction);
  }

  async verifyAndDecodeNotification(signedPayload: string): Promise<ResponseBodyV2DecodedPayload> {
    try {
      return await this.verifier.verifyAndDecodeNotification(signedPayload);
    } catch (error) {
      console.error('Error verifying notification:', error);
      throw new Error('Invalid notification payload');
    }
  }

  async handleNotification(notification: ResponseBodyV2DecodedPayload): Promise<{
    userId?: string;
    action: 'renewed' | 'expired' | 'cancelled' | 'refunded' | 'unknown';
    originalTransactionId?: string;
  }> {
    const notificationType = notification.notificationType;
    const subtype = notification.subtype;
    const data = notification.data;

    const originalTransactionId = data?.signedTransactionInfo 
      ? (await this.decodeTransaction(data.signedTransactionInfo)).originalTransactionId
      : undefined;

    switch (notificationType) {
      case 'DID_RENEW':
        return {
          action: 'renewed',
          originalTransactionId
        };
      
      case 'EXPIRED':
        return {
          action: 'expired',
          originalTransactionId
        };
      
      case 'DID_CHANGE_RENEWAL_STATUS':
        if (subtype === 'AUTO_RENEW_DISABLED') {
          return {
            action: 'cancelled',
            originalTransactionId
          };
        }
        break;
      
      case 'REFUND':
        return {
          action: 'refunded',
          originalTransactionId
        };
    }

    return {
      action: 'unknown',
      originalTransactionId
    };
  }
}

export function createAppleStoreService(): AppleStoreService | null {
  try {
    const privateKey = process.env.APPLE_PRIVATE_KEY;
    const keyId = process.env.APPLE_KEY_ID;
    const issuerId = process.env.APPLE_ISSUER_ID;
    const bundleId = process.env.APPLE_BUNDLE_ID;
    const environment = (process.env.APPLE_ENVIRONMENT || 'sandbox') as 'sandbox' | 'production';
    const appleId = process.env.APPLE_APP_ID;

    if (!privateKey || !keyId || !issuerId || !bundleId) {
      console.warn('Apple App Store credentials not configured. Subscription features will be limited.');
      return null;
    }

    return new AppleStoreService({
      privateKey,
      keyId,
      issuerId,
      bundleId,
      environment,
      appleId
    });
  } catch (error) {
    console.error('Failed to initialize Apple Store service:', error);
    return null;
  }
}
