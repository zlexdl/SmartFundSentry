// app/api/test-telegram/route.ts
import { NextResponse } from 'next/server';
import { testTelegramNotification } from '@/lib/telegram';

// 测试Telegram通知
export async function GET() {
  try {
    const result = await testTelegramNotification();
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ success: true, message: result.message });
  } catch (error) {
    console.error('测试Telegram通知失败:', error);
    return NextResponse.json(
      { error: '测试Telegram通知失败' },
      { status: 500 }
    );
  }
}