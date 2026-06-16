const fs = require('fs');

const path = 'src/hooks/useBujoItems.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  "import { getLocalDateString, getWeekdaysForDate } from '../utils/plannerUtils';",
  "import { getLocalDateString, getWeekdaysForDate } from '../utils/plannerUtils';\nimport { parseSmartTask } from '../utils/smartParser';"
);

const oldHandleSave = `  // Handle standard log item quick save
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
          id: \`\${idTime}-\${Math.random().toString(36).substring(2, 11)}\`,
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
          delegatedTo: delegatedTo || undefined,
          createdAt: new Date().toISOString()
        };
        itemsToCreate.push(item);
      });
    } else {
      const newItem: BujoItem = {
        id: \`\${Date.now()}-\${Math.random().toString(36).substring(2, 11)}\`,
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
        delegatedTo: delegatedTo || undefined,
        createdAt: new Date().toISOString()
      };
      itemsToCreate.push(newItem);
    }`;

const newHandleSave = `  // Handle standard log item quick save
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

    // Apply Smart NLP Parsing
    const parsed = parseSmartTask(standardInput.trim(), standardDate || selectedDate);
    const content = parsed.cleanContent;

    // Delegation regex extraction
    let delegatedTo = undefined;
    const delegationMatch = content.match(/#([a-zA-ZÀ-ÿ0-9_-]+)/);
    if (delegationMatch) {
      delegatedTo = delegationMatch[1];
    }

    const targetDate = parsed.date || standardDate || selectedDate;
    const finalTime = parsed.time || standardTime || undefined;
    const finalEnergy = parsed.energy || energy || 1;
    const finalComplexity = parsed.complexity || complexity || 1;
    const isPriority = parsed.priority !== undefined ? parsed.priority : undefined;

    const isRecurring = standardType === 'task' && content.toLowerCase().includes('todos os dias');
    
    let itemsToCreate: BujoItem[] = [];
    
    if (isRecurring) {
      const weekdays = getWeekdaysForDate(targetDate);
      weekdays.forEach((wDate, idx) => {
        const idTime = Date.now() + idx;
        const item: BujoItem = {
          id: \`\${idTime}-\${Math.random().toString(36).substring(2, 11)}\`,
          type: 'task',
          status: 'open',
          content: content,
          date: wDate,
          time: finalTime,
          subtasks: [],
          icon: icon || undefined,
          energy: finalEnergy,
          complexity: finalComplexity,
          executionTime: executionTime || undefined,
          delegatedTo: delegatedTo || undefined,
          priority: isPriority,
          createdAt: new Date().toISOString()
        };
        itemsToCreate.push(item);
      });
    } else {
      const newItem: BujoItem = {
        id: \`\${Date.now()}-\${Math.random().toString(36).substring(2, 11)}\`,
        type: standardType,
        status: 'open',
        content: content,
        date: targetDate,
        time: finalTime,
        subtasks: standardType === 'task' ? [] : undefined,
        icon: icon || undefined,
        energy: standardType === 'task' ? finalEnergy : undefined,
        complexity: standardType === 'task' ? finalComplexity : undefined,
        executionTime: standardType === 'task' ? (executionTime || undefined) : undefined,
        delegatedTo: delegatedTo || undefined,
        priority: standardType === 'task' ? isPriority : undefined,
        createdAt: new Date().toISOString()
      };
      itemsToCreate.push(newItem);
    }`;

content = content.replace(oldHandleSave, newHandleSave);
fs.writeFileSync(path, content, 'utf8');