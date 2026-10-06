import React, { useState, useMemo } from 'react';
import {
  HelpCircle,
  ChevronDown,
  Search,
  MessageSquare,
  Phone,
  Sparkles,
  ShieldAlert,
  Calendar,
  CreditCard,
  Shirt,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CATEGORIZED_FAQS_DATA, ADMIN_PHONE_INTL } from '../data/academyData';
import { FAQCategory, CategorizedFAQ } from '../types';

interface FAQSectionProps {
  onOpenChat?: () => void;
  onRegisterClick?: () => void;
}

export const FAQSection: React.FC<FAQSectionProps> = ({
  onOpenChat,
  onRegisterClick,
}) => {
  const [activeCategory, setActiveCategory] = useState<FAQCategory>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [openFaqIds, setOpenFaqIds] = useState<string[]>(['faq-1', 'faq-4']); // Default open top relevant questions

  const toggleFaq = (id: string) => {
    setOpenFaqIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const categories: { id: FAQCategory; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'all', label: 'Semua Tanya Jawab', icon: HelpCircle },
    { id: 'curriculum', label: 'Usia & Trauma Air', icon: ShieldAlert },
    { id: 'schedule', label: 'Jadwal & Reschedule', icon: Calendar },
    { id: 'pricing', label: 'Biaya & Paket', icon: CreditCard },
    { id: 'gear', label: 'Perlengkapan & Sertifikat', icon: Shirt },
  ];

  // Filtered FAQs based on category & search query
  const filteredFaqs = useMemo(() => {
    return CATEGORIZED_FAQS_DATA.filter((faq) => {
      const q = (searchQuery || '').trim().toLowerCase();
      const matchCategory = activeCategory === 'all' || faq.category === activeCategory;
      const matchSearch =
        q === '' ||
        (faq.question || '').toLowerCase().includes(q) ||
        (faq.answer || '').toLowerCase().includes(q) ||
        (Boolean(faq.badge) && (faq.badge || '').toLowerCase().includes(q));

      return matchCategory && matchSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <section
      id="faq-section"
      className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto relative scroll-mt-20"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-full max-w-3xl h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold tracking-wider uppercase backdrop-blur-md">
          <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
          <span>PUSAT BANTUAN WALI MURID • FAQ</span>
        </div>

        <h2 className="font-athletic font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight">
          Pertanyaan yang Sering{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">
            Ditanyakan Orang Tua
          </span>
        </h2>

        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          Semua informasi penting seputar metode pembinaan, fleksibilitas jadwal, dan biaya kami sajikan secara
          terbuka dan transparan demi kenyamanan keluarga Anda.
        </p>
      </div>

      {/* Instant Search Bar */}
      <div className="relative max-w-xl mx-auto mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            id="faq-search-input"
            type="text"
            placeholder="Cari pertanyaan... (misal: sakit, balita, kacamata, biaya)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-10 py-3.5 bg-slate-900/90 border border-slate-700/80 rounded-2xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 shadow-xl backdrop-blur-md"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
              aria-label="Hapus pencarian"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-3 mb-8 no-scrollbar">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              id={`faq-category-${cat.id}`}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-bold shadow-cyan-500/20'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* FAQs List */}
      <div className="space-y-3.5">
        {filteredFaqs.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-10 text-center text-slate-400">
            <HelpCircle className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            <p className="text-sm">Tidak menemukan jawaban untuk pencarian "{searchQuery}".</p>
            <p className="text-xs text-slate-500 mt-1">
              Coba gunakan kata kunci lain atau langsung tanyakan ke Admin WhatsApp kami.
            </p>
            <a
              href={`https://wa.me/${ADMIN_PHONE_INTL}?text=Halo%20Admin%20Wavora,%20saya%20ingin%20bertanya%20mengenai:%20${encodeURIComponent(
                searchQuery
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow hover:bg-emerald-500"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Tanya ke Admin via WhatsApp</span>
            </a>
          </div>
        ) : (
          filteredFaqs.map((faq) => {
            const isOpen = openFaqIds.includes(faq.id);

            return (
              <div
                key={faq.id}
                id={`faq-item-${faq.id}`}
                className={`border rounded-2xl transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'bg-slate-900/90 border-cyan-500/50 shadow-lg shadow-cyan-950/30 ring-1 ring-cyan-500/20'
                    : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/70'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(faq.id)}
                  aria-expanded={isOpen}
                  className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <span className="p-1.5 rounded-lg bg-cyan-950/80 text-cyan-400 border border-cyan-500/30 shrink-0 mt-0.5 sm:mt-0">
                      <HelpCircle className="w-4 h-4" />
                    </span>
                    <div>
                      <span className="font-semibold text-sm sm:text-base text-white block">
                        {faq.question}
                      </span>
                      {faq.badge && (
                        <span className="inline-block mt-1 text-[10px] font-mono font-bold text-teal-300 bg-teal-950/60 px-2 py-0.5 rounded border border-teal-500/30">
                          {faq.badge}
                        </span>
                      )}
                    </div>
                  </div>

                  <div
                    className={`p-1.5 rounded-full bg-slate-800 text-slate-400 transition-transform duration-300 shrink-0 ${
                      isOpen ? 'rotate-180 text-cyan-400 bg-cyan-950' : ''
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 sm:px-5 pb-5 pt-1 border-t border-slate-800/60 text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line pl-12 sm:pl-14">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Still Have Questions Card */}
      <div className="mt-12 bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center space-y-4 backdrop-blur-md">
        <div className="w-12 h-12 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 flex items-center justify-center mx-auto">
          <Sparkles className="w-6 h-6" />
        </div>

        <div className="max-w-md mx-auto space-y-1">
          <h3 className="font-athletic font-bold text-xl text-white">
            Masih Memiliki Pertanyaan Lain?
          </h3>
          <p className="text-xs sm:text-sm text-slate-400">
            Tim konsultan dan pelatih Wavora siap menjawab segala keraguan Anda secara ramah dan kekeluargaan.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <a
            href={`https://wa.me/${ADMIN_PHONE_INTL}?text=Halo%20Admin%20Wavora,%20saya%20ingin%20konsultasi%20tanya-tanya%20seputar%20pendaftaran%20renang.`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition-colors"
          >
            <Phone className="w-4 h-4" />
            <span>Chat WhatsApp Admin (0896-3418-9392)</span>
          </a>

          {onOpenChat && (
            <button
              type="button"
              onClick={onOpenChat}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 flex items-center gap-2 transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              <span>Tanya Wavora AI Assistant</span>
            </button>
          )}

          {onRegisterClick && (
            <button
              type="button"
              onClick={onRegisterClick}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-colors shadow-lg shadow-cyan-500/20"
            >
              Langsung Daftar Sekarang
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
