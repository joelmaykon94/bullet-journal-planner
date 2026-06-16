import { useState, useRef, useEffect } from 'react';
import { Sliders, Pause, Play } from 'lucide-react';

interface FocusPartnerControlsProps {
  isEditingPartner: boolean;
  partnerName: string;
  setPartnerName: (name: string) => void;
  partnerEmoji: string;
  setPartnerEmoji: (emoji: string) => void;
  setIsEditingPartner: (editing: boolean) => void;
  soundType: 'chuva_lareira' | 'lofi_jazz' | 'foco_marrom' | 'vento_floresta';
  setSoundType: (type: 'chuva_lareira' | 'lofi_jazz' | 'foco_marrom' | 'vento_floresta') => void;
  toggleAmbientAudio: () => void;
  ambientPlaying: boolean;
  ambientVolume: number;
  setAmbientVolume: (volume: number) => void;
}

export const FocusPartnerControls = ({
  isEditingPartner,
  partnerName,
  setPartnerName,
  partnerEmoji,
  setPartnerEmoji,
  setIsEditingPartner,
  soundType,
  setSoundType,
  toggleAmbientAudio,
  ambientPlaying,
  ambientVolume,
  setAmbientVolume
}: FocusPartnerControlsProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 350); // 350ms delay to prevent flicker/disappear on gaps
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  const shouldShowControls = isHovered || isEditingPartner;

  return (
    <div 
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="fixed bottom-24 right-6 z-40 no-print hidden md:block"
    >
      <div className="flex items-center gap-3">
        {/* Dynamic Bubble Speech */}
        <div className={`bg-zinc-950/90 border border-white/10 backdrop-blur-xl p-3.5 rounded-3xl rounded-br-none shadow-2xl transition-all duration-300 pointer-events-none ${
          isHovered && !isEditingPartner 
            ? 'opacity-100 translate-x-0' 
            : 'opacity-0 translate-x-2'
        }`}>
          <p className="text-[10px] text-zinc-300 leading-tight w-32 font-medium">
            "Oi! Sou o {partnerName}. Estou aqui para focarmos juntos!"
          </p>
        </div>

        {/* Companion Avatar Circle */}
        <button 
          onClick={() => setIsEditingPartner(!isEditingPartner)}
          className="w-14 h-14 rounded-full bg-zinc-950 border border-white/10 shadow-2xl flex items-center justify-center text-3xl hover:scale-105 transition-transform animate-bounce-slow relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-bujo-highlight/20 to-transparent"></div>
          <span className="relative z-10">{partnerEmoji}</span>
          {ambientPlaying && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-zinc-950 animate-pulse"></div>
          )}
        </button>
      </div>

      {/* Floating Controls Dashboard (Flyout) */}
      <div className={`absolute bottom-full right-0 pb-4 transition-all duration-300 ${
        shouldShowControls 
          ? 'opacity-100 translate-y-0 pointer-events-auto' 
          : 'opacity-0 translate-y-2 pointer-events-none'
      }`}>
        <div className="bg-zinc-950/95 border border-white/10 backdrop-blur-2xl p-4 rounded-[32px] shadow-3xl w-48 flex flex-col items-center gap-4 text-center ring-1 ring-white/5">
          
          {isEditingPartner ? (
            <div className="space-y-3 w-full animate-fade-in">
              <div className="space-y-1 text-left">
                <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider block pl-1">Nome</span>
                <input
                  type="text"
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-2 py-1.5 text-[10px] text-white outline-none"
                />
              </div>
              <div className="space-y-1 text-left">
                <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider block pl-1">Avatar</span>
                <select
                  value={partnerEmoji}
                  onChange={(e) => setPartnerEmoji(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl p-1.5 text-[10px] text-white outline-none"
                >
                  <option value="🦊">🦊 Raposa</option>
                  <option value="🐼">🐼 Panda</option>
                  <option value="🤖">🤖 Robô</option>
                  <option value="👦">👦 Garoto</option>
                  <option value="👧">👧 Garota</option>
                </select>
              </div>
              <button
                onClick={() => setIsEditingPartner(false)}
                className="w-full py-1.5 bg-bujo-highlight text-white hover:opacity-95 font-bold rounded-lg text-[10px]"
              >
                Salvar
              </button>
            </div>
          ) : (
            <div className="space-y-0.5 w-full">
              <span className="text-[8px] font-bold tracking-wider text-zinc-500 uppercase block">Parceiro de Foco</span>
              <div className="flex items-center justify-center gap-1.5 pl-3">
                <span className="text-xs font-semibold text-white block truncate max-w-[120px]">
                  {partnerName} está focado
                </span>
                <button
                  onClick={() => setIsEditingPartner(true)}
                  className="text-zinc-500 hover:text-white transition-colors p-0.5"
                  title="Personalizar parceiro"
                >
                  <Sliders className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* Sound selector */}
          <div className="w-full space-y-1 text-left">
            <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider block pl-1">Opção de Som</span>
            <select
              value={soundType}
              onChange={(e) => setSoundType(e.target.value as any)}
              className="w-full bg-zinc-900 border border-white/10 rounded-xl p-1.5 text-[10px] font-semibold text-white outline-none cursor-pointer hover:bg-zinc-800 transition-colors"
            >
              <option value="chuva_lareira">Respiração da Água (Chuva Calmante) 🌊</option>
              <option value="lofi_jazz">Respiração da Névoa (Jazz Lofi) 🌫️</option>
              <option value="vento_floresta">Respiração do Inseto (Floresta de Glicínias) 🦋</option>
              <option value="foco_marrom">Respiração das Chamas (Foco Ardente) 🔥</option>
            </select>
          </div>

          {/* Play/Pause controls */}
          <div className="w-full space-y-2 pt-1 border-t border-white/5">
            <button
              onClick={toggleAmbientAudio}
              className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md ${
                ambientPlaying 
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                  : 'bg-zinc-850 hover:bg-zinc-800 text-zinc-300 border border-white/5'
              }`}
            >
              {ambientPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" /> Pausar Sons
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" /> Som Foco
                </>
              )}
            </button>
            
            <div className="flex items-center gap-1.5 px-1 justify-between">
              <span className="text-[8px] text-zinc-500 font-bold uppercase">Volume</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={ambientVolume}
                onChange={(e) => setAmbientVolume(parseFloat(e.target.value))}
                className="w-24 accent-bujo-highlight h-1 bg-zinc-800 rounded-lg cursor-pointer appearance-none"
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
