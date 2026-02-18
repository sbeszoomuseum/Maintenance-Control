#!/usr/bin/env node

/**
 * Deployment Monitor Script
 * 
 * Usage: node deployment-monitor.js
 * 
 * Configuration: Create .monitor-config.json in project root with:
 * {
 *   "backendUrl": "https://your-backend.onrender.com",
 *   "frontendUrl": "https://your-frontend.vercel.app",
 *   "checkInterval": 300000,
 *   "slackWebhook": "https://hooks.slack.com/...",
 *   "discordWebhook": "https://discordapp.com/api/..."
 * }
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration
const configPath = path.join(__dirname, '.monitor-config.json');
let config = {
  backendUrl: process.env.BACKEND_URL || 'http://localhost:5001',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  checkInterval: 300000, // 5 minutes
};

// Load user config if exists
if (fs.existsSync(configPath)) {
  try {
    const userConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    config = { ...config, ...userConfig };
  } catch (e) {
    console.error('Error loading config:', e.message);
  }
}

// Status tracking
const status = {
  backend: { up: null, lastCheck: null, downtime: 0 },
  frontend: { up: null, lastCheck: null, downtime: 0 },
};

// Utility functions
function log(message, level = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
  console.log(`${prefix} ${message}`);
}

function checkUrl(url) {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      timeout: 5000,
    };

    const protocol = urlObj.protocol === 'https:' ? https : require('http');
    const request = protocol.request(options, (res) => {
      resolve({ success: res.statusCode < 500, statusCode: res.statusCode });
      res.on('data', () => {}); // Consume response
    });

    request.on('timeout', () => {
      request.destroy();
      resolve({ success: false, error: 'timeout' });
    });

    request.on('error', (e) => {
      resolve({ success: false, error: e.message });
    });

    request.end();
  });
}

async function checkBackend() {
  try {
    const healthUrl = `${config.backendUrl}/health`;
    const result = await checkUrl(healthUrl);
    return result.success && result.statusCode === 200;
  } catch (e) {
    log(`Backend check error: ${e.message}`, 'error');
    return false;
  }
}

async function checkFrontend() {
  try {
    const result = await checkUrl(config.frontendUrl);
    return result.success && result.statusCode === 200;
  } catch (e) {
    log(`Frontend check error: ${e.message}`, 'error');
    return false;
  }
}

async function checkDatabaseConnectivity() {
  try {
    const result = await checkUrl(`${config.backendUrl}/api/super-admin/clients`);
    return result.statusCode !== 500; // Not a server error
  } catch (e) {
    return false;
  }
}

async function sendAlert(message, severity = 'warning') {
  if (config.slackWebhook) {
    try {
      const color = severity === 'critical' ? '#FF0000' : '#FFA500';
      const payload = {
        attachments: [
          {
            color: color,
            title: `BioMuseum Admin - ${severity.toUpperCase()}`,
            text: message,
            ts: Math.floor(Date.now() / 1000),
          },
        ],
      };
      
      // Send to Slack
      const slackUrl = new URL(config.slackWebhook);
      const options = {
        hostname: slackUrl.hostname,
        path: slackUrl.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      };
      
      const req = https.request(options);
      req.write(JSON.stringify(payload));
      req.end();
    } catch (e) {
      log(`Failed to send Slack alert: ${e.message}`, 'error');
    }
  }
}

async function performCheck() {
  const timestamp = new Date().toISOString();
  log('Starting health check...', 'debug');

  // Check backend
  const backendUp = await checkBackend();
  const dbConnected = await checkDatabaseConnectivity();

  if (backendUp && dbConnected) {
    if (!status.backend.up) {
      log('Backend is back online', 'info');
      status.backend.up = true;
      status.backend.downtime = 0;
    }
  } else {
    if (status.backend.up) {
      log('Backend is DOWN', 'error');
      status.backend.up = false;
      await sendAlert(
        `Backend service is down. URL: ${config.backendUrl}`,
        'critical'
      );
    }
    status.backend.downtime += Math.floor(config.checkInterval / 60000); // minutes
  }

  // Check frontend
  const frontendUp = await checkFrontend();

  if (frontendUp) {
    if (!status.frontend.up) {
      log('Frontend is back online', 'info');
      status.frontend.up = true;
      status.frontend.downtime = 0;
    }
  } else {
    if (status.frontend.up) {
      log('Frontend is DOWN', 'error');
      status.frontend.up = false;
      await sendAlert(
        `Frontend service is down. URL: ${config.frontendUrl}`,
        'critical'
      );
    }
    status.frontend.downtime += Math.floor(config.checkInterval / 60000); // minutes
  }

  // Log status
  log(
    `Status - Backend: ${status.backend.up ? '✓ UP' : '✗ DOWN'} | Frontend: ${status.frontend.up ? '✓ UP' : '✗ DOWN'}`,
    'info'
  );

  status.backend.lastCheck = timestamp;
  status.frontend.lastCheck = timestamp;
}

function getStatus() {
  return {
    timestamp: new Date().toISOString(),
    backend: {
      up: status.backend.up,
      lastCheck: status.backend.lastCheck,
      downtime: `${status.backend.downtime} minutes`,
    },
    frontend: {
      up: status.frontend.up,
      lastCheck: status.frontend.lastCheck,
      downtime: `${status.frontend.downtime} minutes`,
    },
  };
}

// Export for external use
module.exports = {
  start: () => {
    log('Starting BioMuseum Admin Panel Monitor...', 'info');
    log(`Backend URL: ${config.backendUrl}`, 'info');
    log(`Frontend URL: ${config.frontendUrl}`, 'info');
    log(`Check interval: ${config.checkInterval / 1000}s`, 'info');

    // Initial check
    performCheck();

    // Recurring checks
    setInterval(performCheck, config.checkInterval);

    // Health endpoint for external monitors
    if (config.exposeHealthPort) {
      const http = require('http');
      const server = http.createServer((req, res) => {
        if (req.url === '/status') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(getStatus()));
        } else {
          res.writeHead(404);
          res.end();
        }
      });
      server.listen(config.exposeHealthPort);
      log(`Health status available at: http://localhost:${config.exposeHealthPort}/status`, 'info');
    }
  },
  stop: () => {
    log('Stopping monitor', 'info');
    process.exit(0);
  },
  getStatus,
};

// CLI Usage
if (require.main === module) {
  const command = process.argv[2];

  switch (command) {
    case 'status':
      console.log(JSON.stringify(getStatus(), null, 2));
      process.exit(0);
      break;
    case 'start':
      module.exports.start();
      // Keep process alive
      process.on('SIGINT', () => {
        log('Monitor stopped', 'info');
        process.exit(0);
      });
      break;
    default:
      console.log(`
BioMuseum Admin Panel Monitor

Usage:
  node deployment-monitor.js start     - Start continuous monitoring
  node deployment-monitor.js status    - Get current status

Configuration (.monitor-config.json):
  {
    "backendUrl": "https://your-backend.onrender.com",
    "frontendUrl": "https://your-frontend.vercel.app",
    "checkInterval": 300000,
    "slackWebhook": "optional-slack-webhook-url",
    "discordWebhook": "optional-discord-webhook-url"
  }

Environment Variables:
  BACKEND_URL: Backend service URL
  FRONTEND_URL: Frontend service URL
      `);
      process.exit(0);
  }
}
