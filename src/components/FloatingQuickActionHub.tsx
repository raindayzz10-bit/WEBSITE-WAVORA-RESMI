import React, { useState, useEffect } from 'react';
import { MessageCircle, Calendar, MessageSquare, ChevronDown, ChevronUp, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { ADMIN_PHONE_INTL } from '../data/academyData';
import { aquaticSoundEngine } from '../utils/aquaticSoundEngine';

interface FloatingQuickActionHubProps {
  onOpenSchedule: () => void;
  onOpenChat: () => void;
  onNavigateToSchedule?: () => void;
}

export const FloatingQuickActionHub: React.FC<FloatingQuickActionHubProps> = ({
  onOpenSchedule,
  onOpenChat,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // Sync ambient audio state
  useEffect(() => {
    const unsubscribe = aquaticSoundEngine.subscribe((playing) => {
      setIsAudioPlaying(playing);
    });
    return unsubscribe;
  }, []);

  const handleWhatsAppConsultation = () => {
    const msg = encodeURIComponent('Halo Admin Wavora, saya ingin konsultasi gratis program renang untuk anak/keluarga.');
    window.open(`https://wa.me/${ADMIN_PHONE_INTL}?text=${msg}`, '_blank', 'noopener,noreferrer');
  };

  const handleToggleAudio = () => {
    aquaticSoundEngine.toggle();
  };

  return (
    <div
      id="floating-quick-action-hub"
      className="fixed bottom-4 right-3 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end select-none"
    >
      {/* Minimized Quick Button (Ultra-Compact Pill for Mobile) */}
      {isMinimized ? (
        <button
          id="hub-expand-btn"
          onClick={() => setIsMinimized(false)}
          className="group flex items-center gap-2 px-3 py-2 rounded-full bg-slate-950/90 hover:bg-slate-900 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 text-xs font-semibold shadow-2xl backdrop-blur-xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
          title="Buka Menu Aksi Cepat Wavora"
          aria-label="Buka Menu Aksi Cepat"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
          </span>
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-medium text-[11px] sm:text-xs">Aksi Cepat</span>
          <ChevronUp className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
        </button>
      ) : (
        /* Expanded Unified Hub Card */
        <div className="flex flex-col items-end gap-1.5 p-1.5 sm:p-2 rounded-2xl sm:rounded-3xl bg-slate-950/90 border border-cyan-500/30 shadow-2xl shadow-cyan-950/70 backdrop-blur-xl transition-all duration-300 max-w-[94vw] sm:max-w-none">
          
          {/* Header Row: Title & Minimize Toggle */}
          <div className="flex items-center justify-between w-full px-2 pt-0.5 pb-1 border-b border-white/5 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <span className="font-bold tracking-wider uppercase text-[10px] text-slate-400 font-mono">
                Wavora Hub
              </span>
            </div>

            <div className="flex items-center gap-1">
              {/* Aquatic Audio Toggle integrated in hub */}
              <button
                onClick={handleToggleAudio}
                className={`p-1 rounded-lg border transition-all duration-200 cursor-pointer ${
                  isAudioPlaying
                    ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
                title={isAudioPlaying ? 'Mute Suara Air' : 'Putar Ambien Air Tenang 🌊'}
                aria-label="Ambien Air"
              >
                {isAudioPlaying ? <Volume2 className="w-3 h-3 text-cyan-400" /> : <VolumeX className="w-3 h-3" />}
              </button>

              {/* Minimize button */}
              <button
                onClick={() => setIsMinimized(true)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors cursor-pointer"
                title="Sembunyikan Menu Aksi Cepat"
                aria-label="Sembunyikan Menu"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Action Row 1: WhatsApp Konsultasi Gratis (Primary Conversational CTA) */}
          <button
            id="hub-consult-btn"
            onClick={handleWhatsAppConsultation}
            className="w-full group flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-950/50 via-slate-900 to-slate-900 hover:from-emerald-900/60 hover:to-slate-850 border border-emerald-500/40 hover:border-emerald-400 text-left transition-all duration-200 active:scale-[0.98] cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <MessageCircle className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-300 group-hover:text-emerald-200 leading-tight">
                  Konsultasi Gratis
                </p>
                <p className="text-[10px] text-slate-400 leading-tight">
                  Chat WA Admin (0896-3418-9392)
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-block text-[10px] font-semibold text-emerald-400/80 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/20">
              Online
            </span>
          </button>

          {/* Action Row 2: Tanya Jadwal & Slot (Quick Booking/Slot Check) */}
          <div className="grid grid-cols-2 gap-1.5 w-full">
            <button
              id="hub-schedule-btn"
              onClick={onOpenSchedule}
              className="group flex items-center gap-2 px-2.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-cyan-500/30 hover:border-cyan-400 text-left transition-all duration-200 active:scale-[0.98] cursor-pointer"
            >
              <div className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 truncate">
                  Tanya Jadwal
                </p>
                <p className="text-[9px] text-slate-400 truncate">
                  Pahoman & UNILA
                </p>
              </div>
            </button>

            {/* Action Row 3: Live AI Assistant (Smart Instant Q&A) */}
            <button
              id="hub-chat-btn"
              onClick={onOpenChat}
              className="group flex items-center gap-2 px-2.5 py-2 rounded-xl bg-gradient-to-r from-cyan-950/60 to-slate-900/80 hover:from-cyan-900/80 hover:to-slate-800 border border-cyan-500/40 hover:border-cyan-300 text-left transition-all duration-200 active:scale-[0.98] cursor-pointer"
            >
              <div className="w-6 h-6 rounded-lg bg-cyan-400/20 border border-cyan-400/40 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-3.5 h-3.5 text-cyan-300" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-cyan-200 group-hover:text-white truncate">
                  Live Chat AI
                </p>
                <p className="text-[9px] text-slate-400 truncate">
                  Tanya Cepat 24 Jam
                </p>
              </div>
            </button>
          </div>

        </div>
      )}
    </div>
  );
};
