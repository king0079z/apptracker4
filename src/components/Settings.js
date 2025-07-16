import React, { useState, useEffect } from 'react';

const Settings = ({ 
  theme,
  onThemeChange,
  autoRefresh,
  refreshInterval,
  onAutoRefreshChange,
  onRefreshIntervalChange,
  onNotification
}) => {
  const [settings, setSettings] = useState({
    notifications: true,
    autoStart: true,
    minimizeToTray: true,
    trackIdleTime: false,
    idleThreshold: 300, // 5 minutes
    dataRetention: 90, // days
    exportFormat: 'csv',
    updateInterval: 1000,
    enableLogging: true,
    logLevel: 'info',
    monitoredApps: [],
    blacklistedApps: [],
    privacyMode: false,
    autoBackup: false,
    backupInterval: 7 // days
  });

  const [tempSettings, setTempSettings] = useState(settings);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Load settings from localStorage or API
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
        setTempSettings(parsed);
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    }
  }, []);

  useEffect(() => {
    setHasChanges(JSON.stringify(settings) !== JSON.stringify(tempSettings));
  }, [settings, tempSettings]);

  const handleSettingChange = (key, value) => {
    setTempSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveSettings = async () => {
    try {
      // Save to localStorage
      localStorage.setItem('appSettings', JSON.stringify(tempSettings));
      
      // If API is available, save to backend
      if (window.api && window.api.saveSettings) {
        await window.api.saveSettings(tempSettings);
      }
      
      setSettings(tempSettings);
      onNotification('Settings saved successfully', 'success');
    } catch (error) {
      console.error('Failed to save settings:', error);
      onNotification('Failed to save settings', 'error');
    }
  };

  const resetSettings = () => {
    setTempSettings(settings);
    onNotification('Settings reset', 'info');
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(tempSettings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'app-tracker-settings.json';
    link.click();
    
    onNotification('Settings exported', 'success');
  };

  const importSettings = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedSettings = JSON.parse(e.target.result);
        setTempSettings(importedSettings);
        onNotification('Settings imported successfully', 'success');
      } catch (error) {
        console.error('Failed to import settings:', error);
        onNotification('Failed to import settings - Invalid file format', 'error');
      }
    };
    reader.readAsText(file);
  };

  const clearAllData = async () => {
    if (window.confirm('Are you sure you want to clear all tracking data? This action cannot be undone.')) {
      try {
        if (window.api && window.api.clearAllData) {
          await window.api.clearAllData();
          onNotification('All data cleared successfully', 'success');
        }
      } catch (error) {
        console.error('Failed to clear data:', error);
        onNotification('Failed to clear data', 'error');
      }
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h2>⚙️ Settings</h2>
        <div className="settings-actions">
          {hasChanges && (
            <>
              <button className="btn btn-secondary" onClick={resetSettings}>
                Reset Changes
              </button>
              <button className="btn btn-primary" onClick={saveSettings}>
                Save Changes
              </button>
            </>
          )}
        </div>
      </div>

      {/* General Settings */}
      <div className="settings-section">
        <h3>🔧 General</h3>
        
        <div className="settings-item">
          <div className="settings-item-info">
            <h4>Theme</h4>
            <p>Choose between light and dark theme</p>
          </div>
          <div className="settings-item-control">
            <select 
              value={theme} 
              onChange={(e) => onThemeChange(e.target.value)}
              className="settings-select"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
        </div>

        <div className="settings-item">
          <div className="settings-item-info">
            <h4>Auto-start Application</h4>
            <p>Start the application automatically when system boots</p>
          </div>
          <div className="settings-item-control">
            <label className="toggle-switch">
              <input 
                type="checkbox"
                checked={tempSettings.autoStart}
                onChange={(e) => handleSettingChange('autoStart', e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>

        <div className="settings-item">
          <div className="settings-item-info">
            <h4>Minimize to System Tray</h4>
            <p>Hide the application in system tray when minimized</p>
          </div>
          <div className="settings-item-control">
            <label className="toggle-switch">
              <input 
                type="checkbox"
                checked={tempSettings.minimizeToTray}
                onChange={(e) => handleSettingChange('minimizeToTray', e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>

        <div className="settings-item">
          <div className="settings-item-info">
            <h4>Enable Notifications</h4>
            <p>Show desktop notifications for important events</p>
          </div>
          <div className="settings-item-control">
            <label className="toggle-switch">
              <input 
                type="checkbox"
                checked={tempSettings.notifications}
                onChange={(e) => handleSettingChange('notifications', e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>
      </div>

      {/* Tracking Settings */}
      <div className="settings-section">
        <h3>📊 Tracking</h3>
        
        <div className="settings-item">
          <div className="settings-item-info">
            <h4>Auto Refresh</h4>
            <p>Automatically refresh data at regular intervals</p>
          </div>
          <div className="settings-item-control">
            <label className="toggle-switch">
              <input 
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => onAutoRefreshChange(e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>

        <div className="settings-item">
          <div className="settings-item-info">
            <h4>Refresh Interval</h4>
            <p>How often to refresh data (in seconds)</p>
          </div>
          <div className="settings-item-control">
            <input 
              type="number"
              min="10"
              max="300"
              value={refreshInterval}
              onChange={(e) => onRefreshIntervalChange(Number(e.target.value))}
              disabled={!autoRefresh}
              className="settings-input"
            />
          </div>
        </div>

        <div className="settings-item">
          <div className="settings-item-info">
            <h4>Track Idle Time</h4>
            <p>Track periods when the computer is idle</p>
          </div>
          <div className="settings-item-control">
            <label className="toggle-switch">
              <input 
                type="checkbox"
                checked={tempSettings.trackIdleTime}
                onChange={(e) => handleSettingChange('trackIdleTime', e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>

        <div className="settings-item">
          <div className="settings-item-info">
            <h4>Idle Threshold</h4>
            <p>Time in seconds before considering the system idle</p>
          </div>
          <div className="settings-item-control">
            <input 
              type="number"
              min="60"
              max="1800"
              value={tempSettings.idleThreshold}
              onChange={(e) => handleSettingChange('idleThreshold', Number(e.target.value))}
              disabled={!tempSettings.trackIdleTime}
              className="settings-input"
            />
          </div>
        </div>

        <div className="settings-item">
          <div className="settings-item-info">
            <h4>Update Interval</h4>
            <p>How frequently to check for active window changes (milliseconds)</p>
          </div>
          <div className="settings-item-control">
            <input 
              type="number"
              min="500"
              max="5000"
              step="500"
              value={tempSettings.updateInterval}
              onChange={(e) => handleSettingChange('updateInterval', Number(e.target.value))}
              className="settings-input"
            />
          </div>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="settings-section">
        <h3>🔒 Privacy</h3>
        
        <div className="settings-item">
          <div className="settings-item-info">
            <h4>Privacy Mode</h4>
            <p>Hide sensitive application names and window titles</p>
          </div>
          <div className="settings-item-control">
            <label className="toggle-switch">
              <input 
                type="checkbox"
                checked={tempSettings.privacyMode}
                onChange={(e) => handleSettingChange('privacyMode', e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>

        <div className="settings-item">
          <div className="settings-item-info">
            <h4>Data Retention Period</h4>
            <p>How long to keep tracking data (in days)</p>
          </div>
          <div className="settings-item-control">
            <select 
              value={tempSettings.dataRetention}
              onChange={(e) => handleSettingChange('dataRetention', Number(e.target.value))}
              className="settings-select"
            >
              <option value={30}>30 days</option>
              <option value={60}>60 days</option>
              <option value={90}>90 days</option>
              <option value={180}>6 months</option>
              <option value={365}>1 year</option>
              <option value={-1}>Forever</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="settings-section">
        <h3>💾 Data Management</h3>
        
        <div className="settings-item">
          <div className="settings-item-info">
            <h4>Default Export Format</h4>
            <p>Default format for data exports</p>
          </div>
          <div className="settings-item-control">
            <select 
              value={tempSettings.exportFormat}
              onChange={(e) => handleSettingChange('exportFormat', e.target.value)}
              className="settings-select"
            >
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
              <option value="xlsx">Excel</option>
            </select>
          </div>
        </div>

        <div className="settings-item">
          <div className="settings-item-info">
            <h4>Auto Backup</h4>
            <p>Automatically backup data at regular intervals</p>
          </div>
          <div className="settings-item-control">
            <label className="toggle-switch">
              <input 
                type="checkbox"
                checked={tempSettings.autoBackup}
                onChange={(e) => handleSettingChange('autoBackup', e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>

        <div className="settings-item">
          <div className="settings-item-info">
            <h4>Backup Interval</h4>
            <p>How often to create automatic backups (in days)</p>
          </div>
          <div className="settings-item-control">
            <select 
              value={tempSettings.backupInterval}
              onChange={(e) => handleSettingChange('backupInterval', Number(e.target.value))}
              disabled={!tempSettings.autoBackup}
              className="settings-select"
            >
              <option value={1}>Daily</option>
              <option value={7}>Weekly</option>
              <option value={30}>Monthly</option>
            </select>
          </div>
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="settings-section">
        <h3>🔬 Advanced</h3>
        
        <div className="settings-item">
          <div className="settings-item-info">
            <h4>Enable Logging</h4>
            <p>Create log files for debugging purposes</p>
          </div>
          <div className="settings-item-control">
            <label className="toggle-switch">
              <input 
                type="checkbox"
                checked={tempSettings.enableLogging}
                onChange={(e) => handleSettingChange('enableLogging', e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>

        <div className="settings-item">
          <div className="settings-item-info">
            <h4>Log Level</h4>
            <p>Level of detail for log files</p>
          </div>
          <div className="settings-item-control">
            <select 
              value={tempSettings.logLevel}
              onChange={(e) => handleSettingChange('logLevel', e.target.value)}
              disabled={!tempSettings.enableLogging}
              className="settings-select"
            >
              <option value="error">Error</option>
              <option value="warn">Warning</option>
              <option value="info">Info</option>
              <option value="debug">Debug</option>
            </select>
          </div>
        </div>
      </div>

      {/* Import/Export */}
      <div className="settings-section">
        <h3>📁 Import/Export</h3>
        
        <div className="settings-actions-grid">
          <button className="btn btn-secondary" onClick={exportSettings}>
            📤 Export Settings
          </button>
          
          <label className="btn btn-secondary file-input-label">
            📥 Import Settings
            <input 
              type="file"
              accept=".json"
              onChange={importSettings}
              style={{ display: 'none' }}
            />
          </label>
          
          <button className="btn btn-danger" onClick={clearAllData}>
            🗑️ Clear All Data
          </button>
        </div>
      </div>

      {/* Application Info */}
      <div className="settings-section">
        <h3>ℹ️ Application Info</h3>
        
        <div className="app-info-grid">
          <div className="info-item">
            <span className="info-label">Version:</span>
            <span className="info-value">1.2.0</span>
          </div>
          <div className="info-item">
            <span className="info-label">Build:</span>
            <span className="info-value">2024.07.15</span>
          </div>
          <div className="info-item">
            <span className="info-label">Platform:</span>
            <span className="info-value">{navigator.platform}</span>
          </div>
          <div className="info-item">
            <span className="info-label">User Agent:</span>
            <span className="info-value">{navigator.userAgent.split(' ')[0]}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;