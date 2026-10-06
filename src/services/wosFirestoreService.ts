import { WOSAthleteRecord } from '../types';

/**
 * Wavora Operating System (WOS v3) - Decoupled Firestore Service
 * Architecture: Decoupled listener interface with guaranteed unsubscription lifecycle.
 * Prevents memory leaks, unneeded network polling, and unnecessary document reads/billing spikes.
 */

export type Unsubscribe = () => void;

// Pre-seeded authentic athletic athlete profile
export const SEED_ATHLETES: Record<string, WOSAthleteRecord> = {
  'WVR-2026-RAYYAN': {
    id: 'WVR-2026-RAYYAN',
    fullName: 'Muhammad Rayyan Al-Farizi',
    nickName: 'Rayyan',
    gender: 'Laki-laki',
    age: 7,
    joinedDate: '12 Januari 2026',
    currentLevel: 'Intermediate (Stroke Development)',
    activeProgram: 'Class Reguler • 8x Sesi/Bulan',
    coachInCharge: 'Coach Kurniawan (World Aquatics Cert.)',
    poolHomebase: 'pahoman',
    metrics: {
      totalDistanceMeters: 4850,
      completedSessions: 14,
      totalTargetSessions: 16,
      attendanceRatePercent: 87.5,
      distancePerStrokeCm: 118,
      breathingConsistencyPercent: 92,
      kickStaminaIndexScore: 88,
    },
    coachSummary: {
      lastUpdated: '02 Maret 2026',
      strengths: 'Rotasi bahu gaya bebas sangat fluid; ritme napas bilateral 3:1 konsisten di 25 meter penuh.',
      focusNextWeek: 'Penyempurnaan glide pada gaya dada dan transisi flip-turn tanpa menyentuh dasar kolam.',
      readinessForPromotion: true,
      promotionNotes: 'Direkomendasikan promosi ke Pre-Squad Junior O2SN pada evaluasi akhir bulan.',
    },
    skills: [
      {
        id: 'sk-1',
        category: 'water_confidence',
        title: 'Water Submersion & Buoyancy Balance',
        score: 100,
        status: 'mastered',
        benchmark: 'Menyelam 10 detik & mengapung bintang santai',
        verifiedByCoach: 'Coach Kurniawan',
      },
      {
        id: 'sk-2',
        category: 'freestyle',
        title: 'Freestyle High-Elbow Recovery (Kayuhan Atas)',
        score: 88,
        status: 'mastered',
        benchmark: 'Biomekanika siku tinggi tanpa hambatan lateral',
        verifiedByCoach: 'Coach Kurniawan',
      },
      {
        id: 'sk-3',
        category: 'freestyle',
        title: 'Bilateral Breathing Timing (Napas 3 Tarikan)',
        score: 92,
        status: 'mastered',
        benchmark: 'Punggung kepala tetap sejajar permukaan air',
        verifiedByCoach: 'Coach Kurniawan',
      },
      {
        id: 'sk-4',
        category: 'breaststroke',
        title: 'Breaststroke Whip Kick & Glide Timing',
        score: 74,
        status: 'in_progress',
        benchmark: 'Dorongan tumit simetris dengan streamline 2 detik',
        verifiedByCoach: 'Coach Kurniawan',
      },
      {
        id: 'sk-5',
        category: 'safety',
        title: 'Deep Water Treading (Injak Air 60 Detik)',
        score: 95,
        status: 'mastered',
        benchmark: 'Bertahan stabil di kedalaman 2.2m Kolam Pahoman',
        verifiedByCoach: 'Coach Kurniawan',
      },
    ],
    attendanceLogs: [
      {
        id: 'log-14',
        sessionNumber: 14,
        date: '02 Mar 2026',
        poolLocation: 'pahoman',
        coachName: 'Coach Kurniawan',
        drillsFocus: 'Sprint 25m freestyle, kickboard flutter speed, & deep treading',
        coachNotes: 'Stamina luar biasa. Waktu tempuh 25m tercatat 24.8 detik (rekor pribadi baru).',
        completed: true,
        athleteMoodScore: 5,
      },
      {
        id: 'log-13',
        sessionNumber: 13,
        date: '28 Feb 2026',
        poolLocation: 'pahoman',
        coachName: 'Coach Kurniawan',
        drillsFocus: 'Breaststroke arm pull sweep & head position drills',
        coachNotes: 'Koordinasi pernapasan semakin tenang. Lengan tidak lagi menarik terlalu dalam.',
        completed: true,
        athleteMoodScore: 4,
      },
      {
        id: 'log-12',
        sessionNumber: 12,
        date: '24 Feb 2026',
        poolLocation: 'unila',
        coachName: 'Coach Amanda',
        drillsFocus: 'Endurance swim 4x25m continuous & catchup drill',
        coachNotes: 'Postur streamline lurus. Ritme kayuhan stabil dari awal hingga akhir lap.',
        completed: true,
        athleteMoodScore: 5,
      },
      {
        id: 'log-11',
        sessionNumber: 11,
        date: '21 Feb 2026',
        poolLocation: 'pahoman',
        coachName: 'Coach Kurniawan',
        drillsFocus: 'Recovery session, underwater dolphin kicks, and fun relays',
        coachNotes: 'Anak sangat antusias dan aktif berinteraksi dengan teman satu tim.',
        completed: true,
        athleteMoodScore: 5,
      },
    ],
    badges: [
      {
        id: 'b-1',
        title: 'Water Safety Hero',
        category: 'Dasar Keselamatan',
        earnedDate: '18 Jan 2026',
        iconType: 'shield' as any,
      },
      {
        id: 'b-2',
        title: '25m Freestyle Finisher',
        category: 'Milestone Jarak',
        earnedDate: '08 Feb 2026',
        iconType: 'zap',
      },
      {
        id: 'b-3',
        title: 'Bilateral Breathing Master',
        category: 'Teknik Biomekanika',
        earnedDate: '22 Feb 2026',
        iconType: 'star',
      },
      {
        id: 'b-4',
        title: '85%+ Attendance Club',
        category: 'Disiplin Latihan',
        earnedDate: '01 Mar 2026',
        iconType: 'trophy',
      },
    ],
  },

  'WVR-2026-AISYAH': {
    id: 'WVR-2026-AISYAH',
    fullName: 'Aisyah Putri Azzahra',
    nickName: 'Aisyah',
    gender: 'Perempuan',
    age: 5,
    joinedDate: '05 Februari 2026',
    currentLevel: 'Beginner (Water Foundation)',
    activeProgram: 'Class Privat (1-on-1) • 8x Sesi/Bulan',
    coachInCharge: 'Coach Amanda (Early Childhood Spec.)',
    poolHomebase: 'unila',
    metrics: {
      totalDistanceMeters: 1250,
      completedSessions: 7,
      totalTargetSessions: 8,
      attendanceRatePercent: 87.5,
      distancePerStrokeCm: 75,
      breathingConsistencyPercent: 85,
      kickStaminaIndexScore: 80,
    },
    coachSummary: {
      lastUpdated: '01 Maret 2026',
      strengths: 'Rasa takut air sudah 100% hilang. Sekarang berani meluncur mandiri dengan wajah masuk ke air.',
      focusNextWeek: 'Latihan kayuhan tangan gaya anjing & transisi ke gaya bebas dasar tanpa pelampung punggung.',
      readinessForPromotion: false,
      promotionNotes: 'Masih membutuhkan 2-3 sesi penguatan pernapasan sebelum tes naik level ke Intermediate.',
    },
    skills: [
      {
        id: 'ask-1',
        category: 'water_confidence',
        title: 'Face Submersion & Bubble Blowing',
        score: 100,
        status: 'mastered',
        benchmark: 'Meniup gelembung 5 detik berturut-turut tanpa tersedak',
        verifiedByCoach: 'Coach Amanda',
      },
      {
        id: 'ask-2',
        category: 'water_confidence',
        title: 'Torpedo Glide (Meluncur Streamline 5m)',
        score: 85,
        status: 'mastered',
        benchmark: 'Meluncur mandiri dari dinding kolam',
        verifiedByCoach: 'Coach Amanda',
      },
      {
        id: 'ask-3',
        category: 'freestyle',
        title: 'Flutter Kick with Kickboard',
        score: 78,
        status: 'in_progress',
        benchmark: 'Tendangan lurus dari pangkal paha tanpa menekuk lutut berlebihan',
        verifiedByCoach: 'Coach Amanda',
      },
    ],
    attendanceLogs: [
      {
        id: 'alog-7',
        sessionNumber: 7,
        date: '01 Mar 2026',
        poolLocation: 'unila',
        coachName: 'Coach Amanda',
        drillsFocus: 'Torpedo glide tanpa papan & permainan ambil cincin di air dangkal',
        coachNotes: 'Kemajuan luar biasa! Aisyah tersenyum lebar dan minta belajar terus.',
        completed: true,
        athleteMoodScore: 5,
      },
    ],
    badges: [
      {
        id: 'ab-1',
        title: 'Brave Bubble Blower',
        category: 'Adaptasi Air',
        earnedDate: '10 Feb 2026',
        iconType: 'heart',
      },
      {
        id: 'ab-2',
        title: 'Torpedo Glider',
        category: 'Streamline',
        earnedDate: '24 Feb 2026',
        iconType: 'star',
      },
    ],
  },
};

