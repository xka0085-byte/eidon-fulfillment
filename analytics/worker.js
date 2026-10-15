// Eidon backend — Cloudflare Worker
// One backend for three jobs:
//   1. analytics  : /api/collect (track) + /api/stats (dashboard)
//   2. products   : /api/products  (public GET = store live feed; admin POST/PUT/DELETE)
//   3. orders     : /api/orders    (POST from checkout; admin GET/PUT to query & update)
// Static UI is served from ./public (index.html = dashboard, admin.html = admin).
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    if (request.method === "OPTIONS") return new Response(null, { headers: cors(request) });

    // ---------------- PRODUCTS ----------------
    if (path === "/api/products") {
      if (request.method === "GET") {
        const r = await env.DB.prepare("SELECT id,data FROM products").all();
        const list = (r.results || [])
          .map(x => { try { return JSON.parse(x.data); } catch (e) { return null; } })
          .filter(Boolean);
        return json(list, cors(request));
      }
      if (!adminOk(request, env)) return json({ error: "unauthorized" }, cors(request), 401);
      if (request.method === "POST" || request.method === "PUT") {
        let b = {}; try { b = await request.json(); } catch (_) {}
        if (!b || !b.id) return json({ error: "id required" }, cors(request), 400);
        await env.DB.prepare("INSERT OR REPLACE INTO products (id,data,updated) VALUES (?,?,?)")
          .bind(b.id, JSON.stringify(b), Date.now()).run();
        return json({ ok: true, id: b.id }, cors(request));
      }
      if (request.method === "DELETE") {
        const id = url.searchParams.get("id");
        if (!id) return json({ error: "id required" }, cors(request), 400);
        await env.DB.prepare("DELETE FROM products WHERE id=?").bind(id).run();
        return json({ ok: true }, cors(request));
      }
    }

    // ---------------- ORDERS ----------------
    if (path === "/api/orders") {
      if (request.method === "POST") {
        // called from checkout (client). MVP: trusted after payment success.
        // Production: verify via PayPal webhook / Coinbase webhook before fulfilment.
        let b = {}; try { b = await request.json(); } catch (_) {}
        const id = b.id || ("EID" + Date.now().toString(36).toUpperCase());
        const day = new Date().toISOString().slice(0, 10);
        await env.DB.prepare("INSERT OR REPLACE INTO orders (id,data,ts,day,status) VALUES (?,?,?,?,?)")
          .bind(id, JSON.stringify(b), Date.now(), day, b.status || "paid").run();
        return json({ ok: true, id }, cors(request));
      }
      if (!adminOk(request, env)) return json({ error: "unauthorized" }, cors(request), 401);
      if (request.method === "GET") {
        const q = (url.searchParams.get("q") || "").toLowerCase();
        const status = url.searchParams.get("status") || "";
        const r = await env.DB.prepare("SELECT id,data,ts,status FROM orders ORDER BY ts DESC LIMIT 400").all();
        let list = (r.results || [])
          .map(x => { try { return Object.assign({ id: x.id, ts: x.ts, status: x.status }, JSON.parse(x.data)); } catch (e) { return null; } })
          .filter(Boolean);
        if (q) list = list.filter(o => (o.id + " " + (o.email || "") + " " + (o.name || "") + " " + (o.product_name || "")).toLowerCase().includes(q));
        if (status) list = list.filter(o => o.status === status);
        return json(list, cors(request));
      }
      if (request.method === "PUT") {
        let b = {}; try { b = await request.json(); } catch (_) {}
        if (!b || !b.id) return json({ error: "id required" }, cors(request), 400);
        await env.DB.prepare("INSERT OR REPLACE INTO orders (id,data,ts,day,status) VALUES (?,?,?,?,?)")
          .bind(b.id, JSON.stringify(b), b.ts || Date.now(), b.day || new Date().toISOString().slice(0, 10), b.status || "paid").run();
        return json({ ok: true }, cors(request));
      }
    }

    // ---------------- SUBSCRIBERS (email capture, free-acquisition asset) ----------------
    if (path === "/api/subscribe") {
      if (request.method === "POST") {
        let b = {}; try { b = await request.json(); } catch (_) {}
        const email = String(b.email || "").trim().toLowerCase().slice(0, 200);
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json({ error: "invalid email" }, cors(request), 400);
        const src = String(b.source || "").slice(0, 200);
        const day = new Date().toISOString().slice(0, 10);
        await env.DB.prepare("INSERT OR IGNORE INTO subscribers (email,source,ts,day) VALUES (?,?,?,?)")
          .bind(email, src, Date.now(), day).run();
        return json({ ok: true }, cors(request));
      }
      if (!adminOk(request, env)) return json({ error: "unauthorized" }, cors(request), 401);
      if (request.method === "GET") {
        const r = await env.DB.prepare("SELECT email,source,ts,day FROM subscribers ORDER BY ts DESC LIMIT 500").all();
        return json(r.results || [], cors(request));
      }
    }

    // ---------------- ANALYTICS ----------------
    if (path === "/api/collect" && request.method === "POST") {
      let b = {}; try { b = await request.json(); } catch (_) {}
      const type = String(b.type || "pageview").slice(0, 32);
      const page = String(b.path || "/").slice(0, 200);
      const ref = String(b.referrer || "").slice(0, 300);
      const value = Number(b.value) || 0;
      const day = new Date().toISOString().slice(0, 10);
      await env.DB.prepare("INSERT INTO events (ts,type,path,referrer,value,day) VALUES (?,?,?,?,?,?)")
        .bind(Date.now(), type, page, ref, value, day).run();
      return json({ ok: true }, cors(request));
    }
    if (path === "/api/stats") {
      const days = Math.min(365, Math.max(1, parseInt(url.searchParams.get("days") || "30", 10)));
      const since = new Date(Date.now() - (days - 1) * 86400000).toISOString().slice(0, 10);
      const daily = await env.DB.prepare(
        `SELECT day,
                SUM(CASE WHEN type='pageview' THEN 1 ELSE 0 END) AS visits,
                SUM(CASE WHEN type='purchase' THEN 1 ELSE 0 END) AS purchases,
                SUM(CASE WHEN type='purchase' THEN value ELSE 0 END) AS revenue
         FROM events WHERE day >= ? GROUP BY day ORDER BY day`).bind(since).all();
      const topPages = await env.DB.prepare(
        `SELECT path, COUNT(*) c FROM events WHERE type='pageview' AND day >= ? GROUP BY path ORDER BY c DESC LIMIT 8`).bind(since).all();
      const topRefs = await env.DB.prepare(
        `SELECT referrer, COUNT(*) c FROM events WHERE type='pageview' AND referrer <> '' AND day >= ? GROUP BY referrer ORDER BY c DESC LIMIT 8`).bind(since).all();
      const t = await env.DB.prepare(
        `SELECT SUM(CASE WHEN type='pageview' THEN 1 ELSE 0 END) AS visits,
                SUM(CASE WHEN type='purchase' THEN 1 ELSE 0 END) AS purchases,
                SUM(CASE WHEN type='purchase' THEN value ELSE 0 END) AS revenue
         FROM events WHERE day >= ?`).bind(since).all();
      const tot = t.results[0] || { visits: 0, purchases: 0, revenue: 0 };
      const conv = tot.visits ? (tot.purchases / tot.visits) * 100 : 0;
      return json({ days: daily.results, topPages: topPages.results, topReferrers: topRefs.results, totals: tot, conversion: conv }, cors(request));
    }

    // ---------------- STATIC UI (dashboard + admin) ----------------
    if (env.ASSETS) return env.ASSETS.fetch(request);
    return new Response("Eidon Backend", { headers: { "content-type": "text/plain" } });
  }
};

function adminOk(req, env) {
  const t = req.headers.get("x-admin-token") || new URL(req.url).searchParams.get("token");
  return !!(t && env.ADMIN_TOKEN && t === env.ADMIN_TOKEN);
}
function json(o, h, status) {
  return new Response(JSON.stringify(o), { status: status || 200, headers: { ...h, "content-type": "application/json" } });
}
function cors(request) {
  // echo the request origin (wildcard ACAO fails credentialed requests and some preflights)
  var origin = (request && request.headers && request.headers.get("Origin")) || "*";
  var h = {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "content-type,x-admin-token",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };
  if (origin !== "*") h["Access-Control-Allow-Credentials"] = "true";
  return h;
}
