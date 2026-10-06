import {
  collection,
  query,
  orderBy,
  onSnapshot,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  Unsubscribe,
  Timestamp,
} from 'firebase/firestore';
import { db, isFirestoreConfigured } from '../lib/firebase';
import { RegistrationRecord, RegistrationStatus, PoolLocationId } from '../types';

/**
 * WOS Real-Time Registration Data Service
 * Decoupled Cloud Firestore v10+ subscription service with guaranteed cleanup.
 * Collection: 'registrations'
 */

const COLLECTION_NAME = 'registrations';
const LOCAL_STORAGE_KEY = 'wavora_registrations_store_v1';

// Seed authentic registrations for initial state & resilient local fallback
export const SEED_REGISTRATIONS: RegistrationRecord[] = [
  {
    id: 'WVR-2026-4821',
    ticketCode: 'WVR-2026-4821',
    athleteName: 'Muhammad Rayyan Al-Farizi',
    age: 7,
    gender: 'Laki-laki',
    parentName: 'Bpk. Kurniawan Al-Farizi',
    whatsapp: '08127891234',
    email: 'kurniawan.af@gmail.com',
    programCategory: 'Class Reguler • 8x Sesi',
    classType: 'reguler',
    sessions: 8,
    location: 'pahoman',
    preferredDay: 'Sabtu & Minggu',
    totalEstimate: 500000,
    waterExperience: 'Bisa Mengapung',
    medicalNotes: 'Tidak ada riwayat asma',
    status: 'verified',
    createdAt: '2026-03-02T08:30:00.000Z',
  },
  {
    id: 'WVR-2026-4822',
    ticketCode: 'WVR-2026-4822',
    athleteName: 'Aisyah Putri Azzahra',
    age: 5,
    gender: 'Perempuan',
    parentName: 'Ibu Ratna Dewi',
    whatsapp: '08136987452',
    email: 'ratnadewi.w@yahoo.com',
    programCategory: 'Class Privat (1-on-1) • 8x Sesi',
    classType: 'privat',
    sessions: 8,
    location: 'unila',
    preferredDay: 'Senin & Kamis (Sore)',
    totalEstimate: 1000000,
    waterExperience: 'Takut Air (Trauma Kolam Dalam)',
    medicalNotes: 'Sensitif mata klorin (butuh goggle silikon lembut)',
    status: 'verified',
    createdAt: '2026-03-01T15:45:00.000Z',
  },
  {
    id: 'WVR-2026-4823',
    ticketCode: 'WVR-2026-4823',
    athleteName: 'Kenzo Raditya Pratama',
    age: 6,
    gender: 'Laki-laki',
    parentName: 'Bpk. Dimas Pratama',
    whatsapp: '082188443322',
    email: 'dimas.pratama@gmail.com',
    programCategory: 'Class Reguler • 4x Sesi',
    classType: 'reguler',
    sessions: 4,
    location: 'pahoman',
    preferredDay: 'Sabtu Pagi (07:30)',
    totalEstimate: 300000,
    waterExperience: 'Belum Pernah',
    medicalNotes: '-',
    status: 'pending',
    createdAt: '2026-03-03T09:15:00.000Z',
  },
  {
    id: 'WVR-2026-4824',
    ticketCode: 'WVR-2026-4824',
    athleteName: 'Zhafira Callista & Zahran (Twins)',
    age: 8,
    gender: 'Perempuan',
    parentName: 'Ibu Nadia Salsabila',
    whatsapp: '085211998877',
    email: 'nadia.salsa@gmail.com',
    programCategory: 'Paket Twins Reguler • 8x Sesi',
    classType: 'twins_reguler',
    sessions: 8,
    location: 'pahoman',
    preferredDay: 'Minggu Pagi',
    totalEstimate: 900000,
    waterExperience: 'Bisa Berenang Dasar',
    medicalNotes: 'Target persiapan lomba sekolah',
    status: 'pending',
    createdAt: '2026-03-03T11:20:00.000Z',
  },
  {
    id: 'WVR-2026-4825',
    ticketCode: 'WVR-2026-4825',
    athleteName: 'Arkan Atharizz',
    age: 9,
    gender: 'Laki-laki',
    parentName: 'Bpk. Hendra Wijaya',
    whatsapp: '081299887766',
    email: 'hendrawijaya@gmail.com',
    programCategory: 'Class Privat (1-on-1) • 4x Sesi',
    classType: 'privat',
    sessions: 4,
    location: 'unila',
    preferredDay: 'Jumat Sore',
    totalEstimate: 600000,
    waterExperience: 'Ingin Prestasi',
    medicalNotes: 'Fokus biomekanika gaya dada & flip-turn',
    status: 'pending',
    createdAt: '2026-03-04T07:45:00.000Z',
  },
];

