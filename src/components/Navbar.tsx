import { useState, useRef, useEffect } from 'react';
import {
  FileSpreadsheet,
  PlusCircle,
  Upload,
  Printer,
  RefreshCw,
  Activity,
  ShieldCheck,
  BarChart3,
  ChevronDown,
  LogOut,
  Settings,
  User,
  KeyRound,
} from 'lucide-react';
import { downloadExcelTemplate } from '../utils/excelHelper';
import { UserAccount } from '../types';

interface NavbarProps {
  totalBalita: number;
  totalStunting: number;
  currentUser?: UserAccount | null;
  onLogout?: () => void;
  onOpenSettings?: (tab: 'pengaturan' | 'ubah_profil' | 'password') => void;
  onOpenUploadExcel: () => void;
  onOpenManualEntry: () => void;
  onOpenPrintReport: () => void;
  onExportExcel: () => void;
  onResetData: () => void;
}

export default function Navbar({
  totalBalita,
  totalStunting,
  currentUser,
  onLogout,
  onOpenSettings,
  onOpenUploadExcel,
  onOpenManualEntry,
  onOpenPrintReport,
  onExportExcel,
  onResetData,
}: NavbarProps) {
  const stuntingRate = totalBalita > 0 ? ((totalStunting / totalBalita) * 100).toFixed(1) : '0';
  const [isPrintMenuOpen, setIsPrintMenuOpen] = useState(false);
  const printMenuRef = useRef<HTMLDivElement>(null);

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (printMenuRef.current && !printMenuRef.current.contains(event.target as Node)) {
        setIsPrintMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md print:hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Logo & Identity */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-600/20">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm sm:text-base font-bold tracking-tight text-slate-900">
                  DAFTAR ANAK BERDASARKAN STATUS GIZI
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="h-3 w-3" /> Standar Kemenkes RI
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Header Badge */}
          <div className="hidden lg:flex items-center gap-4 bg-slate-50 px-3.5 py-1.5 rounded-lg border border-slate-200/80 text-xs">
            <div className="flex items-center gap-1.5">
              <BarChart3 className="h-3.5 w-3.5 text-slate-500" />
              <span className="text-slate-500">Sasaran Balita: </span>
              <span className="font-bold text-slate-800">{totalBalita} Anak</span>
            </div>
            <div className="h-3.5 w-px bg-slate-300" />
            <div>
              <span className="text-slate-500">Kasus Stunting: </span>
              <span className="font-bold text-rose-600">{totalStunting} ({stuntingRate}%)</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-download-template"
              onClick={downloadExcelTemplate}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-xs transition hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              title="Unduh format file Excel kosong untuk diisi"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
              <span className="hidden md:inline">Format Excel</span>
            </button>

            <button
              type="button"
              id="btn-open-upload"
              onClick={onOpenUploadExcel}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs shadow-emerald-600/25 transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 active:scale-98"
            >
              <Upload className="h-4 w-4" />
              <span>Upload Data Excel</span>
            </button>

            <button
              type="button"
              id="btn-manual-entry"
              onClick={onOpenManualEntry}
              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-600/30 bg-emerald-50/70 px-3 py-2 text-xs font-medium text-emerald-800 transition hover:bg-emerald-100/80 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <PlusCircle className="h-4 w-4 text-emerald-700" />
              <span className="hidden sm:inline">Input Balita</span>
            </button>

            {/* Tombol Cetak Laporan (Gabungan Pilihan Excel / PDF) */}
            <div className="relative" ref={printMenuRef}>
              <div className="inline-flex rounded-lg shadow-xs">
                <button
                  type="button"
                  id="btn-navbar-cetak-laporan"
                  onClick={onOpenPrintReport}
                  className="inline-flex items-center gap-1.5 rounded-l-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 active:scale-95 transition"
                  title="Cetak Laporan (Pilihan Excel atau PDF)"
                >
                  <Printer className="h-4 w-4" />
                  <span>Cetak Laporan</span>
                </button>
                <button
                  type="button"
                  id="btn-toggle-print-dropdown"
                  onClick={() => setIsPrintMenuOpen(!isPrintMenuOpen)}
                  className="inline-flex items-center rounded-r-lg border-l border-slate-750 bg-slate-900 px-2 py-2 text-white hover:bg-slate-800 transition"
                  title="Buka Pilihan Format Cetakan"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </div>

              {isPrintMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-64 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl ring-1 ring-black/5 z-50">
                  <div className="px-2.5 py-1.5 border-b border-slate-100">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pilihan Format Cetak</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsPrintMenuOpen(false);
                      onExportExcel();
                    }}
                    className="w-full flex items-start gap-2.5 rounded-lg px-2.5 py-2 text-left hover:bg-emerald-50 transition group"
                  >
                    <FileSpreadsheet className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <span className="block text-xs font-bold text-slate-800 group-hover:text-emerald-900">1. Cetak Excel (.xlsx)</span>
                      <span className="block text-[11px] text-slate-500">Unduh lembar rekapitulasi data &amp; ringkasan</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsPrintMenuOpen(false);
                      onOpenPrintReport();
                    }}
                    className="w-full flex items-start gap-2.5 rounded-lg px-2.5 py-2 text-left hover:bg-slate-100 transition group"
                  >
                    <Printer className="h-4 w-4 text-slate-700 mt-0.5 shrink-0" />
                    <div>
                      <span className="block text-xs font-bold text-slate-800 group-hover:text-slate-950">2. Cetak Dokumen PDF</span>
                      <span className="block text-[11px] text-slate-500">Cetak lembar resmi / simpan ke file PDF</span>
                    </div>
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              id="btn-reset-sample"
              onClick={onResetData}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
              title="Muat Ulang Data Sampel Balita Stunting"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>

            {currentUser && (
              <div className="relative pl-2 border-l border-slate-200" ref={userMenuRef}>
                <button
                  type="button"
                  id="btn-user-menu"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 rounded-xl p-1 sm:px-2.5 sm:py-1.5 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition group text-left"
                  title="Klik untuk membuka menu akun & pengaturan"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-2xs group-hover:scale-105 transition">
                    {currentUser.role === 'Bidan Desa' ? 'BD' : currentUser.role === 'Kader Posyandu' ? 'KP' : currentUser.role === 'Petugas Gizi' ? 'GZ' : 'AD'}
                  </div>
                  <div className="hidden xl:block text-left">
                    <div className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[130px]" title={currentUser.namaLengkap}>
                      {currentUser.namaLengkap}
                    </div>
                    <div className="text-[10px] text-emerald-700 font-semibold leading-tight flex items-center gap-1">
                      <span>{currentUser.role}</span>
                      <ChevronDown className="h-3 w-3 text-slate-400 group-hover:text-slate-600 transition" />
                    </div>
                  </div>
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white p-2 shadow-2xl border border-slate-200 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* User Card Header */}
                    <div className="rounded-xl bg-gradient-to-br from-slate-900 to-emerald-950 p-3 text-white mb-2 shadow-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-400/30">
                          {currentUser.role === 'Bidan Desa' ? 'BD' : currentUser.role === 'Kader Posyandu' ? 'KP' : currentUser.role === 'Petugas Gizi' ? 'GZ' : 'AD'}
                        </div>
                        <div className="overflow-hidden">
                          <div className="text-xs font-bold text-white truncate" title={currentUser.namaLengkap}>
                            {currentUser.namaLengkap}
                          </div>
                          <div className="text-[10px] text-emerald-300 font-mono">
                            @{currentUser.username} • {currentUser.role}
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-white/10 text-[10px] text-slate-300 truncate">
                        📍 {currentUser.posyandu}
                      </div>
                    </div>

                    {/* Menu Actions */}
                    <div className="space-y-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onOpenSettings?.('pengaturan');
                        }}
                        className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition text-left group"
                      >
                        <Settings className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 transition" />
                        <div>
                          <span className="block font-bold">Pengaturan</span>
                          <span className="block text-[10px] text-slate-400 group-hover:text-slate-500 font-normal">
                            Posyandu, desa & puskesmas
                          </span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onOpenSettings?.('ubah_profil');
                        }}
                        className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition text-left group"
                      >
                        <User className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 transition" />
                        <div>
                          <span className="block font-bold">Ubah Profil</span>
                          <span className="block text-[10px] text-slate-400 group-hover:text-slate-500 font-normal">
                            Nama lengkap & jabatan
                          </span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onOpenSettings?.('password');
                        }}
                        className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition text-left group"
                      >
                        <KeyRound className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 transition" />
                        <div>
                          <span className="block font-bold">Ubah Password</span>
                          <span className="block text-[10px] text-slate-400 group-hover:text-slate-500 font-normal">
                            Ganti kata sandi akun
                          </span>
                        </div>
                      </button>
                    </div>

                    {/* Divider & Logout */}
                    <div className="mt-2 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onLogout?.();
                        }}
                        className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 hover:text-rose-800 transition text-left group"
                      >
                        <LogOut className="h-4 w-4 text-rose-500 group-hover:text-rose-700 transition" />
                        <span>Keluar dari Sistem</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
