// app/api/test-webhook/route.ts
import { NextResponse } from 'next/server';
import { getHeliusApiKey, getHeliusWebhookId } from '@/lib/helius';

// 测试Helius Webhook
export async function GET() {
  try {
    // 获取API密钥和Webhook ID
    const apiKey = await getHeliusApiKey();
    const webhookId = await getHeliusWebhookId();
    
    if (!apiKey) {
      return NextResponse.json(
        { error: '未找到Helius API密钥，请先在设置页面配置' },
        { status: 400 }
      );
    }
    
    if (!webhookId) {
      return NextResponse.json(
        { message: 'Helius API密钥有效，但尚未创建Webhook。首次添加地址时将自动创建Webhook。' }
      );
    }
    
    // 获取Webhook信息
    const response = await fetch(`https://api.helius.xyz/v0/webhooks/${webhookId}?api-key=${apiKey}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: `获取Webhook信息失败: ${errorData.message || response.statusText}` },
        { status: response.status }
      );
    }
    
    const webhook = await response.json();
    
    return NextResponse.json({
      success: true,
      message: '连接Helius API成功',
      webhook: {
        id: webhook.webhookID,
        url: webhook.webhookURL,
        transactionTypes: webhook.transactionTypes,
        accountAddresses: webhook.accountAddresses,
        webhookType: webhook.webhookType
      }
    });
  } catch (error) {
    console.error('测试Helius Webhook失败:', error);
    return NextResponse.json(
      { error: '测试Helius Webhook失败' },
      { status: 500 }
    );
  }
}