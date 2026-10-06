import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, CheckCircle2, Copy, Check, X, Tag, Award, Users, Droplets } from 'lucide-react';

export type VoucherCardCode = 'WAVORA50' | 'JUARA100' | 'BUDDYSQUAD' | string;

interface FloatingVoucherCardProps {
  code: VoucherCardCode;
  discountAmount?: number;
  onRemove?: () => void;
  showRemoveButton?: boolean;
  interactiveTilt?: boolean;
}

export const FloatingVoucherCard: React.FC<FloatingVoucherCardProps> = ({
  code,
  discountAmount,
  onRemove,
  showRemoveButton = true,
  interactiveTilt = true,
}) => {
  const normalizedCode = (code || '').trim().toUpperCase();
  const [copied, setCopied] = useState<boolean>(false);
  const [rotateX, setRotateX] = useState<number>(0);
  const [rotateY, setRotateY] = useState<number>(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(normalizedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactiveTilt || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rX = ((y - centerY) / centerY) * -8;
    const rY = ((x - centerX) / centerX) * 8;
    setRotateX(rX);
    setRotateY(rY);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  // Preset configuration based on code
  const isJuara = normalizedCode === 'JUARA100';
  const isBuddy = normalizedCode === 'BUDDYSQUAD';
  const isWavora50 = normalizedCode === 'WAVORA50';

  const discountFormatted = discountAmount
    ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(discountAmount)
    : isJuara || isBuddy
    ? 'Rp 100.000'
    : 'Rp 50.000';

  return (
    <div className="relative w-full max-w-md mx-auto my-3 select-none perspective-[1000px]">
      {/* Aquatic water particle confetti celebration floating around */}
      <div className="absolute -top-3 -left-3 pointer-events-none z-20">
        <motion.div
          animate={{ scale: [1, 1.25, 1], opacity: [0.7, 1, 0.7], rotate: [0, 15, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-950/90 border border-cyan-400/60 shadow-lg shadow-cyan-500/30 text-[10px] font-bold text-cyan-300 backdrop-blur-md"
        >
          <Sparkles className="w-3 h-3 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
          <span>VOUCHER RESMI TERVERIFIKASI</span>
        </motion.div>
      </div>

      {showRemoveButton && onRemove && (
        <button
          type="button"
          onClick={onRemove}
          title="Batalkan Voucher"
          className="absolute -top-2 -right-2 z-30 w-7 h-7 rounded-full bg-slate-800/90 hover:bg-rose-900 border border-slate-600 hover:border-rose-400 text-slate-300 hover:text-white flex items-center justify-center transition-all shadow-md group cursor-pointer"
        >
          <X className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
        </button>
      )}

      {/* Floating 3D Card Animation Wrapper */}
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        initial={{ scale: 0.92, opacity: 0, y: 16 }}
        animate={{
          scale: 1,
          opacity: 1,
          y: [0, -7, 0],
          rotateX,
          rotateY,
        }}
        transition={{
          y: {
            duration: 3.5,
            repeat: Infinity,
            ease: 'easeInOut',
          },
          scale: { duration: 0.4 },
          opacity: { duration: 0.4 },
          rotateX: { type: 'spring', stiffness: 260, damping: 20 },
          rotateY: { type: 'spring', stiffness: 260, damping: 20 },
        }}
        style={{ transformStyle: 'preserve-3d' }}
        className="relative group cursor-pointer"
      >
        {/* Underneath glowing aura */}
        <div
          className={`absolute -inset-1.5 rounded-2xl blur-xl opacity-60 group-hover:opacity-85 transition-opacity duration-500 -z-10 ${
            isJuara
              ? 'bg-gradient-to-r from-amber-500/40 via-cyan-500/30 to-amber-600/40'
              : isBuddy
              ? 'bg-gradient-to-r from-cyan-500/40 via-amber-500/30 to-teal-500/40'
              : 'bg-gradient-to-r from-cyan-500/40 via-teal-400/30 to-blue-600/40'
          }`}
        />

        {/* Outer Voucher Ticket Body */}
        <div
          className={`relative rounded-2xl p-4 sm:p-5 overflow-hidden border shadow-2xl transition-all ${
            isJuara
              ? 'bg-gradient-to-br from-[#0c1626] via-[#070e18] to-[#040810] border-amber-500/50 shadow-amber-950/40'
              : isBuddy
              ? 'bg-gradient-to-br from-[#08182b] via-[#05111e] to-[#030a12] border-cyan-400/50 shadow-cyan-950/40'
              : 'bg-gradient-to-br from-[#071728] via-[#04101e] to-[#020912] border-cyan-400/50 shadow-cyan-950/40'
          }`}
        >
          {/* Carbon fiber / subtle grid texture overlay */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage:
                'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.4) 1px, transparent 0)',
              backgroundSize: '12px 12px',
            }}
          />

          {/* Shimmer Light Sweeping Ray */}
          <motion.div
            animate={{ x: ['-150%', '250%'] }}
            transition={{
              duration: 3.8,
              repeat: Infinity,
              ease: 'easeInOut',
              repeatDelay: 1.5,
            }}
            className="absolute inset-y-0 w-32 -skew-x-12 pointer-events-none bg-gradient-to-r from-transparent via-white/10 to-transparent z-10"
          />

          {/* Golden / Cyan Ambient Waves & Chevrons */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
            <svg
              className="absolute -right-8 -top-8 w-48 h-48 text-cyan-500/20 transform rotate-12"
              fill="none"
              viewBox="0 0 200 200"
            >
              <path
                d="M20,100 C60,40 140,40 180,100 C140,160 60,160 20,100 Z"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M40,100 C70,60 130,60 160,100 C130,140 70,140 40,100 Z"
                stroke={isJuara ? '#F59E0B' : '#06B6D4'}
                strokeWidth="1.5"
              />
            </svg>
          </div>

          {/* Ticket Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.1] relative z-10">
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shadow-md ${
                  isJuara
                    ? 'bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 shadow-amber-500/30'
                    : isBuddy
                    ? 'bg-gradient-to-tr from-cyan-400 to-teal-300 text-slate-950 shadow-cyan-500/30'
                    : 'bg-gradient-to-tr from-cyan-400 to-blue-500 text-slate-950 shadow-cyan-500/30'
                }`}
              >
                {isJuara ? <Award className="w-4 h-4" /> : isBuddy ? <Users className="w-4 h-4" /> : <Droplets className="w-4 h-4" />}
              </div>
              <div>
                <div className="font-athletic font-black text-xs sm:text-sm tracking-wider text-white">
                  WAVORA AQUATIC ACADEMY
                </div>
                <div className="text-[9px] uppercase tracking-widest text-slate-400">
                  {isJuara ? 'REGULER (8X) • PRIVAT (8X) • WCT (16X)' : isBuddy ? 'SWIMMING SQUAD PROGRAM' : 'OFFICIAL ACADEMY PASS'}
                </div>
              </div>
            </div>

            <div className="text-right">
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-black uppercase tracking-wider ${
                  isJuara
                    ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                    : isBuddy
                    ? 'bg-teal-400/20 text-teal-300 border border-teal-400/40'
                    : 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/40'
                }`}
              >
                GIFT VOUCHER
              </span>
            </div>
          </div>

          {/* Ticket Main Content Grid (Ticket Stub layout) */}
          <div className="grid grid-cols-12 gap-3 pt-3.5 items-center relative z-10">
            {/* Left/Center Details (9 cols) */}
            <div className="col-span-8 sm:col-span-9 space-y-2">
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    isJuara
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : isBuddy
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                      : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  }`}
                >
                  {isBuddy ? '2-4 ATLET LEBIH HEMAT' : `HEMAT ${discountFormatted}`}
                </span>
                <span className="text-[10px] text-slate-400">• Terpasang Otomatis</span>
              </div>

              {/* Bold Glowing Code Pill */}
              <div
                onClick={handleCopy}
                title="Klik untuk menyalin kode"
                className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer ${
                  isJuara
                    ? 'bg-gradient-to-r from-amber-950/60 to-slate-900/90 border-amber-400/50 hover:border-amber-300'
                    : isBuddy
                    ? 'bg-gradient-to-r from-cyan-950/60 to-slate-900/90 border-cyan-400/50 hover:border-cyan-300'
                    : 'bg-gradient-to-r from-cyan-950/60 to-slate-900/90 border-cyan-400/50 hover:border-cyan-300'
                }`}
              >
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-slate-400">Kode Kupon Resmi</div>
                  <div
                    className={`font-mono font-black text-lg sm:text-xl tracking-widest drop-shadow ${
                      isJuara ? 'text-amber-300' : isBuddy ? 'text-teal-300' : 'text-cyan-300'
                    }`}
                  >
                    {normalizedCode}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-[11px] font-semibold text-slate-300 hover:text-white">
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin</span>
                    </>
                  )}
                </div>
              </div>

              {/* Sub-label */}
              <p className="text-[10px] text-slate-300 leading-tight">
                {isJuara && '★ Khusus Kelas Reguler (8 sesi), Kelas Privat (8 sesi), dan WCT (16 sesi).'}
                {isBuddy && '★ Paket kebersamaan: Daftarkan 2–4 anak sekaligus dalam 1 formulir registrasi.'}
                {isWavora50 && '★ Potongan langsung biaya pendaftaran untuk murid baru semua program.'}
                {!isJuara && !isBuddy && !isWavora50 && `★ Potongan biaya registrasi senilai ${discountFormatted}.`}
              </p>
            </div>

            {/* Right Ticket Stub with Perforated Tear Line & Barcode (3-4 cols) */}
            <div className="col-span-4 sm:col-span-3 border-l-2 border-dashed border-white/20 pl-3 flex flex-col items-center justify-center text-center">
              {/* Swimmer Water Waves Silhouette */}
              <div className="mb-2">
                <svg
                  className={`w-8 h-8 ${isJuara ? 'text-amber-400' : 'text-cyan-400'}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2 17c1.5.7 3.5.7 5 0 2-1 4-1 6 0 1.5.7 3.5.7 5 0 1.5-.7 2-.7 3 0" />
                  <path d="M2 21c1.5.7 3.5.7 5 0 2-1 4-1 6 0 1.5.7 3.5.7 5 0 1.5-.7 2-.7 3 0" />
                  <circle cx="18" cy="7" r="2" />
                  <path d="m15.5 10.5-3 1.5-2.5-2" />
                </svg>
              </div>

              {/* Monospace Barcode Simulation */}
              <div className="font-mono text-[9px] tracking-tighter text-slate-400 select-none scale-y-125 opacity-70">
                ||| | |||| || ||| ||
              </div>
              <div className="text-[8px] font-mono text-slate-500 mt-1">WVR-2026</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
