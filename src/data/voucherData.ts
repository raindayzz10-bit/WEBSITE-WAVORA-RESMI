import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db, isFirestoreConfigured } from '../lib/firebase';

export interface VoucherCode {
  code: string;
  title: string;
  discountAmount: number;
  description: string;
  minSessions?: 4 | 8;
  badgeText?: string;
  active: boolean; // boolean field in voucher database schema
  isActive?: boolean; // alias for backwards compatibility
}

export const DEFAULT_VOUCHERS: VoucherCode[] = [
  {
    code: 'WAVORA50',
    title: 'Diskon Pendaftaran WAVORA',
    discountAmount: 50000,
    description: 'Potongan langsung Rp 50.000 untuk semua program latihan',
    badgeText: 'Diskon Rp 50.000',
    active: true,
    isActive: true,
  },
  {
    code: 'JUARA100',
    title: 'Voucher Prestasi JUARA100',
    discountAmount: 100000,
    description: 'Khusus Kelas Reguler (8 sesi), Kelas Privat (8 sesi), dan WCT (16 sesi)',
    minSessions: 8,
    badgeText: 'Diskon Rp 100.000',
    active: false, // Dinonaktifkan sementara (dapat diaktifkan kembali kapan saja via Akses Founder)
    isActive: false,
  },
  {
    code: 'EARLYBIRD',
    title: 'Voucher Early Bird 2026',
    discountAmount: 50000,
    description: 'Potongan Rp 50.000 khusus pendaftaran gelombang awal',
    badgeText: 'Diskon Rp 50.000',
    active: true,
    isActive: true,
  },
  {
    code: 'PRESTASI50',
    title: 'Voucher Seleksi Squad Prestasi',
    discountAmount: 50000,
    description: 'Potongan Rp 50.000 untuk atlet binaan berprestasi',
    badgeText: 'Diskon Rp 50.000',
    active: true,
    isActive: true,
  },
  {
    code: 'BUDDYSQUAD',
    title: 'Promo Wavora Buddy Squad (2-4 Atlet)',
    discountAmount: 100000,
    description: 'Potongan spesial pendaftaran kolektif 2-4 atlet bersama kawan/saudara',
    badgeText: 'Diskon Rp 100.000',
    active: true,
    isActive: true,
  },
];

const STORAGE_KEY = 'wavora_vouchers_list';
const FIRESTORE_COLLECTION = 'system_settings';
const FIRESTORE_DOC = 'vouchers';

/**
 * Checks if JUARA100 is strictly eligible.
 * ONLY allowed for:
 * 1. Kelas Reguler with 8 sessions
 * 2. Kelas Privat with 8 sessions
 * 3. Wavora Competition Team (WCT / prestasi) with 16 sessions
 * All other classes and session counts are strictly forbidden.
 */
export function isJuara100Eligible(classType?: string, sessions?: number): boolean {
  if (!classType || !sessions) return false;
  const c = classType.trim().toLowerCase();
  if (c === 'reguler' && sessions === 8) return true;
  if (c === 'privat' && sessions === 8) return true;
  if ((c === 'prestasi' || c === 'wct') && sessions === 16) return true;
  return false;
}

export function getAllVouchers(): VoucherCode[] {
  if (typeof window === 'undefined') return DEFAULT_VOUCHERS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_VOUCHERS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((v) => {
        const isActiveVal =
          v.active !== undefined ? Boolean(v.active) : v.isActive !== undefined ? Boolean(v.isActive) : true;
        const item: VoucherCode = {
          ...v,
          active: isActiveVal,
          isActive: isActiveVal,
        };
        if (v.code.toUpperCase() === 'JUARA100') {
          item.description = 'Khusus Kelas Reguler (8 sesi), Kelas Privat (8 sesi), dan WCT (16 sesi)';
        }
        return item;
      });
    }
  } catch (e) {
    console.warn('Error reading saved vouchers:', e);
  }
  return DEFAULT_VOUCHERS;
}

/**
 * Filter and return only active vouchers (where active !== false)
 */
export function getActiveVouchers(): VoucherCode[] {
  return getAllVouchers().filter((v) => v.active !== false && v.isActive !== false);
}

