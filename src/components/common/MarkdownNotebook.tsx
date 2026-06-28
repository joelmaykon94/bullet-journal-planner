import { useState, useEffect, useRef, useCallback } from 'react';

// ── Types ───────────────────────────────────────────────────────────────────

interface MarkdownNotebookProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

// ── Markdown Inline Parser ──────────────────────────────────────────────────

/** Parse inline markdown tokens into HTML string */
function parseInlineMarkdown(text: string): string {
  let html = text;
  html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  html = html.replace(/`([^`]+)`/g, '<code class="mn-inline-code">$1</code>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');
  return html;
}

/** Determine the type and content of a single line */
function parseLine(raw: string): { type: string; content: string; level?: number; checked?: boolean } {
  if (/^---+$/.test(raw.trim())) {
    return { type: 'hr', content: '' };
  }
  const headingMatch = raw.match(/^(#{1,3})\s+(.*)$/);
  if (headingMatch) {
    return { type: 'heading', content: headingMatch[2], level: headingMatch[1].length };
  }
  if (/^\[x\]\s+(.*)$/i.test(raw)) {
    return { type: 'checkbox', content: raw.replace(/^\[x\]\s+/i, ''), checked: true };
  }
  if (/^\[\s?\]\s+(.*)$/.test(raw)) {
    return { type: 'checkbox', content: raw.replace(/^\[\s?\]\s+/, ''), checked: false };
  }
  if (/^-\s+(.*)$/.test(raw)) {
    return { type: 'bullet', content: raw.replace(/^-\s+/, '') };
  }
  if (/^>\s+(.*)$/.test(raw)) {
    return { type: 'quote', content: raw.replace(/^>\s+/, '') };
  }
  if (raw.trim() === '') {
    return { type: 'empty', content: '' };
  }
  return { type: 'paragraph', content: raw };
}

// ── Rendered Line Component ─────────────────────────────────────────────────

function RenderedLine({
  raw,
  lineIndex,
  onClickLine,
  onToggleCheckbox,
}: {
  raw: string;
  lineIndex: number;
  onClickLine: (index: number) => void;
  onToggleCheckbox: (index: number) => void;
}) {
  const parsed = parseLine(raw);

  const handleClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.mn-checkbox')) return;
    onClickLine(lineIndex);
  };

  if (parsed.type === 'hr') {
    return <hr className="mn-hr" onClick={handleClick} />;
  }

  if (parsed.type === 'heading') {
    const headingHtml = parseInlineMarkdown(parsed.content);
    const Tag = `h${parsed.level}` as 'h1' | 'h2' | 'h3';
    return (
      <Tag 
        className={`mn-heading mn-heading-${parsed.level}`}
        dangerouslySetInnerHTML={{ __html: headingHtml }}
        onClick={handleClick}
      />
    );
  }

  if (parsed.type === 'checkbox') {
    return (
      <div className="mn-checkbox-line" onClick={handleClick}>
        <label className="mn-checkbox-label">
          <input
            type="checkbox"
            checked={parsed.checked}
            onChange={() => onToggleCheckbox(lineIndex)}
            className="mn-checkbox"
          />
          <span
            className={parsed.checked ? 'mn-checked-text' : ''}
            dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(parsed.content) }}
          />
        </label>
      </div>
    );
  }

  if (parsed.type === 'bullet') {
    return (
      <div className="mn-bullet-line" onClick={handleClick}>
        <span className="mn-bullet-marker">•</span>
        <span dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(parsed.content) }} />
      </div>
    );
  }

  if (parsed.type === 'quote') {
    return (
      <blockquote
        className="mn-quote"
        dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(parsed.content) }}
        onClick={handleClick}
      />
    );
  }

  if (parsed.type === 'empty') {
    return <div className="mn-empty-line" onClick={handleClick}>&nbsp;</div>;
  }

  return (
    <p className="mn-paragraph" onClick={handleClick}>
      <span dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(parsed.content) }} />
    </p>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────

export function MarkdownNotebook({ value, onChange, placeholder, className }: MarkdownNotebookProps) {
  const [lines, setLines] = useState<string[]>(() => {
    const v = value || '';
    return v === '' ? [''] : v.split('\n');
  });
  const [activeLineIndex, setActiveLineIndex] = useState<number | null>(null);

  const isUserEditingRef = useRef(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRefs = useRef<Map<number, HTMLInputElement>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);
  const isComposingRef = useRef(false);

  const propagateToParent = useCallback(
    (newLines: string[]) => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        onChange(newLines.join('\n'));
      }, 500);
    },
    [onChange]
  );

  useEffect(() => {
    if (isUserEditingRef.current) return;
    const incoming = value || '';
    const newLines = incoming === '' ? [''] : incoming.split('\n');
    setLines(newLines);
  }, [value]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (activeLineIndex !== null) {
      requestAnimationFrame(() => {
        const input = inputRefs.current.get(activeLineIndex);
        if (input) {
          input.focus();
          const len = input.value.length;
          input.setSelectionRange(len, len);
        }
      });
    }
  }, [activeLineIndex]);

  const updateLine = useCallback(
    (index: number, newValue: string) => {
      setLines(prev => {
        const next = [...prev];
        next[index] = newValue;
        propagateToParent(next);
        return next;
      });
    },
    [propagateToParent]
  );

  const toggleCheckbox = useCallback(
    (index: number) => {
      setLines(prev => {
        const next = [...prev];
        const line = next[index];
        if (/^\[x\]\s+/i.test(line)) {
          next[index] = line.replace(/^\[x\]\s+/i, '[] ');
        } else if (/^\[\s?\]\s+/.test(line)) {
          next[index] = line.replace(/^\[\s?\]\s+/, '[x] ');
        }
        propagateToParent(next);
        return next;
      });
    },
    [propagateToParent]
  );

  const handleClickLine = useCallback((index: number) => {
    isUserEditingRef.current = true;
    setActiveLineIndex(index);
  }, []);

  const exitEditMode = useCallback(() => {
    if (activeLineIndex !== null) {
      setLines(prev => {
        let next = [...prev];
        while (next.length > 1 && next[next.length - 1] === '') {
          next.pop();
        }
        if (next.length === 0) next = [''];
        propagateToParent(next);
        return next;
      });
    }
    isUserEditingRef.current = false;
    setActiveLineIndex(null);
  }, [activeLineIndex, propagateToParent]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
      const input = e.currentTarget;

      if (isComposingRef.current) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        exitEditMode();
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        const pos = input.selectionStart ?? input.value.length;
        const before = input.value.slice(0, pos);
        const after = input.value.slice(pos);
        
        setLines(prev => {
          const next = [...prev];
          next[index] = before;
          next.splice(index + 1, 0, after);
          propagateToParent(next);
          return next;
        });
        
        setActiveLineIndex(index + 1);
        isUserEditingRef.current = true;
        return;
      }

      if (e.key === 'Backspace' && input.value === '' && index > 0) {
        e.preventDefault();
        setLines(prev => {
          const next = [...prev];
          next.splice(index, 1);
          propagateToParent(next);
          return next;
        });
        setActiveLineIndex(index - 1);
        isUserEditingRef.current = true;
        return;
      }

      if (e.key === 'ArrowUp' && index > 0) {
        e.preventDefault();
        setActiveLineIndex(index - 1);
        isUserEditingRef.current = true;
        return;
      }

      if (e.key === 'ArrowDown' && index < lines.length - 1) {
        e.preventDefault();
        setActiveLineIndex(index + 1);
        isUserEditingRef.current = true;
        return;
      }

      if (e.key === 'Tab' && input.selectionStart === input.value.length) {
        e.preventDefault();
        setLines(prev => {
          const next = [...prev];
          next.splice(index + 1, 0, '');
          propagateToParent(next);
          return next;
        });
        setActiveLineIndex(index + 1);
        isUserEditingRef.current = true;
        return;
      }
    },
    [lines.length, propagateToParent, exitEditMode]
  );

  const handleInputFocus = useCallback((index: number) => {
    isUserEditingRef.current = true;
    setActiveLineIndex(index);
  }, []);

  const handleCompositionStart = useCallback(() => {
    isComposingRef.current = true;
  }, []);

  const handleCompositionEnd = useCallback(() => {
    isComposingRef.current = false;
  }, []);

  const handleContainerClick = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      
      if (target === containerRef.current || 
          target.classList.contains('mn-container') ||
          target.classList.contains('mn-placeholder')) {
        
        if (activeLineIndex !== null) return;
        
        const lastIndex = lines.length - 1;
        const lastLine = lines[lastIndex];
        
        if (lastLine === '') {
          handleClickLine(lastIndex);
        } else {
          setLines(prev => {
            const next = [...prev, ''];
            propagateToParent(next);
            return next;
          });
          setActiveLineIndex(lines.length);
          isUserEditingRef.current = true;
        }
      }
    },
    [lines, activeLineIndex, handleClickLine, propagateToParent]
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        exitEditMode();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [exitEditMode]);

  const showPlaceholder = lines.length <= 1 && lines[0] === '' && activeLineIndex === null;

  return (
    <div className={`mn-notebook ${className || ''}`} ref={containerRef} onClick={handleContainerClick}>
      <style>{markdownNotebookStyles}</style>
      <div className="mn-container">
        {showPlaceholder && (
          <div className="mn-placeholder" onClick={() => handleClickLine(0)}>
            {placeholder || 'Start typing...'}
          </div>
        )}
        {lines.map((line, i) => {
          if (activeLineIndex === i) {
            return (
              <div key={`edit-${i}`} className="mn-line-editing">
                <div className="mn-cursor-line" />
                <input
                  ref={(el) => {
                    if (el) inputRefs.current.set(i, el);
                    else inputRefs.current.delete(i);
                  }}
                  type="text"
                  value={line}
                  onChange={(e) => updateLine(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, i)}
                  onFocus={() => handleInputFocus(i)}
                  onCompositionStart={handleCompositionStart}
                  onCompositionEnd={handleCompositionEnd}
                  className="mn-input"
                  spellCheck={false}
                  autoComplete="off"
                />
              </div>
            );
          }
          if (showPlaceholder && i === 0) return null;
          return (
            <RenderedLine
              key={`render-${i}`}
              raw={line}
              lineIndex={i}
              onClickLine={handleClickLine}
              onToggleCheckbox={toggleCheckbox}
            />
          );
        })}
      </div>
    </div>
  );
}

// ── Clean, Modern Styles ────────────────────────────────────────────────────

const markdownNotebookStyles = `
  /* ── Container ─────────────────────────────────────── */
  .mn-notebook {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 20px 24px;
    min-height: 200px;
    max-height: 600px;
    overflow-y: auto;
    overflow-x: hidden;
    cursor: text;
    transition: all 0.15s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
    line-height: 1.6;
  }

  .mn-notebook:hover {
    border-color: #d1d5db;
  }

  .mn-notebook:focus-within {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.08);
  }

  /* Dark mode */
  @media (prefers-color-scheme: dark) {
    .mn-notebook {
      background: #111827;
      border-color: #374151;
    }
    .mn-notebook:hover {
      border-color: #4b5563;
    }
    .mn-notebook:focus-within {
      border-color: #60a5fa;
      box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);
    }
  }

  .mn-container {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  /* ── Placeholder ─────────────────────────────────── */
  .mn-placeholder {
    color: #9ca3af;
    font-size: 14px;
    cursor: text;
    user-select: none;
    padding: 2px 0;
  }

  @media (prefers-color-scheme: dark) {
    .mn-placeholder {
      color: #6b7280;
    }
  }

  /* ── Editing Line ────────────────────────────────── */
  .mn-line-editing {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 2px 0;
    border-radius: 4px;
    background: #f3f4f6;
    margin: 0 -8px;
    padding: 2px 8px;
  }

  @media (prefers-color-scheme: dark) {
    .mn-line-editing {
      background: #1f2937;
    }
  }

  .mn-cursor-line {
    width: 2px;
    height: 20px;
    background: #3b82f6;
    border-radius: 1px;
    flex-shrink: 0;
    animation: mn-blink 1s step-end infinite;
  }

  @keyframes mn-blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }

  .mn-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: inherit;
    font: inherit;
    font-size: 14px;
    padding: 0;
    min-width: 0;
    caret-color: #3b82f6;
  }

  .mn-input::selection {
    background: #bfdbfe;
  }

  @media (prefers-color-scheme: dark) {
    .mn-input::selection {
      background: #1e3a5f;
    }
  }

  /* ── Rendered Lines ───────────────────────────────── */
  .mn-paragraph {
    margin: 0;
    padding: 2px 0;
    font-size: 14px;
    color: #111827;
    cursor: pointer;
    border-radius: 4px;
    padding: 2px 8px;
    margin: 0 -8px;
    transition: background 0.1s ease;
  }

  .mn-paragraph:hover {
    background: #f9fafb;
  }

  @media (prefers-color-scheme: dark) {
    .mn-paragraph {
      color: #f3f4f6;
    }
    .mn-paragraph:hover {
      background: #1f2937;
    }
  }

  /* ── Headings ────────────────────────────────────── */
  .mn-heading {
    margin: 4px 0;
    padding: 2px 8px;
    margin: 2px -8px;
    cursor: pointer;
    border-radius: 4px;
    transition: background 0.1s ease;
    font-weight: 600;
    letter-spacing: -0.02em;
  }

  .mn-heading:hover {
    background: #f9fafb;
  }

  .mn-heading-1 {
    font-size: 24px;
    line-height: 1.3;
    color: #111827;
  }

  .mn-heading-2 {
    font-size: 20px;
    line-height: 1.3;
    color: #1f2937;
  }

  .mn-heading-3 {
    font-size: 18px;
    line-height: 1.3;
    color: #374151;
  }

  @media (prefers-color-scheme: dark) {
    .mn-heading:hover {
      background: #1f2937;
    }
    .mn-heading-1 {
      color: #f9fafb;
    }
    .mn-heading-2 {
      color: #f3f4f6;
    }
    .mn-heading-3 {
      color: #e5e7eb;
    }
  }

  /* ── Checkbox ────────────────────────────────────── */
  .mn-checkbox-line {
    display: flex;
    align-items: center;
    padding: 2px 8px;
    margin: 0 -8px;
    cursor: pointer;
    border-radius: 4px;
    transition: background 0.1s ease;
  }

  .mn-checkbox-line:hover {
    background: #f9fafb;
  }

  @media (prefers-color-scheme: dark) {
    .mn-checkbox-line:hover {
      background: #1f2937;
    }
  }

  .mn-checkbox-label {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    font-size: 14px;
    color: #111827;
    width: 100%;
  }

  @media (prefers-color-scheme: dark) {
    .mn-checkbox-label {
      color: #f3f4f6;
    }
  }

  .mn-checkbox {
    width: 16px;
    height: 16px;
    accent-color: #3b82f6;
    cursor: pointer;
    flex-shrink: 0;
    border-radius: 4px;
    border: 2px solid #d1d5db;
    transition: all 0.1s ease;
  }

  .mn-checkbox:checked {
    border-color: #3b82f6;
  }

  .mn-checked-text {
    text-decoration: line-through;
    opacity: 0.5;
  }

  /* ── Bullet ──────────────────────────────────────── */
  .mn-bullet-line {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 2px 8px;
    margin: 0 -8px;
    cursor: pointer;
    border-radius: 4px;
    transition: background 0.1s ease;
    font-size: 14px;
    color: #111827;
  }

  .mn-bullet-line:hover {
    background: #f9fafb;
  }

  @media (prefers-color-scheme: dark) {
    .mn-bullet-line {
      color: #f3f4f6;
    }
    .mn-bullet-line:hover {
      background: #1f2937;
    }
  }

  .mn-bullet-marker {
    color: #6b7280;
    font-weight: 400;
    flex-shrink: 0;
    margin-top: 1px;
  }

  @media (prefers-color-scheme: dark) {
    .mn-bullet-marker {
      color: #9ca3af;
    }
  }

  /* ── Quote ───────────────────────────────────────── */
  .mn-quote {
    margin: 4px 0;
    padding: 4px 12px;
    padding-left: 20px;
    border-left: 3px solid #e5e7eb;
    color: #6b7280;
    font-size: 14px;
    font-style: italic;
    cursor: pointer;
    border-radius: 0 4px 4px 0;
    transition: background 0.1s ease;
    margin: 2px -8px;
    padding: 2px 8px 2px 20px;
  }

  .mn-quote:hover {
    background: #f9fafb;
  }

  @media (prefers-color-scheme: dark) {
    .mn-quote {
      border-left-color: #374151;
      color: #9ca3af;
    }
    .mn-quote:hover {
      background: #1f2937;
    }
  }

  /* ── Horizontal Rule ─────────────────────────────── */
  .mn-hr {
    border: none;
    border-top: 1px solid #e5e7eb;
    margin: 8px 0;
    cursor: pointer;
    padding: 2px 0;
    transition: border-color 0.1s ease;
  }

  .mn-hr:hover {
    border-top-color: #d1d5db;
  }

  @media (prefers-color-scheme: dark) {
    .mn-hr {
      border-top-color: #374151;
    }
    .mn-hr:hover {
      border-top-color: #4b5563;
    }
  }

  /* ── Empty Line ──────────────────────────────────── */
  .mn-empty-line {
    min-height: 24px;
    padding: 2px 8px;
    margin: 0 -8px;
    cursor: pointer;
    border-radius: 4px;
    transition: background 0.1s ease;
  }

  .mn-empty-line:hover {
    background: #f9fafb;
  }

  @media (prefers-color-scheme: dark) {
    .mn-empty-line:hover {
      background: #1f2937;
    }
  }

  /* ── Inline Code ─────────────────────────────────── */
  .mn-inline-code {
    background: #f3f4f6;
    border-radius: 4px;
    padding: 1px 6px;
    font-size: 13px;
    font-family: 'SF Mono', 'Menlo', 'Monaco', 'Consolas', monospace;
    color: #dc2626;
  }

  @media (prefers-color-scheme: dark) {
    .mn-inline-code {
      background: #1f2937;
      color: #f87171;
    }
  }

  /* ── Scrollbar ───────────────────────────────────── */
  .mn-notebook::-webkit-scrollbar {
    width: 6px;
  }

  .mn-notebook::-webkit-scrollbar-track {
    background: transparent;
  }

  .mn-notebook::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 3px;
  }

  .mn-notebook::-webkit-scrollbar-thumb:hover {
    background: #9ca3af;
  }

  @media (prefers-color-scheme: dark) {
    .mn-notebook::-webkit-scrollbar-thumb {
      background: #4b5563;
    }
    .mn-notebook::-webkit-scrollbar-thumb:hover {
      background: #6b7280;
    }
  }

  /* ── Selection ───────────────────────────────────── */
  .mn-notebook ::selection {
    background: #bfdbfe;
  }

  @media (prefers-color-scheme: dark) {
    .mn-notebook ::selection {
      background: #1e3a5f;
    }
  }
`;