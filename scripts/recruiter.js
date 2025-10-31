// Recruiter Dashboard Logic
function checkRecruiterAuth() {
    const token = localStorage.getItem('recruiterToken');
    if (!token) {
        window.location.href = 'login.html';
    }
}

function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
}

async function loadJobs() {
    const token = localStorage.getItem('recruiterToken');
    const response = await fetch('/api/recruiter/jobs', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const jobs = await response.json();
    const tbody = document.querySelector('#jobsTable tbody');
    tbody.innerHTML = '';
    jobs.forEach(job => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${job.title}</td>
            <td>${job.location}</td>
            <td><button onclick="viewApplicants('${job._id}', '${job.title}')">${job.applicants.length} View</button></td>
            <td>${job.status}</td>
            <td><button onclick="deleteJob('${job._id}')">Delete</button></td>
        `;
        tbody.appendChild(row);
    });
}

async function postJob(event) {
    event.preventDefault();
    const token = localStorage.getItem('recruiterToken');
    const job = {
        title: document.getElementById('jobTitle').value,
        location: document.getElementById('jobLocation').value,
        description: document.getElementById('jobDescription').value,
        skills: document.getElementById('jobSkills').value.split(',').map(s => s.trim())
    };
    const response = await fetch('/api/recruiter/jobs', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(job)
    });
    if (response.ok) {
        showSection('jobs');
        loadJobs();
    } else {
        alert('Failed to post job');
    }
}

async function viewApplicants(jobId, jobTitle) {
    showSection('applicants');
    document.getElementById('jobTitleHeader').textContent = jobTitle;
    const token = localStorage.getItem('recruiterToken');
    const response = await fetch(`/api/recruiter/jobs/${jobId}/applicants`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const applicants = await response.json();
    const tbody = document.querySelector('#applicantsTable tbody');
    tbody.innerHTML = '';
    applicants.forEach(app => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${app.name}</td>
            <td>${app.email}</td>
            <td>${app.skills ? app.skills.join(', ') : ''}</td>
            <td>${app.resume ? `<a href="${app.resume}" target="_blank">View</a>` : 'N/A'}</td>
        `;
        tbody.appendChild(row);
    });
}

async function deleteJob(jobId) {
    const token = localStorage.getItem('recruiterToken');
    const response = await fetch(`/api/recruiter/jobs/${jobId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.ok) {
        loadJobs();
    } else {
        alert('Failed to delete job');
    }
}

function handleLogout() {
    localStorage.removeItem('recruiterToken');
    window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', () => {
    checkRecruiterAuth();
    loadJobs();
    document.getElementById('postJobForm').addEventListener('submit', postJob);
});