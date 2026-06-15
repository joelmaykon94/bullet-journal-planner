import { Info } from 'lucide-react';
import { BujoItem } from '../../../types';

interface BrainDumpStationProps {
  brainDumpText: string;
  setBrainDumpText: (text: string) => void;
  isProcessingBrainDump: boolean;
  adhdTriggers: { text: string; icon: string }[];
  appendBrainDumpTrigger: (trigger: string) => void;
  handleBrainDumpOrganize: () => void;
  brainDumpResult: {
    tasks: BujoItem[];
    events: BujoItem[];
    notes: BujoItem[];
    emotion: string;
  } | null;
  addBrainDumpItemsToBujo: () => void;
}

export const BrainDumpStation = ({
  brainDumpText,
  setBrainDumpText,
  isProcessingBrainDump,
  adhdTriggers,
  appendBrainDumpTrigger,
  handleBrainDumpOrganize,
  brainDumpResult,
  addBrainDumpItemsToBujo
}: BrainDumpStationProps) => {
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
            className="w-full bg-zinc-200/30 dark:bg-white/5 border border-zinc-300/40 dark:border-white/10 rounded-2xl p-4 text-sm text-bujo-text placeholder:text-zinc-600 outline-none focus:border-bujo-highlight/30 resize-none transition-colors"
            disabled={isProcessingBrainDump}
          />

          {/* ADHD Memory Checklist */}
          <div className="space-y-2 bg-zinc-200/20 dark:bg-white/[0.02] p-3 rounded-2xl border border-zinc-200/30 dark:border-white/5">
            <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest block">
              🧠 Lembretes de Rotina (Gatilhos de Memória)
            </span>
            <p className="text-[10px] text-zinc-400">Esqueceu de algo comum? Toque abaixo para injetar no seu despejo:</p>
            <div className="flex flex-wrap gap-2 pt-1">
              {adhdTriggers.map((trigger, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => appendBrainDumpTrigger(trigger.text)}
                  className="px-2.5 py-1.5 bg-zinc-200/40 dark:bg-white/5 border border-zinc-300/40 dark:border-white/10 hover:border-bujo-highlight text-[10px] font-semibold rounded-lg flex items-center gap-1.5 transition-colors text-bujo-text"
                >
                  <span>{trigger.icon}</span>
                  <span>{trigger.text}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleBrainDumpOrganize}
            disabled={isProcessingBrainDump || !brainDumpText.trim()}
            className="w-full py-3.5 bg-bujo-highlight text-white hover:opacity-95 font-semibold rounded-2xl text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {isProcessingBrainDump ? 'Organizando mente...' : '✨ Organizar com IA'}
          </button>
        </div>

        {/* Organized Dump Result */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Estrutura Organizada</h4>
          
          {brainDumpResult ? (
            <div className="p-5 rounded-3xl bg-zinc-200/15 dark:bg-white/5 border border-zinc-200/40 dark:border-white/10 space-y-4 animate-fade-in">
              
              {/* Emotional Summary Alert */}
              {brainDumpResult.emotion && (
                <div className="p-3.5 rounded-xl bg-bujo-highlight/10 border border-bujo-highlight/20 text-xs text-bujo-text flex items-center gap-2">
                  <Info className="w-4 h-4 text-bujo-highlight flex-shrink-0" />
                  <span>{brainDumpResult.emotion}</span>
                </div>
              )}

              {/* Sorted Groups */}
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                
                {/* Tasks Group */}
                {brainDumpResult.tasks.length > 0 && (
                  <div className="space-y-1">
                    <h5 className="text-[10px] font-bold text-zinc-500 uppercase">Tarefas Detectadas (•)</h5>
                    {brainDumpResult.tasks.map((t, idx) => (
                      <div key={idx} className="text-xs text-zinc-600 dark:text-zinc-300 pl-3 border-l-2 border-bujo-highlight/50">• {t.content}</div>
                    ))}
                  </div>
                )}

                {/* Events Group */}
                {brainDumpResult.events.length > 0 && (
                  <div className="space-y-1">
                    <h5 className="text-[10px] font-bold text-zinc-500 uppercase">Eventos Detectados (o)</h5>
                    {brainDumpResult.events.map((e, idx) => (
                      <div key={idx} className="text-xs text-zinc-600 dark:text-zinc-300 pl-3 border-l-2 border-bujo-accent/50">o {e.content} {e.time && `(às ${e.time})`}</div>
                    ))}
                  </div>
                )}

                {/* Notes Group */}
                {brainDumpResult.notes.length > 0 && (
                  <div className="space-y-1">
                    <h5 className="text-[10px] font-bold text-zinc-500 uppercase">Notas Avulsas (-)</h5>
                    {brainDumpResult.notes.map((n, idx) => (
                      <div key={idx} className="text-xs text-zinc-500 italic pl-3 border-l-2 border-zinc-500/30">- {n.content}</div>
                    ))}
                  </div>
                )}

              </div>

              {/* Confirm Adding Trigger */}
              <button
                onClick={addBrainDumpItemsToBujo}
                className="w-full py-2.5 bg-bujo-accent text-white hover:opacity-95 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                Adicionar Tudo ao Bullet Journal
              </button>
            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-zinc-200/10 dark:bg-white/[0.01] border border-zinc-200/30 dark:border-white/5 text-center text-zinc-500 italic text-sm py-16">
              O resultado do seu Brain Dump estruturado aparecerá aqui após clicar no botão do formulário.
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
