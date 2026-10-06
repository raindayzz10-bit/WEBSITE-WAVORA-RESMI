export type ClassType = 
  | 'reguler'
  | 'privat'
  | 'twins_reguler'
  | 'twins_privat'
  | 'hydrotherapy'
  | 'prestasi';

export type SessionCount = 4 | 8 | 16;

export type PoolLocationId = 'pahoman' | 'unila';

export interface PricePackage {
  id: ClassType;
  name: string;
  badge: string;
  description: string;
  ratio: string;
  prices: {
    4?: number;
    8?: number;
    16?: number;
    [key: number]: number | undefined;
  };
  features: string[];
  popular?: boolean;
}

export interface PoolLocation {
  id: PoolLocationId;
  name: string;
  shortName: string;
  badge: string;
  address: string;
  city: string;
  schedule: string;
  timeSlot: string;
  highlight: string;
  features: string[];
  mapEmbedQuery: string;
}

export type AgeGroupId = 'toddler' | 'junior' | 'teen_athlete';

export interface MilestoneStage {
  stageNumber: number;
  timeframe: string; // e.g. "Bulan Ke-1"
  phaseTitle: string;
  description: string;
  skills: string[];
  biomechanicsTarget: string;
  assessmentMetric: string;
}

export interface AgeGroupRoadmap {
  id: AgeGroupId;
  label: string;
  ageRange: string;
  tagline: string;
  iconName: string;
  stages: MilestoneStage[];
}

export type ProgramCategory = 'all' | 'beginner' | 'intermediate' | 'advanced';

export interface ProgramCurriculum {
  id: string;
  category: 'beginner' | 'intermediate' | 'advanced';
  title: string;
  subtitle: string;
  ageBracket: string;
  ratio: string;
  intensity: 'Low' | 'Medium' | 'High' | 'Competitive';
  badge: string;
  summary: string;
  coreCompetencies: string[];
  graduatingCriteria: string[];
  weeklyModuleFocus: {
    week: string;
    topic: string;
    detail: string;
  }[];
}

export interface QuizQuestion {
  id: number;
  question: string;
  subtitle: string;
  options: {
    text: string;
    description: string;
    score: number; // 1 = beginner, 2 = intermediate, 3 = advanced
    levelMatch: 'beginner' | 'intermediate' | 'advanced';
  }[];
}

export interface AthleteProfile {
  id?: string;
  athleteName: string;
  birthDate?: string;
  age: string;
  gender: 'Laki-laki' | 'Perempuan' | '';
  waterExperience: 'Belum Pernah' | 'Takut Air' | 'Bisa Mengapung' | 'Bisa Berenang Dasar' | 'Ingin Prestasi' | '';
  medicalNotes?: string;
}

export interface RegistrationFormData {
  // Step 1: Multiple Athletes (Support for 1, 2, 3+ children in one form)
  athletes?: AthleteProfile[];

  // Step 1: Athlete (kept for backwards compatibility)
  athleteName: string;
  birthDate: string;
  age: string;
  gender: 'Laki-laki' | 'Perempuan' | '';
  waterExperience: 'Belum Pernah' | 'Takut Air' | 'Bisa Mengapung' | 'Bisa Berenang Dasar' | 'Ingin Prestasi' | '';
  medicalNotes: string;

  // Step 2: Parent / Guardian
  parentName: string;
  whatsapp: string;
  email: string;
  relationship: 'Ayah' | 'Ibu' | 'Wali' | '';

  // Step 3: Package & Location
  classType: ClassType;
  sessions: SessionCount;
  location: PoolLocationId;
  preferredDay: string;
  preferredTime: string;

  // Step 4: Notes
  specialNotes?: string;
  agreedTerms: boolean;
}

export type RegistrationStatus = 'pending' | 'verified';

