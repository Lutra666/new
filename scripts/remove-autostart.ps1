$ErrorActionPreference = "Stop"

$startupFolder = [Environment]::GetFolderPath("Startup")
$shortcutPath = Join-Path $startupFolder "FinanceSystemAdvancedLauncher.lnk"

if (Test-Path $shortcutPath) {
  Remove-Item -LiteralPath $shortcutPath -Force
  Write-Host "Auto-start removed:" $shortcutPath -ForegroundColor Yellow
} else {
  Write-Host "Auto-start shortcut not found." -ForegroundColor DarkYellow
}
