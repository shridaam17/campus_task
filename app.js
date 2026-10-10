const STORAGE_KEY = "campusFlowTasks";

const defaultTasks = [
    {
        id: 1,
        title: "Solve Two Sum",
        subject: "DSA",
        dueDate: "2026-10-12",
        priority: "High",
        completed: false
    },
    {
        id: 2,
        title: "Revise ER Model",
        subject: "DBMS",
        dueDate: "2026-10-13",
        priority: "Medium",
        completed: false
    },
    {
        id: 3,
        title: "Practice Async JavaScript",
        subject: "JavaScript",
        dueDate: "2026-10-15",
        priority: "Low",
        completed: true
    }
];

// Load saved tasks, or use sample tasks on the first visit.
function loadSavedTasks() {
    try {
        const savedData = localStorage.getItem(STORAGE_KEY);

        if (savedData === null) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultTasks));
            return defaultTasks.map(task => ({ ...task }));
        }

        const parsedData = JSON.parse(savedData);

        if (!Array.isArray(parsedData)) {
            throw new Error("Saved task data is invalid.");
        }

        return parsedData;
    } catch (error) {
        console.error("Could not load saved tasks:", error);
        return defaultTasks.map(task => ({ ...task }));
    }
}

const tasks = loadSavedTasks();

const taskList = document.getElementById("taskList");

const totalTasks = document.getElementById("totalTasks");
const completedTasks = document.getElementById("completedTasks");
const pendingTasks = document.getElementById("pendingTasks");
const overdueTasks = document.getElementById("overdueTasks");

const searchInput = document.getElementById("searchInput");
const subjectFilter = document.getElementById("subjectFilter");
const priorityFilter = document.getElementById("priorityFilter");

// Save the current tasks to the browser.
function saveTasks() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
        console.error("Could not save tasks:", error);
        alert("Your changes could not be saved. Check your browser storage.");
    }
}

// Prevent task titles from being interpreted as HTML.
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

function renderTasks() {
    const searchText = searchInput.value.trim().toLowerCase();
    const selectedSubject = subjectFilter.value;
    const selectedPriority = priorityFilter.value;

    const filteredTasks = tasks.filter(task => {
        const matchesSearch =
            task.title.toLowerCase().includes(searchText);

        const matchesSubject =
            !selectedSubject || task.subject === selectedSubject;

        const matchesPriority =
            !selectedPriority || task.priority === selectedPriority;

        return matchesSearch && matchesSubject && matchesPriority;
    });

    if (filteredTasks.length === 0) {
        taskList.innerHTML = `
            <div class="empty-state">
                <p>No tasks found.</p>
            </div>
        `;
        return;
    }

    taskList.innerHTML = filteredTasks.map(task => `
        <div class="task-row">
            <div class="task-title">
                <input
                    type="checkbox"
                    data-action="toggle"
                    data-id="${task.id}"
                    aria-label="Mark ${escapeHTML(task.title)} as completed"
                    ${task.completed ? "checked" : ""}
                >

                <span class="${task.completed ? "completed" : ""}">
                    ${escapeHTML(task.title)}
                </span>

                <button
                    type="button"
                    class="edit-task-btn"
                    data-action="edit"
                    data-id="${task.id}"
                    aria-label="Edit ${escapeHTML(task.title)}"
                >
                    <i class="fa-solid fa-pen"></i>
                    Edit
                </button>
            </div>

            <span>${escapeHTML(task.subject)}</span>
            <span>${escapeHTML(task.dueDate)}</span>
            <span class="priority-${escapeHTML(task.priority.toLowerCase())}">
                ${escapeHTML(task.priority)}
            </span>
            <span>${task.completed ? "Completed" : "Pending"}</span>
        </div>
    `).join("");
}

function updateStats() {
    const total = tasks.length;

    const completed = tasks.filter(task => task.completed).length;
    const pending = total - completed;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdue = tasks.filter(task => {
        if (task.completed || !task.dueDate) {
            return false;
        }

        const dueDate = new Date(`${task.dueDate}T00:00:00`);
        return !Number.isNaN(dueDate.getTime()) && dueDate < today;
    }).length;

    totalTasks.textContent = total;
    completedTasks.textContent = completed;
    pendingTasks.textContent = pending;
    overdueTasks.textContent = overdue;
}

// Edit one task using browser input dialogs.
function editTask(taskId) {
    const task = tasks.find(task => task.id === taskId);

    if (!task) {
        return;
    }

    const title = prompt("Task title:", task.title);

    // Cancel means leave the task unchanged.
    if (title === null) {
        return;
    }

    if (!title.trim()) {
        alert("Task title cannot be empty.");
        return;
    }

    const subject = prompt("Subject:", task.subject);

    if (subject === null) {
        return;
    }

    if (!subject.trim()) {
        alert("Subject cannot be empty.");
        return;
    }

    const dueDate = prompt("Due date (YYYY-MM-DD):", task.dueDate);

    if (dueDate === null) {
        return;
    }

    const dateParts = dueDate.split("-").map(Number);

    if (
        dateParts.length !== 3 ||
        !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)
    ) {
        alert("Enter the date in YYYY-MM-DD format, e.g. 2026-10-12.");
        return;
    }
    
    const [year, month, day] = dateParts;
    const parsedDate = new Date(year, month - 1, day);
    
    if (
        parsedDate.getFullYear() !== year ||
        parsedDate.getMonth() !== month - 1 ||
        parsedDate.getDate() !== day
    ) {
        alert("Please enter a valid date.");
        return;
    }

    const priorityInput = prompt(
        "Priority (High, Medium, Low):",
        task.priority
    );

    if (priorityInput === null) {
        return;
    }

    const priority = ["high", "medium", "low"].find(
        value => value === priorityInput.trim().toLowerCase()
    );

    if (!priority) {
        alert("Priority must be High, Medium, or Low.");
        return;
    }

    task.title = title.trim();
    task.subject = subject.trim();
    task.dueDate = dueDate;
    task.priority = priority.charAt(0).toUpperCase() + priority.slice(1);

    saveTasks();
    renderTasks();
    updateStats();
}

// Event delegation: handle changes on dynamically rendered checkboxes.
taskList.addEventListener("change", function (event) {
    if (event.target.dataset.action !== "toggle") {
        return;
    }

    const taskId = Number(event.target.dataset.id);

    const task = tasks.find(task => task.id === taskId);

    if (!task) {
        return;
    }

    task.completed = event.target.checked;

    saveTasks();
    renderTasks();
    updateStats();
});

// Handle Edit button clicks.
taskList.addEventListener("click", function (event) {
    const editButton = event.target.closest('[data-action="edit"]');

    if (!editButton) {
        return;
    }

    editTask(Number(editButton.dataset.id));
});

// Update the displayed list when search or filters change.
searchInput.addEventListener("input", renderTasks);
subjectFilter.addEventListener("change", renderTasks);
priorityFilter.addEventListener("change", renderTasks);

// Initial display.
renderTasks();
updateStats();