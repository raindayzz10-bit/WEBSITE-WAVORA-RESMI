import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Download,
  Copy,
  Check,
  X,
  Camera,
  Sparkles,
  Trophy,
  Flame,
  Calendar,
  Instagram,
  RefreshCw,
  Award,
  Lock,
} from 'lucide-react';
import { ScheduleSlot, PoolLocation } from '../types';
import { ADMIN_PHONE, ADMIN_PHONE_INTL, INSTAGRAM_HANDLE } from '../data/academyData';

interface InstagramStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSlot?: ScheduleSlot | null;
  allSlots: ScheduleSlot[];
  currentPool: PoolLocation;
}

export const InstagramStoryModal: React.FC<InstagramStoryModalProps> = ({
  isOpen,
  onClose,
  initialSlot,
  allSlots,
  currentPool,
}) => {
  const [mounted, setMounted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Filter slots to current pool
  const poolSlots = allSlots.filter((s) => s.locationId === currentPool.id);
  const wctSlots = poolSlots.filter(
    (s) => s.classType === 'prestasi' || s.isWCT || s.programTitle.includes('WCT')
  );
  const regularSlots = poolSlots.filter(
    (s) => !(s.classType === 'prestasi' || s.isWCT || s.programTitle.includes('WCT'))
  );

  // Story mode:
  // 'wct' = Khusus WCT (Wavora Competition Team - 4x/Mgg)
  // 'single' = Slot Fokus Sesi Pilihan
  // 'recap' = Rekap Multi-Slot (Prioritas WCT & Sesi Pilihan)
  const [storyMode, setStoryMode] = useState<'wct' | 'single' | 'recap'>('wct');

  // Selected slot for single mode
  const [selectedSlotId, setSelectedSlotId] = useState<string>(
    initialSlot?.id || (wctSlots.length > 0 ? wctSlots[0].id : poolSlots[0]?.id || '')
  );

  // Single mode slot filter: 'all' | 'wct' | 'regular'
  const [slotCategoryFilter, setSlotCategoryFilter] = useState<'all' | 'wct' | 'regular'>('all');

  // Recap mode filter: 'mixed' (WCT + Regular) | 'wct_all' (All WCT days) | 'regular' (Regular only)
  const [recapModeFilter, setRecapModeFilter] = useState<'mixed' | 'wct_all' | 'regular'>('mixed');

  // Story theme: ocean (cyan), gold (prestasi), midnight (dark athletic)
  const [theme, setTheme] = useState<'ocean' | 'gold' | 'midnight'>('gold');

  // Custom headline note
  const [headline, setHeadline] = useState<string>('JADWAL ATLET PRESTASI WCT (4X/MINGGU)');
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (initialSlot) {
      setSelectedSlotId(initialSlot.id);
      const isWct = initialSlot.classType === 'prestasi' || initialSlot.isWCT || initialSlot.programTitle.includes('WCT');
      if (isWct) {
        setStoryMode('wct');
        setTheme('gold');
        setHeadline('JADWAL ATLET PRESTASI WCT (4X/MINGGU)');
      } else {
        setStoryMode('single');
        setTheme('ocean');
        if (initialSlot.status === 'limited') {
          setHeadline(`SLOT TERBATAS — SISA ${initialSlot.availableSlots} KUOTA!`);
        } else {
          setHeadline('KUNCI SLOT SEBELUM PENUH!');
        }
      }
    }
  }, [initialSlot]);

  // Current active single slot
  const currentSlot = poolSlots.find((s) => s.id === selectedSlotId) || initialSlot || poolSlots[0];

  // Helper to draw the high-resolution 1080x1920 Instagram Story onto Canvas
  const drawStoryCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 1080;
    const H = 1920;
    canvas.width = W;
    canvas.height = H;

    // 1. Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    if (theme === 'gold') {
      bgGrad.addColorStop(0, '#1c1305');
      bgGrad.addColorStop(0.3, '#0b0f17');
      bgGrad.addColorStop(0.7, '#070b12');
      bgGrad.addColorStop(1, '#2a1a04');
    } else if (theme === 'midnight') {
      bgGrad.addColorStop(0, '#040810');
      bgGrad.addColorStop(0.5, '#020509');
      bgGrad.addColorStop(1, '#08111e');
    } else {
      // Ocean
      bgGrad.addColorStop(0, '#041726');
      bgGrad.addColorStop(0.35, '#060d16');
      bgGrad.addColorStop(0.8, '#030811');
      bgGrad.addColorStop(1, '#052338');
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Subtle background glowing orbs
    ctx.save();
    const orb1 = ctx.createRadialGradient(W * 0.8, H * 0.2, 50, W * 0.8, H * 0.2, 500);
    orb1.addColorStop(0, theme === 'gold' ? 'rgba(245, 158, 11, 0.22)' : 'rgba(6, 182, 212, 0.25)');
    orb1.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = orb1;
    ctx.fillRect(0, 0, W, H);

    const orb2 = ctx.createRadialGradient(W * 0.2, H * 0.75, 40, W * 0.2, H * 0.75, 450);
    orb2.addColorStop(0, theme === 'gold' ? 'rgba(234, 179, 8, 0.15)' : 'rgba(20, 184, 166, 0.2)');
    orb2.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = orb2;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();

    // Decorative grid line accents
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 2;
    for (let y = 200; y < H; y += 300) {
      ctx.beginPath();
      ctx.moveTo(80, y);
      ctx.lineTo(W - 80, y);
      ctx.stroke();
    }

    // 2. Header Brand: WAVORA AQUATIC ACADEMY
    ctx.save();
    ctx.textAlign = 'center';

    // Top pill: OFFICIAL SCHEDULE & SLOT UPDATE
    ctx.fillStyle = theme === 'gold' ? '#f59e0b' : '#06b6d4';
    ctx.beginPath();
    const pillY = 140;
    const pillW = 540;
    const pillH = 50;
    ctx.roundRect((W - pillW) / 2, pillY, pillW, pillH, 25);
    ctx.fill();

    ctx.fillStyle = '#020617';
    ctx.font = '900 22px system-ui, -apple-system, sans-serif';
    ctx.letterSpacing = '2px';
    ctx.fillText('OFFICIAL SCHEDULE & SLOT UPDATE', W / 2, pillY + 34);

    // Academy Name: REVISED to WAVORA AQUATIC ACADEMY
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 48px system-ui, -apple-system, sans-serif';
    ctx.fillText('WAVORA AQUATIC ACADEMY', W / 2, 270);

    ctx.fillStyle = theme === 'gold' ? '#fcd34d' : '#22d3ee';
    ctx.font = '600 24px system-ui, -apple-system, sans-serif';
    ctx.letterSpacing = '3px';
    ctx.fillText('SWIMMING EXCELLENCE • BANDAR LAMPUNG', W / 2, 315);
    ctx.restore();

    // 3. Venue Card (Kolam Renang)
    const venueY = 370;
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.strokeStyle = theme === 'gold' ? 'rgba(245, 158, 11, 0.4)' : 'rgba(6, 182, 212, 0.35)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(80, venueY, W - 160, 130, 24);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 20px system-ui, -apple-system, sans-serif';
    ctx.fillText('LOKASI LATIHAN:', 120, venueY + 45);

    ctx.fillStyle = '#ffffff';
    ctx.font = '800 36px system-ui, -apple-system, sans-serif';
    ctx.fillText(currentPool.name, 120, venueY + 95);

    // Operational badge on right
    ctx.textAlign = 'right';
    ctx.fillStyle = theme === 'gold' ? '#f59e0b' : '#38bdf8';
    ctx.font = '700 22px system-ui, -apple-system, sans-serif';
    ctx.fillText(currentPool.timeSlot, W - 120, venueY + 75);
    ctx.restore();

    // 4. Headline Callout Ribbon
    const calloutY = 535;
    ctx.save();
    ctx.fillStyle = theme === 'gold' ? 'rgba(245, 158, 11, 0.16)' : 'rgba(6, 182, 212, 0.16)';
    ctx.strokeStyle = theme === 'gold' ? '#f59e0b' : '#06b6d4';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(80, calloutY, W - 160, 85, 20);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = theme === 'gold' ? '#fbbf24' : '#67e8f9';
    ctx.font = '900 28px system-ui, -apple-system, sans-serif';
    ctx.letterSpacing = '1px';
    ctx.fillText(`⚡ ${headline.toUpperCase()} ⚡`, W / 2, calloutY + 54);
    ctx.restore();

    // 5. MAIN CARD DISPLAY
    if (storyMode === 'wct') {
      // DEDICATED WCT CARD (Wavora Competition Team - 4x/Mgg)
      const cardY = 650;
      const cardH = 720;

      ctx.save();
      // Gold glowing card container
      ctx.fillStyle = 'rgba(12, 18, 30, 0.94)';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(80, cardY, W - 160, cardH, 32);
      ctx.fill();
      ctx.stroke();

      // Top Gold Badge Ribbon
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.roundRect(120, cardY + 35, W - 240, 56, 16);
      ctx.fill();

      ctx.textAlign = 'center';
      ctx.fillStyle = '#020617';
      ctx.font = '900 24px system-ui, -apple-system, sans-serif';
      ctx.fillText('🏆 WAVORA COMPETITION TEAM (WCT) • RESMI', W / 2, cardY + 72);

      // Program Title
      ctx.textAlign = 'left';
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 46px system-ui, -apple-system, sans-serif';
      ctx.fillText('Program Prestasi Atlet (4x/Mgg)', 120, cardY + 155);

      // Training Schedule Box (4x per week)
      ctx.fillStyle = 'rgba(245, 158, 11, 0.1)';
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(120, cardY + 185, W - 240, 145, 20);
      ctx.fill();
      ctx.stroke();

      const daysText = currentPool.id === 'pahoman'
        ? 'Senin, Rabu, Kamis, Sabtu'
        : 'Selasa, Kamis, Jumat, Minggu';

      ctx.fillStyle = '#fbbf24';
      ctx.font = '800 24px system-ui, -apple-system, sans-serif';
      ctx.fillText('🗓 JADWAL INTENSIF 4X SEMINGGU:', 150, cardY + 230);

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 32px system-ui, -apple-system, sans-serif';
      ctx.fillText(`${daysText}`, 150, cardY + 275);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#38bdf8';
      ctx.font = '800 28px system-ui, -apple-system, sans-serif';
      ctx.fillText('⏰ 15:30 - 17:30 WIB', W - 150, cardY + 275);

      // Target Focus & Coach
      ctx.textAlign = 'left';
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '600 24px system-ui, -apple-system, sans-serif';
      ctx.fillText('🎯 Fokus: Biomekanik 4 Gaya, Underwater Start-Turn & O2SN/Kejurda', 120, cardY + 380);

      const representativeWctSlot = wctSlots[0];
      const coachText = representativeWctSlot?.coachName || 'Coach Rian / Coach Ariyoga & Tim Prestasi';
      ctx.fillStyle = '#2dd4bf';
      ctx.font = '700 25px system-ui, -apple-system, sans-serif';
      ctx.fillText(`🏊‍♂️ Pelatih: ${coachText}`, 120, cardY + 425);

      // Quota Status Bar
      const quotaY = cardY + 490;
      ctx.fillStyle = '#fcd34d';
      ctx.font = '800 26px system-ui, -apple-system, sans-serif';
      ctx.fillText('STATUS KUOTA JALUR PRESTASI:', 120, quotaY);

      const totalBooked = representativeWctSlot?.bookedQuota ?? 3;
      const totalCapacity = representativeWctSlot?.totalQuota ?? 5;
      const available = representativeWctSlot?.availableSlots ?? 2;

      // Status pill
      ctx.textAlign = 'right';
      const badgeW = 340;
      const badgeH = 50;
      ctx.fillStyle = available <= 2 ? '#f59e0b' : '#10b981';
      ctx.beginPath();
      ctx.roundRect(W - 120 - badgeW, quotaY - 36, badgeW, badgeH, 16);
      ctx.fill();

      ctx.fillStyle = '#020617';
      ctx.font = '900 22px system-ui, -apple-system, sans-serif';
      ctx.fillText(
        available <= 2 ? `SISA ${available} ATLET LAGI!` : `SEDIA ${available} KUOTA ATLET`,
        W - 140,
        quotaY - 2
      );

      // Progress Bar
      const barY = quotaY + 30;
      const barW = W - 240;
      const barH = 22;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.beginPath();
      ctx.roundRect(120, barY, barW, barH, 11);
      ctx.fill();

      const fillPct = Math.min(1, totalBooked / totalCapacity);
      const fillW = Math.max(20, barW * fillPct);
      const fillGrad = ctx.createLinearGradient(120, 0, 120 + barW, 0);
      fillGrad.addColorStop(0, '#f59e0b');
      fillGrad.addColorStop(1, '#fbbf24');
      ctx.fillStyle = fillGrad;
      ctx.beginPath();
      ctx.roundRect(120, barY, fillW, barH, 11);
      ctx.fill();

      ctx.textAlign = 'left';
      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 22px system-ui, -apple-system, sans-serif';
      ctx.fillText(`Maksimal 4-5 atlet per lintasan demi kualitas koreksi stroke yang terukur`, 120, barY + 60);

      // Benefit badges row
      ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.beginPath();
      ctx.roundRect(120, barY + 90, W - 240, 50, 14);
      ctx.fill();

      ctx.fillStyle = '#fbbf24';
      ctx.font = '700 20px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('★ Analisis Video Underwater  •  ★ Sport Science  •  ★ Tes Time Trial Periodik', W / 2, barY + 122);

      ctx.restore();

    } else if (storyMode === 'single' && currentSlot) {
      // SINGLE SLOT FOCUS MODE
      const cardY = 660;
      const cardH = 680;
      const isWct = currentSlot.classType === 'prestasi' || currentSlot.isWCT || currentSlot.programTitle.includes('WCT');
      const isFull = currentSlot.status === 'full';
      const isLimited = currentSlot.status === 'limited';

      ctx.save();
      ctx.fillStyle = 'rgba(10, 18, 32, 0.92)';
      ctx.strokeStyle = isWct ? '#f59e0b' : isLimited ? '#f59e0b' : 'rgba(56, 189, 248, 0.5)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(80, cardY, W - 160, cardH, 32);
      ctx.fill();
      ctx.stroke();

      // Top Badge
      if (isWct) {
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.roundRect(120, cardY + 35, W - 240, 56, 16);
        ctx.fill();

        ctx.textAlign = 'center';
        ctx.fillStyle = '#020617';
        ctx.font = '900 24px system-ui, -apple-system, sans-serif';
        ctx.fillText('🏆 WAVORA COMPETITION TEAM • 4X / MINGGU', W / 2, cardY + 72);
      }

      // Day & Time big pill
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.beginPath();
      const timePillY = isWct ? cardY + 115 : cardY + 45;
      ctx.roundRect(120, timePillY, W - 240, 90, 20);
      ctx.fill();

      ctx.fillStyle = isWct ? '#fbbf24' : '#38bdf8';
      ctx.font = '900 36px system-ui, -apple-system, sans-serif';
      ctx.fillText(`🗓  ${currentSlot.day.toUpperCase()}`, 150, timePillY + 58);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = '800 36px system-ui, -apple-system, sans-serif';
      ctx.fillText(`⏰ ${currentSlot.time}`, W - 150, timePillY + 58);

      // Program Title
      ctx.textAlign = 'left';
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 44px system-ui, -apple-system, sans-serif';
      ctx.fillText(currentSlot.programTitle, 120, timePillY + 165);

      // Target Group & Coach
      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 26px system-ui, -apple-system, sans-serif';
      ctx.fillText(`👥 Target: ${currentSlot.targetGroup}`, 120, timePillY + 220);

      ctx.fillStyle = '#2dd4bf';
      ctx.font = '600 26px system-ui, -apple-system, sans-serif';
      ctx.fillText(`🏊‍♂️ Pelatih: ${currentSlot.coachName}`, 120, timePillY + 270);

      if (currentSlot.weeklyFrequency) {
        ctx.fillStyle = '#fbbf24';
        ctx.font = '700 24px system-ui, -apple-system, sans-serif';
        ctx.fillText(`★ Frekuensi: ${currentSlot.weeklyFrequency}`, 120, timePillY + 315);
      }

      // Quota progress indicator
      const quotaY = cardY + cardH - 180;
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '700 26px system-ui, -apple-system, sans-serif';
      ctx.fillText('STATUS KUOTA SISWA:', 120, quotaY);

      // Quota Badge Pill
      ctx.textAlign = 'right';
      const badgeW = 320;
      const badgeH = 50;
      ctx.fillStyle = isFull ? '#e11d48' : isLimited ? '#f59e0b' : '#10b981';
      ctx.beginPath();
      ctx.roundRect(W - 120 - badgeW, quotaY - 36, badgeW, badgeH, 16);
      ctx.fill();

      ctx.fillStyle = isFull ? '#ffffff' : '#020617';
      ctx.font = '900 22px system-ui, -apple-system, sans-serif';
      ctx.fillText(
        isFull ? 'KAPASITAS PENUH' : isLimited ? `SISA ${currentSlot.availableSlots} SLOT LAGI!` : `SEDIA ${currentSlot.availableSlots} SLOT`,
        W - 140,
        quotaY - 2
      );

      // Progress Bar
      const barY = quotaY + 30;
      const barW = W - 240;
      const barH = 22;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.beginPath();
      ctx.roundRect(120, barY, barW, barH, 11);
      ctx.fill();

      const fillPct = Math.min(1, currentSlot.bookedQuota / currentSlot.totalQuota);
      const fillW = Math.max(20, barW * fillPct);
      const fillGrad = ctx.createLinearGradient(120, 0, 120 + barW, 0);
      if (isFull) {
        fillGrad.addColorStop(0, '#f43f5e');
        fillGrad.addColorStop(1, '#e11d48');
      } else if (isLimited) {
        fillGrad.addColorStop(0, '#f59e0b');
        fillGrad.addColorStop(1, '#fbbf24');
      } else {
        fillGrad.addColorStop(0, '#06b6d4');
        fillGrad.addColorStop(1, '#14b8a6');
      }
      ctx.fillStyle = fillGrad;
      ctx.beginPath();
      ctx.roundRect(120, barY, fillW, barH, 11);
      ctx.fill();

      ctx.textAlign = 'left';
      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 22px system-ui, -apple-system, sans-serif';
      ctx.fillText(`Terisi ${currentSlot.bookedQuota} dari total ${currentSlot.totalQuota} siswa (${Math.round(fillPct * 100)}%)`, 120, barY + 55);

      ctx.restore();

    } else {
      // RECAP MULTI-SLOT MODE (WITH WCT PRIORITIZATION)
      const recapY = 660;

      let slotsToDisplay: ScheduleSlot[] = [];
      if (recapModeFilter === 'wct_all') {
        slotsToDisplay = wctSlots.slice(0, 3);
      } else if (recapModeFilter === 'regular') {
        slotsToDisplay = regularSlots.slice(0, 3);
      } else {
        // Mixed: Put 1 WCT slot at the top, then 2 regular slots!
        const featuredWct = wctSlots[0];
        const otherSlots = regularSlots.slice(0, 2);
        slotsToDisplay = featuredWct ? [featuredWct, ...otherSlots] : poolSlots.slice(0, 3);
      }

      slotsToDisplay.forEach((slot, idx) => {
        const itemY = recapY + idx * 225;
        const isWctItem = slot.classType === 'prestasi' || slot.isWCT || slot.programTitle.includes('WCT');

        ctx.save();
        ctx.fillStyle = isWctItem ? 'rgba(25, 20, 10, 0.92)' : 'rgba(15, 23, 42, 0.88)';
        ctx.strokeStyle = isWctItem ? '#f59e0b' : 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = isWctItem ? 4 : 2;
        ctx.beginPath();
        ctx.roundRect(80, itemY, W - 160, 205, 24);
        ctx.fill();
        ctx.stroke();

        ctx.textAlign = 'left';
        ctx.fillStyle = isWctItem ? '#fbbf24' : '#38bdf8';
        ctx.font = '800 24px system-ui, -apple-system, sans-serif';
        ctx.fillText(
          `${isWctItem ? '🏆 [WCT 4X/MGG] ' : ''}${slot.day.toUpperCase()} • ${slot.time}`,
          120,
          itemY + 48
        );

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 32px system-ui, -apple-system, sans-serif';
        ctx.fillText(slot.programTitle, 120, itemY + 95);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '600 22px system-ui, -apple-system, sans-serif';
        ctx.fillText(`Pelatih: ${slot.coachName} • ${slot.targetGroup}`, 120, itemY + 140);

        if (isWctItem) {
          ctx.fillStyle = '#fbbf24';
          ctx.font = '700 20px system-ui, -apple-system, sans-serif';
          ctx.fillText('★ Frekuensi Latihan Intensif 4x/Minggu (Jalur Prestasi)', 120, itemY + 175);
        }

        // Status pill
        ctx.textAlign = 'right';
        ctx.fillStyle = slot.status === 'limited' ? '#f59e0b' : '#10b981';
        ctx.font = '800 22px system-ui, -apple-system, sans-serif';
        ctx.fillText(
          slot.status === 'limited' ? `Sisa ${slot.availableSlots} Slot!` : `Sedia ${slot.availableSlots} Slot`,
          W - 120,
          itemY + 48
        );
        ctx.restore();
      });
    }

    // 6. Kartu Standar Mutu & Otoritas Wavora (Menggantikan stiker tiruan agar tidak tumpang tindih)
    const trustY = 1390;
    const trustH = 290;
    ctx.save();
    ctx.fillStyle = 'rgba(10, 16, 28, 0.92)';
    ctx.strokeStyle = theme === 'gold' ? 'rgba(245, 158, 11, 0.45)' : 'rgba(6, 182, 212, 0.45)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(80, trustY, W - 160, trustH, 28);
    ctx.fill();
    ctx.stroke();

    // Card Header Ribbon
    ctx.textAlign = 'center';
    ctx.fillStyle = theme === 'gold' ? 'rgba(245, 158, 11, 0.16)' : 'rgba(6, 182, 212, 0.16)';
    ctx.beginPath();
    ctx.roundRect(120, trustY + 20, W - 240, 42, 12);
    ctx.fill();

    ctx.fillStyle = theme === 'gold' ? '#fbbf24' : '#38bdf8';
    ctx.font = '800 20px system-ui, -apple-system, sans-serif';
    ctx.letterSpacing = '1px';
    ctx.fillText('⭐ STANDAR KUALITAS WAVORA AQUATIC ACADEMY ⭐', W / 2, trustY + 48);

    // 3 Columns of Pillars (Trust Badges)
    const colW = (W - 240) / 3;
    const pillars = [
      {
        icon: '👥',
        title: 'RASIO 1:4 - 1:5',
        desc: 'Maks. 5 Siswa/Pelatih',
        color: '#38bdf8',
      },
      {
        icon: '🔬',
        title: 'SPORT SCIENCE',
        desc: 'Biomekanik 4 Gaya',
        color: '#fbbf24',
      },
      {
        icon: '🛡️',
        title: 'GARANSI RESMI',
        desc: 'Sesi Reschedule Aman',
        color: '#34d399',
      },
    ];

    pillars.forEach((p, idx) => {
      const colX = 120 + idx * colW;
      const colCenterX = colX + colW / 2;

      // Small card for each pillar
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(colX + 8, trustY + 75, colW - 16, 110, 16);
      ctx.fill();
      ctx.stroke();

      // Icon
      ctx.font = '32px system-ui';
      ctx.fillText(p.icon, colCenterX, trustY + 116);

      // Title
      ctx.fillStyle = '#ffffff';
      ctx.font = '800 19px system-ui, -apple-system, sans-serif';
      ctx.fillText(p.title, colCenterX, trustY + 146);

      // Desc
      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 16px system-ui, -apple-system, sans-serif';
      ctx.fillText(p.desc, colCenterX, trustY + 168);
    });

    // Clean Action Bar with arrow pointing up (Where they paste the real Instagram Link Sticker!)
    ctx.fillStyle = theme === 'gold' ? '#f59e0b' : '#06b6d4';
    ctx.font = '900 23px system-ui, -apple-system, sans-serif';
    ctx.letterSpacing = '1px';
    ctx.fillText('👆 TAP STIKER TAUTAN STORY DI ATAS UNTUK RESERVASI 👆', W / 2, trustY + 228);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '600 19px system-ui, -apple-system, sans-serif';
    ctx.fillText(`Hotline WhatsApp: ${ADMIN_PHONE}  •  Website: wavoraaquatic.id`, W / 2, trustY + 258);
    ctx.restore();

    // 7. Footer: Instagram handle & Brand
    const footY = 1750;
    ctx.save();
    ctx.textAlign = 'center';

    ctx.fillStyle = '#64748b';
    ctx.font = '600 22px system-ui, -apple-system, sans-serif';
    ctx.fillText(`Follow Instagram Resmi: @${INSTAGRAM_HANDLE} • Garansi Reschedule`, W / 2, footY);

    ctx.fillStyle = theme === 'gold' ? '#f59e0b' : '#06b6d4';
    ctx.font = '900 24px system-ui, -apple-system, sans-serif';
    ctx.fillText('WAVORA AQUATIC ACADEMY • BANDAR LAMPUNG', W / 2, footY + 40);
    ctx.restore();
  };

  // Re-draw canvas whenever state changes
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        drawStoryCanvas();
      }, 80);
    }
  }, [isOpen, selectedSlotId, theme, storyMode, headline, recapModeFilter]);

  if (!isOpen || !mounted) return null;

  // Handle Download PNG
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setDownloading(true);
    try {
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      const filename = `wavora-aquatic-story-${storyMode}-${theme}.png`;
      a.href = dataUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.error('Download error:', e);
    } finally {
      setTimeout(() => setDownloading(false), 800);
    }
  };

  // Handle Copy Caption
  const handleCopyCaption = () => {
    let caption = '';
    const daysText = currentPool.id === 'pahoman'
      ? 'Senin, Rabu, Kamis, Sabtu (15:30 - 17:30 WIB)'
      : 'Selasa, Kamis, Jumat, Minggu (15:30 - 17:30 WIB)';

    if (storyMode === 'wct') {
      caption = `🏊‍♂️ UPDATE RESMI WAVORA COMPETITION TEAM (WCT) — WAVORA AQUATIC ACADEMY 🏆

Program pembinaan atlet renang prestasi intensif 4x latihan seminggu dengan kurikulum berbasis sport science, biomekanik 4 gaya, analisis video underwater, dan persiapan kejuaraan resmi (O2SN, Kejurda PRSI).

📍 Kolam Latihan: ${currentPool.name}
🗓 Hari & Jam Latihan: ${daysText}
🏆 Program: Wavora Competition Team (WCT) 4x/Minggu
👨‍🏫 Pelatih: Head Coach & Tim Pelatih Prestasi Wavora
⚠️ Kuota: Sangat Terbatas (Maksimal 5 Atlet per Lintasan)

Jalur pendaftaran seleksi atlet renang Wavora dibuka!
👉 Klik stiker tautan di story ini untuk pendaftaran online
📲 WhatsApp Admin/Founder: https://wa.me/${ADMIN_PHONE_INTL}

#WavoraAquaticAcademy #WavoraCompetitionTeam #WCTPrestasi #LesRenangLampung #RenangBandarLampung #RenangPrestasi`;
    } else if (storyMode === 'recap') {
      caption = `🏊‍♂️ UPDATE JADWAL & KUOTA SESI RENANG — WAVORA AQUATIC ACADEMY 🏊‍♀️

📍 Lokasi: ${currentPool.name} (${currentPool.timeSlot})
Berikut rekap sesi aktif dan sisa slot pendaftaran di kolam renang ${currentPool.name}:

🏆 Sesi WCT Prestasi (4x/Mgg): ${daysText}
🏊 Sesi Reguler & Weekend: Tersedia kelas Tadpole, Junior Stroke & Privat VIP.

Pembatasan kuota ketat maks 4-5 siswa per pelatih demi bimbingan yang aman dan maksimal.
👉 Kunjungi website wavoraaquatic.id/jadwal lewat stiker link story
📲 Info & Konsultasi WA: https://wa.me/${ADMIN_PHONE_INTL}

#WavoraAquaticAcademy #LesRenangAnak #LesRenangDewasa #RenangPahoman #RenangUnila`;
    } else {
      const isWct = currentSlot?.classType === 'prestasi' || currentSlot?.isWCT;
      caption = `🏊‍♂️ UPDATE JADWAL & KUOTA SESI RENANG — WAVORA AQUATIC ACADEMY 🏊‍♀️

📍 Kolam Latihan: ${currentPool.name}
🗓 Hari & Jam: ${currentSlot?.day} • ${currentSlot?.time} WIB
🏆 Program: ${currentSlot?.programTitle} ${isWct ? '(Jadwal Atlet 4x/Minggu)' : ''}
👨‍🏫 Pelatih: ${currentSlot?.coachName}
⚠️ Kuota: Sisa ${currentSlot?.availableSlots} dari total ${currentSlot?.totalQuota} Siswa!

Kunci slot putra/putri Anda sekarang sebelum kapasitas penuh!
👉 Tap stiker link di story ini untuk langsung mengunci slot jadwal secara online
📲 WhatsApp Admin Wavora: https://wa.me/${ADMIN_PHONE_INTL}

#WavoraAquaticAcademy #LesRenangLampung #RenangBandarLampung #WCTPrestasi`;
    }

    navigator.clipboard.writeText(caption);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 3000);
  };

  // Filtered slots for dropdown in single mode
  const filteredSingleSlots = poolSlots.filter((slot) => {
    const isWct = slot.classType === 'prestasi' || slot.isWCT || slot.programTitle.includes('WCT');
    if (slotCategoryFilter === 'wct') return isWct;
    if (slotCategoryFilter === 'regular') return !isWct;
    return true;
  });

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-500 text-white shadow-md">
              <Instagram className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-athletic font-bold text-lg sm:text-xl text-white">
                  Generator Story Instagram (9:16)
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" />
                  <span>Akses Founder</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  HD 1080x1920
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Format vertikal estetik Wavora Aquatic Academy siap posting ke IG Story dengan stiker link booking &amp; kuota real-time
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Split view (Controls left, 9:16 preview right) */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Controls Column (7 Cols) */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* 1. Mode Story (WCT vs Single vs Recap) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold block">
                  1. Mode Tampilan Story:
                </label>
                <span className="text-[11px] text-amber-400 font-mono font-semibold">
                  {storyMode === 'wct' ? '🏆 Menu WCT Aktif' : ''}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {/* WCT MODE BUTTON */}
                <button
                  type="button"
                  onClick={() => {
                    setStoryMode('wct');
                    setTheme('gold');
                    setHeadline('JADWAL ATLET PRESTASI WCT (4X/MINGGU)');
                  }}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-left flex flex-col gap-1 cursor-pointer ${
                    storyMode === 'wct'
                      ? 'bg-amber-950/70 border-amber-400 text-white shadow-lg ring-1 ring-amber-400/50'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-amber-500/40'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-amber-400">
                    <Trophy className="w-4 h-4 shrink-0" />
                    <span className="font-extrabold text-amber-300">WCT Prestasi</span>
                  </div>
                  <div className="text-[10px] text-slate-300 font-normal leading-tight">
                    Jadwal Atlet Resmi 4x/Minggu
                  </div>
                </button>

                {/* SINGLE SLOT MODE */}
                <button
                  type="button"
                  onClick={() => setStoryMode('single')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-left flex flex-col gap-1 cursor-pointer ${
                    storyMode === 'single'
                      ? 'bg-cyan-950/60 border-cyan-400 text-white shadow-md ring-1 ring-cyan-400/50'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-cyan-400">
                    <Flame className="w-4 h-4 shrink-0 text-amber-400" />
                    <span>Slot Pilihan</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-normal leading-tight">
                    1 Sesi Spesifik &amp; Urgensi
                  </div>
                </button>

                {/* RECAP MODE */}
                <button
                  type="button"
                  onClick={() => setStoryMode('recap')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-left flex flex-col gap-1 cursor-pointer ${
                    storyMode === 'recap'
                      ? 'bg-cyan-950/60 border-cyan-400 text-white shadow-md ring-1 ring-cyan-400/50'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-cyan-400">
                    <Calendar className="w-4 h-4 shrink-0" />
                    <span>Rekap Kolam</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-normal leading-tight">
                    3 Sesi (Prioritas WCT)
                  </div>
                </button>
              </div>
            </div>

            {/* WCT SUB-INFO BANNER WHEN WCT MODE IS SELECTED */}
            {storyMode === 'wct' && (
              <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-xs text-amber-200 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-amber-300">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Jadwal Resmi Wavora Competition Team (WCT):</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  {currentPool.id === 'pahoman'
                    ? 'Kolam Pahoman: Senin, Rabu, Kamis, Sabtu (15:30 - 17:30 WIB) • Pelatih: Coach Rian & Tim Prestasi'
                    : 'Kolam Unila: Selasa, Kamis, Jumat, Minggu (15:30 - 17:30 WIB) • Pelatih: Coach Ariyoga & Tim Prestasi'}
                </p>
                <div className="flex items-center gap-2 pt-1 text-[11px] text-amber-300 font-mono">
                  <span>✓ Biomekanik 4 Gaya</span>
                  <span>✓ Video Underwater</span>
                  <span>✓ O2SN &amp; Kejurda</span>
                </div>
              </div>
            )}

            {/* 2. Slot Selection (If single mode) */}
            {storyMode === 'single' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold block">
                    2. Pilih Sesi / Slot Jadwal:
                  </label>

                  {/* Filter tabs inside single mode */}
                  <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setSlotCategoryFilter('all')}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                        slotCategoryFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400'
                      }`}
                    >
                      Semua
                    </button>
                    <button
                      type="button"
                      onClick={() => setSlotCategoryFilter('wct')}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors flex items-center gap-1 ${
                        slotCategoryFilter === 'wct' ? 'bg-amber-500/30 text-amber-300' : 'text-slate-400'
                      }`}
                    >
                      <Trophy className="w-2.5 h-2.5 text-amber-400" />
                      <span>Khusus WCT</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSlotCategoryFilter('regular')}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                        slotCategoryFilter === 'regular' ? 'bg-cyan-500/30 text-cyan-300' : 'text-slate-400'
                      }`}
                    >
                      Reguler
                    </button>
                  </div>
                </div>

                <select
                  value={selectedSlotId}
                  onChange={(e) => {
                    setSelectedSlotId(e.target.value);
                    const chosen = poolSlots.find((s) => s.id === e.target.value);
                    if (chosen && (chosen.classType === 'prestasi' || chosen.isWCT)) {
                      setTheme('gold');
                      setHeadline('JADWAL ATLET PRESTASI WCT (4X/MINGGU)');
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                >
                  {filteredSingleSlots.map((slot) => {
                    const isWct = slot.classType === 'prestasi' || slot.isWCT || slot.programTitle.includes('WCT');
                    return (
                      <option key={slot.id} value={slot.id}>
                        {isWct ? '🏆 [WCT 4x/Mgg] ' : ''}
                        {slot.day.toUpperCase()} ({slot.time}) - {slot.programTitle} [Sisa {slot.availableSlots} Slot]
                      </option>
                    );
                  })}
                </select>
              </div>
            )}

            {/* Recap Mode Options */}
            {storyMode === 'recap' && (
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold block">
                  2. Susunan Rekap Jadwal:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRecapModeFilter('mixed')}
                    className={`p-2 rounded-xl border text-[11px] font-bold text-center transition-all ${
                      recapModeFilter === 'mixed'
                        ? 'bg-slate-800 border-cyan-400 text-white shadow-md'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div>⭐ Rekap Campur</div>
                    <div className="text-[9px] text-slate-400 font-normal">WCT Prioritas + Reguler</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRecapModeFilter('wct_all');
                      setTheme('gold');
                      setHeadline('JADWAL ATLET PRESTASI WCT (4X/MINGGU)');
                    }}
                    className={`p-2 rounded-xl border text-[11px] font-bold text-center transition-all ${
                      recapModeFilter === 'wct_all'
                        ? 'bg-amber-950/70 border-amber-400 text-amber-300 shadow-md'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div>🏆 Khusus WCT</div>
                    <div className="text-[9px] text-slate-400 font-normal">Semua Hari Latihan WCT</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRecapModeFilter('regular')}
                    className={`p-2 rounded-xl border text-[11px] font-bold text-center transition-all ${
                      recapModeFilter === 'regular'
                        ? 'bg-slate-800 border-cyan-400 text-white shadow-md'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div>🏊 Reguler Saja</div>
                    <div className="text-[9px] text-slate-400 font-normal">Tadpole, Junior &amp; VIP</div>
                  </button>
                </div>
              </div>
            )}

            {/* 3. Theme Preset */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold block">
                3. Tema Visual Estetik:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'gold', label: 'WCT Prestasi', desc: 'Gold Kejuaraan', color: 'from-amber-400 to-yellow-500' },
                  { id: 'ocean', label: 'Wavora Ocean', desc: 'Biru Cyan Segar', color: 'from-cyan-500 to-teal-500' },
                  { id: 'midnight', label: 'Midnight Luxury', desc: 'Hitam Atletik', color: 'from-slate-700 to-slate-900' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTheme(t.id as any)}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      theme === t.id
                        ? 'bg-slate-800 border-cyan-400 shadow-md ring-1 ring-cyan-400/50'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
                    }`}
                  >
                    <div className={`w-full h-2 rounded-full bg-gradient-to-r ${t.color} mb-1.5`} />
                    <div className="text-xs font-bold text-white">{t.label}</div>
                    <div className="text-[10px] text-slate-400">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Custom Headline Ribbon Text */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold block">
                4. Teks Pita Pengumuman / Urgensi:
              </label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="Contoh: JADWAL ATLET PRESTASI WCT (4X/MINGGU)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
              />
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {[
                  'JADWAL ATLET PRESTASI WCT (4X/MINGGU)',
                  'KUNCI SLOT SEBELUM PENUH!',
                  'SLOT TERBATAS — SISA KUOTA ATLET!',
                  'PENDAFTARAN RESMI DIBUKA',
                ].map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setHeadline(h)}
                    className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>

            {/* Advice Box */}
            <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 text-xs text-slate-300 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-cyan-300">
                <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Format Resmi Wavora Aquatic Academy (1080x1920)</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-300 leading-relaxed">
                <li>
                  <strong>Rasio 9:16 HD Pas</strong>: Tampil penuh di layar Instagram tanpa terpotong atau buram.
                </li>
                <li>
                  <strong>Sorot Menu WCT 4x/Minggu</strong>: Format visual khusus untuk atlet kejuaraan &amp; siswa reguler.
                </li>
                <li>
                  <strong>Kartu Otoritas &amp; Jaminan Mutu</strong>: Menampilkan 3 pilar standar resmi Wavora dan ruang bebas untuk menempelkan stiker link IG asli Anda.
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                type="button"
                onClick={handleDownload}
                disabled={downloading}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 hover:brightness-110 text-slate-950 font-athletic font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/50 cursor-pointer active:scale-95 transition-all"
              >
                {downloading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>{downloading ? 'Memproses PNG...' : 'Download Gambar Story (PNG)'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyCaption}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                {copiedCaption ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4 text-cyan-400" />
                )}
                <span>{copiedCaption ? 'Caption Tersalin!' : 'Salin Teks Caption IG'}</span>
              </button>
            </div>

          </div>

          {/* Live 9:16 Canvas Preview Column (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="flex items-center justify-between w-full max-w-[280px] sm:max-w-[320px] mb-2">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                Preview Story (9:16):
              </span>
              <span className="text-[10px] font-mono text-amber-300 font-semibold">
                {storyMode === 'wct' ? '🏆 WCT 4x/Mgg' : storyMode === 'recap' ? '📋 Rekap' : '⚡ Single'}
              </span>
            </div>

            {/* Simulated Phone Frame with Shadow */}
            <div className="relative w-full max-w-[280px] sm:max-w-[320px] rounded-[36px] p-2.5 bg-gradient-to-b from-slate-700 to-slate-900 shadow-2xl border-2 border-slate-600/60">
              {/* Phone Speaker Notch */}
              <div className="w-20 h-4 bg-slate-950 rounded-full mx-auto mb-1.5 flex items-center justify-center">
                <div className="w-8 h-1 bg-slate-800 rounded-full" />
              </div>

              {/* Canvas Preview Container (Aspect Ratio 9:16) */}
              <div className="relative w-full aspect-[9/16] rounded-[26px] overflow-hidden bg-slate-950 shadow-inner">
                <canvas
                  ref={canvasRef}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="mt-3 text-center text-[11px] text-slate-400 flex items-center gap-1">
              <Camera className="w-3.5 h-3.5 text-cyan-400" />
              <span>Gambar siap di-post langsung ke Instagram Story @wavoraaquaticacademy</span>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>Akses Khusus Founder &amp; Manajemen Wavora Aquatic Academy.</span>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-300 hover:text-white font-semibold cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
