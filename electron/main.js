const { app, BrowserWindow, shell, Menu, Tray, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

let mainWindow = null;
let serverProcess = null;
let tray = null;
let logStream = null;

const SERVER_PORT = 3000;
const SERVER_URL = `http://localhost:${SERVER_PORT}`;

// ─── Initialisation des Logs ───────────────────────────────────────────────────
function initLogging() {
  try {
    const userDataPath = app.getPath('userData');
    const logDir = path.join(userDataPath, 'logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    const logFilePath = path.join(logDir, 'startup.log');
    logStream = fs.createWriteStream(logFilePath, { flags: 'a' });
    log(`--- Démarrage de l'application (v${app.getVersion()}) ---`);
    log(`UserData path: ${userDataPath}`);
    log(`ExecPath: ${process.execPath}`);
  } catch (e) {
    console.error('Impossible d\'initialiser le fichier de log:', e);
  }
}

function log(message) {
  const formatted = `[${new Date().toISOString()}] ${message}`;
  console.log(formatted);
  if (logStream) {
    logStream.write(formatted + '\n');
  }
}

function logError(message, err) {
  const errStr = err ? `\nError: ${err.message}\nStack: ${err.stack}` : '';
  const formatted = `[${new Date().toISOString()}] [ERROR] ${message}${errStr}`;
  console.error(formatted);
  if (logStream) {
    logStream.write(formatted + '\n');
  }
}

// ─── Démarrer le serveur Express ───────────────────────────────────────────────
function startServer() {
  const serverPath = path.join(__dirname, '..', 'dist', 'server.cjs');
  log(`Tentative de démarrage du serveur à: ${serverPath}`);
  log(`Existe en tant que fichier? ${fs.existsSync(serverPath)}`);

  const spawnEnv = {
    ...process.env,
    NODE_ENV: 'production',
    PORT: String(SERVER_PORT),
    ELECTRON_RUN_AS_NODE: '1' // Force l'exécution en mode Node.js sous Electron
  };

  serverProcess = spawn(process.execPath, [serverPath], {
    env: spawnEnv,
    stdio: 'pipe',
  });

  serverProcess.stdout?.on('data', (data) => {
    log(`[Server stdout] ${data.toString().trim()}`);
  });

  serverProcess.stderr?.on('data', (data) => {
    logError(`[Server stderr] ${data.toString().trim()}`);
  });

  serverProcess.on('exit', (code, signal) => {
    log(`[Server exit] Arrêté avec le code ${code} et le signal ${signal}`);
  });

  serverProcess.on('error', (err) => {
    logError('Échec du démarrage du processus serveur', err);
  });
}

// ─── Attendre que le serveur soit prêt ─────────────────────────────────────────
function waitForServer(retries = 30, delay = 500) {
  return new Promise((resolve, reject) => {
    const attempt = () => {
      http.get(SERVER_URL, (res) => {
        if (res.statusCode === 200 || res.statusCode === 304) {
          resolve(true);
        } else {
          retry();
        }
      }).on('error', () => {
        retry();
      });
    };
    const retry = () => {
      if (retries-- <= 0) {
        reject(new Error('Serveur non disponible après plusieurs tentatives'));
      } else {
        setTimeout(attempt, delay);
      }
    };
    attempt();
  });
}

// ─── Créer la fenêtre principale ──────────────────────────────────────────────
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    title: 'Nexus POS Pro',
    icon: path.join(__dirname, '..', 'dist', 'icon.svg'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    autoHideMenuBar: true,
    backgroundColor: '#020617',
    show: false, // ne montrer qu'après chargement
  });

  // Activer les limites de zoom visuel pour pincer/molette
  mainWindow.webContents.setVisualZoomLevelLimits(1, 3);

  mainWindow.loadURL(SERVER_URL);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  // Raccourcis clavier (Rafraîchissement F5/Ctrl+R, Zoom Ctrl+/Ctrl-, Console F12)
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.type !== 'keyDown') return;

    const key = input.key.toLowerCase();

    // Activer la console d'erreur (DevTools) avec F12, Ctrl+Shift+I, ou Ctrl+Alt+I
    if (key === 'f12' || (input.control && input.shift && key === 'i') || (input.control && input.alt && key === 'i')) {
      mainWindow.webContents.toggleDevTools();
      event.preventDefault();
      return;
    }

    // Rafraîchir l'application (F5 ou Ctrl+R)
    if (key === 'f5' || (input.control && key === 'r')) {
      mainWindow.webContents.reload();
      event.preventDefault();
      return;
    }

    // Zoomer (Ctrl + Plus ou Ctrl + =)
    if (input.control && (key === '+' || key === '=' || key === 'add')) {
      const currentZoom = mainWindow.webContents.getZoomLevel();
      mainWindow.webContents.setZoomLevel(currentZoom + 0.5);
      event.preventDefault();
      return;
    }

    // Dézoomer (Ctrl + Moins)
    if (input.control && (key === '-' || key === 'subtract')) {
      const currentZoom = mainWindow.webContents.getZoomLevel();
      mainWindow.webContents.setZoomLevel(currentZoom - 0.5);
      event.preventDefault();
      return;
    }

    // Réinitialiser le zoom (Ctrl + 0)
    if (input.control && key === '0') {
      mainWindow.webContents.setZoomLevel(0);
      event.preventDefault();
      return;
    }
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (!url || url === 'about:blank' || url.startsWith('about:')) {
      return { action: 'allow' };
    }
    if (url.includes('/auth/v1/authorize') || url.includes('accounts.google.com') || url.includes('supabase.co/auth')) {
      return { action: 'allow' };
    }
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('mailto:') || url.startsWith('tel:')) {
      shell.openExternal(url).catch(() => {});
    }
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  Menu.setApplicationMenu(null);
}

// ─── Lifecycle Electron ────────────────────────────────────────────────────────
app.whenReady().then(async () => {
  initLogging();
  try {
    startServer();
    log('Attente du serveur...');
    await waitForServer();
    log('Serveur prêt. Création de la fenêtre...');
    createWindow();
  } catch (err) {
    logError('Erreur fatale au démarrage', err);
    dialog.showErrorBox(
      'Erreur de démarrage',
      `Impossible de démarrer le serveur de l'application.\n\nFichier de log: ${path.join(app.getPath('userData'), 'logs', 'startup.log')}\n\nDétails: ${err.message}`
    );
    app.quit();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
});

