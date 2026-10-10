/* Eidon checkout logic — PayPal Smart Button + Coinbase Commerce redirect.
   Replace the two placeholders below with your real keys / checkout URLs. */
(function () {
  var qs = new URLSearchParams(location.search);
  var id = qs.get("id");
  var P = window.PRODUCTS || [];
  var p = P.filter(function (x) { return x.id === id; })[0];
  var summary = document.getElementById("co-summary");
  var methods = document.getElementById("co-methods");

  if (!p) {
    summary.innerHTML = "Product not found. <a href='shop.html'>Back to shop</a>";
    if (methods) methods.style.display = "none";
    return;
  }
  document.title = "Checkout — " + p.name;
  var amount = parseFloat(String(p.price).replace(/[^0-9.]/g, "")) || 0;

  function done(msg) {
    summary.innerHTML = "<div class='co-done'>" + msg + "</div>";
    if (methods) methods.style.display = "none";
  }

  // ---- success return from Coinbase Commerce (redirect with ?status=success) ----
  if (qs.get("status") === "success") {
    if (window.EidonTrack) window.EidonTrack.event("purchase", { value: amount });
    done("✅ Payment received! I'll message you on WhatsApp / email within a few hours to confirm and send QC photos. Order total: $" + amount.toFixed(2));
    return;
  }

  summary.innerHTML =
    "<div class='co-row'><strong>" + p.name + "</strong> &middot; " + p.price +
    " <span class='p-free'>free shipping</span></div><div class='co-sub'>" + p.tagline + "</div>";

  // ---- PayPal ----
  if (window.paypal) {
    paypal.Buttons({
      createOrder: function (data, actions) {
        return actions.order.create({ purchase_units: [{ amount: { value: amount.toFixed(2) } }] });
      },
      onApprove: function (data, actions) {
        return actions.order.capture().then(function (details) {
          if (window.EidonTrack) window.EidonTrack.event("purchase", { value: amount });
          done("✅ Payment received from " + details.payer.name.given_name + "! I'll confirm by WhatsApp / email shortly. Total: $" + amount.toFixed(2));
        });
      }
    }).render("#paypal-button");
  } else {
    document.getElementById("paypal-button").innerHTML =
      "<em style='color:#b00'>PayPal not configured — set client-id in checkout.html.</em>";
  }

  // ---- Crypto (Coinbase Commerce hosted checkout) ----
  // Create a checkout in Commerce dashboard, then paste its URL below.
  // The success_url brings the buyer back here with ?status=success so we log the purchase.
  var COMMERCE_URL = "https://commerce.coinbase.com/checkout/YOUR_CHECKOUT_ID";
  var cryptoBtn = document.getElementById("crypto-button");
  if (COMMERCE_URL.indexOf("YOUR_CHECKOUT_ID") === -1) {
    cryptoBtn.href = COMMERCE_URL + "?success_url=" +
      encodeURIComponent(location.origin + location.pathname + "?status=success&id=" + id + "&v=" + amount);
  } else {
    cryptoBtn.outerHTML = "<em style='color:#b00'>Crypto not configured — paste your Coinbase Commerce checkout URL in assets/payment.js.</em>";
  }
})();
