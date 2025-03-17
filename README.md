# SmartFundSentry

Solana智能资金监控系统

## 项目描述

SmartFundSentry是一个用于监控Solana区块链上的"聪明钱"(Smart Money)钱包地址的工具。它可以帮助用户追踪特定钱包的交易活动，并通过Telegram接收实时通知。

## 主要功能

- 通过Helius API监控指定的Solana钱包地址
- 实时接收交易通知并通过Telegram发送提醒
- 管理"聪明钱"钱包地址列表
- 查看历史交易记录
- 简单易用的设置界面

## 技术栈

- 前端：Next.js 14, React, TypeScript, Tailwind CSS
- 数据存储：Supabase
- API：Helius.xyz (Solana交易数据), Telegram Bot API (通知)

## 部署说明

### 前提条件

在部署前，您需要准备以下内容：

1. [Supabase](https://supabase.com/) 账户和项目
2. [Helius](https://helius.xyz/) API密钥
3. [Telegram Bot](https://core.telegram.org/bots#how-do-i-create-a-bot) Token和Chat ID

### 一键部署到Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fzlexdl%2FSmartFundSentry)

1. 点击上方按钮，使用Vercel部署
2. 配置以下环境变量：
   - `NEXT_PUBLIC_SUPABASE_URL`: 您的Supabase项目URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: 您的Supabase匿名密钥

### 部署后设置

1. 访问您的应用URL
2. 转到"设置"页面配置：
   - Helius API密钥
   - Telegram Bot Token和Chat ID
3. 测试连接
4. 添加要监控的"聪明钱"地址

## 数据库设置

在Supabase中创建以下表格：

1. `settings` 表
```sql
create table public.settings (
  id uuid not null default uuid_generate_v4(),
  key text not null,
  value text,
  created_at timestamp with time zone not null default now(),
  primary key (id),
  unique (key)
);
```

2. `smart_money` 表
```sql
create table public.smart_money (
  id uuid not null default uuid_generate_v4(),
  name text,
  address text not null,
  description text,
  created_at timestamp with time zone not null default now(),
  primary key (id),
  unique (address)
);
```

3. `transactions` 表
```sql
create table public.transactions (
  id uuid not null default uuid_generate_v4(),
  transaction_id text not null,
  wallet_address text not null,
  amount_sol numeric not null default 0,
  type text,
  timestamp timestamp with time zone not null default now(),
  details jsonb,
  primary key (id),
  unique (transaction_id, wallet_address)
);
```

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 许可

MIT