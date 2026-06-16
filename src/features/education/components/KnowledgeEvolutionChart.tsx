import { useState, useEffect } from 'react';
import { BookOpen, GraduationCap, Briefcase, Plus, Calendar, Clock, BarChart3, Trash2, Check, Sparkles, X, ChevronRight } from 'lucide-react';
import { useBujo } from '../../../context/BujoContext';
import { BragEntry } from '../../../types';

export interface StudySubject {
  id: string;
  name: string;
  type: 'professional' | 'academic';
  progress: number; // 0 to 100
  hoursStudied: number;
  lastStudied?: string;
  color: string;
  icon: string;
}

export interface StudyLogEntry {
  id: string;
  subjectId: string;
  subjectName: string;
  type: 'professional' | 'academic';
  hours: number;
  date: string;
  note: string;
  xpEarned: number;
}

export const KnowledgeEvolutionChart = () => {
  const { setUserXp, showToast } = useBujo();
  
  // Tabs: 'summary' | 'subjects' | 'history'
  const [activeSubTab, setActiveSubTab] = useState<'summary' | 'subjects' | 'history' | 'brag'>('summary');
  
  // State for subjects
  const [subjects, setSubjects] = useState<StudySubject[]>(() => {
    const saved = localStorage.getItem('bujo_study_subjects');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'sub-1', name: 'Metodologia de Pesquisa', type: 'academic', progress: 30, hoursStudied: 12, color: '#4A7C6C', icon: '🔬' },
      { id: 'sub-2', name: 'Escrita de Dissertação', type: 'academic', progress: 15, hoursStudied: 6, color: '#ec4899', icon: '📝' },
      { id: 'sub-3', name: 'Algoritmos Avançados', type: 'academic', progress: 50, hoursStudied: 20, color: '#a855f7', icon: '📊' },
      { id: 'sub-4', name: 'Arquitetura de Software', type: 'professional', progress: 70, hoursStudied: 35, color: '#E08E45', icon: '💻' },
      { id: 'sub-5', name: 'DevOps & Kubernetes', type: 'professional', progress: 40, hoursStudied: 16, color: '#3b82f6', icon: '☁️' },
      { id: 'sub-6', name: 'Liderança & Agilidade', type: 'professional', progress: 25, hoursStudied: 8, color: '#10b981', icon: '🧠' }
    ];
  });

  // State for study log
  const [studyLog, setStudyLog] = useState<StudyLogEntry[]>(() => {
    const saved = localStorage.getItem('bujo_study_log');
    if (saved) return JSON.parse(saved);
    // Default initial mock history to show evolution
    const today = new Date();
    const d1 = new Date(today); d1.setDate(today.getDate() - 5);
    const d2 = new Date(today); d2.setDate(today.getDate() - 4);
    const d3 = new Date(today); d3.setDate(today.getDate() - 3);
    const d4 = new Date(today); d4.setDate(today.getDate() - 2);
    const d5 = new Date(today); d5.setDate(today.getDate() - 1);
    
    return [
      { id: 'log-1', subjectId: 'sub-1', subjectName: 'Metodologia de Pesquisa', type: 'academic', hours: 2, date: d1.toISOString().split('T')[0], note: 'Revisão sistemática de literatura', xpEarned: 30 },
      { id: 'log-2', subjectId: 'sub-4', subjectName: 'Arquitetura de Software', type: 'professional', hours: 3, date: d2.toISOString().split('T')[0], note: 'Design de Microserviços e Sagas', xpEarned: 45 },
      { id: 'log-3', subjectId: 'sub-3', subjectName: 'Algoritmos Avançados', type: 'academic', hours: 1.5, date: d3.toISOString().split('T')[0], note: 'Grafos e Programação Dinâmica', xpEarned: 22 },
      { id: 'log-4', subjectId: 'sub-5', subjectName: 'DevOps & Kubernetes', type: 'professional', hours: 2, date: d4.toISOString().split('T')[0], note: 'Configuração de Helm Charts', xpEarned: 30 },
      { id: 'log-5', subjectId: 'sub-2', subjectName: 'Escrita de Dissertação', type: 'academic', hours: 4, date: d5.toISOString().split('T')[0], note: 'Rascunho da Introdução', xpEarned: 60 }
    ];
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('bujo_study_subjects', JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem('bujo_study_log', JSON.stringify(studyLog));
  }, [studyLog]);

  
  // State for Brag Document
  const [bragEntries, setBragEntries] = useState<BragEntry[]>(() => {
    const saved = localStorage.getItem('bujo_brag_document');
    if (saved) return JSON.parse(saved);
    return [];
  });

  useEffect(() => {
    localStorage.setItem('bujo_brag_document', JSON.stringify(bragEntries));
  }, [bragEntries]);

  // Brag Form States
  const [showBragModal, setShowBragModal] = useState(false);
  const [bragTitle, setBragTitle] = useState('');
  const [bragCategory, setBragCategory] = useState<BragEntry['category']>('Projeto');
  const [bragScope, setBragScope] = useState('');
  const [bragImpact, setBragImpact] = useState('');
  const [bragOkrs, setBragOkrs] = useState('');
  const [bragSubjectId, setBragSubjectId] = useState('');

  const handleCreateBrag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bragTitle.trim() || !bragScope.trim() || !bragImpact.trim()) return;

    const newBrag: BragEntry = {
      id: `brag-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      title: bragTitle.trim(),
      category: bragCategory,
      scope: bragScope.trim(),
      impact: bragImpact.trim(),
      okrs: bragOkrs.trim(),
      subjectId: bragSubjectId || undefined
    };

    setBragEntries(prev => [newBrag, ...prev]);

    // If linked to a subject, boost progress and hours (mock 5 hours worth of XP)
    if (bragSubjectId) {
      const xp = 75; // 5 hours * 15 xp
      setSubjects(prev => prev.map(s => {
        if (s.id === bragSubjectId) {
          const nextProgress = Math.min(100, s.progress + 15); // +15% progress
          return {
            ...s,
            progress: nextProgress,
            hoursStudied: s.hoursStudied + 5,
            lastStudied: newBrag.date
          };
        }
        return s;
      }));
      setUserXp(prev => prev + xp);
      showToast(`🏆 Conquista Registrada! +15% de progresso na matéria e +${xp} XP.`);
    } else {
      showToast('🏆 Conquista Registrada com sucesso no Brag Document!');
    }

    setBragTitle('');
    setBragScope('');
    setBragImpact('');
    setBragOkrs('');
    setShowBragModal(false);
  };

  const handleDeleteBrag = (id: string) => {
    if (confirm('Remover esta conquista do seu Brag Document?')) {
      setBragEntries(prev => prev.filter(b => b.id !== id));
      showToast('Conquista removida.');
    }
  };


  // Log Form states
  const [showLogModal, setShowLogModal] = useState(false);
  const [logSubjectId, setLogSubjectId] = useState(subjects[0]?.id || '');
  const [logHours, setLogHours] = useState<number>(1);
  const [logNote, setLogNote] = useState('');
  
  // Subject Creation states
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [newSubType, setNewSubType] = useState<'professional' | 'academic'>('academic');
  const [newSubIcon, setNewSubIcon] = useState('🔬');
  const [newSubColor, setNewSubColor] = useState('#4A7C6C');
  const [showIconDropdown, setShowIconDropdown] = useState(false);

  const colorsList = ['#4A7C6C', '#E08E45', '#ec4899', '#a855f7', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];
  const emojisList = ['🔬', '💻', '📝', '📊', '☁️', '🧠', '🎓', '📚', '📈', '💡', '🧪', '🛠️', '🧬', '🎨', '🗣️'];

  const handleLogStudy = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedSub = subjects.find(s => s.id === logSubjectId);
    if (!selectedSub) return;

    const xp = Math.round(logHours * 15);
    const todayStr = new Date().toISOString().split('T')[0];

    const newLog: StudyLogEntry = {
      id: `log-${Date.now()}`,
      subjectId: logSubjectId,
      subjectName: selectedSub.name,
      type: selectedSub.type,
      hours: logHours,
      date: todayStr,
      note: logNote.trim() || 'Estudo focado',
      xpEarned: xp
    };

    // Update subject progress (approx +2.5% progress per hour studied, up to 100%)
    setSubjects(prev => prev.map(s => {
      if (s.id === logSubjectId) {
        const nextProgress = Math.min(100, s.progress + Math.round(logHours * 2.5));
        return {
          ...s,
          progress: nextProgress,
          hoursStudied: s.hoursStudied + logHours,
          lastStudied: todayStr
        };
      }
      return s;
    }));

    setStudyLog(prev => [newLog, ...prev]);
    setUserXp(prev => prev + xp);
    
    // Reset form
    setLogNote('');
    setShowLogModal(false);
    showToast(`📚 Estudo Registrado! +${xp} XP obtidos.`);
  };

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim()) return;

    const newSubject: StudySubject = {
      id: `sub-${Date.now()}`,
      name: newSubName.trim(),
      type: newSubType,
      progress: 0,
      hoursStudied: 0,
      color: newSubColor,
      icon: newSubIcon
    };

    setSubjects(prev => [...prev, newSubject]);
    setNewSubName('');
    setShowAddSubjectModal(false);
    showToast(`Matéria "${newSubject.name}" adicionada!`);
  };

  const handleDeleteSubject = (id: string, name: string) => {
    if (confirm(`Deseja mesmo remover a matéria "${name}"? Os registros de estudos históricos serão mantidos, mas a matéria sairá do painel.`)) {
      setSubjects(prev => prev.filter(s => s.id !== id));
      showToast('Matéria removida.');
    }
  };

  // Compute stats
  const totalAcademicHours = subjects.filter(s => s.type === 'academic').reduce((acc, curr) => acc + curr.hoursStudied, 0);
  const totalProfessionalHours = subjects.filter(s => s.type === 'professional').reduce((acc, curr) => acc + curr.hoursStudied, 0);
  const averageAcademicProgress = subjects.filter(s => s.type === 'academic').length === 0 ? 0 : Math.round(
    subjects.filter(s => s.type === 'academic').reduce((acc, curr) => acc + curr.progress, 0) / subjects.filter(s => s.type === 'academic').length
  );
  const averageProfessionalProgress = subjects.filter(s => s.type === 'professional').length === 0 ? 0 : Math.round(
    subjects.filter(s => s.type === 'professional').reduce((acc, curr) => acc + curr.progress, 0) / subjects.filter(s => s.type === 'professional').length
  );

  // Generate SVG Chart Data
  // We want to show a graph over the last 7 days of study accumulation
  const getChartPoints = () => {
    const dates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    const data = dates.map((date, index) => {
      // Find cumulative study hours up to this date
      const academicHrs = studyLog
        .filter(log => log.type === 'academic' && log.date <= date)
        .reduce((sum, curr) => sum + curr.hours, 0);
        
      const professionalHrs = studyLog
        .filter(log => log.type === 'professional' && log.date <= date)
        .reduce((sum, curr) => sum + curr.hours, 0);

      return {
        date,
        label: new Date(date + 'T00:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }),
        academic: academicHrs,
        professional: professionalHrs
      };
    });

    // Find max hours to scale Y axis
    const maxVal = Math.max(
      10,
      ...data.map(d => d.academic),
      ...data.map(d => d.professional)
    );

    const width = 450;
    const height = 110;
    const paddingLeft = 30;
    const paddingRight = 10;
    const paddingTop = 10;
    const paddingBottom = 20;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    // Map data to chart coordinates
    const academicPoints = data.map((d, i) => {
      const x = paddingLeft + (i / (dates.length - 1)) * chartWidth;
      const y = height - paddingBottom - (d.academic / maxVal) * chartHeight;
      return { x, y };
    });

    const professionalPoints = data.map((d, i) => {
      const x = paddingLeft + (i / (dates.length - 1)) * chartWidth;
      const y = height - paddingBottom - (d.professional / maxVal) * chartHeight;
      return { x, y };
    });

    // Create Path Strings
    const createPath = (points: { x: number; y: number }[]) => {
      if (points.length === 0) return '';
      return points.reduce((path, p, i) => {
        return path + (i === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`);
      }, '');
    };

    const createAreaPath = (points: { x: number; y: number }[]) => {
      if (points.length === 0) return '';
      const linePath = createPath(points);
      const first = points[0];
      const last = points[points.length - 1];
      const bottomY = height - paddingBottom;
      return `${linePath} L ${last.x} ${bottomY} L ${first.x} ${bottomY} Z`;
    };

    return {
      academicPath: createPath(academicPoints),
      academicArea: createAreaPath(academicPoints),
      professionalPath: createPath(professionalPoints),
      professionalArea: createAreaPath(professionalPoints),
      points: data,
      coordsAcademic: academicPoints,
      coordsProfessional: professionalPoints,
      maxVal,
      height,
      paddingBottom,
      paddingLeft,
      chartHeight
    };
  };

  const chart = getChartPoints();

  return (
    <div className="p-5 rounded-3xl bg-zinc-200/20 dark:bg-zinc-900/35 border border-zinc-250/30 dark:border-white/5 backdrop-blur-md flex flex-col gap-4 text-bujo-text relative">
      {/* Header */}
      <div className="flex justify-between items-center pb-2 border-b border-zinc-250/20 dark:border-white/5 gap-2">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-bujo-highlight" />
          <div className="text-left">
            <span className="text-[9px] uppercase font-bold text-zinc-550 block tracking-wider leading-none">Evolução Acadêmica & Carreira</span>
            <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-1">Evolução do Conhecimento</h3>
          </div>
        </div>

        {/* Buttons / Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setShowLogModal(true)}
            className="px-2.5 py-1.5 bg-bujo-highlight text-white text-[9px] font-bold rounded-lg hover:opacity-90 transition-all flex items-center gap-1 cursor-pointer"
          >
            <Clock className="w-3 h-3" /> Registrar Estudo
          </button>
          <button
            onClick={() => setShowAddSubjectModal(true)}
            className="px-2.5 py-1.5 bg-zinc-200/40 dark:bg-white/5 border border-zinc-300/30 dark:border-white/10 text-[9px] font-bold rounded-lg hover:bg-zinc-200/60 dark:hover:bg-white/10 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3 h-3" /> Nova Matéria
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-zinc-200/30 dark:bg-white/5 p-1 rounded-xl border border-zinc-200/30 dark:border-white/5 text-[9px] font-bold uppercase tracking-wider flex-wrap sm:flex-nowrap gap-1 sm:gap-0">
        <button
          onClick={() => setActiveSubTab('summary')}
          className={`flex-1 min-w-[45%] py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${activeSubTab === 'summary' ? 'bg-white dark:bg-zinc-800 text-bujo-highlight shadow-sm' : 'text-zinc-500 hover:bg-white/5'}`}
        >
          <BarChart3 className="w-3 h-3" /> Visão
        </button>
        <button
          onClick={() => setActiveSubTab('subjects')}
          className={`flex-1 min-w-[45%] py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${activeSubTab === 'subjects' ? 'bg-white dark:bg-zinc-800 text-bujo-highlight shadow-sm' : 'text-zinc-500 hover:bg-white/5'}`}
        >
          <BookOpen className="w-3 h-3" /> Disciplinas
        </button>
        <button
          onClick={() => setActiveSubTab('history')}
          className={`flex-1 min-w-[45%] py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${activeSubTab === 'history' ? 'bg-white dark:bg-zinc-800 text-bujo-highlight shadow-sm' : 'text-zinc-500 hover:bg-white/5'}`}
        >
          <Calendar className="w-3 h-3" /> Histórico
        </button>
        <button
          onClick={() => setActiveSubTab('brag')}
          className={`flex-1 min-w-[45%] py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${activeSubTab === 'brag' ? 'bg-white dark:bg-zinc-800 text-bujo-highlight shadow-sm' : 'text-zinc-500 hover:bg-white/5'}`}
        >
          <Sparkles className="w-3 h-3" /> Brag Doc
        </button>
      </div>

      {/* Content Area */}
      <div className="min-h-[145px]">
        {activeSubTab === 'summary' && (
          <div className="space-y-4">
            {/* KPI Summary Cards */}
            <div className="grid grid-cols-2 gap-3 text-left">
              <div className="p-3 rounded-2xl bg-zinc-200/10 dark:bg-white/[0.01] border border-zinc-250/20 dark:border-white/5">
                <div className="flex items-center gap-1.5 text-zinc-500 text-[9px] font-bold uppercase tracking-wider">
                  <GraduationCap className="w-3.5 h-3.5 text-bujo-accent" />
                  Mestrado (Acadêmico)
                </div>
                <div className="flex justify-between items-baseline mt-1.5">
                  <span className="text-lg font-black text-zinc-100">{totalAcademicHours}h</span>
                  <span className="text-[10px] text-zinc-450 font-bold">Méd. {averageAcademicProgress}%</span>
                </div>
                <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1 mt-2 overflow-hidden rounded-full">
                  <div className="bg-bujo-accent h-full" style={{ width: `${averageAcademicProgress}%` }} />
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-zinc-200/10 dark:bg-white/[0.01] border border-zinc-250/20 dark:border-white/5">
                <div className="flex items-center gap-1.5 text-zinc-500 text-[9px] font-bold uppercase tracking-wider">
                  <Briefcase className="w-3.5 h-3.5 text-bujo-highlight" />
                  Carreira (Profissional)
                </div>
                <div className="flex justify-between items-baseline mt-1.5">
                  <span className="text-lg font-black text-zinc-100">{totalProfessionalHours}h</span>
                  <span className="text-[10px] text-zinc-450 font-bold">Méd. {averageProfessionalProgress}%</span>
                </div>
                <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1 mt-2 overflow-hidden rounded-full">
                  <div className="bg-bujo-highlight h-full" style={{ width: `${averageProfessionalProgress}%` }} />
                </div>
              </div>
            </div>

            {/* Custom SVG Cumulative Evolution Chart */}
            <div className="p-3 rounded-2xl bg-zinc-200/15 dark:bg-white/[0.01] border border-zinc-250/15 dark:border-white/5 relative">
              <div className="flex justify-between items-center text-[8px] text-zinc-500 font-bold uppercase tracking-wider mb-2">
                <span>Evolução Acumulada de Estudos</span>
                <div className="flex gap-2">
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-bujo-accent inline-block" /> Acadêmico</span>
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-bujo-highlight inline-block" /> Profissional</span>
                </div>
              </div>

              <svg viewBox="0 0 450 110" className="w-full h-auto overflow-visible">
                <defs>
                  <linearGradient id="gradAcademic" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4A7C6C" stopOpacity="0.25"/>
                    <stop offset="100%" stopColor="#4A7C6C" stopOpacity="0.0"/>
                  </linearGradient>
                  <linearGradient id="gradProfessional" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#E08E45" stopOpacity="0.25"/>
                    <stop offset="100%" stopColor="#E08E45" stopOpacity="0.0"/>
                  </linearGradient>
                </defs>

                {/* Y Axis Gridlines */}
                {[0, 0.5, 1].map((ratio, i) => {
                  const y = chart.height - chart.paddingBottom - ratio * chart.chartHeight;
                  const value = Math.round(ratio * chart.maxVal);
                  return (
                    <g key={i}>
                      <line x1={chart.paddingLeft} y1={y} x2={440} y2={y} stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="2,2" />
                      <text x={chart.paddingLeft - 6} y={y + 3} fill="rgba(255, 255, 255, 0.3)" fontSize="7" textAnchor="end">{value}h</text>
                    </g>
                  );
                })}

                {/* Academic Area & Line */}
                {chart.academicArea && <path d={chart.academicArea} fill="url(#gradAcademic)" />}
                {chart.academicPath && <path d={chart.academicPath} fill="none" stroke="#4A7C6C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />}

                {/* Professional Area & Line */}
                {chart.professionalArea && <path d={chart.professionalArea} fill="url(#gradProfessional)" />}
                {chart.professionalPath && <path d={chart.professionalPath} fill="none" stroke="#E08E45" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />}

                {/* Points and Hover markers */}
                {chart.coordsAcademic.map((p, idx) => (
                  <circle key={`acad-pt-${idx}`} cx={p.x} cy={p.y} r="2.5" fill="#4A7C6C" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="0.5" />
                ))}
                {chart.coordsProfessional.map((p, idx) => (
                  <circle key={`prof-pt-${idx}`} cx={p.x} cy={p.y} r="2.5" fill="#E08E45" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="0.5" />
                ))}

                {/* X Axis Labels */}
                {chart.points.map((d, i) => {
                  const x = chart.paddingLeft + (i / (chart.points.length - 1)) * (450 - chart.paddingLeft - 10);
                  return (
                    <text key={i} x={x} y={chart.height - 5} fill="rgba(255, 255, 255, 0.3)" fontSize="7" textAnchor="middle">
                      {d.label}
                    </text>
                  );
                })}
              </svg>
            </div>
          </div>
        )}

        {activeSubTab === 'subjects' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
            {subjects.map(sub => (
              <div
                key={sub.id}
                className="p-3 rounded-2xl bg-zinc-200/10 dark:bg-white/[0.01] border border-zinc-250/10 dark:border-white/5 flex items-start justify-between gap-3 text-left group animate-fade-in"
              >
                <div className="flex gap-2.5 items-start min-w-0">
                  <span className="text-xl select-none shrink-0 mt-0.5">{sub.icon}</span>
                  <div className="min-w-0">
                    <span className="text-[9px] font-black uppercase tracking-wider block" style={{ color: sub.color }}>
                      {sub.type === 'academic' ? 'Mestrado' : 'Carreira'}
                    </span>
                    <h4 className="text-xs font-bold truncate text-zinc-150 leading-snug">{sub.name}</h4>
                    <span className="text-[9px] text-zinc-500 font-mono mt-0.5 block">
                      {sub.hoursStudied}h estudadas {sub.lastStudied && `• Último: ${sub.lastStudied.split('-').slice(1).reverse().join('/')}`}
                    </span>
                    
                    {/* Progress slider bar */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-24 bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden shrink-0">
                        <div className="h-full rounded-full transition-all" style={{ width: `${sub.progress}%`, backgroundColor: sub.color }} />
                      </div>
                      <span className="text-[8px] font-mono text-zinc-450 font-bold shrink-0">{sub.progress}%</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteSubject(sub.id, sub.name)}
                  className="p-1 text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  title="Excluir disciplina"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}

            {subjects.length === 0 && (
              <div className="col-span-full py-8 text-center text-zinc-500 text-xs italic">
                Nenhuma matéria de estudo cadastrada ainda.
              </div>
            )}
          </div>
        )}

        
        {activeSubTab === 'brag' && (
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] text-zinc-500 italic">Seu portfólio de conquistas e impacto.</span>
              <button
                onClick={() => setShowBragModal(true)}
                className="px-2 py-1 bg-bujo-highlight/10 text-bujo-highlight border border-bujo-highlight/20 text-[9px] font-bold rounded-lg hover:bg-bujo-highlight/20 transition-all flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" /> Nova Conquista
              </button>
            </div>
            
            {bragEntries.length === 0 && (
              <div className="py-8 text-center text-zinc-500 text-xs italic">
                Nenhuma conquista registrada. Comece a construir seu Brag Document!
              </div>
            )}

            {bragEntries.map(entry => (
              <div key={entry.id} className="p-3 rounded-2xl bg-zinc-200/10 dark:bg-white/[0.01] border border-zinc-250/10 dark:border-white/5 text-left group animate-fade-in relative">
                <button
                  onClick={() => handleDeleteBrag(entry.id)}
                  className="absolute top-3 right-3 p-1.5 text-zinc-500 hover:bg-red-500/10 hover:text-red-400 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                  title="Remover"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[8px] font-bold uppercase tracking-wider border border-white/5">
                    {entry.category}
                  </span>
                  <span className="text-[9px] text-zinc-500 font-mono">{entry.date.split('-').slice(1).reverse().join('/')}</span>
                </div>
                <h4 className="text-sm font-bold text-white mb-1">{entry.title}</h4>
                
                <div className="space-y-1.5 mt-2 text-xs">
                  <div>
                    <span className="text-zinc-500 font-bold text-[10px] block uppercase">Escopo:</span>
                    <p className="text-zinc-300 leading-relaxed">{entry.scope}</p>
                  </div>
                  <div>
                    <span className="text-zinc-500 font-bold text-[10px] block uppercase">Impacto:</span>
                    <p className="text-zinc-300 leading-relaxed">{entry.impact}</p>
                  </div>
                  {entry.okrs && (
                    <div>
                      <span className="text-zinc-500 font-bold text-[10px] block uppercase">OKRs:</span>
                      <p className="text-bujo-highlight leading-relaxed">{entry.okrs}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}


        {activeSubTab === 'history' && (
          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {studyLog.slice(0, 10).map(log => (
              <div
                key={log.id}
                className="p-2.5 rounded-xl bg-zinc-200/10 dark:bg-white/[0.01] border border-zinc-250/10 dark:border-white/5 flex items-center justify-between text-left text-xs gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${log.type === 'academic' ? 'bg-bujo-accent' : 'bg-bujo-highlight'}`} />
                    <strong className="text-zinc-200 font-bold truncate">{log.subjectName}</strong>
                  </div>
                  <p className="text-[10px] text-zinc-450 italic mt-0.5 truncate">{log.note}</p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[9px] font-mono text-zinc-500 block">
                    {log.date.split('-').slice(1).reverse().join('/')}
                  </span>
                  <span className="text-[10px] font-bold text-zinc-300">
                    {log.hours}h estudadas
                  </span>
                  <span className="text-[9px] font-mono font-bold text-bujo-highlight block">
                    +{log.xpEarned} XP
                  </span>
                </div>
              </div>
            ))}

            {studyLog.length === 0 && (
              <div className="py-8 text-center text-zinc-500 text-xs italic">
                Nenhum estudo registrado no histórico.
              </div>
            )}
          </div>
        )}
      </div>

      {/* REGISTRAR ESTUDO MODAL */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in no-print">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden p-5 animate-scale-in text-zinc-800 dark:text-zinc-100">
            <div className="flex justify-between items-center pb-2.5 border-b border-zinc-200/40 dark:border-white/5 mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-bujo-highlight flex items-center gap-1">
                <span>📚</span> Registrar Sessão de Estudo
              </h3>
              <button
                onClick={() => setShowLogModal(false)}
                className="p-1 rounded-lg hover:bg-zinc-200/50 dark:hover:bg-white/10 transition-colors text-zinc-550 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {subjects.length === 0 ? (
              <div className="py-6 text-center text-zinc-500 text-xs italic">
                Crie uma matéria antes de registrar estudos!
              </div>
            ) : (
              <form onSubmit={handleLogStudy} className="space-y-3.5 text-left">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-zinc-500 uppercase block">Disciplina / Assunto</label>
                  <select
                    value={logSubjectId}
                    onChange={e => setLogSubjectId(e.target.value)}
                    className="w-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs outline-none focus:border-bujo-highlight text-zinc-800 dark:text-zinc-100"
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.id} className="bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100">
                        {s.icon} {s.name} ({s.type === 'academic' ? 'Mestrado' : 'Carreira'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-zinc-500 uppercase block">Tempo Dedicado (Horas)</label>
                  <div className="flex gap-2">
                    {[0.5, 1, 2, 4].map(h => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setLogHours(h)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                          logHours === h 
                            ? 'bg-bujo-highlight border-bujo-highlight text-white' 
                            : 'bg-zinc-100 dark:bg-white/5 border-zinc-250 dark:border-white/10 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-white/10 cursor-pointer'
                        }`}
                      >
                        {h}h
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-zinc-500 uppercase block">O que você estudou? (Notas rápidas)</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Grafos Dijkstra, Leitura do capítulo 2..."
                    value={logNote}
                    onChange={e => setLogNote(e.target.value)}
                    className="w-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs outline-none focus:border-bujo-highlight text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setShowLogModal(false)}
                    className="px-3.5 py-1.5 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-100 font-bold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-bujo-highlight text-white hover:opacity-95 font-semibold rounded-xl"
                  >
                    Registrar e Ganhar XP
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* CADASTRAR DISCIPLINA MODAL */}
      {showAddSubjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in no-print">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden p-5 animate-scale-in text-zinc-900 dark:text-zinc-100">
            <div className="flex justify-between items-center pb-2.5 border-b border-zinc-200/40 dark:border-white/5 mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-bujo-highlight flex items-center gap-1">
                <span>📚</span> Adicionar Matéria de Estudos
              </h3>
              <button
                onClick={() => setShowAddSubjectModal(false)}
                className="p-1 rounded-lg hover:bg-zinc-200/50 dark:hover:bg-white/10 transition-colors text-zinc-550 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubject} className="space-y-3.5 text-left">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-zinc-500 uppercase block">Nome da Disciplina</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Inteligência Artificial, Clean Code..."
                  value={newSubName}
                  onChange={e => setNewSubName(e.target.value)}
                  className="w-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs outline-none focus:border-bujo-highlight text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-zinc-500 uppercase block">Segmento</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNewSubType('academic');
                      setNewSubColor('#4A7C6C');
                    }}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      newSubType === 'academic' 
                        ? 'bg-bujo-accent border-bujo-accent text-white' 
                        : 'bg-zinc-100 dark:bg-white/5 border-zinc-250 dark:border-white/10 text-zinc-900 dark:text-zinc-200 cursor-pointer'
                    }`}
                  >
                    Acadêmico (Mestrado)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewSubType('professional');
                      setNewSubColor('#E08E45');
                    }}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      newSubType === 'professional' 
                        ? 'bg-bujo-highlight border-bujo-highlight text-white' 
                        : 'bg-zinc-100 dark:bg-white/5 border-zinc-250 dark:border-white/10 text-zinc-900 dark:text-zinc-200 cursor-pointer'
                    }`}
                  >
                    Profissional (Carreira)
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-zinc-500 uppercase block">Ícone / Emoji</label>
                <div className="flex gap-2 items-center relative">
                  <button
                    type="button"
                    onClick={() => setShowIconDropdown(!showIconDropdown)}
                    className="w-10 h-10 bg-zinc-100 dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-800 rounded-xl flex items-center justify-center text-lg outline-none hover:border-bujo-highlight transition-all cursor-pointer text-zinc-900 dark:text-zinc-100"
                  >
                    {newSubIcon}
                  </button>

                  <div className="text-[10px] text-zinc-550 flex items-center gap-1">
                    <span>Tema:</span>
                    <div className="flex gap-1">
                      {colorsList.slice(0, 5).map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setNewSubColor(c)}
                          className={`w-3.5 h-3.5 rounded-full border transition-all ${newSubColor === c ? 'scale-110 border-white' : 'border-transparent'}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>

                  {showIconDropdown && (
                    <div className="absolute left-0 bottom-full mb-2 p-2 bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded-xl shadow-2xl z-50 w-52 animate-scale-in">
                      <div className="flex justify-between items-center mb-1 pb-1 border-b border-zinc-200/40 dark:border-white/5">
                        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Emoji</span>
                        <button
                          type="button"
                          onClick={() => setShowIconDropdown(false)}
                          className="p-0.5 rounded hover:bg-zinc-100 dark:hover:bg-white/10 text-zinc-450 hover:text-zinc-800 dark:hover:text-zinc-100 cursor-pointer"
                          title="Fechar"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-5 gap-1 max-h-32 overflow-y-auto">
                        {emojisList.map(emoji => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => {
                                setNewSubIcon(emoji);
                                setShowIconDropdown(false);
                            }}
                            className={`w-7 h-7 flex items-center justify-center rounded text-sm hover:bg-zinc-150 dark:hover:bg-white/5 transition-all text-zinc-800 dark:text-zinc-100 ${
                              newSubIcon === emoji ? 'bg-bujo-highlight/20 border border-bujo-highlight' : ''
                            }`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 text-[10px]">
                <button
                  type="button"
                  onClick={() => setShowAddSubjectModal(false)}
                  className="px-3.5 py-1.5 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-100 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-bujo-highlight text-white hover:opacity-95 font-semibold rounded-xl"
                >
                  Criar Matéria
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* CADASTRAR BRAG MODAL */}
      {showBragModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in no-print">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden p-5 animate-scale-in text-zinc-900 dark:text-zinc-100 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center pb-2.5 border-b border-zinc-200/40 dark:border-white/5 mb-3 shrink-0">
              <h3 className="text-xs font-bold uppercase tracking-wider text-bujo-highlight flex items-center gap-1">
                <Sparkles className="w-4 h-4" /> Nova Conquista (Brag)
              </h3>
              <button
                onClick={() => setShowBragModal(false)}
                className="p-1 rounded-lg hover:bg-zinc-200/50 dark:hover:bg-white/10 transition-colors text-zinc-550 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBrag} className="space-y-3.5 text-left overflow-y-auto pr-2 pb-2">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-zinc-500 uppercase block">Título da Conquista</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Liderança no Lançamento da Feature X"
                  value={bragTitle}
                  onChange={e => setBragTitle(e.target.value)}
                  className="w-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs outline-none focus:border-bujo-highlight text-zinc-900 dark:text-zinc-100 placeholder-zinc-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-zinc-500 uppercase block">Categoria</label>
                  <select
                    value={bragCategory}
                    onChange={e => setBragCategory(e.target.value as any)}
                    className="w-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs outline-none focus:border-bujo-highlight text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="Projeto">Projeto / Lançamento</option>
                    <option value="Mentoria">Mentoria / Glue Work</option>
                    <option value="Arquitetura">Design / Arquitetura</option>
                    <option value="Processo">Melhoria de Processo</option>
                    <option value="Aprendizado">Aprendizado / Curso</option>
                    <option value="Feedback">Feedback / Kudos</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-zinc-500 uppercase block">Matéria (Opcional - +15% XP)</label>
                  <select
                    value={bragSubjectId}
                    onChange={e => setBragSubjectId(e.target.value)}
                    className="w-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs outline-none focus:border-bujo-highlight text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="">Nenhuma / Geral</option>
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.icon} {s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-zinc-500 uppercase block">Escopo e Contribuição</label>
                <textarea
                  required
                  rows={2}
                  placeholder="O que você fez exatamente? Qual foi o seu papel?"
                  value={bragScope}
                  onChange={e => setBragScope(e.target.value)}
                  className="w-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs outline-none focus:border-bujo-highlight text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-zinc-500 uppercase block">Impacto e Métricas</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Quais foram os resultados numéricos ou qualitativos?"
                  value={bragImpact}
                  onChange={e => setBragImpact(e.target.value)}
                  className="w-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs outline-none focus:border-bujo-highlight text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-zinc-500 uppercase block">OKRs / Metas Relacionadas (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ex: Aumentar conversão no Q3"
                  value={bragOkrs}
                  onChange={e => setBragOkrs(e.target.value)}
                  className="w-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs outline-none focus:border-bujo-highlight text-zinc-900 dark:text-zinc-100 placeholder-zinc-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 text-[10px] shrink-0">
                <button
                  type="button"
                  onClick={() => setShowBragModal(false)}
                  className="px-3.5 py-1.5 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-100 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-bujo-highlight text-white hover:opacity-95 font-semibold rounded-xl"
                >
                  Salvar no Brag Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
