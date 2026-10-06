import React from 'react';
import { Waves, Phone, Mail, MapPin, Sparkles, ArrowUp, Shield, Instagram, KeyRound } from 'lucide-react';
import {
  BRAND_SLOGAN,
  SYSTEM_VERSION,
  ADMIN_PHONE,
  ADMIN_EMAIL,
  INSTAGRAM_HANDLE,
  INSTAGRAM_URL,
} from '../data/academyData';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
  onOpenSchedule: () => void;
  onOpenQuiz: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenSchedule, onOpenQuiz }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="main-footer" className="bg-[#02060f] border-t border-slate-800/80 pt-16 pb-12 relative z-10 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-slate-800/80">
          
          {/* Col 1: Brand & Slogan (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Waves className="w-5 h-5" />
              </div>
              <div>
                <span className="font-athletic font-extrabold text-xl text-white tracking-tight">
                  WAVORA<span className="text-cyan-400">.</span>
                </span>
                <span className="text-[10px] block uppercase tracking-[0.2em] text-slate-400 font-bold -mt-0.5">
                  Aquatic Academy
                </span>
              </div>
            </div>

            <p className="text-slate-300 text-xs leading-relaxed max-w-sm">
              Sekolah renang berstandar World Aquatics di Bandar Lampung. Mengembangkan potensi atletik anak melalui metode empati ramah anak bebas trauma dan sains biomekanika renang.
            </p>

            <div className="pt-2">
              <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-950/70 border border-cyan-500/30 text-cyan-300">
                {BRAND_SLOGAN}
              </span>
            </div>
          </div>

          {/* Col 2: Navigasi Cepat (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-athletic font-bold text-xs uppercase tracking-wider text-white">
              Navigasi Cepat
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate('hero-section')}
                  className="hover:text-cyan-400 transition-colors"
                >
                  Beranda Utama
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('pricing-section')}
                  className="hover:text-cyan-400 transition-colors"
                >
                  Paket & Kalkulator
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('curriculum-section')}
                  className="hover:text-cyan-400 transition-colors"
                >
                  Kurikulum & Level
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('roadmap-section')}
                  className="hover:text-cyan-400 transition-colors"
                >
                  Simulator Roadmap
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('schedule-section')}
                  className="hover:text-cyan-400 transition-colors"
                >
                  Jadwal &amp; Slot Sesi
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('faq-section')}
                  className="hover:text-cyan-400 transition-colors"
                >
                  Tanya Jawab (FAQ)
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenQuiz}
                  className="text-cyan-300 hover:text-cyan-200 transition-colors flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-cyan-400" /> Cek Level Atlet
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Lokasi Kolam Bandar Lampung (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-athletic font-bold text-xs uppercase tracking-wider text-white">
              Venue Kolam Latihan
            </h4>
            <div className="space-y-3">
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                <strong className="text-white block text-xs mb-0.5">Kolam Renang Pahoman</strong>
                <p className="text-[11px] text-slate-400">Jl. Way Lubuk No.1, Pahoman, Bandar Lampung</p>
                <span className="text-[10px] text-cyan-400 font-semibold block mt-1">Sesi Pagi (07:30 WIB+)</span>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                <strong className="text-white block text-xs mb-0.5">Kolam Renang UNILA</strong>
                <p className="text-[11px] text-slate-400">Kawasan Kampus Unila, Gedong Meneng, Rajabasa</p>
                <span className="text-[10px] text-cyan-400 font-semibold block mt-1">Sesi Sore (16:00 WIB+)</span>
              </div>
            </div>
          </div>

          {/* Col 4: Kontak & Sistem (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-athletic font-bold text-xs uppercase tracking-wider text-white">
              Layanan Administrasi
            </h4>
            <div className="space-y-2 text-xs">
              <a
                href="https://wa.me/6289634189392"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-slate-300 hover:text-cyan-300 transition-colors bg-slate-900/80 p-2.5 rounded-xl border border-slate-800"
              >
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>WhatsApp: <strong>{ADMIN_PHONE}</strong></span>
              </a>

              <a
                href={`mailto:${ADMIN_EMAIL}`}
                className="flex items-center gap-2 text-slate-300 hover:text-cyan-300 transition-colors bg-slate-900/80 p-2.5 rounded-xl border border-slate-800"
                title="Kirim Email ke Wavora Aquatic Academy"
              >
                <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="truncate">{ADMIN_EMAIL}</span>
              </a>

              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-slate-300 hover:text-cyan-300 transition-colors bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 group"
                title="Follow Instagram @wavoraaquaticacademy"
              >
                <Instagram className="w-4 h-4 text-pink-400 group-hover:scale-110 transition-transform shrink-0" />
                <span className="font-mono text-cyan-300">@{INSTAGRAM_HANDLE}</span>
              </a>

              <div className="flex items-center gap-2 text-slate-400 pt-1">
                <Shield className="w-3.5 h-3.5 text-teal-400" />
                <span>PRSI & World Aquatics Guidelines</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Copyright & OS Stamp */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <div className="flex flex-wrap items-center gap-2">
            <span>© 2026 WAVORA Aquatic Academy. All rights reserved.</span>
            <span className="hidden sm:inline text-slate-700">•</span>
            <span className="text-cyan-400/90 font-mono font-bold">{SYSTEM_VERSION}</span>
            <span className="hidden sm:inline text-slate-700">•</span>
            <button
              type="button"
              onClick={() => onNavigate('schedule-section')}
              className="text-amber-400/80 hover:text-amber-300 font-mono text-[11px] flex items-center gap-1 transition-colors hover:underline"
            >
              <KeyRound className="w-3 h-3" /> Akses Founder (Edit Jadwal)
            </button>
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <span>Kembali ke atas</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </footer>
  );
};
