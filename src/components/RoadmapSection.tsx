import React, { useState } from 'react';
import { Sparkles, Waves, Award, CheckCircle, Target, ArrowRight, Activity, Clock } from 'lucide-react';
import { ROADMAP_DATA } from '../data/academyData';
import { AgeGroupId } from '../types';

interface RoadmapSectionProps {
  onRegisterInterest: (ageGroup: string) => void;
}

export const RoadmapSection: React.FC<RoadmapSectionProps> = ({ onRegisterInterest }) => {
  const [activeTab, setActiveTab] = useState<AgeGroupId>('junior');

  const currentRoadmap = ROADMAP_DATA.find((r) => r.id === activeTab) || ROADMAP_DATA[0];

  const getAgeIcon = (id: AgeGroupId) => {
    switch (id) {
      case 'toddler':
        return <Sparkles className="w-4 h-4" />;
      case 'junior':
        return <Waves className="w-4 h-4" />;
      case 'teen_athlete':
        return <Award className="w-4 h-4" />;
    }
  };

  return (
    <section id="roadmap-section" className="py-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 text-xs font-semibold tracking-wider uppercase mb-3">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            Simulator Perkembangan WOS v3
          </div>
          <h2 className="font-athletic font-black text-3xl sm:text-4xl md:text-5xl tracking-tight text-white mb-4">
            ATHLETE SKILL <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent">ROADMAP</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-300">
            Prediksi milestone ilmiah kemampuan renang anak Anda dalam 6 bulan pertama bersama pelatih Wavora.
          </p>
        </div>

        {/* Age Group Switcher Tabs */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-12">
          {ROADMAP_DATA.map((group) => {
            const isActive = activeTab === group.id;
            return (
              <button
                key={group.id}
                id={`roadmap-tab-${group.id}`}
                onClick={() => setActiveTab(group.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-athletic text-xs sm:text-sm font-bold tracking-wide transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 shadow-lg shadow-cyan-500/25 scale-[1.02]'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
                }`}
              >
                {getAgeIcon(group.id)}
                <span>{group.label}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Category Header Banner */}
        <div className="bg-slate-900/60 border border-cyan-500/20 rounded-2xl p-5 mb-8 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                Fokus Kategori: {currentRoadmap.ageRange}
              </span>
            </div>
            <p className="text-sm sm:text-base font-medium text-slate-200">
              {currentRoadmap.tagline}
            </p>
          </div>
          <button
            onClick={() => onRegisterInterest(currentRoadmap.label)}
            className="shrink-0 px-4 py-2 text-xs font-bold uppercase tracking-wider text-cyan-300 hover:text-white bg-cyan-950/80 hover:bg-cyan-900/80 border border-cyan-500/30 rounded-xl transition-all flex items-center gap-1.5"
          >
            <span>Daftar Usia Ini</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 3-Stage Milestones Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {currentRoadmap.stages.map((stage, idx) => (
            <div
              key={stage.stageNumber}
              id={`roadmap-stage-${stage.stageNumber}`}
              className="relative rounded-2xl bg-slate-900/70 backdrop-blur-md border border-white/[0.08] hover:border-cyan-500/40 p-6 transition-all duration-300 flex flex-col justify-between group hover:shadow-xl hover:shadow-cyan-950/40"
            >
              {/* Stage Header */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-cyan-950/90 border border-cyan-500/40 text-cyan-300 flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    {stage.timeframe}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-400">
                    Fase 0{stage.stageNumber} / 03
                  </span>
                </div>

                <h3 className="font-athletic font-extrabold text-lg sm:text-xl text-white group-hover:text-cyan-300 transition-colors mb-2">
                  {stage.phaseTitle}
                </h3>
                <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                  {stage.description}
                </p>

                {/* Skills Acquired List */}
                <div className="mb-5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 block">
                    Target Keterampilan:
                  </span>
                  <ul className="space-y-2">
                    {stage.skills.map((skill, sIdx) => (
                      <li key={sIdx} className="flex items-start gap-2 text-xs text-slate-300">
                        <CheckCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                        <span>{skill}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Biomechanics & Metric Target */}
              <div className="pt-4 border-t border-slate-800 space-y-2.5">
                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
                  <div className="text-[10px] uppercase font-bold text-teal-400 flex items-center gap-1 mb-1">
                    <Target className="w-3 h-3" /> Target Biomekanika
                  </div>
                  <p className="text-xs text-slate-300 italic">
                    "{stage.biomechanicsTarget}"
                  </p>
                </div>

                <div className="text-[11px] text-slate-400">
                  <strong className="text-slate-200">Kriteria Evaluasi WOS:</strong> {stage.assessmentMetric}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
