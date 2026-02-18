# Quick Start Guide

Get the Super Admin Maintenance Control Panel running in 5 minutes!

## ⚡ Quick Setup (5 minutes)

### Step 1: Copy Environment File
```bash
cp .env.example .env
```

### Step 2: Update .env with Your MongoDB Atlas String
```env
MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/super_admin_db?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_key_12345
```

**Get MongoDB Atlas URI:**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create account or log in
3. Create cluster
4. Click "Connect" → "Connect your application"
5. Copy connection string, replace `<password>` with your password

### Step 3: Install Dependencies
```bash
npm install
```

### Step 4: Start the Server
```bash
npm run dev
```

🎉 **Dashboard is ready at:** `http://localhost:5000`

### Step 5: Create First Admin Account (One-Time)
```bash
# In a new terminal:
python automation/scripts/setup_admin.py
```

Follow the prompts to create your super admin account with email and password.

🎉 **Dashboard is ready at:** `http://localhost:5000`

---

## 📋 What You Get

### Backend (Node.js/Express)
- ✅ Secure JWT authentication
- ✅ Client management CRUD
- ✅ Maintenance control endpoints
- ✅ Payment tracking
- ✅ Analytics API
- ✅ Error handling & validation

### Frontend (React-free vanilla JS)
- ✅ Professional admin dashboard
- ✅ Secure login with JWT
- ✅ Client list with search/filter
- ✅ Client detail editor with tabs
- ✅ Status toggle (controls popups: active=hidden, due/suspended=shown)
- ✅ Billing history & payment recording
- ✅ Real-time analytics dashboard

### Database (MongoDB Atlas)
- ✅ Cloud-hosted secure database
- ✅ Proper schemas with validation
- ✅ Indexes for performance
- ✅ Automated backups

---

## 🔑 First Login

**Default Credentials** (from `setup_admin.py`):
- Email: Your chosen email
- Password: Your chosen password

> **Security Tip:** Change JWT_SECRET in .env immediately after initial setup!

---

## 🎯 Common Tasks

### Create a New Client
1. Click "Add New Client" button
2. Fill in Client ID, Name, Plan, Email, Billing Date
3. Click "Add Client"

### Update Client Status (Control Popups)
1. Click "Edit" on any client in the list
2. Go to "Maintenance" tab
3. Change status:
   - `active` = Popup will HIDE ✅
   - `due` = Popup will SHOW ❌
   - `suspended` = Popup will SHOW ❌
4. Add optional notes (shown in popup message)
5. Click "Save Changes"
6. Popup automatically updates on client website!

### Record a Payment
1. Click "Edit" on client
2. Go to "Billing" tab
3. Enter payment amount, method, and optional transaction ID
4. Click "Record Payment & Activate"
5. Client status automatically set to "active"

### View Analytics
1. Go to "Dashboard"
2. See stats cards (Active, Due, Suspended clients)
3. See revenue total
4. See status distribution chart
5. See recent clients list

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `backend/server.js` | Express server entry point |
| `backend/routes/auth.js` | Login endpoint |
| `backend/routes/clients.js` | Client CRUD |
| `backend/routes/maintenance.js` | Maintenance control |
| `backend/routes/analytics.js` | Statistics endpoints |
| `frontend/index.html` | Dashboard UI |
| `frontend/js/api.js` | API client |
| `frontend/js/app.js` | Main app logic |
| `frontend/js/dashboard.js` | Dashboard functionality |
| `frontend/css/style.css` | Professional styling |

---

## 🔗 API Quick Reference

### Login
```bash
POST /api/super-admin/auth/login
Body: { email, password }
```

### List Clients
```bash
GET /api/super-admin/clients?page=1&limit=10
Header: Authorization: Bearer {token}
```

### Update Maintenance
```bash
PUT /api/super-admin/maintenance/{clientId}/update-maintenance
Body: { status, notes }
```

### Record Payment
```bash
POST /api/super-admin/maintenance/{clientId}/mark-paid
Body: { amount, method, transactionId, nextBillingDate }
```

### Get Analytics
```bash
GET /api/super-admin/analytics/summary
GET /api/super-admin/analytics/status-breakdown
```

---

## 🚀 Next Steps

1. **Integrate with Client Apps** - See `CLIENT_INTEGRATION.md`
2. **Deploy to Production** - See `DEPLOYMENT.md`
3. **Read Full Docs** - See `README.md`

---

## ❓ Troubleshooting

### Server won't start
```
Error: MONGODB_URI not set
```
✅ Add `MONGODB_URI` to `.env` file

### Login fails
```
Invalid email or password
```
✅ Create new admin with: `python automation/scripts/setup_admin.py`

### API 404 errors
```
Endpoint not found
```
✅ Ensure request path starts with `/api/super-admin`

---

## 🆘 Support

- Check `README.md` for full documentation
- Review `CLIENT_INTEGRATION.md` for client app setup
- See `DEPLOYMENT.md` for production deployment
- Check browser console for frontend errors
- Check terminal output for backend errors

---

## 📊 Project Stats

- **Backend:** 500+ lines of production Node.js code
- **Frontend:** 1000+ lines of vanilla JavaScript
- **Database:** MongoDB Atlas with 2 collections
- **API Endpoints:** 12 RESTful endpoints
- **Styling:** 1000+ lines of professional CSS

---

**You're all set! Happy admin managing! 🎉**

For detailed information, see the full README.md
