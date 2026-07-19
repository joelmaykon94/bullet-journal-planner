import { Component, OnInit, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BujoService, BujoItem } from '../../../../services/bujo.service';

interface TaskDelayInfo {
  totalHours: number;
  days: number;
  hours: number;
  displayString: string;
  hasHourDelay: boolean;
}

interface QuickMenuItem {
  tab: string;
  label: string;
  iconPath: string;
}

interface UnpaidExpense {
  name: string;
  value: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class DashboardComponent implements OnInit {
  @Output() tabChange = new EventEmitter<string>();

  // Task stats
  totalTasks = 0;
  completedCount = 0;
  pendingCount = 0;
  cancelledCount = 0;
  percentCompleted = 0;
  percentPending = 0;

  // Overdue
  overdueTasks: { content: string; delayDisplay: string; date: string; id?: string }[] = [];

  // Financial
  allUnpaidExpenses: UnpaidExpense[] = [];
  totalIncome = 0;
  remainingToPay = 0;

  // Quick access menu items
  quickMenu: QuickMenuItem[] = [
    { tab: 'daily', label: 'Diário', iconPath: 'M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11' },
    { tab: 'timeline', label: 'Agenda', iconPath: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z' },
    { tab: 'weekly', label: 'Semanal', iconPath: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z' },
    { tab: 'monthly', label: 'Mensal', iconPath: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2zM8 14h.01M12 14h.01M16 14h.01' },
    { tab: 'future_log', label: 'Futuro', iconPath: 'M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2zM22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z' },
    { tab: 'budget', label: 'Finanças', iconPath: 'M21 12V7H5a2 2 0 010-4h14v4M3 5v14a2 2 0 002 2h16v-5M18 12a2 2 0 000 4h4v-4Z' },
    { tab: 'collections', label: 'Coleções', iconPath: 'M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z' },
  ];

  constructor(private bujoService: BujoService) {}

  ngOnInit(): void {
    this.bujoService.items$.subscribe(items => {
      this.calculateTaskStats(items);
      this.calculateOverdueTasks(items);
      this.calculateFinancials(items);
    });
  }

  navigateTo(tab: string): void {
    this.tabChange.emit(tab);
  }

  goToDailyLog(date: string, taskId?: string): void {
    if (date && date !== 'someday_maybe') {
      this.bujoService.setSelectedDate(date);
      if (taskId) {
        this.bujoService.setHighlightItemId(taskId);
      }
      this.navigateTo('daily');
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  formatCurrencyShort(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);
  }

  // ─── Task Statistics ───────────────────────────────────────────
  private calculateTaskStats(items: BujoItem[]): void {
    // Match React: filter tasks that are not migrated
    const activeTasks = items.filter(i => i.type === 'task' && (i as any).status !== 'migrated');
    this.totalTasks = activeTasks.length;

    // React uses 'open'/'scheduled' for pending, Angular BujoItem has 'todo'/'in_progress'
    // Since data comes from shared localStorage with React values, check both
    this.completedCount = activeTasks.filter(i => i.status === 'completed').length;
    this.pendingCount = activeTasks.filter(i =>
      i.status === 'todo' || i.status === 'in_progress' ||
      (i as any).status === 'open' || (i as any).status === 'scheduled'
    ).length;
    this.cancelledCount = activeTasks.filter(i => i.status === 'cancelled').length;

    this.percentCompleted = this.totalTasks > 0 ? Math.round((this.completedCount / this.totalTasks) * 100) : 0;
    this.percentPending = this.totalTasks > 0 ? Math.round((this.pendingCount / this.totalTasks) * 100) : 0;
  }

  // ─── Overdue Tasks ────────────────────────────────────────────
  private calculateOverdueTasks(items: BujoItem[]): void {
    const pendingItems = items.filter(i =>
      i.type === 'task' && (i as any).status !== 'migrated' &&
      (i.status === 'todo' || i.status === 'in_progress' ||
       (i as any).status === 'open' || (i as any).status === 'scheduled')
    );

    const overdueWithDelay = pendingItems
      .map(task => {
        const delayInfo = this.getTaskDelayInfo(task.date, task.time, task.createdAt);
        return { task, delayInfo };
      })
      .filter(({ delayInfo }) => delayInfo && (delayInfo.hasHourDelay || delayInfo.days > 0))
      .sort((a, b) => {
        const hoursA = a.delayInfo!.totalHours || (a.delayInfo!.days ? a.delayInfo!.days * 24 : 0);
        const hoursB = b.delayInfo!.totalHours || (b.delayInfo!.days ? b.delayInfo!.days * 24 : 0);
        return hoursB - hoursA;
      });

    this.overdueTasks = overdueWithDelay.map(({ task, delayInfo }) => ({
      id: task.id,
      content: task.content,
      delayDisplay: delayInfo!.displayString,
      date: task.date
    }));
  }

  /** Port of React's getTaskDelayInfo from plannerUtils.ts */
  private getTaskDelayInfo(itemDate: string, itemTime?: string, itemCreatedAt?: string): TaskDelayInfo | null {
    const now = new Date();
    let referenceTime: Date | null = null;
    let hasHourDelay = false;

    // 1. If it has date and time, check if scheduled time is in the past
    if (itemDate && itemTime && itemDate !== 'someday_maybe') {
      try {
        const dateParts = itemDate.split('-');
        const timeParts = itemTime.split(':');
        if (dateParts.length === 3 && timeParts.length >= 2) {
          const year = Number(dateParts[0]);
          const month = Number(dateParts[1]) - 1;
          const day = Number(dateParts[2]);
          const hour = Number(timeParts[0]);
          const minute = Number(timeParts[1]);

          const scheduled = new Date(year, month, day, hour, minute, 0, 0);
          if (!isNaN(scheduled.getTime()) && now.getTime() > scheduled.getTime()) {
            referenceTime = scheduled;
            hasHourDelay = true;
          }
        }
      } catch {
        // Ignore parsing errors
      }
    }

    // 2. Fallback to createdAt or itemDate at midnight
    if (!referenceTime) {
      if (itemCreatedAt) {
        const created = new Date(itemCreatedAt);
        if (!isNaN(created.getTime())) {
          referenceTime = created;
        }
      }

      if (!referenceTime && itemDate && itemDate !== 'someday_maybe') {
        const dateParts = itemDate.split('-').map(Number);
        if (dateParts.length === 3) {
          referenceTime = new Date(dateParts[0], dateParts[1] - 1, dateParts[2], 0, 0, 0, 0);
        }
      }
    }

    if (!referenceTime) return null;

    const diffMs = now.getTime() - referenceTime.getTime();
    if (diffMs <= 0) return null;

    const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;

    let displayString = '';
    if (hasHourDelay) {
      displayString = days > 0 ? `${days}d ${hours}h` : `${hours}h`;
    } else {
      displayString = `${days}d`;
    }

    return { totalHours, days, hours, displayString, hasHourDelay };
  }

  // ─── Financial Calculations ───────────────────────────────────
  private calculateFinancials(items: BujoItem[]): void {
    const anchorDate = new Date();
    const todayStr = new Date().toISOString().split('T')[0];

    const incomes = this.getParsedStorage('bujo_budget_income');
    const fixedBills = this.getParsedStorage('bujo_budget_fixed');
    const installmentsList = this.getParsedStorage('bujo_budget_installments');
    const overdueDebts = this.getParsedStorage('bujo_budget_debts');
    const newExpenses = this.getParsedStorage('bujo_budget_new');

    // Filter lists by the current month
    const fIncomes = this.filterByMonth(incomes, anchorDate);
    const fFixed = this.getFixedListInMonth(fixedBills, anchorDate);
    const fInstallments = this.getInstallmentsListInMonth(installmentsList, anchorDate);
    const fArrears = this.filterByMonth(overdueDebts, anchorDate);
    const fVariable = this.filterByMonth(newExpenses, anchorDate);

    // Active incomes (non-cancelled)
    const activeIncomes = fIncomes.filter((i: any) => !i.isCancelled);

    // Bujo shopping tasks for the current month
    const bujoShoppingTasks = items.filter(item => {
      if (item.type !== 'task' || item.status !== 'completed' || !item.date) return false;
      const lower = item.content.toLowerCase();
      const isShopping = lower.includes('comprar') || lower.includes('compra') ||
        lower.includes('pagar') || lower.includes('supermercado') ||
        item.icon === '🛒' || item.icon === '💰';
      if (!isShopping) return false;
      const taskDate = new Date(item.date + 'T00:00:00');
      return taskDate.getFullYear() === anchorDate.getFullYear() &&
        taskDate.getMonth() === anchorDate.getMonth();
    });

    const parseExpense = (content: string): number => {
      const rMatch = content.match(/(?:R\$|\$)\s*(\d+(?:[.,]\d+)?)/i);
      if (rMatch) return parseFloat(rMatch[1].replace(',', '.'));
      const reMatch = content.match(/(\d+(?:[.,]\d+)?)\s*(?:reais|R$)/i);
      if (reMatch) return parseFloat(reMatch[1].replace(',', '.'));
      const numMatch = content.match(/\b(\d+(?:[.,]\d+)?)\b\s*$/);
      if (numMatch) return parseFloat(numMatch[1].replace(',', '.'));
      return 0;
    };

    const totalBujoShopping = bujoShoppingTasks.reduce((acc, curr) => acc + parseExpense(curr.content), 0);

    const sumValue = (list: any[]) => list.reduce((acc: number, curr: any) => acc + (Number(curr.value) || Number(curr.amount) || 0), 0);

    this.totalIncome = sumValue(activeIncomes);
    const totalExpenses = sumValue(fFixed) + sumValue(fInstallments) + sumValue(fArrears) + sumValue(fVariable) + totalBujoShopping;

    // Paid amounts
    const paidFixed = fFixed.filter((b: any) => b.isPaid).reduce((acc: number, curr: any) => acc + (Number(curr.value) || Number(curr.amount) || 0), 0);
    const paidInstallments = fInstallments.filter((b: any) => b.isPaid).reduce((acc: number, curr: any) => acc + (Number(curr.value) || Number(curr.amount) || 0), 0);
    const paidArrears = fArrears.filter((b: any) => b.isPaid).reduce((acc: number, curr: any) => acc + (Number(curr.value) || Number(curr.amount) || 0), 0);
    const paidVariable = fVariable.filter((b: any) => b.isPaid).reduce((acc: number, curr: any) => acc + (Number(curr.value) || Number(curr.amount) || 0), 0);

    const totalPaidExpenses = paidFixed + paidInstallments + paidArrears + paidVariable + totalBujoShopping;
    this.remainingToPay = totalExpenses - totalPaidExpenses;

    // Unpaid items
    const unpaidFixed = fFixed.filter((b: any) => !b.isPaid);
    const unpaidInstallments = fInstallments.filter((b: any) => !b.isPaid);
    const unpaidArrears = fArrears.filter((b: any) => !b.isPaid);
    const unpaidVariable = fVariable.filter((b: any) => !b.isPaid);

    this.allUnpaidExpenses = [
      ...unpaidFixed.map((x: any) => ({ name: x.description || x.name || x.content || 'Conta Fixa', value: x.value })),
      ...unpaidInstallments.map((x: any) => ({ name: x.description || x.name || x.content || 'Parcela', value: x.value })),
      ...unpaidArrears.map((x: any) => ({ name: x.description || x.name || x.content || 'Dívida Atrasada', value: x.value })),
      ...unpaidVariable.map((x: any) => ({ name: x.description || x.name || x.content || 'Variável', value: x.value })),
    ];
  }

  private getParsedStorage(key: string): any[] {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private filterByMonth(list: any[], anchorDate: Date): any[] {
    return list.filter((item: any) => {
      if (!item.date) return false;
      const itemDate = new Date(item.date + 'T00:00:00');
      return itemDate.getFullYear() === anchorDate.getFullYear() &&
        itemDate.getMonth() === anchorDate.getMonth();
    });
  }

  private getFixedListInMonth(list: any[], targetDate: Date): any[] {
    const results: any[] = [];
    const targetYear = targetDate.getFullYear();
    const targetMonth = targetDate.getMonth();

    for (const item of list) {
      const creationDate = item.date
        ? new Date(item.date + 'T00:00:00')
        : new Date(item.createdAt + 'T00:00:00');
      const creationYear = creationDate.getFullYear();
      const creationMonth = creationDate.getMonth();

      if (targetYear < creationYear || (targetYear === creationYear && targetMonth < creationMonth)) {
        continue;
      }

      const dueDay = item.dueDay || (item.dueDate ? new Date(item.dueDate + 'T00:00:00').getDate() : 5);
      const yyyy = targetYear;
      const mm = String(targetMonth + 1).padStart(2, '0');
      const dd = String(dueDay).padStart(2, '0');
      const dueDateStr = `${yyyy}-${mm}-${dd}`;

      const yearMonthStr = `${yyyy}-${mm}`;
      const paidMonths = item.paidMonths || [];
      const isPaid = paidMonths.includes(yearMonthStr);

      results.push({
        ...item,
        value: Number(item.value) || Number(item.amount) || 0,
        dueDate: dueDateStr,
        date: dueDateStr,
        isPaid
      });
    }
    return results;
  }

  private getInstallmentsListInMonth(list: any[], targetDate: Date): any[] {
    const results: any[] = [];
    const targetYear = targetDate.getFullYear();
    const targetMonth = targetDate.getMonth();

    for (const item of list) {
      const firstDate = item.firstInstallmentDate
        ? new Date(item.firstInstallmentDate + 'T00:00:00')
        : new Date(item.date + 'T00:00:00');
      const firstYear = firstDate.getFullYear();
      const firstMonth = firstDate.getMonth();

      const monthDiff = (targetYear - firstYear) * 12 + (targetMonth - firstMonth);
      const startNum = (item.alreadyPaidInstallmentsCount || 0) + 1;
      const currentNum = startNum + monthDiff;

      if (currentNum >= 1 && currentNum <= (item.totalInstallments || 12)) {
        const dueDay = item.dueDay || firstDate.getDate() || 5;
        const yyyy = targetYear;
        const mm = String(targetMonth + 1).padStart(2, '0');
        const dd = String(dueDay).padStart(2, '0');
        const dueDateStr = `${yyyy}-${mm}-${dd}`;

        const val = item.totalDebtValue
          ? item.totalDebtValue / (item.totalInstallments || 12)
          : (item.value || item.amount || 0);

        const paidNums = item.paidInstallmentNumbers || [];
        const isPaid = paidNums.includes(currentNum);

        results.push({
          ...item,
          value: Number(val),
          dueDate: dueDateStr,
          date: dueDateStr,
          isPaid,
          currentInstallment: currentNum
        });
      }
    }
    return results;
  }
}
