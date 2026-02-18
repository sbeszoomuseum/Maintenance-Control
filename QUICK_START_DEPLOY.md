# Quick Start Deployment Guide - Render + Vercel

## Prerequisites
- GitHub account with repository created
- Render.com account (free tier available)
- Vercel.com account (free tier available)
- MongoDB Atlas setup with connection URI

## Step 1: Prepare for Deployment

### 1.1 Verify Code is Ready
```bash
cd super-admin-panel
npm install --prefix backend
npm run build || true  # Verify no build errors
npm start --prefix backend  # Test locally on :5001
```

### 1.2 Generate Strong JWT Secret
```bash
# On Windows PowerShell:
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((Get-Random -Count 32 | ForEach-Object { [char]$_ })))

# Or use online generator: https://passwordsgenerator.com/
```

### 1.3 Commit to GitHub
```bash
git add .
git commit -m "Production deployment configuration for Render + Vercel"
git push -u origin main
```

## Step 2: Deploy Backend on Render

### 2.1 Create Render Service
1. Go to https://render.com
2. Click **"New +"** → **"Web Service"**
3. **Connect Repository**:
   - Select your GitHub account
   - Select `Maintenance-Control` repository
   - Confirm access permissions

### 2.2 Configure Service
Fill in the form:
- **Name**: `biomuseum-admin-backend`
- **Root Directory**: `./super-admin-panel` (if separate directory)
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Instance Type**: Free (for testing) or Starter Pro (for production)

### 2.3 Set Environment Variables
In Render dashboard, click **"Environment"** and add:

```
MONGODB_URI = mongodb+srv://username:password@cluster.mongodb.net/ZOOMUSEUMSBES?retryWrites=true&w=majority
DB_NAME = ZOOMUSEUMSBES
PORT = 5001
NODE_ENV = production
JWT_SECRET = [paste your strong random secret here]
JWT_EXPIRY = 7d
FRONTEND_URL = [leave blank for now - will update after Vercel deploys]
ADMIN_PANEL_URL = [leave blank for now]
BACKEND_URL = [leave blank for now]
LOG_LEVEL = info
EMAIL_HOST = smtp.gmail.com
EMAIL_PORT = 587
EMAIL_USER = your-email@gmail.com
EMAIL_PASS = your-app-password
```

### 2.4 Deploy
Click **"Create Web Service"** and wait for deployment (3-5 minutes)

### 2.5 Note Backend URL
Once deployed, Render will show your URL like: `https://servermaintenancecontrolsbes.onrender.com`
**Save this URL** - you need it for Vercel deployment.

### 2.6 Verify Backend is Running
```bash
curl https://servermaintenancecontrolsbes.onrender.com/health
# Should return: {"status":"ok"}
```

## Step 3: Deploy Frontend on Vercel

### 3.1 Create Vercel Project
1. Go to https://vercel.com
2. Click **"Add New"** → **"Project"**
3. **Import Repository**:
   - Click "Select a Git Repository"
   - Select `Maintenance-Control`

### 3.2 Configure Project
- **Project Name**: `biomuseum-admin-frontend`
- **Framework Preset**: Other (static)
- **Root Directory**: `./super-admin-panel/frontend`
- **Build Command**: (leave empty - using static files)
- **Output Directory**: (leave empty)

### 3.3 Set Environment Variables
In Vercel, add environment variables:

```
REACT_APP_BACKEND_URL = https://biomuseum-admin-backend.onrender.com
```

(Replace with your actual Render backend URL from Step 2.5)

### 3.4 Deploy
Click **"Deploy"** and wait for deployment (1-2 minutes)

### 3.5 Note Frontend URL
Vercel will show your URL like: `https://zoomaintenance.vercel.app`
**Save this URL** - you need it to update Render configuration.

### 3.6 Test Frontend
- Open `https://zoomaintenance.vercel.app` in browser
- Login with admin credentials
- Verify dashboard loads without 404 errors

## Step 4: Update Environment Variables (Post-Deployment)

### 4.1 Update Render Configuration
Go back to Render dashboard:
1. Select your backend service
2. Click **"Settings"** → **"Environment"**
3. Update these variables with your Vercel URL:

```
FRONTEND_URL = https://zoomaintenance.vercel.app
ADMIN_PANEL_URL = https://zoomaintenance.vercel.app
BACKEND_URL = https://servermaintenancecontrolsbes.onrender.com
```

