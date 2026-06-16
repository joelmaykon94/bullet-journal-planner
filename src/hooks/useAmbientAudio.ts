import { useState, useEffect, useRef } from 'react';

export function useAmbientAudio(showToast: (msg: string) => void) {
  const [soundType, setSoundType] = useState<'chuva_lareira' | 'lofi_jazz' | 'foco_marrom' | 'vento_floresta'>('chuva_lareira');
  const [ambientPlaying, setAmbientPlaying] = useState(false);
  const [ambientVolume, setAmbientVolume] = useState(0.25);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const audioSourcesRef = useRef<any[]>([]);

  const startAmbientAudio = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const mainGain = ctx.createGain();
      mainGain.gain.setValueAtTime(ambientVolume, ctx.currentTime);
      mainGain.connect(ctx.destination);
      gainNodeRef.current = mainGain;

      // Noise Buffer creation (common for rain, wind, fire, rumble)
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5;
      }

      if (soundType === 'chuva_lareira') {
        // 1. Cozy Rain (Brown noise + Lowpass)
        const rainSource = ctx.createBufferSource();
        rainSource.buffer = noiseBuffer;
        rainSource.loop = true;
        const rainFilter = ctx.createBiquadFilter();
        rainFilter.type = 'lowpass';
        rainFilter.frequency.setValueAtTime(320, ctx.currentTime);
        const rainGain = ctx.createGain();
        rainGain.gain.setValueAtTime(0.5, ctx.currentTime);

        rainSource.connect(rainFilter);
        rainFilter.connect(rainGain);
        rainGain.connect(mainGain);
        rainSource.start();
        audioSourcesRef.current.push(rainSource);

        // 2. Fireplace crackling
        const fireSource = ctx.createBufferSource();
        fireSource.buffer = noiseBuffer;
        fireSource.loop = true;
        const fireFilter = ctx.createBiquadFilter();
        fireFilter.type = 'bandpass';
        fireFilter.frequency.setValueAtTime(70, ctx.currentTime);
        fireFilter.Q.setValueAtTime(1.5, ctx.currentTime);
        const fireGain = ctx.createGain();
        fireGain.gain.setValueAtTime(0.65, ctx.currentTime);

        fireSource.connect(fireFilter);
        fireFilter.connect(fireGain);
        fireGain.connect(mainGain);
        fireSource.start();
        audioSourcesRef.current.push(fireSource);

        // Crackle Pops ScriptProcessor
        const scriptNode = ctx.createScriptProcessor(4096, 0, 1);
        scriptNode.onaudioprocess = (e) => {
          const out = e.outputBuffer.getChannelData(0);
          for (let i = 0; i < out.length; i++) {
            out[i] = 0;
            if (Math.random() < 0.00028) {
              out[i] = (Math.random() * 2 - 1) * 0.35;
            } else if (Math.random() < 0.00095) {
              out[i] = (Math.random() * 2 - 1) * 0.12;
            }
          }
        };
        const crackleGain = ctx.createGain();
        crackleGain.gain.setValueAtTime(0.35, ctx.currentTime);
        scriptNode.connect(crackleGain);
        crackleGain.connect(mainGain);
        audioSourcesRef.current.push(scriptNode);

        // 3. Faint ambient pad
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(110, ctx.currentTime);
        const oscFilter = ctx.createBiquadFilter();
        oscFilter.type = 'lowpass';
        oscFilter.frequency.setValueAtTime(140, ctx.currentTime);
        const oscGain = ctx.createGain();
        oscGain.gain.setValueAtTime(0.06, ctx.currentTime);

        osc.connect(oscFilter);
        oscFilter.connect(oscGain);
        oscGain.connect(mainGain);
        osc.start();
        audioSourcesRef.current.push(osc);

        const lfo = ctx.createOscillator();
        lfo.frequency.setValueAtTime(0.12, ctx.currentTime); 
        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(0.03, ctx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(oscGain.gain);
        lfo.start();
        audioSourcesRef.current.push(lfo);

      } else if (soundType === 'lofi_jazz') {
        // Lofi Beats Sequencer
        let beatIndex = 0;
        let nextBeatTime = ctx.currentTime;
        const beatLength = 0.45; // ~133 BPM
        const playLofiStep = (c: AudioContext, time: number, bIdx: number, targetGain: GainNode) => {
          if (bIdx === 0 || bIdx === 4) {
            const osc = c.createOscillator();
            const gain = c.createGain();
            osc.connect(gain);
            gain.connect(targetGain);
            osc.frequency.setValueAtTime(110, time);
            osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.12);
            gain.gain.setValueAtTime(0.38, time);
            gain.gain.exponentialRampToValueAtTime(0.01, time + 0.12);
            osc.start(time);
            osc.stop(time + 0.15);
          }
          if (bIdx === 2 || bIdx === 6) {
            const bSize = 0.08 * c.sampleRate;
            const b = c.createBuffer(1, bSize, c.sampleRate);
            const o = b.getChannelData(0);
            for (let i = 0; i < bSize; i++) o[i] = Math.random() * 2 - 1;
            const src = c.createBufferSource();
            src.buffer = b;
            const flt = c.createBiquadFilter();
            flt.type = 'bandpass';
            flt.frequency.setValueAtTime(1000, time);
            const gn = c.createGain();
            gn.gain.setValueAtTime(0.16, time);
            gn.gain.exponentialRampToValueAtTime(0.01, time + 0.08);
            src.connect(flt);
            flt.connect(gn);
            gn.connect(targetGain);
            src.start(time);
            src.stop(time + 0.1);
          }
          if (bIdx === 0 || bIdx === 4) {
            const notes = bIdx === 0 ? [110, 130.81, 164.81, 196.00] : [146.83, 174.61, 220.00, 261.63];
            notes.forEach(f => {
              const o = c.createOscillator();
              o.type = 'triangle';
              o.frequency.setValueAtTime(f, time);
              const fl = c.createBiquadFilter();
              fl.type = 'lowpass';
              fl.frequency.setValueAtTime(250, time);
              const g = c.createGain();
              g.gain.setValueAtTime(0.0, time);
              g.gain.linearRampToValueAtTime(0.045, time + 0.25);
              g.gain.exponentialRampToValueAtTime(0.001, time + 1.8);
              o.connect(fl);
              fl.connect(g);
              g.connect(targetGain);
              o.start(time);
              o.stop(time + 1.9);
            });
          }
        };

        const intervalId = setInterval(() => {
          while (nextBeatTime < ctx.currentTime + 0.1) {
            playLofiStep(ctx, nextBeatTime, beatIndex, mainGain);
            nextBeatTime += beatLength;
            beatIndex = (beatIndex + 1) % 8;
          }
        }, 50);

        audioSourcesRef.current.push({ stop: () => clearInterval(intervalId), disconnect: () => {} });

        // Add soft fireplace crackles behind lofi
        const crackleSource = ctx.createScriptProcessor(4096, 0, 1);
        crackleSource.onaudioprocess = (e) => {
          const out = e.outputBuffer.getChannelData(0);
          for (let i = 0; i < out.length; i++) {
            out[i] = 0;
            if (Math.random() < 0.00015) out[i] = (Math.random() * 2 - 1) * 0.15;
          }
        };
        const cGain = ctx.createGain();
        cGain.gain.setValueAtTime(0.15, ctx.currentTime);
        crackleSource.connect(cGain);
        cGain.connect(mainGain);
        audioSourcesRef.current.push(crackleSource);

      } else if (soundType === 'foco_marrom') {
        // Pure focus Brownian noise
        const brownSource = ctx.createBufferSource();
        brownSource.buffer = noiseBuffer;
        brownSource.loop = true;
        const brownFilter = ctx.createBiquadFilter();
        brownFilter.type = 'lowpass';
        brownFilter.frequency.setValueAtTime(250, ctx.currentTime); // very deep rumble
        const brownGain = ctx.createGain();
        brownGain.gain.setValueAtTime(0.8, ctx.currentTime);

        brownSource.connect(brownFilter);
        brownFilter.connect(brownGain);
        brownGain.connect(mainGain);
        brownSource.start();
        audioSourcesRef.current.push(brownSource);

      } else if (soundType === 'vento_floresta') {
        // Forest Wind (modulated lowpass) + light rain
        const windSource = ctx.createBufferSource();
        windSource.buffer = noiseBuffer;
        windSource.loop = true;
        const windFilter = ctx.createBiquadFilter();
        windFilter.type = 'bandpass';
        windFilter.Q.setValueAtTime(1.8, ctx.currentTime);

        const lfo = ctx.createOscillator();
        lfo.frequency.setValueAtTime(0.08, ctx.currentTime); // slow sweep
        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(150, ctx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(windFilter.frequency);
        windFilter.frequency.setValueAtTime(300, ctx.currentTime);

        const windGain = ctx.createGain();
        windGain.gain.setValueAtTime(0.35, ctx.currentTime);

        windSource.connect(windFilter);
        windFilter.connect(windGain);
        windGain.connect(mainGain);
        windSource.start();
        lfo.start();
        audioSourcesRef.current.push(windSource, lfo);

        // add light rain
        const rainSource = ctx.createBufferSource();
        rainSource.buffer = noiseBuffer;
        rainSource.loop = true;
        const rainFilter = ctx.createBiquadFilter();
        rainFilter.type = 'lowpass';
        rainFilter.frequency.setValueAtTime(450, ctx.currentTime);
        const rainGain = ctx.createGain();
        rainGain.gain.setValueAtTime(0.2, ctx.currentTime);

        rainSource.connect(rainFilter);
        rainFilter.connect(rainGain);
        rainGain.connect(mainGain);
        rainSource.start();
        audioSourcesRef.current.push(rainSource);
      }
    } catch (e) {
      console.error('Falha ao iniciar som:', e);
    }
  };

  const stopAmbientAudio = () => {
    audioSourcesRef.current.forEach(source => {
      try {
        source.stop();
      } catch (e) {
        // Source might be interval object or already stopped
      }
      try {
        source.disconnect();
      } catch (e) {}
    });
    audioSourcesRef.current = [];
    if (gainNodeRef.current) {
      gainNodeRef.current.disconnect();
      gainNodeRef.current = null;
    }
    if (audioCtxRef.current) {
      if (audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close();
      }
      audioCtxRef.current = null;
    }
  };

  const toggleAmbientAudio = () => {
    if (ambientPlaying) {
      stopAmbientAudio();
      setAmbientPlaying(false);
      showToast('Som ambiente desativado 🤫');
    } else {
      startAmbientAudio();
      setAmbientPlaying(true);
      const soundLabels = {
        chuva_lareira: 'Respiração da Água (Chuva Calmante) 🌊',
        lofi_jazz: 'Respiração da Névoa (Jazz Lofi) 🌫️',
        vento_floresta: 'Respiração do Inseto (Floresta de Glicínias) 🦋',
        foco_marrom: 'Respiração das Chamas (Foco Ardente) 🔥'
      };
      showToast(`Som ambiente ativado: ${soundLabels[soundType]}`);
    }
  };

  // Synchronize volume updates dynamically
  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(ambientVolume, audioCtxRef.current.currentTime);
    }
  }, [ambientVolume]);

  // Restart audio if soundType changes while playing
  useEffect(() => {
    if (ambientPlaying) {
      stopAmbientAudio();
      startAmbientAudio();
    }
  }, [soundType]);

  // Cleanup audio context on unmount
  useEffect(() => {
    return () => {
      stopAmbientAudio();
    };
  }, []);

  return {
    soundType,
    setSoundType,
    ambientPlaying,
    setAmbientPlaying,
    ambientVolume,
    setAmbientVolume,
    toggleAmbientAudio,
    stopAmbientAudio
  };
}
