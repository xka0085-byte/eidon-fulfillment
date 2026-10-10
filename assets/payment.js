/* Eidon checkout logic — collects buyer details, creates an order on the backend,
   then fires the analytics purchase event. PayPal Smart Button + Coinbase Commerce.
   Replace the two placeholders below with your real keys / checkout URLs. */
(function () {
  // same backend as the dashboard/admin — set to your deployed worker URL
  var API = "https://eidon-analytics.YOURSUB.workers.dev";

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

  function done(msg) {
    summary.innerHTML = "<div class='co-done'>" + msg + "</div>";
    if (form) form.style.display = "none";
  }

  // ---- success return from Coinbase Commerce (redirect with ?status=success) ----
  if (qs.get("status") === "success") {
    var v = parseFloat(qs.get("v")) || unit;
    createOrder(p, v, "crypto", "paid");
    done("✅ Payment received! I'll message you on WhatsApp / email within a few hours to confirm and send QC photos.");
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
      id: "EID" + Date.now().toString(36).toUpperCase(),
      product_id: prod.id, product_name: prod.name,
      name: document.getElementById("co-name").value.trim(),
      email: document.getElementById("co-email").value.trim(),
      country: document.getElementById("co-country").value.trim(),
      qty: a.qty, amount: total, method: method, status: status || "paid"
    };
    // record order on backend (for the order-query system)
    fetch(API + "/api/orders", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(order) }).catch(function () {});
    // feed the analytics dashboard (transactions + purchase rate)
    if (window.EidonTrack) window.EidonTrack.event("purchase", { value: total });
  }

  // ---- PayPal ----
  if (window.paypal) {
    paypal.Buttons({
      createOrder: function (data, actions) {
        return actions.order.create({ purchase_units: [{ amount: { value: amountNow().total.toFixed(2) } }] });
      },
      onApprove: function (data, actions) {
        return actions.order.capture().then(function (details) {
          createOrder(p, amountNow().total, "paypal", "paid");
          done("✅ Payment received from " + details.payer.name.given_name + "! I'll confirm by WhatsApp / email shortly.");
        });
      }
    }).render("#paypal-button");
  } else {
    document.getElementById("paypal-button").innerHTML =
      "<em style='color:#b00'>PayPal not configured — set client-id in checkout.html.</em>";
  }

  // ---- Crypto (Coinbase Commerce hosted checkout) ----
  var COMMERCE_URL = "https://commerce.coinbase.com/checkout/YOUR_CHECKOUT_ID";
  var cryptoBtn = document.getElementById("crypto-button");
  if (COMMERCE_URL.indexOf("YOUR_CHECKOUT_ID") === -1) {
    cryptoBtn.href = COMMERCE_URL + "?success_url=" +
      encodeURIComponent(location.origin + location.pathname + "?status=success&id=" + id + "&v=" + unit);
  } else {
    cryptoBtn.outerHTML = "<em style='color:#b00'>Crypto not configured — paste your Coinbase Commerce checkout URL in assets/payment.js.</em>";
  }
})();
