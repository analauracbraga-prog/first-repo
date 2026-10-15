/**
 * Minha Agenda - Gerenciamento de Dados e Persistência Local
 * Categorias: trabalho, faculdade, pessoal, espiritual, estudos
 */

const STORAGE_KEY = 'minha_agenda_tasks_v1';

// Formatação e auxílio de datas
const DateUtils = {
  // Retorna a segunda-feira da semana de uma data de referência
  getMondayOfWeek(d) {
    const date = new Date(d);
    const day = date.getDay();
    // No JS: 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(date.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  },

  // Retorna array com os 7 dias da semana (Segunda a Domingo)
  getWeekDays(monday) {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      days.push(day);
    }
    return days;
  },

  // Formata para YYYY-MM-DD
  formatISODate(d) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // Retorna string legível de data brasileira: "14 de Outubro"
  formatDayMonthBR(d) {
    return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
  },

  // Nome do dia da semana: "Segunda-feira"
  getWeekdayName(d) {
    const names = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    return names[d.getDay()];
  },

  // Abreviação do dia da semana: "SEG"
  getWeekdayShort(d) {
    const shorts = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
    return shorts[d.getDay()];
  },

  // Compara se duas datas correspondem ao mesmo dia
  isSameDay(d1, d2) {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  }
};

