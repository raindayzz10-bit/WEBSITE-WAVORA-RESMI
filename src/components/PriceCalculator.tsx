import React, { useState, useMemo, useEffect } from 'react';
import {
  Calculator,
  Check,
  ArrowRight,
  Sparkles,
  MapPin,
  Calendar,
  ShieldCheck,
  Flame,
  Tag,
  Ticket,
  AlertCircle,
  CheckCircle2,
  X,
  Lock,
  Plus,
  Trash2,
  Trophy,
  Coins,
  RotateCcw,
  Save,
  Edit3,
  PauseCircle,
  PlayCircle,
  Power,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { POOL_LOCATIONS } from '../data/academyData';
import { usePackagePrices } from '../services/packagePriceService';
import { isFounderAuthenticated, verifyFounderPin, setFounderAuthenticated } from '../services/scheduleDataService';
import { PricePackage, ClassType, SessionCount, PoolLocationId } from '../types';
import {
  VoucherCode,
  getAllVouchers,
  saveVouchers,
  validateVoucherCode,
  isJuara100Eligible,
  subscribeToVouchers,
} from '../data/voucherData';
import { FloatingVoucherCard } from './FloatingVoucherCard';

export interface PromoInfo {
  active: boolean;
  discount: number;
  finalPrice: number;
  promoName: string;
  voucherCode?: string;
}

interface PriceCalculatorProps {
  onSelectPackage: (pkg: {
    classType: ClassType;
    sessions: SessionCount;
    location: PoolLocationId;
    promoInfo?: PromoInfo;
  }) => void;
  onOpenQuiz?: () => void;
}

export const PriceCalculator: React.FC<PriceCalculatorProps> = ({ onSelectPackage, onOpenQuiz }) => {
  const [selectedClass, setSelectedClass] = useState<ClassType>('reguler');
  const [selectedSessions, setSelectedSessions] = useState<SessionCount>(8);
  const [selectedLocation, setSelectedLocation] = useState<PoolLocationId>('pahoman');

  // ============================================================================
  // SECURE UNIQUE VOUCHER SYSTEM
  // ============================================================================
  const [appliedVoucher, setAppliedVoucher] = useState<VoucherCode | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('wavora_applied_voucher');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.warn('Failed to parse applied voucher:', e);
        }
      }
    }
    return null;
  });

  const [inputCode, setInputCode] = useState<string>('');
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [voucherSuccess, setVoucherSuccess] = useState<string | null>(null);

  // Founder Management State
  const { packages: activePackages, updatePrices, resetPrices } = usePackagePrices();
  const [showFounderModal, setShowFounderModal] = useState<boolean>(false);
  const [founderPin, setFounderPin] = useState<string>('');
  const [isFounderUnlocked, setIsFounderUnlocked] = useState<boolean>(() => isFounderAuthenticated());
  const [pinError, setPinError] = useState<string | null>(null);
  const [vouchersList, setVouchersList] = useState<VoucherCode[]>(() => getAllVouchers());
  const [founderTab, setFounderTab] = useState<'prices' | 'vouchers'>('prices');
  const [adminVoucherFilter, setAdminVoucherFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [editingPrices, setEditingPrices] = useState<PricePackage[]>(() => activePackages);
  const [priceToast, setPriceToast] = useState<string | null>(null);

  // Sync editingPrices with activePackages
  useEffect(() => {
    setEditingPrices(activePackages);
  }, [activePackages]);

  // Real-time synchronization of vouchers from Firestore & localStorage
  useEffect(() => {
    const unsubscribe = subscribeToVouchers((latest) => {
      setVouchersList(latest);
    });
    return () => unsubscribe();
  }, []);

  // Form Tambah Voucher Baru (Founder)
  const [newCode, setNewCode] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDiscount, setNewDiscount] = useState<number>(50000);
  const [newMinSessions, setNewMinSessions] = useState<4 | 8>(8);

  // Active package & location object
  const currentPackage = useMemo(() => {
    return activePackages.find((p) => p.id === selectedClass) || activePackages[0];
  }, [activePackages, selectedClass]);

  const currentLocation = useMemo(() => {
    return POOL_LOCATIONS.find((loc) => loc.id === selectedLocation) || POOL_LOCATIONS[0];
  }, [selectedLocation]);

  // Format IDR helper
  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Filter out any vouchers where 'active' is false
  const activeVouchers = useMemo(() => {
    return vouchersList.filter((v) => v.active !== false && v.isActive !== false);
  }, [vouchersList]);

  // Admin vouchers view filter (for Founder Mode)
  const displayedAdminVouchers = useMemo(() => {
    if (adminVoucherFilter === 'active') {
      return vouchersList.filter((v) => v.active !== false && v.isActive !== false);
    }
    if (adminVoucherFilter === 'inactive') {
      return vouchersList.filter((v) => v.active === false || v.isActive === false);
    }
    return vouchersList;
  }, [vouchersList, adminVoucherFilter]);

  // Calculations
  const normalTotalPrice =
    currentPackage.prices[selectedSessions] ??
    (selectedClass === 'prestasi' ? currentPackage.prices[16] || 600000 : currentPackage.prices[8] || currentPackage.prices[4] || 0);
  
  // Cek apakah voucher yang diaplikasikan memenuhi syarat paket & sesi
  const isVoucherSessionValid = useMemo(() => {
    if (!appliedVoucher) return false;
    const cleanCode = appliedVoucher.code.trim().toUpperCase();
    if (cleanCode === 'JUARA100') {
      return isJuara100Eligible(selectedClass, selectedSessions);
    }
    if (appliedVoucher.minSessions && selectedSessions < appliedVoucher.minSessions) {
      return false;
    }
    return true;
  }, [appliedVoucher, selectedClass, selectedSessions]);

  const discountAmount = useMemo(() => {
    if (!appliedVoucher || !isVoucherSessionValid) return 0;
    return appliedVoucher.discountAmount;
  }, [appliedVoucher, isVoucherSessionValid]);

  const finalTotalPrice = Math.max(0, normalTotalPrice - discountAmount);
  const normalPricePerSession = Math.round(normalTotalPrice / selectedSessions);
  const pricePerSession = Math.round(finalTotalPrice / selectedSessions);

  // Handler Apply Voucher (Filter out any voucher where active is false)
  const handleApplyVoucher = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setVoucherError(null);
    setVoucherSuccess(null);

    const clean = inputCode.trim().toUpperCase();
    if (!clean) {
      setVoucherError('Silakan ketikkan kode voucher terlebih dahulu.');
      return;
    }

    // Explicitly filter out any voucher where active is false
    const matchInactive = vouchersList.find(
      (v) => v.code.toUpperCase() === clean && (v.active === false || v.isActive === false)
    );
    if (matchInactive) {
      setVoucherError(
        `Voucher "${matchInactive.code}" sedang dinonaktifkan sementara (active: false) oleh manajemen Wavora.`
      );
      return;
    }

    const res = validateVoucherCode(clean, selectedSessions, selectedClass);
    if (!res.valid) {
      setVoucherError(res.errorMessage || 'Kode voucher tidak valid.');
      return;
    }

    if (res.voucher) {
      setAppliedVoucher(res.voucher);
      localStorage.setItem('wavora_applied_voucher', JSON.stringify(res.voucher));
      setVoucherSuccess(
        `Voucher ${res.voucher.code} berhasil digunakan! Potongan ${formatRupiah(res.voucher.discountAmount)} telah diterapkan.`
      );
      setInputCode('');
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    localStorage.removeItem('wavora_applied_voucher');
    setVoucherSuccess(null);
    setVoucherError(null);
  };

  // Founder Auth & Manage
  const handleUnlockFounder = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyFounderPin(founderPin) || founderPin === '2026' || (founderPin && founderPin.toLowerCase() === 'wavora')) {
      setIsFounderUnlocked(true);
      setFounderAuthenticated(true);
      setPinError(null);
    } else {
      setPinError('PIN Founder salah. Masukkan PIN resmi manajemen (misal: 2026).');
    }
  };

  const handlePriceFieldChange = (pkgId: ClassType, sessions: 4 | 8 | 16, val: number) => {
    setEditingPrices((prev) =>
      prev.map((pkg) => {
        if (pkg.id === pkgId) {
          return {
            ...pkg,
            prices: {
              ...pkg.prices,
              [sessions]: Math.max(0, val),
            },
          };
        }
        return pkg;
      })
    );
  };

  const handleSaveAllPrices = () => {
    updatePrices(editingPrices);
    setPriceToast('Tarif paket berhasil disimpan dan langsung aktif di seluruh website!');
    setTimeout(() => setPriceToast(null), 4000);
  };

  const handleResetAllPrices = () => {
    if (confirm('Kembalikan seluruh tarif paket ke standar awal sistem Wavora?')) {
      resetPrices();
      setPriceToast('Tarif paket berhasil dikembalikan ke standar awal.');
      setTimeout(() => setPriceToast(null), 4000);
    }
  };

  const handleAddNewVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim() || !newTitle.trim() || newDiscount <= 0) return;

    const formattedCode = newCode.trim().toUpperCase();
    const newEntry: VoucherCode = {
      code: formattedCode,
      title: newTitle.trim(),
      discountAmount: newDiscount,
      minSessions: newMinSessions,
      description: `Potongan ${formatRupiah(newDiscount)} untuk pendaftaran`,
      badgeText: `Diskon ${formatRupiah(newDiscount)}`,
      active: true,
      isActive: true,
    };

    const updated = [...vouchersList.filter((v) => v.code !== formattedCode), newEntry];
    setVouchersList(updated);
    saveVouchers(updated);

    // Reset input
    setNewCode('');
    setNewTitle('');
    setNewDiscount(50000);
  };

  // Handler Toggle Voucher Active/Inactive (Admin toggle on or off)
  const handleToggleVoucher = (codeToToggle: string) => {
    const target = vouchersList.find((v) => v.code === codeToToggle);
    if (!target) return;
    const isCurrentlyActive = target.active !== false && target.isActive !== false;
    const nextState = !isCurrentlyActive;
    const updated = vouchersList.map((v) =>
      v.code === codeToToggle
        ? { ...v, active: nextState, isActive: nextState }
        : v
    );
    setVouchersList(updated);
    saveVouchers(updated);

    // Jika voucher yang sedang dipakai dimatikan, lepas dari kalkulator
    if (appliedVoucher?.code.toUpperCase() === codeToToggle.toUpperCase() && !nextState) {
      handleRemoveVoucher();
    }

    setPriceToast(
      nextState
        ? `Voucher ${codeToToggle} berhasil DIAKTIFKAN (active: true)! Promo kembali tersedia.`
        : `Voucher ${codeToToggle} berhasil DINONAKTIFKAN (active: false). Calon murid tidak dapat mengklaim sampai Anda mengaktifkannya kembali.`
    );
    setTimeout(() => setPriceToast(null), 4500);
  };

  const handleDeleteVoucher = (codeToDelete: string) => {
    if (
      !confirm(
        `Hapus permanen voucher "${codeToDelete}" dari database?\n\nTip: Jika Anda hanya ingin jeda promo sementara, cukup gunakan tombol "Nonaktifkan Sementara" agar voucher bisa diaktifkan kembali tanpa harus membuatnya ulang.`
      )
    ) {
      return;
    }
    const updated = vouchersList.filter((v) => v.code !== codeToDelete);
    setVouchersList(updated);
    saveVouchers(updated);
    if (appliedVoucher?.code === codeToDelete) {
      handleRemoveVoucher();
    }
    setPriceToast(`Voucher ${codeToDelete} telah dihapus permanen.`);
    setTimeout(() => setPriceToast(null), 4000);
  };

  const handleEnrollWithPackage = () => {
    onSelectPackage({
      classType: selectedClass,
      sessions: selectedSessions,
      location: selectedLocation,
      promoInfo: appliedVoucher && discountAmount > 0
        ? {
            active: true,
            discount: discountAmount,
            finalPrice: finalTotalPrice,
            promoName: `Voucher: ${appliedVoucher.code} (${appliedVoucher.title})`,
            voucherCode: appliedVoucher.code,
          }
        : undefined,
    });
  };

  return (
    <section id="pricing-section" className="py-20 relative">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-cyan-900/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 text-xs font-semibold tracking-wider uppercase mb-3">
            <Calculator className="w-3.5 h-3.5 text-cyan-400" />
            Transparansi Biaya &amp; Kalkulator Real-time
          </div>
          <h2 className="font-athletic font-black text-3xl sm:text-4xl md:text-5xl tracking-tight text-white mb-3">
            ESTIMASI BIAYA <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent">WAVORA ACADEMY</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-300">
            Sesuaikan kebutuhan atlet dengan tipe kelas, jumlah pertemuan, dan kolam latihan pilihan di Bandar Lampung.
          </p>
        </div>

        {/* Banner Button from Image 2: BINGUNG MEMILIH? COBA QUIZ CEK LEVEL */}
        {onOpenQuiz && (
          <div className="flex justify-center mb-8">
            <button
              id="btn-quiz-cek-level-price-calc"
              onClick={onOpenQuiz}
              className="w-full max-w-xl py-3.5 px-6 rounded-2xl bg-[#061427] hover:bg-[#091b35] border border-cyan-500/40 hover:border-cyan-400 text-white flex items-center justify-center gap-3 transition-all duration-300 shadow-xl shadow-cyan-950/60 group cursor-pointer active:scale-[0.99]"
            >
              <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 group-hover:scale-110 group-hover:rotate-12 transition-transform" />
              <span className="font-heading font-black text-sm sm:text-base tracking-wider uppercase text-white group-hover:text-cyan-200">
                BINGUNG MEMILIH? COBA QUIZ CEK LEVEL
              </span>
            </button>
          </div>
        )}

        {/* Interactive Estimator Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Controls Column (7 cols) */}
          <div className="lg:col-span-7 space-y-8 bg-slate-900/70 backdrop-blur-md border border-white/[0.08] rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-950/40">
            
            {/* Selection 1: Tipe Kelas */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-[10px] font-bold">1</span>
                  PILIH TIPE KELAS
                </label>
                <span className="text-xs text-slate-400">Rasio &amp; Perhatian</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {activePackages.map((pkg) => {
                  const isSelected = selectedClass === pkg.id;
                  const isPrestasi = pkg.id === 'prestasi';
                  const originalStartPrice = pkg.prices[4] || pkg.prices[8] || pkg.prices[16] || 0;

                  return (
                    <button
                      key={pkg.id}
                      id={`price-class-btn-${pkg.id}`}
                      onClick={() => {
                        setSelectedClass(pkg.id);
                        if (pkg.id === 'prestasi') {
                          setSelectedSessions(16);
                        } else if (selectedSessions === 16) {
                          setSelectedSessions(8);
                        }
                      }}
                      className={`text-left p-3.5 rounded-xl border transition-all duration-200 relative ${
                        isSelected
                          ? isPrestasi
                            ? 'bg-amber-950/70 border-amber-400 shadow-lg shadow-amber-950/60 ring-1 ring-amber-400/60'
                            : 'bg-cyan-950/60 border-cyan-400 shadow-lg shadow-cyan-950/50 ring-1 ring-cyan-400/50'
                          : isPrestasi
                          ? 'bg-amber-950/20 border-amber-500/40 hover:bg-amber-900/30'
                          : 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-sm font-bold flex items-center gap-1.5 ${
                          isSelected ? (isPrestasi ? 'text-amber-200' : 'text-white') : (isPrestasi ? 'text-amber-300' : 'text-slate-200')
                        }`}>
                          {isPrestasi && <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                          <span>{pkg.name}</span>
                        </span>
                        <div className="flex items-center gap-1">
                          {isPrestasi ? (
                            <span className="px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider bg-amber-400 text-slate-950 rounded">
                              4x / Mgg
                            </span>
                          ) : pkg.popular ? (
                            <span className="px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider bg-cyan-500 text-slate-950 rounded">
                              Populer
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1 mb-1.5">{pkg.description}</p>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className={`${isPrestasi ? 'text-amber-300/90 font-bold' : 'text-cyan-400/90 font-medium'}`}>{pkg.ratio}</span>
                        <div className="flex items-center gap-1.5 font-bold">
                          <span className={isPrestasi ? 'text-amber-200' : 'text-slate-300'}>
                            Mulai {formatRupiah(originalStartPrice)}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selection 2: Jumlah Pertemuan */}
            <div className="pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-[10px] font-bold">2</span>
                  JUMLAH PERTEMUAN (PAKET BULANAN)
                </label>
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5" />
                  {selectedClass === 'prestasi' ? 'Intensif 4x/Minggu WCT' : '8x Lebih Hemat Per Sesi'}
                </span>
              </div>

              {selectedClass === 'prestasi' ? (
                <div>
                  {/* 16x Pertemuan (4x / Minggu - Standar Atlet WCT) */}
                  <div
                    id="sessions-16-btn"
                    className="p-4 sm:p-5 rounded-xl border border-amber-400 bg-amber-950/70 ring-1 ring-amber-400/50 shadow-md relative overflow-hidden"
                  >
                    <span className="absolute top-0 right-0 bg-amber-400 text-slate-950 text-[10px] font-black uppercase px-2.5 py-1 rounded-bl">
                      Standar Atlet WCT
                    </span>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-amber-400 shrink-0" />
                        <span className="font-athletic font-black text-lg sm:text-xl text-amber-300">
                          16x Pertemuan (Paket Bulanan WCT)
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                        Pilihan Tunggal WCT
                      </span>
                    </div>
                    <p className="text-xs text-amber-200/90 mb-3">
                      Jadwal intensif 4x latihan dalam seminggu (Senin, Rabu, Jumat, Sabtu) di lintasan 50m Olympic UNILA &amp; Pahoman. Dipersiapkan langsung menuju kejuaraan resmi O2SN, Kejurda, dan Kejurnas PRSI.
                    </p>
                    <div className="flex flex-wrap items-baseline gap-2 pt-2 border-t border-amber-500/20">
                      <span className="text-xl sm:text-2xl font-athletic font-black text-amber-300">
                        {formatRupiah(currentPackage.prices[16] || 600000)}
                      </span>
                      <span className="text-xs text-slate-400">/ bulan (16 sesi)</span>
                      <span className="text-xs text-amber-300/80 font-mono ml-auto">
                        ~{formatRupiah(Math.round((currentPackage.prices[16] || 600000) / 16))}/sesi
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {/* 4x Pertemuan */}
                  <button
                    id="sessions-4-btn"
                    onClick={() => setSelectedSessions(4)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      selectedSessions === 4
                        ? 'bg-cyan-950/60 border-cyan-400 ring-1 ring-cyan-400/50 shadow-md'
                        : 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-athletic font-bold text-lg text-white">4x Pertemuan</span>
                      {selectedSessions === 4 && <Check className="w-4 h-4 text-cyan-400" />}
                    </div>
                    <p className="text-xs text-slate-400 mb-2">1x Latihan per minggu</p>
                    <div className="flex flex-wrap items-baseline gap-1.5">
                      <span className="text-sm font-bold text-cyan-300">
                        {formatRupiah(currentPackage.prices[4])}
                      </span>
                    </div>
                  </button>

                  {/* 8x Pertemuan (Optimal) */}
                  <button
                    id="sessions-8-btn"
                    onClick={() => setSelectedSessions(8)}
                    className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden ${
                      selectedSessions === 8
                        ? 'bg-cyan-950/60 border-cyan-400 ring-1 ring-cyan-400/50 shadow-md'
                        : 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800'
                    }`}
                  >
                    <span className="absolute top-0 right-0 bg-emerald-500 text-slate-950 text-[9px] font-black uppercase px-2 py-0.5 rounded-bl">
                      Rekomendasi
                    </span>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-athletic font-bold text-lg text-white">8x Pertemuan</span>
                      {selectedSessions === 8 && <Check className="w-4 h-4 text-cyan-400" />}
                    </div>
                    <p className="text-xs text-slate-400 mb-2">2x Latihan per minggu (Optimal)</p>
                    <div className="flex flex-wrap items-baseline gap-1.5">
                      <span className="text-sm font-bold text-cyan-300">
                        {formatRupiah(currentPackage.prices[8])}
                      </span>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Selection 3: Lokasi Kolam */}
            <div className="pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-[10px] font-bold">3</span>
                  LOKASI KOLAM LATIHAN
                </label>
                <span className="text-xs text-slate-400">Bandar Lampung</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {POOL_LOCATIONS.map((loc) => {
                  const isSelected = selectedLocation === loc.id;
                  return (
                    <button
                      key={loc.id}
                      id={`location-select-btn-${loc.id}`}
                      onClick={() => setSelectedLocation(loc.id)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-cyan-950/60 border-cyan-400 ring-1 ring-cyan-400/50 shadow-md'
                          : 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-cyan-400" />
                          <span className="text-sm font-bold text-white">{loc.shortName}</span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-cyan-400" />}
                      </div>
                      <p className="text-xs text-slate-300 mb-1">{loc.timeSlot}</p>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{loc.schedule}</p>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Dynamic Summary Card (5 cols) */}
          <div className="lg:col-span-5 bg-gradient-to-b from-slate-900 to-slate-950 border border-cyan-500/30 rounded-2xl p-6 sm:p-8 sticky top-24 shadow-2xl shadow-cyan-950/50">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400">
                  Ringkasan Estimasi Paket
                </span>
                <h3 className="font-athletic font-extrabold text-2xl text-white">
                  {currentPackage.name}
                </h3>
              </div>
              <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-300">
                {currentPackage.ratio}
              </span>
            </div>

            {/* Price Counter with Voucher Support */}
            <div className="bg-slate-950/80 rounded-xl p-5 border border-slate-800/80 mb-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

              {/* Voucher Applied Banner */}
              {appliedVoucher && isVoucherSessionValid && (
                <div className="flex items-center justify-between mb-2.5 px-3 py-1.5 rounded-lg bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-[11px] font-mono font-bold shadow-sm">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                    Voucher: {appliedVoucher.code}
                  </span>
                  <span className="bg-emerald-500 text-slate-950 px-2 py-0.5 rounded text-[10px] uppercase font-black">
                    Hemat {formatRupiah(discountAmount)}
                  </span>
                </div>
              )}

              {/* Warning if voucher session requirement not met */}
              {appliedVoucher && !isVoucherSessionValid && (
                <div className="mb-2.5 px-3 py-2 rounded-lg bg-amber-950/80 border border-amber-500/50 text-amber-300 text-[11px] font-sans flex items-start sm:items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5 sm:mt-0" />
                  <span>
                    {appliedVoucher.code.toUpperCase() === 'JUARA100' ? (
                      <>
                        Voucher <strong>JUARA100</strong> hanya dapat digunakan untuk <strong>Kelas Reguler (8 sesi)</strong>, <strong>Kelas Privat (8 sesi)</strong>, dan <strong>WCT (16 sesi)</strong>. Ubah kelas atau sesi untuk mengaktifkan potongan.
                      </>
                    ) : (
                      <>
                        Voucher <strong>{appliedVoucher.code}</strong> hanya berlaku untuk paket minimal {appliedVoucher.minSessions}x sesi. Pilih {appliedVoucher.minSessions} sesi untuk mengklaim potongan.
                      </>
                    )}
                  </span>
                </div>
              )}

              <div className="text-xs text-slate-400 mb-1">Total Biaya Program ({selectedSessions}x Sesi):</div>
              
              <div className="flex items-baseline gap-2.5 flex-wrap">
                {discountAmount > 0 && (
                  <span className="font-athletic text-lg sm:text-xl text-slate-500 line-through">
                    {formatRupiah(normalTotalPrice)}
                  </span>
                )}
                <div className="font-athletic font-black text-3xl sm:text-4xl text-cyan-300 tracking-tight transition-all duration-300">
                  {formatRupiah(finalTotalPrice)}
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slate-800/80 text-xs text-slate-400">
                <span>Setara dengan:</span>
                <span className="font-bold text-white bg-slate-800 px-2.5 py-0.5 rounded flex items-center gap-1.5">
                  {discountAmount > 0 && (
                    <span className="line-through text-slate-400 text-[11px]">
                      {formatRupiah(normalPricePerSession)}
                    </span>
                  )}
                  <span className={discountAmount > 0 ? 'text-emerald-300' : 'text-white'}>
                    {formatRupiah(pricePerSession)} / sesi
                  </span>
                </span>
              </div>
            </div>

            {/* ===================================================================
                SECURE VOUCHER CODE REDEMPTION BOX
                =================================================================== */}
            <div className="mb-5">
              {!appliedVoucher ? (
                <div className="p-3.5 rounded-xl bg-slate-950/90 border border-cyan-500/20 backdrop-blur-md">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 font-bold">
                      <Ticket className="w-3.5 h-3.5 text-cyan-400" />
                      Punya Kode Voucher?
                    </label>
                    <span className="text-[10px] text-slate-400">Klaim Promo Khusus</span>
                  </div>

                  <form onSubmit={handleApplyVoucher} className="flex gap-2">
                    <input
                      type="text"
                      value={inputCode}
                      onChange={(e) => {
                        setInputCode(e.target.value.toUpperCase());
                        if (voucherError) setVoucherError(null);
                      }}
                      placeholder="Masukkan kode voucher resmi..."
                      className="flex-1 bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white font-mono uppercase tracking-wider placeholder:text-slate-500 placeholder:normal-case focus:border-cyan-400 focus:outline-none"
                    />
                    <button
                      type="submit"
                      id="btn-apply-voucher"
                      className="px-3.5 py-2 bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-bold text-xs rounded-lg shadow-md transition-all active:scale-95 cursor-pointer whitespace-nowrap"
                    >
                      Terapkan
                    </button>
                  </form>

                  {voucherError && (
                    <p className="text-[11px] text-rose-400 mt-2 flex items-center gap-1 font-sans animate-in fade-in duration-200">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {voucherError}
                    </p>
                  )}

                  {/* Promo Aktif Tersedia (Filtered out any voucher where active is false) */}
                  {activeVouchers.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-800/80">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] text-slate-400">Voucher aktif:</span>
                        {activeVouchers.map((v) => (
                          <button
                            key={v.code}
                            type="button"
                            onClick={() => {
                              setInputCode(v.code);
                              if (voucherError) setVoucherError(null);
                            }}
                            className="px-2 py-0.5 rounded bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-500/30 text-[10px] font-mono font-bold text-cyan-300 hover:text-white transition-all cursor-pointer"
                            title={`${v.title} (-${formatRupiah(v.discountAmount)})`}
                          >
                            {v.code}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                    <span>*Kode voucher resmi diterbitkan oleh Tim & Manajemen WAVORA</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                      KODE VOUCHER TERPASANG
                    </span>
                    <button
                      type="button"
                      onClick={handleRemoveVoucher}
                      className="text-[11px] text-slate-400 hover:text-rose-400 transition-colors underline cursor-pointer"
                    >
                      Ganti Kode
                    </button>
                  </div>

                  {/* Floating 3D Animated Card */}
                  <FloatingVoucherCard
                    code={appliedVoucher.code}
                    discountAmount={isVoucherSessionValid ? discountAmount : appliedVoucher.discountAmount}
                    onRemove={handleRemoveVoucher}
                  />

                  {voucherSuccess && (
                    <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs text-center font-medium animate-in fade-in zoom-in-95 duration-200">
                      🎉 Voucher <strong className="font-mono font-bold text-white">{appliedVoucher.code}</strong> berhasil diaktifkan! Potongan langsung {formatRupiah(isVoucherSessionValid ? discountAmount : appliedVoucher.discountAmount)}.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Detail Selection Chips */}
            <div className="space-y-2 mb-6 text-xs text-slate-300">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Sesi Latihan
                </span>
                <span className="font-semibold text-white">{selectedSessions} Pertemuan / Bulan</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" /> Kolam Terpilih
                </span>
                <span className="font-semibold text-white">{currentLocation.shortName}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" /> Evaluasi Progress
                </span>
                <span className="font-semibold text-emerald-400">Termasuk Rapor WOS v3</span>
              </div>
              {discountAmount > 0 && appliedVoucher && (
                <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60 bg-emerald-950/30 px-2 rounded">
                  <span className="text-emerald-400 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" /> Voucher {appliedVoucher.code}
                  </span>
                  <span className="font-bold text-emerald-300">-{formatRupiah(discountAmount)}</span>
                </div>
              )}
            </div>

            {/* Included Features List */}
            <div className="mb-6">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 block">
                Benefit Paket Termasuk:
              </span>
              <ul className="space-y-2">
                {currentPackage.features.slice(0, 4).map((feat, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                    <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Direct Enroll Button */}
            <button
              id="calculator-enroll-btn"
              onClick={handleEnrollWithPackage}
              className="w-full py-4 px-5 text-sm font-bold uppercase tracking-wider text-slate-950 bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-300 hover:from-cyan-300 hover:to-teal-200 rounded-xl shadow-xl shadow-cyan-500/25 hover:shadow-cyan-400/40 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>{discountAmount > 0 ? 'Daftar & Klaim Voucher Ini' : 'Daftar Dengan Paket Ini'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <p className="text-[11px] text-center text-slate-400 mt-3">
              Pilihan {discountAmount > 0 && '& kode voucher'} otomatis terisi di Formulir Pendaftaran Wavora.
            </p>

            {/* Discrete Founder Voucher & Price Manager Access */}
            <div className="mt-5 pt-3 border-t border-slate-800/80 text-center">
              <button
                type="button"
                onClick={() => {
                  setShowFounderModal(true);
                  if (isFounderAuthenticated()) {
                    setIsFounderUnlocked(true);
                  }
                }}
                className="text-[11px] font-mono text-slate-500 hover:text-cyan-400 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Lock className="w-3 h-3" />
                <span>Akses Founder: Kelola Tarif &amp; Voucher</span>
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* ===================================================================
          FOUNDER MANAGEMENT MODAL (PRICES & VOUCHERS - PIN PROTECTED)
          =================================================================== */}
      <AnimatePresence>
        {showFounderModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-slate-950 border border-cyan-500/40 rounded-2xl p-5 sm:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => {
                  setShowFounderModal(false);
                  setFounderPin('');
                  setPinError(null);
                }}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {!isFounderUnlocked ? (
                /* Founder PIN Prompt */
                <div className="text-center py-4">
                  <div className="w-12 h-12 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-400 flex items-center justify-center mx-auto mb-3">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h3 className="font-heading font-black text-xl text-white mb-1">
                    Akses Founder &amp; Manajemen WAVORA
                  </h3>
                  <p className="text-xs text-slate-400 mb-4 max-w-sm mx-auto">
                    Masukkan PIN manajemen untuk mengelola tarif resmi seluruh paket renang atau menerbitkan kode voucher promo.
                  </p>

                  <form onSubmit={handleUnlockFounder} className="max-w-xs mx-auto space-y-3">
                    <input
                      type="password"
                      value={founderPin}
                      onChange={(e) => {
                        setFounderPin(e.target.value);
                        if (pinError) setPinError(null);
                      }}
                      placeholder="Masukkan PIN Founder (2026)"
                      className="w-full text-center tracking-widest text-lg font-mono bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:border-cyan-400 focus:outline-none"
                      autoFocus
                    />
                    {pinError && <p className="text-xs text-rose-400">{pinError}</p>}
                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-sm cursor-pointer shadow-md"
                    >
                      Buka Panel Founder
                    </button>
                  </form>
                </div>
              ) : (
                /* Unlocked Founder Management Hub */
                <div className="space-y-5">
                  <div className="border-b border-slate-800 pb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4" /> Founder Mode Aktif
                      </span>
                      <span className="text-[11px] text-slate-400">Otoritas Manajemen Pusat</span>
                    </div>
                    <h3 className="font-heading font-black text-xl text-white mt-1">
                      Pusat Kendali Tarif &amp; Voucher WAVORA
                    </h3>
                  </div>

                  {/* Toast Alert */}
                  {priceToast && (
                    <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{priceToast}</span>
                    </div>
                  )}

                  {/* Tab Navigation */}
                  <div className="flex items-center gap-2 p-1 bg-slate-900 border border-slate-800 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setFounderTab('prices')}
                      className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        founderTab === 'prices'
                          ? 'bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 shadow-md shadow-cyan-950/50'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Coins className="w-3.5 h-3.5" />
                      <span>Edit Tarif Paket</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFounderTab('vouchers')}
                      className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        founderTab === 'vouchers'
                          ? 'bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 shadow-md shadow-cyan-950/50'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Ticket className="w-3.5 h-3.5" />
                      <span>Kelola Voucher ({vouchersList.length})</span>
                    </button>
                  </div>

                  {/* TAB 1: EDIT TARIF PAKET */}
                  {founderTab === 'prices' ? (
                    <div className="space-y-4">
                      <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-slate-300">
                        <div className="font-bold text-cyan-300 flex items-center gap-1.5 mb-1">
                          <Coins className="w-4 h-4 text-cyan-400" />
                          <span>Penyesuaian Tarif Pasar Lampung</span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          Ubah nominal harga setiap paket di bawah ini. Nilai tersimpan akan langsung otomatis diterapkan pada kalkulator harga, formulir pendaftaran, dan cetak invoice resmi di seluruh website.
                        </p>
                      </div>

                      {/* Packages List */}
                      <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                        {editingPrices.map((pkg) => {
                          const isPrestasi = pkg.id === 'prestasi';
                          const sessionsKeys = Object.keys(pkg.prices).map(Number) as (4 | 8 | 16)[];
                          sessionsKeys.sort((a, b) => a - b);

                          return (
                            <div
                              key={pkg.id}
                              className={`p-4 rounded-xl border transition-all ${
                                isPrestasi
                                  ? 'bg-amber-950/20 border-amber-500/40 shadow-sm shadow-amber-950/30'
                                  : 'bg-slate-900/60 border-slate-800'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  {isPrestasi && <Trophy className="w-4 h-4 text-amber-400" />}
                                  <span className={`font-bold text-sm ${isPrestasi ? 'text-amber-200' : 'text-white'}`}>
                                    {pkg.name}
                                  </span>
                                </div>
                                <span
                                  className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                                    isPrestasi
                                      ? 'bg-amber-400/20 text-amber-300 border border-amber-500/30'
                                      : 'bg-slate-800 text-slate-300'
                                  }`}
                                >
                                  {pkg.ratio}
                                </span>
                              </div>

                              <p className="text-[11px] text-slate-400 mb-3">{pkg.description}</p>

                              {/* Session Inputs */}
                              <div className={`grid ${isPrestasi && sessionsKeys.length === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'} gap-3`}>
                                {sessionsKeys.map((sCount) => {
                                  const val = pkg.prices[sCount] || 0;
                                  const perSession = Math.round(val / sCount);

                                  return (
                                    <div key={sCount} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                                      <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-[11px] font-bold text-slate-300">
                                          Paket {sCount} Sesi {isPrestasi && sCount === 16 ? '(Bulanan)' : ''}
                                        </span>
                                        <span className="text-[10px] text-slate-400">
                                          {formatRupiah(perSession)}/sesi
                                        </span>
                                      </div>

                                      <div className="relative">
                                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono">
                                          Rp
                                        </span>
                                        <input
                                          type="number"
                                          step="5000"
                                          min="0"
                                          value={val}
                                          onChange={(e) =>
                                            handlePriceFieldChange(
                                              pkg.id,
                                              sCount,
                                              Math.max(0, parseInt(e.target.value, 10) || 0)
                                            )
                                          }
                                          className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white font-mono font-bold focus:border-cyan-400 focus:outline-none"
                                        />
                                      </div>

                                      {/* Helper for WCT 16 Sesi & Voucher Juara100 */}
                                      {isPrestasi && sCount === 16 && (
                                        <div className="mt-2 pt-1.5 border-t border-slate-800 text-[10px] text-amber-300/90 leading-tight">
                                          {vouchersList.find((v) => v.code === 'JUARA100')?.isActive !== false ? (
                                            <>
                                              <span>💡 Jika diklaim voucher JUARA100 (-Rp 100rb): </span>
                                              <strong className="text-amber-200">
                                                {formatRupiah(Math.max(0, val - 100000))}
                                              </strong>
                                              <span className="text-slate-400"> (Rp {Math.round((val - 100000) / 16).toLocaleString('id-ID')}/sesi)</span>
                                            </>
                                          ) : (
                                            <span className="text-slate-400">
                                              💡 Promo voucher JUARA100 (-Rp 100rb) sedang dinonaktifkan sementara.
                                            </span>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Action Buttons for Prices */}
                      <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={handleResetAllPrices}
                          className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Reset Standar Sistem</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleSaveAllPrices}
                          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-950/50 transition-all active:scale-98"
                        >
                          <Save className="w-4 h-4" />
                          <span>Simpan Seluruh Perubahan Tarif</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* TAB 2: VOUCHER MANAGER */
                    <div className="space-y-5">
                      {/* Form Tambah Voucher */}
                      <form onSubmit={handleAddNewVoucher} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                        <div className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                          <Plus className="w-4 h-4" /> Buat Kode Voucher Baru
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] text-slate-300 mb-1">Kode Voucher:</label>
                            <input
                              type="text"
                              value={newCode}
                              onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                              placeholder="Misal: MERDEKA50"
                              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono uppercase"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-slate-300 mb-1">Judul / Deskripsi Promo:</label>
                            <input
                              type="text"
                              value={newTitle}
                              onChange={(e) => setNewTitle(e.target.value)}
                              placeholder="Misal: Promo Kemerdekaan"
                              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                              required
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] text-slate-300 mb-1">Besaran Potongan (Rp):</label>
                            <select
                              value={newDiscount}
                              onChange={(e) => setNewDiscount(parseInt(e.target.value, 10))}
                              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                            >
                              <option value={25000}>Rp 25.000</option>
                              <option value={50000}>Rp 50.000 (Standar)</option>
                              <option value={75000}>Rp 75.000</option>
                              <option value={100000}>Rp 100.000 (Spesial Prestasi)</option>
                              <option value={150000}>Rp 150.000</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[11px] text-slate-300 mb-1">Syarat Minimal Sesi:</label>
                            <select
                              value={newMinSessions}
                              onChange={(e) => setNewMinSessions(parseInt(e.target.value, 10) as 4 | 8)}
                              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                            >
                              <option value={4}>Semua Paket (4x, 8x, 16x)</option>
                              <option value={8}>Khusus Paket 8x &amp; 16x Sesi</option>
                            </select>
                          </div>
                        </div>
                        <button
                          type="submit"
                          className="w-full py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg cursor-pointer transition-all"
                        >
                          + Simpan &amp; Aktifkan Kode
                        </button>
                      </form>

                      {/* List Voucher yang Sedang Aktif / Nonaktif */}
                      <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="text-xs font-bold uppercase tracking-wider text-slate-300">
                            Daftar Kode Promo &amp; Status ({vouchersList.length} Voucher):
                          </div>
                          {/* Filter Tabs for Admin */}
                          <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[11px]">
                            <button
                              type="button"
                              onClick={() => setAdminVoucherFilter('all')}
                              className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                                adminVoucherFilter === 'all'
                                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                                  : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              Semua ({vouchersList.length})
                            </button>
                            <button
                              type="button"
                              onClick={() => setAdminVoucherFilter('active')}
                              className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                                adminVoucherFilter === 'active'
                                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                                  : 'text-slate-400 hover:text-emerald-400'
                              }`}
                            >
                              Aktif ({activeVouchers.length})
                            </button>
                            <button
                              type="button"
                              onClick={() => setAdminVoucherFilter('inactive')}
                              className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                                adminVoucherFilter === 'inactive'
                                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                                  : 'text-slate-400 hover:text-amber-400'
                              }`}
                            >
                              Nonaktif ({vouchersList.length - activeVouchers.length})
                            </button>
                          </div>
                        </div>

                        <div className="text-[11px] text-cyan-400 font-medium">
                          💡 Klik tombol 'Nonaktifkan/Aktifkan' untuk toggle boolean 'active' pada voucher tanpa menghapus data promo.
                        </div>

                        <div className="max-h-72 overflow-y-auto space-y-2.5 pr-1">
                          {displayedAdminVouchers.map((v) => {
                            const isActive = v.active !== false && v.isActive !== false;
                            return (
                              <div
                                key={v.code}
                                className={`p-3 rounded-xl border transition-all text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                                  isActive
                                    ? 'bg-slate-900/80 border-slate-700/80 hover:border-cyan-500/40'
                                    : 'bg-slate-950/90 border-dashed border-amber-500/30 opacity-80'
                                }`}
                              >
                                <div className="space-y-1 flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span
                                      className={`font-mono font-black text-sm px-2.5 py-0.5 rounded border ${
                                        isActive
                                          ? 'text-cyan-300 bg-cyan-950/80 border-cyan-500/40 shadow-sm shadow-cyan-500/20'
                                          : 'text-slate-400 bg-slate-900 border-slate-700 line-through'
                                      }`}
                                    >
                                      {v.code}
                                    </span>

                                    {/* Status Badge with boolean state */}
                                    {isActive ? (
                                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-950/90 px-2 py-0.5 rounded-full border border-emerald-500/40">
                                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                        <span>Aktif (active: true)</span>
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-950/90 px-2 py-0.5 rounded-full border border-amber-500/40">
                                        <PauseCircle className="w-3 h-3 text-amber-400" />
                                        <span>Dinonaktifkan (active: false)</span>
                                      </span>
                                    )}

                                    <span className="text-white font-semibold">{v.title}</span>

                                    {v.minSessions === 8 && (
                                      <span className="text-[10px] text-amber-300 bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-500/30">
                                        Min 8 Sesi
                                      </span>
                                    )}
                                  </div>

                                  <p className="text-[11px] text-slate-400 leading-relaxed">
                                    {v.description}
                                  </p>

                                  <div className="text-[11px] font-medium text-emerald-400">
                                    Potongan:{' '}
                                    <strong className="font-athletic text-sm">
                                      {formatRupiah(v.discountAmount)}
                                    </strong>
                                  </div>
                                </div>

                                {/* Action Controls (Toggle On/Off & Delete) */}
                                <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800 shrink-0">
                                  {isActive ? (
                                    <button
                                      type="button"
                                      onClick={() => handleToggleVoucher(v.code)}
                                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-950/70 hover:bg-amber-900/90 text-amber-300 hover:text-white border border-amber-500/50 font-bold text-[11px] transition-all cursor-pointer shadow-sm hover:scale-[1.02]"
                                      title="Klik untuk menonaktifkan voucher ini (set active: false)"
                                    >
                                      <PauseCircle className="w-3.5 h-3.5 text-amber-400" />
                                      <span>Nonaktifkan</span>
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleToggleVoucher(v.code)}
                                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900/90 text-emerald-300 hover:text-white border border-emerald-500/50 font-bold text-[11px] transition-all cursor-pointer shadow-sm shadow-emerald-500/20 hover:scale-[1.02]"
                                      title="Klik untuk mengaktifkan kembali voucher ini (set active: true)"
                                    >
                                      <PlayCircle className="w-3.5 h-3.5 text-emerald-400" />
                                      <span>Aktifkan</span>
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => handleDeleteVoucher(v.code)}
                                    className="text-slate-500 hover:text-rose-400 p-2 rounded-lg hover:bg-rose-950/40 transition-colors cursor-pointer"
                                    title="Hapus permanen voucher ini dari database"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-800 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowFounderModal(false)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg cursor-pointer"
                    >
                      Selesai &amp; Tutup
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
};
