import React, { useRef, useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';

interface DateInputProps {
  value: string;
  onChange: (val: string) => void;
  className?: string;
  inputClassName?: string;
}

export const DateInput: React.FC<DateInputProps> = ({
  value,
  onChange,
  className = '',
  inputClassName = ''
}) => {
  const [displayValue, setDisplayValue] = useState('');
  const dateInputRef = useRef<HTMLInputElement>(null);

  // Sync state formatting: YYYY-MM-DD -> DD/MM/YYYY
  useEffect(() => {
    if (value) {
      const parts = value.split('-');
      if (parts.length === 3) {
        const [year, month, day] = parts;
        setDisplayValue(`${day}/${month}/${year}`);
      } else {
        setDisplayValue(value);
      }
    } else {
      setDisplayValue('');
    }
  }, [value]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const clean = val.replace(/\D/g, '');
    let formatted = '';
    
    if (clean.length > 0) {
      formatted += clean.slice(0, 2);
    }
    if (clean.length > 2) {
      formatted += '/' + clean.slice(2, 4);
    }
    if (clean.length > 4) {
      formatted += '/' + clean.slice(4, 8);
    }
    
    setDisplayValue(formatted);
    
    // Automatically trigger change when a full valid date is typed
    if (clean.length === 8) {
      const day = clean.slice(0, 2);
      const month = clean.slice(2, 4);
      const year = clean.slice(4, 8);
      
      const d = Number(day);
      const m = Number(month);
      const y = Number(year);
      
      if (d >= 1 && d <= 31 && m >= 1 && m <= 12 && y >= 1000 && y <= 9999) {
        onChange(`${year}-${month}-${day}`);
      }
    }
  };

  const handleBlur = () => {
    // Revert display value if invalid or incomplete
    if (value) {
      const parts = value.split('-');
      if (parts.length === 3) {
        const [year, month, day] = parts;
        setDisplayValue(`${day}/${month}/${year}`);
      }
    } else {
      setDisplayValue('');
    }
  };

  const handleIconClick = () => {
    if (dateInputRef.current) {
      try {
        if (typeof dateInputRef.current.showPicker === 'function') {
          dateInputRef.current.showPicker();
        } else {
          dateInputRef.current.click();
        }
      } catch (err) {
        dateInputRef.current.click();
      }
    }
  };

  return (
    <div className={`relative flex items-center justify-between gap-1.5 ${className}`}>
      <input
        type="text"
        value={displayValue}
        onChange={handleTextChange}
        onBlur={handleBlur}
        placeholder="DD/MM/AAAA"
        className={`bg-transparent border-none text-bujo-text outline-none text-xs font-mono p-0 focus:ring-0 w-20 ${inputClassName}`}
      />
      <button 
        type="button" 
        onClick={handleIconClick} 
        className="hover:opacity-80 transition-opacity flex-shrink-0 cursor-pointer"
        tabIndex={-1}
      >
        <Calendar className="w-3.5 h-3.5 text-zinc-500" />
      </button>
      <input
        ref={dateInputRef}
        type="date"
        value={value || ''}
        onChange={(e) => {
          if (e.target.value) {
            onChange(e.target.value);
          }
        }}
        className="absolute w-0 h-0 opacity-0 pointer-events-none"
        tabIndex={-1}
      />
    </div>
  );
};
