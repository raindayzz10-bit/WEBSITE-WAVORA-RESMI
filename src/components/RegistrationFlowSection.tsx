import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface RegistrationFlowSectionProps {
  onStartStep1: () => void;
  onOpenAssessment: () => void;
  onOpenSchedule: () => void;
  onExplorePrograms: () => void;
}

export const RegistrationFlowSection: React.FC<RegistrationFlowSectionProps> = ({
  onStartStep1,
  onOpenAssessment,
  onOpenSchedule,
  onExplorePrograms,
}) => {
  const steps = [
    {
      number: '01',
      title: 'KENALI',
      badge: 'Ceritakan sedikit tentang calon atlet',
      description:
        'Isi form registrasi singkat mengenai usia, riwayat keberanian di air, dan target utama pembelajaran calon atlet.',
      actionLabel: 'LANJUTKAN',
      onAction: onStartStep1,
    },
    {
      number: '02',
      title: 'TENTUKAN',
      badge: 'Temukan level dan program yang sesuai',
      description:
        'Pilih antara Class Reguler, Class Privat, Paket Twins, atau Hydrotherapy sesuai kebutuhan buah hati.',
      actionLabel: 'LANJUTKAN',
      onAction: onOpenAssessment,
    },
    {
      number: '03',
      title: 'MULAI',
      badge: 'Tentukan jadwal dan lokasi kolam',
      description:
        'Pilih lokasi Kolam Pahoman (mulai 07:30) atau UNILA (mulai 16:00) yang bisa disesuaikan dengan kesibukan Anda.',
      actionLabel: 'LANJUTKAN',
      onAction: onOpenSchedule,
    },
    {
      number: '04',
      title: 'BERKEMBANG',
      badge: 'Bangun perjalanan bersama WAVORA',
      description:
        'Pantau perkembangan teknik periodik dengan laporan Progress Card dan rekomendasi kejuaraan.',
      actionLabel: 'LANJUTKAN',
      onAction: onExplorePrograms,
    },
  ];

  return (
    <section id="alur-proses-section" className="py-20 relative bg-[#020712] border-t border-slate-900 overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header (Image 2) */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold tracking-[0.25em] uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            ALUR PROSES PENDAFTARAN
          </div>

          <h2 className="font-heading font-black text-3xl sm:text-4xl md:text-5xl tracking-tight text-white mb-4 uppercase">
            MEMULAI PERJALANAN{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-sky-400 bg-clip-text text-transparent">
              ITU SEDERHANA.
            </span>
          </h2>

          <p className="text-sm sm:text-base text-slate-300 font-sans">
            4 langkah terstruktur menuju pengalaman akuatik terbaik untuk sang buah hati.
          </p>
        </div>

        {/* 4 Steps Vertical Flow List */}
        <div className="relative space-y-4">
          {/* Connecting vertical line on desktop */}
          <div className="hidden sm:block absolute left-10 top-10 bottom-10 w-0.5 bg-gradient-to-b from-cyan-500/40 via-cyan-500/20 to-transparent pointer-events-none" />

          {steps.map((step, idx) => (
            <motion.div
              key={step.number}
              id={`alur-step-${step.number}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="relative rounded-2xl bg-[#071326]/80 hover:bg-[#091830] border border-cyan-500/20 hover:border-cyan-400/50 p-6 sm:p-7 backdrop-blur-md transition-all duration-300 group shadow-lg shadow-cyan-950/30"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                {/* Left: Step number box & text */}
                <div className="flex items-start sm:items-center gap-4 sm:gap-6">
                  {/* Step Number Square (Image 2/3 style) */}
                  <div className="w-12 h-12 rounded-xl bg-cyan-950/70 border border-cyan-400/40 text-cyan-300 font-mono font-bold text-base sm:text-lg flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:border-cyan-300 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all">
                    {step.number}
                  </div>

                  <div>
                    {/* Title + Pill Badge */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1.5">
                      <h3 className="font-heading font-black text-lg sm:text-xl text-white tracking-wide uppercase">
                        {step.title}
                      </h3>
                      <span className="text-[11px] font-sans font-medium text-slate-300 bg-slate-800/80 border border-slate-700/60 px-3 py-0.5 rounded-full">
                        {step.badge}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-2xl">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Right: LANJUTKAN Action Button */}
                <div className="sm:shrink-0 self-end sm:self-center pl-16 sm:pl-0">
                  <button
                    onClick={step.onAction}
                    className="inline-flex items-center gap-1.5 text-xs font-mono font-bold tracking-wider text-cyan-400 group-hover:text-cyan-300 uppercase py-2 px-3 rounded-lg hover:bg-cyan-950/40 transition-all cursor-pointer"
                  >
                    <span>{step.actionLabel}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom indicator pill (Image 2 bottom right) */}
        <div className="flex justify-end mt-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-cyan-500/30 text-cyan-400 text-[11px] font-mono font-semibold tracking-wider uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            ALUR PROSES
          </div>
        </div>
      </div>
    </section>
  );
};
