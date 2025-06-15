
document.addEventListener('DOMContentLoaded', loadTasks);

async function loadTasks() {
  try {
    const response = await fetch('/tasks');
    const tasks = await response.json();
    displayTasks(tasks);
  } catch (err) {
    console.error('Error loading tasks:', err);
  }
}

function displayTasks(tasks) {
  const taskList = document.getElementById('taskList');
  taskList.innerHTML = '';

  tasks.forEach(task => {
    const taskElement = document.createElement('div');
    taskElement.className = `task ${task.status === 'completed' ? 'completed' : ''}`;
    taskElement.innerHTML = `
      <h3>${task.title}</h3>
      ${task.description ? `<p>${task.description}</p>` : ''}
      <div class="task-actions">
        <button class="complete-btn" onclick="toggleTaskStatus('${task._id}', '${task.status}')">
          ${task.status === 'completed' ? 'Undo' : 'Complete'}
        </button>
        <button class="edit-btn" onclick="editTaskPrompt('${task._id}', '${task.title}', '${task.description}', '${task.status}')">
          Edit
        </button>
        <button class="delete-btn" onclick="deleteTask('${task._id}')">
          Delete
        </button>
      </div>
    `;
    taskList.appendChild(taskElement);
  });
}

async function addTask() {
  const title = document.getElementById('taskTitle').value;
  const description = document.getElementById('taskDesc').value;

  if (!title) {
    alert('Please enter a task title');
    return;
  }

  try {
    const response = await fetch('/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        description,
        status: 'not completed'
      }),
    });

    if (response.ok) {
      document.getElementById('taskTitle').value = '';
      document.getElementById('taskDesc').value = '';
      loadTasks();
    }
  } catch (err) {
    console.error('Error adding task:', err);
  }
}

async function toggleTaskStatus(taskId, currentStatus) {
  try {
    const response = await fetch(`/tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: currentStatus === 'completed' ? 'not completed' : 'completed'
      }),
    });

    if (response.ok) {
      loadTasks();
    }
  } catch (err) {
    console.error('Error toggling task status:', err);
  }
}

async function editTaskPrompt(taskId, currentTitle, currentDesc, currentStatus) {
  const newTitle = prompt('Edit task title:', currentTitle);
  if (newTitle === null) return; // User cancelled

  const newDesc = prompt('Edit task description:', currentDesc);
  
  try {
    const response = await fetch(`/tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: newTitle,
        description: newDesc,
        status: currentStatus
      }),
    });

    if (response.ok) {
      loadTasks();
    }
  } catch (err) {
    console.error('Error editing task:', err);
  }
}

async function deleteTask(taskId) {
  if (!confirm('Are you sure you want to delete this task?')) return;

  try {
    const response = await fetch(`/tasks/${taskId}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      loadTasks();
    }
  } catch (err) {
    console.error('Error deleting task:', err);
  }
}

// Store token after login/signup
localStorage.setItem('token', response.token);

// Add to all fetch requests
const token = localStorage.getItem('token');
fetch('/tasks', {
  headers: { 'Authorization': `Bearer ${token}` }
});