/**
 * Service: Subscribes to real-time athlete progress card in WOS.
 * Architecture Note: Always returns an Unsubscribe function to tear down listener
 * when component unmounts or athleteId switches.
 */
export function subscribeAthleteProgress(
  athleteId: string,
  onUpdate: (data: WOSAthleteRecord | null) => void,
  onError: (err: Error) => void
): Unsubscribe {
  const normalizedId = athleteId.trim().toUpperCase();

  // Simulated latency for realistic athletic data fetching
  const timerId = setTimeout(() => {
    try {
      // 1. Explicit Error simulation case
      if (normalizedId === 'WVR-ERROR' || normalizedId === 'ERROR') {
        throw new Error('Gagal menghubungkan ke database WOS Firestore. Periksa koneksi jaringan kolam atau otorisasi orang tua.');
      }

      // 2. Explicit Empty state simulation case
      if (normalizedId === 'WVR-EMPTY' || normalizedId === 'EMPTY') {
        onUpdate(null);
        return;
      }

      // 3. Match from seeded athlete records
      if (SEED_ATHLETES[normalizedId]) {
        onUpdate(SEED_ATHLETES[normalizedId]);
        return;
      }

      // 4. Default fallback: If query begins with WVR-, create or match
      if (normalizedId.startsWith('WVR-')) {
        // Return structured new applicant draft or null if unregistered
        onUpdate(null);
      } else {
        // Unrecognized ID -> Empty State
        onUpdate(null);
      }
    } catch (error) {
      onError(error instanceof Error ? error : new Error('Terjadi kesalahan internal sinkronisasi WOS.'));
    }
  }, 450);

  // Return clean teardown function
  return () => {
    clearTimeout(timerId);
  };
}
