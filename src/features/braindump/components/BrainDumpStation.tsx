import { Info } from 'lucide-react';
import { useBujo } from '../../../context/BujoContext';
import { adhdTriggers } from '../../../utils/plannerUtils';

export const BrainDumpStation = () => {
  const {
    brainDumpText,
    setBrainDumpText,
    isProcessingBrainDump,
    appendBrainDumpTrigger,
    handleBrainDumpOrganize,
    brainDumpResult,
    addBrainDumpItemsToBujo
  } = useBujo();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="border-b border-zinc-200/50 dark:border-white/10 pb-4">
        <span className="text-[10px] text-zinc-400 uppercase font-mono tracking-widest">DESPEJAR CÉREBRO</span>
        <h3 className="text-3xl font-light">
          Brain Dump Station — <span className="italic font-normal" style={{ fontFamily: "'Instrument Serif', serif" }}>Organizador Cognitivo</span>
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Dump Area */}
        <div className="space-y-4">
          <p className="text-xs text-zinc-500 leading-relaxed">
            Escreva tudo o que está entupindo sua mente, sem vírgulas ou julgamentos. Escreva livremente sobre tarefas acumuladas, prazos, frustrações ou compromissos. Nossa IA organizará seus pensamentos.
          </p>

          <textarea
            value={brainDumpText}
            onChange={(e) => setBrainDumpText(e.target.value)}
            placeholder="Exemplo: Preciso limpar a casa no fim de semana. Lembrar da consulta médica amanhã às 15h. Tenho que estudar para a prova de biologia. Sinto-me muito ansioso com o prazo do relatório de trabalho."
            rows={8}
            className="w-full bg-zinc-200/30 dark:bg-white/5 border border-zinc-300/40 dark:border-white/10 rounded-2xl p-4 text-sm text-bujo-text placeholder:text-zinc-650 outline-none focus:border-bujo-highlight/30 resize-none transition-colors"
            disabled={isProcessingBrainDump}
          />

          {/* ADHD Memory Checklist */}
          <div className="space-y-2 bg-zinc-200/20 dark:bg-white/[0.02] p-3 rounded-2xl border border-zinc-200/30 dark:border-white/5">
            <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest block">
              🧠 Lembretes de Rotina (Gatilhos de Memória)
            </span>
            <p className="text-[10px] text-zinc-400">Esqueceu de algo comum? Toque abaixo para injetar no seu despejo:</p>
            
            <div className="flex gap-1.5 flex-wrap pt-1.5">
              {adhdTriggers.map(trig => (
                <button
                  key={trig.text}
                  type="button"
                  onClick={() => appendBrainDumpTrigger(trig.text)}
                  className="px-2.5 py-1 bg-zinc-200/50 hover:bg-zinc-200/80 dark:bg-white/5 dark:hover:bg-white/10 border border-zinc-350 dark:border-white/5 rounded-xl text-[10px] font-bold text-bujo-text flex items-center gap-1 cursor-pointer transition-all"
                >
                  <span>{trig.icon}</span>
                  <span>{trig.text}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleBrainDumpOrganize}
            disabled={isProcessingBrainDump || !brainDumpText.trim()}
            className="px-6 py-3 bg-bujo-highlight text-white text-xs font-bold rounded-2xl transition-all shadow-md disabled:opacity-50 hover:opacity-95 cursor-pointer w-full md:w-auto"
          >
            {isProcessingBrainDump ? 'Analisando Pensamentos...' : 'Organizar Caos Mental ⚡'}
          </button>
        </div>

        {/* Results Block */}
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-zinc-200/15 dark:bg-white/5 border border-zinc-200/30 dark:border-white/10 h-full flex flex-col justify-between min-h-[300px]">
            <div>
              <div className="flex items-center gap-2 border-b border-zinc-200/30 dark:border-white/5 pb-3 mb-4">
                <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-widest">RESULTADO DA ORGANIZAÇÃO</span>
              </div>

              {brainDumpResult ? (
                <div className="space-y-4">
                  {/* Emotion Card */}
                  <div className="p-3 rounded-2xl bg-zinc-200/35 dark:bg-white/[0.03] border border-zinc-200/30 dark:border-white/5 text-xs text-zinc-400 leading-relaxed flex items-start gap-2">
                    <Info className="w-4 h-4 text-bujo-highlight shrink-0 mt-0.5" />
                    <span>{brainDumpResult.emotion}</span>
                  </div>

                  <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                    {brainDumpResult.tasks.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-bold text-zinc-550 uppercase tracking-widest block">Tarefas ({brainDumpResult.tasks.length})</span>
                        {brainDumpResult.tasks.map((t, idx) => (
                          <div key={idx} className="text-xs text-zinc-400 flex items-center gap-2 pl-1.5">
                            <span className="text-bujo-highlight font-bold">•</span>
                            <span>{t.content}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {brainDumpResult.events.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-bold text-zinc-550 uppercase tracking-widest block">Eventos ({brainDumpResult.events.length})</span>
                        {brainDumpResult.events.map((e, idx) => (
                          <div key={idx} className="text-xs text-zinc-400 flex items-center gap-2 pl-1.5">
                            <span className="text-bujo-accent font-bold">O</span>
                            <span>{e.time ? `[${e.time}] ` : ''}{e.content}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {brainDumpResult.notes.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-bold text-zinc-550 uppercase tracking-widest block">Notas ({brainDumpResult.notes.length})</span>
                        {brainDumpResult.notes.map((n, idx) => (
                          <div key={idx} className="text-xs text-zinc-500 italic flex items-center gap-2 pl-1.5">
                            <span>-</span>
                            <span>{n.content}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center text-zinc-500 italic text-xs">
                  <span>Escreva e clique em "Organizar Caos Mental" para iniciar.</span>
                </div>
              )}
            </div>

            {brainDumpResult && (
              <button
                onClick={addBrainDumpItemsToBujo}
                className="w-full mt-6 py-3 bg-bujo-highlight text-white hover:opacity-95 text-xs font-bold rounded-2xl transition-all shadow-md cursor-pointer"
              >
                Adicionar Tudo ao Bullet Journal 🚀
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
