// DOM Elements
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the student management system
    initializeStudentSystem();
});

// Storage Keys
const STORAGE_KEY = 'studentManagementSystem';

// Global variables
let students = [];
let currentStudentId = null;

// Initialize the system
function initializeStudentSystem() {
    // Load data from local storage
    loadStudents();
    
    // Render students
    renderStudents();
    
    // Set up event listeners
    setupEventListeners();
}

// Load students from local storage
function loadStudents() {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
        students = JSON.parse(storedData);
    }
}

// Save students to local storage
function saveStudents() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
}

// Set up event listeners
function setupEventListeners() {
    // Enroll new student
    document.getElementById('enroll-btn').addEventListener('click', openEnrollModal);
    document.getElementById('save-student').addEventListener('click', saveStudent);
    
    // Assign mentor
    document.getElementById('assign-mentor-btn').addEventListener('click', openMentorModal);
    document.getElementById('save-mentor').addEventListener('click', assignMentor);
    
    // Approve leave
    document.getElementById('approve-leave-btn').addEventListener('click', openLeaveModal);
    document.getElementById('save-leave').addEventListener('click', approveLeave);
    
    // Assign course
    document.getElementById('assign-course-btn').addEventListener('click', openCourseModal);
    document.getElementById('save-course').addEventListener('click', assignCourse);
    
    // Update student
    document.getElementById('update-student').addEventListener('click', updateStudent);
    
    // Search functionality
    document.getElementById('search-input').addEventListener('input', searchStudents);
    
    // Close all modals when clicking on X or Cancel buttons
    const closeButtons = document.querySelectorAll('.close-btn');
    closeButtons.forEach(button => {
        button.addEventListener('click', closeModals);
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            closeModals();
        }
    });
}

// Render students in the UI
function renderStudents() {
    const studentList = document.getElementById('student-list');
    
    // Clear the list
    studentList.innerHTML = '';
    
    // Show empty state if no students
    if (students.length === 0) {
        studentList.innerHTML = `
            <div class="empty-state">
                <h3>No students found</h3>
                <p>Enroll new students to get started</p>
                <button class="btn btn-primary" onclick="openEnrollModal()">Enroll New Student</button>
            </div>
        `;
        return;
    }
    
    // Render each student
    students.forEach(student => {
        const studentCard = document.createElement('div');
        studentCard.className = 'student-card';
        
        // Create student info HTML
        studentCard.innerHTML = `
            <div class="student-header">
                <div class="student-title">${student.name}</div>
                <div class="student-actions">
                    <button class="btn btn-secondary edit-btn" data-id="${student.id}">Edit</button>
                    <button class="btn btn-danger delete-btn" data-id="${student.id}">Delete</button>
                </div>
            </div>
            <div class="student-info">
                <div class="info-item">
                    <div class="info-label">Student ID</div>
                    <div class="info-value">${student.id}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Email</div>
                    <div class="info-value">${student.email}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Department</div>
                    <div class="info-value">${student.department}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Year</div>
                    <div class="info-value">${getYearText(student.year)}</div>
                </div>
            </div>
        `;
        
        // Add mentor details if assigned
        if (student.mentor) {
            studentCard.innerHTML += `
                <div class="details-section">
                    <div class="detail-header">Assigned Mentor</div>
                    <div class="detail-items">
                        <div class="detail-item">${student.mentor.name} (${student.mentor.department})</div>
                    </div>
                </div>
            `;
        }
        
        // Add course details if assigned
        if (student.courses && student.courses.length > 0) {
            const coursesList = student.courses.map(course => 
                `<div class="detail-item">${course.name} (${course.id})</div>`
            ).join('');
            
            studentCard.innerHTML += `
                <div class="details-section">
                    <div class="detail-header">Assigned Courses</div>
                    <div class="detail-items">
                        ${coursesList}
                    </div>
                </div>
            `;
        }
        
        // Add leave requests if any
        if (student.leaves && student.leaves.length > 0) {
            const leavesList = student.leaves.map(leave => {
                let statusClass = '';
                if (leave.status === 'approved') statusClass = 'status-active';
                else if (leave.status === 'pending') statusClass = 'status-pending';
                else statusClass = 'status-inactive';
                
                return `<div class="detail-item">
                    ${formatDate(leave.start)} to ${formatDate(leave.end)}
                    <span class="status ${statusClass}">${leave.status}</span>
                </div>`;
            }).join('');
            
            studentCard.innerHTML += `
                <div class="details-section">
                    <div class="detail-header">Leave Requests</div>
                    <div class="detail-items">
                        ${leavesList}
                    </div>
                </div>
            `;
        }
        
        studentList.appendChild(studentCard);
    });
    
    // Add event listeners for edit and delete buttons
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', function() {
            const studentId = this.getAttribute('data-id');
            openEditModal(studentId);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', function() {
            const studentId = this.getAttribute('data-id');
            deleteStudent(studentId);
        });
    });
}

