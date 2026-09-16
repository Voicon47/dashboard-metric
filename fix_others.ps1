$files = @(
  'd:\WebCty\webMetric\src\store\useDashboardStore.ts',
  'd:\WebCty\webMetric\src\utils\prometheusExporter.ts',
  'd:\WebCty\webMetric\src\utils\sortFieldRegistry.ts',
  'd:\WebCty\webMetric\src\components\modals\AddEditServerModal.tsx',
  'd:\WebCty\webMetric\src\components\dashboard\AlertBanner.tsx',
  'd:\WebCty\webMetric\src\components\dashboard\TelemetryMatrix.tsx'
)

foreach ($file in $files) {
  if (Test-Path $file) {
    $content = Get-Content -Path $file -Raw
    $content = $content -replace 'latencyMs', 'latencyCurrentAvgMs'
    $content = $content -replace 'p95LatencyMs', 'latencyOverallAvgMs'
    $content = $content -replace 'errorRate\b', 'errorRate5xx'
    $content = $content -replace 'ep\.errorRate', 'ep.errorRate5xx'
    $content = $content -replace 'metrics\.errorRate', 'metrics.errorRate5xx'
    $content = $content -replace 'metrics\.latencyMs', 'metrics.latencyCurrentAvgMs'
    Set-Content -Path $file -Value $content
  }
}
