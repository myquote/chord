# Chord Gitar — template dasar

Template sumber untuk GitHub + Cloudflare Pages Functions. Template dan database tetap terpisah; file ini tidak membuat, menghapus, atau mengisi data lagu.

## Struktur
- `public/`: HTML, CSS, JavaScript, dan aset tampilan.
- `functions/[[path]].js`: API server-side untuk Cloudflare Pages Functions.
- `wrangler.toml`: binding D1 bernama `DB` yang menunjuk ke database yang sudah ada.

## Deployment melalui GitHub
1. Ekstrak ZIP ini.
2. Upload **isi folder proyek ini** ke root repository GitHub (jangan upload ZIP sebagai satu file).
3. Di Cloudflare Dashboard → Workers & Pages, buat/atur Pages project yang terhubung ke repository tersebut.
4. Build settings:
   - Framework preset: None
   - Build command: kosongkan
   - Build output directory: `public`
5. Pastikan file `functions/[[path]].js` ikut berada di root repository dalam folder `functions/`.
6. Di Cloudflare Pages → Settings → Functions → D1 database bindings, tambahkan binding:
   - Variable name: `DB`
   - D1 database: pilih database lama yang ID-nya `7bf24b11-567a-470e-900c-224280c89fd7`
7. Deploy ulang.

> Jangan membuat database baru. Pastikan binding `DB` menunjuk ke database lama. Jangan ubah Worker Import yang terpisah.

## Tes setelah deploy
- `https://NAMA-SITUS.pages.dev/` — halaman template.
- `https://NAMA-SITUS.pages.dev/api/health` — tes koneksi D1 (read-only).
- `https://NAMA-SITUS.pages.dev/api/schema` — melihat nama tabel dan kolom (read-only).
- `https://NAMA-SITUS.pages.dev/koneksi.html` — halaman tes visual.

Jika `/api/health` 404, Pages Functions kemungkinan belum ter-deploy. Jika 503, cek binding `DB`. Paket ini belum diuji pada akun Cloudflare pengguna.