// Open enroll student modal
function openEnrollModal() {
    document.getElementById('enroll-modal').style.display = 'block';
    document.getElementById('enroll-form').reset();
}

// Save new student
function saveStudent() {
    const id = document.getElementById('student-id').value;
    const name = document.getElementById('student-name').value;
    const email = document.getElementById('student-email').value;
    const department = document.getElementById('student-department').value;
    const year = document.getElementById('student-year').value;
    
    // Validate form
    if (!id || !name || !email || !department || !year) {
        alert('Please fill all fields');
        return;
    }
    
    // Check if ID already exists
    if (students.some(student => student.id === id)) {
        alert('Student ID already exists');
        return;
    }
    
    // Create new student object
    const newStudent = {
        id,
        name,
        email,
        department,
        year,
        courses: [],
        leaves: []
    };
    
    // Add to students array
    students.push(newStudent);
    
    // Save to local storage
    saveStudents();
    
    // Close modal and update UI
    closeModals();
    renderStudents();
}

// Open assign mentor modal
function openMentorModal() {
    const mentorModal = document.getElementById('mentor-modal');
    const studentSelect = document.getElementById('student-select');
    
    // Clear previous options
    studentSelect.innerHTML = '<option value="">Select Student</option>';
    
    // Add student options
    students.forEach(student => {
        const option = document.createElement('option');
        option.value = student.id;
        option.textContent = `${student.name} (${student.id})`;
        studentSelect.appendChild(option);
    });
    
    mentorModal.style.display = 'block';
}

// Assign mentor to student
function assignMentor() {
    const studentId = document.getElementById('student-select').value;
    const mentorName = document.getElementById('mentor-name').value;
    const mentorDepartment = document.getElementById('mentor-department').value;
    
    // Validate form
    if (!studentId || !mentorName || !mentorDepartment) {
        alert('Please fill all fields');
        return;
    }// Find the student and assign mentor
    const studentIndex = students.findIndex(student => student.id === studentId);
    if (studentIndex !== -1) {
        students[studentIndex].mentor = {
            name: mentorName,
            department: mentorDepartment
        };
        
        // Save to local storage
        saveStudents();
        
        // Close modal and update UI
        closeModals();
        renderStudents();
    }
}

// Open approve leave modal
function openLeaveModal() {
    const leaveModal = document.getElementById('leave-modal');
    const studentSelect = document.getElementById('leave-student-select');
    
    // Clear previous options
    studentSelect.innerHTML = '<option value="">Select Student</option>';
    
    // Add student options
    students.forEach(student => {
        const option = document.createElement('option');
        option.value = student.id;
        option.textContent = `${student.name} (${student.id})`;
        studentSelect.appendChild(option);
    });
    
    leaveModal.style.display = 'block';
}

// Approve leave request
function approveLeave() {
    const studentId = document.getElementById('leave-student-select').value;
    const startDate = document.getElementById('leave-start').value;
    const endDate = document.getElementById('leave-end').value;
    const reason = document.getElementById('leave-reason').value;
    const status = document.getElementById('leave-status').value;
    
    // Validate form
    if (!studentId || !startDate || !endDate || !reason || !status) {
        alert('Please fill all fields');
        return;
    }
    
    // Find the student and add leave request
    const studentIndex = students.findIndex(student => student.id === studentId);
    if (studentIndex !== -1) {
        // Initialize leaves array if it doesn't exist
        if (!students[studentIndex].leaves) {
            students[studentIndex].leaves = [];
        }
        
        // Add new leave request
        students[studentIndex].leaves.push({
            start: startDate,
            end: endDate,
            reason: reason,
            status: status
        });
        
        // Save to local storage
        saveStudents();
        
        // Close modal and update UI
        closeModals();
        renderStudents();
    }
}

// Open assign course modal
function openCourseModal() {
    const courseModal = document.getElementById('course-modal');
    const studentSelect = document.getElementById('course-student-select');
    
    // Clear previous options
    studentSelect.innerHTML = '<option value="">Select Student</option>';
    
    // Add student options
    students.forEach(student => {
        const option = document.createElement('option');
        option.value = student.id;
        option.textContent = `${student.name} (${student.id})`;
        studentSelect.appendChild(option);
    });
    
    courseModal.style.display = 'block';
}

