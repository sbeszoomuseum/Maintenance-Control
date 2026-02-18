# Super Admin Maintenance Control Panel

A secure, enterprise-grade super admin dashboard for managing multiple college client subscriptions, maintenance status, billing cycles, and feature access controls in a multi-tenant SaaS environment.

## 🚀 Features

### Core Functionality
- **Secure JWT Authentication** - Role-based access control for super admins only
- **Client Management** - Create, update, and manage all client colleges
- **Maintenance Control** - Set maintenance status (active, due, suspended) per client
- **Billing Management** - Track payment dates, record payments, and manage billing history
- **Feature Locking** - Disable new data creation/editing while allowing viewing
- **Payment Reminders** - Trigger reminder popups on client applications
- **Analytics & Reporting** - Real-time statistics on client status and revenue
- **Automated Tasks** - Python scripts for daily billing checks and analytics

### Security
- ✓ Environment variable-based secrets management
- ✓ Bcrypt password hashing
- ✓ Protected API routes with JWT
- ✓ MongoDB Atlas cloud database
- ✓ Error handling and input validation
- ✓ CORS and Helmet security headers

### UI/UX
- ✓ Modern, responsive admin dashboard
- ✓ Professional SaaS design language
- ✓ Font Awesome icons and Google Fonts
- ✓ Intuitive navigation and workflows
- ✓ Real-time client status updates
- ✓ Tabbed interface for client management

## 📁 Project Structure

```
super-admin-panel/
├── backend/
│   ├── config/
│   │   ├── database.js         # MongoDB connection
│   │   └── constants.js         # Application constants
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication
│   │   └── errorHandler.js      # Error handling
│   ├── models/
│   │   ├── MaintenanceControl.js # Client maintenance schema
│   │   └── SuperAdmin.js         # Admin user schema
│   ├── routes/
│   │   ├── auth.js              # Login/logout
│   │   ├── clients.js           # Client CRUD operations
│   │   ├── maintenance.js       # Maintenance control endpoints
│   │   └── analytics.js         # Analytics endpoints
│   ├── utils/
│   │   └── responseHelper.js    # Response formatting
│   └── server.js                # Express server setup
├── frontend/
│   ├── css/
│   │   └── style.css            # Dashboard styling
│   ├── js/
│   │   ├── api.js               # API client
│   │   ├── app.js               # Main app logic
│   │   └── dashboard.js         # Dashboard functionality
│   └── index.html               # Main dashboard page
├── automation/
│   └── scripts/
│       └── setup_admin.py       # Create first admin account (one-time setup)
├── package.json                 # Node.js dependencies
├── .env.example                 # Environment template
├── .gitignore                   # Git ignore rules
└── README.md                    # This file
```

## 🛠️ Installation & Setup

### 1. Prerequisites
- Node.js 14+ and npm
- Python 3.7+ 
- MongoDB Atlas account (or local MongoDB)
- Git

### 2. Clone and Install Dependencies

```bash
cd super-admin-panel
npm install
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and update with your values:

```bash
cp .env.example .env
```

Edit `.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/super_admin_db?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_key_change_this_in_production_12345
PORT=5000
NODE_ENV=development
SUPER_ADMIN_EMAIL=admin@biomuseum.com
SUPER_ADMIN_PASSWORD=initialpassword123
```

**Important:** 
- Generate a strong `JWT_SECRET` for production
- Use MongoDB Atlas for cloud-hosted database
- Never commit `.env` file to version control

### 4. Create Initial Super Admin Account

```bash
python automation/scripts/setup_admin.py
```

Follow the prompts to create your first super admin account.

### 5. Start the Application

```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

The dashboard will be available at `http://localhost:5000`

## 📡 API Documentation

### Base URL
```
/api/super-admin
```

### Authentication Endpoints

#### POST /auth/login
Login with super admin credentials

**Request:**
```json
{
  "email": "admin@biomuseum.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "admin": {
      "id": "507f1f77bcf86cd799439011",
      "email": "admin@biomuseum.com",
      "fullName": "Super Admin",
      "role": "super_admin"
    }
  }
}
```

### Client Endpoints

