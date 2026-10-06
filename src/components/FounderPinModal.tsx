import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ShieldCheck, KeyRound, Lock, X, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { verifyFounderPin } from '../services/scheduleDataService';

interface FounderPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const FounderPinModal: React.FC<FounderPinModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [mounted, setMounted] = useState(false);
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyFounderPin(pin)) {
      setErrorMsg(null);
      setPin('');
      onSuccess();
    } else {
      setErrorMsg('PIN Otoritas Founder salah. Akses ditolak.');
    }
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/85 backdrop-blur-md">
        <div className="min-h-full flex items-center justify-center p-4 sm:p-6 text-center">
          
          {/* Backdrop Click */}
          <div
            className="fixed inset-0 -z-10"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Dialog Window */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md bg-[#091528] border-2 border-amber-500/50 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-amber-950/40 z-10 text-slate-100 space-y-5 my-6 text-left"
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
                  <KeyRound className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-amber-400 bg-amber-950/80 border border-amber-500/30 px-2 py-0.5 rounded">
                    Keamanan WOS
                  </span>
                  <h3 className="font-athletic font-bold text-xl text-white mt-1">
                    Wewenang Founder
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors border border-slate-700/60 cursor-pointer"
                aria-label="Tutup dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Masukkan PIN Otoritas Founder untuk mengaktifkan wewenang pengeditan jadwal, kuota, pelatih, dan jam sesi latihan secara langsung.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  PIN Akses Founder:
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type={showPin ? 'text' : 'password'}
                    autoFocus
                    value={pin}
                    onChange={(e) => {
                      setPin(e.target.value);
                      if (errorMsg) setErrorMsg(null);
                    }}
                    placeholder="Masukkan PIN Founder"
                    className="w-full pl-10 pr-11 py-3 bg-slate-950 border border-slate-700 rounded-2xl text-sm text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 font-mono tracking-wider"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    aria-label={showPin ? 'Sembunyikan PIN' : 'Tampilkan PIN'}
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errorMsg && (
                  <p className="text-xs text-rose-400 flex items-center gap-1 mt-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errorMsg}</span>
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-950/50 active:scale-95 transition-all cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Buka Akses Founder</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>,
    document.body
  );
};
