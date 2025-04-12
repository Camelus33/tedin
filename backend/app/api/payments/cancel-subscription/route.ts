import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { stripe } from '@/lib/stripe';

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

    // Get the user from the database
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true },
    });

    if (!user) {
      return NextResponse.json(
        { message: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // If the user doesn't have a Stripe customer ID, they don't have a subscription
    if (!user.stripeCustomerId) {
      return NextResponse.json(
        { message: '활성화된 구독이 없습니다.' },
        { status: 400 }
      );
    }

    // Get all active subscriptions for the customer
    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      status: 'active',
    });

    if (subscriptions.data.length === 0) {
      return NextResponse.json(
        { message: '취소할 수 있는 활성화된 구독이 없습니다.' },
        { status: 400 }
      );
    }

    // Cancel all active subscriptions
    for (const subscription of subscriptions.data) {
      await stripe.subscriptions.cancel(subscription.id, {
        prorate: true,
      });
    }

    // Note: We don't update the user's premium status immediately.
    // The webhook will handle that when it receives the subscription.deleted event.
    // This allows users to continue using premium until the end of their billing period.

    return NextResponse.json({
      success: true,
      message: '구독이 성공적으로 취소되었습니다. 현재 결제 주기가 끝날 때까지 프리미엄 혜택을 계속 이용하실 수 있습니다.',
    });
  } catch (error) {
    console.error('Subscription cancellation error:', error);
    return NextResponse.json(
      { message: '구독 취소 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 