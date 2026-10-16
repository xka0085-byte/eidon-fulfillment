/* EveryBeloved checkout logic — collects buyer details, creates an order on the backend,
   then fires the analytics purchase event.
   Payment methods: Coinbase Commerce (crypto, ready when COMMERCE_URL is set) and
   PayPal Smart Button (renders only when PAYPAL_CLIENT_ID is set — SDK loads
   dynamically so no console errors while unconfigured).
   Setup guide: site/docs/payment-gateways.md */
(function () {
  // same backend as the dashboard/admin — set to your deployed worker URL
  var API = "https://eidon-analytics.xka0085.workers.dev";

  // ---- fill these in (see docs/payment-gateways.md) ----
  // PayPal Client ID is public by design (it is used by the browser SDK). Never put the Secret here.
  var PAYPAL_CLIENT_ID = "BAAaC1HLQ0Su_biXdm2a2YxmwOhUGKGE9kOPC_jwz42HbxieGGk2UlAGJflk625irsrBVZnHStmHO2pQ_A";
  var COMMERCE_URL = "https://commerce.coinbase.com/checkout/YOUR_CHECKOUT_ID"; // Coinbase Commerce hosted checkout
  // Direct USDT (TRC-20) receiving address — public information, safe to show customers.
  var USDT_ADDRESS = ""; // e.g. "TXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

  var qs = new URLSearchParams(location.search);
  var id = qs.get("id");
  var P = window.PRODUCTS || [];
  var p = P.filter(function (x) { return x.id === id; })[0];
  var summary = document.getElementById("co-summary");
  var form = document.getElementById("co-form");

  if (!p) {
    summary.innerHTML = "Product not found. <a href='shop.html'>Back to shop</a>";
    if (form) form.style.display = "none";
    return;
  }
  document.title = "Checkout — " + p.name;
  var unit = parseFloat(String(p.price).replace(/[^0-9.]/g, "")) || 0;

  function valid() {
    var ok = true;
    [["co-name"], ["co-email"], ["co-country"]].forEach(function (pair) {
      var el = document.getElementById(pair[0]);
      if (!el) return;
      var good = el.value.trim().length > 0 && (el.type !== "email" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim()));
      var err = document.getElementById(pair[0].replace("co-", "err-"));
      if (err) err.classList.toggle("on", !good);
      if (!good) ok = false;
    });
    return ok;
  }

  function done(msg) {
    summary.innerHTML = "<div class='co-done'>" + msg + "</div>";
    if (form) form.style.display = "none";
    showBlessing();
  }

  // blessing relay: one approved note from the pool, with honest attribution
  function showBlessing() {
    var box = document.getElementById("co-blessing");
    var pool = window.BLESSINGS || [];
    if (!box || !pool.length) return;
    var b = pool[Math.floor(Math.random() * pool.length)];
    box.innerHTML =
      '<div class="bless"><div class="bless-k">A note for you</div>' +
      '<div class="bless-q">&ldquo;' + b.t.replace(/</g, "&lt;") + '&rdquo;</div>' +
      '<div class="bless-f">— ' + b.f.replace(/</g, "&lt;") + "</div>" +
      '<div class="bless-more">When you\'re ready, <a href="blessing.html">leave a line for the next person</a>.</div></div>';
    box.hidden = false;
  }

  // ---- success return from Coinbase Commerce (redirect with ?status=success) ----
  if (qs.get("status") === "success") {
    var v = parseFloat(qs.get("v")) || unit;
    createOrder(p, v, "crypto", "paid");
    done("✅ Payment received! We'll message you on WhatsApp / email within a few hours to confirm your photo and the details of your piece.");
    return;
  }

  summary.innerHTML =
    "<div class='co-row'><strong>" + p.name + "</strong> &middot; " + p.price +
    " <span class='p-free'>free shipping</span></div><div class='co-sub'>" + p.tagline + "</div>";

  function amountNow() {
    var qty = Math.max(1, parseInt(document.getElementById("co-qty").value, 10) || 1);
    return { qty: qty, total: (unit * qty) };
  }

  function createOrder(prod, total, method, status) {
    var a = amountNow();
    var order = {
      id: "PW" + Date.now().toString(36).toUpperCase(),
      product_id: prod.id, product_name: prod.name,
      name: document.getElementById("co-name").value.trim(),
      email: document.getElementById("co-email").value.trim(),
      country: document.getElementById("co-country").value.trim(),
      qty: a.qty, amount: total, method: method, status: status || "paid"
    };
    // record order on backend (for the order-query system)
    fetch(API + "/api/orders", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(order) }).catch(function () {});
    // feed the analytics dashboard (transactions + purchase rate)
    if (window.EveryBelovedTrack) window.EveryBelovedTrack.event("purchase", { value: total });
  }

  function softNote(el, msg) {
    if (el) el.innerHTML = "<p class='co-note' style='margin:0'>" + msg + "</p>";
  }

  // ---- PayPal (SDK loads only when a real client id is configured) ----
  var ppBox = document.getElementById("paypal-button");
  var ppReady = PAYPAL_CLIENT_ID && PAYPAL_CLIENT_ID.indexOf("YOUR_") === -1;
  if (ppReady) {
    var s = document.createElement("script");
    s.src = "https://www.paypal.com/sdk/js?client-id=" + encodeURIComponent(PAYPAL_CLIENT_ID) + "&currency=USD";
    s.onload = function () {
      if (!window.paypal) { softNote(ppBox, "PayPal couldn't load — please use crypto below or message us on WhatsApp."); return; }
      paypal.Buttons({
        createOrder: function (data, actions) {
          if (!valid()) return;
          return actions.order.create({ purchase_units: [{ amount: { value: amountNow().total.toFixed(2) } }] });
        },
        onApprove: function (data, actions) {
          return actions.order.capture().then(function (details) {
            createOrder(p, amountNow().total, "paypal", "paid");
            done("✅ Payment received from " + details.payer.name.given_name + "! We'll confirm by WhatsApp / email shortly — send your pet's photo whenever you're ready.");
          });
        }
      }).render("#paypal-button");
    };
    s.onerror = function () { softNote(ppBox, "PayPal couldn't load — please use crypto below or message us on WhatsApp."); };
    document.head.appendChild(s);
  } else {
    softNote(ppBox, "PayPal checkout is being set up. For now: crypto below, or <a href='https://wa.me/8615982440421' target='_blank' rel='noopener'>message us on WhatsApp</a> and we'll sort out payment together.");
  }

  // ---- Crypto (Coinbase Commerce hosted checkout) ----
  var cryptoBtn = document.getElementById("crypto-button");
  if (COMMERCE_URL.indexOf("YOUR_CHECKOUT_ID") === -1) {
    cryptoBtn.href = COMMERCE_URL + "?success_url=" +
      encodeURIComponent(location.origin + location.pathname + "?status=success&id=" + id + "&v=" + unit);
  } else {
    cryptoBtn.outerHTML = "<p class='co-note' style='margin:0'>Hosted crypto checkout is being set up — use the direct USDT option below, or message us on WhatsApp and we'll send a payment link the same day.</p>";
  }

  // ---- Direct USDT (TRC-20): wallet address + one-tap copy ----
  var usdtBox = document.getElementById("usdt-box");
  if (usdtBox && USDT_ADDRESS && USDT_ADDRESS.length > 20) {
    document.getElementById("usdt-addr").textContent = USDT_ADDRESS;
    usdtBox.hidden = false;
    var copyBtn = document.getElementById("usdt-copy");
    copyBtn.addEventListener("click", function () {
      var done = function () { copyBtn.textContent = "Copied ✓"; setTimeout(function () { copyBtn.textContent = "Copy"; }, 1800); };
      try {
        if (navigator.clipboard) navigator.clipboard.writeText(USDT_ADDRESS).then(done, done);
        else done();
      } catch (e) { done(); }
    });
  }
})();
