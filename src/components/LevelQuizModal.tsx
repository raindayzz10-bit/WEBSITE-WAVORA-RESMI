import React, { useState } from 'react';
import { Sparkles, X, ArrowRight, ArrowLeft, RotateCcw } from 'lucide-react';

interface LevelQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLevelForRegistration: (levelName: string) => void;
}

export interface AssessmentOption {
  text: string;
  score: number;
}

export interface AssessmentQuestion {
  question: string;
  options: AssessmentOption[];
}

export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  {
    question: 'Apakah calon atlet sudah bisa memasukkan wajah ke dalam air tanpa rasa takut?',
    options: [
      { text: 'Belum bisa, masih takut atau menolak kena air di wajah', score: 1 },
      { text: 'Sudah bisa meniup gelembung dan masuk air singkat', score: 2 },
      { text: 'Sangat nyaman menyelam dan membuka mata di air', score: 3 },
    ],
  },
  {
    question: 'Sejauh mana jarak berenang mandiri yang bisa dilakukan tanpa papan pelampung?',
    options: [
      { text: 'Belum bisa berenang tanpa pelampung/bantuan', score: 1 },
      { text: 'Bisa berenang 10-25 meter dengan gaya bebas sederhana', score: 2 },
      { text: 'Bisa berenang 50+ meter dengan 2 atau 3 gaya berbeda', score: 3 },
    ],
  },
  {
    question: 'Apakah calon atlet memahami teknik pernapasan samping gaya bebas?',
    options: [
      { text: 'Belum paham, masih menahan napas atau asal ambil napas', score: 1 },
      { text: 'Sudah mengerti pernapasan samping meski sesekali terhenti', score: 2 },
      { text: 'Sudah lancar bernapas ritmis di kedua sisi (bilateral breathing)', score: 3 },
    ],
  },
  {
    question: 'Apa tujuan utama yang ingin dicapai saat ini?',
    options: [
      { text: 'Bisa keselamatan air, percaya diri, & menguasai dasar renang', score: 1 },
      { text: 'Memperbaiki efisiensi gaya & meningkatkan stamina berenang', score: 2 },
      { text: 'Mengikuti kompetisi, kejuaraan, & pemangkasan limit waktu', score: 3 },
    ],
  },
];

export interface LevelResult {
  level: string;
  description: string;
  ratio: string;
  age: string;
}

export const LEVEL_RECOMMENDATIONS: { [key: string]: LevelResult } = {
  beginner: {
    level: 'BEGINNER',
    description:
      'Fokus pada adaptasi air, penguasaan keselamatan dasar, kontrol pernapasan, serta pembentukan meluncur dan gaya bebas awal secara percaya diri.',
    ratio: '1 Pelatih : 4-5 Atlet',
    age: '3 - 12 Tahun',
  },
  intermediate: {
    level: 'INTERMEDIATE',
    description:
      'Fokus pada penyempurnaan pernapasan samping gaya bebas, penguatan kayuhan gaya dada & punggung, serta peningkatan ketahanan berenang 25–50 meter secara mandiri.',
    ratio: '1 Pelatih : 4-5 Atlet',
    age: '4 - 15 Tahun',
  },
  advanced: {
    level: 'ADVANCED',
    description:
      'Fokus pada penguasaan 4 gaya kompetisi resmi, efisiensi kayuhan hidrodinamis, flip-turn, serta jalur persiapan seleksi kejuaraan O2SN & Kejurda.',
    ratio: '1 Pelatih : 1-4 Atlet',
    age: '6 - 17 Tahun',
  },
};

