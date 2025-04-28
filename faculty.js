// DOM Elements
document.addEventListener('DOMContentLoaded', function() {
    // Tab Navigation
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    // Faculty Modal Elements
    const facultyModal = document.getElementById('facultyModal');
    const addFacultyBtn = document.getElementById('addFacultyBtn');
    const closeBtn = document.querySelector('.close-btn');
    const cancelBtn = document.getElementById('cancelBtn');
    const facultyForm = document.getElementById('facultyForm');
    const modalTitle = document.getElementById('modalTitle');
    
    // OD Modal Elements
    const odModal = document.getElementById('odModal');
    const addOdBtn = document.getElementById('addOdBtn');
    const closeOdModal = document.getElementById('closeOdModal');
    const cancelOdBtn = document.getElementById('cancelOdBtn');
    const odForm = document.getElementById('odForm');
    
    // Faculty Management Elements
    const searchInput = document.getElementById('searchInput');
    const facultyCards = document.getElementById('facultyCards');
    
    // Roles & Section Management Elements
    const roleInput = document.getElementById('roleInput');
    const addRoleBtn = document.getElementById('addRoleBtn');
    const rolesList = document.getElementById('rolesList');
    const sectionInput = document.getElementById('sectionInput');
    const addSectionBtn = document.getElementById('addSectionBtn');
    const sectionsList = document.getElementById('sectionsList');
    
    // OD & Attendance Management Elements
    const facultyOdFilter = document.getElementById('facultyOdFilter');
    const odDateFilter = document.getElementById('odDateFilter');
    const filterOdBtn = document.getElementById('filterOdBtn');
    const odTableBody = document.getElementById('odTableBody');
    const facultyAttendanceFilter = document.getElementById('facultyAttendanceFilter');
    const attendanceMonthFilter = document.getElementById('attendanceMonthFilter');
    const filterAttendanceBtn = document.getElementById('filterAttendanceBtn');
    const attendanceCalendar = document.getElementById('attendanceCalendar');
    
    // Stats Elements
    const presentCount = document.getElementById('presentCount');
    const absentCount = document.getElementById('absentCount');
    const odCount = document.getElementById('odCount');
    const attendancePercentage = document.getElementById('attendancePercentage');
    
    // Initialize Local Storage
    function initializeLocalStorage() {
        if (!localStorage.getItem('faculties')) {
            localStorage.setItem('faculties', JSON.stringify([]));
        }
        if (!localStorage.getItem('roles')) {
            localStorage.setItem('roles', JSON.stringify(['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer']));
        }
        if (!localStorage.getItem('sections')) {
            localStorage.setItem('sections', JSON.stringify(['CSE-A', 'CSE-B', 'IT-A', 'ECE-A', 'ECE-B']));
        }
        if (!localStorage.getItem('odEntries')) {
            localStorage.setItem('odEntries', JSON.stringify([]));
        }
        if (!localStorage.getItem('attendance')) {
            localStorage.setItem('attendance', JSON.stringify({}));
        }
    }
    
    // Tab Functionality
    function setupTabs() {
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all buttons and panes
                tabBtns.forEach(b => b.classList.remove('active'));
                tabPanes.forEach(p => p.classList.remove('active'));
                
                // Add active class to clicked button and corresponding pane
                btn.classList.add('active');
                const tabId = btn.getAttribute('data-tab');
                document.getElementById(tabId).classList.add('active');
            });
        });
    }
    
    // FACULTY CRUD OPERATIONS
    
    // Display Faculty Cards
    function displayFaculties(facultiesToDisplay = null) {
        facultyCards.innerHTML = '';
        let faculties = JSON.parse(localStorage.getItem('faculties'));
        
        if (facultiesToDisplay) {
            faculties = facultiesToDisplay;
        }
        
        if (faculties.length === 0) {
            facultyCards.innerHTML = '<div class="no-faculty">No faculty members found. Add a new faculty member to get started.</div>';
            return;
        }
        
        faculties.forEach(faculty => {
            const card = document.createElement('div');
            card.classList.add('faculty-card');
            card.innerHTML = `
                <div class="faculty-header">
                    <div class="faculty-avatar">
                        <i class="fas fa-user-tie"></i>
                    </div>
                    <div class="faculty-info">
                        <h3>${faculty.name}</h3>
                        <p>${faculty.designation}</p>
                    </div>
                </div>
                <div class="faculty-details">
                    <div class="faculty-detail">
                        <div class="detail-label">ID:</div>
                        <div class="detail-value">${faculty.id}</div>
                    </div>
                    <div class="faculty-detail">
                        <div class="detail-label">Department:</div>
                        <div class="detail-value">${faculty.department}</div>
                    </div>
                    <div class="faculty-detail">
                        <div class="detail-label">Email:</div>
                        <div class="detail-value">${faculty.email}</div>
                    </div>
                    <div class="faculty-detail">
                        <div class="detail-label">Phone:</div>
                        <div class="detail-value">${faculty.phone}</div>
                    </div>
                </div>
                <div class="faculty-actions">
                    <button class="edit-btn" data-id="${faculty.id}"><i class="fas fa-edit"></i> Edit</button>
                    <button class="delete-btn" data-id="${faculty.id}"><i class="fas fa-trash"></i> Delete</button>
                </div>
            `;
            facultyCards.appendChild(card);
        });
        
        // Add event listeners to edit and delete buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const facultyId = e.currentTarget.getAttribute('data-id');
                editFaculty(facultyId);
            });
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const facultyId = e.currentTarget.getAttribute('data-id');
                deleteFaculty(facultyId);
            });
        });
    }
    
    // Search Faculty
    function setupSearch() {
        searchInput.addEventListener('input', () => {
            const searchTerm = searchInput.value.toLowerCase();
            const faculties = JSON.parse(localStorage.getItem('faculties'));
            
            if (searchTerm === '') {
                displayFaculties();
                return;
            }
            
            const filteredFaculties = faculties.filter(faculty => 
                faculty.name.toLowerCase().includes(searchTerm) || 
                faculty.id.toLowerCase().includes(searchTerm) || 
                faculty.department.toLowerCase().includes(searchTerm) || 
                faculty.designation.toLowerCase().includes(searchTerm)
            );
            
            displayFaculties(filteredFaculties);
        });
    }
    
    // Add New Faculty
    function setupAddFaculty() {
        addFacultyBtn.addEventListener('click', () => {
            modalTitle.textContent = 'Add New Faculty';
            facultyForm.reset();
            facultyForm.removeAttribute('data-edit-id');
            facultyModal.style.display = 'block';
        });
    }
    
    // Edit Faculty
    function editFaculty(facultyId) {
        const faculties = JSON.parse(localStorage.getItem('faculties'));
        const faculty = faculties.find(f => f.id === facultyId);
        
        if (faculty) {
            modalTitle.textContent = 'Edit Faculty';
            document.getElementById('facultyId').value = faculty.id;
            document.getElementById('facultyName').value = faculty.name;
            document.getElementById('facultyDepartment').value = faculty.department;
            document.getElementById('facultyDesignation').value = faculty.designation;
            document.getElementById('facultyEmail').value = faculty.email;
            document.getElementById('facultyPhone').value = faculty.phone;
            
            facultyForm.setAttribute('data-edit-id', facultyId);
            facultyModal.style.display = 'block';
        }
    }
    
    // Delete Faculty
    function deleteFaculty(facultyId) {
        if (confirm('Are you sure you want to delete this faculty member?')) {
            let faculties = JSON.parse(localStorage.getItem('faculties'));
            faculties = faculties.filter(f => f.id !== facultyId);
            localStorage.setItem('faculties', JSON.stringify(faculties));
            
            // Remove related OD entries
            let odEntries = JSON.parse(localStorage.getItem('odEntries'));
            odEntries = odEntries.filter(entry => entry.facultyId !== facultyId);
            localStorage.setItem('odEntries', JSON.stringify(odEntries));
            
            // Remove attendance records
            let attendance = JSON.parse(localStorage.getItem('attendance'));
            if (attendance[facultyId]) {
                delete attendance[facultyId];
                localStorage.setItem('attendance', JSON.stringify(attendance));
            }
            
            displayFaculties();
            updateFacultyDropdowns();
        }
    }
    
    // Save Faculty (Add or Edit)
    function setupFacultyForm() {
        facultyForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const facultyData = {
                id: document.getElementById('facultyId').value,
                name: document.getElementById('facultyName').value,
                department: document.getElementById('facultyDepartment').value,
                designation: document.getElementById('facultyDesignation').value,
                email: document.getElementById('facultyEmail').value,
                phone: document.getElementById('facultyPhone').value
            };
            
            let faculties = JSON.parse(localStorage.getItem('faculties'));
            const editId = facultyForm.getAttribute('data-edit-id');
            
            if (editId) {
                // Edit existing faculty
                faculties = faculties.map(f => f.id === editId ? facultyData : f);
            } else {
                // Check if ID already exists
                const idExists = faculties.some(f => f.id === facultyData.id);
                if (idExists) {
                    alert('Faculty ID already exists. Please use a different ID.');
                    return;
                }
                
                // Add new faculty
                faculties.push(facultyData);
            }
            
            localStorage.setItem('faculties', JSON.stringify(faculties));
            facultyModal.style.display = 'none';
            displayFaculties();
            updateFacultyDropdowns();
        });
    }
    
    // Modal Controls
    function setupModalControls() {
        // Close modal when clicking the X
        closeBtn.addEventListener('click', () => {
            facultyModal.style.display = 'none';
        });
        
        // Close modal when clicking the Cancel button
        cancelBtn.addEventListener('click', () => {
            facultyModal.style.display = 'none';
        });
        
        // Close modal when clicking outside the modal content
        window.addEventListener('click', (e) => {
            if (e.target === facultyModal) {
                facultyModal.style.display = 'none';
            }
            if (e.target === odModal) {
                odModal.style.display = 'none';
            }
        });
        
        // Close OD modal when clicking the X
        closeOdModal.addEventListener('click', () => {
            odModal.style.display = 'none';
        });
        
        // Close OD modal when clicking the Cancel button
        cancelOdBtn.addEventListener('click', () => {
            odModal.style.display = 'none';
        });
    }
    
    // ROLES & SECTION MANAGEMENT
    
    // Display Roles
    function displayRoles() {
        rolesList.innerHTML = '';
        const roles = JSON.parse(localStorage.getItem('roles'));
        
        roles.forEach(role => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${role}</span>
                <div class="role-actions">
                    <button class="role-edit" data-role="${role}"><i class="fas fa-edit"></i></button>
                    <button class="role-delete" data-role="${role}"><i class="fas fa-trash"></i></button>
                </div>
            `;
            rolesList.appendChild(li);
        });
        
        // Add event listeners to edit and delete buttons
        document.querySelectorAll('.role-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const role = e.currentTarget.getAttribute('data-role');
                roleInput.value = role;
                roleInput.setAttribute('data-edit-role', role);
                addRoleBtn.textContent = 'Update Role';
            });
        });
        
        document.querySelectorAll('.role-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const role = e.currentTarget.getAttribute('data-role');
                deleteRole(role);
            });
        });
    }
    
    // Add/Edit Role
    function setupRoleManagement() {
        addRoleBtn.addEventListener('click', () => {
            const role = roleInput.value.trim();
            if (role === '') return;
            
            let roles = JSON.parse(localStorage.getItem('roles'));
            const editRole = roleInput.getAttribute('data-edit-role');
            
            if (editRole) {
                // Edit existing role
                roles = roles.map(r => r === editRole ? role : r);
                roleInput.removeAttribute('data-edit-role');
                addRoleBtn.textContent = 'Add Role';
            } else {
                // Check if role already exists
                if (roles.includes(role)) {
                    alert('This role already exists.');
                    return;
                }
                
                // Add new role
                roles.push(role);
            }
            
            localStorage.setItem('roles', JSON.stringify(roles));
            roleInput.value = '';
            displayRoles();
        });
    }
    
    // Delete Role
    function deleteRole(role) {
        if (confirm('Are you sure you want to delete this role?')) {
            let roles = JSON.parse(localStorage.getItem('roles'));
            roles = roles.filter(r => r !== role);
            localStorage.setItem('roles', JSON.stringify(roles));
            displayRoles();
        }
    }
    
    // Display Sections
    function displaySections() {
        sectionsList.innerHTML = '';
        const sections = JSON.parse(localStorage.getItem('sections'));
        
        sections.forEach(section => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${section}</span>
                <div class="section-actions">
                    <button class="section-edit" data-section="${section}"><i class="fas fa-edit"></i></button>
                    <button class="section-delete" data-section="${section}"><i class="fas fa-trash"></i></button>
                </div>
            `;
            sectionsList.appendChild(li);
        });
        
        // Add event listeners to edit and delete buttons
        document.querySelectorAll('.section-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.currentTarget.getAttribute('data-section');
                sectionInput.value = section;
                sectionInput.setAttribute('data-edit-section', section);
                addSectionBtn.textContent = 'Update Section';
            });
        });
        
        document.querySelectorAll('.section-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.currentTarget.getAttribute('data-section');
                deleteSection(section);
            });
        });
    }
    
    // Add/Edit Section
    function setupSectionManagement() {
        addSectionBtn.addEventListener('click', () => {
            const section = sectionInput.value.trim();
            if (section === '') return;
            
            let sections = JSON.parse(localStorage.getItem('sections'));
            const editSection = sectionInput.getAttribute('data-edit-section');
            
            if (editSection) {
                // Edit existing section
                sections = sections.map(s => s === editSection ? section : s);
                sectionInput.removeAttribute('data-edit-section');
                addSectionBtn.textContent = 'Add Section';
            } else {
                // Check if section already exists
                if (sections.includes(section)) {
                    alert('This section already exists.');
                    return;
                }
                
                // Add new section
                sections.push(section);
            }
            
            localStorage.setItem('sections', JSON.stringify(sections));
            sectionInput.value = '';
            displaySections();
        });
    }
    
    // Delete Section
    function deleteSection(section) {
        if (confirm('Are you sure you want to delete this section?')) {
            let sections = JSON.parse(localStorage.getItem('sections'));
            sections = sections.filter(s => s !== section);
            localStorage.setItem('sections', JSON.stringify(sections));
            displaySections();
        }
    }
    
    // OD & ATTENDANCE MANAGEMENT
    
    // Update Faculty Dropdowns
    function updateFacultyDropdowns() {
        const faculties = JSON.parse(localStorage.getItem('faculties'));
        
        // Clear existing options but keep the default one
        facultyOdFilter.innerHTML = '<option value="">Select Faculty...</option>';
        facultyAttendanceFilter.innerHTML = '<option value="">Select Faculty...</option>';
        const odFacultySelect = document.getElementById('odFaculty');
        if (odFacultySelect) {
            odFacultySelect.innerHTML = '<option value="">Select Faculty...</option>';
        }
        
        faculties.forEach(faculty => {
            const option1 = document.createElement('option');
            option1.value = faculty.id;
            option1.textContent = faculty.name;
            facultyOdFilter.appendChild(option1);
            
            const option2 = document.createElement('option');
            option2.value = faculty.id;
            option2.textContent = faculty.name;
            facultyAttendanceFilter.appendChild(option2);
            
            if (odFacultySelect) {
                const option3 = document.createElement('option');
                option3.value = faculty.id;
                option3.textContent = faculty.name;
                odFacultySelect.appendChild(option3);
            }
        });
    }
    
    // Display OD Entries
    function displayOdEntries(filteredEntries = null) {
        odTableBody.innerHTML = '';
        let odEntries = JSON.parse(localStorage.getItem('odEntries'));
        const faculties = JSON.parse(localStorage.getItem('faculties'));
        
        if (filteredEntries) {
            odEntries = filteredEntries;
        }
        
        if (odEntries.length === 0) {
            odTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No OD entries found.</td></tr>';
            return;
        }
        
        odEntries.forEach(entry => {
            const faculty = faculties.find(f => f.id === entry.facultyId) || { name: 'Unknown Faculty' };
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${faculty.name}</td>
                <td>${entry.date}</td>
                <td>${entry.reason}</td>
                <td><span class="status ${entry.status.toLowerCase()}">${entry.status}</span></td>
                <td>
                    <button class="approve-btn" data-id="${entry.id}" ${entry.status !== 'Pending' ? 'disabled' : ''}>
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="reject-btn" data-id="${entry.id}" ${entry.status !== 'Pending' ? 'disabled' : ''}>
                        <i class="fas fa-times"></i>
                    </button>
                    <button class="delete-od-btn" data-id="${entry.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            odTableBody.appendChild(row);
        });
        
        // Add event listeners for OD actions
        document.querySelectorAll('.approve-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const entryId = e.currentTarget.getAttribute('data-id');
                updateOdStatus(entryId, 'Approved');
            });
        });
        
        document.querySelectorAll('.reject-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const entryId = e.currentTarget.getAttribute('data-id');
                updateOdStatus(entryId, 'Rejected');
            });
        });
        
        document.querySelectorAll('.delete-od-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const entryId = e.currentTarget.getAttribute('data-id');
                deleteOdEntry(entryId);
            });
        });
    }
    
    // Filter OD Entries
    function setupOdFilters() {
        filterOdBtn.addEventListener('click', () => {
            const facultyId = facultyOdFilter.value;
            const date = odDateFilter.value;
            let odEntries = JSON.parse(localStorage.getItem('odEntries'));
            
            if (facultyId || date) {
                odEntries = odEntries.filter(entry => {
                    let matchesFaculty = true;
                    let matchesDate = true;
                    
                    if (facultyId) {
                        matchesFaculty = entry.facultyId === facultyId;
                    }
                    
                    if (date) {
                        matchesDate = entry.date === date;
                    }
                    
                    return matchesFaculty && matchesDate;
                });
            }
            
            displayOdEntries(odEntries);
        });
    }
    
    // Add OD Entry
    function setupAddOd() {
        addOdBtn.addEventListener('click', () => {
            odForm.reset();
            odModal.style.display = 'block';
        });
        
        odForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const odData = {
                id: Date.now().toString(),
                facultyId: document.getElementById('odFaculty').value,
                date: document.getElementById('odDate').value,
                reason: document.getElementById('odReason').value,
                status: 'Pending',
                createdAt: new Date().toISOString()
            };
            
            if (!odData.facultyId || !odData.date || !odData.reason) {
                alert('Please fill in all fields.');
                return;
            }
            
            let odEntries = JSON.parse(localStorage.getItem('odEntries'));
            odEntries.push(odData);
            localStorage.setItem('odEntries', JSON.stringify(odEntries));
            
            odModal.style.display = 'none';
            displayOdEntries();
            
            // Update attendance records
            updateAttendanceStatus(odData.facultyId, odData.date, 'OD');
        });
    }
    
    // Update OD Status
    function updateOdStatus(entryId, status) {
        let odEntries = JSON.parse(localStorage.getItem('odEntries'));
        odEntries = odEntries.map(entry => {
            if (entry.id === entryId) {
                return { ...entry, status };
            }
            return entry;
        });
        
        localStorage.setItem('odEntries', JSON.stringify(odEntries));
        displayOdEntries();
        
        // If rejected, update attendance status
        const entry = odEntries.find(e => e.id === entryId);
        if (status === 'Rejected' && entry) {
            updateAttendanceStatus(entry.facultyId, entry.date, 'Absent');
        }
    }
    
    // Delete OD Entry
    function deleteOdEntry(entryId) {
        if (confirm('Are you sure you want to delete this OD entry?')) {
            let odEntries = JSON.parse(localStorage.getItem('odEntries'));
            const entry = odEntries.find(e => e.id === entryId);
            odEntries = odEntries.filter(e => e.id !== entryId);
            localStorage.setItem('odEntries', JSON.stringify(odEntries));
            
            displayOdEntries();
            
            // Reset attendance status if OD was approved
            if (entry && entry.status === 'Approved') {
                updateAttendanceStatus(entry.facultyId, entry.date, 'Absent');
            }
        }
    }
    
    // Update Attendance Status
    function updateAttendanceStatus(facultyId, date, status) {
        let attendance = JSON.parse(localStorage.getItem('attendance'));
        
        if (!attendance[facultyId]) {
            attendance[facultyId] = {};
        }
        
        attendance[facultyId][date] = status;
        localStorage.setItem('attendance', JSON.stringify(attendance));
        
        if (facultyAttendanceFilter.value === facultyId) {
            displayAttendance(facultyId, attendanceMonthFilter.value);
        }
    }
    
    // Filter Attendance
    function setupAttendanceFilters() {
        filterAttendanceBtn.addEventListener('click', () => {
            const facultyId = facultyAttendanceFilter.value;
            const month = attendanceMonthFilter.value;
            
            if (facultyId && month) {
                displayAttendance(facultyId, month);
            } else {
                alert('Please select both faculty and month.');
            }
        });
    }
    
    // Display Attendance
    function displayAttendance(facultyId, month) {
        let attendance = JSON.parse(localStorage.getItem('attendance'));
        const facultyAttendance = attendance[facultyId] || {};
        
        // Clear calendar
        attendanceCalendar.innerHTML = '';
        
        if (!month) {
            attendanceCalendar.innerHTML = '<div class="no-data">Please select a month.</div>';
            return;
        }
        
        // Get year and month from the input (format: YYYY-MM)
        const [year, monthNum] = month.split('-');
        const daysInMonth = new Date(year, monthNum, 0).getDate();
        
        // Create day headers
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayNames.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.classList.add('calendar-header');
            dayHeader.textContent = day;
            attendanceCalendar.appendChild(dayHeader);
        });
        
        // Get the first day of the month
        const firstDay = new Date(year, monthNum - 1, 1).getDay();
        
        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.classList.add('calendar-day', 'empty');
            attendanceCalendar.appendChild(emptyDay);
        }
        
        // Statistics counters
        let presentDays = 0;
        let absentDays = 0;
        let odDays = 0;
        let totalWorkingDays = 0;
        
        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = `${year}-${monthNum.padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            const dayOfWeek = new Date(year, monthNum - 1, day).getDay();
            
            // Skip weekends (0 = Sunday, 6 = Saturday)
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            
            const dayElement = document.createElement('div');
            dayElement.classList.add('calendar-day');
            
            if (isWeekend) {
                dayElement.classList.add('weekend');
            } else {
                totalWorkingDays++; // Only count working days
                
                // Check attendance status
                const status = facultyAttendance[date] || 'Absent'; // Default to absent
                dayElement.classList.add(status.toLowerCase());
                
                // Update counters
                if (status === 'Present') presentDays++;
                else if (status === 'Absent') absentDays++;
                else if (status === 'OD') odDays++;
                
                // Make the day clickable for marking attendance
                dayElement.setAttribute('data-date', date);
                dayElement.addEventListener('click', () => toggleAttendance(facultyId, date));
            }
            
            dayElement.innerHTML = `<p>${day}</p><p class="status-text">${isWeekend ? 'Weekend' : (facultyAttendance[date] || 'Absent')}</p>`;
            
            attendanceCalendar.appendChild(dayElement);
        }
        
        // Update attendance statistics
        presentCount.textContent = presentDays;
        absentCount.textContent = absentDays;
        odCount.textContent = odDays;
        const percentage = totalWorkingDays > 0 ? Math.round((presentDays + odDays) / totalWorkingDays * 100) : 0;
        attendancePercentage.textContent = `${percentage}%`;
    }
    
    // Toggle Attendance Status
    function toggleAttendance(facultyId, date) {
        let attendance = JSON.parse(localStorage.getItem('attendance'));
        
        if (!attendance[facultyId]) {
            attendance[facultyId] = {};
        }
        
        // Check if there's an approved OD for this date
        const odEntries = JSON.parse(localStorage.getItem('odEntries'));
        const hasApprovedOd = odEntries.some(entry => 
            entry.facultyId === facultyId && 
            entry.date === date && 
            entry.status === 'Approved'
        );
        
        if (hasApprovedOd) {
            alert('This day has an approved OD. Cannot change attendance.');
            return;
        }
        
        // Toggle between Present and Absent
        const currentStatus = attendance[facultyId][date] || 'Absent';
        const newStatus = currentStatus === 'Present' ? 'Absent' : 'Present';
        
        attendance[facultyId][date] = newStatus;
        localStorage.setItem('attendance', JSON.stringify(attendance));
        
        // Refresh the display
        const month = date.substring(0, 7);
        displayAttendance(facultyId, month);
    }
    
    // Initialize the application
    function init() {
        initializeLocalStorage();
        setupTabs();
        displayFaculties();
        displayRoles();
        displaySections();
        displayOdEntries();
        updateFacultyDropdowns();
        
        setupSearch();
        setupAddFaculty();
        setupFacultyForm();
        setupModalControls();
        
        setupRoleManagement();
        setupSectionManagement();
        
        setupOdFilters();
        setupAddOd();
        setupAttendanceFilters();
        
        // Set current date as default for date filters
        const today = new Date();
        const currentMonth = today.toISOString().substring(0, 7);
        attendanceMonthFilter.value = currentMonth;
    }
    
    // Start the application
    init();
});