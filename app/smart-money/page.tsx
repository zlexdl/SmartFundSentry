"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

// 智能资金列表（示例数据）
const SMART_MONEY_ADDRESSES = [
  {
    address: 'FZLcJWN6X6X4DFzn97YT5jMQR8ZYKzkSreHT8DHMYGcB',
    label: 'Alameda Research',
    description: '专注于加密货币交易和流动性提供的投资公司'
  },
  {
    address: 'EsgSUx7XcFxBTUjmYMNMFyuCGmXPPR8YzFG1hQZDK4XL',
    label: 'Jump Crypto',
    description: '专注于加密货币市场的全球交易公司'
  },
  {
    address: 'DYeNRU3BktPQvGYo5gKCW9mcpTHX1TocuJP7vLaWFqZW',
    label: 'Multicoin Capital',
    description: '专注于区块链和加密货币的著名风险投资公司'
  },
  {
    address: 'CKcEkNNTPCU7hZxfQkT8RJ3G9jQmzJQtWBZTRMU9DxW5',
    label: 'Pantera Capital',
    description: '最早的专注于比特币的美国风险投资公司之一'
  },
  {
    address: 'J7RagMKwSD5zJSbRQZU56ypHUtux8LRDkUpAPSKH4WPB',
    label: 'Solana Foundation',
    description: 'Solana区块链网络的官方基金会'
  }
];

export default function SmartMoneyPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState<{[key: string]: boolean}>({});
  const [monitoredAddresses, setMonitoredAddresses] = useState<string[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMonitoredAddresses();
  }, []);

  const fetchMonitoredAddresses = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/monitored-addresses');
      
      if (!response.ok) {
        throw new Error('获取监控地址失败');
      }
      
      const data = await response.json();
      setMonitoredAddresses(data.addresses || []);
    } catch (error) {
      console.error('获取监控地址失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleAddToMonitoring = async (address: string) => {
    try {
      setIsAdding(prev => ({ ...prev, [address]: true }));
      setMessage(null);
      
      const response = await fetch('/api/webhook-addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ addresses: [address] }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '添加地址失败');
      }
      
      // 更新监控地址列表
      setMonitoredAddresses(prev => [...prev, address]);
      
      setMessage({
        type: 'success',
        text: '地址已添加到监控列表'
      });
    } catch (error) {
      console.error('添加地址失败:', error);
      setMessage({
        type: 'error',
        text: `添加地址失败: ${error instanceof Error ? error.message : '未知错误'}`
      });
    } finally {
      setIsAdding(prev => ({ ...prev, [address]: false }));
    }
  };

  // 过滤智能资金列表
  const filteredAddresses = SMART_MONEY_ADDRESSES.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    return (
      item.address.toLowerCase().includes(searchLower) ||
      item.label.toLowerCase().includes(searchLower) ||
      item.description.toLowerCase().includes(searchLower)
    );
  });

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
        <h1 className="text-2xl font-bold">智能资金追踪</h1>
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
        <h2 className="text-xl font-semibold mb-4">智能资金地址</h2>
        
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="搜索智能资金地址、名称或描述"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <svg
                className="h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            搜索Solana上的主要智能资金和机构地址
          </p>
        </div>
        
        <div className="overflow-hidden border rounded-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  名称
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  地址
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  描述
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAddresses.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.label}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 truncate max-w-[200px]" title={item.address}>
                      {item.address}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">{item.description}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {monitoredAddresses.includes(item.address) ? (
                      <span className="text-green-600 text-sm font-medium">已监控</span>
                    ) : (
                      <button
                        onClick={() => handleAddToMonitoring(item.address)}
                        disabled={isAdding[item.address]}
                        className="text-blue-600 hover:text-blue-900 text-sm font-medium disabled:opacity-50"
                      >
                        {isAdding[item.address] ? '添加中...' : '添加到监控'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {filteredAddresses.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                    未找到匹配的智能资金地址
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <p className="mt-4 text-sm text-gray-500">
          注: 此列表仅供参考，可能不完全准确。您也可以在"监控地址"页面手动添加自定义地址。
        </p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">什么是智能资金？</h2>
        <div className="prose prose-sm max-w-none">
          <p>
            智能资金（Smart Money）指的是在加密货币市场中具有丰富经验和洞察力的投资者、机构或鲸鱼账户。
            这些投资者通常能够预测市场走势，他们的投资行为可以作为市场潜在趋势的指标。
          </p>
          
          <p className="mt-2">
            跟踪智能资金的投资行为可以帮助您：
          </p>
          
          <ul className="list-disc pl-5 mt-2">
            <li>了解行业内顶级投资者的投资动向</li>
            <li>发现新兴的有潜力的项目</li>
            <li>识别市场中可能的趋势转变</li>
            <li>学习专业投资者的投资策略</li>
          </ul>
          
          <p className="mt-2">
            通过添加这些地址到监控列表，您可以在智能资金发生重大资金动向时收到实时通知。
          </p>
        </div>
      </div>
    </div>
  );
}