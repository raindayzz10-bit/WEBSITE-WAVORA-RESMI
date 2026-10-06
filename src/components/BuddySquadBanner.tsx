import React, { useState } from 'react';
import {
  Users,
  Sparkles,
  Ticket,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  MessageCircle,
  Calendar,
  Waves,
  Trophy,
  Copy,
  Check,
} from 'lucide-react';
import { motion } from 'motion/react';
import { ADMIN_PHONE_INTL } from '../data/academyData';

interface BuddySquadBannerProps {
  onClaimPromo: () => void;
  onOpenSchedule?: () => void;
}

export const BuddySquadBanner: React.FC<BuddySquadBannerProps> = ({
  onClaimPromo,
  onOpenSchedule,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText('BUDDYSQUAD');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleConsultWa = () => {
    const message = encodeURIComponent(
      'Halo Admin WAVORA, saya orang tua calon atlet. Saya tertarik mendaftar Promo Buddy Squad untuk 2-4 anak bersama teman/saudara. Mohon info ketersediaan slot sesi & jadwalnya ya.'
    );
    window.open(`https://wa.me/${ADMIN_PHONE_INTL}?text=${message}`, '_blank');
  };

  return (
    <section id="buddy-squad-promo" className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#07172e] via-[#040e1d] to-[#020713] border-2 border-cyan-500/40 p-6 sm:p-8 lg:p-10 shadow-[0_10px_40px_rgba(6,182,212,0.18)]">
        
        {/* Glow ambient effects */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#0891b2_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

        <div className="relative z-10">
          
          {/* Top Badges & Promo Pill */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5 border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-mono font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
                Promo Kolektif 2–4 Atlet
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-[11px] font-bold">
                ★ Paling Diminati Orang Tua
              </span>
            </div>

            {/* Secret Voucher Chip (Click to Copy) */}
            <button
              onClick={handleCopyCode}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-900/90 border border-cyan-500/30 hover:border-cyan-400 text-slate-300 hover:text-white text-xs font-mono transition-all cursor-pointer shadow-sm group"
              title="Salin Kode Voucher Buddy Squad"
            >
              <Ticket className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-12 transition-transform" />
              <span>Kode: <strong className="text-cyan-300 font-black tracking-wider">BUDDYSQUAD</strong></span>
              {copied ? (
                <span className="text-emerald-400 flex items-center gap-1 text-[11px] font-bold">
                  <Check className="w-3 h-3" /> Tersalin
                </span>
              ) : (
                <Copy className="w-3 h-3 text-slate-400 group-hover:text-cyan-300" />
              )}
            </button>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
            
            {/* Left Column: Heading, Subheading & Context */}
            <div className="lg:col-span-7 space-y-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 text-cyan-400 text-xs font-bold tracking-wider uppercase font-mono">
                  <Users className="w-4 h-4" />
                  <span>Program Wavora Buddy Squad</span>
                </div>
                <h2 className="font-heading font-black text-2xl sm:text-3xl md:text-4xl text-white tracking-tight leading-tight uppercase">
                  Berenang Bareng Teman Lebih Seru!
                </h2>
                <p className="font-heading font-extrabold text-lg sm:text-xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-200 to-sky-400">
                  Daftarkan 2–4 Anak Sekaligus &amp; Dapatkan Paket Buddy Squad
                </p>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl font-sans">
                Punya anak yang masih ragu atau takut air? Latihan bersama sahabat sekolah, sepupu, atau tetangga komplek 
                membuat mereka jauh lebih berani, antusias, dan saling memotivasi. Cukup 1 orang tua yang mengisi formulir, 
                seluruh anak langsung terdaftar dalam satu rombongan latihan terkoordinasi!
              </p>

              {/* 4 Key Benefits Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 shrink-0 mt-0.5">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">1 Form untuk 2–4 Atlet</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Orang tua cukup isi data kontak sekali &amp; tambahkan profil seluruh anak langsung.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 shrink-0 mt-0.5">
                    <Ticket className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Potongan Diskon Rp 100.000</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Hemat investasi renang secara otomatis dengan voucher khusus rombongan.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-teal-500/20 text-teal-300 shrink-0 mt-0.5">
                    <Waves className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Jalur &amp; Jadwal Sesi Bersama</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Anak-anak belajar dalam lane yang sama dengan pelatih bersertifikasi ramah anak.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 shrink-0 mt-0.5">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Squad Merchandise Bonus</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Prioritas kuota swim cap atau souvenir eksklusif atlet Wavora Aquatic.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Visual CTA Box & Action Buttons */}
            <div className="lg:col-span-5 flex flex-col justify-center">
              <div className="p-5 sm:p-6 rounded-2xl bg-slate-950/80 border border-cyan-500/30 backdrop-blur-md space-y-4 text-center">
                
                {/* Visual Pill Header */}
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-teal-400 text-slate-950 shadow-lg mx-auto">
                  <Users className="w-6 h-6" />
                </div>

                <div>
                  <h3 className="font-heading font-black text-lg text-white uppercase tracking-tight">
                    Amankan Slot Buddy Squad
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Hanya butuh 2 menit untuk mendaftarkan 2 hingga 4 anak sekaligus
                  </p>
                </div>

                {/* Savings highlights badge */}
                <div className="p-3 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-left space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Benefit Squad:</span>
                    <span className="font-bold text-emerald-400">Hemat Rp 100.000</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Kapasitas Slot:</span>
                    <span className="font-bold text-cyan-300">2 s/d 4 Murid / Grup</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Lokasi:</span>
                    <span className="font-bold text-white">Kolam Unila &amp; Pahoman</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2.5 pt-1">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onClaimPromo}
                    className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-400 to-cyan-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-heading font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all cursor-pointer"
                  >
                    <span>Daftarkan 2–4 Anak Sekarang</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleConsultWa}
                      className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-700 hover:border-emerald-500/50 text-slate-300 hover:text-emerald-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Chat WhatsApp</span>
                    </button>

                    {onOpenSchedule && (
                      <button
                        onClick={onOpenSchedule}
                        className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-700 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Cek Jadwal Kolam</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-cyan-400" />
                  <span>Garansi pembimbingan ramah anak &amp; pelatih bersertifikasi</span>
                </div>

              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
