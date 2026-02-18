# BioMuseum Admin Panel - Maintenance Control System

A complete Super Admin control panel for managing college client subscriptions, payment status, and maintenance notice popups across multiple websites.

## 🎯 Features

### Admin Dashboard
- **Client Management**: Create, read, update, and delete client accounts
- **Status Tracking**: Track maintenance status (active, due, suspended) for each client
- **Payment Management**: Monitor payment status (paid, pending, unpaid) per client
- **Date Tracking**: Record last payment date and schedule next billing date
- **Analytics**: View system-wide analytics (active clients, pending payments, suspended accounts)
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Premium Styling**: Modern glassmorphism design with animations
- **User Authentication**: Secure JWT-based admin login

### Client Website Integration
- **Status Popup**: Automatic popup notification on client websites showing maintenance/payment status
- **Dismissible UI**: Users can dismiss popup (unless account is suspended)
- **Custom Messages**: Admin-configurable status messages for each client
- **API Endpoints**: Public endpoints for client websites to fetch status
- **No Client Database**: Lightweight integration - no client-side database needed

### Deployment
- **Multi-Platform**: Designed for Render (backend) and Vercel (frontend) deployment
- **Environment-Aware**: Seamless local development to cloud deployment
- **Automated Deployment**: GitHub Actions integration for automated testing
- **Zero Downtime**: Supports continuous deployment with auto-redeploy on git push

## 📁 Project Structure

```
super-admin-panel/
├── backend/                    # Node.js Express server
│   ├── server.js              # Main server initialization
│   ├── routes/
│   │   ├── clients.js         # Client CRUD endpoints
│   │   ├── maintenance.js     # Maintenance status endpoints
│   │   └── analytics.js       # Analytics endpoints
│   ├── middleware/
│   │   └── auth.js            # JWT authentication
│   └── models/                # Data models and validation
│
├── frontend/                   # Static HTML/CSS/JavaScript
│   ├── index.html             # Admin dashboard
│   ├── login.html             # Login page
│   ├── js/
│   │   ├── api.js             # API client with environment detection
│   │   ├── dashboard.js       # Dashboard logic
│   │   └── auth.js            # Authentication handler
│   ├── css/
│   │   └── style.css          # Responsive styling
│   ├── components/
│   │   └── MaintenancePopup.jsx  # Client website popup component
│   └── public/                # Static assets
│
├── .github/
│   └── workflows/
│       └── test.yml           # GitHub Actions CI/CD
│
├── render.yaml                # Render deployment config
├── vercel.json                # Vercel deployment config
├── .env                       # Development environment (not in git)
├── .env.example               # Environment template
├── .env.production            # Production environment template
├── .gitignore                 # Git ignore rules
│
├── deployment-helper.js       # Deployment verification script
├── deployment-monitor.js      # Service health monitoring
│
├── DEPLOYMENT.md              # Detailed deployment guide
├── QUICK_START_DEPLOY.md      # 5-step quick start guide
├── PRE_DEPLOYMENT_CHECKLIST.md # Verification checklist
└── README.md                  # This file
```

## 🚀 Quick Start (Development)

### Prerequisites
- Node.js 18+
- npm or yarn
- MongoDB Atlas account (free tier available)
- Git

### Setup Steps

1. **Clone Repository**
   ```bash
   git clone https://github.com/sbeszoomuseum/Maintenance-Control.git
   cd super-admin-panel
   ```

2. **Install Dependencies**
   ```bash
   npm install --prefix backend
   ```

3. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your settings:
   # - MONGODB_URI: MongoDB connection string
   # - JWT_SECRET: Random string for token signing
   # - PORT: Server port (default: 5001)
   ```

4. **Start Server**
   ```bash
   npm start --prefix backend
   ```

5. **Access Dashboard**
   - Open: http://localhost:5001
   - Default admin login: (see admin setup)

6. **Verify Installation**
   ```bash
   # Test API
   curl http://localhost:5001/health
   # Should return: {"status":"ok"}
   ```

## 📦 Deployment (Production)

### Option 1: Quick Start (Recommended)
Follow [QUICK_START_DEPLOY.md](./QUICK_START_DEPLOY.md) for 5-step deployment:
1. Push to GitHub
2. Deploy backend on Render
3. Deploy frontend on Vercel
4. Update environment variables
5. Test deployed system

### Option 2: Detailed Setup
See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive deployment guide with:
- Architecture overview
- Step-by-step instructions
- Troubleshooting guide
- Production scaling recommendations

### Option 3: Pre-Deployment Verification
Run the deployment helper before pushing to production:
```bash
node deployment-helper.js
```

## 🔧 Configuration

### Environment Variables

**Required (both dev and production):**
```env
MONGODB_URI=mongodb+srv://...
DB_NAME=ZOOMUSEUMSBES
JWT_SECRET=your-secret-key
NODE_ENV=development|production
PORT=5001
```

**Optional (recommended):**
```env
JWT_EXPIRY=7d
LOG_LEVEL=debug|info|warn|error
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5001
```

See [.env.example](./.env.example) for full list.

## 🔐 Security

- **JWT Authentication**: Secure token-based authentication with configurable expiry
- **Password Hashing**: bcryptjs for password encryption
- **CORS Configuration**: Restricted cross-origin access
- **Environment Secrets**: No secrets hardcoded in source
- **HTTPS**: Automatic SSL with Render + Vercel

## 📊 API Endpoints

### Public Endpoints (no authentication)
- `GET /api/maintenance/status/:client_id` - Get client status
- `POST /api/maintenance/check` - Check multiple clients

### Admin Endpoints (JWT required)
- `POST /api/super-admin/login` - Admin login
- `GET /api/super-admin/clients` - List all clients
- `POST /api/super-admin/clients` - Create client
- `PUT /api/super-admin/clients/:id` - Update client
- `DELETE /api/super-admin/clients/:id` - Delete client
- `GET /api/super-admin/analytics` - Get analytics

## 💾 Database Schema

```javascript
{
  _id: ObjectId,
  client_id: String,           // Unique identifier
  name: String,                // Company name
  status: String,              // 'active' | 'due' | 'suspended'
  message: String,             // Custom status message
  payment_status: String,      // 'paid' | 'pending' | 'unpaid'
  last_paid_date: Date,        // Last payment timestamp
  next_billing_date: Date,     // Next billing due date
  created_at: Date,            // Created timestamp
  updated_at: Date             // Last update timestamp
}
```

## 🧪 Testing

### Local Testing
```bash
# Test server is running
curl http://localhost:5001/health