function calculateAge(birthDateStr?: string): number {
  if (!birthDateStr) return 7;
  try {
    const birth = new Date(birthDateStr);
    if (isNaN(birth.getTime())) return 7;
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
      age--;
    }
    return age > 0 && age < 80 ? age : 7;
  } catch {
    return 7;
  }
}

export function normalizeRegistrationRecord(id: string, raw: any): RegistrationRecord {
  const athleteName = raw?.athleteName || raw?.studentName || raw?.namaAnak || raw?.namaAtlet || raw?.fullName || raw?.name || raw?.childName || 'Calon Atlet';
  const parentName = raw?.parentName || raw?.namaOrangTua || raw?.parent || 'Orang Tua / Wali';
  const ticketCode = raw?.ticketCode || raw?.applicationId || raw?.admissionId || id || 'WVR-2026';
  const programCategory = raw?.programCategory || raw?.packageName || raw?.programName || raw?.programDiminati || raw?.package || 'Class Reguler';
  const whatsapp = raw?.whatsapp || raw?.phone || raw?.parentPhone || raw?.telepon || raw?.noWhatsapp || '-';

  // Location normalization
  let location: PoolLocationId = 'pahoman';
  const rawLoc = String(raw?.location || raw?.lokasi || raw?.poolLocation || raw?.lokasiLatihan || '').toLowerCase();
  if (rawLoc.includes('unila')) {
    location = 'unila';
  }

  // Status normalization
  let status: RegistrationStatus = 'pending';
  const rawStatus = String(raw?.status || raw?.statusDisplay || '').toLowerCase();
  if (rawStatus === 'verified' || rawStatus === 'approved') {
    status = 'verified';
  }

  // Price estimate normalization
  let totalEstimate = 0;
  if (typeof raw?.totalEstimate === 'number' && !isNaN(raw.totalEstimate)) {
    totalEstimate = raw.totalEstimate;
  } else if (typeof raw?.packagePrice === 'string') {
    const parsed = parseInt(raw.packagePrice.replace(/\D/g, ''), 10);
    if (!isNaN(parsed)) totalEstimate = parsed;
  }

  return {
    id: id || raw?.id || ticketCode,
    ticketCode,
    athleteName,
    age: raw?.age || calculateAge(raw?.birthDate || raw?.dob || raw?.tanggalLahir),
    gender: (raw?.gender === 'FEMALE' || raw?.jenisKelamin === 'Perempuan') ? 'Perempuan' : 'Laki-laki',
    parentName,
    whatsapp,
    email: raw?.email || '',
    programCategory,
    classType: raw?.classType || 'reguler',
    sessions: raw?.sessions || 8,
    location,
    preferredDay: raw?.preferredDay || 'Jadwal Reguler',
    totalEstimate,
    waterExperience: raw?.waterExperience || raw?.swimmingExperience || raw?.pengalamanRenang || raw?.pengalamanBerenang || raw?.experience || '-',
    medicalNotes: raw?.medicalNotes || '-',
    status,
    createdAt: raw?.createdAt || (raw?.firestoreTimestamp?.seconds ? new Date(raw.firestoreTimestamp.seconds * 1000).toISOString() : new Date().toISOString()),
    athletes: Array.isArray(raw?.athletes) ? raw.athletes : undefined,
    athleteCount: typeof raw?.athleteCount === 'number' ? raw.athleteCount : (Array.isArray(raw?.athletes) ? raw.athletes.length : 1),
  };
}

// Reactive event channel for local fallback synchronicity across tabs/components
const EVENT_NAME = 'wavora_registrations_changed';

function getLocalRegistrations(): RegistrationRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item) => normalizeRegistrationRecord(item?.id || '', item));
      }
    }
  } catch (e) {
    console.warn('Error reading local registrations cache:', e);
  }
  // Initialize with seed data
  saveLocalRegistrations(SEED_REGISTRATIONS);
  return SEED_REGISTRATIONS;
}

function saveLocalRegistrations(list: RegistrationRecord[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: list }));
  } catch (e) {
    console.warn('Error writing local registrations cache:', e);
  }
}

/**
 * One-time direct fetch of all registrations from Cloud Firestore
 */
export async function fetchRegistrationsOnce(): Promise<RegistrationRecord[]> {
  if (isFirestoreConfigured) {
    try {
      const snap = await getDocs(collection(db, COLLECTION_NAME));
      const items: RegistrationRecord[] = [];
      snap.forEach((docSnap) => {
        items.push(normalizeRegistrationRecord(docSnap.id, docSnap.data()));
      });
      items.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      if (items.length > 0) {
        saveLocalRegistrations(items);
      }
      return items;
    } catch (e) {
      console.warn('Direct fetch from Firestore failed:', e);
    }
  }
  return getLocalRegistrations();
}

