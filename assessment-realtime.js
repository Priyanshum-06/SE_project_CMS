class RealTimeClashDetector {
    constructor(assessmentManager) {
      this.assessmentManager = assessmentManager;
      this.setupEventListeners();
    }
  
    setupEventListeners() {
      const form = document.getElementById("assessmentForm");
      const dateInput = document.getElementById("date");
      const timeInput = document.getElementById("time");
      const durationInput = document.getElementById("duration");
  
      // Real-time validation
      [dateInput, timeInput, durationInput].forEach((input) => {
        input.addEventListener("change", () => this.validateTimeSlot());
      });
  
      // Form submission
      form.addEventListener("submit", (e) => this.handleFormSubmit(e));
    }
  
    validateTimeSlot() {
      const date = document.getElementById("date").value;
      const time = document.getElementById("time").value;
      const duration = document.getElementById("duration").value;
  
      if (!date || !time || !duration) return;
  
      const [hours, minutes] = time.split(":");
      const timeStr = `${hours}:${minutes} ${parseInt(hours) >= 12 ? "PM" : "AM"}`;
  
      const newAssessment = new Assessment(
        "Temporary",
        "Temporary",
        date,
        timeStr,
        `${duration}h`,
      );
  
      const clashes = this.assessmentManager.findClashes(newAssessment);
      this.updateClashWarning(clashes.length > 0);
    }
  
    updateClashWarning(hasClash) {
      const warning = document.getElementById("clashWarning");
      warning.classList.toggle("hidden", !hasClash);
    }
  
    async handleFormSubmit(e) {
      e.preventDefault();
  
      const formData = new FormData(e.target);
      const assessmentData = {
        title: formData.get("title"),
        subject: formData.get("subject"),
        date: formData.get("date"),
        time: this.formatTime(formData.get("time")),
        duration: `${formData.get("duration")}h`,
        type: formData.get("type"),
      };
  
      const newAssessment = new Assessment(
        assessmentData.title,
        assessmentData.subject,
        assessmentData.date,
        assessmentData.time,
        assessmentData.duration,
      );
  
      const clashes = this.assessmentManager.findClashes(newAssessment);
  
      if (clashes.length > 0) {
        if (
          !confirm(
            "This assessment clashes with existing assessments. Add anyway?",
          )
        ) {
          return;
        }
      }
  
      await this.addAssessmentToDOM(assessmentData);
      this.assessmentManager.addAssessment(newAssessment);
      this.closeModal();
    }
  
    formatTime(time24h) {
      const [hours, minutes] = time24h.split(":");
      const period = hours >= 12 ? "PM" : "AM";
      const hours12 = hours % 12 || 12;
      return `${hours12}:${minutes} ${period}`;
    }
  
    async addAssessmentToDOM(assessment) {
      const template = this.createAssessmentTemplate(assessment);
      const container = document.querySelector(".upcoming-section");
      container.insertAdjacentHTML("beforeend", template);
    }
  
    createAssessmentTemplate(assessment) {
      return `
        <article class="assessment-card" data-assessment-id="${assessment.title.replace(/\s+/g, "-").toLowerCase()}">
          <header class="assessment-header">
            <div class="assessment-info">
              <h3 class="assessment-title">${assessment.title}</h3>
              <p class="assessment-subject">${assessment.subject}</p>
            </div>
          </header>
          <div class="assessment-details">
            <div class="detail-item">
              <svg class="calendar-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5.33333 1.3335V3.3335M10.6667 1.3335V3.3335M2.33333 6.06016H13.6667M14 5.66683V11.3335C14 13.3335 13 14.6668 10.6667 14.6668H5.33333C3 14.6668 2 13.3335 2 11.3335V5.66683C2 3.66683 3 2.3335 5.33333 2.3335H10.6667C13 2.3335 14 3.66683 14 5.66683Z" stroke="#85878D" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
              </svg>
              <span>${assessment.date}</span>
            </div>
            <div class="detail-item">
              <svg class="time-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.99967 4.00016V8.00016L10.6663 9.3335M14.6663 8.00016C14.6663 11.682 11.6815 14.6668 7.99967 14.6668C4.31777 14.6668 1.33301 11.682 1.33301 8.00016C1.33301 4.31826 4.31777 1.3335 7.99967 1.3335C11.6815 1.3335 14.6663 4.31826 14.6663 8.00016Z" stroke="#85878D" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
              </svg>
              <span>${assessment.time}</span>
            </div>
            <div class="detail-item">
              <svg class="duration-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.99951 5.33333V8L9.33285 9.33333M2.03613 7.33333H4.66618M11.3328 7.33333H13.9629M7.33285 2.03662V4.66667M7.33285 11.3333V13.9634" stroke="#85878D" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
              </svg>
              <span>${assessment.duration}</span>
            </div>
            <div class="tag tag-${assessment.type}">${assessment.type.charAt(0).toUpperCase() + assessment.type.slice(1)}</div>
          </div>
        </article>
      `;
    }
  
    closeModal() {
      const modal = document.getElementById("assessmentModal");
      modal.style.display = "none";
      document.getElementById("assessmentForm").reset();
      this.updateClashWarning(false);
    }
  }
  
  // Calendar Import Handlers
  async function importFromGoogle() {
    try {
      const response = await gapi.client.calendar.events.list({
        calendarId: "primary",
        timeMin: new Date().toISOString(),
        showDeleted: false,
        singleEvents: true,
        maxResults: 10,
        orderBy: "startTime",
      });
  
      const events = response.result.items;
      await processImportedEvents(events);
    } catch (error) {
      console.error("Error importing from Google Calendar:", error);
      alert("Failed to import from Google Calendar. Please try again.");
    }
  }
  
  async function importFromOutlook() {
    try {
      const response = await fetch(
        "https://graph.microsoft.com/v1.0/me/calendar/events",
        {
          headers: {
            Authorization: "Bearer " + accessToken,
          },
        },
      );
      const data = await response.json();
      await processImportedEvents(data.value);
    } catch (error) {
      console.error("Error importing from Outlook:", error);
      alert("Failed to import from Outlook. Please try again.");
    }
  }
  
  function importFromICS() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".ics";
  
    input.onchange = async function (e) {
      const file = e.target.files[0];
      const reader = new FileReader();
  
      reader.onload = async function (e) {
        const data = e.target.result;
        const events = parseICSFile(data);
        await processImportedEvents(events);
      };
  
      reader.readAsText(file);
    };
  
    input.click();
  }
  
  async function processImportedEvents(events) {
    const detector = new RealTimeClashDetector(window.assessmentManager);
  
    for (const event of events) {
      const assessmentData = {
        title: event.summary || event.subject,
        subject: "Imported Event",
        date: formatDate(event.start.date || event.start.dateTime),
        time: formatTime(event.start.dateTime),
        duration: calculateDuration(event.start.dateTime, event.end.dateTime),
        type: "assignment",
      };
  
      const newAssessment = new Assessment(
        assessmentData.title,
        assessmentData.subject,
        assessmentData.date,
        assessmentData.time,
        assessmentData.duration,
      );
  
      const clashes = window.assessmentManager.findClashes(newAssessment);
      if (clashes.length > 0) {
        if (
          !confirm(
            `"${assessmentData.title}" clashes with existing assessments. Import anyway?`,
          )
        ) {
          continue;
        }
      }
  
      await detector.addAssessmentToDOM(assessmentData);
      window.assessmentManager.addAssessment(newAssessment);
    }
  
    alert("Import completed successfully!");
  }
  
  // Initialize real-time clash detection
  document.addEventListener("DOMContentLoaded", () => {
    window.assessmentManager = new AssessmentManager();
    window.assessmentManager.initializeFromDOM();
    new RealTimeClashDetector(window.assessmentManager);
  });
  