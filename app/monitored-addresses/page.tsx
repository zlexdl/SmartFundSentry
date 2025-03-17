"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function MonitoredAddressesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [addresses, setAddresses] = useState<string[]>([]);
  const [newAddress, setNewAddress] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isRemoving, setIsRemoving] = useState<{[key: string]: boolean}>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/monitored-addresses');
      
      if (!response.ok) {
        throw new Error('获取监控地址失败');
      }
      
      const data = await response.json();
      setAddresses(data.addresses || []);
    } catch (error) {
      console.error('获取监控地址失败:', error);
      setMessage({
        type: 'error',
        text: '获取监控地址失败'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewAddress(e.target.value.trim());
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newAddress) {
      setMessage({
        type: 'error',
        text: '请输入有效的Solana地址'
      });
      return;
    }
    
    try {
      setIsAdding(true);
      setMessage(null);
      
      const response = await fetch('/api/webhook-addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ addresses: [newAddress] }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '添加地址失败');
      }
      
      // 刷新地址列表
      await fetchAddresses();
      
      setMessage({
        type: 'success',
        text: '地址已添加到监控列表'
      });
      
      setNewAddress('');
    } catch (error) {
      console.error('添加地址失败:', error);
      setMessage({
        type: 'error',
        text: `添加地址失败: ${error instanceof Error ? error.message : '未知错误'}`
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveAddress = async (address: string) => {
    try {
      setIsRemoving(prev => ({ ...prev, [address]: true }));
      setMessage(null);
      
      const response = await fetch('/api/webhook-addresses', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ addresses: [address] }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '移除地址失败');
      }
      
      // 从列表中移除地址
      setAddresses(prev => prev.filter(a => a !== address));
      
      setMessage({
        type: 'success',
        text: '地址已从监控列表移除'
      });
    } catch (error) {
      console.error('移除地址失败:', error);
      setMessage({
        type: 'error',
        text: `移除地址失败: ${error instanceof Error ? error.message : '未知错误'}`
      });
    } finally {
      setIsRemoving(prev => ({ ...prev, [address]: false }));
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
        <h1 className="text-2xl font-bold">监控地址管理</h1>
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

      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">添加监控地址</h2>
        <form onSubmit={handleAddAddress} className="mb-6">
          <div className="flex items-start">
            <div className="flex-grow mr-4">
              <input
                type="text"
                value={newAddress}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="输入Solana地址"
                disabled={isAdding}
              />
              <p className="mt-1 text-sm text-gray-500">
                输入要监控的Solana钱包地址
              </p>
            </div>
            <button
              type="submit"
              disabled={!newAddress || isAdding}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isAdding ? '添加中...' : '添加地址'}
            </button>
          </div>
        </form>

        <h2 className="text-xl font-semibold mb-4">当前监控地址</h2>
        {addresses.length === 0 ? (
          <p className="text-gray-500">暂无监控地址</p>
        ) : (
          <div className="border rounded-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    地址
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {addresses.map((address, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-normal break-words">
                      <div className="text-sm font-medium text-gray-900">
                        {address}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleRemoveAddress(address)}
                        disabled={isRemoving[address]}
                        className="text-red-600 hover:text-red-900 text-sm font-medium disabled:opacity-50"
                      >
                        {isRemoving[address] ? '移除中...' : '移除'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}