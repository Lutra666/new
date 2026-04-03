$ErrorActionPreference = "Stop"

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$startupFolder = [Environment]::GetFolderPath("Startup")
$shortcutPath = Join-Path $startupFolder "FinanceSystemAdvancedLauncher.lnk"

$targetPath = "powershell.exe"
$arguments = "-NoProfile -ExecutionPolicy Bypass -WindowStyle Minimized -Command `"Set-Location '$root'; npm run start:no-browser`""

$wsh = New-Object -ComObject WScript.Shell
$shortcut = $wsh.CreateShortcut($shortcutPath)
$shortcut.TargetPath = $targetPath
$shortcut.Arguments = $arguments
$shortcut.WorkingDirectory = $root
$shortcut.Description = "Auto start finance system launcher"
$shortcut.IconLocation = "powershell.exe,0"
$shortcut.Save()

Write-Host "Auto-start installed:" $shortcutPath -ForegroundColor Green
