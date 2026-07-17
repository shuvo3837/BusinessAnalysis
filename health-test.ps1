try {
  $r = Invoke-WebRequest -Uri 'http://localhost:3000/api/health' -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
  Write-Host ('HEALTH=' + $r.StatusCode + ' ' + $r.Content)
} catch {
  Write-Host ('HEALTH_ERR=' + $_.Exception.Message)
}

$body = @{ email = 'admin@bizmind.local'; password = 'BizMindAdmin2026!' } | ConvertTo-Json
try {
  $resp = Invoke-RestMethod -Method Post -Uri 'http://localhost:3000/api/auth/login' -ContentType 'application/json' -Body $body -TimeoutSec 8
  $token = $resp.token
  Write-Host ('TOKEN_LEN=' + $token.Length)
  Write-Host ('ROLE=' + $resp.user.role)
  try {
    $stats = Invoke-RestMethod -Method Get -Uri 'http://localhost:3000/api/admin/stats' -Headers @{ Authorization = 'Bearer ' + $token } -TimeoutSec 8
    Write-Host '--- STATS OK ---'
    $stats | Format-List
  } catch {
    Write-Host ('STATS_ERR=' + $_.Exception.Message)
  }
} catch {
  Write-Host ('LOGIN_ERR=' + $_.Exception.Message)
}