export function saveVouchers(vouchers: VoucherCode[]) {
  if (typeof window === 'undefined') return;
  try {
    // Ensure both active and isActive fields are synchronized
    const normalized = vouchers.map((v) => {
      const isActiveVal =
        v.active !== undefined ? Boolean(v.active) : v.isActive !== undefined ? Boolean(v.isActive) : true;
      return {
        ...v,
        active: isActiveVal,
        isActive: isActiveVal,
      };
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    // Trigger local update event for current browser window
    window.dispatchEvent(new CustomEvent('wavora_vouchers_updated', { detail: normalized }));
  } catch (e) {
    console.warn('Error saving vouchers locally:', e);
  }

  // Real-time Cloud Firestore sync
  if (isFirestoreConfigured && db) {
    try {
      const docRef = doc(db, FIRESTORE_COLLECTION, FIRESTORE_DOC);
      setDoc(
        docRef,
        {
          vouchers,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      ).catch((err) => {
        console.warn('Firestore voucher sync notice:', err);
      });
    } catch (err) {
      console.warn('Firestore voucher save error:', err);
    }
  }
}

/**
 * Toggle active status of a voucher (temporary on/off)
 */
export function toggleVoucherStatus(code: string, targetState?: boolean): VoucherCode[] {
  const all = getAllVouchers();
  const formattedCode = code.trim().toUpperCase();
  const updated = all.map((v) => {
    if (v.code.toUpperCase() === formattedCode) {
      const currentActive = v.active !== undefined ? v.active : v.isActive !== false;
      const nextActive = targetState !== undefined ? targetState : !currentActive;
      return {
        ...v,
        active: nextActive,
        isActive: nextActive,
      };
    }
    return v;
  });

  saveVouchers(updated);
  return updated;
}

/**
 * Subscribes to vouchers updates from Firestore & local events
 */
export function subscribeToVouchers(callback: (vouchers: VoucherCode[]) => void): () => void {
  // 1. Initial callback with cached/default data
  callback(getAllVouchers());

  // 2. Local window event listener
  const handleLocalUpdate = (e: Event) => {
    const custom = e as CustomEvent<VoucherCode[]>;
    if (custom.detail) {
      callback(custom.detail);
    } else {
      callback(getAllVouchers());
    }
  };

  const handleStorageUpdate = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      callback(getAllVouchers());
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('wavora_vouchers_updated', handleLocalUpdate);
    window.addEventListener('storage', handleStorageUpdate);
  }

  // 3. Firestore onSnapshot real-time sync across devices
  let unsubscribeFirestore: (() => void) | null = null;
  if (isFirestoreConfigured && db) {
    try {
      const docRef = doc(db, FIRESTORE_COLLECTION, FIRESTORE_DOC);
      unsubscribeFirestore = onSnapshot(
        docRef,
        (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            if (Array.isArray(data.vouchers) && data.vouchers.length > 0) {
              const remoteList: VoucherCode[] = data.vouchers;
              try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteList));
              } catch {
                // ignore localstorage write err
              }
              callback(remoteList);
            }
          }
        },
        (err) => {
          console.warn('Firestore vouchers subscription notice:', err);
        }
      );
    } catch (err) {
      console.warn('Firestore subscription setup notice:', err);
    }
  }

  return () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('wavora_vouchers_updated', handleLocalUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
    }
    if (unsubscribeFirestore) {
      unsubscribeFirestore();
    }
  };
}

export interface VoucherValidationResult {
  valid: boolean;
  voucher?: VoucherCode;
  errorMessage?: string;
}

export function validateVoucherCode(
  inputCode: string,
  selectedSessions: 4 | 8 | 16 | number,
  selectedClassType?: string
): VoucherValidationResult {
  const clean = inputCode.trim().toUpperCase();
  if (!clean) {
    return { valid: false, errorMessage: 'Masukkan kode voucher terlebih dahulu.' };
  }

  const all = getAllVouchers();
  const found = all.find((v) => v.code.toUpperCase() === clean);

  if (!found) {
    return {
      valid: false,
      errorMessage: 'Kode voucher tidak valid atau belum terdaftar di sistem WAVORA.',
    };
  }

  if (found.active === false || found.isActive === false) {
    return {
      valid: false,
      voucher: found,
      errorMessage: `Voucher "${found.code}" sedang dinonaktifkan sementara oleh manajemen Wavora. Nantikan periode promo berikutnya!`,
    };
  }

  // Strict Rule for JUARA100:
  // Hanya bisa digunakan untuk Kelas Reguler 8x, Kelas Privat 8x, dan WCT 16x
  if (clean === 'JUARA100') {
    if (selectedClassType) {
      if (!isJuara100Eligible(selectedClassType, selectedSessions)) {
        return {
          valid: false,
          voucher: found,
          errorMessage:
            'Voucher JUARA100 hanya dapat digunakan untuk Kelas Reguler (8 sesi), Kelas Privat (8 sesi), dan WCT (16 sesi). Pilihan paket atau sesi Anda saat ini tidak memenuhi syarat.',
        };
      }
    } else {
      // If classType is not provided, sessions must at least be 8 or 16
      if (selectedSessions !== 8 && selectedSessions !== 16) {
        return {
          valid: false,
          voucher: found,
          errorMessage:
            'Voucher JUARA100 hanya dapat digunakan untuk Kelas Reguler (8 sesi), Kelas Privat (8 sesi), dan WCT (16 sesi).',
        };
      }
    }
  } else if (found.minSessions && selectedSessions < found.minSessions) {
    return {
      valid: false,
      voucher: found,
      errorMessage: `Voucher ${found.code} hanya berlaku untuk paket minimal ${found.minSessions} sesi. Silakan ubah paket ke ${found.minSessions}x sesi.`,
    };
  }

  return {
    valid: true,
    voucher: found,
  };
}
