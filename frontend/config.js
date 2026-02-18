/**
 * Frontend Configuration
 * Sets up environment variables for the admin panel
 * This file must be loaded BEFORE api.js
 */

(function() {
  // Get backend URL from environment variable set by Vercel
  // or fall back to the rendered environment variable
  const backendUrl = window.__BACKEND_URL__ || 
                     'https://servermaintenancecontrolsbes.onrender.com';
  
  // Set global configuration
  window.__CONFIG__ = {
    BACKEND_URL: backendUrl,
    API_BASE: `${backendUrl}/api/super-admin`,
    FRONTEND_URL: window.location.origin,
  };
  
  // Set window.__BACKEND_URL__ for api.js
  window.__BACKEND_URL__ = backendUrl;
  
  console.log('✅ Frontend Configuration Loaded');
  console.log('Backend URL:', window.__CONFIG__.BACKEND_URL);
  console.log('Frontend URL:', window.__CONFIG__.FRONTEND_URL);
})();
