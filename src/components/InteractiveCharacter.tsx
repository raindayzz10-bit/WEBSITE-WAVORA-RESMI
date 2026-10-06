// ============================================================================
// FILE: src/components/InteractiveCharacter.tsx
// WAVORA — INTERACTIVE ATHLETE 3D & NATURAL BLINKING EXPERIENCE
// ============================================================================
import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Eye, Sparkles, Compass, ShieldCheck, ArrowRight } from 'lucide-react';

interface InteractiveCharacterProps {
  onRegisterClick?: () => void;
  onExplorePrograms?: () => void;
}

export const InteractiveCharacter: React.FC<InteractiveCharacterProps> = ({
  onRegisterClick,
  onExplorePrograms,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const eyeLayerRef = useRef<HTMLDivElement | null>(null);
  const specularRef = useRef<HTMLDivElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);

  const [isBlinking, setIsBlinking] = useState(false);
  const [isTracking, setIsTracking] = useState(true);

  // Smooth lerp physics state
  const mousePos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });
  const animFrameId = useRef<number | null>(null);

  // 1. MOUSE & TOUCH TRACKING (HEAD & GAZE ORIENTATION)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isTracking) return;
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) {
        mousePos.current = {
          x: (e.clientX / window.innerWidth - 0.5) * 2,
          y: (e.clientY / window.innerHeight - 0.5) * 2,
        };
        return;
      }

      // Hitung koordinat relatif dari pusat stage
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      mousePos.current = {
        x: Math.max(-1.5, Math.min(1.5, (e.clientX - centerX) / (rect.width / 2))),
        y: Math.max(-1.5, Math.min(1.5, (e.clientY - centerY) / (rect.height / 2))),
      };
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isTracking || e.touches.length === 0) return;
      const touch = e.touches[0];
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      mousePos.current = {
        x: Math.max(-1.5, Math.min(1.5, (touch.clientX - centerX) / (rect.width / 2))),
        y: Math.max(-1.5, Math.min(1.5, (touch.clientY - centerY) / (rect.height / 2))),
      };
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    // Smooth Lerp Render Loop
    const render = () => {
      currentPos.current.x += (mousePos.current.x - currentPos.current.x) * 0.08;
      currentPos.current.y += (mousePos.current.y - currentPos.current.y) * 0.08;

      const { x, y } = currentPos.current;

      // Rotasi 3D Stage
      if (stageRef.current) {
        const rotateY = x * 18; // Menoleh ke kiri/kanan (maksimal 18 derajat)
        const rotateX = -y * 12; // Menunduk/mendongak (maksimal 12 derajat)
        stageRef.current.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      }

      // Parallax Shift pada layer foto & mata
      const imgOffsetX = x * 12;
      const imgOffsetY = y * 8;

      if (imgRef.current) {
        imgRef.current.style.transform = `scale(1.08) translate(${imgOffsetX}px, ${imgOffsetY}px)`;
      }

      if (eyeLayerRef.current) {
        eyeLayerRef.current.style.transform = `translate(${imgOffsetX * 1.2}px, ${imgOffsetY * 1.2}px)`;
      }

      // Dynamic Specular Highlight Refraction
      if (specularRef.current) {
        const lightX = 50 + x * 25;
        const lightY = 50 + y * 25;
        specularRef.current.style.background = `radial-gradient(circle at ${lightX}% ${lightY}%, rgba(34, 211, 238, 0.3) 0%, transparent 60%)`;
      }

      // Ambient Glow Shift
      if (glowRef.current) {
        glowRef.current.style.transform = `translate(${x * 80}px, ${y * 80}px)`;
      }

      animFrameId.current = requestAnimationFrame(render);
    };

    animFrameId.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [isTracking]);

  // 2. NATURAL BLINKING ENGINE (Siklus Kedipan Otomatis + Double Blink)
  useEffect(() => {
    let blinkTimer: NodeJS.Timeout;

    const triggerBlink = () => {
      setIsBlinking(true);

      setTimeout(() => {
        setIsBlinking(false);
      }, 130);

      // Random double blink
      if (Math.random() > 0.75) {
        setTimeout(() => {
          setIsBlinking(true);
          setTimeout(() => {
            setIsBlinking(false);
          }, 120);
        }, 240);
      }

      const nextBlink = 2400 + Math.random() * 3200;
      blinkTimer = setTimeout(triggerBlink, nextBlink);
    };

    blinkTimer = setTimeout(triggerBlink, 2000);

    return () => clearTimeout(blinkTimer);
  }, []);

  return (
    <section
      id="interactive-athlete-section"
      className="py-24 px-4 sm:px-6 lg:px-8 bg-[#020713] relative border-t border-slate-900 overflow-hidden select-none"
    >
      {/* Background Deep Ocean Atmospheric Lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-12 relative z-10">
        {/* Section Heading */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-cyan-950/80 text-cyan-400 rounded-full border border-cyan-500/30 text-[10px] font-mono tracking-widest uppercase shadow-md shadow-cyan-500/10"
          >
            <Eye className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>INTERACTIVE ATHLETE AVATAR • WOS v3.0</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-heading font-black text-2xl sm:text-4xl lg:text-5xl uppercase tracking-tight text-white"
          >
            FOKUS PRESTASI &amp;{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-sky-400">
              DISIPLIN TINGGI
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-slate-400 text-xs sm:text-sm md:text-base font-sans leading-relaxed"
          >
            Gerakkan kursor atau geser layar ponsel Anda untuk melihat respons arah pandang atlet WAVORA. Pendekatan saintifik kami melatih konsentrasi dan ketenangan mental di bawah tekanan air.
          </motion.p>
        </div>

        {/* 3D Interactive Stage Container */}
        <div
          ref={containerRef}
          className="relative w-full flex items-center justify-center"
          style={{ perspective: '1200px' }}
        >
          {/* Ambient Glow that follows cursor */}
          <div
            ref={glowRef}
            className="absolute w-[450px] sm:w-[600px] h-[450px] sm:h-[600px] rounded-full bg-cyan-500/15 blur-[90px] pointer-events-none transition-transform duration-200"
          />

          {/* Character 3D Stage Card */}
          <div
            ref={stageRef}
            className="relative w-full max-w-[480px] aspect-[4/5] rounded-[32px] sm:rounded-[36px] overflow-hidden border border-cyan-500/30 bg-[#030a17] shadow-[0_30px_80px_rgba(0,0,0,0.8),0_0_50px_rgba(6,182,212,0.2)] transition-shadow duration-300"
            style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
          >
            {/* Character Base Image */}
            <img
              ref={imgRef}
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80"
              alt="WAVORA Athletic Character"
              className="w-full h-full object-cover object-top filter brightness-[0.92] contrast-[1.05] transition-transform duration-100 ease-out"
            />

            {/* Eye Layer with Natural Blinking Engine */}
            <div
              ref={eyeLayerRef}
              className={`absolute pointer-events-none z-10 flex justify-between transition-transform duration-100 ease-out ${
                isBlinking ? 'is-blinking' : ''
              }`}
              style={{
                top: '22.8%',
                left: '36.8%',
                width: '11.5%',
                height: '4.8%',
              }}
            >
              {/* Left Eyelid */}
              <div
                className="w-[44%] h-full rounded-full bg-[#1e1b29] transition-all duration-75 ease-in-out shadow-md"
                style={{
                  opacity: isBlinking ? 0.95 : 0,
                  transform: isBlinking ? 'scaleY(1)' : 'scaleY(0.1)',
                  transformOrigin: 'top center',
                }}
              />
              {/* Right Eyelid */}
              <div
                className="w-[44%] h-full rounded-full bg-[#1e1b29] transition-all duration-75 ease-in-out shadow-md"
                style={{
                  opacity: isBlinking ? 0.95 : 0,
                  transform: isBlinking ? 'scaleY(1)' : 'scaleY(0.1)',
                  transformOrigin: 'top center',
                }}
              />
            </div>

            {/* Dynamic Specular Water/Light Refraction */}
            <div
              ref={specularRef}
              className="absolute inset-0 pointer-events-none mix-blend-screen opacity-75 z-20"
              style={{
                background:
                  'radial-gradient(circle at 50% 50%, rgba(34, 211, 238, 0.28) 0%, transparent 60%)',
              }}
            />

            {/* Subtle Vignette Frame */}
            <div className="absolute inset-0 pointer-events-none z-20 bg-gradient-to-t from-[#020713] via-transparent to-[#020713]/30" />

            {/* UI Overlay Badges */}
            <div className="absolute bottom-5 left-5 right-5 z-30 flex items-center justify-between gap-3 pointer-events-none">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#030b18]/85 border border-cyan-500/30 backdrop-blur-md text-[10px] font-mono text-cyan-300 pointer-events-auto">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
                </span>
                <span>EYE TRACKING • ACTIVE</span>
              </div>

              <div className="bg-[#030b18]/85 border border-cyan-500/30 backdrop-blur-md rounded-2xl px-3.5 py-2 text-right pointer-events-auto">
                <strong className="block font-heading font-bold text-xs text-white">
                  WAVORA v3.0 ATHLETE
                </strong>
                <span className="text-[10px] font-mono text-slate-400">
                  Gerakkan kursor untuk menoleh
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights & Quick Action */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto pt-4">
          <div className="p-4 rounded-2xl bg-[#040e1e]/60 border border-cyan-500/20 backdrop-blur-md flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-cyan-950/80 text-cyan-400 border border-cyan-500/30">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-heading font-bold text-sm text-white">Head Orientation</h4>
              <p className="text-xs text-slate-400 font-mono">Real-time dynamic tilt</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#040e1e]/60 border border-cyan-500/20 backdrop-blur-md flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-cyan-950/80 text-cyan-400 border border-cyan-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-heading font-bold text-sm text-white">Natural Blinking</h4>
              <p className="text-xs text-slate-400 font-mono">Autonomous eye cycle</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#040e1e]/60 border border-cyan-500/20 backdrop-blur-md flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-cyan-950/80 text-cyan-400 border border-cyan-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-heading font-bold text-sm text-white">Mental Discipline</h4>
              <p className="text-xs text-slate-400 font-mono">Fokus juara tanpa trauma</p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        {onRegisterClick && (
          <div className="text-center pt-2">
            <button
              onClick={onRegisterClick}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-cyan-400 via-teal-300 to-sky-400 hover:from-cyan-300 hover:to-teal-200 text-slate-950 font-heading font-black text-xs tracking-widest uppercase rounded-full shadow-lg shadow-cyan-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>Daftar Latihan Bersama Kami</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
