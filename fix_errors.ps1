$files = @(
  'd:\WebCty\webMetric\src\store\useDashboardStore.ts',
  'd:\WebCty\webMetric\src\utils\prometheusExporter.ts',
  'd:\WebCty\webMetric\src\utils\sortFieldRegistry.ts',
  'd:\WebCty\webMetric\src\components\modals\AddEditServerModal.tsx',
  'd:\WebCty\webMetric\src\components\modals\ServerDetailModal.tsx',
  'd:\WebCty\webMetric\src\components\dashboard\TelemetryMatrix.tsx'
)

foreach ($file in $files) {
  if (Test-Path $file) {
    $content = Get-Content -Path $file -Raw
    $content = $content -replace 'errorRate5xx5xx', 'errorRate5xx'
    $content = $content -replace 'maxlatencyCurrentAvgMs', 'maxLatencyMs'
    $content = $content -replace 'PROMETHEUS_metrics', 'PROMETHEUS_METRICS'
    
    # Fix ServerDetailModal explicitly
    if ($file -match 'ServerDetailModal.tsx') {
      $content = $content -replace 'ep\.latencyMs', 'ep.latencyCurrentAvgMs'
      $content = $content -replace 'ep\.errorRate\b', 'ep.errorRate5xx'
      $content = $content -replace 'metrics\.latencyMs', 'metrics.latencyCurrentAvgMs'
      $content = $content -replace 'metrics\.errorRate\b', 'metrics.errorRate5xx'
    }
    
    # Fix AddEditServerModal missing props
    if ($file -match 'AddEditServerModal.tsx') {
      $content = $content -replace 'errorRate5xx: 0,', "errorRate5xx: 0,
      errorRate4xx: 0,"
      $content = $content -replace 'latencyCurrentAvgMs: 0,', "latencyCurrentAvgMs: 0,
      latencyOverallAvgMs: 0,"
    }
    
    Set-Content -Path $file -Value $content
  }
}
