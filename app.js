/**
 * Minha Agenda - Dashboard Semanal
 * Controlador da Aplicação e Renderizadores de Visualização
 */

document.addEventListener('DOMContentLoaded', () => {
  // Estado da Aplicação
  const state = {
    currentMonday: DateUtils.getMondayOfWeek(new Date()),
    activeView: 'today', // 'today' | 'list' | 'kanban' | 'calendar'
    filterCategory: 'all', // 'all' | 'trabalho' | 'faculdade' | 'pessoal' | 'espiritual' | 'estudos'
    filterPriority: 'all', // 'all' | 'alta' | 'media' | 'baixa'
    filterSearch: '',
    editingTaskId: null,
    subtasksBuffer: []
  };

  // Elementos do DOM
  const elements = {
    // Header & Navegação
    btnPrevWeek: document.getElementById('btn-prev-week'),
    btnNextWeek: document.getElementById('btn-next-week'),
    btnToday: document.getElementById('btn-today'),
    currentWeekDisplay: document.getElementById('current-week-display'),
    currentMonthDisplay: document.getElementById('current-month-display'),
    viewTabs: document.querySelectorAll('.view-tab'),
    btnOpenNewTask: document.getElementById('btn-open-new-task'),
    btnClearAll: document.getElementById('btn-clear-all'),

    // Métricas
    metricTotalTasks: document.getElementById('metric-total-tasks'),
    metricInProgressTasks: document.getElementById('metric-in-progress-tasks'),
    metricCompletedTasks: document.getElementById('metric-completed-tasks'),
    metricProgressPct: document.getElementById('metric-progress-pct'),
    metricProgressFill: document.getElementById('metric-progress-fill'),
    metricProgressDetail: document.getElementById('metric-progress-detail'),

    // Filtros
    filterSearchInput: document.getElementById('filter-search-input'),
    btnClearSearch: document.getElementById('btn-clear-search'),
    categoryPillsContainer: document.getElementById('category-pills-container'),
    categoryPills: document.querySelectorAll('.cat-pill'),
    filterPrioritySelect: document.getElementById('filter-priority-select'),

    // Contadores de categorias
    countCatAll: document.getElementById('count-cat-all'),
    countCatTrabalho: document.getElementById('count-cat-trabalho'),
    countCatFaculdade: document.getElementById('count-cat-faculdade'),
    countCatPessoal: document.getElementById('count-cat-pessoal'),
    countCatEspiritual: document.getElementById('count-cat-espiritual'),
    countCatEstudos: document.getElementById('count-cat-estudos'),
    countCatSaude: document.getElementById('count-cat-saude'),

    // Painéis de Visualização
    viewPanels: {
      today: document.getElementById('view-today'),
      list: document.getElementById('view-list'),
      kanban: document.getElementById('view-kanban'),
      calendar: document.getElementById('view-calendar')
    },
    listDaysContainer: document.getElementById('list-days-container'),

    // Elementos da Aba Hoje
    todayHeroDateTitle: document.getElementById('today-hero-date-title'),
    todayProgressPct: document.getElementById('today-progress-pct'),
    todayProgressBarFill: document.getElementById('today-progress-bar-fill'),
    todayStatsSummary: document.getElementById('today-stats-summary'),
    btnQuickAddToday: document.getElementById('btn-quick-add-today'),
    todayQuickForm: document.getElementById('today-quick-form'),
    todayQuickTitle: document.getElementById('today-quick-title'),
    todayQuickCategory: document.getElementById('today-quick-category'),
    todayQuickPriority: document.getElementById('today-quick-priority'),
    todayTimedList: document.getElementById('today-timed-list'),
    todayAlldayList: document.getElementById('today-allday-list'),
    todayCountTimed: document.getElementById('today-count-timed'),
    todayCountAllday: document.getElementById('today-count-allday'),

    // Kanban Columns
    kanbanListTodo: document.getElementById('kanban-list-todo'),
    kanbanListInProgress: document.getElementById('kanban-list-in_progress'),
    kanbanListDone: document.getElementById('kanban-list-done'),
    kanbanCountTodo: document.getElementById('kanban-count-todo'),
    kanbanCountInProgress: document.getElementById('kanban-count-in_progress'),
    kanbanCountDone: document.getElementById('kanban-count-done'),
    kanbanColumns: document.querySelectorAll('.kanban-column'),

    // Calendar Elements
    calendarHeaderDays: document.getElementById('calendar-header-days'),
    calendarAlldayColumns: document.getElementById('calendar-allday-columns'),
    calendarGridBody: document.getElementById('calendar-grid-body'),

    // Modal
    modalOverlay: document.getElementById('task-modal'),
    modalTitle: document.getElementById('modal-task-title'),
    btnCloseModal: document.getElementById('btn-close-modal'),
    btnCancelModal: document.getElementById('btn-cancel-modal'),
    btnDeleteTaskModal: document.getElementById('btn-delete-task-modal'),
    taskForm: document.getElementById('task-form'),
    taskIdInput: document.getElementById('task-id'),
    taskTitleInput: document.getElementById('task-title-input'),
    taskCategorySelect: document.getElementById('task-category-select'),
    taskPrioritySelect: document.getElementById('task-priority-select'),
    taskDateInput: document.getElementById('task-date-input'),
    taskAlldayInput: document.getElementById('task-allday-input'),
    timeInputsRow: document.getElementById('time-inputs-row'),
    taskStartTimeInput: document.getElementById('task-starttime-input'),
    taskEndTimeInput: document.getElementById('task-endtime-input'),
    taskDescInput: document.getElementById('task-desc-input'),
    subtasksContainer: document.getElementById('subtasks-list-container'),
    btnAddSubtaskRow: document.getElementById('btn-add-subtask-row'),

    // Toast
    toastContainer: document.getElementById('toast-container')
  };

  // Nomes amigáveis e ícones das categorias
  const categoryMeta = {
    trabalho: { name: 'Trabalho', icon: '💼', colorClass: 'badge-trabalho' },
    faculdade: { name: 'Faculdade', icon: '🎓', colorClass: 'badge-faculdade' },
    pessoal: { name: 'Vida Pessoal', icon: '🌿', colorClass: 'badge-pessoal' },
    espiritual: { name: 'Espiritual', icon: '✨', colorClass: 'badge-espiritual' },
    estudos: { name: 'Estudos', icon: '📖', colorClass: 'badge-estudos' },
    saude: { name: 'Saúde', icon: '🩺', colorClass: 'badge-saude' }
  };

  // Toast Helper
  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icon = type === 'success' ? '✓' : 'ℹ';
    toast.innerHTML = `
      <div class="toast-icon-wrap">${icon}</div>
      <span>${escapeHtml(message)}</span>
    `;
    elements.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  // Prevenção de XSS
  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // =========================================================================
  // NAVEGAÇÃO DA SEMANA & FILTROS
  // =========================================================================

  function changeWeek(offsetWeeks) {
    const newMonday = new Date(state.currentMonday);
    newMonday.setDate(newMonday.getDate() + offsetWeeks * 7);
    state.currentMonday = newMonday;
    renderApp();
  }

  function goToCurrentWeek() {
    state.currentMonday = DateUtils.getMondayOfWeek(new Date());
    renderApp();
    showToast('Exibindo a semana atual.', 'info');
  }

  function switchView(viewName) {
    state.activeView = viewName;
    elements.viewTabs.forEach(tab => {
      const isCurrent = tab.dataset.view === viewName;
      tab.classList.toggle('active', isCurrent);
      tab.setAttribute('aria-selected', isCurrent);
    });

    Object.entries(elements.viewPanels).forEach(([name, panel]) => {
      if (name === viewName) {
        panel.classList.add('active');
      } else {
        panel.classList.remove('active');
      }
    });

    renderCurrentView();
  }

  // Obter tarefas pertencentes à semana atual e filtradas
  function getFilteredTasksForWeek() {
    const allTasks = TaskRepository.getTasks();
    const weekDays = DateUtils.getWeekDays(state.currentMonday);
    const startIso = DateUtils.formatISODate(weekDays[0]);
    const endIso = DateUtils.formatISODate(weekDays[6]);

    return allTasks.filter(task => {
      // Pertence à semana exibida?
      if (task.date < startIso || task.date > endIso) return false;

      // Filtro de Categoria
      if (state.filterCategory !== 'all' && task.category !== state.filterCategory) {
        return false;
      }

      // Filtro de Prioridade
      if (state.filterPriority !== 'all' && task.priority !== state.filterPriority) {
        return false;
      }

      // Filtro de Busca
      if (state.filterSearch) {
        const query = state.filterSearch.toLowerCase();
        const inTitle = task.title && task.title.toLowerCase().includes(query);
        const inDesc = task.description && task.description.toLowerCase().includes(query);
        const inCategory = task.category && task.category.toLowerCase().includes(query);
        if (!inTitle && !inDesc && !inCategory) return false;
      }

      return true;
    });
  }

  // Atualizar Header da Semana
  function updateWeekHeader() {
    const weekDays = DateUtils.getWeekDays(state.currentMonday);
    const firstDay = weekDays[0];
    const lastDay = weekDays[6];

    const firstStr = `${firstDay.getDate()} de ${firstDay.toLocaleDateString('pt-BR', { month: 'short' })}`;
    const lastStr = `${lastDay.getDate()} de ${lastDay.toLocaleDateString('pt-BR', { month: 'short' })}`;

    elements.currentWeekDisplay.textContent = `${firstStr} a ${lastStr}`;
    
    // Mês e Ano
    const monthYear = firstDay.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    elements.currentMonthDisplay.textContent = monthYear.charAt(0).toUpperCase() + monthYear.slice(1);
  }

  // Atualizar Métricas & Contadores
  function updateMetricsAndCounters() {
    const allTasks = TaskRepository.getTasks();
    const weekDays = DateUtils.getWeekDays(state.currentMonday);
    const startIso = DateUtils.formatISODate(weekDays[0]);
    const endIso = DateUtils.formatISODate(weekDays[6]);

    // Tarefas da semana sem os filtros aplicados para ter métricas reais da semana
    const weekTasks = allTasks.filter(t => t.date >= startIso && t.date <= endIso);
    const total = weekTasks.length;
    const completed = weekTasks.filter(t => t.status === 'done').length;
    const inProgress = weekTasks.filter(t => t.status === 'in_progress').length;
    const pct = total === 0 ? 0 : Math.round((completed / total) * 100);

    elements.metricTotalTasks.textContent = total;
    elements.metricCompletedTasks.textContent = completed;
    elements.metricInProgressTasks.textContent = inProgress;
    elements.metricProgressPct.textContent = `${pct}%`;
    elements.metricProgressFill.style.width = `${pct}%`;
    elements.metricProgressDetail.textContent = `${completed} de ${total} compromissos finalizados`;

    // Atualizar badges das categorias
    const counts = { all: weekTasks.length, trabalho: 0, faculdade: 0, pessoal: 0, espiritual: 0, estudos: 0, saude: 0 };
    weekTasks.forEach(t => {
      if (counts[t.category] !== undefined) {
        counts[t.category]++;
      }
    });

    elements.countCatAll.textContent = counts.all;
    elements.countCatTrabalho.textContent = counts.trabalho;
    elements.countCatFaculdade.textContent = counts.faculdade;
    elements.countCatPessoal.textContent = counts.pessoal;
    elements.countCatEspiritual.textContent = counts.espiritual;
    elements.countCatEstudos.textContent = counts.estudos;
    if (elements.countCatSaude) {
      elements.countCatSaude.textContent = counts.saude;
    }
  }

  // =========================================================================
  // VIEW 0: HOJE (TODAY VIEW)
  // =========================================================================

  function renderTodayView() {
    const today = new Date();
    const todayIso = DateUtils.formatISODate(today);
    const allTasks = TaskRepository.getTasks();

    // Atualiza cabeçalho do Hero de Hoje
    const weekdayName = DateUtils.getWeekdayName(today);
    const dayMonth = DateUtils.formatDayMonthBR(today);
    const year = today.getFullYear();
    if (elements.todayHeroDateTitle) {
      elements.todayHeroDateTitle.textContent = `${weekdayName}, ${dayMonth} de ${year}`;
    }

    // Todas as tarefas de hoje (sem filtros de categoria/prioridade para o cálculo de métricas)
    const todayAllTasks = allTasks.filter(t => t.date === todayIso);
    const totalToday = todayAllTasks.length;
    const completedToday = todayAllTasks.filter(t => t.status === 'done').length;
    const pctToday = totalToday === 0 ? 0 : Math.round((completedToday / totalToday) * 100);

    if (elements.todayProgressPct) {
      elements.todayProgressPct.textContent = `${pctToday}%`;
      elements.todayProgressBarFill.style.width = `${pctToday}%`;
      elements.todayStatsSummary.textContent = `${completedToday} de ${totalToday} compromissos concluídos`;
    }

    // Tarefas filtradas (categoria, prioridade e texto de busca)
    const filteredTodayTasks = todayAllTasks.filter(task => {
      if (state.filterCategory !== 'all' && task.category !== state.filterCategory) {
        return false;
      }
      if (state.filterPriority !== 'all' && task.priority !== state.filterPriority) {
        return false;
      }
      if (state.filterSearch) {
        const query = state.filterSearch.toLowerCase();
        const inTitle = task.title && task.title.toLowerCase().includes(query);
        const inDesc = task.description && task.description.toLowerCase().includes(query);
        const inCategory = task.category && task.category.toLowerCase().includes(query);
        if (!inTitle && !inDesc && !inCategory) return false;
      }
      return true;
    });

    // Separar em tarefas com horário e dia inteiro / flexíveis
    const timedTasks = filteredTodayTasks.filter(t => !t.isAllDay && t.startTime);
    const allDayTasks = filteredTodayTasks.filter(t => t.isAllDay || !t.startTime);

    // Ordenar timedTasks por horário
    timedTasks.sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));

    if (elements.todayCountTimed) elements.todayCountTimed.textContent = timedTasks.length;
    if (elements.todayCountAllday) elements.todayCountAllday.textContent = allDayTasks.length;

    // Renderizar lista com horário
    elements.todayTimedList.innerHTML = '';
    if (timedTasks.length === 0) {
      elements.todayTimedList.innerHTML = `
        <div class="day-empty-state">
          <span>🌿</span>
          <span>Nenhum compromisso com horário fixo para hoje.</span>
        </div>
      `;
    } else {
      timedTasks.forEach(task => {
        elements.todayTimedList.appendChild(createTodayTaskRow(task));
      });
    }

    // Renderizar lista dia todo / flexíveis
    elements.todayAlldayList.innerHTML = '';
    if (allDayTasks.length === 0) {
      elements.todayAlldayList.innerHTML = `
        <div class="day-empty-state">
          <span>✨</span>
          <span>Nenhuma meta flexível ou de dia inteiro para hoje.</span>
        </div>
      `;
    } else {
      allDayTasks.forEach(task => {
        elements.todayAlldayList.appendChild(createTodayTaskRow(task));
      });
    }
  }

  function createTodayTaskRow(task) {
    const el = document.createElement('div');
    const isDone = task.status === 'done';
    el.className = `today-task-card ${isDone ? 'done' : ''}`;
    el.id = `today-task-${task.id}`;

    const cat = categoryMeta[task.category] || { name: task.category, icon: '📌', colorClass: 'badge-trabalho' };
    const priorityLabels = { alta: 'Alta 🔥', media: 'Média ⚡', baixa: 'Baixa 🌱' };
    const priorityText = priorityLabels[task.priority] || 'Média';

    let timeBadge = '';
    if (!task.isAllDay && task.startTime) {
      timeBadge = `
        <div class="today-task-time-badge">
          <span>${task.startTime}</span>
          ${task.endTime ? `<span style="font-size: 0.65rem; color: var(--text-muted);">${task.endTime}</span>` : ''}
        </div>
      `;
    } else {
      timeBadge = `
        <div class="today-task-time-badge" style="font-size: 0.68rem; color: var(--rose-600); background: var(--rose-100);">
          <span>Dia Todo</span>
        </div>
      `;
    }

    // Subtasks summary
    let subtasksSnippet = '';
    if (task.subtasks && task.subtasks.length > 0) {
      const completedSub = task.subtasks.filter(s => s.completed).length;
      subtasksSnippet = `
        <span class="subtasks-indicator" title="${completedSub} de ${task.subtasks.length} subtarefas prontas">
          ✓ ${completedSub}/${task.subtasks.length}
        </span>
      `;
    }

    el.innerHTML = `
      <div class="task-row-left" style="gap: 12px;">
        <label class="task-checkbox-wrap" title="Marcar como concluído">
          <input type="checkbox" ${isDone ? 'checked' : ''} data-id="${task.id}" class="task-check-input">
          <span class="task-checkbox-custom">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </span>
        </label>
        ${timeBadge}
        <div class="task-info-main">
          <span class="task-title-text">${escapeHtml(task.title)}</span>
          <div class="task-details-meta">
            ${subtasksSnippet}
            ${task.description ? `<span class="task-notes-snippet" title="${escapeHtml(task.description)}">${escapeHtml(task.description)}</span>` : ''}
          </div>
        </div>
      </div>

      <div class="task-row-right">
        <span class="badge-category ${cat.colorClass}">${cat.icon} ${cat.name}</span>
        <span class="badge-priority priority-${task.priority || 'media'}">${priorityText}</span>
        <div class="task-actions-group">
          <button class="btn-task-action edit" data-id="${task.id}" title="Editar compromisso">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
          </button>
          <button class="btn-task-action delete" data-id="${task.id}" title="Excluir compromisso">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    `;

    // Checkbox toggle
    const checkbox = el.querySelector('.task-check-input');
    checkbox.addEventListener('change', () => {
      TaskRepository.toggleDone(task.id);
      showToast(checkbox.checked ? 'Tarefa concluída hoje! Parabéns 🎉' : 'Tarefa reaberta.', 'success');
      renderApp();
    });

    // Ações de editar e excluir
    el.querySelector('.btn-task-action.edit').addEventListener('click', () => {
      openTaskModal(task);
    });

    el.querySelector('.btn-task-action.delete').addEventListener('click', () => {
      confirmDeleteTask(task.id);
    });

    return el;
  }

  // =========================================================================
  // VIEW 1: LISTA (LIST VIEW)
  // =========================================================================

  function renderListView() {
    const tasks = getFilteredTasksForWeek();
    const weekDays = DateUtils.getWeekDays(state.currentMonday);
    const today = new Date();

    elements.listDaysContainer.innerHTML = '';

    weekDays.forEach(dayDate => {
      const dateIso = DateUtils.formatISODate(dayDate);
      const isToday = DateUtils.isSameDay(dayDate, today);
      const dayTasks = tasks.filter(t => t.date === dateIso);

      // Card do Dia
      const dayCard = document.createElement('div');
      dayCard.className = `day-accordion-card ${isToday ? 'today' : ''}`;
      dayCard.id = `day-card-${dateIso}`;

      // Ordenar tarefas por horário
      dayTasks.sort((a, b) => {
        if (a.isAllDay && !b.isAllDay) return -1;
        if (!a.isAllDay && b.isAllDay) return 1;
        return (a.startTime || '').localeCompare(b.startTime || '');
      });

      const dayName = DateUtils.getWeekdayName(dayDate);
      const dateFormatted = DateUtils.formatDayMonthBR(dayDate);
      const dayNumber = dayDate.getDate();
      const dayShort = DateUtils.getWeekdayShort(dayDate);

      dayCard.innerHTML = `
        <div class="day-card-header" data-date="${dateIso}">
          <div class="day-header-left">
            <div class="day-badge-pill">
              <span class="day-badge-num">${dayNumber}</span>
              <span class="day-badge-weekday">${dayShort}</span>
            </div>
            <div class="day-title-info">
              <div class="day-name-wrapper">
                <span class="day-name">${dayName}</span>
                ${isToday ? '<span class="today-tag">Hoje</span>' : ''}
              </div>
              <span class="day-date-str">${dateFormatted}</span>
            </div>
          </div>
          <div class="day-header-right">
            <span class="day-summary-count">${dayTasks.length} ${dayTasks.length === 1 ? 'item' : 'itens'}</span>
            <button class="btn-add-day-task" data-date="${dateIso}" title="Adicionar tarefa em ${dayName}">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
            <div class="chevron-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>
        </div>
        <div class="day-tasks-list" id="day-list-${dateIso}">
          <!-- Tasks Injected Below -->
        </div>
      `;

      const tasksContainer = dayCard.querySelector(`#day-list-${dateIso}`);

      if (dayTasks.length === 0) {
        tasksContainer.innerHTML = `
          <div class="day-empty-state">
            <span>🌿</span>
            <span>Nenhum compromisso agendado. Clique no "+" acima para adicionar.</span>
          </div>
        `;
      } else {
        dayTasks.forEach(task => {
          const itemEl = createTaskRowElement(task);
          tasksContainer.appendChild(itemEl);
        });
      }

      // Evento de expandir/recolher
      const headerEl = dayCard.querySelector('.day-card-header');
      headerEl.addEventListener('click', (e) => {
        // Ignora clique se for no botão de adicionar
        if (e.target.closest('.btn-add-day-task')) return;
        dayCard.classList.toggle('collapsed');
      });

      // Botão de adicionar específico para o dia
      const addBtn = dayCard.querySelector('.btn-add-day-task');
      addBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openTaskModal({ date: dateIso });
      });

      elements.listDaysContainer.appendChild(dayCard);
    });
  }

  function createTaskRowElement(task) {
    const el = document.createElement('div');
    const isDone = task.status === 'done';
    el.className = `task-row-item ${isDone ? 'done' : ''}`;
    el.id = `task-row-${task.id}`;

    const cat = categoryMeta[task.category] || { name: task.category, icon: '📌', colorClass: 'badge-trabalho' };
    const priorityLabels = { alta: 'Alta 🔥', media: 'Média ⚡', baixa: 'Baixa 🌱' };
    const priorityText = priorityLabels[task.priority] || 'Média';

    // Subtasks summary
    let subtasksSnippet = '';
    if (task.subtasks && task.subtasks.length > 0) {
      const completedSub = task.subtasks.filter(s => s.completed).length;
      subtasksSnippet = `
        <span class="subtasks-indicator" title="${completedSub} de ${task.subtasks.length} subtarefas prontas">
          ✓ ${completedSub}/${task.subtasks.length}
        </span>
      `;
    }

    // Horário formatado
    let timeText = 'Dia inteiro';
    if (!task.isAllDay && task.startTime) {
      timeText = task.endTime ? `${task.startTime} – ${task.endTime}` : task.startTime;
    }

    el.innerHTML = `
      <div class="task-row-left">
        <label class="task-checkbox-wrap" title="Marcar como concluído">
          <input type="checkbox" ${isDone ? 'checked' : ''} data-id="${task.id}" class="task-check-input">
          <span class="task-checkbox-custom">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </span>
        </label>
        <div class="task-info-main">
          <span class="task-title-text">${escapeHtml(task.title)}</span>
          <div class="task-details-meta">
            <span class="task-time-chip">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              ${timeText}
            </span>
            ${subtasksSnippet}
            ${task.description ? `<span class="task-notes-snippet" title="${escapeHtml(task.description)}">${escapeHtml(task.description)}</span>` : ''}
          </div>
        </div>
      </div>

      <div class="task-row-right">
        <span class="badge-category ${cat.colorClass}">${cat.icon} ${cat.name}</span>
        <span class="badge-priority priority-${task.priority || 'media'}">${priorityText}</span>
        <div class="task-actions-group">
          <button class="btn-task-action edit" data-id="${task.id}" title="Editar compromisso">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
          </button>
          <button class="btn-task-action delete" data-id="${task.id}" title="Excluir compromisso">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    `;

    // Checkbox toggle
    const checkbox = el.querySelector('.task-check-input');
    checkbox.addEventListener('change', () => {
      TaskRepository.toggleDone(task.id);
      showToast(checkbox.checked ? 'Tarefa concluída! Parabéns 🎉' : 'Tarefa reaberta.', 'success');
      renderApp();
    });

    // Ações de editar e excluir
    el.querySelector('.btn-task-action.edit').addEventListener('click', () => {
      openTaskModal(task);
    });

    el.querySelector('.btn-task-action.delete').addEventListener('click', () => {
      confirmDeleteTask(task.id);
    });

    return el;
  }

  // =========================================================================
  // VIEW 2: KANBAN (KANBAN VIEW)
  // =========================================================================

  function renderKanbanView() {
    const tasks = getFilteredTasksForWeek();
    
    // Limpar containers
    elements.kanbanListTodo.innerHTML = '';
    elements.kanbanListInProgress.innerHTML = '';
    elements.kanbanListDone.innerHTML = '';

    const cols = {
      todo: [],
      in_progress: [],
      done: []
    };

    tasks.forEach(t => {
      const st = t.status || 'todo';
      if (cols[st]) cols[st].push(t);
      else cols.todo.push(t);
    });

    // Atualizar contadores do Kanban
    elements.kanbanCountTodo.textContent = cols.todo.length;
    elements.kanbanCountInProgress.textContent = cols.in_progress.length;
    elements.kanbanCountDone.textContent = cols.done.length;

    // Injetar cards
    cols.todo.forEach(t => elements.kanbanListTodo.appendChild(createKanbanCardElement(t)));
    cols.in_progress.forEach(t => elements.kanbanListInProgress.appendChild(createKanbanCardElement(t)));
    cols.done.forEach(t => elements.kanbanListDone.appendChild(createKanbanCardElement(t)));

    // Placeholder se coluna estiver vazia
    ['todo', 'in_progress', 'done'].forEach(statusKey => {
      const container = {
        todo: elements.kanbanListTodo,
        in_progress: elements.kanbanListInProgress,
        done: elements.kanbanListDone
      }[statusKey];

      if (cols[statusKey].length === 0) {
        container.innerHTML = `
          <div class="day-empty-state" style="padding: 30px 10px;">
            <span>Nenhuma tarefa aqui</span>
          </div>
        `;
      }
    });

    setupKanbanDragAndDrop();
  }

  function createKanbanCardElement(task) {
    const card = document.createElement('div');
    const isDone = task.status === 'done';
    card.className = `kanban-card ${isDone ? 'done' : ''}`;
    card.id = `kanban-card-${task.id}`;
    card.setAttribute('draggable', 'true');
    card.dataset.id = task.id;

    const cat = categoryMeta[task.category] || { name: task.category, icon: '📌', colorClass: 'badge-trabalho' };
    const priorityLabels = { alta: 'Alta 🔥', media: 'Média ⚡', baixa: 'Baixa 🌱' };

    // Format date string for chip: "Qua, 14 Out"
    const dateObj = new Date(task.date + 'T00:00:00');
    const shortDay = DateUtils.getWeekdayShort(dateObj);
    const dayNum = dateObj.getDate();
    const dateChipText = `${shortDay}, ${dayNum}`;

    let timeChipText = '';
    if (!task.isAllDay && task.startTime) {
      timeChipText = ` &bull; ${task.startTime}`;
    }

    // Subtasks progress bar in Kanban
    let subtaskHtml = '';
    if (task.subtasks && task.subtasks.length > 0) {
      const completedSub = task.subtasks.filter(s => s.completed).length;
      const subPct = Math.round((completedSub / task.subtasks.length) * 100);
      subtaskHtml = `
        <div class="kanban-card-subtasks">
          <span>✓ ${completedSub}/${task.subtasks.length}</span>
          <div class="kanban-subtask-progress-mini">
            <div style="width: ${subPct}%"></div>
          </div>
        </div>
      `;
    }

    card.innerHTML = `
      <div class="kanban-card-top">
        <span class="badge-category ${cat.colorClass}">${cat.icon} ${cat.name}</span>
        <span class="badge-priority priority-${task.priority || 'media'}">${priorityLabels[task.priority] || 'Média'}</span>
      </div>

      <div class="kanban-card-title">${escapeHtml(task.title)}</div>

      ${task.description ? `<div class="kanban-card-notes">${escapeHtml(task.description)}</div>` : ''}

      ${subtaskHtml}

      <div class="kanban-card-footer">
        <span class="kanban-date-chip">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          ${dateChipText}${timeChipText}
        </span>

        <div class="kanban-card-actions">
          <button class="btn-task-action edit" data-id="${task.id}" title="Editar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
          </button>
          <button class="btn-task-action delete" data-id="${task.id}" title="Excluir">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    `;

    // Ações
    card.querySelector('.btn-task-action.edit').addEventListener('click', (e) => {
      e.stopPropagation();
      openTaskModal(task);
    });

    card.querySelector('.btn-task-action.delete').addEventListener('click', (e) => {
      e.stopPropagation();
      confirmDeleteTask(task.id);
    });

    // Clique no próprio card abre edição
    card.addEventListener('click', (e) => {
      if (e.target.closest('.btn-task-action')) return;
      openTaskModal(task);
    });

    return card;
  }

  // Configuração Drag and Drop do Kanban
  function setupKanbanDragAndDrop() {
    const cards = document.querySelectorAll('.kanban-card');
    const columns = elements.kanbanColumns;

    cards.forEach(card => {
      card.addEventListener('dragstart', (e) => {
        card.classList.add('dragging');
        e.dataTransfer.setData('text/plain', card.dataset.id);
        e.dataTransfer.effectAllowed = 'move';
      });

      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
        columns.forEach(col => col.classList.remove('drag-over'));
      });
    });

    columns.forEach(col => {
      col.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        col.classList.add('drag-over');
      });

      col.addEventListener('dragleave', (e) => {
        // Apenas remove se estiver saindo da coluna de fato
        if (!col.contains(e.relatedTarget)) {
          col.classList.remove('drag-over');
        }
      });

      col.addEventListener('drop', (e) => {
        e.preventDefault();
        col.classList.remove('drag-over');
        const taskId = e.dataTransfer.getData('text/plain');
        const targetStatus = col.dataset.status;

        if (taskId && targetStatus) {
          TaskRepository.updateStatus(taskId, targetStatus);
          showToast(`Status alterado para "${getStatusLabel(targetStatus)}"`, 'success');
          renderApp();
        }
      });
    });
  }

  function getStatusLabel(st) {
    if (st === 'todo') return 'A Fazer';
    if (st === 'in_progress') return 'Em Andamento';
    if (st === 'done') return 'Concluído';
    return st;
  }

  // =========================================================================
  // VIEW 3: CALENDÁRIO (CALENDAR VIEW)
  // =========================================================================

  function renderCalendarView() {
    const tasks = getFilteredTasksForWeek();
    const weekDays = DateUtils.getWeekDays(state.currentMonday);
    const today = new Date();

    // 1. Renderizar Header dos Dias
    elements.calendarHeaderDays.innerHTML = `
      <div class="calendar-gutter-corner">Horário</div>
    `;

    weekDays.forEach(dayDate => {
      const isToday = DateUtils.isSameDay(dayDate, today);
      const dayCol = document.createElement('div');
      dayCol.className = `calendar-day-col-header ${isToday ? 'today' : ''}`;
      dayCol.innerHTML = `
        <span class="cal-header-weekday">${DateUtils.getWeekdayShort(dayDate)}</span>
        <span class="cal-header-date-badge">${dayDate.getDate()}</span>
      `;
      elements.calendarHeaderDays.appendChild(dayCol);
    });

    // 2. Renderizar Linha "Dia Todo" (All Day)
    elements.calendarAlldayColumns.innerHTML = '';
    weekDays.forEach(dayDate => {
      const dateIso = DateUtils.formatISODate(dayDate);
      const isToday = DateUtils.isSameDay(dayDate, today);
      const cell = document.createElement('div');
      cell.className = `cal-allday-cell ${isToday ? 'today' : ''}`;
      cell.dataset.date = dateIso;

      // Eventos de dia inteiro para este dia
      const allDayTasks = tasks.filter(t => t.date === dateIso && t.isAllDay);
      allDayTasks.forEach(task => {
        const cat = categoryMeta[task.category] || { name: task.category, icon: '📌', colorClass: 'badge-trabalho' };
        const chip = document.createElement('div');
        chip.className = `cal-allday-chip badge-category ${cat.colorClass}`;
        chip.title = `${cat.name}: ${task.title}`;
        chip.innerHTML = `${cat.icon} ${escapeHtml(task.title)}`;
        chip.addEventListener('click', () => openTaskModal(task));
        cell.appendChild(chip);
      });

      // Clique duplo ou simples em espaço vazio adiciona evento dia todo
      cell.addEventListener('click', (e) => {
        if (e.target.closest('.cal-allday-chip')) return;
        openTaskModal({ date: dateIso, isAllDay: true });
      });

      elements.calendarAlldayColumns.appendChild(cell);
    });

    // 3. Renderizar Grid Horário (07:00 às 22:00)
    elements.calendarGridBody.innerHTML = '';

    // Coluna da esquerda: Marcadores de Horas
    const timeGutter = document.createElement('div');
    timeGutter.className = 'calendar-time-gutter';
    for (let h = 7; h <= 22; h++) {
      const slot = document.createElement('div');
      slot.className = 'cal-time-slot';
      slot.textContent = `${String(h).padStart(2, '0')}:00`;
      timeGutter.appendChild(slot);
    }
    elements.calendarGridBody.appendChild(timeGutter);

    // 7 Colunas para os dias
    weekDays.forEach(dayDate => {
      const dateIso = DateUtils.formatISODate(dayDate);
      const isToday = DateUtils.isSameDay(dayDate, today);

      const dayColumn = document.createElement('div');
      dayColumn.className = `calendar-day-column ${isToday ? 'today' : ''}`;
      dayColumn.dataset.date = dateIso;

      // Células de hora clicáveis
      for (let h = 7; h <= 22; h++) {
        const hourCell = document.createElement('div');
        hourCell.className = 'cal-hour-cell';
        hourCell.dataset.hour = h;
        hourCell.addEventListener('click', (e) => {
          if (e.target.closest('.cal-event-card')) return;
          const startTime = `${String(h).padStart(2, '0')}:00`;
          const endTime = `${String(h + 1).padStart(2, '0')}:00`;
          openTaskModal({ date: dateIso, startTime, endTime, isAllDay: false });
        });
        dayColumn.appendChild(hourCell);
      }

      // Eventos com horário deste dia
      const timedTasks = tasks.filter(t => t.date === dateIso && !t.isAllDay && t.startTime);

      timedTasks.forEach(task => {
        const eventEl = createCalendarEventBlock(task);
        if (eventEl) {
          dayColumn.appendChild(eventEl);
        }
      });

      elements.calendarGridBody.appendChild(dayColumn);
    });
  }

  function createCalendarEventBlock(task) {
    const [startH, startM] = (task.startTime || '09:00').split(':').map(Number);
    if (isNaN(startH)) return null;

    let [endH, endM] = (task.endTime || '').split(':').map(Number);
    if (isNaN(endH)) {
      endH = startH + 1;
      endM = startM || 0;
    }

    // Intervalo válido entre 07:00 e 23:00
    const startHourOffset = (startH - 7) + (startM || 0) / 60;
    const endHourOffset = (endH - 7) + (endM || 0) / 60;
    const durationHours = Math.max(0.6, endHourOffset - startHourOffset);

    const cellHeight = 56; // Altura de cada hora em px
    const topPx = Math.max(0, startHourOffset * cellHeight);
    const heightPx = Math.max(26, durationHours * cellHeight - 4);

    const el = document.createElement('div');
    el.className = `cal-event-card event-${task.category || 'trabalho'}`;
    el.style.top = `${topPx}px`;
    el.style.height = `${heightPx}px`;

    const cat = categoryMeta[task.category] || { name: task.category, icon: '📌' };

    el.innerHTML = `
      <div class="cal-event-title">${cat.icon} ${escapeHtml(task.title)}</div>
      <div class="cal-event-time">${task.startTime}${task.endTime ? ' – ' + task.endTime : ''}</div>
    `;

    el.addEventListener('click', (e) => {
      e.stopPropagation();
      openTaskModal(task);
    });

    return el;
  }

  // =========================================================================
  // GESTÃO DO MODAL DE TAREFAS (CRIAR / EDITAR)
  // =========================================================================

  function openTaskModal(initialData = {}) {
    state.editingTaskId = initialData.id || null;
    state.subtasksBuffer = initialData.subtasks ? JSON.parse(JSON.stringify(initialData.subtasks)) : [];

    elements.modalTitle.textContent = state.editingTaskId ? 'Editar Compromisso' : 'Nova Tarefa';

    // Preenchimento dos campos
    elements.taskIdInput.value = initialData.id || '';
    elements.taskTitleInput.value = initialData.title || '';
    elements.taskCategorySelect.value = initialData.category || 'trabalho';
    elements.taskPrioritySelect.value = initialData.priority || 'media';
    
    // Data (se não informada, usa hoje ou a segunda da semana)
    elements.taskDateInput.value = initialData.date || DateUtils.formatISODate(new Date());

    // Dia Inteiro
    elements.taskAlldayInput.checked = !!initialData.isAllDay;
    toggleTimeInputs(!elements.taskAlldayInput.checked);

    elements.taskStartTimeInput.value = initialData.startTime || '09:00';
    elements.taskEndTimeInput.value = initialData.endTime || '10:00';

    // Status Radio
    const statusVal = initialData.status || 'todo';
    const statusRadio = elements.taskForm.querySelector(`input[name="task-status-radio"][value="${statusVal}"]`);
    if (statusRadio) statusRadio.checked = true;

    // Descrição
    elements.taskDescInput.value = initialData.description || '';

    // Botão excluir visível apenas na edição
    if (state.editingTaskId) {
      elements.btnDeleteTaskModal.classList.remove('hidden');
    } else {
      elements.btnDeleteTaskModal.classList.add('hidden');
    }

    renderSubtasksList();

    // Exibir Modal
    elements.modalOverlay.classList.remove('hidden');
    elements.modalOverlay.setAttribute('aria-hidden', 'false');
    setTimeout(() => elements.taskTitleInput.focus(), 80);
  }

  function closeTaskModal() {
    elements.modalOverlay.classList.add('hidden');
    elements.modalOverlay.setAttribute('aria-hidden', 'true');
    elements.taskForm.reset();
    state.editingTaskId = null;
    state.subtasksBuffer = [];
  }

  function toggleTimeInputs(show) {
    if (show) {
      elements.timeInputsRow.classList.remove('hidden');
    } else {
      elements.timeInputsRow.classList.add('hidden');
    }
  }

  // Renderizar itens de subtarefas no modal
  function renderSubtasksList() {
    elements.subtasksContainer.innerHTML = '';
    state.subtasksBuffer.forEach((sub, index) => {
      const row = document.createElement('div');
      row.className = 'subtask-input-row';
      row.innerHTML = `
        <input type="text" placeholder="Nome do item..." value="${escapeHtml(sub.title)}" data-index="${index}">
        <button type="button" class="btn-remove-subtask" data-index="${index}" title="Remover item">&times;</button>
      `;

      // Atualizar título ao digitar
      row.querySelector('input').addEventListener('input', (e) => {
        state.subtasksBuffer[index].title = e.target.value;
      });

      // Remover item
      row.querySelector('.btn-remove-subtask').addEventListener('click', () => {
        state.subtasksBuffer.splice(index, 1);
        renderSubtasksList();
      });

      elements.subtasksContainer.appendChild(row);
    });
  }

  function addSubtaskRow() {
    state.subtasksBuffer.push({
      id: 'sub-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
      title: '',
      completed: false
    });
    renderSubtasksList();
    const inputs = elements.subtasksContainer.querySelectorAll('input');
    if (inputs.length) {
      inputs[inputs.length - 1].focus();
    }
  }

  function handleSaveTask(e) {
    e.preventDefault();

    const title = elements.taskTitleInput.value.trim();
    if (!title) {
      showToast('Por favor, informe o título da tarefa.', 'info');
      elements.taskTitleInput.focus();
      return;
    }

    const category = elements.taskCategorySelect.value;
    const priority = elements.taskPrioritySelect.value;
    const date = elements.taskDateInput.value;
    const isAllDay = elements.taskAlldayInput.checked;
    const startTime = isAllDay ? '' : elements.taskStartTimeInput.value;
    const endTime = isAllDay ? '' : elements.taskEndTimeInput.value;
    const statusRadio = elements.taskForm.querySelector('input[name="task-status-radio"]:checked');
    const status = statusRadio ? statusRadio.value : 'todo';
    const description = elements.taskDescInput.value.trim();

    // Filtrar subtarefas sem título
    const subtasks = state.subtasksBuffer.filter(s => s.title && s.title.trim().length > 0);

    const taskData = {
      title,
      category,
      priority,
      date,
      isAllDay,
      startTime,
      endTime,
      status,
      description,
      subtasks
    };

    if (state.editingTaskId) {
      taskData.id = state.editingTaskId;
      TaskRepository.updateTask(taskData);
      showToast('Compromisso atualizado com sucesso!', 'success');
    } else {
      TaskRepository.addTask(taskData);
      showToast('Nova tarefa criada com sucesso!', 'success');
    }

    closeTaskModal();
    renderApp();
  }

  function confirmDeleteTask(taskId) {
    if (confirm('Tem certeza de que deseja excluir este compromisso?')) {
      TaskRepository.deleteTask(taskId);
      showToast('Compromisso excluído.', 'info');
      if (!elements.modalOverlay.classList.contains('hidden')) {
        closeTaskModal();
      }
      renderApp();
    }
  }

  // =========================================================================
  // RENDERIZADOR GERAL E ATUALIZAÇÃO
  // =========================================================================

  function renderCurrentView() {
    if (state.activeView === 'today') {
      renderTodayView();
    } else if (state.activeView === 'list') {
      renderListView();
    } else if (state.activeView === 'kanban') {
      renderKanbanView();
    } else if (state.activeView === 'calendar') {
      renderCalendarView();
    }
  }

  function renderApp() {
    updateWeekHeader();
    updateMetricsAndCounters();
    renderCurrentView();
  }

  // =========================================================================
  // EVENT LISTENERS
  // =========================================================================

  // Navegação de semana
  elements.btnPrevWeek.addEventListener('click', () => changeWeek(-1));
  elements.btnNextWeek.addEventListener('click', () => changeWeek(1));
  elements.btnToday.addEventListener('click', () => {
    goToCurrentWeek();
    switchView('today');
  });

  // Tabs de visualização (Hoje, Lista, Kanban, Calendário)
  elements.viewTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      switchView(tab.dataset.view);
    });
  });

  // Botão Nova Tarefa Header
  elements.btnOpenNewTask.addEventListener('click', () => {
    openTaskModal({ date: DateUtils.formatISODate(new Date()) });
  });

  // Ações da Aba Hoje (Adição Rápida e Botão Hero)
  if (elements.todayQuickForm) {
    elements.todayQuickForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = elements.todayQuickTitle.value.trim();
      if (!title) return;

      const category = elements.todayQuickCategory.value;
      const priority = elements.todayQuickPriority.value;
      const todayIso = DateUtils.formatISODate(new Date());

      TaskRepository.addTask({
        title,
        category,
        priority,
        date: todayIso,
        isAllDay: true,
        startTime: '',
        endTime: '',
        status: 'todo',
        description: '',
        subtasks: []
      });

      elements.todayQuickTitle.value = '';
      showToast('Tarefa adicionada para hoje! ✨', 'success');
      renderApp();
    });
  }

  if (elements.btnQuickAddToday) {
    elements.btnQuickAddToday.addEventListener('click', () => {
      openTaskModal({ date: DateUtils.formatISODate(new Date()) });
    });
  }

  // Resetar / Excluir Todas as Atividades da Agenda
  if (elements.btnClearAll) {
    elements.btnClearAll.addEventListener('click', () => {
      const confirmed = confirm('Tem certeza de que deseja excluir TODAS as atividades da sua agenda? Esta ação limpará todas as tarefas salvas.');
      if (confirmed) {
        TaskRepository.clearAllTasks();
        showToast('Todas as atividades foram excluídas.', 'info');
        renderApp();
      }
    });
  }

  // Filtros de Categoria
  elements.categoryPills.forEach(pill => {
    pill.addEventListener('click', () => {
      elements.categoryPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      state.filterCategory = pill.dataset.category;
      renderApp();
    });
  });

  // Filtro de Prioridade
  elements.filterPrioritySelect.addEventListener('change', (e) => {
    state.filterPriority = e.target.value;
    renderApp();
  });

  // Busca em tempo real
  elements.filterSearchInput.addEventListener('input', (e) => {
    state.filterSearch = e.target.value.trim();
    if (state.filterSearch) {
      elements.btnClearSearch.classList.remove('hidden');
    } else {
      elements.btnClearSearch.classList.add('hidden');
    }
    renderApp();
  });

  elements.btnClearSearch.addEventListener('click', () => {
    elements.filterSearchInput.value = '';
    state.filterSearch = '';
    elements.btnClearSearch.classList.add('hidden');
    renderApp();
    elements.filterSearchInput.focus();
  });

  // Botões de adição rápida nos cabeçalhos de coluna do Kanban
  document.querySelectorAll('.kanban-add-quick-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const colStatus = btn.dataset.status;
      openTaskModal({
        date: DateUtils.formatISODate(new Date()),
        status: colStatus
      });
    });
  });

  // Formulário do Modal
  elements.taskForm.addEventListener('submit', handleSaveTask);
  elements.btnCloseModal.addEventListener('click', closeTaskModal);
  elements.btnCancelModal.addEventListener('click', closeTaskModal);
  elements.btnDeleteTaskModal.addEventListener('click', () => {
    if (state.editingTaskId) {
      confirmDeleteTask(state.editingTaskId);
    }
  });

  // Fechar modal clicando fora do card
  elements.modalOverlay.addEventListener('click', (e) => {
    if (e.target === elements.modalOverlay) {
      closeTaskModal();
    }
  });

  // Fechar com ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !elements.modalOverlay.classList.contains('hidden')) {
      closeTaskModal();
    }
  });

  // Toggle do Dia Inteiro
  elements.taskAlldayInput.addEventListener('change', (e) => {
    toggleTimeInputs(!e.target.checked);
  });

  // Adicionar linha de subtarefa
  elements.btnAddSubtaskRow.addEventListener('click', addSubtaskRow);

  // Inicialização
  renderApp();
});