/**
 * Listen to 'registrations' collection in real-time.
 * Guaranteed unsubscription lifecycle.
 */
export function subscribeToRegistrations(
  onUpdate: (data: RegistrationRecord[]) => void,
  onError: (err: Error) => void
): Unsubscribe {
  // If Cloud Firestore is configured with remote credentials, attach real Firestore listener
  if (isFirestoreConfigured) {
    try {
      const colRef = collection(db, COLLECTION_NAME);

      const unsubscribe = onSnapshot(
        colRef,
        (snapshot) => {
          const items: RegistrationRecord[] = [];
          snapshot.forEach((docSnap) => {
            items.push(normalizeRegistrationRecord(docSnap.id, docSnap.data()));
          });
          // Sort descending by registration timestamp
          items.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          onUpdate(items);
          saveLocalRegistrations(items);
        },
        (error) => {
          // If offline or network unavailable, Firestore seamlessly operates in offline mode
          if ((error as any)?.code === 'unavailable' || error?.message?.includes('offline') || error?.message?.includes('network')) {
            console.info('Firestore running in resilient offline/cached mode, serving local data.');
            onUpdate(getLocalRegistrations());
            return;
          }
          console.warn('Firestore onSnapshot error, falling back to local store:', error);
          onError(error);
          // Graceful fallback to persistent local reactive store
          onUpdate(getLocalRegistrations());
        }
      );

      return unsubscribe;
    } catch (err) {
      console.warn('Failed to attach Firestore listener, using local store:', err);
    }
  }

  // Resilient reactive store when offline or in preview sandbox
  let isCancelled = false;

  // Emit initial data
  const initialData = getLocalRegistrations().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const initialTimer = setTimeout(() => {
    if (!isCancelled) {
      onUpdate(initialData);
    }
  }, 120);

  // Listen for local broadcast mutations
  const handleLocalChange = (e: Event) => {
    if (isCancelled) return;
    const customEvent = e as CustomEvent<RegistrationRecord[]>;
    const updated = (customEvent.detail || getLocalRegistrations()).slice().sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    onUpdate(updated);
  };

  window.addEventListener(EVENT_NAME, handleLocalChange);

  // Return clean unsubscription teardown function
  return () => {
    isCancelled = true;
    clearTimeout(initialTimer);
    window.removeEventListener(EVENT_NAME, handleLocalChange);
  };
}

/**
 * Save new athlete registration to Cloud Firestore and local store
 */
export async function addRegistration(
  newRecord: Omit<RegistrationRecord, 'id' | 'createdAt' | 'status'> & {
    id?: string;
    status?: RegistrationStatus;
  }
): Promise<RegistrationRecord> {
  const id = newRecord.id || `WVR-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const fullRecord: RegistrationRecord = {
    ...newRecord,
    id,
    ticketCode: newRecord.ticketCode || id,
    status: newRecord.status || 'pending',
    createdAt: new Date().toISOString(),
  };

  // Attempt Firestore write
  if (isFirestoreConfigured) {
    try {
      await setDoc(doc(db, COLLECTION_NAME, id), fullRecord);
    } catch (err) {
      console.warn('Firestore write failed, saving locally:', err);
    }
  }

  // Sync to local broadcast store
  const existing = getLocalRegistrations().filter((r) => r.id !== id);
  const updated = [fullRecord, ...existing];
  saveLocalRegistrations(updated);

  return fullRecord;
}

/**
 * Toggle or set Registration Status (pending -> verified)
 */
export async function updateRegistrationStatus(
  id: string,
  status: RegistrationStatus
): Promise<void> {
  if (isFirestoreConfigured) {
    try {
      await updateDoc(doc(db, COLLECTION_NAME, id), { status });
    } catch (err) {
      console.warn('Firestore update failed, updating locally:', err);
    }
  }

  const existing = getLocalRegistrations();
  const updated = existing.map((item) =>
    item.id === id ? { ...item, status } : item
  );
  saveLocalRegistrations(updated);
}

/**
 * Delete a registration from WOS
 */
export async function deleteRegistration(id: string): Promise<void> {
  if (isFirestoreConfigured) {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (err) {
      console.warn('Firestore delete failed, deleting locally:', err);
    }
  }

  const existing = getLocalRegistrations();
  const updated = existing.filter((item) => item.id !== id);
  saveLocalRegistrations(updated);
}

/**
 * Reset to seed data
 */
export function resetSeedRegistrations(): RegistrationRecord[] {
  saveLocalRegistrations(SEED_REGISTRATIONS);
  return SEED_REGISTRATIONS;
}
