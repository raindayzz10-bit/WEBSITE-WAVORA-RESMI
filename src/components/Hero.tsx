// ============================================================================
// FILE: src/components/Hero.tsx (FULL-BLEED CINEMATIC CHARACTER HERO - LUMORA STYLE)
// ============================================================================
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ArrowUpRight, Star, ChevronLeft, ChevronRight, Waves } from 'lucide-react';

interface HeroProps {
  onRegisterClick: () => void;
  onExploreClick?: () => void;
  onExplorePrograms?: () => void;
  onOpenQuiz?: () => void;
  onOpenSchedule?: () => void;
  onOpenBuddySquadPromo?: () => void;
}

const CAROUSEL_ITEMS = [
  {
    caption: 'ADAPTASI AIR RAMAH ANAK',
    title: 'Bina percaya diri tanpa rasa takut & trauma.',
  },
  {
    caption: 'PROMO BUDDY SQUAD (2-4 ANAK)',
    title: 'Berenang bareng sahabat & dapatkan diskon kolektif.',
  },
  {
    caption: 'BIOMEKANIKA SAINTIFIK',
    title: 'Koreksi kayuhan presisi standar World Aquatics.',
  },
  {
    caption: 'SQUAD ATLET PRESTASI',
    title: 'Persiapan intensif menuju ajang perlombaan bergengsi.',
  },
];

const POOL_LOCATIONS = [
  'Kolam Pahoman',
  'Kolam Unila',
];

