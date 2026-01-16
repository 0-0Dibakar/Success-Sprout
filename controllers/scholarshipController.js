const Scholarship = require('../models/Scholarship');

// Create Scholarship (Admin)
exports.createScholarship = async (req, res) => {
  try {
    const {
      title,
      description,
      amount,
      currency,
      provider,
      eligibility,
      deadline,
      link,
      category,
    } = req.body;

    if (!title || !description || !amount || !provider || !deadline) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const scholarship = new Scholarship({
      title,
      description,
      amount,
      currency,
      provider,
      eligibility,
      deadline,
      link,
      category,
    });

    await scholarship.save();
    res.status(201).json({ message: 'Scholarship created successfully', scholarship });
  } catch (error) {
    console.error('Create scholarship error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get All Scholarships
exports.getAllScholarships = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search } = req.query;
    const skip = (page - 1) * limit;

    let query = { isActive: true };

    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
      ];
    }

    const total = await Scholarship.countDocuments(query);
    const scholarships = await Scholarship.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ deadline: 1 });

    res.json({
      scholarships,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get scholarships error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get Single Scholarship
exports.getScholarshipById = async (req, res) => {
  try {
    const scholarship = await Scholarship.findById(req.params.id).populate('applicants.student', 'name email');

    if (!scholarship) {
      return res.status(404).json({ message: 'Scholarship not found' });
    }

    res.json(scholarship);
  } catch (error) {
    console.error('Get scholarship error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Apply for Scholarship
exports.applyScholarship = async (req, res) => {
  try {
    const scholarship = await Scholarship.findById(req.params.id);

    if (!scholarship) {
      return res.status(404).json({ message: 'Scholarship not found' });
    }

    // Check if already applied
    const alreadyApplied = scholarship.applicants.some(
      (app) => app.student.toString() === req.user.id
    );

    if (alreadyApplied) {
      return res.status(400).json({ message: 'Already applied to this scholarship' });
    }

    scholarship.applicants.push({
      student: req.user.id,
      status: 'applied',
    });
    scholarship.applicationCount = scholarship.applicants.length;

    await scholarship.save();
    res.json({ message: 'Application submitted successfully', scholarship });
  } catch (error) {
    console.error('Apply scholarship error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update Scholarship (Admin)
exports.updateScholarship = async (req, res) => {
  try {
    const scholarship = await Scholarship.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!scholarship) {
      return res.status(404).json({ message: 'Scholarship not found' });
    }

    res.json({ message: 'Scholarship updated successfully', scholarship });
  } catch (error) {
    console.error('Update scholarship error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Delete Scholarship (Admin)
exports.deleteScholarship = async (req, res) => {
  try {
    const scholarship = await Scholarship.findByIdAndDelete(req.params.id);

    if (!scholarship) {
      return res.status(404).json({ message: 'Scholarship not found' });
    }

    res.json({ message: 'Scholarship deleted successfully' });
  } catch (error) {
    console.error('Delete scholarship error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get Applied Scholarships (Student)
exports.getAppliedScholarships = async (req, res) => {
  try {
    const scholarships = await Scholarship.find({
      'applicants.student': req.user.id,
    });

    res.json(scholarships);
  } catch (error) {
    console.error('Get applied scholarships error:', error);
    res.status(500).json({ message: error.message });
  }
};
