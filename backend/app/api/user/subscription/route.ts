import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
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
      select: {
        isPremium: true,
        premiumUntil: true,
        payments: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
          select: {
            plan: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // Check if the user's premium status is active
    const isPremium = user.isPremium && user.premiumUntil && new Date(user.premiumUntil) > new Date();
    const currentPlan = user.payments[0]?.plan || null;
    const expiresAt = user.premiumUntil || null;

    return NextResponse.json({
      isPremium,
      currentPlan,
      expiresAt,
    });
  } catch (error) {
    console.error('Subscription status error:', error);
    return NextResponse.json(
      { message: '구독 상태 확인 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 