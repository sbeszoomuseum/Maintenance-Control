# 🚀 LIVE SYSTEM - Quick Reference Card

## Your System is LIVE! ✅

**Date:** February 18, 2026

---

## 🌐 Access URLs

| Service | URL |
|---------|-----|
| **Admin Dashboard** | https://zoomaintenance.vercel.app |
| **API Backend** | https://servermaintenancecontrolsbes.onrender.com |
| **Health Check** | https://servermaintenancecontrolsbes.onrender.com/health |

---

## 🔐 Admin Login Credentials

```
Email:    sarthaknk07@gmail.com
Password: Sarthak@1983
```

⚠️ **CHANGE IMMEDIATELY AFTER LOGIN!**

---

## 📋 Important Configuration Values

```
Frontend URL:  https://zoomaintenance.vercel.app
Backend URL:   https://servermaintenancecontrolsbes.onrender.com
Database:      ZOOMUSEUMSBES (MongoDB Atlas)
Node Version:  18+ required
```

---

## 🧪 Quick Verification Commands

```bash
# Check backend health
curl https://servermaintenancecontrolsbes.onrender.com/health

# Check client status
curl https://servermaintenancecontrolsbes.onrender.com/api/maintenance/status/test-client

# Start local monitoring
npm run monitor
```

---

## 🎯 Key Actions

### First Time Setup
1. ✅ Access https://zoomaintenance.vercel.app
2. ✅ Login with credentials above
3. ✅ **CHANGE PASSWORD IMMEDIATELY**
4. ✅ Create your first client
5. ✅ Test the popup integration

### Integrate Popup on Client Website
```html
<script>
  window.__BACKEND_URL__ = 'https://servermaintenancecontrolsbes.onrender.com';
</script>
<script src="https://zoomaintenance.vercel.app/js/maintenance-popup.js"></script>
```

### Check Any Client Status
```bash
curl https://servermaintenancecontrolsbes.onrender.com/api/maintenance/status/CLIENT-ID
```

---

## 📊 API Endpoints

### Public (No Auth)
```
GET  /api/maintenance/status/:client_id
```

### Admin (Requires JWT)
```
POST /api/super-admin/login
GET  /api/super-admin/clients
POST /api/super-admin/clients
PUT  /api/super-admin/clients/:id
```

---

## 🔄 Auto-Deployment

**Trigger:** Push to GitHub main branch
- Render (backend): 2-3 minutes
- Vercel (frontend): 1-2 minutes

```bash
git push origin main
```

---

## 📂 Environment Files (All Updated with Live URLs)

- ✅ `.env` - Development config
- ✅ `.env.production` - Production config
- ✅ `LIVE_CREDENTIALS.md` - Full credential reference
- ✅ `QUICK_START_DEPLOY.md` - Deployment guide with live URLs
- ✅ `DEPLOYMENT_COMPLETE.md` - Completion details

---

## 🆘 Quick Troubleshooting

**Dashboard won't load?**
- Check internet connection
- Try incognito mode
- Clear browser cache (Ctrl+Shift+Delete)

**API returns 404?**
- Verify client_id exists
- Check backend health first
- Review Render logs

**Popup not showing?**
- Confirm `window.__BACKEND_URL__` is set
- Check browser console for CORS errors
- Verify client_id in database

---

## 📞 Support Resources

| Issue | Resource |
|-------|----------|
| Render Issues | https://render.com/support |
| Vercel Issues | https://vercel.com/support |
| Database Issues | https://www.mongodb.com/support |
| Code Issues | GitHub repository |

---

## ⚡ Commands Cheat Sheet

```bash
# Local development
npm start                  # Run server locally
npm run dev              # Run with auto-reload

# Deployment
npm run check            # Pre-deployment checks
npm run deploy:production # Push to production

# Monitoring
npm run monitor          # Start monitoring
npm run monitor:status   # Check status

# Git
git add .
git commit -m "message"
git push origin main     # Triggers auto-deploy
```

---

## ✨ Features Overview

✅ Admin Dashboard - Manage clients and status
✅ Status Popup - Show on client websites  
✅ Payment Tracking - Track payment status
✅ Auto Deployment - Updates on git push
✅ Health Monitoring - Track uptime
✅ JWT Authentication - Secure admin access
✅ Responsive Design - Works on all devices

---

## 📈 Next Steps

1. ✅ Login to dashboard
2. ✅ Change admin password
3. ✅ Create first client
4. ✅ Test status endpoint
5. ✅ Integrate popup on website
6. ✅ Set up monitoring
7. ✅ Configure backups

---

## 🎊 System Status

```
┌─────────────────────────────────────┐
│  🟢 LIVE AND OPERATIONAL            │
│  All Systems: ✅ RUNNING            │
│  Auto-Deploy: ✅ ACTIVE             │
│  Database: ✅ CONNECTED             │
│  Health Check: ✅ PASSING           │
└─────────────────────────────────────┘
```

**Created:** 2026-02-18
**Version:** 1.0.0 Production
**Status:** Ready for Clients ✅
