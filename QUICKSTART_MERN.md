# Quick Setup Guide - Success Sprout MERN Stack

Get started with Success Sprout in 5 minutes!

## 🚀 Super Quick Start (Copy & Paste)

### Step 1: Clone & Install
```bash
git clone https://github.com/0-0Dibakar/Success-Sprout.git
cd Success-Sprout
npm install
```

### Step 2: Setup MongoDB

**Option A: Local MongoDB**
```bash
# Install MongoDB Community Edition
# https://docs.mongodb.com/manual/installation/

# Start MongoDB
mongod
```

**Option B: MongoDB Atlas (Cloud) - Recommended**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create a cluster
4. Get connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/dbname`)

### Step 3: Create .env File
Create `.env` in project root:
```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/successSprout

JWT_SECRET=your-secret-key-12345

PAYPAL_CLIENT_ID=your-paypal-id
PAYPAL_CLIENT_SECRET=your-paypal-secret
PAYPAL_MODE=sandbox
```

### Step 4: Start Server
```bash
npm start
```

Visit: **http://localhost:3000**

---

## 📊 Project Structure

```
success-sprout/
├── models/           ← Database schemas (MongoDB)
├── controllers/      ← Business logic
├── routes/           ← API endpoints
├── middleware/       ← Auth & validation
├── client/           ← React frontend
├── server.js         ← Main Express app
└── package.json      ← Dependencies
```

---

## 🔑 Key API Endpoints

### Authentication
```
POST   /api/auth/register    → Create account
POST   /api/auth/login       → Login
GET    /api/auth/me          → Get profile (need token)
```

### Jobs
```
GET    /api/jobs             → List all jobs
POST   /api/jobs             → Create job (recruiter only)
POST   /api/jobs/:id/apply   → Apply for job
```

### Courses
```
GET    /api/courses          → List courses
POST   /api/courses/:id/enroll → Enroll in course
```

### Scholarships
```
GET    /api/scholarships     → List scholarships
POST   /api/scholarships/:id/apply → Apply for scholarship
```

---

## 🔐 Test the API

### Using cURL or Postman:

**1. Register User**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "password123",
    "name": "John Doe",
    "role": "student"
  }'
```

**2. Login**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "password123"
  }'
```

Response:
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { ... }
}
```

**3. Get Jobs (using token from login)**
```bash
curl -X GET http://localhost:3000/api/jobs \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

## 🛠 Development Commands

```bash
npm start              # Run production server
npm run dev            # Run with auto-reload (nodemon)
npm run client         # Run React frontend only
npm run build          # Build for production
npm run client-build   # Build React app
```

---

## 🐛 Troubleshooting

### "MongoDB connection error"
- ✅ Make sure MongoDB is running (`mongod` command)
- ✅ Check MONGODB_URI in .env file
- ✅ For MongoDB Atlas, verify connection string is correct

### "Port 3000 already in use"
```bash
# Use different port
PORT=3001 npm start
```

### "JWT errors"
- ✅ Make sure JWT_SECRET is set in .env
- ✅ Include Authorization header: `Authorization: Bearer <token>`

### "CORS errors"
- ✅ Check CORS_ORIGIN in .env matches your frontend URL
- ✅ Ensure requests include proper headers

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| README.md | Full project documentation |
| MERN_STACK_OVERVIEW.md | Explain MERN to recruiters |
| ENV_SETUP.txt | Environment setup details |
| DEPLOYMENT.md | Production deployment |

---

## 🎯 Next Steps

1. ✅ Get MongoDB running
2. ✅ Setup .env file with your MongoDB URI
3. ✅ Run `npm install`
4. ✅ Start server: `npm start`
5. ✅ Test endpoints with Postman or cURL
6. ✅ Read MERN_STACK_OVERVIEW.md for resume talking points

---

## 💡 Pro Tips

- Use **Postman** or **Insomnia** for API testing (easy UI)
- Keep `.env` file in `.gitignore` (never commit secrets)
- Use **MongoDB Compass** GUI for database inspection
- Read the code comments for implementation details
- Check controller files to understand business logic

---

**You're ready to go! 🎉 Happy coding!**
