import { useState, useEffect } from 'react';
import { Target, TrendingUp, TrendingDown, DollarSign, Plus, Trash2, Calendar, CreditCard, AlertTriangle, CheckCircle2, X, ShoppingCart, PlusCircle, Check } from 'lucide-react';
import { useBujo } from '../../../context/BujoContext';

interface BudgetItem {
  id: string;
  description: string;
  value: number;
  type: 'income' | 'fixed' | 'installment' | 'arrears' | 'variable';
  isPaid?: boolean;
  currentInstallment?: number;
  totalInstallments?: number;
  date?: string;
}

export const BudgetPlanner = ({ onClose }: { onClose: () => void }) => {
  const { items, showToast } = useBujo();

  // Load local states from localStorage
  const [incomes, setIncomes] = useState<BudgetItem[]>(() => {
    const saved = localStorage.getItem('bujo_budget_income');
    return saved ? JSON.parse(saved) : [
      { id: 'inc-1', description: 'Salário Base', value: 2500, type: 'income' },
      { id: 'inc-2', description: 'Trabalho Freelancer', value: 600, type: 'income' }
    ];
  });

  const [fixedBills, setFixedBills] = useState<BudgetItem[]>(() => {
    const saved = localStorage.getItem('bujo_budget_fixed');
    return saved ? JSON.parse(saved) : [
      { id: 'fix-1', description: 'Aluguel', value: 1000, type: 'fixed', isPaid: true },
      { id: 'fix-2', description: 'Assinatura Internet', value: 120, type: 'fixed', isPaid: false }
    ];
  });

  const [installments, setInstallments] = useState<BudgetItem[]>(() => {
    const saved = localStorage.getItem('bujo_budget_installments');
    return saved ? JSON.parse(saved) : [
      { id: 'inst-1', description: 'Parcela Notebook', value: 200, type: 'installment', isPaid: false, currentInstallment: 4, totalInstallments: 10 }
    ];
  });

  const [overdueDebts, setOverdueDebts] = useState<BudgetItem[]>(() => {
    const saved = localStorage.getItem('bujo_budget_debts');
    return saved ? JSON.parse(saved) : [
      { id: 'deb-1', description: 'Fatura de Cartão Atrasada', value: 450, type: 'arrears', isPaid: false }
    ];
  });

  const [newExpenses, setNewExpenses] = useState<BudgetItem[]>(() => {
    const saved = localStorage.getItem('bujo_budget_new');
    return saved ? JSON.parse(saved) : [
      { id: 'new-1', description: 'Jantar Restaurante', value: 90, type: 'variable', isPaid: true }
    ];
  });

  // Save to localStorage effects
  useEffect(() => {
    localStorage.setItem('bujo_budget_income', JSON.stringify(incomes));
  }, [incomes]);

  useEffect(() => {
    localStorage.setItem('bujo_budget_fixed', JSON.stringify(fixedBills));
  }, [fixedBills]);

  useEffect(() => {
    localStorage.setItem('bujo_budget_installments', JSON.stringify(installments));
  }, [installments]);

  useEffect(() => {
    localStorage.setItem('bujo_budget_debts', JSON.stringify(overdueDebts));
  }, [overdueDebts]);

  useEffect(() => {
    localStorage.setItem('bujo_budget_new', JSON.stringify(newExpenses));
  }, [newExpenses]);

  // Tab state
  const [activeTab, setActiveTab] = useState<'overview' | 'income' | 'fixed' | 'installment' | 'arrears' | 'variable' | 'bujo_tasks'>('overview');

  // Input states for adding new entries
  const [descInput, setDescInput] = useState('');
  const [valueInput, setValueInput] = useState('');
  const [currInstallment, setCurrInstallment] = useState('1');
  const [totInstallments, setTotInstallments] = useState('12');

  // Dynamic automatic parsing of completed shopping tasks from Bujo
  const parseExpenseFromTaskContent = (content: string): number => {
    const r$Match = content.match(/(?:R\$|\$)\s*(\d+(?:[.,]\d+)?)/i);
    if (r$Match) return parseFloat(r$Match[1].replace(',', '.'));
    
    const reaisMatch = content.match(/(\d+(?:[.,]\d+)?)\s*(?:reais|reais|R$)/i);
    if (reaisMatch) return parseFloat(reaisMatch[1].replace(',', '.'));

    const numberMatch = content.match(/\b(\d+(?:[.,]\d+)?)\b\s*$/);
    if (numberMatch) return parseFloat(numberMatch[1].replace(',', '.'));

    return 0;
  };

  const today = new Date();
  const currentYearMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

  const bujoShoppingTasks = items
    .filter(item => {
      if (item.type !== 'task' || item.status !== 'completed' || !item.date) return false;
      if (!item.date.startsWith(currentYearMonth)) return false;
      
      const contentLower = item.content.toLowerCase();
      return (
        contentLower.includes('comprar') ||
        contentLower.includes('compra') ||
        contentLower.includes('pagar') ||
        contentLower.includes('supermercado') ||
        item.icon === '🛒' ||
        item.icon === '💰'
      );
    })
    .map(item => ({
      id: item.id,
      description: item.content,
      value: parseExpenseFromTaskContent(item.content),
      date: item.date
    }))
    .filter(exp => exp.value > 0);

  // Calculations
  const totalIncome = incomes.reduce((acc, curr) => acc + curr.value, 0);
  
  const totalFixed = fixedBills.reduce((acc, curr) => acc + curr.value, 0);
  const totalInstallments = installments.reduce((acc, curr) => acc + curr.value, 0);
  const totalArrears = overdueDebts.reduce((acc, curr) => acc + curr.value, 0);
  const totalVariable = newExpenses.reduce((acc, curr) => acc + curr.value, 0);
  const totalBujoShopping = bujoShoppingTasks.reduce((acc, curr) => acc + curr.value, 0);

  const totalExpenses = totalFixed + totalInstallments + totalArrears + totalVariable + totalBujoShopping;
  const currentBalance = totalIncome - totalExpenses;

  // Paid vs Unpaid breakdown
  const paidFixed = fixedBills.filter(b => b.isPaid).reduce((acc, curr) => acc + curr.value, 0);
  const paidInstallments = installments.filter(b => b.isPaid).reduce((acc, curr) => acc + curr.value, 0);
  const paidArrears = overdueDebts.filter(b => b.isPaid).reduce((acc, curr) => acc + curr.value, 0);
  const paidVariable = newExpenses.filter(b => b.isPaid).reduce((acc, curr) => acc + curr.value, 0);

  const totalPaidExpenses = paidFixed + paidInstallments + paidArrears + paidVariable + totalBujoShopping; // Bujo shopping tasks are completed, so they count as paid/spent
  const remainingToPay = totalExpenses - totalPaidExpenses;

  // Percentage calculations
  const fixedPercent = totalExpenses > 0 ? Math.round((totalFixed / totalExpenses) * 100) : 0;
  const installmentsPercent = totalExpenses > 0 ? Math.round((totalInstallments / totalExpenses) * 100) : 0;
  const arrearsPercent = totalExpenses > 0 ? Math.round((totalArrears / totalExpenses) * 100) : 0;
  const variablePercent = totalExpenses > 0 ? Math.round((totalVariable / totalExpenses) * 100) : 0;
  const shoppingPercent = totalExpenses > 0 ? Math.round((totalBujoShopping / totalExpenses) * 100) : 0;

  // Add Item handler
  const handleAddNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!descInput.trim() || !valueInput.trim()) return;

    const val = parseFloat(valueInput.replace(',', '.'));
    if (isNaN(val)) return;

    const newItem: BudgetItem = {
      id: `budget-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      description: descInput.trim(),
      value: val,
      type: activeTab as any,
      isPaid: false
    };

    if (activeTab === 'installment') {
      newItem.currentInstallment = parseInt(currInstallment) || 1;
      newItem.totalInstallments = parseInt(totInstallments) || 12;
    }

    if (activeTab === 'income') {
      setIncomes(prev => [...prev, newItem]);
    } else if (activeTab === 'fixed') {
      setFixedBills(prev => [...prev, newItem]);
    } else if (activeTab === 'installment') {
      setInstallments(prev => [...prev, newItem]);
    } else if (activeTab === 'arrears') {
      setOverdueDebts(prev => [...prev, newItem]);
    } else if (activeTab === 'variable') {
      setNewExpenses(prev => [...prev, newItem]);
    }

    setDescInput('');
    setValueInput('');
    setCurrInstallment('1');
    setTotInstallments('12');
    showToast('💰 Item adicionado ao orçamento!');
  };

  // Toggle paid state
  const handleTogglePaid = (id: string, type: string) => {
    const updateItem = (list: BudgetItem[]) => list.map(item => item.id === id ? { ...item, isPaid: !item.isPaid } : item);

    if (type === 'fixed') setFixedBills(updateItem);
    else if (type === 'installment') setInstallments(updateItem);
    else if (type === 'arrears') setOverdueDebts(updateItem);
    else if (type === 'variable') setNewExpenses(updateItem);

    showToast('🔄 Status de pagamento atualizado!');
  };

  // Delete item handler
  const handleDeleteItem = (id: string, type: string) => {
    if (type === 'income') setIncomes(prev => prev.filter(item => item.id !== id));
    else if (type === 'fixed') setFixedBills(prev => prev.filter(item => item.id !== id));
    else if (type === 'installment') setInstallments(prev => prev.filter(item => item.id !== id));
    else if (type === 'arrears') setOverdueDebts(prev => prev.filter(item => item.id !== id));
    else if (type === 'variable') setNewExpenses(prev => prev.filter(item => item.id !== id));

    showToast('🗑️ Item removido!');
  };

  return (
    <div className="flex flex-col gap-4 h-full font-mono text-zinc-200">
      {/* Navigation Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1.5 border-b border-white/5 shrink-0 scrollbar-none">
        {[
          { id: 'overview', label: 'Resumo' },
          { id: 'income', label: 'Ganhos' },
          { id: 'fixed', label: 'Fixas' },
          { id: 'installment', label: 'Parceladas' },
          { id: 'arrears', label: 'Atrasadas' },
          { id: 'variable', label: 'Novas' },
          { id: 'bujo_tasks', label: 'Compras Bujo' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-colors border shrink-0 ${
              activeTab === t.id
                ? 'bg-bujo-highlight text-white border-bujo-highlight shadow-sm shadow-bujo-highlight/15'
                : 'bg-zinc-200/5 hover:bg-zinc-200/10 text-zinc-400 border-zinc-200/20 dark:border-white/5'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto min-h-[300px] max-h-[65vh] pr-1">
        {activeTab === 'overview' && (
          <div className="flex flex-col gap-4 animate-fade-in">
            {/* Screen 1: Balance Header Card */}
            <div className="relative p-5 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 border border-blue-400/20 text-white shadow-lg overflow-hidden flex flex-col gap-4 select-none">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-6 -mt-6 blur-lg" />
              <div>
                <span className="text-[9px] uppercase tracking-widest font-extrabold text-blue-200">Seu Saldo Mensal</span>
                <h3 className="text-2xl font-black mt-0.5 flex items-center">
                  R$ {currentBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-3 border-t border-white/10 pt-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-white/10 text-emerald-300">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] text-blue-200 uppercase font-bold tracking-wider">Entradas</span>
                    <span className="text-xs font-black">R$ {totalIncome}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-white/10 text-red-300">
                    <TrendingDown className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] text-blue-200 uppercase font-bold tracking-wider">Saídas</span>
                    <span className="text-xs font-black">R$ {totalExpenses}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Screen 2: Expense Gauge Arc Chart */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-1 p-4 rounded-2xl bg-zinc-200/10 dark:bg-white/5 border border-zinc-200/30 dark:border-white/5 flex flex-col items-center justify-center text-center gap-2 select-none">
                <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-extrabold">Foco Despesas</span>
                
                {/* Visual Gauge Component */}
                <div className="relative w-28 h-14 overflow-hidden mt-2 flex items-end justify-center">
                  {/* Outer Arc track */}
                  <div className="absolute top-0 left-0 w-28 h-28 rounded-full border-[10px] border-zinc-200/10 dark:border-white/5" />
                  {/* Colored Arc overlay */}
                  <div 
                    className="absolute top-0 left-0 w-28 h-28 rounded-full border-[10px] border-t-pink-500 border-r-indigo-500 border-b-transparent border-l-transparent transform transition-transform duration-500" 
                    style={{ transform: `rotate(${Math.min(180, Math.max(0, (totalExpenses > 0 ? (totalPaidExpenses / totalExpenses) : 0) * 180 - 45))}deg)` }}
                  />
                  <div className="z-10 flex flex-col items-center">
                    <span className="text-xs font-black">R$ {totalExpenses}</span>
                    <span className="text-[7px] text-zinc-555 font-bold uppercase tracking-wider mt-0.5">Total Gasto</span>
                  </div>
                </div>
                
                <span className="text-[8px] text-zinc-400 font-bold block mt-2">
                  Pago: R$ {totalPaidExpenses} ({totalExpenses > 0 ? Math.round((totalPaidExpenses / totalExpenses) * 100) : 0}%)
                </span>
                {remainingToPay > 0 && (
                  <span className="text-[8px] text-amber-500 font-bold block">
                    Pendente: R$ {remainingToPay}
                  </span>
                )}
              </div>

              {/* Progress categories list */}
              <div className="md:col-span-2 p-4 rounded-2xl bg-zinc-200/10 dark:bg-white/5 border border-zinc-200/30 dark:border-white/5 flex flex-col gap-3">
                <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-extrabold border-b border-white/5 pb-1">
                  Distribuição do Orçamento
                </span>
                
                <div className="flex flex-col gap-2.5 text-[10px]">
                  {/* Category bars */}
                  {[
                    { label: 'Contas Fixas', value: totalFixed, percent: fixedPercent, color: 'bg-blue-500', icon: '📅' },
                    { label: 'Contas Parceladas', value: totalInstallments, percent: installmentsPercent, color: 'bg-orange-500', icon: '💳' },
                    { label: 'Dívidas Atrasadas', value: totalArrears, percent: arrearsPercent, color: 'bg-red-500', icon: '⚠️' },
                    { label: 'Contas Novas/Variáveis', value: totalVariable, percent: variablePercent, color: 'bg-emerald-500', icon: '💸' },
                    { label: 'Compras BuJo Integradas', value: totalBujoShopping, percent: shoppingPercent, color: 'bg-purple-500', icon: '🛒' }
                  ].map(cat => (
                    <div key={cat.label} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-zinc-300 font-bold">
                        <span className="flex items-center gap-1">
                          <span>{cat.icon}</span> {cat.label}
                        </span>
                        <span>R$ {cat.value} ({cat.percent}%)</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-zinc-200/10 dark:bg-white/5 overflow-hidden">
                        <div className={`h-full rounded-full ${cat.color}`} style={{ width: `${cat.percent}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Status Info */}
            <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/10 text-[9px] text-amber-500/80 leading-normal flex gap-2">
              <span className="text-xs shrink-0">💡</span>
              <p>
                <strong>Dica Neuro-Adaptativa:</strong> Contas atrasadas (`Dívidas Atrasadas`) geram atrito cognitivo. Priorize eliminá-las primeiro para liberar dopamina e energia mental para o resto da sua semana.
              </p>
            </div>
          </div>
        )}

        {/* Dynamic add/list tabs */}
        {activeTab !== 'overview' && activeTab !== 'bujo_tasks' && (
          <div className="flex flex-col gap-4 animate-fade-in">
            {/* Entry List */}
            <div className="flex flex-col gap-2">
              <span className="text-[9px] text-zinc-555 font-bold uppercase tracking-widest border-b border-white/5 pb-1">
                Lançamentos cadastrados
              </span>
              
              {(() => {
                const list = activeTab === 'income' ? incomes :
                             activeTab === 'fixed' ? fixedBills :
                             activeTab === 'installment' ? installments :
                             activeTab === 'arrears' ? overdueDebts :
                             newExpenses;
                
                if (list.length === 0) {
                  return (
                    <div className="text-center py-8 text-zinc-650 italic text-[10px]">
                      Nenhum item cadastrado nesta categoria.
                    </div>
                  );
                }

                return (
                  <div className="flex flex-col gap-2">
                    {list.map(item => (
                      <div 
                        key={item.id}
                        className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                          item.isPaid 
                            ? 'bg-zinc-200/5 dark:bg-white/[0.01] border-zinc-200/10 dark:border-white/5 opacity-60' 
                            : 'bg-zinc-200/10 dark:bg-white/5 border-zinc-200/30 dark:border-white/5 hover:border-bujo-highlight/30'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {activeTab !== 'income' && (
                            <button
                              onClick={() => handleTogglePaid(item.id, item.type)}
                              className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border cursor-pointer transition-all ${
                                item.isPaid 
                                  ? 'bg-emerald-500 border-emerald-500 text-white' 
                                  : 'border-zinc-200/40 dark:border-white/20 hover:border-emerald-500'
                              }`}
                            >
                              {item.isPaid && <Check className="w-3 h-3 stroke-[3]" />}
                            </button>
                          )}
                          <div className="min-w-0 flex flex-col gap-0.5">
                            <span className={`text-xs font-bold truncate ${item.isPaid ? 'line-through text-zinc-550' : 'text-zinc-200'}`}>
                              {item.description}
                            </span>
                            {item.type === 'installment' && (
                              <span className="text-[8px] font-bold text-zinc-500">
                                Parcela: {item.currentInstallment}/{item.totalInstallments}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-black ${activeTab === 'income' ? 'text-emerald-400' : 'text-zinc-300'}`}>
                            {activeTab === 'income' ? '+' : '-'} R$ {item.value}
                          </span>
                          <button
                            onClick={() => handleDeleteItem(item.id, item.type)}
                            className="p-1 text-zinc-500 hover:text-red-500 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                            title="Remover lançamento"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Add New Entry Form */}
            <form onSubmit={handleAddNewItem} className="p-4 rounded-2xl bg-zinc-200/10 dark:bg-white/5 border border-zinc-200/30 dark:border-white/5 flex flex-col gap-3">
              <span className="text-[9px] text-zinc-400 uppercase tracking-widest font-extrabold flex items-center gap-1.5">
                <PlusCircle className="w-3.5 h-3.5 text-bujo-highlight" />
                Adicionar Lançamento
              </span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider">Descrição</label>
                  <input
                    type="text"
                    value={descInput}
                    onChange={(e) => setDescInput(e.target.value)}
                    placeholder="Ex: Conta de Luz, Aluguel..."
                    className="px-3 py-1.5 text-[10px] rounded-xl bg-zinc-200/10 dark:bg-white/5 border border-zinc-200/30 dark:border-white/5 text-zinc-150 focus:border-bujo-highlight focus:outline-none placeholder-zinc-650"
                  />
                </div>
                
                <div className="flex flex-col gap-1">
                  <label className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider">Valor (R$)</label>
                  <input
                    type="text"
                    value={valueInput}
                    onChange={(e) => setValueInput(e.target.value)}
                    placeholder="Ex: 150.00"
                    className="px-3 py-1.5 text-[10px] rounded-xl bg-zinc-200/10 dark:bg-white/5 border border-zinc-200/30 dark:border-white/5 text-zinc-150 focus:border-bujo-highlight focus:outline-none placeholder-zinc-650"
                  />
                </div>
              </div>

              {activeTab === 'installment' && (
                <div className="grid grid-cols-2 gap-3 border-t border-white/5 pt-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider">Parcela Atual</label>
                    <input
                      type="number"
                      value={currInstallment}
                      onChange={(e) => setCurrInstallment(e.target.value)}
                      className="px-3 py-1.5 text-[10px] rounded-xl bg-zinc-200/10 dark:bg-white/5 border border-zinc-200/30 dark:border-white/5 text-zinc-150 focus:border-bujo-highlight focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider">Total de Parcelas</label>
                    <input
                      type="number"
                      value={totInstallments}
                      onChange={(e) => setTotInstallments(e.target.value)}
                      className="px-3 py-1.5 text-[10px] rounded-xl bg-zinc-200/10 dark:bg-white/5 border border-zinc-200/30 dark:border-white/5 text-zinc-150 focus:border-bujo-highlight focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="mt-1 px-4 py-2 bg-bujo-highlight hover:opacity-90 text-white text-[10px] font-bold rounded-xl flex items-center justify-center gap-1.5 transition-opacity cursor-pointer shadow-sm shadow-bujo-highlight/10 w-full"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar Lançamento
              </button>
            </form>
          </div>
        )}

        {/* Bujo Shopping Tasks Tab */}
        {activeTab === 'bujo_tasks' && (
          <div className="flex flex-col gap-3 animate-fade-in">
            <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/10 text-[9px] text-purple-400 leading-normal">
              <strong>Integração Inteligente BuJo:</strong> Esta área exibe automaticamente todas as tarefas de compras/pagamentos concluídas no mês corrente no seu Diário de Foco, extraindo os valores numéricos.
            </div>

            <div className="flex flex-col gap-2">
              {bujoShoppingTasks.length === 0 ? (
                <div className="text-center py-8 text-zinc-650 italic text-[10px]">
                  Nenhuma tarefa de compra concluída encontrada este mês.
                </div>
              ) : (
                bujoShoppingTasks.map(task => (
                  <div 
                    key={task.id}
                    className="flex items-center justify-between p-2.5 rounded-xl border bg-zinc-200/5 dark:bg-white/[0.01] border-zinc-200/10 dark:border-white/5 opacity-80"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-xs">🛒</span>
                      <div className="min-w-0 flex flex-col gap-0.5">
                        <span className="text-xs font-bold truncate text-zinc-300">
                          {task.description}
                        </span>
                        <span className="text-[8px] font-bold text-zinc-500">
                          Concluído em: {task.date.split('-').reverse().slice(0, 2).join('/')}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-black text-purple-400 shrink-0">
                      - R$ {task.value}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
