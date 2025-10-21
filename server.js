require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const app = express();

// Middleware
// Allow CORS during local development (adjust in production)
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like curl, Postman, or file://)
        if (!origin) return callback(null, true);
        // Allow localhost origins
        if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
            return callback(null, true);
        }
        // Reject other origins in dev - change as needed
        return callback(null, false);
    },
    credentials: true
}));
app.use(express.json());
app.use(express.static('public'));

// MongoDB Connection
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/successSprout';
        console.log('Attempting to connect to MongoDB at:', mongoURI);
        
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000, // 5 second timeout
            socketTimeoutMS: 45000, // 45 second timeout
            family: 4 // Use IPv4, skip trying IPv6
        });
        
        console.log('MongoDB Connected Successfully');
    } catch (err) {
        console.error('MongoDB Connection Error:', err);
        // Try reconnecting after 5 seconds
        setTimeout(connectDB, 5000);
    }
};

// Initial connection
connectDB().then(async () => {
    // Add sample courses if none exist
    const coursesCount = await Course.countDocuments();
    if (coursesCount === 0) {
        await Course.insertMany([
            {
                title: 'Web Development Bootcamp',
                description: 'Learn full-stack web development from scratch',
                price: 999,
                duration: '3 months',
                level: 'Beginner'
            },
            {
                title: 'Data Science Fundamentals',
                description: 'Master the basics of data science and analytics',
                price: 1499,
                duration: '4 months',
                level: 'Intermediate'
            },
            {
                title: 'AI & Machine Learning',
                description: 'Explore artificial intelligence and machine learning',
                price: 1999,
                duration: '6 months',
                level: 'Advanced'
            }
        ]);
    }

    // Add sample scholarships if none exist
    const scholarshipsCount = await Scholarship.countDocuments();
    if (scholarshipsCount === 0) {
        await Scholarship.insertMany([
            {
                title: 'Merit Scholarship 2025',
                description: 'Full scholarship for top performing students',
                amount: 50000,
                deadline: new Date('2025-12-31'),
                status: 'Open'
            },
            {
                title: 'Technology Innovation Grant',
                description: 'Scholarship for students pursuing technology innovation projects',
                amount: 25000,
                deadline: new Date('2025-11-30'),
                status: 'Open'
            },
            {
                title: 'Women in Tech Scholarship',
                description: 'Supporting women pursuing careers in technology',
                amount: 35000,
                deadline: new Date('2025-10-31'),
                status: 'Open'
            }
        ]);
    }
});

// Handle connection errors
mongoose.connection.on('error', err => {
    console.error('MongoDB connection error:', err);
    setTimeout(connectDB, 5000);
});

// Handle disconnections
mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected. Attempting to reconnect...');
    setTimeout(connectDB, 5000);
});

// User Schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    paymentStatus: { 
        type: String, 
        enum: ['pending', 'completed'], 
        default: 'pending' 
    },
    paymentDetails: {
        paymentId: String,
        orderID: String,
        amount: Number,
        currency: String,
        paymentDate: Date
    },
    registrationDate: { type: Date, default: Date.now },
    userType: { type: String, required: true, default: 'user' },
    enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    appliedScholarships: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Scholarship' }],
    active: { type: Boolean, default: false }
});

// Course Schema
const courseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    duration: String,
    level: String,
    enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

// Scholarship Schema
const scholarshipSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    deadline: Date,
    status: { type: String, enum: ['Open', 'Closed'], default: 'Open' },
    applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

const User = mongoose.model('User', userSchema);
const Course = mongoose.model('Course', courseSchema);
const Scholarship = mongoose.model('Scholarship', scholarshipSchema);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Helper: get PayPal access token
async function getPayPalAccessToken() {
    const mode = process.env.PAYPAL_MODE === 'sandbox' ? 'sandbox' : 'live';
    const base = mode === 'sandbox' ? 'https://api-m.sandbox.paypal.com' : 'https://api-m.paypal.com';
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    if (!clientId || !clientSecret) throw new Error('PayPal credentials not configured');

    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const resp = await axios.post(`${base}/v1/oauth2/token`, 'grant_type=client_credentials', {
        headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });

    return { access_token: resp.data.access_token, base };
}

