# Eidon Analytics — 独立数据看板

一个**完全属于你、免费、单独网址**的电商数据看板。展示每日真实数据：
**访问量 (Visits) · 交易量 (Transactions) · 营收 (Revenue) · 购买率 (Conversion) · 热门页面 · 来源**。

技术：Cloudflare Workers + D1 (SQLite)。无需自建服务器，免费额度足够小店用。

## 架构
- `worker.js`：采集接口 `/api/collect`（收事件）+ 统计接口 `/api/stats`（出聚合）+ 同源托管看板页面
- `public/index.html`：看板 UI（Chart.js），就是你那个"单独网址"
- `assets/analytics.js`：装在店铺每个页面上的埋点（发 pageview，结账成功时发 purchase）
- `schema.sql`：D1 表结构

数据流：店铺页面加载 → `analytics.js` 发 `pageview` → 结账成功 → 发 `purchase{value}` → 看板 `/api/stats` 聚合 → 购买率 = purchases / visits。

## 部署（一次性，约 10 分钟）
需要：一个免费 Cloudflare 账号（workers.dev 子域免费）。

```bash
# 1. 安装 wrangler（需 Node）
npm i -g wrangler
wrangler login

# 2. 建 D1 数据库，记下输出的 id
wrangler d1 create eidon-analytics

# 3. 把 id 填进 analytics/wrangler.toml 的 database_id
#    （用任意编辑器打开替换 REPLACE_WITH_YOUR_D1_ID）

# 4. 建表
wrangler d1 execute eidon-analytics --file=analytics/schema.sql

# 5. 部署（在仓库根目录执行）
wrangler deploy --config analytics/wrangler.toml
```

部署成功后你会拿到一个网址，形如 `https://eidon-analytics.<你的子域>.workers.dev`
——**这就是看板地址，发给谁都能看（如需隐私可加密码，见下）**。

## 接上店铺
1. 打开 `assets/analytics.js`，把 `WORKER` 改成你的 worker 网址。
2. 在店铺每个 HTML 的 `</body>` 前加：
   ```html
   <script src="assets/analytics.js"></script>
   ```
   （index / shop / product / about / shipping / guarantee / faq 都已加好）
3. 结账成功时调用：
   ```js
   window.EidonTrack.event('purchase', { value: 24.99 });
   ```
   `checkout.html` + `assets/payment.js` 里已经接好了。

## 看板网址加访问密码（可选）
不想公开访问量，就给 worker 加个简单校验：在 `worker.js` 顶部加一个 token 检查，
`/api/stats` 和看板页面都要求 `?key=你的密码`。需要我加就说一声。

## 自定义域名（可选）
在 Cloudflare 给 worker 绑一个子域，比如 `analytics.dailynestfinds.com`（等你有域名后）。