export const Hero: React.FC<HeroProps> = ({
  onRegisterClick,
  onExploreClick,
  onExplorePrograms,
  onOpenBuddySquadPromo,
}) => {
  const handleExplore = onExploreClick || onExplorePrograms || (() => {});

  // Mouse & Touch Tracking State
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Carousel State
  const [activeCardIndex, setActiveCardIndex] = useState(0);

  // Avatar Image Source Handling (Fallback Sequence)
  const [avatarSrc, setAvatarSrc] = useState<string>(() => {
    return (
      localStorage.getItem('wavora_athlete_custom_img') ||
      '/wavora.hero.png'
    );
  });

  // Fallback images sequence
  const fallbackImages = [
    '/wavora-hero.png',
    '/ChatGPT Image Sep 5, 2026, 11_01_34 PM.png',
    '/ChatGPT Image Sep 4, 2026, 08_46_04 PM.png',
    '/wavora-athlete.png',
    '/Rhb_RBS_ Photo.jpg',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1600&q=80',
  ];
  const [fallbackIndex, setFallbackIndex] = useState(0);

  const handleImageError = () => {
    if (fallbackIndex < fallbackImages.length) {
      setAvatarSrc(fallbackImages[fallbackIndex]);
      setFallbackIndex((prev) => prev + 1);
    }
  };

  // 1. MOUSE & TOUCH TRACKING ENGINE (SMOOTH DYNAMIC ORIENTATION)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const nx = (e.clientX / innerWidth - 0.5) * 2;
      const ny = (e.clientY / innerHeight - 0.5) * 2;
      setMousePos({ x: nx, y: ny });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const { innerWidth, innerHeight } = window;
        const nx = (e.touches[0].clientX / innerWidth - 0.5) * 2;
        const ny = (e.touches[0].clientY / innerHeight - 0.5) * 2;
        setMousePos({ x: nx, y: ny });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  // Auto advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveCardIndex((prev) => (prev + 1) % CAROUSEL_ITEMS.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  // Responsive Parallax Translations
  const imgShiftX = mousePos.x * 16;
  const imgShiftY = mousePos.y * 10;

  return (
    <section
      id="beranda"
      ref={containerRef}
      className="relative min-h-[96vh] lg:min-h-screen w-full flex flex-col justify-between pt-28 sm:pt-36 pb-8 sm:pb-12 px-4 sm:px-8 lg:px-14 bg-[#030816] overflow-hidden select-none rounded-b-[2.5rem] sm:rounded-b-[3.5rem] shadow-2xl border-b border-slate-800/80"
    >
      {/* Anchor for nav scroll */}
      <div id="hero-section" className="absolute top-0 left-0 w-0 h-0 pointer-events-none" />

      {/* ===================================================================
          1. FULL-BLEED CHARACTER VISUAL (SEPERTI REFERENSI GAMBAR KE-2)
          =================================================================== */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Full-bleed Athlete Background Image */}
        <motion.div
          animate={{
            x: imgShiftX,
            y: imgShiftY,
          }}
          transition={{ type: 'spring', stiffness: 80, damping: 18 }}
          className="absolute -inset-10 w-[calc(100%+80px)] h-[calc(100%+80px)]"
        >
          <img
            src={avatarSrc}
            onError={handleImageError}
            alt="WAVORA Athletic Character Hero"
            className="w-full h-full object-cover object-[center_28%] lg:object-[center_22%] opacity-90 filter brightness-[0.78] lg:brightness-[0.82] contrast-[1.08] saturate-[1.05] transition-opacity duration-300"
          />

          {/* Dynamic Interactive Specular Refraction Glow following cursor */}
          <div
            className="absolute inset-0 mix-blend-screen opacity-50 transition-all duration-200"
            style={{
              background: `radial-gradient(circle at ${50 + mousePos.x * 25}% ${
                45 + mousePos.y * 25
              }%, rgba(34, 211, 238, 0.45) 0%, rgba(6, 182, 212, 0.15) 35%, transparent 65%)`,
            }}
          />
        </motion.div>

        {/* Ambient Oceanic Color Vignette for Perfect Legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#020713]/95 via-[#020713]/65 to-[#020713]/85 lg:from-[#020713]/92 lg:via-transparent lg:to-[#020713]/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020713] via-transparent to-[#020713]/70" />

        {/* Subtle Atmospheric Water Droplets / Bubbles */}
        <div className="absolute inset-0 opacity-25">
          {[...Array(14)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-cyan-300/40 blur-[0.6px]"
              style={{
                width: `${(i % 3) * 4 + 3}px`,
                height: `${(i % 3) * 4 + 3}px`,
                left: `${(i * 7.1) % 100}%`,
                top: `${(i * 6.8) % 100}%`,
              }}
              animate={{
                y: [-20, 20, -20],
                opacity: [0.2, 0.6, 0.2],
              }}
              transition={{
                duration: 5 + (i % 3),
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      </div>

      {/* ===================================================================
          2. GIANT BRAND WATERMARK (PERSIS SEPERTI "LUMORA" DI GAMBAR 2)
          =================================================================== */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-12 sm:bottom-16 lg:bottom-20 z-10 text-center pointer-events-none select-none overflow-hidden"
      >
        <span className="font-heading font-black text-[18vw] sm:text-[16vw] lg:text-[14vw] tracking-[0.08em] text-white/[0.045] lg:text-white/[0.06] leading-none uppercase inline-block transform translate-y-4">
          WAVORA
        </span>
      </div>

      {/* ===================================================================
          3. TWO-COLUMN HERO GRID (HEADLINE & CAROUSEL CARD)
          =================================================================== */}
      <div className="relative z-20 max-w-7xl mx-auto w-full my-auto py-6 sm:py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* LEFT COLUMN: Big Headline, Rating, CTA (Span 7) */}
        <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-left">
          
          {/* Official Academy Slogan Pill & Promo Highlight */}
          <div className="flex flex-wrap items-center gap-2.5">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 text-[11px] sm:text-xs font-mono font-bold tracking-wider uppercase backdrop-blur-md shadow-sm"
            >
              <Waves className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>ONE WAVE, ONE FAMILY</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span className="text-slate-300 font-normal">Wavora Aquatic Academy</span>
            </motion.div>

            {onOpenBuddySquadPromo && (
              <motion.button
                type="button"
                onClick={onOpenBuddySquadPromo}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-cyan-500/20 to-teal-500/20 hover:from-amber-500/30 hover:to-cyan-500/30 border border-amber-400/40 text-amber-300 hover:text-white text-[11px] font-mono font-bold tracking-wider uppercase backdrop-blur-md shadow-sm transition-all cursor-pointer group"
              >
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span>Promo Buddy Squad (2–4 Anak)</span>
                <span className="text-[10px] text-cyan-300 group-hover:translate-x-0.5 transition-transform">→</span>
              </motion.button>
            )}
          </div>

          {/* High-Impact Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-1.5 sm:space-y-2"
          >
            <h1 className="font-heading font-black text-3.5xl sm:text-5xl md:text-6xl lg:text-7xl text-white tracking-tight leading-[1.04] uppercase">
              Bina Juara,
            </h1>
            <h1 className="font-heading font-black text-3.5xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tight leading-[1.04] uppercase text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-200 to-sky-400 drop-shadow-[0_0_40px_rgba(6,182,212,0.4)]">
              Tanpa Trauma.
            </h1>
          </motion.div>

          {/* Rating & Social Proof */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center gap-3 pt-1"
          >
            <div className="flex items-center gap-1 text-cyan-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-cyan-400 text-cyan-400" />
              ))}
            </div>
            <span className="text-xs sm:text-sm font-sans font-medium text-slate-300">
              <strong className="text-white font-bold">Bimbingan Eksklusif Terfokus</strong> • Kuota Terbatas &lt;20 Siswa
            </span>
          </motion.div>

          {/* Dual Action Buttons (Pills with Arrow Badge) */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center gap-3.5 sm:gap-4 pt-2"
          >
            {/* Primary Dark/Cyan Pill */}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={onRegisterClick}
              className="group pl-6 pr-2 py-2 bg-gradient-to-r from-cyan-400 via-teal-300 to-sky-400 hover:from-cyan-300 hover:to-teal-200 text-slate-950 font-heading font-black text-xs tracking-widest uppercase rounded-full shadow-xl shadow-cyan-500/25 transition-all flex items-center gap-3 cursor-pointer"
            >
              <span>DAFTAR SEKARANG</span>
              <span className="w-8 h-8 rounded-full bg-slate-950 text-cyan-300 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                <ArrowRight className="w-4 h-4" />
              </span>
            </motion.button>

            {/* Outline Frosted Glass Pill */}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleExplore}
              className="px-7 py-3.5 bg-slate-900/60 hover:bg-slate-800/80 text-white font-heading font-bold text-xs tracking-widest uppercase rounded-full border border-cyan-500/40 hover:border-cyan-300 backdrop-blur-md transition-all cursor-pointer flex items-center gap-2"
            >
              <span>VIEW PROGRAMS</span>
              <ArrowUpRight className="w-4 h-4 text-cyan-400" />
            </motion.button>
          </motion.div>
        </div>

        {/* RIGHT COLUMN: Floating Glass Carousel Card & Pool Locations (Span 5) */}
        <div className="lg:col-span-5 flex flex-col items-start lg:items-end gap-6 sm:gap-8">
          
          {/* Floating Glass Carousel Card (Persis Format Gambar Ke-2) */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="w-full max-w-sm rounded-2xl bg-white/[0.08] dark:bg-slate-950/70 border border-cyan-500/30 p-2.5 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_30px_rgba(6,182,212,0.15)] group"
          >
            <div className="flex items-stretch gap-3">
              
              {/* Left Dark Logo Tile */}
              <div className="aspect-square w-20 sm:w-24 rounded-xl bg-[#020713] border border-cyan-500/30 flex flex-col items-center justify-center relative overflow-hidden shadow-inner shrink-0">
                <Waves className="w-8 h-8 text-cyan-400 animate-pulse" />
                <span className="text-[9px] font-mono text-cyan-300 tracking-wider mt-1">WAVORA</span>
                <div className="absolute inset-0 bg-cyan-400/10 mix-blend-overlay pointer-events-none" />
              </div>

              {/* Right Content Carousel Panel */}
              <div className="flex-1 rounded-xl bg-slate-900/60 border border-slate-800/80 p-3 flex flex-col justify-between">
                <div className="relative min-h-[3.6rem]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeCardIndex}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-1"
                    >
                      <span className="block text-[10px] font-mono uppercase tracking-widest text-cyan-400">
                        {CAROUSEL_ITEMS[activeCardIndex].caption}
                      </span>
                      <h4 className="font-heading font-bold text-xs sm:text-sm text-white leading-snug">
                        {CAROUSEL_ITEMS[activeCardIndex].title}
                      </h4>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Bottom Navigation Row: Indicator Dashes & Prev/Next Arrows */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 mt-2">
                  <div className="flex items-center gap-1.5">
                    {CAROUSEL_ITEMS.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveCardIndex(i)}
                        className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${
                          i === activeCardIndex
                            ? 'w-5 bg-cyan-400'
                            : 'w-1.5 bg-slate-700 hover:bg-slate-500'
                        }`}
                        aria-label={`Slide ${i + 1}`}
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() =>
                        setActiveCardIndex(
                          (prev) => (prev - 1 + CAROUSEL_ITEMS.length) % CAROUSEL_ITEMS.length
                        )
                      }
                      className="w-6 h-6 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-slate-700"
                      aria-label="Previous slide"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() =>
                        setActiveCardIndex((prev) => (prev + 1) % CAROUSEL_ITEMS.length)
                      }
                      className="w-6 h-6 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-slate-700"
                      aria-label="Next slide"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>

          {/* Trusted Pool Locations Grid (Pahoman & Unila Saja) */}
          <div className="w-full max-w-sm space-y-2.5 text-left lg:text-right">
            <span className="block text-[11px] font-mono text-slate-400 uppercase tracking-widest">
              Lokasi Kolam Latihan
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              {POOL_LOCATIONS.map((loc, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-xs font-mono text-cyan-200 bg-slate-950/70 border border-cyan-500/30 px-3 py-2 rounded-xl backdrop-blur-sm shadow-md"
                >
                  <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0 animate-pulse" />
                  <span className="font-semibold truncate">{loc}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* ===================================================================
          4. BOTTOM STATUS BAR (WORKING SINCE • LOCATION • SCROLL TO EXPLORE)
          =================================================================== */}
      <div className="relative z-20 max-w-7xl mx-auto w-full pt-4 border-t border-slate-800/60 flex items-center justify-between text-[11px] sm:text-xs font-mono text-slate-400 uppercase tracking-wider">
        <div className="flex items-center gap-2">
          <div
            className="select-none flex items-center gap-2"
            title="Status Kota & Tahun Berdiri"
          >
            <span>EST. 2026 • BANDAR LAMPUNG</span>
          </div>
        </div>
        <div className="hidden sm:block">
          <span className="text-cyan-400">PAHOMAN &amp; UNILA</span>
          <span className="mx-2 text-slate-600">•</span>
          <span>WORLD AQUATICS CURRICULUM</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer" onClick={handleExplore}>
          <span>SCROLL TO EXPLORE</span>
          <span className="animate-bounce">↓</span>
        </div>
      </div>
    </section>
  );
};
