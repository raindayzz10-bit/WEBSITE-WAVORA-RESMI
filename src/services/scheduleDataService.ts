import { SCHEDULE_SLOTS_DATA } from '../data/academyData';
import { ScheduleSlot, DayOfWeek, PoolLocationId, ClassType } from '../types';

export const WAVORA_SCHEDULE_STORAGE_KEY = 'wavora_schedule_slots_v3';
export const WAVORA_FOUNDER_AUTH_KEY = 'wavora_founder_authenticated';
export const WAVORA_DELETED_SLOTS_KEY = 'wavora_deleted_slot_ids_v3';

// Valid PINs for Founder authorization
const FOUNDER_PINS = ['2026', 'wavora2026', 'founder', 'admin123', 'wavora', '1945'];

/**
 * Gets set of intentionally deleted slot IDs to prevent automatic re-adding
 */
export function getDeletedSlotIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(WAVORA_DELETED_SLOTS_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return new Set(arr);
    }
  } catch (e) {
    // ignore
  }
  return new Set();
}

export function recordDeletedSlotId(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getDeletedSlotIds();
    current.add(id);
    localStorage.setItem(WAVORA_DELETED_SLOTS_KEY, JSON.stringify(Array.from(current)));
  } catch (e) {
    // ignore
  }
}

/**
 * Loads schedule slots from localStorage or fallback to default template
 */
export function getSavedScheduleSlots(): ScheduleSlot[] {
  if (typeof window === 'undefined') return SCHEDULE_SLOTS_DATA;

  const deletedIds = getDeletedSlotIds();

  try {
    const raw = localStorage.getItem(WAVORA_SCHEDULE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Filter out any accidentally stored deleted slots
        const activeSlots = parsed.filter((s: ScheduleSlot) => !deletedIds.has(s.id));
        return activeSlots;
      }
    }
  } catch (err) {
    console.warn('Gagal membaca data jadwal dari storage lokal, memakai default.', err);
  }

  // Filter default slots against deleted IDs
  const initialSlots = SCHEDULE_SLOTS_DATA.filter((s) => !deletedIds.has(s.id));
  try {
    localStorage.setItem(WAVORA_SCHEDULE_STORAGE_KEY, JSON.stringify(initialSlots));
  } catch (e) {
    // Ignore storage write error
  }

  return initialSlots;
}

/**
 * Saves current schedule slots to localStorage
 */
export function saveScheduleSlots(slots: ScheduleSlot[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(WAVORA_SCHEDULE_STORAGE_KEY, JSON.stringify(slots));
    // Dispatch custom event for cross-component reactive updates
    window.dispatchEvent(new CustomEvent('wavora-schedule-updated', { detail: slots }));
  } catch (err) {
    console.error('Gagal menyimpan perubahan jadwal:', err);
  }
}

/**
 * Resets schedule slots to original default data
 */
export function resetScheduleSlots(): ScheduleSlot[] {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(WAVORA_DELETED_SLOTS_KEY);
    } catch (e) {
      // ignore
    }
  }
  saveScheduleSlots(SCHEDULE_SLOTS_DATA);
  return SCHEDULE_SLOTS_DATA;
}

/**
 * Update single slot and recalculate available quota & status
 */
export function updateScheduleSlot(updatedSlot: ScheduleSlot): ScheduleSlot[] {
  const currentSlots = getSavedScheduleSlots();
  
  // Recalculate available slots and status
  const safeTotal = Math.max(1, Number(updatedSlot.totalQuota) || 1);
  const safeBooked = Math.max(0, Math.min(safeTotal, Number(updatedSlot.bookedQuota) || 0));
  const availableSlots = Math.max(0, safeTotal - safeBooked);
  
  let status: 'available' | 'limited' | 'full' = 'available';
  if (availableSlots === 0) {
    status = 'full';
  } else if (availableSlots <= 1) {
    status = 'limited';
  }

  const normalizedSlot: ScheduleSlot = {
    ...updatedSlot,
    totalQuota: safeTotal,
    bookedQuota: safeBooked,
    availableSlots,
    status,
  };

  const nextSlots = currentSlots.map((slot) =>
    slot.id === updatedSlot.id ? normalizedSlot : slot
  );

  saveScheduleSlots(nextSlots);
  return nextSlots;
}

/**
 * Add a new schedule slot created by Founder
 */
export function addScheduleSlot(slotData: Omit<ScheduleSlot, 'id'>): { slots: ScheduleSlot[]; newId: string } {
  const currentSlots = getSavedScheduleSlots();
  const newId = `slot-wvr-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

  const safeTotal = Math.max(1, Number(slotData.totalQuota) || 1);
  const safeBooked = Math.max(0, Math.min(safeTotal, Number(slotData.bookedQuota) || 0));
  const availableSlots = Math.max(0, safeTotal - safeBooked);

  let status: 'available' | 'limited' | 'full' = 'available';
  if (availableSlots === 0) {
    status = 'full';
  } else if (availableSlots <= 1) {
    status = 'limited';
  }

  const newSlot: ScheduleSlot = {
    ...slotData,
    id: newId,
    totalQuota: safeTotal,
    bookedQuota: safeBooked,
    availableSlots,
    status,
  };

  const nextSlots = [newSlot, ...currentSlots];
  saveScheduleSlots(nextSlots);
  return { slots: nextSlots, newId };
}

/**
 * Delete a schedule slot
 */
export function deleteScheduleSlot(slotId: string): ScheduleSlot[] {
  recordDeletedSlotId(slotId);
  const currentSlots = getSavedScheduleSlots();
  const nextSlots = currentSlots.filter((slot) => slot.id !== slotId);
  saveScheduleSlots(nextSlots);
  return nextSlots;
}

/**
 * Quick stepper for Founder (+1 or -1 booked student)
 */
export function adjustSlotOccupancy(slotId: string, delta: number): ScheduleSlot[] {
  const currentSlots = getSavedScheduleSlots();
  const target = currentSlots.find((s) => s.id === slotId);
  if (!target) return currentSlots;

  const nextBooked = Math.max(0, Math.min(target.totalQuota, target.bookedQuota + delta));
  const availableSlots = Math.max(0, target.totalQuota - nextBooked);

  let status: 'available' | 'limited' | 'full' = 'available';
  if (availableSlots === 0) {
    status = 'full';
  } else if (availableSlots <= 1) {
    status = 'limited';
  }

  const updated: ScheduleSlot = {
    ...target,
    bookedQuota: nextBooked,
    availableSlots,
    status,
    highlightTag:
      availableSlots === 1
        ? 'Sisa 1 Slot Terakhir!'
        : availableSlots === 0
        ? 'Slot Penuh'
        : target.highlightTag,
  };

  return updateScheduleSlot(updated);
}

/**
 * Founder Auth helpers
 */
export function verifyFounderPin(pin: string): boolean {
  if (!pin) return false;
  const cleanPin = pin.trim().toLowerCase();
  return FOUNDER_PINS.includes(cleanPin);
}

export function isFounderAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(WAVORA_FOUNDER_AUTH_KEY) === 'true';
  } catch (e) {
    return false;
  }
}

export function setFounderAuthenticated(isAuth: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    if (isAuth) {
      localStorage.setItem(WAVORA_FOUNDER_AUTH_KEY, 'true');
    } else {
      localStorage.removeItem(WAVORA_FOUNDER_AUTH_KEY);
    }
  } catch (e) {
    // Ignore error
  }
}
