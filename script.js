
document.addEventListener('DOMContentLoaded', function () {
    // Load tasks from local storage
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentFilter = 'all';

    const taskInput = document.getElementById('taskInput');
    const dueDateInput = document.getElementById('dueDateInput');
    const addTaskBtn = document.getElementById('addTask');
    const taskList = document.getElementById('taskList');

    const filterAll = document.getElementById('filterAll');
    const filterPending = document.getElementById('filterPending');
    const filterCompleted = document.getElementById('filterCompleted');
    const filterDueSoon = document.getElementById('filterDueSoon');

    const welcomeModal = document.getElementById('welcomeModal');
    const closeWelcomeModal = document.getElementById('closeWelcomeModal');
    const aboutModal = document.getElementById('aboutModal');
    const closeAboutModal = document.getElementById('closeAboutModal');
    const aboutLink = document.getElementById('aboutLink');

    // Show welcome modal if it's the first visit
    if (!localStorage.getItem('welcomeShown')) {
        welcomeModal.style.display = 'flex';
        localStorage.setItem('welcomeShown', 'true');
    }

    // Close welcome modal
    closeWelcomeModal.addEventListener('click', function () {
        welcomeModal.style.display = 'none';
    });

    // Show about modal
    aboutLink.addEventListener('click', function (e) {
        e.preventDefault();
        aboutModal.style.display = 'flex';
    });

    // Close about modal
    closeAboutModal.addEventListener('click', function () {
        aboutModal.style.display = 'none';
    });

    // Close modals when clicking outside
    window.addEventListener('click', function (e) {
        if (e.target === welcomeModal) {
            welcomeModal.style.display = 'none';
        }
        if (e.target === aboutModal) {
            aboutModal.style.display = 'none';
        }
    });

    // Set default due date to today
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    dueDateInput.value = `${year}-${month}-${day}T${hours}:${minutes}`;

    // Format date for display
    function formatDate(dateString) {
        if (!dateString) return 'No due date';

        const date = new Date(dateString);
        const options = {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };

        return date.toLocaleDateString('en-US', options);
    }

    // Check if task is due soon (within 24 hours)
    function isDueSoon(dateString) {
        if (!dateString) return false;

        const dueDate = new Date(dateString);
        const now = new Date();
        const diffMs = dueDate - now;
        const diffHours = diffMs / (1000 * 60 * 60);

        return diffHours > 0 && diffHours <= 24;
    }

    // Check if task is past due
    function isPastDue(dateString) {
        if (!dateString) return false;

        const dueDate = new Date(dateString);
        const now = new Date();

        return dueDate < now;
    }

    // Display tasks based on filter
    function renderTasks() {
        taskList.innerHTML = '';

        const filteredTasks = tasks.filter(task => {
            if (currentFilter === 'all') return true;
            if (currentFilter === 'pending') return !task.completed;
            if (currentFilter === 'completed') return task.completed;
            if (currentFilter === 'dueSoon') {
                return !task.completed && isDueSoon(task.dueDate);
            }
            return true;
        });

        filteredTasks.forEach((task, index) => {
            const taskElement = document.createElement('div');
            taskElement.className = 'task';

            const taskDetails = document.createElement('div');
            taskDetails.className = task.completed ? 'task-details completed' : 'task-details';

            const taskText = document.createElement('div');
            taskText.className = 'task-text';
            taskText.textContent = task.text;

            const taskDue = document.createElement('div');
            taskDue.textContent = 'Due: ' + formatDate(task.dueDate);

            if (isPastDue(task.dueDate) && !task.completed) {
                taskDue.className = 'task-due task-past-due';
            } else if (isDueSoon(task.dueDate) && !task.completed) {
                taskDue.className = 'task-due task-due-soon';
            } else {
                taskDue.className = 'task-due';
            }

            const actionButtons = document.createElement('div');
            actionButtons.className = 'action-buttons';

            const completeBtn = document.createElement('button');
            completeBtn.className = 'action-btn complete-btn';
            completeBtn.textContent = task.completed ? 'Undo' : 'Complete';
            completeBtn.onclick = () => toggleComplete(index);

            const editBtn = document.createElement('button');
            editBtn.className = 'action-btn edit-btn';
            editBtn.textContent = 'Edit';
            editBtn.onclick = () => editTask(index);

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'action-btn delete-btn';
            deleteBtn.textContent = 'Delete';
            deleteBtn.onclick = () => deleteTask(index);

            taskDetails.appendChild(taskText);
            taskDetails.appendChild(taskDue);

            actionButtons.appendChild(completeBtn);
            actionButtons.appendChild(editBtn);
            actionButtons.appendChild(deleteBtn);

            taskElement.appendChild(taskDetails);
            taskElement.appendChild(actionButtons);

            taskList.appendChild(taskElement);
        });

        // Save to local storage
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // Add a new task
    function addTask() {
        const text = taskInput.value.trim();
        const dueDate = dueDateInput.value;

        if (text) {
            tasks.push({
                text: text,
                dueDate: dueDate,
                completed: false
            });

            // Sort tasks by due date
            tasks.sort((a, b) => {
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;
                return new Date(a.dueDate) - new Date(b.dueDate);
            });

            taskInput.value = '';
            renderTasks();
        }
    }

    // Delete a task
    function deleteTask(index) {
        const realIndex = tasks.findIndex((task, i) => i === index);
        if (realIndex !== -1) {
            tasks.splice(realIndex, 1);
            renderTasks();
        }
    }

    // Edit a task
    function editTask(index) {
        const task = tasks[index];
        const newText = prompt('Edit the task:', task.text);

        if (newText !== null) {
            const newDueDate = prompt('Enter new due date and time (YYYY-MM-DDTHH:MM):', task.dueDate);

            task.text = newText.trim();
            if (newDueDate && newDueDate.trim()) {
                task.dueDate = newDueDate.trim();
            }

            renderTasks();
        }
    }

    // Toggle task complete status
    function toggleComplete(index) {
        tasks[index].completed = !tasks[index].completed;
        renderTasks();
    }

    // Set active filter
    function setFilter(filter) {
        currentFilter = filter;

        // Update active filter button
        [filterAll, filterPending, filterCompleted, filterDueSoon].forEach(btn => {
            btn.classList.remove('active');
        });

        if (filter === 'all') filterAll.classList.add('active');
        if (filter === 'pending') filterPending.classList.add('active');
        if (filter === 'completed') filterCompleted.classList.add('active');
        if (filter === 'dueSoon') filterDueSoon.classList.add('active');

        renderTasks();
    }

    // Event listeners
    addTaskBtn.addEventListener('click', addTask);

    taskInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    filterAll.addEventListener('click', () => setFilter('all'));
    filterPending.addEventListener('click', () => setFilter('pending'));
    filterCompleted.addEventListener('click', () => setFilter('completed'));
    filterDueSoon.addEventListener('click', () => setFilter('dueSoon'));

    // Initial render
    renderTasks();
});
