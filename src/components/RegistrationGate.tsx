import React, { useState } from 'react';
import {
  ShieldCheck,
  User,
  Users,
  Calendar,
  Check,
  ArrowRight,
  ArrowLeft,
  Copy,
  ExternalLink,
  QrCode,
  Sparkles,
  AlertCircle,
  FileText,
  Phone,
  Mail,
  MapPin,
  UserPlus,
  Trash2,
  Info,
  Tag,
  Ticket,
  Trophy,
} from 'lucide-react';
import { PRICE_PACKAGES, POOL_LOCATIONS, ADMIN_PHONE_INTL, SYSTEM_VERSION } from '../data/academyData';
import { usePackagePrices } from '../services/packagePriceService';
import { RegistrationFormData, RegistrationTicket, ClassType, SessionCount, PoolLocationId, AthleteProfile } from '../types';
import { addRegistration } from '../services/registrationFirestoreService';
import { AnimatedReceiptView } from './AnimatedReceiptView';
import { validateVoucherCode, isJuara100Eligible } from '../data/voucherData';
import { FloatingVoucherCard } from './FloatingVoucherCard';

interface RegistrationGateProps {
  initialPackage?: {
    classType: ClassType;
    sessions: SessionCount;
    location: PoolLocationId;
    voucherInfo?: {
      code: string;
      discount: number;
      finalPrice: number;
      title: string;
    };
    preferredDay?: string;
    preferredTime?: string;
  };
  initialNotes?: string;
}

