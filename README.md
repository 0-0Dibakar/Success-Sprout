# Success Sprout 🌱

## **Full MERN Stack - AI-Powered Education & Career Platform**

A comprehensive platform connecting students with opportunities in education, jobs, freelancing, and scholarships. Built with modern web technologies for scalability and performance.

---

## 📋 Table of Contents

- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [Architecture](#-architecture)
- [Quick Start](#-quick-start)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Database Schema](#-database-schema)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

---

## 🛠 Tech Stack

### **MERN Stack** (MongoDB, Express.js, React, Node.js)

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Database** | MongoDB | NoSQL database for flexible schema |
| **Backend** | Node.js + Express.js | RESTful API server |
| **Frontend** | React + Vite | Modern UI framework |
| **Authentication** | JWT (JSON Web Tokens) | Secure user authentication |
| **Payments** | PayPal Integration | Payment processing |
| **ODM** | Mongoose | MongoDB object mapping |

**Additional Tools:**
- bcryptjs - Password hashing
- CORS - Cross-origin requests
- Dotenv - Environment configuration

---

## ✨ Features

### **User Management**
- ✅ Multi-role authentication (Student, Recruiter, Admin)
- ✅ Secure password hashing with bcryptjs
- ✅ JWT-based session management
- ✅ User profile management
- ✅ Email verification (ready to implement)

### **Job Portal**
- ✅ Post and manage job listings (Recruiters)
- ✅ Advanced job search & filtering
- ✅ Job applications tracking
- ✅ Applicant management dashboard
- ✅ Job status management (open, closed, filled)

### **Course Management**
- ✅ Course catalog with filtering
- ✅ Student enrollment system
- ✅ Course modules and video content
- ✅ Ratings and reviews
- ✅ Certificate tracking

### **Scholarship Management**
- ✅ Browse available scholarships
- ✅ Application tracking
- ✅ Eligibility filtering
- ✅ Application status monitoring
- ✅ Deadline management

### **Payment Processing**
- ✅ PayPal integration (sandbox & live)
- ✅ Transaction tracking
- ✅ Payment status management
- ✅ Receipt generation
- ✅ Refund handling

### **Admin Dashboard**
- ✅ User management
- ✅ Content moderation
- ✅ Analytics and reporting
- ✅ System configuration

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────┐
│           FRONTEND (React + Vite)               │
│    ├─ Components                                │
│    ├─ Pages                                     │
│    └─ Services (API calls)                      │
└────────────────────┬────────────────────────────┘
                     │ (HTTP/REST)
┌────────────────────▼────────────────────────────┐
│        BACKEND (Node.js + Express.js)           │
│    ├─ API Routes                                │
│    ├─ Controllers (Business Logic)              │
│    ├─ Middleware (Auth, Validation)             │
│    └─ Error Handling                            │
└────────────────────┬────────────────────────────┘
                     │ (Mongoose ODM)
┌────────────────────▼────────────────────────────┐
│    DATABASE (MongoDB)                           │
│    ├─ Users Collection                          │
│    ├─ Jobs Collection                           │
│    ├─ Courses Collection                        │
│    ├─ Scholarships Collection                   │
│    └─ Payments Collection                       │
└─────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18+ ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **MongoDB** ([Install locally](https://docs.mongodb.com/manual/installation/) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))

### Installation Steps

#### 1. **Clone & Setup**
```bash
git clone https://github.com/yourusername/success-sprout.git
cd success-sprout
npm install
```

#### 2. **Configure Environment**
Create a `.env` file in the root directory:
```env
# Server
NODE_ENV=development
PORT=3000
BIND_HOST=0.0.0.0

# Database - MongoDB
MONGODB_URI=mongodb://127.0.0.1:27017/successSprout
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/successSprout

# Authentication
JWT_SECRET=your-super-secret-key-change-in-production

# PayPal (Optional)
PAYPAL_CLIENT_ID=your-client-id
PAYPAL_CLIENT_SECRET=your-secret
PAYPAL_MODE=sandbox

# CORS
CORS_ORIGIN=http://localhost:3000
```

See [ENV_SETUP.txt](ENV_SETUP.txt) for complete configuration.

#### 3. **Start MongoDB**

**Locally:**
```bash
mongod  # or use MongoDB Compass GUI
```

**MongoDB Atlas (Cloud):**
- Create account at https://www.mongodb.com/cloud/atlas
- Get connection string and add to `.env`

#### 4. **Run Server**
```bash
npm start           # Production
# OR
npm run dev         # Development (with auto-reload)
```

#### 5. **Access Application**
```
http://localhost:3000
```

---

## 📚 API Documentation

### **Authentication Routes** (`/api/auth`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/register` | Register new user | ❌ |
| POST | `/login` | User login | ❌ |
| GET | `/me` | Get current user | ✅ |
| PUT | `/profile` | Update profile | ✅ |
| GET | `/:id` | Get user by ID | ❌ |

### **Job Routes** (`/api/jobs`)

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/` | Get all jobs | Public |
| GET | `/:id` | Get job details | Public |
| POST | `/` | Create job | Recruiter |
| PUT | `/:id` | Update job | Recruiter |
| DELETE | `/:id` | Delete job | Recruiter |
| POST | `/:id/apply` | Apply for job | Student |
| GET | `/recruiter/my-jobs` | My posted jobs | Recruiter |

### **Course Routes** (`/api/courses`)

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/` | Get all courses | Public |
| GET | `/:id` | Get course details | Public |
| POST | `/` | Create course | Admin |
| PUT | `/:id` | Update course | Admin |
| DELETE | `/:id` | Delete course | Admin |
| POST | `/:id/enroll` | Enroll in course | Student |
| GET | `/student/my-courses` | My courses | Student |

### **Scholarship Routes** (`/api/scholarships`)

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/` | Get all scholarships | Public |
| GET | `/:id` | Get scholarship details | Public |
| POST | `/` | Create scholarship | Admin |
| PUT | `/:id` | Update scholarship | Admin |
| DELETE | `/:id` | Delete scholarship | Admin |
| POST | `/:id/apply` | Apply for scholarship | Student |
| GET | `/student/my-applications` | My applications | Student |

### **Health Check**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server & database status |

---

## 📂 Project Structure

```
success-sprout/
├── models/
│   ├── User.js              # User schema with auth methods
│   ├── Job.js               # Job listing schema
│   ├── Course.js            # Course schema
│   ├── Scholarship.js       # Scholarship schema
│   └── Payment.js           # Payment tracking schema
│
├── controllers/
│   ├── authController.js    # Auth logic (register, login, profile)
│   ├── jobController.js     # Job CRUD operations
│   ├── courseController.js  # Course management
│   └── scholarshipController.js # Scholarship operations
│
├── routes/
│   ├── auth.js              # Auth endpoints
│   ├── jobs.js              # Job endpoints
│   ├── courses.js           # Course endpoints
│   └── scholarships.js       # Scholarship endpoints
│
├── middleware/
│   └── auth.js              # JWT verification & role checks
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.jsx
│   └── package.json
│
├── public/
│   ├── login.html
│   ├── dashboard.html
│   └── js/
│
├── server.js                # Main Express server
├── package.json             # Backend dependencies
├── .env.example             # Environment template
├── ENV_SETUP.txt            # Configuration guide
└── README.md                # This file
```

---

## 🗄 Database Schema

### **User Model**
```javascript
{
  email: String (unique, required),
  password: String (hashed),
  name: String,
  role: String (enum: student, recruiter, admin),
  skills: [String],
  experience: String,
  education: String,
  profileImage: String,
  isVerified: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### **Job Model**
```javascript
{
  title: String,
  description: String,
  company: String,
  recruiter: ObjectId (ref: User),
  location: String,
  jobType: String (enum: full-time, part-time, contract, remote, internship),
  salary: { min: Number, max: Number, currency: String },
  requirements: [String],
  skills: [String],
  applications: [
    {
      student: ObjectId,
      status: String,
      appliedAt: Date
    }
  ],
  deadline: Date,
  createdAt: Date
}
```

### **Course Model**
```javascript
{
  title: String,
  description: String,
  category: String,
  instructor: String,
  duration: String,
  level: String (enum: beginner, intermediate, advanced),
  price: Number,
  students: [ObjectId],
  modules: [
    {
      title: String,
      videos: [{ title: String, url: String }]
    }
  ],
  rating: Number,
  isPublished: Boolean,
  createdAt: Date
}
```

### **Scholarship Model**
```javascript
{
  title: String,
  description: String,
  amount: Number,
  provider: String,
  eligibility: [String],
  deadline: Date,
  category: String (enum: merit-based, need-based, diversity),
  applicants: [
    {
      student: ObjectId,
      status: String,
      appliedAt: Date
    }
  ],
  isActive: Boolean,
  createdAt: Date
}
```

---

## 🚀 Deployment

### **Recommended Hosting Setup**

| Component | Recommended Service |
|-----------|-------------------|
| **Backend** | Railway, Render, or Heroku |
| **Frontend** | Vercel or Netlify |
| **Database** | MongoDB Atlas (Cloud) |
| **Storage** | AWS S3 or similar |

### **Deployment Steps**

1. **Prepare for Production**
   ```bash
   npm run build  # Build React client
   ```

2. **Deploy Backend**
   - Push code to GitHub
   - Connect repository to Railway/Render/Heroku
   - Set environment variables in platform
   - Deploy

3. **Deploy Frontend**
   - Connect to Vercel/Netlify
   - Set `REACT_APP_API_URL` to your backend URL
   - Deploy

4. **Configure Database**
   - Set up MongoDB Atlas account
   - Create production cluster
   - Update `MONGODB_URI` in environment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

---

## 🔐 Security Best Practices

- ✅ **Password Hashing:** bcryptjs with salt rounds = 10
- ✅ **JWT Expiration:** 7 days with refresh token support (ready)
- ✅ **CORS Protection:** Configured for specific origins
- ✅ **Environment Variables:** Never commit `.env` to git
- ✅ **Input Validation:** Ready for implementation
- ✅ **Rate Limiting:** Ready for implementation
- ✅ **HTTPS:** Required in production

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

MIT License - See [LICENSE](LICENSE) file for details

---

## 📞 Support & Documentation

| Document | Purpose |
|----------|---------|
| [SETUP.md](SETUP.md) | Detailed setup guide |
| [ENV_SETUP.txt](ENV_SETUP.txt) | Environment configuration |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Production deployment guide |
| [CHANGES.md](CHANGES.md) | Version history |

---

## 🎯 Roadmap

- [ ] Email verification system
- [ ] Refresh token implementation
- [ ] Rate limiting & brute-force protection
- [ ] Advanced search & filtering
- [ ] Notification system (Email, SMS)
- [ ] Video streaming optimization
- [ ] Admin analytics dashboard
- [ ] Mobile app (React Native)
- [ ] AI-powered course recommendations
- [ ] Real-time messaging system

---

**Made with ❤️ for connecting students with opportunities**


## API Endpoints

### Public Endpoints
- `GET /api/health` - Health check
- `GET /api/supabase/health` - Supabase connection check
- `POST /api/register` - User registration
- `POST /api/login` - User login

### Protected Endpoints
- `GET /api/courses` - Get courses
- `POST /api/courses/:id/enroll` - Enroll in a course
- `GET /api/scholarships` - Get scholarships
- `POST /api/scholarships/:id/apply` - Apply for scholarship

### Admin Endpoints
- `POST /api/admin/login` - Admin login
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/:section` - Get section data

### Recruiter Endpoints
- `POST /api/recruiter/register` - Recruiter registration
- `POST /api/recruiter/login` - Recruiter login
- `GET /api/recruiter/jobs` - Get jobs
- `POST /api/recruiter/jobs` - Post a job

## Troubleshooting

### "Supabase not configured"
- Make sure your `.env` file exists in the root directory
- Verify your Supabase credentials are correct
- Restart the server after changing `.env`

### "Server is not running"
- Check that port 3000 is available
- Look for errors in the terminal
- Make sure you ran `npm install`

### Database errors
- Verify you created the `users` table in Supabase
- Check that you're using the **service_role** key, not the anon key
- See SETUP.md for the correct SQL schema

## Development

### Using npm scripts:
```bash
npm start    # Start the server
npm run dev  # Start with nodemon (auto-restart)
```

### Testing Locally
1. Make sure the server is running (`npm start`)
2. Open [http://localhost:3000](http://localhost:3000)
3. Try registering a new user
4. Check your Supabase dashboard to see the user was created

## Deployment

For production deployment, see **[DEPLOYMENT.md](DEPLOYMENT.md)**

### Recommended Hosting:
- **Backend:** Railway, Render, or Heroku
- **Frontend:** Vercel or Netlify
- **Database:** Supabase (already configured)

### Security Checklist:
- ✅ Use HTTPS in production
- ✅ Set a strong `JWT_SECRET`
- ✅ Never commit `.env` to version control
- ✅ Use production PayPal credentials
- ✅ Configure Supabase Row Level Security

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](LICENSE)

## Support

- **Setup Issues:** See [SETUP.md](SETUP.md)
- **Deployment:** See [DEPLOYMENT.md](DEPLOYMENT.md)
- **Environment:** See [ENV_SETUP.txt](ENV_SETUP.txt)

## Recent Changes

- ✅ Fixed hardcoded API URLs throughout the application
- ✅ Added comprehensive setup documentation
- ✅ Added missing API endpoint stubs
- ✅ Improved error handling
- ✅ Created ENV_SETUP.txt for easy configuration
