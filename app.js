// Application Logic for Shopee Landing Page

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

// Helper to extract YouTube embed URL (including YouTube Shorts)
function getYouTubeEmbedUrl(url) {
  if (!url) return null;
  // Shorts: https://www.youtube.com/shorts/ayCrSPR9fjU
  const shortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/);
  if (shortsMatch) {
    return `https://www.youtube.com/embed/${shortsMatch[1]}?autoplay=1&enablejsapi=1&rel=0`;
  }
  // Standard watch or youtu.be
  const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  if (ytMatch) {
    return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&enablejsapi=1&rel=0`;
  }
  return null;
}

// Initialize Application
document.addEventListener("DOMContentLoaded", () => {
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
        <div class="w-16 h-16 mx-auto mb-4 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center text-3xl">🔍</div>
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
      const activeSize = product.sizes[0] || "";
      const activeColor = product.colors[0] || "";

      return `
      <div class="bg-white rounded-2xl overflow-hidden card-shadow border border-gray-100 flex flex-col justify-between" id="product-${product.id}">
        <!-- Media Header (Video & Photo Switcher) -->
        <div class="relative">
          <!-- Discount & Badge -->
          <div class="absolute top-3 left-3 z-20 flex flex-col gap-1.5">
            <span class="bg-red-600 text-white text-xs font-black px-2.5 py-1 rounded-md shadow uppercase tracking-wide">
              Diskon ${product.discount}
            </span>
            <span class="bg-orange-500 text-white text-xs font-semibold px-2.5 py-0.5 rounded-md shadow">
              ${product.badge}
            </span>
          </div>

          <!-- Quick Media Tab Switcher -->
          <div class="absolute top-3 right-3 z-20 flex bg-black/60 backdrop-blur-md rounded-full p-1 border border-white/20">
            <button 
              onclick="switchMediaTab(${product.id}, 'photo')" 
              id="tab-photo-${product.id}"
              class="px-2.5 py-1 rounded-full text-xs font-semibold transition flex items-center gap-1 bg-white text-gray-900 shadow">
              📷 Foto
            </button>
            <button 
              onclick="switchMediaTab(${product.id}, 'video')" 
              id="tab-video-${product.id}"
              class="px-2.5 py-1 rounded-full text-xs font-semibold transition flex items-center gap-1 text-white hover:text-orange-300">
              🎥 Video
            </button>
          </div>

          <!-- Media Display Container -->
          <div class="aspect-video-custom relative bg-gray-900 group">
            <!-- Photo Mode -->
            <div id="media-photo-${product.id}" class="w-full h-full relative">
              <img 
                id="main-img-${product.id}"
                src="${product.images[0]}" 
                onerror="this.onerror=null; this.src='${product.fallbackImage || product.images[0]}';"
                alt="${product.title}" 
                class="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <button 
                onclick="openMediaModal(${product.id}, 'photo')"
                class="absolute bottom-3 right-3 bg-black/70 hover:bg-black text-white p-2 rounded-full opacity-80 hover:opacity-100 transition shadow" 
                title="Perbesar Foto">
                🔍
              </button>
            </div>

            <!-- Video Mode -->
            <div id="media-video-${product.id}" class="w-full h-full relative hidden">
              ${
                getYouTubeEmbedUrl(product.video)
                  ? `
                <iframe 
                  id="video-player-${product.id}"
                  data-src="${getYouTubeEmbedUrl(product.video)}"
                  src=""
                  class="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowfullscreen>
                </iframe>
              `
                  : `
                <video 
                  id="video-player-${product.id}"
                  src="${product.video}" 
                  poster="${product.videoPoster}"
                  class="w-full h-full object-cover" 
                  controls 
                  preload="metadata"
                  playsinline>
                </video>
              `
              }
              <div class="absolute top-2 left-2 bg-orange-600/90 text-white text-[11px] font-bold px-2 py-0.5 rounded shadow pointer-events-none z-10">
                🔴 Video Asli
              </div>
            </div>
          </div>

          <!-- Thumbnails Row (Visible in Photo mode) -->
          <div id="thumbnails-${product.id}" class="flex gap-2 p-2 bg-gray-50 border-b border-gray-100 overflow-x-auto">
            ${product.images
              .map(
                (img, idx) => `
              <img 
                src="${img}" 
                onerror="this.onerror=null; this.src='${product.fallbackImage || img}';"
                alt="thumb" 
                onclick="changeProductImage(${product.id}, '${img}', this)"
                class="w-12 h-12 object-cover rounded-md cursor-pointer border-2 transition ${
                  idx === 0 ? "border-orange-500 scale-105" : "border-transparent opacity-70 hover:opacity-100"
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
              <span class="flex items-center gap-1 font-medium">
                <span class="text-yellow-400">★</span> ${product.rating} | ${product.soldCount} Terjual
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
              <div class="flex items-center gap-2 mt-1 text-[11px] text-gray-600">
                <span class="text-green-600 font-bold flex items-center gap-0.5">🚚 Gratis Ongkir Xtra</span>
                <span>•</span>
                <span class="text-orange-700 font-bold">💵 Bisa COD</span>
              </div>
            </div>

            <!-- Highlights / Features -->
            <ul class="text-xs text-gray-600 space-y-1 mb-4">
              ${product.features
                .slice(0, 3)
                .map(
                  (f) => `
                <li class="flex items-start gap-1.5">
                  <span class="text-green-500 font-bold">✓</span>
                  <span>${f}</span>
                </li>
              `
                )
                .join("")}
            </ul>
          </div>

          <!-- Action Buttons & Shopee Order Form Trigger -->
          <div class="pt-3 border-t border-gray-100 space-y-2">
            <!-- Dedicated Shopee Order Form Accordion / Modal Button -->
            <button 
              onclick="openOrderModal(${product.id})"
              class="w-full py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 text-sm pulse-btn">
              <span>🛒</span>
              <span>ISI FORM ORDER SHOPEE</span>
            </button>

            <!-- Direct Shopee Link -->
            <a 
              href="${product.shortUrl}" 
              target="_blank" 
              rel="noopener noreferrer"
              class="w-full py-2.5 px-3 bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-bold rounded-xl text-center transition flex items-center justify-center gap-1.5 border border-orange-200">
              <span>⚡ Buka Langsung di Shopee</span>
              <span>&rarr;</span>
            </a>
          </div>
        </div>
      </div>
    `;
    })
    .join("");
}

