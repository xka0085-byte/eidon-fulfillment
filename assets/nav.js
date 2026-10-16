/* EveryBeloved — mobile navigation.
   Adds a hamburger toggle to the site header. Desktop is untouched:
   the compact nav (<760px) is replaced by a tappable menu panel. */
(function () {
  function boot() {
    var header = document.querySelector("header.site");
    var nav = header && header.querySelector("nav");
    if (!header || !nav || header.querySelector(".nav-toggle")) return;

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "nav-toggle";
    btn.setAttribute("aria-label", "Open menu");
    btn.setAttribute("aria-expanded", "false");
    btn.innerHTML = "<span></span><span></span><span></span>";
    (header.querySelector(".wrap") || header).appendChild(btn);

    function close() {
      header.classList.remove("nav-open");
      btn.setAttribute("aria-expanded", "false");
      btn.setAttribute("aria-label", "Open menu");
    }
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = !header.classList.contains("nav-open");
      header.classList.toggle("nav-open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    nav.addEventListener("click", function (e) { if (e.target.tagName === "A") close(); });
    document.addEventListener("click", function (e) { if (!header.contains(e.target)) close(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
