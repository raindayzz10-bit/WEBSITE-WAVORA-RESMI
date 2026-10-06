import React, { useState, useEffect } from 'react';
import { motion, useScroll, useSpring, useTransform, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { smoothScrollTo } from '../utils/smoothScroll';

interface InteractiveDolphinProps {
  onRegisterClick?: () => void;
  dolphinImgSrc?: string;
}

export const InteractiveDolphin: React.FC<InteractiveDolphinProps> = ({
  onRegisterClick,
}) => {
  const { scrollYProgress, scrollY } = useScroll();
  const [speechText, setSpeechText] = useState('Halo! Siap mulai petualangan renangmu bareng WAVORA? 🌊');
  const [isSpinning, setIsSpinning] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<'down' | 'up'>('down');
  const [lastY, setLastY] = useState(0);

  // Smooth scroll progress spring for buoyant, organic floating
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 80, damping: 22 });

  // Dynamic vertical movement across screen (14vh to 68vh so it never overlaps floating buttons)
  const dolphinY = useTransform(smoothProgress, [0, 1], ['14vh', '68vh']);

  // Scroll direction tracking for pitch tilt & contextual messaging
  useEffect(() => {
    return scrollY.on('change', (current) => {
      if (current > lastY + 4) {
        setScrollDirection('down');
      } else if (current < lastY - 4) {
        setScrollDirection('up');
      }
      setLastY(current);

      const totalScrollable = document.documentElement.scrollHeight - window.innerHeight;
      const progress = totalScrollable > 0 ? current / totalScrollable : 0;

      if (progress < 0.15) {
        setSpeechText('Yuk mulai renang bareng WAVORA! 🌊');
      } else if (progress >= 0.15 && progress < 0.35) {
        setSpeechText('Rasio 1:4-5, metode ramah & bebas trauma! 🏊');
      } else if (progress >= 0.35 && progress < 0.55) {
        setSpeechText('Cek simulasi biaya & pilih jadwal fleksibel! 💡');
      } else if (progress >= 0.55 && progress < 0.75) {
        setSpeechText('Penasaran level renang? Ada asesmen online! 🏆');
      } else if (progress >= 0.75 && progress < 0.9) {
        setSpeechText('Kolam Pahoman & UNILA siap menyambutmu! 📍');
      } else {
        setSpeechText('Yuk klik aku buat langsung daftar sekarang! ✨');
      }
    });
  }, [scrollY, lastY]);

  const handleCrestClick = () => {
    setIsSpinning(true);
    setTimeout(() => setIsSpinning(false), 900);

    // Smooth-scroll directly to #pendaftaran / registration section
    if (onRegisterClick) {
      onRegisterClick();
    } else {
      smoothScrollTo('#pendaftaran', { offset: -60, duration: 1.4 });
    }
  };

  return (
    <motion.div
      style={{ top: dolphinY }}
      className="fixed right-3 sm:right-6 z-40 flex items-center pointer-events-none select-none"
    >
      {/* Dynamic Contextual Dialog Bubble */}
      <AnimatePresence mode="wait">
        <motion.div
          key={speechText}
          initial={{ opacity: 0, x: 20, scale: 0.85 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 20, scale: 0.85 }}
          transition={{ duration: 0.3 }}
          className="hidden md:flex items-center gap-2 mr-3 px-3.5 py-2 rounded-2xl bg-[#030d22]/90 border border-cyan-500/40 text-cyan-200 text-xs font-sans shadow-2xl backdrop-blur-xl max-w-[220px] pointer-events-auto"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 animate-pulse" />
          <span className="leading-snug">{speechText}</span>
        </motion.div>
      </AnimatePresence>

      {/* Futuristic Bioluminescent W-Star Crest Emblem */}
      <motion.div
        animate={{
          rotate: isSpinning ? 360 : scrollDirection === 'down' ? 10 : -10,
          y: [-3, 3, -3],
        }}
        transition={{
          rotate: { duration: isSpinning ? 0.85 : 0.35, ease: 'easeOut' },
          y: { duration: 2.8, repeat: Infinity, ease: 'easeInOut' },
        }}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.94 }}
        onClick={handleCrestClick}
        className="relative cursor-pointer pointer-events-auto group w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center"
        title="Klik untuk konsultasi & daftar renang!"
      >
        {/* Bioluminescent Outer Glow */}
        <div className="absolute inset-0 bg-cyan-400/25 rounded-full blur-xl group-hover:bg-cyan-400/50 group-hover:scale-125 transition-all duration-300" />

        {/* Outer Orbit Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full border border-dashed border-cyan-400/40 group-hover:border-cyan-300/70"
        />

        {/* Rotating Sparkle Burst on Click */}
        {isSpinning && (
          <motion.div
            initial={{ scale: 0.6, opacity: 1 }}
            animate={{ scale: 1.6, opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 rounded-full border-2 border-cyan-300 pointer-events-none"
          />
        )}

        {/* Athletic 'W' Aquatic Crest Artwork */}
        <div className="relative w-full h-full rounded-full bg-gradient-to-b from-[#061833] to-[#020713] border-2 border-cyan-400/60 p-2 flex items-center justify-center shadow-[0_0_25px_rgba(6,182,212,0.4)] overflow-hidden">
          {/* Subtle wave highlight */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-cyan-400/10 to-transparent pointer-events-none" />

          {/* SVG Crest Monogram & Aquatic Star */}
          <svg
            viewBox="0 0 64 64"
            className="w-full h-full text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] filter"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="crestGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#67e8f9" />
                <stop offset="50%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>
              <linearGradient id="starGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>
            </defs>

            {/* Stylized Dynamic Athletic 'W' with Water Flow Lines */}
            <path
              d="M12 20L20 44L28 26L34 38L42 20"
              stroke="url(#crestGrad)"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Wave Base Underscore */}
            <path
              d="M16 48C22 46 26 50 32 48C38 46 42 50 48 48"
              stroke="#22d3ee"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.85"
            />

            {/* 4-Point Radiant Aquatic Star ✦ */}
            <g transform="translate(42, 10)">
              <path
                d="M8 0L9.8 5.6L16 8L9.8 10.4L8 16L6.2 10.4L0 8L6.2 5.6Z"
                fill="url(#starGrad)"
                className="animate-pulse"
              />
              <circle cx="8" cy="8" r="1.5" fill="#ffffff" />
            </g>
          </svg>
        </div>

        {/* Micro-Bubble Trail */}
        <motion.div
          animate={{ opacity: [0.3, 0.85, 0], y: [0, 16], x: [-3, -6], scale: [0.5, 1.1] }}
          transition={{ duration: 1.3, repeat: Infinity, ease: 'easeOut' }}
          className="absolute -bottom-2 right-3 w-2 h-2 rounded-full bg-cyan-300/70 blur-[0.5px]"
        />
        <motion.div
          animate={{ opacity: [0.2, 0.75, 0], y: [0, 20], x: [2, 5], scale: [0.4, 1.0] }}
          transition={{ duration: 1.7, repeat: Infinity, ease: 'easeOut', delay: 0.4 }}
          className="absolute -bottom-3 right-5 w-1.5 h-1.5 rounded-full bg-teal-300/60 blur-[0.5px]"
        />
      </motion.div>
    </motion.div>
  );
};
