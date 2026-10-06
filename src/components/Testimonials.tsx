// ============================================================================
// FILE: src/components/Testimonials.tsx (PROTEKSI PENUH TOMBOL HAPUS & FOUNDER CONTROL)
// ============================================================================
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Star, Quote, CheckCircle2, MapPin, UserCheck, MessageSquarePlus, 
  ThumbsUp, Trash2, X, RefreshCw, AlertTriangle, Sparkles, 
  Image as ImageIcon, Camera, ShieldCheck, Clock, Check, Key, Lock,
  RotateCw, Maximize2, Minimize2, Move, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { isFounderAuthenticated, setFounderAuthenticated, verifyFounderPinOnServer } from '../utils/founderAuth';
import { compressImage } from '../utils/imageCompressor';
import { db, isFirestoreConfigured } from '../lib/firebase';
import { collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot, getDocs, increment } from 'firebase/firestore';
import { safeGetItem, safeSetItem, sanitizeItemsForCache, purgeLegacyStorage, getDeletedReviewIds, markReviewAsDeleted } from '../utils/safeStorage';

export type ReactionType = 'love' | 'swim' | 'clap' | 'fire' | 'star';

export interface ReactionConfig {
  type: ReactionType;
  emoji: string;
  label: string;
  activeColor: string;
}

export const REACTION_CONFIGS: ReactionConfig[] = [
  { type: 'love', emoji: '❤️', label: 'Bangga', activeColor: 'text-rose-400 bg-rose-950/60 border-rose-500/50' },
  { type: 'swim', emoji: '🏊', label: 'Semangat', activeColor: 'text-cyan-400 bg-cyan-950/60 border-cyan-500/50' },
  { type: 'clap', emoji: '👏', label: 'Hebat', activeColor: 'text-amber-400 bg-amber-950/60 border-amber-500/50' },
  { type: 'fire', emoji: '🔥', label: 'Keren', activeColor: 'text-orange-400 bg-orange-950/60 border-orange-500/50' },
  { type: 'star', emoji: '⭐', label: 'Inspiratif', activeColor: 'text-yellow-400 bg-yellow-950/60 border-yellow-500/50' },
];

export interface TestimonialItem {
  id: string;
  parentName: string;
  parentRole: string;
  location: string;
  rating: number;
  transformation: string;
  quote: string;
  program: string;
  photoUrl?: string;
  createdAt?: string;
  likes?: number;
  reactions?: Record<string, number>;
  status: 'approved' | 'pending';
  isCustom?: boolean;
}

const LOCAL_STORAGE_KEY = 'wavora_testimonials_v8';

// Ulasan otentik yang telah tersinkronisasi 100% dari Cloud Firestore Firebase Console
export const INITIAL_SEED_TESTIMONIALS: TestimonialItem[] = [
  {
    id: 'rev_1787255131844_sk30',
    parentName: 'Ajeng mulati',
    parentRole: 'Orang Tua dari Felicia (6 tahun) dan Hanna (3 tahun 8 bulan)',
    location: 'Kolam Pahoman, Bandar Lampung',
    rating: 5,
    transformation: 'Saya punya 2 anak yang awalnya tidak tau teknik dasar berenang sama sekali karna niat mereka yang kuat untuk belajar renang lewat Wavora ini mereka jadi lebih semangat lagi untuk latihan dan mengembangkan kemampuan mereka',
    quote: 'Di tempat latihan Wavora ini Felicia dan Hanna menunjukkan perkembangan yang sangat signifikan dan mereka lebih terarah dalam gaya hidupnya dari yang malas malasan berolahraga sekrg mereka sudah punya kegiatan rutin untuk latihan renang, semenjak renang juga saya tahan tubuh mereka sudah tidak rentan lagi sakit sakitan, terimakasih para coach yang sudah sabar dan telaten untuk membimbing para muridnya. Semoga wavira makin maju dan menciptakan para atlet2 yg berprestasi',
    program: 'Class Reguler',
    photoUrl: '',
    createdAt: '2026-08-20T19:45:31.844Z',
    likes: 30,
    reactions: { love: 30, swim: 18, clap: 14, fire: 12, star: 15 },
    status: 'approved',
    isCustom: true,
  },
  {
    id: 'rev_1787136056442_v9kl',
    parentName: 'Dian Dwi P',
    parentRole: 'Orang Tua dari Kirana (13)',
    location: 'Kolam UNILA, Bandar Lampung',
    rating: 5,
    transformation: 'Belajar berenang dari nol hingga berani menyelam',
    quote: 'kirana sebelumnya takut kalau berenang di tempat yang dalam tp sekarang karena dilatih oleh coach kirana mulai berani dan step by step sudah mulai bisa berenang...trims coachh',
    program: 'Class Reguler',
    photoUrl: '',
    createdAt: '2026-08-19T10:40:56.442Z',
    likes: 30,
    reactions: { love: 30, swim: 15, clap: 12, fire: 9, star: 10 },
    status: 'approved',
    isCustom: true,
  },
  {
    id: 'rev_1787113120914_x8lh',
    parentName: 'Mami Lia',
    parentRole: 'Orang Tua dari Zee & vino usia 10 & 15 thn',
    location: 'Kolam UNILA, Bandar Lampung',
    rating: 5,
    transformation: 'Dari blm bisa apa2 di dlm air, sampai skg sudah bisa ikut kejuaraan😎🫶🏻',
    quote: 'Berawal dri scrool IG dan melihat ada postingan dri @wavoraaquaticacdemy dan akhirnya anak2 saya ikut daftar di club ini, masyallah luar biasa semua coach nya sangat ramah, dan sabar dlm melatih anak2, di tambah lg dgn latar belakang coach nya adalah atlit nasional, maka kami makin percaya insyallah anak2 akan terus berkembang. Benar saja tdk butuh waktu yg lama khusus nya anak saya sudah bisa mengikuti lomba Kejurnas dan alhamdulillah mendapat kan 2 medali emas dan 1 medali perak. \nLuar biasa, trimksh Coach wavora atas ilmu nya buat anak2 semua, semoga wavora semakin jaya aamiin yra🤲😎🔥🔥🔥 SEMANGAT LATIHAN ANAK2 HEBAT WAVORA🔥🔥',
    program: 'Class Reguler',
    photoUrl: '',
    createdAt: '2026-08-19T04:18:40.914Z',
    likes: 40,
    reactions: { love: 40, swim: 25, clap: 20, fire: 22, star: 18 },
    status: 'approved',
    isCustom: true,
  },
  {
    id: 'rev_1787061285367_pgsv',
    parentName: 'Ayah Muhammad Nazib',
    parentRole: 'Orang Tua dari Al Hafizh (12 thn)',
    location: 'Kolam UNILA, Bandar Lampung',
    rating: 5,
    transformation: 'Awalnya takut air, setiap mau latihan drama trus skrng udh rajin mau latihan',
    quote: 'Dimulai dari NOL no basic swimming, awalnya kaku kaya kanebo kering sering sudah menunjukan kelenturan dan sdh bs berenang bbrp gaya. diawal latihan untuk gaya bebas kaku dan akhirny coach ganti strategi untuk gaya dada diawal latihan daan skrng di kolam 5m udh ada keberanian., thanks a lot coach 👍💪',
    program: 'Class Reguler',
    photoUrl: '',
    createdAt: '2026-08-18T13:54:45.367Z',
    likes: 21,
    reactions: { love: 21, swim: 14, clap: 16, fire: 10, star: 12 },
    status: 'approved',
    isCustom: true,
  },
  {
    id: 'rev_1787059645665_stgd',
    parentName: 'Vitri',
    parentRole: 'Orang Tua dari Sonya, Usia 16th',
    location: 'Kolam Pahoman, Bandar Lampung',
    rating: 5,
    transformation: 'Mengatur nafas dg baik & Menambah kepercayaan diri dalam berenang',
    quote: 'Berkat kesabaran & ketelatenan Coach2 handal dalam membimbing berenang, sekarang Sonya sudah menguasai 3Gaya \n\nTerimakasih Wavora Aquatic Academi 🙏🔥',
    program: 'Class Reguler',
    photoUrl: '',
    createdAt: '2026-08-18T13:27:25.666Z',
    likes: 30,
    reactions: { love: 30, swim: 19, clap: 15, fire: 14, star: 13 },
    status: 'approved',
    isCustom: true,
  },
];

