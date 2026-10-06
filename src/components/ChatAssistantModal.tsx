import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  ArrowRight,
  PhoneCall,
  Minimize2,
  ExternalLink,
} from 'lucide-react';
import { FAQ_DATABASE, ADMIN_PHONE_INTL, SYSTEM_VERSION } from '../data/academyData';
import { ChatMessage } from '../types';

interface ChatAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToSection: (sectionId: string) => void;
}

export const ChatAssistantModal: React.FC<ChatAssistantModalProps> = ({
  isOpen,
  onClose,
  onNavigateToSection,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Halo Ayah & Ibu! Selamat datang di WAVORA Aquatic Academy (WOS v3). Ada yang bisa saya bantu terkait program renang, jadwal kolam di Bandar Lampung, atau simulasi biaya?',
      timestamp: 'Baru saja',
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const quickChips = [
    'Berapa usia minimal?',
    'Bagaimana jika anak belum berani air?',
    'Berapa rasio pelatih?',
    'Di mana lokasi kolam?',
    'Berapa rincian biaya paket?',
    'Bagaimana jika absen sakit?',
  ];

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputQuery).trim();
    if (!text) return;

    // Add user message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: 'Baru saja',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    // Smart answer matching
    setTimeout(() => {
      const lower = (text || '').toLowerCase();
      let matchedFaq = FAQ_DATABASE.find((faq) =>
        faq.keywords.some((kw) => lower.includes(kw))
      );

      let replyText = '';
      let actionBtn: ChatMessage['actionButton'] = undefined;

      if (matchedFaq) {
        replyText = matchedFaq.answer;
        if (lower.includes('biaya') || lower.includes('harga') || lower.includes('paket')) {
          actionBtn = {
            label: 'Buka Kalkulator Biaya',
            targetSection: 'pricing-section',
          };
        } else if (lower.includes('lokasi') || lower.includes('jadwal')) {
          actionBtn = {
            label: 'Lihat Jadwal Pahoman & UNILA',
            targetSection: 'schedule-section',
          };
        }
      } else if (lower.includes('daftar') || lower.includes('gabung') || lower.includes('registrasi')) {
        replyText =
          'Pendaftaran dapat dilakukan secara digital melalui Portal Pendaftaran di website ini. Anda juga bisa langsung terhubung ke WhatsApp Admin kami.';
        actionBtn = {
          label: 'Isi Formulir Pendaftaran',
          targetSection: 'registration-section',
        };
      } else {
        replyText =
          'Terima kasih atas pertanyaannya! Untuk konsultasi lebih spesifik mengenai kondisi fisik anak, jadwal privat khusus, atau program O2SN, silakan langsung menghubungi tim Coach & Admin Wavora melalui WhatsApp.';
        actionBtn = {
          label: 'Chat Langsung via WhatsApp Admin',
          url: `https://wa.me/${ADMIN_PHONE_INTL}?text=Halo%20Admin%20Wavora,%20saya%20ingin%20konsultasi:%20${encodeURIComponent(
            text
          )}`,
        };
      }

      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: 'Baru saja',
        actionButton: actionBtn,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 600);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div
      id="chat-assistant-dialog"
      className="fixed bottom-4 right-4 z-50 w-[95vw] sm:w-[420px] h-[580px] max-h-[88vh] bg-slate-950 border border-cyan-500/40 rounded-2xl shadow-2xl shadow-cyan-950/90 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300"
    >
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-950 border-b border-slate-800 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Bot className="w-5 h-5" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-athletic font-extrabold text-sm text-white">WAVORA AI ASSISTANT</span>
              <span className="text-[9px] font-bold uppercase bg-cyan-950 text-cyan-300 px-1.5 py-0.2 rounded border border-cyan-500/30">
                WOS
              </span>
            </div>
            <p className="text-[10px] text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Online • Siap Menjawab 24/7
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Tutup Chat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-950/60">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-[13px] leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-medium rounded-tr-none'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none shadow-md'
              }`}
            >
              <div className="whitespace-pre-line">{m.text}</div>

              {/* Optional Action Button */}
              {m.actionButton && (
                <div className="mt-2.5 pt-2 border-t border-slate-800/80">
                  {m.actionButton.url ? (
                    <a
                      href={m.actionButton.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[11px] font-bold text-cyan-300 hover:text-cyan-200 bg-cyan-950/80 px-2.5 py-1.5 rounded-lg border border-cyan-500/30 transition-all"
                    >
                      <PhoneCall className="w-3 h-3" />
                      <span>{m.actionButton.label}</span>
                    </a>
                  ) : m.actionButton.targetSection ? (
                    <button
                      onClick={() => {
                        if (m.actionButton?.targetSection) {
                          onNavigateToSection(m.actionButton.targetSection);
                          onClose();
                        }
                      }}
                      className="inline-flex items-center gap-1.5 text-[11px] font-bold text-cyan-300 hover:text-cyan-200 bg-cyan-950/80 px-2.5 py-1.5 rounded-lg border border-cyan-500/30 transition-all"
                    >
                      <ArrowRight className="w-3 h-3" />
                      <span>{m.actionButton.label}</span>
                    </button>
                  ) : null}
                </div>
              )}
            </div>
            <span className="text-[9px] text-slate-400 mt-1 px-1">{m.timestamp}</span>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl w-fit text-cyan-400 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" />
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]" />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Question Chips */}
      <div className="px-3 py-2 bg-slate-900/90 border-t border-slate-800/80 overflow-x-auto scrollbar-none flex gap-1.5">
        {quickChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(chip)}
            className="shrink-0 text-[10px] font-semibold text-slate-300 hover:text-cyan-300 bg-slate-800 hover:bg-slate-700/80 px-2.5 py-1 rounded-full border border-slate-700 transition-all whitespace-nowrap"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
        <input
          type="text"
          placeholder="Ketik pertanyaan seputar Wavora..."
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
        />
        <button
          onClick={() => handleSendMessage()}
          disabled={!inputQuery.trim()}
          className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 transition-all shrink-0"
          aria-label="Kirim Pesan"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
