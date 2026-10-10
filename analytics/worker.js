// Eidon Analytics — Cloudflare Worker (collector + stats API + static dashboard)
// Serves the dashboard at the worker URL and exposes /api/collect and /api/stats.
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === "OPTIONS") return new Response(null, { headers: cors() });

    // ---- collect an event (pageview / purchase / custom) ----
    if (path === "/api/collect" && request.method === "POST") {
      let b = {};
      try { b = await request.json(); } catch (_) {}
      const type = String(b.type || "pageview").slice(0, 32);
      const page = String(b.path || "/").slice(0, 200);
      const ref  = String(b.referrer || "").slice(0, 300);
      const value = Number(b.value) || 0;
      const day = new Date().toISOString().slice(0, 10);
      await env.DB.prepare(
        "INSERT INTO events (ts,type,path,referrer,value,day) VALUES (?,?,?,?,?,?)"
      ).bind(Date.now(), type, page, ref, value, day).run();
      return json({ ok: true }, cors());
    }

    // ---- aggregated stats ----
    if (path === "/api/stats") {
      const days = Math.min(365, Math.max(1, parseInt(url.searchParams.get("days") || "30", 10)));
      const since = new Date(Date.now() - (days - 1) * 86400000).toISOString().slice(0, 10);

      const daily = await env.DB.prepare(
        `SELECT day,
                SUM(CASE WHEN type='pageview' THEN 1 ELSE 0 END) AS visits,
                SUM(CASE WHEN type='purchase' THEN 1 ELSE 0 END) AS purchases,
                SUM(CASE WHEN type='purchase' THEN value ELSE 0 END) AS revenue
         FROM events WHERE day >= ? GROUP BY day ORDER BY day`
      ).bind(since).all();

      const topPages = await env.DB.prepare(
        `SELECT path, COUNT(*) c FROM events WHERE type='pageview' AND day >= ? GROUP BY path ORDER BY c DESC LIMIT 8`
      ).bind(since).all();

      const topRefs = await env.DB.prepare(
        `SELECT referrer, COUNT(*) c FROM events WHERE type='pageview' AND referrer <> '' AND day >= ? GROUP BY referrer ORDER BY c DESC LIMIT 8`
      ).bind(since).all();

      const t = await env.DB.prepare(
        `SELECT SUM(CASE WHEN type='pageview' THEN 1 ELSE 0 END) AS visits,
                SUM(CASE WHEN type='purchase' THEN 1 ELSE 0 END) AS purchases,
                SUM(CASE WHEN type='purchase' THEN value ELSE 0 END) AS revenue
         FROM events WHERE day >= ?`
      ).bind(since).all();

      const tot = t.results[0] || { visits: 0, purchases: 0, revenue: 0 };
      const conv = tot.visits ? (tot.purchases / tot.visits) * 100 : 0;

      return json({
        days: daily.results,
        topPages: topPages.results,
        topReferrers: topRefs.results,
        totals: tot,
        conversion: conv
      }, cors());
    }

    // ---- serve the static dashboard (public/index.html) ----
    if (env.ASSETS) return env.ASSETS.fetch(request);
    return new Response("Eidon Analytics", { headers: { "content-type": "text/plain" } });
  }
};

function json(o, h) {
  return new Response(JSON.stringify(o), {
    headers: { ...h, "content-type": "application/json" }
  });
}
function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "content-type"
  };
}
