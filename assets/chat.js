/* Pawmark — chat channels.
   We own the launcher UI (brand-styled, no close "×"); Tawk.to provides the
   chat backend + mobile app push. Tawk's own bubble is hidden on load.
   Fallback: if Tawk isn't configured or its API isn't ready, the main button
   opens WhatsApp instead.
   Setup + phone-notification steps: site/docs/chat-setup.md */
(function () {
  // Tawk.to property/widget path from the embed code: embed.tawk.to/<propertyId>/<widgetId>
  window.TAWK_PROPERTY_ID = "6ad07bab921b0034cc067b04/1k4v666jt";

  var WA_TEXT = encodeURIComponent("Hi! I have a question about a keepsake");
  var WHATSAPP = "https://wa.me/8615982440421?text=" + WA_TEXT;

  var ICON_CHAT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 01-9 8.4 8.6 8.6 0 01-3.8-.9L3 21l1.9-5.1a8.4 8.4 0 1116.1-4.4z"/></svg>';
  var ICON_WA = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.5 14.4c-.3-.2-1.8-.9-2.1-1-.3-.1-.5-.2-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.2-1.2-.5-2.3-1.4-.8-.7-1.4-1.6-1.5-1.9-.2-.3 0-.5.1-.6.1-.1.3-.4.5-.6.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.2-.7-1.6-.9-2.2-.2-.5-.4-.5-.6-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1 2.8 1.1 3c.1.2 1.9 3 4.7 4.1 2.3.9 2.8.8 3.3.7.5-.1 1.6-.6 1.8-1.3.2-.7.2-1.2.2-1.3-.1-.2-.2-.2-.4-.3z"/><path d="M12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.4 1.3 4.8L2 22l5.4-1.4c1.3.7 2.9 1.2 4.6 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18.2c-1.6 0-3-.4-4.3-1.2l-.3-.2-3.2.8.8-3.1-.2-.3c-.8-1.3-1.2-2.8-1.2-4.4 0-4.6 3.7-8.3 8.3-8.3s8.3 3.7 8.3 8.3-3.7 8.4-8.3 8.4z"/></svg>';

  function style() {
    if (document.getElementById("pawmark-chat-style")) return;
    var s = document.createElement("style");
    s.id = "pawmark-chat-style";
    s.textContent = [
      /* our own launcher, vertically centred on the right edge */
      ".pw-dock{position:fixed;right:0;top:50%;transform:translateY(-50%);z-index:95;display:flex;flex-direction:column;align-items:flex-end;gap:10px}",
      ".pw-chat{position:relative;display:flex;align-items:center;gap:10px;border:0;cursor:pointer;background:#3b4f45;color:#fff;font:700 14px/1 'Segoe UI',system-ui,sans-serif;padding:17px 20px 17px 18px;border-radius:999px 0 0 999px;box-shadow:-6px 10px 30px rgba(38,60,51,.34);transition:padding-right .25s,background .25s}",
      ".pw-chat:hover{padding-right:27px;background:#2f4038}",
      ".pw-chat svg{width:21px;height:21px;flex:none}",
      ".pw-chat .lbl{white-space:nowrap}",
      ".pw-chat::before{content:'';position:absolute;left:5px;top:50%;width:46px;height:46px;margin-top:-23px;border-radius:50%;background:rgba(91,116,102,.5);animation:pw-pulse 2.8s ease-out infinite;z-index:-1}",
      "@keyframes pw-pulse{0%{transform:scale(.7);opacity:.7}70%{transform:scale(1.55);opacity:0}100%{transform:scale(1.55);opacity:0}}",
      /* small secondary WhatsApp circle */
      ".pw-wa2{display:flex;align-items:center;justify-content:center;width:46px;height:46px;margin-right:12px;border-radius:50%;background:#25D366;color:#fff;box-shadow:0 8px 22px rgba(18,84,54,.3);transition:transform .25s}",
      ".pw-wa2:hover{transform:scale(1.08)}",
      ".pw-wa2 svg{width:22px;height:22px}",
      "@media(max-width:760px){.pw-chat{padding:15px;border-radius:999px 0 0 999px}.pw-chat .lbl{display:none}.pw-wa2{width:42px;height:42px;margin-right:8px}}",
      "@media(prefers-reduced-motion:reduce){.pw-chat::before{animation:none;display:none}}"
    ].join("");
    document.head.appendChild(s);
  }

  function launcher() {
    if (document.querySelector(".pw-dock")) return;
    var dock = document.createElement("div");
    dock.className = "pw-dock";
    dock.innerHTML =
      '<button type="button" class="pw-chat" aria-label="Open live chat">' + ICON_CHAT + '<span class="lbl">Chat with us</span></button>' +
      '<a class="pw-wa2" href="' + WHATSAPP + '" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">' + ICON_WA + "</a>";
    document.body.appendChild(dock);

    dock.querySelector(".pw-chat").addEventListener("click", function () {
      // open the Tawk chat panel; fall back to WhatsApp if Tawk isn't ready
      if (window.Tawk_API && typeof window.Tawk_API.maximize === "function") {
        try {
          if (typeof window.Tawk_API.showWidget === "function") window.Tawk_API.showWidget();
          window.Tawk_API.maximize();
          return;
        } catch (e) { /* fall through to WhatsApp */ }
      }
      window.open(WHATSAPP, "_blank", "noopener");
    });
  }

  function tawk() {
    var id = window.TAWK_PROPERTY_ID;
    if (!id) return; // not configured — the main button falls back to WhatsApp
    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();
    // hide Tawk's own launcher bubble — we use our branded button instead
    window.Tawk_API.onLoad = function () {
      try { if (typeof window.Tawk_API.hideWidget === "function") window.Tawk_API.hideWidget(); } catch (e) {}
    };
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://embed.tawk.to/" + id;
    s.charset = "UTF-8";
    // NOTE: no `crossorigin` attribute — Tawk's snippet sets crossorigin="*",
    // an invalid value that forces CORS mode and gets the script blocked.
    document.head.appendChild(s);
  }

  function boot() {
    style();
    launcher();
    tawk();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
