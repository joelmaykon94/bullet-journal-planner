import { ADHD_TRIGGERS, MAX_QUOTES } from './constants';

export const adhdTriggers = ADHD_TRIGGERS;
export const maxQuotes = MAX_QUOTES;

/**
 * Calculate how many days a task has been pending.
 * Uses createdAt (preserved across migrations) as the primary reference,
 * falling back to item.date if createdAt is unavailable.
 * This ensures that tasks migrated across multiple days retain
 * their true age from the original creation date.
 */
export const getTaskPendingDays = (itemDate: string, itemCreatedAt?: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let refDate: Date;

  if (itemCreatedAt) {
    // Use original creation date (preserved across migrations)
    refDate = new Date(itemCreatedAt);
  } else if (itemDate) {
    // Fallback to scheduled date
    const [y, m, d] = itemDate.split('-').map(Number);
    refDate = new Date(y, m - 1, d);
  } else {
    return 0;
  }

  refDate.setHours(0, 0, 0, 0);

  const diffMs = today.getTime() - refDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return Math.max(0, diffDays);
};

/**
 * Returns a CSS class tier name for the aged paper effect.
 * Returns '' if the task is not old enough.
 */
export const getAgingTier = (pendingDays: number): string => {
  if (pendingDays >= 10) return 'aged-paper-3';
  if (pendingDays >= 5) return 'aged-paper-2';
  if (pendingDays >= 2) return 'aged-paper-1';
  return '';
};

/**
 * Returns a CSS class for the pending days badge color.
 */
export const getPendingBadgeClass = (pendingDays: number): string => {
  if (pendingDays >= 10) return 'pending-days-3';
  if (pendingDays >= 5) return 'pending-days-2';
  if (pendingDays >= 2) return 'pending-days-1';
  return '';
};

export const getEnergyPoints = (settings?: {
  dayStart?: string;
  energyPeakStart?: string;
  energyPeakEnd?: string;
  restStart?: string;
  restEnd?: string;
  secondWindStart?: string;
  secondWindEnd?: string;
  dayEnd?: string;
}) => {
  const parseTimeToHour = (timeStr?: string, defaultHour: number = 0): number => {
    if (!timeStr) return defaultHour;
    const [h, m] = timeStr.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return defaultHour;
    return h + m / 60;
  };

  const dayStart = parseTimeToHour(settings?.dayStart, 6.0);
  const peakStart = parseTimeToHour(settings?.energyPeakStart, 9.5);
  const peakEnd = parseTimeToHour(settings?.energyPeakEnd, 12.5);
  const restStart = parseTimeToHour(settings?.restStart, 13.5);
  const restEnd = parseTimeToHour(settings?.restEnd, 16.0);
  const windStart = parseTimeToHour(settings?.secondWindStart, 16.5);
  const windEnd = parseTimeToHour(settings?.secondWindEnd, 20.0);
  const dayEnd = parseTimeToHour(settings?.dayEnd, 23.0);

  const peakMid = (peakStart + peakEnd) / 2;
  const dipMid = (peakEnd + restStart) / 2;
  const restMid = (restStart + restEnd) / 2;
  const windMid = (windStart + windEnd) / 2;
  const windDownMid = (windEnd + dayEnd) / 2;

  const rawPoints = [
    { h: dayStart, y: 90 },
    { h: peakMid, y: 20 },
    { h: dipMid, y: 55 },
    { h: restMid, y: 85 },
    { h: windMid, y: 30 },
    { h: windDownMid, y: 65 },
    { h: dayEnd, y: 95 }
  ];

  rawPoints.sort((a, b) => a.h - b.h);

  const points = [];
  for (let i = 0; i < rawPoints.length; i++) {
    if (i === 0 || rawPoints[i].h > rawPoints[i - 1].h) {
      points.push(rawPoints[i]);
    }
  }

  return points;
};

// Key points of the ADHD energy curve: hour -> Y coordinate (20 to 95)
// In SVG coordinates, Y = 0 is maximum energy (top), Y = 100 is minimum energy (bottom)
export const getEnergyY = (h: number, settings?: any): number => {
  const points = getEnergyPoints(settings);
  if (points.length < 2) return 50;

  const minHour = points[0].h;
  const maxHour = points[points.length - 1].h;
  const hour = Math.max(minHour, Math.min(maxHour, h));

  let i = 0;
  while (i < points.length - 1 && hour > points[i+1].h) {
    i++;
  }

  const p0 = points[i];
  const p1 = points[i+1];
  
  const span = p1.h - p0.h;
  const t = span <= 0 ? 0 : (hour - p0.h) / span;
  
  // Cosine interpolation for organic wave curve
  const mu = (1 - Math.cos(t * Math.PI)) / 2;
  return p0.y * (1 - mu) + p1.y * mu;
};

