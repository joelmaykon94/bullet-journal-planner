import React, { useState, useEffect } from 'react';
import { X, Clock, Zap, Coffee, Moon, Sun, Sparkles, BookOpen, RotateCcw } from 'lucide-react';
import { useBujo } from '../../../context/BujoContext';

interface EnergyRhythmModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/** Original default energy rhythm values — used by the "Restore Defaults" button */
const DEFAULT_RHYTHM = {
  dayStart: '06:00',
  energyPeakStart: '09:30',
  energyPeakEnd: '12:30',
  restStart: '13:30',
  restEnd: '16:00',
  secondWindStart: '16:30',
  secondWindEnd: '20:00',
  dayEnd: '23:00',
} as const;

export const EnergyRhythmModal = ({ isOpen, onClose }: EnergyRhythmModalProps) => {
  const { settings, setSettings, showToast } = useBujo();

  // Local states initialized from settings or defaults
  const [dayStart, setDayStart] = useState('06:00');
  const [energyPeakStart, setEnergyPeakStart] = useState('09:30');
  const [energyPeakEnd, setEnergyPeakEnd] = useState('12:30');
  const [restStart, setRestStart] = useState('13:30');
  const [restEnd, setRestEnd] = useState('16:00');
  const [secondWindStart, setSecondWindStart] = useState('16:30');
  const [secondWindEnd, setSecondWindEnd] = useState('20:00');
  const [dayEnd, setDayEnd] = useState('23:00');

  // Load settings when modal opens
  useEffect(() => {
    if (isOpen && settings) {
      setDayStart(settings.dayStart || '06:00');
      setEnergyPeakStart(settings.energyPeakStart || '09:30');
      setEnergyPeakEnd(settings.energyPeakEnd || '12:30');
      setRestStart(settings.restStart || '13:30');
      setRestEnd(settings.restEnd || '16:00');
      setSecondWindStart(settings.secondWindStart || '16:30');
      setSecondWindEnd(settings.secondWindEnd || '20:00');
      setDayEnd(settings.dayEnd || '23:00');
    }
  }, [isOpen, settings]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSave = () => {
    // Quick time parser to decimal hour
    const toHr = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h + m / 60;
    };

    const ds = toHr(dayStart);
    const eps = toHr(energyPeakStart);
    const epe = toHr(energyPeakEnd);
    const rs = toHr(restStart);
    const re = toHr(restEnd);
    const sws = toHr(secondWindStart);
    const swe = toHr(secondWindEnd);
    const de = toHr(dayEnd);

    // Enforce basic timeline ordering validation
    if (eps < ds) {
      showToast('⚠️ O Pico de Foco deve iniciar após o início do dia.');
      return;
    }
    if (epe <= eps) {
      showToast('⚠️ O Pico de Foco deve terminar após o horário de início.');
      return;
    }
    if (rs < epe) {
      showToast('⚠️ O Vale de Descanso deve iniciar após o Pico de Foco.');
      return;
    }
    if (re <= rs) {
      showToast('⚠️ O Vale de Descanso deve terminar após o início.');
      return;
    }
    if (sws < re) {
      showToast('⚠️ O Segundo Fôlego deve iniciar após o Vale de Descanso.');
      return;
    }
    if (swe <= sws) {
      showToast('⚠️ O Segundo Fôlego deve terminar após o início.');
      return;
    }
    if (de < swe) {
      showToast('⚠️ O final do dia deve ser após o Segundo Fôlego.');
      return;
    }

    setSettings(prev => ({
      ...prev,
      dayStart,
      energyPeakStart,
      energyPeakEnd,
      restStart,
      restEnd,
      secondWindStart,
      secondWindEnd,
      dayEnd
    }));

    showToast('⚡ Ritmo Energético personalizado com sucesso!');
    onClose();
  };

  const handleRestoreDefaults = () => {
    setDayStart(DEFAULT_RHYTHM.dayStart);
    setEnergyPeakStart(DEFAULT_RHYTHM.energyPeakStart);
    setEnergyPeakEnd(DEFAULT_RHYTHM.energyPeakEnd);
    setRestStart(DEFAULT_RHYTHM.restStart);
    setRestEnd(DEFAULT_RHYTHM.restEnd);
    setSecondWindStart(DEFAULT_RHYTHM.secondWindStart);
    setSecondWindEnd(DEFAULT_RHYTHM.secondWindEnd);
    setDayEnd(DEFAULT_RHYTHM.dayEnd);
    showToast('🔄 Valores padrão restaurados. Clique em "Salvar" para aplicar.');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-2 md:p-4 no-print">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-zinc-950 border border-white/10 rounded-[20px] md:rounded-[28px] shadow-3xl overflow-hidden flex flex-col max-h-[85vh] animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-zinc-900/40">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-bujo-highlight/15 text-bujo-highlight border border-bujo-highlight/30">
              <Zap className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white tracking-tight">Personalizar Ritmo Energético</h3>
              <p className="text-[9px] text-zinc-400 font-mono hidden sm:block">Sincronize atividades com suas flutuações de dopamina</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl border border-white/5 hover:border-white/10 hover:bg-white/5 text-zinc-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-3 md:p-4 overflow-y-auto space-y-3 flex-1 text-left">
          
          {/* Intro Tip */}
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex gap-2 text-[10px] md:text-xs leading-relaxed text-zinc-350">
            <Sparkles className="w-4 h-4 text-bujo-highlight shrink-0 mt-0.5" />
            <span>
              <strong className="text-white">💡</strong> Agende tarefas difíceis nos <strong>Picos de Foco</strong> e reserve os <strong>Vales de Crash</strong> para descanso.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            
            {/* 1. Dia Começa */}
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-400" />
                <label className="text-xs font-bold text-white uppercase tracking-wider">Início do Dia</label>
              </div>
              <input
                type="time"
                value={dayStart}
                onChange={e => setDayStart(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-white focus:outline-none focus:border-bujo-highlight transition-colors"
              />
              <p className="text-[9.5px] text-zinc-500 leading-normal">
                Quando você costuma acordar e iniciar as atividades.
              </p>
            </div>

            {/* 5. Dia Termina */}
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-purple-400" />
                <label className="text-xs font-bold text-white uppercase tracking-wider">Fim do Dia (Dormir)</label>
              </div>
              <input
                type="time"
                value={dayEnd}
                onChange={e => setDayEnd(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-white focus:outline-none focus:border-bujo-highlight transition-colors"
              />
              <p className="text-[9.5px] text-zinc-500 leading-normal">
                Seu horário sugerido para dormir e desaceleração do cérebro.
              </p>
            </div>

            {/* 2. Pico de Foco */}
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-2 md:col-span-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <label className="text-xs font-bold text-white uppercase tracking-wider">⚡ Horário do Pico de Foco</label>
                </div>
                <span className="text-[8.5px] font-bold px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full font-mono">Energia Máxima</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-[9px] text-zinc-400 font-mono block">Início</span>
                  <input
                    type="time"
                    value={energyPeakStart}
                    onChange={e => setEnergyPeakStart(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-white focus:outline-none focus:border-bujo-highlight transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-zinc-400 font-mono block">Término</span>
                  <input
                    type="time"
                    value={energyPeakEnd}
                    onChange={e => setEnergyPeakEnd(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-white focus:outline-none focus:border-bujo-highlight transition-colors"
                  />
                </div>
              </div>
              <p className="text-[9.5px] text-zinc-550 dark:text-zinc-500 leading-normal">
                Período com maior nível de dopamina e foco profundo. Agende tarefas de alta complexidade mental aqui.
              </p>
            </div>

            {/* 3. Vale de Crash */}
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-2 md:col-span-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coffee className="w-4 h-4 text-red-400" />
                  <label className="text-xs font-bold text-white uppercase tracking-wider">💤 Vale de Descanso & Crash</label>
                </div>
                <span className="text-[8.5px] font-bold px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full font-mono">Energia Mínima</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-[9px] text-zinc-400 font-mono block">Início</span>
                  <input
                    type="time"
                    value={restStart}
                    onChange={e => setRestStart(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-white focus:outline-none focus:border-bujo-highlight transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-zinc-400 font-mono block">Término</span>
                  <input
                    type="time"
                    value={restEnd}
                    onChange={e => setRestEnd(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-white focus:outline-none focus:border-bujo-highlight transition-colors"
                  />
                </div>
              </div>
              <p className="text-[9.5px] text-zinc-550 dark:text-zinc-500 leading-normal">
                Queda brusca de energia (frequentemente após o almoço). Faça pausas, meditação ou atividades mecânicas/leves.
              </p>
            </div>

            {/* 4. Segundo Fôlego */}
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-2 md:col-span-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                  <label className="text-xs font-bold text-white uppercase tracking-wider">🌅 Segundo Fôlego (Final de Tarde)</label>
                </div>
                <span className="text-[8.5px] font-bold px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full font-mono">Energia Média</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-[9px] text-zinc-400 font-mono block">Início</span>
                  <input
                    type="time"
                    value={secondWindStart}
                    onChange={e => setSecondWindStart(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-white focus:outline-none focus:border-bujo-highlight transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-zinc-400 font-mono block">Término</span>
                  <input
                    type="time"
                    value={secondWindEnd}
                    onChange={e => setSecondWindEnd(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-white focus:outline-none focus:border-bujo-highlight transition-colors"
                  />
                </div>
              </div>
              <p className="text-[9.5px] text-zinc-550 dark:text-zinc-500 leading-normal">
                Um pico secundário de energia de final de tarde/início de noite. Excelente para hobbies, estudos ou encerramento do dia.
              </p>
            </div>

          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-3 md:px-4 py-2.5 border-t border-white/5 bg-zinc-900/40 flex items-center justify-between shrink-0">
          {/* Restore Defaults — left side */}
          <button
            onClick={handleRestoreDefaults}
            className="px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 text-xs font-bold text-amber-400 transition-all cursor-pointer flex items-center gap-1.5"
            title="Restaurar os valores originais do ritmo energético"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Padrão</span>
          </button>
          {/* Cancel + Save — right side */}
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold text-white transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-bujo-highlight hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>Salvar Preferências</span>
              <Zap className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
