import { useState, useEffect, useRef } from 'react';
import { BujoItem, DreamItem } from '../types';
import { getLocalDateString, getWeekdaysForDate } from '../utils/plannerUtils';

export function useBujoItems(
  setUserXp: React.Dispatch<React.SetStateAction<number>>,
  setCollections: React.Dispatch<React.SetStateAction<any[]>>,
  showToast: (msg: string) => void
) {
  const [items, setItems] = useState<BujoItem[]>(() => {
    const saved = localStorage.getItem('bujo_focus_items');
    if (saved) return JSON.parse(saved);
    const today = getLocalDateString();
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

  // Auto-migration of pending tasks on day rollover (midnight)
  useEffect(() => {
    const checkAutoMigration = () => {
      const currentItems = itemsRef.current;
      const todayStr = getLocalDateString();
      
      const pastPendingTasks = currentItems.filter(
        item =>
          item.type === 'task' &&
          item.date < todayStr &&
          item.status !== 'completed' &&
          item.status !== 'cancelled' &&
          item.status !== 'migrated'
      );

      if (pastPendingTasks.length === 0) return;

      const newItems: BujoItem[] = [];
      const copiesToCreate: BujoItem[] = [];

      currentItems.forEach(item => {
        const isPastPending =
          item.type === 'task' &&
          item.date < todayStr &&
          item.status !== 'completed' &&
          item.status !== 'cancelled' &&
          item.status !== 'migrated';

        if (isPastPending) {
          if (!item.time) {
            // If it has no time (only date), move it to today (so it is deleted from the previous day)
            newItems.push({
              ...item,
              date: todayStr,
              status: 'open' as const
            });
          } else {
            // If it has date and time, mark the original on the previous day as migrated
            newItems.push({
              ...item,
              status: 'migrated' as const
            });
            // Create a copy for today
            copiesToCreate.push({
              ...item,
              id: `task-auto-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
              date: todayStr,
              status: 'open' as const
            });
          }
        } else {
          newItems.push(item);
        }
      });

      setItems([...newItems, ...copiesToCreate]);
      showToast(`🔄 Auto-migração: ${pastPendingTasks.length} tarefas pendentes trazidas para hoje!`);
    };

    // Run check immediately on mount
    checkAutoMigration();

    // Set up check interval (every 10 seconds)
    const intervalId = setInterval(checkAutoMigration, 10000);
    return () => clearInterval(intervalId);
  }, []);

  // Handle standard log item quick save
  const handleSaveStandardInput = (
    standardInput: string,
    setStandardInput: React.Dispatch<React.SetStateAction<string>>,
    standardType: 'task' | 'event' | 'note',
    standardDate: string,
    selectedDate: string,
    standardTime: string,
    setStandardTime: React.Dispatch<React.SetStateAction<string>>,
    icon?: string,
    energy?: number,
    complexity?: number,
    executionTime?: number
  ) => {
    if (!standardInput.trim()) return;

    const content = standardInput.trim();
    
    // Delegation regex extraction
    let delegatedTo = undefined;
    const delegationMatch = content.match(/#([a-zA-ZÀ-ÿ0-9_-]+)/);
    if (delegationMatch) {
      delegatedTo = delegationMatch[1];
    }

    const targetDate = standardDate || selectedDate;
    const isRecurring = standardType === 'task' && content.toLowerCase().includes('todos os dias');
    
    let itemsToCreate: BujoItem[] = [];
    
    if (isRecurring) {
      const weekdays = getWeekdaysForDate(targetDate);
      weekdays.forEach((wDate, idx) => {
        const idTime = Date.now() + idx;
        const item: BujoItem = {
          id: `${idTime}-${Math.random().toString(36).substring(2, 11)}`,
          type: 'task',
          status: 'open',
          content: content,
          date: wDate,
          time: standardTime || undefined,
          subtasks: [],
          icon: icon || undefined,
          energy: energy || 1,
          complexity: complexity || 1,
          executionTime: executionTime || undefined,
          delegatedTo: delegatedTo || undefined
        };
        itemsToCreate.push(item);
      });
    } else {
      const newItem: BujoItem = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        type: standardType,
        status: 'open',
        content: content,
        date: targetDate,
        time: standardTime || undefined,
        subtasks: standardType === 'task' ? [] : undefined,
        icon: icon || undefined,
        energy: standardType === 'task' ? (energy || 1) : undefined,
        complexity: standardType === 'task' ? (complexity || 1) : undefined,
        executionTime: standardType === 'task' ? (executionTime || undefined) : undefined,
        delegatedTo: delegatedTo || undefined
      };
      itemsToCreate.push(newItem);
    }

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

    setItems(prev => [...itemsToCreate, ...prev]);
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
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      type: 'task',
      status: 'open',
      content: timelineInput.trim(),
      date: getLocalDateString(),
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
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      type: newHourTaskType,
      status: 'scheduled',
      content: newHourTaskContent.trim(),
      date: getLocalDateString(),
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
        else if (item.status === 'scheduled') nextStatus = 'cancelled';
        else if (item.status === 'cancelled') nextStatus = 'open';
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

  // Trash state
  const [trashItems, setTrashItems] = useState<BujoItem[]>(() => {
    const saved = localStorage.getItem('bujo_focus_trash_items');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('bujo_focus_trash_items', JSON.stringify(trashItems));
  }, [trashItems]);

  // Someday/Maybe state
  const [somedayItems, setSomedayItems] = useState<BujoItem[]>(() => {
    const saved = localStorage.getItem('bujo_focus_someday_items');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'sd-1', type: 'task', status: 'open', content: 'Aprender tocar piano', date: 'someday_maybe' },
      { id: 'sd-2', type: 'task', status: 'open', content: 'Planejar viagem para o Japão', date: 'someday_maybe' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('bujo_focus_someday_items', JSON.stringify(somedayItems));
  }, [somedayItems]);

  // Dream Board (Quadro dos Sonhos) state
  const [dreams, setDreams] = useState<DreamItem[]>(() => {
    const saved = localStorage.getItem('bujo_focus_dreams');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'dream-1', title: 'Viajar para o Japão 🌸', description: 'Visitar Tóquio, Quioto e ver o Monte Fuji', category: 'Viagem', icon: '✈️', conquered: false },
      { id: 'dream-2', title: 'Aprender React Native', description: 'Criar meu primeiro aplicativo móvel', category: 'Carreira', icon: '💻', conquered: false }
    ];
  });

  useEffect(() => {
    localStorage.setItem('bujo_focus_dreams', JSON.stringify(dreams));
  }, [dreams]);

  // Delete item entirely (send to trash)
  const handleDeleteItem = (id: string) => {
    const itemToDelete = items.find(item => item.id === id);
    if (itemToDelete) {
      setTrashItems(prev => [...prev, itemToDelete]);
    }
    setItems(prev => prev.filter(item => item.id !== id));
    showToast('Entrada enviada para a lixeira');
  };

  const handleRestoreItem = (id: string) => {
    const itemToRestore = trashItems.find(item => item.id === id);
    if (itemToRestore) {
      if (itemToRestore.date === 'someday_maybe') {
        setSomedayItems(prev => [...prev, itemToRestore]);
      } else {
        setItems(prev => [...prev, itemToRestore]);
      }
      setTrashItems(prev => prev.filter(item => item.id !== id));
      showToast('Entrada restaurada');
    }
  };

  const handleDeletePermanently = (id: string) => {
    setTrashItems(prev => prev.filter(item => item.id !== id));
    showToast('Entrada excluída permanentemente');
  };

  const handleEmptyTrash = () => {
    setTrashItems([]);
    showToast('Lixeira esvaziada');
  };

  const handleAddSomedayItem = (content: string, type: 'task' | 'event' | 'note' = 'task', category?: string) => {
    const newItem: BujoItem = {
      id: 'sd-' + Math.random().toString(),
      type,
      status: 'open',
      content: content.trim(),
      date: 'someday_maybe',
      category,
      subtasks: type === 'task' ? [] : undefined
    };
    setSomedayItems(prev => [...prev, newItem]);
    showToast('Adicionado a Algum Dia/Talvez');
  };

  const handleUpdateSomedayItemCategory = (id: string, category: string) => {
    setSomedayItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, category: category || undefined };
      }
      return item;
    }));
    showToast('Categoria atualizada');
  };

  const handleEditSomedayItemContent = (id: string, newContent: string) => {
    setSomedayItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, content: newContent.trim() };
      }
      return item;
    }));
    showToast('Item atualizado');
  };

  const handleDeleteSomedayItem = (id: string) => {
    const itemToDelete = somedayItems.find(item => item.id === id);
    if (itemToDelete) {
      setTrashItems(prev => [...prev, itemToDelete]);
    }
    setSomedayItems(prev => prev.filter(item => item.id !== id));
    showToast('Item enviado para a lixeira');
  };

  const handleScheduleSomedayItem = (id: string, date: string) => {
    const item = somedayItems.find(item => item.id === id);
    if (item) {
      const scheduledItem: BujoItem = {
        ...item,
        id: Math.random().toString(),
        date: date,
        status: 'open'
      };
      setItems(prev => [...prev, scheduledItem]);
      setSomedayItems(prev => prev.filter(item => item.id !== id));
      showToast('Item agendado no Daily Log');
    }
  };

  const handleToggleSomedayItem = (id: string) => {
    setSomedayItems(prev => prev.map(item => {
      if (item.id === id && item.type === 'task') {
        const nextStatus = item.status === 'completed' ? 'open' : 'completed';
        if (nextStatus === 'completed') {
          setUserXp(p => p + 10);
          showToast('Tarefa de Algum Dia concluída: +10 XP');
        } else {
          setUserXp(p => Math.max(0, p - 10));
          showToast('Tarefa desmarcada: -10 XP');
        }
        return { ...item, status: nextStatus };
      }
      return item;
    }));
  };

  // Inline content edit save
  const handleSaveEditItem = (
    id: string,
    editingItemContent: string,
    energy?: number,
    complexity?: number,
    executionTime?: number,
    date?: string,
    time?: string
  ) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        // Delegation regex extraction
        const delegationMatch = editingItemContent.match(/#([a-zA-ZÀ-ÿ0-9_-]+)/);
        const delegatedTo = delegationMatch ? delegationMatch[1] : undefined;

        return {
          ...item,
          content: editingItemContent,
          energy: item.type === 'task' ? (energy ?? item.energy) : undefined,
          complexity: item.type === 'task' ? (complexity ?? item.complexity) : undefined,
          executionTime: item.type === 'task' ? (executionTime ?? item.executionTime) : undefined,
          delegatedTo: delegatedTo !== undefined ? delegatedTo : item.delegatedTo,
          date: date ?? item.date,
          time: time !== undefined ? time : item.time
        };
      }
      return item;
    }));
    showToast('Alteração salva');
  };

  // Smart subtask adding
  const addSubtask = (
    taskId: string,
    newSubtaskText: string,
    setNewSubtaskText: React.Dispatch<React.SetStateAction<string>>,
    icon?: string,
    executionTime?: number
  ) => {
    if (!newSubtaskText.trim()) return;
    setItems(prev => prev.map(item => {
      if (item.id === taskId) {
        const sub = item.subtasks || [];
        return {
          ...item,
          subtasks: [...sub, { 
            id: Math.random().toString(), 
            content: newSubtaskText.trim(), 
            completed: false, 
            icon,
            executionTime
          }]
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

  const handleUpdateItemDelegatedTo = (id: string, delegatedTo: string) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, delegatedTo: delegatedTo.trim() || undefined };
      }
      return item;
    }));
    setSomedayItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, delegatedTo: delegatedTo.trim() || undefined };
      }
      return item;
    }));
    showToast('Responsável atualizado');
  };

  const handleUpdateItemIcon = (id: string, icon: string) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, icon: icon || undefined };
      }
      return item;
    }));
    setSomedayItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, icon: icon || undefined };
      }
      return item;
    }));
    showToast('Ícone do item atualizado');
  };

  // Dream Board (Quadro dos Sonhos) helpers
  const handleAddDream = (title: string, category: string, icon?: string, description?: string) => {
    if (!title.trim()) return;
    const newDream: DreamItem = {
      id: 'dream-' + Date.now(),
      title: title.trim(),
      category,
      icon: icon || undefined,
      description: description?.trim() || undefined,
      conquered: false
    };
    setDreams(prev => [newDream, ...prev]);
    showToast('Sonho adicionado ao seu Quadro! ✨');
  };

  const handleToggleDreamConquered = (id: string) => {
    setDreams(prev => prev.map(dream => {
      if (dream.id === id) {
        const nextConquered = !dream.conquered;
        if (nextConquered) {
          setUserXp(prevXp => prevXp + 50);
          showToast('Parabéns! Sonho Conquistado! 🏆 (+50 XP)');
          return {
            ...dream,
            conquered: nextConquered,
            conqueredAt: getLocalDateString()
          };
        } else {
          showToast('Status do sonho redefinido');
          return {
            ...dream,
            conquered: nextConquered,
            conqueredAt: undefined
          };
        }
      }
      return dream;
    }));
  };

  const handleDeleteDream = (id: string) => {
    setDreams(prev => prev.filter(dream => dream.id !== id));
    showToast('Sonho removido');
  };

  const migrateUncompletedTasksToNextDay = (dateStr: string) => {
    const targetItems = items.filter(
      item =>
        item.date === dateStr &&
        item.type === 'task' &&
        item.status !== 'completed' &&
        item.status !== 'cancelled' &&
        item.status !== 'migrated'
    );
    if (targetItems.length === 0) {
      showToast('Nenhuma tarefa pendente para migrar nesta data!');
      return;
    }

    const d = new Date(dateStr + 'T00:00:00');
    d.setDate(d.getDate() + 1);
    const nextDayStr = getLocalDateString(d);

    // Mark current tasks as migrated
    const updatedItems = items.map(item => {
      if (
        item.date === dateStr &&
        item.type === 'task' &&
        item.status !== 'completed' &&
        item.status !== 'cancelled' &&
        item.status !== 'migrated'
      ) {
        return { ...item, status: 'migrated' as const };
      }
      return item;
    });

    // Duplicate tasks to next day
    const duplicated = targetItems.map(item => ({
      ...item,
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      date: nextDayStr,
      status: 'open' as const
    }));

    setItems([...duplicated, ...updatedItems]);
    showToast(`${targetItems.length} tarefas migradas para amanhã (${nextDayStr.split('-').reverse().slice(0, 2).join('/')})!`);
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
    deleteSubtask,
    migrateUncompletedTasksToNextDay,
    // Lixeira & Someday
    trashItems,
    handleRestoreItem,
    handleDeletePermanently,
    handleEmptyTrash,
    somedayItems,
    handleAddSomedayItem,
    handleDeleteSomedayItem,
    handleScheduleSomedayItem,
    handleToggleSomedayItem,
    handleUpdateSomedayItemCategory,
    handleEditSomedayItemContent,
    // Delegation & Icon
    handleUpdateItemDelegatedTo,
    handleUpdateItemIcon,
    // Dream Board
    dreams,
    handleAddDream,
    handleToggleDreamConquered,
    handleDeleteDream
  };
}
