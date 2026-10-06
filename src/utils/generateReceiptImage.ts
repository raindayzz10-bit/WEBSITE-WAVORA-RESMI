import { RegistrationTicket } from '../types';

export interface GenerateReceiptOptions {
  ticket: RegistrationTicket;
  packageName: string;
  locationName: string;
  locationTime?: string;
  theme?: 'receipt' | 'cyber';
}

/**
 * Generates an HD PNG Data URL of the official Wavora Registration Receipt / Invoice
 * using HTML5 Canvas with sharp typography, itemized pricing, barcode, and stamps.
 */
export const generateReceiptCanvas = (options: GenerateReceiptOptions): HTMLCanvasElement => {
  const { ticket, packageName, locationName, locationTime = '', theme = 'receipt' } = options;

  const width = 720;
  const height = 1120;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const isReceipt = theme === 'receipt';

  // Format IDR currency
  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  if (isReceipt) {
    // -------------------------------------------------------------
    // THEME: THERMAL PAPER RECEIPT (Putih Kasir Modern)
    // -------------------------------------------------------------
    // Paper background with slight warm gray tone
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, width, height);

    // Main paper card with shadow simulation
    const margin = 24;
    const paperW = width - margin * 2;
    const paperH = height - margin * 2 - 20;

    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 12;
    ctx.fillRect(margin, margin, paperW, paperH);
    ctx.shadowColor = 'transparent';

    // Outer subtle border
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(margin, margin, paperW, paperH);

    // Zig-zag jagged tear effect at the bottom of the receipt paper
    ctx.fillStyle = '#f8fafc';
    const teethCount = 28;
    const toothW = paperW / teethCount;
    const toothH = 12;
    ctx.beginPath();
    ctx.moveTo(margin, margin + paperH);
    for (let i = 0; i < teethCount; i++) {
      const x = margin + i * toothW;
      const y = margin + paperH;
      ctx.lineTo(x + toothW / 2, y - toothH);
      ctx.lineTo(x + toothW, y);
    }
    ctx.lineTo(margin + paperW, margin + paperH + 25);
    ctx.lineTo(margin, margin + paperH + 25);
    ctx.closePath();
    ctx.fill();

    // Top cyan/teal accent bar
    ctx.fillStyle = '#06b6d4';
    ctx.fillRect(margin, margin, paperW, 8);

    // Header Content
    let curY = margin + 45;

    // Brand Title
    ctx.textAlign = 'center';
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 28px "Inter", "Segoe UI", Arial, sans-serif';
    ctx.fillText('WAVORA AQUATIC ACADEMY', width / 2, curY);

    curY += 22;
    ctx.fillStyle = '#0284c7';
    ctx.font = 'bold 13px "Courier New", monospace';
    ctx.fillText('BUKTI PENDAFTARAN & INVOICE RESMI', width / 2, curY);

    curY += 18;
    ctx.fillStyle = '#64748b';
    ctx.font = 'italic 12px "Inter", Arial, sans-serif';
    ctx.fillText('“One Wave, One Family” • Bandar Lampung', width / 2, curY);

    // Dotted separator helper
    const drawDottedLine = (y: number) => {
      ctx.save();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(margin + 20, y);
      ctx.lineTo(margin + paperW - 20, y);
      ctx.stroke();
      ctx.restore();
    };

    curY += 22;
    drawDottedLine(curY);

    // Ticket Code & Submission Date
    curY += 32;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#0f172a';
    ctx.font = '900 24px "Courier New", monospace';
    ctx.fillText(ticket.ticketCode, width / 2, curY);

    curY += 20;
    ctx.fillStyle = '#64748b';
    ctx.font = '12px "Courier New", monospace';
    ctx.fillText(`WAKTU DAFTAR: ${ticket.submittedAt} WIB`, width / 2, curY);

    curY += 22;
    drawDottedLine(curY);

    // Section 1: Calon Atlet & Wali
    curY += 30;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#0284c7';
    ctx.font = 'bold 12px "Courier New", monospace';
    ctx.fillText('[ DATA CALON ATLET & ORANG TUA ]', margin + 30, curY);

    const drawRow = (label: string, val: string, y: number, isBold: boolean = false) => {
      ctx.fillStyle = '#64748b';
      ctx.font = '13px "Inter", Arial, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(label, margin + 30, y);

      ctx.fillStyle = '#0f172a';
      ctx.font = isBold ? 'bold 13px "Inter", Arial, sans-serif' : '13px "Inter", Arial, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(val, margin + paperW - 30, y);
    };

    curY += 26;
    const athleteCount = ticket.formData.athletes?.length || 1;
    const athleteLabel = athleteCount > 1 ? `Calon Atlet (${athleteCount} Anak)` : 'Nama Calon Atlet';
    drawRow(athleteLabel, ticket.formData.athleteName || '-', curY, true);
    curY += 22;
    drawRow('Usia / Gender', `${ticket.formData.age} Th • ${ticket.formData.gender || '-'}`, curY);
    curY += 22;
    drawRow('Nama Orang Tua / Wali', ticket.formData.parentName || '-', curY);
    curY += 22;
    drawRow('Nomor WhatsApp', ticket.formData.whatsapp || '-', curY, true);
    curY += 22;
    drawRow('Pengalaman di Air', ticket.formData.waterExperience || 'Belum Pernah', curY);

    curY += 25;
    drawDottedLine(curY);

    // Section 2: Program & Venue
    curY += 30;
    ctx.fillStyle = '#0284c7';
    ctx.font = 'bold 12px "Courier New", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('[ PROGRAM & LOKASI LATIHAN ]', margin + 30, curY);

    curY += 26;
    drawRow('Paket Kelas', packageName, curY, true);
    curY += 22;
    drawRow('Jumlah Pertemuan', `${ticket.formData.sessions}x Sesi / Bulan`, curY);
    curY += 22;
    drawRow('Venue Kolam', `${locationName} (${locationTime})`, curY);
    curY += 22;
    drawRow('Preferensi Hari', ticket.formData.preferredDay || 'Sabtu & Minggu', curY);

    curY += 25;
    drawDottedLine(curY);

    // Section 3: Financial Summary / Invoice breakdown
    curY += 30;
    ctx.fillStyle = '#0284c7';
    ctx.font = 'bold 12px "Courier New", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('[ RINCIAN INVESTASI & BIAYA ]', margin + 30, curY);

    const normalPrice = ticket.rawPrice || (ticket.voucherInfo ? ticket.totalEstimate + ticket.voucherInfo.discount : ticket.totalEstimate);
    curY += 26;
    drawRow('Biaya Paket Normal', formatRupiah(normalPrice), curY);

    if (ticket.voucherInfo && ticket.voucherInfo.discount > 0) {
      curY += 22;
      ctx.fillStyle = '#059669';
      ctx.font = 'bold 13px "Inter", Arial, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`Kupon Voucher (${ticket.voucherInfo.code})`, margin + 30, curY);

      ctx.textAlign = 'right';
      ctx.fillText(`- ${formatRupiah(ticket.voucherInfo.discount)}`, margin + paperW - 30, curY);
    }

    curY += 25;
    // Total highlight box
    ctx.fillStyle = '#f0fdf4';
    ctx.fillRect(margin + 20, curY, paperW - 40, 52);
    ctx.strokeStyle = '#86efac';
    ctx.lineWidth = 1;
    ctx.strokeRect(margin + 20, curY, paperW - 40, 52);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#166534';
    ctx.font = 'bold 14px "Inter", Arial, sans-serif';
    ctx.fillText('TOTAL ESTIMASI INVESTASI:', margin + 36, curY + 32);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#15803d';
    ctx.font = '900 22px "Inter", Arial, sans-serif';
    ctx.fillText(formatRupiah(ticket.totalEstimate), margin + paperW - 36, curY + 33);

    curY += 75;

    // Simulation of barcode
    const barcodeY = curY;
    const barcodeW = paperW - 140;
    const barcodeX = margin + 70;
    const barcodeH = 42;

    ctx.fillStyle = '#0f172a';
    // Draw pseudorandom barcode bars based on ticketCode
    let curBarX = barcodeX;
    const seed = ticket.ticketCode.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    let pseudoRand = seed;
    while (curBarX < barcodeX + barcodeW) {
      pseudoRand = (pseudoRand * 9301 + 49297) % 233280;
      const barW = (pseudoRand % 4) + 1.5;
      const isSpace = (pseudoRand % 7) > 4;
      if (!isSpace) {
        ctx.fillRect(curBarX, barcodeY, barW, barcodeH);
      }
      curBarX += barW + (pseudoRand % 3);
    }

    curY += 58;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#475569';
    ctx.font = '11px "Courier New", monospace';
    ctx.fillText(`* ${ticket.ticketCode} * VERIFIED ENTRY`, width / 2, curY);

    // Official Digital Stamp (rotated watermark)
    ctx.save();
    ctx.translate(margin + paperW - 120, curY - 50);
    ctx.rotate((-14 * Math.PI) / 180);
    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(-80, -22, 160, 44);
    ctx.fillStyle = '#059669';
    ctx.font = 'bold 11px "Inter", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('WAVORA VERIFIED', 0, -4);
    ctx.font = '9px "Inter", Arial, sans-serif';
    ctx.fillText('SIAP KONFIRMASI WA', 0, 12);
    ctx.restore();

    // Footer instruction notes
    curY += 32;
    drawDottedLine(curY);

    curY += 24;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#64748b';
    ctx.font = '11px "Inter", Arial, sans-serif';
    ctx.fillText('Harap kirimkan struk ini ke WhatsApp Admin Wavora:', width / 2, curY);

    curY += 18;
    ctx.fillStyle = '#0284c7';
    ctx.font = 'bold 13px "Inter", Arial, sans-serif';
    ctx.fillText('WA Admin: 0896-3418-9392 (Resmi)', width / 2, curY);

    curY += 20;
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'italic 10px "Inter", Arial, sans-serif';
    ctx.fillText('Dokumen resmi dikeluarkan otomatis oleh sistem WOS v3 Academy.', width / 2, curY);

  } else {
    // -------------------------------------------------------------
    // THEME: CYBER ATHLETIC VIP PASS (Tema Gelap Neon Khas Wavora)
    // -------------------------------------------------------------
    // Gradient dark background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#030712');
    bgGrad.addColorStop(0.5, '#091528');
    bgGrad.addColorStop(1, '#020617');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    const margin = 26;
    const cardW = width - margin * 2;
    const cardH = height - margin * 2;

    // Card frame
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2;
    ctx.strokeRect(margin, margin, cardW, cardH);

    // Glowing corners
    const drawCorner = (x: number, y: number, size: number) => {
      ctx.fillStyle = '#22d3ee';
      ctx.fillRect(x - 2, y - 2, size, 4);
      ctx.fillRect(x - 2, y - 2, 4, size);
    };
    drawCorner(margin, margin, 24);
    drawCorner(margin + cardW - 22, margin, 24);
    drawCorner(margin, margin + cardH - 22, 24);
    drawCorner(margin + cardW - 22, margin + cardH - 22, 24);

    let curY = margin + 50;

    // Header Badge
    ctx.textAlign = 'center';
    ctx.fillStyle = '#06b6d4';
    ctx.font = 'bold 12px "Courier New", monospace';
    ctx.fillText('/// WAVORA OPERATING SYSTEM v3.0 • VIP ATHLETE PASS ///', width / 2, curY);

    curY += 32;
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 32px "Inter", Arial, sans-serif';
    ctx.fillText('WAVORA AQUATIC', width / 2, curY);

    curY += 22;
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 14px "Inter", Arial, sans-serif';
    ctx.fillText('“ONE WAVE, ONE FAMILY” • RESMI TERVERIFIKASI', width / 2, curY);

    curY += 28;
    // Divider
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(margin + 20, curY);
    ctx.lineTo(margin + cardW - 20, curY);
    ctx.stroke();

    // Big Code Display
    curY += 38;
    ctx.fillStyle = '#22d3ee';
    ctx.font = '900 30px "Courier New", monospace';
    ctx.fillText(ticket.ticketCode, width / 2, curY);

    curY += 20;
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px "Inter", Arial, sans-serif';
    ctx.fillText(`ID Transaksi Terdaftar • ${ticket.submittedAt}`, width / 2, curY);

    curY += 30;
    ctx.strokeStyle = '#1e293b';
    ctx.stroke();

    // Data grid inside card
    const drawCyberRow = (label: string, val: string, y: number, isCyan: boolean = false) => {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '13px "Courier New", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(label.toUpperCase(), margin + 36, y);

      ctx.fillStyle = isCyan ? '#22d3ee' : '#ffffff';
      ctx.font = isCyan ? 'bold 14px "Inter", Arial, sans-serif' : '13px "Inter", Arial, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(val, margin + cardW - 36, y);
    };

    curY += 20;
    const cyberAthleteCount = ticket.formData.athletes?.length || 1;
    const cyberAthleteLabel = cyberAthleteCount > 1 ? `Atlet (${cyberAthleteCount} Anak)` : 'Nama Atlet';
    drawCyberRow(cyberAthleteLabel, ticket.formData.athleteName || '-', curY, true);
    curY += 26;
    drawCyberRow('Usia / Gender', `${ticket.formData.age} Th • ${ticket.formData.gender}`, curY);
    curY += 26;
    drawCyberRow('Orang Tua / Wali', ticket.formData.parentName || '-', curY);
    curY += 26;
    drawCyberRow('WhatsApp Terdaftar', ticket.formData.whatsapp || '-', curY, true);
    curY += 26;
    drawCyberRow('Paket Kelas', packageName, curY);
    curY += 26;
    drawCyberRow('Sesi Pertemuan', `${ticket.formData.sessions}x Pertemuan / Bulan`, curY);
    curY += 26;
    drawCyberRow('Lokasi Kolam', locationName, curY);

    curY += 35;
    // Highlight investment box
    ctx.fillStyle = 'rgba(6, 182, 212, 0.12)';
    ctx.fillRect(margin + 20, curY, cardW - 40, 60);
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.5)';
    ctx.strokeRect(margin + 20, curY, cardW - 40, 60);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 12px "Courier New", monospace';
    ctx.fillText('ESTIMASI INVESTASI:', margin + 36, curY + 36);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#34d399';
    ctx.font = '900 24px "Inter", Arial, sans-serif';
    ctx.fillText(formatRupiah(ticket.totalEstimate), margin + cardW - 36, curY + 38);

    curY += 90;
    // Bottom instructions
    ctx.textAlign = 'center';
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 13px "Inter", Arial, sans-serif';
    ctx.fillText('HUBUNGI ADMIN VIA WHATSAPP (0896-3418-9392)', width / 2, curY);

    curY += 20;
    ctx.fillStyle = '#64748b';
    ctx.font = '11px "Inter", Arial, sans-serif';
    ctx.fillText('Lampirkan dokumen tiket ini untuk memverifikasi ketersediaan kuota jadwal.', width / 2, curY);
  }

  return canvas;
};