// Gerador de dados de demonstração dinâmicos em torno da semana atual
function generateSeedTasks(baseMonday) {
  const addDays = (days) => {
    const d = new Date(baseMonday);
    d.setDate(baseMonday.getDate() + days);
    return DateUtils.formatISODate(d);
  };

  return [
    // SEGUNDA (Dia 0)
    {
      id: 'task-seed-1',
      title: 'Momento Devocional & Meditação da Manhã',
      category: 'espiritual',
      date: addDays(0),
      isAllDay: false,
      startTime: '07:00',
      endTime: '07:45',
      status: 'done',
      priority: 'baixa',
      description: 'Agradecimento semanal, oração silenciosa e reflexão bíblica.',
      subtasks: [
        { id: 'st-1', title: 'Salmos da semana', completed: true },
        { id: 'st-2', title: 'Anotar no diário de gratidão', completed: true }
      ]
    },
    {
      id: 'task-seed-2',
      title: 'Alinhamento Semanal de Projetos & Metas',
      category: 'trabalho',
      date: addDays(0),
      isAllDay: false,
      startTime: '09:00',
      endTime: '10:30',
      status: 'done',
      priority: 'alta',
      description: 'Reunião com a liderança para priorização de entregas e distribuição de demandas da equipe.',
      subtasks: [
        { id: 'st-3', title: 'Apresentar KPIs do dashboard', completed: true },
        { id: 'st-4', title: 'Delegar tarefas do sprint', completed: true }
      ]
    },
    {
      id: 'task-seed-3',
      title: 'Feira Orgânica & Abastecimento Semanal',
      category: 'pessoal',
      date: addDays(0),
      isAllDay: false,
      startTime: '17:30',
      endTime: '18:45',
      status: 'done',
      priority: 'baixa',
      description: 'Comprar frutas frescas, verduras e temperos para refeições saudáveis.',
      subtasks: []
    },

    // TERÇA (Dia 1)
    {
      id: 'task-seed-4',
      title: 'Módulo de Design System & Acessibilidade Web',
      category: 'estudos',
      date: addDays(1),
      isAllDay: false,
      startTime: '14:30',
      endTime: '16:30',
      status: 'done',
      priority: 'alta',
      description: 'Praticar arquitetura de tokens de cores, contraste WCAG AAA e microinterações.',
      subtasks: [
        { id: 'st-5', title: 'Assistir aula sobre semântica', completed: true },
        { id: 'st-6', title: 'Criar protótipo no Figma', completed: true }
      ]
    },
    {
      id: 'task-seed-5',
      title: 'Aula Magna de Metodologia Científica',
      category: 'faculdade',
      date: addDays(1),
      isAllDay: false,
      startTime: '19:00',
      endTime: '21:30',
      status: 'done',
      priority: 'media',
      description: 'Discussão sobre fichamento bibliográfico e estrutura de projetos de pesquisa.',
      subtasks: [
        { id: 'st-7', title: 'Revisar capítulos 3 e 4', completed: true }
      ]
    },

    // QUARTA (Dia 2 - Hoje em muitas simulações)
    {
      id: 'task-seed-6',
      title: 'Sessão de Pilates & Respiração Consciente',
      category: 'saude',
      date: addDays(2),
      isAllDay: false,
      startTime: '08:00',
      endTime: '09:00',
      status: 'done',
      priority: 'baixa',
      description: 'Alongamento para alívio de tensão nos ombros e fortalecimento do core.',
      subtasks: []
    },
    {
      id: 'task-seed-7',
      title: 'Desenvolvimento do Relatório Trimestral',
      category: 'trabalho',
      date: addDays(2),
      isAllDay: false,
      startTime: '10:00',
      endTime: '12:30',
      status: 'in_progress',
      priority: 'alta',
      description: 'Consolidar métricas de conversão e gráficos comparativos no PowerBI / Dashboard.',
      subtasks: [
        { id: 'st-8', title: 'Validar dados da base SQL', completed: true },
        { id: 'st-9', title: 'Escrever insights executivos', completed: false }
      ]
    },
    {
      id: 'task-seed-8',
      title: 'Revisão de Literatura do Artigo Acadêmico',
      category: 'faculdade',
      date: addDays(2),
      isAllDay: false,
      startTime: '16:00',
      endTime: '18:30',
      status: 'in_progress',
      priority: 'alta',
      description: 'Redigir a introdução e o estado da arte para a entrega do comitê.',
      subtasks: [
        { id: 'st-10', title: 'Consultar 4 artigos indexados', completed: true },
        { id: 'st-11', title: 'Ajustar normas ABNT', completed: false }
      ]
    },

    // QUINTA (Dia 3)
    {
      id: 'task-seed-9',
      title: 'Leitura Contemplativa & Prática de Silêncio',
      category: 'espiritual',
      date: addDays(3),
      isAllDay: false,
      startTime: '07:15',
      endTime: '08:00',
      status: 'todo',
      priority: 'baixa',
      description: '20 minutos de respiração e reflexão de paz interior.',
      subtasks: []
    },
    {
      id: 'task-seed-10',
      title: 'Prática de Idiomas: Conversação em Inglês',
      category: 'estudos',
      date: addDays(3),
      isAllDay: false,
      startTime: '17:00',
      endTime: '18:00',
      status: 'todo',
      priority: 'media',
      description: 'Encontro com grupo de estudos online focado em vocabulário profissional.',
      subtasks: [
        { id: 'st-12', title: 'Revisar expressões de negócios', completed: false }
      ]
    },
    {
      id: 'task-seed-11',
      title: 'Reunião de Feedback com Equipe',
      category: 'trabalho',
      date: addDays(3),
      isAllDay: false,
      startTime: '14:00',
      endTime: '15:30',
      status: 'todo',
      priority: 'media',
      description: 'Conversas individuais de acompanhamento 1-on-1.',
      subtasks: []
    },

    // SEXTA (Dia 4)
    {
      id: 'task-seed-12',
      title: 'Sprint Retrospective & Fechamento de Chamados',
      category: 'trabalho',
      date: addDays(4),
      isAllDay: false,
      startTime: '11:00',
      endTime: '12:30',
      status: 'todo',
      priority: 'alta',
      description: 'Avaliação dos pontos positivos e oportunidades de melhoria.',
      subtasks: []
    },
    {
      id: 'task-seed-13',
      title: 'Entrega Parcial da Pesquisa Acadêmica',
      category: 'faculdade',
      date: addDays(4),
      isAllDay: true,
      startTime: '',
      endTime: '',
      status: 'todo',
      priority: 'alta',
      description: 'Submeter PDF final no portal acadêmico até as 23h59.',
      subtasks: []
    },
    {
      id: 'task-seed-14',
      title: 'Noite de Descanso, Cinema & Chá de Camomila',
      category: 'pessoal',
      date: addDays(4),
      isAllDay: false,
      startTime: '20:30',
      endTime: '22:30',
      status: 'todo',
      priority: 'baixa',
      description: 'Desconectar das telas de trabalho e relaxar em casa.',
      subtasks: []
    },

    // SÁBADO (Dia 5)
    {
      id: 'task-seed-15',
      title: 'Grupo de Estudos de Estatística Aplicada',
      category: 'faculdade',
      date: addDays(5),
      isAllDay: false,
      startTime: '10:00',
      endTime: '12:00',
      status: 'todo',
      priority: 'media',
      description: 'Resolver lista de exercícios sobre regressão linear com colegas.',
      subtasks: []
    },
    {
      id: 'task-seed-16',
      title: 'Leitura do Livro "Essencialismo"',
      category: 'estudos',
      date: addDays(5),
      isAllDay: false,
      startTime: '15:30',
      endTime: '17:00',
      status: 'todo',
      priority: 'baixa',
      description: 'Capítulos sobre eliminação de ruídos e disciplina do foco.',
      subtasks: []
    },

    // DOMINGO (Dia 6)
    {
      id: 'task-seed-17',
      title: 'Culto / Celebração Comunitária de Domingo',
      category: 'espiritual',
      date: addDays(6),
      isAllDay: false,
      startTime: '10:00',
      endTime: '11:30',
      status: 'todo',
      priority: 'media',
      description: 'Comunhão, música e acolhimento com amigos e família.',
      subtasks: []
    },
    {
      id: 'task-seed-18',
      title: 'Planejamento e Intenções da Próxima Semana',
      category: 'pessoal',
      date: addDays(6),
      isAllDay: false,
      startTime: '18:00',
      endTime: '19:00',
      status: 'todo',
      priority: 'baixa',
      description: 'Revisar tarefas, organizar a mesa de estudos e alinhar horários.',
      subtasks: []
    }
  ];
}

