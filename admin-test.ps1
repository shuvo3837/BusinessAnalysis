$body = @{ email = 'admin@bizmind.local'; password = 'BizMindAdmin2026!' } | ConvertTo-Json
$resp = Invoke-RestMethod -Method Post -Uri 'http://localhost:3000/api/auth/login' -ContentType 'application/json' -Body $body
$token = $resp.token
Write-Host ('TOKEN_LEN=' + $token.Length)
Write-Host ('ROLE=' + $resp.user.role)
try {
  $stats = Invoke-RestMethod -Method Get -Uri 'http://localhost:3000/api/admin/stats' -Headers @{ Authorization = 'Bearer ' + $token }
  Write-Host '--- STATS OK ---'
  $stats | Format-List
} catch {
  Write-Host ('STATS_ERR=' + $_.Exception.Message)
}