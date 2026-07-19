import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, map } from 'rxjs';
import { BujoService, BujoItem } from '../../../services/bujo.service';

export interface BudgetItem {
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
  updatedAt?: string;
  owner: string;
  category: string;
  macroCategory: 'Essenciais' | 'Estilo de Vida' | 'Investimentos/Dívidas' | 'Outros';
  totalDebtValue?: number;
  firstInstallmentDate?: string;
  dueDay?: number;
  alreadyPaidInstallmentsCount?: number;
  paidInstallmentNumbers?: number[];
  paidMonths?: string[];
  recurrenceType?: 'monthly' | 'seasonal';
}

export interface BudgetSettings {
  dailyReportEnabled: boolean;
  emails: string;
  reportHour: number;
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

export const getMacroCategoryForCategory = (cat: string): 'Essenciais' | 'Estilo de Vida' | 'Investimentos/Dívidas' | 'Outros' => {
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
    paidMonths: item.paidMonths || [],
    recurrenceType: item.recurrenceType
  }));
};

@Injectable({
  providedIn: 'root'
})
export class BudgetService {
  private incomesSubject = new BehaviorSubject<BudgetItem[]>([]);
  public incomes$ = this.incomesSubject.asObservable();

  private fixedBillsSubject = new BehaviorSubject<BudgetItem[]>([]);
  public fixedBills$ = this.fixedBillsSubject.asObservable();

  private installmentsSubject = new BehaviorSubject<BudgetItem[]>([]);
  public installments$ = this.installmentsSubject.asObservable();

  private overdueDebtsSubject = new BehaviorSubject<BudgetItem[]>([]);
  public overdueDebts$ = this.overdueDebtsSubject.asObservable();

  private newExpensesSubject = new BehaviorSubject<BudgetItem[]>([]);
  public newExpenses$ = this.newExpensesSubject.asObservable();

  private settingsSubject = new BehaviorSubject<BudgetSettings>({ dailyReportEnabled: false, emails: 'email@exemplo.com', reportHour: 6 });
  public settings$ = this.settingsSubject.asObservable();

  constructor(private bujoService: BujoService) {
    this.loadData();
  }

  private loadData() {
    this.incomesSubject.next(sanitizeBudgetItems(this.getParsedStorage('bujo_budget_income', []), 'income'));
    this.fixedBillsSubject.next(sanitizeBudgetItems(this.getParsedStorage('bujo_budget_fixed', []), 'fixed'));
    this.installmentsSubject.next(sanitizeBudgetItems(this.getParsedStorage('bujo_budget_installments', []), 'installment'));
    this.overdueDebtsSubject.next(sanitizeBudgetItems(this.getParsedStorage('bujo_budget_debts', []), 'arrears'));
    this.newExpensesSubject.next(sanitizeBudgetItems(this.getParsedStorage('bujo_budget_new', []), 'variable'));

    const savedSettings = localStorage.getItem('bujo_budget_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        this.settingsSubject.next({
          dailyReportEnabled: parsed.dailyReportEnabled ?? false,
          emails: parsed.emails ?? 'email@exemplo.com',
          reportHour: parsed.reportHour ?? 6
        });
      } catch (e) {}
    }
  }

  private getParsedStorage(key: string, defaultValue: any): any {
    const val = localStorage.getItem(key);
    if (!val) return defaultValue;
    try { return JSON.parse(val); } catch { return defaultValue; }
  }

  private saveToStorage(key: string, data: any) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // Generic updater
  private updateCollection(subject: BehaviorSubject<BudgetItem[]>, key: string, newItems: BudgetItem[]) {
    subject.next(newItems);
    this.saveToStorage(key, newItems);
  }

  getIncomes(): BudgetItem[] { return this.incomesSubject.value; }
  saveIncomes(items: BudgetItem[]) { this.updateCollection(this.incomesSubject, 'bujo_budget_income', items); }

  getFixedBills(): BudgetItem[] { return this.fixedBillsSubject.value; }
  saveFixedBills(items: BudgetItem[]) { this.updateCollection(this.fixedBillsSubject, 'bujo_budget_fixed', items); }

  getInstallments(): BudgetItem[] { return this.installmentsSubject.value; }
  saveInstallments(items: BudgetItem[]) { this.updateCollection(this.installmentsSubject, 'bujo_budget_installments', items); }

  getOverdueDebts(): BudgetItem[] { return this.overdueDebtsSubject.value; }
  saveOverdueDebts(items: BudgetItem[]) { this.updateCollection(this.overdueDebtsSubject, 'bujo_budget_debts', items); }

  getNewExpenses(): BudgetItem[] { return this.newExpensesSubject.value; }
  saveNewExpenses(items: BudgetItem[]) { this.updateCollection(this.newExpensesSubject, 'bujo_budget_new', items); }

  getSettings(): BudgetSettings { return this.settingsSubject.value; }
  saveSettings(settings: BudgetSettings) {
    this.settingsSubject.next(settings);
    this.saveToStorage('bujo_budget_settings', settings);
  }

  // Get completed Bujo Tasks mapped as Expenses
  getBujoExpenses$(): Observable<{ id: string; description: string; value: number; date: string }[]> {
    return this.bujoService.items$.pipe(
      map(items => {
        return items.filter(item => {
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
        }).map(item => ({
          id: item.id,
          description: item.content,
          value: this.parseExpenseFromTaskContent(item.content),
          date: item.date
        })).filter(exp => exp.value > 0);
      })
    );
  }

  private parseExpenseFromTaskContent(content: string): number {
    const r$Match = content.match(/(?:R\$|\$)\s*(\d+(?:[.,]\d+)?)/i);
    if (r$Match) return parseFloat(r$Match[1].replace(',', '.'));
    
    const reaisMatch = content.match(/(\d+(?:[.,]\d+)?)\s*(?:reais|R\$)/i);
    if (reaisMatch) return parseFloat(reaisMatch[1].replace(',', '.'));

    const numberMatch = content.match(/\b(\d+(?:[.,]\d+)?)\b\s*$/);
    if (numberMatch) return parseFloat(numberMatch[1].replace(',', '.'));

    return 0;
  }
}