// Repositório de Dados
const TaskRepository = {
  getTasks() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Cria semente inicial com base na semana atual
      const currentMonday = DateUtils.getMondayOfWeek(new Date());
      const seed = generateSeedTasks(currentMonday);
      this.saveTasks(seed);
      return seed;
    }
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.error('Falha ao decodificar tarefas locais:', e);
      return [];
    }
  },

  saveTasks(tasks) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  },

  addTask(taskData) {
    const tasks = this.getTasks();
    const newTask = {
      id: 'task-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      subtasks: [],
      ...taskData
    };
    tasks.push(newTask);
    this.saveTasks(tasks);
    return newTask;
  },

  updateTask(updatedTask) {
    const tasks = this.getTasks();
    const index = tasks.findIndex(t => t.id === updatedTask.id);
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...updatedTask };
      this.saveTasks(tasks);
      return tasks[index];
    }
    return null;
  },

  deleteTask(id) {
    let tasks = this.getTasks();
    tasks = tasks.filter(t => t.id !== id);
    this.saveTasks(tasks);
  },

  toggleDone(id) {
    const tasks = this.getTasks();
    const task = tasks.find(t => t.id === id);
    if (task) {
      task.status = task.status === 'done' ? 'todo' : 'done';
      this.saveTasks(tasks);
      return task;
    }
    return null;
  },

  updateStatus(id, newStatus) {
    const tasks = this.getTasks();
    const task = tasks.find(t => t.id === id);
    if (task) {
      task.status = newStatus;
      this.saveTasks(tasks);
      return task;
    }
    return null;
  },

  resetToDemo(baseMonday) {
    const seed = generateSeedTasks(baseMonday || DateUtils.getMondayOfWeek(new Date()));
    this.saveTasks(seed);
    return seed;
  },

  clearAllTasks() {
    this.saveTasks([]);
    return [];
  }
};
