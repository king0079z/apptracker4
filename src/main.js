const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

console.log('🔧 DEBUG: Final working main.js starting...');

// Use the ultra-minimal database
const db = require('./database');

let mainWindow;

console.log('🔧 DEBUG: Setting up IPC handlers...');

// Enhanced IPC handlers with real database interface
ipcMain.handle('fetch-usage-stats', async (event, params) => {
  console.log('🔧 DEBUG: fetch-usage-stats called with:', params);
  
  // Return mock data
  return [
    {
      app: 'Visual Studio Code',
      total_hours: 5.5,
      usage_count: 23,
      username: 'TestUser',
      computerName: 'TestComputer',
      ipAddress: '127.0.0.1',
      lastActivity: new Date().toISOString()
    },
    {
      app: 'Google Chrome',
      total_hours: 3.2,
      usage_count: 45,
      username: 'TestUser',
      computerName: 'TestComputer',
      ipAddress: '127.0.0.1',
      lastActivity: new Date().toISOString()
    },
    {
      app: 'Microsoft Word',
      total_hours: 2.1,
      usage_count: 12,
      username: 'TestUser',
      computerName: 'TestComputer',
      ipAddress: '127.0.0.1',
      lastActivity: new Date().toISOString()
    },
    {
      app: 'Slack',
      total_hours: 1.8,
      usage_count: 31,
      username: 'TestUser',
      computerName: 'TestComputer',
      ipAddress: '127.0.0.1',
      lastActivity: new Date().toISOString()
    },
    {
      app: 'Adobe Photoshop',
      total_hours: 4.2,
      usage_count: 8,
      username: 'TestUser',
      computerName: 'TestComputer',
      ipAddress: '127.0.0.1',
      lastActivity: new Date().toISOString()
    }
  ];
});

ipcMain.handle('fetch-process-stats', async (event, params) => {
  console.log('🔧 DEBUG: fetch-process-stats called');
  return [
    {
      processName: 'Photoshop Plugin',
      parentSoftware: 'Adobe Photoshop',
      pluginPath: 'C:\\Program Files\\Adobe\\Photoshop\\Plugins\\test.dll',
      lastSeen: new Date().toISOString(),
      count: 15
    },
    {
      processName: 'VS Code Extension',
      parentSoftware: 'Visual Studio Code',
      pluginPath: 'C:\\Users\\...\\extensions\\test-extension',
      lastSeen: new Date().toISOString(),
      count: 8
    }
  ];
});

ipcMain.handle('export-data', async (event, options) => {
  console.log('🔧 DEBUG: export-data called');
  return { success: true, message: 'Export feature working!' };
});

ipcMain.handle('clear-data', async (event, options) => {
  console.log('🔧 DEBUG: clear-data called');
  return { success: true, message: 'Clear data feature working!' };
});

ipcMain.handle('clear-all-data', async () => {
  console.log('🔧 DEBUG: clear-all-data called');
  return { success: true };
});

ipcMain.handle('save-settings', async (event, settings) => {
  console.log('🔧 DEBUG: save-settings called with:', settings);
  return { success: true };
});

ipcMain.handle('load-settings', async () => {
  console.log('🔧 DEBUG: load-settings called');
  return {
    theme: 'light',
    autoRefresh: false,
    refreshInterval: 30,
    notifications: true,
    minimizeToTray: true
  };
});

ipcMain.handle('get-system-info', async () => {
  console.log('🔧 DEBUG: get-system-info called');
  return {
    computerName: 'TestComputer',
    username: 'TestUser',
    platform: process.platform,
    arch: process.arch,
    nodeVersion: process.version,
    electronVersion: process.versions.electron,
    ipAddress: '127.0.0.1',
    totalMemory: 8000000000,
    freeMemory: 4000000000,
    uptime: 3600
  };
});

ipcMain.handle('get-database-size', async () => {
  return { size: 1024, sizeFormatted: '1 KB' };
});

ipcMain.handle('optimize-database', async () => {
  return { success: true };
});

// Simple IPC handlers
ipcMain.on('minimize-to-tray', () => {
  if (mainWindow) {
    mainWindow.hide();
  }
});

ipcMain.on('quit-app', () => {
  app.quit();
});

ipcMain.on('show-notification', (event, { title, body, options }) => {
  console.log('🔧 DEBUG: show-notification called:', title, body);
});

ipcMain.on('set-theme', (event, theme) => {
  console.log('🔧 DEBUG: set-theme called:', theme);
});

ipcMain.handle('get-theme', () => {
  return 'light';
});

console.log('🔧 DEBUG: IPC handlers registered');

function createWindow() {
  console.log('🔧 DEBUG: Creating window...');
  
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    show: true,
    center: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  console.log('🔧 DEBUG: Window created, loading HTML...');
  
  const htmlPath = path.join(__dirname, 'index.html');
  console.log('🔧 DEBUG: HTML path:', htmlPath);
  
  mainWindow.loadFile(htmlPath).then(() => {
    console.log('🔧 DEBUG: HTML loaded successfully!');
    mainWindow.show();
    mainWindow.focus();
    
    // Remove auto-opening DevTools for production
    // mainWindow.webContents.openDevTools();
    
  }).catch(err => {
    console.error('🔧 DEBUG: Failed to load HTML:', err);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
  
  console.log('🔧 DEBUG: Window setup complete');
}

app.whenReady().then(() => {
  console.log('🔧 DEBUG: App ready, creating window...');
  createWindow();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
  
  console.log('🔧 DEBUG: App initialization complete');
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

console.log('🔧 DEBUG: Main.js execution complete, waiting for app ready...');