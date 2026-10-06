/**
 * Founder Authentication & PIN Verification Utilities
 */

const FOUNDER_AUTH_KEY = 'wavora_founder_authenticated';
const FOUNDER_PIN = 'WAVORA2026';

export function isFounderAuthenticated(): boolean {
  try {
    return localStorage.getItem(FOUNDER_AUTH_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setFounderAuthenticated(value: boolean): void {
  try {
    if (value) {
      localStorage.setItem(FOUNDER_AUTH_KEY, 'true');
    } else {
      localStorage.removeItem(FOUNDER_AUTH_KEY);
    }
    window.dispatchEvent(new CustomEvent('wavora_founder_auth_change', { detail: value }));
  } catch (e) {
    console.warn('Failed to persist founder auth:', e);
  }
}

export async function verifyFounderPinOnServer(pin: string): Promise<boolean> {
  // Check against client-side PIN or fallback
  if (pin.trim() === FOUNDER_PIN) {
    return true;
  }

  // Optionally check server if endpoint exists
  try {
    const res = await fetch('/api/founder/verify-pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    });
    if (res.ok) {
      const data = await res.json();
      return Boolean(data.success);
    }
  } catch {
    // offline or no server
  }

  return pin.trim() === FOUNDER_PIN;
}
