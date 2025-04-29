document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const classroomsContainer = document.getElementById('classroomsContainer');
    const classroomModal = document.getElementById('classroomModal');
    const confirmationModal = document.getElementById('confirmationModal');
    const notification = document.getElementById('notification');
    const classroomForm = document.getElementById('classroomForm');
    const modalTitle = document.getElementById('modalTitle');
    
    // Form Elements
    const classroomIdInput = document.getElementById('classroomId');
    const classroomNameInput = document.getElementById('classroomName');
    const roomNumberInput = document.getElementById('roomNumber');
    const capacityInput = document.getElementById('capacity');
    const facultySelect = document.getElementById('faculty');
    const classroomTypeSelect = document.getElementById('classroomType');
    const locationInput = document.getElementById('location');
    
    // Buttons
    const addClassroomBtn = document.getElementById('addClassroomBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const saveBtn = document.getElementById('saveBtn');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    const closeModalBtn = document.querySelector('.close');
    const searchInput = document.getElementById('searchInput');

    // Current classroom ID for deletion
    let currentClassroomIdToDelete = null;

    // Initialize classrooms from local storage or create empty array
    let classrooms = JSON.parse(localStorage.getItem('classrooms')) || [];

    // Display classrooms on load
    displayClassrooms();

    // Add event listeners
    addClassroomBtn.addEventListener('click', openAddModal);
    classroomForm.addEventListener('submit', saveClassroom);
    cancelBtn.addEventListener('click', closeModal);
    closeModalBtn.addEventListener('click', closeModal);
    cancelDeleteBtn.addEventListener('click', closeConfirmationModal);
    confirmDeleteBtn.addEventListener('click', deleteClassroom);
    searchInput.addEventListener('input', searchClassrooms);

    // Functions
    function displayClassrooms(filteredClassrooms = null) {
        const classroomsToDisplay = filteredClassrooms || classrooms;
        
        classroomsContainer.innerHTML = '';
        
        if (classroomsToDisplay.length === 0) {
            classroomsContainer.innerHTML = `
                <div class="empty-state">
                    <p>No classrooms found. Add a new classroom to get started.</p>
                </div>
            `;
            return;
        }

        classroomsToDisplay.forEach(classroom => {
            const classroomElement = document.createElement('div');
            classroomElement.className = 'classroom-box';
            classroomElement.innerHTML = `
                <h3 class="classroom-title">${classroom.name}</h3>
                <div class="classroom-details">
                    <div class="classroom-detail">
                        <span class="detail-label">Room Number:</span>
                        <span>${classroom.roomNumber}</span>
                    </div>
                    <div class="classroom-detail">
                        <span class="detail-label">Capacity:</span>
                        <span>${classroom.capacity} Students</span>
                    </div>
                    <div class="classroom-detail">
                        <span class="detail-label">Faculty:</span>
                        <span>${classroom.faculty}</span>
                    </div>
                    <div class="classroom-detail">
                        <span class="detail-label">Type:</span>
                        <span><span class="badge badge-blue">${classroom.type}</span></span>
                    </div>
                    <div class="classroom-detail">
                        <span class="detail-label">Location:</span>
                        <span>${classroom.location}</span>
                    </div>
                </div>
                <div class="classroom-actions">
                    <button class="btn btn-default edit-btn" data-id="${classroom.id}">Edit</button>
                    <button class="btn btn-danger delete-btn" data-id="${classroom.id}">Delete</button>
                </div>
            `;
            
            classroomsContainer.appendChild(classroomElement);
            
            // Add event listeners to edit and delete buttons
            const editBtn = classroomElement.querySelector('.edit-btn');
            const deleteBtn = classroomElement.querySelector('.delete-btn');
            
            editBtn.addEventListener('click', () => openEditModal(classroom.id));
            deleteBtn.addEventListener('click', () => openConfirmationModal(classroom.id));
        });
    }

    function searchClassrooms() {
        const searchTerm = searchInput.value.toLowerCase();
        
        if (searchTerm.trim() === '') {
            displayClassrooms();
            return;
        }
        
        const filteredClassrooms = classrooms.filter(classroom => 
            classroom.name.toLowerCase().includes(searchTerm) ||
            classroom.roomNumber.toLowerCase().includes(searchTerm) ||
            classroom.faculty.toLowerCase().includes(searchTerm) ||
            classroom.type.toLowerCase().includes(searchTerm) ||
            classroom.location.toLowerCase().includes(searchTerm)
        );
        
        displayClassrooms(filteredClassrooms);
    }

    function openAddModal() {
        modalTitle.textContent = 'Add New Classroom';
        classroomIdInput.value = '';
        classroomForm.reset();
        classroomModal.style.display = 'block';
    }

    function openEditModal(classroomId) {
        const classroom = classrooms.find(c => c.id === classroomId);
        
        if (classroom) {
            modalTitle.textContent = 'Edit Classroom';
            classroomIdInput.value = classroom.id;
            classroomNameInput.value = classroom.name;
            roomNumberInput.value = classroom.roomNumber;
            capacityInput.value = classroom.capacity;
            facultySelect.value = classroom.faculty;
            classroomTypeSelect.value = classroom.type;
            locationInput.value = classroom.location;
            
            classroomModal.style.display = 'block';
        }
    }

    function closeModal() {
        classroomModal.style.display = 'none';
        classroomForm.reset();
    }

    function saveClassroom(e) {
        e.preventDefault();
        
        const classroomId = classroomIdInput.value;
        const newClassroom = {
            id: classroomId || generateId(),
            name: classroomNameInput.value,
            roomNumber: roomNumberInput.value,
            capacity: capacityInput.value,
            faculty: facultySelect.value,
            type: classroomTypeSelect.value,
            location: locationInput.value
        };
        
        if (classroomId) {
            // Update existing classroom
            const index = classrooms.findIndex(c => c.id === classroomId);
            if (index !== -1) {
                classrooms[index] = newClassroom;
                showNotification('Classroom updated successfully!');
            }
        } else {
            // Add new classroom
            classrooms.push(newClassroom);
            showNotification('Classroom added successfully!');
        }
        
        // Save to local storage
        saveToLocalStorage();
        
        // Close modal and refresh display
        closeModal();
        displayClassrooms();
    }

    function openConfirmationModal(classroomId) {
        currentClassroomIdToDelete = classroomId;
        confirmationModal.style.display = 'block';
    }

    function closeConfirmationModal() {
        confirmationModal.style.display = 'none';
        currentClassroomIdToDelete = null;
    }

    function deleteClassroom() {
        if (currentClassroomIdToDelete) {
            classrooms = classrooms.filter(c => c.id !== currentClassroomIdToDelete);
            saveToLocalStorage();
            closeConfirmationModal();
            displayClassrooms();
            showNotification('Classroom deleted successfully!');
        }
    }

    function saveToLocalStorage() {
        localStorage.setItem('classrooms', JSON.stringify(classrooms));
    }

    function showNotification(message) {
        notification.textContent = message;
        notification.style.display = 'block';
        
        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }

    function generateId() {
        return Date.now().toString();
    }
});