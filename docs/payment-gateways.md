# 支付网关方案（Eidon Sourcing 跨境独立站）

## 现状
店铺现在是 **"DM to order"**（WhatsApp / 邮件下单，人工确认总额后付款）。
要做「真实交易量 + 购买率」看板，**必须有一个能回传成功事件的结账环节**——
所以先接支付网关，再看板才能看到 transactions。

## 推荐组合（按优先级）

### ① PayPal —— 主力，全球通用
- **为什么**：覆盖 200+ 国家，买家用 Visa/Mastercard/余额都能付；个人也能开；买家信任度高。
- **费用**：约 3.49% + $0.49/笔（跨境略高）。
- **到账**：PayPal 余额即时，提现到银行卡 1–3 天。
- **中国大陆账户注意**：PayPal 中国（贝宝）个人/企业账户可以**收款**，但提现到国内银行有额度与手续费限制；很多跨境卖家用 **PayPal 香港账户**或配合万里汇/派安盈收汇。先开中国账户收款跑通，量大了再优化。
- **集成**：`checkout.html` 已内置 PayPal Smart Button（JS SDK），只需把 `YOUR_PAYPAL_CLIENT_ID` 换成你的。
- **对账**：用 PayPal Webhook（`PAYMENT.CAPTURE.COMPLETED`）做服务端核验，防止前端伪造。初期限量可先人工核对。

### ② Coinbase Commerce（USDC / USDT）—— 差异化杀器，贴合你的 Web3 路线
- **为什么**：稳定币结算，**没有银行、没有跨境摩擦、几分钟到账、手续费 ~1%**；而且「支持 crypto 支付」本身就是独立站区别于平台的一个记忆点（和你的"比平台自由"定位一致）。
- **费用**：Commerce 现在对商家 0 手续费（Coinbase 承担了）。
- **怎么接**：在 Commerce 后台建一个 Checkout，拿到托管结账链接，填进 `assets/payment.js` 的 `COMMERCE_URL`。买家付完跳回 `checkout.html?status=success`，我们自动记一笔 `purchase` 事件。
- **注意**：稳定币到账后是 USDC，需要出金到法币（走 Coinbase / 交易所 / 场外）。这是你本来就熟悉的世界。

### ③ Stripe —— 体验最好，但大陆居民直接用不了
- Stripe **不向中国大陆居民开放**直接开户。要做只能：注册香港/美国实体 → 用那边的 Stripe；或走 Stripe 的「跨境」代理（如 Stripe Atlas 注册美国公司）。
- **建议**：等单量起来了、有了香港账户再上。前期 PayPal + crypto 足够。

### 已写在站内的：Payoneer
- 站内文案已写「PayPal, USDT, Payoneer」。Payoneer 适合**批量/B2B/大单**收款（开 invoice 让买家电汇到你的 Payoneer 账户），不适合小额零售结账。保留作为大额选项即可。

## 落地步骤
1. 开 PayPal 账户（建议顺手开香港账户或备好万里汇），拿到 Client ID → 填 `checkout.html`。
2. 开 Coinbase Commerce，建 Checkout → 拿到链接 → 填 `assets/payment.js`。
3. 把 `assets/analytics.js` 里的 `WORKER` 改成你的看板网址（部署见 `analytics/README.md`）。
4. 商品页「Shipping & payment」已指向 `shipping.html`，里面加了「在线支付」入口跳到 `checkout.html?id=...`。
5. 跑通第一单 → 看板出现第一笔 transaction → 购买率开始有数。

## 风险提醒
- **不要**只看前端 `onApprove` 就发货——务必用 PayPal Webhook / Commerce 后台确认**实际到账**再发 QC 照片。
- 稳定币地址务必用**白名单/仅接收**地址，别把私钥放任何前端代码里（现在的设计是托管结账，私钥在 Commerce，安全）。
