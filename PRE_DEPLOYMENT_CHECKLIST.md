# Pre-Deployment Checklist

Complete this checklist before deploying to Render + Vercel.

## Database & Authentication
- [ ] MongoDB Atlas cluster created and accessible
- [ ] Database name is `ZOOMUSEUMSBES`
- [ ] Connection string verified (MONGODB_URI)
- [ ] JWT_SECRET set to strong random value (not placeholder)
- [ ] JWT_EXPIRY set to `7d`

## Local Testing
- [ ] `npm install` runs without errors in `/backend`
- [ ] Frontend files are valid (no syntax errors in JS/HTML/CSS)
- [ ] Server starts: `npm start` on port 5001
- [ ] Admin login works with test credentials
- [ ] Can create/read/update/delete clients
- [ ] Maintenance status updates correctly
- [ ] Public endpoint `/api/maintenance/status/test` responds properly
- [ ] No console errors in browser DevTools

## Code Quality
- [ ] No hardcoded passwords or secrets in code
- [ ] No sensitive data in environment example file
- [ ] All TODO/FIXME comments addressed or documented
- [ ] No debug console.log statements left in
- [ ] CORS configuration uses environment variables

## Configuration Files
- [ ] `.env` exists with development settings
- [ ] `.env.example` exists with template variables
- [ ] `.env.production` exists with production template
- [ ] `render.yaml` exists and is valid YAML
- [ ] `vercel.json` exists and is valid JSON
- [ ] `.gitignore` includes `.env` files
- [ ] `DEPLOYMENT.md` exists and is comprehensive
- [ ] `QUICK_START_DEPLOY.md` exists

## API & Frontend Integration
- [ ] `frontend/js/api.js` has `getAPIBase()` function
- [ ] API client supports both localhost and production URLs
- [ ] `window.__BACKEND_URL__` support implemented
- [ ] All API endpoints use `getAPIBase()`
- [ ] CORS headers properly configured in backend
- [ ] Frontend can fetch from backend without CORS errors

## Deployment Configuration
- [ ] Render backend service name set: `biomuseum-admin-backend`
- [ ] Vercel frontend project name set: `biomuseum-admin-frontend`
- [ ] Environment variables documented for both platforms
- [ ] Health check endpoint `/health` implemented
- [ ] Build commands configured correctly
- [ ] Start command verified for Node

## Security Review
- [ ] JWT_SECRET is not in version control
- [ ] Database credentials not exposed in code
- [ ] API endpoints require authentication where needed
- [ ] CORS whitelist is restrictive (not `*` in production)
- [ ] No sensitive logs in production configuration
- [ ] Email credentials only in environment variables
- [ ] SSL/HTTPS will be automatic with platforms

## README & Documentation
- [ ] README.md exists and explains project
- [ ] DEPLOYMENT.md covers full deployment process
- [ ] QUICK_START_DEPLOY.md has step-by-step guide
- [ ] All environment variables documented
- [ ] Troubleshooting section included

## Git Repository
- [ ] All code committed to GitHub
- [ ] `.gitignore` prevents `.env` files from being committed
- [ ] Meaningful commit messages used
- [ ] Branch protection rules set (main branch)
- [ ] Collaborator access confirmed

## GitHub Integration
- [ ] GitHub account connected to Render
- [ ] GitHub account connected to Vercel
- [ ] Repository access permissions granted to both platforms
- [ ] Personal access tokens generated if needed
- [ ] Webhook URLs configured (auto-deploy on push)

## Deployment Platform Preparation
- [ ] Render account created and verified
- [ ] Render billing method added (if using paid tier)
- [ ] Vercel account created and verified
- [ ] Vercel billing method added (if needed)
- [ ] Both accounts have GitHub connected

## Final Pre-Push Check
- [ ] All tests pass locally
- [ ] No uncommitted changes with `git status`
- [ ] No merge conflicts
- [ ] Latest code pulled from remote

---

## Deployment Order

**Phase 1: Backend (Render)**
1. [ ] Push code to GitHub
2. [ ] Create Render service from repository
3. [ ] Add all environment variables to Render
4. [ ] Deploy and wait for success
5. [ ] Note backend URL: `https://your-backend.onrender.com`
6. [ ] Test health endpoint: `/health`

**Phase 2: Frontend (Vercel)**
1. [ ] Create Vercel project from repository
2. [ ] Add REACT_APP_BACKEND_URL with Render URL
3. [ ] Deploy and wait for success
4. [ ] Note frontend URL: `https://your-frontend.vercel.app`
5. [ ] Test dashboard loads

**Phase 3: Cross-Service Configuration**
1. [ ] Update Render environment variables with Vercel URL
2. [ ] Render will automatically redeploy
3. [ ] Wait 2 minutes for redeploy to complete
4. [ ] Test frontend can communicate with backend

**Phase 4: Verification**
1. [ ] Frontend loads at deployed URL
2. [ ] Login works
3. [ ] Can create/edit clients
4. [ ] Status endpoints respond
5. [ ] No CORS errors in DevTools

---

## Rollback Plan

If deployment fails:

1. **Check Deployed Logs**
   - Render: Service → Logs tab
   - Vercel: Project → Deployments → View logs

2. **Verify Environment Variables**
   - All required variables are set
   - No typos in variable names
   - MongoDB URI is correct

3. **Test Locally**
   - Run `npm install && npm start`
   - Verify database connection works
   - Test all endpoints manually

4. **Redeploy**
   - Fix issue in code
   - Commit and push to GitHub
   - Platforms auto-redeploy from new commit

5. **Contact Support**
   - Render Support: https://render.com/support
   - Vercel Support: https://vercel.com/support

---

## Post-Deployment Tasks

- [ ] Document final deployed URLs
- [ ] Update client documentation with deployment URLs
- [ ] Set up monitoring (e.g., UptimeRobot)
- [ ] Configure backups for MongoDB
- [ ] Set up error tracking (optional)
- [ ] Schedule regular security reviews
- [ ] Plan scaling strategy for traffic growth

---

**Last Updated**: 2024
**Status**: Ready for Deployment ✅
