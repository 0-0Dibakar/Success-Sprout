const Course = require('../models/Course');

// Create Course (Admin)
exports.createCourse = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      instructor,
      duration,
      level,
      price,
      image,
      modules,
      skills,
      prerequisites,
    } = req.body;

    if (!title || !description || !category || !instructor || !duration) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const course = new Course({
      title,
      description,
      category,
      instructor,
      duration,
      level,
      price,
      image,
      modules,
      skills,
      prerequisites,
      isPublished: true,
    });

    await course.save();
    res.status(201).json({ message: 'Course created successfully', course });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get All Courses
exports.getAllCourses = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, level, search } = req.query;
    const skip = (page - 1) * limit;

    let query = { isPublished: true };

    if (category) query.category = category;
    if (level) query.level = level;
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
      ];
    }

    const total = await Course.countDocuments(query);
    const courses = await Course.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.json({
      courses,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get Single Course
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('students', 'name email');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json(course);
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Enroll in Course
exports.enrollCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if already enrolled
    if (course.students.includes(req.user.id)) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    course.students.push(req.user.id);
    await course.save();

    res.json({ message: 'Successfully enrolled in course', course });
  } catch (error) {
    console.error('Enroll course error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update Course (Admin)
exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json({ message: 'Course updated successfully', course });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Delete Course (Admin)
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get Enrolled Courses (Student)
exports.getEnrolledCourses = async (req, res) => {
  try {
    const courses = await Course.find({ students: req.user.id });
    res.json(courses);
  } catch (error) {
    console.error('Get enrolled courses error:', error);
    res.status(500).json({ message: error.message });
  }
};