// Create PayPal order (server-side) and return approve URL
app.post('/api/create-paypal-order', async (req, res) => {
    try {
        const { userId, amount = '1.00', currency = 'INR' } = req.body;
        if (!userId) return res.status(400).json({ message: 'userId required' });

        const { access_token, base } = await getPayPalAccessToken();

        const orderResp = await axios.post(`${base}/v2/checkout/orders`, {
            intent: 'CAPTURE',
            purchase_units: [
                {
                    amount: {
                        currency_code: currency,
                        value: amount
                    },
                    custom_id: userId,
                    description: 'Success Sprout Membership'
                }
            ],
            application_context: {
                return_url: `${req.protocol}://${req.get('host')}/api/capture-paypal-order`,
                cancel_url: `${req.protocol}://${req.get('host')}/payment-cancelled`
            }
        }, {
            headers: {
                Authorization: `Bearer ${access_token}`,
                'Content-Type': 'application/json'
            }
        });

        const approveLink = orderResp.data.links.find(l => l.rel === 'approve');
        res.json({ approveUrl: approveLink ? approveLink.href : null, orderID: orderResp.data.id });
    } catch (error) {
        console.error('Create PayPal order error:', error.response?.data || error.message || error);
        res.status(500).json({ message: 'Failed to create PayPal order' });
    }
});

// Capture PayPal order after user approves (PayPal redirects here)
app.get('/api/capture-paypal-order', async (req, res) => {
    try {
        const { token: orderID } = req.query; // PayPal uses 'token' param for orders
        if (!orderID) return res.status(400).send('Missing order token');

        const { access_token, base } = await getPayPalAccessToken();

        // Capture the order
        const captureResp = await axios.post(`${base}/v2/checkout/orders/${orderID}/capture`, {}, {
            headers: {
                Authorization: `Bearer ${access_token}`,
                'Content-Type': 'application/json'
            }
        });

        // Find the custom_id which is our userId
        const customId = captureResp.data.purchase_units?.[0]?.custom_id;

        if (customId) {
            await User.findByIdAndUpdate(customId, {
                paymentStatus: 'completed',
                active: true,
                paymentDetails: {
                    orderID,
                    amount: captureResp.data.purchase_units[0].payments.captures[0].amount.value,
                    currency: captureResp.data.purchase_units[0].payments.captures[0].amount.currency_code,
                    paymentId: captureResp.data.purchase_units[0].payments.captures[0].id,
                    paymentDate: new Date()
                }
            });
        }

        // Redirect user to a frontend success page or dashboard
        res.redirect('/payment-success.html');
    } catch (error) {
        console.error('Capture PayPal order error:', error.response?.data || error.message || error);
        res.status(500).send('Payment capture failed');
    }
});

// Registration endpoint
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password, phoneNumber } = req.body;
        console.log('Registration request received:', { name, email, phoneNumber }); // Debug log

        // Validate input
        if (!name || !email || !password || !phoneNumber) {
            console.log('Validation failed: Missing fields'); // Debug log
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('User already exists:', email); // Debug log
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create new user
        const user = new User({
            name,
            email,
            password: hashedPassword,
            phoneNumber,
            paymentStatus: 'pending'
        });

        await user.save();

        // Create JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.status(201).json({
            userId: user._id,
            token,
            message: 'Registration successful'
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Registration failed' });
    }
});

// PayPal payment verification endpoint
app.post('/api/payment-webhook', async (req, res) => {
    try {
        const { userId, paymentId, orderID } = req.body;

        // Verify user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get PayPal access token
        const auth = Buffer.from(process.env.PAYPAL_CLIENT_ID + ':' + process.env.PAYPAL_CLIENT_SECRET).toString('base64');
        const tokenResponse = await fetch('https://api-m.paypal.com/v1/oauth2/token', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'grant_type=client_credentials'
        });

        const tokenData = await tokenResponse.json();

        // Verify payment with PayPal
        const response = await fetch(`https://api-m.paypal.com/v2/checkout/orders/${orderID}`, {
            headers: {
                'Authorization': `Bearer ${tokenData.access_token}`
            }
        });

        const paymentData = await response.json();

        if (paymentData.status === 'COMPLETED') {
            // Update user payment status
            user.paymentStatus = 'completed';
            user.active = true;
            user.paymentDetails = {
                paymentId,
                orderID,
                amount: 1.00,
                currency: 'INR',
                paymentDate: new Date()
            };

            await user.save();

            res.json({ 
                success: true, 
                message: 'Payment verified successfully',
                redirect: '/dashboard.html'
            });
        } else {
            res.status(400).json({ 
                success: false, 
                message: 'Payment verification failed'
            });
        }
    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Payment verification failed'
        });
    }
});

// Authentication middleware
const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Authentication failed' });
    }
};

// (The CORS, json and static middleware are already configured above.)
app.use(express.urlencoded({ extended: true }));

// File upload setup
const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/resumes');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// Simple Admin Authentication Middleware (for demo purposes)
const adminAuth = async (req, res, next) => {
    // For demonstration purposes, we'll use a simple admin password
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    // Check for admin password in query parameter
    if (req.query.adminKey === adminPassword) {
        next();
    } else {
        res.status(401).json({ message: 'Admin authentication required' });
    }
};

