# 祝福接力 — 审核与运营流程

## 它是什么
客户下单后，在结账成功页随机看到**一条已审核的留言**（"A note for you"），并在下面看到入口：
> When you're ready, [leave a line for the next person] → `blessing.html`

客户在 `blessing.html` 写下的一句话，进入**待审队列**；你审核通过后，它才有机会出现在别的客户眼前。

## 代码在哪
| 文件 | 作用 |
|---|---|
| `assets/blessings.js` | **已审核留言池**（唯一线上来源）。目前 12 条，全部署名 `Eidon, EveryBeloved` |
| `blessing.html` | 客户投稿页（含长度限制 220 字、自动剔除链接/邮箱） |
| `assets/payment.js` | 结账成功时随机抽取一条渲染（函数 `showBlessing()`） |
| `checkout.html` | `<div id="co-blessing">` 容器 |

## 为什么必须先审核（不可跳过）
丧宠场景下，恶意或不当内容的杀伤力是普通电商的十倍——一条嘲讽留言就能毁掉一个刚失去宠物的客户。所以：**任何未经审核的留言，永远不会出现在客户面前。**

## 审核流程（现在就能用，不需要额外后台）
1. 客户投稿 → 以 `type=blessing` 写入 D1 的 `events` 表（文案存在 `path` 字段，最长 200 字）
2. **你在后台看**：登录 analytics 仪表盘，按 type 筛选 `blessing`
3. 审核判断：
   - ✅ 通过 → 复制这句话，加进 `assets/blessings.js`（署名改成 `Someone who ordered before you` 或客户名字首字母），push 上线
   - ❌ 拒绝 → 什么都不做（客户已经看到"我们会在审核后分享"的说明，不会有被拒绝的感知）
4. 上线后它会自动进入随机轮播

> 目前是"人工搬运"这一步（复制粘贴 + push）。等 `wrangler login` 恢复，可以在 worker 加 `/api/blessings` 读接口 + 后台一键"通过/驳回"，就全自动了。

## 署名规则（不能破坏诚实原则）
- 你自己写的 → 必须署 `Eidon, EveryBeloved`（**绝不能冒充客户**）
- 客户写的（已同意分享）→ 署 `Someone who ordered before you`；客户明确同意用名字才写名字，建议最多只写首字母 + 地区（如 `M., Ohio`）
- 绝对不要编造"客户留言"——这是全站信任的底线

## 冷启动
第一批订单不多时，池子就是你现在这 12 条（署名 Eidon）。这没问题：**署名诚实**，客户看到的是"店主写给我的话"，同样有温度。等真实投稿累积起来，池子里自然会混入客户的声音。

## 附：12 条首批留言（已上线）
1. Whatever you're feeling today — it's allowed. Grief keeps its own schedule.
2. You gave them a good life. That's not a small thing — that's the whole thing.
3. I hope this small piece brings you a quiet moment, not more sadness.
4. I still say my dog's name out loud sometimes. It helps. Say theirs.
5. Take your time opening this. There is no rush here.
6. The fact that this hurts means it mattered. It mattered enormously.
7. You're not being dramatic. They were never "just a pet" — you know that.
8. Some days you'll be fine; some days a smell or a sound will undo you. Both are normal.
9. I hope that one day soon you can think of them and smile before you cry.
10. Whoever you are, wherever you are — you're not the only one who loved like this.
11. Thank you for trusting us with their name and their face. We'll take good care of it.
12. If you ever want to tell someone about them, our door is open. We'd love to hear.
