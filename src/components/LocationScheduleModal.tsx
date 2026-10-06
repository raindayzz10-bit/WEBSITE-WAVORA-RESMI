import React, { useState } from 'react';
import { MapPin, Clock, Calendar, Check, X, ShieldCheck, ArrowRight, PhoneCall, Info } from 'lucide-react';
import { POOL_LOCATIONS, ADMIN_PHONE } from '../data/academyData';
import { PoolLocationId } from '../types';

interface LocationScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocationForEnroll?: (locId: PoolLocationId) => void;
}

export const LocationScheduleModal: React.FC<LocationScheduleModalProps> = ({
  isOpen,
  onClose,
  onSelectLocationForEnroll,
}) => {
  const [activeLocTab, setActiveLocTab] = useState<PoolLocationId>('pahoman');

  if (!isOpen) return null;

  const currentLoc = POOL_LOCATIONS.find((l) => l.id === activeLocTab) || POOL_LOCATIONS[0];

  return (
    <div
      id="schedule-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 relative shadow-2xl shadow-cyan-950/90">
        
        {/* Close button */}
        <button
          id="close-schedule-modal-btn"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          aria-label="Tutup Jadwal & Kolam"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6 pr-8">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400 mb-1">
            <MapPin className="w-4 h-4" />
            LOKASI & JADWAL OPERASIONAL RESMI
          </div>
          <h2 className="font-athletic font-extrabold text-2xl sm:text-3xl text-white">
            Kolam Latihan Wavora Bandar Lampung
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Dua venue representatif terbaik dengan air jernih dan fasilitas ramah anak di pusat kota & kawasan kampus.
          </p>
        </div>

        {/* Location Switcher Tabs */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {POOL_LOCATIONS.map((loc) => {
            const isActive = activeLocTab === loc.id;
            return (
              <button
                key={loc.id}
                id={`loc-tab-${loc.id}`}
                onClick={() => setActiveLocTab(loc.id)}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  isActive
                    ? 'bg-cyan-950/70 border-cyan-400 ring-1 ring-cyan-400/50 shadow-md'
                    : 'bg-slate-800/60 border-slate-700/70 hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block mb-0.5">
                  {loc.badge}
                </span>
                <h3 className="font-athletic font-bold text-sm sm:text-base text-white">
                  {loc.shortName}
                </h3>
              </button>
            );
          })}
        </div>

        {/* Selected Location Card */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 sm:p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-4">
            <div>
              <h3 className="font-athletic font-black text-xl sm:text-2xl text-white">
                {currentLoc.name}
              </h3>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                {currentLoc.address}
              </p>
            </div>

            <div className="bg-cyan-950/60 border border-cyan-500/30 px-3.5 py-2 rounded-xl shrink-0">
              <span className="text-[10px] uppercase font-bold text-cyan-400 block">Jam Latihan</span>
              <span className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-cyan-300" />
                {currentLoc.timeSlot}
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 mb-5 leading-relaxed bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80">
            {currentLoc.highlight}
          </p>

          {/* Features / Amenities */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 mb-3 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Fasilitas & Keunggulan Kolam
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {currentLoc.features.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                  <Check className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Flexible Rescheduling Policy Notice for Parents */}
        <div className="bg-gradient-to-r from-teal-950/40 via-cyan-950/40 to-slate-900 border border-teal-500/30 rounded-xl p-4 mb-6 flex items-start gap-3">
          <Info className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300 leading-relaxed">
            <strong className="text-teal-300 font-bold block mb-0.5">
              Kebijakan Jadwal Fleksibel (Family Friendly Policy)
            </strong>
            Bila murid berhalangan hadir karena sakit atau agenda sekolah mendadak, Anda cukup memberi kabar ke admin WhatsApp H-1 sebelum sesi dimulai. Pertemuan dapat di-reschedule sehingga hak latihan tidak pernah hangus sia-sia.
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          {onSelectLocationForEnroll && (
            <button
              onClick={() => {
                onSelectLocationForEnroll(currentLoc.id);
                onClose();
              }}
              className="w-full sm:w-2/3 py-3 px-4 text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-300 hover:from-cyan-300 rounded-xl shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
            >
              <span>Pilih {currentLoc.shortName} Untuk Mendaftar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <a
            href={`https://wa.me/6289634189392?text=Halo%20Admin%20Wavora,%20saya%20ingin%20tanya%20detail%20jadwal%20kolam%20${encodeURIComponent(currentLoc.name)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-1/3 py-3 px-4 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl flex items-center justify-center gap-2 text-center"
          >
            <PhoneCall className="w-3.5 h-3.5 text-cyan-400" />
            <span>Chat Admin Lokasi</span>
          </a>
        </div>

      </div>
    </div>
  );
};
