import { Request, Response, NextFunction } from 'express';
import { PREMIUM_FEATURES, PremiumFeature, hasFeatureAccess, isTrialExpired, insertSubscriptionAuditSchema } from '../../shared/schema.js';
import { IStorage, storage } from '../storage.js';

export class SubscriptionService {
  constructor(private storage: IStorage) {}

  // Check if user's trial has expired and update status if needed
  async checkAndUpdateTrialStatus(userId: string) {
    const user = await this.storage.getUser(userId);
    if (!user) return null;

    // If user is on free trial and trial has expired
    if (user.subscriptionStatus === 'free_trial' && isTrialExpired({ 
      subscriptionStatus: user.subscriptionStatus || 'free_trial', 
      trialEndDate: user.trialEndDate 
    })) {
      // Update user status to expired
      await this.storage.updateUser(userId, { subscriptionStatus: 'expired' });
      
      // Log the status change in audit table
      await this.storage.createSubscriptionAudit({
        userId,
        fromStatus: 'free_trial',
        toStatus: 'expired',
        reason: 'trial_expired',
        metadata: { expiredAt: new Date() }
      });

      // Return updated user
      return await this.storage.getUser(userId);
    }

    return user;
  }

  // Check if user has access to specific feature
  async checkFeatureAccess(userId: string, feature: PremiumFeature): Promise<boolean> {
    const user = await this.checkAndUpdateTrialStatus(userId);
    if (!user) return false;
    
    return hasFeatureAccess({ 
      subscriptionStatus: user.subscriptionStatus || 'expired', 
      trialEndDate: user.trialEndDate 
    }, feature);
  }

  // Get user's subscription status with trial info
  async getSubscriptionStatus(userId: string) {
    const user = await this.checkAndUpdateTrialStatus(userId);
    if (!user) return null;

    const isExpired = isTrialExpired({ 
      subscriptionStatus: user.subscriptionStatus || 'expired', 
      trialEndDate: user.trialEndDate 
    });
    const trialDaysRemaining = user.trialEndDate 
      ? Math.max(0, Math.ceil((new Date(user.trialEndDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
      : 0;

    return {
      subscriptionStatus: user.subscriptionStatus,
      trialStartDate: user.trialStartDate,
      trialEndDate: user.trialEndDate,
      trialExpired: isExpired,
      trialDaysRemaining,
      subscriptionExpiresAt: user.subscriptionExpiresAt,
      hasActiveSubscription: user.subscriptionStatus === 'active'
    };
  }

  // Upgrade user to premium
  async upgradeToPremium(userId: string, stripeSubscriptionId?: string) {
    const user = await this.storage.getUser(userId);
    if (!user) throw new Error('User not found');

    const updates: any = {
      subscriptionStatus: 'active',
      subscriptionStartDate: new Date(),
      subscriptionExpiresAt: null // Ongoing subscription
    };

    if (stripeSubscriptionId) {
      updates.stripeSubscriptionId = stripeSubscriptionId;
    }

    await this.storage.updateUser(userId, updates);

    // Log the upgrade in audit table
    await this.storage.createSubscriptionAudit({
      userId,
      fromStatus: user.subscriptionStatus || 'expired',
      toStatus: 'active',
      reason: 'upgraded_to_premium',
      metadata: { 
        upgradedAt: new Date(),
        stripeSubscriptionId 
      }
    });

    return await this.storage.getUser(userId);
  }
}

// Middleware to require premium feature access
export const requireFeatureAccess = (feature: PremiumFeature) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get user ID from authenticated user (set by authenticateToken middleware)
      const userId = (req as any).user?.id || (req as any).session?.userId || (req as any).userId;
      if (!userId) {
        return res.status(401).json({ 
          message: 'Authentication required',
          feature,
          accessDenied: true
        });
      }

      const subscriptionService = new SubscriptionService(storage as IStorage);
      
      const hasAccess = await subscriptionService.checkFeatureAccess(userId, feature);
      
      if (!hasAccess) {
        const status = await subscriptionService.getSubscriptionStatus(userId);
        return res.status(402).json({ 
          message: `Premium feature access required: ${feature}`,
          feature,
          accessDenied: true,
          subscriptionStatus: status,
          upgradeRequired: true
        });
      }

      next();
    } catch (error) {
      console.error('Feature access check failed:', error);
      res.status(500).json({ 
        message: 'Feature access check failed',
        feature,
        error: true
      });
    }
  };
};

// Helper to check feature access in routes without blocking
export const checkFeatureAccessNonBlocking = async (req: Request, feature: PremiumFeature): Promise<{
  hasAccess: boolean;
  subscriptionStatus?: any;
}> => {
  try {
    const userId = (req as any).user?.id || (req as any).session?.userId || (req as any).userId;
    if (!userId) {
      return { hasAccess: false };
    }

    const subscriptionService = new SubscriptionService(storage);
    
    const hasAccess = await subscriptionService.checkFeatureAccess(userId, feature);
    const subscriptionStatus = await subscriptionService.getSubscriptionStatus(userId);
    
    return { 
      hasAccess, 
      subscriptionStatus 
    };
  } catch (error) {
    console.error('Feature access check failed:', error);
    return { hasAccess: false };
  }
};