// dashboard.js
document.addEventListener('DOMContentLoaded', function() {
  // Get all rating sections
  const ratingSections = document.querySelectorAll('.rating-section');
  
  // For each section, add click listeners to the buttons
  ratingSections.forEach(section => {
    const buttons = section.querySelectorAll('.rating-option');
    
    buttons.forEach(button => {
      button.addEventListener('click', function() {
        // Remove selected class from all buttons in this section
        buttons.forEach(btn => btn.classList.remove('selected'));
        
        // Add selected class to clicked button
        this.classList.add('selected');
      });
    });
  });
  
  // Add hover animations to the sidebar items
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('mouseenter', function() {
      this.style.transform = 'translateX(5px)';
    });
    
    item.addEventListener('mouseleave', function() {
      this.style.transform = 'translateX(0)';
    });
  });
  
  // Get submit button
  const submitButton = document.querySelector('.submit-feedback');
  if (submitButton) {
    submitButton.addEventListener('click', function() {
      // Form validation could go here
      
      // Simple validation example
      const feedbackInput = document.querySelector('.feedback-input');
      let isValid = true;
      let selectionsMade = true;
      
      // Check if at least one option is selected in each rating section
      ratingSections.forEach(section => {
        const selected = section.querySelector('.rating-option.selected');
        if (!selected) {
          selectionsMade = false;
        }
      });
      
      if (!selectionsMade) {
        alert('Please provide ratings for all categories.');
        isValid = false;
      }
      
      if (feedbackInput.value.trim() === '') {
        feedbackInput.style.borderColor = '#ff0000';
        alert('Please provide additional feedback.');
        isValid = false;
      } else {
        feedbackInput.style.borderColor = '#e0e0e0';
      }
      
      if (isValid) {
        // Submission logic would go here
        alert('Review submitted successfully!');
        
        // Reset form
        ratingSections.forEach(section => {
          const buttons = section.querySelectorAll('.rating-option');
          buttons.forEach(btn => btn.classList.remove('selected'));
        });
        feedbackInput.value = '';
      }
    });
  }
});