// Assign course to student
function assignCourse() {
    const studentId = document.getElementById('course-student-select').value;
    const courseId = document.getElementById('course-id').value;
    const courseName = document.getElementById('course-name').value;
    const instructor = document.getElementById('course-instructor').value;
    
    // Validate form
    if (!studentId || !courseId || !courseName || !instructor) {
        alert('Please fill all fields');
        return;
    }
    
    // Find the student and assign course
    const studentIndex = students.findIndex(student => student.id === studentId);
    if (studentIndex !== -1) {
        // Initialize courses array if it doesn't exist
        if (!students[studentIndex].courses) {
            students[studentIndex].courses = [];
        }
        
        // Check if course already assigned
        if (students[studentIndex].courses.some(course => course.id === courseId)) {
            alert('This course is already assigned to the student');
            return;
        }
        
        // Add new course
        students[studentIndex].courses.push({
            id: courseId,
            name: courseName,
            instructor: instructor
        });
        
        // Save to local storage
        saveStudents();
        
        // Close modal and update UI
        closeModals();
        renderStudents();
    }
}

// Open edit student modal
function openEditModal(studentId) {
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    
    // Set current student ID
    currentStudentId = studentId;
    
    // Fill form with student data
    document.getElementById('edit-student-name').value = student.name;
    document.getElementById('edit-student-email').value = student.email;
    document.getElementById('edit-student-department').value = student.department;
    document.getElementById('edit-student-year').value = student.year;
    
    // Show modal
    document.getElementById('edit-modal').style.display = 'block';
}

// Update student
function updateStudent() {
    if (!currentStudentId) return;
    
    const name = document.getElementById('edit-student-name').value;
    const email = document.getElementById('edit-student-email').value;
    const department = document.getElementById('edit-student-department').value;
    const year = document.getElementById('edit-student-year').value;
    
    // Validate form
    if (!name || !email || !department || !year) {
        alert('Please fill all fields');
        return;
    }
    
    // Find and update student
    const studentIndex = students.findIndex(student => student.id === currentStudentId);
    if (studentIndex !== -1) {
        students[studentIndex].name = name;
        students[studentIndex].email = email;
        students[studentIndex].department = department;
        students[studentIndex].year = year;
        
        // Save to local storage
        saveStudents();
        
        // Reset current student ID
        currentStudentId = null;
        
        // Close modal and update UI
        closeModals();
        renderStudents();
    }
}

// Delete student
function deleteStudent(studentId) {
    if (confirm('Are you sure you want to delete this student?')) {
        // Remove student from array
        students = students.filter(student => student.id !== studentId);
        
        // Save to local storage
        saveStudents();
        
        // Update UI
        renderStudents();
    }
}

// Search students
function searchStudents() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    
    if (!searchTerm) {
        renderStudents();
        return;
    }
    
    // Filter students based on search term
    const filteredStudents = students.filter(student => 
        student.name.toLowerCase().includes(searchTerm) || 
        student.id.toLowerCase().includes(searchTerm) || 
        student.email.toLowerCase().includes(searchTerm) || 
        student.department.toLowerCase().includes(searchTerm)
    );
    
    // Temporarily update the students list for rendering
    const originalStudents = [...students];
    students = filteredStudents;
    
    // Render filtered students
    renderStudents();
    
    // Restore original students list
    students = originalStudents;
}

// Close all modals
function closeModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.style.display = 'none';
    });
    
    // Clear any form errors or highlighted fields
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.reset();
    });
}

// Helper functions
function getYearText(year) {
    const yearMap = {
        '1': 'First Year',
        '2': 'Second Year',
        '3': 'Third Year',
        '4': 'Fourth Year'
    };
    return yearMap[year] || year;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

// Additional function to populate student dropdowns
function populateStudentDropdowns() {
    const dropdowns = [
        document.getElementById('student-select'),
        document.getElementById('leave-student-select'),
        document.getElementById('course-student-select')
    ];
    
    dropdowns.forEach(dropdown => {
        if (dropdown) {
            // Clear previous options
            dropdown.innerHTML = '<option value="">Select Student</option>';
            
            // Add student options
            students.forEach(student => {
                const option = document.createElement('option');
                option.value = student.id;
                option.textContent = `${student.name} (${student.id})`;
                dropdown.appendChild(option);
            });
        }
    });
}