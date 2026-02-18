# Client App Integration Guide - Simple Popup Setup

Super simple integration: Show a popup when admin marks a client as unpaid, hide it when they mark it as paid.

## How It Works

**Simple Rule:**
- Admin Panel status = `due` or `suspended` → **Show Popup** ❌
- Admin Panel status = `active` → **Hide Popup** ✅

That's it! No cron jobs, no complex automation. Just toggle the status in the admin panel.

---

## Frontend Integration (2 minutes setup)

### 1. Add HTML Popup to Your Page

```html
<!-- Add this to your HTML (body closing tag) -->
<div id="maintenance-popup" class="maintenance-popup hidden">
  <div class="popup-overlay"></div>
  <div class="popup-content">
    <button class="popup-close" onclick="closeMaintenancePopup()">×</button>
    
    <div class="popup-icon">
      <i class="fas fa-exclamation-circle"></i>
    </div>
    
    <h2 id="popup-title">Subscription Payment Required</h2>
    
    <p class="maintenance-message" id="popup-message">
      Your subscription payment is due. Please renew to continue using our services.
    </p>
    
    <div class="popup-actions">
      <button onclick="closeMaintenancePopup()" class="btn btn-secondary">
        Close
      </button>
      <a href="https://payment.yourdomain.com" class="btn btn-primary">
        Pay Now
      </a>
    </div>
  </div>
</div>
```

### 2. Add CSS Styling

```css
.maintenance-popup {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10000;
  background: rgba(0, 0, 0, 0.5);
  align-items: center;
  justify-content: center;
}

.maintenance-popup.active {
  display: flex;
}

.popup-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
}

.popup-content {
  position: relative;
  background: white;
  border-radius: 12px;
  padding: 40px;
  max-width: 500px;
  width: 90%;
  text-align: center;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.popup-close {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #999;
}

.popup-close:hover {
  color: #333;
}

.popup-icon {
  font-size: 48px;
  color: #f59e0b;
  margin-bottom: 20px;
}

.popup-content h2 {
  margin: 0 0 15px 0;
  color: #1f2937;
  font-size: 24px;
}

.maintenance-message {
  color: #6b7280;
  margin: 15px 0 25px 0;
  line-height: 1.6;
}

.popup-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 10px 20px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  text-decoration: none;
  display: inline-block;
  font-size: 14px;
}

.btn-primary {
  background: #2563eb;
  color: white;
}

.btn-primary:hover {
  background: #1e40af;
}

.btn-secondary {
  background: #e5e7eb;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background: #d1d5db;
}

.hidden {
  display: none;
}
```

### 3. Add JavaScript Function

```javascript
// Add this simple script to your page
const CLIENT_ID = 'college-001'; // Your college ID from admin panel

async function checkMaintenanceStatus() {
  try {
    const response = await fetch(
      `/api/super-admin/clients/${CLIENT_ID}`
    );
    
    if (!response.ok) return;
    
    const data = await response.json();
    const client = data.data;
    
    // Simple logic: Show popup if status is NOT 'active'
    if (client.status === 'active') {
      // Hide popup
      document.getElementById('maintenance-popup').classList.remove('active');
    } else {
      // Show popup with appropriate message
      const popup = document.getElementById('maintenance-popup');
      
      if (client.status === 'suspended') {
        document.getElementById('popup-title').textContent = 'Account Suspended';
        document.getElementById('popup-message').textContent = 
          'Your account has been suspended. Please contact support or renew your subscription.';
      } else {
        document.getElementById('popup-title').textContent = 'Payment Due';
        document.getElementById('popup-message').textContent = 
          client.notes || 'Your subscription payment is due. Please renew to continue using our services.';
      }
      
      popup.classList.add('active');
    }
  } catch (error) {
    console.error('Error checking status:', error);
  }
}

function closeMaintenancePopup() {
  document.getElementById('maintenance-popup').classList.remove('active');
}

// Check status when page loads
document.addEventListener('DOMContentLoaded', checkMaintenanceStatus);

// Check every 30 seconds (optional, remove if you want manual only)
setInterval(checkMaintenanceStatus, 30000);
```

---

## That's It! 🎉

### Usage:
1. **User should see popup?** → Go to Admin Panel, click "Edit" on client, set status to `due` or `suspended`
2. **Popup should disappear?** → Set status back to `active`

### Optional: Disable Auto-Check
If you want users to see the popup only when they manually refresh, remove these lines:

