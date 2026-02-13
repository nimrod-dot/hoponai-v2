// src/lib/plans.ts

export type PlanTier = 'trial' | 'pro' | 'enterprise';

export interface PlanLimits {
  maxUsers: number;
  maxWalkthroughs: number;
  maxAIRuns: number; // per month
  analytics: 'basic' | 'advanced' | 'custom';
  support: 'community' | 'priority' | 'dedicated';
  sso: boolean;
  branding: 'hoponai' | 'custom' | 'white-label';
}

export const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
  trial: {
    maxUsers: 5,
    maxWalkthroughs: 2,
    maxAIRuns: 5,
    analytics: 'basic',
    support: 'community',
    sso: false,
    branding: 'hoponai',
  },
  pro: {
    maxUsers: 100,
    maxWalkthroughs: -1, // unlimited
    maxAIRuns: 100,
    analytics: 'advanced',
    support: 'priority',
    sso: false, // available as add-on
    branding: 'custom',
  },
  enterprise: {
    maxUsers: -1, // unlimited
    maxWalkthroughs: -1,
    maxAIRuns: -1,
    analytics: 'custom',
    support: 'dedicated',
    sso: true,
    branding: 'white-label',
  },
};

export function canPerformAction(
  currentPlan: PlanTier,
  action: 'create_walkthrough' | 'add_user' | 'run_ai_training',
  currentCount: number
): { allowed: boolean; reason?: string } {
  const limits = PLAN_LIMITS[currentPlan];

  switch (action) {
    case 'create_walkthrough':
      if (limits.maxWalkthroughs === -1) return { allowed: true };
      if (currentCount >= limits.maxWalkthroughs) {
        return {
          allowed: false,
          reason: `You've reached your limit of ${limits.maxWalkthroughs} walkthroughs. Upgrade to Pro for unlimited walkthroughs.`,
        };
      }
      return { allowed: true };

    case 'add_user':
      if (limits.maxUsers === -1) return { allowed: true };
      if (currentCount >= limits.maxUsers) {
        return {
          allowed: false,
          reason: `You've reached your limit of ${limits.maxUsers} users. Upgrade to add more team members.`,
        };
      }
      return { allowed: true };

    case 'run_ai_training':
      if (limits.maxAIRuns === -1) return { allowed: true };
      if (currentCount >= limits.maxAIRuns) {
        return {
          allowed: false,
          reason: `You've used all ${limits.maxAIRuns} AI training runs this month. Upgrade to Pro for 100 runs/month or Enterprise for unlimited.`,
        };
      }
      return { allowed: true };

    default:
      return { allowed: false, reason: 'Unknown action' };
  }
}

export function getPlanPrice(plan: PlanTier, isAnnual: boolean = false): string {
  switch (plan) {
    case 'trial':
      return '$0';
    case 'pro':
      const monthlyPrice = 12;
      const annualPrice = Math.round(monthlyPrice * 0.8); // 20% discount
      return isAnnual ? `$${annualPrice}` : `$${monthlyPrice}`;
    case 'enterprise':
      return 'Custom';
    default:
      return '$0';
  }
}