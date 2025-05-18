import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // 실제 회원가입 로직 (데이터베이스 저장 등) 이 위치에 구현되어야 합니다.
    // 예시: const { email, password, name } = await request.json();
    // console.log('Registering user:', { email, password, name });

    // 임시 성공 응답
    return NextResponse.json({ message: 'User registered successfully (placeholder)' }, { status: 201 });
  } catch (error) {
    console.error('[API_REGISTER_ERROR]', error);
    return NextResponse.json({ message: 'Error registering user' }, { status: 500 });
  }
} 