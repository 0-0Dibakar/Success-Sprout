// Check authentication
function checkAuth() {
    const token = localStorage.getItem('adminToken');
    if (!token) {
        window.location.href = 'login.html';
    }
}

// Load initial data
async function loadDashboardData() {
    try {
        const response = await fetch('/api/admin/dashboard', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        const data = await response.json();
        
        // Update stats
        document.getElementById('totalUsers').textContent = data.totalUsers;
        document.getElementById('totalCourses').textContent = data.totalCourses;
        document.getElementById('totalJobs').textContent = data.totalJobs;
        document.getElementById('totalScholarships').textContent = data.totalScholarships;
        
        // Load recent activity
        loadRecentActivity(data.recentActivity);
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

// Navigation
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionId).classList.add('active');
    
    // Update navigation
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`[href="#${sectionId}"]`).classList.add('active');
    
    // Load section data
    loadSectionData(sectionId);
}

// Load section specific data
async function loadSectionData(section) {
    try {
        const response = await fetch(`/api/admin/${section}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        const data = await response.json();
        
        switch(section) {
            case 'courses':
                loadCoursesTable(data);
                break;
            case 'freelancing':
                loadFreelancingTable(data);
                break;
            case 'scholarships':
                loadScholarshipsTable(data);
                break;
            case 'jobs':
                loadJobsTable(data);
                break;
            case 'users':
                loadUsersTable(data);
                break;
        }
    } catch (error) {
        console.error(`Error loading ${section} data:`, error);
    }
}

// Modal handlers
function showAddCourseModal() {
    const modal = document.getElementById('addCourseModal');
    modal.style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Course management
async function addCourse(event) {
    event.preventDefault();
    
    const formData = new FormData();
    formData.append('title', document.getElementById('courseTitle').value);
    formData.append('instructor', document.getElementById('courseInstructor').value);
    formData.append('price', document.getElementById('coursePrice').value);
    formData.append('description', document.getElementById('courseDescription').value);
    formData.append('image', document.getElementById('courseImage').files[0]);

    try {
        const response = await fetch('/api/admin/courses', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            },
            body: formData
        });
        
        if (response.ok) {
            closeModal('addCourseModal');
            loadSectionData('courses');
        } else {
            throw new Error('Failed to add course');
        }
    } catch (error) {
        console.error('Error adding course:', error);
        alert('Failed to add course. Please try again.');
    }
}

// Table loaders
function loadCoursesTable(data) {
    const tbody = document.querySelector('#coursesTable tbody');
    tbody.innerHTML = '';
    
    data.forEach(course => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${course.title}</td>
            <td>${course.instructor}</td>
            <td>₹${course.price}</td>
            <td>${course.students}</td>
            <td><span class="status ${course.status.toLowerCase()}">${course.status}</span></td>
            <td>
                <button onclick="editCourse(${course.id})"><i class="fas fa-edit"></i></button>
                <button onclick="deleteCourse(${course.id})"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Logout handler
function handleLogout() {
    localStorage.removeItem('adminToken');
    window.location.href = 'login.html';
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadDashboardData();
    
    // Add event listeners
    document.querySelector('.close').addEventListener('click', () => closeModal('addCourseModal'));
    document.getElementById('addCourseForm').addEventListener('submit', addCourse);
});