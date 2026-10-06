import React, { useState, useEffect } from 'react';
import { Waves, Sparkles, MessageSquare, Menu, X, ArrowRight, Shield, Activity, Users, Star } from 'lucide-react';
import { SYSTEM_VERSION } from '../data/academyData';
import { AquaticAudioToggle } from './AquaticAudioToggle';

interface NavbarProps {
  onOpenQuiz: () => void;
  onOpenChat: () => void;
  onOpenSchedule: () => void;
  onNavigate: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenQuiz,
  onOpenChat,
  onOpenSchedule,
  onNavigate,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const h = now.getHours().toString().padStart(2, '0');
      const m = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${h}:${m} WIB`);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = (sectionId: string) => {
    setMobileMenuOpen(false);
    onNavigate(sectionId);
  };

  return (
    <header
      id="main-navbar"
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-[#030812]/90 backdrop-blur-md border-b border-cyan-500/15 py-3 shadow-xl shadow-cyan-950/20'
          : 'bg-transparent py-4 md:py-5 border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          id="nav-logo-btn"
          onClick={() => handleLinkClick('hero-section')}
          className="flex items-center gap-3 group text-left transition-transform duration-200 active:scale-95"
        >
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 via-teal-500 to-blue-600 p-[1px] shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-cyan-500/10 group-hover:bg-cyan-500/20 transition-colors" />
              <Waves className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform duration-300" />
            </div>
            {/* Pulsing cyan status dot */}
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-400" />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-athletic font-extrabold text-xl sm:text-2xl tracking-tight text-white flex items-center">
                WAVORA
                <span className="text-cyan-400 ml-0.5">.</span>
              </span>
            </div>
            <p className="text-[10px] tracking-[0.2em] font-bold text-slate-400 uppercase -mt-0.5">
              Aquatic Academy
            </p>
          </div>
        </button>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          <button
            id="nav-link-beranda"
            onClick={() => handleLinkClick('hero-section')}
            className="px-3.5 py-2 text-xs xl:text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors rounded-lg hover:bg-slate-800/40"
          >
            Beranda
          </button>
          <button
            id="nav-link-harga"
            onClick={() => handleLinkClick('pricing-section')}
            className="px-3.5 py-2 text-xs xl:text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors rounded-lg hover:bg-slate-800/40"
          >
            Paket Harga
          </button>
          <button
            id="nav-link-program"
            onClick={() => handleLinkClick('curriculum-section')}
            className="px-3.5 py-2 text-xs xl:text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors rounded-lg hover:bg-slate-800/40"
          >
            Level & Program
          </button>
          <button
            id="nav-link-testimonials"
            onClick={() => handleLinkClick('testimonials-section')}
            className="px-3.5 py-2 text-xs xl:text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors rounded-lg hover:bg-slate-800/40"
          >
            Testimoni
          </button>
          <button
            id="nav-link-jadwal"
            onClick={() => handleLinkClick('schedule-section')}
            className="px-3.5 py-2 text-xs xl:text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors rounded-lg hover:bg-slate-800/40"
          >
            Jadwal & Slot
          </button>
          <button
            id="nav-link-faq"
            onClick={() => handleLinkClick('faq-section')}
            className="px-3.5 py-2 text-xs xl:text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors rounded-lg hover:bg-slate-800/40"
          >
            FAQ
          </button>
          <button
            id="nav-link-quiz"
            onClick={onOpenQuiz}
            className="px-3.5 py-2 text-xs xl:text-sm font-medium text-cyan-300 hover:text-cyan-200 transition-colors rounded-lg bg-cyan-950/30 hover:bg-cyan-950/60 border border-cyan-500/20 flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Cek Level
          </button>
          <button
            id="nav-link-daftar"
            onClick={() => handleLinkClick('registration-section')}
            className="px-3.5 py-2 text-xs xl:text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors rounded-lg hover:bg-slate-800/40"
          >
            Pendaftaran
          </button>
        </nav>

        {/* Quick Action Buttons */}
        <div className="hidden sm:flex items-center gap-2.5">
          {/* Live Schedule Status & Clock Chip */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#061830]/80 border border-cyan-500/25 text-[11px] font-mono text-cyan-300 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
            </span>
            <span className="font-semibold">PAHOMAN & UNILA</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-200">{currentTime || '07:30 WIB'}</span>
          </div>

          {/* Aquatic Ambient Sound Experience Toggle */}
          <AquaticAudioToggle />

          {/* Live Assistant Trigger */}
          <button
            id="nav-chat-assistant-btn"
            onClick={onOpenChat}
            className="relative px-3 py-2 text-xs font-semibold text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl flex items-center gap-2 transition-all hover:border-cyan-500/40 active:scale-95"
            title="Tanya Wavora Assistant"
          >
            <div className="relative">
              <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <span>Live Chat</span>
          </button>

          {/* Primary CTA */}
          <button
            id="nav-primary-cta"
            onClick={() => handleLinkClick('registration-section')}
            className="px-4 py-2 text-xs xl:text-sm font-bold uppercase tracking-wider text-slate-950 bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-300 hover:from-cyan-300 hover:to-teal-200 rounded-xl shadow-lg shadow-cyan-500/25 transition-all duration-200 active:scale-95 flex items-center gap-1.5"
          >
            <span>Daftar Sekarang</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mobile / Tablet Hamburger Toggle (Shows on screens < lg) */}
        <div className="flex lg:hidden items-center gap-1.5 sm:gap-2">
          <AquaticAudioToggle variant="compact" />
          <button
            id="nav-mobile-chat-btn"
            onClick={onOpenChat}
            className="sm:hidden p-2 text-slate-300 hover:text-white bg-slate-900/80 rounded-lg border border-slate-700/60"
            aria-label="Buka Chat"
          >
            <MessageSquare className="w-4 h-4 text-cyan-400" />
          </button>
          <button
            id="nav-hamburger-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-300 hover:text-white bg-slate-900/80 rounded-lg border border-slate-700/60 focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile / Tablet Drawer Menu */}
      {mobileMenuOpen && (
        <div
          id="mobile-nav-drawer"
          className="lg:hidden bg-[#030812]/95 backdrop-blur-xl border-b border-cyan-500/20 px-4 pt-3 pb-6 space-y-2 animate-in fade-in slide-in-from-top-3 duration-200 max-h-[85vh] overflow-y-auto"
        >
          <div className="px-2 py-1 text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
            <span>{SYSTEM_VERSION}</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Pendaftaran Dibuka
            </span>
          </div>

          <button
            onClick={() => handleLinkClick('hero-section')}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800/60 hover:text-cyan-400"
          >
            Beranda
          </button>
          <button
            onClick={() => handleLinkClick('pricing-section')}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800/60 hover:text-cyan-400"
          >
            Paket Harga & Kalkulator
          </button>
          <button
            onClick={() => handleLinkClick('curriculum-section')}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800/60 hover:text-cyan-400"
          >
            Level & Program
          </button>
          <button
            onClick={() => handleLinkClick('testimonials-section')}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800/60 hover:text-cyan-400 flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400" />
              Kisah Sukses Orang Tua
            </span>
            <span className="text-[10px] font-mono text-cyan-400 font-bold">5.0 ★</span>
          </button>
          <button
            onClick={() => handleLinkClick('schedule-section')}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800/60 hover:text-cyan-400 flex items-center justify-between"
          >
            <span>Jadwal &amp; Slot Sesi Latihan</span>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded font-bold">
              Real-time
            </span>
          </button>
          <button
            onClick={() => handleLinkClick('faq-section')}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800/60 hover:text-cyan-400"
          >
            Tanya Jawab Orang Tua (FAQ)
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenQuiz();
            }}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-cyan-300 bg-cyan-950/40 border border-cyan-500/20 flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Cek Level Atlet Online
            </span>
            <span className="text-[10px] font-bold uppercase bg-cyan-500/20 px-2 py-0.5 rounded text-cyan-300">
              Quiz
            </span>
          </button>

          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
            <button
              onClick={() => handleLinkClick('registration-section')}
              className="w-full py-3 text-center text-sm font-bold uppercase tracking-wider text-slate-950 bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-300 rounded-xl shadow-lg shadow-cyan-500/20"
            >
              Daftar Sekarang
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenChat();
              }}
              className="w-full py-2.5 text-center text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-700/60 rounded-xl flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
              Live Chat Assistant WOS
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
