import { useState, useEffect } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import { BujoItem } from '../types';

export function useCollections(
  collections: any[],
  setCollections: React.Dispatch<React.SetStateAction<any[]>>,
  setItems: React.Dispatch<React.SetStateAction<BujoItem[]>>,
  showToast: (msg: string) => void,
  aiEngine: 'local_llm' | 'local',
  localLLMState: string,
  aiWorkerRef: React.MutableRefObject<Worker | null>,
  initLocalLLMWorker: () => void,
  setActiveTab: React.Dispatch<React.SetStateAction<any>>,
  setActiveLLMCollectionItemId: React.Dispatch<React.SetStateAction<string | null>>
) {
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // Form states for creating collection
  const [showCreateCollectionModal, setShowCreateCollectionModal] = useState(false);
  const [newColName, setNewColName] = useState('');
  const [newColDesc, setNewColDesc] = useState('');
  const [newColIcon, setNewColIcon] = useState('📚');

  // Form states for creating collection item
  const [newColItemTitle, setNewColItemTitle] = useState('');
  const [newColItemNotes, setNewColItemNotes] = useState('');
  const [decomposingCollectionItemIds, setDecomposingCollectionItemIds] = useState<{ [key: string]: boolean }>({});

  const handleReorderCollections = (activeId: string, overId: string) => {
    setCollections(prev => {
      const oldIndex = prev.findIndex(c => c.id === activeId);
      const newIndex = prev.findIndex(c => c.id === overId);
      if (oldIndex === -1 || newIndex === -1) return prev;
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  const handleReorderCollectionItems = (colId: string, activeId: string, overId: string) => {
    setCollections(prev => prev.map(col => {
      if (col.id !== colId) return col;
      const oldIndex = col.items.findIndex((i: any) => i.id === activeId);
      const newIndex = col.items.findIndex((i: any) => i.id === overId);
      if (oldIndex === -1 || newIndex === -1) return col;
      return {
        ...col,
        items: arrayMove(col.items, oldIndex, newIndex)
      };
    }));
  };

  const handleReorderCollectionSubtasks = (colId: string, itemId: string, activeId: string, overId: string) => {
    setCollections(prev => prev.map(col => {
      if (col.id !== colId) return col;
      return {
        ...col,
        items: col.items.map((it: any) => {
          if (it.id !== itemId || !it.subtasks) return it;
          const oldIndex = it.subtasks.findIndex((s: any) => s.id === activeId);
          const newIndex = it.subtasks.findIndex((s: any) => s.id === overId);
          if (oldIndex === -1 || newIndex === -1) return it;
          return {
            ...it,
            subtasks: arrayMove(it.subtasks, oldIndex, newIndex)
          };
        })
      };
    }));
  };

  const handleCreateCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) return;

    const newCol = {
      id: `col-${Date.now()}`,
      name: newColName.trim(),
      description: newColDesc.trim(),
      icon: newColIcon,
      items: []
    };

    setCollections(prev => [...prev, newCol]);
    setNewColName('');
    setNewColDesc('');
    setNewColIcon('📚');
    setShowCreateCollectionModal(false);
    showToast(`Coleção "${newCol.name}" criada!`);
  };

  const handleCreateCollectionItem = (colId: string, icon?: string) => {
    if (!newColItemTitle.trim()) return;

    const newItem = {
      id: `item-${Date.now()}-${Math.random()}`,
      title: newColItemTitle.trim(),
      status: 'todo' as const,
      notes: newColItemNotes.trim(),
      media: [],
      subtasks: [],
      icon: icon || undefined
    };

    setCollections(prev => prev.map(col => {
      if (col.id === colId) {
        return { ...col, items: [...col.items, newItem] };
      }
      return col;
    }));

    setNewColItemTitle('');
    setNewColItemNotes('');
    showToast('Item adicionado à lista');
  };

  const handleDeleteCollectionItem = (colId: string, itemId: string) => {
    setCollections(prev => prev.map(col => {
      if (col.id === colId) {
        return { ...col, items: col.items.filter((item: any) => item.id !== itemId) };
      }
      return col;
    }));
    setSelectedItemId(null);
    showToast('Item excluído da lista');
  };

  const handleUpdateCollectionItemStatus = (colId: string, itemId: string, newStatus: 'todo' | 'doing' | 'done') => {
    setCollections(prev => prev.map(col => {
      if (col.id === colId) {
        return {
          ...col,
          items: col.items.map((item: any) => {
            if (item.id === itemId) {
              return { ...item, status: newStatus };
            }
            return item;
          })
        };
      }
      return col;
    }));
  };

  const handleAddCollectionItemSubtask = (colId: string, itemId: string, subtaskText: string, icon?: string) => {
    if (!subtaskText.trim()) return;
    setCollections(prev => prev.map(col => {
      if (col.id === colId) {
        return {
          ...col,
          items: col.items.map((item: any) => {
            if (item.id === itemId) {
              const sub = item.subtasks || [];
              return {
                ...item,
                subtasks: [...sub, { id: `col-sub-${Date.now()}-${Math.random()}`, content: subtaskText.trim(), completed: false, icon }]
              };
            }
            return item;
          })
        };
      }
      return col;
    }));
  };

  const handleToggleCollectionItemSubtask = (colId: string, itemId: string, subtaskId: string) => {
    setCollections(prev => prev.map(col => {
      if (col.id === colId) {
        return {
          ...col,
          items: col.items.map((item: any) => {
            if (item.id === itemId && item.subtasks) {
              return {
                ...item,
                subtasks: item.subtasks.map((s: any) => {
                  if (s.id === subtaskId) {
                    return { ...s, completed: !s.completed };
                  }
                  return s;
                })
              };
            }
            return item;
          })
        };
      }
      return col;
    }));
  };

  const handleDeleteCollectionItemSubtask = (colId: string, itemId: string, subtaskId: string) => {
    setCollections(prev => prev.map(col => {
      if (col.id === colId) {
        return {
          ...col,
          items: col.items.map((item: any) => {
            if (item.id === itemId && item.subtasks) {
              return {
                ...item,
                subtasks: item.subtasks.filter((s: any) => s.id !== subtaskId)
              };
            }
            return item;
          })
        };
      }
      return col;
    }));
  };

  const handleUploadCollectionItemMedia = (colId: string, itemId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fakeUrl = URL.createObjectURL(file);
    const newMedia = {
      id: `media-${Date.now()}`,
      type: 'image' as const,
      name: file.name,
      url: fakeUrl
    };

    setCollections(prev => prev.map(col => {
      if (col.id === colId) {
        return {
          ...col,
          items: col.items.map((item: any) => {
            if (item.id === itemId) {
              const existingMedia = item.media || [];
              return { ...item, media: [...existingMedia, newMedia] };
            }
            return item;
          })
        };
      }
      return col;
    }));
    showToast('Imagem anexada localmente.');
  };

  const handleAddCollectionItemMediaLink = (
    colId: string,
    itemId: string,
    mediaLinkName: string,
    setMediaLinkName: React.Dispatch<React.SetStateAction<string>>,
    mediaLinkUrl: string,
    setMediaLinkUrl: React.Dispatch<React.SetStateAction<string>>,
    setShowAddMediaLink: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    if (!mediaLinkName.trim() || !mediaLinkUrl.trim()) return;

    const newMedia = {
      id: `media-${Date.now()}`,
      type: 'link' as const,
      name: mediaLinkName.trim(),
      url: mediaLinkUrl.trim()
    };

    setCollections(prev => prev.map(col => {
      if (col.id === colId) {
        return {
          ...col,
          items: col.items.map((item: any) => {
            if (item.id === itemId) {
              const existingMedia = item.media || [];
              return { ...item, media: [...existingMedia, newMedia] };
            }
            return item;
          })
        };
      }
      return col;
    }));

    setMediaLinkName('');
    setMediaLinkUrl('');
    setShowAddMediaLink(false);
    showToast('Link adicionado.');
  };

  const handleDeleteCollectionItemMedia = (colId: string, itemId: string, mediaId: string) => {
    setCollections(prev => prev.map(col => {
      if (col.id === colId) {
        return {
          ...col,
          items: col.items.map((item: any) => {
            if (item.id === itemId && item.media) {
              return { ...item, media: item.media.filter((m: any) => m.id !== mediaId) };
            }
            return item;
          })
        };
      }
      return col;
    }));
    showToast('Mídia removida.');
  };

  const migrateCollectionItemToDailyLog = (item: any, collectionName: string) => {
    const newItem: BujoItem = {
      id: `migrated-${Date.now()}`,
      type: 'task',
      status: 'open',
      content: `[${collectionName}] ${item.title}`,
      date: new Date().toISOString().split('T')[0],
      subtasks: (item.subtasks || []).map((st: any) => ({
        id: `st-${Date.now()}-${Math.random()}`,
        content: st.content,
        completed: st.completed
      }))
    };

    setItems(prev => [newItem, ...prev]);
    showToast(`"${item.title}" migrado para o Daily Log!`);
  };

  const handleAICollectionItemDecompose = async (collectionId: string, itemId: string, content: string) => {
    setDecomposingCollectionItemIds(prev => ({ ...prev, [itemId]: true }));
    showToast('IA analisando e elaborando passos...');

    if (aiEngine === 'local_llm') {
      if (localLLMState !== 'ready') {
        initLocalLLMWorker();
        showToast('IA Local carregando... Aguarde o download do modelo (~350MB, apenas na primeira vez).');
        setDecomposingCollectionItemIds(prev => ({ ...prev, [itemId]: false }));
        setActiveTab('settings');
        setTimeout(() => {
          const el = document.getElementById('local-llm-activation-center');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 150);
        return;
      }

      setActiveLLMCollectionItemId(itemId);
      if (aiWorkerRef.current) {
        aiWorkerRef.current.postMessage({
          type: 'generate',
          data: { text: content }
        });
      }
      return;
    }

    let steps: string[] = [];
    const lower = content.toLowerCase();
    if (lower.includes('quarkus') || lower.includes('api') || lower.includes('backend') || lower.includes('programar')) {
      steps = [
        'Acessar code.quarkus.io para gerar o esqueleto',
        'Importar o projeto na IDE (VS Code ou IntelliJ)',
        'Configurar banco de dados no application.properties',
        'Criar modelo/entidade de dados usando Panache',
        'Implementar recurso/resource REST básico',
        'Executar quarkus dev e testar no navegador ou Postman'
      ];
    } else if (lower.includes('tdah') || lower.includes('hiperfoco') || lower.includes('foco') || lower.includes('estudar')) {
      steps = [
        'Sentar confortavelmente e beber um copo de água',
        'Silenciar notificações do celular por 25 minutos',
        'Ler apenas o primeiro parágrafo/seção para começar',
        'Escrever 3 palavras-chave sobre o que acabou de ler',
        'Fazer uma pausa rápida de 5 minutos'
      ];
    } else if (lower.includes('design') || lower.includes('mockup') || lower.includes('arte') || lower.includes('falar')) {
      steps = [
        'Pesquisar 3 referências visuais no Dribbble ou Pinterest',
        'Rascunhar a estrutura básica no papel em 2 minutos',
        'Abrir ferramenta de design (Figma ou Canva)',
        'Definir paleta de cores principal',
        'Criar a primeira tela/componente principal'
      ];
    } else {
      steps = [
        'Definir o objetivo principal em uma única frase',
        'Separar os materiais ou ferramentas necessárias',
        'Executar a primeira ação simples de 2 minutos',
        'Revisar o progresso inicial',
        'Anotar o próximo passo curto'
      ];
    }

    setCollections(prevCollections => {
      return prevCollections.map(col => {
        if (col.id === collectionId) {
          return {
            ...col,
            items: col.items.map((item: any) => {
              if (item.id === itemId) {
                const newSubtasks = [
                  ...(item.subtasks || []),
                  ...steps.map((step: string, idx: number) => ({
                    id: `col-sub-${Date.now()}-${idx}-${Math.random()}`,
                    content: step,
                    completed: false
                  }))
                ];
                return { ...item, subtasks: newSubtasks };
              }
              return item;
            })
          };
        }
        return col;
      });
    });

    setDecomposingCollectionItemIds(prev => ({ ...prev, [itemId]: false }));
  };

  return {
    collections,
    setCollections,
    selectedCollectionId,
    setSelectedCollectionId,
    selectedItemId,
    setSelectedItemId,
    showCreateCollectionModal,
    setShowCreateCollectionModal,
    newColName,
    setNewColName,
    newColDesc,
    setNewColDesc,
    newColIcon,
    setNewColIcon,
    newColItemTitle,
    setNewColItemTitle,
    newColItemNotes,
    setNewColItemNotes,
    decomposingCollectionItemIds,
    setDecomposingCollectionItemIds,
    handleCreateCollection,
    handleCreateCollectionItem,
    handleDeleteCollectionItem,
    handleUpdateCollectionItemStatus,
    handleAddCollectionItemSubtask,
    handleToggleCollectionItemSubtask,
    handleDeleteCollectionItemSubtask,
    handleUploadCollectionItemMedia,
    handleAddCollectionItemMediaLink,
    handleDeleteCollectionItemMedia,
    migrateCollectionItemToDailyLog,
    handleAICollectionItemDecompose,
    handleReorderCollections,
    handleReorderCollectionItems,
    handleReorderCollectionSubtasks
  };
}
