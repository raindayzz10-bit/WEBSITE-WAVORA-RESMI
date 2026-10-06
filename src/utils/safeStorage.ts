/**
 * Safe LocalStorage Utilities with Quota Exceeded & Serialization Guard
 */

export function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    console.warn(`safeGetItem failed for key "${key}":`, e);
    return null;
  }
}

export function safeSetItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    console.warn(`safeSetItem failed for key "${key}", attempting purge:`, e);
    try {
      purgeLegacyStorage();
      localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  }
}

export function sanitizeItemsForCache<T extends { photoUrl?: string }>(items: T[]): T[] {
  // Simpan foto beresolusi HD jernih (hingga ~1.2MB per foto)
  return items.slice(0, 50).map((item) => {
    if (item.photoUrl && item.photoUrl.length > 1800000) {
      return {
        ...item,
        photoUrl: undefined,
      };
    }
    return item;
  });
}

export function purgeLegacyStorage(): void {
  try {
    const keysToRemove = [
      'wavora_testimonials_v1',
      'wavora_testimonials_v2',
      'wavora_testimonials_v3',
      'wavora_testimonials_v4',
      'wavora_testimonials_v5',
      'wavora_testimonials_v6',
      'wavora_testimonials_v7',
      'wavora_deleted_reviews_v1',
      'wavora_deleted_reviews_v2',
      'wavora_deleted_reviews_v3',
      'wavora_legacy_cache',
    ];
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch (e) {
    console.warn('purgeLegacyStorage error:', e);
  }
}

const DELETED_REVIEWS_KEY = 'wavora_deleted_reviews_v4';
const PROTECTED_AUTHENTIC_IDS = new Set([
  'rev_1787255131844_sk30',
  'rev_1787136056442_v9kl',
  'rev_1787113120914_x8lh',
  'rev_1787061285367_pgsv',
  'rev_1787059645665_stgd',
]);

export function getDeletedReviewIds(): string[] {
  try {
    const raw = safeGetItem(DELETED_REVIEWS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Jangan pernah biarkan ID ulasan otentik WAVORA terblokir
    return parsed.filter((id) => !PROTECTED_AUTHENTIC_IDS.has(id));
  } catch {
    return [];
  }
}

export function clearDeletedReviewHistory(): void {
  try {
    localStorage.removeItem(DELETED_REVIEWS_KEY);
    localStorage.removeItem('wavora_deleted_reviews_v3');
    localStorage.removeItem('wavora_deleted_reviews_v2');
    localStorage.removeItem('wavora_deleted_reviews_v1');
  } catch {
    // Ignored
  }
}

export function markReviewAsDeleted(id: string): void {
  try {
    // ID ulasan otentik WAVORA dilindungi dari penghapusan tidak disengaja
    if (PROTECTED_AUTHENTIC_IDS.has(id)) {
      console.warn('Ulasan otentik WAVORA dilindungi dan tidak dapat dihapus permanen.');
      return;
    }
    const current = getDeletedReviewIds();
    if (!current.includes(id)) {
      const updated = [...current, id];
      safeSetItem(DELETED_REVIEWS_KEY, JSON.stringify(updated));
    }
  } catch (e) {
    console.warn('Failed to record deleted review ID:', e);
  }
}

