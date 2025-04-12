import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { stripe } from '@/lib/stripe';

// Payment plans configuration
const PAYMENT_PLANS = {
  monthly: {
    id: 'price_monthly',
    interval: 'month',
  },
  yearly: {
    id: 'price_yearly',
    interval: 'year',
  },
};

export async function POST(req: NextRequest) {
  try {
    // Verify the user is authenticated
    const authResult = await verifyAuth(req);
    if (!authResult.success) {
      return NextResponse.json(
        { message: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const { userId } = authResult;
    const { planId, interval } = await req.json();

    // Validate the plan
    if (!planId || !['monthly', 'yearly'].includes(planId)) {
      return NextResponse.json(
        { message: '유효하지 않은 구독 플랜입니다.' },
        { status: 400 }
      );
    }

    // Get the user from the database
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true, stripeCustomerId: true },
    });

    if (!user) {
      return NextResponse.json(
        { message: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // Get or create Stripe customer
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: {
          userId,
        },
      });
      
      customerId = customer.id;
      
      // Update user with Stripe customer ID
      await db.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customerId },
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: PAYMENT_PLANS[planId as keyof typeof PAYMENT_PLANS].id,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/profile?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/profile/upgrade?payment=canceled`,
      metadata: {
        userId,
        planId,
      },
    });

    return NextResponse.json({ checkoutUrl: session.url });
  } catch (error) {
    console.error('Checkout creation error:', error);
    return NextResponse.json(
      { message: '결제 세션 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 