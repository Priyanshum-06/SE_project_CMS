// State management
let state = {
    tasks: [
      {
        id: 1,
        text: "Complete project documentation",
        completed: false,
        date: "2024-02-20",
        priority: "high",
        assignee:
          "https://cdn.builder.io/api/v1/image/assets/3fb845989a8f42ec8314926589656a8c/6508bcc19dfea9a7e9a7e7f3a2062210d75915210c76e2fca3474bac0a737b40?placeholderIfAbsent=true",
      },
      {
        id: 2,
        text: "Review pull requests",
        completed: true,
        date: "2024-02-18",
        priority: "low",
        assignee:
          "https://cdn.builder.io/api/v1/image/assets/3fb845989a8f42ec8314926589656a8c/ec94bb96d5f821ddb429747807f492a7e87e651a2d469f9b23d8e99ff55a607e?placeholderIfAbsent=true",
      },
      {
        id: 3,
        text: "Team meeting preparation",
        completed: false,
        date: "2024-02-19",
        priority: "high",
        assignee:
          "https://cdn.builder.io/api/v1/image/assets/3fb845989a8f42ec8314926589656a8c/6508bcc19dfea9a7e9a7e7f3a2062210d75915210c76e2fca3474bac0a737b40?placeholderIfAbsent=true",
      },
    ],
    filter: "all",
    searchQuery: "",
  };
  
  // DOM Elements
  const taskInput = document.querySelector(".task-input");
  const addTaskButton = document.querySelector(".add-task-button");
  const deleteDialog = document.querySelector("#deleteDialog");
  const cancelDeleteBtn = document.querySelector("#cancelDelete");
  const confirmDeleteBtn = document.querySelector("#confirmDelete");
  let taskToDelete = null;
  const taskList = document.querySelector(".task-list");
  const filterButtons = document.querySelectorAll(".filter-button");
  const searchInput = document.querySelector(".search-input");
  const statsTotal = document.querySelector(".stat-value");
  const statsCompleted = document.querySelectorAll(".stat-value")[1];
  const statsPending = document.querySelectorAll(".stat-value")[2];
  
  // Utility Functions
  const generateId = () => Math.random().toString(36).substr(2, 9);
  
  const updateStatistics = () => {
    const total = state.tasks.length;
    const completed = state.tasks.filter((task) => task.completed).length;
    const pending = total - completed;
  
    statsTotal.textContent = total;
    statsCompleted.textContent = completed;
    statsPending.textContent = pending;
  };
  
  const createTaskElement = (task) => {
    const li = document.createElement("li");
    li.className = `task-item${task.completed ? " completed" : ""}`;
    li.dataset.id = task.id;
  
    li.innerHTML = `
      <div class="task-content">
        ${
          task.completed
            ? `<img src="https://cdn.builder.io/api/v1/image/assets/3fb845989a8f42ec8314926589656a8c/569b5343eea29cff3a9a31ad854649c54847d8c8e1a7c8add811cfb1e006573e?placeholderIfAbsent=true" alt="Completed" class="completed-icon" />`
            : `<input type="checkbox" class="task-checkbox" ${task.completed ? "checked" : ""} />`
        }
        <span class="task-text">${task.text}</span>
      </div>
      <div class="task-meta">
        <time class="task-date">${task.date}</time>
        <span class="priority-indicator ${task.priority}"></span>
        <img src="${task.assignee}" alt="Assignee" class="assignee-image" />
        <button class="delete-button" aria-label="Delete task">
          <svg viewBox="0 0 24 24">
            <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"/>
          </svg>
        </button>
      </div>
    `;
  
    // Add checkbox event listener
    const checkbox = li.querySelector(".task-checkbox");
    if (checkbox) {
      checkbox.addEventListener("change", () => toggleTask(task.id));
    }
  
    return li;
  };
  
  // Task Operations
  const addTask = (text) => {
    if (!text.trim()) return;
  
    const newTask = {
      id: generateId(),
      text: text.trim(),
      completed: false,
      date: new Date().toISOString().split("T")[0],
      priority: "high",
      assignee:
        "https://cdn.builder.io/api/v1/image/assets/3fb845989a8f42ec8314926589656a8c/6508bcc19dfea9a7e9a7e7f3a2062210d75915210c76e2fca3474bac0a737b40?placeholderIfAbsent=true",
    };
  
    state.tasks.unshift(newTask);
    renderTasks();
    updateStatistics();
    taskInput.value = "";
  };
  
  const toggleTask = (taskId) => {
    state.tasks = state.tasks.map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task,
    );
    renderTasks();
    updateStatistics();
  };
  
  const filterTasks = () => {
    return state.tasks.filter((task) => {
      const matchesFilter =
        state.filter === "all" ||
        (state.filter === "active" && !task.completed) ||
        (state.filter === "completed" && task.completed);
  
      const matchesSearch = task.text
        .toLowerCase()
        .includes(state.searchQuery.toLowerCase());
  
      return matchesFilter && matchesSearch;
    });
  };
  
  const renderTasks = () => {
    const filteredTasks = filterTasks();
    taskList.innerHTML = "";
    filteredTasks.forEach((task) => {
      taskList.appendChild(createTaskElement(task));
    });
  };
  
  // Event Listeners
  addTaskButton.addEventListener("click", () => {
    addTask(taskInput.value);
  });
  
  // Delete task functionality
  const deleteTask = (taskId) => {
    state.tasks = state.tasks.filter((task) => task.id !== taskId);
    renderTasks();
    updateStatistics();
  };
  
  const showDeleteConfirmation = (taskId) => {
    taskToDelete = taskId;
    deleteDialog.classList.add("active");
  };
  
  const hideDeleteConfirmation = () => {
    deleteDialog.classList.remove("active");
    taskToDelete = null;
  };
  
  // Add click handler for delete buttons
  taskList.addEventListener("click", (e) => {
    const deleteButton = e.target.closest(".delete-button");
    if (deleteButton) {
      const taskItem = deleteButton.closest(".task-item");
      showDeleteConfirmation(taskItem.dataset.id);
    }
  });
  
  // Confirmation dialog event listeners
  cancelDeleteBtn.addEventListener("click", hideDeleteConfirmation);
  
  confirmDeleteBtn.addEventListener("click", () => {
    if (taskToDelete) {
      deleteTask(taskToDelete);
      hideDeleteConfirmation();
    }
  });
  
  // Close dialog when clicking outside
  deleteDialog.addEventListener("click", (e) => {
    if (e.target === deleteDialog) {
      hideDeleteConfirmation();
    }
  });
  
  // Close dialog with Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && deleteDialog.classList.contains("active")) {
      hideDeleteConfirmation();
    }
  });
  
  taskInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      addTask(taskInput.value);
    }
  });
  
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      filterButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      state.filter = button.textContent.toLowerCase();
      renderTasks();
    });
  });
  
  searchInput.addEventListener("input", (e) => {
    state.searchQuery = e.target.value;
    renderTasks();
  });
  
  // Initial render
  renderTasks();
  updateStatistics();
  