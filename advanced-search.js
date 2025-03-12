class AdvancedSearch {
    constructor() {
      this.searchHistory = JSON.parse(
        localStorage.getItem("searchHistory") || "[]",
      );
      this.maxHistoryItems = 5;
      this.activeFilters = new Set();
      this.shortcuts = {
        "/": "Focus search",
        Esc: "Clear search",
        "Alt + F": "Open filters",
        "↑/↓": "Navigate suggestions",
      };
  
      this.init();
    }
  
    init() {
      this.setupAdvancedSearchUI();
      this.setupEventListeners();
      this.setupKeyboardShortcuts();
    }
  
    setupAdvancedSearchUI() {
      const searchContainer = document.querySelector(".search-container");
  
      // Create advanced search elements
      const advancedSearchHTML = `
        <div class="advanced-search-wrapper">
          <div class="search-suggestions" style="display: none;">
            <div class="recent-searches">
              <h3>Recent Searches</h3>
              <ul class="history-list"></ul>
            </div>
          </div>
  
          <button class="filter-button" aria-label="Open filters">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M8.33333 15H11.6667V13.3333H8.33333V15ZM2.5 5V6.66667H17.5V5H2.5ZM5 10.8333H15V9.16667H5V10.8333Z" fill="#85878D"/>
            </svg>
          </button>
  
          <div class="advanced-filters" style="display: none;">
            <div class="filter-section">
              <h3>Date Range</h3>
              <div class="date-inputs">
                <input type="date" class="filter-date-start" aria-label="Start date">
                <span>to</span>
                <input type="date" class="filter-date-end" aria-label="End date">
              </div>
            </div>
  
            <div class="filter-section">
              <h3>Assessment Type</h3>
              <div class="type-filters">
                <label class="filter-checkbox">
                  <input type="checkbox" value="quiz"> Quiz
                </label>
                <label class="filter-checkbox">
                  <input type="checkbox" value="test"> Test
                </label>
                <label class="filter-checkbox">
                  <input type="checkbox" value="assignment"> Assignment
                </label>
                <label class="filter-checkbox">
                  <input type="checkbox" value="project"> Project
                </label>
              </div>
            </div>
  
            <div class="filter-section">
              <h3>Duration</h3>
              <div class="duration-slider">
                <input type="range" min="0.5" max="4" step="0.5" value="0.5" class="duration-range">
                <span class="duration-value">0.5h</span>
              </div>
            </div>
  
            <div class="filter-actions">
              <button class="apply-filters">Apply Filters</button>
              <button class="clear-filters">Clear All</button>
            </div>
          </div>
        </div>
      `;
  
      searchContainer.insertAdjacentHTML("beforeend", advancedSearchHTML);
    }
  
    setupEventListeners() {
      const searchInput = document.querySelector(".search-input");
      const filterButton = document.querySelector(".filter-button");
      const advancedFilters = document.querySelector(".advanced-filters");
      const suggestions = document.querySelector(".search-suggestions");
  
      // Search input events
      searchInput.addEventListener("focus", () => this.showSearchSuggestions());
      searchInput.addEventListener("input", (e) => this.handleSearchInput(e));
  
      // Filter button events
      filterButton.addEventListener("click", () => {
        advancedFilters.style.display =
          advancedFilters.style.display === "none" ? "block" : "none";
      });
  
      // Filter events
      document
        .querySelector(".apply-filters")
        .addEventListener("click", () => this.applyFilters());
      document
        .querySelector(".clear-filters")
        .addEventListener("click", () => this.clearFilters());
  
      // Duration slider
      const durationSlider = document.querySelector(".duration-range");
      durationSlider.addEventListener("input", (e) => {
        document.querySelector(".duration-value").textContent =
          `${e.target.value}h`;
      });
  
      // Close suggestions when clicking outside
      document.addEventListener("click", (e) => {
        if (!e.target.closest(".search-container")) {
          suggestions.style.display = "none";
        }
      });
    }
  
    setupKeyboardShortcuts() {
      document.addEventListener("keydown", (e) => {
        // Focus search: "/"
        if (e.key === "/" && !e.target.matches("input, textarea")) {
          e.preventDefault();
          document.querySelector(".search-input").focus();
        }
  
        // Open filters: "Alt + F"
        if (e.key === "f" && e.altKey) {
          e.preventDefault();
          const filters = document.querySelector(".advanced-filters");
          filters.style.display =
            filters.style.display === "none" ? "block" : "none";
        }
  
        // Navigate suggestions: Arrow keys
        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
          const suggestions = document.querySelector(".search-suggestions");
          if (suggestions.style.display !== "none") {
            e.preventDefault();
            this.navigateSuggestions(e.key === "ArrowDown" ? 1 : -1);
          }
        }
      });
    }
  
    handleSearchInput(e) {
      const searchTerm = e.target.value.trim();
  
      if (searchTerm) {
        this.updateSearchSuggestions(searchTerm);
      } else {
        document.querySelector(".search-suggestions").style.display = "none";
      }
    }
  
    showSearchSuggestions() {
      const suggestions = document.querySelector(".search-suggestions");
      const historyList = suggestions.querySelector(".history-list");
  
      historyList.innerHTML = this.searchHistory
        .map((term) => `<li class="history-item">${term}</li>`)
        .join("");
  
      suggestions.style.display = "block";
  
      // Add click handlers to history items
      historyList.querySelectorAll(".history-item").forEach((item) => {
        item.addEventListener("click", () => {
          document.querySelector(".search-input").value = item.textContent;
          this.performSearch(item.textContent);
          suggestions.style.display = "none";
        });
      });
    }
  
    updateSearchSuggestions(searchTerm) {
      const suggestions = document.querySelector(".search-suggestions");
      const historyList = suggestions.querySelector(".history-list");
  
      // Filter history items that match the search term
      const matchingHistory = this.searchHistory.filter((term) =>
        term.toLowerCase().includes(searchTerm.toLowerCase()),
      );
  
      historyList.innerHTML = matchingHistory
        .map((term) => `<li class="history-item">${term}</li>`)
        .join("");
  
      suggestions.style.display = matchingHistory.length ? "block" : "none";
    }
  
    navigateSuggestions(direction) {
      const items = document.querySelectorAll(".history-item");
      const activeItem = document.querySelector(".history-item.active");
      let nextIndex = 0;
  
      if (activeItem) {
        const currentIndex = Array.from(items).indexOf(activeItem);
        nextIndex = (currentIndex + direction + items.length) % items.length;
        activeItem.classList.remove("active");
      } else if (direction === 1) {
        nextIndex = 0;
      } else {
        nextIndex = items.length - 1;
      }
  
      items[nextIndex].classList.add("active");
      document.querySelector(".search-input").value =
        items[nextIndex].textContent;
    }
  
    applyFilters() {
      const dateStart = document.querySelector(".filter-date-start").value;
      const dateEnd = document.querySelector(".filter-date-end").value;
      const selectedTypes = Array.from(
        document.querySelectorAll(".filter-checkbox input:checked"),
      ).map((checkbox) => checkbox.value);
      const duration = document.querySelector(".duration-range").value;
  
      this.activeFilters.clear();
  
      if (dateStart) this.activeFilters.add(`start:${dateStart}`);
      if (dateEnd) this.activeFilters.add(`end:${dateEnd}`);
      if (selectedTypes.length)
        this.activeFilters.add(`types:${selectedTypes.join(",")}`);
      if (duration !== "0.5") this.activeFilters.add(`duration:${duration}`);
  
      this.filterAssessments();
      document.querySelector(".advanced-filters").style.display = "none";
    }
  
    clearFilters() {
      document.querySelector(".filter-date-start").value = "";
      document.querySelector(".filter-date-end").value = "";
      document
        .querySelectorAll(".filter-checkbox input")
        .forEach((checkbox) => (checkbox.checked = false));
      document.querySelector(".duration-range").value = "0.5";
      document.querySelector(".duration-value").textContent = "0.5h";
  
      this.activeFilters.clear();
      this.filterAssessments();
    }
  
    filterAssessments() {
      const assessmentCards = document.querySelectorAll(".assessment-card");
  
      assessmentCards.forEach((card) => {
        const matches = this.matchesFilters(card);
        card.style.display = matches ? "" : "none";
      });
    }
  
    matchesFilters(card) {
      if (!this.activeFilters.size) return true;
  
      for (const filter of this.activeFilters) {
        const [type, value] = filter.split(":");
  
        switch (type) {
          case "start":
          case "end":
            const cardDate = card.querySelector(
              ".detail-item:nth-child(1) span",
            ).textContent;
            const filterDate = new Date(value);
            const assessmentDate = new Date(cardDate);
  
            if (type === "start" && assessmentDate < filterDate) return false;
            if (type === "end" && assessmentDate > filterDate) return false;
            break;
  
          case "types":
            const cardType = card.querySelector(".tag").textContent.toLowerCase();
            if (!value.split(",").includes(cardType)) return false;
            break;
  
          case "duration":
            const cardDuration = parseFloat(
              card.querySelector(".detail-item:nth-child(3) span").textContent,
            );
            if (cardDuration > parseFloat(value)) return false;
            break;
        }
      }
  
      return true;
    }
  
    performSearch(searchTerm) {
      // Add to search history
      if (searchTerm && !this.searchHistory.includes(searchTerm)) {
        this.searchHistory.unshift(searchTerm);
        if (this.searchHistory.length > this.maxHistoryItems) {
          this.searchHistory.pop();
        }
        localStorage.setItem("searchHistory", JSON.stringify(this.searchHistory));
      }
  
      // Trigger the existing search functionality
      if (window.assessmentSearch) {
        window.assessmentSearch.handleSearch(searchTerm);
      }
    }
  }
  
  // Initialize advanced search when the DOM is loaded
  document.addEventListener("DOMContentLoaded", () => {
    new AdvancedSearch();
  });
  