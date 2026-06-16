import { getLocalDateString } from './plannerUtils';

export interface ParsedSmartTask {
  cleanContent: string;
  date?: string; // YYYY-MM-DD
  time?: string; // HH:MM
  priority?: boolean;
  energy?: number;
  complexity?: number;
}

export const parseSmartTask = (input: string, referenceDate: string = getLocalDateString()): ParsedSmartTask => {
  let cleanContent = input;
  let date: string | undefined = undefined;
  let time: string | undefined = undefined;
  let priority: boolean | undefined = undefined;
  let energy: number | undefined = undefined;
  let complexity: number | undefined = undefined;

  const refDateObj = new Date(referenceDate + 'T00:00:00');

  // --- 1. Parsing Priorities ---
  // Matches "p1", "p2", "p3", "p4" at word boundaries
  const priorityRegex = /\bp[1-4]\b/i;
  const priorityMatch = cleanContent.match(priorityRegex);
  
  if (priorityMatch) {
    const pVal = priorityMatch[0].toLowerCase();
    switch (pVal) {
      case 'p1':
        priority = true;
        energy = 5;
        complexity = 5;
        break;
      case 'p2':
        priority = true;
        energy = 4;
        complexity = 4;
        break;
      case 'p3':
        priority = false;
        energy = 3;
        complexity = 3;
        break;
      case 'p4':
        priority = false;
        energy = 2;
        complexity = 2;
        break;
    }
    cleanContent = cleanContent.replace(priorityRegex, '').trim();
  }

  // --- 2. Parsing Times ---
  // Matches "às 15h", "as 15:30", "15:00", "15h"
  const timeRegex = /(?:às|as)?\s*([0-2]?[0-9])[:h]([0-5][0-9])?/i;
  const timeMatch = cleanContent.match(timeRegex);

  if (timeMatch) {
    const hours = timeMatch[1].padStart(2, '0');
    const minutes = timeMatch[2] ? timeMatch[2].padStart(2, '0') : '00';
    time = `${hours}:${minutes}`;
    cleanContent = cleanContent.replace(timeRegex, '').trim();
  }

  // --- 3. Parsing Dates ---
  
  // Helper to add days to ref date
  const addDays = (days: number): string => {
    const d = new Date(refDateObj);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  // Helper to get next weekday
  const getNextDayOfWeek = (dayIndex: number): string => {
    const d = new Date(refDateObj);
    const currentDay = d.getDay();
    let diff = dayIndex - currentDay;
    if (diff <= 0) {
      diff += 7; // Next week
    }
    return addDays(diff);
  };

  // 3.1 Relative Dates
  const relativeMatch = cleanContent.match(/\b(hoje|amanhã|amanha|depois de amanhã|depois de amanha)\b/i);
  if (relativeMatch) {
    const word = relativeMatch[1].toLowerCase();
    if (word === 'hoje') {
      date = referenceDate;
    } else if (word === 'amanhã' || word === 'amanha') {
      date = addDays(1);
    } else if (word === 'depois de amanhã' || word === 'depois de amanha') {
      date = addDays(2);
    }
    cleanContent = cleanContent.replace(relativeMatch[0], '').trim();
  }

  // 3.2 "Daqui a X dias"
  if (!date) {
    const inXDaysMatch = cleanContent.match(/daqui a (\d+) dias?/i);
    if (inXDaysMatch) {
      const days = parseInt(inXDaysMatch[1], 10);
      date = addDays(days);
      cleanContent = cleanContent.replace(inXDaysMatch[0], '').trim();
    }
  }

  // 3.3 Weekdays
  if (!date) {
    const weekdaysRegex = /\b(segunda|terça|terca|quarta|quinta|sexta|sábado|sabado|domingo)(?:-feira)?\b/i;
    const weekdayMatch = cleanContent.match(weekdaysRegex);
    if (weekdayMatch) {
      const dayStr = weekdayMatch[1].toLowerCase();
      let dayIndex = 0;
      switch (dayStr) {
        case 'domingo': dayIndex = 0; break;
        case 'segunda': dayIndex = 1; break;
        case 'terça':
        case 'terca': dayIndex = 2; break;
        case 'quarta': dayIndex = 3; break;
        case 'quinta': dayIndex = 4; break;
        case 'sexta': dayIndex = 5; break;
        case 'sábado':
        case 'sabado': dayIndex = 6; break;
      }
      date = getNextDayOfWeek(dayIndex);
      cleanContent = cleanContent.replace(weekdayMatch[0], '').trim();
    }
  }

  // Cleanup double spaces and common leftover prepositions if needed
  cleanContent = cleanContent.replace(/\s{2,}/g, ' ').replace(/\b(para|para o dia|no dia)\s*$/i, '').trim();

  return {
    cleanContent,
    date,
    time,
    priority,
    energy,
    complexity
  };
};