import { useState, useRef, useEffect, useCallback } from 'react';
import { Info, Sparkles, CheckCircle2, AlertTriangle, Lightbulb, Clock, Sliders } from 'lucide-react';
import { BujoItem } from '../../../types';
import { getEnergyX, getEnergyY } from '../../../utils/plannerUtils';
import { useBujo } from '../../../context/BujoContext';
import { EnergyRhythmModal } from './EnergyRhythmModal';

interface EnergyChartProps {
  items: BujoItem[];
  getHarmonyScore: () => number | null;
  getHarmonyRecommendation: (score: number | null) => string;
  showEnergyGuide: boolean;
  setShowEnergyGuide: (show: boolean) => void;
  selectedDate: string;
}

export const EnergyChart = ({
  items,
  getHarmonyScore,
  getHarmonyRecommendation,
  showEnergyGuide,
  setShowEnergyGuide,
  selectedDate
}: EnergyChartProps) => {
  const { settings } = useBujo();
  const [hoveredItem, setHoveredItem] = useState<BujoItem | null>(null);
  const [isRhythmModalOpen, setIsRhythmModalOpen] = useState(false);
  const [showNowTooltip, setShowNowTooltip] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  // Scroll to the chart first, then open the modal after scroll completes
  const handleOpenRhythmModal = useCallback(() => {
    if (chartRef.current) {
      chartRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Wait for the smooth scroll to finish before showing the modal overlay
      setTimeout(() => {
        setIsRhythmModalOpen(true);
      }, 400);
    } else {
      setIsRhythmModalOpen(true);
    }
  }, []);
  
  const score = getHarmonyScore();
  const currentHour = new Date().getHours();
  const currentMinute = new Date().getMinutes();
  const exactHour = currentHour + currentMinute / 60;

  // Helper to parse time strings to hour decimals
  const parseTimeToHour = (timeStr?: string, defaultHour: number = 0): number => {
    if (!timeStr) return defaultHour;
    const [h, m] = timeStr.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return defaultHour;
    return h + m / 60;
  };

  const todayTasks = items.filter(i => i.date === selectedDate && i.type === 'task');

  const getPersonalizedTips = () => {
    const peakStartHour = parseTimeToHour(settings?.energyPeakStart, 9.5);
    const peakEndHour = parseTimeToHour(settings?.energyPeakEnd, 12.5);
    const restStartHour = parseTimeToHour(settings?.restStart, 13.5);
    const restEndHour = parseTimeToHour(settings?.restEnd, 16.0);
    const windStartHour = parseTimeToHour(settings?.secondWindStart, 16.5);
    const windEndHour = parseTimeToHour(settings?.secondWindEnd, 20.0);

    const tips: { type: 'info' | 'warning' | 'success' | 'tip'; text: string }[] = [];
    
    // 1. Current state advice
    if (exactHour >= peakStartHour && exactHour <= peakEndHour) {
      tips.push({
        type: 'success',
        text: 'Você está no seu Pico de Foco agora! Aproveite para atacar as tarefas mais difíceis e complexas.'
      });
    } else if (exactHour >= restStartHour && exactHour <= restEndHour) {
      tips.push({
        type: 'warning',
        text: 'Vale de Descanso (Crash) ativo. Proteja seu cérebro: faça tarefas administrativas leves ou tire uma pequena pausa.'
      });
    } else if (exactHour >= windStartHour && exactHour <= windEndHour) {
      tips.push({
        type: 'info',
        text: 'Segundo Fôlego ativo. Um bom momento para planejamento, revisões de progresso ou estudos rápidos.'
      });
    } else {
      tips.push({
        type: 'tip',
        text: 'Período de desaceleração. Momento de relaxar para recarregar sua dopamina para amanhã.'
      });
    }

    // 2. Task-specific alignment advice
    todayTasks.forEach(task => {
      if (task.time) {
        const [h, m] = task.time.split(':').map(Number);
        const taskHour = h + m / 60;
        
        if (taskHour >= restStartHour && taskHour <= restEndHour && task.status !== 'completed') {
          tips.push({
            type: 'warning',
            text: `A tarefa "${task.content}" está marcada para as ${task.time} (período de crash). Tente movê-la para o seu pico de foco para reduzir o atrito.`
          });
        } else if (taskHour >= peakStartHour && taskHour <= peakEndHour && task.status !== 'completed') {
          tips.push({
            type: 'success',
            text: `Excelente! A tarefa "${task.content}" está agendada para as ${task.time}, no seu melhor momento de energia.`
          });
        }
      } else if (task.status !== 'completed' && task.priority) {
        const peakStartStr = settings?.energyPeakStart || "09:30";
        const peakEndStr = settings?.energyPeakEnd || "12:30";
        tips.push({
          type: 'tip',
          text: `A tarefa urgente "${task.content}" está sem horário. Sugerimos agendá-la para o Pico de Foco (entre ${peakStartStr.replace(':', 'h')} e ${peakEndStr.replace(':', 'h')}).`
        });
      }
    });

    if (tips.length <= 1) {
      tips.push({
        type: 'info',
        text: 'Adicione horários às suas tarefas no Log Diário ou arraste-as na Agenda Diária para receber análises de sincronia energética!'
      });
    }

    return tips;
  };

  const activeTips = getPersonalizedTips();

  return (
    <div ref={chartRef} className="lg:col-span-2 rounded-3xl bg-zinc-200/20 dark:bg-zinc-900/30 border border-zinc-200/30 dark:border-white/5 p-6 flex flex-col gap-6">
      <div>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-sm font-bold text-zinc-800 dark:text-white flex items-center gap-2">
            📈 Ritmo Energético & Carga do Dia
          </h3>
          {/* Harmony score badge */}
          {(() => {
            if (score === null) return null;
            let color = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            let emoji = '🎉';
            let label = 'Excelente';
            if (score < 50) {
              color = 'bg-red-500/10 text-red-400 border-red-500/20';
              emoji = '⚠️';
              label = 'Baixa';
            } else if (score < 80) {
              color = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
              emoji = '⚖️';
              label = 'Média';
            }
            return (
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${color}`}>
                <span>{emoji}</span> Sincronia: {score}% ({label})
              </div>
            );
          })()}
        </div>
        <div className="flex items-start justify-between gap-4 mt-1">
          <p className="text-[10px] md:text-xs text-zinc-500">
            Representação da flutuação de energia biológica (ADHD). Agende tarefas nos horários de pico para aumentar a produtividade e evitar esgotamento.
          </p>
          <div className="flex gap-3 shrink-0">
            <button
              type="button"
              onClick={handleOpenRhythmModal}
              className="flex items-center gap-1 text-[10px] font-bold text-bujo-highlight hover:opacity-85 transition-opacity"
            >
              <Sliders className="w-3.5 h-3.5" />
              Ajustar Ritmo
            </button>
            <button
              type="button"
              onClick={() => setShowEnergyGuide(!showEnergyGuide)}
              className="flex items-center gap-1 text-[10px] font-bold text-bujo-accent hover:text-bujo-highlight transition-colors"
            >
              <Info className="w-3.5 h-3.5" />
              {showEnergyGuide ? 'Ocultar Guia' : 'Como Usar?'}
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Energy rhythm guide explanation */}
      {showEnergyGuide && (
        <div className="bg-zinc-300/15 dark:bg-white/5 border border-zinc-200/25 dark:border-white/5 rounded-2xl p-4 space-y-3 animate-slide-in text-[11px] md:text-xs text-zinc-750 dark:text-zinc-300">
          <span className="font-bold text-zinc-800 dark:text-zinc-200 block uppercase tracking-wider text-[10px]">
            💡 Planejamento Inteligente TDAH
          </span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1 p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
              <span className="font-bold text-emerald-400 block text-[10.5px]">⚡ Pico de Foco ({settings?.energyPeakStart || "09h30"} - {settings?.energyPeakEnd || "12h30"})</span>
              <p className="text-[10px] leading-relaxed text-zinc-650 dark:text-zinc-405">Momento com maior dopamina. Use para tarefas difíceis, escrita complexa, decisões importantes e que exigem hiperfoco.</p>
            </div>
            <div className="space-y-1 p-2.5 rounded-xl bg-red-500/5 border border-red-500/10">
              <span className="font-bold text-red-400 block text-[10.5px]">💤 Vale de Energia ({settings?.restStart || "13h30"} - {settings?.restEnd || "16h00"})</span>
              <p className="text-[10px] leading-relaxed text-zinc-650 dark:text-zinc-405">Sua capacidade de foco despenca. Faça tarefas automáticas e repetitivas (e-mails, arrumação) ou tire uma soneca rápida.</p>
            </div>
            <div className="space-y-1 p-2.5 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
              <span className="font-bold text-indigo-400 block text-[10.5px]">🌅 Segundo Fôlego ({settings?.secondWindStart || "16h30"} - {settings?.secondWindEnd || "20h00"})</span>
              <p className="text-[10px] leading-relaxed text-zinc-650 dark:text-zinc-405">Leve retorno da energia. Perfeito para hobbies, estudos complementares ou planejar as demandas do dia seguinte.</p>
            </div>
          </div>
          <div className="border-t border-zinc-200/15 dark:border-white/5 pt-2.5 mt-1 text-[11px] flex gap-2 items-start">
            <span className="font-bold text-bujo-highlight uppercase tracking-wider shrink-0 mt-0.5 font-mono">Diagnóstico do Dia:</span>
            <span className="italic leading-relaxed">
              {getHarmonyRecommendation(score)}
            </span>
          </div>
        </div>
      )}

      {/* SVG Energy Chart Graph */}
      <div className="relative w-full h-[250px] bg-zinc-300/10 dark:bg-zinc-950/20 rounded-2xl border border-zinc-200/20 dark:border-white/5">
        {/* Horizontal Energy grid helper lines (Y-axis scale) */}
        <div className="absolute inset-x-0 top-[52px] border-b border-dashed border-zinc-300/5 dark:border-white/[0.03] pointer-events-none z-0">
          <span className="absolute left-2.5 -translate-y-1/2 text-[7px] font-mono text-zinc-500 uppercase tracking-widest">Alta (Pico)</span>
        </div>
        <div className="absolute inset-x-0 top-[137px] border-b border-dashed border-zinc-300/5 dark:border-white/[0.03] pointer-events-none z-0">
          <span className="absolute left-2.5 -translate-y-1/2 text-[7px] font-mono text-zinc-500 uppercase tracking-widest">Média</span>
        </div>
        <div className="absolute inset-x-0 top-[222px] border-b border-dashed border-zinc-300/5 dark:border-white/[0.03] pointer-events-none z-0">
          <span className="absolute left-2.5 -translate-y-1/2 text-[7px] font-mono text-zinc-500 uppercase tracking-widest">Baixa (Crash)</span>
        </div>

        {/* Mathematical Hour vertical grid lines (X-axis scale) */}
        <div className="absolute inset-0 pointer-events-none z-0">
          {(() => {
            const startHour = parseTimeToHour(settings?.dayStart, 6.0);
            const endHour = parseTimeToHour(settings?.dayEnd, 23.0);
            const gridHours = [];
            const step = (endHour - startHour) / 4;
            for (let i = 0; i < 5; i++) {
              gridHours.push(startHour + step * i);
            }
            return gridHours.map((h, idx) => {
              const pct = ((h - startHour) / (endHour - startHour)) * 100;
              const displayHour = Math.floor(h);
              const displayMin = Math.round((h - displayHour) * 60);
              const labelStr = displayMin === 0 ? `${displayHour}h` : `${displayHour}:${String(displayMin).padStart(2, '0')}`;
              return (
                <div 
                  key={idx} 
                  className="absolute top-0 bottom-7 border-r border-dashed border-zinc-300/10 dark:border-white/[0.04]"
                  style={{ left: `${pct}%` }}
                >
                  <span className="absolute bottom-1 translate-x-[-50%] text-[8px] font-mono text-zinc-500 dark:text-zinc-600 font-medium">
                    {labelStr}
                  </span>
                </div>
              );
            });
          })()}
        </div>

        {/* Energy Line Chart Curve */}
        <svg className="w-full h-[170px] absolute inset-x-0 bottom-7 px-1 z-10" viewBox="0 0 500 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="chartGlow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--bujo-highlight)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="var(--bujo-highlight)" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="focusZoneGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.06"/>
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0"/>
            </linearGradient>
            <linearGradient id="crashZoneGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.06"/>
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0"/>
            </linearGradient>
            <linearGradient id="secondWindGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.06"/>
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0"/>
            </linearGradient>
          </defs>

          {/* Focus Peak Zone */}
          <rect 
            x={getEnergyX(parseTimeToHour(settings?.energyPeakStart, 9.5), settings)} 
            y="0" 
            width={Math.max(0, getEnergyX(parseTimeToHour(settings?.energyPeakEnd, 12.5), settings) - getEnergyX(parseTimeToHour(settings?.energyPeakStart, 9.5), settings))} 
            height="100" 
            fill="url(#focusZoneGrad)" 
          />
          
          {/* Afternoon Crash Zone */}
          <rect 
            x={getEnergyX(parseTimeToHour(settings?.restStart, 13.5), settings)} 
            y="0" 
            width={Math.max(0, getEnergyX(parseTimeToHour(settings?.restEnd, 16.0), settings) - getEnergyX(parseTimeToHour(settings?.restStart, 13.5), settings))} 
            height="100" 
            fill="url(#crashZoneGrad)" 
          />

          {/* Evening Second Wind Zone */}
          <rect 
            x={getEnergyX(parseTimeToHour(settings?.secondWindStart, 16.5), settings)} 
            y="0" 
            width={Math.max(0, getEnergyX(parseTimeToHour(settings?.secondWindEnd, 20.0), settings) - getEnergyX(parseTimeToHour(settings?.secondWindStart, 16.5), settings))} 
            height="100" 
            fill="url(#secondWindGrad)" 
          />

          {/* Shadow path fill */}
          <path 
            d={(() => {
              const startH = parseTimeToHour(settings?.dayStart, 6.0);
              const endH = parseTimeToHour(settings?.dayEnd, 23.0);
              let pathD = `M 0 100 L 0 ${getEnergyY(startH, settings)}`;
              const step = (endH - startH) / 170;
              for (let i = 1; i <= 170; i++) {
                const h = startH + step * i;
                pathD += ` L ${getEnergyX(h, settings)} ${getEnergyY(h, settings)}`;
              }
              pathD += ` L 500 100 Z`;
              return pathD;
            })()} 
            fill="url(#chartGlow)"
          />

          {/* Core line path */}
          <path 
            d={(() => {
              const startH = parseTimeToHour(settings?.dayStart, 6.0);
              const endH = parseTimeToHour(settings?.dayEnd, 23.0);
              let pathD = `M 0 ${getEnergyY(startH, settings)}`;
              const step = (endH - startH) / 170;
              for (let i = 1; i <= 170; i++) {
                const h = startH + step * i;
                pathD += ` L ${getEnergyX(h, settings)} ${getEnergyY(h, settings)}`;
              }
              return pathD;
            })()} 
            fill="none" 
            stroke="var(--bujo-highlight)" 
            strokeWidth="3" 
            strokeLinecap="round"
          />
          
          {/* Dot representing current hour position with time label */}
          {(() => {
            const startH = parseTimeToHour(settings?.dayStart, 6.0);
            const endH = parseTimeToHour(settings?.dayEnd, 23.0);
            if (exactHour >= startH && exactHour <= endH) {
              const cx = getEnergyX(exactHour, settings);
              const cy = getEnergyY(exactHour, settings);
              const timeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
              return (
                <>
                  {/* Pulsating glow ring */}
                  <circle 
                    cx={cx} 
                    cy={cy} 
                    r="12" 
                    fill="var(--bujo-highlight)" 
                    fillOpacity="0.15"
                    className="animate-pulse" 
                  />
                  {/* Core dot */}
                  <circle 
                    cx={cx} 
                    cy={cy} 
                    r="6" 
                    fill="var(--bujo-highlight)" 
                    className="animate-pulse shadow-glow" 
                  />
                  {/* Inner white accent */}
                  <circle 
                    cx={cx} 
                    cy={cy} 
                    r="2.5" 
                    fill="white" 
                    fillOpacity="0.7"
                  />
                  {/* Time label above the dot */}
                  <text
                    x={cx}
                    y={cy - 16}
                    textAnchor="middle"
                    className="text-[7px] font-mono font-extrabold fill-bujo-highlight select-none pointer-events-none"
                    style={{ filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.8))' }}
                  >
                    {timeStr}
                  </text>
                  {/* Invisible hover target for tooltip */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r="18"
                    fill="transparent"
                    className="cursor-help energy-now-dot"
                    onMouseEnter={() => setShowNowTooltip(true)}
                    onMouseLeave={() => setShowNowTooltip(false)}
                  />
                </>
              );
            }
            return null;
          })()}

          {/* Items mapped onto the curve with dashed vertical guides */}
          {items.filter(item => item.time && item.date === selectedDate).map(item => {
            const [h, m] = item.time!.split(':').map(Number);
            const itemHour = h + m / 60;
            const startH = parseTimeToHour(settings?.dayStart, 6.0);
            const endH = parseTimeToHour(settings?.dayEnd, 23.0);
            if (itemHour < startH || itemHour > endH) return null;
            
            const isCompleted = item.status === 'completed';
            const strokeColor = item.type === 'event' ? '#4A7C6C' : 'var(--bujo-highlight)';

            return (
              <g 
                key={item.id} 
                className="cursor-help group/item"
              >
                {/* Invisible larger hover target to stabilize mouse interactions */}
                <circle 
                  cx={getEnergyX(itemHour, settings)} 
                  cy={getEnergyY(itemHour, settings)} 
                  r="15" 
                  fill="white"
                  fillOpacity="0"
                  className="cursor-help transition-none transform-none"
                  style={{ transition: 'none', transform: 'none' }}
                  onMouseEnter={() => setHoveredItem(item)}
                  onMouseLeave={() => setHoveredItem(null)}
                />

                {/* Vertical guide line */}
                <line
                  x1={getEnergyX(itemHour, settings)}
                  y1={getEnergyY(itemHour, settings)}
                  x2={getEnergyX(itemHour, settings)}
                  y2="100"
                  stroke={strokeColor}
                  strokeWidth="1"
                  strokeDasharray="2,2"
                  opacity="0.5"
                  className="pointer-events-none transition-none transform-none"
                  style={{ transition: 'none', transform: 'none' }}
                />

                {/* Task Circle */}
                <circle 
                  cx={getEnergyX(itemHour, settings)} 
                  cy={getEnergyY(itemHour, settings)} 
                  r="5" 
                  fill={isCompleted ? '#10b981' : strokeColor} 
                  stroke="white" 
                  strokeWidth="1.5"
                  className="pointer-events-none transition-none transform-none"
                  style={{ transition: 'none', transform: 'none' }}
                />

                {/* Floating label */}
                <text 
                  x={getEnergyX(itemHour, settings)} 
                  y={getEnergyY(itemHour, settings) - 9} 
                  textAnchor="middle"
                  className="text-[6.5px] font-bold fill-zinc-700 dark:fill-zinc-305 select-none pointer-events-none transition-none transform-none"
                  style={{ transition: 'none', transform: 'none' }}
                >
                  {item.content.length > 12 ? item.content.substring(0, 10) + '..' : item.content}
                </text>
              </g>
            );
          })}
        </svg>

        {hoveredItem && (() => {
          const [h, m] = hoveredItem.time!.split(':').map(Number);
          const itemHour = h + m / 60;
          const xPct = (getEnergyX(itemHour, settings) / 500) * 100;
          const yVal = getEnergyY(itemHour, settings);
          
          const peakStart = parseTimeToHour(settings?.energyPeakStart, 9.5);
          const peakEnd = parseTimeToHour(settings?.energyPeakEnd, 12.5);
          const restStart = parseTimeToHour(settings?.restStart, 13.5);
          const restEnd = parseTimeToHour(settings?.restEnd, 16.0);
          const windStart = parseTimeToHour(settings?.secondWindStart, 16.5);
          const windEnd = parseTimeToHour(settings?.secondWindEnd, 20.0);

          const isHigh = (itemHour >= peakStart && itemHour <= peakEnd) || (itemHour >= windStart && itemHour <= windEnd);
          const isLow = itemHour >= restStart && itemHour <= restEnd;
          const isCompleted = hoveredItem.status === 'completed';

          let tooltipStyle: React.CSSProperties = {
            bottom: `${(1 - yVal / 100) * 170 + 36}px`
          };
          if (xPct < 25) {
            tooltipStyle.left = `calc(${xPct}% + 16px)`;
          } else if (xPct > 75) {
            tooltipStyle.left = `calc(${xPct}% - 256px)`;
          } else {
            tooltipStyle.left = `calc(${xPct}% - 120px)`;
          }

          return (
            <div 
              className="absolute z-50 bg-[#FCFAF7] dark:bg-[#1E1B18] border border-[#E4DBC5] dark:border-zinc-800 p-3.5 rounded-2xl shadow-xl w-60 pointer-events-none animate-scale-in text-bujo-text"
              style={tooltipStyle}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-zinc-450 dark:text-zinc-500 font-mono flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {hoveredItem.time}
                </span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                  isHigh ? 'bg-emerald-500/10 text-emerald-500' : 
                  isLow ? 'bg-red-500/10 text-red-400' : 'bg-indigo-500/10 text-indigo-400'
                }`}>
                  {isHigh ? '⚡ Pico Foco' : isLow ? '💤 Vale Crash' : '⚖️ Ritmo Estável'}
                </span>
              </div>
              
              <h5 className={`text-xs font-bold mb-2 break-words leading-tight ${isCompleted ? 'line-through opacity-50' : ''}`}>
                {hoveredItem.content}
              </h5>
              
              <div className="space-y-1.5 text-[10px] text-zinc-500 dark:text-zinc-400 border-t border-zinc-200/50 dark:border-white/5 pt-2">
                <p>
                  {isHigh ? '⚡ Energia Alta: Momento perfeito para executar esta tarefa com alto foco!' : 
                   isLow ? '💤 Energia Baixa: Cuidado com o cansaço. Você pode achar esta tarefa mais pesada agora.' : 
                   '⚖️ Energia Média: Bom momento para manter um progresso constante.'}
                </p>
                {hoveredItem.energy && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="bg-zinc-200/40 dark:bg-white/5 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold">
                      Esforço: {hoveredItem.energy}/5
                    </span>
                    {hoveredItem.energy >= 4 && isLow && (
                      <span className="text-red-500 dark:text-red-400 font-bold text-[8.5px] animate-pulse">
                        ⚠️ Alerta de Sobrecarga!
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* Tooltip for the "now" energy dot */}
        {showNowTooltip && (() => {
          const startH = parseTimeToHour(settings?.dayStart, 6.0);
          const endH = parseTimeToHour(settings?.dayEnd, 23.0);
          if (exactHour < startH || exactHour > endH) return null;
          const xPctNow = (getEnergyX(exactHour, settings) / 500) * 100;
          const yValNow = getEnergyY(exactHour, settings);
          const timeStrFull = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;

          const peakStart = parseTimeToHour(settings?.energyPeakStart, 9.5);
          const peakEnd = parseTimeToHour(settings?.energyPeakEnd, 12.5);
          const restStartH = parseTimeToHour(settings?.restStart, 13.5);
          const restEndH = parseTimeToHour(settings?.restEnd, 16.0);
          const windStart = parseTimeToHour(settings?.secondWindStart, 16.5);
          const windEnd = parseTimeToHour(settings?.secondWindEnd, 20.0);

          let zoneName = 'Transição';
          let zoneEmoji = '⚖️';
          let zoneBadgeClass = 'bg-zinc-500/10 text-zinc-400';
          if (exactHour >= peakStart && exactHour <= peakEnd) {
            zoneName = 'Pico de Foco';
            zoneEmoji = '⚡';
            zoneBadgeClass = 'bg-emerald-500/10 text-emerald-400';
          } else if (exactHour >= restStartH && exactHour <= restEndH) {
            zoneName = 'Vale de Crash';
            zoneEmoji = '💤';
            zoneBadgeClass = 'bg-red-500/10 text-red-400';
          } else if (exactHour >= windStart && exactHour <= windEnd) {
            zoneName = 'Segundo Fôlego';
            zoneEmoji = '🌅';
            zoneBadgeClass = 'bg-indigo-500/10 text-indigo-400';
          }

          let tooltipStyle: React.CSSProperties = {
            bottom: `${(1 - yValNow / 100) * 170 + 36}px`
          };
          if (xPctNow < 25) {
            tooltipStyle.left = `calc(${xPctNow}% + 16px)`;
          } else if (xPctNow > 75) {
            tooltipStyle.left = `calc(${xPctNow}% - 256px)`;
          } else {
            tooltipStyle.left = `calc(${xPctNow}% - 120px)`;
          }

          return (
            <div
              className="absolute z-50 bg-[#FCFAF7] dark:bg-[#1E1B18] border border-[#E4DBC5] dark:border-zinc-800 p-3.5 rounded-2xl shadow-xl w-60 pointer-events-none animate-scale-in text-bujo-text"
              style={tooltipStyle}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-zinc-450 dark:text-zinc-500 font-mono flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {timeStrFull}
                </span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${zoneBadgeClass}`}>
                  {zoneEmoji} {zoneName}
                </span>
              </div>
              <h5 className="text-xs font-bold mb-1.5 leading-tight">📍 Sua Energia Agora</h5>
              <div className="space-y-1.5 text-[10px] text-zinc-500 dark:text-zinc-400 border-t border-zinc-200/50 dark:border-white/5 pt-2">
                <p>
                  Este ponto pulsante indica <strong>sua posição atual no ciclo energético TDAH</strong>. Ele mostra em tempo real em qual fase do seu ritmo biológico de dopamina e foco você se encontra.
                </p>
                <p className="text-[9px] text-zinc-400 dark:text-zinc-500 italic">
                  Use esta referência para decidir quais tarefas abordar agora.
                </p>
              </div>
            </div>
          );
        })()}

        {/* Labels for zones */}
        <div className="absolute inset-x-4 bottom-2 flex items-center justify-between z-10 select-none">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
            <span className="text-[8px] font-bold text-zinc-500 uppercase">Pico Foco</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
            <span className="text-[8px] font-bold text-zinc-500 uppercase">Vale Exaustão</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
            <span className="text-[8px] font-bold text-zinc-500 uppercase">Segundo Fôlego</span>
          </div>
        </div>
      </div>

      {/* Real-time ADHD Cognitive Recommendations panel */}
      <div className="rounded-2xl bg-zinc-200/30 dark:bg-white/5 border border-zinc-200/40 dark:border-white/10 p-4 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-bujo-highlight flex items-center gap-1.5 font-mono">
          <Sparkles className="w-3.5 h-3.5" /> Recomendações de Ritmo e Energia
        </h4>

        <div className="space-y-2">
          {activeTips.map((tip, idx) => {
            const Icon = tip.type === 'success' 
              ? CheckCircle2 
              : tip.type === 'warning' 
              ? AlertTriangle 
              : tip.type === 'tip' 
              ? Lightbulb 
              : Clock;
              
            const textColor = tip.type === 'success' 
              ? 'text-emerald-500' 
              : tip.type === 'warning' 
              ? 'text-amber-500' 
              : tip.type === 'tip' 
              ? 'text-indigo-400' 
              : 'text-bujo-accent';

            return (
              <div key={idx} className="flex gap-2.5 items-start p-2.5 rounded-xl bg-zinc-250/20 dark:bg-zinc-950/20 border border-zinc-250/30 dark:border-white/5 text-[11px] leading-relaxed">
                <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${textColor}`} />
                <span className="text-zinc-700 dark:text-zinc-300">{tip.text}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Energy Rhythm Adjustment Modal */}
      <EnergyRhythmModal 
        isOpen={isRhythmModalOpen} 
        onClose={() => setIsRhythmModalOpen(false)} 
      />
    </div>
  );
};
