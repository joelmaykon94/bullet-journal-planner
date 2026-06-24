import { useState, useEffect } from 'react';
import { 
  Target, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Plus, 
  Trash2, 
  Calendar, 
  CreditCard, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  ShoppingCart, 
  PlusCircle, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  User, 
  Folder, 
  Tag, 
  Edit2 
} from 'lucide-react';
import { useBujo } from '../../../context/BujoContext';

interface BudgetItem {
  id: string;
  description: string;
  value: number;
  type: 'income' | 'fixed' | 'installment' | 'arrears' | 'variable';
  isPaid?: boolean;
  isCancelled?: boolean;
  currentInstallment?: number;
  totalInstallments?: number;
  date: string; // Transaction/Created Date (YYYY-MM-DD)
  dueDate?: string; // Due Date (YYYY-MM-DD)
  createdAt: string; // Record Creation Date (YYYY-MM-DD)
  owner: 'Joel' | 'Larissa' | 'Maykon' | 'Geral';
  category: string;
  macroCategory: 'Essenciais' | 'Estilo de Vida' | 'Investimentos/Dívidas' | 'Outros';
  totalDebtValue?: number;
  firstInstallmentDate?: string;
  dueDay?: number;
  alreadyPaidInstallmentsCount?: number;
  paidInstallmentNumbers?: number[];
  paidMonths?: string[];
}

const DEFAULT_MACRO_MAP: Record<string, 'Essenciais' | 'Estilo de Vida' | 'Investimentos/Dívidas' | 'Outros'> = {
  'Dívidas': 'Investimentos/Dívidas',
  'Escola': 'Essenciais',
  'Veículo': 'Essenciais',
  'Internet': 'Essenciais',
  'Casa': 'Essenciais',
  'Serviços Online': 'Estilo de Vida',
  'Saúde': 'Essenciais',
  'Alimentação': 'Essenciais',
  'Educação': 'Essenciais',
  'Lazer': 'Estilo de Vida',
  'Vestuário': 'Estilo de Vida',
  'Cuidados Pessoais': 'Estilo de Vida',
  'Geral': 'Outros'
};

const getMacroCategoryForCategory = (cat: string): 'Essenciais' | 'Estilo de Vida' | 'Investimentos/Dívidas' | 'Outros' => {
  return DEFAULT_MACRO_MAP[cat] || 'Outros';
};

