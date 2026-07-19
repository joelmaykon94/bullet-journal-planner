"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseSmartTask = exports.getLocalDateString = void 0;
const getLocalDateString = (date) => {
    const d = date || new Date();
    const offset = d.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(d.getTime() - offset)).toISOString().slice(0, 10);
    return localISOTime;
};
exports.getLocalDateString = getLocalDateString;
const parseSmartTask = (input, referenceDate = (0, exports.getLocalDateString)()) => {
    // Normalize to NFC so accented characters typed as combining marks still match our patterns.
    let cleanContent = input.normalize('NFC');
    let date = undefined;
    let endDate = undefined;
    let time = undefined;
    let endTime = undefined;
    let priority = undefined;
    let energy = undefined;
    let complexity = undefined;
    let recurrence = undefined;
    let recurrenceDays = undefined;
    let reminderType = undefined;
    let constantReminder = undefined;
    const refDateObj = new Date(referenceDate + 'T00:00:00');
    const pad2 = (n) => String(n).padStart(2, '0');
    const toISO = (d) => d.toISOString().split('T')[0];
    const WORD_EDGE_PRE = '(^|[^\\p{L}\\p{N}_])';
    const WORD_EDGE_POST = '($|[^\\p{L}\\p{N}_])';
    const replacePreservingEdges = (re) => {
        // Regex must have (pre)(match)(post) capture groups.
        cleanContent = cleanContent.replace(re, '$1$3').trim();
    };
    const addDays = (days) => {
        const d = new Date(refDateObj);
        d.setDate(d.getDate() + days);
        return toISO(d);
    };
    const getNextDayOfWeek = (dayIndex) => {
        const d = new Date(refDateObj);
        const currentDay = d.getDay();
        let diff = dayIndex - currentDay;
        if (diff <= 0)
            diff += 7;
        return addDays(diff);
    };
    const monthMap = {
        janeiro: 0,
        fevereiro: 1,
        'março': 2,
        marco: 2,
        abril: 3,
        maio: 4,
        junho: 5,
        julho: 6,
        agosto: 7,
        setembro: 8,
        outubro: 9,
        novembro: 10,
        dezembro: 11,
    };
    const dayMap = {
        domingo: 0,
        segunda: 1,
        'terça': 2,
        terca: 2,
        quarta: 3,
        quinta: 4,
        sexta: 5,
        'sábado': 6,
        sabado: 6,
    };
    const parseNamedDate = (dayStr, monthStr, yearStr) => {
        const day = Number(dayStr);
        const month = monthMap[monthStr.normalize('NFC').toLowerCase()];
        const year = yearStr ? Number(yearStr) : refDateObj.getFullYear();
        if (!day || month === undefined || !year)
            return undefined;
        const dt = new Date(year, month, day);
        if (Number.isNaN(dt.getTime()))
            return undefined;
        return toISO(dt);
    };
    const parseSlashDate = (dd, mm, yyyy) => {
        const day = Number(dd);
        const month = Number(mm);
        const year = yyyy ? Number(yyyy) : refDateObj.getFullYear();
        if (!day || !month || !year)
            return undefined;
        const dt = new Date(year, month - 1, day);
        if (Number.isNaN(dt.getTime()))
            return undefined;
        return toISO(dt);
    };
    // --- 1) Keywords (priority + reminders) ---
    if (/\bprioridade\b/i.test(cleanContent)) {
        priority = true;
        cleanContent = cleanContent.replace(/\bprioridade\b/gi, '').trim();
    }
    if (/\b(notificar\s+via\s+e-?mail|notificar\s+por\s+e-?mail)\b/i.test(cleanContent)) {
        reminderType = 'email';
        cleanContent = cleanContent.replace(/\b(notificar\s+via\s+e-?mail|notificar\s+por\s+e-?mail)\b/gi, '').trim();
    }
    else if (/\b(notificar|lembra(r)?|lembrar)\b/i.test(cleanContent)) {
        reminderType = 'notification';
        cleanContent = cleanContent.replace(/\b(notificar|lembra(r)?|lembrar)\b/gi, '').trim();
    }
    if (/\balarme\b/i.test(cleanContent)) {
        constantReminder = true;
        cleanContent = cleanContent.replace(/\balarme\b/gi, '').trim();
        if (!reminderType)
            reminderType = 'notification';
    }
    // --- 2) Time range first ---
    // Supports:
    // - "às 19h até 21:30"
    // - "19:00-21:30"
    // - "19h-21h30"
    const timeRangeRegex = /(?:às|as|ás)?\s*([0-2]?\d)(?:(?::([0-5]\d))|(?:h([0-5]\d)?))?\s*(?:at[eé]|a|-|–)\s*([0-2]?\d)(?:(?::([0-5]\d))|(?:h([0-5]\d)?))?/i;
    const tr = cleanContent.match(timeRangeRegex);
    if (tr) {
        const sh = pad2(Number(tr[1]));
        const smRaw = tr[2] || tr[3];
        const sm = smRaw ? pad2(Number(smRaw)) : '00';
        const eh = pad2(Number(tr[4]));
        const emRaw = tr[5] || tr[6];
        const em = emRaw ? pad2(Number(emRaw)) : '00';
        time = `${sh}:${sm}`;
        endTime = `${eh}:${em}`;
        cleanContent = cleanContent.replace(timeRangeRegex, '').trim();
    }
    else {
        // Single time
        const timeRegex = /(?:às|as|ás)?\s*([0-2]?[0-9])[:h]([0-5][0-9])?/i;
        const tm = cleanContent.match(timeRegex);
        if (tm) {
            const h = tm[1].padStart(2, '0');
            const m = tm[2] ? tm[2].padStart(2, '0') : '00';
            time = `${h}:${m}`;
            cleanContent = cleanContent.replace(timeRegex, '').trim();
        }
    }
    // --- 3) Date range ---
    // "do dia 04 de julho até 10 de julho"
    const namedRangeRegex = /\b(?:do\s+dia\s+)?(\d{1,2})\s+de\s+(janeiro|fevereiro|março|marco|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)(?:\s+de\s+(\d{4}))?\s+at[eé]\s+(\d{1,2})\s+de\s+(janeiro|fevereiro|março|marco|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)(?:\s+de\s+(\d{4}))?\b/i;
    const nr = cleanContent.match(namedRangeRegex);
    if (nr) {
        const start = parseNamedDate(nr[1], nr[2], nr[3]);
        const end = parseNamedDate(nr[4], nr[5], nr[6]);
        if (start && end) {
            date = start;
            endDate = end;
            cleanContent = cleanContent.replace(namedRangeRegex, '').trim();
        }
    }
    // "de 04/07/2026 até 10/07/2026"
    const slashRangeRegex = /\b(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?\s+at[eé]\s+(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?\b/i;
    const sr = cleanContent.match(slashRangeRegex);
    if (!date && sr) {
        const start = parseSlashDate(sr[1], sr[2], sr[3]);
        const end = parseSlashDate(sr[4], sr[5], sr[6]);
        if (start && end) {
            date = start;
            endDate = end;
            cleanContent = cleanContent.replace(slashRangeRegex, '').trim();
        }
    }
    // --- 3.5) Explicit "next weekday" (one-off) ---
    // e.g. "próximo sábado", "proxima terça"
    let forceSingleWeekday = false;
    if (!date) {
        const nextWeekdayRe = new RegExp(`${WORD_EDGE_PRE}(pr[oó]xim[oa])\\s+(?:no\\s+|na\\s+)?(segunda|terça|terca|quarta|quinta|sexta|sábado|sabado|domingo)(?:-feira)?${WORD_EDGE_POST}`, 'iu');
        const m = cleanContent.match(nextWeekdayRe);
        if (m) {
            const dayStr = m[3].normalize('NFC').toLowerCase();
            const idx = dayMap[dayStr];
            if (idx !== undefined) {
                date = getNextDayOfWeek(idx);
                forceSingleWeekday = true;
                cleanContent = cleanContent.replace(nextWeekdayRe, '$1$4').trim();
            }
        }
    }
    // --- 4) Recurrence ---
    const lower = cleanContent.normalize('NFC').toLowerCase();
    if (/\b(todos os dias|diariamente)\b/i.test(lower)) {
        recurrence = 'daily';
        if (!date)
            date = referenceDate;
        cleanContent = cleanContent.replace(/\b(todos os dias|diariamente)\b/gi, '').trim();
    }
    else if (/\b(segunda\s*[aà]\s*sexta)\b/i.test(lower)) {
        recurrence = 'weekdays';
        if (!date)
            date = referenceDate;
        cleanContent = cleanContent.replace(/\b(segunda\s*[aà]\s*sexta)\b/gi, '').trim();
        cleanContent = cleanContent.replace(/\bde\s*$/i, '').trim();
    }
    else if (/\b(semanalmente|toda semana)\b/i.test(lower)) {
        const mentioned = [];
        for (const [name, idx] of Object.entries(dayMap)) {
            if (lower.includes(name))
                mentioned.push(idx);
        }
        if (mentioned.length > 0) {
            recurrence = 'custom-weekly';
            recurrenceDays = [...new Set(mentioned)].sort();
            replacePreservingEdges(new RegExp(`${WORD_EDGE_PRE}(segunda|terça|terca|quarta|quinta|sexta|sábado|sabado|domingo)(?:-feira)?${WORD_EDGE_POST}`, 'giu'));
        }
        else {
            recurrence = 'weekly';
        }
        if (!date)
            date = referenceDate;
        cleanContent = cleanContent.replace(/\b(semanalmente|toda semana)\b/gi, '').trim();
    }
    else if (/\b(mensalmente|todo m[eê]s)\b/i.test(lower)) {
        recurrence = 'monthly';
        if (!date)
            date = referenceDate;
        cleanContent = cleanContent.replace(/\b(mensalmente|todo m[eê]s)\b/gi, '').trim();
    }
    else {
        // Weekday mentions without "semanalmente".
        // Rules:
        // - Multiple weekdays (e.g. "segunda, quarta e sexta") => weekly recurrence on those days.
        // - Single weekday:
        //   - plural or cue words ("às terças", "toda terça") => weekly recurrence
        //   - otherwise => schedule for the next occurrence (one-off)
        if (!forceSingleWeekday) {
            const weekdayMentionRe = new RegExp(`${WORD_EDGE_PRE}(segunda|terça|terca|quarta|quinta|sexta|sábado|sabado|domingo)(?:-feira)?(s)?${WORD_EDGE_POST}`, 'giu');
            const matches = Array.from(cleanContent.matchAll(weekdayMentionRe));
            const mentionedIdx = [];
            const mentionedPlural = [];
            matches.forEach((m) => {
                const dayStr = (m[2] || '').normalize('NFC').toLowerCase();
                const idx = dayMap[dayStr];
                if (idx !== undefined) {
                    mentionedIdx.push(idx);
                    mentionedPlural.push(!!m[3]);
                }
            });
            const uniqueDays = [...new Set(mentionedIdx)].sort();
            if (uniqueDays.length >= 2) {
                recurrence = 'custom-weekly';
                recurrenceDays = uniqueDays;
                cleanContent = cleanContent.replace(weekdayMentionRe, '$1$4').trim();
                if (!date)
                    date = referenceDate;
            }
            else if (uniqueDays.length === 1) {
                const dayIdx = uniqueDays[0];
                const isPlural = mentionedPlural.some(Boolean);
                const hasAsCue = /\b(às|as|aos)\s+(segunda|terça|terca|quarta|quinta|sexta|sábado|sabado|domingo)(?:-feira)?s?\b/iu.test(lower);
                const hasTodaCue = /\b(toda|todo|todas|todos)\s+(segunda|terça|terca|quarta|quinta|sexta|sábado|sabado|domingo)(?:-feira)?s?\b/iu.test(lower);
                if (isPlural || hasAsCue || hasTodaCue) {
                    recurrence = 'custom-weekly';
                    recurrenceDays = [dayIdx];
                    cleanContent = cleanContent.replace(weekdayMentionRe, '$1$4').trim();
                    if (!date)
                        date = referenceDate;
                }
                else {
                    if (!date)
                        date = getNextDayOfWeek(dayIdx);
                    cleanContent = cleanContent.replace(weekdayMentionRe, '$1$4').trim();
                }
            }
        }
    }
    // --- 5) Single-date scheduling (only if date not already set) ---
    if (!date) {
        const relativeRe = new RegExp(`${WORD_EDGE_PRE}(hoje|amanhã|amanha|depois de amanhã|depois de amanha)${WORD_EDGE_POST}`, 'iu');
        const relativeMatch = cleanContent.match(relativeRe);
        if (relativeMatch) {
            const word = relativeMatch[2].normalize('NFC').toLowerCase();
            if (word === 'hoje')
                date = referenceDate;
            else if (word === 'amanhã' || word === 'amanha')
                date = addDays(1);
            else
                date = addDays(2);
            replacePreservingEdges(relativeRe);
        }
    }
    if (!date) {
        const inXDaysMatch = cleanContent.match(/daqui a (\d+) dias?/i);
        if (inXDaysMatch) {
            const days = parseInt(inXDaysMatch[1], 10);
            date = addDays(days);
            cleanContent = cleanContent.replace(inXDaysMatch[0], '').trim();
        }
    }
    if (!date) {
        const weekdaysRegex = new RegExp(`${WORD_EDGE_PRE}(segunda|terça|terca|quarta|quinta|sexta|sábado|sabado|domingo)(?:-feira)?${WORD_EDGE_POST}`, 'iu');
        const weekdayMatch = cleanContent.match(weekdaysRegex);
        if (weekdayMatch) {
            const dayStr = weekdayMatch[2].normalize('NFC').toLowerCase();
            const idx = dayMap[dayStr] ?? 0;
            date = getNextDayOfWeek(idx);
            replacePreservingEdges(weekdaysRegex);
        }
    }
    // Cleanup
    cleanContent = cleanContent
        .replace(/\s{2,}/g, ' ')
        .replace(/\b(para|para o dia|no dia|de|e|,)\s*$/i, '')
        .replace(/(?:^|\s)(às|as)\s*$/i, '')
        .replace(/^(?:\s*(?:de|e|,|;|:)\s*)+/i, '')
        .replace(/^(às|as)\s*/i, '')
        .replace(/^(?:\s*(?:às|as|ás)\s*)+/i, '')
        .replace(/(?:\s*(?:de|e|,|;|:)\s*)+$/i, '')
        .replace(/\s{2,}/g, ' ')
        .trim();
    return {
        cleanContent,
        date,
        endDate,
        time,
        endTime,
        priority,
        energy,
        complexity,
        recurrence,
        recurrenceDays,
        reminderType,
        constantReminder,
    };
};
exports.parseSmartTask = parseSmartTask;
