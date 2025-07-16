console.log('🔧 DEBUG: focusTracker.js - Starting to load...');

let currentApp = null;
let startTime = null;
let isTrackingPaused = false;
let isTracking = false;
let trackingInterval = null;

console.log('🔧 DEBUG: focusTracker.js - Variables initialized');

// Lazy load dependencies to avoid blocking
let activeWin = null;
let db = null;
let os = null;

console.log('🔧 DEBUG: focusTracker.js - About to define functions...');

async function initDependencies() {
  try {
    if (!activeWin) {
      console.log('🔧 DEBUG: Loading active-win...');
      activeWin = require('active-win');
      console.log('🔧 DEBUG: active-win loaded successfully');
    }
    
    if (!db) {
      console.log('🔧 DEBUG: Loading database...');
      db = require('./database');
      console.log('🔧 DEBUG: database loaded successfully');
    }
    
    if (!os) {
      console.log('🔧 DEBUG: Loading os...');
      os = require('os');
      console.log('🔧 DEBUG: os loaded successfully');
    }
    
    return true;
  } catch (error) {
    console.error('🔧 DEBUG: Error loading dependencies:', error);
    return false;
  }
}

async function trackUsage() {
  try {
    // Initialize dependencies if not already done
    const depsReady = await initDependencies();
    if (!depsReady) {
      console.error('Dependencies not ready, skipping tracking cycle');
      if (isTracking) {
        trackingInterval = setTimeout(trackUsage, 5000); // Retry in 5 seconds
      }
      return;
    }

    if (isTrackingPaused) {
      console.log('Tracking is paused due to system suspend.');
      if (isTracking) {
        trackingInterval = setTimeout(trackUsage, 1000);
      }
      return;
    }

    if (!isTracking) {
      console.log('Tracking stopped, exiting trackUsage');
      return;
    }

    const result = await activeWin();
    
    if (result && result.owner) {
      const appName = result.owner.name;
      const { username } = os.userInfo();

      if (appName !== currentApp) {
        if (currentApp && db) {
          const endTime = new Date().toISOString();
          
          db.run(
            `UPDATE usage SET endTime = ? WHERE app = ? AND endTime IS NULL AND username = ?`,
            [endTime, currentApp, username], 
            (err) => {
              if (err) {
                console.error('Failed to update end time:', err.message);
              }
            }
          );
        }
        
        currentApp = appName;
        startTime = new Date().toISOString();
        
        if (db) {
          db.run(
            `INSERT INTO usage(app, startTime, username) VALUES(?, ?, ?)`, 
            [appName, startTime, username],
            (err) => {
              if (err) {
                console.error('Failed to insert usage data:', err.message);
              }
            }
          );
        }
      }
    }
  } catch (error) {
    console.error('Error in trackUsage:', error);
  }
  
  // Schedule next check only if still tracking
  if (isTracking) {
    trackingInterval = setTimeout(trackUsage, 1000);
  }
}

function handleSuspend() {
  console.log('🔧 DEBUG: handleSuspend() called');
  if (currentApp && db && os) {
    const endTime = new Date().toISOString();
    const { username } = os.userInfo();
    
    db.run(
      `UPDATE usage SET endTime = ? WHERE app = ? AND endTime IS NULL AND username = ?`,
      [endTime, currentApp, username], 
      (err) => {
        if (err) {
          console.error('Failed to update end time on suspend:', err.message);
        }
      }
    );
    
    currentApp = null;
  }
  isTrackingPaused = true;
}

function handleResume() {
  console.log('🔧 DEBUG: handleResume() called');
  isTrackingPaused = false;
  
  if (isTracking) {
    trackUsage();
  }
}

function startTracking() {
  console.log('🔧 DEBUG: startTracking() called');
  if (isTracking) {
    console.log('Tracking already started');
    return;
  }
  
  isTracking = true;
  isTrackingPaused = false;
  
  // Start the tracking loop
  trackUsage();
}

function stopTracking() {
  console.log('🔧 DEBUG: stopTracking() called');
  isTracking = false;
  
  if (trackingInterval) {
    clearTimeout(trackingInterval);
    trackingInterval = null;
  }
  
  if (currentApp && db && os) {
    const endTime = new Date().toISOString();
    const { username } = os.userInfo();
    
    db.run(
      `UPDATE usage SET endTime = ? WHERE app = ? AND endTime IS NULL AND username = ?`,
      [endTime, currentApp, username], 
      (err) => {
        if (err) {
          console.error('Failed to update end time on stop:', err.message);
        }
      }
    );
    
    currentApp = null;
  }
}

console.log('🔧 DEBUG: focusTracker.js - Functions defined, creating module exports...');

module.exports = { 
  track: startTracking,
  stop: stopTracking,
  handleSuspend,
  handleResume,
  isTracking: () => isTracking
};

console.log('🔧 DEBUG: focusTracker.js - Module exports created, ready!');