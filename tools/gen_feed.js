#!/usr/bin/env node
/* Google Merchant Center product feed generator.
   Reads assets/products-data.js and writes feed.xml (RSS 2.0 + g: namespace).
   Run:  node site/tools/gen_feed.js
   Then upload site/feed.xml in Google Merchant Center (free listings).
   NOTE: Google requires a real g:image_link per product. Add images to
   assets/products/<id>.jpg (or set "img" in products-data.js) or items will be disapproved. */
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const BASE = "https://xka0085-byte.github.io/";
const BRAND = "Eidon Sourcing";

// load products from the browser-style file
const src = fs.readFileSync(path.join(root, "assets/products-data.js"), "utf8");
global.window = {};
// eslint-disable-next-line no-eval
eval(src);
const products = (global.window.PRODUCTS || []).filter(p => p.stock !== false);

const esc = s => String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const price = p => { const n = parseFloat(String(p.price).replace(/[^0-9.]/g, "")); return n ? n.toFixed(2) + " USD" : "0.00 USD"; };

const items = products.map(p => {
  const img = p.img || `assets/products/${p.id}.jpg`;
  const link = `${BASE}/product.html?id=${p.id}`;
  return `    <item>
      <g:id>${esc(p.id)}</g:id>
      <g:title>${esc(p.name)}</g:title>
      <g:description>${esc(p.desc)}</g:description>
      <g:link>${esc(link)}</g:link>
      <g:image_link>${esc(BASE + "/" + img)}</g:image_link>
      <g:availability>in_stock</g:availability>
      <g:price>${price(p)}</g:price>
      <g:brand>${esc(BRAND)}</g:brand>
      <g:condition>new</g:condition>
      <g:identifier_exists>no</g:identifier_exists>
      <g:google_product_category>187</g:google_product_category>
      <g:shipping><g:country>US</g:country><g:service>Standard</g:service><g:price>0.00 USD</g:price></g:shipping>
    </item>`;
}).join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${esc(BRAND)} — Product Feed</title>
    <link>${BASE}/</link>
    <description>Streetwear accessories sourced from China, shipped worldwide.</description>
${items}
  </channel>
</rss>
`;

fs.writeFileSync(path.join(root, "feed.xml"), xml, "utf8");
console.log(`✅ wrote feed.xml with ${products.length} products`);
const missing = products.filter(p => !p.img);
if (missing.length) {
  console.log("\n⚠️  Missing product images (Google will disapprove these until real image_link exists):");
  missing.forEach(p => console.log(`   - ${p.id}  →  add assets/products/${p.id}.jpg  or set img in products-data.js`));
}
