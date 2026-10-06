// ============================================================================
// 2. FILE: src/components/AcademyPillars.tsx (UPDATE PENUH DENGAN ANIMASI KINETIK)
// ============================================================================
import React from 'react';
import { ShieldCheck, HeartHandshake, Award, FileCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { KineticHeading, LiquidBodyText } from './TextAnimate';

interface AcademyPillarsProps {
  onOpenWOS?: () => void;
  onExplorePrograms?: () => void;
}

export const AcademyPillars: React.FC<AcademyPillarsProps> = ({ onOpenWOS, onExplorePrograms }) => {
  const pillars = [
    {
      id: 'progress',
      icon: <FileCheck className="w-6 h-6 text-cyan-400" />,
      title: 'Digital Progress Card',
      badge: 'MONITORING',
      subtitle: 'Pantau Progres Renang Real-Time',
      desc: 'Setiap anak memiliki lembar perkembangan digital. Orang tua menerima update capaian renang, rekaman waktu, dan status kelulusan level secara transparan.',
      action: onOpenWOS,
    },
    {
      id: 'psychology',
      icon: <HeartHandshake className="w-6 h-6 text-cyan-400" />,
      title: 'Metode Ramah Anak & Bebas Trauma',
      badge: 'PSIKOLOGI',
      subtitle: 'Fun Learning & Adaptasi Air Menyenangkan',
      desc: 'Tanpa metode paksaan atau melempar anak ke air. Kami membangun kecintaan air lewat pendekatan adaptif, teknik bernapas relaks, dan metode fun-learning.',
      action: onExplorePrograms,
    },
    {
      id: 'safety',
      icon: <ShieldCheck className="w-6 h-6 text-cyan-400" />,
      title: 'Rasio Pelatih Fokus 1 : 4-5',
      badge: 'MAX 5 MURID',
      subtitle: 'Keamanan 360 Derajat • Safety First Tanpa Kompromi',
      desc: 'Kami menolak kelas over-capacity. Rasio maksimal 1:4–5 menjamin setiap anak selalu dalam jangkauan pandangan dan tangan pelatih bersertifikasi.',
      action: onExplorePrograms,
    },
    {
      id: 'pathway',
      icon: <Award className="w-6 h-6 text-cyan-400" />,
      title: 'Jalur Prestasi Terarah',
      badge: 'PATHWAY RESMI',
      subtitle: 'Afiliasi & Kejuaraan Resmi • Dari Nol Hingga Podium',
      desc: 'Bagi murid yang berpotensi dan berminat, Wavora menyediakan jalur pembinaan atlet menuju O2SN, Kejurda Lampung, Porprov, hingga Kejuaraan Nasional.',
      action: onExplorePrograms,
    },
  ];

  return (
    <section id="pillars-section" className="py-24 px-4 sm:px-6 lg:px-8 bg-[#020713] relative border-t border-slate-900 overflow-hidden select-none">
      {/* Ambient Deep Sea Glows */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-16 relative z-10">
        {/* Kinetic Four Pillars Sequence Band (Belajar -> Berani -> -> -> Juara) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="w-full"
        >
          <ul className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch">
            <li className="flex-1 py-4 sm:py-5 px-6 rounded-full bg-[#061933]/90 border border-cyan-500/25 text-white font-heading font-black text-xl sm:text-2xl tracking-wide flex items-center justify-center hover:-translate-y-1 transition-all shadow-lg shadow-cyan-950/40">
              Belajar
            </li>
            <li className="flex-1 py-4 sm:py-5 px-6 rounded-full bg-gradient-to-r from-cyan-400 via-teal-300 to-sky-400 text-slate-950 font-heading font-black text-xl sm:text-2xl tracking-wide flex items-center justify-center hover:-translate-y-1 transition-all shadow-lg shadow-cyan-400/25">
              Berani
            </li>
            <li className="h-14 sm:h-auto sm:w-20 py-3 rounded-full bg-[#040E1E] border border-cyan-500/20 text-cyan-400 flex items-center justify-center hover:-translate-y-1 transition-all">
              <ArrowRight className="w-6 h-6 text-cyan-400" />
            </li>
            <li className="flex-1 py-4 sm:py-5 px-6 rounded-full bg-[#061933]/50 border border-cyan-500/20 text-cyan-200/90 font-heading font-black text-xl sm:text-2xl tracking-wide flex items-center justify-center hover:-translate-y-1 transition-all">
              Juara
            </li>
          </ul>
        </motion.div>

        {/* Section Heading dengan Kinetic Splitting Words */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-cyan-950/80 text-cyan-400 rounded-full border border-cyan-500/30 text-[10px] font-mono tracking-widest uppercase"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            STANDAR KUALITAS WAVORA
          </motion.div>

          <KineticHeading
            text="MENGAPA WAVORA ADALAH PILIHAN TERBAIK ORANG TUA?"
            className="font-heading font-black text-3xl sm:text-5xl uppercase tracking-tight text-white justify-center text-center"
          />

          <LiquidBodyText
            text="Kami mengombinasikan standar keselamatan internasional World Aquatics dengan pendekatan psikologis ramah anak untuk menghasilkan atlet yang disiplin dan percaya diri."
            className="text-slate-400 text-sm sm:text-base font-sans"
            delay={0.3}
          />
        </div>

        {/* 4 Pilar Grid dengan Frame Glass & Kinetic Text Reveal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pillars.map((item, index) => (
            <motion.div
              key={item.title}
              id={`pillar-card-${item.id}`}
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -5, borderColor: 'rgba(34, 211, 238, 0.6)' }}
              onClick={() => {
                if (item.action) item.action();
              }}
              className="relative p-8 rounded-3xl backdrop-blur-2xl transition-all duration-300 group flex flex-col justify-between cursor-pointer"
              style={{
                background: 'rgba(7, 19, 38, 0.55)',
                border: '1px solid rgba(34, 211, 238, 0.25)',
                boxShadow: '0 15px 35px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,255,255,0.15)',
              }}
            >
              <div className="space-y-4">
                {/* Icon & Mini Pill Badge */}
                <div className="flex items-center justify-between">
                  <div className="p-3.5 rounded-2xl bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all">
                    {item.icon}
                  </div>
                  <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-300 border border-cyan-500/40 bg-cyan-950/60 px-3 py-1 rounded-full uppercase">
                    {item.badge}
                  </span>
                </div>

                {/* Judul Kartu dengan Animasi Naik Per Kata */}
                <div className="space-y-1 pt-1">
                  {item.subtitle && (
                    <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider block">
                      {item.subtitle}
                    </span>
                  )}
                  <KineticHeading
                    text={item.title}
                    as="h3"
                    className="font-heading font-black text-xl sm:text-2xl text-white group-hover:text-cyan-300 transition-colors uppercase"
                    delay={0.1}
                  />
                </div>

                {/* Deskripsi Halus dengan Motion Blur-In */}
                <LiquidBodyText
                  text={item.desc}
                  className="text-slate-300 text-xs sm:text-sm font-sans"
                  delay={0.25}
                />
              </div>

              {/* Status Footer Verifikasi */}
              <div className="pt-6 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2 text-cyan-400">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="text-[11px] text-slate-300">Terverifikasi Kurikulum WOS v3</span>
                </div>
                <span className="text-cyan-400 font-bold text-[11px] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  Pelajari &gt;
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
