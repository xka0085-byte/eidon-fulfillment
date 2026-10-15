# 在线聊天通道设置 — Pawmark

目标：客户在网站聊天框发消息，**你手机立刻收到推送通知**。

## 当前状态（代码已就位）
- `assets/chat.js` 已内置两个通道：
  1. **WhatsApp 悬浮按钮**（右下角 "Message us"）— 已生效，无需任何配置
  2. **Tawk.to 实时聊天** — 已留好接口，填入 Property ID 即生效
- 页面引用：所有页面 `</body>` 前已包含 `<script src="assets/chat.js"></script>`

## 启用 Tawk.to（5 分钟，免费）

### 1. 注册
- 打开 https://www.tawk.to → Sign Up（邮箱注册，免费版无限坐席、无限对话）
- 验证邮箱后进入后台

### 2. 创建 Property
- Language 选 English，站点名 `Pawmark`，URL 填 `https://xka0085-byte.github.io`
- 创建后进入 **Administration → Chat Widget → Property ID**（形如 `65f1a2b3c4d5e6f7g8h9i0j` 的一长串）

### 3. 填入网站
- 打开 `site/assets/chat.js`，把第一行的
  `window.TAWK_PROPERTY_ID = "";`
  改成
  `window.TAWK_PROPERTY_ID = "你的PropertyID";`
- 保存。聊天气泡会出现在网站右下角（在 WhatsApp 按钮上方）。

### 4. 手机装 App + 开通知（关键）
- App Store / Google Play 搜索 **Tawk.to**（官方 App，蓝色图标）
- 用同一账号登录
- **iOS**：设置 → 通知 → Tawk.to → 允许通知
- **Android**：系统设置 → 应用 → Tawk.to → 通知 → 允许
- App 内：Settings → Notifications → 确认 **New message notifications** 为开启
- 建议同时开启 **Sound** 和邮箱备份通知（Administration → Notifications → Email）

### 5. 上线前自检
- 用手机流量打开网站 → 点聊天气泡发一条测试消息 → 看手机是否弹出通知
- 若没弹：检查 App 通知权限、账号是否登录的是同一个 property

## 备选方案（Tawk.to 不顺手时）

| 方案 | 通知 | 费用 | 说明 |
|---|---|---|---|
| **WhatsApp 悬浮钮**（当前默认） | WhatsApp 本身有推送 | 免费 | 客户点击直达 WhatsApp 对话，最稳 |
| **Crisp** (crisp.chat) | iOS/Android App 推送 | 免费档可用 | 界面更现代，接入方式类似（换 embed 代码） |
| **Tawk.to**（推荐主用） | App 推送 | 免费无限 | 可看到访客在哪个页面、历史对话 |

## 注意
- 免费版 Tawk.to 会在聊天窗口带极小 branding，可接受；要去掉需付费
- 两个通道可以同时开：客户爱用哪个用哪个，消息都进你手机
