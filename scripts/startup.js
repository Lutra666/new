#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

const root = path.resolve(__dirname, '..');
const noBrowser = process.argv.includes('--no-browser');
const psScript = path.join(root, 'scripts', 'start-system.ps1');
const args = ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', psScript];

if (noBrowser) {
  args.push('-NoBrowser');
}

const child = spawn('powershell.exe', args, {
  cwd: root,
  stdio: 'inherit',
});

child.on('exit', (code) => {
  process.exit(code || 0);
});

child.on('error', (err) => {
  console.error('启动失败:', err.message);
  process.exit(1);
});
