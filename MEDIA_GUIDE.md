# Panduan Memasukkan Foto & Video Asli dari 17 Produk Shopee

Landing page telah dikonfigurasi untuk membaca foto asli dari folder lokal `assets/` secara otomatis:
`assets/produk_{id}_1.jpg` dan `assets/produk_{id}_2.jpg`.

---

## 🚀 Cara 1: Mengunduh Foto Asli Secara Otomatis (Rekomendasi)

Telah disediakan skrip otomatis [download_shopee_images.ps1](file:///C:/Users/USER/.gemini/antigravity/scratch/shopee-landing-page/download_shopee_images.ps1).
Jalankan skrip ini langsung di terminal PowerShell Windows Anda (di luar Antigravity):

1. Buka PowerShell.
2. Masuk ke direktori landing page:
   ```powershell
   cd C:\Users\USER\.gemini\antigravity\scratch\shopee-landing-page
   ```
3. Jalankan skrip pengunduh:
   ```powershell
   .\download_shopee_images.ps1
   ```
Skrip akan secara otomatis mengambil foto resolusi tinggi dari server CDN Shopee dan menyimpannya langsung ke folder `assets/produk_1_1.jpg`, `assets/produk_2_1.jpg`, dst.

---

## 🖼️ Cara 2: Menyimpan Foto Manual ke Folder `assets/`

Jika Anda sudah memiliki foto produk asli atau menyimpannya dari aplikasi/web Shopee:
1. Simpan foto ke folder `C:\Users\USER\.gemini\antigravity\scratch\shopee-landing-page\assets\`.
2. Beri nama file sesuai nomor produk:
   - Produk 1: `produk_1_1.jpg`, `produk_1_2.jpg`
   - Produk 2: `produk_2_1.jpg`, `produk_2_2.jpg`
   - ... sampai Produk 17: `produk_17_1.jpg`
3. Begitu file ada di folder `assets/`, landing page akan langsung menampilkannya otomatis!

---

## 🌐 Cara 3: Menggunakan Tautan Gambar CDN Shopee Langsung di `products.js`

Buka file [products.js](file:///C:/Users/USER/.gemini/antigravity/scratch/shopee-landing-page/products.js) dan ganti URL array `images` dengan link gambar Shopee:
```javascript
{
  id: 1,
  title: "Celana Pendek Pria Wanita Sport Polos Gym Running",
  images: [
    "https://down-id.img.susercontent.com/file/id-11134207-7r98o-xxxxxx",
    "https://down-id.img.susercontent.com/file/id-11134207-7r98o-yyyyyy"
  ],
  ...
}
```

---

## 📋 Daftar Mapping 17 Produk & URL Asli

| No | Tautan Shopee Singkat | Item ID Shopee | Nama File Foto di `assets/` | Judul Produk Asli |
|:---:|:---|:---:|:---|:---|
| 1 | `https://s.shopee.co.id/8V9xTqzQVd` | `46919112532` | `produk_1_1.jpg` | Celana Pendek Pria Wanita Sport Polos Gym Running Futsal Voli |
| 2 | `https://s.shopee.co.id/3B8R88uxq7` | `55302488856` | `produk_2_1.jpg` | Paket Hemat Celana Pendek Santai Harian Katun Adem |
| 3 | `https://s.shopee.co.id/4fxEux712c` | `44903000935` | `produk_3_1.jpg` | Celana Boxer Pria Motif Katun Premium Celana Tidur Santai |
| 4 | `https://s.shopee.co.id/9Kj4TaLrS5` | `49762522683` | `produk_4_1.jpg` | Celana Jogger Training Pria Olahraga Sporty Gaya Korea |
| 5 | `https://s.shopee.co.id/40hY7pfQyB` | `52902492655` | `produk_5_1.jpg` | Paket 3 Pcs Celana Pendek Chinos Pinggang Karet All Size |
| 6 | `https://s.shopee.co.id/50a5Jk8riu` | `28718343485` | `produk_6_1.jpg` | Celana Pendek Olahraga Voli / Bulutangkis Premium Quick Dry |
| 7 | `https://s.shopee.co.id/6Am2hve3Eq` | `24596143002` | `produk_7_1.jpg` | Promo 5 Pcs Celana Pendek Unisex Termurah / Celana Boxer |
| 8 | `https://s.shopee.co.id/7AeZtnZR7M` | `43059917348` | `produk_8_1.jpg` | Celana Training Panjang Olahraga Pria Wanita Karet Bawah |
| 9 | `https://s.shopee.co.id/AAIBTO7hGN` | `57901785360` | `produk_9_1.jpg` | Celana Kolor Pria Motif Distro Jumbo Celana Pantai Santai |
| 10 | `https://s.shopee.co.id/20wTkSsMjt` | `52302783221` | `produk_10_1.jpg` | Paket Murah 3 Pcs Celana Pendek Chinos Anak Polos Katun |
| 11 | `https://s.shopee.co.id/50a5K1fwIu` | `51852797925` | `produk_11_1.jpg` | Terlaris Paket Promo 50 Ribu Dapat 5 Celana Chinos Polos |
| 12 | `https://s.shopee.co.id/9APeHi38K3` | `40660337226` | `produk_12_1.jpg` | Celana Panjang Training Olahraga Pria Wanita Saku Resleting |
| 13 | `https://s.shopee.co.id/8V9xUXuucX` | `53202147884` | `produk_13_1.jpg` | Promo 3 Pcs Celana Trening Panjang Olahraga Lari Running Senam |
| 14 | `https://s.shopee.co.id/6q1jVXjPwA` | `43402944554` | `produk_14_1.jpg` | Celana Pendek Basket Pria Double Mesh Breathable Streetwear |
| 15 | `https://s.shopee.co.id/3LRrLBFt3P` | `56851977230` | `produk_15_1.jpg` | Promo Besar 50 Ribu Dapat 2 Pcs Celana Joger Panjang Pria Wanita |
| 16 | `https://s.shopee.co.id/2BFtx4WRdA` | `48102738636` | `produk_16_1.jpg` | Celana Pendek Training Sport Lotto Super Tebal Nyaman |
| 17 | `https://s.shopee.co.id/1BNMlHdv8u` | `43967846359` | `produk_17_1.jpg` | Celana Boxer Seamless Premium Pria Lembut Elastis Anti Bakteri |
