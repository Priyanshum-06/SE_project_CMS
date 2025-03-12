class AssessmentDragAndDrop {
    constructor(assessmentManager) {
      this.assessmentManager = assessmentManager;
      this.draggedElement = null;
      this.originalPosition = null;
      this.setupDragAndDrop();
      this.setupExternalDrop();
    }
  
    setupDragAndDrop() {
      const assessmentCards = document.querySelectorAll(".assessment-card");
      const container = document.querySelector(".upcoming-section");
  
      assessmentCards.forEach((card) => {
        card.setAttribute("draggable", "true");
        this.addDragListeners(card);
      });
  
      container.addEventListener("dragover", (e) => this.handleDragOver(e));
      container.addEventListener("drop", (e) => this.handleDrop(e));
    }
  
    addDragListeners(element) {
      element.addEventListener("dragstart", (e) => this.handleDragStart(e));
      element.addEventListener("dragend", (e) => this.handleDragEnd(e));
      element.addEventListener("dragenter", (e) => this.handleDragEnter(e));
      element.addEventListener("dragleave", (e) => this.handleDragLeave(e));
    }
  
    handleDragStart(e) {
      this.draggedElement = e.target;
      this.originalPosition = this.getElementPosition(this.draggedElement);
  
      e.target.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/html", e.target.outerHTML);
  
      // Create ghost image
      const ghost = e.target.cloneNode(true);
      ghost.style.opacity = "0.7";
      ghost.style.position = "absolute";
      ghost.style.left = "-9999px";
      document.body.appendChild(ghost);
      e.dataTransfer.setDragImage(ghost, 0, 0);
  
      setTimeout(() => document.body.removeChild(ghost), 0);
    }
  
    handleDragEnd(e) {
      e.target.classList.remove("dragging");
      this.removeDragStyles();
    }
  
    handleDragOver(e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
  
      const target = this.getDropTarget(e.target);
      if (!target || target === this.draggedElement) return;
  
      const rect = target.getBoundingClientRect();
      const midpoint = rect.top + rect.height / 2;
  
      if (e.clientY < midpoint) {
        target.classList.remove("drop-after");
        target.classList.add("drop-before");
      } else {
        target.classList.remove("drop-before");
        target.classList.add("drop-after");
      }
    }
  
    handleDragEnter(e) {
      e.preventDefault();
      const target = this.getDropTarget(e.target);
      if (target && target !== this.draggedElement) {
        target.classList.add("drag-over");
      }
    }
  
    handleDragLeave(e) {
      const target = this.getDropTarget(e.target);
      if (target) {
        target.classList.remove("drag-over", "drop-before", "drop-after");
      }
    }
  
    async handleDrop(e) {
      e.preventDefault();
      const target = this.getDropTarget(e.target);
  
      if (!target || target === this.draggedElement) return;
  
      const rect = target.getBoundingClientRect();
      const midpoint = rect.top + rect.height / 2;
      const insertBefore = e.clientY < midpoint;
  
      // Check if the drop would create a clash
      const newPosition = this.calculateNewPosition(target, insertBefore);
      if (await this.wouldCreateClash(this.draggedElement, newPosition)) {
        this.showClashWarning();
        return;
      }
  
      // Perform the reordering
      if (insertBefore) {
        target.parentNode.insertBefore(this.draggedElement, target);
      } else {
        target.parentNode.insertBefore(this.draggedElement, target.nextSibling);
      }
  
      this.removeDragStyles();
      this.updateAssessmentOrder();
    }
  
    setupExternalDrop() {
      const dropZone = document.querySelector(".upcoming-section");
  
      dropZone.addEventListener("dragenter", (e) => {
        e.preventDefault();
        if (this.isExternalDrag(e)) {
          dropZone.classList.add("external-drag-over");
        }
      });
  
      dropZone.addEventListener("dragover", (e) => {
        e.preventDefault();
        if (this.isExternalDrag(e)) {
          e.dataTransfer.dropEffect = "copy";
        }
      });
  
      dropZone.addEventListener("dragleave", (e) => {
        if (this.isExternalDrag(e)) {
          dropZone.classList.remove("external-drag-over");
        }
      });
  
      dropZone.addEventListener("drop", async (e) => {
        e.preventDefault();
        dropZone.classList.remove("external-drag-over");
  
        if (this.isExternalDrag(e)) {
          await this.handleExternalDrop(e);
        }
      });
    }
  
    async handleExternalDrop(e) {
      const data = e.dataTransfer.getData("text/calendar");
      if (!data) return;
  
      try {
        const event = this.parseCalendarData(data);
        const assessment = await this.createAssessmentFromEvent(event);
  
        if (await this.wouldCreateClash(assessment, null)) {
          if (
            !confirm("This event clashes with existing assessments. Add anyway?")
          ) {
            return;
          }
        }
  
        await this.assessmentManager.addAssessment(assessment);
        this.renderNewAssessment(assessment);
      } catch (error) {
        console.error("Error handling external drop:", error);
        alert("Failed to import external calendar event");
      }
    }
  
    parseCalendarData(data) {
      // Parse various calendar formats (iCal, Google Calendar, etc.)
      const parser = new DOMParser();
      const doc = parser.parseFromString(data, "text/calendar");
      // Implementation depends on the expected format
      return {
        title: doc.querySelector("summary")?.textContent || "New Assessment",
        date: doc.querySelector("dtstart")?.textContent,
        duration: doc.querySelector("duration")?.textContent,
        // ... other relevant fields
      };
    }
  
    async createAssessmentFromEvent(event) {
      return new Assessment(
        event.title,
        "Imported Event",
        event.date,
        event.startTime,
        event.duration,
      );
    }
  
    getDropTarget(element) {
      while (element && !element.classList.contains("assessment-card")) {
        element = element.parentElement;
      }
      return element;
    }
  
    isExternalDrag(e) {
      return (
        !this.draggedElement && e.dataTransfer.types.includes("text/calendar")
      );
    }
  
    getElementPosition(element) {
      const cards = Array.from(document.querySelectorAll(".assessment-card"));
      return cards.indexOf(element);
    }
  
    async wouldCreateClash(element, newPosition) {
      const assessment = this.assessmentManager.getAssessmentById(
        element.getAttribute("data-assessment-id"),
      );
      return this.assessmentManager.findClashes(assessment).length > 0;
    }
  
    showClashWarning() {
      const warning = document.createElement("div");
      warning.className = "clash-warning-popup";
      warning.textContent = "Cannot reorder: This would create a time clash";
  
      document.body.appendChild(warning);
      setTimeout(() => document.body.removeChild(warning), 3000);
    }
  
    removeDragStyles() {
      document.querySelectorAll(".assessment-card").forEach((card) => {
        card.classList.remove(
          "dragging",
          "drag-over",
          "drop-before",
          "drop-after",
        );
      });
      document
        .querySelector(".upcoming-section")
        .classList.remove("external-drag-over");
    }
  
    updateAssessmentOrder() {
      // Update the order in the assessment manager
      const newOrder = Array.from(
        document.querySelectorAll(".assessment-card"),
      ).map((card) => card.getAttribute("data-assessment-id"));
      this.assessmentManager.reorderAssessments(newOrder);
    }
  }
  
  // Initialize drag and drop functionality
  document.addEventListener("DOMContentLoaded", () => {
    if (window.assessmentManager) {
      new AssessmentDragAndDrop(window.assessmentManager);
    }
  });
  