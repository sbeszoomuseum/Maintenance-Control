/**
 * Dashboard Logic
 * Handles dashboard-specific functionality
 */

let currentPage = 1;
let currentLimit = 10;
let currentStatus = '';
let currentSearch = '';
let currentClientId = null;

// ============================================
// Initialize
// ============================================

async function initializeDashboard() {
  await loadAnalytics();
  await loadClients();
  setupEventListeners();
}

// ============================================
// Event Listeners Setup
// ============================================

function setupEventListeners() {
  // Edit Client Button - Event Delegation (for dynamically generated rows)
  document.addEventListener('click', (e) => {
    const editBtn = e.target.closest('.edit-client-btn');
    if (editBtn) {
      const clientId = editBtn.getAttribute('data-client-id');
      openClientDetail(clientId);
    }
  });

  // Recent clients list items - Event Delegation
  document.addEventListener('click', (e) => {
    const recentClientItem = e.target.closest('.client-mini-item');
    if (recentClientItem) {
      const clientId = recentClientItem.getAttribute('data-client-id');
      if (clientId) {
        openClientDetail(clientId);
      }
    }
  });
}

// ============================================
// Analytics
// ============================================

async function loadAnalytics() {
  try {
    const summary = await api.getAnalyticsSummary();
    const breakdown = await api.getStatusBreakdown();

    // Update summary stats
    document.getElementById('total-clients').textContent = summary.data.totalClients;
    document.getElementById('active-clients').textContent = summary.data.activeClients;
    document.getElementById('due-clients').textContent = summary.data.dueClients;
    document.getElementById('suspended-clients').textContent = summary.data.suspendedClients;
    document.getElementById('total-revenue').textContent = `$${summary.data.totalRevenue.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
    document.getElementById('health-percentage').textContent = summary.data.healthPercentage + '%';

    // Update chart
    updateStatusChart(breakdown.data);

    // Load recent clients
    await loadRecentClients();
  } catch (error) {
    console.error('Error loading analytics:', error);
    showNotification('Failed to load analytics', 'error');
  }
}

async function loadRecentClients() {
  try {
    const response = await api.getClients(1, 5);
    const clientsList = document.getElementById('recent-clients-list');
    clientsList.innerHTML = '';

    if (response.data.length === 0) {
      clientsList.innerHTML = '<p class="text-center text-sm" style="padding: 20px;">No clients yet</p>';
      return;
    }

    response.data.forEach((client) => {
      const statusClass = `status-${client.status}`;
      const item = document.createElement('div');
      item.className = 'client-mini-item';
      item.setAttribute('data-client-id', client._id);
      item.style.cursor = 'pointer';
      item.innerHTML = `
        <div class="client-mini-info">
          <div class="client-mini-name">${client.client_id}</div>
          <div class="client-mini-status">${client.payment_status}</div>
        </div>
        <div class="client-mini-badge ${statusClass}">
          ${client.status.charAt(0).toUpperCase() + client.status.slice(1)}
        </div>
      `;
      clientsList.appendChild(item);
    });
  } catch (error) {
    console.error('Error loading recent clients:', error);
  }
}

function updateStatusChart(breakdown) {
  const canvas = document.getElementById('status-chart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const data = Object.values(breakdown);
  const labels = Object.keys(breakdown).map((k) => k.charAt(0).toUpperCase() + k.slice(1));
  const colors = ['#10b981', '#f59e0b', '#ef4444'];

  // Simple pie chart using canvas
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = 50;
  let startAngle = 0;

  const total = data.reduce((a, b) => a + b, 0) || 1;

  ctx.font = 'bold 12px Inter';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  data.forEach((value, index) => {
    const sliceAngle = (value / total) * 2 * Math.PI;
    ctx.fillStyle = colors[index];
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
    ctx.lineTo(centerX, centerY);
    ctx.fill();

    // Draw percentage text
    const textAngle = startAngle + sliceAngle / 2;
    const textX = centerX + Math.cos(textAngle) * (radius / 2);
    const textY = centerY + Math.sin(textAngle) * (radius / 2);
    const percentage = Math.round((value / total) * 100);

    if (percentage > 0) {
      ctx.fillStyle = '#fff';
      ctx.fillText(percentage + '%', textX, textY);
    }

    startAngle += sliceAngle;
  });
}

// ============================================
// Clients List
// ============================================

async function loadClients(page = 1, status = '', search = '') {
  try {
    currentPage = page;
    currentStatus = status;
    currentSearch = search;

    const response = await api.getClients(page, currentLimit, status, search);
    const tbody = document.getElementById('clients-tbody');
    tbody.innerHTML = '';

    if (response.data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center">No clients found</td></tr>';
    } else {
      response.data.forEach((client) => {
        const statusBadge = `<span class="status-badge status-${client.status}">
          ${client.status.charAt(0).toUpperCase() + client.status.slice(1)}
        </span>`;

        const paymentStatusBadge = `<span class="status-badge status-${client.payment_status}">
          ${client.payment_status.charAt(0).toUpperCase() + client.payment_status.slice(1)}
        </span>`;

        const nextBilling = client.next_billing_date
          ? new Date(client.next_billing_date).toLocaleDateString('en-US')
          : 'N/A';

        const row = document.createElement('tr');
        row.innerHTML = `
          <td><strong>${client.client_id || 'N/A'}</strong></td>
          <td>${statusBadge}</td>
          <td>${paymentStatusBadge}</td>
          <td>${nextBilling}</td>
          <td>
            <div class="action-buttons">
              <button class="btn btn-primary btn-sm edit-client-btn" data-client-id="${client._id}">
                <i class="fas fa-edit"></i> Edit
              </button>
            </div>
          </td>
        `;
        tbody.appendChild(row);
      });
    }

    // Update pagination
    updatePagination(response.pagination.total, page, currentLimit);
  } catch (error) {
    console.error('Error loading clients:', error);
    showNotification('Failed to load clients', 'error');
  }
}

function updatePagination(total, currentPage, limit) {
  const paginationContainer = document.getElementById('pagination');
  paginationContainer.innerHTML = '';

  const pages = Math.ceil(total / limit);

  if (pages <= 1) return;

  // Previous button
  if (currentPage > 1) {
    const prevBtn = document.createElement('button');
    prevBtn.textContent = '← Previous';
    prevBtn.onclick = () => loadClients(currentPage - 1, currentStatus, currentSearch);
    paginationContainer.appendChild(prevBtn);
  }

  // Page numbers
  for (let i = Math.max(1, currentPage - 2); i <= Math.min(pages, currentPage + 2); i++) {
    const pageBtn = document.createElement('button');
    pageBtn.textContent = i;
    pageBtn.className = i === currentPage ? 'active' : '';
    pageBtn.onclick = () => loadClients(i, currentStatus, currentSearch);
    paginationContainer.appendChild(pageBtn);
  }

  // Next button
  if (currentPage < pages) {
    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Next →';
    nextBtn.onclick = () => loadClients(currentPage + 1, currentStatus, currentSearch);
    paginationContainer.appendChild(nextBtn);
  }
}

// ============================================
// Client Detail Modal
// ============================================

async function openClientDetail(id) {
  try {
    currentClientId = id;
    const response = await api.getClient(id);
    const client = response.data;

    // Populate info tab
    document.getElementById('detail-clientId').value = client.client_id || '';
    document.getElementById('detail-message').value = client.message || '';

    // Populate maintenance tab
    document.getElementById('detail-status').value = client.status || 'active';
    document.getElementById('detail-paymentStatus').value = client.payment_status || 'unpaid';

    // Populate billing tab
    const nextBilling = client.next_billing_date ? new Date(client.next_billing_date).toISOString().split('T')[0] : '';
    document.getElementById('detail-nextBilling').value = nextBilling;

    const lastPaid = client.last_paid_date ? new Date(client.last_paid_date).toLocaleDateString() : 'Never';
    document.getElementById('detail-lastPaid').value = lastPaid;

    // Load billing history
    const history = document.getElementById('billing-history');
    history.innerHTML = '';

    if (client.billing_history && client.billing_history.length > 0) {
      client.billing_history.slice().reverse().forEach((payment) => {
        const item = document.createElement('div');
        item.className = 'billing-item';
        const date = new Date(payment.payment_date).toLocaleDateString();
        const amount = payment.amount.toLocaleString('en-US', { minimumFractionDigits: 2 });
        item.innerHTML = `
          <div class="billing-item-header">
            <div class="billing-item-date">${date}</div>
            <div class="billing-item-amount">$${amount}</div>
          </div>
          <div class="billing-item-method">${payment.method}</div>
        `;
        history.appendChild(item);
      });
    } else {
      history.innerHTML = '<p class="text-center text-sm">No payment history</p>';
    }

    // Clear payment form
    document.getElementById('payment-amount').value = '';
    document.getElementById('payment-method').value = 'credit_card';
    document.getElementById('payment-transactionId').value = '';

    // Show modal
    document.getElementById('client-detail-modal').classList.add('active');
  } catch (error) {
    console.error('Error loading client detail:', error);
    showNotification('Failed to load client details', 'error');
  }
}

function closeModal() {
  document.getElementById('client-detail-modal').classList.remove('active');
  currentClientId = null;
}

// ============================================
// Tab Switching
// ============================================

function setupTabSwitching() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      // Remove active from all
      tabBtns.forEach((b) => b.classList.remove('active'));
      tabContents.forEach((c) => c.classList.remove('active'));

      // Add active to clicked
      btn.classList.add('active');
      const tabName = btn.getAttribute('data-tab');
      document.getElementById(`${tabName}-tab`).classList.add('active');
    });
  });
}

// ============================================
// Save Client Changes
// ============================================

async function saveClientChanges() {
  try {
    const data = {
      message: document.getElementById('detail-message').value || '',
      status: document.getElementById('detail-status').value,
      next_billing_date: document.getElementById('detail-nextBilling').value || null,
      payment_status: document.getElementById('detail-paymentStatus').value || 'unpaid',
    };

    await api.updateClient(currentClientId, data);

    showNotification('Client updated successfully', 'success');
    closeModal();
    loadClients(currentPage, currentStatus, currentSearch);
    loadAnalytics();
  } catch (error) {
    console.error('Error saving client:', error);
    showNotification(error.message || 'Failed to save client', 'error');
  }
}

// ============================================
// Payment Recording
// ============================================

async function recordPayment() {
  try {
    const amount = document.getElementById('payment-amount').value;

    if (!amount || parseFloat(amount) <= 0) {
      showNotification('Please enter a valid payment amount', 'warning');
      return;
    }

    const data = {
      amount: parseFloat(amount),
      method: document.getElementById('payment-method').value,
      transaction_id: document.getElementById('payment-transactionId').value,
      notes: '',
    };

    await api.markPaid(currentClientId, data);
    showNotification('Payment recorded successfully', 'success');

    // Reload client detail
    openClientDetail(currentClientId);
    loadAnalytics();
    loadClients(currentPage, currentStatus, currentSearch);
  } catch (error) {
    console.error('Error recording payment:', error);
    showNotification(error.message || 'Failed to record payment', 'error');
  }
}

// ============================================
// Suspend/Activate
// ============================================

async function suspendClient() {
  if (!currentClientId) return;

  if (!confirm('Are you sure you want to suspend this client?')) return;

  try {
    await api.suspendClient(currentClientId, { reason: 'Admin suspended' });
    showNotification('Client suspended successfully', 'success');
    closeModal();
    loadClients(currentPage, currentStatus, currentSearch);
    loadAnalytics();
  } catch (error) {
    console.error('Error suspending client:', error);
    showNotification(error.message || 'Failed to suspend client', 'error');
  }
}

async function activateClient() {
  if (!currentClientId) return;

  try {
    await api.activateClient(currentClientId);
    showNotification('Client activated successfully', 'success');
    openClientDetail(currentClientId);
    loadClients(currentPage, currentStatus, currentSearch);
    loadAnalytics();
  } catch (error) {
    console.error('Error activating client:', error);
    showNotification(error.message || 'Failed to activate client', 'error');
  }
}

// ============================================
// Utility Functions
// ============================================

function showNotification(message, type = 'info') {
  // Simple notification (you can enhance this)
  const className = `notification-${type}`;
  console.log(`[${type.toUpperCase()}] ${message}`);

  // Create a simple alert box
  const notif = document.createElement('div');
  notif.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    background: ${
      type === 'success'
        ? '#10b981'
        : type === 'error'
          ? '#ef4444'
          : type === 'warning'
            ? '#f59e0b'
            : '#2563eb'
    };
    color: white;
    border-radius: 6px;
    box-shadow: 0 10px 15px rgba(0,0,0,0.1);
    z-index: 2000;
    animation: slideDown 0.3s ease;
  `;
  notif.textContent = message;
  document.body.appendChild(notif);

  setTimeout(() => notif.remove(), 3000);
}