// Normalizer untuk menjamin dokumen Firestore valid dan membuang dokumen dummy kosong
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const formatFirestoreDoc = (d: { id: string; data: () => any }): TestimonialItem | null => {
  const data = d.data() || {};
  let parentName = (data.parentName || '').trim();
  let quote = (data.quote || '').trim();
  let transformation = (data.transformation || '').trim();
  let parentRole = (data.parentRole || '').trim();
  let location = (data.location || '').trim();
  let program = data.program || 'Class Reguler';
  let rating = typeof data.rating === 'number' && data.rating >= 1 && data.rating <= 5 ? data.rating : 5;

  // Cek apakah dokumen ini merupakan salah satu dari 5 ulasan otentik WAVORA
  const seed = INITIAL_SEED_TESTIMONIALS.find((s) => s.id === d.id);
  if (seed) {
    if (!parentName) parentName = seed.parentName;
    if (!quote) quote = seed.quote;
    if (!transformation) transformation = seed.transformation;
    if (!parentRole) parentRole = seed.parentRole;
    if (!location) location = seed.location;
    if (!data.program) program = seed.program;
    if (!data.rating) rating = seed.rating;
  }

  // Guard: Tolak dokumen kosong atau ulasan placeholder tanpa teks dan tanpa foto
  if (!parentName && !quote && !transformation && !data.photoUrl) {
    return null;
  }
  if (parentName.toLowerCase() === 'orang tua murid' && !quote && !transformation && !data.photoUrl) {
    return null;
  }

  const rawReactions = data.reactions || {};
  const likesCount = typeof data.likes === 'number' ? data.likes : (rawReactions.love || (seed ? seed.likes : 20));

  return {
    id: d.id,
    parentName: parentName || 'Orang Tua Murid WAVORA',
    parentRole: parentRole || 'Orang Tua Murid WAVORA',
    location: location || 'Kolam Pahoman, Bandar Lampung',
    rating: rating,
    transformation: transformation || quote || 'Perkembangan Renang Sangat Positif',
    quote: quote || transformation || '',
    program: program,
    photoUrl: data.photoUrl || (seed?.photoUrl) || '',
    createdAt: data.createdAt || (seed?.createdAt) || new Date().toISOString(),
    likes: likesCount,
    reactions: {
      love: typeof rawReactions.love === 'number' ? rawReactions.love : (seed?.reactions?.love ?? likesCount),
      swim: typeof rawReactions.swim === 'number' ? rawReactions.swim : (seed?.reactions?.swim ?? 10),
      clap: typeof rawReactions.clap === 'number' ? rawReactions.clap : (seed?.reactions?.clap ?? 8),
      fire: typeof rawReactions.fire === 'number' ? rawReactions.fire : (seed?.reactions?.fire ?? 6),
      star: typeof rawReactions.star === 'number' ? rawReactions.star : (seed?.reactions?.star ?? 7),
    },
    status: data.status === 'pending' ? 'pending' : 'approved',
    isCustom: Boolean(data.isCustom ?? true),
  };
};

// Penggabung cerdas yang menjamin 5 ulasan otentik WAVORA selalu ada dan tidak pernah hilang
export const mergeWithAuthenticSeed = (incoming: TestimonialItem[], currentList?: TestimonialItem[]): TestimonialItem[] => {
  const deletedIds = new Set(getDeletedReviewIds());
  const incomingMap = new Map<string, TestimonialItem>();
  const currentMap = new Map<string, TestimonialItem>();

  if (currentList && Array.isArray(currentList)) {
    for (const cur of currentList) {
      if (cur && cur.id) currentMap.set(cur.id, cur);
    }
  }

  for (const item of incoming) {
    if (!item || !item.id) continue;
    if (deletedIds.has(item.id)) continue;
    // Tolak dummy kosong
    if (item.parentName === 'Orang Tua Murid' && !item.quote && !item.transformation && !item.photoUrl) continue;
    incomingMap.set(item.id, item);
  }

  // 1. Pastikan 5 ulasan otentik selalu utuh dan menerima reaksi/foto terbaru
  const authenticList = INITIAL_SEED_TESTIMONIALS.map((seed) => {
    const fromInc = incomingMap.get(seed.id);
    const fromCur = currentMap.get(seed.id);

    // Prioritas foto: jika ada foto dokumentasi yang diunggah, gunakan foto tersebut
    const isValidPhoto = (url?: string): boolean => {
      if (!url || typeof url !== 'string') return false;
      const trimmed = url.trim();
      if (trimmed === '') return false;
      // Jangan pakai link file lokal stock photo lama yang sudah dihapus
      if (trimmed.startsWith('/testimonials/')) return false;
      return true;
    };

    let photoToUse = '';
    if (isValidPhoto(fromInc?.photoUrl)) {
      photoToUse = fromInc!.photoUrl!;
    } else if (isValidPhoto(fromCur?.photoUrl)) {
      photoToUse = fromCur!.photoUrl!;
    } else if (isValidPhoto(seed.photoUrl)) {
      photoToUse = seed.photoUrl!;
    }

    if (!fromInc && !fromCur) return { ...seed, photoUrl: photoToUse };

    const likesCount = typeof fromInc?.likes === 'number'
      ? Math.max(fromInc.likes, seed.likes || 0)
      : typeof fromCur?.likes === 'number'
      ? Math.max(fromCur.likes, seed.likes || 0)
      : seed.likes;

    return {
      ...seed,
      photoUrl: photoToUse,
      likes: likesCount,
      reactions: {
        love: Math.max(fromInc?.reactions?.love ?? 0, fromCur?.reactions?.love ?? 0, seed.reactions?.love ?? 0),
        swim: Math.max(fromInc?.reactions?.swim ?? 0, fromCur?.reactions?.swim ?? 0, seed.reactions?.swim ?? 0),
        clap: Math.max(fromInc?.reactions?.clap ?? 0, fromCur?.reactions?.clap ?? 0, seed.reactions?.clap ?? 0),
        fire: Math.max(fromInc?.reactions?.fire ?? 0, fromCur?.reactions?.fire ?? 0, seed.reactions?.fire ?? 0),
        star: Math.max(fromInc?.reactions?.star ?? 0, fromCur?.reactions?.star ?? 0, seed.reactions?.star ?? 0),
      },
      status: fromInc?.status || fromCur?.status || seed.status,
    };
  });

  // 2. Tambahkan ulasan tambahan (ulasan baru pengunjung)
  const additionals: TestimonialItem[] = [];
  const handledIds = new Set(INITIAL_SEED_TESTIMONIALS.map((s) => s.id));

  for (const [id, item] of incomingMap.entries()) {
    if (!handledIds.has(id)) {
      const fromCur = currentMap.get(id);
      const photoToUse = (item.photoUrl && item.photoUrl.trim() !== '')
        ? item.photoUrl
        : (fromCur?.photoUrl && fromCur.photoUrl.trim() !== '')
        ? fromCur.photoUrl
        : '';
      additionals.push({
        ...item,
        photoUrl: photoToUse,
      });
      handledIds.add(id);
    }
  }

  // Juga pertahankan ulasan tambahan yang ada di currentList jika Firestore belum sempat sinkron
  if (currentList) {
    for (const cur of currentList) {
      if (cur && cur.id && !handledIds.has(cur.id) && !deletedIds.has(cur.id)) {
        additionals.push(cur);
        handledIds.add(cur.id);
      }
    }
  }

  const result = [...additionals, ...authenticList];
  result.sort((a, b) => {
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return timeB - timeA;
  });

  return result;
};

