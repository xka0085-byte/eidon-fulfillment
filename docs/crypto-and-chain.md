# 加密货币：付款检测 + 链上纪念存证设计

---

# 第一部分：网站怎么检测客户已经付款

## 三种收款方式的检测能力对照

| 方式 | 网站能自动知道吗 | 怎么实现 | 现在能不能用 |
|---|---|---|---|
| **PayPal** | ⚠️ 前端回调可伪造，**真伪只有 PayPal 知道** | 短期：手动对账（PayPal 后台看 Activity）；中期：Worker 加 webhook | 手动 ✅ / webhook 待 wrangler |
| **USDT 直收（TRC-20）** | ✅ **可以自动检测**（链上公开可查） | Worker 定时任务轮询 TronGrid API 匹配金额 | 需 wrangler 登录后部署 |
| **Coinbase Commerce** | ✅ 可以（官方 webhook） | Commerce 后台配 webhook → Worker 接收 | 需先建 Commerce 账号 |

## USDT 自动检测：具体怎么做（推荐方案）

TRON 链上每笔转账都是公开数据，TronGrid 提供免费 API。原理：

```
客户下单 → 生成待支付订单（金额 + 订单号）
   ↓
客户转 USDT 到你的地址
   ↓
Worker 定时任务（每 3-5 分钟）调用 TronGrid：
GET https://api.trongrid.io/v1/accounts/{你的地址}/transactions/trc20
        ?only_to=true&limit=20&min_timestamp={一小时前}
   ↓
匹配规则：转入金额 == 订单金额（或 ±1%）且时间在看单之后
   ↓
匹配成功 → 更新订单状态为 paid → 通知你（邮件/Telegram）
```

**关键点与坑**：
1. **金额匹配要留容差**：TRC-20 的 USDT 是 6 位小数，客户可能少转 0.01 或转整（$35.00 vs $34.99）→ 用 ±1% 容差 + 人工复核边界情况
2. **必须用订单金额做唯一化**：让每个订单的应付金额带随机尾数（如 $35.07、$35.13），**这是最可靠的匹配方式**——否则两个客户同时转 $35 你分不清谁是谁
3. **TronGrid 免费额度**：无 key 约 3 请求/秒，够用；量大再申请免费 API key
4. **别在浏览器端轮询**：前端查链有 CORS + 暴露地址的问题，**一律放 Worker**
5. **到账确认**：TRON 区块确认很快（~3 秒/块，19 块确认≈1 分钟），建议 1 分钟后才算最终

**Worker 定时任务骨架**（等 wrangler 登录后我部署）：
```js
export default {
  async scheduled(event, env, ctx) {
    const addr = env.USDT_ADDRESS;                 // TRC-20 收款地址
    const since = Date.now() - 1000 * 60 * 60 * 3; // 回看 3 小时
    const r = await fetch(`https://api.trongrid.io/v1/accounts/${addr}/transactions/trc20?only_to=true&limit=50&min_timestamp=${since}`);
    const { data = [] } = await r.json();
    for (const tx of data) {
      if (tx.token_info?.address !== "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t") continue; // 只认 USDT 合约
      const amount = Number(tx.value) / 10 ** (tx.token_info?.decimals || 6);
      const order = await env.DB.prepare("SELECT id, amount FROM orders WHERE status='pending' AND ABS(amount - ?) < 0.05 LIMIT 1").bind(amount).first();
      if (order) {
        await env.DB.prepare("UPDATE orders SET status='paid', tx_hash=? WHERE id=?").bind(tx.transaction_id, order.id).run();
        // 这里加通知：邮件 / Telegram Bot
      }
    }
  }
};
```
配合 wrangler.toml 的 `[triggers] crons = ["*/5 * * * *"]`。

## 过渡方案（今天就能用的手动版）
1. 结账页显示你的 USDT 地址（已做好，`payment.js` 的 `USDT_ADDRESS` 填上即生效）
2. 客户转完，**把交易哈希（tx hash）填进订单备注或发你 WhatsApp**
3. 你在 tronscan.org 输入哈希核对 → 确认后回复客户
4. 因为你有"QC 照片确认后才发货"这一步，**发货前核对完全来得及**

---

# 第二部分：链上纪念存证（Forever Record）

## 产品定义
客户下单时可加购 **+$6**：
> **Forever Record** — 把他们的名字、日期，和你写给 ta 的一句话，永久写进区块链。
> 不可删除、不可篡改、比任何平台活得久。你会收到一个永久页面和一个区块链证书记录。

**为什么这个和品牌天然契合**：tagline 就是 "Forever in Your Heart"，而区块链唯一不可替代的能力恰恰是**不可删除的永久存证**。这不是硬蹭 Web3，是真的用对了。

## 写什么（内容规范）
- 宠物名字（必填，≤40 字符）
- 日期（可选，如 `2010 – 2026`）
- 一句话（可选，≤120 字符）——客户自己写
- 订单哈希（自动，用于关联）
- **不写**：客户全名、地址、邮箱、照片

## 技术设计（三阶段，从最简到自动）

### 阶段 1：手工版（今天就能卖，0 开发）
1. 客户加购 $6 → 你在订单里看到要写的内容
2. 你用**工作室钱包**（Base 网络，需要一点 ETH 付 gas，约 $0.01-0.05/笔）发送一笔带 memo 的交易
   - 最简做法：用 0 值转账到你的另一个地址，把 `名字|日期|一句话` 放进 calldata（Base 上手续费 <$0.01）
   - 更规范：部署一个极简登记合约（一次性约 $0.5），之后每笔调用 `record(id, name, message)`
3. 把 **tx hash** 发给客户 + 一个 `memorial.html?id=xxx` 页面（页面显示名字、那句话、时间戳、区块浏览器链接）
4. 客户可以打印成证书

**成本核算**：gas ~$0.01 + 手工 2 分钟 → 收 $6，毛利极高。

### 阶段 2：半自动（有 wrangler 后）
- Worker 端点 `/api/forever-record`：接收订单 → 用 Worker 里的钱包私钥（Cloudflare 加密变量，绝不入代码）自动发交易 → 回写 tx hash 到订单
- 客户结账后 5 分钟内自动收到链接

### 阶段 3：客户自助（可选）
- 生成一个"存证证书"图片（渲染名字+日期+tx hash+二维码）供客户保存/打印——**这是可分享的社交资产**，每张证书都自带传播

## 合规与风险
- ✅ **不是代币、不是 NFT**：只是往链上写一段公开文本数据，不涉及证券、不发资产 → 监管风险极低
- ⚠️ **信息是永久公开的**：必须明确告知客户"写到链上就无法删除"，让 ta 决定写什么（**默认只用名字，不要求全名**）
- ⚠️ **钱包安全**：私钥只存 Cloudflare 加密环境变量；工作室钱包只放够付 gas 的少量 ETH
- ⚠️ **不要承诺"永久"到法律级别**：文案说"只要这条链还在运行，它就一直在"——技术上诚实

## 定价与包装建议
- 单卖 $6，或**与商品捆绑 +$5**（锚定效应：加购比单买更容易接受）
- 文案关键词：`permanent` / `can't be deleted` / `a timestamp that outlives us`
- 交付物三件套：① 永久页面链接 ② 区块浏览器交易链接（可验证）③ 可打印证书图

## 下一步
你把 **TRC-20 收款地址** + **一个 Base 网络钱包地址**（可以是同一个交易所的钱包）发我，等 wrangler 恢复登录后我一次性把：USDT 自动检测 cron + Forever Record 自动写入 + 后台订单状态 都部署上去。
