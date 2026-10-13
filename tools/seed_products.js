#!/usr/bin/env node
/* 把 assets/products-data.js 里的商品灌进 D1（让后台成为商品唯一来源）。
   用法：  ADMIN_TOKEN=<你的token> node site/tools/seed_products.js
   token 来自部署时 wrangler secret put ADMIN_TOKEN 的值。 */
const fs = require("fs");
const path = require("path");

const API = "https://eidon-analytics.xka0085.workers.dev";
const TOKEN = process.env.ADMIN_TOKEN;
if (!TOKEN) { console.error("请设置环境变量 ADMIN_TOKEN"); process.exit(1); }

const src = fs.readFileSync(path.resolve(__dirname, "..", "assets", "products-data.js"), "utf8");
global.window = {};
// eslint-disable-next-line no-eval
eval(src);
const products = (global.window.PRODUCTS || []).filter(p => p.stock !== false);

(async () => {
  let ok = 0;
  for (const p of products) {
    try {
      const r = await fetch(API + "/api/products", {
        method: "POST",
        headers: { "content-type": "application/json", "x-admin-token": TOKEN },
        body: JSON.stringify(p)
      });
      const t = await r.text();
      console.log(`  ${r.status === 200 ? "✅" : "⚠️ "} ${p.id}  ${t.slice(0, 60)}`);
      if (r.status === 200) ok++;
    } catch (e) { console.log(`  ❌ ${p.id}  ${e.message}`); }
  }
  const chk = await fetch(API + "/api/products");
  const arr = await chk.json();
  console.log(`\n✅ 写入 ${ok}/${products.length}；数据库现有 ${arr.length} 个商品`);
})();
