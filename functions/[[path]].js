function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff"
    }
  });
}

export async function onRequest(context) {
  const { request, env, next } = context;

  // Normalisasi URL.
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, "") || "/";

  // Fungsi ini hanya menangani endpoint API.
  // File HTML, CSS, dan file statis tetap dilayani Pages.
  if (!path.startsWith("/api/")) {
    return next();
  }

  // API hanya menerima GET dan HEAD.
  if (request.method !== "GET" && request.method !== "HEAD") {
    return json(
      {
        ok: false,
        error: "Method tidak diizinkan."
      },
      405
    );
  }

  // Pastikan binding D1 tersedia.
  if (!env.DB) {
    return json(
      {
        ok: false,
        database_connected: false,
        error:
          "Binding D1 bernama DB tidak ditemukan. Periksa pengaturan Cloudflare Pages."
      },
      503
    );
  }

  try {
    // ==========================================
    // API 1: TES KONEKSI DATABASE
    // GET /api/health
    // ==========================================
    if (path === "/api/health") {
      const result = await env.DB
        .prepare("SELECT 1 AS connection_test")
        .first();

      return json({
        ok: true,
        database_connected: result?.connection_test === 1,
        message:
          result?.connection_test === 1
            ? "Koneksi Cloudflare D1 berhasil."
            : "Koneksi D1 gagal.",
        database: "Cloudflare D1",
        test: result
      });
    }

    // ==========================================
    // API 2: MEMBACA DAFTAR TABEL
    // GET /api/schema
    // ==========================================
if (path === "/api/schema") {
  const checks = [];

  // Tes 1: baca nama database
  try {
    const result = await env.DB
      .prepare("PRAGMA database_list")
      .all();

    checks.push({
      test: "database_list",
      ok: true,
      result: result.results
    });
  } catch (error) {
    checks.push({
      test: "database_list",
      ok: false,
      error: error.message
    });
  }

  // Tes 2: baca metadata tabel
  try {
    const result = await env.DB
      .prepare(`
        SELECT name
        FROM sqlite_master
        WHERE type = 'table'
        ORDER BY name
      `)
      .all();

    checks.push({
      test: "sqlite_master",
      ok: true,
      tables: result.results
    });
  } catch (error) {
    checks.push({
      test: "sqlite_master",
      ok: false,
      error: error.message
    });
  }

  // Tes 3: baca schema menggunakan table-valued PRAGMA
  try {
    const result = await env.DB
      .prepare("SELECT name, type FROM pragma_table_list")
      .all();

    checks.push({
      test: "pragma_table_list",
      ok: true,
      tables: result.results
    });
  } catch (error) {
    checks.push({
      test: "pragma_table_list",
      ok: false,
      error: error.message
    });
  }

  return json({
    ok: checks.some(check => check.ok),
    database_connected: true,
    diagnostic: checks
  });
}
    // ==========================================
    // API 3: ENDPOINT TIDAK DITEMUKAN
    // ==========================================
    return json(
      {
        ok: false,
        error: "Endpoint API tidak ditemukan.",
        requested_path: path,
        available_endpoints: [
          "/api/health",
          "/api/schema"
        ]
      },
      404
    );

  } catch (error) {
    // Menampilkan informasi kesalahan tanpa membocorkan konfigurasi.
    return json(
      {
        ok: false,
        database_connected: false,
        error: "Terjadi kesalahan saat mengakses Cloudflare D1.",
        detail:
          error instanceof Error
            ? error.message
            : String(error)
      },
      500
    );
  }
}