const sanitizeBudgetItems = (items: any[], defaultType: 'income' | 'fixed' | 'installment' | 'arrears' | 'variable'): BudgetItem[] => {
  const todayStr = new Date().toISOString().split('T')[0];
  return items.map(item => ({
    id: item.id || `budget-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
    description: item.description || '',
    value: typeof item.value === 'number' ? item.value : parseFloat(item.value) || 0,
    type: item.type || defaultType,
    isPaid: !!item.isPaid,
    isCancelled: !!item.isCancelled,
    currentInstallment: item.currentInstallment,
    totalInstallments: item.totalInstallments,
    date: item.date || todayStr,
    dueDate: item.dueDate || undefined,
    createdAt: item.createdAt || todayStr,
    owner: item.owner || 'Geral',
    category: item.category || 'Geral',
    macroCategory: item.macroCategory || 'Outros',
    totalDebtValue: item.totalDebtValue,
    firstInstallmentDate: item.firstInstallmentDate,
    dueDay: item.dueDay,
    alreadyPaidInstallmentsCount: item.alreadyPaidInstallmentsCount,
    paidInstallmentNumbers: item.paidInstallmentNumbers || [],
    paidMonths: item.paidMonths || []
  }));
};

const DEFAULT_INCOMES: BudgetItem[] = [
  { id: 'inc-1', description: 'Salário Base', value: 2500, type: 'income', date: '2026-06-01', createdAt: '2026-06-01', owner: 'Geral', category: 'Geral', macroCategory: 'Outros' },
  { id: 'inc-2', description: 'Trabalho Freelancer', value: 600, type: 'income', date: '2026-06-15', createdAt: '2026-06-15', owner: 'Geral', category: 'Geral', macroCategory: 'Outros' }
];

const DEFAULT_FIXED: BudgetItem[] = [
  { id: 'fix-1', description: 'Aluguel', value: 1000, type: 'fixed', isPaid: true, date: '2026-06-05', dueDate: '2026-06-10', createdAt: '2026-06-01', owner: 'Geral', category: 'Casa', macroCategory: 'Essenciais', dueDay: 10, paidMonths: ['2026-06'] },
  { id: 'fix-2', description: 'Assinatura Internet', value: 120, type: 'fixed', isPaid: false, date: '2026-06-15', dueDate: '2026-06-20', createdAt: '2026-06-01', owner: 'Geral', category: 'Internet', macroCategory: 'Essenciais', dueDay: 20, paidMonths: [] }
];

const DEFAULT_INSTALLMENTS: BudgetItem[] = [
  { id: 'inst-1', description: 'Parcela Notebook', value: 200, type: 'installment', isPaid: false, currentInstallment: 4, totalInstallments: 10, date: '2026-06-10', dueDate: '2026-06-15', createdAt: '2026-03-10', owner: 'Geral', category: 'Serviços Online', macroCategory: 'Estilo de Vida' }
];

const DEFAULT_DEBTS: BudgetItem[] = [
  { id: 'deb-1', description: 'Fatura de Cartão Atrasada', value: 450, type: 'arrears', isPaid: false, date: '2026-06-01', dueDate: '2026-06-05', createdAt: '2026-06-01', owner: 'Joel', category: 'Dívidas', macroCategory: 'Investimentos/Dívidas' }
];

const DEFAULT_NEW: BudgetItem[] = [
  { id: 'new-1', description: 'Jantar Restaurante', value: 90, type: 'variable', isPaid: true, date: '2026-06-22', createdAt: '2026-06-22', owner: 'Joel', category: 'Lazer', macroCategory: 'Estilo de Vida' }
];

const availableIncomeCategories = ['Uber', 'Freelance', 'Estagio', 'CLT', 'Emprestimos', 'Doação', 'Outros'];

const parseDateToISO = (dateStr: string): string => {
  if (!dateStr) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const day = parts[0].trim().padStart(2, '0');
    const month = parts[1].trim().padStart(2, '0');
    const year = parts[2].trim();
    if (year.length === 4) {
      return `${year}-${month}-${day}`;
    }
  }
  return dateStr;
};

const formatISOToSlash = (isoStr: string): string => {
  if (!isoStr) return '';
  if (isoStr.includes('/')) return isoStr;
  const parts = isoStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return isoStr;
};

const isValidSlashDate = (str: string): boolean => {
  if (!str) return true;
  return /^([0-2]\d|3[0-1])\/(0\d|1[0-2])\/\d{4}$/.test(str);
};

const isIncomeReceived = (item: BudgetItem, todayStr: string): boolean => {
  if (item.isCancelled) return false;
  if (item.isPaid) return true;
  if (item.dueDate && item.dueDate <= todayStr) return true;
  return false;
};

const getWeekRange = (d: Date): [Date, Date] => {
  const workingDate = new Date(d);
  const day = workingDate.getDay();
  const diff = workingDate.getDate() - day + (day === 0 ? -6 : 1); // Monday start
  const start = new Date(workingDate.setDate(diff));
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return [start, end];
};

const getActiveInstallmentForMonth = (item: BudgetItem, targetDate: Date): { num: number; dueDateStr: string; value: number } | null => {
  if (item.type !== 'installment') return null;
  
  // Parse first installment date
  const firstDate = item.firstInstallmentDate ? new Date(item.firstInstallmentDate + 'T00:00:00') : new Date(item.date + 'T00:00:00');
  const firstYear = firstDate.getFullYear();
  const firstMonth = firstDate.getMonth();
  
  const targetYear = targetDate.getFullYear();
  const targetMonth = targetDate.getMonth();
  
  // Month difference
  const monthDiff = (targetYear - firstYear) * 12 + (targetMonth - firstMonth);
  
  // The installment index in this target month
  const startNum = (item.alreadyPaidInstallmentsCount || 0) + 1;
  const currentNum = startNum + monthDiff;
  
  if (currentNum >= 1 && currentNum <= (item.totalInstallments || 12)) {
    // It is active!
    const dueDay = item.dueDay || firstDate.getDate() || 5;
    
    // Construct the due date string for target month
    const yyyy = targetYear;
    const mm = String(targetMonth + 1).padStart(2, '0');
    const dd = String(dueDay).padStart(2, '0');
    const dueDateStr = `${yyyy}-${mm}-${dd}`;
    
    // Calculate single installment value
    const val = item.totalDebtValue 
      ? item.totalDebtValue / (item.totalInstallments || 12) 
      : item.value;
      
    return {
      num: currentNum,
      dueDateStr,
      value: val
    };
  }
  
  return null;
};

const getInstallmentsInPeriod = (item: BudgetItem, viewMode: string, selectedAnchorDate: Date): BudgetItem[] => {
  if (item.type !== 'installment') return [];
  
  const monthsToInspect: Date[] = [new Date(selectedAnchorDate)];
  
  if (viewMode === 'year') {
    monthsToInspect.length = 0;
    for (let m = 0; m < 12; m++) {
      monthsToInspect.push(new Date(selectedAnchorDate.getFullYear(), m, 1));
    }
  }
  
  if (viewMode === 'week') {
    const [start, end] = getWeekRange(selectedAnchorDate);
    monthsToInspect.length = 0;
    const startMonth = new Date(start.getFullYear(), start.getMonth(), 1);
    const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);
    monthsToInspect.push(startMonth);
    if (startMonth.getMonth() !== endMonth.getMonth() || startMonth.getFullYear() !== endMonth.getFullYear()) {
      monthsToInspect.push(endMonth);
    }
  }
  
  if (viewMode === 'day') {
    monthsToInspect.length = 0;
    monthsToInspect.push(new Date(selectedAnchorDate));
  }
  
  const results: BudgetItem[] = [];
  
  for (const mDate of monthsToInspect) {
    const activeInfo = getActiveInstallmentForMonth(item, mDate);
    if (activeInfo) {
      const instDate = new Date(activeInfo.dueDateStr + 'T00:00:00');
      
      let inPeriod = false;
      if (viewMode === 'year') {
        inPeriod = instDate.getFullYear() === selectedAnchorDate.getFullYear();
      } else if (viewMode === 'month') {
        inPeriod = instDate.getFullYear() === selectedAnchorDate.getFullYear() &&
                   instDate.getMonth() === selectedAnchorDate.getMonth();
      } else if (viewMode === 'week') {
        const [start, end] = getWeekRange(selectedAnchorDate);
        inPeriod = instDate >= start && instDate <= end;
      } else if (viewMode === 'day') {
        inPeriod = instDate.getFullYear() === selectedAnchorDate.getFullYear() &&
                   instDate.getMonth() === selectedAnchorDate.getMonth() &&
                   instDate.getDate() === selectedAnchorDate.getDate();
      }
      
      if (inPeriod) {
        const paidNums = item.paidInstallmentNumbers || [];
        const isThisPaid = paidNums.includes(activeInfo.num);
        
        results.push({
          ...item,
          id: `${item.id}-inst-${activeInfo.num}`,
          value: activeInfo.value,
          dueDate: activeInfo.dueDateStr,
          date: activeInfo.dueDateStr,
          isPaid: isThisPaid,
          currentInstallment: activeInfo.num
        });
      }
    }
  }
  
  return results;
};

const getInstallmentsListInPeriod = (list: BudgetItem[], viewMode: string, selectedAnchorDate: Date, filterOwner: string, filterMacro: string): BudgetItem[] => {
  const results: BudgetItem[] = [];
  for (const item of list) {
    const periodItems = getInstallmentsInPeriod(item, viewMode, selectedAnchorDate);
    for (const pi of periodItems) {
      if (filterOwner !== 'Todos' && pi.owner !== filterOwner) continue;
      if (filterMacro !== 'Todos' && pi.macroCategory !== filterMacro) continue;
      results.push(pi);
    }
  }
  return results;
};

const getActiveFixedForMonth = (item: BudgetItem, targetDate: Date): { dueDateStr: string; value: number } | null => {
  if (item.type !== 'fixed') return null;
  
  const creationDate = item.date ? new Date(item.date + 'T00:00:00') : new Date(item.createdAt + 'T00:00:00');
  const creationYear = creationDate.getFullYear();
  const creationMonth = creationDate.getMonth();
  
  const targetYear = targetDate.getFullYear();
  const targetMonth = targetDate.getMonth();
  
  if (targetYear < creationYear || (targetYear === creationYear && targetMonth < creationMonth)) {
    return null;
  }
  
  const dueDay = item.dueDay || (item.dueDate ? new Date(item.dueDate + 'T00:00:00').getDate() : 5);
  const yyyy = targetYear;
  const mm = String(targetMonth + 1).padStart(2, '0');
  const dd = String(dueDay).padStart(2, '0');
  const dueDateStr = `${yyyy}-${mm}-${dd}`;
  
  return {
    dueDateStr,
    value: item.value
  };
};

const getFixedInPeriod = (item: BudgetItem, viewMode: string, selectedAnchorDate: Date): BudgetItem[] => {
  if (item.type !== 'fixed') return [];
  
  const monthsToInspect: Date[] = [new Date(selectedAnchorDate)];
  
  if (viewMode === 'year') {
    monthsToInspect.length = 0;
    for (let m = 0; m < 12; m++) {
      monthsToInspect.push(new Date(selectedAnchorDate.getFullYear(), m, 1));
    }
  }
  
  if (viewMode === 'week') {
    const [start, end] = getWeekRange(selectedAnchorDate);
    monthsToInspect.length = 0;
    const startMonth = new Date(start.getFullYear(), start.getMonth(), 1);
    const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);
    monthsToInspect.push(startMonth);
    if (startMonth.getMonth() !== endMonth.getMonth() || startMonth.getFullYear() !== endMonth.getFullYear()) {
      monthsToInspect.push(endMonth);
    }
  }
  
  if (viewMode === 'day') {
    monthsToInspect.length = 0;
    monthsToInspect.push(new Date(selectedAnchorDate));
  }
  
  const results: BudgetItem[] = [];
  
  for (const mDate of monthsToInspect) {
    const activeInfo = getActiveFixedForMonth(item, mDate);
    if (activeInfo) {
      const instDate = new Date(activeInfo.dueDateStr + 'T00:00:00');
      
      let inPeriod = false;
      if (viewMode === 'year') {
        inPeriod = instDate.getFullYear() === selectedAnchorDate.getFullYear();
      } else if (viewMode === 'month') {
        inPeriod = instDate.getFullYear() === selectedAnchorDate.getFullYear() &&
                   instDate.getMonth() === selectedAnchorDate.getMonth();
      } else if (viewMode === 'week') {
        const [start, end] = getWeekRange(selectedAnchorDate);
        inPeriod = instDate >= start && instDate <= end;
      } else if (viewMode === 'day') {
        inPeriod = instDate.getFullYear() === selectedAnchorDate.getFullYear() &&
                   instDate.getMonth() === selectedAnchorDate.getMonth() &&
                   instDate.getDate() === selectedAnchorDate.getDate();
      }
      
      if (inPeriod) {
        const yearMonthStr = `${mDate.getFullYear()}-${String(mDate.getMonth() + 1).padStart(2, '0')}`;
        const paidMonths = item.paidMonths || [];
        const isThisPaid = paidMonths.includes(yearMonthStr);
        
        results.push({
          ...item,
          id: `${item.id}-fixed-${yearMonthStr}`,
          dueDate: activeInfo.dueDateStr,
          date: activeInfo.dueDateStr,
          isPaid: isThisPaid
        });
      }
    }
  }
  
  return results;
};

const getFixedListInPeriod = (list: BudgetItem[], viewMode: string, selectedAnchorDate: Date, filterOwner: string, filterMacro: string): BudgetItem[] => {
  const results: BudgetItem[] = [];
  for (const item of list) {
    const periodItems = getFixedInPeriod(item, viewMode, selectedAnchorDate);
    for (const pi of periodItems) {
      if (filterOwner !== 'Todos' && pi.owner !== filterOwner) continue;
      if (filterMacro !== 'Todos' && pi.macroCategory !== filterMacro) continue;
      results.push(pi);
    }
  }
  return results;
};

export const BudgetPlanner = ({ onClose }: { onClose: () => void }) => {
  const { items, showToast } = useBujo();

  // Load local states from localStorage with sanitization
  const [incomes, setIncomes] = useState<BudgetItem[]>(() => {
    const saved = localStorage.getItem('bujo_budget_income');
    return saved ? sanitizeBudgetItems(JSON.parse(saved), 'income') : DEFAULT_INCOMES;
  });

  const [fixedBills, setFixedBills] = useState<BudgetItem[]>(() => {
    const saved = localStorage.getItem('bujo_budget_fixed');
    return saved ? sanitizeBudgetItems(JSON.parse(saved), 'fixed') : DEFAULT_FIXED;
  });

  const [installments, setInstallments] = useState<BudgetItem[]>(() => {
    const saved = localStorage.getItem('bujo_budget_installments');
    return saved ? sanitizeBudgetItems(JSON.parse(saved), 'installment') : DEFAULT_INSTALLMENTS;
  });

  const [overdueDebts, setOverdueDebts] = useState<BudgetItem[]>(() => {
    const saved = localStorage.getItem('bujo_budget_debts');
    return saved ? sanitizeBudgetItems(JSON.parse(saved), 'arrears') : DEFAULT_DEBTS;
  });

  const [newExpenses, setNewExpenses] = useState<BudgetItem[]>(() => {
    const saved = localStorage.getItem('bujo_budget_new');
    return saved ? sanitizeBudgetItems(JSON.parse(saved), 'variable') : DEFAULT_NEW;
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

  // Filtering states (Year, Month, Week, Day)
  const [viewMode, setViewMode] = useState<'year' | 'month' | 'week' | 'day'>('month');
  const [selectedAnchorDate, setSelectedAnchorDate] = useState<Date>(() => new Date());
  const [filterOwner, setFilterOwner] = useState<string>('Todos');
  const [filterMacro, setFilterMacro] = useState<string>('Todos');

  // Form input states for adding new entries
  const [descInput, setDescInput] = useState('');
  const [valueInput, setValueInput] = useState('');
  const [dateInput, setDateInput] = useState(() => new Date().toISOString().split('T')[0]);
  const [dueDateInput, setDueDateInput] = useState('');
  const [ownerInput, setOwnerInput] = useState<'Joel' | 'Larissa' | 'Maykon' | 'Geral'>('Geral');
  const [categoryInput, setCategoryInput] = useState<string>('Geral');
  const [macroCategoryInput, setMacroCategoryInput] = useState<'Essenciais' | 'Estilo de Vida' | 'Investimentos/Dívidas' | 'Outros'>('Outros');
  const [currInstallment, setCurrInstallment] = useState('1');
  const [totInstallments, setTotInstallments] = useState('12');
  const [isPaidInput, setIsPaidInput] = useState<boolean>(false);
  const [isCancelledInput, setIsCancelledInput] = useState<boolean>(false);
  const [firstInstallmentDateInput, setFirstInstallmentDateInput] = useState('');
  const [dueDayInput, setDueDayInput] = useState('5');
  const [alreadyPaidInstallmentsCountInput, setAlreadyPaidInstallmentsCountInput] = useState('');

  // Inline editing states
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editDesc, setEditDesc] = useState('');
  const [editValue, setEditValue] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editOwner, setEditOwner] = useState<'Joel' | 'Larissa' | 'Maykon' | 'Geral'>('Geral');
  const [editCategory, setEditCategory] = useState<string>('Geral');
  const [editMacroCategory, setEditMacroCategory] = useState<'Essenciais' | 'Estilo de Vida' | 'Investimentos/Dívidas' | 'Outros'>('Outros');
  const [editCurrInstallment, setEditCurrInstallment] = useState('1');
  const [editTotInstallments, setEditTotInstallments] = useState('12');
  const [editIsPaid, setEditIsPaid] = useState<boolean>(false);
  const [editIsCancelled, setEditIsCancelled] = useState<boolean>(false);
  const [editFirstInstallmentDate, setEditFirstInstallmentDate] = useState('');
  const [editDueDay, setEditDueDay] = useState('5');
  const [editAlreadyPaidInstallmentsCount, setEditAlreadyPaidInstallmentsCount] = useState('');

  // Category change wrapper to auto-select macro classification
  const handleCategoryChange = (cat: string) => {
    setCategoryInput(cat);
    setMacroCategoryInput(getMacroCategoryForCategory(cat));
  };

  const handleEditCategoryChange = (cat: string) => {
    setEditCategory(cat);
    setEditMacroCategory(getMacroCategoryForCategory(cat));
  };

  const handlePrevPeriod = () => {
    setSelectedAnchorDate(prev => {
      const d = new Date(prev);
      if (viewMode === 'year') d.setFullYear(d.getFullYear() - 1);
      else if (viewMode === 'month') d.setMonth(d.getMonth() - 1);
      else if (viewMode === 'week') d.setDate(d.getDate() - 7);
      else if (viewMode === 'day') d.setDate(d.getDate() - 1);
      return d;
    });
  };

  const handleNextPeriod = () => {
    setSelectedAnchorDate(prev => {
      const d = new Date(prev);
      if (viewMode === 'year') d.setFullYear(d.getFullYear() + 1);
      else if (viewMode === 'month') d.setMonth(d.getMonth() + 1);
      else if (viewMode === 'week') d.setDate(d.getDate() + 7);
      else if (viewMode === 'day') d.setDate(d.getDate() + 1);
      return d;
    });
  };

  const formatPeriodLabel = (): string => {
    if (viewMode === 'year') {
      return selectedAnchorDate.getFullYear().toString();
    }
    if (viewMode === 'month') {
      const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ];
      return `${monthNames[selectedAnchorDate.getMonth()]} de ${selectedAnchorDate.getFullYear()}`;
    }
    if (viewMode === 'week') {
      const [start, end] = getWeekRange(selectedAnchorDate);
      return `${start.getDate().toString().padStart(2, '0')}/${(start.getMonth() + 1).toString().padStart(2, '0')} a ${end.getDate().toString().padStart(2, '0')}/${(end.getMonth() + 1).toString().padStart(2, '0')}`;
    }
    // day mode
    return selectedAnchorDate.toLocaleDateString('pt-BR');
  };

  // Dynamic automatic parsing of completed shopping tasks from Bujo
  const parseExpenseFromTaskContent = (content: string): number => {
    const r$Match = content.match(/(?:R\$|\$)\s*(\d+(?:[.,]\d+)?)/i);
    if (r$Match) return parseFloat(r$Match[1].replace(',', '.'));
    
    const reaisMatch = content.match(/(\d+(?:[.,]\d+)?)\s*(?:reais|R$)/i);
    if (reaisMatch) return parseFloat(reaisMatch[1].replace(',', '.'));

    const numberMatch = content.match(/\b(\d+(?:[.,]\d+)?)\b\s*$/);
    if (numberMatch) return parseFloat(numberMatch[1].replace(',', '.'));

    return 0;
  };

  const allCompletedBujoTasks = items
    .filter(item => {
      if (item.type !== 'task' || item.status !== 'completed' || !item.date) return false;
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

  // Period and category filtering logic
  const filterByPeriodAndMeta = (list: BudgetItem[]): BudgetItem[] => {
    return list.filter(item => {
      if (!item.date) return false;
      const itemDate = new Date(item.date + 'T00:00:00');
      
      let inPeriod = false;
      if (viewMode === 'year') {
        inPeriod = itemDate.getFullYear() === selectedAnchorDate.getFullYear();
      } else if (viewMode === 'month') {
        inPeriod = itemDate.getFullYear() === selectedAnchorDate.getFullYear() &&
                   itemDate.getMonth() === selectedAnchorDate.getMonth();
      } else if (viewMode === 'week') {
        const [start, end] = getWeekRange(selectedAnchorDate);
        inPeriod = itemDate >= start && itemDate <= end;
      } else if (viewMode === 'day') {
        inPeriod = itemDate.getFullYear() === selectedAnchorDate.getFullYear() &&
                   itemDate.getMonth() === selectedAnchorDate.getMonth() &&
                   itemDate.getDate() === selectedAnchorDate.getDate();
      }

      if (!inPeriod) return false;

      // Filter by Owner
      if (filterOwner !== 'Todos' && item.owner !== filterOwner) return false;

      // Filter by Macro Category
      if (filterMacro !== 'Todos' && item.macroCategory !== filterMacro) return false;

      return true;
    });
  };

  // Filtering for integrated Bujo tasks
  const filteredBujoShopping = allCompletedBujoTasks.filter(task => {
    const taskDate = new Date(task.date + 'T00:00:00');
    let inPeriod = false;
    if (viewMode === 'year') {
      inPeriod = taskDate.getFullYear() === selectedAnchorDate.getFullYear();
    } else if (viewMode === 'month') {
      inPeriod = taskDate.getFullYear() === selectedAnchorDate.getFullYear() &&
                 taskDate.getMonth() === selectedAnchorDate.getMonth();
    } else if (viewMode === 'week') {
      const [start, end] = getWeekRange(selectedAnchorDate);
      inPeriod = taskDate >= start && taskDate <= end;
    } else if (viewMode === 'day') {
      inPeriod = taskDate.getFullYear() === selectedAnchorDate.getFullYear() &&
                 taskDate.getMonth() === selectedAnchorDate.getMonth() &&
                 taskDate.getDate() === selectedAnchorDate.getDate();
    }

    if (!inPeriod) return false;

    // Bujo tasks default to Geral / Outros for classifications
    if (filterOwner !== 'Todos' && filterOwner !== 'Geral') return false;
    if (filterMacro !== 'Todos' && filterMacro !== 'Outros' && filterMacro !== 'Estilo de Vida') return false;

    return true;
  });

  // Filtered lists for calculations
  const fIncomes = filterByPeriodAndMeta(incomes);
  const fFixed = getFixedListInPeriod(fixedBills, viewMode, selectedAnchorDate, filterOwner, filterMacro);
  const fInstallments = getInstallmentsListInPeriod(installments, viewMode, selectedAnchorDate, filterOwner, filterMacro);
  const fArrears = filterByPeriodAndMeta(overdueDebts);
  const fVariable = filterByPeriodAndMeta(newExpenses);

  const todayStr = new Date().toISOString().split('T')[0];
  const activeIncomes = fIncomes.filter(i => !i.isCancelled);

  const totalIncome = activeIncomes.reduce((acc, curr) => acc + curr.value, 0);
  const totalFixed = fFixed.reduce((acc, curr) => acc + curr.value, 0);
  const totalInstallments = fInstallments.reduce((acc, curr) => acc + curr.value, 0);
  const totalArrears = fArrears.reduce((acc, curr) => acc + curr.value, 0);
  const totalVariable = fVariable.reduce((acc, curr) => acc + curr.value, 0);
  const totalBujoShopping = filteredBujoShopping.reduce((acc, curr) => acc + curr.value, 0);

  const totalExpenses = totalFixed + totalInstallments + totalArrears + totalVariable + totalBujoShopping;
  const currentBalance = totalIncome - totalExpenses;

  // Paid vs Unpaid details
  const paidFixed = fFixed.filter(b => b.isPaid).reduce((acc, curr) => acc + curr.value, 0);
  const paidInstallments = fInstallments.filter(b => b.isPaid).reduce((acc, curr) => acc + curr.value, 0);
  const paidArrears = fArrears.filter(b => b.isPaid).reduce((acc, curr) => acc + curr.value, 0);
  const paidVariable = fVariable.filter(b => b.isPaid).reduce((acc, curr) => acc + curr.value, 0);

  const totalPaidExpenses = paidFixed + paidInstallments + paidArrears + paidVariable + totalBujoShopping; 
  const remainingToPay = totalExpenses - totalPaidExpenses;

  // Real vs Future incomes
  const realIncome = activeIncomes.filter(i => isIncomeReceived(i, todayStr)).reduce((acc, curr) => acc + curr.value, 0);
  const futureIncome = activeIncomes.filter(i => !isIncomeReceived(i, todayStr)).reduce((acc, curr) => acc + curr.value, 0);

  // Balances (Real vs Projected)
  const realBalance = realIncome - totalPaidExpenses;
  const projectedBalance = totalIncome - totalExpenses;

  // Percentage allocations for progress bars
  const fixedPercent = totalExpenses > 0 ? Math.round((totalFixed / totalExpenses) * 100) : 0;
  const installmentsPercent = totalExpenses > 0 ? Math.round((totalInstallments / totalExpenses) * 100) : 0;
  const arrearsPercent = totalExpenses > 0 ? Math.round((totalArrears / totalExpenses) * 100) : 0;
  const variablePercent = totalExpenses > 0 ? Math.round((totalVariable / totalExpenses) * 100) : 0;
  const shoppingPercent = totalExpenses > 0 ? Math.round((totalBujoShopping / totalExpenses) * 100) : 0;

  // Macro-category totals
  const getMacroCategoryTotal = (macro: string): number => {
    let sum = 0;
    const sumList = (list: BudgetItem[]) => list.filter(item => item.macroCategory === macro).reduce((a, c) => a + c.value, 0);
    sum += sumList(fFixed);
    sum += sumList(fInstallments);
    sum += sumList(fArrears);
    sum += sumList(fVariable);
    if (macro === 'Outros') {
      sum += totalBujoShopping;
    }
    return sum;
  };

  // Category totals
  const getCategoryTotal = (cat: string): number => {
    let sum = 0;
    const sumList = (list: BudgetItem[]) => list.filter(item => item.category === cat).reduce((a, c) => a + c.value, 0);
    sum += sumList(fFixed);
    sum += sumList(fInstallments);
    sum += sumList(fArrears);
    sum += sumList(fVariable);
    if (cat === 'Geral') {
      sum += totalBujoShopping;
    }
    return sum;
  };

  // Owner totals
  const getOwnerTotal = (owner: string): number => {
    let sum = 0;
    const sumList = (list: BudgetItem[]) => list.filter(item => item.owner === owner).reduce((a, c) => a + c.value, 0);
    sum += sumList(fFixed);
    sum += sumList(fInstallments);
    sum += sumList(fArrears);
    sum += sumList(fVariable);
    if (owner === 'Geral') {
      sum += totalBujoShopping;
    }
    return sum;
  };

  // Handlers for lists
  const handleAddNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!descInput.trim() || !valueInput.trim()) return;

    const val = parseFloat(valueInput.replace(',', '.'));
    if (isNaN(val)) return;

    if (activeTab !== 'installment' && activeTab !== 'fixed' && dueDateInput && !isValidSlashDate(dueDateInput)) {
      showToast('⚠️ Data de vencimento/previsão inválida! Use o formato DD/MM/AAAA');
      return;
    }

    if (activeTab === 'installment') {
      if (firstInstallmentDateInput && !isValidSlashDate(firstInstallmentDateInput)) {
        showToast('⚠️ Data da primeira parcela inválida! Use o formato DD/MM/AAAA');
        return;
      }
    }

    const todayISO = new Date().toISOString().split('T')[0];

    const newItem: BudgetItem = {
      id: `budget-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      description: descInput.trim(),
      value: val,
      type: activeTab as any,
      isPaid: isPaidInput,
      isCancelled: activeTab === 'income' ? isCancelledInput : false,
      date: todayISO, // Automatic creation date!
      dueDate: dueDateInput ? parseDateToISO(dueDateInput) : undefined,
      createdAt: todayISO,
      owner: ownerInput,
      category: categoryInput,
      macroCategory: activeTab === 'income' ? 'Outros' : macroCategoryInput
    };

    if (activeTab === 'fixed') {
      newItem.dueDay = parseInt(dueDayInput) || 5;
      newItem.paidMonths = [];
    }

    if (activeTab === 'installment') {
      const totInst = parseInt(totInstallments) || 12;
      newItem.totalDebtValue = val;
      newItem.totalInstallments = totInst;
      newItem.value = val / totInst;
      newItem.firstInstallmentDate = firstInstallmentDateInput ? parseDateToISO(firstInstallmentDateInput) : todayISO;
      newItem.dueDay = parseInt(dueDayInput) || 5;
      newItem.alreadyPaidInstallmentsCount = alreadyPaidInstallmentsCountInput ? parseInt(alreadyPaidInstallmentsCountInput) : 0;
      newItem.paidInstallmentNumbers = [];
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

    // Reset inputs
    setDescInput('');
    setValueInput('');
    setDueDateInput('');
    setOwnerInput('Geral');
    setCategoryInput(activeTab === 'income' ? 'Freelance' : 'Geral');
    setMacroCategoryInput('Outros');
    setCurrInstallment('1');
    setTotInstallments('12');
    setFirstInstallmentDateInput('');
    setDueDayInput('5');
    setAlreadyPaidInstallmentsCountInput('');
    setIsPaidInput(false);
    setIsCancelledInput(false);
    showToast('💰 Item adicionado ao orçamento!');
  };

  const handleStartEdit = (item: BudgetItem) => {
    setEditingItemId(item.id);
    setEditDesc(item.description);
    setEditDate(formatISOToSlash(item.date));
    setEditDueDate(formatISOToSlash(item.dueDate || ''));
    setEditOwner(item.owner);
    setEditCategory(item.category);
    setEditMacroCategory(item.macroCategory);
    setEditIsPaid(!!item.isPaid);
    setEditIsCancelled(!!item.isCancelled);

    if (item.type === 'installment') {
      setEditValue((item.totalDebtValue || item.value).toString());
      setEditFirstInstallmentDate(formatISOToSlash(item.firstInstallmentDate || item.date));
      setEditDueDay((item.dueDay || 5).toString());
      setEditAlreadyPaidInstallmentsCount((item.alreadyPaidInstallmentsCount || 0).toString());
      setEditTotInstallments((item.totalInstallments || 12).toString());
    } else if (item.type === 'fixed') {
      setEditValue(item.value.toString());
      setEditDueDay((item.dueDay || 5).toString());
      setEditFirstInstallmentDate('');
      setEditAlreadyPaidInstallmentsCount('');
      setEditTotInstallments('');
    } else {
      setEditValue(item.value.toString());
      setEditFirstInstallmentDate('');
      setEditDueDay('');
      setEditAlreadyPaidInstallmentsCount('');
      setEditTotInstallments('');
    }
  };

  const handleSaveEdit = (e: React.FormEvent, type: string) => {
    e.preventDefault();
    if (!editDesc.trim() || !editValue.trim()) return;

    if (!isValidSlashDate(editDate) || (type !== 'installment' && type !== 'fixed' && editDueDate && !isValidSlashDate(editDueDate))) {
      showToast('⚠️ Data inválida! Use o formato DD/MM/AAAA');
      return;
    }

    if (type === 'installment') {
      if (editFirstInstallmentDate && !isValidSlashDate(editFirstInstallmentDate)) {
        showToast('⚠️ Data da primeira parcela inválida! Use o formato DD/MM/AAAA');
        return;
      }
    }

    const val = parseFloat(editValue.replace(',', '.'));
    if (isNaN(val)) return;

    let baseId = editingItemId;
    if (editingItemId) {
      if (type === 'installment') {
        const match = editingItemId.match(/^(.+)-inst-(\d+)$/);
        if (match) {
          baseId = match[1];
        }
      } else if (type === 'fixed') {
        const match = editingItemId.match(/^(.+)-fixed-(\d{4}-\d{2})$/);
        if (match) {
          baseId = match[1];
        }
      }
    }

    const updateList = (list: BudgetItem[]) => list.map(item => {
      if (item.id !== baseId) return item;
      
      const updated: BudgetItem = {
        ...item,
        description: editDesc.trim(),
        value: val,
        date: parseDateToISO(editDate),
        dueDate: editDueDate ? parseDateToISO(editDueDate) : undefined,
        owner: editOwner,
        category: editCategory,
        macroCategory: type === 'income' ? 'Outros' : editMacroCategory,
        isPaid: editIsPaid,
        isCancelled: type === 'income' ? editIsCancelled : false
      };

      if (type === 'installment') {
        const totInst = parseInt(editTotInstallments) || 12;
        updated.totalDebtValue = val;
        updated.totalInstallments = totInst;
        updated.value = val / totInst;
        updated.firstInstallmentDate = editFirstInstallmentDate ? parseDateToISO(editFirstInstallmentDate) : parseDateToISO(editDate);
        updated.dueDay = parseInt(editDueDay) || 5;
        updated.alreadyPaidInstallmentsCount = parseInt(editAlreadyPaidInstallmentsCount) || 0;
      } else if (type === 'fixed') {
        updated.dueDay = parseInt(editDueDay) || 5;
      }

      return updated;
    });

    if (type === 'income') setIncomes(updateList);
    else if (type === 'fixed') setFixedBills(updateList);
    else if (type === 'installment') setInstallments(updateList);
    else if (type === 'arrears') setOverdueDebts(updateList);
    else if (type === 'variable') setNewExpenses(updateList);

    setEditingItemId(null);
    showToast('💾 Lançamento atualizado!');
  };

  const handleTogglePaid = (id: string, type: string) => {
    if (type === 'income') {
      setIncomes(prev => prev.map(item => {
        if (item.id !== id) return item;
        
        const todayStr = new Date().toISOString().split('T')[0];
        const isReceived = isIncomeReceived(item, todayStr);
        
        if (item.isCancelled) {
          // From Cancelado -> Futuro / Previsto
          return { ...item, isPaid: false, isCancelled: false };
        } else if (isReceived) {
          // From Recebido -> Cancelado
          return { ...item, isPaid: false, isCancelled: true };
        } else {
          // From Futuro -> Recebido
          return { ...item, isPaid: true, isCancelled: false };
        }
      }));
      showToast('🔄 Status de recebimento atualizado!');
    } else if (type === 'installment') {
      const match = id.match(/^(.+)-inst-(\d+)$/);
      if (match) {
        const baseId = match[1];
        const installmentNum = parseInt(match[2], 10);
        
        setInstallments(prev => prev.map(item => {
          if (item.id !== baseId) return item;
          const paidNums = item.paidInstallmentNumbers || [];
          const updatedPaidNums = paidNums.includes(installmentNum)
            ? paidNums.filter(n => n !== installmentNum)
            : [...paidNums, installmentNum];
          return {
            ...item,
            paidInstallmentNumbers: updatedPaidNums
          };
        }));
        showToast('🔄 Status de pagamento da parcela atualizado!');
      }
    } else if (type === 'fixed') {
      const match = id.match(/^(.+)-fixed-(\d{4}-\d{2})$/);
      if (match) {
        const baseId = match[1];
        const yearMonthStr = match[2];
        
        setFixedBills(prev => prev.map(item => {
          if (item.id !== baseId) return item;
          const paidMonths = item.paidMonths || [];
          const updatedPaidMonths = paidMonths.includes(yearMonthStr)
            ? paidMonths.filter(m => m !== yearMonthStr)
            : [...paidMonths, yearMonthStr];
          return {
            ...item,
            paidMonths: updatedPaidMonths
          };
        }));
        showToast('🔄 Status de pagamento da despesa fixa atualizado!');
      }
    } else {
      const updateItem = (list: BudgetItem[]) => list.map(item => item.id === id ? { ...item, isPaid: !item.isPaid } : item);

      if (type === 'arrears') setOverdueDebts(updateItem);
      else if (type === 'variable') setNewExpenses(updateItem);

      showToast('🔄 Status de pagamento atualizado!');
    }
  };

  const handleDeleteItem = (id: string, type: string) => {
    let targetId = id;
    if (type === 'installment') {
      const match = id.match(/^(.+)-inst-(\d+)$/);
      if (match) {
        targetId = match[1];
      }
    } else if (type === 'fixed') {
      const match = id.match(/^(.+)-fixed-(\d{4}-\d{2})$/);
      if (match) {
        targetId = match[1];
      }
    }
    if (type === 'income') setIncomes(prev => prev.filter(item => item.id !== targetId));
    else if (type === 'fixed') setFixedBills(prev => prev.filter(item => item.id !== targetId));
    else if (type === 'installment') setInstallments(prev => prev.filter(item => item.id !== targetId));
    else if (type === 'arrears') setOverdueDebts(prev => prev.filter(item => item.id !== targetId));
    else if (type === 'variable') setNewExpenses(prev => prev.filter(item => item.id !== targetId));

    showToast('🗑️ Item removido!');
  };

  const availableCategories = [
    'Geral', 'Dívidas', 'Escola', 'Veículo', 'Internet', 'Casa', 
    'Serviços Online', 'Saúde', 'Alimentação', 'Educação', 'Lazer', 
    'Vestuário', 'Cuidados Pessoais'
  ];

  const availableOwners = ['Geral', 'Joel', 'Larissa', 'Maykon'];
  const availableMacros = ['Essenciais', 'Estilo de Vida', 'Investimentos/Dívidas', 'Outros'];

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
            onClick={() => {
              setActiveTab(t.id as any);
              setEditingItemId(null);
              setCategoryInput(t.id === 'income' ? 'Freelance' : 'Geral');
            }}
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
            {/* Filter Dashboard Header (Period selection & Date Selector) */}
            <div className="flex flex-col md:flex-row gap-3 items-stretch justify-between p-4 rounded-2xl bg-zinc-200/10 dark:bg-zinc-900/60 border border-zinc-250/20 select-none">
              
              {/* Period Selector Tabs */}
              <div className="flex items-center gap-1.5 bg-zinc-200/10 dark:bg-black/25 p-0.5 rounded-xl border border-zinc-250/20">
                {[
                  { id: 'year', label: 'Ano' },
                  { id: 'month', label: 'Mês' },
                  { id: 'week', label: 'Semana' },
                  { id: 'day', label: 'Dia' }
                ].map(mode => (
                  <button
                    key={mode.id}
                    onClick={() => setViewMode(mode.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-[8.5px] font-bold uppercase transition-all cursor-pointer ${
                      viewMode === mode.id 
                        ? 'bg-bujo-highlight text-white shadow' 
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>

              {/* Date Swiper Control */}
              <div className="flex items-center justify-between md:justify-center gap-2">
                <button
                  onClick={handlePrevPeriod}
                  className="p-1 rounded-lg border border-white/5 hover:border-white/10 hover:bg-white/5 text-zinc-400 hover:text-white transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                
                <span className="text-[10px] font-extrabold uppercase text-white min-w-[140px] text-center">
                  {formatPeriodLabel()}
                </span>

                <button
                  onClick={handleNextPeriod}
                  className="p-1 rounded-lg border border-white/5 hover:border-white/10 hover:bg-white/5 text-zinc-400 hover:text-white transition-all cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Owner and Macro Filters */}
              <div className="flex items-center gap-2.5">
                {/* Member filter */}
                <div className="flex flex-col gap-0.5 min-w-[80px]">
                  <span className="text-[6.5px] font-bold text-zinc-500 uppercase tracking-widest leading-none">Membro</span>
                  <select
                    value={filterOwner}
                    onChange={(e) => setFilterOwner(e.target.value)}
                    className="bg-zinc-900 dark:bg-black border border-zinc-250/20 rounded-lg px-1.5 py-0.5 text-[8.5px] font-bold text-zinc-300 outline-none cursor-pointer"
                  >
                    <option value="Todos" className="bg-zinc-900 text-zinc-100">👤 Todos</option>
                    {availableOwners.map(o => (
                      <option key={o} value={o} className="bg-zinc-900 text-zinc-100">👤 {o}</option>
                    ))}
                  </select>
                </div>

                {/* Macro filter */}
                <div className="flex flex-col gap-0.5 min-w-[100px]">
                  <span className="text-[6.5px] font-bold text-zinc-555 uppercase tracking-widest leading-none">Classificação</span>
                  <select
                    value={filterMacro}
                    onChange={(e) => setFilterMacro(e.target.value)}
                    className="bg-zinc-900 dark:bg-black border border-zinc-250/20 rounded-lg px-1.5 py-0.5 text-[8.5px] font-bold text-zinc-300 outline-none cursor-pointer"
                  >
                    <option value="Todos" className="bg-zinc-900 text-zinc-100">🏷️ Todas</option>
                    {availableMacros.map(m => (
                      <option key={m} value={m} className="bg-zinc-900 text-zinc-100">🏷️ {m}</option>
                    ))}
                  </select>
                </div>
              </div>

            </div>

            {/* Balance Header Card */}
            <div className="relative p-5 rounded-2xl bg-gradient-to-br from-zinc-900 to-indigo-955 border border-indigo-500/25 text-white shadow-xl overflow-hidden flex flex-col gap-4 select-none">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-10 -mt-10 blur-xl animate-pulse" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Saldo Real */}
                <div className="flex flex-col p-3.5 rounded-xl bg-white/[0.03] border border-white/5 shadow-inner">
                  <span className="text-[9px] uppercase tracking-widest font-extrabold text-indigo-300">Saldo Real / Caixa</span>
                  <h3 className="text-2xl font-black mt-1 text-emerald-400">
                    R$ {realBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h3>
                  <p className="text-[8px] text-zinc-400 mt-1">
                    Ganhos recebidos (R$ {realIncome.toLocaleString('pt-BR')}) - despesas pagas (R$ {totalPaidExpenses.toLocaleString('pt-BR')}).
                  </p>
                </div>

                {/* Saldo Projetado */}
                <div className="flex flex-col p-3.5 rounded-xl bg-white/[0.03] border border-white/5 shadow-inner">
                  <span className="text-[9px] uppercase tracking-widest font-extrabold text-indigo-300">Saldo Projetado / Previsão</span>
                  <h3 className="text-2xl font-black mt-1 text-indigo-200">
                    R$ {projectedBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h3>
                  <p className="text-[8px] text-zinc-400 mt-1">
                    Total de ganhos (R$ {totalIncome.toLocaleString('pt-BR')}) - total de saídas (R$ {totalExpenses.toLocaleString('pt-BR')}).
                  </p>
                </div>
              </div>

              {/* Sub-metrics Breakdown Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-white/10 pt-4">
                {/* Entradas detail */}
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-white/5 text-emerald-400 border border-emerald-500/10">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[8px] text-indigo-300 uppercase font-bold tracking-wider">Entradas do Período</span>
                    <span className="text-sm font-black">R$ {totalIncome.toLocaleString('pt-BR')}</span>
                    <div className="flex items-center gap-1.5 text-[8px] text-zinc-400 mt-0.5">
                      <span className="text-emerald-400">R$ {realIncome.toLocaleString('pt-BR')} (Real)</span>
                      <span>•</span>
                      <span className="text-indigo-300">R$ {futureIncome.toLocaleString('pt-BR')} (Futuro)</span>
                    </div>
                  </div>
                </div>

                {/* Saídas detail */}
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-white/5 text-red-400 border border-red-500/10">
                    <TrendingDown className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[8px] text-indigo-300 uppercase font-bold tracking-wider">Saídas do Período</span>
                    <span className="text-sm font-black">R$ {totalExpenses.toLocaleString('pt-BR')}</span>
                    <div className="flex items-center gap-1.5 text-[8px] text-zinc-400 mt-0.5">
                      <span className="text-red-400">R$ {totalPaidExpenses.toLocaleString('pt-BR')} (Pago)</span>
                      <span>•</span>
                      <span className="text-amber-400">R$ {remainingToPay.toLocaleString('pt-BR')} (Pendente)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Gauges and Breakdowns Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              
              {/* Gauges Side card */}
              <div className="md:col-span-4 p-4 rounded-2xl bg-zinc-200/10 dark:bg-white/5 border border-zinc-200/30 dark:border-white/5 flex flex-col items-center justify-center text-center gap-2 select-none">
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
                    <span className="text-xs font-black">R$ {totalExpenses.toLocaleString('pt-BR')}</span>
                    <span className="text-[7px] text-zinc-555 font-bold uppercase tracking-wider mt-0.5">Total Gasto</span>
                  </div>
                </div>
                
                <span className="text-[8px] text-zinc-400 font-bold block mt-2">
                  Pago: R$ {totalPaidExpenses.toLocaleString('pt-BR')} ({totalExpenses > 0 ? Math.round((totalPaidExpenses / totalExpenses) * 100) : 0}%)
                </span>
                {remainingToPay > 0 && (
                  <span className="text-[8px] text-amber-500 font-bold block">
                    Pendente: R$ {remainingToPay.toLocaleString('pt-BR')}
                  </span>
                )}
              </div>

              {/* Macro Classifications Progress bars */}
              <div className="md:col-span-8 p-4 rounded-2xl bg-zinc-200/10 dark:bg-white/5 border border-zinc-200/30 dark:border-white/5 flex flex-col gap-3">
                <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-extrabold border-b border-white/5 pb-1">
                  Divisão por Classificação de Custos
                </span>
                
                <div className="flex flex-col gap-2 text-[10px]">
                  {[
                    { key: 'Essenciais', label: 'Essenciais (Casa, Saúde, Alimentação, Educação, Veículo)', color: 'bg-emerald-500', icon: '⚡' },
                    { key: 'Estilo de Vida', label: 'Estilo de Vida (Lazer, Cuidados, Vestuário, Serviços)', color: 'bg-blue-500', icon: '🎨' },
                    { key: 'Investimentos/Dívidas', label: 'Investimentos/Dívidas', color: 'bg-rose-500', icon: '⚠️' },
                    { key: 'Outros', label: 'Outros (Geral & Compras Bujo)', color: 'bg-zinc-500', icon: '🛒' }
                  ].map(m => {
                    const total = getMacroCategoryTotal(m.key);
                    const percent = totalExpenses > 0 ? Math.round((total / totalExpenses) * 100) : 0;
                    return (
                      <div key={m.key} className="flex flex-col gap-1">
                        <div className="flex items-center justify-between text-zinc-300 font-bold">
                          <span className="flex items-center gap-1">
                            <span>{m.icon}</span> {m.key}
                          </span>
                          <span>R$ {total.toLocaleString('pt-BR')} ({percent}%)</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-zinc-200/10 dark:bg-white/5 overflow-hidden">
                          <div className={`h-full rounded-full ${m.color}`} style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Category and Member Breakdown card list */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              
              {/* Category Breakdown (only showing categories with expenses > 0) */}
              <div className="p-4 rounded-2xl bg-zinc-200/10 dark:bg-white/5 border border-zinc-200/30 dark:border-white/5 flex flex-col gap-2.5">
                <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-extrabold border-b border-white/5 pb-1">
                  Gasto por Categoria
                </span>
                <div className="flex flex-col gap-2 text-[10px] max-h-[180px] overflow-y-auto pr-1">
                  {availableCategories
                    .map(cat => ({ name: cat, val: getCategoryTotal(cat) }))
                    .filter(c => c.val > 0)
                    .map(c => {
                      const pct = totalExpenses > 0 ? Math.round((c.val / totalExpenses) * 100) : 0;
                      return (
                        <div key={c.name} className="flex items-center justify-between border-b border-white/5 pb-1">
                          <span className="text-zinc-300 font-bold flex items-center gap-1.5">
                            <Folder className="w-3 h-3 text-bujo-highlight shrink-0" />
                            {c.name}
                          </span>
                          <span className="font-extrabold">
                            R$ {c.val.toLocaleString('pt-BR')} ({pct}%)
                          </span>
                        </div>
                      );
                    })}
                  {availableCategories.every(cat => getCategoryTotal(cat) === 0) && (
                    <span className="text-[9px] text-zinc-550 italic block py-4 text-center">Nenhum gasto registrado neste período</span>
                  )}
                </div>
              </div>

              {/* Owner/Member Breakdown (only showing members with expenses > 0) */}
              <div className="p-4 rounded-2xl bg-zinc-200/10 dark:bg-white/5 border border-zinc-200/30 dark:border-white/5 flex flex-col gap-2.5">
                <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-extrabold border-b border-white/5 pb-1">
                  Gasto por Membro / Responsável
                </span>
                <div className="flex flex-col gap-2 text-[10px] max-h-[180px] overflow-y-auto pr-1">
                  {availableOwners
                    .map(owner => ({ name: owner, val: getOwnerTotal(owner) }))
                    .filter(o => o.val > 0)
                    .map(o => {
                      const pct = totalExpenses > 0 ? Math.round((o.val / totalExpenses) * 100) : 0;
                      return (
                        <div key={o.name} className="flex items-center justify-between border-b border-white/5 pb-1">
                          <span className="text-zinc-300 font-bold flex items-center gap-1.5">
                            <User className="w-3 h-3 text-indigo-400 shrink-0" />
                            {o.name}
                          </span>
                          <span className="font-extrabold">
                            R$ {o.val.toLocaleString('pt-BR')} ({pct}%)
                          </span>
                        </div>
                      );
                    })}
                  {availableOwners.every(o => getOwnerTotal(o) === 0) && (
                    <span className="text-[9px] text-zinc-555 italic block py-4 text-center">Nenhum gasto registrado neste período</span>
                  )}
                </div>
              </div>

            </div>

            {/* Quick Status Info */}
            <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/10 text-[9px] text-amber-500/80 leading-normal flex gap-2">
              <span className="text-xs shrink-0">💡</span>
              <p>
                <strong>Priorização TDAH:</strong> Custos classificados como `Investimentos/Dívidas` e `Essenciais` devem ser pagos primeiro para reduzir a ansiedade mental. Tente reservar parte dos `Ganhos` para lazer e autocuidado (`Estilo de Vida`).
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
                Lançamentos cadastrados ({activeTab === 'income' ? 'Ganhos' : 'Custos'})
              </span>
              
              {(() => {
                const list = activeTab === 'income' ? incomes :
                             activeTab === 'fixed' ? fFixed :
                             activeTab === 'installment' ? fInstallments :
                             activeTab === 'arrears' ? overdueDebts :
                             newExpenses;
                
                if (list.length === 0) {
                  return (
                    <div className="text-center py-8 text-zinc-650 italic text-[10px]">
                      Nenhum lançamento cadastrado nesta categoria.
                    </div>
                  );
                }

                return (
                  <div className="flex flex-col gap-2.5">
                    {list.map(item => (
                      <div key={item.id} className="flex flex-col">
                        {editingItemId === item.id ? (
                          /* Inline Editing Form */
                          <form 
                            onSubmit={(e) => handleSaveEdit(e, item.type)}
                            className="p-3.5 rounded-xl border border-bujo-highlight/40 bg-zinc-950/80 space-y-3 animate-fade-in"
                          >
                            <span className="text-[8px] text-bujo-highlight font-extrabold uppercase tracking-widest block">
                              Editar Lançamento
                            </span>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              {/* Descrição */}
                              <div className="flex flex-col gap-0.5">
                                <label className="text-[7.5px] text-zinc-500 font-bold uppercase tracking-wider">Descrição</label>
                                <input
                                  type="text"
                                  value={editDesc}
                                  onChange={(e) => setEditDesc(e.target.value)}
                                  className="px-2 py-1 text-[9.5px] rounded-lg bg-zinc-900 border border-zinc-250/20 text-zinc-200 outline-none"
                                />
                              </div>

                              {/* Valor */}
                              <div className="flex flex-col gap-0.5">
                                <label className="text-[7.5px] text-zinc-500 font-bold uppercase tracking-wider">
                                  {item.type === 'installment' ? 'Valor Total da Dívida (R$)' : 'Valor (R$)'}
                                </label>
                                <input
                                  type="text"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  className="px-2 py-1 text-[9.5px] rounded-lg bg-zinc-900 border border-zinc-250/20 text-zinc-200 outline-none"
                                />
                              </div>

                              {/* Data de Transação */}
                              <div className="flex flex-col gap-0.5">
                                <label className="text-[7.5px] text-zinc-500 font-bold uppercase tracking-wider">Data de Criação/Lançamento (DD/MM/AAAA)</label>
                                <input
                                  type="text"
                                  value={editDate}
                                  onChange={(e) => setEditDate(e.target.value)}
                                  placeholder="DD/MM/AAAA"
                                  className="px-2 py-1 text-[9.5px] rounded-lg bg-zinc-900 border border-zinc-250/20 text-zinc-200 outline-none"
                                />
                              </div>

                              {/* Data de Vencimento / Previsão */}
                              {item.type !== 'installment' && item.type !== 'fixed' && (
                                <div className="flex flex-col gap-0.5">
                                  <label className="text-[7.5px] text-zinc-500 font-bold uppercase tracking-wider">
                                    {item.type === 'income' ? 'Previsão de Recebimento (DD/MM/AAAA)' : 'Data de Vencimento (Opcional) (DD/MM/AAAA)'}
                                  </label>
                                  <input
                                    type="text"
                                    value={editDueDate}
                                    onChange={(e) => setEditDueDate(e.target.value)}
                                    placeholder="DD/MM/AAAA"
                                    className="px-2 py-1 text-[9.5px] rounded-lg bg-zinc-900 border border-zinc-250/20 text-zinc-200 outline-none"
                                  />
                                </div>
                              )}

                              {/* Membro */}
                              <div className="flex flex-col gap-0.5">
                                <label className="text-[7.5px] text-zinc-500 font-bold uppercase tracking-wider">Responsável / Membro</label>
                                <select
                                  value={editOwner}
                                  onChange={(e) => setEditOwner(e.target.value as any)}
                                  className="px-2 py-1 text-[9.5px] rounded-lg bg-zinc-900 border border-zinc-250/20 text-zinc-200 outline-none cursor-pointer"
                                >
                                  {availableOwners.map(o => (
                                    <option key={o} value={o} className="bg-zinc-900 text-zinc-100">{o}</option>
                                  ))}
                                </select>
                              </div>

                              {/* Categoria */}
                              <div className="flex flex-col gap-0.5">
                                <label className="text-[7.5px] text-zinc-500 font-bold uppercase tracking-wider">Categoria</label>
                                <select
                                  value={editCategory}
                                  onChange={(e) => handleEditCategoryChange(e.target.value)}
                                  className="px-2 py-1 text-[9.5px] rounded-lg bg-zinc-900 border border-zinc-250/20 text-zinc-200 outline-none cursor-pointer"
                                >
                                  {(item.type === 'income' ? availableIncomeCategories : availableCategories).map(c => (
                                    <option key={c} value={c} className="bg-zinc-900 text-zinc-100">{c}</option>
                                  ))}
                                </select>
                              </div>

                              {/* Classificação */}
                              {item.type !== 'income' && (
                                <div className="flex flex-col gap-0.5">
                                  <label className="text-[7.5px] text-zinc-500 font-bold uppercase tracking-wider">Classificação de Custos</label>
                                  <select
                                    value={editMacroCategory}
                                    onChange={(e) => setEditMacroCategory(e.target.value as any)}
                                    className="px-2 py-1 text-[9.5px] rounded-lg bg-zinc-900 border border-zinc-250/20 text-zinc-200 outline-none cursor-pointer"
                                  >
                                    {availableMacros.map(m => (
                                      <option key={m} value={m} className="bg-zinc-900 text-zinc-100">{m}</option>
                                    ))}
                                  </select>
                                </div>
                              )}

                              {/* Status do Lançamento */}
                              <div className="flex flex-col gap-0.5">
                                <label className="text-[7.5px] text-zinc-500 font-bold uppercase tracking-wider">
                                  {item.type === 'income' ? 'Tipo de Ganho' : 'Status de Pagamento'}
                                </label>
                                <select
                                  value={editIsCancelled ? 'cancelled' : editIsPaid ? 'true' : 'false'}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === 'cancelled') {
                                      setEditIsPaid(false);
                                      setEditIsCancelled(true);
                                    } else if (val === 'true') {
                                      setEditIsPaid(true);
                                      setEditIsCancelled(false);
                                    } else {
                                      setEditIsPaid(false);
                                      setEditIsCancelled(false);
                                    }
                                  }}
                                  className="px-2 py-1 text-[9.5px] rounded-lg bg-zinc-900 border border-zinc-250/20 text-zinc-200 outline-none cursor-pointer"
                                >
                                  {item.type === 'income' ? (
                                    <>
                                      <option value="false" className="bg-zinc-900 text-zinc-100">📅 Futuro / Previsto</option>
                                      <option value="true" className="bg-zinc-900 text-zinc-100">💰 Real / Recebido</option>
                                      <option value="cancelled" className="bg-zinc-900 text-zinc-100">❌ Cancelado</option>
                                    </>
                                  ) : (
                                    <>
                                      <option value="false" className="bg-zinc-900 text-zinc-100">⏳ Pendente</option>
                                      <option value="true" className="bg-zinc-900 text-zinc-100">✓ Pago</option>
                                    </>
                                  )}
                                </select>
                              </div>

                              {/* Parcelas se aplicável */}
                              {item.type === 'installment' && (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full col-span-1 sm:col-span-2">
                                  <div className="flex flex-col gap-0.5">
                                    <label className="text-[7.5px] text-zinc-500 font-bold uppercase tracking-wider">Total Parc.</label>
                                    <input
                                      type="number"
                                      value={editTotInstallments}
                                      onChange={(e) => setEditTotInstallments(e.target.value)}
                                      className="px-2 py-1 text-[9.5px] rounded-lg bg-zinc-900 border border-zinc-250/20 text-zinc-200 outline-none"
                                    />
                                  </div>
                                  <div className="flex flex-col gap-0.5">
                                    <label className="text-[7.5px] text-zinc-500 font-bold uppercase tracking-wider">Data 1ª Parc. (DD/MM/AAAA)</label>
                                    <input
                                      type="text"
                                      value={editFirstInstallmentDate}
                                      onChange={(e) => setEditFirstInstallmentDate(e.target.value)}
                                      className="px-2 py-1 text-[9.5px] rounded-lg bg-zinc-900 border border-zinc-250/20 text-zinc-200 outline-none"
                                    />
                                  </div>
                                  <div className="flex flex-col gap-0.5">
                                    <label className="text-[7.5px] text-zinc-500 font-bold uppercase tracking-wider">Dia Vencimento</label>
                                    <input
                                      type="number"
                                      min="1"
                                      max="31"
                                      value={editDueDay}
                                      onChange={(e) => setEditDueDay(e.target.value)}
                                      className="px-2 py-1 text-[9.5px] rounded-lg bg-zinc-900 border border-zinc-250/20 text-zinc-200 outline-none"
                                    />
                                  </div>
                                  <div className="flex flex-col gap-0.5">
                                    <label className="text-[7.5px] text-zinc-500 font-bold uppercase tracking-wider">Parc. Pagas</label>
                                    <input
                                      type="number"
                                      min="0"
                                      value={editAlreadyPaidInstallmentsCount}
                                      onChange={(e) => setEditAlreadyPaidInstallmentsCount(e.target.value)}
                                      className="px-2 py-1 text-[9.5px] rounded-lg bg-zinc-900 border border-zinc-250/20 text-zinc-200 outline-none"
                                    />
                                  </div>
                                </div>
                              )}

                              {/* Dia de vencimento despesa fixa se aplicável */}
                              {item.type === 'fixed' && (
                                <div className="flex flex-col gap-0.5 col-span-1 sm:col-span-2">
                                  <label className="text-[7.5px] text-zinc-500 font-bold uppercase tracking-wider">Dia de Vencimento</label>
                                  <input
                                    type="number"
                                    min="1"
                                    max="31"
                                    value={editDueDay}
                                    onChange={(e) => setEditDueDay(e.target.value)}
                                    className="px-2 py-1 text-[9.5px] rounded-lg bg-zinc-900 border border-zinc-250/20 text-zinc-200 outline-none"
                                  />
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5 justify-end pt-1">
                              <button
                                type="button"
                                onClick={() => setEditingItemId(null)}
                                className="px-2.5 py-1 text-[9px] bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-lg cursor-pointer transition-colors font-bold"
                              >
                                Cancelar
                              </button>
                              <button
                                type="submit"
                                className="px-3 py-1 text-[9px] bg-bujo-highlight text-white rounded-lg cursor-pointer hover:opacity-90 transition-opacity font-bold shadow-sm shadow-bujo-highlight/10"
                              >
                                Salvar
                              </button>
                            </div>

                          </form>
                        ) : (
                           /* Standard Item Row */
                          <div 
                            className={`flex flex-col p-3 rounded-xl border transition-all ${
                              item.type === 'income'
                                ? item.isPaid
                                  ? 'bg-emerald-550/10 dark:bg-emerald-500/[0.03] border-emerald-500/25 hover:border-emerald-500/40 shadow-inner'
                                  : 'bg-indigo-500/5 dark:bg-indigo-500/[0.01] border-dashed border-indigo-550/30 hover:border-indigo-500/40'
                                : item.isPaid 
                                  ? 'bg-zinc-200/5 dark:bg-white/[0.01] border-zinc-200/10 dark:border-white/5 opacity-60' 
                                  : 'bg-zinc-200/10 dark:bg-white/5 border-zinc-200/30 dark:border-white/5 hover:border-bujo-highlight/30'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <button
                                  onClick={() => handleTogglePaid(item.id, item.type)}
                                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border cursor-pointer transition-all ${
                                    item.isPaid 
                                      ? 'bg-emerald-500 border-emerald-500 text-white scale-105 shadow' 
                                      : 'border-zinc-200/40 dark:border-white/20 hover:border-emerald-500'
                                  }`}
                                  title={item.type === 'income' ? (item.isPaid ? "Marcar como Não Recebido" : "Marcar como Recebido") : (item.isPaid ? "Marcar como Não Pago" : "Marcar como Pago")}
                                >
                                  {item.isPaid && <Check className="w-3 h-3 stroke-[3]" />}
                                </button>
                                <div className="min-w-0 flex flex-col">
                                  <span className={`text-xs font-bold truncate ${
                                    item.type === 'income'
                                      ? 'text-zinc-150'
                                      : item.isPaid ? 'line-through text-zinc-550' : 'text-zinc-150'
                                  }`}>
                                    {item.description}
                                  </span>
                                  {item.type === 'installment' && (
                                    <span className="text-[7.5px] font-bold text-zinc-555 mt-0.5">
                                      Parcela: {item.currentInstallment}/{item.totalInstallments} (Dívida Total: R$ {(item.totalDebtValue || (item.value * (item.totalInstallments || 1))).toLocaleString('pt-BR')})
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className={`text-xs font-black shrink-0 ${activeTab === 'income' ? 'text-emerald-400' : 'text-zinc-250'}`}>
                                  {activeTab === 'income' ? '+' : '-'} R$ {item.value.toLocaleString('pt-BR')}
                                </span>
                                
                                <button
                                  onClick={() => handleStartEdit(item)}
                                  className="p-1 text-zinc-500 hover:text-bujo-highlight rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                                  title="Editar lançamento"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>

                                <button
                                  onClick={() => handleDeleteItem(item.id, item.type)}
                                  className="p-1 text-zinc-500 hover:text-red-500 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                                  title="Remover lançamento"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            {/* Additional metadata row (badges and dates) */}
                            <div className="flex flex-wrap gap-1.5 items-center mt-2 pt-1.5 border-t border-zinc-250/20 dark:border-white/5 text-[7.5px] text-zinc-500 font-bold select-none">
                              {/* Dates */}
                              <span className="flex items-center gap-0.5">
                                <Calendar className="w-2.5 h-2.5 text-zinc-650" /> 
                                Criado: {item.date ? item.date.split('-').reverse().join('/') : item.createdAt.split('-').reverse().join('/')}
                              </span>
                              
                              {item.dueDate && (
                                <span className={`flex items-center gap-0.5 ${!item.isPaid && new Date(item.dueDate) < new Date() ? 'text-red-500' : ''}`}>
                                  <Calendar className="w-2.5 h-2.5 text-zinc-650" /> 
                                  Vencimento: {item.dueDate.split('-').reverse().join('/')}
                                </span>
                              )}

                              <div className="flex-1" />

                              {/* Status Badge */}
                              {item.type === 'income' ? (
                                item.isPaid ? (
                                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 uppercase flex items-center gap-0.5">
                                    💰 Real / Recebido
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/25 uppercase flex items-center gap-0.5">
                                    📅 Futuro / Previsto
                                  </span>
                                )
                              ) : (
                                item.isPaid ? (
                                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 uppercase flex items-center gap-0.5">
                                    ✓ Pago
                                  </span>
                                ) : (
                                  <span className={`px-1.5 py-0.5 rounded border uppercase flex items-center gap-0.5 ${item.dueDate && new Date(item.dueDate) < new Date() ? 'bg-red-500/10 text-red-500 border-red-500/25' : 'bg-amber-500/10 text-amber-400 border-amber-500/25'}`}>
                                    ⏳ Pendente
                                  </span>
                                )
                              )}

                              {/* Owner Badge */}
                              <span className="px-1.5 py-0.5 rounded bg-zinc-200/10 dark:bg-white/5 border border-zinc-250/20 text-zinc-450 uppercase flex items-center gap-0.5">
                                <User className="w-2 h-2" /> {item.owner}
                              </span>

                              {/* Category Badge */}
                              <span className="px-1.5 py-0.5 rounded bg-zinc-200/10 dark:bg-white/5 border border-zinc-250/20 text-zinc-450 uppercase flex items-center gap-0.5">
                                <Folder className="w-2 h-2" /> {item.category}
                              </span>

                              {/* Macro badge */}
                              <span className="px-1.5 py-0.5 rounded bg-bujo-highlight/10 text-bujo-highlight border border-bujo-highlight/25 uppercase flex items-center gap-0.5">
                                <Tag className="w-2 h-2" /> {item.macroCategory}
                              </span>

                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Add New Entry Form */}
            {editingItemId === null && (
              <form onSubmit={handleAddNewItem} className="p-4 rounded-2xl bg-zinc-200/10 dark:bg-white/5 border border-zinc-200/30 dark:border-white/5 flex flex-col gap-3">
                <span className="text-[9px] text-zinc-400 uppercase tracking-widest font-extrabold flex items-center gap-1.5 border-b border-white/5 pb-1">
                  <PlusCircle className="w-3.5 h-3.5 text-bujo-highlight" />
                  Cadastrar Novo Lançamento
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[10px]">
                  
                  {/* Descrição */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider">Descrição</label>
                    <input
                      type="text"
                      value={descInput}
                      onChange={(e) => setDescInput(e.target.value)}
                      placeholder="Ex: Conta de Luz, Aluguel..."
                      className="px-3 py-1.5 rounded-xl bg-zinc-200/10 dark:bg-white/5 border border-zinc-200/30 dark:border-white/5 text-zinc-150 focus:border-bujo-highlight focus:outline-none placeholder-zinc-650"
                    />
                  </div>
                  
                  {/* Valor */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider">
                      {activeTab === 'installment' ? 'Valor Total da Dívida (R$)' : 'Valor (R$)'}
                    </label>
                    <input
                      type="text"
                      value={valueInput}
                      onChange={(e) => setValueInput(e.target.value)}
                      placeholder={activeTab === 'installment' ? 'Ex: 1200.00' : 'Ex: 150.00'}
                      className="px-3 py-1.5 rounded-xl bg-zinc-200/10 dark:bg-white/5 border border-zinc-200/30 dark:border-white/5 text-zinc-150 focus:border-bujo-highlight focus:outline-none placeholder-zinc-650"
                    />
                  </div>

                  {/* Data Vencimento / Previsão */}
                  {activeTab !== 'installment' && activeTab !== 'fixed' && (
                    <div className="flex flex-col gap-1">
                      <label className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider">
                        {activeTab === 'income' ? 'Data de Previsão de Recebimento (DD/MM/AAAA)' : 'Data de Vencimento (Opcional) (DD/MM/AAAA)'}
                      </label>
                      <input
                        type="text"
                        value={dueDateInput}
                        onChange={(e) => setDueDateInput(e.target.value)}
                        placeholder="DD/MM/AAAA"
                        className="px-3 py-1.5 rounded-xl bg-zinc-200/10 dark:bg-white/5 border border-zinc-200/30 dark:border-white/5 text-zinc-150 focus:border-bujo-highlight focus:outline-none placeholder-zinc-650"
                      />
                    </div>
                  )}

                  {/* Membro */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider">Responsável / Membro</label>
                    <select
                      value={ownerInput}
                      onChange={(e) => setOwnerInput(e.target.value as any)}
                      className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-250/20 text-zinc-200 focus:border-bujo-highlight focus:outline-none cursor-pointer"
                    >
                      {availableOwners.map(o => (
                        <option key={o} value={o} className="bg-zinc-900 text-zinc-100">{o}</option>
                      ))}
                    </select>
                  </div>

                  {/* Categoria */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider">Categoria</label>
                    <select
                      value={categoryInput}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-250/20 text-zinc-200 focus:border-bujo-highlight focus:outline-none cursor-pointer"
                    >
                      {(activeTab === 'income' ? availableIncomeCategories : availableCategories).map(c => (
                        <option key={c} value={c} className="bg-zinc-900 text-zinc-100">{c}</option>
                      ))}
                    </select>
                  </div>

                  {/* Classificação */}
                  {activeTab !== 'income' && (
                    <div className="flex flex-col gap-1">
                      <label className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider">Classificação de Custos</label>
                      <select
                        value={macroCategoryInput}
                        onChange={(e) => setMacroCategoryInput(e.target.value as any)}
                        className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-250/20 text-zinc-200 focus:border-bujo-highlight focus:outline-none cursor-pointer"
                      >
                        {availableMacros.map(m => (
                          <option key={m} value={m} className="bg-zinc-900 text-zinc-100">{m}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Status */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider">
                      {activeTab === 'income' ? 'Tipo de Ganho' : 'Status de Pagamento'}
                    </label>
                    <select
                      value={isCancelledInput ? 'cancelled' : isPaidInput ? 'true' : 'false'}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'cancelled') {
                          setIsPaidInput(false);
                          setIsCancelledInput(true);
                        } else if (val === 'true') {
                          setIsPaidInput(true);
                          setIsCancelledInput(false);
                        } else {
                          setIsPaidInput(false);
                          setIsCancelledInput(false);
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-250/20 text-zinc-200 focus:border-bujo-highlight focus:outline-none cursor-pointer"
                    >
                      {activeTab === 'income' ? (
                        <>
                          <option value="false" className="bg-zinc-900 text-zinc-100">📅 Futuro / Previsto</option>
                          <option value="true" className="bg-zinc-900 text-zinc-100">💰 Real / Recebido</option>
                          <option value="cancelled" className="bg-zinc-900 text-zinc-100">❌ Cancelado</option>
                        </>
                      ) : (
                        <>
                          <option value="false" className="bg-zinc-900 text-zinc-100">⏳ Pendente</option>
                          <option value="true" className="bg-zinc-900 text-zinc-100">✓ Pago</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                {activeTab === 'installment' && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-white/5 pt-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider">Total de Parcelas</label>
                      <input
                        type="number"
                        value={totInstallments}
                        onChange={(e) => setTotInstallments(e.target.value)}
                        className="px-3 py-1.5 text-[10px] rounded-xl bg-zinc-200/10 dark:bg-white/5 border border-zinc-200/30 dark:border-white/5 text-zinc-150 focus:border-bujo-highlight focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider">Data da 1ª Parcela (DD/MM/AAAA)</label>
                      <input
                        type="text"
                        value={firstInstallmentDateInput}
                        onChange={(e) => setFirstInstallmentDateInput(e.target.value)}
                        placeholder="DD/MM/AAAA"
                        className="px-3 py-1.5 text-[10px] rounded-xl bg-zinc-200/10 dark:bg-white/5 border border-zinc-200/30 dark:border-white/5 text-zinc-150 focus:border-bujo-highlight focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider">Dia de Vencimento</label>
                      <input
                        type="number"
                        min="1"
                        max="31"
                        value={dueDayInput}
                        onChange={(e) => setDueDayInput(e.target.value)}
                        className="px-3 py-1.5 text-[10px] rounded-xl bg-zinc-200/10 dark:bg-white/5 border border-zinc-200/30 dark:border-white/5 text-zinc-150 focus:border-bujo-highlight focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider">Parcelas Pagas (Opcional)</label>
                      <input
                        type="number"
                        min="0"
                        value={alreadyPaidInstallmentsCountInput}
                        onChange={(e) => setAlreadyPaidInstallmentsCountInput(e.target.value)}
                        placeholder="Ex: 2"
                        className="px-3 py-1.5 text-[10px] rounded-xl bg-zinc-200/10 dark:bg-white/5 border border-zinc-200/30 dark:border-white/5 text-zinc-150 focus:border-bujo-highlight focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'fixed' && (
                  <div className="grid grid-cols-1 border-t border-white/5 pt-3 text-[10px]">
                    <div className="flex flex-col gap-1">
                      <label className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider">Dia de Vencimento</label>
                      <input
                        type="number"
                        min="1"
                        max="31"
                        value={dueDayInput}
                        onChange={(e) => setDueDayInput(e.target.value)}
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
            )}
          </div>
        )}

        {/* Bujo Shopping Tasks Tab */}
        {activeTab === 'bujo_tasks' && (
          <div className="flex flex-col gap-3 animate-fade-in">
            {/* Swiper Anchor Label & Date switcher */}
            <div className="flex flex-col md:flex-row gap-3 items-stretch justify-between p-4 rounded-2xl bg-zinc-200/10 dark:bg-zinc-900/60 border border-zinc-250/20 select-none">
              <div className="flex items-center gap-1.5 bg-zinc-200/10 dark:bg-black/25 p-0.5 rounded-xl border border-zinc-250/20">
                {[
                  { id: 'year', label: 'Ano' },
                  { id: 'month', label: 'Mês' },
                  { id: 'week', label: 'Semana' },
                  { id: 'day', label: 'Dia' }
                ].map(mode => (
                  <button
                    key={mode.id}
                    onClick={() => setViewMode(mode.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-[8.5px] font-bold uppercase transition-all cursor-pointer ${
                      viewMode === mode.id 
                        ? 'bg-bujo-highlight text-white shadow' 
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between md:justify-center gap-2">
                <button
                  onClick={handlePrevPeriod}
                  className="p-1 rounded-lg border border-white/5 hover:border-white/10 hover:bg-white/5 text-zinc-400 hover:text-white transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] font-extrabold uppercase text-white min-w-[140px] text-center">
                  {formatPeriodLabel()}
                </span>
                <button
                  onClick={handleNextPeriod}
                  className="p-1 rounded-lg border border-white/5 hover:border-white/10 hover:bg-white/5 text-zinc-400 hover:text-white transition-all cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-purple-500/5 border border-purple-500/10 text-[9px] text-purple-400 leading-normal">
              <strong>Integração Inteligente BuJo:</strong> Esta área exibe automaticamente todas as tarefas de compras/pagamentos concluídas no período selecionado, extraindo valores numéricos.
            </div>

            <div className="flex flex-col gap-2">
              {filteredBujoShopping.length === 0 ? (
                <div className="text-center py-8 text-zinc-650 italic text-[10px]">
                  Nenhuma tarefa de compra concluída encontrada no período selecionado.
                </div>
              ) : (
                filteredBujoShopping.map(task => (
                  <div 
                    key={task.id}
                    className="flex items-center justify-between p-2.5 rounded-xl border bg-zinc-200/5 dark:bg-white/[0.01] border-zinc-200/10 dark:border-white/5 opacity-85"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-xs">🛒</span>
                      <div className="min-w-0 flex flex-col gap-0.5">
                        <span className="text-xs font-bold truncate text-zinc-300">
                          {task.description}
                        </span>
                        <span className="text-[8px] font-bold text-zinc-500">
                          Concluído em: {task.date.split('-').reverse().join('/')}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-black text-purple-400 shrink-0">
                      - R$ {task.value.toLocaleString('pt-BR')}
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
