import { useState, useEffect } from 'react';

export interface HabitLog {
  [habitName: string]: {
    [dateStr: string]: boolean;
  };
}

export function useHabits() {
  const [habits, setHabits] = useState<string[]>(() => {
    const saved = localStorage.getItem('bujo_habits');
    if (saved) return JSON.parse(saved);
    return ['Beber água', 'Estudar', 'Exercício físico', 'Meditar'];
  });

  const [habitLogs, setHabitLogs] = useState<HabitLog>(() => {
    const saved = localStorage.getItem('bujo_habit_logs');
    if (saved) return JSON.parse(saved);
    return {};
  });

  useEffect(() => {
    localStorage.setItem('bujo_habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('bujo_habit_logs', JSON.stringify(habitLogs));
  }, [habitLogs]);

  const toggleHabitDate = (habit: string, dateStr: string, setUserXp: (xp: (prev: number) => number) => void, showToast: (msg: string) => void) => {
    const currentVal = habitLogs[habit]?.[dateStr] || false;
    const isChecking = !currentVal;

    setHabitLogs(prev => {
      const logs = prev[habit] || {};
      return {
        ...prev,
        [habit]: {
          ...logs,
          [dateStr]: isChecking
        }
      };
    });

    if (isChecking) {
      setUserXp(prev => prev + 10);
      showToast(`🎯 Hábito "${habit}" concluído: +10 XP`);
    } else {
      setUserXp(prev => Math.max(0, prev - 10));
      showToast(`↩️ Hábito desmarcado: -10 XP`);
    }
  };

  const handleAddHabit = (name: string, showToast: (msg: string) => void) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (habits.includes(trimmed)) {
      showToast('Hábito já existe!');
      return;
    }
    setHabits(prev => [...prev, trimmed]);
    showToast(`Hábito "${trimmed}" adicionado!`);
  };

  const handleDeleteHabit = (habitToDelete: string, showToast: (msg: string) => void) => {
    setHabits(prev => prev.filter(h => h !== habitToDelete));
    setHabitLogs(prev => {
      const next = { ...prev };
      delete next[habitToDelete];
      return next;
    });
    showToast(`Hábito "${habitToDelete}" removido.`);
  };

  const handleEditHabit = (oldName: string, newName: string, showToast: (msg: string) => void) => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    if (trimmed === oldName) return;
    if (habits.includes(trimmed)) {
      showToast('Hábito já existe!');
      return;
    }
    setHabits(prev => prev.map(h => h === oldName ? trimmed : h));
    setHabitLogs(prev => {
      const next = { ...prev };
      if (next[oldName]) {
        next[trimmed] = next[oldName];
        delete next[oldName];
      }
      return next;
    });
    showToast(`Hábito renomeado para "${trimmed}"`);
  };

  return {
    habits,
    setHabits,
    habitLogs,
    setHabitLogs,
    toggleHabitDate,
    handleAddHabit,
    handleDeleteHabit,
    handleEditHabit
  };
}
