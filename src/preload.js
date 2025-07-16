const { contextBridge, ipcRenderer } = require('electron');

console.log('Preload script executed'); // Debugging log

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('api', {
  // Usage Statistics
  fetchUsageStats: (params) => {
    console.log('API: fetchUsageStats called with params:', params);
    return ipcRenderer.invoke('fetch-usage-stats', params);
  },

  // Process Statistics
  fetchProcessStats: (params) => {
    console.log('API: fetchProcessStats called with params:', params);
    return ipcRenderer.invoke('fetch-process-stats', params);
  },

  // Data Management
  exportData: (options) => {
    console.log('API: exportData called with options:', options);
    return ipcRenderer.invoke('export-data', options);
  },

  clearData: (options = {}) => {
    console.log('API: clearData called');
    return ipcRenderer.invoke('clear-data', options);
  },

  clearAllData: () => {
    console.log('API: clearAllData called');
    return ipcRenderer.invoke('clear-all-data');
  },

  // Settings Management
  saveSettings: (settings) => {
    console.log('API: saveSettings called');
    return ipcRenderer.invoke('save-settings', settings);
  },

  loadSettings: () => {
    console.log('API: loadSettings called');
    return ipcRenderer.invoke('load-settings');
  },

  // Backup and Restore
  createBackup: (filePath) => {
    console.log('API: createBackup called');
    return ipcRenderer.invoke('create-backup', filePath);
  },

  restoreBackup: (filePath) => {
    console.log('API: restoreBackup called');
    return ipcRenderer.invoke('restore-backup', filePath);
  },

  // System Information
  getSystemInfo: () => {
    console.log('API: getSystemInfo called');
    return ipcRenderer.invoke('get-system-info');
  },

  // Application Control
  minimizeToTray: () => {
    console.log('API: minimizeToTray called');
    ipcRenderer.send('minimize-to-tray');
  },

  quitApp: () => {
    console.log('API: quitApp called');
    ipcRenderer.send('quit-app');
  },

  showNotification: (title, body, options = {}) => {
    console.log('API: showNotification called');
    ipcRenderer.send('show-notification', { title, body, options });
  },

  // File Operations
  selectFile: (options = {}) => {
    console.log('API: selectFile called');
    return ipcRenderer.invoke('select-file', options);
  },

  selectDirectory: (options = {}) => {
    console.log('API: selectDirectory called');
    return ipcRenderer.invoke('select-directory', options);
  },

  saveFile: (content, options = {}) => {
    console.log('API: saveFile called');
    return ipcRenderer.invoke('save-file', content, options);
  },

  // Update Management
  checkForUpdates: () => {
    console.log('API: checkForUpdates called');
    return ipcRenderer.invoke('check-for-updates');
  },

  downloadUpdate: () => {
    console.log('API: downloadUpdate called');
    return ipcRenderer.invoke('download-update');
  },

  installUpdate: () => {
    console.log('API: installUpdate called');
    ipcRenderer.send('install-update');
  },

  // Log Management
  getLogs: (options = {}) => {
    console.log('API: getLogs called');
    return ipcRenderer.invoke('get-logs', options);
  },

  clearLogs: () => {
    console.log('API: clearLogs called');
    return ipcRenderer.invoke('clear-logs');
  },

  // Database Operations
  optimizeDatabase: () => {
    console.log('API: optimizeDatabase called');
    return ipcRenderer.invoke('optimize-database');
  },

  getDatabaseSize: () => {
    console.log('API: getDatabaseSize called');
    return ipcRenderer.invoke('get-database-size');
  },

  // Event Listeners for main process communications
  onNavigate: (callback) => {
    ipcRenderer.on('navigate-to-dashboard', callback);
    ipcRenderer.on('navigate-to-settings', callback);
    ipcRenderer.on('navigate-to-table', callback);
  },

  onUpdateAvailable: (callback) => {
    ipcRenderer.on('update-available', callback);
  },

  onUpdateDownloaded: (callback) => {
    ipcRenderer.on('update-downloaded', callback);
  },

  onDataChanged: (callback) => {
    ipcRenderer.on('data-changed', callback);
  },

  onSettingsChanged: (callback) => {
    ipcRenderer.on('settings-changed', callback);
  },

  // Remove event listeners
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  },

  // Theme Management
  setTheme: (theme) => {
    console.log('API: setTheme called with:', theme);
    ipcRenderer.send('set-theme', theme);
  },

  getTheme: () => {
    console.log('API: getTheme called');
    return ipcRenderer.invoke('get-theme');
  },

  // Window Management
  setWindowBounds: (bounds) => {
    console.log('API: setWindowBounds called');
    ipcRenderer.send('set-window-bounds', bounds);
  },

  getWindowBounds: () => {
    console.log('API: getWindowBounds called');
    return ipcRenderer.invoke('get-window-bounds');
  },

  setAlwaysOnTop: (flag) => {
    console.log('API: setAlwaysOnTop called');
    ipcRenderer.send('set-always-on-top', flag);
  },

  // Performance Monitoring
  getPerformanceMetrics: () => {
    console.log('API: getPerformanceMetrics called');
    return ipcRenderer.invoke('get-performance-metrics');
  },

  // Data Validation
  validateData: () => {
    console.log('API: validateData called');
    return ipcRenderer.invoke('validate-data');
  },

  repairData: () => {
    console.log('API: repairData called');
    return ipcRenderer.invoke('repair-data');
  }
});

// Platform information
contextBridge.exposeInMainWorld('platform', {
  isWindows: process.platform === 'win32',
  isMac: process.platform === 'darwin',
  isLinux: process.platform === 'linux',
  platform: process.platform,
  arch: process.arch,
  version: process.version
});

// Environment information
contextBridge.exposeInMainWorld('env', {
  NODE_ENV: process.env.NODE_ENV || 'production',
  isDevelopment: process.env.NODE_ENV === 'development'
});