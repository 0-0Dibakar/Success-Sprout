const express = require('express');
const router = express.Router();
const scholarshipController = require('../controllers/scholarshipController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Public routes
router.get('/', scholarshipController.getAllScholarships);
router.get('/:id', scholarshipController.getScholarshipById);

// Protected routes (students)
router.post('/:id/apply', authMiddleware, scholarshipController.applyScholarship);
router.get('/student/my-applications', authMiddleware, scholarshipController.getAppliedScholarships);

// Admin routes
router.post('/', authMiddleware, adminMiddleware, scholarshipController.createScholarship);
router.put('/:id', authMiddleware, adminMiddleware, scholarshipController.updateScholarship);
router.delete('/:id', authMiddleware, adminMiddleware, scholarshipController.deleteScholarship);

module.exports = router;
