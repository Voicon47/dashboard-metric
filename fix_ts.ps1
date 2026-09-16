$files = @(
  'd:\WebCty\webMetric\src\components\dashboard\ServerColumnCard.tsx',
  'd:\WebCty\webMetric\src\components\dashboard\MetricSection.tsx'
)

foreach ($file in $files) {
  if (Test-Path $file) {
    $content = Get-Content -Path $file -Raw
    $content = $content -replace 'ep\.latencyMs', '(ep as any).latencyMs'
    $content = $content -replace 'ep\.errorRate\b', '(ep as any).errorRate'
    $content = $content -replace 'server\.metrics\.errorRate\b', '(server.metrics as any).errorRate'
    $content = $content -replace 'b\.latencyMs', '(b as any).latencyMs'
    $content = $content -replace 'a\.latencyMs', '(a as any).latencyMs'
    $content = $content -replace 'b\.errorRate\b', '(b as any).errorRate'
    $content = $content -replace 'a\.errorRate\b', '(a as any).errorRate'
    $content = $content -replace 'topLatency\[0\]\.latencyMs', '(topLatency[0] as any).latencyMs'
    $content = $content -replace 'topFast\[0\]\.latencyMs', '(topFast[0] as any).latencyMs'
    Set-Content -Path $file -Value $content
  }
}
