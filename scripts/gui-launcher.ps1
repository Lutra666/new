$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$runtimeDir = Join-Path $root ".runtime"
$frontendUrl = "http://localhost:3000"
$sessionLog = Join-Path $runtimeDir ("launcher-" + (Get-Date -Format "yyyyMMdd-HHmmss") + ".log")
$startupCore = Join-Path $root "scripts\start-system.ps1"

if (!(Test-Path $runtimeDir)) {
  New-Item -ItemType Directory -Path $runtimeDir -Force | Out-Null
}

Set-Content -Path $sessionLog -Value ("启动会话开始于 " + (Get-Date -Format "s")) -Encoding UTF8

function Append-SessionLog {
  param([string]$Line)
  Add-Content -Path $sessionLog -Value ("[{0}] {1}" -f (Get-Date -Format "HH:mm:ss"), $Line) -Encoding UTF8
}

$form = New-Object System.Windows.Forms.Form
$form.Text = "财务系统启动中心"
$form.StartPosition = "CenterScreen"
$form.ClientSize = New-Object System.Drawing.Size(980, 620)
$form.FormBorderStyle = "FixedSingle"
$form.MaximizeBox = $false
$form.MinimizeBox = $true
$form.BackColor = [System.Drawing.Color]::FromArgb(242, 246, 252)
$form.Font = New-Object System.Drawing.Font("Segoe UI", 9)
$form.Opacity = 0

$fadeTimer = New-Object System.Windows.Forms.Timer
$fadeTimer.Interval = 16
$fadeTimer.Add_Tick({
  if ($form.Opacity -lt 0.98) {
    $form.Opacity += 0.06
  } else {
    $form.Opacity = 1
    $fadeTimer.Stop()
  }
})

$leftPane = New-Object System.Windows.Forms.Panel
$leftPane.Location = New-Object System.Drawing.Point(0, 0)
$leftPane.Size = New-Object System.Drawing.Size(360, 620)
$leftPane.BackColor = [System.Drawing.Color]::FromArgb(15, 45, 92)
$leftPane.Add_Paint({
  param($sender, $e)
  $rect = New-Object System.Drawing.Rectangle(0, 0, $sender.Width, $sender.Height)
  $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    $rect,
    [System.Drawing.Color]::FromArgb(16, 44, 95),
    [System.Drawing.Color]::FromArgb(10, 86, 170),
    140
  )
  $e.Graphics.FillRectangle($brush, $rect)
  $brush.Dispose()
})
$form.Controls.Add($leftPane)

$brand = New-Object System.Windows.Forms.Label
$brand.Text = "财务中枢"
$brand.Font = New-Object System.Drawing.Font("Segoe UI Semibold", 16, [System.Drawing.FontStyle]::Bold)
$brand.ForeColor = [System.Drawing.Color]::White
$brand.AutoSize = $true
$brand.Location = New-Object System.Drawing.Point(36, 40)
$leftPane.Controls.Add($brand)

$brandSub = New-Object System.Windows.Forms.Label
$brandSub.Text = "现代化启动套件"
$brandSub.Font = New-Object System.Drawing.Font("Segoe UI", 10)
$brandSub.ForeColor = [System.Drawing.Color]::FromArgb(198, 222, 255)
$brandSub.AutoSize = $true
$brandSub.Location = New-Object System.Drawing.Point(38, 72)
$leftPane.Controls.Add($brandSub)

$heroTitle = New-Object System.Windows.Forms.Label
$heroTitle.Text = "启动财务系统`n像打开一款专业软件一样顺滑"
$heroTitle.Font = New-Object System.Drawing.Font("Microsoft YaHei UI", 20, [System.Drawing.FontStyle]::Bold)
$heroTitle.ForeColor = [System.Drawing.Color]::White
$heroTitle.AutoSize = $true
$heroTitle.Location = New-Object System.Drawing.Point(36, 138)
$leftPane.Controls.Add($heroTitle)

