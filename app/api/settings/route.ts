// app/api/settings/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { saveHeliusApiKey, saveHeliusWebhookId, getHeliusApiKey, getHeliusWebhookId } from '@/lib/helius';
import { saveTelegramConfig, getTelegramConfig } from '@/lib/telegram';

// 初始化Supabase客户端
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// 获取设置
export async function GET() {
  try {
    // 获取Helius相关设置
    const heliusApiKey = await getHeliusApiKey();
    const heliusWebhookId = await getHeliusWebhookId();
    
    // 获取Telegram相关设置
    const { token: telegramBotToken, chatId: telegramChatId } = await getTelegramConfig();
    
    return NextResponse.json({
      heliusApiKey,
      heliusWebhookId,
      telegramBotToken,
      telegramChatId
    });
  } catch (error) {
    console.error('获取设置失败:', error);
    return NextResponse.json(
      { error: '获取设置失败' },
      { status: 500 }
    );
  }
}

// 保存设置
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { heliusApiKey, telegramBotToken, telegramChatId } = data;
    
    // 保存Helius API密钥
    if (heliusApiKey !== undefined) {
      await saveHeliusApiKey(heliusApiKey);
    }
    
    // 保存Telegram配置
    if (telegramBotToken !== undefined && telegramChatId !== undefined) {
      await saveTelegramConfig(telegramBotToken, telegramChatId);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('保存设置失败:', error);
    return NextResponse.json(
      { error: '保存设置失败' },
      { status: 500 }
    );
  }
}