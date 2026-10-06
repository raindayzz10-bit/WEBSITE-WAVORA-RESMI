import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Phone,
  ArrowRight,
  Sparkles,
  Filter,
  Info,
  Edit3,
  Plus,
  Trash2,
  RotateCcw,
  Copy,
  Check,
  KeyRound,
  LogOut,
  SlidersHorizontal,
  Trophy,
  Award,
  Zap,
  Instagram,
  Camera,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { POOL_LOCATIONS, ADMIN_PHONE_INTL } from '../data/academyData';
import { PoolLocationId, ScheduleSlot, ClassType } from '../types';
import {
  getSavedScheduleSlots,
  updateScheduleSlot,
  addScheduleSlot,
  deleteScheduleSlot,
  adjustSlotOccupancy,
  resetScheduleSlots,
  isFounderAuthenticated,
  setFounderAuthenticated,
} from '../services/scheduleDataService';
import { FounderSlotEditorModal } from './FounderSlotEditorModal';
import { FounderPinModal } from './FounderPinModal';
import { InstagramStoryModal } from './InstagramStoryModal';

interface InteractiveScheduleSectionProps {
  onSelectSlotForRegistration: (slot: {
    locationId: PoolLocationId;
    classType: ClassType;
    preferredDay: string;
    preferredTime: string;
    programTitle: string;
  }) => void;
  onOpenLocationModal?: () => void;
}

