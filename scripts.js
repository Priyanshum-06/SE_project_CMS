// Local storage functions
function loadCourses() {
    const storedCourses = localStorage.getItem('courses');
    return storedCourses ? JSON.parse(storedCourses) : [];
  }
  
  function saveCourses(courses) {
    localStorage.setItem('courses', JSON.stringify(courses));
  }
  
  function loadStudents() {
    const storedStudents = localStorage.getItem('students');
    return storedStudents ? JSON.parse(storedStudents) : [];
  }
  
  function saveStudents(students) {
    localStorage.setItem('students', JSON.stringify(students));
  }
  
  // Initialize data from localStorage
  let courses = loadCourses();
  let students = loadStudents();
  
  // Function to add a course
  function addCourse() {
    const courseNameInput = document.getElementById('courseName');
    const courseName = courseNameInput.value.trim();
    if (courseName === '') {
      alert('Please enter a course name.');
      return;
    }
    courses.push(courseName);
    saveCourses(courses);  // Save to localStorage
    courseNameInput.value = '';
    renderCourses();
  }
  
  // Function to edit a course
  function editCourse(index) {
    const newCourseName = prompt('Edit Course Name:', courses[index]);
    if (newCourseName !== null && newCourseName.trim() !== '') {
      courses[index] = newCourseName.trim();
      saveCourses(courses);  // Save to localStorage
      renderCourses();
    }
  }
  
  // Function to delete a course
  function deleteCourse(index) {
    if (confirm('Are you sure you want to delete this course?')) {
      courses.splice(index, 1);
      saveCourses(courses);  // Save to localStorage
      renderCourses();
    }
  }
  
  // Render courses to the UI
  function renderCourses() {
    const coursesList = document.getElementById('coursesList');
    coursesList.innerHTML = '';
  
    if (courses.length === 0) {
      coursesList.innerHTML = '<p>No courses found. Please add a course.</p>';
      return;
    }
  
    courses.forEach((course, index) => {
      const courseItem = document.createElement('div');
      courseItem.className = 'course-item';
      courseItem.innerHTML = `
        <span>${course}</span>
        <div class="course-buttons">
          <button class="edit" onclick="editCourse(${index})">Edit</button>
          <button class="delete" onclick="deleteCourse(${index})">Delete</button>
        </div>
      `;
      coursesList.appendChild(courseItem);
    });
  }
  
  // Function to enroll a student (placeholder)
  function enrollStudent() {
    alert('Enroll New Student clicked! (You can open a form here.)');
  }
  
  // Section switching
  function showSection(section) {
    const studentsSection = document.getElementById('studentsSection');
    const coursesSection = document.getElementById('coursesSection');
  
    if (section === 'students') {
      studentsSection.style.display = 'block';
      coursesSection.style.display = 'none';
    } else if (section === 'courses') {
      studentsSection.style.display = 'none';
      coursesSection.style.display = 'block';
    }
  }
  
  // Call this on page load to render courses
  renderCourses();
  