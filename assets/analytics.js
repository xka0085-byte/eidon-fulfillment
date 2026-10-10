/* Eidon Analytics — store-side tracker.
   Drop this on every store page (just before </body>).
   Sends a 'pageview' on load; call window.EidonTrack.event('purchase',{value:24.99})
   from the checkout success handler so transactions + purchase rate show up. */
(function () {
  // TODO: set to your deployed worker URL (e.g. https://eidon-analytics.xxx.workers.dev)
  var WORKER = "https://eidon-analytics.YOURSUB.workers.dev";

  function send(type, extra) {
    try {
      var data = Object.assign(
        { type: type, path: location.pathname, referrer: document.referrer || "" },
        extra || {}
      );
      var blob = new Blob([JSON.stringify(data)], { type: "application/json" });
      if (navigator.sendBeacon) navigator.sendBeacon(WORKER + "/api/collect", blob);
      else fetch(WORKER + "/api/collect", { method: "POST", body: blob, headers: { "content-type": "application/json" }, keepalive: true });
    } catch (e) {}
  }

  window.EidonTrack = { event: function (t, e) { send(t, e); } };

  if (document.readyState !== "loading") send("pageview");
  else document.addEventListener("DOMContentLoaded", function () { send("pageview"); });
})();