$heroDesc = New-Object System.Windows.Forms.Label
$heroDesc.Text = "自动检查环境、自动拉起服务、自动健康检测，完成后自动打开系统。"
$heroDesc.Font = New-Object System.Drawing.Font("Microsoft YaHei UI", 10)
$heroDesc.ForeColor = [System.Drawing.Color]::FromArgb(214, 231, 255)
$heroDesc.AutoSize = $false
$heroDesc.Size = New-Object System.Drawing.Size(286, 82)
$heroDesc.Location = New-Object System.Drawing.Point(38, 256)
$leftPane.Controls.Add($heroDesc)

$badge = New-Object System.Windows.Forms.Label
$badge.Text = "演示模式  ·  安全启动"
$badge.Font = New-Object System.Drawing.Font("Consolas", 10, [System.Drawing.FontStyle]::Bold)
$badge.ForeColor = [System.Drawing.Color]::FromArgb(198, 232, 255)
$badge.AutoSize = $true
$badge.Location = New-Object System.Drawing.Point(38, 564)
$leftPane.Controls.Add($badge)

$rightPane = New-Object System.Windows.Forms.Panel
$rightPane.Location = New-Object System.Drawing.Point(360, 0)
$rightPane.Size = New-Object System.Drawing.Size(620, 620)
$rightPane.BackColor = [System.Drawing.Color]::FromArgb(246, 249, 255)
$form.Controls.Add($rightPane)

$panelTitle = New-Object System.Windows.Forms.Label
$panelTitle.Text = "系统启动控制台"
$panelTitle.Font = New-Object System.Drawing.Font("Segoe UI Semibold", 18, [System.Drawing.FontStyle]::Bold)
$panelTitle.ForeColor = [System.Drawing.Color]::FromArgb(21, 45, 84)
$panelTitle.AutoSize = $true
$panelTitle.Location = New-Object System.Drawing.Point(32, 28)
$rightPane.Controls.Add($panelTitle)

$panelSub = New-Object System.Windows.Forms.Label
$panelSub.Text = "启动步骤可视化 · 进度追踪 · 自动诊断"
$panelSub.Font = New-Object System.Drawing.Font("Segoe UI", 10)
$panelSub.ForeColor = [System.Drawing.Color]::FromArgb(94, 112, 143)
$panelSub.AutoSize = $true
$panelSub.Location = New-Object System.Drawing.Point(34, 64)
$rightPane.Controls.Add($panelSub)

$stepPanel = New-Object System.Windows.Forms.Panel
$stepPanel.Location = New-Object System.Drawing.Point(34, 98)
$stepPanel.Size = New-Object System.Drawing.Size(552, 136)
$stepPanel.BackColor = [System.Drawing.Color]::White
$stepPanel.BorderStyle = "FixedSingle"
$rightPane.Controls.Add($stepPanel)

$steps = @(
  "1. 检查运行环境",
  "2. 检查并安装依赖",
  "3. 启动后端与健康检查",
  "4. 启动前端与可用性检测",
  "5. 完成并打开系统"
)

$stepLabels = @()
for ($i = 0; $i -lt $steps.Count; $i++) {
  $lbl = New-Object System.Windows.Forms.Label
  $lbl.Text = $steps[$i]
  $lbl.Font = New-Object System.Drawing.Font("Microsoft YaHei UI", 10)
  $lbl.ForeColor = [System.Drawing.Color]::FromArgb(122, 136, 162)
  $lbl.AutoSize = $true
  $lbl.Location = New-Object System.Drawing.Point(18, 12 + ($i * 24))
  $stepPanel.Controls.Add($lbl)
  $stepLabels += $lbl
}

$progress = New-Object System.Windows.Forms.ProgressBar
$progress.Location = New-Object System.Drawing.Point(34, 252)
$progress.Size = New-Object System.Drawing.Size(552, 22)
$progress.Minimum = 0
$progress.Maximum = 100
$progress.Value = 0
$progress.Style = "Continuous"
$rightPane.Controls.Add($progress)

