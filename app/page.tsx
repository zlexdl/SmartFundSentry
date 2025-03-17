"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [addresses, setAddresses] = useState<string[]>([]);
  const [settings, setSettings] = useState({
    heliusApiKey: '',
    telegramBotToken: '',
    telegramChatId: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // 获取设置信息
      const settingsResponse = await fetch('/api/settings');
      const settingsData = await settingsResponse.json();
      
      setSettings({
        heliusApiKey: settingsData.heliusApiKey || '',
        telegramBotToken: settingsData.telegramBotToken || '',
        telegramChatId: settingsData.telegramChatId || ''
      });
      
      // 获取监控的地址列表
      const addressesResponse = await fetch('/api/monitored-addresses');
      
      if (addressesResponse.ok) {
        const addressesData = await addressesResponse.json();
        setAddresses(addressesData.addresses || []);
      } else {
        setAddresses([]);
      }
    } catch (error) {
      console.error('获取数据失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isConfigured = Boolean(
    settings.heliusApiKey && 
    settings.telegramBotToken && 
    settings.telegramChatId
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-center">SmartFundSentry</h1>
        <p className="text-center text-gray-600 mt-2">Solana链上资金动向监控系统</p>
      </header>

      {!isConfigured && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6">
          <p className="font-bold">系统尚未完成配置</p>
          <p>请先前往设置页面配置Helius API密钥和Telegram通知信息。</p>
          <Link 
            href="/settings" 
            className="mt-2 inline-block px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            前往设置
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">系统状态</h2>
          <div className="space-y-3">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${settings.heliusApiKey ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>Helius API: {settings.heliusApiKey ? '已配置' : '未配置'}</span>
            </div>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${settings.telegramBotToken && settings.telegramChatId ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>Telegram通知: {settings.telegramBotToken && settings.telegramChatId ? '已配置' : '未配置'}</span>
            </div>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${addresses.length > 0 ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              <span>监控地址: {addresses.length > 0 ? `${addresses.length}个地址` : '暂无监控地址'}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">快捷操作</h2>
          <div className="grid grid-cols-1 gap-3">
            <Link 
              href="/settings" 
              className="px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 text-center"
            >
              系统设置
            </Link>
            <Link 
              href="/smart-money" 
              className="px-4 py-3 bg-purple-600 text-white rounded hover:bg-purple-700 text-center"
            >
              智能资金追踪
            </Link>
            <Link 
              href="/monitored-addresses" 
              className="px-4 py-3 bg-green-600 text-white rounded hover:bg-green-700 text-center"
            >
              管理监控地址
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">系统说明</h2>
        <div className="prose prose-sm max-w-none">
          <p>SmartFundSentry是一个专为Solana区块链设计的资金动向监控系统，帮助用户实时跟踪重要地址的资金动向，并通过Telegram接收实时通知。</p>
          
          <h3 className="text-lg font-medium mt-4">主要功能</h3>
          <ul className="list-disc pl-5 mt-2">
            <li>监控指定Solana钱包地址的交易活动</li>
            <li>跟踪智能资金的动向和投资行为</li>
            <li>通过Telegram接收实时通知</li>
            <li>自定义配置监控参数和通知设置</li>
          </ul>
          
          <h3 className="text-lg font-medium mt-4">使用指南</h3>
          <ol className="list-decimal pl-5 mt-2">
            <li>在"系统设置"页面配置Helius API密钥和Telegram通知信息</li>
            <li>在"智能资金追踪"页面浏览和添加智能资金地址到监控列表</li>
            <li>在"管理监控地址"页面查看和管理当前监控的地址</li>
          </ol>
        </div>
      </div>

      <footer className="text-center text-gray-500 text-sm mt-12">
        <p>SmartFundSentry &copy; 2025</p>
      </footer>
    </div>
  );
}