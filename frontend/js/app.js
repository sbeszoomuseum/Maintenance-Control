/**
 * Main Application Logic
 * Handles navigation, routing, and overall app functionality
 */

// ============================================
// Initialize App
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');

  if (token) {
    api.setToken(token);
    showDashboard();
  } else {
    showLoginPage();
  }

  setupGlobalEventListeners();
});

function setupGlobalEventListeners() {
  // Login form
  document.getElementById('login-form').addEventListener('submit', handleLogin);

  // Navigation menu
  document.querySelectorAll('[data-page]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = link.getAttribute('data-page');
      navigateTo(page);
    });
  });

  // Modal close
  document.getElementById('close-modal').addEventListener('click', closeModal);
  window.addEventListener('click', (e) => {
    const modal = document.getElementById('client-detail-modal');
    if (e.target === modal) {
      closeModal();
    }
  });

  // Logout
  document.getElementById('logout-btn').addEventListener('click', handleLogout);

  // Clients search and filter
  document.getElementById('search-input').addEventListener('input', (e) => {
    loadClients(1, document.getElementById('status-filter').value, e.target.value);
  });

  document.getElementById('status-filter').addEventListener('change', (e) => {
    loadClients(1, e.target.value, document.getElementById('search-input').value);
  });

  document.getElementById('clear-filters').addEventListener('click', () => {
    document.getElementById('search-input').value = '';
    document.getElementById('status-filter').value = '';
    loadClients();
  });

  // Add client button
  document.getElementById('add-client-btn').addEventListener('click', showAddClientModal);

  // Client detail save
  document.getElementById('save-detail-btn').addEventListener('click', saveClientChanges);

  // Record payment
  document.getElementById('record-payment-btn').addEventListener('click', recordPayment);

  // Suspend/Activate
  document.getElementById('suspend-btn').addEventListener('click', suspendClient);
  document.getElementById('activate-btn').addEventListener('click', activateClient);

  // Tab switching
  setupTabSwitching();
}

// ============================================
// Page Navigation
// ============================================

function showLoginPage() {
  document.getElementById('login-page').classList.add('active');
  document.getElementById('dashboard-page').classList.remove('active');
  api.clearToken();
}

function showDashboard() {
  document.getElementById('login-page').classList.remove('active');
  document.getElementById('dashboard-page').classList.add('active');

  // Set user info
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  document.getElementById('user-name').textContent = user.fullName || user.email || 'Admin';

  // Set settings page info
  document.getElementById('settings-email').value = user.email || '';
  document.getElementById('settings-name').value = user.fullName || '';
  document.getElementById('settings-role').value = user.role || 'super_admin';
  document.getElementById('settings-lastLogin').value = new Date().toLocaleString();

  // Initialize dashboard
  navigateTo('dashboard');
}

function navigateTo(page) {
  // Remove active from all menu items and views
  document.querySelectorAll('.menu-item').forEach((item) => {
    item.classList.remove('active');
  });
  document.querySelectorAll('.view').forEach((view) => {
    view.classList.remove('active');
  });

  // Add active to selected
  const menuItem = document.querySelector(`[data-page="${page}"]`);
  if (menuItem) menuItem.classList.add('active');

  const view = document.getElementById(`${page}-view`);
  if (view) view.classList.add('active');

  // Load page-specific content
  if (page === 'clients') {
    loadClients();
  } else if (page === 'dashboard') {
    initializeDashboard();
  } else if (page === 'settings') {
    // Settings page is mostly static
  }
}

// ============================================
// Authentication
// ============================================

