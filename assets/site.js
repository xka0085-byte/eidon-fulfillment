/* Pawmark — site behaviors:
   1. scroll-reveal animations (IntersectionObserver base + GSAP enhancement)
   2. auto-render shop grid + featured grid + product detail page from products-data.js
   3. motion layer: hero parallax + ken burns, staggered entrances, scroll progress,
      magnetic buttons (GSAP loaded on demand from assets/vendor, degrades gracefully)
   Honesty rule baked in: no QC-photo claims, no "hand-inspected by us" copy. */
(function () {
  "use strict";
  // backend API base (same worker as dashboard/admin). Internal endpoint name unchanged.
  var API_BASE = "https://eidon-analytics.xka0085.workers.dev";

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  var CAT_LABEL = { memorial: "Memorial keepsake", living: "For them still here" };

  function orderLink(p) {
    var msg = "Hi! I'd like to order the " + p.name + " from Pawmark";
    return "https://wa.me/8615982440421?text=" + encodeURIComponent(msg);
  }

  var SITE = "https://xka0085-byte.github.io/";
  var HERO = SITE + "assets/products/photo-pendant.jpg";

  function setCanonical(url) {
    var l = document.querySelector('link[rel="canonical"]');
    if (!l) { l = document.createElement("link"); l.rel = "canonical"; document.head.appendChild(l); }
    l.setAttribute("href", url);
  }
  function upsertLD(idTag, obj) {
    var s = document.getElementById(idTag);
    if (!s) { s = document.createElement("script"); s.type = "application/ld+json"; s.id = idTag; document.head.appendChild(s); }
    s.textContent = JSON.stringify(obj);
  }
  function injectProductSEO(p) {
    var url = SITE + "product.html?id=" + encodeURIComponent(p.id);
    setCanonical(url);
    var price = parseFloat(String(p.price).replace(/[^0-9.\-]/g, "")) || 0;
    upsertLD("ld-product", {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": p.name,
      "description": p.desc,
      "image": p.img ? SITE + p.img : HERO,
      "brand": { "@type": "Brand", "name": "Pawmark" },
      "sku": p.id,
      "offers": {
        "@type": "Offer",
        "price": price,
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock",
        "url": url,
        "priceValidUntil": "2026-12-31"
      }
    });
    upsertLD("ld-breadcrumb", {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Shop", "item": SITE + "shop.html" },
        { "@type": "ListItem", "position": 2, "name": p.name, "item": url }
      ]
    });
  }

  function pCard(p, i) {
    var delay = (i % 3) * 0.08;
    var imgInner = p.img ? '<img src="' + esc(p.img) + '" alt="' + esc(p.name) + ' — pet keepsake" loading="lazy" decoding="async">' :
      '<span>' + esc(p.name).split(" ").slice(0, 2).join("<br>") + "</span>";
    var badges = "";
    if (p.badge) badges += '<div class="p-badge">' + esc(p.badge) + "</div>";
    badges += '<div class="p-badge alt">Made to order</div>';
    return '<div class="p-card reveal" style="transition-delay:' + delay + 's">' + badges +
      '<a class="p-img" href="product.html?id=' + esc(p.id) + '">' + imgInner +
      '<span class="p-peek">View piece &rarr;</span></a>' +
      '<div class="p-info"><div class="p-cat">' + esc(CAT_LABEL[p.cat] || "Keepsake") + '</div>' +
      '<h3><a href="product.html?id=' + esc(p.id) + '">' + esc(p.name) + "</a></h3>" +
      '<p class="p-tag">' + esc(p.tagline) + "</p>" +
      '<p class="p-price">' + esc(p.price) + ' <span class="p-free">free shipping</span></p>' +
      '<a class="p-order" target="_blank" rel="noopener" href="' + orderLink(p) + '">Order via WhatsApp</a></div></div>';
  }

  function pDetail(p) {
    var feats = (p.features || []).map(function (f, i) {
      return '<div class="frow"><div class="fnum">' + ("0" + (i + 1)).slice(-2) + '</div><div><div class="ft">' + esc(f.t) + '</div><div class="fd">' + esc(f.d) + "</div></div></div>";
    }).join("");
    var specs = (p.specs || []).map(function (s) { return "<tr><td>" + esc(s[0]) + "</td><td>" + esc(s[1]) + "</td></tr>"; }).join("");
    var imgInner = p.img ? '<img src="' + esc(p.img) + '" alt="' + esc(p.name) + ' — pet keepsake" decoding="async">' : '<span>' + esc(p.name).split(" ").slice(0, 2).join("<br>") + "</span>";
    var stock = '<div class="pd-stock">Made to order <span>· ships in 10–15 days, tracked worldwide</span></div>';
    return '<div class="pd-head"><a href="shop.html">&larr; Back to shop</a></div>' +
      '<div class="pd-layout"><div class="p-img pd-img">' + imgInner + "</div>" +
      '<div class="pd-info"><div class="p-badge">' + esc(p.badge || "Free shipping") + '</div><span class="p-free pd-free">free worldwide shipping</span>' +
      '<h1 class="serif">' + esc(p.name) + "</h1>" +
      '<p class="pd-tagline">' + esc(p.tagline) + "</p>" +
      '<p class="p-price pd-price">' + esc(p.price) + "</p>" + stock +
      '<div class="pd-ctas"><a class="btn" target="_blank" rel="noopener" href="' + orderLink(p) + '">Order via WhatsApp</a>' +
      '<a class="btn" href="checkout.html?id=' + esc(p.id) + '">Pay online</a>' +
      '<a class="btn ghost" href="shipping.html">Shipping &amp; payment</a></div>' +
      '<p class="pd-note">Made to order in 2–4 days &middot; tracked worldwide delivery &middot; <a href="guarantee.html">30-Day Keep-It Guarantee</a></p></div></div>' +
      '<section class="pd-section"><h2 class="serif">Why you&rsquo;ll love it</h2>' + (feats || "") + "</section>" +
      (specs ? '<section class="pd-section"><h2 class="serif">The details</h2><table>' + specs + "</table></section>" : "") +
      '<section class="pd-section"><div class="note">Every order is handled personally and QC-checked before it ships — covered by the <a href="guarantee.html">30-Day Keep-It Guarantee</a>. Questions? <a href="https://wa.me/8615982440421" target="_blank" rel="noopener">Message us on WhatsApp</a> — Eidon answers.</div></section>';
  }

  function render() {
    var P = window.PRODUCTS || [];

    var shop = document.getElementById("shop-grid");
    if (shop) shop.innerHTML = P.map(pCard).join("");

    var feat = document.getElementById("featured-grid");
    if (feat) feat.innerHTML = P.slice(0, 3).map(pCard).join("");

    var pd = document.getElementById("product-page");
    if (pd) {
      var id = new URLSearchParams(location.search).get("id");
      var p = P.filter(function (x) { return x.id === id; })[0];
      pd.innerHTML = p ? pDetail(p) : '<p>Product not found.</p><p><a class="btn" href="shop.html">Back to shop</a></p>';
      document.title = p ? p.name + " — Pawmark" : document.title;
      if (p) injectProductSEO(p);
    }

    // scroll reveal (works on both static and injected nodes)
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("on"); io.unobserve(e.target); } });
    }, { threshold: 0.1 });
    document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });
  }

  /* ================= motion layer ================= */
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function loadScript(src, then) {
    var s = document.createElement("script");
    s.src = src;
    s.onload = then;
    s.onerror = function () { then(); };
    document.head.appendChild(s);
  }

  function initMotion() {
    if (reduceMotion || !window.gsap || !window.ScrollTrigger) return;
    var gsap = window.gsap;
    gsap.registerPlugin(window.ScrollTrigger);

    // scroll progress bar (thin, sage)
    var bar = document.createElement("div");
    bar.id = "pw-progress";
    document.body.appendChild(bar);
    gsap.to(bar, {
      scaleX: 1, ease: "none",
      scrollTrigger: { trigger: document.body, start: "top top", end: "bottom bottom", scrub: 0.3 }
    });

    // hero: ken burns settle + scroll parallax + copy entrance
    var heroImg = document.querySelector(".hero-media .frame img");
    if (heroImg) {
      gsap.fromTo(heroImg, { scale: 1.1 }, { scale: 1, duration: 2.6, ease: "power2.out" });
      gsap.to(heroImg, {
        yPercent: 12, ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
      });
    }
    gsap.from(".hero-copy > *", { y: 30, opacity: 0, duration: 1, stagger: 0.09, ease: "power3.out", delay: 0.15 });
    gsap.from(".hero-media .frame", { y: 40, opacity: 0, duration: 1.1, ease: "power3.out", delay: 0.3 });
    gsap.from(".hero-media .tag", { y: 24, opacity: 0, duration: 0.8, delay: 0.9, ease: "back.out(1.5)" });

    // section-level entrances for elements without .reveal
    var sel = ".sec-head, .quote, .zz-text, .zz-media, .honest, .species, .blog-grid, .co-summary, .co-methods, article > p, article > h2, article > ul";
    gsap.utils.toArray(sel).forEach(function (el) {
      if (el.closest(".reveal")) return; // avoid double animation
      gsap.fromTo(el, { y: 26, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.8, ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 88%" }
      });
    });

    // trust strip + cta band
    gsap.from(".trust .wrap > div", {
      y: 16, opacity: 0, duration: 0.6, stagger: 0.08, ease: "power2.out",
      scrollTrigger: { trigger: ".trust", start: "top 92%" }
    });
    gsap.utils.toArray(".cta-band").forEach(function (el) {
      gsap.fromTo(el, { scale: 0.97, opacity: 0 }, {
        scale: 1, opacity: 1, duration: 0.8, ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 92%" }
      });
    });

    // product images: gentle parallax inside their frames
    gsap.utils.toArray(".p-img img, .pillar .ph img").forEach(function (img) {
      gsap.fromTo(img, { yPercent: -4 }, {
        yPercent: 4, ease: "none",
        scrollTrigger: { trigger: img.closest(".p-card, .pillar") || img, start: "top bottom", end: "bottom top", scrub: true }
      });
    });

    // magnetic buttons (subtle, fine pointers only)
    if (window.matchMedia("(pointer: fine)").matches) {
      document.querySelectorAll(".btn").forEach(function (btn) {
        btn.addEventListener("mousemove", function (e) {
          var r = btn.getBoundingClientRect();
          gsap.to(btn, {
            x: (e.clientX - r.left - r.width / 2) * 0.14,
            y: (e.clientY - r.top - r.height / 2) * 0.14,
            duration: 0.3, ease: "power2.out"
          });
        });
        btn.addEventListener("mouseleave", function () {
          gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.45)" });
        });
      });
    }

    // refresh after images load (parallax triggers depend on layout)
    window.addEventListener("load", function () { window.ScrollTrigger.refresh(); });
  }

  function loadMotion() {
    if (reduceMotion) return;
    if (window.gsap && window.ScrollTrigger) { initMotion(); return; }
    loadScript("assets/vendor/gsap.min.js", function () {
      if (!window.gsap) return;
      loadScript("assets/vendor/ScrollTrigger.min.js", initMotion);
    });
  }

  // boot: render immediately from static data.
  // LIVE_SYNC = pull the product list from the backend worker (admin dashboard edits).
  // ⚠️ Currently OFF: the D1 products table still holds the pre-rebuild catalog.
  // After re-syncing D1 (see growth/sync_products_d1.py), flip this to true.
  var LIVE_SYNC = false;

  function boot() {
    render();
    loadMotion();
    if (!LIVE_SYNC) return;
    fetch(API_BASE + "/api/products")
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (arr) {
        if (Array.isArray(arr) && arr.length) { window.PRODUCTS = arr; render(); }
      })
      .catch(function () {});
    loadMotion();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
