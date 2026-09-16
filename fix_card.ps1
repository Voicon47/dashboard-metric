$file = 'd:\WebCty\webMetric\src\components\dashboard\ServerColumnCard.tsx'
if (Test-Path $file) {
  $content = Get-Content -Path $file -Raw
  $content = $content -replace '\(b as any\)', 'b'
  $content = $content -replace '\(a as any\)', 'a'
  $content = $content -replace '\(server\.metrics as any\)', 'server.metrics'
  Set-Content -Path $file -Value $content
}
