// app/api/webhook-addresses/route.ts
import { NextResponse } from 'next/server';
import { addAddressesToWebhook, removeAddressesFromWebhook } from '@/lib/helius';

// 添加地址到webhook
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { addresses } = data;
    
    if (!addresses || !Array.isArray(addresses) || addresses.length === 0) {
      return NextResponse.json(
        { error: '未提供有效的地址' },
        { status: 400 }
      );
    }
    
    const success = await addAddressesToWebhook(addresses);
    
    if (!success) {
      return NextResponse.json(
        { error: '添加地址到webhook失败' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('添加地址到webhook失败:', error);
    return NextResponse.json(
      { error: '添加地址到webhook失败' },
      { status: 500 }
    );
  }
}

// 从webhook移除地址
export async function DELETE(request: Request) {
  try {
    const data = await request.json();
    const { addresses } = data;
    
    if (!addresses || !Array.isArray(addresses) || addresses.length === 0) {
      return NextResponse.json(
        { error: '未提供有效的地址' },
        { status: 400 }
      );
    }
    
    const success = await removeAddressesFromWebhook(addresses);
    
    if (!success) {
      return NextResponse.json(
        { error: '从webhook移除地址失败' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('从webhook移除地址失败:', error);
    return NextResponse.json(
      { error: '从webhook移除地址失败' },
      { status: 500 }
    );
  }
}