export interface RegistrationRecord {
  id: string;
  ticketCode: string;
  athleteName: string;
  age: string | number;
  gender: 'Laki-laki' | 'Perempuan';
  parentName: string;
  whatsapp: string;
  email?: string;
  programCategory: string;
  classType: ClassType;
  sessions: SessionCount;
  location: PoolLocationId;
  preferredDay: string;
  totalEstimate: number;
  waterExperience: string;
  medicalNotes?: string;
  status: RegistrationStatus;
  createdAt: string; // ISO 8601 string
  athletes?: AthleteProfile[];
  athleteCount?: number;
}

export interface RegistrationTicket {
  ticketCode: string;
  submittedAt: string;
  formData: RegistrationFormData;
  totalEstimate: number;
  rawPrice?: number;
  voucherInfo?: {
    code: string;
    discount: number;
    finalPrice: number;
    title: string;
  };
}

export interface Voucher {
  code: string;
  title: string;
  discountAmount: number;
  description: string;
  minSessions?: 4 | 8;
  badgeText?: string;
  active: boolean;
  isActive?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  actionButton?: {
    label: string;
    url?: string;
    targetSection?: string;
  };
}

// ==========================================
// WOS v3 - Wavora Operating System Types
// ==========================================

export type SkillStatus = 'mastered' | 'in_progress' | 'pending';

export interface SkillMasteryItem {
  id: string;
  category: 'water_confidence' | 'freestyle' | 'breaststroke' | 'backstroke' | 'safety';
  title: string;
  score: number; // 0 - 100
  status: SkillStatus;
  benchmark: string;
  verifiedByCoach: string;
}

export interface SessionAttendanceLog {
  id: string;
  sessionNumber: number;
  date: string;
  poolLocation: PoolLocationId;
  coachName: string;
  drillsFocus: string;
  coachNotes: string;
  completed: boolean;
  athleteMoodScore: 1 | 2 | 3 | 4 | 5; // 5 = excellent enthusiasm
}

export interface WOSMilestoneBadge {
  id: string;
  title: string;
  category: string;
  earnedDate: string;
  iconType: 'trophy' | 'target' | 'heart' | 'star' | 'zap';
}

export interface WOSAthleteRecord {
  id: string; // e.g. "WVR-2026-RAYYAN"
  fullName: string;
  nickName: string;
  gender: 'Laki-laki' | 'Perempuan';
  age: number;
  joinedDate: string;
  currentLevel: 'Beginner (Water Foundation)' | 'Intermediate (Stroke Development)' | 'Advanced (Competitive Pre-Squad)';
  activeProgram: string;
  coachInCharge: string;
  poolHomebase: PoolLocationId;
  avatarUrl?: string;

  // Athletic Quantitative Biometrics
  metrics: {
    totalDistanceMeters: number;
    completedSessions: number;
    totalTargetSessions: number;
    attendanceRatePercent: number;
    distancePerStrokeCm: number;
    breathingConsistencyPercent: number;
    kickStaminaIndexScore: number;
  };

  // Qualitative Evaluations
  coachSummary: {
    lastUpdated: string;
    strengths: string;
    focusNextWeek: string;
    readinessForPromotion: boolean;
    promotionNotes: string;
  };

  skills: SkillMasteryItem[];
  attendanceLogs: SessionAttendanceLog[];
  badges: WOSMilestoneBadge[];
}

export type DayOfWeek = 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu' | 'Minggu';

export interface ScheduleSlot {
  id: string;
  locationId: PoolLocationId;
  day: DayOfWeek;
  dayType: 'weekday' | 'weekend';
  time: string;
  sessionPeriod: 'pagi' | 'sore';
  programTitle: string;
  classType: ClassType;
  targetGroup: string;
  coachName: string;
  totalQuota: number;
  bookedQuota: number;
  availableSlots: number;
  status: 'available' | 'limited' | 'full';
  highlightTag?: string;
  weeklyFrequency?: string; // e.g. "4x Latihan / Minggu"
  isWCT?: boolean;
}

export type FAQCategory = 'all' | 'curriculum' | 'schedule' | 'pricing' | 'gear';

export interface CategorizedFAQ {
  id: string;
  category: FAQCategory;
  question: string;
  answer: string;
  badge?: string;
}

