/* Pawmark — chat channels.
   Two ways customers reach you, both free:
   1) Tawk.to live chat (optional) — set window.TAWK_PROPERTY_ID below, then install
      the Tawk.to app on your phone and turn on push notifications. Setup steps
      are in site/docs/chat-setup.md.
   2) WhatsApp floating button — always on, works immediately, no signup.
   No third-party trackers. Self-contained styles so it works on every page. */
(function () {
  // ---- Tawk.to (property/widget path from your embed code: embed.tawk.to/<propertyId>/<widgetId>) ----
  window.TAWK_PROPERTY_ID = "6ad07bab921b0034cc067b04/1k4v666jt";

  var WHATSAPP = "https://wa.me/8615982440421?text=" + encodeURIComponent("Hi! I have a question about a keepsake");

  function style() {
    if (document.getElementById("pawmark-chat-style")) return;
    var s = document.createElement("style");
    s.id = "pawmark-chat-style";
    s.textContent = [
      /* floating chat button — vertically centred on the right edge, always visible */
      ".pw-wa{position:fixed;right:0;top:50%;transform:translateY(-50%);z-index:95;display:flex;align-items:center;gap:10px;background:#25D366;color:#fff;text-decoration:none;font:700 14px/1 'Segoe UI',system-ui,sans-serif;padding:17px 20px 17px 18px;border-radius:999px 0 0 999px;box-shadow:-6px 10px 30px rgba(18,84,54,.34);transition:padding .25s,box-shadow .25s,background .25s}",
      ".pw-wa:hover{padding-right:26px;background:#1fb457;box-shadow:-8px 14px 36px rgba(18,84,54,.42)}",
      ".pw-wa svg{width:21px;height:21px;flex:none}",
      ".pw-wa .pw-wa-txt{white-space:nowrap}",
      /* attention pulse ring */
      ".pw-wa::before{content:'';position:absolute;left:6px;top:50%;width:44px;height:44px;margin-top:-22px;border-radius:50%;background:rgba(37,211,102,.55);animation:pw-pulse 2.6s ease-out infinite;z-index:-1}",
      "@keyframes pw-pulse{0%{transform:scale(.7);opacity:.7}70%{transform:scale(1.5);opacity:0}100%{transform:scale(1.5);opacity:0}}",
      "@media(max-width:760px){.pw-wa{padding:15px;border-radius:999px 0 0 999px}.pw-wa .pw-wa-txt{display:none}.pw-wa::before{left:4px;width:38px;height:38px;margin-top:-19px}}",
      "@media(prefers-reduced-motion:reduce){.pw-wa::before{animation:none;display:none}}"
    ].join("");
    document.head.appendChild(s);
  }

  function waButton() {
    if (document.querySelector(".pw-wa")) return;
    var a = document.createElement("a");
    a.className = "pw-wa";
    a.href = WHATSAPP;
    a.target = "_blank";
    a.rel = "noopener";
    a.setAttribute("aria-label", "Chat with us on WhatsApp");
    a.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.5 14.4c-.3-.2-1.8-.9-2.1-1-.3-.1-.5-.2-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.2-1.2-.5-2.3-1.4-.8-.7-1.4-1.6-1.5-1.9-.2-.3 0-.5.1-.6.1-.1.3-.4.5-.6.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.2-.7-1.6-.9-2.2-.2-.5-.4-.5-.6-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1 2.8 1.1 3c.1.2 1.9 3 4.7 4.1 2.3.9 2.8.8 3.3.7.5-.1 1.6-.6 1.8-1.3.2-.7.2-1.2.2-1.3-.1-.2-.2-.2-.4-.3z"/><path d="M12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.4 1.3 4.8L2 22l5.4-1.4c1.3.7 2.9 1.2 4.6 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18.2c-1.6 0-3-.4-4.3-1.2l-.3-.2-3.2.8.8-3.1-.2-.3c-.8-1.3-1.2-2.8-1.2-4.4 0-4.6 3.7-8.3 8.3-8.3s8.3 3.7 8.3 8.3-3.7 8.4-8.3 8.4z"/></svg><span class="pw-wa-txt">Chat with us</span>';
    document.body.appendChild(a);
  }

  function tawk() {
    var id = window.TAWK_PROPERTY_ID;
    if (!id) return; // not configured yet — WhatsApp button still works
    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://embed.tawk.to/" + id;
    s.charset = "UTF-8";
    // NOTE: no `crossorigin` attribute — Tawk's own snippet sets crossorigin="*",
    // which is an invalid value that forces CORS mode and gets the script blocked.
    document.head.appendChild(s);
  }

  function boot() {
    style();
    waButton();
    tawk();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