// Media Tab Switcher (Photo vs Video)
function switchMediaTab(productId, mode) {
  const photoContainer = document.getElementById(`media-photo-${productId}`);
  const videoContainer = document.getElementById(`media-video-${productId}`);
  const photoTab = document.getElementById(`tab-photo-${productId}`);
  const videoTab = document.getElementById(`tab-video-${productId}`);
  const thumbnails = document.getElementById(`thumbnails-${productId}`);
  const videoPlayer = document.getElementById(`video-player-${productId}`);

  if (mode === "video") {
    photoContainer.classList.add("hidden");
    videoContainer.classList.remove("hidden");
    if (thumbnails) thumbnails.classList.add("hidden");

    videoTab.classList.remove("text-white");
    videoTab.classList.add("bg-orange-500", "text-white", "shadow");
    photoTab.classList.remove("bg-white", "text-gray-900", "shadow");
    photoTab.classList.add("text-white");

    if (videoPlayer) {
      if (videoPlayer.tagName === "IFRAME") {
        const dataSrc = videoPlayer.getAttribute("data-src");
        if (dataSrc && (!videoPlayer.src || videoPlayer.src === "about:blank")) {
          videoPlayer.src = dataSrc;
        }
      } else if (typeof videoPlayer.play === "function") {
        videoPlayer.play().catch(() => {});
      }
    }
  } else {
    videoContainer.classList.add("hidden");
    photoContainer.classList.remove("hidden");
    if (thumbnails) thumbnails.classList.remove("hidden");

    photoTab.classList.add("bg-white", "text-gray-900", "shadow");
    photoTab.classList.remove("text-white");
    videoTab.classList.remove("bg-orange-500", "text-white", "shadow");
    videoTab.classList.add("text-white");

    if (videoPlayer) {
      if (videoPlayer.tagName === "IFRAME") {
        videoPlayer.src = "about:blank";
      } else if (typeof videoPlayer.pause === "function") {
        videoPlayer.pause();
      }
    }
  }
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
      <div class="flex items-center gap-2">
        <span class="text-2xl">🛍️</span>
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
    <div class="p-4 bg-orange-50/60 border-b border-orange-100 flex gap-3 items-center">
      <img src="${product.images[0]}" onerror="this.onerror=null; this.src='${product.fallbackImage || product.images[0]}';" alt="${product.title}" class="w-16 h-16 object-cover rounded-xl border border-orange-200" />
      <div class="flex-1 min-w-0">
        <span class="text-[10px] bg-red-600 text-white font-bold px-1.5 py-0.5 rounded">Diskon ${product.discount}</span>
        <h4 class="font-bold text-gray-900 text-sm truncate mt-0.5">${product.title}</h4>
        <div class="flex items-baseline gap-2 mt-0.5">
          <span class="text-base font-extrabold text-orange-600">${formatRupiah(product.promoPrice)}</span>
          <span class="text-xs text-gray-400 line-through">${formatRupiah(product.originalPrice)}</span>
        </div>
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
              class="variant-btn-color text-left text-xs p-2 rounded-xl border font-medium transition truncate ${
                idx === 0
                  ? "border-orange-500 bg-orange-50 text-orange-700 ring-2 ring-orange-400/20"
                  : "border-gray-200 hover:border-orange-300 text-gray-700"
              }">
              ● ${color}
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
              <option value="COD (Bayar di Tempat)">💵 COD (Bayar di Tempat)</option>
              <option value="ShopeePay / SpayLater">🟠 ShopeePay / SpayLater</option>
              <option value="Transfer Bank / VA">🏦 Transfer Bank / Virtual Account</option>
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
        <span>🛡️</span>
        <span>Pesanan Anda dilindungi Garansi Shopee 100%. Data Anda aman dan diteruskan langsung ke sistem toko Shopee.</span>
      </div>

      <!-- Action Button -->
      <div class="pt-2">
        <button 
          type="submit" 
          class="w-full py-3.5 px-4 bg-orange-600 hover:bg-orange-700 text-white font-extrabold rounded-xl shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2 text-sm">
          <span>⚡</span>
          <span>LANJUT KE SHOPEE UNTUK CHECKOUT</span>
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
    `✅ Form order berhasil dicatat!\n\nProduk: ${selectedProductForOrder.title}\nVarian: ${orderState.size} - ${orderState.color}\nJumlah: ${orderState.quantity} pcs\n\nKlik OK untuk langsung membuka halaman resmi Shopee dan menyelesaikan checkout produk ini.`
  );

  if (confirmed) {
    window.open(selectedProductForOrder.shortUrl, "_blank");
    closeOrderModal();
  }
}

