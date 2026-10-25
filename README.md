# Chord Gitar — uji koneksi D1

File utama berada langsung di root repository. Folder `functions/` dipertahankan karena diperlukan untuk Cloudflare Pages Functions. Paket ini hanya untuk tes, belum merupakan website chord lengkap.

## File
- `index.html` — halaman awal tes
- `koneksi.html` — pemeriksaan API dan skema
- `style.css` — gaya
- `functions/[[path]].js` — endpoint read-only
- `wrangler.toml` — binding D1
- `package.json` — perintah Wrangler

## Deploy lewat GitHub + Cloudflare Pages
1. Unggah isi paket ini langsung ke root repository GitHub.
2. Hubungkan repository ke Cloudflare Pages. Framework preset: None; build command kosong; build output directory `.`.
3. Di Settings → Functions → D1 database bindings, buat binding variable `DB` dan pilih database lama dengan ID `7bf24b11-567a-470e-900c-224280c89fd7`.
4. Deploy ulang, lalu buka `/koneksi.html`.

`/api/health` hanya menguji koneksi. `/api/schema` hanya membaca nama tabel dan kolom. Tidak ada query yang menambah, mengubah, atau menghapus data. Jika `/api/health` 404, Pages Functions kemungkinan belum ter-deploy; jika 503, cek binding `DB`. Paket ini belum diuji pada akun Cloudflare pengguna. Jangan buat database baru dan jangan ubah Worker Import terpisah.
