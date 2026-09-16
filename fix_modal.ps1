$content = Get-Content -Path 'd:\WebCty\webMetric\src\components\modals\ServerDetailModal.tsx' -Raw
$content = $content -replace 'ep\.latencyMs', 'ep.latencyCurrentAvgMs'
$content = $content -replace 'ep\.errorRate', 'ep.errorRate5xx'
$content = $content -replace 'node\.metrics\.latencyMs', 'node.metrics.latencyCurrentAvgMs'
$content = $content -replace 'node\.metrics\.errorRate', 'node.metrics.errorRate5xx'
Set-Content -Path 'd:\WebCty\webMetric\src\components\modals\ServerDetailModal.tsx' -Value $content
