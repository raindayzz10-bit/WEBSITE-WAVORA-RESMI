import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  RefreshCw,
  AlertTriangle,
  Phone,
  Calendar,
  MapPin,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Check,
  X,
  Eye,
  Trash2,
  Table,
  LayoutGrid,
  FileSpreadsheet,
  Download,
} from 'lucide-react';
import { useRegistrations } from '../hooks/useRegistrations';
import { RegistrationRecord, RegistrationStatus } from '../types';
import { ADMIN_PHONE_INTL } from '../data/academyData';
import { downloadReceiptImage } from '../utils/generateReceiptImage';

interface AthleteRegistrationsDashboardProps {
  onOpenRegistrationForm?: () => void;
}

export const AthleteRegistrationsDashboard: React.FC<AthleteRegistrationsDashboardProps> = ({
  onOpenRegistrationForm,
}) => {
  const {
    data,
    loading,
    error,
    verifyRegistration,
    removeRegistration,
    resetToSampleData,
    refetch,
  } = useRegistrations();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'verified'>('all');
  const [locationFilter, setLocationFilter] = useState<'all' | 'pahoman' | 'unila'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedAthlete, setSelectedAthlete] = useState<RegistrationRecord | null>(null);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<{ id: string; name: string } | null>(null);

  const showNotification = (msg: string) => {
    setActionSuccessMessage(msg);
    setTimeout(() => setActionSuccessMessage(null), 3000);
  };

  // Filter and search computation
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const q = (searchQuery || '').trim().toLowerCase();
      const athleteName = (item.athleteName || '').toLowerCase();
      const parentName = (item.parentName || '').toLowerCase();
      const ticketCode = (item.ticketCode || '').toLowerCase();
      const programCategory = (item.programCategory || '').toLowerCase();

      const matchSearch =
        !q ||
        athleteName.includes(q) ||
        parentName.includes(q) ||
        ticketCode.includes(q) ||
        programCategory.includes(q);

      const matchStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchLocation = locationFilter === 'all' || item.location === locationFilter;

      return matchSearch && matchStatus && matchLocation;
    });
  }, [data, searchQuery, statusFilter, locationFilter]);

  // Metric counts
  const totalCount = data.length;
  const pendingCount = data.filter((d) => d.status === 'pending').length;
  const verifiedCount = data.filter((d) => d.status === 'verified').length;

  const handleToggleStatus = async (item: RegistrationRecord) => {
    const nextStatus: RegistrationStatus = item.status === 'pending' ? 'verified' : 'pending';
    await verifyRegistration(item.id, nextStatus);
    showNotification(
      nextStatus === 'verified'
        ? `Status atlet ${item.athleteName} berhasil diverifikasi!`
        : `Status atlet ${item.athleteName} diubah ke Pending.`
    );
  };

  const handleDelete = (id: string, name: string) => {
    setRecordToDelete({ id, name });
  };

  const handleConfirmDelete = async () => {
    if (!recordToDelete) return;
    const { id, name } = recordToDelete;
    await removeRegistration(id);
    showNotification(`Data pendaftaran ${name} berhasil dihapus.`);
    if (selectedAthlete?.id === id) {
      setSelectedAthlete(null);
    }
    setRecordToDelete(null);
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <section
      id="wos-registrations-monitor"
      aria-label="WOS Real-Time Athlete Registrations"
      className="py-16 relative bg-[#040914] border-t border-slate-900 scroll-mt-20"
    >
      {/* Anchor for wos-dashboard-section */}
      <div id="wos-dashboard-section" className="absolute -top-20 left-0 w-0 h-0 pointer-events-none" />
      <div id="wos-dashboard" className="absolute -top-20 left-0 w-0 h-0 pointer-events-none" />
      {/* Toast Notification */}
      {actionSuccessMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-24 right-6 z-50 bg-slate-900 text-cyan-300 border border-cyan-500/40 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top-4 duration-200"
        >
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{actionSuccessMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* ========================================================== */}
        {/* HEADER & ACTIVE COUNT BADGES                              */}
        {/* ========================================================== */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8 pb-6 border-b border-slate-800/80">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 text-xs font-semibold tracking-wider uppercase mb-3">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              WOS REAL-TIME ATHLETE REGISTRATIONS
            </div>
            <h2 className="font-athletic font-black text-2xl sm:text-3xl md:text-4xl tracking-tight text-white mb-2">
              MONITOR <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent">PENDAFTARAN ATLET</span> MASUK
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Sinkronisasi real-time Cloud Firestore untuk pelatih & admin: verifikasi slot kolam, rekam data medis, dan konfirmasi WhatsApp instan.
            </p>
          </div>

          {/* Active Registration Metric Badges */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Total Badge */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 py-2 flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total:</span>
              <span className="font-mono font-bold text-sm text-white">{totalCount}</span>
            </div>

            {/* Pending Badge */}
            <div className="bg-amber-950/60 border border-amber-500/40 rounded-xl px-3.5 py-2 flex items-center gap-2 text-amber-300">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Menunggu:</span>
              <span className="font-mono font-extrabold text-sm text-amber-200">{pendingCount}</span>
            </div>

            {/* Verified Badge */}
            <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-xl px-3.5 py-2 flex items-center gap-2 text-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Terverifikasi:</span>
              <span className="font-mono font-extrabold text-sm text-emerald-200">{verifiedCount}</span>
            </div>

            {/* Refresh Button */}
            <button
              onClick={refetch}
              disabled={loading}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/40 transition-colors disabled:opacity-50"
              title="Segarkan data pendaftaran"
              aria-label="Segarkan data pendaftaran"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* ========================================================== */}
        {/* POLISHED ALERT BANNER ON ERROR                            */}
        {/* ========================================================== */}
        {error && (
          <div
            role="alert"
            className="bg-rose-950/40 border border-rose-500/50 rounded-2xl p-4 sm:p-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-rose-200 text-xs shadow-xl animate-in fade-in duration-200"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-rose-900/60 text-rose-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <strong className="font-bold block text-sm text-white mb-0.5">
                  Kendala Sinkronisasi Cloud Firestore
                </strong>
                <span>{error}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              <button
                onClick={refetch}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md"
              >
                Coba Ulang
              </button>
              <button
                onClick={resetToSampleData}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
              >
                Muat Data Sample
              </button>
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* FILTER & SEARCH TOOLBAR                                   */}
        {/* ========================================================== */}
        <div className="bg-slate-900/70 backdrop-blur-md rounded-2xl border border-white/[0.08] p-4 mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari atlet, orang tua, program, atau kode tiket..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
              aria-label="Cari pendaftaran atlet"
            />
          </div>

          {/* Filter Group */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Status Pills */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-cyan-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition-colors ${
                  statusFilter === 'pending'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-amber-400 hover:text-amber-300'
                }`}
              >
                <Clock className="w-3 h-3" />
                <span>Pending ({pendingCount})</span>
              </button>
              <button
                onClick={() => setStatusFilter('verified')}
                className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition-colors ${
                  statusFilter === 'verified'
                    ? 'bg-emerald-500 text-slate-950 shadow'
                    : 'text-emerald-400 hover:text-emerald-300'
                }`}
              >
                <Check className="w-3 h-3" />
                <span>Verified ({verifiedCount})</span>
              </button>
            </div>

            {/* Location Select */}
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-400"
              aria-label="Filter Kolam"
            >
              <option value="all">Semua Kolam</option>
              <option value="pahoman">Kolam Pahoman</option>
              <option value="unila">Kolam UNILA</option>
            </select>

            {/* Table / Grid Switcher for Tablet & Desktop */}
            <div className="hidden sm:flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'table' ? 'bg-slate-800 text-cyan-300' : 'text-slate-500 hover:text-white'
                }`}
                title="Tampilan Tabel Data"
                aria-label="Tampilan Tabel"
              >
                <Table className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-slate-800 text-cyan-300' : 'text-slate-500 hover:text-white'
                }`}
                title="Tampilan Kartu Grid"
                aria-label="Tampilan Grid"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* ========================================================== */}
        {/* SKELETON LOADER STATE DURING FETCH                        */}
        {/* ========================================================== */}
        {loading && (
          <div
            role="status"
            aria-busy="true"
            aria-label="Memuat data pendaftaran atlet"
            className="space-y-3 animate-pulse"
          >
            <div className="bg-slate-900/60 rounded-2xl border border-white/[0.05] p-4 h-16" />
            <div className="bg-slate-900/60 rounded-2xl border border-white/[0.05] p-4 h-16" />
            <div className="bg-slate-900/60 rounded-2xl border border-white/[0.05] p-4 h-16" />
            <div className="bg-slate-900/60 rounded-2xl border border-white/[0.05] p-4 h-16" />
          </div>
        )}

        {/* ========================================================== */}
        {/* FRIENDLY EMPTY STATE IF NO REGISTRATIONS EXIST            */}
        {/* ========================================================== */}
        {!loading && filteredData.length === 0 && (
          <div
            id="empty-registrations-card"
            className="bg-slate-900/70 border border-white/[0.08] rounded-2xl p-8 sm:p-12 text-center max-w-lg mx-auto shadow-2xl animate-in fade-in duration-200"
          >
            <div className="w-16 h-16 rounded-2xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center mx-auto mb-4 text-cyan-400">
              <Users className="w-8 h-8" />
            </div>

            <h3 className="font-athletic font-extrabold text-xl text-white mb-2">
              {searchQuery || statusFilter !== 'all' || locationFilter !== 'all'
                ? 'Tidak Ada Pendaftaran yang Cocok'
                : 'Belum Ada Pendaftaran Atlet Masuk'}
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
              {searchQuery || statusFilter !== 'all' || locationFilter !== 'all'
                ? 'Coba sesuaikan kata kunci pencarian atau ubah filter status/lokasi kolam.'
                : 'Pendaftaran baru yang dikirim melalui formulir digital WOS akan otomatis muncul di sini secara real-time.'}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {onOpenRegistrationForm && (
                <button
                  type="button"
                  onClick={onOpenRegistrationForm}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-300 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Daftar Atlet Sekarang</span>
                </button>
              )}
              <button
                type="button"
                onClick={resetToSampleData}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
              >
                Muat 5 Contoh Pendaftaran
              </button>
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* MODERN DATA TABLE (FOR TABLET & DESKTOP COACH USAGE)      */}
        {/* ========================================================== */}
        {!loading && filteredData.length > 0 && viewMode === 'table' && (
          <div className="hidden md:block bg-slate-900/70 backdrop-blur-md rounded-2xl border border-white/[0.08] overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-[11px] uppercase font-bold text-slate-400 border-b border-slate-800 tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Kode & Tanggal</th>
                    <th className="py-3.5 px-4">Nama Calon Atlet</th>
                    <th className="py-3.5 px-4">Kategori Program</th>
                    <th className="py-3.5 px-4">Venue Kolam</th>
                    <th className="py-3.5 px-4">Orang Tua / Kontak</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">Aksi Coach</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {filteredData.map((item) => {
                    const isVerified = item.status === 'verified';
                    const cleanPhone = (item.whatsapp || '').replace(/\D/g, '');
                    const intlPhone = cleanPhone.startsWith('0')
                      ? '62' + cleanPhone.slice(1)
                      : cleanPhone;

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                        onClick={() => setSelectedAthlete(item)}
                      >
                        {/* Kode & Tanggal */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-mono font-bold text-cyan-300 text-xs block">
                            {item.ticketCode}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {formatDate(item.createdAt)}
                          </span>
                        </td>

                        {/* Nama Atlet */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 font-bold text-white text-xs sm:text-sm group-hover:text-cyan-300 transition-colors">
                            <span>{item.athleteName}</span>
                            {((item.athleteCount && item.athleteCount > 1) || (item.athletes && item.athletes.length > 1)) && (
                              <span className="px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-[10px] text-cyan-300 font-bold">
                                {item.athleteCount || item.athletes?.length} Anak
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400">
                            {item.age} Tahun • {item.gender}
                          </span>
                        </td>

                        {/* Program Category */}
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-200 block text-xs">
                            {item.programCategory}
                          </span>
                          <span className="text-[10px] text-cyan-400 font-mono block">
                            {formatRupiah(item.totalEstimate)}
                          </span>
                        </td>

                        {/* Venue Kolam */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-300 uppercase">
                            <MapPin className="w-3 h-3 text-cyan-400" />
                            {item.location === 'pahoman' ? 'Pahoman (Pagi)' : 'UNILA (Sore)'}
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            {item.preferredDay}
                          </span>
                        </td>

                        {/* Orang Tua & WhatsApp */}
                        <td className="py-3.5 px-4">
                          <span className="font-medium text-slate-200 block text-xs">
                            {item.parentName}
                          </span>
                          <a
                            href={`https://wa.me/${intlPhone}?text=Halo%20${encodeURIComponent(item.parentName)},%20kami%20dari%20Wavora%20Aquatic%20Academy%20terkait%20pendaftaran%20${encodeURIComponent(item.athleteName)}.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-mono mt-0.5"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{item.whatsapp}</span>
                          </a>
                        </td>

                        {/* Status Badge (Pending / Verified) */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleStatus(item);
                            }}
                            title="Klik untuk ubah status verifikasi"
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
                              isVerified
                                ? 'bg-emerald-950 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60'
                                : 'bg-amber-950 border border-amber-500/40 text-amber-300 hover:bg-amber-900/60 animate-pulse'
                            }`}
                          >
                            {isVerified ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Verified</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-3.5 h-3.5 text-amber-400" />
                                <span>Pending</span>
                              </>
                            )}
                          </button>
                        </td>

                        {/* Coach Actions */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => setSelectedAthlete(item)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                              title="Lihat Detail Lengkap"
                              aria-label="Lihat Detail"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleStatus(item)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                isVerified
                                  ? 'bg-amber-950/80 hover:bg-amber-900 text-amber-300'
                                  : 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300'
                              }`}
                              title={isVerified ? 'Tandai Pending' : 'Verifikasi Atlet'}
                              aria-label="Toggle Verifikasi"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(item.id, item.athleteName)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/80 text-slate-400 hover:text-rose-300 transition-colors"
                              title="Hapus Data"
                              aria-label="Hapus Data"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* RESPONSIVE CARD GRID (MOBILE & TABLET VIEW)               */}
        {/* ========================================================== */}
        {!loading && filteredData.length > 0 && (viewMode === 'grid' || true) && (
          <div className={`${viewMode === 'grid' ? 'grid' : 'grid md:hidden'} grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4`}>
            {filteredData.map((item) => {
              const isVerified = item.status === 'verified';
              const cleanPhone = (item.whatsapp || '').replace(/\D/g, '');
              const intlPhone = cleanPhone.startsWith('0')
                ? '62' + cleanPhone.slice(1)
                : cleanPhone;

              return (
                <div
                  key={item.id}
                  className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-white/[0.08] hover:border-cyan-500/40 p-5 flex flex-col justify-between shadow-xl transition-all duration-200"
                >
                  <div>
                    {/* Top Row: Ticket Code & Status */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="font-mono font-bold text-xs text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
                        {item.ticketCode}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleToggleStatus(item)}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isVerified
                            ? 'bg-emerald-950 border border-emerald-500/40 text-emerald-300'
                            : 'bg-amber-950 border border-amber-500/40 text-amber-300 animate-pulse'
                        }`}
                      >
                        {isVerified ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>Verified</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 text-amber-400" />
                            <span>Pending</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Athlete Name */}
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="font-athletic font-extrabold text-base text-white truncate">
                        {item.athleteName}
                      </h3>
                      {((item.athleteCount && item.athleteCount > 1) || (item.athletes && item.athletes.length > 1)) && (
                        <span className="shrink-0 px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-[10px] text-cyan-300 font-bold">
                          {item.athleteCount || item.athletes?.length} Anak
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mb-3">
                      Usia: {item.age} Tahun ({item.gender})
                    </p>

                    {/* Details Box */}
                    <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800/80 space-y-1.5 text-xs mb-3">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Program:</span>
                        <span className="font-semibold text-slate-200">{item.programCategory}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Lokasi:</span>
                        <span className="text-teal-300 uppercase font-medium">
                          {item.location === 'pahoman' ? 'Pahoman (Pagi)' : 'UNILA (Sore)'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Jadwal:</span>
                        <span className="text-slate-300">{item.preferredDay}</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-800 pt-1">
                        <span className="text-slate-400">Investasi:</span>
                        <span className="font-bold text-cyan-300 font-mono">
                          {formatRupiah(item.totalEstimate)}
                        </span>
                      </div>
                    </div>

                    {/* Parent Contact */}
                    <div className="text-xs text-slate-400 mb-3">
                      <span>Orang Tua: <strong className="text-slate-200">{item.parentName}</strong></span>
                      <div className="mt-1">
                        <a
                          href={`https://wa.me/${intlPhone}?text=Halo%20${encodeURIComponent(item.parentName)},%20kami%20dari%20Wavora%20Aquatic%20Academy.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-mono text-[11px]"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>WhatsApp: {item.whatsapp}</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedAthlete(item)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Detail</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(item)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${
                          isVerified
                            ? 'bg-amber-950 text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{isVerified ? 'Jadikan Pending' : 'Verifikasi'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id, item.athleteName)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* ========================================================== */}
      {/* ATHLETE DETAILS MODAL                                      */}
      {/* ========================================================== */}
      {selectedAthlete && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-[#020611]/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setSelectedAthlete(null)}
        >
          <div
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative space-y-5 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="font-mono text-xs text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
                  {selectedAthlete.ticketCode}
                </span>
                <h3 className="font-athletic font-extrabold text-2xl text-white mt-1">
                  {selectedAthlete.athleteName}
                </h3>
                <p className="text-xs text-slate-400">
                  Terdaftar: {formatDate(selectedAthlete.createdAt)}
                </p>
              </div>

              <button
                onClick={() => setSelectedAthlete(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                aria-label="Tutup Detail"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content Sections */}
            <div className="space-y-4 text-xs text-slate-300">
              
              {/* Multi-athlete list or Single Athlete */}
              {selectedAthlete.athletes && selectedAthlete.athletes.length > 0 ? (
                <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider">
                      Daftar Calon Atlet ({selectedAthlete.athletes.length} Anak)
                    </span>
                    <span className="px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-[10px] font-bold text-cyan-300">
                      Multi-Athlete
                    </span>
                  </div>
                  <div className="space-y-2">
                    {selectedAthlete.athletes.map((ath, idx) => (
                      <div key={idx} className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 space-y-1">
                        <div className="flex justify-between items-center font-bold text-white text-xs">
                          <span className="flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] flex items-center justify-center font-bold">
                              {idx + 1}
                            </span>
                            <span>{ath.athleteName || `Calon Atlet #${idx + 1}`}</span>
                          </span>
                          <span className="text-slate-400 font-normal">
                            {ath.age ? `${ath.age} Th` : '-'} • {ath.gender}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex justify-between">
                          <span>Pengalaman:</span>
                          <span className="text-cyan-200">{ath.waterExperience || '-'}</span>
                        </div>
                        {ath.medicalNotes && (
                          <div className="text-[11px] text-slate-400 flex justify-between">
                            <span>Medis:</span>
                            <span className="text-amber-200 italic">{ath.medicalNotes}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Profile & Program */}
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="font-bold text-slate-400 uppercase text-[10px] tracking-wider">
                  Program & Lokasi
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-500 block">Paket:</span>
                    <span className="font-bold text-white">{selectedAthlete.programCategory}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Venue Kolam:</span>
                    <span className="font-bold text-teal-300 uppercase">
                      {selectedAthlete.location === 'pahoman' ? 'Kolam Pahoman' : 'Kolam UNILA'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Jadwal:</span>
                    <span className="text-white">{selectedAthlete.preferredDay}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Total Biaya:</span>
                    <span className="font-mono font-bold text-cyan-300">
                      {formatRupiah(selectedAthlete.totalEstimate)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Water Experience & Medical Notes */}
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="font-bold text-slate-400 uppercase text-[10px] tracking-wider">
                  Kesiapan Akuatik & Catatan Medis
                </div>
                <div>
                  <span className="text-slate-500 block">Pengalaman Air:</span>
                  <span className="text-cyan-200 font-semibold">{selectedAthlete.waterExperience}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Catatan Kesehatan / Alergi:</span>
                  <p className="text-slate-300 italic mt-0.5">
                    "{selectedAthlete.medicalNotes || 'Tidak ada catatan medis'}"
                  </p>
                </div>
              </div>

              {/* Parent Contact */}
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="font-bold text-slate-400 uppercase text-[10px] tracking-wider">
                  Kontak Orang Tua / Wali
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-white font-bold block">{selectedAthlete.parentName}</span>
                    <span className="text-slate-400 font-mono">{selectedAthlete.whatsapp}</span>
                  </div>
                  <a
                    href={`https://wa.me/${selectedAthlete.whatsapp.replace(/\D/g, '')}?text=Halo%20${encodeURIComponent(selectedAthlete.parentName)},%20kami%20dari%20Wavora%20Aquatic%20Academy.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Chat WA</span>
                  </a>
                </div>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleStatus(selectedAthlete)}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 ${
                    selectedAthlete.status === 'verified'
                      ? 'bg-amber-950 text-amber-300 border border-amber-500/30'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>
                    {selectedAthlete.status === 'verified' ? 'Tandai Pending' : 'Verifikasi Atlet Ini'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    downloadReceiptImage({
                      ticket: {
                        ticketCode: selectedAthlete.ticketCode,
                        submittedAt: new Date(selectedAthlete.createdAt).toLocaleString('id-ID'),
                        formData: {
                          athleteName: selectedAthlete.athleteName,
                          birthDate: '',
                          age: String(selectedAthlete.age),
                          gender: selectedAthlete.gender,
                          waterExperience: selectedAthlete.waterExperience as any,
                          medicalNotes: selectedAthlete.medicalNotes || '',
                          parentName: selectedAthlete.parentName,
                          whatsapp: selectedAthlete.whatsapp,
                          email: selectedAthlete.email || '',
                          relationship: 'Wali',
                          classType: selectedAthlete.classType,
                          sessions: selectedAthlete.sessions,
                          location: selectedAthlete.location,
                          preferredDay: selectedAthlete.preferredDay,
                          preferredTime: '',
                          agreedTerms: true,
                        },
                        totalEstimate: selectedAthlete.totalEstimate,
                      },
                      packageName: selectedAthlete.programCategory,
                      locationName:
                        selectedAthlete.location === 'pahoman'
                          ? 'Kolam Renang Pahoman'
                          : 'Kolam Renang UNILA',
                      theme: 'receipt',
                    });
                    showNotification(`Struk invoice untuk ${selectedAthlete.athleteName} berhasil diunduh!`);
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  title="Unduh Struk / Invoice Resmi (PNG)"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Struk (PNG)</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSelectedAthlete(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Delete Confirmation Modal Portal (No browser popups) */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {recordToDelete && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  transition={{ duration: 0.15 }}
                  className="w-full max-w-md bg-slate-900 border border-rose-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-rose-950/50 text-white relative overflow-hidden"
                >
                  <div className="flex items-start gap-3.5 mb-4">
                    <div className="w-11 h-11 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center shrink-0 text-rose-400">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-athletic font-bold text-lg text-white">Hapus Data Atlet?</h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Konfirmasi penghapusan data pendaftaran atlet dari database.
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 bg-slate-950/80 p-3 rounded-xl border border-slate-800 mb-5 leading-relaxed">
                    Data pendaftaran atas nama <strong className="text-white font-bold">{recordToDelete.name}</strong> akan dihapus secara permanen dari sistem registrasi WOS.
                  </p>

                  <div className="flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setRecordToDelete(null)}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmDelete}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-rose-950/50 active:scale-95 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Ya, Hapus Data</span>
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}

    </section>
  );
};
