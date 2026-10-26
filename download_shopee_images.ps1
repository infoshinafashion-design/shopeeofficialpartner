# Skrip Pengunduh Foto & Video Asli dari 17 Produk Shopee
# Jalankan skrip ini langsung di PowerShell Windows Anda (di luar aplikasi)
# Cara menjalankan: Buka PowerShell di folder ini, lalu ketik: .\download_shopee_images.ps1

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   PENGUNDUH FOTO & VIDEO ASLI PRODUK SHOPEE OTOMATIS     " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

$products = @(
    @{ id = 1;  itemId = "46919112532"; shortUrl = "https://s.shopee.co.id/8V9xTqzQVd" },
    @{ id = 2;  itemId = "55302488856"; shortUrl = "https://s.shopee.co.id/3B8R88uxq7" },
    @{ id = 3;  itemId = "44903000935"; shortUrl = "https://s.shopee.co.id/4fxEux712c" },
    @{ id = 4;  itemId = "49762522683"; shortUrl = "https://s.shopee.co.id/9Kj4TaLrS5" },
    @{ id = 5;  itemId = "52902492655"; shortUrl = "https://s.shopee.co.id/40hY7pfQyB" },
    @{ id = 6;  itemId = "28718343485"; shortUrl = "https://s.shopee.co.id/50a5Jk8riu" },
    @{ id = 7;  itemId = "24596143002"; shortUrl = "https://s.shopee.co.id/6Am2hve3Eq" },
    @{ id = 8;  itemId = "43059917348"; shortUrl = "https://s.shopee.co.id/7AeZtnZR7M" },
    @{ id = 9;  itemId = "57901785360"; shortUrl = "https://s.shopee.co.id/AAIBTO7hGN" },
    @{ id = 10; itemId = "52302783221"; shortUrl = "https://s.shopee.co.id/20wTkSsMjt" },
    @{ id = 11; itemId = "51852797925"; shortUrl = "https://s.shopee.co.id/50a5K1fwIu" },
    @{ id = 12; itemId = "40660337226"; shortUrl = "https://s.shopee.co.id/9APeHi38K3" },
    @{ id = 13; itemId = "53202147884"; shortUrl = "https://s.shopee.co.id/8V9xUXuucX" },
    @{ id = 14; itemId = "43402944554"; shortUrl = "https://s.shopee.co.id/6q1jVXjPwA" },
    @{ id = 15; itemId = "56851977230"; shortUrl = "https://s.shopee.co.id/3LRrLBFt3P" },
    @{ id = 16; itemId = "48102738636"; shortUrl = "https://s.shopee.co.id/2BFtx4WRdA" },
    @{ id = 17; itemId = "43967846359"; shortUrl = "https://s.shopee.co.id/1BNMlHdv8u" }
)

$assetsDir = Join-Path $PSScriptRoot "assets"
if (!(Test-Path $assetsDir)) {
    New-Item -ItemType Directory -Path $assetsDir | Out-Null
}

$shopId = "105163963"
$headers = @{
    "User-Agent" = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    "Accept" = "application/json"
    "Referer" = "https://shopee.co.id/"
    "x-api-source" = "pc"
}

Write-Host "Memulai proses pengunduhan ke folder: $assetsDir`n" -ForegroundColor Green

foreach ($p in $products) {
    $id = $p.id
    $itemId = $p.itemId
    Write-Host "[$id/17] Memeriksa Produk ID $itemId ..." -ForegroundColor White

    $apiUrl = "https://shopee.co.id/api/v4/item/get?itemid=$itemId&shopid=$shopId"
    $success = $false

    try {
        $response = Invoke-RestMethod -Uri $apiUrl -Headers $headers -TimeoutSec 10 -ErrorAction Stop
        if ($response.data -and $response.data.images) {
            $imgIdx = 1
            foreach ($imgHash in $response.data.images) {
                $imgUrl = "https://down-id.img.susercontent.com/file/$imgHash"
                $savePath = Join-Path $assetsDir "produk_${id}_${imgIdx}.jpg"
                Invoke-WebRequest -Uri $imgUrl -OutFile $savePath -Headers $headers -TimeoutSec 10
                Write-Host "   ✓ Tersimpan foto: $savePath" -ForegroundColor Green
                $imgIdx++
                if ($imgIdx -gt 3) { break }
            }
            $success = $true
        }
    } catch {
        Write-Host "   ! API dibatasi oleh sistem Shopee. Membuka link browser..." -ForegroundColor Yellow
    }

    if (!$success) {
        Write-Host "   -> Tautan produk: $($p.shortUrl)" -ForegroundColor DarkGray
    }
}

Write-Host "`nSelesai! Buka kembali index.html untuk melihat foto asli yang telah diunduh." -ForegroundColor Cyan
