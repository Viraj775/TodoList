// Load todos from localStorage
function loadTodos() {
    const savedTodos = localStorage.getItem('todos');
    return savedTodos ? JSON.parse(savedTodos) : [];
}

function saveTodos(todos) {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// Initialize the todo list
let todos = loadTodos();
renderTodos();
updatePerformance();

// Update the time every second
setInterval(() => {
    const date = new Date().toLocaleTimeString();
    document.getElementById("date").innerHTML = date;
}, 1000);

// Toggle Dark Mode
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
}

// Add Todo Item
document.getElementById('todo').addEventListener('click', function () {
    const todoText = document.getElementById('search').value;
    const dueDate = document.getElementById('due-date').value;
    const dueTime = document.getElementById('due-time').value;
    const dateTimeString = `${dueDate}T${dueTime}`; // Template literal for dateTimeString

    if (todoText && dueDate && dueTime) {
        const newTodo = { text: todoText, dueDateTime: dateTimeString, completed: false };
        todos.push(newTodo);
        saveTodos(todos);
        addTodoItem(newTodo);
        document.getElementById('search').value = '';
        document.getElementById('due-date').value = '';
        document.getElementById('due-time').value = '';
    }
});

// Handle Search
document.getElementById('items').addEventListener('input', function () {
    const searchText = this.value.toLowerCase();
    const todoItems = document.querySelectorAll('.todo-item');
    todoItems.forEach(item => {
        const text = item.querySelector('.todo-text').value.toLowerCase();
        item.style.display = text.includes(searchText) ? '' : 'none';
    });
});

// Add a new Todo item to the DOM
function addTodoItem(todo) {
    const todoOutput = document.querySelector('.todo-output');

    const newItem = document.createElement('div');
    newItem.className = 'todo-item';
    newItem.dataset.index = todos.indexOf(todo);

    newItem.innerHTML = `
        <input type='checkbox' class='todo-check' ${todo.completed ? 'checked' : ''}>
        <input type='text' class='todo-text' value='${todo.text}' disabled>
        <span class='todo-date-time'>Due: ${new Date(todo.dueDateTime).toLocaleString()}</span>
        <button class='todo-edit'>Edit</button>
        <button class='todo-delete'>Delete</button>
    `; // Use template literals for HTML

    todoOutput.appendChild(newItem);

    const editButton = newItem.querySelector('.todo-edit');
    const deleteButton = newItem.querySelector('.todo-delete');
    const textInput = newItem.querySelector('.todo-text');
    const checkBox = newItem.querySelector('.todo-check');

    editButton.addEventListener('click', function () {
        if (this.textContent === 'Edit') {
            textInput.disabled = false;
            this.textContent = 'Save';
            textInput.focus();
        } else {
            textInput.disabled = true;
            this.textContent = 'Edit';
            todos[newItem.dataset.index].text = textInput.value;
            saveTodos(todos);
        }
    });

    deleteButton.addEventListener('click', function () {
        todos.splice(newItem.dataset.index, 1);
        saveTodos(todos);
        newItem.remove();
        showCustomAlert(); // Update alert list
        updatePerformance(); // Update performance report
    });

    checkBox.addEventListener('change', function () {
        todos[newItem.dataset.index].completed = this.checked;
        saveTodos(todos);
        textInput.classList.toggle('checked', this.checked);
        updatePerformance(); // Update performance report
    });

    // Schedule alert for the due date and time
    scheduleAlert(todo.dueDateTime, todo.text);
}

// Schedule an alert for the todo item
function scheduleAlert(dateTime, text) {
    const dueDateTime = new Date(dateTime).getTime();
    const now = new Date().getTime();
    const timeDifference = dueDateTime - now;

    // Only schedule alerts for future dates
    if (timeDifference > 0) {
        setTimeout(() => {
            alert(`Reminder: ${text}`); // Template literal for alert
            showCustomAlert(); // Update the alert list
            updatePerformance(); // Update the performance report
        }, timeDifference);
    }
}

// Show all alerts in the alert list
function showCustomAlert() {
    const alertList = document.getElementById('alert-list');
    alertList.innerHTML = ''; // Clear previous alerts

    todos.forEach(todo => {
        const dueDateTime = new Date(todo.dueDateTime).getTime();
        if (dueDateTime > new Date().getTime()) { // Show only upcoming todos
            const alertTime = new Date(todo.dueDateTime).toLocaleString();
            const alertItem = document.createElement('div');
            alertItem.className = 'alert-item';
            alertItem.textContent = `Reminder: ${todo.text} (Due: ${alertTime})`; // Template literal for alert item
            alertList.appendChild(alertItem);
        }
    });
}

// Toggle alert list visibility
document.getElementById('report').addEventListener('click', function () {
    const alertList = document.getElementById('alert-list');
    alertList.style.display = alertList.style.display === 'none' ? 'block' : 'none';
});

// Calculate and show performance based on completed tasks
function updatePerformance() {
    const completedCount = todos.filter(todo => todo.completed).length;
    const totalCount = todos.length;
    const performance = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;

    document.getElementById('performance').textContent = `${performance}%`; // Template literal for performance
}

// Handle performance button click
document.getElementById('performance-button').addEventListener('click', function () {
    const performanceReport = document.getElementById('performance-report');
    performanceReport.innerHTML = `<strong>Performance:</strong> ${document.getElementById('performance').textContent}`; // Template literal for performance report
    performanceReport.style.display = performanceReport.style.display === 'none' ? 'block' : 'none';
});

// Render todos on page load
function renderTodos() {
    todos.forEach(todo => {
        // Add the todo item to the DOM
        addTodoItem(todo);

        // Schedule an alert only if the due date is in the future
        const dueDateTime = new Date(todo.dueDateTime).getTime();
        if (dueDateTime > new Date().getTime()) {
            scheduleAlert(todo.dueDateTime, todo.text);
        }
    });

    showCustomAlert(); // Ensure the alert list is shown
    updatePerformance(); // Ensure the performance report is up-to-date
}
