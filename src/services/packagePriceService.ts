import { useState, useEffect } from 'react';
import { PRICE_PACKAGES } from '../data/academyData';
import { PricePackage, ClassType, SessionCount } from '../types';

export const WAVORA_CUSTOM_PRICES_KEY = 'wavora_custom_package_prices_v1';
export const WAVORA_PRICES_EVENT = 'wavora_prices_updated';

/**
 * Get the currently active price packages (customized by Founder or defaults)
 */
export function getPackagePrices(): PricePackage[] {
  if (typeof window === 'undefined') return PRICE_PACKAGES;

  try {
    const raw = localStorage.getItem(WAVORA_CUSTOM_PRICES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Merge with default packages to ensure all properties and packages exist
        return PRICE_PACKAGES.map((defaultPkg) => {
          const custom = parsed.find((p: any) => p.id === defaultPkg.id);
          if (custom && custom.prices) {
            const mergedPrices: any = {};
            for (const key of Object.keys(defaultPkg.prices)) {
              mergedPrices[key] =
                custom.prices[key] !== undefined
                  ? custom.prices[key]
                  : (defaultPkg.prices as any)[key];
            }
            return {
              ...defaultPkg,
              prices: mergedPrices,
            };
          }
          return defaultPkg;
        });
      }
    }
  } catch (err) {
    console.warn('Gagal membaca data tarif paket dari storage, memakai standar default.', err);
  }

  return PRICE_PACKAGES;
}

/**
 * Save custom prices configured by Founder
 */
export function saveCustomPackagePrices(packages: PricePackage[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(WAVORA_CUSTOM_PRICES_KEY, JSON.stringify(packages));
    window.dispatchEvent(new CustomEvent(WAVORA_PRICES_EVENT));
  } catch (err) {
    console.error('Gagal menyimpan tarif paket ke local storage', err);
  }
}

/**
 * Reset all package prices to system default
 */
export function resetPackagePricesToDefault(): PricePackage[] {
  if (typeof window === 'undefined') return PRICE_PACKAGES;
  try {
    localStorage.removeItem(WAVORA_CUSTOM_PRICES_KEY);
    window.dispatchEvent(new CustomEvent(WAVORA_PRICES_EVENT));
  } catch (err) {
    console.error('Gagal mereset tarif paket', err);
  }
  return PRICE_PACKAGES;
}

/**
 * React hook to listen for real-time package price changes across components
 */
export function usePackagePrices(): {
  packages: PricePackage[];
  updatePrices: (updated: PricePackage[]) => void;
  resetPrices: () => void;
} {
  const [packages, setPackages] = useState<PricePackage[]>(() => getPackagePrices());

  useEffect(() => {
    const handleUpdate = () => {
      setPackages(getPackagePrices());
    };

    window.addEventListener(WAVORA_PRICES_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener(WAVORA_PRICES_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const updatePrices = (updated: PricePackage[]) => {
    saveCustomPackagePrices(updated);
    setPackages(updated);
  };

  const resetPrices = () => {
    const defaults = resetPackagePricesToDefault();
    setPackages(defaults);
  };

  return { packages, updatePrices, resetPrices };
}
