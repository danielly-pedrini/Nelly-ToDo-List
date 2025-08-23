// Array para armazenar todas as tarefas
let tasks = [];
// Contador para gerar IDs únicos para cada tarefa
let taskIdCounter = 1;

// Chave para armazenar no localStorage
const STORAGE_KEY = 'nellyTodoTasks';
const COUNTER_KEY = 'nellyTodoCounter';

// Função para salvar tarefas no localStorage
function saveTasks() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
        localStorage.setItem(COUNTER_KEY, taskIdCounter.toString());
    } catch (error) {
        console.error('Erro ao salvar tarefas:', error);
        alert('Erro ao salvar tarefas. Verifique se o localStorage está disponível.');
    }
}

// Função para carregar tarefas do localStorage
function loadTasks() {
    try {
        // Carregar tarefas
        const savedTasks = localStorage.getItem(STORAGE_KEY);
        if (savedTasks) {
            tasks = JSON.parse(savedTasks);
            // Converter strings de data de volta para objetos Date
            tasks.forEach(task => {
                if (task.createdAt) {
                    task.createdAt = new Date(task.createdAt);
                }
            });
        }
        
        // Carregar contador
        const savedCounter = localStorage.getItem(COUNTER_KEY);
        if (savedCounter) {
            taskIdCounter = parseInt(savedCounter, 10);
        }
    } catch (error) {
        console.error('Erro ao carregar tarefas:', error);
        // Em caso de erro, inicializar com valores padrão
        tasks = [];
        taskIdCounter = 1;
    }
}

// Função para adicionar uma nova tarefa
function addTask() {
    // Obter referências dos elementos do formulário
    const taskInput = document.getElementById('taskInput');
    const priorityCheckbox = document.getElementById('priorityCheckbox');
    
    // Obter o texto da tarefa e remover espaços extras
    const taskText = taskInput.value.trim();
    
    // Verificar se o campo não está vazio
    if (taskText === '') {
        alert('Por favor, digite uma tarefa!');
        return;
    }

    // Criar objeto da nova tarefa
    const newTask = {
        id: taskIdCounter++, // ID único e incrementar contador
        text: taskText, // Texto da tarefa
        priority: priorityCheckbox.checked, // Se é prioridade ou não
        completed: false, // Inicialmente não concluída
        createdAt: new Date() // Data de criação
    };

    // Adicionar a nova tarefa ao array
    tasks.push(newTask);
    
    // Salvar no localStorage
    saveTasks();
    
    // Limpar o formulário
    taskInput.value = '';
    priorityCheckbox.checked = false;
    
    // Atualizar a exibição das tarefas na tela
    renderTasks();
    
    // Colocar foco no input para facilitar adição de mais tarefas
    taskInput.focus();
}

// Função para renderizar (exibir) todas as tarefas nas seções apropriadas
function renderTasks() {
    // Obter referências das listas de tarefas
    const pendingList = document.getElementById('pendingTasks');
    const completedList = document.getElementById('completedTasks');
    
    // Limpar as listas existentes
    pendingList.innerHTML = '';
    completedList.innerHTML = '';

    // Separar tarefas pendentes das concluídas
    const pendingTasks = tasks.filter(task => !task.completed);
    const completedTasks = tasks.filter(task => task.completed);

    // Renderizar tarefas pendentes
    if (pendingTasks.length === 0) {
        // Mostrar mensagem se não há tarefas pendentes
        pendingList.innerHTML = '<li class="empty-message">Nenhuma tarefa pendente</li>';
    } else {
        // Criar HTML para cada tarefa pendente
        pendingTasks.forEach(task => {
            const taskElement = createTaskElement(task, false);
            pendingList.appendChild(taskElement);
        });
    }

    // Renderizar tarefas concluídas
    if (completedTasks.length === 0) {
        // Mostrar mensagem se não há tarefas concluídas
        completedList.innerHTML = '<li class="empty-message">Nenhuma tarefa concluída</li>';
    } else {
        // Criar HTML para cada tarefa concluída
        completedTasks.forEach(task => {
            const taskElement = createTaskElement(task, true);
            completedList.appendChild(taskElement);
        });
    }
}