```javascript
// Remove these if you don't want auto-checking:
// document.addEventListener('DOMContentLoaded', checkMaintenanceStatus);
// setInterval(checkMaintenanceStatus, 30000);
```

Then just call `checkMaintenanceStatus()` when you want to check manually.

---

## Customization

### Change popup message via admin panel
In the admin panel, add notes to the client. The popup will show your message:

```javascript
document.getElementById('popup-message').textContent = client.notes;
```

### Add custom branding
Change the colors in CSS:
```css
.popup-icon {
  color: #your-brand-color; /* Change color here */
}
```

### Add your payment link
Change the "Pay Now" button href:
```html
<a href="https://your-payment-link.com" class="btn btn-primary">
  Pay Now
</a>
```

---

## Environment Setup

In your client app `.env`:
```env
CLIENT_ID=college-001
SUPER_ADMIN_API=http://localhost:5000/api/super-admin
```

Then update the first line of the JavaScript:
```javascript
const CLIENT_ID = process.env.CLIENT_ID;
```

### 2. Display Maintenance Reminder Popup

**HTML Template:**
```html
<div id="maintenance-popup" class="maintenance-popup hidden">
  <div class="popup-overlay"></div>
  <div class="popup-content">
    <button class="popup-close" onclick="closeMaintenancePopup()">×</button>
    
    <div class="popup-icon">
      <i class="fas fa-exclamation-circle"></i>
    </div>
    
    <h2>System Maintenance Notice</h2>
    
    <p class="maintenance-message">
      Your subscription requires attention. Please renew your subscription 
      to continue enjoying uninterrupted service.
    </p>
    
    <div class="maintenance-details">
      <p><strong>Status:</strong> <span id="status-text">Due for Payment</span></p>
      <p><strong>Next Billing Date:</strong> <span id="billing-date">--</span></p>
    </div>
    
    <div class="popup-actions">
      <a href="/terms" target="_blank" class="link">Terms & Conditions</a>
      <a href="/privacy" target="_blank" class="link">Privacy Policy</a>
      <button onclick="closeMaintenancePopup()" class="btn btn-secondary">
        Close
      </button>
      <a href="https://payment.yourdomain.com" class="btn btn-primary">
        Pay Now
      </a>
    </div>
  </div>
</div>
```

**CSS Styles:**
```css
.maintenance-popup {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10000;
}

.maintenance-popup.active {
  display: flex;
  align-items: center;
  justify-content: center;
}

.popup-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
}

.popup-content {
  position: relative;
  background: white;
  border-radius: 8px;
  padding: 40px;
  max-width: 500px;
  width: 90%;
  text-align: center;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.popup-close {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #999;
}

.popup-icon {
  font-size: 48px;
  color: #f59e0b;
  margin-bottom: 20px;
}

.popup-content h2 {
  margin: 0 0 15px 0;
  color: #1f2937;
  font-size: 24px;
}

.maintenance-message {
  color: #6b7280;
  margin: 15px 0;
  line-height: 1.6;
}

.maintenance-details {
  background: #f9fafb;
  padding: 15px;
  border-radius: 6px;
  margin: 20px 0;
  text-align: left;
}

.maintenance-details p {
  margin: 8px 0;
  color: #4b5563;
}

.popup-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 25px;
  flex-wrap: wrap;
}

.link {
  color: #2563eb;
  text-decoration: none;
  font-size: 14px;
  padding: 8px 12px;
}

.link:hover {
  text-decoration: underline;
}

.btn {
  padding: 10px 20px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  text-decoration: none;
  display: inline-block;
}

.btn-primary {
  background: #2563eb;
  color: white;
}

.btn-primary:hover {
  background: #1e40af;
}

.btn-secondary {
  background: #e5e7eb;
  color: #374151;
}

.btn-secondary:hover {
  background: #d1d5db;
}
```

