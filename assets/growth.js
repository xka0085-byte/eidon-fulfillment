/* Pawmark growth kit — free-acquisition front-end.
   1) First-order discount banner (WELCOME10)
   2) Email capture popup (welcome offer + first look at new keepsakes)
   Captures POST to the backend (/api/subscribe) when deployed; degrades gracefully if not.
   No third-party trackers. Self-contained styles so it works on every page. */
(function () {
  // same backend as the dashboard/admin (deployed Cloudflare Worker)
  var API_BASE = "https://eidon-analytics.xka0085.workers.dev";
  var DISCOUNT = "WELCOME10";
  var KEY = "pawmark_growth_v1";

  function seen() { try { return localStorage.getItem(KEY) === "1"; } catch (e) { return false; } }
  function markSeen() { try { localStorage.setItem(KEY, "1"); } catch (e) {} }

  function style() {
    if (document.getElementById("pawmark-growth-style")) return;
    var s = document.createElement("style");
    s.id = "pawmark-growth-style";
    s.textContent = [
      ".eg-banner{position:relative;z-index:60;background:#3b4f45;color:#f7f4ee;text-align:center;font:600 13.5px/1.4 'Segoe UI',system-ui,sans-serif;padding:9px 14px;letter-spacing:.01em}",
      ".eg-banner b{color:#d9c9a3;letter-spacing:.06em}",
      ".eg-banner a{color:#f7f4ee;text-decoration:underline;margin-left:8px;white-space:nowrap}",
      ".eg-ov{position:fixed;inset:0;z-index:9999;background:rgba(20,28,24,.55);display:none;align-items:center;justify-content:center;padding:18px}",
      ".eg-ov.on{display:flex}",
      ".eg-modal{position:relative;background:#fffdf8;color:#26221b;max-width:400px;width:100%;border-radius:18px;padding:26px 24px 22px;box-shadow:0 24px 60px rgba(0,0,0,.35);font-family:'Segoe UI',system-ui,sans-serif}",
      ".eg-modal h3{margin:0 0 6px;font-size:20px;color:#3b4f45}",
      ".eg-modal p{margin:0 0 14px;font-size:14px;color:#7d7466;line-height:1.55}",
      ".eg-modal .eg-code{display:inline-block;background:#3b4f45;color:#fff;font-weight:700;letter-spacing:.08em;padding:5px 12px;border-radius:8px;margin-bottom:14px}",
      ".eg-modal input{width:100%;box-sizing:border-box;padding:12px 13px;border:1px solid #e4dccd;border-radius:10px;font-size:15px;margin-bottom:10px}",
      ".eg-modal .eg-submit{display:block;width:100%;padding:12px;border:0;border-radius:999px;background:#26221b;color:#f7f4ee;font-weight:700;font-size:15px;cursor:pointer}",
      ".eg-modal .eg-submit:hover{background:#3b4f45}",
      ".eg-modal .eg-no{display:block;text-align:center;margin-top:10px;font-size:12.5px;color:#a79f92;cursor:pointer;text-decoration:underline}",
      ".eg-modal button.eg-x{position:absolute;top:6px;right:10px;width:auto;height:auto;padding:0;border:0;background:none;font-size:24px;line-height:1;color:#b5ac9d;cursor:pointer}",
      ".eg-ok{font-size:14.5px;color:#3b4f45;font-weight:600;line-height:1.6}"
    ].join("");
    document.head.appendChild(s);
  }

  function banner() {
    if (document.querySelector(".eg-banner")) return;
    var b = document.createElement("div");
    b.className = "eg-banner";
    b.innerHTML = "New here? Use code <b>" + DISCOUNT + "</b> for 10% off your first order. " +
                  "<a href='shop.html'>Shop the collection &rarr;</a>";
    document.body.insertBefore(b, document.body.firstChild);
  }

  function save(email, cb) {
    // best-effort: record to backend when deployed; never block the UX
    try {
      fetch(API_BASE + "/api/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: email, source: location.pathname, ts: Date.now() })
      }).then(function () { cb && cb(); }).catch(function () { cb && cb(); });
    } catch (e) { cb && cb(); }
    if (window.PawmarkTrack) { try { window.PawmarkTrack.event("email_capture", {}); } catch (e) {} }
  }

  function popup() {
    if (seen() || document.querySelector(".eg-ov")) return;
    var ov = document.createElement("div");
    ov.className = "eg-ov";
    ov.innerHTML =
      "<div class='eg-modal' role='dialog' aria-modal='true' aria-label='Get 10% off'>" +
      "<button class='eg-x' aria-label='Close'>&times;</button>" +
      "<h3>Get 10% off your first order</h3>" +
      "<p>Join the list for first look at new keepsakes and gentle resources for pet loss. Unsubscribe anytime.</p>" +
      "<div class='eg-code'>" + DISCOUNT + "</div>" +
      "<input type='email' placeholder='you@email.com' aria-label='Email'>" +
      "<button class='eg-submit'>Send my code</button>" +
      "<span class='eg-no'>No thanks, I'll pay full price</span>" +
      "</div>";
    document.body.appendChild(ov);
    requestAnimationFrame(function () { ov.classList.add("on"); });

    function close() { ov.classList.remove("on"); markSeen(); setTimeout(function () { ov.remove(); }, 200); }
    ov.querySelector(".eg-x").onclick = close;
    ov.querySelector(".eg-no").onclick = close;
    ov.onclick = function (e) { if (e.target === ov) close(); };
    var input = ov.querySelector("input");
    ov.querySelector("button:not(.eg-x)").onclick = function () {
      var v = (input.value || "").trim();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) { input.style.borderColor = "#a4553f"; input.focus(); return; }
      var btn = this; btn.textContent = "Saving…"; btn.disabled = true;
      save(v, function () {
        ov.querySelector(".eg-modal").innerHTML =
          "<button class='eg-x' aria-label='Close'>&times;</button>" +
          "<div class='eg-ok'>✅ You're in! Use code <b>" + DISCOUNT + "</b> at checkout for 10% off.<br><br>" +
          "We'll email first-look keepsakes and restock alerts.</div>";
        ov.querySelector(".eg-x").onclick = close;
      });
    };
    input.addEventListener("keydown", function (e) { if (e.key === "Enter") ov.querySelector("button:not(.eg-x)").click(); });
  }

  function boot() {
    style();
    banner();
    // trigger popup after 18s, or on exit-intent, whichever first (guard: not in the first 6s)
    var t0 = Date.now();
    var t = setTimeout(popup, 18000);
    document.addEventListener("mouseout", function (e) {
      if (!seen() && e.clientY <= 0 && Date.now() - t0 > 6000) { clearTimeout(t); popup(); }
    }, { once: false });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
