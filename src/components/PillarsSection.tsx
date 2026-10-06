import React from 'react';
import { Activity, Heart, ShieldCheck, Trophy, CheckCircle, ChevronRight, Sparkles } from 'lucide-react';
import { ACADEMY_PILLARS } from '../data/academyData';

const iconMap = {
  Activity: Activity,
  Heart: Heart,
  ShieldCheck: ShieldCheck,
  Trophy: Trophy,
};

interface PillarsSectionProps {
  onOpenWOS?: () => void;
}

export const PillarsSection: React.FC<PillarsSectionProps> = ({ onOpenWOS }) => {
  return (
    <section id="pillars-section" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-semibold tracking-wider uppercase mb-3">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            Fondasi Keunggulan
          </div>
          <h2 className="font-athletic font-black text-3xl sm:text-4xl md:text-5xl tracking-tight text-white mb-4">
            4 PILAR UTAMA <span className="bg-gradient-to-r from-cyan-400 to-teal-300 bg-clip-text text-transparent">WAVORA ACADEMY</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-300">
            Mengapa ratusan orang tua di Bandar Lampung mempercayakan putra-putrinya berlatih di Wavora Aquatic Academy.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
          {ACADEMY_PILLARS.map((pillar, index) => {
            const IconComponent = iconMap[pillar.icon as keyof typeof iconMap] || Activity;
            
            // Bento sizing: first and fourth cards span 7 cols, second and third span 5 cols for visual dynamics
            const colSpan = index === 0 || index === 3 ? 'lg:col-span-7' : 'lg:col-span-5';

            return (
              <div
                key={pillar.id}
                id={`pillar-card-${pillar.id}`}
                onClick={() => {
                  if (pillar.id === 'progress' && onOpenWOS) {
                    onOpenWOS();
                  }
                }}
                className={`${colSpan} relative rounded-2xl bg-slate-900/70 backdrop-blur-md border border-white/[0.08] hover:border-cyan-500/40 p-6 sm:p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-950/40 group flex flex-col justify-between overflow-hidden ${
                  pillar.id === 'progress' ? 'cursor-pointer ring-1 ring-cyan-500/20 hover:ring-cyan-500/50' : ''
                }`}
              >
                {/* Subtle gradient background bleed */}
                <div
                  className={`absolute -right-20 -top-20 w-64 h-64 rounded-full bg-gradient-to-br ${pillar.color} blur-3xl opacity-50 group-hover:opacity-80 transition-opacity pointer-events-none`}
                />

                {/* Top Row: Icon & Stat Badge */}
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-slate-800/90 border border-slate-700 flex items-center justify-center text-cyan-400 group-hover:scale-110 group-hover:border-cyan-500/50 transition-all duration-300 shadow-lg">
                      <IconComponent className="w-6 h-6" />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-cyan-950/80 border border-cyan-500/30 text-cyan-300">
                        {pillar.stat}
                      </span>
                    </div>
                  </div>

                  {/* Highlight Pill */}
                  <span className="text-[11px] font-bold uppercase tracking-wider text-teal-400 mb-2 block">
                    {pillar.highlight}
                  </span>

                  {/* Title & Subtitle */}
                  <h3 className="font-athletic font-extrabold text-xl sm:text-2xl text-white group-hover:text-cyan-300 transition-colors mb-2">
                    {pillar.title}
                  </h3>
                  <p className="text-xs sm:text-sm font-medium text-slate-400 mb-4">
                    {pillar.subtitle}
                  </p>

                  {/* Description */}
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>

                {/* Bottom Trust Indicators */}
                <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Terverifikasi Kurikulum WOS v3</span>
                  </div>
                  <span className="text-cyan-400/60 font-semibold group-hover:text-cyan-400 group-hover:translate-x-1 transition-all flex items-center gap-1">
                    Pelajari
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
