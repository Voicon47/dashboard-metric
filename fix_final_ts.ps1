$file = 'd:\WebCty\webMetric\src\components\dashboard\QuickActionBar.tsx'
if (Test-Path $file) {
  $content = Get-Content -Path $file -Raw
  $content = $content -replace "import \{ useThrottling \} from '../../hooks/useThrottling';", "// import { useThrottling } from '../../hooks/useThrottling';"
  $content = $content -replace "\(s\) =>", "(s: any) =>"
  $content = $content -replace "\(node\) =>", "(node: any) =>"
  Set-Content -Path $file -Value $content
}

$file = 'd:\WebCty\webMetric\src\components\dashboard\AlertBanner.tsx'
if (Test-Path $file) {
  $content = Get-Content -Path $file -Raw
  $content = $content -replace 'import \{ MOCK_SERVERS \} from "../../mockData";', "const MOCK_SERVERS: any[] = []; // FIXME: Removed mockData"
  Set-Content -Path $file -Value $content
}

$file = 'd:\WebCty\webMetric\src\utils\prometheusExporter.ts'
if (Test-Path $file) {
  $content = Get-Content -Path $file -Raw
  $content = $content -replace 'region=', 'server="'
  $content = $content -replace 'role=', 'tag="'
  $content = $content -replace 'ip=', 'status="'
  $content = $content -replace '\$\{node\.region\}', '${node.id}'
  $content = $content -replace '\$\{node\.role\}', '${node.tag}'
  $content = $content -replace '\$\{node\.ip\}', '${node.status}'
  Set-Content -Path $file -Value $content
}
