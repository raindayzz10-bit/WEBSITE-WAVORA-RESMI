/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { WaterCanvas } from './components/WaterCanvas';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { AcademyPillars } from './components/AcademyPillars';
import { RegistrationFlowSection } from './components/RegistrationFlowSection';
import { PriceCalculator } from './components/PriceCalculator';
import { RoadmapSection } from './components/RoadmapSection';
import { CurriculumSection } from './components/CurriculumSection';
import { LevelQuizModal } from './components/LevelQuizModal';
import { LocationScheduleModal } from './components/LocationScheduleModal';
import { RegistrationGate } from './components/RegistrationGate';
import { AthleteRegistrationsDashboard } from './components/AthleteRegistrationsDashboard';
import { Testimonials } from './components/Testimonials';
import { InteractiveScheduleSection } from './components/InteractiveScheduleSection';
import { BuddySquadBanner } from './components/BuddySquadBanner';
import { FAQSection } from './components/FAQSection';
import { ChatAssistantModal } from './components/ChatAssistantModal';
import { InteractiveDolphin } from './components/InteractiveDolphin';
import { Footer } from './components/Footer';
import { FluidWaveDivider } from './components/FluidWaveDivider';
import { FloatingQuickActionHub } from './components/FloatingQuickActionHub';
import { ClassType, SessionCount, PoolLocationId } from './types';
import { ADMIN_PHONE_INTL } from './data/academyData';
import { initSmoothScroll, smoothScrollTo } from './utils/smoothScroll';

