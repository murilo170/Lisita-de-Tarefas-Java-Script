const todoForm = document.getElementById('todo-form');
const tarefaInput = document.getElementById('tarefa-input');
const prioridadeSelect = document.getElementById('prioridade-select');
const listaTarefas = document.getElementById('lista-tarefas');
const tarefasPendentesSpan = document.getElementById('tarefas-pendentes');

// FILTROS
const filtroStatus = document.getElementById('filtro-status');
const filtroPrioridade = document.getElementById('filtro-prioridade'); 

// Array principal onde as tarefas (objetos) serão armazenadas.
let tarefas = [];

// --- 1. Funções de Persistência (LocalStorage) ---

/**
 * Salva o array 'tarefas' no LocalStorage do navegador.
 */
function salvarTarefas() {
    localStorage.setItem('minhasTarefas', JSON.stringify(tarefas));
}

/**
 * Carrega as tarefas salvas no LocalStorage, se existirem.
 */
function carregarTarefas() {
    const tarefasSalvas = localStorage.getItem('minhasTarefas');
    if (tarefasSalvas) {
        tarefas = JSON.parse(tarefasSalvas);
    }
    renderizarTarefas();
}

// --- 2. Funções de Lógica de Negócio ---

/**
 * Adiciona uma nova tarefa ao array.
 */
function adicionarTarefa(texto, prioridade) {
    const novaTarefa = {
        id: Date.now(), 
        texto: texto,
        prioridade: prioridade,
        concluida: false
    };

    tarefas.push(novaTarefa);
    salvarTarefas();
    renderizarTarefas();
    
    tarefaInput.value = '';
    prioridadeSelect.value = '';
}

/**
 * Alterna o status 'concluida' de uma tarefa pelo ID.
 */
function toggleConcluida(id) {
    const index = tarefas.findIndex(t => t.id === id);
    if (index > -1) {
        // Inverte o status de concluída
        tarefas[index].concluida = !tarefas[index].concluida;
        salvarTarefas();
        renderizarTarefas();
    }
}

/**
 * Remove uma tarefa pelo ID.
 */
function removerTarefa(id) {
    tarefas = tarefas.filter(t => t.id !== id);
    salvarTarefas();
    renderizarTarefas();
}

/**
 * Atualiza o contador de tarefas pendentes no topo.
 */
function atualizarContador() {
    const pendentes = tarefas.filter(t => !t.concluida).length;
    tarefasPendentesSpan.textContent = `Você tem ${pendentes} tarefa${pendentes !== 1 ? 's' : ''} pendente${pendentes !== 1 ? 's' : ''}.`;
}

// --- 3. Funções de Renderização ---

/**
 * Renderiza a lista de tarefas no HTML, aplicando filtros de Status E Prioridade.
 */
function renderizarTarefas() {
    listaTarefas.innerHTML = ''; 
    
    const filtroStat = filtroStatus.value;
    const filtroPrio = filtroPrioridade.value; 
    
    // 1. Aplica os FILTROS
    const tarefasFiltradas = tarefas.filter(tarefa => {
        
        // FILTRO 1: Status (Concluída/Pendente/Todas)
        const passaNoStatus = (filtroStat === 'todos') || 
                              (filtroStat === 'pendentes' && !tarefa.concluida) ||
                              (filtroStat === 'concluidas' && tarefa.concluida);
        
        // FILTRO 2: Prioridade (Alta/Média/Baixa/Todas)
        const passaNaPrioridade = (filtroPrio === 'todas') || 
                                  (tarefa.prioridade === filtroPrio);
        
        // Retorna apenas se passar em AMBOS os filtros
        return passaNoStatus && passaNaPrioridade;
    });
    
    // 2. Cria o elemento HTML para cada tarefa filtrada
    tarefasFiltradas.forEach(tarefa => {
        const li = document.createElement('li');
        li.classList.add('tarefa-item');
        
        li.classList.add(`prioridade-${tarefa.prioridade}`);
        if (tarefa.concluida) {
            li.classList.add('concluida');
        }
        
        li.dataset.id = tarefa.id;

        li.innerHTML = `
            <span class="tarefa-texto">${tarefa.texto}</span>
            <div class="tarefa-botoes">
                <button class="btn-check">✓</button> 
                <button class="btn-excluir">X</button>
            </div>
        `;

        listaTarefas.appendChild(li);
    });
    
    // 3. Atualiza o contador após a renderização
    atualizarContador();
}

// --- 4. Event Listeners ---

// A) Escuta o envio do formulário 
todoForm.addEventListener('submit', function(e) {
    e.preventDefault(); 
    
    const texto = tarefaInput.value.trim();
    const prioridade = prioridadeSelect.value;
    
    if (texto && prioridade) {
        adicionarTarefa(texto, prioridade);
    } else {
        alert('Por favor, preencha a tarefa e selecione uma prioridade!');
    }
});

// B) Escuta cliques na lista (Delegação de Eventos)
listaTarefas.addEventListener('click', function(e) {
    const li = e.target.closest('.tarefa-item');
    if (!li) return; 

    const id = parseInt(li.dataset.id);

    if (e.target.classList.contains('btn-excluir')) {
        removerTarefa(id);
    } 
    // AGORA CHAMA QUANDO CLICA NO BOTÃO DE CHECK
    else if (e.target.classList.contains('btn-check')) {
        toggleConcluida(id);
    }
});

// C) Escuta a mudança nos filtros
filtroStatus.addEventListener('change', renderizarTarefas);
filtroPrioridade.addEventListener('change', renderizarTarefas); 

// --- 6. Inicialização ---
carregarTarefas();