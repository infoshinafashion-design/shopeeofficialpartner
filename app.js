// Application Logic for Shopee Landing Page (Clean Photo & Shopee Checkout Flow)

let currentCategory = "all";
let searchQuery = "";
let selectedProductForOrder = null;
let orderState = {
  productId: null,
  size: "",
  color: "",
  quantity: 1,
  customerName: "",
  customerPhone: "",
  customerAddress: "",
  customerNotes: "",
  paymentMethod: "COD (Bayar di Tempat)"
};

// Format Currency to Indonesian Rupiah
function formatRupiah(amount) {
  return "Rp " + amount.toLocaleString("id-ID");
}

// Initialize Application
document.addEventListener("DOMContentLoaded", () => {
  loadStoredYouTubeLinks();
  renderProducts();
  setupCategoryFilters();
  setupSearch();
  startCountdown();
  startLiveSalesToast();
  setupStickyBar();
});

// Render Products Grid
function renderProducts() {
  const container = document.getElementById("productsGrid");
  if (!container) return;

  const filtered = productsData.filter((p) => {
    const matchCategory = currentCategory === "all" || p.category === currentCategory;
    const matchSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const countBadge = document.getElementById("productCountText");
  if (countBadge) {
    countBadge.textContent = `Menampilkan ${filtered.length} dari ${productsData.length} Produk`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-16 text-center bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div class="w-16 h-16 mx-auto mb-4 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center">
          <svg class="w-8 h-8 text-orange-500 fill-current" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
        </div>
        <h3 class="text-xl font-bold text-gray-800 mb-2">Produk Tidak Ditemukan</h3>
        <p class="text-gray-500 mb-4">Coba cari dengan kata kunci lain atau ubah kategori filter.</p>
        <button onclick="resetFilters()" class="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-full transition shadow-md">
          Lihat Semua Produk
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered
    .map((product) => {
      return `
      <div class="bg-white rounded-2xl overflow-hidden card-shadow border border-gray-100 flex flex-col justify-between" id="product-${product.id}">
        <!-- Media Header (Photo & Badges) -->
        <div class="relative">
          <!-- Discount & Badge -->
          <div class="absolute top-3 left-3 z-20 flex flex-col gap-1.5 items-start">
            <span class="bg-red-600 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-lg shadow uppercase tracking-wide">
              Diskon ${product.discount}
            </span>
            <span class="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-lg shadow flex items-center gap-1">
              <svg class="w-3 h-3 text-yellow-200 fill-current flex-shrink-0" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
              <span>${product.badge}</span>
            </span>
          </div>

          <!-- Main Photo Container -->
          <div class="aspect-video-custom relative bg-gray-50 group">
            <div id="media-photo-${product.id}" class="w-full h-full relative">
              <img 
                id="main-img-${product.id}"
                src="${product.images[0]}" 
                onerror="this.onerror=null; this.src='${product.fallbackImage || product.images[0]}';"
                alt="${product.title}" 
                class="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <!-- Direct YouTube Video Link Badge -->
              <a 
                href="${product.video || 'https://www.youtube.com/shorts/ayCrSPR9fjU'}" 
                target="_blank" 
                rel="noopener noreferrer"
                class="absolute top-3 right-3 z-20 px-2.5 py-1 rounded-full text-xs font-bold transition flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white shadow-md hover:scale-105"
                title="Buka Link Video di YouTube">
                <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                <span>Video YouTube &nearr;</span>
              </a>
              <button 
                onclick="openMediaModal(${product.id})"
                class="absolute bottom-3 right-3 bg-black/70 hover:bg-black text-white p-2.5 rounded-full opacity-80 hover:opacity-100 transition shadow flex items-center justify-center" 
                title="Perbesar Foto">
                <svg class="w-3.5 h-3.5 fill-current text-white" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
              </button>
            </div>
          </div>

          <!-- Thumbnails Row -->
          <div id="thumbnails-${product.id}" class="flex gap-2.5 p-2.5 bg-gray-50 border-b border-gray-100 overflow-x-auto">
            ${product.images
              .map(
                (img, idx) => `
              <img 
                src="${img}" 
                onerror="this.onerror=null; this.src='${product.fallbackImage || img}';"
                alt="thumb" 
                onclick="changeProductImage(${product.id}, '${img}', this)"
                class="w-16 h-16 object-cover rounded-xl cursor-pointer border-2 transition ${
                  idx === 0 ? "border-orange-500 scale-105 shadow-sm" : "border-transparent opacity-70 hover:opacity-100"
                }"
              />
            `
              )
              .join("")}
          </div>
        </div>

        <!-- Product Body Info -->
        <div class="p-5 flex-1 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between text-xs text-gray-500 mb-1.5">
              <span class="text-orange-600 font-semibold bg-orange-50 px-2 py-0.5 rounded">${product.categoryLabel}</span>
              <span class="flex items-center gap-1 font-semibold text-gray-700">
                <svg class="w-3.5 h-3.5 text-amber-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                <span class="font-bold text-gray-900">${product.rating}</span>
                <span class="text-gray-300">|</span>
                <span class="text-gray-500">${product.soldCount} Terjual</span>
              </span>
            </div>

            <h3 class="font-bold text-gray-900 text-base leading-snug line-clamp-2 hover:text-orange-600 transition mb-1">
              ${product.title}
            </h3>
            <p class="text-xs text-gray-500 mb-3 line-clamp-2">${product.subtitle}</p>

            <!-- Price Block -->
            <div class="bg-orange-50/70 p-3 rounded-xl border border-orange-100/80 mb-4">
              <div class="flex items-baseline gap-2">
                <span class="text-xl font-extrabold text-orange-600">${formatRupiah(product.promoPrice)}</span>
                <span class="text-xs text-gray-400 line-through">${formatRupiah(product.originalPrice)}</span>
              </div>
              <div class="flex items-center gap-2 mt-1.5 text-[11px]">
                <span class="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-bold flex items-center gap-1 border border-emerald-200/60">
                  <svg class="w-3 h-3 text-emerald-600 fill-current" viewBox="0 0 24 24"><path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>
                  <span>Gratis Ongkir Xtra</span>
                </span>
                <span class="text-orange-700 bg-orange-50 px-2 py-0.5 rounded-md font-bold flex items-center gap-1 border border-orange-200/60">
                  <svg class="w-3 h-3 text-orange-600 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z"/></svg>
                  <span>Bisa COD</span>
                </span>
              </div>
            </div>

            <!-- Highlights / Features -->
            <ul class="text-xs text-gray-600 space-y-1.5 mb-4">
              ${product.features
                .slice(0, 3)
                .map(
                  (f) => `
                <li class="flex items-start gap-2">
                  <svg class="w-3.5 h-3.5 text-emerald-600 fill-current flex-shrink-0 mt-0.5" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                  <span>${f}</span>
                </li>
              `
                )
                .join("")}
            </ul>
          </div>

          <!-- Action Buttons & Shopee Order Form Trigger -->
          <div class="pt-3 border-t border-gray-100 space-y-2">
            <!-- Dedicated Shopee Order Form Button -->
            <button 
              onclick="openOrderModal(${product.id})"
              class="w-full py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 text-sm pulse-btn">
              <svg class="w-4 h-4 fill-current text-white flex-shrink-0" viewBox="0 0 24 24"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/></svg>
              <span>ISI FORM ORDER SHOPEE</span>
            </button>

            <!-- Direct Shopee Link -->
            <a 
              href="${product.shortUrl}" 
              target="_blank" 
              rel="noopener noreferrer"
              class="w-full py-2.5 px-3 bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-bold rounded-xl text-center transition flex items-center justify-center gap-1.5 border border-orange-200">
              <svg class="w-3.5 h-3.5 fill-current text-orange-600" viewBox="0 0 24 24"><path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/></svg>
              <span>Buka Langsung di Shopee &rarr;</span>
            </a>
          </div>
        </div>
      </div>
    `;
    })
    .join("");
}

// Change active image on thumbnail click
function changeProductImage(productId, newSrc, thumbElem) {
  const mainImg = document.getElementById(`main-img-${productId}`);
  if (mainImg) {
    mainImg.src = newSrc;
  }
  const parent = thumbElem.parentElement;
  if (parent) {
    const thumbs = parent.querySelectorAll("img");
    thumbs.forEach((t) => {
      t.classList.remove("border-orange-500", "scale-105");
      t.classList.add("border-transparent", "opacity-70");
    });
    thumbElem.classList.remove("border-transparent", "opacity-70");
    thumbElem.classList.add("border-orange-500", "scale-105");
  }
}

// Open Dedicated Order Modal for Specific Shopee URL
function openOrderModal(productId) {
  const product = productsData.find((p) => p.id === productId);
  if (!product) return;

  selectedProductForOrder = product;
  orderState = {
    productId: product.id,
    size: product.sizes[0] || "All Size",
    color: product.colors[0] || "Random",
    quantity: 1,
    customerName: "",
    customerPhone: "",
    customerAddress: "",
    customerNotes: "",
    paymentMethod: "COD (Bayar di Tempat)"
  };

  const modal = document.getElementById("orderModal");
  const modalContent = document.getElementById("orderModalContent");

  modalContent.innerHTML = `
    <!-- Header -->
    <div class="p-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-t-2xl flex items-center justify-between">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
          <svg class="w-5 h-5 fill-current text-white" viewBox="0 0 24 24"><path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm7 17H5V8h14v12z"/></svg>
        </div>
        <div>
          <h3 class="font-bold text-base leading-tight">Form Pemesanan Produk</h3>
          <p class="text-xs text-orange-100">Shopee Official Partner Checkout</p>
        </div>
      </div>
      <button onclick="closeOrderModal()" class="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center text-lg font-bold">
        &times;
      </button>
    </div>

    <!-- Product Summary Card -->
    <div class="p-4 bg-orange-50/60 border-b border-orange-100 flex gap-3.5 items-center">
      <img src="${product.images[0]}" onerror="this.onerror=null; this.src='${product.fallbackImage || product.images[0]}';" alt="${product.title}" class="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-2xl border border-orange-200 shadow-sm flex-shrink-0" />
      <div class="flex-1 min-w-0">
        <span class="text-[10px] bg-red-600 text-white font-bold px-1.5 py-0.5 rounded">Diskon ${product.discount}</span>
        <h4 class="font-bold text-gray-900 text-sm truncate mt-0.5">${product.title}</h4>
        <div class="flex items-baseline gap-2 mt-0.5">
          <span class="text-base font-extrabold text-orange-600">${formatRupiah(product.promoPrice)}</span>
          <span class="text-xs text-gray-400 line-through">${formatRupiah(product.originalPrice)}</span>
        </div>
        <a 
          href="${product.video || 'https://www.youtube.com/shorts/ayCrSPR9fjU'}" 
          target="_blank" 
          rel="noopener noreferrer" 
          class="inline-flex items-center gap-1.5 text-[11px] text-red-600 hover:text-red-700 font-bold mt-1.5">
          <svg class="w-3.5 h-3.5 fill-current text-red-600" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
          <span>Tonton Video Produk di YouTube &nearr;</span>
        </a>
      </div>
    </div>

    <!-- Form Body -->
    <form id="shopeeOrderForm" onsubmit="handleOrderSubmit(event)" class="p-5 space-y-4 max-h-[65vh] overflow-y-auto">
      <!-- Variant: Size -->
      <div>
        <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
          1. Pilih Ukuran / Size:
        </label>
        <div class="grid grid-cols-2 gap-2" id="sizeOptions">
          ${product.sizes
            .map(
              (size, idx) => `
            <button 
              type="button" 
              onclick="selectVariant('size', '${size}', this)" 
              class="variant-btn-size text-left text-xs p-2.5 rounded-xl border font-medium transition ${
                idx === 0
                  ? "border-orange-500 bg-orange-50 text-orange-700 ring-2 ring-orange-400/20"
                  : "border-gray-200 hover:border-orange-300 text-gray-700"
              }">
              ${size}
            </button>
          `
            )
            .join("")}
        </div>
      </div>

      <!-- Variant: Color -->
      <div>
        <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
          2. Pilih Warna / Motif:
        </label>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2" id="colorOptions">
          ${product.colors
            .map(
              (color, idx) => `
            <button 
              type="button" 
              onclick="selectVariant('color', '${color}', this)" 
              class="variant-btn-color text-left text-xs p-2 rounded-xl border font-medium transition truncate flex items-center ${
                idx === 0
                  ? "border-orange-500 bg-orange-50 text-orange-700 ring-2 ring-orange-400/20"
                  : "border-gray-200 hover:border-orange-300 text-gray-700"
              }">
              <span class="inline-block w-2.5 h-2.5 rounded-full bg-orange-500 mr-1.5 flex-shrink-0"></span><span>${color}</span>
            </button>
          `
            )
            .join("")}
        </div>
      </div>

      <!-- Quantity Counter -->
      <div class="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
        <div>
          <span class="block text-xs font-bold text-gray-700">Jumlah Pesanan:</span>
          <span class="text-[11px] text-gray-500">Stok tersisa: ${product.stock} pcs</span>
        </div>
        <div class="flex items-center gap-2">
          <button 
            type="button" 
            onclick="updateQuantity(-1)" 
            class="w-8 h-8 rounded-lg bg-white border border-gray-300 text-gray-700 font-bold hover:bg-orange-50 hover:border-orange-500 flex items-center justify-center transition">
            -
          </button>
          <span id="quantityDisplay" class="w-8 text-center font-bold text-gray-900 text-sm">1</span>
          <button 
            type="button" 
            onclick="updateQuantity(1)" 
            class="w-8 h-8 rounded-lg bg-white border border-gray-300 text-gray-700 font-bold hover:bg-orange-50 hover:border-orange-500 flex items-center justify-center transition">
            +
          </button>
        </div>
      </div>

      <!-- Customer Details -->
      <div class="space-y-3 pt-2">
        <div>
          <label class="block text-xs font-bold text-gray-700 mb-1">Nama Lengkap Pemesan *</label>
          <input 
            type="text" 
            id="custName" 
            required 
            placeholder="Contoh: Budi Santoso"
            class="w-full text-xs p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none" 
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1">Nomor Telepon / HP *</label>
            <input 
              type="tel" 
              id="custPhone" 
              required 
              placeholder="08xxxxxxxxxx"
              class="w-full text-xs p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none" 
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1">Metode Pembayaran</label>
            <select 
              id="custPayment"
              class="w-full text-xs p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white">
              <option value="COD (Bayar di Tempat)">COD (Bayar di Tempat)</option>
              <option value="ShopeePay / SpayLater">ShopeePay / SpayLater</option>
              <option value="Transfer Bank / VA">Transfer Bank / Virtual Account</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-gray-700 mb-1">Alamat Lengkap Pengiriman *</label>
          <textarea 
            id="custAddress" 
            rows="2" 
            required 
            placeholder="Jalan, RT/RW, Kelurahan, Kecamatan, Kota/Kabupaten, Kode Pos"
            class="w-full text-xs p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"></textarea>
        </div>

        <div>
          <label class="block text-xs font-bold text-gray-700 mb-1">Catatan Tambahan (Opsional)</label>
          <input 
            type="text" 
            id="custNotes" 
            placeholder="Contoh: Titipkan ke satpam jika tidak ada orang"
            class="w-full text-xs p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none" 
          />
        </div>
      </div>

      <!-- Price Breakdown -->
      <div class="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1.5 text-xs">
        <div class="flex justify-between text-gray-600">
          <span>Subtotal Produk (<span id="summaryQty">1</span>x)</span>
          <span id="summarySubtotal" class="font-medium">${formatRupiah(product.promoPrice)}</span>
        </div>
        <div class="flex justify-between text-green-600">
          <span>Diskon Voucher Toko</span>
          <span class="font-medium">- Rp 5.000 (Aktif)</span>
        </div>
        <div class="flex justify-between text-green-600">
          <span>Biaya Ongkos Kirim</span>
          <span class="font-bold">GRATIS (Klaim Xtra)</span>
        </div>
        <div class="flex justify-between text-gray-900 font-extrabold text-sm pt-2 border-t border-gray-200">
          <span>Estimasi Total:</span>
          <span id="summaryTotal" class="text-orange-600">${formatRupiah(Math.max(product.promoPrice - 5000, 0))}</span>
        </div>
      </div>

      <!-- Shopee Redirect Guarantee Badge -->
      <div class="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2">
        <svg class="w-4 h-4 text-amber-600 fill-current flex-shrink-0 mt-0.5" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
        <span>Pesanan Anda dilindungi Garansi Shopee 100%. Data Anda aman dan diteruskan langsung ke sistem toko Shopee.</span>
      </div>

      <!-- Action Button -->
      <div class="pt-2">
        <button 
          type="submit" 
          class="w-full py-3.5 px-4 bg-orange-600 hover:bg-orange-700 text-white font-extrabold rounded-xl shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2 text-sm">
          <span>LANJUT KE SHOPEE UNTUK CHECKOUT &rarr;</span>
        </button>
      </div>
    </form>
  `;

  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeOrderModal() {
  const modal = document.getElementById("orderModal");
  if (modal) modal.classList.add("hidden");
  document.body.style.overflow = "auto";
}

// Select Variant Size or Color
function selectVariant(type, value, buttonElem) {
  if (type === "size") {
    orderState.size = value;
    document.querySelectorAll(".variant-btn-size").forEach((btn) => {
      btn.classList.remove("border-orange-500", "bg-orange-50", "text-orange-700", "ring-2", "ring-orange-400/20");
      btn.classList.add("border-gray-200", "text-gray-700");
    });
  } else if (type === "color") {
    orderState.color = value;
    document.querySelectorAll(".variant-btn-color").forEach((btn) => {
      btn.classList.remove("border-orange-500", "bg-orange-50", "text-orange-700", "ring-2", "ring-orange-400/20");
      btn.classList.add("border-gray-200", "text-gray-700");
    });
  }

  buttonElem.classList.remove("border-gray-200", "text-gray-700");
  buttonElem.classList.add("border-orange-500", "bg-orange-50", "text-orange-700", "ring-2", "ring-orange-400/20");
}

// Update Quantity
function updateQuantity(change) {
  const newQty = orderState.quantity + change;
  if (newQty >= 1 && newQty <= 50) {
    orderState.quantity = newQty;
    document.getElementById("quantityDisplay").textContent = newQty;
    document.getElementById("summaryQty").textContent = newQty;

    const subtotal = selectedProductForOrder.promoPrice * newQty;
    const total = Math.max(subtotal - 5000, 0);

    document.getElementById("summarySubtotal").textContent = formatRupiah(subtotal);
    document.getElementById("summaryTotal").textContent = formatRupiah(total);
  }
}

// Submit via Shopee Checkout
function handleOrderSubmit(event) {
  event.preventDefault();

  orderState.customerName = document.getElementById("custName").value.trim();
  orderState.customerPhone = document.getElementById("custPhone").value.trim();
  orderState.customerAddress = document.getElementById("custAddress").value.trim();
  orderState.customerNotes = document.getElementById("custNotes").value.trim();
  orderState.paymentMethod = document.getElementById("custPayment").value;

  // Save order to localStorage
  const existingOrders = JSON.parse(localStorage.getItem("shopee_orders") || "[]");
  existingOrders.push({
    ...orderState,
    productTitle: selectedProductForOrder.title,
    shopeeUrl: selectedProductForOrder.shortUrl,
    date: new Date().toISOString()
  });
  localStorage.setItem("shopee_orders", JSON.stringify(existingOrders));

  // Show Success Alert before redirect
  const confirmed = confirm(
    `Form order berhasil dicatat!\n\nProduk: ${selectedProductForOrder.title}\nVarian: ${orderState.size} - ${orderState.color}\nJumlah: ${orderState.quantity} pcs\n\nKlik OK untuk langsung membuka halaman resmi Shopee dan menyelesaikan checkout produk ini.`
  );

  if (confirmed) {
    window.open(selectedProductForOrder.shortUrl, "_blank");
    closeOrderModal();
  }
}

// Open Media Preview Modal (Photo Zoom & Gallery)
function openMediaModal(productId) {
  const product = productsData.find((p) => p.id === productId);
  if (!product) return;

  const modal = document.getElementById("mediaModal");
  const modalContent = document.getElementById("mediaModalContent");

  modalContent.innerHTML = `
    <div class="relative bg-black rounded-2xl overflow-hidden max-w-3xl w-full mx-auto">
      <button onclick="closeMediaModal()" class="absolute top-4 right-4 z-30 bg-black/60 hover:bg-black text-white w-9 h-9 rounded-full flex items-center justify-center font-bold text-xl">
        &times;
      </button>

      <div class="p-4 bg-gray-900 text-white flex items-center justify-between gap-3">
        <div class="min-w-0 flex-1">
          <h3 class="font-bold text-sm truncate max-w-md">${product.title}</h3>
          <p class="text-xs text-gray-400">Preview Foto Resolusi Penuh</p>
        </div>
        <div class="flex items-center gap-2 flex-shrink-0">
          <a 
            href="${product.video || 'https://www.youtube.com/shorts/ayCrSPR9fjU'}" 
            target="_blank" 
            rel="noopener noreferrer"
            class="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 shadow">
            <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            <span>Video YouTube &nearr;</span>
          </a>
          <a href="${product.shortUrl}" target="_blank" rel="noopener noreferrer" class="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-lg transition">
            Buka di Shopee
          </a>
        </div>
      </div>

      <div class="max-h-[82vh] flex items-center justify-center bg-black p-2">
        <img id="modalPreviewImg" src="${product.images[0]}" alt="${product.title}" class="w-full max-h-[78vh] object-contain rounded-lg" />
      </div>

      <!-- Thumbnail switcher inside modal -->
      <div class="p-3 bg-gray-900 border-t border-gray-800 flex items-center justify-between text-xs text-gray-300">
        <div class="flex gap-2.5 overflow-x-auto">
          ${product.images
            .map(
              (img) => `
            <img src="${img}" alt="thumb" onclick="document.getElementById('modalPreviewImg').src='${img}'" class="w-14 h-14 object-cover rounded-xl cursor-pointer border-2 border-gray-700 hover:border-orange-500 opacity-80 hover:opacity-100 transition shadow-sm" />
          `
            )
            .join("")}
        </div>
        <button onclick="closeMediaModal(); openOrderModal(${product.id})" class="px-4 py-2 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition flex-shrink-0 ml-2">
          Pesan Sekarang
        </button>
      </div>
    </div>
  `;

  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeMediaModal() {
  const modal = document.getElementById("mediaModal");
  if (modal) {
    modal.classList.add("hidden");
    const modalContent = document.getElementById("mediaModalContent");
    if (modalContent) modalContent.innerHTML = "";
  }
  document.body.style.overflow = "auto";
}

// ==========================================
// YOUTUBE VIDEO INTEGRATION
// ==========================================

// Parse YouTube Embed URL from any YouTube link (Shorts, youtu.be, standard)
function getYouTubeEmbedUrl(url) {
  if (!url || typeof url !== "string") return null;

  // YouTube Shorts: https://www.youtube.com/shorts/{id}
  const shortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/);
  if (shortsMatch && shortsMatch[1]) {
    const cleanId = shortsMatch[1].split("?")[0].split("&")[0];
    return `https://www.youtube-nocookie.com/embed/${cleanId}?autoplay=1&rel=0`;
  }

  // youtu.be/{id}
  const youtuMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (youtuMatch && youtuMatch[1]) {
    const cleanId = youtuMatch[1].split("?")[0].split("&")[0];
    return `https://www.youtube-nocookie.com/embed/${cleanId}?autoplay=1&rel=0`;
  }

  // Standard youtube.com/watch?v={id} or /embed/{id}
  const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=))([a-zA-Z0-9_-]{11})/);
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&rel=0`;
  }

  return null;
}

// Load custom YouTube links from localStorage
function loadStoredYouTubeLinks() {
  try {
    const stored = JSON.parse(localStorage.getItem("shopee_yt_links") || "{}");
    productsData.forEach((p) => {
      if (stored[p.id]) {
        p.video = stored[p.id];
      }
    });
  } catch (e) {
    console.warn("Could not load stored youtube links", e);
  }
}

// Save custom YouTube link for a specific product
function saveProductYouTubeLink(productId, newUrl) {
  if (!newUrl || !newUrl.trim()) return false;
  const trimmed = newUrl.trim();
  try {
    const stored = JSON.parse(localStorage.getItem("shopee_yt_links") || "{}");
    stored[productId] = trimmed;
    localStorage.setItem("shopee_yt_links", JSON.stringify(stored));

    const product = productsData.find((p) => p.id === productId);
    if (product) product.video = trimmed;
    return true;
  } catch (e) {
    console.error("Failed to save youtube link", e);
    return false;
  }
}

// Open Dedicated YouTube Video Modal
function openYouTubeModal(productId) {
  const product = productsData.find((p) => p.id === productId);
  if (!product) return;

  const modal = document.getElementById("youtubeModal");
  const modalContent = document.getElementById("youtubeModalContent");
  if (!modal || !modalContent) return;

  const ytUrl = product.video || "https://www.youtube.com/shorts/ayCrSPR9fjU";
  const embedUrl = getYouTubeEmbedUrl(ytUrl);
  const isShorts = ytUrl.includes("/shorts/");

  modalContent.innerHTML = `
    <!-- Modal Header -->
    <div class="p-4 bg-gradient-to-r from-red-600 to-rose-700 text-white flex items-center justify-between">
      <div class="flex items-center gap-2.5 min-w-0">
        <svg class="w-6 h-6 text-white fill-current flex-shrink-0" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
        <div class="min-w-0">
          <h3 class="font-bold text-sm sm:text-base leading-tight truncate">Video Produk: ${product.title}</h3>
          <p class="text-xs text-red-100 flex items-center gap-1">
            <span>Review & Detail Produk di YouTube</span>
          </p>
        </div>
      </div>
      <button onclick="closeYouTubeModal()" class="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center text-lg font-bold flex-shrink-0 ml-2" title="Tutup">
        &times;
      </button>
    </div>

    <!-- Video Display Area -->
    <div class="p-4 bg-black flex flex-col items-center justify-center">
      ${
        embedUrl
          ? `
        <div class="w-full ${isShorts ? "max-w-xs aspect-[9/16]" : "aspect-video"} bg-black rounded-xl overflow-hidden shadow-2xl relative border border-gray-800">
          <iframe 
            id="ytPlayerIframe"
            src="${embedUrl}" 
            title="YouTube Video Player"
            class="w-full h-full"
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            allowfullscreen>
          </iframe>
        </div>
      `
          : `
        <div class="w-full aspect-video bg-gray-900 rounded-xl flex flex-col items-center justify-center p-6 text-center text-gray-300">
          <svg class="w-12 h-12 text-red-600 fill-current mb-2" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
          <p class="text-sm font-bold">Video dapat ditonton langsung di YouTube</p>
          <p class="text-xs text-gray-400 mt-1 mb-4 truncate max-w-sm">${ytUrl}</p>
          <a href="${ytUrl}" target="_blank" rel="noopener noreferrer" class="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-2">
            <span>Buka di YouTube &nearr;</span>
          </a>
        </div>
      `
      }
    </div>

    <!-- Action Buttons & Product Info -->
    <div class="p-4 bg-gray-900 text-white space-y-3 border-t border-gray-800">
      <!-- Product Quick Bar -->
      <div class="flex items-center justify-between bg-gray-800/80 p-3 rounded-xl border border-gray-700">
        <div class="flex items-center gap-3 min-w-0">
          <img src="${product.images[0]}" onerror="this.onerror=null; this.src='${product.fallbackImage || product.images[0]}';" alt="${product.title}" class="w-12 h-12 object-cover rounded-lg flex-shrink-0 border border-gray-600" />
          <div class="min-w-0">
            <h4 class="font-bold text-xs truncate text-gray-100">${product.title}</h4>
            <div class="flex items-baseline gap-2 mt-0.5">
              <span class="text-sm font-extrabold text-orange-400">${formatRupiah(product.promoPrice)}</span>
              <span class="text-[10px] text-gray-400 line-through">${formatRupiah(product.originalPrice)}</span>
            </div>
          </div>
        </div>
        <button 
          onclick="closeYouTubeModal(); openOrderModal(${product.id})"
          class="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl transition shadow flex-shrink-0 flex items-center gap-1.5 ml-2">
          <span>Pesan Sekarang</span>
        </button>
      </div>

      <!-- External Direct Link Button & Editor Toggle -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
        <a 
          href="${ytUrl}" 
          target="_blank" 
          rel="noopener noreferrer"
          class="w-full py-2.5 px-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition text-center shadow">
          <svg class="w-3.5 h-3.5 fill-current text-white flex-shrink-0" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
          <span>Buka di Aplikasi YouTube &nearr;</span>
        </a>
        <button 
          onclick="toggleYouTubeEditor(${product.id})"
          class="w-full py-2.5 px-3 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition border border-gray-700">
          <span>Ganti Link YouTube Produk Ini</span>
        </button>
      </div>

      <!-- Hidden Editor Form for Changing YouTube Link -->
      <div id="ytEditor-${product.id}" class="hidden pt-2 border-t border-gray-800 space-y-2">
        <label class="block text-[11px] font-bold text-gray-400">
          Masukkan Link YouTube Baru untuk Produk Ini:
        </label>
        <div class="flex gap-2">
          <input 
            type="url" 
            id="ytInput-${product.id}" 
            value="${ytUrl}"
            placeholder="Contoh: https://www.youtube.com/shorts/..."
            class="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
          />
          <button 
            onclick="handleSaveYouTubeLink(${product.id})"
            class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition flex-shrink-0">
            Simpan
          </button>
        </div>
        <p class="text-[10px] text-gray-500">Mendukung link Shorts (youtube.com/shorts/...) dan video reguler (youtu.be/... atau youtube.com/watch?v=...).</p>
      </div>
    </div>
  `;

  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeYouTubeModal() {
  const modal = document.getElementById("youtubeModal");
  if (modal) {
    modal.classList.add("hidden");
    const modalContent = document.getElementById("youtubeModalContent");
    if (modalContent) modalContent.innerHTML = "";
  }
  document.body.style.overflow = "auto";
}

function toggleYouTubeEditor(productId) {
  const editor = document.getElementById(`ytEditor-${productId}`);
  if (editor) {
    editor.classList.toggle("hidden");
  }
}

function handleSaveYouTubeLink(productId) {
  const input = document.getElementById(`ytInput-${productId}`);
  if (!input || !input.value.trim()) {
    alert("Silakan masukkan URL YouTube yang valid!");
    return;
  }
  const newUrl = input.value.trim();
  saveProductYouTubeLink(productId, newUrl);
  alert("Link video YouTube berhasil diperbarui!");
  openYouTubeModal(productId);
}

// Global Keyboard Handler for Escape Key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeOrderModal();
    closeMediaModal();
    closeYouTubeModal();
  }
});

// Category Filtering Setup
function setupCategoryFilters() {
  const buttons = document.querySelectorAll(".filter-btn");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => {
        b.classList.remove("bg-orange-600", "text-white", "shadow-md");
        b.classList.add("bg-white", "text-gray-700", "border", "border-gray-200");
      });
      btn.classList.remove("bg-white", "text-gray-700", "border", "border-gray-200");
      btn.classList.add("bg-orange-600", "text-white", "shadow-md");

      currentCategory = btn.dataset.category;
      renderProducts();
    });
  });
}

// Search Setup
function setupSearch() {
  const searchInput = document.getElementById("searchInput");
  if (!searchInput) return;

  searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value.trim();
    renderProducts();
  });
}

function resetFilters() {
  currentCategory = "all";
  searchQuery = "";
  const searchInput = document.getElementById("searchInput");
  if (searchInput) searchInput.value = "";

  const buttons = document.querySelectorAll(".filter-btn");
  buttons.forEach((b) => {
    if (b.dataset.category === "all") {
      b.classList.remove("bg-white", "text-gray-700", "border", "border-gray-200");
      b.classList.add("bg-orange-600", "text-white", "shadow-md");
    } else {
      b.classList.remove("bg-orange-600", "text-white", "shadow-md");
      b.classList.add("bg-white", "text-gray-700", "border", "border-gray-200");
    }
  });

  renderProducts();
}

// Flash Sale Countdown Timer
function startCountdown() {
  let totalSeconds = 4 * 3600 + 23 * 60 + 45; // 4 hours 23 mins 45s

  function update() {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const hElem = document.getElementById("timerHours");
    const mElem = document.getElementById("timerMinutes");
    const sElem = document.getElementById("timerSeconds");

    if (hElem) hElem.textContent = String(hours).padStart(2, "0");
    if (mElem) mElem.textContent = String(minutes).padStart(2, "0");
    if (sElem) sElem.textContent = String(seconds).padStart(2, "0");

    if (totalSeconds > 0) {
      totalSeconds--;
    } else {
      totalSeconds = 12 * 3600; // reset
    }
  }

  update();
  setInterval(update, 1000);
}

// Live Sales Proof Toast Notification
function startLiveSalesToast() {
  const names = ["Andi", "Rian", "Bambang", "Deni", "Wahyu", "Surya", "Fajar", "Arief", "Bayu", "Eko"];
  const cities = ["Jakarta", "Surabaya", "Bandung", "Semarang", "Medan", "Makassar", "Yogyakarta", "Malang", "Tangerang", "Bekasi"];

  function showToast() {
    const toast = document.getElementById("liveToast");
    if (!toast) return;

    const randomProduct = productsData[Math.floor(Math.random() * productsData.length)];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomCity = cities[Math.floor(Math.random() * cities.length)];

    toast.innerHTML = `
      <div class="flex items-center gap-3 bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-orange-200 max-w-sm">
        <img src="${randomProduct.images[0]}" alt="toast" class="w-12 h-12 object-cover rounded-xl border border-orange-200 flex-shrink-0" />
        <div class="min-w-0 flex-1">
          <p class="text-xs font-bold text-gray-900 truncate">${randomName} (${randomCity})</p>
          <p class="text-[11px] text-gray-600 truncate">Membeli: ${randomProduct.title}</p>
          <span class="text-[10px] text-orange-600 font-semibold">Baru saja (via Shopee COD)</span>
        </div>
      </div>
    `;

    toast.classList.remove("hidden");
    toast.classList.add("toast-animate");

    setTimeout(() => {
      toast.classList.remove("toast-animate");
      toast.classList.add("toast-exit");
      setTimeout(() => {
        toast.classList.add("hidden");
        toast.classList.remove("toast-exit");
      }, 500);
    }, 4500);
  }

  // First trigger after 4 seconds, then repeat every 18 seconds
  setTimeout(showToast, 4000);
  setInterval(showToast, 18000);
}

// Mobile Sticky Bar on Scroll
function setupStickyBar() {
  const stickyBar = document.getElementById("mobileStickyBar");
  if (!stickyBar) return;

  window.addEventListener("scroll", () => {
    if (window.scrollY > 400) {
      stickyBar.classList.remove("translate-y-full");
    } else {
      stickyBar.classList.add("translate-y-full");
    }
  });
}
