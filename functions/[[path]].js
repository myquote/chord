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
  const tables = ["artists", "songs"];
  const schema = [];

  for (const table of tables) {
    try {
      const result = await env.DB
        .prepare(
          `SELECT * FROM pragma_table_info('${table}')`
        )
        .all();

      schema.push({
        table,
        ok: true,
        columns: result.results.map((column) => ({
          name: column.name,
          type: column.type,
          notnull: column.notnull,
          primary_key: column.pk
        }))
      });
    } catch (error) {
      schema.push({
        table,
        ok: false,
        error: error instanceof Error
          ? error.message
          : String(error)
      });
    }
  }

  return json({
    ok: true,
    database_connected: true,
    schema
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
