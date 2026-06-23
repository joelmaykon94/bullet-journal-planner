import { useState, useEffect, useRef } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import { BujoItem, DreamItem } from '../types';
import { getLocalDateString, getWeekdaysForDate, extractLinksFromText, deduplicateBujoItems } from '../utils/plannerUtils';
import { parseSmartTask } from '../utils/smartParser';

export function useBujoItems(
  setUserXp: React.Dispatch<React.SetStateAction<number>>,
  setCollections: React.Dispatch<React.SetStateAction<any[]>>,
  showToast: (msg: string) => void
) {
  const [items, setItems] = useState<BujoItem[]>(() => {
    const saved = localStorage.getItem('bujo_focus_items');
    if (saved) return deduplicateBujoItems(JSON.parse(saved));
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
          // Move the task to today
          newItems.push({
            ...item,
            date: todayStr,
            status: item.status === 'scheduled' ? 'open' as const : item.status
          });
        } else {
          newItems.push(item);
        }
      });

      setItems(newItems);
      showToast(`🔄 Auto-migração: ${pastPendingTasks.length} tarefas pendentes trazidas para hoje!`);
    };

    // Run check immediately on mount
    checkAutoMigration();

    // Set up check interval (every 10 seconds)
    const intervalId = setInterval(checkAutoMigration, 10000);
    return () => clearInterval(intervalId);
  }, []);

  // One-time session check to restore mistakenly migrated tasks from tomorrow back to today
  useEffect(() => {
    const todayStr = getLocalDateString();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = getLocalDateString(tomorrow);

    setItems(prev => {
      let changed = false;
      const updated = prev.map(item => {
        if (
          item.type === 'task' &&
          item.date === tomorrowStr &&
          item.status !== 'completed' &&
          item.status !== 'cancelled'
        ) {
          changed = true;
          return { ...item, date: todayStr };
        }
        return item;
      });
      if (changed) {
        showToast("🔄 Sucesso: Tarefas migradas por engano voltaram para hoje!");
        return updated;
      }
      return prev;
    });
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
    executionTime?: number,
    link?: string
  ) => {
    if (!standardInput.trim()) return;

    // Apply Smart NLP Parsing
    const parsed = parseSmartTask(standardInput.trim(), standardDate || selectedDate);
    const content = parsed.cleanContent;

    // Extract links & clean content
    const { cleanContent, links } = extractLinksFromText(content);
    const extractedSubtasks = links.map((lnk, lIdx) => ({
      id: `st-${Date.now()}-${lIdx}-${Math.random().toString(36).substring(2, 5)}`,
      content: lnk,
      completed: false
    }));

    // Delegation regex extraction
    let delegatedTo = undefined;
    const delegationMatch = cleanContent.match(/#([a-zA-ZÀ-ÿ0-9_-]+)/);
    if (delegationMatch) {
      delegatedTo = delegationMatch[1];
    }

    const targetDate = parsed.date || standardDate || selectedDate;
    const finalTime = parsed.time || standardTime || undefined;
    const finalEnergy = parsed.energy || energy || 1;
    const finalComplexity = parsed.complexity || complexity || 1;
    const isPriority = parsed.priority !== undefined ? parsed.priority : undefined;

    const isRecurring = standardType === 'task' && cleanContent.toLowerCase().includes('todos os dias');
    
    let itemsToCreate: BujoItem[] = [];
    
    if (isRecurring) {
      const weekdays = getWeekdaysForDate(targetDate);
      weekdays.forEach((wDate, idx) => {
        const idTime = Date.now() + idx;
        const item: BujoItem = {
          id: `${idTime}-${Math.random().toString(36).substring(2, 11)}`,
          type: 'task',
          status: 'open',
          content: cleanContent,
          date: wDate,
          time: finalTime,
          subtasks: extractedSubtasks,
          icon: icon || '🎯',
          energy: finalEnergy,
          complexity: finalComplexity,
          executionTime: executionTime || undefined,
          delegatedTo: delegatedTo || undefined,
          priority: isPriority,
          link: link || (links.length > 0 ? links[0] : undefined),
          createdAt: new Date().toISOString()
        };
        itemsToCreate.push(item);
      });
    } else {
      const newItem: BujoItem = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        type: standardType,
        status: 'open',
        content: cleanContent,
        date: targetDate,
        time: finalTime,
        subtasks: standardType === 'task' ? extractedSubtasks : undefined,
        icon: icon || (standardType === 'task' ? '🎯' : undefined),
        energy: standardType === 'task' ? finalEnergy : undefined,
        complexity: standardType === 'task' ? finalComplexity : undefined,
        executionTime: standardType === 'task' ? (executionTime || undefined) : undefined,
        delegatedTo: delegatedTo || undefined,
        priority: standardType === 'task' ? isPriority : undefined,
        link: link || (links.length > 0 ? links[0] : undefined),
        createdAt: new Date().toISOString()
      };
      itemsToCreate.push(newItem);
    }

    // Check for collection sync: [Collection Name] some task
    const collectionMatch = cleanContent.match(/^\[(.*?)\]\s*(.*)/);
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
      subtasks: [],
      createdAt: new Date().toISOString()
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
      subtasks: newHourTaskType === 'task' ? [] : undefined,
      createdAt: new Date().toISOString()
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
      setItems(prev => [...prev, itemToRestore]);
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



  // Inline content edit save
  const handleSaveEditItem = (
    id: string,
    editingItemContent: string,
    energy?: number,
    complexity?: number,
    executionTime?: number,
    date?: string,
    time?: string,
    delegatedTo?: string,
    icon?: string,
    link?: string
  ) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const { cleanContent, links } = extractLinksFromText(editingItemContent);
        const newSubtasks = links.map((lnk, lIdx) => ({
          id: `st-${Date.now()}-${lIdx}-${Math.random().toString(36).substring(2, 5)}`,
          content: lnk,
          completed: false
        }));

        // Delegation regex extraction from content if not explicitly provided
        const delegationMatch = cleanContent.match(/#([a-zA-ZÀ-ÿ0-9_-]+)/);
        const autoDelegatedTo = delegationMatch ? delegationMatch[1] : undefined;

        return {
          ...item,
          content: cleanContent,
          energy: item.type === 'task' ? (energy ?? item.energy) : undefined,
          complexity: item.type === 'task' ? (complexity ?? item.complexity) : undefined,
          executionTime: item.type === 'task' ? (executionTime ?? item.executionTime) : undefined,
          delegatedTo: delegatedTo !== undefined ? delegatedTo : (autoDelegatedTo !== undefined ? autoDelegatedTo : item.delegatedTo),
          date: date ?? item.date,
          time: time !== undefined ? time : item.time,
          icon: icon ?? item.icon,
          subtasks: item.type === 'task' ? [...(item.subtasks || []), ...newSubtasks] : undefined,
          link: link !== undefined 
            ? (link.trim() === '' ? undefined : link.trim()) 
            : (links.length > 0 ? links[0] : item.link)
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
    showToast('Responsável atualizado');
  };

  const handleUpdateItemIcon = (id: string, icon: string) => {
    setItems(prev => prev.map(item => {
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

    // Move tasks to next day
    const updatedItems = items.map(item => {
      if (
        item.date === dateStr &&
        item.type === 'task' &&
        item.status !== 'completed' &&
        item.status !== 'cancelled' &&
        item.status !== 'migrated'
      ) {
        return { 
          ...item, 
          date: nextDayStr,
          status: item.status === 'scheduled' ? 'open' as const : item.status
        };
      }
      return item;
    });

    setItems(updatedItems);
    showToast(`${targetItems.length} tarefas migradas para amanhã (${nextDayStr.split('-').reverse().slice(0, 2).join('/')})!`);
  };

  const handleReorderItems = (activeId: string, overId: string) => {
    setItems(prev => {
      const oldIndex = prev.findIndex(i => i.id === activeId);
      const newIndex = prev.findIndex(i => i.id === overId);
      if (oldIndex === -1 || newIndex === -1) return prev;
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  const handleReorderSubtasks = (taskId: string, activeId: string, overId: string) => {
    setItems(prev => prev.map(item => {
      if (item.id !== taskId || !item.subtasks) return item;
      const oldIndex = item.subtasks.findIndex(s => s.id === activeId);
      const newIndex = item.subtasks.findIndex(s => s.id === overId);
      if (oldIndex === -1 || newIndex === -1) return item;
      return {
        ...item,
        subtasks: arrayMove(item.subtasks, oldIndex, newIndex)
      };
    }));
  };

  const handleReorderDreams = (activeId: string, overId: string) => {
    setDreams(prev => {
      const oldIndex = prev.findIndex(i => i.id === activeId);
      const newIndex = prev.findIndex(i => i.id === overId);
      if (oldIndex === -1 || newIndex === -1) return prev;
      return arrayMove(prev, oldIndex, newIndex);
    });
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
    handleReorderItems,
    handleReorderSubtasks,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    migrateUncompletedTasksToNextDay,
    // Lixeira & Someday
    trashItems,
    setTrashItems,
    handleRestoreItem,
    handleDeletePermanently,
    handleEmptyTrash,
    // Delegation & Icon
    handleUpdateItemDelegatedTo,
    handleUpdateItemIcon,
    // Dream Board
    dreams,
    setDreams,
    handleAddDream,
    handleToggleDreamConquered,
    handleDeleteDream,
    handleReorderDreams
  };
}
