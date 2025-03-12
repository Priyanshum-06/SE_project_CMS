// Assessment class to handle individual assessment data
class Assessment {
    constructor(title, subject, date, startTime, duration) {
      this.title = title;
      this.subject = subject;
      this.date = new Date(date);
      this.startTime = this.parseTime(startTime);
      this.duration = this.parseDuration(duration);
      this.endTime = this.calculateEndTime();
    }
  
    parseTime(timeStr) {
      const [time, period] = timeStr.split(" ");
      let [hours, minutes] = time.split(":").map(Number);
  
      if (period === "PM" && hours !== 12) {
        hours += 12;
      } else if (period === "AM" && hours === 12) {
        hours = 0;
      }
  
      return new Date(this.date).setHours(hours, minutes);
    }
  
    parseDuration(durationStr) {
      const hours = parseFloat(durationStr.replace("h", ""));
      return hours * 60 * 60 * 1000; // Convert to milliseconds
    }
  
    calculateEndTime() {
      return new Date(this.startTime + this.duration);
    }
  
    hasClashWith(otherAssessment) {
      // Check if assessments are on the same date
      if (this.date.toDateString() !== otherAssessment.date.toDateString()) {
        return false;
      }
  
      // Check for time overlap
      return !(
        this.endTime <= otherAssessment.startTime ||
        this.startTime >= otherAssessment.endTime
      );
    }
  }
  
  // AssessmentManager class to handle all assessments and clash detection
  class AssessmentManager {
    constructor() {
      this.assessments = [];
      this.orderedIds = [];
    }
  
    getAssessmentById(id) {
      return this.assessments.find(
        (assessment) =>
          assessment.title.replace(/\s+/g, "-").toLowerCase() === id,
      );
    }
  
    reorderAssessments(newOrder) {
      this.orderedIds = newOrder;
      this.assessments.sort((a, b) => {
        const aId = a.title.replace(/\s+/g, "-").toLowerCase();
        const bId = b.title.replace(/\s+/g, "-").toLowerCase();
        return newOrder.indexOf(aId) - newOrder.indexOf(bId);
      });
    }
  
    addAssessment(assessment) {
      const clashes = this.findClashes(assessment);
      if (clashes.length > 0) {
        this.markClashes(assessment, clashes);
      }
      this.assessments.push(assessment);
    }
  
    findClashes(newAssessment) {
      return this.assessments.filter((existing) =>
        existing.hasClashWith(newAssessment),
      );
    }
  
    markClashes(assessment, clashingAssessments) {
      const assessmentElements = clashingAssessments.map((clash) =>
        document.querySelector(
          `[data-assessment-id="${clash.title.replace(/\s+/g, "-").toLowerCase()}"]`,
        ),
      );
  
      assessmentElements.forEach((element) => {
        if (element) {
          this.addClashWarning(element);
        }
      });
    }
  
    addClashWarning(element) {
      // Check if warning already exists
      if (!element.querySelector(".time-clash")) {
        const warningDiv = document.createElement("div");
        warningDiv.className = "time-clash";
        warningDiv.innerHTML = `
                  <svg class="warning-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g clip-path="url(#clip0_367_762)">
                          <path d="M7.99967 6.00016V9.3335M7.99967 11.6668V12.0002M7.99967 14.6668C4.31777 14.6668 1.33301 11.682 1.33301 8.00016C1.33301 4.31826 4.31777 1.3335 7.99967 1.3335C11.6815 1.3335 14.6663 4.31826 14.6663 8.00016C14.6663 11.682 11.6815 14.6668 7.99967 14.6668Z" stroke="black" stroke-width="2" stroke-linecap="round"></path>
                      </g>
                      <defs>
                          <clipPath id="clip0_367_762">
                              <rect width="16" height="16" fill="white"></rect>
                          </clipPath>
                      </defs>
                  </svg>
                  <span>Time Clash</span>
              `;
        element.querySelector(".assessment-header").appendChild(warningDiv);
      }
    }
  
    initializeFromDOM() {
      const assessmentCards = document.querySelectorAll(".assessment-card");
  
      assessmentCards.forEach((card) => {
        const title = card.querySelector(".assessment-title").textContent.trim();
        const subject = card
          .querySelector(".assessment-subject")
          .textContent.trim();
        const date = card
          .querySelector(".detail-item:nth-child(1) span")
          .textContent.trim();
        const time = card
          .querySelector(".detail-item:nth-child(2) span")
          .textContent.trim();
        const duration = card
          .querySelector(".detail-item:nth-child(3) span")
          .textContent.trim();
  
        // Add data attribute for identification
        card.setAttribute(
          "data-assessment-id",
          title.replace(/\s+/g, "-").toLowerCase(),
        );
  
        const assessment = new Assessment(title, subject, date, time, duration);
        this.addAssessment(assessment);
      });
    }
  }
  
  // Initialize the assessment manager when the DOM is loaded
  document.addEventListener("DOMContentLoaded", () => {
    const manager = new AssessmentManager();
    manager.initializeFromDOM();
  });
  
  // Example usage for adding new assessments
  function addNewAssessment(title, subject, date, startTime, duration) {
    const manager = new AssessmentManager();
    const newAssessment = new Assessment(
      title,
      subject,
      date,
      startTime,
      duration,
    );
    manager.addAssessment(newAssessment);
    return manager.findClashes(newAssessment).length === 0;
  }
  