/**
 * Downloads the receipt image as a file onto the user's mobile or computer
 */
export const downloadReceiptImage = (options: GenerateReceiptOptions): void => {
  const canvas = generateReceiptCanvas(options);
  const dataUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = `Struk-Wavora-${options.ticket.ticketCode}.png`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Uses Web Share API (native WhatsApp share on Android/iOS) if supported,
 * otherwise triggers image download and resolves to false so caller can fallback to wa.me link.
 */
export const shareReceiptImageToWhatsApp = async (
  options: GenerateReceiptOptions
): Promise<{ success: boolean; sharedDirectly: boolean }> => {
  const canvas = generateReceiptCanvas(options);

  return new Promise((resolve) => {
    canvas.toBlob(async (blob) => {
      if (!blob) {
        downloadReceiptImage(options);
        resolve({ success: true, sharedDirectly: false });
        return;
      }

      const file = new File([blob], `Struk-Wavora-${options.ticket.ticketCode}.png`, {
        type: 'image/png',
      });

      // Check if navigator.canShare supports files
      if (
        navigator.canShare &&
        navigator.canShare({ files: [file] }) &&
        navigator.share
      ) {
        try {
          await navigator.share({
            title: `Tiket Pendaftaran Wavora - ${options.ticket.ticketCode}`,
            text: `Halo Admin Wavora, berikut struk pendaftaran resmi kami untuk ${options.ticket.formData.athleteName} (Kode: ${options.ticket.ticketCode}).`,
            files: [file],
          });
          resolve({ success: true, sharedDirectly: true });
          return;
        } catch (err: any) {
          // If user cancelled the share dialog or browser failed, fallback to download
          if (err.name !== 'AbortError') {
            downloadReceiptImage(options);
          }
          resolve({ success: true, sharedDirectly: false });
          return;
        }
      }

      // If Web Share files is not supported (e.g. desktop Chrome), trigger download
      downloadReceiptImage(options);
      resolve({ success: true, sharedDirectly: false });
    }, 'image/png');
  });
};