export const LevelQuizModal: React.FC<LevelQuizModalProps> = ({
  isOpen,
  onClose,
  onSelectLevelForRegistration,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedScores, setSelectedScores] = useState<number[]>([]);
  const [result, setResult] = useState<LevelResult | null>(null);

  if (!isOpen) return null;

  const totalQuestions = ASSESSMENT_QUESTIONS.length;
  const progressPercent = Math.round(((currentStep + 1) / totalQuestions) * 100);
  const currentQ = ASSESSMENT_QUESTIONS[currentStep];

  const handleSelectOption = (score: number) => {
    const updated = [...selectedScores];
    updated[currentStep] = score;
    setSelectedScores(updated);

    if (currentStep < totalQuestions - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Calculate total score
      const totalScore = updated.reduce((a, b) => a + b, 0);
      if (totalScore <= 6) {
        setResult(LEVEL_RECOMMENDATIONS.beginner);
      } else if (totalScore <= 9) {
        setResult(LEVEL_RECOMMENDATIONS.intermediate);
      } else {
        setResult(LEVEL_RECOMMENDATIONS.advanced);
      }
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setSelectedScores([]);
    setResult(null);
  };

  const handleProceedToEnroll = () => {
    if (result) {
      onSelectLevelForRegistration(result.level);
      onClose();
    }
  };

  return (
    <div
      id="level-quiz-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        id="level-quiz-card"
        className="bg-[#091528] border border-cyan-500/30 rounded-3xl max-w-xl w-full p-6 sm:p-8 relative shadow-2xl shadow-cyan-950/90 overflow-hidden"
      >
        {/* Background glow accent */}
        <div className="absolute top-0 right-0 w-56 h-56 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          id="close-quiz-btn"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors border border-slate-700/60 cursor-pointer"
          aria-label="Tutup Quiz"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header (Shared across questions and result) */}
        <div className="mb-6 pr-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 text-[11px] font-mono font-bold tracking-wider uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            INTERACTIVE ASSESSMENT
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-heading">
            Cek Level Atlet Online
          </h2>

          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Jawab 4 pertanyaan singkat untuk rekomendasi level program yang paling presisi.
          </p>
        </div>

        {!result ? (
          <div>
            {/* Step progress counter */}
            <div className="flex items-center justify-between text-xs font-mono font-bold tracking-wider mb-2.5">
              <span className="text-slate-400">
                PERTANYAAN {currentStep + 1} / {totalQuestions}
              </span>
              <span className="text-cyan-400">{progressPercent}%</span>
            </div>

            {/* Cyan progress bar */}
            <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden mb-6">
              <div
                className="bg-cyan-400 h-full rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(34,211,238,0.8)]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Question Text */}
            <h3 className="text-base sm:text-lg font-bold text-white mb-5 leading-snug">
              {currentQ.question}
            </h3>

            {/* Options List */}
            <div className="space-y-3 mb-6">
              {currentQ.options.map((opt, idx) => (
                <button
                  key={idx}
                  id={`quiz-opt-${currentStep}-${idx}`}
                  onClick={() => handleSelectOption(opt.score)}
                  className="w-full text-left p-4 rounded-xl bg-[#0b1b36]/90 hover:bg-cyan-950/70 border border-slate-750 hover:border-cyan-400/80 transition-all duration-200 group active:scale-[0.99] flex items-center justify-between gap-4 cursor-pointer shadow-sm"
                >
                  <span className="text-xs sm:text-sm font-medium text-slate-200 group-hover:text-white leading-relaxed">
                    {opt.text}
                  </span>
                  <ArrowRight className="w-4 h-4 text-cyan-400 shrink-0 group-hover:translate-x-1 transition-transform" />
                </button>
              ))}
            </div>

            {/* Step Back Control */}
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className="text-xs text-slate-400 hover:text-cyan-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Pertanyaan sebelumnya
              </button>
            )}
          </div>
        ) : (
          /* Result Card (Image 8) */
          <div className="space-y-6 animate-in zoom-in-95 duration-200">
            {/* Inner Neon Cyan Card */}
            <div className="rounded-2xl border-2 border-cyan-400 bg-[#06142a]/95 p-6 sm:p-8 text-center relative overflow-hidden shadow-[0_0_30px_rgba(6,182,212,0.18)]">
              {/* Rosette Ribbon / Medal Icon */}
              <div className="w-12 h-12 mx-auto mb-4 text-cyan-400 flex items-center justify-center">
                <svg
                  className="w-10 h-10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="8" r="6" />
                  <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
                </svg>
              </div>

              <p className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest text-cyan-400 mb-2">
                HASIL REKOMENDASI PROGRAM
              </p>

              <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-wide uppercase mb-4 font-heading">
                {result.level}
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md mx-auto mb-6">
                {result.description}
              </p>

              {/* Meta specifications */}
              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 pt-4 border-t border-cyan-900/60 text-xs font-mono text-slate-300">
                <div>
                  <span className="text-slate-400">Rasio: </span>
                  <strong className="text-cyan-300 font-bold">{result.ratio}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Usia: </span>
                  <strong className="text-white font-bold">{result.age}</strong>
                </div>
              </div>
            </div>

            {/* Bottom Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                id="quiz-enroll-now-btn"
                onClick={handleProceedToEnroll}
                className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-300 hover:from-cyan-300 hover:to-teal-200 text-slate-950 font-bold text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
              >
                <span>LIHAT PROGRAM & DAFTAR</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleReset}
                className="w-full sm:w-auto py-3.5 px-5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 border border-slate-700/60 transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>ULANGI QUIZ</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