$status = New-Object System.Windows.Forms.Label
$status.Text = "准备启动..."
$status.Font = New-Object System.Drawing.Font("Microsoft YaHei UI", 10, [System.Drawing.FontStyle]::Bold)
$status.ForeColor = [System.Drawing.Color]::FromArgb(39, 66, 108)
$status.AutoSize = $true
$status.Location = New-Object System.Drawing.Point(34, 280)
$rightPane.Controls.Add($status)

$logBox = New-Object System.Windows.Forms.RichTextBox
$logBox.Location = New-Object System.Drawing.Point(34, 308)
$logBox.Size = New-Object System.Drawing.Size(552, 236)
$logBox.ReadOnly = $true
$logBox.BackColor = [System.Drawing.Color]::White
$logBox.BorderStyle = "FixedSingle"
$logBox.Font = New-Object System.Drawing.Font("Consolas", 10)
$rightPane.Controls.Add($logBox)

$btnLaunch = New-Object System.Windows.Forms.Button
$btnLaunch.Text = "重新启动检测"
$btnLaunch.Location = New-Object System.Drawing.Point(34, 558)
$btnLaunch.Size = New-Object System.Drawing.Size(170, 36)
$btnLaunch.BackColor = [System.Drawing.Color]::FromArgb(15, 91, 216)
$btnLaunch.ForeColor = [System.Drawing.Color]::White
$btnLaunch.FlatStyle = "Flat"
$btnLaunch.FlatAppearance.BorderSize = 0
$rightPane.Controls.Add($btnLaunch)

$btnOpen = New-Object System.Windows.Forms.Button
$btnOpen.Text = "打开系统"
$btnOpen.Location = New-Object System.Drawing.Point(214, 558)
$btnOpen.Size = New-Object System.Drawing.Size(120, 36)
$btnOpen.BackColor = [System.Drawing.Color]::White
$btnOpen.ForeColor = [System.Drawing.Color]::FromArgb(31, 64, 121)
$btnOpen.FlatStyle = "Flat"
$btnOpen.FlatAppearance.BorderColor = [System.Drawing.Color]::FromArgb(185, 205, 236)
$btnOpen.Enabled = $false
$rightPane.Controls.Add($btnOpen)

$btnLogs = New-Object System.Windows.Forms.Button
$btnLogs.Text = "查看日志"
$btnLogs.Location = New-Object System.Drawing.Point(344, 558)
$btnLogs.Size = New-Object System.Drawing.Size(120, 36)
$btnLogs.FlatStyle = "Flat"
$rightPane.Controls.Add($btnLogs)

$btnClose = New-Object System.Windows.Forms.Button
$btnClose.Text = "关闭"
$btnClose.Location = New-Object System.Drawing.Point(498, 558)
$btnClose.Size = New-Object System.Drawing.Size(88, 36)
$btnClose.FlatStyle = "Flat"
$rightPane.Controls.Add($btnClose)

$btnClose.Add_Click({ $form.Close() })
$btnOpen.Add_Click({ Start-Process $frontendUrl })
$btnLogs.Add_Click({ Start-Process "explorer.exe" $runtimeDir })

function Write-UiLog {
  param(
    [string]$Text,
    [string]$Kind = "info"
  )
  $color = [System.Drawing.Color]::FromArgb(72, 88, 112)
  if ($Kind -eq "ok") { $color = [System.Drawing.Color]::FromArgb(17, 125, 77) }
  if ($Kind -eq "warn") { $color = [System.Drawing.Color]::FromArgb(178, 107, 19) }
  if ($Kind -eq "error") { $color = [System.Drawing.Color]::FromArgb(176, 40, 40) }

  $logBox.SelectionStart = $logBox.TextLength
  $logBox.SelectionColor = [System.Drawing.Color]::FromArgb(130, 145, 170)
  $logBox.AppendText(("[{0}] " -f (Get-Date -Format "HH:mm:ss")))
  $logBox.SelectionColor = $color
  $logBox.AppendText($Text + [Environment]::NewLine)
  $logBox.SelectionColor = $logBox.ForeColor
  $logBox.ScrollToCaret()
  Append-SessionLog $Text
}

