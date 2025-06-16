document.addEventListener('DOMContentLoaded', () => {

  const token = localStorage.getItem('token');
  if (token) {
    showAppContent();
    loadTasks();
  } else {

    document.getElementById('authForms').style.display = 'block';
  }
});




async function login() {
  const username = document.getElementById('loginUsername'); 
  const password = document.getElementById('loginPassword'); 
  
  username.classList.remove('input-error');
  password.classList.remove('input-error');
  
  


  if (!username.value) {
    username.classList.add('input-error');
    return;
  }
  if (!password.value) {
    password.classList.add('input-error');
    return;
  }

  try {
    const response = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        username: username.value,
        password: password.value
      }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem('token', data.token);
      showAppContent();
      loadTasks();
    } else {
      username.classList.add('input-error');
      password.classList.add('input-error');
    }
  } catch (err) {
    console.error('Login error:', err);
    username.classList.add('input-error');
    password.classList.add('input-error');
  }
}

async function signup() {
  const username = document.getElementById('signupUsername'); 
  const password = document.getElementById('signupPassword');

  if (!username || !password) {
    console.error("Error: Couldn't find username/password fields!");
    return;
  }

  
  if (!username.value) {
    username.classList.add('input-error');
    return;
  }
  
  if (!password.value || password.value.length < 8) {
    password.classList.add('input-error');
    return;
  }

  try {
    const response = await fetch('/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        username: username.value, 
        password: password.value   
      }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem('token', data.token);
      showAppContent();
      loadTasks();
    } else {
      username.classList.add('input-error');
      password.classList.add('input-error');
    }
  } catch (err) {
    console.error('Signup error:', err);
    username.classList.add('input-error');
    password.classList.add('input-error');
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
          ${task.status === 'completed' ? 'Finished' : 'Did it'}
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
    alert('Ieraksti taitlu');
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

// async function editTaskPrompt(taskId, currentTitle, currentDesc, currentStatus) {
//   const newTitle = prompt('Edit task title:', currentTitle);
//   if (newTitle === null) return;

//   const newDesc = prompt('Edit task description:', currentDesc);
//   const token = localStorage.getItem('token');
  
//   try {
//     const response = await fetch(`/tasks/${taskId}`, {
//       method: 'PUT',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${token}`
//       },
//       body: JSON.stringify({
//         title: newTitle,
//         description: newDesc,
//         status: currentStatus
//       }),
//     });

//     if (response.ok) {
//       loadTasks();
//     } else if (response.status === 401) {
//       logout();
//     }
//   } catch (err) {
//     console.error('Error editing task:', err);
//   }
// }

async function deleteTask(taskId) {
 
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








        // <button class="edit-btn" onclick="editTaskPrompt('${task._id}', '${task.title}', '${task.description}', '${task.status}')">
        //   Edit
        // </button>