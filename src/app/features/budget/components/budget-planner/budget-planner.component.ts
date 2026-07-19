import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BudgetService, BudgetItem } from '../../services/budget.service';
import { filterByPeriodAndMeta, getFixedListInPeriod, getInstallmentsListInPeriod, isIncomeReceived, getWeekRange } from '../../utils/budget.utils';

@Component({
  selector: 'app-budget-planner',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './budget-planner.component.html',
  styleUrls: ['./budget-planner.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class BudgetPlannerComponent implements OnInit {
  activeTab: 'overview' | 'income' | 'fixed' | 'arrears' | 'variable' = 'overview';
  
  viewMode: 'year' | 'month' | 'week' | 'day' = 'month';
  selectedAnchorDate = new Date();
  filterOwner = 'Todos';
  filterMacro = 'Todos';

  incomes: BudgetItem[] = [];
  fixedBills: BudgetItem[] = [];
  overdueDebts: BudgetItem[] = [];
  newExpenses: BudgetItem[] = [];

  showSettings = false;
  showModal = false;

  // New Item Inputs
  descInput = '';
  valueInput = '';
  dateInput = new Date().toISOString().split('T')[0];
  dueDateInput = '';
  ownerInput = 'Geral';
  categoryInput = 'Geral';
  macroCategoryInput: 'Essenciais' | 'Estilo de Vida' | 'Investimentos/Dívidas' | 'Outros' = 'Outros';
  isPaidInput = false;
  isCancelledInput = false;
  dueDayInput = '5';
  recurrenceTypeInput: 'monthly' | 'seasonal' = 'monthly';

  constructor(public budgetService: BudgetService) {}

  ngOnInit() {
    this.budgetService.incomes$.subscribe(v => this.incomes = v);
    this.budgetService.fixedBills$.subscribe(v => this.fixedBills = v);
    this.budgetService.overdueDebts$.subscribe(v => this.overdueDebts = v);
    this.budgetService.newExpenses$.subscribe(v => this.newExpenses = v);
  }

  get fIncomes() { return filterByPeriodAndMeta(this.incomes, this.viewMode, this.selectedAnchorDate, this.filterOwner, this.filterMacro); }
  get fFixed() { return getFixedListInPeriod(this.fixedBills, this.viewMode, this.selectedAnchorDate, this.filterOwner, this.filterMacro); }
  get fArrears() { return filterByPeriodAndMeta(this.overdueDebts, this.viewMode, this.selectedAnchorDate, this.filterOwner, this.filterMacro); }
  get fVariable() { return filterByPeriodAndMeta(this.newExpenses, this.viewMode, this.selectedAnchorDate, this.filterOwner, this.filterMacro); }

  get totalIncome() { return this.fIncomes.filter(i => !i.isCancelled).reduce((a, c) => a + c.value, 0); }
  get totalFixed() { return this.fFixed.reduce((a, c) => a + c.value, 0); }
  get totalArrears() { return this.fArrears.reduce((a, c) => a + c.value, 0); }
  get totalVariable() { return this.fVariable.reduce((a, c) => a + c.value, 0); }

  get totalExpenses() { return this.totalFixed + this.totalArrears + this.totalVariable; }
  get currentBalance() { return this.totalIncome - this.totalExpenses; }

  resetDate() {
    this.selectedAnchorDate = new Date();
  }

  handlePrevPeriod() {
    const d = new Date(this.selectedAnchorDate);
    if (this.viewMode === 'year') d.setFullYear(d.getFullYear() - 1);
    else if (this.viewMode === 'month') d.setMonth(d.getMonth() - 1);
    else if (this.viewMode === 'week') d.setDate(d.getDate() - 7);
    else if (this.viewMode === 'day') d.setDate(d.getDate() - 1);
    this.selectedAnchorDate = d;
  }

  handleNextPeriod() {
    const d = new Date(this.selectedAnchorDate);
    if (this.viewMode === 'year') d.setFullYear(d.getFullYear() + 1);
    else if (this.viewMode === 'month') d.setMonth(d.getMonth() + 1);
    else if (this.viewMode === 'week') d.setDate(d.getDate() + 7);
    else if (this.viewMode === 'day') d.setDate(d.getDate() + 1);
    this.selectedAnchorDate = d;
  }

  formatPeriodLabel(): string {
    if (this.viewMode === 'year') return this.selectedAnchorDate.getFullYear().toString();
    if (this.viewMode === 'month') {
      const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
      return `${months[this.selectedAnchorDate.getMonth()]} de ${this.selectedAnchorDate.getFullYear()}`;
    }
    if (this.viewMode === 'week') {
      const [start, end] = getWeekRange(this.selectedAnchorDate);
      return `${start.getDate().toString().padStart(2, '0')}/${(start.getMonth() + 1).toString().padStart(2, '0')} a ${end.getDate().toString().padStart(2, '0')}/${(end.getMonth() + 1).toString().padStart(2, '0')}`;
    }
    return this.selectedAnchorDate.toLocaleDateString('pt-BR');
  }

  editingItemId: string | null = null;
  editingItemCreatedAt: string = '';

  openNewModal() {
    this.showModal = true;
    this.editingItemId = null;
    this.descInput = '';
    this.valueInput = '';
    this.dueDateInput = '';
    this.categoryInput = 'Geral';
  }

  openEditModal(item: any, tab: string) {
    this.showModal = true;
    this.editingItemId = item.id;
    this.editingItemCreatedAt = item.createdAt || new Date().toISOString().split('T')[0];
    this.descInput = item.description;
    this.valueInput = item.value.toString().replace('.', ',');
    this.dueDateInput = item.dueDate || '';
    this.categoryInput = item.category || 'Geral';
    // We set activeTab temporarily so save works correctly
    if (this.activeTab === 'overview') {
      this.activeTab = tab as any;
    }
  }

  closeModal() {
    this.showModal = false;
    this.editingItemId = null;
  }

  handleAddNewItem() {
    if (!this.descInput.trim() || !this.valueInput.trim()) return;
    const val = parseFloat(this.valueInput.replace(',', '.'));
    if (isNaN(val)) return;

    const newItem: BudgetItem = {
      id: this.editingItemId || `budget-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      description: this.descInput.trim(),
      value: val,
      type: this.activeTab === 'overview' ? 'variable' : this.activeTab as any,
      isPaid: this.isPaidInput,
      isCancelled: this.isCancelledInput,
      date: new Date().toISOString().split('T')[0],
      dueDate: this.dueDateInput ? new Date(this.dueDateInput).toISOString().split('T')[0] : undefined,
      createdAt: this.editingItemId ? this.editingItemCreatedAt : new Date().toISOString().split('T')[0],
      owner: this.ownerInput,
      category: this.categoryInput,
      macroCategory: this.macroCategoryInput,
      dueDay: parseInt(this.dueDayInput, 10) || 5
    };

    if (this.editingItemId) {
      if (this.activeTab === 'income') this.budgetService.saveIncomes(this.incomes.map(i => i.id === this.editingItemId ? { ...i, ...newItem } : i));
      else if (this.activeTab === 'fixed') this.budgetService.saveFixedBills(this.fixedBills.map(i => i.id === this.editingItemId ? { ...i, ...newItem } : i));
      else if (this.activeTab === 'arrears') this.budgetService.saveOverdueDebts(this.overdueDebts.map(i => i.id === this.editingItemId ? { ...i, ...newItem } : i));
      else this.budgetService.saveNewExpenses(this.newExpenses.map(i => i.id === this.editingItemId ? { ...i, ...newItem } : i));
    } else {
      if (this.activeTab === 'income') this.budgetService.saveIncomes([...this.incomes, newItem]);
      else if (this.activeTab === 'fixed') this.budgetService.saveFixedBills([...this.fixedBills, newItem]);
      else if (this.activeTab === 'arrears') this.budgetService.saveOverdueDebts([...this.overdueDebts, newItem]);
      else this.budgetService.saveNewExpenses([...this.newExpenses, newItem]);
    }

    this.closeModal();
  }
}