export default function App() {
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Initialize Lenis smooth scroll engine across window
  useEffect(() => {
    const cleanup = initSmoothScroll();
    return cleanup;
  }, []);

  // Pre-selected package state passed to Registration Gate
  const [selectedPackageForRegistration, setSelectedPackageForRegistration] = useState<{
    classType: ClassType;
    sessions: SessionCount;
    location: PoolLocationId;
    voucherInfo?: {
      code: string;
      discount: number;
      finalPrice: number;
      title: string;
    };
    preferredDay?: string;
    preferredTime?: string;
  }>({
    classType: 'reguler',
    sessions: 8,
    location: 'pahoman',
  });

  const [registrationNotes, setRegistrationNotes] = useState<string>('');

  const scrollToSection = (sectionId: string) => {
    const cleanId = sectionId.replace('#', '');
    const targetElement = document.getElementById(cleanId) || document.getElementById(cleanId.replace('-section', ''));
    if (targetElement) {
      smoothScrollTo(targetElement, { offset: -70, duration: 1.2 });
    }
  };

  // When slot is chosen from interactive schedule section
  const handleSelectSlotFromScheduleSection = (slot: {
    locationId: PoolLocationId;
    classType: ClassType;
    preferredDay: string;
    preferredTime: string;
    programTitle: string;
  }) => {
    setSelectedPackageForRegistration((prev) => ({
      ...prev,
      location: slot.locationId,
      classType: slot.classType,
      preferredDay: slot.preferredDay,
      preferredTime: slot.preferredTime,
    }));
    setRegistrationNotes(`Booking Slot: ${slot.programTitle} (${slot.preferredDay}, ${slot.preferredTime})`);
    scrollToSection('registration-section');
  };

  // When package selected in calculator
  const handleSelectPackageFromCalculator = (pkg: {
    classType: ClassType;
    sessions: SessionCount;
    location: PoolLocationId;
    promoInfo?: {
      active: boolean;
      discount: number;
      finalPrice: number;
      promoName: string;
      voucherCode?: string;
    };
  }) => {
    setSelectedPackageForRegistration({
      classType: pkg.classType,
      sessions: pkg.sessions,
      location: pkg.location,
      voucherInfo: pkg.promoInfo?.active
        ? {
            code: pkg.promoInfo.voucherCode || '',
            discount: pkg.promoInfo.discount,
            finalPrice: pkg.promoInfo.finalPrice,
            title: pkg.promoInfo.promoName,
          }
        : undefined,
    });

    if (pkg.promoInfo?.active) {
      setRegistrationNotes(
        `Klaim Voucher: ${pkg.promoInfo.promoName} (Potongan Rp ${pkg.promoInfo.discount.toLocaleString('id-ID')} • Total Estimasi Rp ${pkg.promoInfo.finalPrice.toLocaleString('id-ID')})`
      );
    } else {
      setRegistrationNotes('');
    }

    scrollToSection('registration-section');
  };

  // When program selected from curriculum
  const handleSelectProgramFromCurriculum = (programTitle: string) => {
    setRegistrationNotes(`Rekomendasi Program: ${programTitle}`);
    scrollToSection('registration-section');
  };

  // When level quiz finishes
  const handleSelectLevelFromQuiz = (levelName: string) => {
    setRegistrationNotes(`Hasil Asesmen Online: ${levelName}`);
    scrollToSection('registration-section');
  };

  // When location selected from schedule modal
  const handleSelectLocationFromSchedule = (locId: PoolLocationId) => {
    setSelectedPackageForRegistration((prev) => ({
      ...prev,
      location: locId,
    }));
    scrollToSection('registration-section');
  };

  // When Buddy Squad promo is claimed
  const handleClaimBuddySquadPromo = () => {
    setSelectedPackageForRegistration({
      classType: 'reguler',
      sessions: 8,
      voucherInfo: {
        code: 'BUDDYSQUAD',
        discount: 100000,
        finalPrice: 400000,
        title: 'Promo Wavora Buddy Squad (2-4 Atlet)',
      },
    });
    setRegistrationNotes('Klaim Promo: Wavora Buddy Squad (Pendaftaran Kolektif 2-4 Atlet). Kode Voucher: BUDDYSQUAD');
    scrollToSection('registration-section');
  };

  return (
    <div className="min-h-screen bg-[#030812] text-slate-100 font-['Plus_Jakarta_Sans',sans-serif] selection:bg-cyan-500 selection:text-white relative overflow-x-hidden">
      
      {/* Dynamic Ambient Underwater Canvas Effect */}
      <WaterCanvas />

      {/* Top Fixed Navigation */}
      <Navbar
        onOpenQuiz={() => setIsQuizOpen(true)}
        onOpenChat={() => setIsChatOpen(true)}
        onOpenSchedule={() => setIsScheduleOpen(true)}
        onNavigate={scrollToSection}
      />

      {/* Main Content Sections */}
      <main className="relative z-10">
        {/* 1. Hero Section */}
        <Hero
          onRegisterClick={() => scrollToSection('registration-section')}
          onExplorePrograms={() => scrollToSection('curriculum-section')}
          onOpenQuiz={() => setIsQuizOpen(true)}
          onOpenSchedule={() => setIsScheduleOpen(true)}
          onOpenBuddySquadPromo={() => scrollToSection('buddy-squad-promo')}
        />

        {/* Fluid Wave Divider: Hero -> Pillars */}
        <FluidWaveDivider variant="gentle" direction="bottom" fillColor="#030812" heightClassName="h-10 sm:h-14 md:h-18" />

        {/* 2. 4 Academy Pillars (Bento Grid dengan Frame Glass & Animasi Kinetik) */}
        <AcademyPillars 
          onOpenWOS={() => scrollToSection('wos-dashboard-section')}
          onExplorePrograms={() => scrollToSection('curriculum-section')}
        />

        {/* 2.5. Alur Proses Pendaftaran (4 Langkah Terstruktur Sederhana) */}
        <RegistrationFlowSection
          onStartStep1={() => scrollToSection('registration-section')}
          onOpenAssessment={() => setIsQuizOpen(true)}
          onOpenSchedule={() => setIsScheduleOpen(true)}
          onExplorePrograms={() => scrollToSection('curriculum-section')}
        />

        {/* Fluid Wave Divider: Flow -> Price Calculator */}
        <FluidWaveDivider variant="crest" direction="bottom" fillColor="#030812" heightClassName="h-10 sm:h-14 md:h-18" />

        {/* 3. Interactive Price List & Real-time Calculator */}
        <PriceCalculator
          onSelectPackage={handleSelectPackageFromCalculator}
          onOpenQuiz={() => setIsQuizOpen(true)}
        />

        {/* 4. Athlete Skill Roadmap (Simulator Perkembangan) */}
        <RoadmapSection
          onRegisterInterest={(ageGroup) => {
            setRegistrationNotes(`Peminatan Kelompok Usia: ${ageGroup}`);
            scrollToSection('registration-section');
          }}
        />

        {/* 5. Curriculum Levels & Filterable Programs */}
        <CurriculumSection
          onSelectProgramForEnroll={handleSelectProgramFromCurriculum}
          onOpenQuiz={() => setIsQuizOpen(true)}
          onSelectLevelForRegistration={handleSelectLevelFromQuiz}
        />

        {/* 6. Parent Experience & Testimonials (Kisah Sukses Orang Tua Murid) */}
        <Testimonials />

        {/* Fluid Wave Divider: Testimonials -> Buddy Squad */}
        <FluidWaveDivider variant="layered" direction="bottom" fillColor="#030812" heightClassName="h-10 sm:h-14 md:h-18" />

        {/* 6.5. Promo Khusus: Wavora Buddy Squad (2-4 Anak Sekaligus) */}
        <BuddySquadBanner
          onClaimPromo={handleClaimBuddySquadPromo}
          onOpenSchedule={() => setIsScheduleOpen(true)}
        />

        {/* 7. Jadwal Sesi Interaktif & Booking Slot (Real-Time Slot Calendar) */}
        <InteractiveScheduleSection
          onSelectSlotForRegistration={handleSelectSlotFromScheduleSection}
          onOpenLocationModal={() => setIsScheduleOpen(true)}
        />

        {/* Fluid Wave Divider: Schedule -> FAQ */}
        <FluidWaveDivider variant="gentle" direction="top" fillColor="#030812" heightClassName="h-10 sm:h-14 md:h-18" />

        {/* 8. Tombol & Akordeon FAQ Cepat (Frequently Asked Questions) */}
        <FAQSection
          onOpenChat={() => setIsChatOpen(true)}
          onRegisterClick={() => scrollToSection('registration-section')}
        />

        {/* 9. Multi-Step Digital Registration Form */}
        <RegistrationGate
          initialPackage={selectedPackageForRegistration}
          initialNotes={registrationNotes}
        />

        {/* 10. Real-Time WOS Athlete Registrations & Verification Monitor */}
        <AthleteRegistrationsDashboard
          onOpenRegistrationForm={() => scrollToSection('registration-section')}
        />
      </main>

      {/* Footer */}
      <Footer
        onNavigate={scrollToSection}
        onOpenSchedule={() => setIsScheduleOpen(true)}
        onOpenQuiz={() => setIsQuizOpen(true)}
      />

      {/* Floating Interactive Dolphin Companion */}
      <InteractiveDolphin
        onRegisterClick={() => scrollToSection('registration-section')}
        dolphinImgSrc="/dolphin-mascot.svg"
      />

      {/* Floating Quick Action Hub (Unified Compact WhatsApp, Schedule, & AI Chat Dock) */}
      <FloatingQuickActionHub
        onOpenSchedule={() => setIsScheduleOpen(true)}
        onOpenChat={() => setIsChatOpen(true)}
      />

      {/* MODALS */}
      {/* 1. Level Assessment Quiz Modal */}
      <LevelQuizModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        onSelectLevelForRegistration={handleSelectLevelFromQuiz}
      />

      {/* 2. Location & Schedule Modal */}
      <LocationScheduleModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        onSelectLocationForEnroll={handleSelectLocationFromSchedule}
      />

      {/* 3. Live AI Chat Assistant Modal */}
      <ChatAssistantModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onNavigateToSection={scrollToSection}
      />

    </div>
  );
}
