
// ======================================
// TASK MANAGER APPLICATION
// ======================================

// Get HTML elements
const taskForm = document.getElementById("taskForm");
const taskTitle = document.getElementById("taskTitle");
const taskDescription = document.getElementById("taskDescription");
const taskPriority = document.getElementById("taskPriority");
const taskDate = document.getElementById("taskDate");

const taskList = document.getElementById("taskList");
const searchInput = document.getElementById("searchInput");
const filterTasks = document.getElementById("filterTasks");

const totalTasks = document.getElementById("totalTasks");
const pendingTasks = document.getElementById("pendingTasks");
const completedTasks = document.getElementById("completedTasks");

const emptyMessage = document.getElementById("emptyMessage");
const formHeading = document.getElementById("formHeading");
const submitButton = document.getElementById("submitButton");
const cancelEdit = document.getElementById("cancelEdit");

// Load saved tasks from Local Storage
let tasks = [];

try {
    const savedTasks = JSON.parse(
        localStorage.getItem("myTasks") || "[]"
    );

    tasks = Array.isArray(savedTasks) ? savedTasks : [];
} catch (error) {
    console.error("Unable to load saved tasks:", error);
}

// Track the task currently being edited
let editingTaskId = null;


// ======================================
// SAVE TASKS
// ======================================

function saveTasks() {
    try {
        localStorage.setItem("myTasks", JSON.stringify(tasks));
    } catch (error) {
        alert("Unable to save tasks. Check your browser storage.");
        console.error(error);
    }
}


// ======================================
// UPDATE TASK STATISTICS
// ======================================

function updateStatistics() {
    const total = tasks.length;

    const completed = tasks.filter(
        task => task.completed
    ).length;

    const pending = total - completed;

    totalTasks.textContent = total;
    pendingTasks.textContent = pending;
    completedTasks.textContent = completed;
}


// ======================================
// DISPLAY TASKS
// ======================================

function displayTasks() {
    taskList.replaceChildren();

    const searchText = searchInput.value.toLowerCase().trim();
    const selectedFilter = filterTasks.value;

    const filteredTasks = tasks.filter(task => {

        const matchesSearch =
            task.title.toLowerCase().includes(searchText) ||
            (task.description || "").toLowerCase().includes(searchText);

        const matchesFilter =
            selectedFilter === "All" ||
            (selectedFilter === "Completed" && task.completed) ||
            (selectedFilter === "Pending" && !task.completed);

        return matchesSearch && matchesFilter;
    });

    // Show empty message when no tasks match
    emptyMessage.style.display =
        filteredTasks.length === 0 ? "block" : "none";

    filteredTasks.forEach(task => {

        // Create task card
        const card = document.createElement("div");
        card.className = "task-card";

        if (task.completed) {
            card.classList.add("completed");
        }

        // Task information
        const info = document.createElement("div");
        info.className = "task-info";

        const title = document.createElement("h3");
        title.textContent = task.title;

        const description = document.createElement("p");
        description.textContent =
            task.description || "No description provided.";

        const meta = document.createElement("div");
        meta.className = "task-meta";

        const priority = document.createElement("span");
        priority.className = "priority " + task.priority;
        priority.textContent = task.priority + " Priority";

        const date = document.createElement("span");
        date.textContent = task.dueDate
            ? "Due: " + task.dueDate
            : "No due date";

        const status = document.createElement("span");
        status.textContent = task.completed
            ? "Completed"
            : "Pending";

        meta.append(priority, date, status);
        info.append(title, description, meta);

        // Task action buttons
        const actions = document.createElement("div");
        actions.className = "task-actions";

        const completeButton = document.createElement("button");
        completeButton.className = "complete-btn";
        completeButton.textContent = task.completed
            ? "Undo"
            : "Complete";

        completeButton.addEventListener("click", () => {
            toggleTask(task.id);
        });

        const editButton = document.createElement("button");
        editButton.className = "edit-btn";
        editButton.textContent = "Edit";

        editButton.addEventListener("click", () => {
            editTask(task.id);
        });

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", () => {
            deleteTask(task.id);
        });

        actions.append(
            completeButton,
            editButton,
            deleteButton
        );

        card.append(info, actions);
        taskList.appendChild(card);
    });

    updateStatistics();
}


// ======================================
// ADD OR UPDATE TASK
// ======================================

taskForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const title = taskTitle.value.trim();
    const description = taskDescription.value.trim();
    const priority = taskPriority.value;
    const dueDate = taskDate.value;

    if (!title) {
        alert("Please enter a task title.");
        return;
    }

    if (editingTaskId !== null) {

        // Update existing task
        const task = tasks.find(
            task => task.id === editingTaskId
        );

        if (task) {
            task.title = title;
            task.description = description;
            task.priority = priority;
            task.dueDate = dueDate;
        }

        editingTaskId = null;

    } else {

        // Create new task
        const newTask = {
            id: Date.now(),
            title: title,
            description: description,
            priority: priority,
            dueDate: dueDate,
            completed: false
        };

        tasks.unshift(newTask);
    }

    saveTasks();
    taskForm.reset();
    resetForm();
    displayTasks();
});


// ======================================
// EDIT TASK
// ======================================

function editTask(id) {

    const task = tasks.find(
        task => task.id === id
    );

    if (!task) return;

    taskTitle.value = task.title;
    taskDescription.value = task.description || "";
    taskPriority.value = task.priority;
    taskDate.value = task.dueDate || "";

    editingTaskId = id;

    formHeading.textContent = "Edit Task";
    submitButton.textContent = "Update Task";
    cancelEdit.classList.remove("hidden");

    // Scroll to the form
    taskForm.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}


// ======================================
// RESET EDIT FORM
// ======================================

function resetForm() {

    editingTaskId = null;

    formHeading.textContent = "Add New Task";
    submitButton.textContent = "Add Task";
    cancelEdit.classList.add("hidden");
}


// Cancel editing
cancelEdit.addEventListener("click", function() {

    taskForm.reset();
    resetForm();

});


// ======================================
// MARK TASK AS COMPLETED OR PENDING
// ======================================

function toggleTask(id) {

    const task = tasks.find(
        task => task.id === id
    );

    if (!task) return;

    task.completed = !task.completed;

    saveTasks();
    displayTasks();
}


// ======================================
// DELETE TASK
// ======================================

function deleteTask(id) {

    const confirmation = confirm(
        "Are you sure you want to delete this task?"
    );

    if (!confirmation) return;

    tasks = tasks.filter(
        task => task.id !== id
    );

    if (editingTaskId === id) {
        taskForm.reset();
        resetForm();
    }

    saveTasks();
    displayTasks();
}


// ======================================
// SEARCH TASKS
// ======================================

searchInput.addEventListener("input", function() {
    displayTasks();
});


// ======================================
// FILTER TASKS
// ======================================

filterTasks.addEventListener("change", function() {
    displayTasks();
});


// ======================================
// INITIALIZE APPLICATION
// ======================================

// Display previously saved tasks
displayTasks();
