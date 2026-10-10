/* Eidon Sourcing — site behaviors:
   1. scroll-reveal animations
   2. auto-render shop grid + featured grid + product detail page from products-data.js
   3. no-op safe: pages without matching containers are untouched */
(function () {
  "use strict";

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  function orderLink(p) {
    var msg = "Hi! I'd like to order the " + p.name;
    return "https://wa.me/8615982440421?text=" + encodeURIComponent(msg);
  }

  function pCard(p, i) {
    var delay = (i % 3) * 0.08;
    var imgInner = p.img ? '<img src="' + esc(p.img) + '" alt="' + esc(p.name) + '" loading="lazy">' :
      '<span>' + esc(p.name).split(" ").slice(0, 2).join("<br>") + "</span>";
    var badges = "";
    if (p.badge) badges += '<div class="p-badge">' + esc(p.badge) + "</div>";
    if (p.stock) badges += '<div class="p-badge alt">' + esc(p.stock) + "</div>";
    return '<div class="p-card reveal" style="transition-delay:' + delay + 's">' + badges +
      '<a class="p-img' + (i % 2 ? " alt" : "") + '" href="product.html?id=' + esc(p.id) + '">' + imgInner + "</a>" +
      '<div class="p-info"><h3><a href="product.html?id=' + esc(p.id) + '">' + esc(p.name) + "</a></h3>" +
      '<p class="p-price">' + esc(p.price) + ' <span class="p-free">free shipping</span></p>' +
      '<a class="p-order" target="_blank" rel="noopener" href="' + orderLink(p) + '">Order via WhatsApp</a></div></div>';
  }

  function pDetail(p) {
    var feats = (p.features || []).map(function (f, i) {
      return '<div class="frow"><div class="fnum">' + ("0" + (i + 1)).slice(-2) + '</div><div><div class="ft">' + esc(f.t) + '</div><div class="fd">' + esc(f.d) + "</div></div></div>";
    }).join("");
    var specs = (p.specs || []).map(function (s) { return "<tr><td>" + esc(s[0]) + "</td><td>" + esc(s[1]) + "</td></tr>"; }).join("");
    var imgInner = p.img ? '<img src="' + esc(p.img) + '" alt="' + esc(p.name) + '">' : '<span>' + esc(p.name).split(" ").slice(0, 2).join("<br>") + "</span>";
    var stock = p.stock ? '<div class="pd-stock">' + esc(p.stock) + ' <span>· this drop only, no restock</span></div>' : "";
    var note = p.curator_note ? '<div class="cnote"><div class="cnote-t">Curator&rsquo;s note</div><p>' + esc(p.curator_note) + "</p><div class="cnote-s">— Eidon</div></div>" : "";
    return '<div class="pd-head"><a href="shop.html">← Back to shop</a></div>' +
      '<div class="pd-layout"><div class="p-img pd-img">' + imgInner + "</div>" +
      '<div class="pd-info"><div class="p-badge">' + esc(p.badge || "Free shipping") + '</div><span class="p-free pd-free">free worldwide shipping</span>' +
      '<h1 class="serif">' + esc(p.name) + "</h1>" +
      '<p class="pd-tagline">' + esc(p.tagline) + "</p>" +
      '<p class="p-price pd-price">' + esc(p.price) + "</p>" + stock +
      '<div class="pd-ctas"><a class="btn" target="_blank" rel="noopener" href="' + orderLink(p) + '">Order via WhatsApp</a>' +
      '<a class="btn ghost" href="shipping.html">Shipping &amp; payment</a></div>' +
      '<p class="pd-note">QC photo before shipping · 10–15 day tracked delivery · <a href="guarantee.html">30-Day Keep-It Guarantee</a></p></div></div>' +
      (note ? '<section class="pd-section">' + note + "</section>" : "") +
      '<section class="pd-section"><h2 class="serif">Why you&rsquo;ll love it</h2>' + (feats || "") + "</section>" +
      (specs ? '<section class="pd-section"><h2 class="serif">The numbers</h2><table>' + specs + "</table></section>" : "") +
      '<section class="pd-section"><div class="note">Every order ships with QC photos, full tracking, and the <a href="guarantee.html">30-Day Keep-It Guarantee</a>. Questions? <a href="https://wa.me/8615982440421" target="_blank" rel="noopener">Message me on WhatsApp</a> — I answer personally.</div></section>';
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
      document.title = p ? p.name + " — Eidon Sourcing" : document.title;
    }

    // scroll reveal (works on both static and injected nodes)
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("on"); io.unobserve(e.target); } });
    }, { threshold: 0.1 });
    document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", render);
  else render();
})();
