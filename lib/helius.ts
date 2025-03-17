// lib/helius.ts
import { createClient } from '@supabase/supabase-js'

// 初始化Supabase客户端
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Helius API相关类型
export interface HeliusWebhook {
  webhookID: string;
  wallet?: string[];
  transactionTypes?: string[];
  accountAddresses?: string[];
  webhookURL: string;
  authHeader?: string;
  txnStatus?: string[];
  encoding?: string;
  lastFullSyncTimestamp?: string;
}

// 获取Helius API密钥
export async function getHeliusApiKey(): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'helius_api_key')
      .single();

    if (error) throw error;
    return data?.value || '';
  } catch (error) {
    console.error('获取Helius API密钥失败:', error);
    return '';
  }
}

// 获取Helius Webhook ID
export async function getHeliusWebhookId(): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'helius_webhook_id')
      .single();

    if (error) throw error;
    return data?.value || '';
  } catch (error) {
    console.error('获取Helius Webhook ID失败:', error);
    return '';
  }
}

// 保存Helius API密钥
export async function saveHeliusApiKey(apiKey: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('settings')
      .upsert({ key: 'helius_api_key', value: apiKey })
      .select();

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('保存Helius API密钥失败:', error);
    return false;
  }
}

// 保存Helius Webhook ID
export async function saveHeliusWebhookId(webhookId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('settings')
      .upsert({ key: 'helius_webhook_id', value: webhookId })
      .select();

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('保存Helius Webhook ID失败:', error);
    return false;
  }
}

// 创建Helius Webhook
export async function createHeliusWebhook(webhookUrl: string): Promise<string | null> {
  try {
    const apiKey = await getHeliusApiKey();
    if (!apiKey) {
      throw new Error('Helius API密钥未配置');
    }

    const webhook = {
      webhookURL: webhookUrl,
      transactionTypes: ["ANY"],
      accountAddresses: [],
      wallet: [],
      webhookType: "enhanced"
    };

    const response = await fetch(`https://api.helius.xyz/v0/webhooks?api-key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhook),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`创建Webhook失败: ${errorText}`);
    }

    const result = await response.json();
    if (result.webhookID) {
      await saveHeliusWebhookId(result.webhookID);
      return result.webhookID;
    }
    
    return null;
  } catch (error) {
    console.error('创建Helius Webhook失败:', error);
    return null;
  }
}

// 获取已存在的Helius Webhook
export async function getHeliusWebhook(): Promise<HeliusWebhook | null> {
  try {
    const apiKey = await getHeliusApiKey();
    const webhookId = await getHeliusWebhookId();
    
    if (!apiKey || !webhookId) {
      return null;
    }

    const response = await fetch(`https://api.helius.xyz/v0/webhooks/${webhookId}?api-key=${apiKey}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        // Webhook不存在或已被删除
        return null;
      }
      const errorText = await response.text();
      throw new Error(`获取Webhook失败: ${errorText}`);
    }

    const webhook = await response.json();
    return webhook;
  } catch (error) {
    console.error('获取Helius Webhook失败:', error);
    return null;
  }
}

// 更新Helius Webhook，添加地址
export async function addAddressesToWebhook(addresses: string[]): Promise<boolean> {
  try {
    const apiKey = await getHeliusApiKey();
    const webhookId = await getHeliusWebhookId();
    
    if (!apiKey || !webhookId) {
      throw new Error('Helius配置不完整');
    }

    // 先获取当前的Webhook
    const currentWebhook = await getHeliusWebhook();
    if (!currentWebhook) {
      throw new Error('Webhook不存在');
    }

    // 准备当前的地址列表
    const currentAddresses = currentWebhook.accountAddresses || [];
    
    // 添加新地址（去重）
    const newAddresses = [...new Set([...currentAddresses, ...addresses])];
    
    // 更新Webhook
    const response = await fetch(`https://api.helius.xyz/v0/webhooks/${webhookId}?api-key=${apiKey}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...currentWebhook,
        accountAddresses: newAddresses,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`更新Webhook失败: ${errorText}`);
    }

    return true;
  } catch (error) {
    console.error('添加地址到Webhook失败:', error);
    return false;
  }
}

// 从Webhook移除地址
export async function removeAddressesFromWebhook(addresses: string[]): Promise<boolean> {
  try {
    const apiKey = await getHeliusApiKey();
    const webhookId = await getHeliusWebhookId();
    
    if (!apiKey || !webhookId) {
      throw new Error('Helius配置不完整');
    }

    // 先获取当前的Webhook
    const currentWebhook = await getHeliusWebhook();
    if (!currentWebhook) {
      throw new Error('Webhook不存在');
    }

    // 准备当前的地址列表
    const currentAddresses = currentWebhook.accountAddresses || [];
    
    // 移除指定地址
    const newAddresses = currentAddresses.filter(addr => !addresses.includes(addr));
    
    // 更新Webhook
    const response = await fetch(`https://api.helius.xyz/v0/webhooks/${webhookId}?api-key=${apiKey}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...currentWebhook,
        accountAddresses: newAddresses,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`更新Webhook失败: ${errorText}`);
    }

    return true;
  } catch (error) {
    console.error('从Webhook移除地址失败:', error);
    return false;
  }
}

// 获取交易详情
export async function getTransactionDetails(signature: string): Promise<any> {
  try {
    const apiKey = await getHeliusApiKey();
    if (!apiKey) {
      throw new Error('Helius API密钥未配置');
    }

    const response = await fetch(`https://api.helius.xyz/v0/transactions/?api-key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transactions: [signature]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`获取交易详情失败: ${errorText}`);
    }

    const data = await response.json();
    return data[0] || null;
  } catch (error) {
    console.error('获取交易详情失败:', error);
    return null;
  }
}

// 测试Helius连接
export async function testHeliusConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const apiKey = await getHeliusApiKey();
    if (!apiKey) {
      return { 
        success: false, 
        message: '未找到Helius API密钥，请先在设置页面配置' 
      };
    }

    // 获取区块链基本信息进行测试
    const response = await fetch(`https://api.helius.xyz/v0/transactions?limit=1&api-key=${apiKey}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        message: `连接测试失败: ${errorText}`
      };
    }
    
    // 连接成功
    return {
      success: true,
      message: 'Helius API连接成功！'
    };
  } catch (error) {
    return {
      success: false,
      message: `连接测试失败: ${error instanceof Error ? error.message : '未知错误'}`
    };
  }
}