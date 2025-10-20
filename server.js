require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

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

// Admin Authentication Middleware
const adminAuth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const admin = await Admin.findById(decoded.adminId);
        if (!admin) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        req.admin = admin;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Authentication failed' });
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

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/success-sprout', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// User Schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    paymentStatus: { type: Boolean, default: false },
    registrationDate: { type: Date, default: Date.now },
    skills: [{ type: String }],
    resume: { type: String }
});

const User = mongoose.model('User', userSchema);

// Routes
app.post('/api/register', upload.single('resume'), async (req, res) => {
    try {
        const { name, email, password, skills } = req.body;
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        // Parse skills
        let skillsArr = [];
        if (skills) {
            if (Array.isArray(skills)) {
                skillsArr = skills;
            } else {
                skillsArr = skills.split(',').map(s => s.trim()).filter(Boolean);
            }
        }
        // Handle resume file
        let resumePath = undefined;
        if (req.file) {
            resumePath = '/resumes/' + req.file.filename;
        }
        // Create new user
        const user = new User({
            name,
            email,
            password: hashedPassword,
            skills: skillsArr,
            resume: resumePath
        });
        await user.save();
        // Create JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'your-default-secret',
            { expiresIn: '24h' }
        );
        res.status(201).json({ 
            message: 'Registration successful',
            token,
            userId: user._id
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});