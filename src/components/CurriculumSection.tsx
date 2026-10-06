import React, { useState } from 'react';
import {
  Compass,
  Check,
  Users,
  Clock,
  ArrowRight,
  ArrowLeft,
  X,
  Sparkles,
  BookOpen,
  Layers,
  RotateCcw,
  Maximize2,
} from 'lucide-react';
import { CURRICULUM_PROGRAMS } from '../data/academyData';
import { ProgramCurriculum, ProgramCategory } from '../types';
import {
  ASSESSMENT_QUESTIONS,
  LEVEL_RECOMMENDATIONS,
  LevelResult,
} from './LevelQuizModal';

interface CurriculumSectionProps {
  onSelectProgramForEnroll: (programTitle: string) => void;
  onOpenQuiz?: () => void;
  onSelectLevelForRegistration?: (levelName: string) => void;
}

export const CurriculumSection: React.FC<CurriculumSectionProps> = ({
  onSelectProgramForEnroll,
  onOpenQuiz,
  onSelectLevelForRegistration,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<ProgramCategory>('all');
  const [activeModalProgram, setActiveModalProgram] = useState<ProgramCurriculum | null>(null);

  // Inline Interactive Assessment State
  const [showInteractiveQuiz, setShowInteractiveQuiz] = useState<boolean>(false);
  const [quizStep, setQuizStep] = useState<number>(0);
  const [quizScores, setQuizScores] = useState<number[]>([]);
  const [quizResult, setQuizResult] = useState<LevelResult | null>(null);

  const totalQuizQuestions = ASSESSMENT_QUESTIONS.length;
  const currentQuizQ = ASSESSMENT_QUESTIONS[quizStep];
  const quizProgressPercent = Math.round(((quizStep + 1) / totalQuizQuestions) * 100);

  const handleSelectQuizOption = (score: number) => {
    const updated = [...quizScores];
    updated[quizStep] = score;
    setQuizScores(updated);

    if (quizStep < totalQuizQuestions - 1) {
      setQuizStep(quizStep + 1);
    } else {
      const totalScore = updated.reduce((a, b) => a + b, 0);
      if (totalScore <= 6) {
        setQuizResult(LEVEL_RECOMMENDATIONS.beginner);
      } else if (totalScore <= 9) {
        setQuizResult(LEVEL_RECOMMENDATIONS.intermediate);
      } else {
        setQuizResult(LEVEL_RECOMMENDATIONS.advanced);
      }
    }
  };

  const handleResetInlineQuiz = () => {
    setQuizStep(0);
    setQuizScores([]);
    setQuizResult(null);
  };

  const handleEnrollFromQuiz = () => {
    if (quizResult) {
      if (onSelectLevelForRegistration) {
        onSelectLevelForRegistration(quizResult.level);
      } else {
        onSelectProgramForEnroll(quizResult.level);
      }
    }
  };

  const filteredPrograms = CURRICULUM_PROGRAMS.filter((p) => {
    if (selectedFilter === 'all') return true;
    return p.category === selectedFilter;
  });

  return (
    <section id="curriculum-section" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 text-xs font-semibold tracking-wider uppercase mb-3">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            Kurikulum Berjenjang World Aquatics
          </div>
          <h2 className="font-athletic font-black text-3xl sm:text-4xl md:text-5xl tracking-tight text-white mb-4">
            LEVEL & PROGRAM <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent">WAVORA</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-300">
            Setiap anak berkembang dalam jalurnya masing-masing. Kurikulum kami terstruktur bertahap dari pemula balita hingga jalur kejuaraan resmi.
          </p>
        </div>

        {/* Banner Button from Image 2: BINGUNG MEMILIH? COBA QUIZ CEK LEVEL */}
        <div className="flex justify-center mb-8">
          <button
            id="btn-bingung-memilih-quiz"
            onClick={() => setShowInteractiveQuiz((prev) => !prev)}
            className={`w-full max-w-xl py-3.5 px-6 rounded-2xl bg-[#061427] hover:bg-[#091b35] border text-white flex items-center justify-center gap-3 transition-all duration-300 shadow-xl shadow-cyan-950/60 group cursor-pointer active:scale-[0.99] ${
              showInteractiveQuiz
                ? 'border-cyan-400 ring-2 ring-cyan-400/30 bg-[#091a33]'
                : 'border-cyan-500/40 hover:border-cyan-400'
            }`}
          >
            <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 group-hover:scale-110 group-hover:rotate-12 transition-transform" />
            <span className="font-heading font-black text-sm sm:text-base tracking-wider uppercase text-white group-hover:text-cyan-200">
              BINGUNG MEMILIH? COBA QUIZ CEK LEVEL
            </span>
          </button>
        </div>

        {/* Interactive Assessment Widget (Opens when button is clicked) */}
        {showInteractiveQuiz && (
          <div
            id="inline-interactive-assessment"
            className="max-w-2xl mx-auto mb-12 bg-slate-900/95 border-2 border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-cyan-950/80 backdrop-blur-xl relative overflow-hidden animate-in fade-in duration-300"
          >
            {/* Top Bar with Badge & Controls */}
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-[11px] font-mono uppercase tracking-wider font-extrabold bg-cyan-950 border border-cyan-500/50 text-cyan-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  Interactive Assessment Wavora
                </span>
              </div>
              <div className="flex items-center gap-2">
                {onOpenQuiz && (
                  <button
                    onClick={onOpenQuiz}
                    title="Buka Popup Layar Penuh"
                    className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition-colors text-xs flex items-center gap-1"
                  >
                    <Maximize2 className="w-4 h-4" />
                    <span className="hidden sm:inline text-[11px]">Layar Penuh</span>
                  </button>
                )}
                <button
                  onClick={() => setShowInteractiveQuiz(false)}
                  title="Tutup Asesmen"
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!quizResult ? (
              <div>
                {/* Progress Bar & Counter */}
                <div className="mb-6">
                  <div className="flex items-center justify-between text-xs font-mono text-cyan-400 mb-2">
                    <span>
                      PERTANYAAN {quizStep + 1} DARI {totalQuizQuestions}
                    </span>
                    <span>{quizProgressPercent}% Selesai</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-teal-400 rounded-full transition-all duration-300"
                      style={{ width: `${quizProgressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Question */}
                <h3 className="text-base sm:text-lg font-bold text-white mb-5 leading-snug">
                  {currentQuizQ.question}
                </h3>

                {/* Options List */}
                <div className="space-y-3 mb-6">
                  {currentQuizQ.options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectQuizOption(option.score)}
                      className="w-full text-left p-4 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-cyan-500/50 transition-all duration-200 group flex items-center justify-between gap-3 cursor-pointer"
                    >
                      <span className="text-xs sm:text-sm text-slate-200 group-hover:text-white font-medium">
                        {option.text}
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 shrink-0 group-hover:translate-x-1 transition-all" />
                    </button>
                  ))}
                </div>

                {/* Back button if past first step */}
                {quizStep > 0 && (
                  <button
                    onClick={() => setQuizStep((prev) => prev - 1)}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-300 font-mono transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Kembali ke pertanyaan sebelumnya
                  </button>
                )}
              </div>
            ) : (
              /* Quiz Result Recommendation Card */
              <div className="text-center py-2 animate-in fade-in zoom-in-95 duration-200">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 border border-cyan-500/40 text-cyan-400 mb-4 shadow-lg shadow-cyan-500/10">
                  <Sparkles className="w-7 h-7 text-cyan-300" />
                </div>

                <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold mb-1">
                  HASIL ASESMEN ONLINE
                </div>
                <h3 className="font-athletic font-black text-2xl sm:text-3xl text-white mb-3">
                  Rekomendasi:{' '}
                  <span className="bg-gradient-to-r from-cyan-400 to-teal-300 bg-clip-text text-transparent">
                    {quizResult.level}
                  </span>
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto mb-5 leading-relaxed">
                  {quizResult.description}
                </p>

                {/* Meta details */}
                <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto mb-6">
                  <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-center">
                    <span className="block text-[10px] font-mono text-slate-400 uppercase">
                      Rasio Kelas
                    </span>
                    <span className="text-xs font-bold text-cyan-300">{quizResult.ratio}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-center">
                    <span className="block text-[10px] font-mono text-slate-400 uppercase">
                      Rentang Usia
                    </span>
                    <span className="text-xs font-bold text-teal-300">{quizResult.age}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={handleEnrollFromQuiz}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 font-athletic font-black text-xs sm:text-sm tracking-wide uppercase hover:shadow-lg hover:shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <span>Daftar Level Ini Sekarang</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleResetInlineQuiz}
                    className="w-full sm:w-auto px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold tracking-wide transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Ulangi Asesmen</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Filterable Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {[
            { id: 'all', label: 'Semua Level' },
            { id: 'beginner', label: 'Beginner' },
            { id: 'intermediate', label: 'Intermediate' },
            { id: 'advanced', label: 'Advanced / Competitive' },
          ].map((tab) => {
            const isSelected = selectedFilter === tab.id;
            return (
              <button
                key={tab.id}
                id={`curriculum-filter-${tab.id}`}
                onClick={() => setSelectedFilter(tab.id as ProgramCategory)}
                className={`px-5 py-2.5 rounded-xl font-athletic text-xs sm:text-sm font-bold tracking-wide transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/25'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Programs Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPrograms.map((program) => (
            <div
              key={program.id}
              id={`program-card-${program.id}`}
              className="rounded-2xl bg-slate-900/70 backdrop-blur-md border border-white/[0.08] hover:border-cyan-500/40 p-6 sm:p-7 transition-all duration-300 flex flex-col justify-between group hover:shadow-xl hover:shadow-cyan-950/40 relative overflow-hidden"
            >
              <div className="relative z-10">
                {/* Badge & Age Tag */}
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 rounded-lg">
                    {program.badge}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Users className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{program.ratio}</span>
                  </div>
                </div>

                <h3 className="font-athletic font-extrabold text-xl sm:text-2xl text-white group-hover:text-cyan-300 transition-colors mb-1">
                  {program.title}
                </h3>
                <p className="text-xs font-semibold text-teal-400 mb-3">
                  {program.subtitle} • Rentang Usia: {program.ageBracket}
                </p>

                <p className="text-xs sm:text-sm text-slate-300 mb-5 leading-relaxed">
                  {program.summary}
                </p>

                {/* Core Competencies Checklist */}
                <div className="mb-6 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Fokus Kompetensi:
                  </span>
                  {program.coreCompetencies.slice(0, 3).map((comp, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                      <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{comp}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row gap-2 relative z-10">
                <button
                  id={`view-detail-btn-${program.id}`}
                  onClick={() => setActiveModalProgram(program)}
                  className="w-full sm:w-1/2 py-2.5 px-3 text-xs font-semibold text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-xl transition-all flex items-center justify-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Lihat Silabus Lengkap</span>
                </button>

                <button
                  id={`enroll-program-btn-${program.id}`}
                  onClick={() => onSelectProgramForEnroll(program.title)}
                  className="w-full sm:w-1/2 py-2.5 px-3 text-xs font-bold uppercase tracking-wider text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-300 hover:from-cyan-300 hover:to-teal-200 rounded-xl shadow-md shadow-cyan-500/20 transition-all flex items-center justify-center gap-1"
                >
                  <span>Daftar Level Ini</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal: Explore Program Details */}
        {activeModalProgram && (
          <div
            id="program-detail-modal"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
          >
            <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 relative shadow-2xl shadow-cyan-950/80">
              
              {/* Close Button */}
              <button
                id="close-program-modal-btn"
                onClick={() => setActiveModalProgram(null)}
                className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                aria-label="Tutup Modal"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              <div className="mb-6 pr-8">
                <span className="px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider bg-cyan-950 border border-cyan-500/40 text-cyan-300 rounded-lg inline-block mb-2">
                  {activeModalProgram.badge}
                </span>
                <h3 className="font-athletic font-extrabold text-2xl text-white mb-1">
                  {activeModalProgram.title}
                </h3>
                <p className="text-xs text-slate-400">
                  Rentang Usia: <strong className="text-slate-200">{activeModalProgram.ageBracket}</strong> • Rasio: <strong className="text-slate-200">{activeModalProgram.ratio}</strong>
                </p>
              </div>

              {/* Summary */}
              <p className="text-sm text-slate-300 mb-6 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                {activeModalProgram.summary}
              </p>

              {/* Weekly Syllabus Breakdown */}
              <div className="mb-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-3 flex items-center gap-1.5">
                  <Layers className="w-4 h-4" /> Modul & Silabus Mingguan
                </h4>
                <div className="space-y-2.5">
                  {activeModalProgram.weeklyModuleFocus.map((mod, idx) => (
                    <div key={idx} className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-teal-300">{mod.week}</span>
                        <span className="font-semibold text-white">{mod.topic}</span>
                      </div>
                      <p className="text-xs text-slate-400">{mod.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Graduating Criteria */}
              <div className="mb-8">
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-3 flex items-center gap-1.5">
                  <Check className="w-4 h-4" /> Syarat Kelulusan Level (E-Sertifikat WOS)
                </h4>
                <div className="space-y-1.5">
                  {activeModalProgram.graduatingCriteria.map((crit, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      <span>{crit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal CTA */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const progName = activeModalProgram.title;
                    setActiveModalProgram(null);
                    onSelectProgramForEnroll(progName);
                  }}
                  className="w-full py-3 text-sm font-bold uppercase tracking-wider text-slate-950 bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-300 rounded-xl shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2"
                >
                  <span>Pilih & Daftarkan Anak di Level Ini</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </section>
  );
};
