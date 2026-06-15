import { useState, useEffect, useRef } from 'react';
import { BujoItem } from '../types';

export function useBujoItems(
  setUserXp: React.Dispatch<React.SetStateAction<number>>,
  setCollections: React.Dispatch<React.SetStateAction<any[]>>,
  showToast: (msg: string) => void
) {
  const [items, setItems] = useState<BujoItem[]>(() => {
    const saved = localStorage.getItem('bujo_focus_items');
    if (saved) return JSON.parse(saved);
    const today = new Date().toISOString().split('T')[0];
    return [
      { 
        id: '1', 
        type: 'task', 
        status: 'open', 
        content: 'Explorar a barra lateral e configurar o app', 
        date: today,
        subtasks: [
          { id: 's1', content: 'Escolher fonte Dyslexie-friendly nas configurações', completed: true },
          { id: 's2', content: 'Fazer o primeiro despejo de mente (Brain Dump)', completed: false }
        ],
        priority: true
      },
      { 
        id: '2', 
        type: 'task', 
        status: 'completed', 
        content: 'Instalar o BuJo Focus na tela inicial do celular (PWA)', 
        date: today 
      },
      { 
        id: '3', 
        type: 'event', 
        status: 'open', 
        content: 'Sessão de Foco Coletivo de TDAH', 
        date: today, 
        time: '14:30' 
      },
      { 
        id: '4', 
        type: 'note', 
        status: 'open', 
        content: 'Nota: Reduzir atrito cognitivo é a chave para a constância.', 
        date: today 
      }
    ];
  });

  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    localStorage.setItem('bujo_focus_items', JSON.stringify(items));
  }, [items]);

  // Handle standard log item quick save
  const handleSaveStandardInput = (
    standardInput: string,
    setStandardInput: React.Dispatch<React.SetStateAction<string>>,
    standardType: 'task' | 'event' | 'note',
    standardDate: string,
    selectedDate: string,
    standardTime: string,
    setStandardTime: React.Dispatch<React.SetStateAction<string>>
  ) => {
    if (!standardInput.trim()) return;

    const content = standardInput.trim();
    const newItem: BujoItem = {
      id: Math.random().toString(),
      type: standardType,
      status: 'open',
      content: content,
      date: standardDate || selectedDate,
      time: standardTime || undefined,
      subtasks: standardType === 'task' ? [] : undefined
    };

    // Check for collection sync: [Collection Name] some task
    const collectionMatch = content.match(/^\[(.*?)\]\s*(.*)/);
    if (collectionMatch && standardType === 'task') {
      const colName = collectionMatch[1];
      const taskContent = collectionMatch[2];
      
      let found = false;
      setCollections(prev => prev.map(col => {
        if (col.name.toLowerCase() === colName.toLowerCase()) {
          found = true;
          const newColItem = {
            id: `item-${Date.now()}-${Math.random()}`,
            title: taskContent || colName,
            status: 'todo',
            notes: `Adicionado via Daily Log em ${new Date().toLocaleDateString()}`,
            media: [],
            subtasks: []
          };
          return {
            ...col,
            items: [...col.items, newColItem]
          };
        }
        return col;
      }));

      if (found) {
        showToast(`Adicionado ao Daily Log e à coleção "${colName}"!`);
      } else {
        showToast('Adicionado ao Daily Log!');
      }
    } else {
      showToast('Adicionado ao Daily Log!');
    }

    setItems(prev => [newItem, ...prev]);
    setStandardInput('');
    setStandardTime('');
  };

  // Timeline quick insert handler
  const handleTimelineAddInput = (
    timelineInput: string,
    setTimelineInput: React.Dispatch<React.SetStateAction<string>>
  ) => {
    if (!timelineInput.trim()) return;

    const newItem: BujoItem = {
      id: Math.random().toString(),
      type: 'task',
      status: 'open',
      content: timelineInput.trim(),
      date: new Date().toISOString().split('T')[0],
      subtasks: []
    };

    setItems(prev => [newItem, ...prev]);
    setTimelineInput('');
    showToast('Tarefa pendente adicionada!');
  };

  // Create and schedule task directly from timeline hour modal
  const handleCreateAndSchedule = (
    newHourTaskContent: string,
    setNewHourTaskContent: React.Dispatch<React.SetStateAction<string>>,
    selectedHourToSchedule: number | null,
    setSelectedHourToSchedule: React.Dispatch<React.SetStateAction<number | null>>,
    newHourTaskType: 'task' | 'event'
  ) => {
    if (!newHourTaskContent.trim() || selectedHourToSchedule === null) return;

    const timeStr = `${selectedHourToSchedule.toString().padStart(2, '0')}:00`;
    const newItem: BujoItem = {
      id: Math.random().toString(),
      type: newHourTaskType,
      status: 'scheduled',
      content: newHourTaskContent.trim(),
      date: new Date().toISOString().split('T')[0],
      time: timeStr,
      subtasks: newHourTaskType === 'task' ? [] : undefined
    };

    setItems(prev => [newItem, ...prev]);
    setNewHourTaskContent('');
    setSelectedHourToSchedule(null);
    showToast(`Criado e agendado para às ${timeStr}`);
  };

  // Cycle status of tasks
  const cycleStatus = (id: string) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        let nextStatus: BujoItem['status'] = 'open';
        if (item.status === 'open') {
          nextStatus = 'completed';
          setUserXp(prevXp => {
            const nextXp = prevXp + 20;
            showToast('✨ Conquista! Tarefa concluída: +20 XP');
            return nextXp;
          });
        }
        else if (item.status === 'completed') {
          nextStatus = 'migrated';
          setUserXp(prevXp => {
            const nextXp = Math.max(0, prevXp - 20);
            showToast('↩️ Tarefa desmarcada: -20 XP');
            return nextXp;
          });
        }
        else if (item.status === 'migrated') nextStatus = 'scheduled';
        else if (item.status === 'scheduled') nextStatus = 'open';
        return { ...item, status: nextStatus };
      }
      return item;
    }));
  };

  // Schedule task on timeline hour
  const assignItemToTime = (
    itemId: string,
    timeStr: string,
    setSelectedHourToSchedule: React.Dispatch<React.SetStateAction<number | null>>
  ) => {
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        return { ...item, time: timeStr, status: 'scheduled' };
      }
      return item;
    }));
    setSelectedHourToSchedule(null);
    showToast(`Tarefa agendada para às ${timeStr}`);
  };

  // Unassign task from timeline hour
  const unassignItemFromTime = (itemId: string) => {
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        return { ...item, time: undefined, status: 'open' };
      }
      return item;
    }));
    showToast('Horário removido');
  };

  // Delete item entirely
  const handleDeleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    showToast('Entrada excluída');
  };

  // Inline content edit save
  const handleSaveEditItem = (id: string, editingItemContent: string) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, content: editingItemContent };
      }
      return item;
    }));
    showToast('Alteração salva');
  };

  // Smart subtask adding
  const addSubtask = (
    taskId: string,
    newSubtaskText: string,
    setNewSubtaskText: React.Dispatch<React.SetStateAction<string>>
  ) => {
    if (!newSubtaskText.trim()) return;
    setItems(prev => prev.map(item => {
      if (item.id === taskId) {
        const sub = item.subtasks || [];
        return {
          ...item,
          subtasks: [...sub, { id: Math.random().toString(), content: newSubtaskText.trim(), completed: false }]
        };
      }
      return item;
    }));
    setNewSubtaskText('');
  };

  // Toggle subtask checkbox
  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setItems(prev => prev.map(item => {
      if (item.id === taskId && item.subtasks) {
        return {
          ...item,
          subtasks: item.subtasks.map(s => {
            if (s.id === subtaskId) {
              const nextVal = !s.completed;
              if (nextVal) {
                setUserXp(prevXp => {
                  const nextXp = prevXp + 5;
                  showToast('⚡ Micro-passo vencido: +5 XP');
                  return nextXp;
                });
              } else {
                setUserXp(prevXp => {
                  const nextXp = Math.max(0, prevXp - 5);
                  showToast('↩️ Micro-passo desmarcado: -5 XP');
                  return nextXp;
                });
              }
              return { ...s, completed: nextVal };
            }
            return s;
          })
        };
      }
      return item;
    }));
  };

  // Delete subtask
  const deleteSubtask = (taskId: string, subtaskId: string) => {
    setItems(prev => prev.map(item => {
      if (item.id === taskId && item.subtasks) {
        return {
          ...item,
          subtasks: item.subtasks.filter(s => s.id !== subtaskId)
        };
      }
      return item;
    }));
    showToast('Micro-tarefa removida');
  };

  return {
    items,
    setItems,
    itemsRef,
    handleSaveStandardInput,
    handleTimelineAddInput,
    handleCreateAndSchedule,
    cycleStatus,
    assignItemToTime,
    unassignItemFromTime,
    handleDeleteItem,
    handleSaveEditItem,
    addSubtask,
    toggleSubtask,
    deleteSubtask
  };
}
