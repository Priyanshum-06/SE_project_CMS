class AssessmentSearch {
    constructor() {
      this.searchInput = document.querySelector(".search-input");
      this.assessmentCards = document.querySelectorAll(".assessment-card");
      this.noResultsElement = null;
      this.debounceTimeout = null;
  
      this.init();
    }
  
    init() {
      this.createNoResultsElement();
      this.setupEventListeners();
    }
  
    createNoResultsElement() {
      this.noResultsElement = document.createElement("div");
      this.noResultsElement.className = "no-results";
      this.noResultsElement.innerHTML = `
        <svg class="search-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="#85878D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
        </svg>
        <p>No assessments found</p>
        <span>Try adjusting your search terms</span>
      `;
      this.noResultsElement.style.display = "none";
      document
        .querySelector(".upcoming-section")
        .appendChild(this.noResultsElement);
    }
  
    setupEventListeners() {
      this.searchInput.addEventListener("input", (e) => {
        // Clear previous timeout
        if (this.debounceTimeout) {
          clearTimeout(this.debounceTimeout);
        }
  
        // Debounce search to improve performance
        this.debounceTimeout = setTimeout(() => {
          this.handleSearch(e.target.value);
        }, 300);
      });
  
      // Clear search on escape key
      this.searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          this.searchInput.value = "";
          this.handleSearch("");
        }
      });
    }
  
    handleSearch(searchTerm) {
      searchTerm = searchTerm.toLowerCase().trim();
      let hasResults = false;
  
      this.assessmentCards.forEach((card) => {
        const matches = this.matchesSearch(card, searchTerm);
        this.toggleCardVisibility(card, matches);
        this.highlightSearchTerms(card, searchTerm);
  
        if (matches) hasResults = true;
      });
  
      this.toggleNoResults(!hasResults);
      this.updateCalendarHighlights(searchTerm);
    }
  
    matchesSearch(card, searchTerm) {
      if (!searchTerm) return true;
  
      const searchableElements = {
        title: card.querySelector(".assessment-title")?.textContent,
        subject: card.querySelector(".assessment-subject")?.textContent,
        date: card.querySelector(".detail-item:nth-child(1) span")?.textContent,
        time: card.querySelector(".detail-item:nth-child(2) span")?.textContent,
        duration: card.querySelector(".detail-item:nth-child(3) span")
          ?.textContent,
        type: card.querySelector(".tag")?.textContent,
      };
  
      // Search in all fields
      return Object.values(searchableElements).some((text) =>
        text?.toLowerCase().includes(searchTerm),
      );
    }
  
    toggleCardVisibility(card, show) {
      if (show) {
        card.classList.remove("hidden");
        card.style.display = "";
      } else {
        card.classList.add("hidden");
        card.style.display = "none";
      }
    }
  
    highlightSearchTerms(card, searchTerm) {
      if (!searchTerm) {
        // Remove all highlights
        card.querySelectorAll(".highlight").forEach((el) => {
          el.outerHTML = el.textContent;
        });
        return;
      }
  
      const textElements = card.querySelectorAll(
        ".assessment-title, .assessment-subject, .detail-item span",
      );
  
      textElements.forEach((element) => {
        let text = element.textContent;
        // Remove existing highlights
        if (element.innerHTML.includes("highlight")) {
          text = element.textContent;
        }
  
        if (text.toLowerCase().includes(searchTerm)) {
          const regex = new RegExp(`(${searchTerm})`, "gi");
          element.innerHTML = text.replace(
            regex,
            '<span class="highlight">$1</span>',
          );
        }
      });
    }
  
    toggleNoResults(show) {
      if (show) {
        this.noResultsElement.style.display = "flex";
      } else {
        this.noResultsElement.style.display = "none";
      }
    }
  
    updateCalendarHighlights(searchTerm) {
      const calendarDays = document.querySelectorAll(".calendar-day");
      const visibleAssessments = Array.from(this.assessmentCards)
        .filter((card) => !card.classList.contains("hidden"))
        .map(
          (card) =>
            card.querySelector(".detail-item:nth-child(1) span").textContent,
        );
  
      calendarDays.forEach((day) => {
        const dayNumber = parseInt(day.textContent);
        const hasAssessment = visibleAssessments.some((date) => {
          const assessmentDay = new Date(date).getDate();
          return assessmentDay === dayNumber;
        });
  
        if (hasAssessment && searchTerm) {
          day.classList.add("calendar-day-highlight-search");
        } else {
          day.classList.remove("calendar-day-highlight-search");
        }
      });
    }
  
    // Public method to reset search
    resetSearch() {
      this.searchInput.value = "";
      this.handleSearch("");
    }
  }
  
  // Initialize search functionality
  document.addEventListener("DOMContentLoaded", () => {
    window.assessmentSearch = new AssessmentSearch();
  });
  