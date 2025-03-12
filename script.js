// Profile Sidebar Functionality
const profileLink = document.querySelector('.profile-link');
const profileSidebar = document.getElementById('profileSidebar');
const closeProfile = document.getElementById('closeProfile');

profileLink.addEventListener('click', (e) => {
    e.preventDefault();
    profileSidebar.classList.add('active');
    // Add overlay when sidebar is active
    document.body.classList.add('sidebar-active');
});

closeProfile.addEventListener('click', () => {
    profileSidebar.classList.remove('active');
    document.body.classList.remove('sidebar-active');
});

// Close sidebar when clicking outside
document.addEventListener('click', (e) => {
    if (profileSidebar.classList.contains('active') && 
        !profileSidebar.contains(e.target) && 
        !profileLink.contains(e.target)) {
        profileSidebar.classList.remove('active');
        document.body.classList.remove('sidebar-active');
    }
});

// Tab switching functionality
function switchTab(tabElement, tabName) {
    // Remove active class from all tabs
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Add active class to clicked tab
    tabElement.classList.add('active');
    
    // Here you would typically load content based on the tab
    console.log(`Switched to ${tabName} tab`);
}

// Calendar day selection
const calendarDays = document.querySelectorAll('.calendar-day');
calendarDays.forEach(day => {
    day.addEventListener('click', () => {
        calendarDays.forEach(d => d.classList.remove('today'));
        day.classList.add('today');
    });
});

// Event checkbox functionality
const eventCheckboxes = document.querySelectorAll('.event-checkbox');
eventCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
        const eventItem = checkbox.closest('.event-item');
        if (checkbox.checked) {
            eventItem.style.opacity = '0.6';
        } else {
            eventItem.style.opacity = '1';
        }
    });
});

// Initialize checked events
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.event-checkbox:checked').forEach(checkbox => {
        const eventItem = checkbox.closest('.event-item');
        eventItem.style.opacity = '0.6';
    });
});