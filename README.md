# EveryBeloved — website

Static storefront for EveryBeloved: made-to-order pet memorial keepsakes and photo jewelry in solid metal. Photo / paw print / name / bird-voice pieces, free tracked worldwide shipping, 30-Day Keep-It Guarantee.

**Live at:** https://xka0085-byte.github.io/ (GitHub Pages, free tier)

## Structure
- `index.html` — home (hero, three pillars, featured pieces, how it works, species strip, honesty section, journal teaser)
- `shop.html` — all pieces (rendered from `assets/products-data.js`)
- `product.html?id=<id>` — product detail (auto-rendered + Product schema injected by `assets/site.js`)
- `about.html` — who runs this, honestly (no invented story)
- `shipping.html` / `guarantee.html` / `faq.html` — trust pages (FAQPage schema)
- `checkout.html` + `assets/payment.js` — PayPal Smart Button + Coinbase Commerce crypto
- `privacy.html` / `terms.html` — legal pages
- `affiliate.html` — creator affiliate + refer-a-friend
- `404.html` — branded not-found page
- `blog/` — journal index + 4 guides (keepsake choice, photo tips, every species, first week after loss)
- `assets/` — style.css, site.js, products-data.js, chat.js, analytics.js, growth.js, payment.js, favicon.svg, products/*.jpg
- `sitemap.xml`, `image-sitemap.xml`, `feed.xml` (Google Merchant product feed), `robots.txt`
- `analytics/` — Cloudflare Worker dashboard (own project, deploys separately)
- `docs/`, `tools/` — internal notes (payment gateways, chat setup) and feed generator

## Product catalog
Edit `assets/products-data.js` — add one object and it appears on index (first 3), shop grid, and its own product page. **Honesty rule in that file: only claim what is true** (made-to-order, solid metal, tracked shipping, guarantee). No QC-photo claims, no invented heritage — the whole brand is built on that difference.

## Placeholders to fill before real traffic
- Coinbase Commerce checkout URL in `assets/payment.js` (search `YOUR_CHECKOUT_ID`) — main online payment, works from China
- PayPal client id in `assets/payment.js` (`PAYPAL_CLIENT_ID`) — get it at developer.paypal.com → Apps & Credentials → Create App (personal account works)
- Tawk.to property id in `assets/chat.js` (empty = WhatsApp button only) — see `docs/chat-setup.md` for phone-notification setup
- Instagram / TikTok handles in page footers (search `[handles]`)
- `LIVE_SYNC` in `assets/site.js` — flip to `true` after re-syncing D1 products (run `python growth/sync_products_d1.py`, needs `wrangler login` first)
- Brand name collision check (USPTO + domain) before scaling — see project notes

## Contact info
- Email: xka0085@gmail.com
- WhatsApp: +86 159 8244 0421 (wa.me/8615982440421)
- Run by: Eidon, Chengdu, China

## When the first orders come → buy the .com
1. Register `everybeloved.com` (verified unregistered 2026-10-15) + run a USPTO clearance search before scaling
2. Register domain (Namesilo/Cloudflare, ~$10/yr)
3. Repo Settings → Pages → Custom domain → enter domain, enable HTTPS
4. DNS: CNAME record → `xka0085-byte.github.io`
5. Update `sitemap.xml`, `robots.txt`, canonical/og:url tags in all pages, and external links
