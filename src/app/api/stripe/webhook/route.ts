import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // TODO: Verify Stripe signature
    // const event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);

    // For now, just parse the body to get the event type
    const event = JSON.parse(body);

    console.log('Stripe webhook received:', event.type);

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionCancellation(event.data.object);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Stripe webhook error:', error);
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 });
  }
}

async function handleSubscriptionUpdate(subscription: any) {
  try {
    const supabase = createServerClient();
    
    // Extract relevant data from Stripe subscription
    const stripeCustomerId = subscription.customer;
    const stripeSubscriptionId = subscription.id;
    const status = subscription.status;
    const plan = subscription.items.data[0]?.price.lookup_key === 'plus' ? 'plus' : 'free';
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

    // Find workspace by Stripe customer ID
    const { data: existingSubscription, error: findError } = await supabase
      .from('subscriptions_new')
      .select('id, workspace_id')
      .eq('stripe_customer_id', stripeCustomerId)
      .single();

    if (findError && findError.code !== 'PGRST116') {
      console.error('Error finding subscription:', findError);
      return;
    }

    if (existingSubscription) {
      // Update existing subscription
      const { error: updateError } = await supabase
        .from('subscriptions_new')
        .update({
          stripe_subscription_id: stripeSubscriptionId,
          plan,
          status,
          current_period_end: currentPeriodEnd.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSubscription.id);

      if (updateError) {
        console.error('Error updating subscription:', updateError);
      }
    } else {
      // Create new subscription (this should rarely happen)
      console.log('Creating new subscription for customer:', stripeCustomerId);
      // You might want to create a default workspace here
    }

  } catch (error) {
    console.error('Error handling subscription update:', error);
  }
}

async function handleSubscriptionCancellation(subscription: any) {
  try {
    const supabase = createServerClient();
    
    const stripeCustomerId = subscription.customer;

    // Update subscription status to cancelled
    const { error } = await supabase
      .from('subscriptions_new')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('stripe_customer_id', stripeCustomerId);

    if (error) {
      console.error('Error cancelling subscription:', error);
    }

  } catch (error) {
    console.error('Error handling subscription cancellation:', error);
  }
}
