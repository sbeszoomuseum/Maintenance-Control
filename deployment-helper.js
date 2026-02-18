#!/usr/bin/env node

/**
 * Deployment Helper Script
 * 
 * Usage: node deployment-helper.js
 * 
 * This script helps with:
 * - Generating secure JWT secret
 * - Verifying deployment files exist
 * - Checking environment configuration
 * - Pre-deployment validation
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

function checkFile(filePath, description) {
  const fullPath = path.join(__dirname, filePath);
  if (fs.existsSync(fullPath)) {
    log(`✓ ${description}: ${filePath}`, 'green');
    return true;
  } else {
    log(`✗ ${description}: ${filePath}`, 'red');
    return false;
  }
}

function generateJWTSecret() {
  return crypto.randomBytes(32).toString('hex');
}

function parseEnvFile(filePath) {
  const fullPath = path.join(__dirname, filePath);
  const content = fs.readFileSync(fullPath, 'utf8');
  const lines = content.split('\n');
  const env = {};
  
  lines.forEach(line => {
    const match = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)$/);
    if (match) {
      env[match[1]] = match[2].trim();
    }
  });
  
  return env;
}

function validateEnvVariables(env, requiredVars) {
  let allExists = true;
  
  requiredVars.forEach(varName => {
    if (env[varName]) {
      log(`✓ ${varName} is configured`, 'green');
    } else {
      log(`✗ ${varName} is missing`, 'yellow');
      allExists = false;
    }
  });
  
  return allExists;
}

// Main execution
function main() {
  log('\n=== BioMuseum Admin Panel - Deployment Helper ===\n', 'cyan');
  
  // 1. Check deployment files
  log('1. Checking Deployment Configuration Files...', 'blue');
  const filesCheck = [
    ['render.yaml', 'Render config'],
    ['vercel.json', 'Vercel config'],
    ['.env.example', 'Environment template'],
    ['.env.production', 'Production environment'],
    ['DEPLOYMENT.md', 'Deployment guide'],
    ['QUICK_START_DEPLOY.md', 'Quick start guide'],
    ['PRE_DEPLOYMENT_CHECKLIST.md', 'Pre-deployment checklist'],
    ['.github/workflows/test.yml', 'GitHub Actions workflow'],
  ];
  
  let filesOk = true;
  filesCheck.forEach(([file, desc]) => {
    if (!checkFile(file, desc)) filesOk = false;
  });
  
  if (filesOk) {
    log('\n✓ All deployment files are in place!', 'green');
  } else {
    log('\n⚠ Some deployment files are missing. Check QUICK_START_DEPLOY.md', 'yellow');
  }
  
  // 2. Check backend files
  log('\n2. Checking Backend Files...', 'blue');
  const backendFiles = [
    ['backend/server.js', 'Main server file'],
    ['backend/routes/clients.js', 'Clients routes'],
    ['backend/routes/maintenance.js', 'Maintenance routes'],
    ['backend/routes/analytics.js', 'Analytics routes'],
  ];
  
  let backendOk = true;
  backendFiles.forEach(([file, desc]) => {
    if (!checkFile(file, desc)) backendOk = false;
  });
  
  // 3. Check frontend files
  log('\n3. Checking Frontend Files...', 'blue');
  const frontendFiles = [
    ['frontend/index.html', 'Main HTML'],
    ['frontend/js/api.js', 'API client'],
    ['frontend/css/style.css', 'Styles'],
    ['frontend/components/MaintenancePopup.jsx', 'Popup component'],
  ];
  
  let frontendOk = true;
  frontendFiles.forEach(([file, desc]) => {
    if (!checkFile(file, desc)) frontendOk = false;
  });
  
  // 4. Environment configuration check
  log('\n4. Checking Environment Configuration...', 'blue');
  try {
    const devEnv = parseEnvFile('.env');
    const requiredVars = ['MONGODB_URI', 'DB_NAME', 'JWT_SECRET', 'PORT', 'NODE_ENV'];
    
    if (!validateEnvVariables(devEnv, requiredVars)) {
      log('\n⚠ Some environment variables are missing from .env', 'yellow');
      log('  Run: cp .env.example .env', 'cyan');
    }
  } catch (e) {
    log(`⚠ Could not read .env file: ${e.message}`, 'yellow');
  }
  
  // 5. Generate JWT Secret option
  log('\n5. JWT Secret Generator', 'blue');
  const jwtSecret = generateJWTSecret();
  log(`\n✓ Generated secure JWT secret (32 bytes):`, 'green');
  log(`\n  ${jwtSecret}\n`, 'cyan');
  log('  ⚠ Add this to your .env and .env.production files as JWT_SECRET', 'yellow');
  log('  ⚠ Keep it secret - never commit it to version control', 'yellow');
  
  // 6. Pre-deployment checklist reminder
  log('\n6. Pre-Deployment Checklist', 'blue');
  log('\nBefore deploying, complete these steps:', 'cyan');
  log('  1. [ ] Read QUICK_START_DEPLOY.md', 'cyan');
  log('  2. [ ] Review PRE_DEPLOYMENT_CHECKLIST.md', 'cyan');
  log('  3. [ ] Test locally: npm start', 'cyan');
  log('  4. [ ] Generated and saved JWT_SECRET', 'cyan');
  log('  5. [ ] Verified all env variables', 'cyan');
  log('  6. [ ] Committed code to GitHub', 'cyan');
  log('  7. [ ] Created Render.com account', 'cyan');
  log('  8. [ ] Created Vercel.com account', 'cyan');
  
  // 7. Summary
  log('\n=== Summary ===', 'blue');
  if (filesOk && backendOk && frontendOk) {
    log('\n✓ All checks passed! Ready for deployment.', 'green');
    log('\nNext steps:', 'cyan');
    log('  1. Read QUICK_START_DEPLOY.md for step-by-step instructions', 'cyan');
    log('  2. Set JWT_SECRET in environment variables', 'cyan');
    log('  3. Push to GitHub: git push', 'cyan');
    log('  4. Deploy to Render: Connect GitHub repository', 'cyan');
    log('  5. Deploy to Vercel: Connect GitHub repository', 'cyan');
  } else {
    log('\n⚠ Some files are missing. Please check the errors above.', 'yellow');
  }
  
  log('\n=== Documentation ===', 'blue');
  log('  - QUICK_START_DEPLOY.md: 5-step deployment guide', 'cyan');
  log('  - PRE_DEPLOYMENT_CHECKLIST.md: Complete verification checklist', 'cyan');
  log('  - DEPLOYMENT.md: Detailed technical documentation', 'cyan');
  log('  - render.yaml: Render configuration (auto-used on deployment)', 'cyan');
  log('  - vercel.json: Vercel configuration (auto-used on deployment)', 'cyan');
  
  log('\n=== Support ===', 'blue');
  log('  - Render Support: https://render.com/support', 'cyan');
  log('  - Vercel Support: https://vercel.com/support', 'cyan');
  log('  - MongoDB Atlas: https://www.mongodb.com/docs/atlas/', 'cyan');
  
  log('\n');
}

// Run main function
main();