// Recruiter Schema
const recruiterSchema = new mongoose.Schema({
    company: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});
const Recruiter = mongoose.model('Recruiter', recruiterSchema);

// Job Schema
const jobSchema = new mongoose.Schema({
    recruiter: { type: mongoose.Schema.Types.ObjectId, ref: 'Recruiter', required: true },
    title: String,
    location: String,
    description: String,
    skills: [String],
    applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    status: { type: String, default: 'Open' },
    createdAt: { type: Date, default: Date.now }
});
const Job = mongoose.model('Job', jobSchema);

// Recruiter Auth Middleware
const recruiterAuth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'No token provided' });
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const recruiter = await Recruiter.findById(decoded.recruiterId);
        if (!recruiter) return res.status(401).json({ message: 'Invalid token' });
        req.recruiter = recruiter;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Authentication failed' });
    }
};

// Recruiter Registration
app.post('/api/recruiter/register', async (req, res) => {
    try {
        const { company, email, password } = req.body;
        const existing = await Recruiter.findOne({ email });
        if (existing) return res.status(400).json({ message: 'Recruiter already exists' });
        const hashed = await bcrypt.hash(password, 10);
        const recruiter = new Recruiter({ company, email, password: hashed });
        await recruiter.save();
        res.status(201).json({ message: 'Recruiter registered' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Recruiter Login
app.post('/api/recruiter/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const recruiter = await Recruiter.findOne({ email });
        if (!recruiter) return res.status(401).json({ message: 'Invalid credentials' });
        const valid = await bcrypt.compare(password, recruiter.password);
        if (!valid) return res.status(401).json({ message: 'Invalid credentials' });
        const token = jwt.sign({ recruiterId: recruiter._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, company: recruiter.company });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Recruiter: Post Job
app.post('/api/recruiter/jobs', recruiterAuth, async (req, res) => {
    try {
        const { title, location, description, skills } = req.body;
        const job = new Job({
            recruiter: req.recruiter._id,
            title,
            location,
            description,
            skills
        });
        await job.save();
        res.status(201).json(job);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Recruiter: List Own Jobs
app.get('/api/recruiter/jobs', recruiterAuth, async (req, res) => {
    try {
        const jobs = await Job.find({ recruiter: req.recruiter._id }).populate('applicants', 'name email skills');
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Recruiter: Delete Job
app.delete('/api/recruiter/jobs/:id', recruiterAuth, async (req, res) => {
    try {
        await Job.deleteOne({ _id: req.params.id, recruiter: req.recruiter._id });
        res.json({ message: 'Job deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Recruiter: View Applicants for a Job
app.get('/api/recruiter/jobs/:id/applicants', recruiterAuth, async (req, res) => {
    try {
        const job = await Job.findOne({ _id: req.params.id, recruiter: req.recruiter._id }).populate('applicants', 'name email skills resume');
        if (!job) return res.status(404).json({ message: 'Job not found' });
        res.json(job.applicants);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Student: Apply to Job
app.post('/api/jobs/:id/apply', async (req, res) => {
    try {
        const { userId } = req.body;
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });
        if (!job.applicants.includes(userId)) {
            job.applicants.push(userId);
            await job.save();
        }
        res.json({ message: 'Applied successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Registration endpoint
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password, userType } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create new user
        const user = new User({
            name,
            email,
            password: hashedPassword,
            userType: userType || 'user'
        });

        await user.save();

        // Create JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            userId: user._id,
            token
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.json({
            token,
            userId: user._id,
            name: user.name
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// Get available courses
app.get('/api/courses', authMiddleware, async (req, res) => {
    try {
        const courses = await Course.find();
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching courses' });
    }
});

// Get available scholarships
app.get('/api/scholarships', authMiddleware, async (req, res) => {
    try {
        const scholarships = await Scholarship.find();
        res.json(scholarships);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching scholarships' });
    }
});

// Enroll in a course
app.post('/api/courses/:id/enroll', authMiddleware, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (!req.user.paymentStatus) {
            return res.status(403).json({ message: 'Please complete your payment first' });
        }

        if (course.enrolledStudents.includes(req.user._id)) {
            return res.status(400).json({ message: 'Already enrolled in this course' });
        }

        course.enrolledStudents.push(req.user._id);
        req.user.enrolledCourses.push(course._id);

        await Promise.all([course.save(), req.user.save()]);
        res.json({ message: 'Successfully enrolled in course' });
    } catch (error) {
        res.status(500).json({ message: 'Error enrolling in course' });
    }
});

// Apply for scholarship
app.post('/api/scholarships/:id/apply', authMiddleware, async (req, res) => {
    try {
        const scholarship = await Scholarship.findById(req.params.id);
        if (!scholarship) {
            return res.status(404).json({ message: 'Scholarship not found' });
        }

        if (scholarship.status === 'Closed') {
            return res.status(400).json({ message: 'Scholarship applications are closed' });
        }

        if (scholarship.applicants.includes(req.user._id)) {
            return res.status(400).json({ message: 'Already applied for this scholarship' });
        }

        scholarship.applicants.push(req.user._id);
        req.user.appliedScholarships.push(scholarship._id);

        await Promise.all([scholarship.save(), req.user.save()]);
        res.json({ message: 'Successfully applied for scholarship' });
    } catch (error) {
        res.status(500).json({ message: 'Error applying for scholarship' });
    }
});

// Routes

// Payment webhook
app.post('/api/payment-webhook', async (req, res) => {
    try {
        const { userId, paymentId } = req.body;
        
        // Update user payment status
        await User.findByIdAndUpdate(userId, {
            paymentStatus: true
        });

        res.status(200).json({ message: 'Payment status updated' });
    } catch (error) {
        console.error('Payment webhook error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin Schema
const adminSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true }
});

const Admin = mongoose.model('Admin', adminSchema);

// Admin Routes
app.post('/api/admin/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await Admin.findOne({ email });

        if (!admin) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isValidPassword = await bcrypt.compare(password, admin.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { adminId: admin._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ token, name: admin.name });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Protected Admin Routes
app.get('/api/admin/dashboard', adminAuth, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalCourses = await Course.countDocuments();
        const totalJobs = await Job.countDocuments();
        const totalScholarships = await Scholarship.countDocuments();

        const recentActivity = await Activity.find()
            .sort({ timestamp: -1 })
            .limit(10);

        res.json({
            totalUsers,
            totalCourses,
            totalJobs,
            totalScholarships,
            recentActivity
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Course Management
app.get('/api/admin/courses', adminAuth, async (req, res) => {
    try {
        const courses = await Course.find();
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/admin/courses', adminAuth, async (req, res) => {
    try {
        const course = new Course(req.body);
        await course.save();
        res.status(201).json(course);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.put('/api/admin/courses/:id', adminAuth, async (req, res) => {
    try {
        const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(course);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.delete('/api/admin/courses/:id', adminAuth, async (req, res) => {
    try {
        await Course.findByIdAndDelete(req.params.id);
        res.json({ message: 'Course deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Similar routes for Freelancing, Scholarships, and Jobs
// ... (implement similar CRUD operations for other sections)

// Admin Routes
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// API endpoint to get all users
app.get('/api/admin/users', adminAuth, async (req, res) => {
    try {
        console.log('Fetching users...');
        const users = await User.find({})
            .select('-password') // Exclude password from the response
            .sort({ registrationDate: -1 }); // Sort by registration date, newest first
        
        console.log('Found users:', users.length);
        
        // Check MongoDB connection status
        const dbState = mongoose.connection.readyState;
        console.log('MongoDB connection state:', dbState);
        // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting

        if (dbState !== 1) {
            throw new Error('MongoDB not connected. Current state: ' + dbState);
        }

        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ 
            message: 'Error fetching users',
            error: error.message,
            mongoState: mongoose.connection.readyState 
        });
    }
});

const PORT = process.env.PORT || 3000;
// In production we bind to 0.0.0.0 by default so the host accepts external requests
const BIND_HOST = process.env.BIND_HOST || '0.0.0.0';
const mainServer = app.listen(PORT, BIND_HOST, () => {
    const addr = mainServer.address();
    console.log(`Server listening - address info:`, addr);
    console.log(`Server running on http://${addr.address}:${addr.port}`);
    console.log(`Process PID: ${process.pid}`);
});

// Convenience: also listen on port 5500 when working locally so frontend dev URLs like
// http://localhost:5500/Index.html work without a separate static server. Only enable
// if 5500 is different from PORT to avoid EADDRINUSE.
// Removed the extra dev listener (port 5500) to avoid local binding/networking issues.
// Use the main server (PORT, default 3000) which serves `Index.html` at /

// Global error handlers to capture unexpected failures and log them to the console
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, p) => {
    console.error('Unhandled Rejection at:', p, 'reason:', reason);
});

// Developer convenience route: serve the project root Index.html directly
app.get(['/Index.html', '/index.html', '/'], (req, res) => {
    const path = require('path');
    res.sendFile(path.join(__dirname, 'Index.html'));
});