import React, { useMemo } from 'react';

const Dashboard = ({ data, processData, loading, theme }) => {
  const analytics = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        totalHours: 0,
        totalSessions: 0,
        mostUsedApp: 'N/A',
        productivityScore: 0,
        dailyAverage: 0,
        topApps: [],
        hourlyDistribution: [],
        userActivity: [],
        categoryBreakdown: []
      };
    }

    const totalHours = data.reduce((sum, item) => sum + (item.total_hours || 0), 0);
    const totalSessions = data.reduce((sum, item) => sum + (item.usage_count || 0), 0);
    
    // Find most used app
    const mostUsedApp = data.reduce((prev, current) => 
      (prev.total_hours || 0) > (current.total_hours || 0) ? prev : current
    );

    // Calculate productivity score (placeholder algorithm)
    const productiveApps = ['Visual Studio Code', 'WebStorm', 'Photoshop', 'Illustrator', 'Word', 'Excel'];
    const productiveHours = data
      .filter(item => productiveApps.some(app => item.app.toLowerCase().includes(app.toLowerCase())))
      .reduce((sum, item) => sum + (item.total_hours || 0), 0);
    const productivityScore = totalHours > 0 ? (productiveHours / totalHours * 100) : 0;

    // Top 10 apps
    const topApps = [...data]
      .sort((a, b) => (b.total_hours || 0) - (a.total_hours || 0))
      .slice(0, 10);

    // Category breakdown
    const categories = {
      'Development': ['Visual Studio Code', 'WebStorm', 'IntelliJ', 'Eclipse', 'Atom', 'Sublime'],
      'Design': ['Photoshop', 'Illustrator', 'After Effects', 'Figma', 'Sketch', 'InDesign'],
      'Office': ['Word', 'Excel', 'PowerPoint', 'Outlook', 'Teams', 'Slack'],
      'Browser': ['Chrome', 'Firefox', 'Safari', 'Edge', 'Opera'],
      'Entertainment': ['Spotify', 'VLC', 'Netflix', 'YouTube', 'Discord', 'Steam'],
      'Other': []
    };

    const categoryBreakdown = Object.keys(categories).map(category => {
      const categoryHours = data
        .filter(item => {
          if (category === 'Other') {
            return !Object.values(categories)
              .flat()
              .some(app => item.app.toLowerCase().includes(app.toLowerCase()));
          }
          return categories[category].some(app => 
            item.app.toLowerCase().includes(app.toLowerCase())
          );
        })
        .reduce((sum, item) => sum + (item.total_hours || 0), 0);
      
      return {
        category,
        hours: categoryHours,
        percentage: totalHours > 0 ? (categoryHours / totalHours * 100) : 0
      };
    }).filter(cat => cat.hours > 0);

    return {
      totalHours,
      totalSessions,
      mostUsedApp: mostUsedApp.app || 'N/A',
      productivityScore,
      dailyAverage: totalHours / 7, // Assuming weekly data
      topApps,
      categoryBreakdown
    };
  }, [data]);

  const formatHours = (hours) => {
    if (!hours) return '0h 0m';
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const getProductivityColor = (score) => {
    if (score >= 70) return '#28a745';
    if (score >= 40) return '#ffc107';
    return '#dc3545';
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Key Metrics */}
      <div className="dashboard-grid">
        <div className="dashboard-card metric-card">
          <div className="metric-header">
            <h3>📊 Usage Overview</h3>
          </div>
          <div className="metrics-grid">
            <div className="metric-item">
              <div className="metric-value">{formatHours(analytics.totalHours)}</div>
              <div className="metric-label">Total Usage</div>
            </div>
            <div className="metric-item">
              <div className="metric-value">{analytics.totalSessions}</div>
              <div className="metric-label">Total Sessions</div>
            </div>
            <div className="metric-item">
              <div className="metric-value">{formatHours(analytics.dailyAverage)}</div>
              <div className="metric-label">Daily Average</div>
            </div>
          </div>
        </div>

        <div className="dashboard-card productivity-card">
          <div className="metric-header">
            <h3>⚡ Productivity Score</h3>
          </div>
          <div className="productivity-content">
            <div className="productivity-circle">
              <svg width="120" height="120" className="progress-ring">
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="transparent"
                  stroke="#e2e8f0"
                  strokeWidth="8"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="transparent"
                  stroke={getProductivityColor(analytics.productivityScore)}
                  strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 50}`}
                  strokeDashoffset={`${2 * Math.PI * 50 * (1 - analytics.productivityScore / 100)}`}
                  strokeLinecap="round"
                  transform="rotate(-90 60 60)"
                />
              </svg>
              <div className="productivity-percentage">
                {Math.round(analytics.productivityScore)}%
              </div>
            </div>
            <div className="productivity-info">
              <p>Based on productive app usage</p>
              <small>Development, Design, Office tools</small>
            </div>
          </div>
        </div>

        <div className="dashboard-card most-used-card">
          <div className="metric-header">
            <h3>🏆 Most Used App</h3>
          </div>
          <div className="most-used-content">
            <div className="app-icon-large">📱</div>
            <div className="app-details">
              <div className="app-name">{analytics.mostUsedApp}</div>
              <div className="app-usage">
                {analytics.topApps[0] ? formatHours(analytics.topApps[0].total_hours) : '0h'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Applications Chart */}
      <div className="dashboard-grid">
        <div className="dashboard-card chart-card">
          <div className="metric-header">
            <h3>📈 Top Applications</h3>
          </div>
          <div className="top-apps-chart">
            {analytics.topApps.map((app, index) => (
              <div key={app.app} className="app-bar">
                <div className="app-info">
                  <span className="app-rank">#{index + 1}</span>
                  <span className="app-name">{app.app}</span>
                  <span className="app-hours">{formatHours(app.total_hours)}</span>
                </div>
                <div className="app-bar-container">
                  <div 
                    className="app-bar-fill"
                    style={{ 
                      width: `${(app.total_hours / analytics.topApps[0].total_hours) * 100}%`,
                      background: `hsl(${210 + index * 20}, 70%, 50%)`
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-card category-card">
          <div className="metric-header">
            <h3>🎯 Usage by Category</h3>
          </div>
          <div className="category-breakdown">
            {analytics.categoryBreakdown.map((category, index) => (
              <div key={category.category} className="category-item">
                <div className="category-header">
                  <span className="category-name">{category.category}</span>
                  <span className="category-percentage">{category.percentage.toFixed(1)}%</span>
                </div>
                <div className="category-bar">
                  <div 
                    className="category-bar-fill"
                    style={{ 
                      width: `${category.percentage}%`,
                      background: `hsl(${120 + index * 40}, 60%, 50%)`
                    }}
                  ></div>
                </div>
                <div className="category-hours">{formatHours(category.hours)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Process Monitoring */}
      {processData && processData.length > 0 && (
        <div className="dashboard-grid">
          <div className="dashboard-card process-card">
            <div className="metric-header">
              <h3>⚙️ Process Monitoring</h3>
            </div>
            <div className="process-overview">
              <div className="process-stats">
                <div className="process-stat">
                  <div className="stat-value">{processData.length}</div>
                  <div className="stat-label">Monitored Processes</div>
                </div>
                <div className="process-stat">
                  <div className="stat-value">
                    {new Set(processData.map(p => p.parentSoftware)).size}
                  </div>
                  <div className="stat-label">Parent Applications</div>
                </div>
              </div>
              <div className="recent-processes">
                <h4>Recent Activity</h4>
                {processData.slice(0, 5).map((process, index) => (
                  <div key={index} className="process-item">
                    <div className="process-name">{process.processName}</div>
                    <div className="process-parent">{process.parentSoftware}</div>
                    <div className="process-time">{new Date(process.timestamp).toLocaleTimeString()}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Insights and Recommendations */}
      <div className="dashboard-grid">
        <div className="dashboard-card insights-card">
          <div className="metric-header">
            <h3>💡 Insights & Recommendations</h3>
          </div>
          <div className="insights-content">
            <div className="insight-item">
              <div className="insight-icon">⏰</div>
              <div className="insight-text">
                <strong>Peak Usage:</strong> Your most active period appears to be during {analytics.totalHours > 0 ? 'work hours' : 'various times'}
              </div>
            </div>
            
            <div className="insight-item">
              <div className="insight-icon">📊</div>
              <div className="insight-text">
                <strong>Focus Time:</strong> {analytics.productivityScore > 60 ? 'Great focus on productive applications!' : 'Consider dedicating more time to productive tasks'}
              </div>
            </div>
            
            <div className="insight-item">
              <div className="insight-icon">🎯</div>
              <div className="insight-text">
                <strong>App Diversity:</strong> You use {analytics.topApps.length} different applications regularly
              </div>
            </div>
            
            {analytics.totalSessions > 0 && (
              <div className="insight-item">
                <div className="insight-icon">⚡</div>
                <div className="insight-text">
                  <strong>Session Pattern:</strong> Average session length is {formatHours(analytics.totalHours / analytics.totalSessions)}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-card summary-card">
          <div className="metric-header">
            <h3>📋 Quick Summary</h3>
          </div>
          <div className="summary-content">
            <div className="summary-item">
              <span className="summary-label">Total Applications Tracked:</span>
              <span className="summary-value">{data.length}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Most Productive Category:</span>
              <span className="summary-value">
                {analytics.categoryBreakdown.length > 0 
                  ? analytics.categoryBreakdown.reduce((prev, current) => 
                      prev.hours > current.hours ? prev : current
                    ).category
                  : 'N/A'
                }
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Least Used Application:</span>
              <span className="summary-value">
                {analytics.topApps.length > 0 
                  ? analytics.topApps[analytics.topApps.length - 1].app
                  : 'N/A'
                }
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Usage Consistency:</span>
              <span className="summary-value">
                {analytics.totalSessions > analytics.topApps.length ? 'High' : 'Moderate'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Trends (placeholder for future implementation) */}
      <div className="dashboard-grid">
        <div className="dashboard-card trends-card">
          <div className="metric-header">
            <h3>📈 Usage Trends</h3>
          </div>
          <div className="trends-content">
            <div className="trend-placeholder">
              <div className="chart-placeholder">
                <div className="chart-bars">
                  {[...Array(7)].map((_, i) => (
                    <div 
                      key={i} 
                      className="chart-bar"
                      style={{ 
                        height: `${Math.random() * 80 + 20}%`,
                        background: `hsl(${210 + i * 20}, 70%, 50%)`
                      }}
                    ></div>
                  ))}
                </div>
                <div className="chart-labels">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                    <span key={day} className="chart-label">{day}</span>
                  ))}
                </div>
              </div>
              <p>Weekly usage pattern visualization</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;