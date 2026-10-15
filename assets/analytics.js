/* Pawmark Analytics — store-side tracker.
   Drop this on every store page (just before </body>).
   Sends a 'pageview' on load; call window.PawmarkTrack.event('purchase',{value:34.99})
   from the checkout success handler so transactions + purchase rate show up. */
(function () {
  // TODO: set to your deployed worker URL (e.g. https://eidon-analytics.xxx.workers.dev)
  var WORKER = "https://eidon-analytics.xka0085.workers.dev";

  function send(type, extra) {
    try {
      var data = Object.assign(
        { type: type, path: location.pathname, referrer: document.referrer || "" },
        extra || {}
      );
      // text/plain keeps this a "simple request" — no CORS preflight, works cross-origin
      var blob = new Blob([JSON.stringify(data)], { type: "text/plain" });
      if (navigator.sendBeacon) navigator.sendBeacon(WORKER + "/api/collect", blob);
      else fetch(WORKER + "/api/collect", { method: "POST", body: blob, keepalive: true });
    } catch (e) {}
  }

  window.PawmarkTrack = { event: function (t, e) { send(t, e); } };

  if (document.readyState !== "loading") send("pageview");
  else document.addEventListener("DOMContentLoaded", function () { send("pageview"); });
})();
