import { createUserClient } from './supabase-server';

export interface UsageLimits {
  free: {
    generate_doc: number;
    chat: number;
    export_pdf: number;
  };
  plus: {
    generate_doc: number;
    chat: number;
    export_pdf: number;
  };
}

// Default usage limits
export const USAGE_LIMITS: UsageLimits = {
  free: {
    generate_doc: 5,    // 5 documents per month
    chat: 50,           // 50 chat messages per month
    export_pdf: 10      // 10 PDF exports per month
  },
  plus: {
    generate_doc: 1000, // 1000 documents per month
    chat: 10000,        // 10000 chat messages per month
    export_pdf: 1000    // 1000 PDF exports per month
  }
};

export async function getMonthlyUsage(workspaceId: string, event: string): Promise<number> {
  try {
    const supabase = await createUserClient();
    
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    
    const { data: events, error } = await supabase
      .from('usage_events')
      .select('qty')
      .eq('workspace_id', workspaceId)
      .eq('event', event)
      .gte('created_at', startOfMonth.toISOString());

    if (error) {
      console.error('Error fetching usage:', error);
      return 0;
    }

    return events?.reduce((sum, event) => sum + (event.qty || 0), 0) || 0;
  } catch (error) {
    console.error('Error in getMonthlyUsage:', error);
    return 0;
  }
}

export async function getCurrentPlan(workspaceId: string): Promise<'free' | 'plus'> {
  try {
    const supabase = await createUserClient();
    
    const { data: subscription, error } = await supabase
      .from('subscriptions_new')
      .select('plan')
      .eq('workspace_id', workspaceId)
      .eq('status', 'active')
      .single();

    if (error || !subscription) {
      return 'free'; // Default to free if no active subscription
    }

    return subscription.plan as 'free' | 'plus';
  } catch (error) {
    console.error('Error getting current plan:', error);
    return 'free';
  }
}

export async function assertWithinCap(
  workspaceId: string, 
  event: string, 
  cap?: number
): Promise<void> {
  try {
    const currentPlan = await getCurrentPlan(workspaceId);
    const limits = USAGE_LIMITS[currentPlan];
    const currentUsage = await getMonthlyUsage(workspaceId, event);
    
    const eventCap = cap || limits[event as keyof typeof limits];
    
    if (currentUsage >= eventCap) {
      throw new Error(
        `Monthly ${event} limit reached (${currentUsage}/${eventCap}). ` +
        `${currentPlan === 'free' ? 'Upgrade to Plus for unlimited usage.' : 'Please contact support.'}`
      );
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to check usage limits');
  }
}

export async function recordUsageEvent(
  workspaceId: string, 
  event: string, 
  qty: number = 1, 
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    const supabase = await createUserClient();
    
    const { error } = await supabase
      .from('usage_events')
      .insert({
        workspace_id: workspaceId,
        event,
        qty,
        metadata
      });

    if (error) {
      console.error('Error recording usage event:', error);
      // Don't throw error for usage tracking failures
    }
  } catch (error) {
    console.error('Error in recordUsageEvent:', error);
    // Don't throw error for usage tracking failures
  }
}

export async function getUsageSummary(workspaceId: string): Promise<{
  plan: 'free' | 'plus';
  usage: Record<string, { current: number; limit: number; percentage: number }>;
}> {
  try {
    const currentPlan = await getCurrentPlan(workspaceId);
    const limits = USAGE_LIMITS[currentPlan];
    
    const usage: Record<string, { current: number; limit: number; percentage: number }> = {};
    
    for (const [event, limit] of Object.entries(limits)) {
      const current = await getMonthlyUsage(workspaceId, event);
      const percentage = Math.round((current / limit) * 100);
      
      usage[event] = {
        current,
        limit,
        percentage: Math.min(percentage, 100)
      };
    }
    
    return {
      plan: currentPlan,
      usage
    };
  } catch (error) {
    console.error('Error getting usage summary:', error);
    throw new Error('Failed to get usage summary');
  }
}
