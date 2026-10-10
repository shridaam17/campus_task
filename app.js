
const tasks = [
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


const taskList = document.getElementById("taskList");

const totalTasks = document.getElementById("totalTasks");
const completedTasks = document.getElementById("completedTasks");
const pendingTasks = document.getElementById("pendingTasks");
const overdueTasks = document.getElementById("overdueTasks");



function renderTasks() {
    taskList.innerHTML = tasks.map(function (task) {
        return `
            <div class="task-row">
                <div class="task-title">
                    <input
                        type="checkbox"
                        data-id="${task.id}"
                        ${task.completed ? "checked" : ""}
                    >
                    <span>${task.title}</span>
                </div>

                <span>${task.subject}</span>
                <span>${task.dueDate}</span>
                <span>${task.priority}</span>
                <span>${task.completed ? "Completed" : "Pending"}</span>
            </div>
        `;
    }).join("");
}

taskList.addEventListener("change", function (event) {
    if (event.target.type === "checkbox") {
        const taskId = Number(event.target.dataset.id);

        const task = tasks.find(function (task) {
            return task.id === taskId;
        });

        if (task) {
            task.completed = event.target.checked;
        }

        renderTasks();
        updateStats();
    }
});

renderTasks();


function updateStats() {
    const total = tasks.length;

    const completed = tasks.filter(function (task) {
        return task.completed;
    }).length;

    const pending = total - completed;

    totalTasks.textContent = total;
    completedTasks.textContent = completed;
    pendingTasks.textContent = pending;
    overdueTasks.textContent = 0;
}

updateStats();