export const Testimonials: React.FC = () => {
  const [reviews, setReviews] = useState<TestimonialItem[]>(() => {
    try {
      purgeLegacyStorage();
      const saved = safeGetItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const merged = mergeWithAuthenticSeed(parsed);
          if (merged.length >= 5) {
            return merged;
          }
        }
      }
      return INITIAL_SEED_TESTIMONIALS;
    } catch (e) {
      console.error(e);
      return INITIAL_SEED_TESTIMONIALS;
    }
  });

  const [activeFilter, setActiveFilter] = useState<'all' | 'approved' | 'pending' | 'pahoman' | 'unila'>('all');
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [isFounderMode, setIsFounderMode] = useState<boolean>(() => isFounderAuthenticated());
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<TestimonialItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedPhotoForModal, setSelectedPhotoForModal] = useState<{ url: string; title: string } | null>(null);

  // Photo Attachment / Replacement Modal (Founder Mode)
  const [photoAttachTarget, setPhotoAttachTarget] = useState<TestimonialItem | null>(null);
  const [attachPhotoPreview, setAttachPhotoPreview] = useState<string | null>(null);
  const [isSavingPhoto, setIsSavingPhoto] = useState(false);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const [recentReaction, setRecentReaction] = useState<{ id: string; type: ReactionType; key: number } | null>(null);

  // Form State
  const [parentName, setParentName] = useState('');
  const [childInfo, setChildInfo] = useState('');
  const [location, setLocation] = useState('Kolam Pahoman, Bandar Lampung');
  const [program, setProgram] = useState('Class Reguler');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [transformation, setTransformation] = useState('');
  const [quote, setQuote] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFitMode, setPhotoFitMode] = useState<'adaptive' | 'cover' | 'ambient'>('adaptive');
  const [photoFocusY, setPhotoFocusY] = useState<'center' | 'top' | 'bottom'>('center');
  const [photoMeta, setPhotoMeta] = useState<{ width: number; height: number; ratio: number; isPortrait: boolean } | null>(null);

  const detectPhotoMeta = (dataUrl: string) => {
    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth || 1;
      const h = img.naturalHeight || 1;
      const ratio = w / h;
      const isPortrait = ratio < 0.95;
      setPhotoMeta({
        width: w,
        height: h,
        ratio,
        isPortrait,
      });
      // Default to adaptive so portrait phone photos fit cleanly without black side gaps
      setPhotoFitMode(isPortrait ? 'adaptive' : 'cover');
    };
    img.src = dataUrl;
  };

  const handleRotatePhoto = () => {
    if (!photoPreview) return;
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.height;
      canvas.height = img.width;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((90 * Math.PI) / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      const newUrl = canvas.toDataURL('image/jpeg', 0.92);
      setPhotoPreview(newUrl);
      detectPhotoMeta(newUrl);
    };
    img.src = photoPreview;
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const fetchTestimonialsFromServer = async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    try {
      const snap = await getDocs(collection(db, 'testimonials'));
      const incomingList: TestimonialItem[] = [];
      snap.forEach((d) => {
        const parsed = formatFirestoreDoc(d);
        if (parsed) incomingList.push(parsed);
      });
      setReviews((prev) => {
        const merged = mergeWithAuthenticSeed(incomingList, prev);
        safeSetItem(LOCAL_STORAGE_KEY, JSON.stringify(sanitizeItemsForCache(merged)));
        return merged;
      });
      if (showLoading) showToast('Data ulasan tersinkronisasi 100% langsung dari Firebase Console!');
    } catch (e) {
      console.warn('Sync notice:', e);
      setReviews((prev) => mergeWithAuthenticSeed(prev));
      if (showLoading) showToast('Data ulasan otentik WAVORA siap ditampilkan.');
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    // 1. Ambil seketika melalui getDocs
    fetchTestimonialsFromServer(false);

    // 2. Pasang onSnapshot listener untuk real-time update
    let unsubscribe = () => {};
    try {
      unsubscribe = onSnapshot(
        collection(db, 'testimonials'),
        (snapshot) => {
          const incomingList: TestimonialItem[] = [];
          snapshot.forEach((d) => {
            const parsed = formatFirestoreDoc(d);
            if (parsed) incomingList.push(parsed);
          });
          setReviews((prev) => {
            const merged = mergeWithAuthenticSeed(incomingList, prev);
            safeSetItem(LOCAL_STORAGE_KEY, JSON.stringify(sanitizeItemsForCache(merged)));
            return merged;
          });
          setIsLoading(false);
        },
        (error) => {
          console.warn('Firestore onSnapshot notice:', error);
          setReviews((prev) => mergeWithAuthenticSeed(prev));
          setIsLoading(false);
        }
      );
    } catch (err) {
      console.warn('Firestore init notice:', err);
      setReviews((prev) => mergeWithAuthenticSeed(prev));
      setIsLoading(false);
    }

    const handleAuthChange = () => setIsFounderMode(isFounderAuthenticated());
    window.addEventListener('wavora_founder_auth_change', handleAuthChange);
    return () => {
      unsubscribe();
      window.removeEventListener('wavora_founder_auth_change', handleAuthChange);
    };
  }, []);

  const processReviewPhoto = async (file: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    try {
      const compressed = await compressImage(file, 1600, 1600, 0.90);
      setPhotoPreview(compressed);
      detectPhotoMeta(compressed);
    } catch (err) {
      console.error('Compress failed:', err);
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPhotoPreview(result);
        detectPhotoMeta(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 1080, 1080, 0.82);
        setPhotoPreview(compressed);
        detectPhotoMeta(compressed);
      } catch (err) {
        console.warn('Compress error, using direct reader:', err);
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          setPhotoPreview(result);
          detectPhotoMeta(result);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Helper untuk membuka modal pasang/ubah foto dokumentasi murid (Mode Founder)
  const openPhotoModal = (rev: TestimonialItem) => {
    if (!isFounderMode && !isFounderAuthenticated()) {
      setIsPinModalOpen(true);
      return;
    }
    setPhotoAttachTarget(rev);
    setAttachPhotoPreview(rev.photoUrl && rev.photoUrl.trim() !== '' ? rev.photoUrl : null);
  };

  const handleAttachPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessingPhoto(true);
      try {
        const compressed = await compressImage(file, 1080, 1080, 0.82);
        setAttachPhotoPreview(compressed);
      } catch (err) {
        console.warn('Compress error, trying fallback:', err);
        const reader = new FileReader();
        reader.onloadend = () => {
          const res = reader.result as string;
          if (res) setAttachPhotoPreview(res);
          setIsProcessingPhoto(false);
        };
        reader.readAsDataURL(file);
        return;
      } finally {
        setIsProcessingPhoto(false);
        e.target.value = '';
      }
    }
  };

  const handleRotateAttachPhoto = () => {
    if (!attachPhotoPreview) return;
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.height;
      canvas.height = img.width;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((90 * Math.PI) / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      const newUrl = canvas.toDataURL('image/jpeg', 0.82);
      setAttachPhotoPreview(newUrl);
    };
    img.src = attachPhotoPreview;
  };

  const handleSaveAttachedPhoto = async () => {
    if (!photoAttachTarget) return;
    const targetId = photoAttachTarget.id;
    const finalPhoto = attachPhotoPreview || '';

    setIsSavingPhoto(true);

    // 1. UPDATE UI & STATE LOKAL SEKETIKA (OPTIMISTIC & ZERO DELAY)
    const currentItem = reviews.find((r) => r.id === targetId) || photoAttachTarget;
    const seed = INITIAL_SEED_TESTIMONIALS.find((s) => s.id === targetId);

    const updated = reviews.map((r) =>
      r.id === targetId ? { ...r, photoUrl: finalPhoto } : r
    );
    setReviews(updated);
    safeSetItem(LOCAL_STORAGE_KEY, JSON.stringify(sanitizeItemsForCache(updated)));

    // 2. TUTUP MODAL & BERSIHKAN STATE SEKETIKA (TIDAK ADA LAGI HANG / LOADING BERPUTAR)
    setPhotoAttachTarget(null);
    setAttachPhotoPreview(null);
    setIsSavingPhoto(false);
    showToast(finalPhoto ? 'Foto dokumentasi murid berhasil dipasang & tersimpan!' : 'Foto dokumentasi murid telah dihapus.');

    // 3. SINKRONISASI KE CLOUD FIRESTORE LENGKAP DI LATAR BELAKANG
    if (isFirestoreConfigured) {
      try {
        const fullDocData = {
          id: targetId,
          parentName: currentItem.parentName || seed?.parentName || 'Orang Tua Murid WAVORA',
          parentRole: currentItem.parentRole || seed?.parentRole || 'Orang Tua Murid WAVORA',
          location: currentItem.location || seed?.location || 'Kolam Pahoman, Bandar Lampung',
          rating: typeof currentItem.rating === 'number' ? currentItem.rating : (seed?.rating ?? 5),
          transformation: currentItem.transformation || seed?.transformation || 'Perkembangan Renang Positif',
          quote: currentItem.quote || seed?.quote || '',
          program: currentItem.program || seed?.program || 'Class Reguler',
          photoUrl: finalPhoto,
          createdAt: currentItem.createdAt || seed?.createdAt || new Date().toISOString(),
          likes: typeof currentItem.likes === 'number' ? currentItem.likes : (seed?.likes ?? 30),
          reactions: currentItem.reactions || seed?.reactions || { love: 30, swim: 18, clap: 14, fire: 12, star: 15 },
          status: currentItem.status || 'approved',
          isCustom: true,
        };

        Promise.race([
          setDoc(doc(db, 'testimonials', targetId), fullDocData, { merge: true }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000)),
        ])
          .then(() => {
            console.log('Firestore photo synced successfully for:', targetId);
          })
          .catch((err: any) => {
            console.warn('Background Firestore save photo notice:', err);
            if (err?.code === 'permission-denied') {
              showToast('⚠️ Foto tersimpan di perangkat. Untuk sinkron ke Firestore Console, pastikan Rules mengizinkan write.');
            }
          });
      } catch (err) {
        console.warn('Network sync notice:', err);
      }
    }
  };

  const handleDeleteAttachedPhoto = async () => {
    if (!photoAttachTarget) return;
    const targetId = photoAttachTarget.id;

    const currentItem = reviews.find((r) => r.id === targetId) || photoAttachTarget;
    const seed = INITIAL_SEED_TESTIMONIALS.find((s) => s.id === targetId);

    // 1. UPDATE UI SEKETIKA
    const updated = reviews.map((r) =>
      r.id === targetId ? { ...r, photoUrl: '' } : r
    );
    setReviews(updated);
    safeSetItem(LOCAL_STORAGE_KEY, JSON.stringify(sanitizeItemsForCache(updated)));

    // 2. TUTUP MODAL SEKETIKA
    setPhotoAttachTarget(null);
    setAttachPhotoPreview(null);
    setIsSavingPhoto(false);
    showToast('Foto dokumentasi murid berhasil dihapus.');

    // 3. SINKRONISASI KE CLOUD DI LATAR BELAKANG
    if (isFirestoreConfigured) {
      try {
        const fullDocData = {
          id: targetId,
          parentName: currentItem.parentName || seed?.parentName || 'Orang Tua Murid WAVORA',
          parentRole: currentItem.parentRole || seed?.parentRole || 'Orang Tua Murid WAVORA',
          location: currentItem.location || seed?.location || 'Kolam Pahoman, Bandar Lampung',
          rating: typeof currentItem.rating === 'number' ? currentItem.rating : (seed?.rating ?? 5),
          transformation: currentItem.transformation || seed?.transformation || 'Perkembangan Renang Positif',
          quote: currentItem.quote || seed?.quote || '',
          program: currentItem.program || seed?.program || 'Class Reguler',
          photoUrl: '',
          createdAt: currentItem.createdAt || seed?.createdAt || new Date().toISOString(),
          likes: typeof currentItem.likes === 'number' ? currentItem.likes : (seed?.likes ?? 30),
          reactions: currentItem.reactions || seed?.reactions || { love: 30, swim: 18, clap: 14, fire: 12, star: 15 },
          status: currentItem.status || 'approved',
          isCustom: true,
        };

        Promise.race([
          setDoc(doc(db, 'testimonials', targetId), fullDocData, { merge: true }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000)),
        ]).catch((err) => {
          console.warn('Background Firestore delete photo notice:', err);
        });
      } catch (err) {
        console.warn('Network sync notice:', err);
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentName.trim() || !quote.trim() || isSubmitting) return;

    setIsSubmitting(true);

    // PASTIKAN SETIAP ULASAN BARU SELALU BERSTATUS 'PENDING'
    // demi keamanan reputasi dan verifikasi pendiri WAVORA
    const newReview: TestimonialItem = {
      id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      parentName: parentName.trim(),
      parentRole: childInfo.trim() ? `Orang Tua dari ${childInfo.trim()}` : 'Orang Tua Murid WAVORA',
      location,
      rating,
      transformation: transformation.trim() || `Sangat Puas dengan Progres Renang Anak (${rating} Bintang)`,
      quote: quote.trim(),
      program,
      photoUrl: photoPreview || '',
      createdAt: new Date().toISOString(),
      likes: 1,
      status: 'pending', // WAJIB PENDING
      isCustom: true,
    };

    // 1. Simpan seketika secara lokal (optimistic & non-blocking)
    const updated = [newReview, ...reviews.filter((r) => r.id !== newReview.id)];
    setReviews(updated);
    safeSetItem(LOCAL_STORAGE_KEY, JSON.stringify(sanitizeItemsForCache(updated)));

    // 2. Bersihkan form & tutup modal seketika
    setParentName('');
    setChildInfo('');
    setTransformation('');
    setQuote('');
    setPhotoPreview(null);
    setRating(5);
    setIsSubmitting(false);
    setIsWriteModalOpen(false);

    // 3. Notifikasi sukses yang jelas kepada pengirim
    showToast('Terima kasih! Ulasan Anda berhasil dikirim & berstatus PENDING untuk diverifikasi Founder WAVORA.');

    // 4. Lakukan sinkronisasi ke server / Cloud Firestore di latar belakang tanpa memblokir UI
    try {
      if (isFirestoreConfigured) {
        Promise.race([
          setDoc(doc(db, 'testimonials', newReview.id), newReview),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000)),
        ]).catch((err) => console.warn('Background Firestore save notice:', err));
      }
      fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReview),
      }).catch(() => {});
    } catch (err) {
      console.warn('Background network sync notice:', err);
    }
  };

  const handleApproveReview = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isFounderMode && !isFounderAuthenticated()) {
      showToast('Akses ditolak: Hanya Founder yang berhak menyetujui ulasan!');
      return;
    }

    // 1. Update status seketika di state lokal
    const updated = reviews.map((r) => (r.id === id ? { ...r, status: 'approved' as const } : r));
    setReviews(updated);
    safeSetItem(LOCAL_STORAGE_KEY, JSON.stringify(sanitizeItemsForCache(updated)));

    showToast('Ulasan telah DISETUJUI & resmi ditayangkan di website WAVORA!');

    // 2. Sinkronisasi latar belakang
    try {
      if (isFirestoreConfigured) {
        Promise.race([
          updateDoc(doc(db, 'testimonials', id), { status: 'approved' }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000)),
        ]).catch((err) => console.warn('Background Firestore approve notice:', err));
      }
      fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', id }),
      }).catch(() => {});
    } catch (err) {
      console.warn('Background network sync notice:', err);
    }
  };

  // EKSEKUSI HAPUS HANYA JIKA FOUNDER SUDAH LOGIN
  const handleRejectReview = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!isFounderMode && !isFounderAuthenticated()) {
      showToast('Akses ditolak: Tombol hapus hanya bisa digunakan oleh Founder!');
      return;
    }

    // Proteksi: Ulasan otentik resmi WAVORA tidak boleh terhapus secara tidak sengaja
    const isAuthentic = INITIAL_SEED_TESTIMONIALS.some((s) => s.id === id);
    if (isAuthentic) {
      showToast('Ulasan otentik resmi WAVORA dilindungi dan tidak dapat dihapus.');
      setItemToDelete(null);
      return;
    }

    // 1. Catat ID yang dihapus secara permanen
    markReviewAsDeleted(id);

    // 2. Langsung hapus dari tampilan seketika (optimistic & sinkron)
    setReviews((prev) => {
      const updated = prev.filter((r) => r.id !== id);
      safeSetItem(LOCAL_STORAGE_KEY, JSON.stringify(sanitizeItemsForCache(updated)));
      return updated;
    });

    // 3. Tutup dialog konfirmasi
    setItemToDelete(null);

    // 4. Beri notifikasi sukses
    showToast('Ulasan berhasil dihapus dari website WAVORA.');

    // 5. Sinkronisasi ke server / Cloud Firestore di latar belakang (tanpa menghambat UI)
    try {
      deleteDoc(doc(db, 'testimonials', id)).catch((err) => {
        console.warn('Background Firestore delete notice:', err);
      });
      fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', id }),
      }).catch(() => {});
    } catch (err) {
      console.warn('Network sync error:', err);
    }
  };

  // Handler reaksi emoticon interaktif tanpa batasan (semua pengunjung bebas klik kapan saja)
  const handleReactReview = async (id: string, reactionType: ReactionType, e: React.MouseEvent) => {
    e.stopPropagation();

    // Trigger visual pop animation
    setRecentReaction({ id, type: reactionType, key: Date.now() });

    // 1. Optimistic update seketika di state & storage lokal secara aman
    let targetReactions: Record<string, number> = {};
    let targetLikes = 0;

    setReviews((prev) => {
      const target = prev.find((r) => r.id === id);
      if (!target) return prev;

      targetReactions = {
        love: 20,
        swim: 10,
        clap: 8,
        fire: 6,
        star: 7,
        ...(target.reactions || {}),
      };
      const currentCount = Number(targetReactions[reactionType] || 0);
      targetReactions[reactionType] = currentCount + 1;
      targetLikes = (target.likes || 0) + 1;

      const updated = prev.map((r) =>
        r.id === id
          ? {
              ...r,
              reactions: targetReactions,
              likes: targetLikes,
            }
          : r
      );
      safeSetItem(LOCAL_STORAGE_KEY, JSON.stringify(sanitizeItemsForCache(updated)));
      return updated;
    });

    // 2. Sinkronisasi ke Cloud Firestore di latar belakang tanpa merusak reaksi lain
    if (isFirestoreConfigured) {
      try {
        const docRef = doc(db, 'testimonials', id);
        // Menggunakan dot-notation agar HANYA reactionType yang bertambah, tidak menimpa reaksi lain!
        updateDoc(docRef, {
          [`reactions.${reactionType}`]: increment(1),
          likes: increment(1),
        }).catch((err) => {
          // Jika updateDoc gagal (misalnya dokumen baru), fallback ke setDoc dengan merge map lengkap
          setDoc(
            docRef,
            {
              reactions: targetReactions,
              likes: targetLikes,
            },
            { merge: true }
          ).catch((e2) => {
            console.warn('Background reaction Firestore sync notice:', e2);
          });
        });
      } catch (err) {
        console.warn('Firestore reaction dispatch notice:', err);
      }
    }
  };

  const handleLikeReview = (id: string, e: React.MouseEvent) => {
    handleReactReview(id, 'love', e);
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = await verifyFounderPinOnServer(pinInput.trim());
    if (isValid) {
      setFounderAuthenticated(true);
      setIsFounderMode(true);
      setIsPinModalOpen(false);
      setPinInput('');
      setPinError(false);
      showToast('Mode Founder Aktif! Anda memegang kendali penuh.');
    } else {
      setPinError(true);
    }
  };

  const approvedReviews = reviews.filter((r) => r.status === 'approved');
  const pendingReviews = reviews.filter((r) => r.status === 'pending');
  const filteredReviews = reviews.filter((rev) => {
    // KEAMANAN KETAT: Jika pengunjung biasa (bukan Founder), HANYA boleh melihat ulasan yang sudah di-APPROVED!
    // Ulasan berstatus 'pending' tidak akan pernah bocor ke publik dalam kondisi filter apapun.
    if (!isFounderMode && rev.status !== 'approved') {
      return false;
    }

    if (activeFilter === 'pending') {
      return isFounderMode && rev.status === 'pending';
    }
    if (activeFilter === 'approved') {
      return rev.status === 'approved';
    }
    if (activeFilter === 'pahoman') {
      return (rev.location || '').toLowerCase().includes('pahoman') && (isFounderMode ? true : rev.status === 'approved');
    }
    if (activeFilter === 'unila') {
      return (rev.location || '').toLowerCase().includes('unila') && (isFounderMode ? true : rev.status === 'approved');
    }
    return isFounderMode ? true : rev.status === 'approved';
  });

  const avgRating = approvedReviews.length > 0 
    ? (approvedReviews.reduce((acc, curr) => acc + curr.rating, 0) / approvedReviews.length).toFixed(1)
    : '5.0';

  return (
    <section id="testimonials" className="py-24 px-4 sm:px-6 lg:px-8 bg-[#050B14] relative border-t border-slate-900 scroll-mt-20">
      <div id="testimonials-section" className="absolute -top-20 left-0 w-0 h-0 pointer-events-none" />
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 right-6 z-50 bg-slate-900 text-cyan-300 border border-cyan-500/40 px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3 font-sans text-xs sm:text-sm font-semibold max-w-md"
          >
            <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto space-y-12 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-900 pb-8">
          <div className="text-center md:text-left space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-cyan-950/80 text-cyan-400 rounded-full border border-cyan-500/30 text-xs font-mono uppercase tracking-widest">
              <UserCheck className="w-3.5 h-3.5" />
              <span>PARENT EXPERIENCE & TESTIMONIALS</span>
            </div>
            <h2 className="font-heading font-black text-3xl sm:text-5xl uppercase tracking-tight text-white">
              Kisah Sukses <span className="text-cyan-400">Orang Tua Murid.</span>
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed font-sans">
              Setiap ulasan diisi langsung oleh orang tua murid dan diverifikasi langsung oleh Founder WAVORA untuk menjamin keaslian pengalaman belajar.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            {/* BADGE KONTROL FOUNDER */}
            {isFounderMode ? (
              <div className="flex items-center gap-2 bg-amber-950/80 border border-amber-500/40 px-3 py-2 rounded-xl">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-mono text-amber-300 font-bold">Founder Control</span>
                {pendingReviews.length > 0 && (
                  <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                    {pendingReviews.length}
                  </span>
                )}
                <button
                  onClick={() => {
                    setFounderAuthenticated(false);
                    setIsFounderMode(false);
                    setActiveFilter('all');
                    showToast('Keluar dari Mode Founder. Tombol Hapus Dikunci.');
                  }}
                  className="p-1 hover:bg-rose-900/60 rounded-lg text-rose-300 transition"
                  title="Kunci Akses Founder"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsPinModalOpen(true)}
                className="p-2.5 bg-slate-900/60 hover:bg-slate-800 text-slate-500 hover:text-cyan-400 border border-slate-800 rounded-xl transition"
                title="Buka Kunci Akses Founder"
              >
                <Lock className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={() => fetchTestimonialsFromServer(true)}
              className="p-3 bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-800 rounded-xl transition"
              title="Refresh data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsWriteModalOpen(true)}
              className="px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-heading font-black uppercase text-xs tracking-wider rounded-2xl shadow-xl shadow-cyan-500/20 flex items-center gap-2.5 cursor-pointer shrink-0"
            >
              <MessageSquarePlus className="w-4.5 h-4.5" />
              <span>+ Tulis Ulasan / Kisah Anda</span>
            </motion.button>
          </div>
        </div>

        {/* Rating Metrics Card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 text-center">
          <div className="space-y-1 sm:border-r sm:border-slate-800">
            <div className="flex items-center justify-center gap-1.5 text-amber-400">
              <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
              <span className="font-heading font-black text-3xl text-white">{avgRating}</span>
              <span className="text-slate-500 text-xs font-mono">/ 5.0</span>
            </div>
            <p className="text-slate-400 text-xs font-mono uppercase tracking-wider">Rata-Rata Penilaian Orang Tua</p>
          </div>
          <div className="space-y-1 sm:border-r sm:border-slate-800">
            <p className="font-heading font-black text-3xl text-cyan-400">{approvedReviews.length}</p>
            <p className="text-slate-400 text-xs font-mono uppercase tracking-wider">Ulasan Terverifikasi & Tayang</p>
          </div>
          <div className="space-y-1">
            {isFounderMode ? (
              <>
                <p className={`font-heading font-black text-3xl ${pendingReviews.length > 0 ? 'text-amber-400 animate-pulse' : 'text-slate-500'}`}>
                  {pendingReviews.length}
                </p>
                <p className="text-amber-300 text-xs font-mono uppercase tracking-wider">Ulasan Menunggu Approval</p>
              </>
            ) : (
              <>
                <p className="font-heading font-black text-3xl text-emerald-400">100%</p>
                <p className="text-slate-400 text-xs font-mono uppercase tracking-wider">Terverifikasi & Otentik</p>
              </>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 font-mono text-xs">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2.5 rounded-xl border transition-all cursor-pointer font-bold ${
              activeFilter === 'all'
                ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-lg shadow-cyan-500/25 scale-105'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            {isFounderMode ? `SEMUA (${reviews.length})` : `SEMUA ULASAN (${approvedReviews.length})`}
          </button>
          {isFounderMode && (
            <button
              onClick={() => setActiveFilter('approved')}
              className={`px-4 py-2.5 rounded-xl border transition-all cursor-pointer font-bold ${
                activeFilter === 'approved'
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-lg shadow-cyan-500/25 scale-105'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              TAYANG PUBLIK ({approvedReviews.length})
            </button>
          )}
          {isFounderMode && (
            <button
              onClick={() => setActiveFilter('pending')}
              className={`px-4 py-2.5 rounded-xl border transition-all cursor-pointer font-bold flex items-center gap-1.5 ${
                activeFilter === 'pending'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/25 scale-105'
                  : 'bg-slate-900 text-amber-400 border-amber-500/30'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>MENUNGGU APPROVAL ({pendingReviews.length})</span>
            </button>
          )}
          <button
            onClick={() => setActiveFilter('pahoman')}
            className={`px-4 py-2.5 rounded-xl border transition-all cursor-pointer font-bold ${
              activeFilter === 'pahoman'
                ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-lg shadow-cyan-500/25 scale-105'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            KOLAM PAHOMAN
          </button>
          <button
            onClick={() => setActiveFilter('unila')}
            className={`px-4 py-2.5 rounded-xl border transition-all cursor-pointer font-bold ${
              activeFilter === 'unila'
                ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-lg shadow-cyan-500/25 scale-105'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            KOLAM UNILA
          </button>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredReviews.map((rev) => (
              <motion.div
                key={rev.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -6 }}
                className={`p-8 border rounded-3xl space-y-5 flex flex-col justify-between transition-all duration-300 shadow-xl relative group ${
                  rev.status === 'pending'
                    ? 'bg-amber-950/20 border-amber-500/40 hover:border-amber-400'
                    : 'bg-slate-900/90 border-slate-800 hover:border-cyan-500/50'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < rev.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-700 fill-slate-800'
                          }`}
                        />
                      ))}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {rev.status === 'pending' ? (
                        <div className="px-2.5 py-1 bg-amber-950/80 border border-amber-500/50 text-amber-300 rounded-full font-mono text-[10px] font-bold flex items-center gap-1 animate-pulse">
                          <Clock className="w-3 h-3" />
                          <span>MENUNGGU</span>
                        </div>
                      ) : (
                        <Quote className="w-6 h-6 text-cyan-500/20 group-hover:text-cyan-500/40 transition-colors" />
                      )}

                      {/* TOMBOL KONTROL FOUNDER (FOTO & HAPUS) */}
                      {isFounderMode && (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openPhotoModal(rev)}
                            className="p-1.5 bg-cyan-600/90 hover:bg-cyan-500 text-white rounded-full border border-cyan-400/50 transition cursor-pointer"
                            title="Unggah / Pasang / Ganti Foto Murid"
                          >
                            <Camera className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setItemToDelete(rev)}
                            className="p-1.5 bg-rose-600/80 hover:bg-rose-600 text-white rounded-full border border-rose-400/50 transition cursor-pointer"
                            title="Hapus Ulasan (Khusus Founder)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-3 bg-cyan-950/60 border border-cyan-500/30 rounded-xl text-xs font-mono text-cyan-300 font-bold leading-tight">
                    {rev.transformation}
                  </div>

                  {/* TOMBOL PASANG FOTO MURID (MODE FOUNDER) JIKA BELUM ADA FOTO */}
                  {isFounderMode && (!rev.photoUrl || rev.photoUrl.trim() === '') && (
                    <button
                      type="button"
                      onClick={() => openPhotoModal(rev)}
                      className="w-full py-3 px-4 border border-dashed border-cyan-500/50 hover:border-cyan-400 bg-cyan-950/30 hover:bg-cyan-950/60 rounded-2xl text-cyan-300 text-xs font-mono flex items-center justify-center gap-2 transition cursor-pointer group/btn"
                    >
                      <Camera className="w-4 h-4 text-cyan-400 group-hover/btn:scale-110 transition-transform" />
                      <span className="font-bold">+ Pasang Foto Dokumentasi Murid</span>
                    </button>
                  )}

                  {/* FOTO DARI ORANG TUA DENGAN LIGHTBOX HD */}
                  {rev.photoUrl && rev.photoUrl.trim() !== '' && (
                    <div
                      onClick={() => setSelectedPhotoForModal({ url: rev.photoUrl!, title: `Dokumentasi Latihan: ${rev.parentName}` })}
                      className="relative w-full h-56 sm:h-64 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800/80 hover:border-cyan-400/60 transition-all shadow-inner my-2 cursor-pointer group/photo flex items-center justify-center"
                      title="Klik untuk melihat foto ukuran penuh kualitas HD"
                    >
                      {/* Ambient reflection background so portrait photos fit seamlessly */}
                      <img
                        src={rev.photoUrl}
                        alt=""
                        aria-hidden="true"
                        referrerPolicy="no-referrer"
                        className="absolute inset-0 w-full h-full object-cover blur-xl opacity-40 scale-125 pointer-events-none"
                      />
                      <div className="absolute inset-0 bg-slate-950/25 pointer-events-none" />
                      <img
                        src={rev.photoUrl}
                        alt={`Dokumentasi ${rev.parentName}`}
                        className="relative z-10 w-full h-full object-contain object-center transition-transform duration-500 group-hover/photo:scale-105"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const seed = INITIAL_SEED_TESTIMONIALS.find((s) => s.id === rev.id);
                          if (seed?.photoUrl && e.currentTarget.src !== seed.photoUrl) {
                            e.currentTarget.src = seed.photoUrl;
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#050B14]/85 via-transparent to-transparent opacity-60 group-hover/photo:opacity-20 transition-opacity z-20 pointer-events-none" />
                      <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between pointer-events-none z-30">
                        <span className="text-[10px] font-mono text-cyan-300 bg-slate-950/90 px-2 py-0.5 rounded-md border border-cyan-500/30 flex items-center gap-1 backdrop-blur-xs">
                          <Sparkles className="w-3 h-3 text-cyan-400" />
                          <span>Dokumentasi Murid</span>
                        </span>
                        <span className="text-[10px] font-mono text-white bg-cyan-950/90 border border-cyan-500/40 px-2 py-0.5 rounded-md shadow-sm">
                          🔍 Perbesar HD
                        </span>
                      </div>
                    </div>
                  )}

                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-sans italic">
                    "{rev.quote}"
                  </p>
                </div>

                {/* KONTROL APPROVAL FOUNDER UNTUK ULASAN PENDING */}
                {rev.status === 'pending' && isFounderMode && (
                  <div className="p-3 bg-slate-950 rounded-2xl border border-amber-500/30 space-y-2">
                    <p className="text-[10px] font-mono uppercase text-amber-400 font-bold text-center">
                      MODERASI FOUNDER WAVORA
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => handleApproveReview(rev.id, e)}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Check className="w-4 h-4" />
                        <span>Setujui</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleRejectReview(rev.id, e)}
                        className="py-2 px-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                        title="Tolak"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading font-black text-base text-white group-hover:text-cyan-400 transition-colors uppercase truncate max-w-[180px]">
                      {rev.parentName}
                    </h3>
                    {rev.status === 'approved' && (
                      <div className="flex items-center gap-1 text-[10px] text-cyan-400 font-mono font-bold bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-500/30">
                        <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                        <span>APPROVED</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs font-mono text-slate-400">{rev.parentRole}</p>
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1 border-t border-slate-800/60">
                    <p className="flex items-center gap-1 text-cyan-400">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate max-w-[150px]">{rev.location}</span>
                    </p>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {rev.program || 'WAVORA Swimming'}
                    </span>
                  </div>

                  {/* REAKSI EMOTICON INTERAKTIF (BEBAS DIKLIK OLEH SEMUA ORANG TANPA BATASAN) */}
                  {rev.status === 'approved' && (
                    <div className="pt-2.5 border-t border-slate-800/80 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                          <span>Kirim Respon & Semangat:</span>
                        </span>
                        <span className="text-cyan-400 text-[9px] font-semibold bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/20">
                          Bebas Klik
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                        {REACTION_CONFIGS.map((cfg) => {
                          const reactionsMap = rev.reactions || {};
                          const count = reactionsMap[cfg.type] !== undefined 
                            ? reactionsMap[cfg.type] 
                            : (cfg.type === 'love' ? (rev.likes || 0) : 0);
                          const isJustClicked = recentReaction?.id === rev.id && recentReaction?.type === cfg.type;

                          return (
                            <motion.button
                              key={cfg.type}
                              type="button"
                              whileHover={{ scale: 1.15, y: -2 }}
                              whileTap={{ scale: 0.85 }}
                              animate={isJustClicked ? { scale: [1, 1.35, 1] } : {}}
                              transition={{ duration: 0.25 }}
                              onClick={(e) => handleReactReview(rev.id, cfg.type, e)}
                              className={`px-2.5 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer select-none active:scale-90 ${
                                count > 0
                                  ? cfg.activeColor
                                  : 'bg-slate-950/80 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white'
                              }`}
                              title={`Klik untuk kirim reaksi ${cfg.label} (${cfg.emoji}) tanpa batasan`}
                            >
                              <span className="text-sm leading-none filter drop-shadow-sm">{cfg.emoji}</span>
                              <span className="text-[11px] font-mono font-bold">{count}</span>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            {filteredReviews.length === 0 && (
              <div className="col-span-full py-16 text-center space-y-4 bg-slate-900/40 rounded-3xl border border-slate-800/80 p-8">
                <Clock className="w-10 h-10 text-slate-600 mx-auto" />
                <div className="space-y-1">
                  <p className="text-slate-300 font-heading font-bold text-base uppercase">
                    {activeFilter === 'pending'
                      ? 'Tidak Ada Ulasan Menunggu Persetujuan'
                      : 'Belum Ada Ulasan untuk Kategori Ini'}
                  </p>
                  <p className="text-slate-500 text-xs font-mono">
                    {activeFilter === 'pending'
                      ? 'Semua ulasan telah ditinjau & diverifikasi oleh Founder.'
                      : 'Ulasan baru akan tayang setelah diverifikasi oleh Founder WAVORA.'}
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => fetchTestimonialsFromServer(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-950/80 hover:bg-cyan-900/80 text-cyan-400 border border-cyan-500/30 hover:border-cyan-400 rounded-xl text-xs font-mono font-bold uppercase transition cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>Sinkronkan Ulasan dari Firebase Console</span>
                  </button>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* MODAL INPUT ULASAN DENGAN KAMERA & GALERI HP */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {isWriteModalOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-[#050B14]/90 backdrop-blur-md flex items-start justify-center p-4 sm:p-6 overflow-y-auto pt-20 sm:pt-24 pb-12"
                onClick={() => setIsWriteModalOpen(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  onClick={(e) => e.stopPropagation()}
                  className="relative max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-auto"
                >
              <button
                onClick={() => setIsWriteModalOpen(false)}
                className="absolute top-5 right-5 p-2 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white rounded-full border border-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest">
                  <MessageSquarePlus className="w-4 h-4" />
                  <span>PARENT EXPERIENCE FORM</span>
                </div>
                <h3 className="font-heading font-black text-2xl text-white uppercase">
                  Bagikan Kisah Sukses & Ulasan Anda
                </h3>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="space-y-2 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
                  <label className="text-xs font-mono uppercase text-slate-300 font-bold block">
                    Beri Rating Bintang Pengalaman Anda *
                  </label>
                  <div className="flex items-center justify-center gap-2 py-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                        className="p-1 transition-transform transform hover:scale-125 cursor-pointer"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            star <= (hoverRating || rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-700 fill-slate-800'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase text-slate-300 font-semibold block">
                      Nama Orang Tua / Wali *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Bunda Rina / Papi Andre"
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase text-slate-300 font-semibold block">
                      Nama & Usia Anak (Opsional)
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Alfarizi (8 Tahun)"
                      value={childInfo}
                      onChange={(e) => setChildInfo(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase text-slate-300 font-semibold block">Lokasi Kolam *</label>
                    <select
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl text-xs text-white focus:outline-none"
                    >
                      <option value="Kolam Pahoman, Bandar Lampung">Kolam Pahoman, Bandar Lampung</option>
                      <option value="Kolam UNILA, Bandar Lampung">Kolam UNILA, Bandar Lampung</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase text-slate-300 font-semibold block">Program *</label>
                    <select
                      value={program}
                      onChange={(e) => setProgram(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl text-xs text-white focus:outline-none"
                    >
                      <option value="Class Reguler">Class Reguler</option>
                      <option value="Class Privat 1-on-1">Class Privat 1-on-1</option>
                      <option value="Paket Twins Reguler">Paket Twins Reguler</option>
                      <option value="Squad Kompetisi">Squad Kompetisi</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase text-slate-300 font-semibold block">
                    Judul Transformasi (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Dari Takut Celup Wajah Jadi Berani Loncat & Juara Lomba!"
                    value={transformation}
                    onChange={(e) => setTransformation(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase text-slate-300 font-semibold block">
                    Kisah Sukses & Ulasan Jujur Anda *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Ceritakan pengalaman Anda bersama pelatih WAVORA..."
                    value={quote}
                    onChange={(e) => setQuote(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none resize-none leading-relaxed"
                  />
                </div>

                {/* DUAL ACTION: UPLOAD FOTO DARI GALERI & KAMERA */}
                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase text-slate-300 font-semibold flex items-center justify-between">
                    <span>Foto Kenangan Latihan (Opsional)</span>
                    <span className="text-cyan-400 text-[10px]">Langsung dari HP</span>
                  </label>

                  {photoPreview ? (
                    <div className="relative w-full rounded-2xl overflow-hidden border border-cyan-500/40 bg-slate-950 p-3 space-y-3 shadow-2xl">
                      {/* BINGKAI FOTO PRESISI YANG MENYESUAIKAN DENGAN RAPI */}
                      <div className={`relative transition-all duration-300 ${
                        photoFitMode === 'adaptive' && photoMeta?.isPortrait 
                          ? 'max-w-[270px] sm:max-w-[300px] mx-auto' 
                          : 'w-full'
                      }`}>
                        <div
                          className={`relative w-full rounded-xl overflow-hidden border border-cyan-500/30 bg-slate-900/80 shadow-inner flex items-center justify-center transition-all duration-300 ${
                            photoFitMode === 'cover'
                              ? 'h-[280px] sm:h-[330px]'
                              : photoFitMode === 'ambient'
                              ? 'h-[280px] sm:h-[330px]'
                              : 'min-h-[220px] max-h-[380px]'
                          }`}
                        >
                          {/* Ambient reflection background for ambient mode */}
                          {photoFitMode === 'ambient' && (
                            <>
                              <img
                                src={photoPreview}
                                alt=""
                                aria-hidden="true"
                                className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-45 scale-125 pointer-events-none"
                              />
                              <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs pointer-events-none" />
                            </>
                          )}

                          {/* The Main Photo */}
                          <img
                            src={photoPreview}
                            alt="Preview Foto HD"
                            className={`transition-all duration-300 ${
                              photoFitMode === 'cover'
                                ? `w-full h-full object-cover ${
                                    photoFocusY === 'top'
                                      ? 'object-top'
                                      : photoFocusY === 'bottom'
                                      ? 'object-bottom'
                                      : 'object-center'
                                  }`
                                : photoFitMode === 'ambient'
                                ? 'relative z-10 max-h-[92%] max-w-[92%] object-contain rounded-lg shadow-2xl border border-white/10'
                                : 'w-full h-auto max-h-[380px] object-contain rounded-xl block'
                            }`}
                          />

                          {/* Tombol Hapus Foto */}
                          <button
                            type="button"
                            onClick={() => {
                              setPhotoPreview(null);
                              setPhotoMeta(null);
                            }}
                            className="absolute top-2.5 right-2.5 p-2 bg-rose-600 hover:bg-rose-500 text-white rounded-full transition cursor-pointer shadow-lg z-20"
                            title="Hapus Foto"
                          >
                            <X className="w-4 h-4" />
                          </button>

                          {/* Badge Mode Aktif */}
                          <div className="absolute bottom-2 left-2.5 z-20 pointer-events-none">
                            <span className="text-[9px] font-mono font-bold text-cyan-300 bg-slate-950/90 border border-cyan-500/40 px-2 py-0.5 rounded-md backdrop-blur-xs shadow-md">
                              {photoFitMode === 'adaptive'
                                ? '📐 Bingkai Pas Foto'
                                : photoFitMode === 'cover'
                                ? '🔲 Pas Penuh Bingkai'
                                : '✨ Ambient Glow'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* BILAH KONTROL PENYESUAIAN BINGKAI AGAR RAPI */}
                      <div className="space-y-2 pt-1 border-t border-slate-900">
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                            Sesuaikan Bingkai:
                          </span>
                          <span className="text-[10px] text-cyan-400">
                            {photoMeta?.isPortrait ? 'Rasio HP Potret (3:4)' : 'Rasio Lansekap'}
                          </span>
                        </div>

                        {/* Segmented Mode Toggle */}
                        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-900/90 rounded-xl border border-slate-800 text-[11px] font-mono">
                          <button
                            type="button"
                            onClick={() => setPhotoFitMode('adaptive')}
                            className={`py-1.5 px-2 rounded-lg transition flex items-center justify-center gap-1 cursor-pointer ${
                              photoFitMode === 'adaptive'
                                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                            title="Bingkai otomatis menyesuaikan ukuran foto tanpa ada celah hitam kosong"
                          >
                            <Minimize2 className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">Bingkai Pas</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setPhotoFitMode('cover')}
                            className={`py-1.5 px-2 rounded-lg transition flex items-center justify-center gap-1 cursor-pointer ${
                              photoFitMode === 'cover'
                                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                            title="Foto mengisi penuh seluruh bingkai secara rapi"
                          >
                            <Maximize2 className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">Isi Penuh</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setPhotoFitMode('ambient')}
                            className={`py-1.5 px-2 rounded-lg transition flex items-center justify-center gap-1 cursor-pointer ${
                              photoFitMode === 'ambient'
                                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                            title="Efek pantulan air lembut di sisi foto tanpa celah hitam mati"
                          >
                            <Sparkles className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">Ambient</span>
                          </button>
                        </div>

                        {/* Fokus Posisi Jika Mode Isi Penuh (Cover) */}
                        {photoFitMode === 'cover' && (
                          <div className="flex items-center justify-between px-2.5 py-1.5 bg-slate-900/60 rounded-xl border border-slate-800/80 text-[11px] font-mono">
                            <span className="text-slate-400 flex items-center gap-1 text-[10px]">
                              <Move className="w-3 h-3 text-cyan-400" />
                              Fokus Posisi:
                            </span>
                            <div className="flex items-center gap-1">
                              {(['top', 'center', 'bottom'] as const).map((pos) => (
                                <button
                                  key={pos}
                                  type="button"
                                  onClick={() => setPhotoFocusY(pos)}
                                  className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold transition cursor-pointer ${
                                    photoFocusY === pos
                                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50'
                                      : 'text-slate-400 hover:text-white'
                                  }`}
                                >
                                  {pos === 'top' ? 'Wajah (Atas)' : pos === 'center' ? 'Tengah' : 'Bawah'}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Baris Tombol Aksi: Putar 90 & Ganti Foto */}
                        <div className="flex items-center justify-between pt-1 text-[11px] font-mono">
                          <button
                            type="button"
                            onClick={handleRotatePhoto}
                            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 rounded-lg transition flex items-center gap-1.5 cursor-pointer text-[10px]"
                            title="Putar orientasi foto 90 derajat searah jarum jam"
                          >
                            <RotateCw className="w-3 h-3" />
                            <span>Putar 90°</span>
                          </button>

                          <div className="flex items-center gap-3">
                            <label className="text-slate-300 hover:text-cyan-400 font-semibold cursor-pointer underline text-[11px]">
                              Ganti Foto
                              <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <label className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-slate-800 hover:border-cyan-400 bg-slate-950/60 hover:bg-slate-900/60 cursor-pointer transition text-center group">
                        <div className="p-2.5 rounded-xl bg-slate-900 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-slate-950 transition mb-1">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-white">Buka Galeri</span>
                        <span className="text-[10px] text-slate-400 font-mono">Pilih Foto Anak</span>
                        <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                      </label>

                      <label className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-slate-800 hover:border-cyan-400 bg-slate-950/60 hover:bg-slate-900/60 cursor-pointer transition text-center group">
                        <div className="p-2.5 rounded-xl bg-slate-900 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-slate-950 transition mb-1">
                          <Camera className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-white">Ambil Foto</span>
                        <span className="text-[10px] text-slate-400 font-mono">Kamera Langsung</span>
                        <input type="file" accept="image/*" capture="environment" onChange={handlePhotoChange} className="hidden" />
                      </label>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!parentName.trim() || !quote.trim() || isSubmitting}
                  className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-heading font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>{isSubmitting ? 'Mengirim Ulasan...' : 'Kirim Ulasan Orang Tua'}</span>
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
    )}

      {/* MODAL VERIFIKASI PIN FOUNDER (UNTUK MEMBUKA KUNCI HAPUS) */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {isPinModalOpen && (
              <div className="fixed inset-0 z-[100] bg-[#050B14]/90 backdrop-blur-md flex items-center justify-center p-4">
                <div className="relative max-w-sm w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center space-y-4 shadow-2xl">
                  <Key className="w-8 h-8 text-amber-400 mx-auto" />
                  <div className="space-y-1">
                    <h3 className="font-heading font-black text-xl text-white uppercase">Akses Founder WAVORA</h3>
                    <p className="text-slate-400 text-xs">Masukkan PIN Founder untuk membuka akses hapus & moderasi ulasan.</p>
                  </div>
                  <form onSubmit={handlePinSubmit} className="space-y-3">
                    <input
                      type="password"
                      required
                      placeholder="Masukkan PIN Founder"
                      value={pinInput}
                      onChange={(e) => {
                        setPinInput(e.target.value);
                        setPinError(false);
                      }}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl text-center text-xs font-mono text-white placeholder-slate-600 focus:outline-none"
                    />
                    {pinError && <p className="text-rose-400 text-xs font-mono">PIN Founder Salah</p>}
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setIsPinModalOpen(false)} className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl transition cursor-pointer">Batal</button>
                      <button type="submit" className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition cursor-pointer">Masuk</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}

      {/* MODAL KONFIRMASI HAPUS (HANYA MUNCUL JIKA SUDAH LOGIN FOUNDER) */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {itemToDelete && (
              <div className="fixed inset-0 z-[100] bg-[#050B14]/90 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setItemToDelete(null)}>
                <div className="relative max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center space-y-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                  <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto" />
                  <h3 className="font-heading font-black text-xl text-white uppercase">Hapus Ulasan Ini?</h3>
                  <p className="text-slate-300 text-xs">Apakah Anda yakin ingin menghapus ulasan dari "{itemToDelete.parentName}"?</p>
                  <div className="flex gap-3">
                    <button 
                      type="button" 
                      onClick={() => setItemToDelete(null)} 
                      className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl font-bold transition cursor-pointer"
                    >
                      Batal
                    </button>
                    <button 
                      type="button" 
                      onClick={() => { 
                        const idToDelete = itemToDelete.id;
                        handleRejectReview(idToDelete); 
                      }} 
                      className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white text-xs rounded-xl font-bold transition cursor-pointer shadow-lg shadow-rose-950/50"
                    >
                      Ya, Hapus
                    </button>
                  </div>
                </div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}

      {/* MODAL LIGHTBOX FOTO HD FULL SCREEN */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {selectedPhotoForModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedPhotoForModal(null)}
                className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-lg flex items-center justify-center p-4 sm:p-8 cursor-zoom-out"
              >
                <motion.div
                  initial={{ scale: 0.92, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.92, opacity: 1 }}
                  onClick={(e) => e.stopPropagation()}
                  className="relative max-w-4xl w-full flex flex-col items-center justify-center cursor-default"
                >
                  <button
                    type="button"
                    onClick={() => setSelectedPhotoForModal(null)}
                    className="absolute -top-12 right-0 p-2 px-3 bg-slate-900/90 hover:bg-rose-600 text-white rounded-full border border-slate-700 transition cursor-pointer flex items-center gap-1.5 text-xs font-mono shadow-xl"
                  >
                    <X className="w-4 h-4" />
                    <span>Tutup</span>
                  </button>
                  <div className="relative w-full rounded-3xl overflow-hidden border border-cyan-500/40 shadow-2xl bg-slate-950">
                    <img
                      src={selectedPhotoForModal.url}
                      alt={selectedPhotoForModal.title}
                      className="w-full max-h-[75vh] object-contain mx-auto bg-black/60"
                    />
                    <div className="p-4 bg-slate-900/95 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                      <span className="text-white font-bold truncate max-w-md">{selectedPhotoForModal.title}</span>
                      <span className="text-cyan-400 flex items-center gap-1.5 shrink-0">
                        <Sparkles className="w-4 h-4" />
                        Kualitas HD Jernih
                      </span>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}

      {/* MODAL PASANG / UBAH FOTO DOKUMENTASI MURID (MODE FOUNDER) */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {photoAttachTarget && (
              <div
                className="fixed inset-0 z-[100] bg-[#050B14]/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
                onClick={() => {
                  setIsSavingPhoto(false);
                  setPhotoAttachTarget(null);
                  setAttachPhotoPreview(null);
                }}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={(e) => e.stopPropagation()}
                  className="relative max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 my-8"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-cyan-950 text-cyan-400 rounded-xl border border-cyan-500/30">
                        <Camera className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-heading font-black text-base text-white uppercase">
                          Pasang Foto Dokumentasi
                        </h3>
                        <p className="text-slate-400 text-xs font-mono">
                          Khusus Founder & Admin WAVORA
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsSavingPhoto(false);
                        setPhotoAttachTarget(null);
                        setAttachPhotoPreview(null);
                      }}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
                      title="Tutup"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* INFO SASARAN ULASAN */}
                  <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800/80 space-y-1">
                    <p className="text-xs font-bold text-white uppercase">
                      {photoAttachTarget.parentName}
                    </p>
                    <p className="text-[11px] font-mono text-cyan-400">
                      {photoAttachTarget.parentRole} • {photoAttachTarget.location}
                    </p>
                    <p className="text-slate-400 text-xs italic line-clamp-2 pt-1 border-t border-slate-900">
                      "{photoAttachTarget.quote}"
                    </p>
                  </div>

                  {/* PREVIEW ATAU INPUT FOTO */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-300 block">
                      Pilih Foto Dokumentasi Latihan Anak:
                    </label>

                    {isProcessingPhoto ? (
                      <div className="w-full h-52 rounded-2xl bg-slate-950 border border-cyan-500/40 flex flex-col items-center justify-center gap-3 p-6 text-center">
                        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                        <p className="text-xs font-bold text-white">Memproses Foto Kualitas HD...</p>
                        <p className="text-[10px] text-slate-400 font-mono">Mengoptimalkan ukuran agar langsung tayang</p>
                      </div>
                    ) : attachPhotoPreview ? (
                      <div className="space-y-3">
                        <div className="relative w-full h-52 rounded-2xl overflow-hidden bg-slate-950 border border-cyan-500/40 shadow-inner flex items-center justify-center">
                          <img
                            src={attachPhotoPreview}
                            alt="Preview Foto"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs font-mono">
                          <button
                            type="button"
                            onClick={handleRotateAttachPhoto}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-xl transition flex items-center gap-1.5 cursor-pointer text-xs"
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                            <span>Putar 90°</span>
                          </button>

                          <div className="flex items-center gap-2">
                            <label className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition cursor-pointer text-xs font-bold">
                              Ganti Foto
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleAttachPhotoChange}
                                className="sr-only"
                              />
                            </label>

                            {photoAttachTarget.photoUrl && (
                              <button
                                type="button"
                                onClick={handleDeleteAttachedPhoto}
                                disabled={isSavingPhoto}
                                className="p-1.5 text-rose-400 hover:bg-rose-950/40 rounded-xl transition cursor-pointer"
                                title="Hapus foto dari ulasan ini"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        <label className="flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed border-slate-800 hover:border-cyan-400 bg-slate-950/60 hover:bg-slate-900/60 cursor-pointer transition text-center group">
                          <div className="p-3 rounded-xl bg-slate-900 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-slate-950 transition mb-2">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                          <span className="text-xs font-bold text-white">Buka Galeri</span>
                          <span className="text-[10px] text-slate-400 font-mono">Pilih dari HP / Laptop</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAttachPhotoChange}
                            className="sr-only"
                          />
                        </label>

                        <label className="flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed border-slate-800 hover:border-cyan-400 bg-slate-950/60 hover:bg-slate-900/60 cursor-pointer transition text-center group">
                          <div className="p-3 rounded-xl bg-slate-900 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-slate-950 transition mb-2">
                            <Camera className="w-5 h-5" />
                          </div>
                          <span className="text-xs font-bold text-white">Kamera HP</span>
                          <span className="text-[10px] text-slate-400 font-mono">Foto Langsung</span>
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handleAttachPhotoChange}
                            className="sr-only"
                          />
                        </label>
                      </div>
                    )}
                  </div>

                  <div className="p-3 bg-cyan-950/40 border border-cyan-500/30 rounded-xl text-[11px] font-sans text-cyan-200 leading-relaxed">
                    💡 <strong>Tips Founder:</strong> Foto akan langsung dioptimalkan secara otomatis (kualitas HD tajam & jernih, ukuran aman untuk Cloud Firestore) sehingga langsung tayang untuk semua pengunjung.
                  </div>

                  {/* AKSI SIMPAN */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsSavingPhoto(false);
                        setPhotoAttachTarget(null);
                        setAttachPhotoPreview(null);
                      }}
                      className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      disabled={!attachPhotoPreview || isSavingPhoto || isProcessingPhoto}
                      onClick={handleSaveAttachedPhoto}
                      className="flex-1 py-3 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-heading font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
                    >
                      {isSavingPhoto ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Menyimpan...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Simpan Foto ke Cloud</span>
                        </>
                      )}
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
