# MongoDB Installation & Setup Guide

Complete guide to get MongoDB running for the Success Sprout MERN application.

## Option 1: Local MongoDB (Windows)

### Step 1: Download MongoDB Community Server
1. Visit: https://www.mongodb.com/try/download/community
2. Select:
   - **Version:** Latest stable
   - **OS:** Windows
   - **Package:** MSI
3. Click "Download"

### Step 2: Run Installer
1. Double-click the downloaded `.msi` file
2. Click "Next" through the setup
3. Accept license agreement
4. Keep default installation path: `C:\Program Files\MongoDB\Server\7.0` (version may vary)
5. Click "Install"
6. Click "Finish"

### Step 3: Start MongoDB Service
MongoDB should start automatically. If not:

**Using PowerShell (as Administrator):**
```powershell
# Start MongoDB service
net start MongoDB

# Stop MongoDB service (when needed)
net stop MongoDB
```

**Or manually:**
```bash
cd "C:\Program Files\MongoDB\Server\7.0\bin"
mongod.exe
```

### Step 4: Verify Installation
Open PowerShell:
```powershell
mongo --version
mongosh --version  # For newer versions
```

Should show version number.

---

## Option 2: MongoDB Atlas (Cloud) - Recommended for Beginners

### Step 1: Create Account
1. Go to https://www.mongodb.com/cloud/atlas
2. Click "Try Free"
3. Sign up with email or Google
4. Verify email address

### Step 2: Create Free Cluster
1. Click "Build a Database"
2. Select "Shared" (Free tier)
3. Select your preferred region (closest to you)
4. Click "Create"
5. Wait 1-2 minutes for cluster to deploy

### Step 3: Set Database Access
1. Click "Security" → "Database Access"
2. Click "Add New Database User"
3. Enter:
   - **Username:** `devuser` (or your choice)
   - **Password:** Create a strong password
4. Click "Add User"
5. Make note of the credentials!

### Step 4: Set Network Access
1. Click "Security" → "Network Access"
2. Click "Add IP Address"
3. Select "Allow access from anywhere" (for development)
   - **⚠️ For production, use specific IPs only**
4. Click "Confirm"

### Step 5: Get Connection String
1. Click "Database" → Your cluster
2. Click "Connect"
3. Select "Drivers"
4. Choose "Node.js" and version
5. Copy the connection string

**Example:**
```
mongodb+srv://devuser:password@cluster.mongodb.net/successSprout?retryWrites=true&w=majority
```

**Important:**
- Replace `password` with your actual password
- Replace `cluster` with your cluster name
- You can add database name at the end: `/successSprout`

### Step 6: Update .env File
```env
MONGODB_URI=mongodb+srv://devuser:yourpassword@cluster.mongodb.net/successSprout?retryWrites=true&w=majority
```

---

## Option 3: Docker (Advanced Users)

### Install Docker
https://www.docker.com/products/docker-desktop

### Run MongoDB in Docker
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**Stop MongoDB:**
```bash
docker stop mongodb
```

**Start MongoDB:**
```bash
docker start mongodb
```

---

## Testing Your MongoDB Connection

### Option A: Using MongoDB Compass (GUI)

1. **Download:** https://www.mongodb.com/products/compass
2. **Install:** Follow installer
3. **Connect:**
   - Local: `mongodb://localhost:27017`
   - Atlas: Paste your connection string
4. Click "Connect"
5. Should see databases and collections

### Option B: Using Command Line

**Local MongoDB:**
```bash
mongosh
# Shows: test>
# Type: show dbs
# Press Enter
```

**MongoDB Atlas:**
```bash
mongosh "mongodb+srv://devuser:password@cluster.mongodb.net/successSprout"
```

### Option C: Test in Node.js
Create `test-mongo.js`:
```javascript
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/successSprout';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Connected!');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ MongoDB Error:', err.message);
    process.exit(1);
  });
```

Run:
```bash
node test-mongo.js
```

---

## Troubleshooting

### "mongod is not recognized"
- Add MongoDB to PATH manually
- Or use full path: `C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe`

### "Connection refused (localhost:27017)"
- MongoDB service not running
- Check: `net start MongoDB`
- Or try: `"C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe"`

### "Authentication failed (MongoDB Atlas)"
- Check username/password in connection string
- Make sure IP is whitelisted in Network Access
- Verify password doesn't contain special characters (or URL encode them)

### "Connection timeout"
- Check internet connection (for Atlas)
- Verify network firewall allows port 27017
- Try different region in Atlas

### "Database not found"
- MongoDB will create it automatically when you insert data
- Or create explicitly: `use successSprout`

---

## Database Schema Setup

Once connected, the Mongoose models will automatically create collections.

Or manually create collections:

```javascript
// In mongosh or Node.js console
use successSprout

db.createCollection("users")
db.createCollection("jobs")
db.createCollection("courses")
db.createCollection("scholarships")
db.createCollection("payments")
```

---

## Complete .env Configuration

```env
# Node Environment
NODE_ENV=development
PORT=3000

# Database
MONGODB_URI=mongodb://127.0.0.1:27017/successSprout
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/successSprout

# JWT
JWT_SECRET=your-super-secret-key

# PayPal (Optional)
PAYPAL_CLIENT_ID=your-client-id
PAYPAL_CLIENT_SECRET=your-secret
PAYPAL_MODE=sandbox
```

---

## Verify Everything Works

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Create .env File
(See above)

### Step 3: Start MongoDB
```bash
# Local
mongod

# OR Docker
docker start mongodb

# OR Atlas - just needs internet
```

### Step 4: Run Server
```bash
npm start
```

Should see:
```
✅ MongoDB connected successfully
📚 Database: successSprout
🚀 SUCCESS SPROUT SERVER STARTED
📍 Server running on http://0.0.0.0:3000
```

---

## Common MongoDB Commands

```javascript
// Connect (in mongosh)
mongosh

// Show databases
show dbs

// Use database
use successSprout

// Show collections
show collections

// Count documents
db.users.countDocuments()

// Find all documents
db.users.find()

// Find one document
db.users.findOne({ email: "test@example.com" })

// Delete all documents
db.users.deleteMany({})

// Drop collection
db.users.drop()

// Exit
exit
```

---

## Quick Reference

| Task | Command |
|------|---------|
| Start MongoDB (local) | `mongod` |
| Connect to MongoDB | `mongosh` |
| Start MongoDB (Docker) | `docker start mongodb` |
| Open Compass | MongoDB Compass app |
| Create .env | Copy template and fill values |
| Test connection | `node test-mongo.js` |
| View databases | `show dbs` in mongosh |

---

## Next Steps

1. ✅ Choose MongoDB option (Local, Atlas, or Docker)
2. ✅ Install and start MongoDB
3. ✅ Create .env file with MongoDB URI
4. ✅ Test connection
5. ✅ Start Success Sprout: `npm start`
6. ✅ Visit http://localhost:3000

---

**MongoDB is ready! 🎉**
