import { useState, useEffect } from 'react';

export function usePomodoroTimer(
  setUserXp: React.Dispatch<React.SetStateAction<number>>,
  showToast: (msg: string) => void
) {
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60);
  const [pomodoroRunning, setPomodoroRunning] = useState(false);
  const [pomodoroMode, setPomodoroMode] = useState<'work' | 'break'>('work');
  
  const [completedPomodoros, setCompletedPomodoros] = useState<number>(() => {
    const saved = localStorage.getItem('bujo_focus_completed_pomodoros');
    return saved ? parseInt(saved, 10) : 1;
  });

  useEffect(() => {
    localStorage.setItem('bujo_focus_completed_pomodoros', completedPomodoros.toString());
  }, [completedPomodoros]);

  const playBeep = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(660, ctx.currentTime); // E5 note
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    let interval: any = null;
    if (pomodoroRunning && pomodoroTime > 0) {
      interval = setInterval(() => {
        setPomodoroTime(prev => prev - 1);
      }, 1000);
    } else if (pomodoroTime === 0) {
      setPomodoroRunning(false);
      playBeep();
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
      
      if (pomodoroMode === 'work') {
        showToast('🎯 Bloco de Trabalho Concluído! Descanse um pouco.');
        setCompletedPomodoros(prev => prev + 1);
        setUserXp(prevXp => {
          const nextXp = prevXp + 50;
          showToast('🎯 Hiperfoco Concluído: +50 XP!');
          return nextXp;
        });
        setPomodoroMode('break');
        setPomodoroTime(5 * 60);
      } else {
        showToast('⚡ Descanso Concluído! Hora de focar.');
        setPomodoroMode('work');
        setPomodoroTime(25 * 60);
      }
    }
    return () => clearInterval(interval);
  }, [pomodoroRunning, pomodoroTime, pomodoroMode, setUserXp, showToast]);

  return {
    pomodoroTime,
    setPomodoroTime,
    pomodoroRunning,
    setPomodoroRunning,
    pomodoroMode,
    setPomodoroMode,
    completedPomodoros,
    setCompletedPomodoros
  };
}
