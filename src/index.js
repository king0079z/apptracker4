import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

console.log('🚀 Starting Enhanced App Usage Tracker...');

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Application Error:', error);
    console.error('Error Info:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8f9fa'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚠️</div>
          <h1 style={{ color: '#dc3545', marginBottom: '1rem' }}>Something went wrong</h1>
          <p style={{ color: '#6c757d', marginBottom: '2rem', maxWidth: '500px' }}>
            The application encountered an unexpected error. Please try reloading the page.
          </p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            🔄 Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Initialize the application
function initializeApp() {
  const container = document.getElementById('root');
  
  if (!container) {
    console.error('❌ Root container not found!');
    return;
  }

  console.log('📦 Creating React root...');
  const root = createRoot(container);
  
  console.log('🎨 Rendering Enhanced App component...');
  root.render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );

  // Hide loading screen if it exists
  setTimeout(() => {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.style.display = 'none';
    }
  }, 500);

  console.log('✅ Enhanced App initialized successfully!');
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

export default initializeApp;