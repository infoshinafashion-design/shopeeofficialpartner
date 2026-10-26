$urls = @(
    "https://s.shopee.co.id/8V9xTqzQVd",
    "https://s.shopee.co.id/3B8R88uxq7",
    "https://s.shopee.co.id/4fxEux712c",
    "https://s.shopee.co.id/9Kj4TaLrS5",
    "https://s.shopee.co.id/40hY7pfQyB",
    "https://s.shopee.co.id/50a5Jk8riu",
    "https://s.shopee.co.id/6Am2hve3Eq",
    "https://s.shopee.co.id/7AeZtnZR7M",
    "https://s.shopee.co.id/AAIBTO7hGN",
    "https://s.shopee.co.id/20wTkSsMjt",
    "https://s.shopee.co.id/50a5K1fwIu",
    "https://s.shopee.co.id/9APeHi38K3",
    "https://s.shopee.co.id/8V9xUXuucX",
    "https://s.shopee.co.id/6q1jVXjPwA",
    "https://s.shopee.co.id/3LRrLBFt3P",
    "https://s.shopee.co.id/2BFtx4WRdA",
    "https://s.shopee.co.id/1BNMlHdv8u"
)

$results = @()
$idx = 1

foreach ($u in $urls) {
    Write-Host "Resolving [$idx/17]: $u"
    $headers = & curl.exe -s -I $u
    $loc = ($headers | Select-String -Pattern "^Location:\s*(.*)" | ForEach-Object { $_.Matches.Groups[1].Value.Trim() }) | Select-Object -First 1
    
    $results += [PSCustomObject]@{
        index = $idx
        shortUrl = $u
        targetUrl = $loc
    }
    $idx++
}

$results | ConvertTo-Json -Depth 5 | Out-File -FilePath "$PSScriptRoot\resolved_urls.json" -Encoding utf8
Write-Host "Done resolving! Saved to $PSScriptRoot\resolved_urls.json"