export const getEnergyX = (h: number, settings?: any): number => {
  const points = getEnergyPoints(settings);
  if (points.length < 2) return 250;
  const minHour = points[0].h;
  const maxHour = points[points.length - 1].h;
  const hour = Math.max(minHour, Math.min(maxHour, h));
  
  const span = maxHour - minHour;
  return span <= 0 ? 250 : ((hour - minHour) / span) * 500; // Map minHour - maxHour to 0 - 500 SVG coordinate
};

export const getHarmonyScore = (energyLevel: number, anxietyLevel: number): number => {
  const e = energyLevel / 100;
  const a = anxietyLevel / 100;
  return Math.round((e * (1 - a)) * 100);
};

export const getHarmonyRecommendation = (score: number): string => {
  if (score > 80) return "Sincronia Perfeita: Ótimo momento para tarefas complexas e criativas!";
  if (score > 60) return "Equilíbrio Estável: Bom para manter o ritmo e concluir pendências.";
  if (score > 40) return "Fricção Moderada: Considere simplificar as próximas tarefas.";
  if (score > 20) return "Sobrecarga Detectada: Priorize o descanso e micro-passos.";
  return "Estado de Crise: Pare tudo e use o Alívio Cognitivo agora.";
};

export const getRealTimeSuggestions = (text: string) => {
  if (!text || text.length < 3) return null;
  const lower = text.toLowerCase();
  let classification = '';
  let category = '';
  let subtasks: string[] = [];

  if (lower.includes('médico') || lower.includes('consulta') || lower.includes('remédio') || lower.includes('saúde') || lower.includes('exame') || lower.includes('dentista') || lower.includes('psicólogo')) {
    classification = 'saude';
    category = '🩺 Saúde & Bem-estar';
    subtasks = [
      'Agendar no calendário com 2 alertas',
      'Separar documentos/exames necessários',
      'Definitir como chegar ao local (Uber/Carro/Ônibus)'
    ];
  } else if (lower.includes('estudar') || lower.includes('ler') || lower.includes('curso') || lower.includes('revisar') || lower.includes('livro') || lower.includes('pdf') || lower.includes('vídeo') || lower.includes('podcast') || lower.includes('aprender') || lower.includes('pesquisar')) {
    classification = 'aprendizado';
    category = '📚 Aprendizado (Novidade!)';
    subtasks = [
      'Definir um sub-tópico específico para consumir',
      'Anotar os 3 principais insights em tópicos rápidos',
      'Revisar anotações para reter na memória de trabalho'
    ];
  } else if (lower.includes('limpar') || lower.includes('descansar') || lower.includes('pausa') || lower.includes('dormir') || lower.includes('meditar') || lower.includes('alongar') || lower.includes('caminhar') || lower.includes('lavar') || lower.includes('organizar') || lower.includes('arrumar') || lower.includes('almoçar') || lower.includes('jantar') || lower.includes('comer')) {
    classification = 'descanso';
    category = '🧘 Revisão & Descanso';
    subtasks = [
      'Definir timer de 15 a 30 minutos',
      'Fazer alongamento ou fechar os olhos',
      'Refletir e anotar o que já concluiu hoje para consolidar'
    ];
  } else {
    classification = 'foco';
    category = '⚡ Foco Profundo (Proteger!)';
    subtasks = [
      'Proteger o bloco eliminando todas as notificações',
      'Separar material necessário e fechar abas extras',
      'Trabalhar focado por 25 minutos com timer Pomodoro'
    ];
  }

  if (lower.includes('limpar') || lower.includes('arrumar') || lower.includes('casa') || lower.includes('quarto') || lower.includes('cozinha') || lower.includes('louça')) {
    subtasks = [
      'Recolher objetos jogados ou lixos visíveis',
      'Varrer rápido o centro do cômodo',
      'Passar um pano básico nas superfícies principais'
    ];
  } else if (lower.includes('relatório') || lower.includes('trabalho') || lower.includes('projeto') || lower.includes('escrever') || lower.includes('apresentação') || lower.includes('slide')) {
    subtasks = [
      'Abrir o arquivo principal do projeto',
      'Escrever o título e sumário dos pontos principais',
      'Escrever continuamente por 15 minutos sem editar nada'
    ];
  } else if (lower.includes('comprar') || lower.includes('mercado') || lower.includes('supermercado') || lower.includes('compras') || lower.includes('feira')) {
    subtasks = [
      'Olhar geladeira/despensa rápido e tirar fotos',
      'Listar apenas os 5 itens de sobrevivência urgentes',
      'Fazer o pedido no app para evitar distrações nos corredores'
    ];
  }

  return { classification, category, subtasks };
};

export const getLocalDateString = (d: Date = new Date()): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getWeekdaysForDate = (dateStr: string): string[] => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const currentDay = date.getDay();
  const dayOffset = currentDay === 0 ? -6 : 1 - currentDay;
  
  const monday = new Date(date);
  monday.setDate(date.getDate() + dayOffset);
  
  const weekdays: string[] = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dayVal = String(d.getDate()).padStart(2, '0');
    weekdays.push(`${y}-${m}-${dayVal}`);
  }
  return weekdays;
};
