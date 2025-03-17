"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [testingHelius, setTestingHelius] = useState(false);
  const [testingTelegram, setTestingTelegram] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [settings, setSettings] = useState({
    heliusApiKey: '',
    telegramBotToken: '',
    telegramChatId: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/settings');
      
      if (!response.ok) {
        throw new Error('获取设置失败');
      }
      
      const data = await response.json();
      
      setSettings({
        heliusApiKey: data.heliusApiKey || '',
        telegramBotToken: data.telegramBotToken || '',
        telegramChatId: data.telegramChatId || ''
      });
    } catch (error) {
      console.error('获取设置失败:', error);
      setMessage({
        type: 'error',
        text: '获取设置失败'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);
      setMessage(null);
      
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });
      
      if (!response.ok) {
        throw new Error('保存设置失败');
      }
      
      setMessage({
        type: 'success',
        text: '设置已保存'
      });
    } catch (error) {
      console.error('保存设置失败:', error);
      setMessage({
        type: 'error',
        text: '保存设置失败'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const testHeliusConnection = async () => {
    try {
      setTestingHelius(true);
      setMessage(null);
      
      const response = await fetch('/api/test-webhook');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '测试连接失败');
      }
      
      setMessage({
        type: 'success',
        text: data.message
      });
    } catch (error) {
      console.error('测试Helius连接失败:', error);
      setMessage({
        type: 'error',
        text: `测试连接失败: ${error instanceof Error ? error.message : '未知错误'}`
      });
    } finally {
      setTestingHelius(false);
    }
  };

  const testTelegramNotification = async () => {
    try {
      setTestingTelegram(true);
      setMessage(null);
      
      const response = await fetch('/api/test-telegram');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '测试通知失败');
      }
      
      setMessage({
        type: 'success',
        text: data.message
      });
    } catch (error) {
      console.error('测试Telegram通知失败:', error);
      setMessage({
        type: 'error',
        text: `测试通知失败: ${error instanceof Error ? error.message : '未知错误'}`
      });
    } finally {
      setTestingTelegram(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">系统设置</h1>
        <Link href="/" className="px-4 py-2 border rounded hover:bg-gray-100">
          返回首页
        </Link>
      </div>

      {message && (
        <div
          className={`p-4 mb-6 rounded-md ${
            message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow mb-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Helius API设置</h2>
          <div className="mb-4">
            <label htmlFor="heliusApiKey" className="block text-sm font-medium text-gray-700 mb-1">
              Helius API密钥
            </label>
            <input
              type="text"
              id="heliusApiKey"
              name="heliusApiKey"
              value={settings.heliusApiKey}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="输入您的Helius API密钥"
            />
            <p className="mt-1 text-sm text-gray-500">
              从 <a href="https://helius.xyz/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">Helius.xyz</a> 获取API密钥
            </p>
          </div>
          <button
            type="button"
            onClick={testHeliusConnection}
            disabled={!settings.heliusApiKey || testingHelius || isSaving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {testingHelius ? '测试中...' : '测试Helius连接'}
          </button>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Telegram通知设置</h2>
          <div className="mb-4">
            <label htmlFor="telegramBotToken" className="block text-sm font-medium text-gray-700 mb-1">
              Telegram Bot Token
            </label>
            <input
              type="text"
              id="telegramBotToken"
              name="telegramBotToken"
              value={settings.telegramBotToken}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="输入您的Telegram Bot Token"
            />
            <p className="mt-1 text-sm text-gray-500">
              通过 <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">BotFather</a> 创建Bot并获取Token
            </p>
          </div>
          <div className="mb-4">
            <label htmlFor="telegramChatId" className="block text-sm font-medium text-gray-700 mb-1">
              Telegram Chat ID
            </label>
            <input
              type="text"
              id="telegramChatId"
              name="telegramChatId"
              value={settings.telegramChatId}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="输入您的Telegram Chat ID"
            />
            <p className="mt-1 text-sm text-gray-500">
              您可以通过向 <a href="https://t.me/userinfobot" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">@userinfobot</a> 发送消息获取您的Chat ID
            </p>
          </div>
          <button
            type="button"
            onClick={testTelegramNotification}
            disabled={!settings.telegramBotToken || !settings.telegramChatId || testingTelegram || isSaving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {testingTelegram ? '测试中...' : '测试Telegram通知'}
          </button>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isSaving ? '保存中...' : '保存设置'}
          </button>
        </div>
      </form>
    </div>
  );
}