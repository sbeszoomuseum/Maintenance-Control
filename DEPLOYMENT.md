# Deployment Guide

Instructions for deploying the Super Admin Maintenance Control Panel to production.

## Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] MongoDB Atlas database created and secured
- [ ] Super admin account created
- [ ] JWT_SECRET changed from default
- [ ] HTTPS certificates ready
- [ ] Back up database
- [ ] Test all features in staging
- [ ] Configure automated backups
- [ ] Set up logging/monitoring

## Deploying to Heroku

### 1. Prerequisites
```bash
heroku login
heroku create super-admin-panel
```

### 2. Add Environment Variables
```bash
heroku config:set MONGODB_URI=mongodb+srv://...
heroku config:set JWT_SECRET=your_production_secret_key
heroku config:set NODE_ENV=production
```

### 3. Create Procfile
```
web: node backend/server.js
```

### 4. Deploy
```bash
git push heroku main
```

## Deploying to AWS

### Using Elastic Beanstalk

```bash
# Install EB CLI
pip install awsebcli

# Initialize
eb init -p node.js-14 super-admin-panel

# Create environment
eb create production --envvars MONGODB_URI=mongodb+srv://...

# Deploy
eb deploy
```

### Using EC2 + PM2

```bash
# Connect to EC2
ssh -i your-key.pem ec2-user@your-instance.ip

# Install Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 16

# Install PM2
npm install -g pm2

# Clone repo
git clone <your-repo>
cd super-admin-panel
npm install

# Start with PM2
pm2 start backend/server.js --name "super-admin"
pm2 save
pm2 startup

# Set up reverse proxy with Nginx
sudo apt install nginx
# Configure nginx to proxy to localhost:5000
```

## Deploying to Google Cloud Platform

### Using Cloud Run

```bash
# Build
gcloud builds submit --tag gcr.io/PROJECT-ID/super-admin

# Deploy
gcloud run deploy super-admin-panel \
  --image gcr.io/PROJECT-ID/super-admin \
  --platform managed \
  --region us-central1 \
  --set-env-vars MONGODB_URI=mongodb+srv://...
```

### Using App Engine

```bash
# Create app.yaml
cat > app.yaml << EOF
runtime: nodejs16
env: standard

env_variables:
  MONGODB_URI: "mongodb+srv://..."
  JWT_SECRET: "your_production_secret"
EOF

# Deploy
gcloud app deploy
```

## Docker Deployment

### Dockerfile
```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY backend ./backend
COPY frontend ./frontend
COPY .env.production ./.env

EXPOSE 5000

CMD ["node", "backend/server.js"]
```

### Docker Compose
```yaml
version: '3.8'

services:
  super-admin-panel:
    build: .
    ports:
      - "5000:5000"
    environment:
      MONGODB_URI: ${MONGODB_URI}
      JWT_SECRET: ${JWT_SECRET}
      NODE_ENV: production
    restart: unless-stopped
```

## Setting Up Automated Backups

### MongoDB Atlas (Cloud)
- Enable automatic daily backups in Atlas console
- Set 35-day backup retention
- Enable point-in-time recovery

### Custom Backup Script
```bash
#!/bin/bash
# backup.sh
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR=/backups/super-admin

mongodump --uri="$MONGODB_URI" --out=$BACKUP_DIR/$TIMESTAMP

# Keep only last 30 days
find $BACKUP_DIR -mtime +30 -type d -exec rm -rf {} +

# Upload to S3
aws s3 sync $BACKUP_DIR s3://your-backup-bucket/super-admin/
```

Schedule with cron:
```
0 2 * * * /path/to/backup.sh
```

## Monitoring & Logging

### Application Logging
```javascript
// In server.js
const fs = require('fs');
const logStream = fs.createWriteStream('logs/app.log', { flags: 'a' });

app.use((req, res, next) => {
  logStream.write(`[${new Date().toISOString()}] ${req.method} ${req.path}\n`);
  next();
});
```

### Error Tracking (Sentry)
```bash
npm install @sentry/node
```

```javascript
const Sentry = require("@sentry/node");

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

app.use(Sentry.Handlers.errorHandler());
```

### Analytics (Google Analytics)
Add to frontend:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## SSL/HTTPS

### Using Let's Encrypt
```bash
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --nginx -d yourdomain.com

# Auto-renew
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

### Nginx Configuration
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

## Performance Optimization

### Enable GZIP Compression
```javascript
const compression = require('compression');
app.use(compression());
```

### Database Indexing
```javascript
// In database.js, after connection
await db.collection('maintenance_controls').createIndex({ status: 1, nextBillingDate: 1 });
await db.collection('maintenance_controls').createIndex({ clientId: 1 });
```

### Caching Strategy
```javascript
// Add Redis caching
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);

app.get('/clients/:id', async (req, res) => {
  const cacheKey = `client:${req.params.id}`;
  
  // Check cache
  const cached = await client.get(cacheKey);
  if (cached) return res.json(JSON.parse(cached));
  
  // Fetch and cache
  const data = await MaintenanceControl.findById(req.params.id);
  await client.setEx(cacheKey, 300, JSON.stringify(data)); // 5 min TTL
  res.json(data);
});
```

## Post-Deployment

1. **Verify Deployment**
   - Test login at production URL
   - Verify API endpoints work
   - Check database connectivity

2. **Monitor Performance**
   - Watch error logs
   - Monitor database performance
   - Track API response times

3. **Regular Maintenance**
   - Review security logs weekly
   - Rotate JWT_SECRET quarterly
   - Update dependencies monthly
   - Review billing alerts

4. **Disaster Recovery**
   - Test backup restoration monthly
   - Document recovery procedures
   - Keep runbook updated

## Troubleshooting Production Issues

### High Memory Usage
```bash
# Check Node.js memory
ps aux | grep node

# Restart PM2 process
pm2 restart super-admin

# Check for memory leaks
node --inspect backend/server.js
```

### Database Connection Issues
```bash
# Test MongoDB connection
mongosh $MONGODB_URI

# Check connection pool
# In server.js, add logging
console.log('Active connections:', mongoose.connection.collection('clients').db.db.serverConfig.s.pool);
```

### API Slowness
- Check database indexes
- Review slow query logs
- Monitor network latency
- Scale horizontal pods if needed

---

**Document Last Updated:** February 18, 2024
