import { useEffect, useRef } from 'react';
import { useBujo } from '../../context/BujoContext';

export const CozyCabinBackground = () => {
  const { settings } = useBujo();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const videoFadeFrameRef = useRef<number | null>(null);
  const fadingOutRef = useRef<boolean>(false);

  // Video looping engine logic
  const animateOpacity = (targetOpacity: number, duration: number, callback?: () => void) => {
    if (videoFadeFrameRef.current) {
      cancelAnimationFrame(videoFadeFrameRef.current);
    }
    const video = videoRef.current;
    if (!video) return;

    const startOpacity = parseFloat(video.style.opacity || '0');
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const currentOpacity = startOpacity + (targetOpacity - startOpacity) * progress;
      video.style.opacity = currentOpacity.toString();

      if (progress < 1) {
        videoFadeFrameRef.current = requestAnimationFrame(step);
      } else {
        videoFadeFrameRef.current = null;
        if (callback) callback();
      }
    };

    videoFadeFrameRef.current = requestAnimationFrame(step);
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !video.duration) return;

    const remainingTime = video.duration - video.currentTime;
    if (remainingTime <= 0.55 && !fadingOutRef.current) {
      fadingOutRef.current = true;
      animateOpacity(0, 500);
    }
  };

  const handleEnded = () => {
    const video = videoRef.current;
    if (!video) return;

    video.style.opacity = '0';
    setTimeout(() => {
      fadingOutRef.current = false;
      video.currentTime = 0;
      video.play()
        .then(() => {
          animateOpacity(1, 500);
        })
        .catch((err) => {
          console.error("Video loop autoplay failed:", err);
          animateOpacity(1, 500);
        });
    }, 100);
  };

  const handleLoadedData = () => {
    const video = videoRef.current;
    if (!video) return;
    video.style.opacity = '0';
    video.play()
      .then(() => {
        animateOpacity(1, 500);
      })
      .catch((err) => {
        console.error("Video autoplay on load failed:", err);
        animateOpacity(1, 500);
      });
  };

  useEffect(() => {
    if (settings.theme === 'dark') {
      const video = videoRef.current;
      if (video) {
        video.style.opacity = '0';
        if (video.readyState >= 2) {
          video.play()
            .then(() => {
              animateOpacity(1, 500);
            })
            .catch((err) => console.log("Video looper delayed setup:", err));
        }
      }
    }
    return () => {
      if (videoFadeFrameRef.current) {
        cancelAnimationFrame(videoFadeFrameRef.current);
      }
    };
  }, [settings.theme]);

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

    // Fireflies particles
    const fireflies: Array<{
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

    // Chimney sparks (embers) mouse trail & chimney emissions
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

    // Initialize 35 drifting fireflies
    for (let i = 0; i < 35; i++) {
      fireflies.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        size: Math.random() * 2 + 1,
        alpha: Math.random(),
        alphaSpeed: Math.random() * 0.01 + 0.005,
        color: Math.random() > 0.5 ? 'rgba(163, 230, 53, 0.7)' : 'rgba(234, 179, 8, 0.7)'
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
            sparks.push({
              x: px,
              y: py,
              vx: (Math.random() - 0.5) * 0.6,
              vy: -Math.random() * 1.2 - 0.6,
              size: Math.random() * 2 + 1,
              color: Math.random() > 0.4 ? 'rgba(251, 146, 60, 1)' : 'rgba(239, 68, 68, 1)',
              life: 40,
              maxLife: 40
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

    const handleMouseDown = (e: MouseEvent) => {
      for (let k = 0; k < 15; k++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 2 + 0.8;
        sparks.push({
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.8,
          size: Math.random() * 2.5 + 1,
          color: Math.random() > 0.4 ? 'rgba(251, 191, 36, 1)' : 'rgba(249, 115, 22, 1)',
          life: 45,
          maxLife: 45
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

      // Sky Background Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, '#030206');
      skyGrad.addColorStop(0.6, '#080816');
      skyGrad.addColorStop(1, '#1a1226');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Layer 1: Distant Hills
      ctx.fillStyle = '#0a0d18';
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.quadraticCurveTo(
        width * 0.25, 
        height * 0.65 + parallax.y * 0.2, 
        width * 0.5, 
        height * 0.72 + parallax.y * 0.2
      );
      ctx.quadraticCurveTo(
        width * 0.75, 
        height * 0.78 + parallax.y * 0.2, 
        width, 
        height * 0.68 + parallax.y * 0.2
      );
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();

      // Layer 2: Midground Hills & Chalet
      ctx.fillStyle = '#05070e';
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.quadraticCurveTo(
        width * 0.35, 
        height * 0.78 + parallax.y * 0.45, 
        width * 0.65, 
        height * 0.75 + parallax.y * 0.45
      );
      ctx.quadraticCurveTo(
        width * 0.85, 
        height * 0.82 + parallax.y * 0.45, 
        width, 
        height * 0.76 + parallax.y * 0.45
      );
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();

      // A-frame Cozy Chalet
      const cx = width * 0.65 + parallax.x * 0.45;
      const cy = height * 0.76 + parallax.y * 0.45;

      ctx.fillStyle = '#020305';
      ctx.beginPath();
      ctx.moveTo(cx - 35, cy);
      ctx.lineTo(cx, cy - 60);
      ctx.lineTo(cx + 35, cy);
      ctx.closePath();
      ctx.fill();

      // Fireplace Flicker
      const fireFlicker = Math.random();
      const fireAlpha = 0.55 + fireFlicker * 0.25;
      ctx.fillStyle = `rgba(249, 115, 22, ${fireAlpha})`;
      ctx.beginPath();
      ctx.rect(cx - 7, cy - 18, 14, 18);
      ctx.fill();

      ctx.fillStyle = '#070a14';
      ctx.fillRect(cx - 5, cy - 3, 10, 3);

      // Triangular loft window glow
      ctx.fillStyle = `rgba(251, 191, 36, ${0.4 + Math.sin(Date.now() / 350) * 0.15})`;
      ctx.beginPath();
      ctx.moveTo(cx - 6, cy - 35);
      ctx.lineTo(cx, cy - 47);
      ctx.lineTo(cx + 6, cy - 35);
      ctx.closePath();
      ctx.fill();

      // Roof glow
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.22)';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(cx - 36, cy);
      ctx.lineTo(cx, cy - 61);
      ctx.lineTo(cx + 36, cy);
      ctx.stroke();

      // Fireplace ambient radial glow
      const glowPulse = 0.1 + Math.sin(Date.now() / 650) * 0.03;
      const windowGlow = ctx.createRadialGradient(cx, cy - 10, 0, cx, cy - 10, 80);
      windowGlow.addColorStop(0, `rgba(251, 146, 60, ${glowPulse})`);
      windowGlow.addColorStop(0.6, `rgba(239, 68, 68, ${glowPulse * 0.3})`);
      windowGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = windowGlow;
      ctx.beginPath();
      ctx.arc(cx, cy - 10, 80, 0, Math.PI * 2);
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
      ctx.fillStyle = '#020306';
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.quadraticCurveTo(
        width * 0.2, 
        height * 0.88 + parallax.y * 0.9, 
        width * 0.5, 
        height * 0.85 + parallax.y * 0.9
      );
      ctx.quadraticCurveTo(
        width * 0.8, 
        height * 0.9 + parallax.y * 0.9, 
        width, 
        height * 0.84 + parallax.y * 0.9
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

      // B. Fireflies
      for (const f of fireflies) {
        f.x += f.vx;
        f.y += f.vy;

        if (f.x < 0 || f.x > width) f.vx *= -1;
        if (f.y < 0 || f.y > height) f.vy *= -1;

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
        ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
        ctx.fillStyle = f.color.replace('0.7', `${f.alpha * 0.65}`);
        
        ctx.shadowBlur = 6;
        ctx.shadowColor = f.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // C. Chimney Sparks
      if (Math.random() < 0.18) {
        sparks.push({
          x: cx - 10 + (Math.random() - 0.5) * 6,
          y: cy - 42,
          vx: (Math.random() - 0.5) * 0.4 + windForce * 0.5,
          vy: -Math.random() * 1.5 - 0.8,
          size: Math.random() * 1.8 + 0.8,
          color: 'rgba(251, 146, 60, 1)',
          life: 45,
          maxLife: 45
        });
      }

      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx + Math.sin(s.life * 0.08) * 0.2;
        s.y += s.vy;
        s.life--;

        if (s.life <= 0) {
          sparks.splice(i, 1);
          continue;
        }

        const pct = s.life / s.maxLife;
        const opacity = pct * 0.8;

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * (0.3 + pct * 0.7), 0, Math.PI * 2);
        ctx.fillStyle = s.color.replace('1)', `${opacity})`);
        
        ctx.shadowBlur = 4;
        ctx.shadowColor = s.color;
        ctx.fill();
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
          <video
            ref={videoRef}
            className="absolute top-0 left-0 w-full h-full object-cover translate-y-[17%] transition-none pointer-events-none"
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_115001_bcdaa3b4-03de-47e7-ad63-ae3e392c32d4.mp4"
            muted
            playsInline
            autoPlay
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
            onLoadedData={handleLoadedData}
            style={{ opacity: 0 }}
          />
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/80" />
          <div className="absolute inset-0 bg-radial-vignette pointer-events-none" />
        </>
      )}
    </div>
  );
};
