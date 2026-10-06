import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Save,
  Clock,
  MapPin,
  Users,
  ShieldCheck,
  Calendar,
  Sparkles,
  Tag,
  AlertCircle,
  Plus,
  ChevronDown,
  Trophy,
  Award,
  Trash2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ScheduleSlot, DayOfWeek, PoolLocationId, ClassType } from '../types';
import { POOL_LOCATIONS } from '../data/academyData';

interface FounderSlotEditorModalProps {
  isOpen: boolean;
  slotToEdit: ScheduleSlot | null; // If null, mode is 'CREATE'
  defaultLocation?: PoolLocationId;
  onClose: () => void;
  onSave: (slot: ScheduleSlot | Omit<ScheduleSlot, 'id'>) => void;
  onDelete?: (slot: ScheduleSlot) => void;
}

const COMMON_DAYS: DayOfWeek[] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

const QUICK_TIMES = [
  { label: 'Pagi 07:30', time: '07:30 - 09:00 WIB', period: 'pagi' as const },
  { label: 'Pagi 09:00', time: '09:00 - 10:30 WIB', period: 'pagi' as const },
  { label: 'Sore 16:00', time: '16:00 - 17:30 WIB', period: 'sore' as const },
  { label: 'Sore 17:30', time: '17:30 - 19:00 WIB', period: 'sore' as const },
];

const PROGRAM_SUGGESTIONS = [
  'Wavora Competition Team (WCT) • Prestasi',
  'Tadpole & Adaptasi Air Ceria (Pemula Bebas Trauma)',
  'Junior Stroke Foundation (Bebas & Dada)',
  'Reguler Pemula & Kelompok Belajar',
  'VIP 1-on-1 Intensif & Terapi Khusus',
  'Twins & Family Group (Paket Saudara)',
  'Competitive Pre-Squad (Penguatan Teknik & Stamina)',
  'Hydrotherapy & Pemulihan Fisik',
  'Sesi Pagi Weekday Tenang (Balita / Home School)',
  'Kelas Renang Remaja & Dewasa',
];