// Função para criar o elemento HTML de uma tarefa
function createTaskElement(task, isCompleted) {
    // Criar elemento li (item da lista)
    const li = document.createElement('li');
    li.className = 'task-item new-task'; // Adicionar classes CSS
    
    // Criar span para o texto da tarefa
    const taskTextSpan = document.createElement('span');
    taskTextSpan.className = 'task-text';
    taskTextSpan.textContent = task.text;
    
    // Aplicar estilo de prioridade se necessário
    if (task.priority) {
        taskTextSpan.classList.add('priority-task');
    }
    
    // Aplicar estilo de concluída se necessário
    if (task.completed) {
        taskTextSpan.classList.add('completed-task');
    }

    // Criar container para os botões de ação
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'task-actions';

    if (!isCompleted) {
        // Botões para tarefas pendentes
        
        // Botão editar
        const editBtn = document.createElement('button');
        editBtn.className = 'btn-action btn-edit';
        editBtn.innerHTML = '<i class="fas fa-edit"></i>';
        editBtn.onclick = () => editTask(task.id);
        
        // Botão excluir
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-action btn-delete';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.onclick = () => deleteTask(task.id);
        
        // Botão concluir
        const completeBtn = document.createElement('button');
        completeBtn.className = 'btn-action btn-complete';
        completeBtn.innerHTML = '<i class="fas fa-check"></i>';
        completeBtn.onclick = () => completeTask(task.id);

        // Adicionar botões ao container
        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(deleteBtn);
        actionsDiv.appendChild(completeBtn);
    } else {
        // Botões para tarefas concluídas
        
        // Botão excluir
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-action btn-delete';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.onclick = () => deleteTask(task.id);
        
        // Botão restaurar (desfazer conclusão)
        const restoreBtn = document.createElement('button');
        restoreBtn.className = 'btn-action btn-restore';
        restoreBtn.innerHTML = '<i class="fas fa-undo"></i>';
        restoreBtn.onclick = () => restoreTask(task.id);

        // Adicionar botões ao container
        actionsDiv.appendChild(deleteBtn);
        actionsDiv.appendChild(restoreBtn);
    }

    // Montar o elemento completo da tarefa
    li.appendChild(taskTextSpan);
    li.appendChild(actionsDiv);

    return li;
}

// Função para editar uma tarefa existente
function editTask(taskId) {
    // Encontrar a tarefa pelo ID
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Solicitar novo texto da tarefa
    const newText = prompt('Editar tarefa:', task.text);
    
    // Verificar se o usuário não cancelou e digitou algo
    if (newText !== null && newText.trim() !== '') {
        // Atualizar o texto da tarefa
        task.text = newText.trim();
        // Salvar no localStorage
        saveTasks();
        // Re-renderizar as tarefas
        renderTasks();
    }
}

// Função para excluir uma tarefa
function deleteTask(taskId) {
    // Confirmar se o usuário realmente quer excluir
    if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
        // Remover a tarefa do array usando filter
        tasks = tasks.filter(t => t.id !== taskId);
        // Salvar no localStorage
        saveTasks();
        // Re-renderizar as tarefas
        renderTasks();
    }
}

// Função para marcar uma tarefa como concluída
function completeTask(taskId) {
    // Encontrar a tarefa pelo ID
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        // Marcar como concluída
        task.completed = true;
        // Salvar no localStorage
        saveTasks();
        // Re-renderizar as tarefas
        renderTasks();
    }
}

// Função para restaurar uma tarefa concluída (tornar pendente novamente)
function restoreTask(taskId) {
    // Encontrar a tarefa pelo ID
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        // Marcar como não concluída
        task.completed = false;
        // Salvar no localStorage
        saveTasks();
        // Re-renderizar as tarefas
        renderTasks();
    }
}

// Função para limpar todos os dados (útil para debug ou reset)
function clearAllData() {
    if (confirm('Tem certeza que deseja limpar TODAS as tarefas? Esta ação não pode ser desfeita.')) {
        tasks = [];
        taskIdCounter = 1;
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(COUNTER_KEY);
        renderTasks();
        alert('Todas as tarefas foram removidas!');
    }
}

// Função para exportar dados (backup)
function exportTasks() {
    try {
        const dataToExport = {
            tasks: tasks,
            counter: taskIdCounter,
            exportDate: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(dataToExport, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `nelly-todo-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    } catch (error) {
        console.error('Erro ao exportar:', error);
        alert('Erro ao exportar tarefas.');
    }
}

// Permitir adicionar tarefa pressionando Enter no input
document.getElementById('taskInput').addEventListener('keypress', function(e) {
    // Verificar se a tecla pressionada foi Enter (código 13)
    if (e.key === 'Enter') {
        addTask(); // Chamar função de adicionar tarefa
    }
});

// Carregar dados e configurar a página quando ela carregar
window.addEventListener('load', function() {
    // Carregar tarefas do localStorage
    loadTasks();
    
    // Renderizar tarefas carregadas
    renderTasks();
    
    // Focar no input
    document.getElementById('taskInput').focus();
    
    // Adicionar funcionalidades de debug no console (opcional)
    console.log('Nelly To-Do List carregado!');
    console.log('Comandos disponíveis no console:');
    console.log('- clearAllData(): limpar todas as tarefas');
    console.log('- exportTasks(): fazer backup das tarefas');
    console.log('- tasks: ver array de tarefas atual');
});

// Salvar automaticamente antes de sair da página
window.addEventListener('beforeunload', function() {
    saveTasks();
});