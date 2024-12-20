document.addEventListener('DOMContentLoaded', () => {
    const projectForm = document.getElementById('project-form');
    const projectList = document.getElementById('project-list');
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const taskProject = document.getElementById('task-project');
    const taskPriority = document.getElementById('task-priority');
    const taskList = document.getElementById('task-list');

    // const projectForm = document.getElementById('project-form');
    // const projectList = document.getElementById('project-list');
    // const taskForm = document.getElementById('task-form');
    // const taskInput = document.getElementById('task-input');
    // const taskProject = document.getElementById('task-project');
    // const taskPriority = document.getElementById('task-priority');
    // const taskList = document.getElementById('task-list');
    const timerDisplay = document.getElementById('timer-display');
    const startTimerButton = document.getElementById('start-timer');
    const pauseTimerButton = document.getElementById('pause-timer');
    const resetTimerButton = document.getElementById('reset-timer');
    const sessionNumber = document.getElementById('session-number');
    const workDurationInput = document.getElementById('work-duration');
    const breakDurationInput = document.getElementById('break-duration');
    const updateTimerSettingsButton = document.getElementById('update-timer-settings');


    let timer;
    let timeLeft = 1500;
    let isRunning = false;
    let sessionsCompleted = 0;
    let projects = [];
    let tasks = [];
    let currentProject = null;


    // Function to render projects
    function renderProjects() {
        projectList.innerHTML = '';
        projects.forEach(project => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${project.name}</span>
                <div>
                    <button class="view-project" data-id="${project.id}"><i class="fas fa-eye"></i></button>
                    <button class="delete-project" data-id="${project.id}"><i class="fas fa-trash"></i></button>
                </div>
            `;
            projectList.appendChild(li);
        });

        // Add event listeners for view and delete buttons
        document.querySelectorAll('.view-project').forEach(button => {
            button.addEventListener('click', (e) => {
                const projectId = parseInt(e.target.closest('button').dataset.id);
                viewProject(projectId);
            });
        });

        document.querySelectorAll('.delete-project').forEach(button => {
            button.addEventListener('click', (e) => {
                const projectId = parseInt(e.target.closest('button').dataset.id);
                deleteProject(projectId);
            });
        });
    }

    // Function to view project details
    function viewProject(projectId) {
        const project = projects.find(p => p.id === projectId);
        if (project) {
            currentProject = project;
            const projectDetails = document.createElement('div');
            projectDetails.className = 'project-details';
            projectDetails.innerHTML = `
                <h3>${project.name}</h3>
                <p><strong>Description:</strong> ${project.description}</p>
                <p><strong>Tech Stack:</strong> ${project.techStack.join(', ')}</p>
                <p><strong>Motivation:</strong> ${project.motivation}</p>
                <div class="progress-bar">
                    <div class="progress" style="width: ${project.progress}%"></div>
                </div>
                <input type="range" min="0" max="100" value="${project.progress}" class="project-progress-input">
                <button class="update-progress">Update Progress</button>
            `;
            const existingDetails = document.querySelector('.project-details');
            if (existingDetails) {
                existingDetails.remove();
            }
            projectList.after(projectDetails);

            // Add event listener for progress update
            const progressInput = projectDetails.querySelector('.project-progress-input');
            const updateProgressButton = projectDetails.querySelector('.update-progress');
            updateProgressButton.addEventListener('click', () => {
                project.progress = parseInt(progressInput.value);
                projectDetails.querySelector('.progress').style.width = `${project.progress}%`;
            });

            renderTasks();
        }
    }

    // Function to update task project select
    function updateTaskProjectSelect() {
        taskProject.innerHTML = '<option value="">Select Project</option>';
        projects.forEach(project => {
            const option = document.createElement('option');
            option.value = project.id;
            option.textContent = project.name;
            taskProject.appendChild(option);
        });
    }

    // Function to render tasks
    function renderTasks() {
        taskList.innerHTML = '';
        const tasksToRender = currentProject ? tasks.filter(t => t.projectId === currentProject.id) : tasks;
        tasksToRender.forEach((task) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="task-priority ${task.priority}">${task.priority}</span>
                <span style="${task.completed ? 'text-decoration: line-through;' : ''}">${task.text}</span>
                <div>
                    <button class="complete-task" data-id="${task.id}"><i class="fas fa-check"></i></button>
                    <button class="delete-task" data-id="${task.id}"><i class="fas fa-trash"></i></button>
                </div>
            `;
            taskList.appendChild(li);
        });

        // Add event listeners for complete and delete buttons
        document.querySelectorAll('.complete-task').forEach(button => {
            button.addEventListener('click', (e) => {
                const taskId = parseInt(e.target.closest('button').dataset.id);
                completeTask(taskId);
            });
        });

        document.querySelectorAll('.delete-task').forEach(button => {
            button.addEventListener('click', (e) => {
                const taskId = parseInt(e.target.closest('button').dataset.id);
                deleteTask(taskId);
            });
        });
    }

    // Event listener for project form submission
    projectForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('project-name').value.trim();
        const description = document.getElementById('project-description').value.trim();
        const techStack = document.getElementById('project-tech-stack').value.trim();
        const motivation = document.getElementById('project-motivation').value.trim();
        if (name && description) {
            addProject(name, description, techStack, motivation);
            projectForm.reset();
        }
    });

    // Event listener for task form submission
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const taskText = taskInput.value.trim();
        const projectId = taskProject.value;
        const priority = taskPriority.value;
        if (taskText && projectId) {
            addTask(taskText, projectId, priority);
            taskInput.value = '';
        }
    });

    // Function to update the timer display
    function updateTimerDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    // Function to start the timer
    startTimerButton.addEventListener('click', () => {
        if (!isRunning) {
            isRunning = true;
            timer = setInterval(() => {
                if (timeLeft > 0) {
                    timeLeft--;
                    updateTimerDisplay();
                } else {
                    clearInterval(timer);
                    isRunning = false;
                    sessionsCompleted++;
                    sessionNumber.textContent = sessionsCompleted;
                    alert("Time's up! Take a break.");
                    timeLeft = parseInt(workDurationInput.value) * 60; // Reset to work duration
                    updateTimerDisplay();
                }
            }, 1000);
        }
    });

    // Function to pause the timer
    pauseTimerButton.addEventListener('click', () => {
        clearInterval(timer);
        isRunning = false;
    });

    // Function to reset the timer
    resetTimerButton.addEventListener('click', () => {
        clearInterval(timer);
        isRunning = false;
        timeLeft = parseInt(workDurationInput.value) * 60; // Reset to work duration
        updateTimerDisplay();
    });

    // Function to update timer settings
    updateTimerSettingsButton.addEventListener('click', () => {
        const workDuration = parseInt(workDurationInput.value);
        const breakDuration = parseInt(breakDurationInput.value);
        if (workDuration >= 1 && workDuration <= 60 && breakDuration >= 1 && breakDuration <= 15) {
            timeLeft = workDuration * 60;
            updateTimerDisplay();
        } else {
            alert('Please enter valid durations (Work: 1-60 minutes, Break: 1-15 minutes)');
        }
    });

    // Task filtering
    document.getElementById('filter-all').addEventListener('click', () => renderTasks());
    document.getElementById('filter-high').addEventListener('click', () => {
        renderFilteredTasks('high');
    });
    document.getElementById('filter-medium').addEventListener('click', () => {
        renderFilteredTasks('medium');
    });
    document.getElementById('filter-low').addEventListener('click', () => {
        renderFilteredTasks('low');
    });

    function renderFilteredTasks(priority) {
        taskList.innerHTML = '';
        const filteredTasks = currentProject
            ? tasks.filter(t => t.projectId === currentProject.id && t.priority === priority)
            : tasks.filter(t => t.priority === priority);
        filteredTasks.forEach((task) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="task-priority ${task.priority}">${task.priority}</span>
                <span style="${task.completed ? 'text-decoration: line-through;' : ''}">${task.text}</span>
                <div>
                    <button class="complete-task" data-id="${task.id}"><i class="fas fa-check"></i></button>
                    <button class="delete-task" data-id="${task.id}"><i class="fas fa-trash"></i></button>
                </div>
            `;
            taskList.appendChild(li);
        });
    }

    // Initial display update
    updateTimerDisplay();
    updateTaskProjectSelect();

    // Load initial data
    async function loadData() {
        try {
            const [projectsResponse, tasksResponse] = await Promise.all([
                fetch('/api/projects'),
                fetch('/api/tasks')
            ]);
            projects = await projectsResponse.json();
            tasks = await tasksResponse.json();
            renderProjects();
            updateTaskProjectSelect();
            renderTasks();
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    // Function to add a project
    async function addProject(name, description, techStack, motivation) {
        try {
            const response = await fetch('/api/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    description,
                    techStack: techStack.split(',').map(tech => tech.trim()),
                    motivation
                }),
            });
            const newProject = await response.json();
            projects.push(newProject);
            renderProjects();
            updateTaskProjectSelect();
        } catch (error) {
            console.error('Error adding project:', error);
        }
    }

    // Function to delete a project
    async function deleteProject(projectId) {
        try {
            await fetch(`/api/projects/${projectId}`, {
                method: 'DELETE',
            });
            projects = projects.filter(p => p.id !== projectId);
            tasks = tasks.filter(t => t.projectId !== projectId);
            renderProjects();
            renderTasks();
            updateTaskProjectSelect();
        } catch (error) {
            console.error('Error deleting project:', error);
        }
    }

    // Function to add a task
    async function addTask(taskText, projectId, priority = 'medium') {
        try {
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: taskText,
                    projectId: parseInt(projectId),
                    priority
                }),
            });
            const newTask = await response.json();
            tasks.push(newTask);
            renderTasks();
            updateProjectProgress(projectId);
        } catch (error) {
            console.error('Error adding task:', error);
        }
    }

    // Function to complete a task
    async function completeTask(taskId) {
        try {
            const task = tasks.find(t => t.id === taskId);
            if (task) {
                const newStatus = !task.completed;
                await fetch(`/api/tasks/${taskId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        completed: newStatus
                    }),
                });
                task.completed = newStatus;
                renderTasks();
                updateProjectProgress(task.projectId);
            }
        } catch (error) {
            console.error('Error updating task:', error);
        }
    }

    // Function to delete a task
    async function deleteTask(taskId) {
        try {
            const task = tasks.find(t => t.id === taskId);
            if (task) {
                await fetch(`/api/tasks/${taskId}`, {
                    method: 'DELETE',
                });
                const projectId = task.projectId;
                tasks = tasks.filter(t => t.id !== taskId);
                renderTasks();
                updateProjectProgress(projectId);
            }
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    }

    // Function to update project progress
    async function updateProjectProgress(projectId) {
        try {
            const project = projects.find(p => p.id === projectId);
            if (project) {
                const projectTasks = tasks.filter(t => t.projectId === projectId);
                const completedTasks = projectTasks.filter(t => t.completed);
                const newProgress = projectTasks.length > 0 ? (completedTasks.length / projectTasks.length) * 100 : 0;
                
                await fetch(`/api/projects/${projectId}/progress`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        progress: newProgress
                    }),
                });

                project.progress = newProgress;
                if (currentProject && currentProject.id === projectId) {
                    const progressBar = document.querySelector('.project-details .progress');
                    const progressInput = document.querySelector('.project-details .project-progress-input');
                    if (progressBar && progressInput) {
                        progressBar.style.width = `${project.progress}%`;
                        progressInput.value = project.progress;
                    }
                }
            }
        } catch (error) {
            console.error('Error updating project progress:', error);
        }
    }

    // Load data when page loads
    loadData();
});