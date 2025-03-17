// lib/telegram.ts
import { createClient } from '@supabase/supabase-js'
import TelegramBot from 'node-telegram-bot-api';

// 初始化Supabase客户端
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// 获取Telegram配置
export async function getTelegramConfig(): Promise<{ token: string; chatId: string }> {
  try {
    const { data: tokenData, error: tokenError } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'telegram_bot_token')
      .single();

    const { data: chatIdData, error: chatIdError } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'telegram_chat_id')
      .single();

    if (tokenError) console.error('获取Telegram token失败:', tokenError);
    if (chatIdError) console.error('获取Telegram chat ID失败:', chatIdError);

    return {
      token: tokenData?.value || '',
      chatId: chatIdData?.value || ''
    };
  } catch (error) {
    console.error('获取Telegram配置失败:', error);
    return { token: '', chatId: '' };
  }
}

// 保存Telegram配置
export async function saveTelegramConfig(token: string, chatId: string): Promise<boolean> {
  try {
    const { error: tokenError } = await supabase
      .from('settings')
      .upsert({ key: 'telegram_bot_token', value: token })
      .select();

    const { error: chatIdError } = await supabase
      .from('settings')
      .upsert({ key: 'telegram_chat_id', value: chatId })
      .select();

    if (tokenError) throw tokenError;
    if (chatIdError) throw chatIdError;

    return true;
  } catch (error) {
    console.error('保存Telegram配置失败:', error);
    return false;
  }
}

// 发送Telegram通知
export async function sendTelegramNotification(message: string): Promise<boolean> {
  try {
    const { token, chatId } = await getTelegramConfig();
    
    if (!token || !chatId) {
      console.error('Telegram配置不完整');
      return false;
    }

    const bot = new TelegramBot(token, { polling: false });
    await bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
    
    return true;
  } catch (error) {
    console.error('发送Telegram通知失败:', error);
    return false;
  }
}

// 测试Telegram通知
export async function testTelegramNotification(): Promise<{ success: boolean; message: string }> {
  try {
    const { token, chatId } = await getTelegramConfig();
    
    if (!token) {
      return { 
        success: false, 
        message: '未找到Telegram Bot Token，请先在设置页面配置' 
      };
    }
    
    if (!chatId) {
      return { 
        success: false, 
        message: '未找到Telegram Chat ID，请先在设置页面配置' 
      };
    }

    const bot = new TelegramBot(token, { polling: false });
    await bot.sendMessage(
      chatId, 
      '<b>SmartFundSentry测试消息</b>\n\n这是一条测试消息，如果您看到此消息，说明您的Telegram通知设置正确！', 
      { parse_mode: 'HTML' }
    );
    
    return {
      success: true,
      message: 'Telegram通知测试成功！已发送测试消息到您的Telegram。'
    };
  } catch (error) {
    return {
      success: false,
      message: `Telegram通知测试失败: ${error instanceof Error ? error.message : '未知错误'}`
    };
  }
}