const send = (data, status = 200) => new Response(JSON.stringify(data, null, 2), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });

export async function onRequest({ request, env }) {
  const path = new URL(request.url).pathname.replace(/\\/+$/, "") || "/";
  if (!["GET", "HEAD"].includes(request.method)) return send({ success: false, error: "Method not allowed" }, 405);
  if (path === "/api/health") {
    if (!env.DB) return send({ success: false, database_connected: false, error: "D1 binding DB belum tersedia" }, 503);
    try { await env.DB.prepare("SELECT 1 AS connection_test").first(); return send({ success: true, database_connected: true, message: "Koneksi D1 berhasil" }); }
    catch (e) { return send({ success: false, database_connected: false, error: String(e?.message || e) }, 500); }
  }
  if (path === "/api/schema") {
    if (!env.DB) return send({ success: false, error: "D1 binding DB belum tersedia" }, 503);
    try {
      const result = await env.DB.prepare("SELECT name, type FROM sqlite_master WHERE type IN ('table','view') AND name NOT LIKE 'sqlite_%' ORDER BY type, name").all();
      const objects = [];
      for (const obj of result.results || []) {
        const name = String(obj.name).replace(/\"/g, '\"\"');
        const columns = await env.DB.prepare(`PRAGMA table_info("${name}")`).all();
        objects.push({ name: obj.name, type: obj.type, columns: (columns.results || []).map(c => ({ name: c.name, type: c.type, pk: c.pk })) });
      }
      return send({ success: true, objects });
    } catch (e) { return send({ success: false, error: String(e?.message || e) }, 500); }
  }
  return send({ success: false, error: "Not found" }, 404);
}