// Open Media Preview Modal
function openMediaModal(productId, initialMode) {
  const product = productsData.find((p) => p.id === productId);
  if (!product) return;

  const modal = document.getElementById("mediaModal");
  const modalContent = document.getElementById("mediaModalContent");

  modalContent.innerHTML = `
    <div class="relative bg-black rounded-2xl overflow-hidden max-w-3xl w-full mx-auto">
      <button onclick="closeMediaModal()" class="absolute top-4 right-4 z-30 bg-black/60 hover:bg-black text-white w-9 h-9 rounded-full flex items-center justify-center font-bold text-xl">
        &times;
      </button>

      <div class="p-4 bg-gray-900 text-white flex items-center justify-between">
        <div>
          <h3 class="font-bold text-sm truncate max-w-md">${product.title}</h3>
          <p class="text-xs text-gray-400">Preview Media Resolusi Penuh</p>
        </div>
        <a href="${product.shortUrl}" target="_blank" class="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-lg transition">
          Buka di Shopee
        </a>
      </div>

      <div class="max-h-[70vh] flex items-center justify-center bg-black">
        ${
          initialMode === "video"
            ? getYouTubeEmbedUrl(product.video)
              ? `
            <iframe 
              src="${getYouTubeEmbedUrl(product.video)}" 
              class="w-full h-[65vh] border-0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              allowfullscreen>
            </iframe>
          `
              : `
            <video src="${product.video}" poster="${product.videoPoster}" controls autoplay playsinline class="w-full max-h-[65vh] object-contain"></video>
          `
            : `
          <img src="${product.images[0]}" alt="${product.title}" class="w-full max-h-[65vh] object-contain" />
        `
        }
      </div>

      <div class="p-3 bg-gray-900 border-t border-gray-800 flex items-center justify-between text-xs text-gray-300">
        <span>⭐ Rating 4.9/5 (${product.soldCount} Terjual)</span>
        <button onclick="closeMediaModal(); openOrderModal(${product.id})" class="px-4 py-2 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition">
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
