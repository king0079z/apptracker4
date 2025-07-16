console.log('🔧 DEBUG: Ultra minimal database.js loading...');

// Ultra minimal database that just works
const dbWrapper = {
  run: (query, params = [], callback) => {
    console.log('🔧 DEBUG: Database run() called (no-op)');
    if (callback) callback(null, { changes: 0 });
    return { changes: 0 };
  },
  
  get: (query, params = [], callback) => {
    console.log('🔧 DEBUG: Database get() called (no-op)');
    if (callback) callback(null, null);
    return null;
  },
  
  all: (query, params = [], callback) => {
    console.log('🔧 DEBUG: Database all() called (returning empty array)');
    if (callback) callback(null, []);
    return [];
  },
  
  exec: (query, callback) => {
    console.log('🔧 DEBUG: Database exec() called (no-op)');
    if (callback) callback(null);
    return null;
  }
};

console.log('🔧 DEBUG: Ultra minimal database ready');

module.exports = dbWrapper;