#!/usr/bin/env bash
# ============================================================
# Eidon 后端一键部署（Cloudflare Worker + D1，免费）
# 前置（只需一次）：wrangler login   （会打开浏览器授权）
# 运行：bash site/analytics/deploy.sh
# 做六件事：建 D1 → 写 ID → 建表 → 设 ADMIN_TOKEN → 部署 → 回填前端 3 处占位
# ============================================================
set -e
cd "$(dirname "$0")"
NODE="C:/Users/eqzyz/.workbuddy/binaries/node/versions/22.22.2-6/node.exe"
WRANGLER="$NODE C:/Users/eqzyz/.workbuddy/binaries/node/workspace/node_modules/wrangler/bin/wrangler.js"

echo "==> 1/6 创建 D1 数据库"
OUT=$($WRANGLER d1 create eidon-analytics 2>&1) || true
echo "$OUT"
DBID=$(echo "$OUT" | grep -oE '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}' | head -1)
if [ -z "$DBID" ]; then
  echo "!! 未能取得 database_id（可能已存在）。请从上面输出里复制 ID，手动填入 wrangler.toml 的 database_id"
  exit 1
fi
echo "    database_id = $DBID"

echo "==> 2/6 写入 wrangler.toml"
sed -i "s/REPLACE_WITH_YOUR_D1_ID/$DBID/" wrangler.toml
grep -n "database_id" wrangler.toml

echo "==> 3/6 建表（events / products / orders / subscribers）"
$WRANGLER d1 execute eidon-analytics --file=schema.sql --remote 2>&1 | tail -5

echo "==> 4/6 设置管理员密码 ADMIN_TOKEN"
TOKEN=$($NODE -e "console.log(require('crypto').randomBytes(16).toString('hex'))")
echo "$TOKEN" | $WRANGLER secret put ADMIN_TOKEN 2>&1 | tail -3
echo "    ADMIN_TOKEN = $TOKEN"
echo "    （登录 /admin.html 用这个密码，请保存好）"

echo "==> 5/6 部署 Worker"
DEPLOY=$($WRANGLER deploy --config wrangler.toml 2>&1)
echo "$DEPLOY" | tail -6
SUB=$(echo "$DEPLOY" | grep -oE 'https://[a-z0-9-]+\.workers\.dev' | head -1)

echo "==> 6/6 回填前端 3 处占位（analytics.js / site.js / payment.js）"
if [ -n "$SUB" ]; then
  SUBDOMAIN=$(echo "$SUB" | sed -E 's#https://([a-z0-9-]+)\.workers\.dev#\1#')
  cd ..
  sed -i "s#https://eidon-analytics.YOURSUB.workers.dev#https://eidon-analytics.$SUBDOMAIN.workers.dev#g" \
    assets/analytics.js assets/site.js assets/payment.js
  echo "    已回填 -> https://eidon-analytics.$SUBDOMAIN.workers.dev"
else
  echo "!! 未解析到 workers.dev 网址，请手动把 3 个文件里的 YOURSUB 换成你的子域"
fi

echo ""
echo "✅ 部署完成"
echo "   看板   : $SUB/"
echo "   后台   : $SUB/admin.html   （密码 = 上面的 ADMIN_TOKEN）"
echo "   前端改动需 git push 后才生效（GitHub Pages）"
