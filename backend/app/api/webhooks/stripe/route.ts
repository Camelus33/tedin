import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db';
import Stripe from 'stripe';

// Calculate subscription end date based on the plan type
function calculateEndDate(startDate: Date, planType: string): Date {
  const end = new Date(startDate);
  if (planType === 'monthly') {
    end.setMonth(end.getMonth() + 1);
  } else if (planType === 'yearly') {
    end.setFullYear(end.getFullYear() + 1);
  }
  return end;
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature') as string;

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing Stripe signature' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (error: any) {
    console.error(`Webhook Error: ${error.message}`);
    return NextResponse.json(
      { error: `Webhook Error: ${error.message}` },
      { status: 400 }
    );
  }

  // Handle the event
  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      if (session.metadata?.userId && session.metadata?.planId) {
        const userId = session.metadata.userId;
        const planId = session.metadata.planId;
        
        // Create a payment record
        await db.payment.create({
          data: {
            userId,
            provider: 'stripe',
            plan: planId,
            amount: planId === 'monthly' ? 9900 : 99000,
            status: 'paid',
            startedAt: new Date(),
            endedAt: calculateEndDate(new Date(), planId),
          },
        });
        
        // Update user's premium status
        await db.user.update({
          where: { id: userId },
          data: {
            isPremium: true,
            premiumUntil: calculateEndDate(new Date(), planId),
          },
        });
      }
    } else if (event.type === 'invoice.payment_succeeded') {
      // Handle subscription renewal
      const invoice = event.data.object as Stripe.Invoice;
      const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
      
      if (subscription.metadata?.userId) {
        const userId = subscription.metadata.userId;
        const planId = subscription.items.data[0].price.nickname?.includes('yearly') ? 'yearly' : 'monthly';
        
        // Create a payment record for the renewal
        await db.payment.create({
          data: {
            userId,
            provider: 'stripe',
            plan: planId,
            amount: planId === 'monthly' ? 9900 : 99000,
            status: 'paid',
            startedAt: new Date(),
            endedAt: calculateEndDate(new Date(), planId),
          },
        });
        
        // Update user's premium status and extend the date
        await db.user.update({
          where: { id: userId },
          data: {
            isPremium: true,
            premiumUntil: calculateEndDate(new Date(), planId),
          },
        });
      }
    } else if (event.type === 'customer.subscription.deleted') {
      // Handle subscription cancellation
      const subscription = event.data.object as Stripe.Subscription;
      
      if (subscription.metadata?.userId) {
        const userId = subscription.metadata.userId;
        
        // Update user's premium status based on the current date
        // If premiumUntil is in the future, allow them to keep premium until that date
        const user = await db.user.findUnique({
          where: { id: userId },
          select: { premiumUntil: true },
        });
        
        if (user && (!user.premiumUntil || user.premiumUntil < new Date())) {
          // Premium has expired, update status
          await db.user.update({
            where: { id: userId },
            data: { isPremium: false },
          });
        }
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Error processing webhook' },
      { status: 500 }
    );
  }
} 