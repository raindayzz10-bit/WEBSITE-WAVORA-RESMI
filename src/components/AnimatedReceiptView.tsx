import React, { useState, useEffect, useRef } from 'react';
import {
  Download,
  Share2,
  Copy,
  Check,
  Printer,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Volume2,
  VolumeX,
  Radio,
  Cpu,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RegistrationTicket } from '../types';
import {
  generateReceiptCanvas,
  downloadReceiptImage,
  shareReceiptImageToWhatsApp,
} from '../utils/generateReceiptImage';
import { ADMIN_PHONE_INTL } from '../data/academyData';
import { playThermalPrinterSound } from '../utils/printerSound';

interface AnimatedReceiptViewProps {
  ticket: RegistrationTicket;
  packageName: string;
  locationName: string;
  locationTime?: string;
  whatsappMessage: string;
  onReset: () => void;
}

export const AnimatedReceiptView: React.FC<AnimatedReceiptViewProps> = ({
  ticket,
  packageName,
  locationName,
  locationTime = '',
  whatsappMessage,
  onReset,
}) => {
  const [theme, setTheme] = useState<'receipt' | 'cyber'>('receipt');
  const [isPrinting, setIsPrinting] = useState<boolean>(true);
  const [printProgress, setPrintProgress] = useState<number>(0);
  const [printKey, setPrintKey] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('wavora_printer_muted') === 'true';
  });
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [isSharing, setIsSharing] = useState<boolean>(false);

  const soundCancelRef = useRef<(() => void) | null>(null);

  // Format IDR Currency
  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const athletesList =
    ticket.formData.athletes && ticket.formData.athletes.length > 0
      ? ticket.formData.athletes
      : [
          {
            athleteName: ticket.formData.athleteName,
            age: ticket.formData.age,
            gender: ticket.formData.gender,
            waterExperience: ticket.formData.waterExperience,
            medicalNotes: ticket.formData.medicalNotes,
          },
        ];

  const firstAthleteName = athletesList[0]?.athleteName || 'Calon Atlet Wavora';

  // Toggle Sound Mute
  const handleToggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('wavora_printer_muted', String(next));
      } catch {}
      return next;
    });
  };

  // Trigger Mechanical Print Sequence
  const startPrintSequence = () => {
    if (soundCancelRef.current) {
      soundCancelRef.current();
      soundCancelRef.current = null;
    }

    setIsPrinting(true);
    setPrintProgress(5);
    setPrintKey((prev) => prev + 1);

    // Play synthesized mechanical sound
    soundCancelRef.current = playThermalPrinterSound(isMuted);

    // Staged progress to match physical feed bursts
    const t1 = setTimeout(() => setPrintProgress(38), 450);
    const t2 = setTimeout(() => setPrintProgress(72), 950);
    const t3 = setTimeout(() => setPrintProgress(95), 1450);
    const t4 = setTimeout(() => {
      setPrintProgress(100);
      setIsPrinting(false);
    }, 1850);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      if (soundCancelRef.current) {
        soundCancelRef.current();
        soundCancelRef.current = null;
      }
    };
  };

  // Run print sequence on initial mount
  useEffect(() => {
    const cleanup = startPrintSequence();
    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  const handleDownload = () => {
    downloadReceiptImage({
      ticket,
      packageName,
      locationName,
      locationTime,
      theme,
    });
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 4500);
  };

  const handleShareOrSendWA = async () => {
    setIsSharing(true);
    const res = await shareReceiptImageToWhatsApp({
      ticket,
      packageName,
      locationName,
      locationTime,
      theme,
    });
    setIsSharing(false);

    if (res.sharedDirectly) {
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4500);
    } else {
      setDownloadSuccess(true);
      const encodedMsg = encodeURIComponent(whatsappMessage);
      const waUrl = `https://wa.me/${ADMIN_PHONE_INTL}?text=${encodedMsg}`;
      setTimeout(() => {
        window.open(waUrl, '_blank');
      }, 500);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(ticket.ticketCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  const normalPrice =
    ticket.rawPrice ||
    (ticket.voucherInfo ? ticket.totalEstimate + ticket.voucherInfo.discount : ticket.totalEstimate);

  return (
    <div className="w-full max-w-xl mx-auto px-2 sm:px-0">
      {/* Header Congratulations */}
      <div className="text-center mb-5">
        <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-emerald-400 via-teal-300 to-cyan-400 p-[1.5px] mx-auto mb-2.5 shadow-xl shadow-cyan-500/25">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
        </div>

        <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 inline-flex items-center gap-1.5 mb-1.5 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          Pendaftaran Berhasil • Struk Siap Diunduh
        </span>

        <h3 className="font-athletic font-black text-2xl sm:text-3xl text-white tracking-wide">
          Kios Digital Cetak Struk Pendaftaran
        </h3>
        <p className="text-xs text-slate-300 max-w-md mx-auto mt-0.5">
          Data pendaftaran telah diproses ke sistem WAVORA. Simpan struk resmi ini ke galeri HP Anda.
        </p>
      </div>

      {/* Style Theme Switcher */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <span className="text-[11px] font-mono text-slate-400">Gaya Struk:</span>
        <button
          type="button"
          onClick={() => setTheme('receipt')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            theme === 'receipt'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'bg-slate-850 text-slate-300 hover:bg-slate-800 border border-slate-700/60'
          }`}
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Struk Kasir Kertas (Paper)</span>
        </button>
        <button
          type="button"
          onClick={() => setTheme('cyber')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            theme === 'cyber'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'bg-slate-850 text-slate-300 hover:bg-slate-800 border border-slate-700/60'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>VIP Pass Atlet (Cyber Dark)</span>
        </button>
      </div>

      {/* =================================================================== */}
      {/* KIOS DIGITAL WAVORA PHYSICAL HARDWARE CASING & THERMAL DISPENSER    */}
      {/* =================================================================== */}
      <div className="relative mx-auto w-full max-w-md select-none">
        {/* KIOSK HARDWARE MACHINE TOP BODY */}
        <div className="relative z-30 rounded-t-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-cyan-500/40 shadow-2xl shadow-cyan-950/60 p-3.5 sm:p-4 overflow-hidden">
          {/* Subtle Industrial Hardware Rivets */}
          <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-slate-700 border border-slate-600 shadow-inner" />
          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-slate-700 border border-slate-600 shadow-inner" />

          {/* Machine Header Bar */}
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-cyan-950/90 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-sm shadow-cyan-500/30">
                <Cpu className="w-3.5 h-3.5 animate-pulse" />
              </div>
              <div>
                <div className="text-[10px] font-mono font-black text-cyan-300 tracking-wider uppercase flex items-center gap-1.5">
                  <span>WAVORA KIOSK POS-80</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                </div>
                <div className="text-[9px] font-mono text-slate-400 tracking-tight">
                  AQUATIC ATHLETE DISPENSER
                </div>
              </div>
            </div>

            {/* Controls: Audio Mute & Re-Print */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleToggleMute}
                className={`px-2 py-1 rounded-md text-[10px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer border ${
                  isMuted
                    ? 'bg-rose-950/70 border-rose-500/40 text-rose-300 hover:bg-rose-900'
                    : 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900'
                }`}
                title={isMuted ? 'Aktifkan Suara Mesin' : 'Bisukan Suara Mesin'}
              >
                {isMuted ? <VolumeX className="w-3 h-3 text-rose-400" /> : <Volume2 className="w-3 h-3 text-emerald-400" />}
                <span>{isMuted ? 'MUTE' : 'SUARA'}</span>
              </button>

              <button
                type="button"
                onClick={startPrintSequence}
                disabled={isPrinting}
                className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-slate-800 hover:bg-cyan-950/80 border border-slate-700 hover:border-cyan-500/50 text-slate-200 hover:text-cyan-300 flex items-center gap-1 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                title="Cetak ulang struk dan putar animasi kembali"
              >
                <RotateCcw className={`w-3 h-3 ${isPrinting ? 'animate-spin' : ''}`} />
                <span>CETAK ULANG</span>
              </button>
            </div>
          </div>

          {/* Machine Monospace Digital LCD Screen */}
          <div className="bg-black/90 rounded-lg p-2.5 border border-cyan-500/30 shadow-inner font-mono text-[10px] space-y-1">
            <div className="flex items-center justify-between text-cyan-400">
              <span className="flex items-center gap-1.5">
                <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
                <span className="tracking-wider">TERMINAL STATUS:</span>
              </span>
              {isPrinting ? (
                <span className="text-amber-400 font-bold animate-pulse flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                  MENCETAK KERTAS... ({printProgress}%)
                </span>
              ) : (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  SELESAI DICETAK
                </span>
              )}
            </div>

            <div className="text-slate-300 flex items-center justify-between tracking-tight text-[9px] pt-0.5 border-t border-slate-800">
              <span className="truncate max-w-[200px]">
                TIKET: <strong className="text-white">{ticket.ticketCode}</strong>
              </span>
              <span className="truncate max-w-[150px] text-right text-cyan-300">
                {firstAthleteName}
              </span>
            </div>

            {/* Roller Feed Animated Progress Bar */}
            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800 mt-1">
              <div
                className={`h-full transition-all duration-300 ${
                  isPrinting
                    ? 'bg-gradient-to-r from-amber-400 via-cyan-400 to-emerald-400 animate-pulse'
                    : 'bg-emerald-400'
                }`}
                style={{ width: `${printProgress}%` }}
              />
            </div>
          </div>

          {/* PHYSICAL CUTTER BLADE & PAPER SLOT (Metallic Slit) */}
          <div className="relative mt-3 -mb-1">
            {/* Upper cutter bevel */}
            <div className="h-2 bg-gradient-to-b from-slate-800 via-slate-700 to-slate-900 rounded-t-sm border-t border-slate-600/60 shadow-md flex items-center justify-between px-3">
              <div className="w-2 h-0.5 bg-slate-500 rounded-full" />
              <div className="text-[7px] font-mono text-cyan-400/80 tracking-widest uppercase">
                ▼ THERMAL PAPER CUTTER BLADE ▼
              </div>
              <div className="w-2 h-0.5 bg-slate-500 rounded-full" />
            </div>

            {/* Deep Cutter Mouth (Slit where paper physically feeds out) */}
            <div className="h-3.5 bg-black rounded-b-sm border-x border-b border-slate-800 relative shadow-inner overflow-hidden flex items-center justify-center">
              {/* Internal Feed Roller Visual Gears */}
              <div
                className={`absolute inset-0 opacity-40 bg-[repeating-linear-gradient(90deg,transparent,transparent_6px,#06b6d4_6px,#06b6d4_10px)] ${
                  isPrinting ? 'animate-pulse' : ''
                }`}
              />
              <div className="relative z-10 w-full h-[1.5px] bg-cyan-400/80 shadow-[0_0_8px_#06b6d4]" />
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* KINETIC DISPENSED PAPER ROLL (ANIMATED TICKET FEEDING OUTWARDS)     */}
        {/* =================================================================== */}
        <div className="relative -mt-1 overflow-hidden pt-0.5">
          <motion.div
            key={printKey}
            initial={{ y: -90, opacity: 0.35, scaleY: 0.8 }}
            animate={{
              y: isPrinting ? [ -90, -45, -15, 0 ] : 0,
              opacity: isPrinting ? [ 0.5, 0.8, 0.95, 1 ] : 1,
              scaleY: isPrinting ? [ 0.8, 0.92, 0.98, 1 ] : 1,
            }}
            transition={{
              duration: 1.85,
              times: [ 0, 0.35, 0.75, 1 ],
              ease: [ 0.16, 1, 0.3, 1 ],
            }}
            className="origin-top select-text"
          >
            {theme === 'receipt' ? (
              /* -------------------------------------------------------- */
              /* 1. REALISTIC THERMAL PAPER RECEIPT                       */
              /* -------------------------------------------------------- */
              <div className="relative mx-auto w-full bg-white text-slate-900 shadow-2xl border-x border-slate-300 font-sans">
                {/* Top Feed Stripe */}
                <div className="h-2 bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 w-full" />

                <div className="p-5 sm:p-6">
                  {/* Brand Header */}
                  <div className="text-center pb-3.5 border-b border-dashed border-slate-300">
                    <div className="inline-flex items-center gap-1 text-[11px] font-mono font-black tracking-widest text-cyan-800 uppercase bg-cyan-50 px-2 py-0.5 rounded mb-1">
                      WAVORA AQUATIC ACADEMY
                    </div>
                    <h4 className="text-xl font-black tracking-tight text-slate-950 uppercase font-athletic">
                      BUKTI PENDAFTARAN &amp; INVOICE
                    </h4>
                    <p className="text-[11px] text-slate-500 italic mt-0.5">
                      “One Wave, One Family” • Kolam Pahoman &amp; Unila
                    </p>
                  </div>

                  {/* Ticket ID & Timestamp */}
                  <div className="py-3 border-b border-dashed border-slate-300 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                        KODE REGISTRASI
                      </span>
                      <span className="text-lg font-mono font-black text-slate-900 tracking-wider">
                        {ticket.ticketCode}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="px-2.5 py-1 text-[11px] font-mono font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {copiedCode ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-cyan-600" />}
                      <span>{copiedCode ? 'Tersalin' : 'Salin'}</span>
                    </button>
                  </div>

                  {/* Data Calon Atlet & Orang Tua */}
                  <div className="py-3 border-b border-dashed border-slate-300 text-xs space-y-2">
                    <div className="text-[10px] font-mono font-bold text-cyan-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                      <span>[ DATA CALON ATLET ({athletesList.length} ATLET) ]</span>
                    </div>

                    {athletesList.map((ath, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 space-y-1"
                      >
                        <div className="flex justify-between items-center font-bold text-slate-900">
                          <span className="flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded-full bg-cyan-100 text-cyan-800 text-[10px] flex items-center justify-center font-bold">
                              {idx + 1}
                            </span>
                            <span>{ath.athleteName || `Calon Atlet #${idx + 1}`}</span>
                          </span>
                          <span className="text-[11px] font-normal text-slate-600">
                            {ath.age ? `${ath.age} Th` : '-'} • {ath.gender || '-'}
                          </span>
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-500 pt-0.5">
                          <span>Pengalaman Air:</span>
                          <span className="text-slate-800 font-medium">{ath.waterExperience || 'Belum Pernah'}</span>
                        </div>
                        {ath.medicalNotes && (
                          <div className="flex justify-between text-[11px] text-slate-500">
                            <span>Catatan Medis:</span>
                            <span className="text-slate-700 italic">{ath.medicalNotes}</span>
                          </div>
                        )}
                      </div>
                    ))}

                    <div className="pt-2 border-t border-slate-200/60 space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Orang Tua / Wali:</span>
                        <span className="font-semibold text-slate-800">
                          {ticket.formData.parentName} ({ticket.formData.relationship})
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">WhatsApp:</span>
                        <span className="font-mono font-bold text-cyan-800">{ticket.formData.whatsapp}</span>
                      </div>
                      {ticket.formData.email && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Email:</span>
                          <span className="text-slate-700">{ticket.formData.email}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Rincian Program & Venue */}
                  <div className="py-3 border-b border-dashed border-slate-300 text-xs space-y-1.5">
                    <div className="text-[10px] font-mono font-bold text-cyan-700 uppercase tracking-wider mb-2">
                      [ PROGRAM &amp; VENUE ]
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Paket Kelas:</span>
                      <span className="font-bold text-slate-900">{packageName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Frekuensi Sesi:</span>
                      <span className="font-semibold text-slate-800">{ticket.formData.sessions}x Sesi / Bulan</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Venue Kolam:</span>
                      <span className="font-semibold text-slate-800">{locationName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Preferensi Hari:</span>
                      <span className="text-slate-800">{ticket.formData.preferredDay}</span>
                    </div>
                  </div>

                  {/* Itemized Price Breakdown */}
                  <div className="py-3 border-b border-dashed border-slate-300 text-xs space-y-1.5">
                    <div className="text-[10px] font-mono font-bold text-cyan-700 uppercase tracking-wider mb-2">
                      [ RINCIAN INVESTASI ]
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Biaya Normal:</span>
                      <span className="text-slate-700">{formatRupiah(normalPrice)}</span>
                    </div>
                    {ticket.voucherInfo && ticket.voucherInfo.discount > 0 && (
                      <div className="flex justify-between text-emerald-700 font-medium">
                        <span>Voucher Kupon ({ticket.voucherInfo.code}):</span>
                        <span>-{formatRupiah(ticket.voucherInfo.discount)}</span>
                      </div>
                    )}
                    <div className="pt-2 mt-2 border-t border-slate-200 flex justify-between items-center">
                      <span className="font-bold text-slate-900 text-xs uppercase">TOTAL ESTIMASI:</span>
                      <span className="font-athletic font-black text-xl text-emerald-700">
                        {formatRupiah(ticket.totalEstimate)}
                      </span>
                    </div>
                  </div>

                  {/* Barcode & Security Stamp */}
                  <div className="pt-4 pb-2 text-center relative">
                    <div className="flex justify-center items-end gap-[2px] h-9 mb-1 opacity-80 overflow-hidden">
                      {[12, 28, 16, 32, 20, 10, 36, 18, 30, 14, 24, 34, 12, 28, 16, 20, 32, 10, 24, 18, 32, 14, 30, 22, 16, 28, 12, 34, 20, 16, 30].map(
                        (h, i) => (
                          <div
                            key={i}
                            className="bg-slate-900"
                            style={{
                              height: `${h}px`,
                              width: i % 3 === 0 ? '3px' : i % 2 === 0 ? '1.5px' : '2px',
                            }}
                          />
                        )
                      )}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 tracking-widest">
                      * {ticket.ticketCode} *
                    </div>

                    {/* Official Stamp */}
                    <div className="absolute right-0 top-3 transform -rotate-12 border-2 border-emerald-600 px-2 py-1 rounded text-[10px] font-black text-emerald-700 uppercase tracking-wider bg-emerald-50/80 shadow-xs pointer-events-none">
                      WAVORA OFFICIAL
                      <div className="text-[8px] font-semibold text-emerald-600">TERVERIFIKASI</div>
                    </div>
                  </div>

                  {/* Footer notes */}
                  <div className="pt-3 border-t border-dashed border-slate-300 text-center text-[10px] text-slate-400 space-y-0.5">
                    <p>Kirim struk ini ke WhatsApp Admin Wavora untuk konfirmasi kuota.</p>
                    <p className="font-bold text-cyan-800">WA Admin: 0896-3418-9392</p>
                  </div>
                </div>

                {/* REALISTIC ZIG-ZAG CUTTER TEETH (Serrated Bottom Edge) */}
                <div
                  className="w-full h-4 bg-slate-900"
                  style={{
                    clipPath:
                      'polygon(0% 0%, 3.125% 100%, 6.25% 0%, 9.375% 100%, 12.5% 0%, 15.625% 100%, 18.75% 0%, 21.875% 100%, 25% 0%, 28.125% 100%, 31.25% 0%, 34.375% 100%, 37.5% 0%, 40.625% 100%, 43.75% 0%, 46.875% 100%, 50% 0%, 53.125% 100%, 56.25% 0%, 59.375% 100%, 62.5% 0%, 65.625% 100%, 68.75% 0%, 71.875% 100%, 75% 0%, 78.125% 100%, 81.25% 0%, 84.375% 100%, 87.5% 0%, 90.625% 100%, 93.75% 0%, 96.875% 100%, 100% 0%, 100% 0%)',
                  }}
                />
              </div>
            ) : (
              /* -------------------------------------------------------- */
              /* 2. CYBER ATHLETIC VIP BOARDING PASS                      */
              /* -------------------------------------------------------- */
              <div className="relative mx-auto w-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white rounded-b-2xl shadow-2xl p-5 sm:p-6 border-x border-b border-cyan-500/40 font-sans overflow-hidden">
                {/* Corner cyan marks */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />

                {/* Pass Header */}
                <div className="flex items-center justify-between border-b border-dashed border-slate-700 pb-3 mb-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-cyan-400 block">
                      /// ONE WAVE, ONE FAMILY • WAVORA PASS
                    </span>
                    <h4 className="font-athletic font-black text-2xl text-white tracking-wide">
                      {ticket.ticketCode}
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-slate-400 block">STATUS</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      VERIFIED
                    </span>
                  </div>
                </div>

                {/* Pass Details Grid */}
                <div className="grid grid-cols-2 gap-2.5 text-xs mb-3">
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] uppercase text-slate-400 block">Nama Atlet</span>
                    <span className="font-bold text-white text-sm truncate block">{firstAthleteName}</span>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] uppercase text-slate-400 block">Usia &amp; Gender</span>
                    <span className="font-bold text-white text-sm">
                      {ticket.formData.age} Th ({ticket.formData.gender})
                    </span>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] uppercase text-slate-400 block">Paket Terpilih</span>
                    <span className="font-bold text-cyan-300 truncate block">{packageName}</span>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] uppercase text-slate-400 block">Venue Kolam</span>
                    <span className="font-bold text-white truncate block">{locationName}</span>
                  </div>
                </div>

                {/* Pass Investment Total */}
                <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between mb-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-400 block">
                      TOTAL ESTIMASI INVESTASI
                    </span>
                    <span className="text-xs text-cyan-300">{ticket.formData.sessions}x Sesi Pertemuan</span>
                  </div>
                  <span className="font-athletic font-black text-xl text-emerald-400">
                    {formatRupiah(ticket.totalEstimate)}
                  </span>
                </div>

                {/* Bottom Verification Note */}
                <div className="text-center text-[10px] text-slate-400 font-mono">
                  WOS v3.2 ENCRYPTED TICKET • SIAP KONFIRMASI WA ADMIN
                </div>

                {/* Serrated Cut Edge */}
                <div
                  className="w-full h-3 mt-3 bg-cyan-950"
                  style={{
                    clipPath:
                      'polygon(0% 0%, 3.125% 100%, 6.25% 0%, 9.375% 100%, 12.5% 0%, 15.625% 100%, 18.75% 0%, 21.875% 100%, 25% 0%, 28.125% 100%, 31.25% 0%, 34.375% 100%, 37.5% 0%, 40.625% 100%, 43.75% 0%, 46.875% 100%, 50% 0%, 53.125% 100%, 56.25% 0%, 59.375% 100%, 62.5% 0%, 65.625% 100%, 68.75% 0%, 71.875% 100%, 75% 0%, 78.125% 100%, 81.25% 0%, 84.375% 100%, 87.5% 0%, 90.625% 100%, 93.75% 0%, 96.875% 100%, 100% 0%, 100% 0%)',
                  }}
                />
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* ACTION CONTROLS: DOWNLOAD IMAGE & SEND DIRECT TO WHATSAPP           */}
      {/* =================================================================== */}
      <div className="mt-6 space-y-3">
        {/* Success Alert Banner */}
        {downloadSuccess && (
          <div className="p-3 rounded-xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-2 shadow-lg">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Gambar struk berhasil disimpan ke galeri HP!</strong> Silakan kirimkan file foto ini saat chat WhatsApp admin terbuka.
            </span>
          </div>
        )}

        {/* Action Button 1: Download Image Directly */}
        <button
          type="button"
          onClick={handleDownload}
          className="w-full py-3.5 px-5 rounded-xl font-athletic font-bold text-sm uppercase tracking-wider text-white bg-slate-800 hover:bg-slate-700 border border-cyan-500/40 hover:border-cyan-400 shadow-lg shadow-slate-950/50 flex items-center justify-center gap-2.5 transition-all cursor-pointer active:scale-[0.99] hover:shadow-cyan-500/20"
        >
          <Download className="w-4 h-4 text-cyan-400" />
          <span>Unduh Gambar Struk / Invoice (PNG HD)</span>
        </button>

        {/* Action Button 2: Send Direct to WhatsApp */}
        <button
          type="button"
          onClick={handleShareOrSendWA}
          disabled={isSharing}
          className="w-full py-4 px-6 rounded-xl font-athletic font-black text-sm uppercase tracking-wider text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 hover:from-emerald-300 hover:to-cyan-200 shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2.5 transition-all cursor-pointer active:scale-[0.99]"
        >
          <Share2 className="w-4 h-4 text-slate-950" />
          <span>
            {isSharing ? 'Menyiapkan Berkas...' : 'Kirim Struk ke WhatsApp Admin (0896-3418-9392)'}
          </span>
          <ExternalLink className="w-4 h-4 text-slate-950" />
        </button>

        {/* Auxiliary Links */}
        <div className="flex items-center justify-between pt-2 text-xs">
          <button
            type="button"
            onClick={handleCopyCode}
            className="text-slate-400 hover:text-cyan-300 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copiedCode ? 'Kode Tersalin!' : `Salin Kode: ${ticket.ticketCode}`}</span>
          </button>

          <button
            type="button"
            onClick={onReset}
            className="text-slate-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Daftar Calon Atlet Baru</span>
          </button>
        </div>
      </div>
    </div>
  );
};