#### GET /clients
List all clients with pagination and filtering

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 10)
- `status` (active|due|suspended)
- `search` (search by name or email)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "clientId": "college-001",
      "clientName": "University of Excellence",
      "status": "active",
      "plan": "premium",
      "nextBillingDate": "2024-03-15T00:00:00.000Z",
      "lastPaidDate": "2024-02-15T00:00:00.000Z",
      "showReminder": false,
      "featureLock": false,
      "contactEmail": "admin@university.edu",
      "billingHistory": [...],
      "notes": "Premium client",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-02-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "pages": 3
  }
}
```

#### GET /clients/:id
Get specific client details

#### POST /clients
Create new client

**Request:**
```json
{
  "clientId": "college-002",
  "clientName": "State University",
  "plan": "standard",
  "contactEmail": "admin@stateuniversity.edu",
  "nextBillingDate": "2024-04-15"
}
```

#### PUT /clients/:id
Update client information

### Maintenance Endpoints

#### PUT /maintenance/:id/update-maintenance
Update maintenance status and controls

**Request:**
```json
{
  "status": "active|due|suspended",
  "showReminder": true|false,
  "featureLock": true|false,
  "notes": "Admin notes"
}
```

#### POST /maintenance/:id/mark-paid
Record a payment and activate client

**Request:**
```json
{
  "amount": 1500.00,
  "method": "credit_card|bank_transfer|check",
  "transactionId": "txn_12345",
  "nextBillingDate": "2024-05-15"
}
```

#### POST /maintenance/:id/suspend
Suspend a client

**Request:**
```json
{
  "reason": "Non-payment"
}
```

#### POST /maintenance/:id/activate
Reactivate a suspended client

### Analytics Endpoints

#### GET /analytics/summary
Get overall system statistics

**Response:**
```json
{
  "success": true,
  "data": {
    "totalClients": 25,
    "activeClients": 22,
    "dueClients": 2,
    "suspendedClients": 1,
    "totalRevenue": 75000.00,
    "healthPercentage": 88
  }
}
```

#### GET /analytics/status-breakdown
Get client status distribution

**Response:**
```json
{
  "success": true,
  "data": {
    "active": 22,
    "due": 2,
    "suspended": 1
  }
}
```

## 🔐 Security Best Practices

1. **Environment Variables**
   - Never hardcode secrets in code
   - Use `.env` file (add to `.gitignore`)
   - Rotate JWT_SECRET regularly

2. **Database Security**
   - Use MongoDB Atlas IP whitelist
   - Enable MongoDB authentication
   - Use strong passwords for database user

3. **API Security**
   - All endpoints require JWT authentication
   - Passwords are hashed with bcrypt
   - Helmet provides HTTP headers security
   - CORS is restricted to allowed domains

4. **Access Control**
   - Only `super_admin` role can access this panel
   - Account lockdown after 5 failed login attempts
   - All actions are logged

## 📊 Database Schema

### maintenance_controls Collection
```javascript
{
  _id: ObjectId,
  clientId: String (unique),
  clientName: String,
  status: "active" | "due" | "suspended",
  plan: "basic" | "standard" | "premium",
  nextBillingDate: Date,
  lastPaidDate: Date,
  showReminder: Boolean,
  featureLock: Boolean,
  billingHistory: [
    {
      paymentDate: Date,
      amount: Number,
      plan: String,
      method: String,
      transactionId: String,
      notes: String
    }
  ],
  notes: String,
  contactEmail: String,
  contactPhone: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### super_admins Collection
```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  fullName: String,
  role: "super_admin",
  lastLogin: Date,
  isActive: Boolean,
  loginAttempts: Number,
  lockUntil: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## 🎯 Simple Manual Control

No cron jobs, no automation scripts - just manually control when popups show:

**How it works:**
1. Admin Panel → Click "Edit" on any client
2. Go to "Maintenance" tab
3. Set **Status**:
   - ✅ `active` = Popup HIDDEN (paid)
   - ❌ `due` = Popup SHOWN (unpaid)
   - ❌ `suspended` = Popup SHOWN (suspended)
4. Add optional notes that appear in the popup
5. Click "Save Changes"

**That's it!** The popup automatically shows/hides on the client website based on the status you set.

## 🔗 Client App Integration

To integrate the maintenance reminder popup in your client applications, see `CLIENT_INTEGRATION.md`.

**Quick Summary:**
- Fetch client status from API
- If status is NOT `active` → Show popup
- If status is `active` → Hide popup
- Display custom message from admin panel notes

**Simple 2-minute setup:**
```

## 📱 Responsive Design

The dashboard is fully responsive and works on:
- ✓ Desktop (1920x1080 and higher)
- ✓ Laptop (1366x768)
- ✓ Tablet (768px and up)
- Mobile optimizations available

## 🚀 Performance

- Paginated client list (10 per page)
- Index on status and nextBillingDate
- Efficient MongoDB queries with aggregation
- Frontend caching of user data
- Lazy loading of client details

## 🐛 Troubleshooting

### MongoDB Connection Issues
```
Error: MONGODB_URI environment variable not set
```
Solution: Ensure `.env` file is in the root directory with valid MongoDB URI

### Authentication Errors
```
Error: Invalid or expired token
```
Solution: Log out and log back in. JWT tokens expire after 7 days.

### API Not Found
```
Error: Endpoint not found
```
Solution: Ensure API base path is `/api/super-admin` not `/api/admin`

### Python Script Errors
```
Error: pymongo not installed
```
Solution: `pip install pymongo python-dotenv bcrypt`

## 📚 Additional Resources

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Express.js Guide](https://expressjs.com/)
- [JWT Introduction](https://jwt.io/introduction)
- [Bcrypt Documentation](https://github.com/kelektiv/node.bcrypt.js)

## 📝 License

MIT License - Feel free to use for your project

## 👥 Support

For issues or questions:
1. Check the troubleshooting section
2. Review API documentation
3. Check MongoDB Atlas logs for errors
4. Use browser console for frontend errors

---

**Built with ❤️ for efficient SaaS management**