export const FounderSlotEditorModal: React.FC<FounderSlotEditorModalProps> = ({
  isOpen,
  slotToEdit,
  defaultLocation = 'pahoman',
  onClose,
  onSave,
  onDelete,
}) => {
  const [mounted, setMounted] = useState(false);
  const isEditing = Boolean(slotToEdit);

  // Form states
  const [locationId, setLocationId] = useState<PoolLocationId>(defaultLocation);
  const [day, setDay] = useState<DayOfWeek>('Sabtu');
  const [dayType, setDayType] = useState<'weekday' | 'weekend'>('weekend');
  const [time, setTime] = useState<string>('07:30 - 09:00 WIB');
  const [sessionPeriod, setSessionPeriod] = useState<'pagi' | 'sore'>('pagi');
  const [programTitle, setProgramTitle] = useState<string>('');
  const [classType, setClassType] = useState<ClassType>('reguler');
  const [targetGroup, setTargetGroup] = useState<string>('');
  const [coachName, setCoachName] = useState<string>('Coach Rian & Team');
  const [totalQuota, setTotalQuota] = useState<number>(5);
  const [bookedQuota, setBookedQuota] = useState<number>(2);
  const [highlightTag, setHighlightTag] = useState<string>('');
  const [weeklyFrequency, setWeeklyFrequency] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock background scroll when modal is active
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isOpen]);

  // Populate form when modal opens or slotToEdit changes
  useEffect(() => {
    if (slotToEdit) {
      setLocationId(slotToEdit.locationId);
      setDay(slotToEdit.day);
      setDayType(slotToEdit.dayType);
      setTime(slotToEdit.time);
      setSessionPeriod(slotToEdit.sessionPeriod);
      setProgramTitle(slotToEdit.programTitle);
      setClassType(slotToEdit.classType);
      setTargetGroup(slotToEdit.targetGroup);
      setCoachName(slotToEdit.coachName);
      setTotalQuota(slotToEdit.totalQuota);
      setBookedQuota(slotToEdit.bookedQuota);
      setHighlightTag(slotToEdit.highlightTag || '');
      setWeeklyFrequency(slotToEdit.weeklyFrequency || (slotToEdit.classType === 'prestasi' ? '4x Latihan / Minggu (Senin, Rabu, Jumat, Sabtu)' : ''));
    } else {
      setLocationId(defaultLocation);
      setDay('Sabtu');
      setDayType('weekend');
      setTime(defaultLocation === 'pahoman' ? '07:30 - 09:00 WIB' : '16:00 - 17:30 WIB');
      setSessionPeriod(defaultLocation === 'pahoman' ? 'pagi' : 'sore');
      setProgramTitle('Tadpole & Adaptasi Air Ceria');
      setClassType('reguler');
      setTargetGroup('Usia 4 - 8 Tahun (Kelompok Ceria)');
      setCoachName('Coach Rian & Asisten');
      setTotalQuota(5);
      setBookedQuota(2);
      setHighlightTag('Buka Pendaftaran Baru');
      setWeeklyFrequency('');
    }
  }, [slotToEdit, defaultLocation, isOpen]);

  // Handle program preset selection
  const handleSelectProgramSuggestion = (title: string) => {
    setProgramTitle(title);
    if (title.includes('WCT') || title.includes('Prestasi')) {
      setClassType('prestasi');
      setTargetGroup('Atlet Binaan Prestasi O2SN & Kejurda (Program 4x / Minggu)');
      setCoachName('Head Coach Wavora & Tim Pelatih Prestasi');
      setTotalQuota(8);
      setBookedQuota(4);
      setHighlightTag('WCT Prestasi • 4x/Minggu');
      setWeeklyFrequency('4x Latihan / Minggu (Senin, Rabu, Jumat, Sabtu)');
    }
  };

  // Handle day change & auto detect weekend
  const handleDayChange = (newDay: DayOfWeek) => {
    setDay(newDay);
    if (newDay === 'Sabtu' || newDay === 'Minggu') {
      setDayType('weekend');
    } else {
      setDayType('weekday');
    }
  };

  // Safe calculated availability
  const safeTotal = Math.max(1, Number(totalQuota) || 1);
  const safeBooked = Math.max(0, Math.min(safeTotal, Number(bookedQuota) || 0));
  const availableSlots = Math.max(0, safeTotal - safeBooked);
  const fillPercentage = Math.round((safeBooked / safeTotal) * 100);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!programTitle.trim()) {
      setFormError('Mohon masukkan nama program / sesi latihan.');
      return;
    }
    setFormError(null);

    let status: 'available' | 'limited' | 'full' = 'available';
    if (availableSlots === 0) {
      status = 'full';
    } else if (availableSlots <= 1) {
      status = 'limited';
    }

    const payload = {
      ...(slotToEdit ? { id: slotToEdit.id } : {}),
      locationId,
      day,
      dayType,
      time: time.trim() || '07:30 - 09:00 WIB',
      sessionPeriod,
      programTitle: programTitle.trim(),
      classType,
      targetGroup: targetGroup.trim() || 'Semua Tingkatan Usia',
      coachName: coachName.trim() || 'Pelatih Wavora',
      totalQuota: safeTotal,
      bookedQuota: safeBooked,
      availableSlots,
      status,
      highlightTag: highlightTag.trim() || undefined,
      weeklyFrequency: weeklyFrequency.trim() || (classType === 'prestasi' ? '4x Latihan / Minggu (Senin, Rabu, Jumat, Sabtu)' : undefined),
      isWCT: classType === 'prestasi' || programTitle.includes('WCT'),
    };

    onSave(payload as any);
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/85 backdrop-blur-md">
        {/* Container with min-h-full to prevent flexbox top-overflow clipping */}
        <div className="min-h-full flex items-center justify-center p-3 sm:p-5 md:p-6 text-center">
          
          {/* Backdrop Click */}
          <div
            className="fixed inset-0 -z-10"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal Window Card */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-2xl bg-[#091528] border-2 border-cyan-500/50 rounded-3xl shadow-2xl shadow-cyan-950/80 overflow-hidden my-4 sm:my-6 text-slate-100 flex flex-col max-h-[88vh] text-left"
          >
            {/* Header (Always Visible & Stays at Top) */}
            <div className="p-4 sm:p-5 border-b border-slate-800/80 bg-gradient-to-r from-[#071120] via-cyan-950/40 to-[#071120] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-400 to-cyan-400 text-slate-950 font-bold shadow-lg shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-amber-400 bg-amber-950/80 border border-amber-500/30 px-2 py-0.5 rounded">
                      Wewenang Founder
                    </span>
                    <span className="text-xs text-slate-400">• WOS Slot Editor</span>
                  </div>
                  <h3 className="font-athletic font-bold text-base sm:text-lg text-white truncate max-w-xs sm:max-w-md mt-0.5">
                    {isEditing ? `Edit Sesi: ${slotToEdit?.programTitle}` : 'Tambah Slot Sesi Baru'}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors border border-slate-700/60 shrink-0 cursor-pointer"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
              
              {formError && (
                <div className="p-3 rounded-2xl bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}
              
              {/* 1. Venue & Day Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Venue Kolam */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Venue Kolam Renang:</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {POOL_LOCATIONS.map((loc) => {
                      const active = locationId === loc.id;
                      return (
                        <button
                          key={loc.id}
                          type="button"
                          onClick={() => setLocationId(loc.id)}
                          className={`p-2.5 rounded-xl border text-xs font-semibold transition-all text-left cursor-pointer ${
                            active
                              ? 'bg-cyan-950 border-cyan-400 text-cyan-200 shadow-md ring-1 ring-cyan-400/40'
                              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <div className="font-bold">{loc.shortName}</div>
                          <div className="text-[10px] opacity-75">{loc.id === 'pahoman' ? 'Pagi (Pusat Kota)' : 'Sore (UNILA)'}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Hari */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Hari Pelaksanaan:</span>
                  </label>
                  <div className="relative">
                    <select
                      value={day}
                      onChange={(e) => handleDayChange(e.target.value as DayOfWeek)}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400 appearance-none cursor-pointer pr-9"
                    >
                      {COMMON_DAYS.map((d) => (
                        <option key={d} value={d}>
                          {d} {d === 'Sabtu' || d === 'Minggu' ? '(Akhir Pekan / Weekend)' : '(Hari Kerja / Weekday)'}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* 2. Jam Sesi & Periode */}
              <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 space-y-2.5">
                <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Jam Sesi Latihan &amp; Durasi:</span>
                </label>

                {/* Quick presets */}
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_TIMES.map((qt) => (
                    <button
                      key={qt.label}
                      type="button"
                      onClick={() => {
                        setTime(qt.time);
                        setSessionPeriod(qt.period);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium transition-all cursor-pointer ${
                        time === qt.time
                          ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                          : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                      }`}
                    >
                      {qt.label}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="Misal: 07:30 - 09:00 WIB"
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSessionPeriod('pagi')}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        sessionPeriod === 'pagi'
                          ? 'bg-amber-950/70 border-amber-400 text-amber-300 font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      ☀️ Sesi Pagi
                    </button>
                    <button
                      type="button"
                      onClick={() => setSessionPeriod('sore')}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        sessionPeriod === 'sore'
                          ? 'bg-blue-950/70 border-blue-400 text-blue-300 font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      🌤️ Sesi Sore Teduh
                    </button>
                  </div>
                </div>
              </div>

              {/* 3. Program Title & Class Type */}
              <div className="space-y-2.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Nama Program / Sesi:
                </label>
                <input
                  type="text"
                  value={programTitle}
                  onChange={(e) => setProgramTitle(e.target.value)}
                  placeholder="Contoh: Tadpole & Adaptasi Air Ceria"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400"
                  required
                />

                {/* Suggestions */}
                <div className="flex flex-wrap gap-1.5 items-center">
                  <span className="text-[10px] text-slate-500 font-mono">Pilihan Cepat:</span>
                  {PROGRAM_SUGGESTIONS.slice(0, 5).map((p) => {
                    const isWctPreset = p.includes('WCT');
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => handleSelectProgramSuggestion(p)}
                        className={`text-[10px] px-2 py-0.5 rounded transition-colors cursor-pointer flex items-center gap-1 ${
                          isWctPreset
                            ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold'
                            : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
                        }`}
                      >
                        {isWctPreset ? '🏆 ' : '+ '}
                        {p.split('(')[0].replace('•', '').trim()}
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Tipe Kelas:
                    </label>
                    <select
                      value={classType}
                      onChange={(e) => {
                        const nextType = e.target.value as ClassType;
                        setClassType(nextType);
                        if (nextType === 'prestasi') {
                          if (!programTitle || programTitle.includes('Tadpole')) {
                            setProgramTitle('Wavora Competition Team (WCT) • Prestasi');
                          }
                          setWeeklyFrequency('4x Latihan / Minggu (Senin, Rabu, Jumat, Sabtu)');
                          setTargetGroup('Atlet Binaan Prestasi O2SN & Kejurda (Program 4x / Minggu)');
                          setCoachName('Head Coach Wavora & Tim Pelatih Prestasi');
                          setTotalQuota(8);
                          setHighlightTag('WCT Prestasi • 4x/Minggu');
                        }
                      }}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                    >
                      <option value="reguler">Kelas Reguler (Maks 4-5 Murid)</option>
                      <option value="privat">Kelas Privat VIP (1-on-1)</option>
                      <option value="twins_reguler">Twins Reguler (2 Anak)</option>
                      <option value="twins_privat">Twins Privat (2 Anak VIP)</option>
                      <option value="hydrotherapy">Hydrotherapy &amp; Terapi Air</option>
                      <option value="prestasi">🏆 Kelas Prestasi • Wavora Competition Team (WCT 4x/Minggu)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                      <Users className="w-3 h-3 text-slate-400" />
                      <span>Sasaran Peserta / Usia:</span>
                    </label>
                    <input
                      type="text"
                      value={targetGroup}
                      onChange={(e) => setTargetGroup(e.target.value)}
                      placeholder="Contoh: Usia 3 - 7 Tahun (Pemula Bebas Trauma)"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                {/* Special WCT Prestasi Badge & Indicator */}
                {classType === 'prestasi' && (
                  <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-left space-y-1.5 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs">
                        <Trophy className="w-3.5 h-3.5 text-amber-400" />
                        <span>Program Prestasi: Wavora Competition Team (WCT)</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase font-mono">
                        Intensif 4x Seminggu
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-200/90 leading-relaxed">
                      Sesi atlet prestasi dipersiapkan untuk seleksi dan kejuaraan resmi O2SN, Kejurda, dan Kejurnas PRSI dengan jadwal rutin <strong>4x dalam seminggu</strong>.
                    </p>
                    <div className="pt-1">
                      <label className="block text-[11px] font-semibold text-amber-300/90 mb-1">
                        Keterangan Frekuensi Latihan:
                      </label>
                      <input
                        type="text"
                        value={weeklyFrequency}
                        onChange={(e) => setWeeklyFrequency(e.target.value)}
                        placeholder="Contoh: 4x Latihan / Minggu (Senin, Rabu, Jumat, Sabtu)"
                        className="w-full px-3 py-1.5 bg-slate-950/90 border border-amber-500/40 rounded-xl text-xs text-amber-200 placeholder:text-amber-500/40 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 4. Coach Name & Quotas */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-teal-400" />
                    <span>Pelatih / Coach:</span>
                  </label>
                  <input
                    type="text"
                    value={coachName}
                    onChange={(e) => setCoachName(e.target.value)}
                    placeholder="Misal: Coach Rian & Asisten"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Kapasitas Maksimal (Siswa):
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="15"
                    value={totalQuota}
                    onChange={(e) => setTotalQuota(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Siswa Terdaftar Saat Ini:
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setBookedQuota((prev) => Math.max(0, prev - 1))}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="0"
                      max={safeTotal}
                      value={bookedQuota}
                      onChange={(e) => setBookedQuota(Number(e.target.value))}
                      className="w-full px-2 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-center text-white focus:outline-none focus:border-cyan-400 font-mono font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => setBookedQuota((prev) => Math.min(safeTotal, prev + 1))}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Real-time status preview */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  Sisa Slot Real-time: <strong className="text-cyan-300 font-mono">{availableSlots} Siswa ({fillPercentage}% Terisi)</strong>
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    availableSlots === 0
                      ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                      : availableSlots <= 1
                      ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  {availableSlots === 0 ? 'Penuh' : availableSlots <= 1 ? 'Hampir Penuh' : 'Sedia Slot'}
                </span>
              </div>

              {/* 5. Highlight Tag */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                  <Tag className="w-3 h-3 text-cyan-400" />
                  <span>Tag Highlight / Badge (Opsional):</span>
                </label>
                <input
                  type="text"
                  value={highlightTag}
                  onChange={(e) => setHighlightTag(e.target.value)}
                  placeholder="Misal: Sisa 1 Slot Terakhir!, Favorit Akhir Pekan, Teduh & Sejuk"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

            </form>

            {/* Footer Actions (Always visible & pinned at the bottom) */}
            <div className="p-3.5 sm:p-4 border-t border-slate-800 bg-[#071120] flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Batal
                </button>

                {isEditing && onDelete && slotToEdit && (
                  <button
                    type="button"
                    onClick={() => {
                      onDelete(slotToEdit);
                    }}
                    className="px-3.5 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 hover:text-rose-200 border border-rose-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Hapus sesi ini dari jadwal"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Sesi</span>
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 text-slate-950 text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-cyan-950/50 transition-all active:scale-95 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{isEditing ? 'Simpan Perubahan' : 'Tambah Sesi Baru'}</span>
              </button>
            </div>

          </motion.div>
        </div>
      </div>
    </AnimatePresence>,
    document.body
  );
};
