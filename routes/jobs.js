const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { authMiddleware, recruiterMiddleware } = require('../middleware/auth');

// Public routes
router.get('/', jobController.getAllJobs);
router.get('/:id', jobController.getJobById);

// Protected routes (students)
router.post('/:id/apply', authMiddleware, jobController.applyJob);

// Recruiter routes
router.post('/', authMiddleware, recruiterMiddleware, jobController.createJob);
router.put('/:id', authMiddleware, recruiterMiddleware, jobController.updateJob);
router.delete('/:id', authMiddleware, recruiterMiddleware, jobController.deleteJob);
router.get('/recruiter/my-jobs', authMiddleware, recruiterMiddleware, jobController.getRecruiterJobs);

module.exports = router;
