param(
  [switch]$NoBrowser,
  [switch]$ForceRestart
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$backendDir = Join-Path $root "backend"
$frontendDir = Join-Path $root "frontend"
$runtimeDir = Join-Path $root ".runtime"
$backendHealthUrl = "http://127.0.0.1:3001/health"
$frontendUrl = "http://localhost:3000"

if (!(Test-Path $runtimeDir)) {
  New-Item -ItemType Directory -Path $runtimeDir -Force | Out-Null
}

$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$sessionLog = Join-Path $runtimeDir "startup-$stamp.log"
$backendLog = Join-Path $runtimeDir "backend-launch.log"
$frontendLog = Join-Path $runtimeDir "frontend-launch.log"

function Write-Log {
  param([string]$Message, [string]$Level = "INFO")
  $line = "[{0}] [{1}] {2}" -f (Get-Date -Format "HH:mm:ss"), $Level, $Message
  Write-Host $line
  Add-Content -Path $sessionLog -Value $line -Encoding UTF8
}

function Test-HttpOk {
  param([string]$Url, [int]$TimeoutMs = 2500)
  try {
    $req = [System.Net.WebRequest]::Create($Url)
    $req.Timeout = $TimeoutMs
    $res = $req.GetResponse()
    $status = [int]([System.Net.HttpWebResponse]$res).StatusCode
    $res.Close()
    return ($status -lt 500)
  } catch {
    return $false
  }
}

function Wait-Http {
  param([string]$Url, [int]$TimeoutSec = 90)
  $end = (Get-Date).AddSeconds($TimeoutSec)
  while ((Get-Date) -lt $end) {
    if (Test-HttpOk -Url $Url) { return $true }
    Start-Sleep -Milliseconds 1200
  }
  return $false
}

function Get-PortProcesses {
  param([int]$Port)
  $cons = Get-NetTCPConnection -State Listen -LocalPort $Port -ErrorAction SilentlyContinue
  if (!$cons) { return @() }
  $ids = $cons | Select-Object -ExpandProperty OwningProcess -Unique
  $list = @()
  foreach ($id in $ids) {
    $p = Get-CimInstance Win32_Process -Filter "ProcessId = $id" -ErrorAction SilentlyContinue
    if ($p) {
      $list += [PSCustomObject]@{
        Id = $p.ProcessId
        Name = $p.Name
        CommandLine = [string]$p.CommandLine
      }
    }
  }
  return $list
}

function Ensure-Dependencies {
  $backendModules = Join-Path $backendDir "node_modules"
  $frontendModules = Join-Path $frontendDir "node_modules"

  if (!(Test-Path $backendModules)) {
    Write-Log "检测到 backend 依赖缺失，正在安装..."
    Push-Location $backendDir
    npm install | Out-Null
    Pop-Location
  } else {
    Write-Log "backend 依赖已就绪"
  }

  if (!(Test-Path $frontendModules)) {
    Write-Log "检测到 frontend 依赖缺失，正在安装..."
    Push-Location $frontendDir
    npm install | Out-Null
    Pop-Location
  } else {
    Write-Log "frontend 依赖已就绪"
  }
}

function Resolve-PortConflicts {
  Write-Log "检查端口冲突..."

  $p3001 = Get-PortProcesses -Port 3001
  foreach ($proc in $p3001) {
    if ($proc.CommandLine -match "frontend\\node_modules\\react-scripts\\scripts\\start.js") {
      Write-Log "发现前端误占 3001，已清理 PID=$($proc.Id)" "WARN"
      Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
    }
  }

  Start-Sleep -Milliseconds 400

  $p3001 = Get-PortProcesses -Port 3001
  if ($p3001.Count -gt 0 -and -not (Test-HttpOk -Url $backendHealthUrl -TimeoutMs 1200)) {
    $details = ($p3001 | ForEach-Object { "PID=$($_.Id) $($_.Name) | $($_.CommandLine)" }) -join "; "
    throw "3001 端口被占用且非后端健康服务：$details"
  }
}

function Start-Backend {
  if ($ForceRestart) {
    $procs = Get-PortProcesses -Port 3001
    foreach ($proc in $procs) {
      Write-Log "强制重启：结束 3001 进程 PID=$($proc.Id)" "WARN"
      Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
    }
  }

  if (Test-HttpOk -Url $backendHealthUrl) {
    Write-Log "后端已运行，复用现有服务"
    return
  }

  Write-Log "启动后端服务..."
  $cmd = "Set-Location '$backendDir'; npm run start *> '$backendLog'"
  $p = Start-Process -FilePath "powershell.exe" -ArgumentList "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -Command `"$cmd`"" -WindowStyle Hidden -PassThru

  Start-Sleep -Milliseconds 800
  if ($p.HasExited) {
    throw "后端进程启动后立即退出，请查看 $backendLog"
  }

  if (!(Wait-Http -Url $backendHealthUrl -TimeoutSec 90)) {
    throw "后端健康检查超时，请查看 $backendLog"
  }
  Write-Log "后端启动成功"
}

function Start-Frontend {
  if ($ForceRestart) {
    $procs = Get-PortProcesses -Port 3000
    foreach ($proc in $procs) {
      Write-Log "强制重启：结束 3000 进程 PID=$($proc.Id)" "WARN"
      Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
    }
  }

  if (Test-HttpOk -Url $frontendUrl) {
    Write-Log "前端已运行，复用现有服务"
    return
  }

  Write-Log "启动前端服务..."
  $cmd = "$env:BROWSER='none'; $env:PORT='3000'; $env:HOST='localhost'; $env:WDS_SOCKET_HOST='localhost'; $env:DANGEROUSLY_DISABLE_HOST_CHECK='true'; Set-Location '$frontendDir'; npm start *> '$frontendLog'"
  $p = Start-Process -FilePath "powershell.exe" -ArgumentList "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -Command `"$cmd`"" -WindowStyle Hidden -PassThru

  Start-Sleep -Milliseconds 1200
  if ($p.HasExited) {
    throw "前端进程启动后立即退出，请查看 $frontendLog"
  }

  if (!(Wait-Http -Url $frontendUrl -TimeoutSec 150)) {
    throw "前端可用性检查超时，请查看 $frontendLog"
  }
  Write-Log "前端启动成功"
}

Write-Log "启动流程开始"
Write-Log "工作目录: $root"

Ensure-Dependencies
Resolve-PortConflicts
Start-Backend
Start-Frontend

$state = @{
  startedAt = (Get-Date).ToString("s")
  root = $root
  frontendUrl = $frontendUrl
  backendHealthUrl = $backendHealthUrl
  backendLog = $backendLog
  frontendLog = $frontendLog
  sessionLog = $sessionLog
} | ConvertTo-Json -Depth 3

Set-Content -Path (Join-Path $runtimeDir "startup-state.json") -Value $state -Encoding UTF8

if (!$NoBrowser) {
  Start-Process $frontendUrl
  Write-Log "已自动打开浏览器: $frontendUrl"
}

Write-Log "启动流程完成"
exit 0
