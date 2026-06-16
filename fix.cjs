const fs = require('fs');

const path = 'src/features/education/components/KnowledgeEvolutionChart.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  "import { useBujo } from '../../../context/BujoContext';",
  "import { useBujo } from '../../../context/BujoContext';\nimport { BragEntry } from '../../../types';"
);

content = content.replace(
  "const [activeSubTab, setActiveSubTab] = useState<'summary' | 'subjects' | 'history'>('summary');",
  "const [activeSubTab, setActiveSubTab] = useState<'summary' | 'subjects' | 'history' | 'brag'>('summary');"
);

const bragStateCode = `
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
      id: \`brag-\${Date.now()}\`,
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
      showToast(\`🏆 Conquista Registrada! +15% de progresso na matéria e +\${xp} XP.\`);
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
`;

content = content.replace(
  "// Log Form states",
  bragStateCode + "\n\n  // Log Form states"
);

const tabsBlockToReplace = `      <div className="flex bg-zinc-200/30 dark:bg-white/5 p-1 rounded-xl border border-zinc-200/30 dark:border-white/5 text-[9px] font-bold uppercase tracking-wider">
        <button
          onClick={() => setActiveSubTab('summary')}
          className={\`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 \${activeSubTab === 'summary' ? 'bg-white dark:bg-zinc-800 text-bujo-highlight shadow-sm' : 'text-zinc-500'}\`}
        >
          <BarChart3 className="w-3 h-3" /> Visão Geral
        </button>
        <button
          onClick={() => setActiveSubTab('subjects')}
          className={\`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 \${activeSubTab === 'subjects' ? 'bg-white dark:bg-zinc-800 text-bujo-highlight shadow-sm' : 'text-zinc-500'}\`}
        >
          <BookOpen className="w-3 h-3" /> Disciplinas ({subjects.length})
        </button>
        <button
          onClick={() => setActiveSubTab('history')}
          className={\`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 \${activeSubTab === 'history' ? 'bg-white dark:bg-zinc-800 text-bujo-highlight shadow-sm' : 'text-zinc-500'}\`}
        >
          <Calendar className="w-3 h-3" /> Histórico ({studyLog.length})
        </button>
      </div>`;

const newTabsBlock = `      <div className="flex bg-zinc-200/30 dark:bg-white/5 p-1 rounded-xl border border-zinc-200/30 dark:border-white/5 text-[9px] font-bold uppercase tracking-wider flex-wrap sm:flex-nowrap gap-1 sm:gap-0">
        <button
          onClick={() => setActiveSubTab('summary')}
          className={\`flex-1 min-w-[45%] py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 \${activeSubTab === 'summary' ? 'bg-white dark:bg-zinc-800 text-bujo-highlight shadow-sm' : 'text-zinc-500 hover:bg-white/5'}\`}
        >
          <BarChart3 className="w-3 h-3" /> Visão
        </button>
        <button
          onClick={() => setActiveSubTab('subjects')}
          className={\`flex-1 min-w-[45%] py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 \${activeSubTab === 'subjects' ? 'bg-white dark:bg-zinc-800 text-bujo-highlight shadow-sm' : 'text-zinc-500 hover:bg-white/5'}\`}
        >
          <BookOpen className="w-3 h-3" /> Disciplinas
        </button>
        <button
          onClick={() => setActiveSubTab('history')}
          className={\`flex-1 min-w-[45%] py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 \${activeSubTab === 'history' ? 'bg-white dark:bg-zinc-800 text-bujo-highlight shadow-sm' : 'text-zinc-500 hover:bg-white/5'}\`}
        >
          <Calendar className="w-3 h-3" /> Histórico
        </button>
        <button
          onClick={() => setActiveSubTab('brag')}
          className={\`flex-1 min-w-[45%] py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 \${activeSubTab === 'brag' ? 'bg-white dark:bg-zinc-800 text-bujo-highlight shadow-sm' : 'text-zinc-500 hover:bg-white/5'}\`}
        >
          <Sparkles className="w-3 h-3" /> Brag Doc
        </button>
      </div>`;

content = content.replace(tabsBlockToReplace, newTabsBlock);

const bragListUI = `
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
`;

content = content.replace(
  "{activeSubTab === 'history' && (",
  bragListUI + "\n\n        {activeSubTab === 'history' && ("
);

const bragModalUI = `
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
`;

content = content.replace(
  "    </div>\n  );\n};",
  bragModalUI + "\n    </div>\n  );\n};"
);

fs.writeFileSync(path, content, 'utf8');
