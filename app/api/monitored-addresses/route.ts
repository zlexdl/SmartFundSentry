// app/api/monitored-addresses/route.ts
import { NextResponse } from 'next/server';
import { getMonitoredAddresses } from '@/lib/helius';

// 获取当前监控的地址列表
export async function GET() {
  try {
    const addresses = await getMonitoredAddresses();
    
    return NextResponse.json({
      addresses
    });
  } catch (error) {
    console.error('获取监控地址失败:', error);
    return NextResponse.json(
      { error: '获取监控地址失败' },
      { status: 500 }
    );
  }
}