export const RegistrationGate: React.FC<RegistrationGateProps> = ({
  initialPackage,
  initialNotes,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<RegistrationFormData>({
    athletes: [
      {
        id: 'ath_1',
        athleteName: '',
        age: '',
        gender: 'Laki-laki',
        waterExperience: 'Belum Pernah',
        medicalNotes: '',
      },
    ],
    athleteName: '',
    birthDate: '',
    age: '',
    gender: 'Laki-laki',
    waterExperience: 'Belum Pernah',
    medicalNotes: '',

    parentName: '',
    whatsapp: '',
    email: '',
    relationship: 'Orang Tua',

    classType: initialPackage?.classType || 'reguler',
    sessions: initialPackage?.classType === 'prestasi' ? 16 : (initialPackage?.sessions || 8),
    location: initialPackage?.location || 'pahoman',
    preferredDay: initialPackage?.preferredDay || 'Sabtu & Minggu',
    preferredTime: initialPackage?.preferredTime || 'Sesuai Jadwal Kolam',

    specialNotes: initialNotes || '',
    agreedTerms: false,
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [completedTicket, setCompletedTicket] = useState<RegistrationTicket | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Voucher Code state & handlers
  const [appliedVoucher, setAppliedVoucher] = useState<{
    code: string;
    discount: number;
    title: string;
  } | null>(() => {
    if (initialPackage?.voucherInfo) {
      return {
        code: initialPackage.voucherInfo.code,
        discount: initialPackage.voucherInfo.discount,
        title: initialPackage.voucherInfo.title,
      };
    }
    return null;
  });
  const [voucherInput, setVoucherInput] = useState<string>(initialPackage?.voucherInfo?.code || '');
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [voucherSuccessToast, setVoucherSuccessToast] = useState<boolean>(false);

  // Normalized athletes array ensuring at least 1 athlete always exists
  const athletesList: AthleteProfile[] =
    formData.athletes && formData.athletes.length > 0
      ? formData.athletes
      : [
          {
            id: 'ath_1',
            athleteName: formData.athleteName,
            age: formData.age,
            gender: formData.gender || 'Laki-laki',
            waterExperience: formData.waterExperience || 'Belum Pernah',
            medicalNotes: formData.medicalNotes || '',
          },
        ];

  const handleAddAthlete = () => {
    const nextIdx = athletesList.length + 1;
    const newAthlete: AthleteProfile = {
      id: `ath_${Date.now()}_${nextIdx}`,
      athleteName: '',
      age: '',
      gender: 'Laki-laki',
      waterExperience: 'Belum Pernah',
      medicalNotes: '',
    };
    const updated = [...athletesList, newAthlete];
    setFormData((prev) => ({
      ...prev,
      athletes: updated,
      athleteName: updated[0].athleteName,
      age: updated[0].age,
      gender: updated[0].gender,
      waterExperience: updated[0].waterExperience,
      medicalNotes: updated[0].medicalNotes || '',
    }));
  };

  const handleRemoveAthlete = (index: number) => {
    if (athletesList.length <= 1) return;
    const updated = athletesList.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      athletes: updated,
      athleteName: updated[0]?.athleteName || '',
      age: updated[0]?.age || '',
      gender: updated[0]?.gender || 'Laki-laki',
      waterExperience: updated[0]?.waterExperience || 'Belum Pernah',
      medicalNotes: updated[0]?.medicalNotes || '',
    }));
  };

  const handleUpdateAthlete = (index: number, field: keyof AthleteProfile, value: string) => {
    const updated = [...athletesList];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setFormData((prev) => ({
      ...prev,
      athletes: updated,
      athleteName: updated[0]?.athleteName || '',
      age: updated[0]?.age || '',
      gender: updated[0]?.gender || 'Laki-laki',
      waterExperience: updated[0]?.waterExperience || 'Belum Pernah',
      medicalNotes: updated[0]?.medicalNotes || '',
    }));

    if (formErrors[`athlete_${index}_${field}`]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[`athlete_${index}_${field}`];
        return next;
      });
    }
  };

  // Sync if initialPackage changes
  React.useEffect(() => {
    if (initialPackage) {
      setFormData((prev) => ({
        ...prev,
        classType: initialPackage.classType,
        sessions: initialPackage.classType === 'prestasi' ? 16 : initialPackage.sessions,
        location: initialPackage.location,
        ...(initialPackage.preferredDay ? { preferredDay: initialPackage.preferredDay } : {}),
        ...(initialPackage.preferredTime ? { preferredTime: initialPackage.preferredTime } : {}),
      }));
    }
  }, [initialPackage]);

  React.useEffect(() => {
    if (initialNotes) {
      setFormData((prev) => {
        if (initialNotes.startsWith('Klaim Promo')) {
          const cleanNotes = (prev.specialNotes || '')
            .split(' | ')
            .filter((n) => !n.startsWith('Klaim Promo'))
            .join(' | ');
          return {
            ...prev,
            specialNotes: cleanNotes ? `${cleanNotes} | ${initialNotes}` : initialNotes,
          };
        }
        if (initialNotes.startsWith('Hasil Asesmen Online')) {
          const cleanNotes = (prev.specialNotes || '')
            .split(' | ')
            .filter((n) => !n.startsWith('Hasil Asesmen Online'))
            .join(' | ');
          return {
            ...prev,
            specialNotes: cleanNotes ? `${cleanNotes} | ${initialNotes}` : initialNotes,
          };
        }
        return {
          ...prev,
          specialNotes: (prev.specialNotes ? prev.specialNotes + ' | ' : '') + initialNotes,
        };
      });
    }
  }, [initialNotes]);

  // Selected details (reactive to Founder custom pricing)
  const { packages: activePackages } = usePackagePrices();
  const selectedPkg = activePackages.find((p) => p.id === formData.classType) || activePackages[0];
  const selectedLoc = POOL_LOCATIONS.find((l) => l.id === formData.location) || POOL_LOCATIONS[0];
  const numAthletes = athletesList.length;

  // Calculate pricing for multi-athlete support
  let rawPrice = 0;
  if (formData.classType === 'twins_reguler' || formData.classType === 'twins_privat') {
    const baseTwinsPrice = selectedPkg.prices[formData.sessions] || 0;
    if (numAthletes <= 2) {
      rawPrice = baseTwinsPrice;
    } else {
      const regulerPkg = activePackages.find((p) => p.id === 'reguler') || activePackages[0];
      const extraKids = numAthletes - 2;
      rawPrice = baseTwinsPrice + (regulerPkg.prices[formData.sessions] || 0) * extraKids;
    }
  } else {
    rawPrice = (selectedPkg.prices[formData.sessions] || 0) * numAthletes;
  }

  // Dynamic Voucher Application & Validation
  const handleApplyVoucher = (codeToApply?: string) => {
    const code = (codeToApply || voucherInput).trim().toUpperCase();
    setVoucherError(null);
    if (!code) {
      setVoucherError('Silakan ketik kode voucher terlebih dahulu.');
      return;
    }

    const validation = validateVoucherCode(code, formData.sessions, formData.classType);
    if (!validation.valid || !validation.voucher) {
      setVoucherError(validation.errorMessage || 'Kode voucher tidak valid atau kedaluwarsa.');
      return;
    }

    // Determine exact discount value
    let discount = validation.voucher.discountAmount;
    if (code === 'BUDDYSQUAD' && formData.sessions === 8) {
      discount = 100000;
    } else if (code === 'JUARA100') {
      if (isJuara100Eligible(formData.classType, formData.sessions)) {
        discount = 100000;
      } else {
        setVoucherError(
          'Voucher JUARA100 hanya dapat digunakan untuk Kelas Reguler (8 sesi), Kelas Privat (8 sesi), dan WCT (16 sesi).'
        );
        return;
      }
    } else if (code === 'WAVORA50') {
      discount = 50000;
    }

    setAppliedVoucher({
      code: validation.voucher.code,
      discount,
      title: validation.voucher.title,
    });
    setVoucherInput(validation.voucher.code);
    setVoucherSuccessToast(true);
    setTimeout(() => setVoucherSuccessToast(false), 4500);
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherInput('');
    setVoucherError(null);
  };

  const isJuaraValidForCurrentForm =
    appliedVoucher?.code.toUpperCase() === 'JUARA100' &&
    isJuara100Eligible(formData.classType, formData.sessions);

  const effectiveVoucherDiscount = appliedVoucher
    ? appliedVoucher.code.toUpperCase() === 'JUARA100'
      ? isJuaraValidForCurrentForm
        ? 100000
        : 0
      : appliedVoucher.code === 'BUDDYSQUAD' && formData.sessions === 8
      ? 100000
      : appliedVoucher.code === 'WAVORA50'
      ? 50000
      : appliedVoucher.discount
    : 0;

  const totalEstimate = Math.max(0, rawPrice - effectiveVoucherDiscount);

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Validate per step
  const validateStep = (step: number): boolean => {
    const errors: { [key: string]: string } = {};

    if (step === 1) {
      athletesList.forEach((ath, idx) => {
        if (!ath.athleteName.trim()) {
          errors[`athlete_${idx}_athleteName`] = `Nama atlet #${idx + 1} wajib diisi`;
        }
        if (!String(ath.age).trim()) {
          errors[`athlete_${idx}_age`] = `Usia atlet #${idx + 1} wajib diisi`;
        }
      });
    } else if (step === 2) {
      if (!formData.parentName.trim()) {
        errors.parentName = 'Nama orang tua/wali wajib diisi';
      }
      if (!formData.whatsapp.trim()) {
        errors.whatsapp = 'Nomor WhatsApp wajib diisi untuk verifikasi';
      } else if (formData.whatsapp.length < 9) {
        errors.whatsapp = 'Nomor WhatsApp minimal 9 digit';
      }
    } else if (step === 4) {
      if (!formData.agreedTerms) {
        errors.agreedTerms = 'Anda harus menyetujui syarat & ketentuan akademi';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(4)) return;

    // Generate unique registration code
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const code = `WVR-2026-${randomSuffix}`;

    const combinedAthleteNames = athletesList.map((a) => a.athleteName).filter(Boolean).join(' & ');
    const combinedAges = athletesList.map((a) => a.age).filter(Boolean).join(', ');

    const ticket: RegistrationTicket = {
      ticketCode: code,
      submittedAt: new Date().toLocaleString('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
      formData: {
        ...formData,
        athletes: athletesList,
        athleteName: combinedAthleteNames || formData.athleteName,
        age: combinedAges || formData.age,
      },
      totalEstimate,
      rawPrice,
      voucherInfo:
        appliedVoucher && effectiveVoucherDiscount > 0
          ? {
              code: appliedVoucher.code,
              discount: effectiveVoucherDiscount,
              finalPrice: totalEstimate,
              title: appliedVoucher.title,
            }
          : undefined,
    };

    setCompletedTicket(ticket);

    // Save to Cloud Firestore 'registrations' collection in real-time
    addRegistration({
      id: code,
      ticketCode: code,
      athleteName: combinedAthleteNames || formData.athleteName,
      age: combinedAges || formData.age,
      gender: (athletesList[0]?.gender as any) || 'Laki-laki',
      parentName: formData.parentName,
      whatsapp: formData.whatsapp,
      email: formData.email,
      programCategory: `${selectedPkg.name} • ${formData.sessions}x Sesi${numAthletes > 1 ? ` (${numAthletes} Atlet)` : ''}`,
      classType: formData.classType,
      sessions: formData.sessions,
      location: formData.location,
      preferredDay: formData.preferredDay,
      totalEstimate,
      waterExperience: athletesList.map((a) => `${a.athleteName || 'Atlet'}: ${a.waterExperience || '-'}`).join(' | '),
      medicalNotes: athletesList.map((a) => a.medicalNotes).filter(Boolean).join(' | ') || '-',
      status: 'pending',
      athletes: athletesList,
      athleteCount: numAthletes,
    }).catch((err) => {
      console.warn('Real-time registration sync notice:', err);
    });
  };

  // Copy registration code
  const handleCopyCode = () => {
    if (!completedTicket) return;
    navigator.clipboard.writeText(completedTicket.ticketCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  // Generate WhatsApp formatted text message
  const generateWhatsAppMessageText = (): string => {
    if (!completedTicket) return '';
    const t = completedTicket;
    const list =
      t.formData.athletes && t.formData.athletes.length > 0
        ? t.formData.athletes
        : [
            {
              athleteName: t.formData.athleteName,
              age: t.formData.age,
              gender: t.formData.gender,
              waterExperience: t.formData.waterExperience,
              medicalNotes: t.formData.medicalNotes,
            },
          ];

    const athletesFormatted = list
      .map(
        (ath, idx) => `  *Anak ke-${idx + 1}: ${ath.athleteName}*
  • Usia: ${ath.age} Tahun (${ath.gender})
  • Pengalaman Air: ${ath.waterExperience || 'Belum Pernah'}
  • Catatan Medis: ${ath.medicalNotes || '-'}`
      )
      .join('\n\n');

    return `*FORMULIR PENDAFTARAN WAVORA AQUATIC ACADEMY*
---------------------------------------
*KODE REGISTRASI:* ${t.ticketCode}
*TANGGAL SUBMIT:* ${t.submittedAt}
*JUMLAH ATLET:* ${list.length} Calon Atlet
*SISTEM:* ${SYSTEM_VERSION}

*1. IDENTITAS CALON ATLET (${list.length} ANAK):*
${athletesFormatted}

*2. DATA ORANG TUA / WALI:*
- Nama Orang Tua: ${t.formData.parentName} (${t.formData.relationship})
- WhatsApp: ${t.formData.whatsapp}
- Email: ${t.formData.email || '-'}

*3. PILIHAN PROGRAM & LOKASI:*
- Paket Kelas: ${selectedPkg.name}
- Jumlah Sesi: ${t.formData.sessions}x Pertemuan / Bulan
- Lokasi Kolam: ${selectedLoc.name} (${selectedLoc.timeSlot})
- Preferensi Hari: ${t.formData.preferredDay}
${appliedVoucher && effectiveVoucherDiscount > 0 ? `- Kode Voucher Terpakai: ${appliedVoucher.code} (Diskon: -${formatRupiah(effectiveVoucherDiscount)})\n` : ''}- Total Biaya (${list.length} Atlet): ${formatRupiah(t.totalEstimate)} ${effectiveVoucherDiscount > 0 ? '(Sudah Potong Voucher)' : ''}
- Catatan Tambahan: ${t.formData.specialNotes || '-'}
---------------------------------------
Halo Admin Wavora, mohon verifikasi ketersediaan jadwal untuk pendaftaran ${list.length} anak kami. Berikut tanda registrasi kami. Terima kasih!`;
  };

  // Generate WhatsApp formatted URL
  const generateWhatsAppUrl = () => {
    const text = generateWhatsAppMessageText();
    if (!text) return '#';
    return `https://wa.me/${ADMIN_PHONE_INTL}?text=${encodeURIComponent(text)}`;
  };

  return (
    <section id="registration-section" className="py-20 relative">
      {/* Anchor for #pendaftaran */}
      <div id="pendaftaran" className="absolute -top-24 left-0 w-0 h-0 pointer-events-none" />
      {/* Glow backdrop */}
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[400px] bg-cyan-600/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Title */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 text-xs font-semibold tracking-wider uppercase mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            WAVORA DIGITAL GATEWAY • REGISTRASI TERPADU
          </div>
          <h2 className="font-athletic font-black text-3xl sm:text-4xl md:text-5xl tracking-tight text-white mb-3">
            FORMULIR <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent">PENDAFTARAN ATLET</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-300">
            Lengkapi data calon atlet dalam 4 langkah terstruktur. Dapatkan tiket registrasi resmi dan konfirmasi instan via WhatsApp Admin.
          </p>
        </div>

        {/* Multi-step Form Card or Ticket View */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/[0.1] rounded-2xl shadow-2xl shadow-cyan-950/40 p-6 sm:p-10 relative overflow-hidden">
          
          {!completedTicket ? (
            <div>
              {/* Stepper Indicator */}
              <div className="grid grid-cols-4 gap-2 mb-8 border-b border-slate-800 pb-6">
                {[
                  { step: 1, label: 'Identitas Atlet' },
                  { step: 2, label: 'Orang Tua' },
                  { step: 3, label: 'Paket & Kolam' },
                  { step: 4, label: 'Konfirmasi' },
                ].map((s) => {
                  const isDone = currentStep > s.step;
                  const isCurrent = currentStep === s.step;
                  return (
                    <div key={s.step} className="flex flex-col items-center text-center">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-athletic font-bold text-xs mb-1.5 transition-all ${
                          isDone
                            ? 'bg-teal-500 text-slate-950'
                            : isCurrent
                            ? 'bg-cyan-500 text-slate-950 ring-4 ring-cyan-500/20 shadow-lg shadow-cyan-500/30'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {isDone ? <Check className="w-4 h-4" /> : s.step}
                      </div>
                      <span
                        className={`text-[10px] sm:text-xs font-semibold ${
                          isCurrent ? 'text-cyan-300' : 'text-slate-400'
                        }`}
                      >
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Step Forms */}
              <form onSubmit={handleSubmit}>
                
                {/* STEP 1: IDENTITAS ATLET (DUKUNGAN TAMBAH ATLET MULTI-ANAK) */}
                {currentStep === 1 && (
                  <div className="space-y-5 animate-in fade-in duration-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                      <div>
                        <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                          <User className="w-4 h-4 text-cyan-400" /> 1. DATA CALON ATLET
                        </h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Punya lebih dari 1 anak? Cukup tambahkan atlet di sini sekali saja.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold">
                          {athletesList.length} Calon Atlet Terdaftar
                        </span>
                      </div>
                    </div>

                    {/* Highlight Promo Buddy Squad Aktif */}
                    {(initialPackage?.voucherInfo?.code === 'BUDDYSQUAD' || initialNotes?.includes('Buddy Squad')) && (
                      <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-cyan-500/15 to-teal-500/15 border border-amber-400/40 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2.5">
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
                          <div>
                            <span className="font-bold text-amber-300">Promo Wavora Buddy Squad Aktif!</span>
                            <p className="text-[11px] text-slate-300">
                              Tambahkan 2–4 calon atlet menggunakan tombol di bawah untuk menikmati potongan diskon kolektif Rp 100.000.
                            </p>
                          </div>
                        </div>
                        <span className="shrink-0 px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 font-mono font-bold text-[10px] border border-amber-400/30">
                          Hemat Rp 100rb
                        </span>
                      </div>
                    )}

                    {/* Athlete Cards List */}
                    <div className="space-y-4">
                      {athletesList.map((ath, index) => {
                        const isPrimary = index === 0;
                        return (
                          <div
                            key={ath.id || index}
                            className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                              isPrimary
                                ? 'bg-slate-950/70 border-slate-800 focus-within:border-cyan-500/50'
                                : 'bg-slate-950/50 border-slate-800/80 focus-within:border-cyan-500/40'
                            }`}
                          >
                            {/* Card Header with Athlete badge & Delete button */}
                            <div className="flex items-center justify-between mb-3 border-b border-slate-800/60 pb-2.5">
                              <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-xs font-black">
                                  {index + 1}
                                </span>
                                <span className="font-bold text-xs uppercase tracking-wider text-white">
                                  {isPrimary ? 'Calon Atlet #1 (Utama)' : `Calon Atlet #${index + 1}`}
                                </span>
                                {ath.athleteName.trim() && (
                                  <span className="text-xs text-cyan-400 font-semibold truncate max-w-[140px] sm:max-w-[200px]">
                                    • {ath.athleteName}
                                  </span>
                                )}
                              </div>

                              {!isPrimary && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveAthlete(index)}
                                  className="px-2.5 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 border border-rose-500/30 text-rose-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                                  title="Hapus Atlet ini"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Hapus Anak #{index + 1}</span>
                                </button>
                              )}
                            </div>

                            {/* Form inputs for this athlete */}
                            <div className="space-y-3.5">
                              <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">
                                  Nama Lengkap Atlet <span className="text-rose-400">*</span>
                                </label>
                                <input
                                  type="text"
                                  placeholder={`Contoh: ${isPrimary ? 'Muhammad Rayyan' : 'Aisyah Azzahra'}`}
                                  value={ath.athleteName}
                                  onChange={(e) => handleUpdateAthlete(index, 'athleteName', e.target.value)}
                                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                                />
                                {formErrors[`athlete_${index}_athleteName`] && (
                                  <p className="text-xs text-rose-400 mt-1">
                                    {formErrors[`athlete_${index}_athleteName`]}
                                  </p>
                                )}
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                <div>
                                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                                    Usia Atlet (Tahun) <span className="text-rose-400">*</span>
                                  </label>
                                  <input
                                    type="number"
                                    placeholder="Contoh: 6"
                                    value={ath.age}
                                    onChange={(e) => handleUpdateAthlete(index, 'age', e.target.value)}
                                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                                  />
                                  {formErrors[`athlete_${index}_age`] && (
                                    <p className="text-xs text-rose-400 mt-1">
                                      {formErrors[`athlete_${index}_age`]}
                                    </p>
                                  )}
                                </div>

                                <div>
                                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                                    Jenis Kelamin
                                  </label>
                                  <select
                                    value={ath.gender}
                                    onChange={(e) =>
                                      handleUpdateAthlete(index, 'gender', e.target.value as 'Laki-laki' | 'Perempuan')
                                    }
                                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400"
                                  >
                                    <option value="Laki-laki">Laki-laki</option>
                                    <option value="Perempuan">Perempuan</option>
                                  </select>
                                </div>
                              </div>

                              <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">
                                  Pengalaman / Keberanian Terhadap Air Saat Ini
                                </label>
                                <select
                                  value={ath.waterExperience}
                                  onChange={(e) =>
                                    handleUpdateAthlete(index, 'waterExperience', e.target.value as any)
                                  }
                                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400"
                                >
                                  <option value="Belum Pernah">Belum Pernah Belajar Renang Formal</option>
                                  <option value="Takut Air">Takut Air / Pernah Tersedak / Perlu Pendekatan Khusus</option>
                                  <option value="Bisa Mengapung">Berani Main Air & Bisa Mengapung Dasar</option>
                                  <option value="Bisa Berenang Dasar">Bisa Berenang Dasar (Gaya Bebas / Dada)</option>
                                  <option value="Ingin Prestasi">Sudah Bisa 2-4 Gaya & Ingin Pembinaan Prestasi</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">
                                  Catatan Khusus / Riwayat Medis (Opsional)
                                </label>
                                <input
                                  type="text"
                                  placeholder="Contoh: Asma ringan, alergi klorin pekat, atau fobia air (kosongkan jika tidak ada)"
                                  value={ath.medicalNotes || ''}
                                  onChange={(e) => handleUpdateAthlete(index, 'medicalNotes', e.target.value)}
                                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Button to Add Athlete */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleAddAthlete}
                        className="w-full py-3.5 px-4 bg-gradient-to-r from-cyan-950/60 to-slate-900/80 hover:from-cyan-900/50 hover:to-slate-800/80 border-2 border-dashed border-cyan-500/40 hover:border-cyan-400 text-cyan-300 rounded-2xl flex items-center justify-center gap-2.5 text-xs sm:text-sm font-bold transition-all shadow-md group cursor-pointer"
                      >
                        <div className="w-6 h-6 rounded-full bg-cyan-500/20 group-hover:bg-cyan-500/30 flex items-center justify-center text-cyan-400 transition-colors">
                          <UserPlus className="w-3.5 h-3.5" />
                        </div>
                        <span>+ Tambah Calon Atlet / Anak Lagi (Anak ke-{athletesList.length + 1})</span>
                      </button>

                      <p className="text-[11px] text-slate-400 text-center mt-2.5 flex items-center justify-center gap-1.5">
                        <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span>
                          Punya 2 atau 3 anak? Cukup tambahkan anak di sini sekali saja tanpa perlu mengisi ulang data orang tua.
                        </span>
                      </p>
                    </div>
                  </div>
                )}

                {/* STEP 2: KONTAK ORANG TUA */}
                {currentStep === 2 && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4" /> 2. DATA ORANG TUA / WALI
                    </h3>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Nama Lengkap Orang Tua / Wali <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Bpk. Kurniawan / Ibu Siska"
                        value={formData.parentName}
                        onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                        className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                      />
                      {formErrors.parentName && (
                        <p className="text-xs text-rose-400 mt-1">{formErrors.parentName}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Nomor WhatsApp (Aktif) <span className="text-rose-400">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="tel"
                            placeholder="Contoh: 081234567890"
                            value={formData.whatsapp}
                            onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                            className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                          />
                        </div>
                        {formErrors.whatsapp && (
                          <p className="text-xs text-rose-400 mt-1">{formErrors.whatsapp}</p>
                        )}
                        <span className="text-[11px] text-slate-400 mt-1 block">
                          Digunakan untuk kirim jadwal, evaluasi WOS v3, dan konfirmasi.
                        </span>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Alamat Email (Opsional)
                        </label>
                        <input
                          type="email"
                          placeholder="nama@email.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Hubungan dengan Atlet
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {['Ayah', 'Ibu', 'Wali'].map((rel) => (
                          <button
                            type="button"
                            key={rel}
                            onClick={() =>
                              setFormData({ ...formData, relationship: rel as RegistrationFormData['relationship'] })
                            }
                            className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${
                              formData.relationship === rel
                                ? 'bg-cyan-950/80 border-cyan-400 text-white'
                                : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
                            }`}
                          >
                            {rel}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: PILIHAN PAKET & LOKASI */}
                {currentStep === 3 && (
                  <div className="space-y-5 animate-in fade-in duration-200">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4" /> 3. PILIHAN PAKET & KOLAM
                    </h3>

                    {/* Class Type select */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-semibold text-slate-300">
                          Tipe Kelas Latihan
                        </label>
                        {numAthletes === 2 && (
                          <span className="text-[11px] text-amber-300 font-bold bg-amber-950/60 border border-amber-500/40 px-2 py-0.5 rounded-full">
                            ★ Rekomendasi: Paket Twins (2 Anak)
                          </span>
                        )}
                        {numAthletes >= 3 && (
                          <span className="text-[11px] text-cyan-300 font-bold bg-cyan-950/60 border border-cyan-500/40 px-2 py-0.5 rounded-full">
                            Pendaftaran Keluarga ({numAthletes} Atlet)
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {activePackages.map((pkg) => {
                          const isTwins = pkg.id === 'twins_reguler' || pkg.id === 'twins_privat';
                          return (
                            <button
                              type="button"
                              key={pkg.id}
                              onClick={() => {
                                const newClass = pkg.id;
                                let newSessions = formData.sessions;
                                if (newClass === 'prestasi') {
                                  newSessions = 16;
                                } else if (newSessions === 16) {
                                  newSessions = 8;
                                }
                                setFormData({ ...formData, classType: newClass, sessions: newSessions });
                              }}
                              className={`p-3 rounded-xl border text-left transition-all relative ${
                                formData.classType === pkg.id
                                  ? 'bg-cyan-950/80 border-cyan-400 text-white shadow-md'
                                  : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                              }`}
                            >
                              {numAthletes === 2 && isTwins && (
                                <span className="absolute top-2 right-2 px-1.5 py-0.5 text-[9px] font-bold bg-amber-500 text-slate-950 rounded">
                                  COCOK 2 ANAK
                                </span>
                              )}
                              <div className="font-bold text-xs sm:text-sm">{pkg.name}</div>
                              <div className="text-[11px] text-slate-400">{pkg.ratio}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Sessions count */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-xs font-semibold text-slate-300">
                            Jumlah Sesi
                          </label>
                          {formData.classType === 'prestasi' ? (
                            <span className="text-[10px] text-amber-300 font-mono font-bold">
                              ★ 16x Standar Atlet
                            </span>
                          ) : (
                            <span className="text-[10px] text-cyan-400 font-mono">
                              Pilihan Paket
                            </span>
                          )}
                        </div>

                        {formData.classType === 'prestasi' ? (
                          <div className="p-2.5 rounded-xl bg-amber-950/70 border border-amber-400 text-amber-200">
                            <div className="flex items-center justify-between">
                              <span className="font-athletic font-bold text-xs sm:text-sm text-amber-300 flex items-center gap-1.5">
                                <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                16x Sesi (Standar Atlet WCT)
                              </span>
                              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-400 text-slate-950">
                                4x / Minggu
                              </span>
                            </div>
                            <p className="text-[10px] text-amber-300/80 mt-1">
                              Program pembinaan atlet kompetitif intensif 16x pertemuan per bulan.
                            </p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, sessions: 4 })}
                              className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                                formData.sessions === 4
                                  ? 'bg-cyan-950 border-cyan-400 text-white'
                                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                              }`}
                            >
                              4x Sesi
                            </button>
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, sessions: 8 })}
                              className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                                formData.sessions === 8
                                  ? 'bg-cyan-950 border-cyan-400 text-cyan-300'
                                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                              }`}
                            >
                              8x Sesi
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Location */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Lokasi Kolam
                        </label>
                        <select
                          value={formData.location}
                          onChange={(e) =>
                            setFormData({ ...formData, location: e.target.value as PoolLocationId })
                          }
                          className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-cyan-400"
                        >
                          <option value="pahoman">Kolam Pahoman (Pagi 07:30+)</option>
                          <option value="unila">Kolam UNILA (Sore 16:00+)</option>
                        </select>
                      </div>
                    </div>

                    {/* Preferred Day */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Preferensi Hari Latihan
                        </label>
                        <input
                          type="text"
                          placeholder="Contoh: Sabtu & Minggu / Selasa & Kamis"
                          value={formData.preferredDay}
                          onChange={(e) => setFormData({ ...formData, preferredDay: e.target.value })}
                          className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Catatan Tambahan (Opsional)
                        </label>
                        <input
                          type="text"
                          placeholder="Contoh: Mau sekelas bareng, dll."
                          value={formData.specialNotes}
                          onChange={(e) => setFormData({ ...formData, specialNotes: e.target.value })}
                          className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                        />
                      </div>
                    </div>

                    {/* VOUCHER ACTIVATION & FLOATING 3D CARD */}
                    <div className="pt-1">
                      {appliedVoucher ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between px-1">
                            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Voucher Aktif Terverifikasi</span>
                            </span>
                            <button
                              type="button"
                              onClick={handleRemoveVoucher}
                              className="text-[11px] text-slate-400 hover:text-rose-400 transition-colors underline cursor-pointer"
                            >
                              Ganti Kode
                            </button>
                          </div>

                          {/* Warning if applied voucher is not valid for current selection */}
                          {effectiveVoucherDiscount === 0 && (
                            <div className="p-3 rounded-xl bg-amber-950/80 border border-amber-500/50 text-amber-300 text-xs flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                              <span>
                                {appliedVoucher.code.toUpperCase() === 'JUARA100' ? (
                                  <>
                                    Voucher <strong>JUARA100</strong> hanya berlaku untuk <strong>Kelas Reguler (8 sesi)</strong>, <strong>Kelas Privat (8 sesi)</strong>, dan <strong>WCT (16 sesi)</strong>. Ubah pilihan paket atau sesi Anda untuk mengklaim potongan.
                                  </>
                                ) : (
                                  <>
                                    Voucher <strong>{appliedVoucher.code}</strong> tidak berlaku untuk pilihan paket atau sesi ini.
                                  </>
                                )}
                              </span>
                            </div>
                          )}

                          {/* Floating 3D Animated Card */}
                          <FloatingVoucherCard
                            code={appliedVoucher.code}
                            discountAmount={effectiveVoucherDiscount > 0 ? effectiveVoucherDiscount : appliedVoucher.discount}
                            onRemove={handleRemoveVoucher}
                          />

                          {voucherSuccessToast && (
                            <div className="p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs text-center font-medium animate-in fade-in zoom-in-95 duration-200">
                              🎉 Voucher <strong className="font-mono">{appliedVoucher.code}</strong> berhasil diaktifkan! Potongan langsung {formatRupiah(effectiveVoucherDiscount)}.
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-3.5 sm:p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 font-mono">
                              <Ticket className="w-3.5 h-3.5 text-cyan-400" />
                              <span>Punya Kode Voucher?</span>
                            </label>
                            <span className="text-[11px] text-slate-400">Klaim Promo Khusus</span>
                          </div>

                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Masukkan kode voucher resmi..."
                              value={voucherInput}
                              onChange={(e) => {
                                setVoucherInput(e.target.value.toUpperCase());
                                setVoucherError(null);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleApplyVoucher();
                                }
                              }}
                              className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono text-cyan-300 placeholder:text-slate-500 uppercase tracking-wider focus:outline-none focus:border-cyan-400"
                            />
                            <button
                              type="button"
                              onClick={() => handleApplyVoucher()}
                              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-cyan-500/20 active:scale-95 cursor-pointer"
                            >
                              Terapkan
                            </button>
                          </div>

                          {voucherError && (
                            <p className="text-[11px] text-rose-400 flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                              <span>{voucherError}</span>
                            </p>
                          )}

                          <div className="text-[10px] text-slate-400">
                            *Kode voucher resmi diterbitkan oleh Tim &amp; Manajemen WAVORA
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Cost Preview Badge */}
                    <div className="p-3.5 rounded-xl bg-slate-950/80 border border-cyan-500/30 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-slate-400">
                          Total Estimasi: <span className="text-white font-bold">{selectedPkg.name} ({formData.sessions}x Sesi)</span>
                          {numAthletes > 1 && (
                            <span className="ml-1 text-cyan-300">untuk {numAthletes} Atlet</span>
                          )}
                        </div>
                        <div className="flex items-baseline gap-2">
                          {effectiveVoucherDiscount > 0 && (
                            <span className="line-through text-slate-500 text-xs sm:text-sm font-medium">
                              {formatRupiah(rawPrice)}
                            </span>
                          )}
                          <span className="font-athletic font-extrabold text-lg sm:text-xl text-cyan-300">
                            {formatRupiah(totalEstimate)}
                          </span>
                        </div>
                      </div>
                      <div className="text-[11px] text-slate-400 border-t border-slate-800/60 pt-1.5 flex flex-col sm:flex-row justify-between gap-1">
                        <span>
                          {numAthletes > 1
                            ? `Biaya pendaftaran langsung dihitung sekaligus untuk ${numAthletes} anak.`
                            : `Biaya resmi untuk 1 murid baru.`}
                        </span>
                        {effectiveVoucherDiscount > 0 && appliedVoucher && (
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            Potongan voucher ({appliedVoucher.code}): -{formatRupiah(effectiveVoucherDiscount)}
                          </span>
                        )}
                      </div>
                    </div>

                  </div>
                )}

                {/* STEP 4: KONFIRMASI & REVIEW */}
                {currentStep === 4 && (
                  <div className="space-y-5 animate-in fade-in duration-200">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4" /> 4. KONFIRMASI & VERIFIKASI AKHIR
                    </h3>

                    {/* Summary Box */}
                    <div className="bg-slate-950/70 rounded-xl p-5 border border-slate-800 space-y-3 text-xs">
                      <div className="border-b border-slate-800/80 pb-2.5">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-slate-400">Calon Atlet Terdaftar:</span>
                          <span className="font-bold text-cyan-300">
                            {athletesList.length} Orang Atlet
                          </span>
                        </div>
                        <div className="space-y-1 pl-2 border-l-2 border-cyan-500/40">
                          {athletesList.map((ath, idx) => (
                            <div key={idx} className="flex justify-between text-slate-200">
                              <span className="font-semibold">
                                #{idx + 1} {ath.athleteName || 'Belum diisi'}
                              </span>
                              <span className="text-slate-400">
                                {ath.age ? `${ath.age} Th` : '-'}, {ath.gender}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-between border-b border-slate-800/80 pb-2">
                        <span className="text-slate-400">Orang Tua / Kontak:</span>
                        <span className="font-bold text-white">
                          {formData.parentName} ({formData.whatsapp})
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-slate-800/80 pb-2">
                        <span className="text-slate-400">Paket & Sesi:</span>
                        <span className="font-bold text-cyan-300">
                          {selectedPkg.name} • {formData.sessions}x Sesi {numAthletes > 1 ? `(${numAthletes} Atlet)` : ''}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-slate-800/80 pb-2">
                        <span className="text-slate-400">Venue Kolam:</span>
                        <span className="font-bold text-white">
                          {selectedLoc.name} ({selectedLoc.timeSlot})
                        </span>
                      </div>
                      {effectiveVoucherDiscount > 0 && appliedVoucher ? (
                        <>
                          <div className="flex justify-between border-b border-slate-800/80 pb-2 text-slate-400">
                            <span>Biaya Normal:</span>
                            <span className="line-through">{formatRupiah(rawPrice)}</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-800/80 pb-2 text-emerald-400">
                            <span className="flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Voucher Diskon ({appliedVoucher.code}):</span>
                            </span>
                            <span className="font-bold">-{formatRupiah(effectiveVoucherDiscount)}</span>
                          </div>
                        </>
                      ) : null}
                      <div className="flex justify-between pt-1">
                        <span className="text-slate-400">Total Investasi Renang ({numAthletes} Anak):</span>
                        <span className="font-athletic font-black text-base text-cyan-300">
                          {formatRupiah(totalEstimate)}
                        </span>
                      </div>
                    </div>

                    {/* Floating 3D Voucher Card preview in Step 4 if voucher is applied */}
                    {appliedVoucher && effectiveVoucherDiscount > 0 && (
                      <div className="pt-1">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
                          <Tag className="w-3 h-3 text-cyan-400" />
                          <span>Tiket Voucher Terverifikasi Anda:</span>
                        </div>
                        <FloatingVoucherCard
                          code={appliedVoucher.code}
                          discountAmount={effectiveVoucherDiscount}
                          onRemove={handleRemoveVoucher}
                          showRemoveButton={true}
                        />
                      </div>
                    )}

                    {/* Agreement Checkbox */}
                    <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.agreedTerms}
                          onChange={(e) => setFormData({ ...formData, agreedTerms: e.target.checked })}
                          className="w-4 h-4 rounded mt-0.5 accent-cyan-500 bg-slate-900 border-slate-700"
                        />
                        <span className="text-xs text-slate-300 leading-relaxed">
                          Saya menyatakan bahwa data yang diisi adalah benar, atlet dalam kondisi sehat untuk berolahraga akuatik, dan menyetujui kebijakan jadwal fleksibel Wavora Aquatic Academy.
                        </span>
                      </label>
                      {formErrors.agreedTerms && (
                        <p className="text-xs text-rose-400 mt-2">{formErrors.agreedTerms}</p>
                      )}
                    </div>

                  </div>
                )}

                {/* Form Navigation Controls */}
                <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-800">
                  {currentStep > 1 ? (
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Kembali</span>
                    </button>
                  ) : (
                    <div />
                  )}

                  {currentStep < 4 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-300 hover:from-cyan-300 text-xs font-bold uppercase tracking-wider text-slate-950 flex items-center gap-2 shadow-lg shadow-cyan-500/20"
                    >
                      <span>Lanjut Langkah {currentStep + 1}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      id="submit-registration-btn"
                      className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-300 hover:from-cyan-300 text-xs sm:text-sm font-black uppercase tracking-wider text-slate-950 flex items-center gap-2 shadow-xl shadow-cyan-500/30"
                    >
                      <Check className="w-4 h-4" />
                      <span>Kirim & Terbitkan Tiket Registrasi</span>
                    </button>
                  )}
                </div>

              </form>
            </div>
          ) : (
            /* ANIMATED DIGITAL INVOICE & RECEIPT VIEW WITH DOWNLOAD & WHATSAPP SHARING */
            <AnimatedReceiptView
              ticket={completedTicket}
              packageName={selectedPkg.name}
              locationName={selectedLoc.name}
              locationTime={selectedLoc.timeSlot}
              whatsappMessage={generateWhatsAppMessageText()}
              onReset={() => {
                setCompletedTicket(null);
                setCurrentStep(1);
              }}
            />
          )}

        </div>

      </div>
    </section>
  );
};
