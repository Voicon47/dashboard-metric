$content = Get-Content -Path 'd:\WebCty\webMetric\src\components\modals\ServerDetailModal.tsx' -Raw
$content = $content -replace 'ep\.latencyMs', 'ep.latencyCurrentAvgMs'
$content = $content -replace 'ep\.errorRate\b', 'ep.errorRate5xx'
$content = $content -replace 'metrics\.latencyMs', 'metrics.latencyCurrentAvgMs'
$content = $content -replace 'metrics\.errorRate\b', 'metrics.errorRate5xx'
Set-Content -Path 'd:\WebCty\webMetric\src\components\modals\ServerDetailModal.tsx' -Value $content
