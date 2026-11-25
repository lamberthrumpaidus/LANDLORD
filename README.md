<!-- ALL Create by LamberthRumpaidus -->
<div align="center">
  <img src="./Logo.png" alt="Identitas visual LANDLORD" width="160" />
  <h1>LANDLORD</h1>
  <p>Petualangan aksi fantasi 3D di tujuh dunia.</p>
  <p><a href="./docs/nextgen-checkpoint.md">Catatan pengembangan</a> · <a href="https://github.com/lamberthrumpaidus/lamberthrumpaidus">Profil pengembang</a></p>
</div>

---

## Gambaran umum

LANDLORD merupakan permainan petualangan 3D berbasis browser dengan eksplorasi tujuh dunia, pertarungan melawan makhluk dan penjaga, kemampuan karakter, serta jalur alternatif. Pemain dapat menentukan cara mencapai gerbang akhir tanpa diwajibkan menyelesaikan setiap checkpoint.

## Fitur utama

- Tujuh dunia dengan karakter lingkungan, musuh, dan penjaga berbeda.
- Pertarungan jarak dekat, kemampuan api, dash, lompat, dan mode terbang.
- Minimap, peta interaktif, serta pengaturan grafik dan kontrol.
- Penyimpanan progres dan dukungan offline setelah aset tersedia.

## Arsitektur

| Lokasi | Fungsi |
|---|---|
| `src/source/` | Fragmen kode sumber gameplay |
| `src/js/engine/` | Modul rendering, animasi, dan mekanik permainan |
| `src/js/runtime/game.js` | Runtime yang dihasilkan dari kode sumber |
| `assets/` | Aset visual |
| `tests/` | Pengujian otomatis |
| `tools/` | Build dan pengemasan |

Teknologi: HTML, CSS, JavaScript, WebGL, serta service worker.

## Menjalankan secara lokal

```bash
git clone https://github.com/lamberthrumpaidus/LANDLORD.git
cd LANDLORD
python -m http.server 8000
```

Buka `http://localhost:8000/` melalui browser. Gunakan browser dengan dukungan WebGL dan akselerasi grafis untuk pengalaman 3D.

## Pengembangan dan pengujian

```bash
python tools/build.py
node --check src/js/runtime/game.js
node --test tests/*.test.cjs
```

Pengujian browser dan rekaman animasi tersedia dalam workflow [GitHub Actions](https://github.com/lamberthrumpaidus/LANDLORD/actions).

## Status rilis

Branch `main` memuat versi produksi. Pengembangan berikutnya dikelola pada [nextgen-remake](https://github.com/lamberthrumpaidus/LANDLORD/tree/nextgen-remake), termasuk perubahan navigasi dunia dan fisika terbang. Pembaruan pengembangan tidak dianggap sebagai rilis produksi sampai pengujian dan penggabungan selesai.


---

<div align="center">
  <sub>Dikembangkan oleh <a href="https://github.com/lamberthrumpaidus/lamberthrumpaidus">Lamberth Rumpaidus</a></sub>
</div>
