import React, { useEffect, useState } from 'react';
import UsageTable from './components/UsageTable';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import './styles.css';

const App = () => {
  const [data, setData] = useState([]);
  const [processData, setProcessData] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState('total_hours');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedUser, setSelectedUser] = useState('all');
  const [users, setUsers] = useState([]);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [notifications, setNotifications] = useState([]);
  const [theme, setTheme] = useState('light');
  const [exportFormat, setExportFormat] = useState('csv');

  const fetchStats = async (params = {}) => {
    setLoading(true);
    try {
      console.log('Fetching usage stats with params:', params);
      const fetchedData = await window.api.fetchUsageStats(params);
      setData(fetchedData);
      
      // Extract unique users
      const uniqueUsers = [...new Set(fetchedData.map(item => item.username))];
      setUsers(uniqueUsers);
      
      // Fetch process data
      const processStats = await window.api.fetchProcessStats(params);
      setProcessData(processStats);
      
    } catch (error) {
      console.error('Error fetching stats:', error);
      addNotification('Error fetching data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchProcessStats = async (params = {}) => {
    try {
      const processStats = await window.api.fetchProcessStats(params);
      setProcessData(processStats);
    } catch (error) {
      console.error('Error fetching process stats:', error);
    }
  };

  useEffect(() => {
    fetchStats();
    
    // Set up auto-refresh
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchStats();
      }, refreshInterval * 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, refreshInterval]);

  const handleSearch = () => {
    const params = {
      startDate: startDate ? `${startDate}T00:00:00` : null,
      endDate: endDate ? `${endDate}T23:59:59` : null,
      username: selectedUser !== 'all' ? selectedUser : null,
      searchTerm: searchTerm || null,
      sortBy,
      sortOrder
    };
    fetchStats(params);
  };

  const handleReload = () => {
    fetchStats();
    addNotification('Data reloaded successfully', 'success');
  };

  const handleExport = async () => {
    try {
      const result = await window.api.exportData({
        format: exportFormat,
        data: filteredData,
        startDate,
        endDate
      });
      
      if (result.success) {
        addNotification(`Data exported successfully to ${result.filePath}`, 'success');
      } else {
        addNotification('Export failed', 'error');
      }
    } catch (error) {
      console.error('Export error:', error);
      addNotification('Export failed', 'error');
    }
  };

  const handleClearData = async () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      try {
        await window.api.clearData();
        fetchStats();
        addNotification('Data cleared successfully', 'success');
      } catch (error) {
        console.error('Clear data error:', error);
        addNotification('Failed to clear data', 'error');
      }
    }
  };

  const addNotification = (message, type = 'info') => {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date()
    };
    setNotifications(prev => [...prev, notification]);
    
    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const filteredData = data.filter(item => {
    const matchesSearch = !searchTerm || 
      item.app.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.username.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesUser = selectedUser === 'all' || item.username === selectedUser;
    
    return item.app && 
           item.app !== 'Pick an app' && 
           matchesSearch && 
           matchesUser;
  });

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const getQuickStats = () => {
    const totalHours = filteredData.reduce((sum, item) => sum + (item.total_hours || 0), 0);
    const totalSessions = filteredData.reduce((sum, item) => sum + (item.usage_count || 0), 0);
    const uniqueApps = filteredData.length;
    const avgSessionTime = totalSessions > 0 ? totalHours / totalSessions : 0;
    
    return {
      totalHours: totalHours.toFixed(2),
      totalSessions,
      uniqueApps,
      avgSessionTime: avgSessionTime.toFixed(2)
    };
  };

  const quickStats = getQuickStats();

  return (
    <div className={`app-container ${theme}`} data-theme={theme}>
      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <h1>
            <i className="icon-monitor"></i>
            App Usage Tracker
          </h1>
          <span className="version">v1.2.0</span>
        </div>
        <div className="header-right">
          <button 
            className="theme-toggle"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <div className="status-indicator">
            <span className={`status-dot ${loading ? 'loading' : 'active'}`}></span>
            {loading ? 'Loading...' : 'Active'}
          </div>
        </div>
      </header>

      {/* Notifications */}
      <div className="notifications-container">
        {notifications.map(notification => (
          <div key={notification.id} className={`notification ${notification.type}`}>
            <span>{notification.message}</span>
            <button onClick={() => removeNotification(notification.id)}>×</button>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="stat-card">
          <div className="stat-value">{quickStats.totalHours}</div>
          <div className="stat-label">Total Hours</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{quickStats.totalSessions}</div>
          <div className="stat-label">Total Sessions</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{quickStats.uniqueApps}</div>
          <div className="stat-label">Unique Apps</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{quickStats.avgSessionTime}</div>
          <div className="stat-label">Avg Session (hrs)</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="tab-navigation">
        <button 
          className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <i className="icon-dashboard"></i>
          Dashboard
        </button>
        <button 
          className={`tab ${activeTab === 'table' ? 'active' : ''}`}
          onClick={() => setActiveTab('table')}
        >
          <i className="icon-table"></i>
          Usage Table
        </button>
        <button 
          className={`tab ${activeTab === 'processes' ? 'active' : ''}`}
          onClick={() => setActiveTab('processes')}
        >
          <i className="icon-process"></i>
          Processes
        </button>
        <button 
          className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <i className="icon-settings"></i>
          Settings
        </button>
      </nav>

      {/* Filters and Controls */}
      <div className="controls-panel">
        <div className="filter-group">
          <div className="filter-item">
            <label>From:</label>
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} 
            />
          </div>
          <div className="filter-item">
            <label>To:</label>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)} 
            />
          </div>
          <div className="filter-item">
            <label>User:</label>
            <select 
              value={selectedUser} 
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              <option value="all">All Users</option>
              {users.map(user => (
                <option key={user} value={user}>{user}</option>
              ))}
            </select>
          </div>
          <div className="filter-item">
            <label>Search:</label>
            <input 
              type="text"
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="action-group">
          <button className="btn btn-primary" onClick={handleSearch}>
            <i className="icon-search"></i>
            Search
          </button>
          <button className="btn btn-secondary" onClick={handleReload}>
            <i className="icon-refresh"></i>
            Reload
          </button>
          <div className="export-group">
            <select 
              value={exportFormat} 
              onChange={(e) => setExportFormat(e.target.value)}
            >
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
              <option value="xlsx">Excel</option>
            </select>
            <button className="btn btn-success" onClick={handleExport}>
              <i className="icon-export"></i>
              Export
            </button>
          </div>
          <button className="btn btn-danger" onClick={handleClearData}>
            <i className="icon-trash"></i>
            Clear Data
          </button>
        </div>
      </div>

      {/* Auto-refresh Controls */}
      <div className="auto-refresh-controls">
        <label className="checkbox-container">
          <input 
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
          />
          <span className="checkmark"></span>
          Auto-refresh every
        </label>
        <input 
          type="number"
          min="10"
          max="300"
          value={refreshInterval}
          onChange={(e) => setRefreshInterval(Number(e.target.value))}
          disabled={!autoRefresh}
        />
        <span>seconds</span>
      </div>

      {/* Main Content */}
      <main className="main-content">
        {activeTab === 'dashboard' && (
          <Dashboard 
            data={filteredData} 
            processData={processData}
            loading={loading}
            theme={theme}
          />
        )}
        
        {activeTab === 'table' && (
          <UsageTable 
            data={filteredData} 
            loading={loading}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={(field, order) => {
              setSortBy(field);
              setSortOrder(order);
            }}
          />
        )}
        
        {activeTab === 'processes' && (
          <div className="processes-tab">
            <h3>Process Monitoring</h3>
            <div className="process-stats">
              {processData.length > 0 ? (
                <UsageTable 
                  data={processData} 
                  loading={loading}
                  columns={[
                    { key: 'processName', label: 'Process Name' },
                    { key: 'parentSoftware', label: 'Parent Software' },
                    { key: 'pluginPath', label: 'Plugin Path' },
                    { key: 'lastSeen', label: 'Last Seen' },
                    { key: 'count', label: 'Detection Count' }
                  ]}
                />
              ) : (
                <div className="no-data">
                  <i className="icon-info"></i>
                  <p>No process data available</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'settings' && (
          <Settings 
            theme={theme}
            onThemeChange={toggleTheme}
            autoRefresh={autoRefresh}
            refreshInterval={refreshInterval}
            onAutoRefreshChange={setAutoRefresh}
            onRefreshIntervalChange={setRefreshInterval}
            onNotification={addNotification}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-left">
          <span>Last updated: {new Date().toLocaleString()}</span>
        </div>
        <div className="footer-right">
          <span>{filteredData.length} applications tracked</span>
        </div>
      </footer>
    </div>
  );
};

export default App;