function Set-StepVisual {
  param([int]$Index)
  for ($i = 0; $i -lt $stepLabels.Count; $i++) {
    if ($i -lt $Index) {
      $stepLabels[$i].ForeColor = [System.Drawing.Color]::FromArgb(17, 125, 77)
      $stepLabels[$i].Text = $steps[$i] + "   [完成]"
    } elseif ($i -eq $Index) {
      $stepLabels[$i].ForeColor = [System.Drawing.Color]::FromArgb(21, 79, 175)
      $stepLabels[$i].Text = $steps[$i] + "   [进行中]"
    } else {
      $stepLabels[$i].ForeColor = [System.Drawing.Color]::FromArgb(122, 136, 162)
      $stepLabels[$i].Text = $steps[$i]
    }
  }
}

function Set-ProgressState {
  param(
    [string]$Text,
    [int]$Value,
    [int]$StepIndex
  )
  $status.Text = $Text
  $progress.Value = [Math]::Max(0, [Math]::Min(100, $Value))
  Set-StepVisual -Index $StepIndex
  [System.Windows.Forms.Application]::DoEvents()
  Write-UiLog $Text
}

function Run-Launcher {
  try {
    $btnLaunch.Enabled = $false
    $btnOpen.Enabled = $false
    $progress.Value = 0
    $logBox.Clear()
    Set-StepVisual -Index 0

    Set-ProgressState "检查 Node.js / npm 环境..." 8 0
    $nodeCmd = Get-Command node -ErrorAction SilentlyContinue
    $npmCmd = Get-Command npm -ErrorAction SilentlyContinue
    if (-not $nodeCmd -or -not $npmCmd) {
      throw "未检测到 Node.js 或 npm，请安装后重试。"
    }
    Write-UiLog "运行环境检查通过。" "ok"

    Set-ProgressState "执行依赖与服务启动..." 30 1
    Write-UiLog "正在调用核心启动引擎，请稍候..." "info"
    $coreCmd = "& '$startupCore' -NoBrowser"
    $null = powershell -NoProfile -ExecutionPolicy Bypass -Command $coreCmd
    if ($LASTEXITCODE -ne 0) {
      throw "核心启动引擎执行失败，请查看 .runtime 日志。"
    }

    Set-ProgressState "检测前端可访问..." 86 3
    Start-Sleep -Milliseconds 500
    $ok = $false
    try {
      $resp = Invoke-WebRequest -Uri $frontendUrl -UseBasicParsing -TimeoutSec 8
      $ok = ($resp.StatusCode -eq 200)
    } catch {
      $ok = $false
    }
    if (-not $ok) {
      throw "前端地址不可访问：$frontendUrl"
    }
    Write-UiLog "前端可访问，启动链路正常。" "ok"

    Set-ProgressState "启动完成，正在打开财务系统..." 100 4
    Start-Process $frontendUrl
    Write-UiLog "系统已打开，默认账号：admin / admin123" "ok"
    $btnOpen.Enabled = $true
    $btnLaunch.Enabled = $true
    [System.Windows.Forms.MessageBox]::Show("启动完成，系统已打开。", "成功", [System.Windows.Forms.MessageBoxButtons]::OK, [System.Windows.Forms.MessageBoxIcon]::Information) | Out-Null
  } catch {
    $btnLaunch.Enabled = $true
    $btnOpen.Enabled = $false
    $status.Text = "启动失败"
    $progress.Value = 0
    Write-UiLog ("错误: " + $_.Exception.Message) "error"
    [System.Windows.Forms.MessageBox]::Show($_.Exception.Message, "启动失败", [System.Windows.Forms.MessageBoxButtons]::OK, [System.Windows.Forms.MessageBoxIcon]::Error) | Out-Null
  }
}

$btnLaunch.Add_Click({ Run-Launcher })

$form.Add_Shown({
  $fadeTimer.Start()
  [System.Windows.Forms.Application]::DoEvents()
  Start-Sleep -Milliseconds 350
  Run-Launcher
})

[void]$form.ShowDialog()
