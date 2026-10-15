# 支付网关方案 — EveryBeloved（跨境独立站）

## 你的真实情况（2026-10-15 更新）
- 人在成都，**有 PayPal 个人账户**，也有 Payoneer
- 目标客户在美国/全球，客单价 $33–40，走云途直发
- 站点已内置两个在线支付按钮（PayPal + Coinbase Commerce），都是占位符状态

### ✅ PayPal（个人账户可用）— 拿 Client ID 的步骤
1. 打开 https://developer.paypal.com → 用你的 PayPal 个人账户登录
2. 顶部 **Apps & Credentials** → 切到 **Live** 标签
3. **Create App**（名字随意，如 `EveryBeloved Store`）
4. 复制 **Client ID**（Live 的那一串长字符）
5. 填进 `site/assets/payment.js` 第 12 行：`var PAYPAL_CLIENT_ID = "你的ClientID";`
6. 客户结账时就能用 Visa/Mastercard/PayPal 余额付款

**个人账户注意**：
- 个人账户可以创建 developer app、可以接收"商品和服务"付款；但如果 PayPal 提示升级 **Business 账户**（用于开发票、批量退款、去掉收款限额），量起来后再升，前期不阻塞
- 提现：PayPal 余额 → 提现到国内银行卡（有手续费和汇率差），或经 Payoneer/万里汇收汇
- 本站代码已做**动态加载**：填了 Client ID 才加载 PayPal SDK，没填就显示"即将开通"，不会报错

### ① Coinbase Commerce（USDC/USDT）— 差异化备选，同样国内可用
- **为什么**：不需要任何公司实体、稳定币结算无跨境摩擦、几分钟到账、费率 ~0–1%
- **额外价值**：「支持 crypto 支付」本身就是独立站相对平台的一个差异点
- **怎么接**（10 分钟）：
  1. 注册 https://commerce.coinbase.com（用 Coinbase 账号）
  2. 创建一个 Checkout，复制托管结账链接
  3. 填进 `assets/payment.js` 的 `COMMERCE_URL`
  4. 买家付款后自动跳回 `checkout.html?status=success`，系统自动记 purchase 事件
- **出金**：USDC 到账后走交易所/场外换法币，或直接用于 1688 进货（部分供应商收 USDT）

**建议组合**：PayPal（覆盖绝大多数买家）+ Coinbase（差异化 + 无国界），两个都填上。

### ③ Payoneer — 适合 B2B/大单，不适合零售结账
- 你已有 Payoneer。用法：给买家发 invoice（Request a Payment），买家电汇到你的 Payoneer 账户
- 适合场景：兽医诊所/宠物殡仪馆的批量团购（B2B 路线），不适合 $35 的零售单
- 结账页已留「Other ways to pay」说明位

### ④ Stripe — 暂不考虑
- 不向中国大陆居民直接开放，需要香港/美国实体。等有香港公司再上

### ⑤ 直收 USDT（TRC-20）— 零成本备选
- 在 WhatsApp 沟通时直接给地址，手动确认。适合已有信任的回头客

## 落地步骤（现在就能做的）
1. 注册 Coinbase Commerce → 建 Checkout → 链接填进 `assets/payment.js` 的 `COMMERCE_URL`
2. （可选）注册 PayPal → 拿 Client ID → 填进 `assets/payment.js` 的 `PAYPAL_CLIENT_ID`（同时 checkout.html 不再需要改，SDK 改为动态加载）
3. 首单跑通后，看板（analytics）会出现第一笔 transaction

## 风险提醒
- **不要**只看前端成功跳转就发货——务必登录 Coinbase Commerce / PayPal 后台确认**实际到账**再发 QC 照片
- 任何私钥、API secret 都不要出现在前端代码里（当前设计是托管结账，安全）
- 稳定币价格波动：报价时按发稿时汇率留 2–3% 缓冲
