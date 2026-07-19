import { BudgetItem } from '../services/budget.service';

export const isIncomeReceived = (item: BudgetItem, todayStr: string): boolean => {
  if (item.isCancelled) return false;
  if (item.isPaid) return true;
  if (item.dueDate && item.dueDate <= todayStr) return true;
  return false;
};

export const getWeekRange = (d: Date): [Date, Date] => {
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

export const getActiveInstallmentForMonth = (item: BudgetItem, targetDate: Date): { num: number; dueDateStr: string; value: number } | null => {
  if (item.type !== 'installment') return null;
  
  const firstDate = item.firstInstallmentDate ? new Date(item.firstInstallmentDate + 'T00:00:00') : new Date(item.date + 'T00:00:00');
  const firstYear = firstDate.getFullYear();
  const firstMonth = firstDate.getMonth();
  
  const targetYear = targetDate.getFullYear();
  const targetMonth = targetDate.getMonth();
  
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
      : item.value;
      
    return { num: currentNum, dueDateStr, value: val };
  }
  return null;
};

export const getInstallmentsInPeriod = (item: BudgetItem, viewMode: string, selectedAnchorDate: Date): BudgetItem[] => {
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

export const getInstallmentsListInPeriod = (list: BudgetItem[], viewMode: string, selectedAnchorDate: Date, filterOwner: string, filterMacro: string): BudgetItem[] => {
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

export const getActiveFixedForMonth = (item: BudgetItem, targetDate: Date): { dueDateStr: string; value: number } | null => {
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
  
  return { dueDateStr, value: item.value };
};

export const getFixedInPeriod = (item: BudgetItem, viewMode: string, selectedAnchorDate: Date): BudgetItem[] => {
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

export const getFixedListInPeriod = (list: BudgetItem[], viewMode: string, selectedAnchorDate: Date, filterOwner: string, filterMacro: string): BudgetItem[] => {
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

export const filterByPeriodAndMeta = (list: BudgetItem[], viewMode: string, selectedAnchorDate: Date, filterOwner: string, filterMacro: string): BudgetItem[] => {
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
    if (filterOwner !== 'Todos' && item.owner !== filterOwner) return false;
    if (filterMacro !== 'Todos' && item.macroCategory !== filterMacro) return false;
    return true;
  });
};
