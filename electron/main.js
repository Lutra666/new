const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { app, BrowserWindow, dialog } = require('electron');

let server;
let mainWindow;

const backendPort = Number(process.env.PORT || 3001);
const appRoot = app.isPackaged ? process.resourcesPath : path.join(__dirname, '..');
const backendRoot = path.join(appRoot, 'backend');

function setDefaultEnv() {
  process.env.NODE_ENV = 'production';
  process.env.MOCK_DATA_DIR = path.join(app.getPath('userData'), 'data');

  if (!process.env.JWT_SECRET) {
    const secretDir = path.join(app.getPath('userData'), 'security');
    const secretFile = path.join(secretDir, 'jwt-secret.txt');
    if (!fs.existsSync(secretDir)) {
      fs.mkdirSync(secretDir, { recursive: true });
    }
    if (!fs.existsSync(secretFile)) {
      fs.writeFileSync(secretFile, crypto.randomBytes(48).toString('hex'), 'utf8');
    }
    process.env.JWT_SECRET = fs.readFileSync(secretFile, 'utf8').trim();
  }

  if (!process.env.JWT_EXPIRES_IN) {
    process.env.JWT_EXPIRES_IN = '7d';
  }
}

function startBackend() {
  return new Promise((resolve, reject) => {
    try {
      const backendApp = require(path.join(backendRoot, 'src', 'server'));
      server = backendApp.listen(backendPort, '127.0.0.1', () => resolve());
      server.on('error', (error) => {
        if (error && error.code === 'EADDRINUSE') {
          resolve();
          return;
        }
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
}

function createMainWindow() {
  const allowedOrigin = `http://127.0.0.1:${backendPort}`;
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
    },
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  mainWindow.webContents.on('will-navigate', (event, targetUrl) => {
    if (!targetUrl.startsWith(allowedOrigin)) {
      event.preventDefault();
    }
  });

  mainWindow.loadURL(allowedOrigin);
}

async function boot() {
  setDefaultEnv();
  await startBackend();
  createMainWindow();
}

app.whenReady().then(boot).catch((error) => {
  dialog.showErrorBox('启动失败', `桌面端启动失败：${error.message}`);
  app.quit();
});

app.on('window-all-closed', () => {
  app.quit();
});

app.on('before-quit', () => {
  if (server) {
    server.close();
    server = null;
  }
});