async function handleLogin(e) {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const loginBtn = document.getElementById('login-btn');
  const loginError = document.getElementById('login-error');

  // Clear previous errors
  loginError.textContent = '';
  document.getElementById('email-error').textContent = '';
  document.getElementById('password-error').textContent = '';

  // Validate
  if (!email || !password) {
    loginError.textContent = 'Email and password are required';
    return;
  }

  // Show loading state
  loginBtn.disabled = true;
  loginBtn.innerHTML = '<span class="loading"></span> Logging in...';

  try {
    const response = await api.login(email, password);

    // Store token and user info
    api.setToken(response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.admin));

    // Clear form
    document.getElementById('login-form').reset();

    // Show dashboard
    showDashboard();
  } catch (error) {
    console.error('Login error:', error);

    if (error.status === 401 || error.status === 403) {
      loginError.textContent = error.message || 'Invalid email or password';
    } else if (error.status === 429) {
      loginError.textContent = 'Too many login attempts. Please try again later.';
    } else {
      loginError.textContent = error.message || 'Login failed. Please try again.';
    }
  } finally {
    loginBtn.disabled = false;
    loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
  }
}

function handleLogout() {
  if (confirm('Are you sure you want to logout?')) {
    api.clearToken();
    localStorage.removeItem('user');
    showLoginPage();
  }
}

// ============================================
// Add Client Modal
// ============================================

function showAddClientModal() {
  // Create a simple add client form
  const html = `
    <div class="modal active" id="add-client-form">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Add New Client</h2>
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Client ID (Unique Identifier)</label>
            <input type="text" id="new-clientId" class="form-control" required />
          </div>
          <div class="form-group">
            <label>Popup Message (shown when status is due/suspended)</label>
            <textarea id="new-message" class="form-control" required placeholder="e.g., Your payment is overdue. Please renew your subscription." rows="3"></textarea>
          </div>
          <div class="form-group">
            <label>Next Billing Date</label>
            <input type="date" id="new-nextBilling" class="form-control" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" id="add-client-save">Add Client</button>
          <button class="btn btn-secondary" onclick="closeAddClientModal()">Cancel</button>
        </div>
      </div>
    </div>
  `;

  // Remove if exists
  const existing = document.getElementById('add-client-form');
  if (existing) existing.remove();

  // Add to DOM
  document.body.insertAdjacentHTML('beforeend', html);

  // Setup handlers
  document.querySelector('#add-client-form .modal-close').addEventListener('click', closeAddClientModal);
  document.getElementById('add-client-save').addEventListener('click', saveNewClient);

  document.getElementById('add-client-form').addEventListener('click', (e) => {
    if (e.target.id === 'add-client-form') closeAddClientModal();
  });
}

function closeAddClientModal() {
  const modal = document.getElementById('add-client-form');
  if (modal) modal.remove();
}

async function saveNewClient() {
  const clientId = document.getElementById('new-clientId').value;
  const message = document.getElementById('new-message') ? document.getElementById('new-message').value : 'Welcome';
  const nextBilling = document.getElementById('new-nextBilling').value;

  if (!clientId) {
    showNotification('Client ID is required', 'warning');
    return;
  }

  try {
    const data = {
      client_id: clientId,
      message: message || 'Welcome',
      next_billing_date: nextBilling,
    };

    await api.createClient(data);
    showNotification('Client created successfully', 'success');
    closeAddClientModal();
    loadClients();
    loadAnalytics();
  } catch (error) {
    console.error('Error creating client:', error);

    if (error.code === 'DUPLICATE_KEY') {
      showNotification('Client ID already exists', 'error');
    } else {
      showNotification(error.message || 'Failed to create client', 'error');
    }
  }
}

// ============================================
// Helper Functions
// ============================================

function showNotification(message, type = 'info') {
  const notifDiv = document.createElement('div');
  const bgColor = {
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#2563eb',
  }[type] || '#2563eb';

  notifDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    background: ${bgColor};
    color: white;
    border-radius: 6px;
    box-shadow: 0 10px 15px rgba(0,0,0,0.1);
    z-index: 2000;
    animation: slideDown 0.3s ease;
    font-size: 14px;
  `;
  notifDiv.textContent = message;
  document.body.appendChild(notifDiv);

  setTimeout(() => notifDiv.remove(), 3000);
}

// Animation keyframes
const style = document.createElement('style');
style.textContent = `
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(style);
