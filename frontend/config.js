/**
 * Frontend Configuration
 * Sets up environment variables for the admin panel
 * This file must be loaded BEFORE api.js
 */

(function() {
  // Hardcoded backend URL (Vercel static sites can't use env vars)
  const backendUrl = 'https://servermaintenancecontrolsbes.onrender.com';
  
  // Set global configuration
  window.__CONFIG__ = {
    BACKEND_URL: backendUrl,
    API_BASE: `${backendUrl}/api/super-admin`,
    FRONTEND_URL: window.location.origin,
  };
  
  // Set window.__BACKEND_URL__ for api.js
  window.__BACKEND_URL__ = backendUrl;
  
  // Debug logging
  console.log('✅ Frontend Configuration Loaded');
  console.log('window.__BACKEND_URL__:', window.__BACKEND_URL__);
  console.log('Configuration:', window.__CONFIG__);
  
  // Verify the URL is correct
  if (!window.__BACKEND_URL__.includes('render')) {
    console.warn('⚠️  Backend URL might be wrong!', window.__BACKEND_URL__);
  }
})();

