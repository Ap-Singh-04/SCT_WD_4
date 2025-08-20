
const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const dateInput = document.getElementById("dueDate");
const taskList = document.getElementById("taskList");
const totalCountEl = document.getElementById("totalCount");
const completedCountEl = document.getElementById("completedCount");

addBtn.addEventListener("click", addTask);
taskInput.addEventListener("keypress", e => {
    if (e.key === "Enter") addTask();
});

function updateCounters() {
    const total = taskList.children.length;
    const completed = document.querySelectorAll("#taskList .completed").length;

    totalCountEl.textContent = total;
    completedCountEl.textContent = completed;

    const percentage = total === 0 ? 0 : (completed / total) * 100;
    document.querySelector(".progress-fill").style.width = `${percentage}%`;

    let hexColor;
    if (percentage === 100) {
        hexColor = "#4caf50";
    } else if (percentage >= 50) {
        hexColor = "#ffc107";
    } else {
        hexColor = "#fdae5c";
    }

    const hex = document.querySelector(".stats-hexagon");
    hex.style.backgroundColor = hexColor;
    hex.style.setProperty("--hex-color", hexColor);

    const tex = document.querySelector(".stats-text");
    let opac;
    if (percentage >= 50) {
       opac = 1;
    }
    else {
       opac = 0;
    }
    tex.style.opacity = opac;
    tex.style.setProperty("opacity", opac);


    const styleSheet = document.styleSheets[0];
    styleSheet.insertRule(`.stats-hexagon:before { border-bottom-color: ${hexColor}; }`, styleSheet.cssRules.length);
    styleSheet.insertRule(`.stats-hexagon:after { border-top-color: ${hexColor}; }`, styleSheet.cssRules.length);
}

function sortTasks() {
    const tasks = Array.from(taskList.children);
    tasks.sort((a, b) => {
        const now = new Date();
        const dateA = new Date(a.dataset.dueDate || 0);
        const dateB = new Date(b.dataset.dueDate || 0);
        const isOverdueA = dateA < now && !a.querySelector("input").checked && a.dataset.dueDate;
        const isOverdueB = dateB < now && !b.querySelector("input").checked && b.dataset.dueDate;
        if (isOverdueA && !isOverdueB) return -1;
        if (!isOverdueA && isOverdueB) return 1;
        return dateA - dateB;
    });
    taskList.innerHTML = "";
    tasks.forEach(task => taskList.appendChild(task));
}

function checkOverdue(li, dateVal) {
    if (dateVal && new Date(dateVal) < new Date() && !li.querySelector("input").checked) {
        li.classList.add("overdue");
    } else {
        li.classList.remove("overdue");
    }
}

function addTask() {
    const taskText = taskInput.value.trim();
    const dueDateVal = dateInput.value;
    if (taskText === "") return;

    const li = document.createElement("li");
    li.dataset.dueDate = dueDateVal;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.addEventListener("change", () => {
        span.classList.toggle("completed", checkbox.checked);
        checkOverdue(li, li.dataset.dueDate);
        updateCounters();
        sortTasks();
    });

    const span = document.createElement("span");
    span.textContent = taskText;

    const dateSpan = document.createElement("span");
    dateSpan.classList.add("date-time");
    dateSpan.textContent = dueDateVal ? ` (Due: ${new Date(dueDateVal).toLocaleString()})` : "";

    const editBtn = document.createElement("button");
    editBtn.innerHTML = "✏";
    editBtn.classList.add("edit-btn");
    editBtn.addEventListener("click", () => {
        const textInput = document.createElement("input");
        textInput.type = "text";
        textInput.value = span.textContent;

        const dateEdit = document.createElement("input");
        dateEdit.type = "datetime-local";
        dateEdit.value = li.dataset.dueDate || "";

        contentWrapper.replaceChild(textInput, span);
        contentWrapper.replaceChild(dateEdit, dateSpan);
        textInput.focus();

        function saveEdit() {
            span.textContent = textInput.value.trim() || "Untitled Task";
            li.dataset.dueDate = dateEdit.value;
            dateSpan.textContent = dateEdit.value
                ? ` (Due: ${new Date(dateEdit.value).toLocaleString()})`
                : "";

            if (contentWrapper.contains(textInput)) {
                contentWrapper.replaceChild(span, textInput);
            }
            if (contentWrapper.contains(dateEdit)) {
                contentWrapper.replaceChild(dateSpan, dateEdit);
            }

            checkOverdue(li, li.dataset.dueDate);
            updateCounters();
            sortTasks();
        }

        textInput.addEventListener("keypress", e => {
            if (e.key === "Enter") saveEdit();
        });
        dateEdit.addEventListener("change", saveEdit);
        document.addEventListener("click", function outsideClick(e) {
            if (!li.contains(e.target)) {
                saveEdit();
                document.removeEventListener("click", outsideClick);
            }
        });
    });

    const delBtn = document.createElement("button");
    delBtn.innerHTML = "✖";
    delBtn.classList.add("delete-btn");
    delBtn.addEventListener("click", () => {
        li.remove();
        updateCounters();
    });

    const contentWrapper = document.createElement("div");
    contentWrapper.classList.add("task-content");
    contentWrapper.appendChild(span);
    contentWrapper.appendChild(dateSpan);

    const actionsWrapper = document.createElement("div");
    actionsWrapper.classList.add("task-actions");
    actionsWrapper.appendChild(editBtn);
    actionsWrapper.appendChild(delBtn);

    li.appendChild(checkbox);
    li.appendChild(contentWrapper);
    li.appendChild(actionsWrapper);
    taskList.appendChild(li);

    checkOverdue(li, dueDateVal);
    taskInput.value = "";
    dateInput.value = "";
    updateCounters();
    sortTasks();
}
