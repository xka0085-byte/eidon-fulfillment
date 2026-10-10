# Eidon 后端 + 看板（一个 Worker，三件事）

一个 Cloudflare Worker（免费）同时承担：

| 能力 | 路径 | 说明 |
|---|---|---|
| **数据看板** | `/`（dashboard） | 访问量 / 交易量 / 营收 / 购买率 / 热门页 / 来源 |
| **商品管理** | `/admin.html` | 登录后增删改商品，前端店铺自动同步 |
| **订单查询** | `/admin.html` → Orders | 按 id/邮箱/姓名/状态查订单、改状态 |
| **埋点采集** | `/api/collect` | 店铺每个页面发来的 pageview / purchase |
| **商品接口** | `/api/products` | 公开 GET = 店铺实时拉商品；管理需 token |
| **订单接口** | `/api/orders` | 结账成功落单；管理查询需 token |

**数据一致性**：看板、商品、订单全部读/写同一个 D1 数据库 —— 所以后台看到的，就是前端真实发生的，不存在"对不上"。

---

## 一次性部署（约 10 分钟，免费）
需要：一个免费 Cloudflare 账号。

```bash
npm i -g wrangler
wrangler login

# 建数据库，记下输出的 id
wrangler d1 create eidon-analytics

# 把 id 填进 analytics/wrangler.toml 的 database_id
# （编辑器打开，替换 REPLACE_WITH_YOUR_D1_ID）

# 建表（events + products + orders）
wrangler d1 execute eidon-analytics --file=analytics/schema.sql

# 设置管理员密码（随便一段强随机串，比如 openssl rand -hex 16）
wrangler secret put ADMIN_TOKEN

# 部署
wrangler deploy --config analytics/wrangler.toml
```

部署后你会拿到一个网址，形如 `https://eidon-analytics.<你的子域>.workers.dev`。
这就是 **看板地址**，也是 **后台地址**（`/admin.html`），发给谁都能看（后台需密码）。

---

## 接通前端（填 3 个占位网址）
后端部署好后，把下面三处的 `YOURSUB` 换成你的 worker 子域：

1. `assets/analytics.js` → `WORKER`
2. `assets/site.js` → `API_BASE`（店铺从这拉实时商品）
3. `assets/payment.js` → `API`

没填 / 没部署时：店铺自动回退到静态 `products-data.js`，页面照常显示，不会崩。

---

## 支付网关怎么接入（3 步）
1. **PayPal**：开账户 → 开发者后台拿 **Client ID** → 填进 `checkout.html` 的 `client-id=YOUR_PAYPAL_CLIENT_ID`。
2. **Coinbase Commerce（USDC/USDT）**：建 Checkout → 拿到托管结账链接 → 填进 `assets/payment.js` 的 `COMMERCE_URL`。
3. **落单 + 看板**：买家付款成功 → `payment.js` 自动 `POST /api/orders`（进订单查询系统）并 `EidonTrack.event('purchase')`（进看板交易数）。

⚠️ 真发货前务必用 **PayPal Webhook / Commerce Webhook** 核验实际到账（前端 `onApprove` 只能证明前端流程走完，不能证明钱到账）。初期限量可先人工核对后台订单。

---

## 使用
- **看板**：打开 worker 网址 → 实时数据。
- **改商品**：打开 `worker网址/admin.html` → 输 token → Products 标签增删改；保存后前台立刻变。
- **查订单**：admin → Orders 标签 → 搜 id/邮箱/姓名/状态 → 点开改状态（paid→shipped→delivered）。

## 进真实数据前还差你填的
- [ ] 部署 worker + 填 3 个 `YOURSUB` 占位
- [ ] `wrangler secret put ADMIN_TOKEN`
- [ ] PayPal Client ID / Coinbase checkout URL
- [ ] 真实商品（可在 admin 里直接录，或继续改 products-data.js）
- [ ] 真实商品照片
