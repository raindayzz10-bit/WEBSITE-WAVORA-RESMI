import React, { useEffect, useRef } from 'react';

interface Bubble {
  x: number;
  y: number;
  radius: number;
  speedY: number;
  speedX: number;
  alpha: number;
  wobbleSpeed: number;
  wobbleDistance: number;
  wobbleAngle: number;
  hue: number;
}

interface CausticWave {
  x: number;
  length: number;
  amplitude: number;
  frequency: number;
  phase: number;
  speed: number;
  alpha: number;
}

export const WaterCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number; active: boolean; radius: number }>({
    x: -1000,
    y: -1000,
    active: false,
    radius: 120,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Initialize bubbles
    const bubbleCount = Math.min(Math.floor(width / 35), 45);
    const bubbles: Bubble[] = [];

    for (let i = 0; i < bubbleCount; i++) {
      bubbles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 8 + 2.5,
        speedY: Math.random() * 0.7 + 0.3,
        speedX: (Math.random() - 0.5) * 0.3,
        alpha: Math.random() * 0.4 + 0.15,
        wobbleSpeed: Math.random() * 0.02 + 0.01,
        wobbleDistance: Math.random() * 1.5 + 0.5,
        wobbleAngle: Math.random() * Math.PI * 2,
        hue: 180 + Math.random() * 25, // Cyan to teal hues
      });
    }

    // Initialize caustics waves
    const causticWaves: CausticWave[] = [
      { x: 0, length: width, amplitude: 35, frequency: 0.003, phase: 0, speed: 0.008, alpha: 0.04 },
      { x: 0, length: width, amplitude: 22, frequency: 0.005, phase: 2, speed: 0.012, alpha: 0.035 },
      { x: 0, length: width, amplitude: 45, frequency: 0.002, phase: 4, speed: 0.006, alpha: 0.03 },
    ];

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      causticWaves.forEach((w) => (w.length = width));
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    let time = 0;

    const render = () => {
      time += 1;
      ctx.clearRect(0, 0, width, height);

      // 1. Gentle caustic top water shimmer beams
      causticWaves.forEach((wave) => {
        wave.phase += wave.speed;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(0, 0);

        for (let x = 0; x <= width; x += 15) {
          const y =
            Math.sin(x * wave.frequency + wave.phase) * wave.amplitude +
            Math.cos(x * 0.001 + wave.phase * 0.7) * (wave.amplitude * 0.5) +
            80;
          ctx.lineTo(x, y);
        }

        ctx.lineTo(width, 0);
        ctx.closePath();

        const grad = ctx.createLinearGradient(0, 0, 0, 220);
        grad.addColorStop(0, `rgba(6, 182, 212, ${wave.alpha * 1.5})`);
        grad.addColorStop(0.6, `rgba(20, 184, 166, ${wave.alpha})`);
        grad.addColorStop(1, 'rgba(3, 8, 18, 0)');
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();
      });

      // 2. Mouse Glow Spotlight
      if (mouseRef.current.active) {
        const { x, y, radius } = mouseRef.current;
        const mouseGrad = ctx.createRadialGradient(x, y, 0, x, y, radius * 2.5);
        mouseGrad.addColorStop(0, 'rgba(6, 182, 212, 0.12)');
        mouseGrad.addColorStop(0.5, 'rgba(20, 184, 166, 0.04)');
        mouseGrad.addColorStop(1, 'rgba(3, 8, 18, 0)');

        ctx.save();
        ctx.fillStyle = mouseGrad;
        ctx.fillRect(x - radius * 2.5, y - radius * 2.5, radius * 5, radius * 5);
        ctx.restore();
      }

      // 3. Floating bubbles
      bubbles.forEach((b) => {
        b.y -= b.speedY;
        b.wobbleAngle += b.wobbleSpeed;
        const currentX = b.x + Math.sin(b.wobbleAngle) * b.wobbleDistance;

        // Interaction with mouse - push away softly
        if (mouseRef.current.active) {
          const dx = currentX - mouseRef.current.x;
          const dy = b.y - mouseRef.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouseRef.current.radius) {
            const angle = Math.atan2(dy, dx);
            const force = (mouseRef.current.radius - dist) / mouseRef.current.radius;
            b.x += Math.cos(angle) * force * 2;
            b.y += Math.sin(angle) * force * 2;
          }
        }

        // Reset if bubble floats above top
        if (b.y < -30) {
          b.y = height + 20;
          b.x = Math.random() * width;
        }

        // Draw bubble with glass refraction
        ctx.save();
        ctx.beginPath();
        ctx.arc(currentX, b.y, b.radius, 0, Math.PI * 2);

        // Bubble body gradient
        const bubbleGrad = ctx.createRadialGradient(
          currentX - b.radius * 0.35,
          b.y - b.radius * 0.35,
          b.radius * 0.1,
          currentX,
          b.y,
          b.radius
        );
        bubbleGrad.addColorStop(0, `hsla(${b.hue}, 90%, 90%, ${b.alpha * 1.3})`);
        bubbleGrad.addColorStop(0.7, `hsla(${b.hue}, 80%, 65%, ${b.alpha * 0.6})`);
        bubbleGrad.addColorStop(1, `hsla(${b.hue}, 95%, 45%, ${b.alpha * 0.1})`);

        ctx.fillStyle = bubbleGrad;
        ctx.fill();

        // Rim highlight
        ctx.lineWidth = 1;
        ctx.strokeStyle = `hsla(${b.hue}, 80%, 75%, ${b.alpha * 0.8})`;
        ctx.stroke();

        // White reflection specular dot
        ctx.beginPath();
        ctx.arc(
          currentX - b.radius * 0.35,
          b.y - b.radius * 0.35,
          b.radius * 0.22,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = `rgba(255, 255, 255, ${b.alpha * 1.6})`;
        ctx.fill();

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="water-canvas-ambient"
      className="fixed inset-0 pointer-events-none z-0 opacity-80"
      aria-hidden="true"
    />
  );
};
