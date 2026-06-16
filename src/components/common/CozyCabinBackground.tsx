import { useEffect, useRef } from 'react';
import { useBujo } from '../../context/BujoContext';
import hashiraGif from '../../assets/hashira.gif';

export const CozyCabinBackground = () => {
  const { settings } = useBujo();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Canvas Animation Logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Parallax mouse offset
    const parallax = { x: 0, y: 0 };

    let animationId: number;

    // Sakura petals (replacing fireflies)
    const petals: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      alphaSpeed: number;
      color: string;
    }> = [];

    // Falling rain particles
    const rain: Array<{
      x: number;
      y: number;
      vy: number;
      length: number;
      alpha: number;
    }> = [];

    // Blade aura slashes (replacing chimney sparks)
    const sparks: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      life: number;
      maxLife: number;
    }> = [];

    // Drifting forest mist clouds
    const mistClouds = [
      { x: width * 0.1, y: height * 0.55, vx: 0.15, radiusX: 180, radiusY: 40 },
      { x: width * 0.7, y: height * 0.48, vx: 0.1, radiusX: 240, radiusY: 55 },
      { x: width * 0.4, y: height * 0.62, vx: 0.08, radiusX: 160, radiusY: 35 }
    ];

    // Initialize 35 drifting sakura petals
    for (let i = 0; i < 35; i++) {
      petals.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.3) * 0.35,
        vy: Math.random() * 0.35 + 0.25, // Drift downwards
        size: Math.random() * 2.5 + 1.2,
        alpha: Math.random(),
        alphaSpeed: Math.random() * 0.01 + 0.005,
        color: Math.random() > 0.5 ? 'rgba(244, 63, 94, 0.7)' : 'rgba(251, 207, 232, 0.7)'
      });
    }

    // Initialize 60 rain particles
    for (let i = 0; i < 60; i++) {
      rain.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vy: Math.random() * 3 + 4,
        length: Math.random() * 10 + 8,
        alpha: Math.random() * 0.15 + 0.05
      });
    }

    const mouse = { x: -1000, y: -1000 };
    let lastMouseX = -1000;
    let lastMouseY = -1000;

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;

      const dxRatio = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      const dyRatio = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
      parallax.x = dxRatio * 15;
      parallax.y = dyRatio * 10;

      if (lastMouseX !== -1000 && lastMouseY !== -1000) {
        const dist = Math.hypot(mouse.x - lastMouseX, mouse.y - lastMouseY);
        if (dist > 6) {
          const spawnCount = Math.min(3, Math.floor(dist / 6));
          for (let k = 0; k < spawnCount; k++) {
            const ratio = k / spawnCount;
            const px = lastMouseX + (mouse.x - lastMouseX) * ratio;
            const py = lastMouseY + (mouse.y - lastMouseY) * ratio;
            
            // Randomly choose between Flame (orange/red) or Water (blue) slashes based on mouse speed
            const isFlame = Math.random() > 0.5;
            sparks.push({
              x: px,
              y: py,
              vx: (Math.random() - 0.5) * 0.8,
              vy: -Math.random() * 1.0 - 0.5,
              size: Math.random() * 2 + 1,
              color: isFlame 
                ? (Math.random() > 0.4 ? 'rgba(251, 146, 60, 1)' : 'rgba(239, 68, 68, 1)')
                : (Math.random() > 0.4 ? 'rgba(56, 189, 248, 1)' : 'rgba(37, 99, 235, 1)'),
              life: 30,
              maxLife: 30
            });
          }
        }
      }
      lastMouseX = mouse.x;
      lastMouseY = mouse.y;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
      lastMouseX = -1000;
      lastMouseY = -1000;
      parallax.x = 0;
      parallax.y = 0;
    };

    // Slash explosion on mouse click
    const handleMouseDown = (e: MouseEvent) => {
      for (let k = 0; k < 20; k++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3.5 + 1.2;
        const isFlame = Math.random() > 0.4;
        sparks.push({
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.5,
          size: Math.random() * 2.5 + 1.2,
          color: isFlame 
            ? (Math.random() > 0.4 ? 'rgba(251, 191, 36, 1)' : 'rgba(249, 115, 22, 1)')
            : (Math.random() > 0.4 ? 'rgba(14, 165, 233, 1)' : 'rgba(6, 182, 212, 1)'),
          life: 40,
          maxLife: 40
        });
      }
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousedown', handleMouseDown);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Sky Background Gradient (Deep anime night sky)
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, '#06040b');
      skyGrad.addColorStop(0.5, '#0c0b1e');
      skyGrad.addColorStop(1, '#1b122b');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Layer 1: Distant Hills
      ctx.fillStyle = '#0a0b16';
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.quadraticCurveTo(
        width * 0.25, 
        height * 0.68 + parallax.y * 0.2, 
        width * 0.5, 
        height * 0.74 + parallax.y * 0.2
      );
      ctx.quadraticCurveTo(
        width * 0.75, 
        height * 0.8 + parallax.y * 0.2, 
        width, 
        height * 0.7 + parallax.y * 0.2
      );
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();

      // Layer 2: Midground Hills
      ctx.fillStyle = '#05060d';
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.quadraticCurveTo(
        width * 0.35, 
        height * 0.81 + parallax.y * 0.45, 
        width * 0.65, 
        height * 0.78 + parallax.y * 0.45
      );
      ctx.quadraticCurveTo(
        width * 0.85, 
        height * 0.84 + parallax.y * 0.45, 
        width, 
        height * 0.79 + parallax.y * 0.45
      );
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();

      // Pagoda / Shinto Gate silhouette (instead of A-frame cozy cabin)
      const cx = width * 0.65 + parallax.x * 0.45;
      const cy = height * 0.79 + parallax.y * 0.45;

      // Draw Shinto Torii Gate Silhouette
      ctx.fillStyle = '#020204';
      // Pillars
      ctx.fillRect(cx - 20, cy - 35, 3.5, 35);
      ctx.fillRect(cx + 17, cy - 35, 3.5, 35);
      // Top beams
      ctx.fillRect(cx - 28, cy - 35, 56, 4.5);
      ctx.fillRect(cx - 24, cy - 40, 48, 3.5);
      // Center tie beam
      ctx.fillRect(cx - 20, cy - 26, 40, 2.5);

      // Shinto Gate ambient radial glow
      const glowPulse = 0.08 + Math.sin(Date.now() / 650) * 0.02;
      const windowGlow = ctx.createRadialGradient(cx, cy - 20, 0, cx, cy - 20, 70);
      windowGlow.addColorStop(0, `rgba(239, 68, 68, ${glowPulse})`);
      windowGlow.addColorStop(0.6, `rgba(244, 63, 94, ${glowPulse * 0.3})`);
      windowGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = windowGlow;
      ctx.beginPath();
      ctx.arc(cx, cy - 20, 70, 0, Math.PI * 2);
      ctx.fill();

      // Layer 3: Mist Clouds
      ctx.fillStyle = 'rgba(255, 255, 255, 0.012)';
      for (const m of mistClouds) {
        m.x += m.vx;
        if (m.x - m.radiusX > width) m.x = -m.radiusX;
        
        ctx.beginPath();
        ctx.ellipse(m.x, m.y + parallax.y * 0.55, m.radiusX, m.radiusY, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Layer 4: Foreground Hills
      ctx.fillStyle = '#010103';
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.quadraticCurveTo(
        width * 0.2, 
        height * 0.91 + parallax.y * 0.9, 
        width * 0.5, 
        height * 0.88 + parallax.y * 0.9
      );
      ctx.quadraticCurveTo(
        width * 0.8, 
        height * 0.92 + parallax.y * 0.9, 
        width, 
        height * 0.87 + parallax.y * 0.9
      );
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();

      // Layer 5: Particles
      // A. Rain
      const windForce = mouse.x !== -1000 ? ((mouse.x - width / 2) / (width / 2)) * 1.5 : 0.4;
      ctx.lineWidth = 1.0;
      for (const r of rain) {
        r.x += windForce;
        r.y += r.vy;

        if (r.y > height) {
          r.y = -r.length;
          r.x = Math.random() * width;
        }
        if (r.x > width) r.x = 0;
        if (r.x < 0) r.x = width;

        ctx.strokeStyle = `rgba(147, 197, 253, ${r.alpha})`;
        ctx.beginPath();
        ctx.moveTo(r.x, r.y);
        ctx.lineTo(r.x + windForce * 1.2, r.y + r.length);
        ctx.stroke();
      }

      // B. Sakura Petals (drifting)
      for (const f of petals) {
        f.x += f.vx;
        f.y += f.vy;

        if (f.y > height) {
          f.y = -5;
          f.x = Math.random() * width;
        }
        if (f.x < 0) f.x = width;
        if (f.x > width) f.x = 0;

        const dx = mouse.x - f.x;
        const dy = mouse.y - f.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 130) {
          const repelPower = (130 - dist) / 130;
          f.x -= (dx / dist) * repelPower * 1.8;
          f.y -= (dy / dist) * repelPower * 1.8;
        }

        f.alpha += f.alphaSpeed;
        if (f.alpha > 0.9 || f.alpha < 0.15) {
          f.alphaSpeed = -f.alphaSpeed;
        }

        ctx.beginPath();
        // Slightly oval shape representing sakura petals
        ctx.ellipse(f.x, f.y, f.size, f.size * 0.6, Math.PI / 4 + f.y * 0.005, 0, Math.PI * 2);
        ctx.fillStyle = f.color.replace('0.7', `${f.alpha * 0.65}`);
        
        ctx.shadowBlur = 4;
        ctx.shadowColor = f.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // C. Blade Aura Slashes
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        const prevX = s.x;
        const prevY = s.y;

        s.x += s.vx + Math.sin(s.life * 0.08) * 0.2;
        s.y += s.vy;
        s.life--;

        if (s.life <= 0) {
          sparks.splice(i, 1);
          continue;
        }

        const pct = s.life / s.maxLife;
        const opacity = pct * 0.85;

        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(s.x, s.y);
        ctx.strokeStyle = s.color.replace('1)', `${opacity})`);
        ctx.lineWidth = s.size * (0.4 + pct * 1.6);
        ctx.lineCap = 'round';
        
        ctx.shadowBlur = 8;
        ctx.shadowColor = s.color;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousedown', handleMouseDown);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden z-0 pointer-events-none no-print">
      {settings.theme === 'dark' && (
        <>
          <img
            src={hashiraGif}
            className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none opacity-[0.22] mix-blend-screen"
            alt="Hashiras Background"
          />
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/75" />
          <div className="absolute inset-0 bg-radial-vignette pointer-events-none" />
        </>
      )}
    </div>
  );
};
