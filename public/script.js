document.addEventListener('DOMContentLoaded', () => {
  // Check if user is already logged in
  const token = localStorage.getItem('token');
  if (token) {
    showAppContent();
    loadTasks();
  } else {
    // Show auth forms if not logged in
    document.getElementById('authForms').style.display = 'block';
  }
});

// ============= NEW AUTHENTICATION FUNCTIONS =============
async function login() {
  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;

  try {
    const response = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    
    if (response.ok) {
      localStorage.setItem('token', data.token);
      showAppContent();
      loadTasks();
    } else {
      alert(data.message || 'Login failed');
    }
  } catch (err) {
    console.error('Login error:', err);
    alert('Login error');
  }
}

async function signup() {
  const username = document.getElementById('signupUsername').value;
  const password = document.getElementById('signupPassword').value;

  try {
    const response = await fetch('/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    
    if (response.ok) {
      localStorage.setItem('token', data.token);
      showAppContent();
      loadTasks();
    } else {
      alert(data.message || 'Signup failed');
    }
  } catch (err) {
    console.error('Signup error:', err);
    alert('Signup error');
  }
}

function logout() {
  localStorage.removeItem('token');
  document.getElementById('appContent').style.display = 'none';
  document.getElementById('authForms').style.display = 'block';
  document.getElementById('taskList').innerHTML = '';
}

function showAppContent() {
  document.getElementById('authForms').style.display = 'none';
  document.getElementById('appContent').style.display = 'block';
}

// ============= YOUR ORIGINAL FUNCTIONS (MODIFIED TO INCLUDE TOKEN) =============
async function loadTasks() {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      logout();
      return;
    }

    const response = await fetch('/tasks', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.status === 401) {
      logout();
      return;
    }
    
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
  const token = localStorage.getItem('token');

  if (!title) {
    alert('Please enter a task title');
    return;
  }

  try {
    const response = await fetch('/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
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
    } else if (response.status === 401) {
      logout();
    }
  } catch (err) {
    console.error('Error adding task:', err);
  }
}

async function toggleTaskStatus(taskId, currentStatus) {
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch(`/tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        status: currentStatus === 'completed' ? 'not completed' : 'completed'
      }),
    });

    if (response.ok) {
      loadTasks();
    } else if (response.status === 401) {
      logout();
    }
  } catch (err) {
    console.error('Error toggling task status:', err);
  }
}

async function editTaskPrompt(taskId, currentTitle, currentDesc, currentStatus) {
  const newTitle = prompt('Edit task title:', currentTitle);
  if (newTitle === null) return;

  const newDesc = prompt('Edit task description:', currentDesc);
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch(`/tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: newTitle,
        description: newDesc,
        status: currentStatus
      }),
    });

    if (response.ok) {
      loadTasks();
    } else if (response.status === 401) {
      logout();
    }
  } catch (err) {
    console.error('Error editing task:', err);
  }
}

async function deleteTask(taskId) {
  if (!confirm('Are you sure you want to delete this task?')) return;
  const token = localStorage.getItem('token');

  try {
    const response = await fetch(`/tasks/${taskId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      loadTasks();
    } else if (response.status === 401) {
      logout();
    }
  } catch (err) {
    console.error('Error deleting task:', err);
  }
}