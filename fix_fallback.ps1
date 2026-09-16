$files = @(
  'd:\WebCty\webMetric\src\components\dashboard\ServerColumnCard.tsx',
  'd:\WebCty\webMetric\src\components\dashboard\MetricSection.tsx'
)

foreach ($file in $files) {
  if (Test-Path $file) {
    $content = Get-Content -Path $file -Raw
    $content = $content -replace ' \?\? [a-z]\.latencyMs', ''
    $content = $content -replace ' \?\? [a-z]\.errorRate', ''
    $content = $content -replace ' \?\? topFast\[0\]\.latencyMs', ''
    $content = $content -replace ' \?\? ep\.latencyMs', ''
    $content = $content -replace ' \?\? ep\.errorRate', ''
    $content = $content -replace ' \?\? server\.metrics\.errorRate', ''
    Set-Content -Path $file -Value $content
  }
}