# Test admin login
curl -X POST http://localhost:5001/api/super-admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'

# Test status endpoint
curl http://localhost:5001/api/maintenance/status/your-client-id
```

### Automated Testing
GitHub Actions runs tests on every push:
- Backend syntax validation
- Frontend file presence checks
- Configuration file validation
- Environment setup verification

## 📈 Monitoring

### Health Checks
```bash
# Manual health check
curl https://your-backend.onrender.com/health

# Automated monitoring
node deployment-monitor.js start
```

### Uptime Monitoring
Recommended external monitors:
- [UptimeRobot](https://uptimerobot.com/) - Free uptime monitoring
- [StatusPage.io](https://www.statuspage.io/) - Status page
- [Render Health Checks](https://render.com/docs/health-checks)

## 🐛 Troubleshooting

### Server Won't Start
1. Check Node version: `node -v` (should be 18+)
2. Verify MongoDB connection: `MONGODB_URI` in .env
3. Check port availability: `netstat -ano | findstr :5001` (Windows)
4. View error logs for specific issues

### CORS Errors
1. Verify `FRONTEND_URL` in backend environment
2. Check `BACKEND_URL` in frontend configuration
3. Review CORS configuration in `backend/server.js`

### Deployment Failures
1. View platform logs:
   - Render: Service dashboard → Logs tab
   - Vercel: Project dashboard → Deployments
2. Verify all environment variables are set
3. Check GitHub Actions workflow: `.github/workflows/test.yml`

See [PRE_DEPLOYMENT_CHECKLIST.md](./PRE_DEPLOYMENT_CHECKLIST.md) and [DEPLOYMENT.md](./DEPLOYMENT.md) for more troubleshooting.

## 📚 Documentation

- **[QUICK_START_DEPLOY.md](./QUICK_START_DEPLOY.md)** - Fast 5-step deployment guide
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Comprehensive deployment documentation
- **[PRE_DEPLOYMENT_CHECKLIST.md](./PRE_DEPLOYMENT_CHECKLIST.md)** - Pre-deployment verification
- **API Documentation** - See backend routes for endpoint details

## 🚦 Status Conditions

### Displays Popup When:
- Status is NOT 'active' (i.e., 'due' or 'suspended'), OR
- Payment status is NOT 'paid' (i.e., 'pending' or 'unpaid')

### Suspension Lock:
When account is suspended:
- Close button hidden
- Button disabled with "Contact Support" message
- Popup cannot be dismissed by clicking overlay
- Forces user attention to suspension notice

## 🔄 Deployment Workflow

```
Local Development
↓
git push → GitHub
↓
GitHub Actions (automated testing)
↓
Render Backend (auto-deploy on success)
↓
Vercel Frontend (auto-deploy on success)
↓
Production Live
```

## 📞 Support & Resources

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Atlas**: https://www.mongodb.com/docs/atlas/
- **GitHub Pages**: https://pages.github.com/

## 📝 License

Private project for BioMuseum Zoo College

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m "Add feature"`
3. Push to branch: `git push origin feature/your-feature`
4. Create Pull Request with description

## ✅ Checklist for First Deployment

- [ ] Read QUICK_START_DEPLOY.md
- [ ] Run `node deployment-helper.js`
- [ ] Generated and saved JWT_SECRET
- [ ] Tested locally: `npm start`
- [ ] Pushed to GitHub: `git push`
- [ ] Created Render service and deployed
- [ ] Created Vercel project and deployed
- [ ] Updated environment variables with deployed URLs
- [ ] Verified `/health` endpoint
- [ ] Tested admin login
- [ ] Tested status endpoint
- [ ] Verified client website integration

---

**Last Updated**: 2024
**Status**: Ready for Production Deployment ✅

For deployment questions, see [DEPLOYMENT.md](./DEPLOYMENT.md)