export const InteractiveScheduleSection: React.FC<InteractiveScheduleSectionProps> = ({
  onSelectSlotForRegistration,
  onOpenLocationModal,
}) => {
  // Slots state managed via scheduleDataService
  const [slots, setSlots] = useState<ScheduleSlot[]>(() => getSavedScheduleSlots());

  // Founder Mode states
  const [isFounderMode, setIsFounderMode] = useState<boolean>(() => isFounderAuthenticated());
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isEditorModalOpen, setIsEditorModalOpen] = useState(false);
  const [slotToEdit, setSlotToEdit] = useState<ScheduleSlot | null>(null);
  const [slotToDelete, setSlotToDelete] = useState<ScheduleSlot | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Instagram Story Generator Modal states
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [storySlot, setStorySlot] = useState<ScheduleSlot | null>(null);

  // Filter states
  const [selectedLocation, setSelectedLocation] = useState<PoolLocationId>('pahoman');
  const [dayFilter, setDayFilter] = useState<'all' | 'weekend' | 'weekday'>('all');
  const [programFilter, setProgramFilter] = useState<'all' | 'prestasi' | 'reguler' | 'privat'>('all');

  // Feedback notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedJSON, setCopiedJSON] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Synchronize state if external storage updates occur
  useEffect(() => {
    const handleStorageUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<ScheduleSlot[]>;
      if (customEvent.detail) {
        setSlots(customEvent.detail);
      } else {
        setSlots(getSavedScheduleSlots());
      }
    };

    window.addEventListener('wavora-schedule-updated', handleStorageUpdate);
    return () => {
      window.removeEventListener('wavora-schedule-updated', handleStorageUpdate);
    };
  }, []);

  // Active pool location details
  const currentPool = useMemo(() => {
    return POOL_LOCATIONS.find((l) => l.id === selectedLocation) || POOL_LOCATIONS[0];
  }, [selectedLocation]);

  // Total WCT slots count across active pool
  const activePoolWctCount = useMemo(() => {
    return slots.filter(
      (s) => s.locationId === selectedLocation && (s.classType === 'prestasi' || s.isWCT || s.programTitle.includes('WCT'))
    ).length;
  }, [slots, selectedLocation]);

  // Filtered slots according to location, day & program category
  const filteredSlots = useMemo(() => {
    return slots.filter((slot) => {
      const matchLoc = slot.locationId === selectedLocation;
      const matchDay =
        dayFilter === 'all' ||
        (dayFilter === 'weekend' && slot.dayType === 'weekend') ||
        (dayFilter === 'weekday' && slot.dayType === 'weekday');
      const isWctSlot = slot.classType === 'prestasi' || slot.isWCT || slot.programTitle.includes('WCT');
      const matchProgram =
        programFilter === 'all' ||
        (programFilter === 'prestasi' && isWctSlot) ||
        (programFilter === 'reguler' && slot.classType === 'reguler' && !isWctSlot) ||
        (programFilter === 'privat' && (slot.classType === 'privat' || slot.classType === 'twins_privat'));
      return matchLoc && matchDay && matchProgram;
    });
  }, [slots, selectedLocation, dayFilter, programFilter]);

  // Parent booking action
  const handleBookingClick = (slot: ScheduleSlot) => {
    showToast(`Slot "${slot.programTitle}" (${slot.day}, ${slot.time}) dipilih! Mengarahkan ke form...`);

    onSelectSlotForRegistration({
      locationId: slot.locationId,
      classType: slot.classType,
      preferredDay: slot.day,
      preferredTime: slot.time,
      programTitle: slot.programTitle,
    });
  };

  // Founder Auth handlers
  const handleUnlockFounder = () => {
    setIsFounderMode(true);
    setFounderAuthenticated(true);
    setIsPinModalOpen(false);
    showToast('⚡ Wewenang Founder Aktif! Anda dapat langsung mengedit sesi & kuota.');
  };

  const handleLogoutFounder = () => {
    setIsFounderMode(false);
    setFounderAuthenticated(false);
    showToast('Mode Founder dinonaktifkan.');
  };

  // Founder Slot CRUD actions
  const handleOpenAddSlot = () => {
    setSlotToEdit(null);
    setIsEditorModalOpen(true);
  };

  const handleOpenEditSlot = (slot: ScheduleSlot) => {
    setSlotToEdit(slot);
    setIsEditorModalOpen(true);
  };

  const handleSaveSlot = (slotData: ScheduleSlot | Omit<ScheduleSlot, 'id'>) => {
    if ('id' in slotData && slotData.id) {
      const updated = updateScheduleSlot(slotData as ScheduleSlot);
      setSlots(updated);
      showToast(`Sesi "${slotData.programTitle}" berhasil diperbarui & disimpan.`);
    } else {
      const { slots: nextSlots } = addScheduleSlot(slotData as Omit<ScheduleSlot, 'id'>);
      setSlots(nextSlots);
      showToast(`Sesi baru "${slotData.programTitle}" berhasil ditambahkan!`);
    }
    setIsEditorModalOpen(false);
    setSlotToEdit(null);
  };

  const handleDeleteSlot = (slot: ScheduleSlot) => {
    setSlotToDelete(slot);
  };

  const handleConfirmDeleteSlot = () => {
    if (!slotToDelete) return;
    const title = slotToDelete.programTitle;
    const nextSlots = deleteScheduleSlot(slotToDelete.id);
    setSlots(nextSlots);
    setSlotToDelete(null);
    showToast(`✅ Jadwal sesi "${title}" berhasil dihapus.`);
  };

  const handleConfirmResetDefault = () => {
    const def = resetScheduleSlots();
    setSlots(def);
    setIsResetConfirmOpen(false);
    showToast('✅ Seluruh jadwal telah dikembalikan ke konfigurasi standar awal.');
  };

  const handleAdjustQuota = (slotId: string, delta: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextSlots = adjustSlotOccupancy(slotId, delta);
    setSlots(nextSlots);
  };

  const handleResetDefault = () => {
    setIsResetConfirmOpen(true);
  };

  const handleCopyJSON = () => {
    try {
      navigator.clipboard.writeText(JSON.stringify(slots, null, 2));
      setCopiedJSON(true);
      showToast('Konfigurasi jadwal berhasil disalin ke clipboard!');
      setTimeout(() => setCopiedJSON(false), 2500);
    } catch (err) {
      showToast('Gagal menyalin konfigurasi.');
    }
  };

  return (
    <section
      id="schedule-section"
      className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative scroll-mt-20"
    >
      {/* Background ambient decorative glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-96 bg-gradient-to-r from-cyan-600/10 via-teal-600/5 to-blue-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-slate-900/95 border border-cyan-400/60 text-cyan-200 text-xs sm:text-sm font-semibold shadow-2xl backdrop-blur-md flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold tracking-wider uppercase backdrop-blur-md">
          <Calendar className="w-3.5 h-3.5 text-cyan-400" />
          <span>JADWAL INTERAKTIF &amp; SISA KUOTA SLOT</span>
        </div>

        <h2 className="font-athletic font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight">
          Pilih Jadwal Latihan &amp;{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">
            Kunci Slot Sesi Anda
          </span>
        </h2>

        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          Wavora menerapkan pembatasan ketat <strong>maksimal 4–5 siswa per pelatih</strong> agar setiap anak
          mendapatkan pengawasan aman dan bimbingan teknik yang presisi tanpa terburu-buru.
        </p>

        {/* Quick Action Badges */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5">
          {!isFounderMode && (
            <button
              type="button"
              onClick={() => setIsPinModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-amber-500/40 text-amber-300 text-xs font-mono font-semibold transition-all hover:scale-105 shadow-md shadow-amber-950/30"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>Akses Founder: Sesuaikan Jadwal Lapangan</span>
            </button>
          )}
        </div>
      </div>

      {/* FOUNDER MANAGEMENT DASHBOARD BAR (When Founder Mode is ACTIVE) */}
      <AnimatePresence>
        {isFounderMode && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-8 p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-cyan-950/60 border-2 border-amber-400/60 shadow-2xl backdrop-blur-md"
          >
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider font-mono">
                    Mode Founder Aktif
                  </span>
                  <span className="text-xs text-amber-300 font-semibold font-mono">
                    • Wewenang Penuh Penyesuaian Jadwal &amp; Kuota Lapangan
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Anda dapat mengubah jam sesi, nama program, target usia, nama pelatih, serta menambah atau menghapus sesi sesuai kondisi nyata kolam.
                </p>
              </div>

              {/* Founder Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                <button
                  type="button"
                  onClick={handleOpenAddSlot}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-amber-950/50 active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Tambah Slot Sesi</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStorySlot(null);
                    setIsStoryModalOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-amber-500 hover:from-pink-500 hover:to-amber-400 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-pink-950/40 active:scale-95 transition-all cursor-pointer"
                  title="Akses Eksklusif Founder: Generate Story Instagram 9:16 Resmi Wavora"
                >
                  <Instagram className="w-4 h-4 text-white" />
                  <span>📸 Generator Story IG (9:16)</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyJSON}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
                  title="Salin data konfigurasi JSON"
                >
                  {copiedJSON ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedJSON ? 'Tersalin' : 'Salin JSON'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetDefault}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
                  title="Kembalikan ke jadwal standar awal"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Default</span>
                </button>

                <button
                  type="button"
                  onClick={handleLogoutFounder}
                  className="px-3 py-2 rounded-xl bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  title="Kunci wewenang founder"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Kunci Founder</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Control Switchers: Location & Day Filters */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-4 sm:p-6 mb-8 backdrop-blur-md shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* 1. Venue Switcher */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">
              1. Pilih Venue Kolam Latihan:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {POOL_LOCATIONS.map((loc) => {
                const isSelected = selectedLocation === loc.id;
                return (
                  <button
                    key={loc.id}
                    id={`schedule-loc-btn-${loc.id}`}
                    type="button"
                    onClick={() => setSelectedLocation(loc.id)}
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all duration-200 ${
                      isSelected
                        ? 'bg-gradient-to-br from-cyan-950/90 to-slate-900 border-cyan-400/80 shadow-lg shadow-cyan-950/50 ring-1 ring-cyan-400/40'
                        : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                        isSelected ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-athletic font-bold text-sm text-white">{loc.name}</span>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {loc.id === 'pahoman' ? 'Sesi Pagi (07:30 WIB+)' : 'Sesi Sore Teduh (16:00 WIB+)'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Day Filters */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">
              2. Filter Hari:
            </span>
            <div className="flex items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800">
              {[
                { id: 'all', label: 'Semua Sesi' },
                { id: 'weekend', label: 'Akhir Pekan (Sabtu-Minggu)' },
                { id: 'weekday', label: 'Hari Kerja (Senin-Jumat)' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  id={`schedule-day-filter-${tab.id}`}
                  type="button"
                  onClick={() => setDayFilter(tab.id as any)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    dayFilter === tab.id
                      ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* 3. Program Type Filters */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
              3. Kategori Program:
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'all', label: 'Semua Program' },
                { id: 'prestasi', label: `🏆 WCT Prestasi (4x/Mgg)` },
                { id: 'reguler', label: 'Reguler' },
                { id: 'privat', label: 'Privat VIP' },
              ].map((tab) => {
                const isActive = programFilter === tab.id;
                const isWct = tab.id === 'prestasi';
                return (
                  <button
                    key={tab.id}
                    id={`schedule-prog-filter-${tab.id}`}
                    type="button"
                    onClick={() => setProgramFilter(tab.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      isActive
                        ? isWct
                          ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-bold shadow-md shadow-amber-950/40'
                          : 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                        : isWct
                        ? 'bg-amber-950/40 border border-amber-500/40 text-amber-300 hover:bg-amber-900/50'
                        : 'bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {isWct && activePoolWctCount > 0 && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-black ${
                          isActive ? 'bg-slate-950 text-amber-300' : 'bg-amber-400 text-slate-950'
                        }`}
                      >
                        {activePoolWctCount} Sesi
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>
              Operasional {currentPool.shortName}: <strong className="text-slate-200">{currentPool.timeSlot}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* WCT Prestasi Spotlight Banner */}
      {(programFilter === 'prestasi' || activePoolWctCount > 0) && (
        <div className="mb-6 p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/50 border-2 border-amber-500/50 shadow-xl backdrop-blur-md relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[11px] font-black uppercase tracking-wider font-mono flex items-center gap-1.5 shadow">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Jalur Prestasi Resmi</span>
                </span>
                <span className="text-xs text-amber-300 font-bold">
                  Wavora Competition Team (WCT)
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-200 border border-amber-500/30">
                  Frekuensi: 4x Latihan / Minggu
                </span>
              </div>
              <h3 className="font-athletic font-bold text-lg sm:text-xl text-white">
                Pembinaan Atlet Renang Prestasi O2SN, Kejurda &amp; Kejurnas PRSI
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
                Khusus anak bertalenta dan atlet binaan dengan target juara. Program mencakup latihan intensif <strong>4x seminggu</strong> (16 sesi/bulan), analisis video stroke biomekanika perenang olimpiade, simulasi time trial berkala, dan program dryland/stamina.
              </p>
            </div>

            <div className="flex flex-row lg:flex-col items-center lg:items-end gap-3 shrink-0">
              <div className="px-4 py-2.5 rounded-2xl bg-slate-950/90 border border-amber-500/40 text-center shadow-inner">
                <div className="text-[10px] text-slate-400 font-mono">Paket &amp; Jadwal</div>
                <div className="text-xs sm:text-sm font-bold text-amber-300">4x Seminggu (16x/Bln)</div>
              </div>
              <button
                type="button"
                onClick={() => setProgramFilter(programFilter === 'prestasi' ? 'all' : 'prestasi')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 transition-colors shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <span>{programFilter === 'prestasi' ? 'Tampilkan Semua Kelas' : 'Filter Khusus Sesi WCT'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid of Interactive Slots */}
      {filteredSlots.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-3">
          <Calendar className="w-10 h-10 mx-auto text-slate-600 mb-2" />
          <p className="text-sm">Tidak ada sesi yang cocok dengan filter yang dipilih.</p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => {
                setDayFilter('all');
                setProgramFilter('all');
              }}
              className="text-xs text-cyan-400 hover:underline font-semibold"
            >
              Tampilkan Semua Sesi
            </button>
            {isFounderMode && (
              <button
                onClick={handleOpenAddSlot}
                className="text-xs text-amber-400 hover:underline font-bold"
              >
                + Tambah Sesi di Kolam Ini
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSlots.map((slot) => {
            const isFull = slot.status === 'full';
            const isLimited = slot.status === 'limited';
            const isWct = slot.classType === 'prestasi' || slot.isWCT || slot.programTitle.includes('WCT');
            const fillPercentage = Math.round((slot.bookedQuota / slot.totalQuota) * 100);

            return (
              <motion.div
                key={slot.id}
                id={`slot-card-${slot.id}`}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                className={`border rounded-3xl p-5 flex flex-col justify-between transition-all duration-200 relative overflow-hidden backdrop-blur-sm shadow-lg ${
                  isWct
                    ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-amber-950/30 border-amber-400/60 shadow-amber-950/40 ring-1 ring-amber-400/40'
                    : isFounderMode
                    ? 'bg-slate-900/90 border-amber-500/40 shadow-amber-950/20 ring-1 ring-amber-500/20'
                    : isLimited
                    ? 'bg-slate-900/90 border-amber-500/40 hover:border-amber-400 shadow-amber-950/20'
                    : isFull
                    ? 'bg-slate-900/90 border-rose-500/30 opacity-80'
                    : 'bg-slate-900/90 border-slate-800 hover:border-cyan-500/50 shadow-cyan-950/20'
                }`}
              >
                {/* FOUNDER STRIP (If Founder Mode is Active) */}
                {isFounderMode && (
                  <div className="mb-3 -mt-1 p-2 rounded-2xl bg-amber-950/60 border border-amber-500/30 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-amber-300 font-bold">
                      <SlidersHorizontal className="w-3 h-3 text-amber-400" />
                      <span>Founder Control</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEditSlot(slot)}
                        className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 hover:text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                        title="Edit detail sesi ini"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSlot(slot);
                        }}
                        className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                        title="Hapus sesi ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* SPECIAL WCT BADGE HEADER IF PRESTASI */}
                {isWct && (
                  <div className="mb-3 -mt-1 p-2 rounded-2xl bg-amber-950/70 border border-amber-500/40 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                      <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>WAVORA COMPETITION TEAM</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase font-mono tracking-wider">
                      4x / Minggu
                    </span>
                  </div>
                )}

                {/* Top status indicator ribbon */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold bg-slate-950 border ${
                        isWct
                          ? 'border-amber-500/40 text-amber-300'
                          : 'border-slate-800 text-cyan-300'
                      }`}
                    >
                      <Calendar className={`w-3 h-3 ${isWct ? 'text-amber-400' : 'text-cyan-400'}`} />
                      {slot.day.toUpperCase()}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-400 ml-2">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {slot.time}
                    </span>
                  </div>

                  {/* Quota Badge */}
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border flex items-center gap-1 ${
                      isFull
                        ? 'bg-rose-950/80 text-rose-300 border-rose-500/40'
                        : isLimited
                        ? 'bg-amber-950/80 text-amber-300 border-amber-500/40 animate-pulse'
                        : isWct
                        ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                        : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isFull ? 'bg-rose-400' : isLimited ? 'bg-amber-400' : isWct ? 'bg-amber-400' : 'bg-emerald-400'
                      }`}
                    />
                    {isFull
                      ? 'Slot Penuh'
                      : isLimited
                      ? `Sisa ${slot.availableSlots} Slot!`
                      : `Sedia ${slot.availableSlots} Slot`}
                  </span>
                </div>

                {/* Program Title & Target Group */}
                <div className="space-y-2 mb-4">
                  <h3 className={`font-athletic font-bold text-lg transition-colors ${
                    isWct ? 'text-amber-200 group-hover:text-amber-100' : 'text-white group-hover:text-cyan-300'
                  }`}>
                    {slot.programTitle}
                  </h3>

                  {/* Weekly frequency callout for WCT */}
                  {(slot.weeklyFrequency || isWct) && (
                    <div className="text-[11px] font-mono text-amber-300 bg-amber-950/50 px-2.5 py-1.5 rounded-xl border border-amber-500/30 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                      <span>{slot.weeklyFrequency || '4x Latihan / Minggu (Program Prestasi)'}</span>
                    </div>
                  )}

                  <p className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{slot.targetGroup}</span>
                  </p>
                  <p className="text-[11px] text-teal-300/90 font-mono flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span>{slot.coachName}</span>
                  </p>
                </div>

                {/* Quota Progress Bar + Quick Stepper for Founder */}
                <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800/80 mb-4">
                  <div className="flex items-center justify-between text-[11px] font-mono mb-1.5">
                    <span className="text-slate-400">Kapasitas Maksimal:</span>

                    {/* Quick Quota Adjuster for Founder */}
                    {isFounderMode ? (
                      <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-0.5 rounded-lg border border-amber-500/30">
                        <button
                          type="button"
                          onClick={(e) => handleAdjustQuota(slot.id, -1, e)}
                          className="text-amber-400 hover:text-white px-1 font-bold text-xs"
                          title="Kurangi siswa terdaftar"
                        >
                          -
                        </button>
                        <span className="text-amber-300 font-bold">
                          {slot.bookedQuota} / {slot.totalQuota}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleAdjustQuota(slot.id, 1, e)}
                          className="text-amber-400 hover:text-white px-1 font-bold text-xs"
                          title="Tambah siswa terdaftar"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-200 font-bold">
                        {slot.bookedQuota} / {slot.totalQuota} Siswa ({fillPercentage}%)
                      </span>
                    )}
                  </div>

                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isFull
                          ? 'bg-rose-500'
                          : isWct
                          ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300'
                          : isLimited
                          ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                          : 'bg-gradient-to-r from-cyan-500 to-teal-400'
                      }`}
                      style={{ width: `${fillPercentage}%` }}
                    />
                  </div>
                  {slot.highlightTag && (
                    <span className={`text-[10px] mt-1.5 block font-semibold ${
                      isWct ? 'text-amber-300' : 'text-cyan-300'
                    }`}>
                      ★ {slot.highlightTag}
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <button
                    type="button"
                    id={`book-slot-btn-${slot.id}`}
                    onClick={() => handleBookingClick(slot)}
                    disabled={isFull}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 ${
                      isFull
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                        : isWct
                        ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 hover:brightness-110 shadow-lg shadow-amber-950/40'
                        : isLimited
                        ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 hover:brightness-110 shadow-lg shadow-amber-950/40'
                        : 'bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-950 hover:brightness-110 shadow-lg shadow-cyan-950/40'
                    }`}
                  >
                    <span>
                      {isFull
                        ? 'Kapasitas Penuh'
                        : isWct
                        ? 'Daftar Sesi WCT (4x/Mgg)'
                        : 'Kunci & Booking Slot Ini'}
                    </span>
                    {!isFull && <ArrowRight className="w-3.5 h-3.5" />}
                  </button>

                  {isFounderMode ? (
                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      <a
                        href={`https://wa.me/${ADMIN_PHONE_INTL}?text=Halo%20Admin%20Wavora,%20saya%20tertarik%20booking%20slot%20renang%20*${encodeURIComponent(
                          slot.programTitle
                        )}*%20pada%20hari%20*${encodeURIComponent(slot.day)}*%20jam%20*${encodeURIComponent(
                          slot.time
                        )}*%20di%20*${encodeURIComponent(currentPool.name)}*.%20Apakah%20slot%20masih%20tersedia?`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-1.5 px-2 rounded-lg text-[11px] font-semibold text-slate-400 hover:text-emerald-300 hover:bg-slate-800/80 flex items-center justify-center gap-1 transition-colors"
                      >
                        <Phone className="w-3 h-3 text-emerald-400" />
                        <span>Tanya WA</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => {
                          setStorySlot(slot);
                          setIsStoryModalOpen(true);
                        }}
                        className="py-1.5 px-2 rounded-lg text-[11px] font-semibold text-pink-300 hover:text-white bg-pink-950/40 border border-pink-500/30 hover:bg-pink-900/50 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        title="Buat gambar story Instagram untuk sesi ini (Khusus Founder)"
                      >
                        <Instagram className="w-3 h-3 text-pink-400" />
                        <span>Story IG</span>
                      </button>
                    </div>
                  ) : (
                    <a
                      href={`https://wa.me/${ADMIN_PHONE_INTL}?text=Halo%20Admin%20Wavora,%20saya%20tertarik%20booking%20slot%20renang%20*${encodeURIComponent(
                        slot.programTitle
                      )}*%20pada%20hari%20*${encodeURIComponent(slot.day)}*%20jam%20*${encodeURIComponent(
                        slot.time
                      )}*%20di%20*${encodeURIComponent(currentPool.name)}*.%20Apakah%20slot%20masih%20tersedia?`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-1.5 px-3 rounded-lg text-[11px] font-semibold text-slate-400 hover:text-emerald-300 hover:bg-slate-800/80 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Phone className="w-3 h-3 text-emerald-400" />
                      <span>Tanya Ketersediaan via WA</span>
                    </a>
                  )}
                </div>

              </motion.div>
            );
          })}
        </div>
      )}

      {/* Rescheduling & Family Guarantee Callout Banner */}
      <div className="mt-10 bg-gradient-to-r from-teal-950/40 via-cyan-950/30 to-slate-900 border border-teal-500/30 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-teal-500/20 text-teal-300 shrink-0 border border-teal-500/30">
            <ShieldCheck className="w-6 h-6 text-teal-400" />
          </div>
          <div className="space-y-1">
            <h4 className="font-athletic font-bold text-lg text-white">
              Garansi Jadwal Fleksibel (Family Reschedule Policy)
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              Khawatir anak tiba-tiba sakit atau ada ujian sekolah mendadak? Di Wavora, cukup konfirmasi ke Admin
              WhatsApp minimal 2 jam sebelum sesi. Sesi latihan dapat diganti pada hari lain tanpa hangus!
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-3 w-full md:w-auto">
          {onOpenLocationModal && (
            <button
              type="button"
              onClick={onOpenLocationModal}
              className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 transition-colors"
            >
              Info Fasilitas Kolam
            </button>
          )}
          <a
            href={`https://wa.me/${ADMIN_PHONE_INTL}?text=Halo%20Admin%20Wavora,%20saya%20ingin%20konsultasi%20jadwal%20latihan%20khusus%20untuk%20anak%20saya.`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition-all"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Chat Jadwal Khusus</span>
          </a>
        </div>
      </div>

      {/* FOUNDER & STORY MODALS */}
      {/* 1. Founder Pin Modal */}
      <FounderPinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onSuccess={handleUnlockFounder}
      />

      {/* 2. Founder Slot Editor / Add Modal */}
      <FounderSlotEditorModal
        isOpen={isEditorModalOpen}
        slotToEdit={slotToEdit}
        defaultLocation={selectedLocation}
        onClose={() => {
          setIsEditorModalOpen(false);
          setSlotToEdit(null);
        }}
        onSave={handleSaveSlot}
        onDelete={(slot) => {
          setIsEditorModalOpen(false);
          setSlotToEdit(null);
          setSlotToDelete(slot);
        }}
      />

      {/* 3. Instagram Story Exporter Modal (9:16) */}
      <InstagramStoryModal
        isOpen={isStoryModalOpen}
        onClose={() => {
          setIsStoryModalOpen(false);
          setStorySlot(null);
        }}
        initialSlot={storySlot}
        allSlots={slots.filter((s) => s.locationId === selectedLocation)}
        currentPool={currentPool}
      />

      {/* 4. Interactive Delete Confirmation Modal (In-App, No Browser Popup) */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {slotToDelete && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  transition={{ duration: 0.15 }}
                  className="w-full max-w-md bg-slate-900 border border-rose-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-rose-950/50 text-white relative overflow-hidden"
                >
                  {/* Ambient decorative glow */}
                  <div className="absolute top-0 right-0 w-44 h-44 bg-rose-500/10 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10" />

                  <div className="flex items-start gap-3.5 mb-4">
                    <div className="w-11 h-11 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center shrink-0 text-rose-400">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-athletic font-bold text-lg text-white">Hapus Sesi Jadwal?</h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Konfirmasi penghapusan sesi latihan ini dari sistem jadwal.
                      </p>
                    </div>
                  </div>

                  {/* Slot Details Card */}
                  <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 mb-4 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">{slotToDelete.programTitle}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase">
                        {slotToDelete.day}
                      </span>
                    </div>
                    <div className="text-slate-400 font-mono text-[11px] flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{slotToDelete.time}</span>
                      <span>•</span>
                      <Users className="w-3.5 h-3.5 text-slate-500" />
                      <span>Terisi {slotToDelete.bookedQuota} / {slotToDelete.totalQuota} Siswa</span>
                    </div>
                    <div className="text-slate-400 text-[11px] flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                      <span>{slotToDelete.coachName}</span>
                    </div>
                  </div>

                  <p className="text-xs text-rose-300/90 bg-rose-950/40 p-2.5 rounded-xl border border-rose-500/20 mb-5 leading-relaxed">
                    ⚠️ <strong>Peringatan:</strong> Sesi ini akan langsung dihapus dari jadwal publik dan dashboard founder.
                  </p>

                  <div className="flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setSlotToDelete(null)}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmDeleteSlot}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-rose-950/50 active:scale-95 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Ya, Hapus Sesi Ini</span>
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}

      {/* 5. Reset Default Confirmation Modal (In-App) */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {isResetConfirmOpen && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  transition={{ duration: 0.15 }}
                  className="w-full max-w-md bg-slate-900 border border-amber-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-amber-950/40 text-white relative overflow-hidden"
                >
                  <div className="flex items-start gap-3.5 mb-4">
                    <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 text-amber-400">
                      <RotateCcw className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-athletic font-bold text-lg text-white">Reset ke Jadwal Standar?</h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Kembalikan seluruh daftar sesi ke pengaturan bawaan Wavora Aquatic Academy.
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 bg-slate-950/80 p-3 rounded-xl border border-slate-800 mb-5 leading-relaxed">
                    Semua penambahan sesi kustom, perubahan kuota siswa, dan sesi yang telah dihapus akan dipulihkan kembali ke data jadwal resmi awal.
                  </p>

                  <div className="flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setIsResetConfirmOpen(false)}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmResetDefault}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-amber-950/50 active:scale-95 transition-all cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Ya, Reset Sekarang</span>
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}

    </section>
  );
};