4. Click **"Save"** - Render will automatically redeploy

### 4.2 Verify Updated Configuration
```bash
# Wait 2 minutes for redeploy, then:
curl https://servermaintenancecontrolsbes.onrender.com/health
curl https://zoomaintenance.vercel.app/index.html
```

## Step 5: Test Complete System

### 5.1 Admin Dashboard Tests
1. Open `https://zoomaintenance.vercel.app`
2. Test login with admin credentials
3. Create a new client
4. Update client status to "due"
5. Verify backend API is called (check Network tab in DevTools)

### 5.2 Public Status Endpoint Test
```bash
# Replace client-id with actual ID from your system
curl https://servermaintenancecontrolsbes.onrender.com/api/maintenance/status/client-id

# Should return:
# {"client_id":"client-id","status":"active","message":"","payment_status":"paid"}
```

### 5.3 Client Website Integration Test
Add this to your client website's HTML:
```html
<script>
  window.__BACKEND_URL__ = 'https://servermaintenancecontrolsbes.onrender.com';
</script>
<script src="https://zoomaintenance.vercel.app/js/maintenance-popup.js"></script>
```

Then in client website code:
```javascript
// This will fetch status from deployed backend and show popup if needed
const popup = new MaintenancePopup('your-client-id');
popup.show();
```

## Troubleshooting

### Backend Won't Deploy
- Check Render logs: Click service → "Logs" tab
- Common issues:
  - MONGODB_URI invalid: Verify connection string
  - JWT_SECRET empty: Must be set
  - Build fails: Check `npm install` succeeds locally

### Frontend Shows CORS Errors
- Verify BACKEND_URL in Vercel environment variables
- Check FRONTEND_URL in Render environment variables
- Ensure both deployment URLs are added to backend CORS whitelist

### Status Endpoint Returns 404
- Verify backend is fully deployed and healthy
- Check client_id matches exactly (case-sensitive)
- Try: `https://servermaintenancecontrolsbes.onrender.com/health` first

### Popup Not Showing on Client Website
- Verify `window.__BACKEND_URL__` is set before loading popup.js
- Check browser console for CORS errors
- Confirm client_id is correct in your database

### Render Backend Sleeps After 15 Minutes
- This is free tier behavior - upgrade to Paid tier to prevent sleep
- Or add a simple monitor: https://www.freshping.io/ (free)

## Monitoring & Maintenance

### Regular Health Checks
Set up periodic checks to prevent free-tier sleep:
```bash
# Run every 14 minutes (cron job or external monitor)
curl https://biomuseum-admin-backend.onrender.com/health
```

### View Logs
- **Render Logs**: Service dashboard → "Logs" tab
- **Vercel Logs**: Project dashboard → "Deployments" → Select deployment → "Logs"

### Monitor Database
- MongoDB Atlas dashboard shows connection status and query stats
- Verify from Render: `mongodb://localhost:27017/ZOOMUSEUMSBES` works

### Update Deployment
- Any git push to `main` branch automatically triggers:
  - Render: rebuild and restart (uses build filter for `/backend/**/*`)
  - Vercel: rebuild and redeploy frontend

## Production Considerations

### Security Checklist
- [ ] Change JWT_SECRET to strong random value
- [ ] Enable HTTPS (automatic with Render + Vercel)
- [ ] Verify CORS whitelist only includes allowed domains
- [ ] Use strong MongoDB connection password
- [ ] Enable 2FA on Render and Vercel accounts
- [ ] Store secrets only in platform environment variables (never in code)

### Performance Optimization
- [ ] Upgrade Render to Starter Pro tier (keeps service always-on)
- [ ] Enable Vercel Edge caching for static assets
- [ ] Add MongoDB Atlas connection pooling
- [ ] Monitor API response times in browser DevTools

### Scalability
- [ ] Monitor Render CPU/memory usage
- [ ] Add more database indexes if queries slow down
- [ ] Consider Vercel Pro for unlimited serverless functions
- [ ] Set up alerts for service downtime

## Support & Documentation

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Atlas**: https://www.mongodb.com/docs/atlas/
- **Full Deployment Guide**: See DEPLOYMENT.md

## Need Help?

Check [DEPLOYMENT.md](./DEPLOYMENT.md) for:
- Detailed architecture explanation
- Advanced configuration options
- Comprehensive troubleshooting
- Production scaling recommendations
