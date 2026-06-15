export const adhdTriggers = [
  { text: 'Tomar meus medicamentos', icon: '💊' },
  { text: 'Beber um copo d\'água agora', icon: '💧' },
  { text: 'Pagar contas/boletos de hoje', icon: '💸' },
  { text: 'Responder mensagens pendentes', icon: '✉️' },
  { text: 'Organizar a bagunça da mesa', icon: '🧹' }
];

export const maxQuotes = [
  "Dividir a tarefa faz o monstro parecer menor. Eu já dividi a minha. E você?",
  "Não precisa ser perfeito. Feito é melhor do que perfeito!",
  "Sua mente está acelerada? Que tal beber um gole de água agora?",
  "Apenas comece com o passo de 2 minutos. O resto vem depois!",
  "Estou bem aqui ao seu lado. Vamos focar por mais alguns minutos!",
  "Você já descarregou sua mente hoje no Brain Dump? Isso ajuda a clarear as coisas.",
  "A cegueira temporal é real. Deixe o timer fazer o trabalho de contar o tempo por você.",
  "Completar essa tarefa vai te dar uma bela dose de dopamina natural!"
];

// Key points of the ADHD energy curve: hour (6 to 23) -> Y coordinate (20 to 95)
// In SVG coordinates, Y = 0 is maximum energy (top), Y = 100 is minimum energy (bottom)
export const getEnergyY = (h: number): number => {
  const hour = Math.max(6, Math.min(23, h));
  const points = [
    { h: 6, y: 90 },       // Waking up
    { h: 9.5, y: 20 },     // Morning Peak Focus (09:30)
    { h: 12.5, y: 55 },    // Midday Dip
    { h: 14.5, y: 85 },    // Post-Lunch Crash
    { h: 18, y: 30 },      // Evening Second Wind Peak
    { h: 21, y: 65 },      // Wind Down
    { h: 23, y: 95 }       // Sleeping
  ];

  let i = 0;
  while (i < points.length - 1 && hour > points[i+1].h) {
    i++;
  }

  const p0 = points[i];
  const p1 = points[i+1];
  const t = (hour - p0.h) / (p1.h - p0.h);
  
  // Cosine interpolation for organic wave curve
  const mu = (1 - Math.cos(t * Math.PI)) / 2;
  return p0.y * (1 - mu) + p1.y * mu;
};

export const getEnergyX = (h: number): number => {
  const hour = Math.max(6, Math.min(23, h));
  return ((hour - 6) / 17) * 500; // Map 6h - 23h to 0 - 500 SVG coordinate
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