**JavaScript Implementation:**
```javascript
class MaintenancePopup {
  constructor(maintenance) {
    this.maintenance = maintenance;
  }

  show() {
    const popup = document.getElementById('maintenance-popup');
    if (!popup) {
      console.warn('Maintenance popup element not found');
      return;
    }

    // Update popup content
    const statusText = {
      'active': 'Active',
      'due': 'Due for Payment',
      'suspended': 'Suspended'
    };

    document.getElementById('status-text').textContent = 
      statusText[this.maintenance.status] || 'Unknown';

    const billingDate = this.maintenance.nextBillingDate
      ? new Date(this.maintenance.nextBillingDate).toLocaleDateString()
      : 'Not Set';

    document.getElementById('billing-date').textContent = billingDate;

    // Show popup
    popup.classList.add('active');

    // Don't allow closing for suspended clients (optional)
    if (this.maintenance.status === 'suspended') {
      document.querySelector('.popup-close').style.display = 'none';
    }
  }

  hide() {
    const popup = document.getElementById('maintenance-popup');
    if (popup) {
      popup.classList.remove('active');
    }
  }
}

function closeMaintenancePopup() {
  document.getElementById('maintenance-popup').classList.remove('active');
}
```

### 3. Feature Lock Implementation

**API Middleware:**
```javascript
// middleware/featureLock.js
function checkFeatureLock(req, res, next) {
  if (req.maintenance && req.maintenance.featureLock) {
    // Only allow GET requests
    if (req.method !== 'GET') {
      return res.status(403).json({
        success: false,
        message: 'Data creation and editing are disabled during maintenance',
        code: 'FEATURE_LOCKED'
      });
    }
  }
  next();
}

module.exports = checkFeatureLock;
```

**Form Disabling:**
```javascript
// In your form components
function disableForms(featureLocked) {
  const forms = document.querySelectorAll('form[data-requires-write]');
  
  forms.forEach(form => {
    form.querySelectorAll('input, textarea, select, button[type="submit"]')
      .forEach(element => {
        element.disabled = featureLocked;
      });
  });

  // Show message
  if (featureLocked) {
    showBanner(
      'Feature editing is disabled. You can view your data but cannot make changes.',
      'warning'
    );
  }
}
```

### 4. Environment Configuration

**.env in your client app:**
```env
CLIENT_ID=college-001
SUPER_ADMIN_API=https://admin.yourdomain.com/api/super-admin
CLIENT_API_TOKEN=your_client_api_token_here
MAINTENANCE_CHECK_INTERVAL=60000  # 60 seconds
SHOW_FEATURE_LOCK_BANNER=true
```

### 5. Status Indicators

Show visual indicators of maintenance status:

```html
<!-- In navigation bar -->
<div id="maintenance-indicator" class="maintenance-indicator">
  <span class="indicator-icon"></span>
  <span class="indicator-text">--</span>
</div>

<style>
  .maintenance-indicator {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
  }

  .maintenance-indicator.active {
    background: #10b98133;
    color: #10b981;
  }

  .maintenance-indicator.due {
    background: #f59e0b33;
    color: #f59e0b;
  }

  .maintenance-indicator.suspended {
    background: #ef444433;
    color: #ef4444;
  }

  .indicator-icon::before {
    content: '●';
    font-size: 8px;
  }
</style>

<script>
  function updateIndicator(maintenance) {
    const indicator = document.getElementById('maintenance-indicator');
    const statusClass = maintenance.status;
    const statusText = {
      'active': 'Active',
      'due': 'Payment Due',
      'suspended': 'Suspended'
    }[maintenance.status];

    indicator.className = `maintenance-indicator ${statusClass}`;
    indicator.querySelector('.indicator-text').textContent = statusText;
  }
</script>
```

## Best Practices

1. **Cache Locally** - Store maintenance status in sessionStorage/localStorage
2. **Handle Errors Gracefully** - If API fails, assume maintenance is OK
3. **Minimize API Calls** - Cache data and check periodically, not on every interaction
4. **User Communication** - Clearly explain why features are locked
5. **Redirect on Suspend** - For suspended clients, consider redirecting to renewal page
6. **Log Events** - Track when maintenance status changes for analytics
7. **Mobile Responsive** - Ensure popup works on all devices
8. **Accessibility** - Use ARIA labels for screen readers

## Troubleshooting

**Popup not showing:**
- Check that `maintenance-popup` element exists in DOM
- Verify API endpoint returns correct data
- Check browser console for errors

**Feature locks not applying:**
- Ensure elements have `data-action` attributes
- Check that JavaScript runs after page load
- Verify `featureLock` is true in maintenance object

**Permission denied errors:**
- Verify `CLIENT_API_TOKEN` in your environment
- Check super admin has created your client record
- Confirm `clientId` matches exactly

## Support

For integration help, refer to the Super Admin Panel README and API documentation.

---

**Last Updated:** February 18, 2024
