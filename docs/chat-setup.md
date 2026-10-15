# 在线聊天通道设置 — EveryBeloved

目标：客户在网站聊天框发消息，**你手机立刻收到推送通知**。

## 当前状态（代码已就位）
- `assets/chat.js` 已内置：
  - **Tawk.to 实时聊天**（已填 property/widget：`6ad07bab921b0034cc067b04/1k4v666jt`）
  - **我们自己的启动器**：右侧垂直居中的品牌色按钮 "Chat with us"（点击打开 Tawk 聊天面板）+ 下方绿色 WhatsApp 圆钮
  - **Tawk 自带的悬浮球已在加载后隐藏**（`Tawk_API.hideWidget()`），所以不会再看到那个带 × 的丑球
  - 若 Tawk 未加载成功，主按钮自动降级为打开 WhatsApp
- 页面引用：全部 17 页 `</body>` 前已包含 `<script src="assets/chat.js"></script>`

## ⚠️ 手机收不到消息推送 — 排障清单（按顺序查）

**关键认知**：电脑有声音是因为你登录的**网页后台**在响；手机要响，**必须装 Tawk.to 官方 App 并登录同一账号**。只开网页后台，手机不会响。

1. **装 App**：App Store / Google Play 搜 **Tawk.to**（蓝色图标，开发商 Tawk.to inc.）
2. **登录**：用注册时同一个邮箱/账号登录（登录后应能在 App 里看到你的 property）
3. **系统权限**：
   - iOS：设置 → 通知 → **Tawk.to** → 允许通知（打开"横幅/声音"）
   - Android：设置 → 应用 → Tawk.to → 通知 → 允许；**并且** 电池 → 设为"无限制/不优化"（省电策略会掐掉推送）
4. **App 内设置**：Settings → Notifications → 确认 **New message** 为开启；同时确认状态是 **Online**（Offline 收不到）
5. **可选但强烈建议的兜底**：Tawk 后台 → **Administration → Notifications → Email** 打开邮件通知 → 手机邮件 App 也会推。这样即使 App 推送被系统掐掉，也不会漏消息
6. **测试方法**：用手机流量（不用电脑）打开 https://xka0085-byte.github.io/ → 点 "Chat with us" 发一条消息 → 看手机是否弹出

**为什么还留着 WhatsApp 按钮**：WhatsApp 的推送最可靠，客户点它可以直连你的 WhatsApp，消息必达。Tawk 负责"客户不想跳走"的场景，两个通道互补。

## 你想改聊天窗口的样子？
Tawk 后台 **Administration → Chat Widget** 可以改：主题色、头像/Logo（传你的 EveryBeloved 爪印）、欢迎语、位置偏移、是否显示品牌字样（付费版可去）。启动器（那个球）现在由我们自己控制，不会再出现。

## 备选方案（Tawk.to 不顺手时）

| 方案 | 通知 | 费用 | 说明 |
|---|---|---|---|
| **WhatsApp 悬浮钮**（当前默认） | WhatsApp 本身有推送 | 免费 | 客户点击直达 WhatsApp 对话，最稳 |
| **Crisp** (crisp.chat) | iOS/Android App 推送 | 免费档可用 | 界面更现代，接入方式类似（换 embed 代码） |
| **Tawk.to**（推荐主用） | App 推送 | 免费无限 | 可看到访客在哪个页面、历史对话 |

## 注意
- 免费版 Tawk.to 会在聊天窗口带极小 branding，可接受；要去掉需付费
- 两个通道可以同时开：客户爱用哪个用哪个，消息都进你手机
