import { FileSpreadsheet, PlusCircle, Upload, Printer, RefreshCw, Activity, ShieldCheck, Camera, ShoppingBag, Users } from 'lucide-react';
import { downloadExcelTemplate } from '../utils/excelHelper';

export type ActiveTabType = 'kegiatan' | 'belanja' | 'antropometri';

interface NavbarProps {
  activeTab: ActiveTabType;
  onTabChange: (tab: ActiveTabType) => void;
  totalBalita: number;
  totalStunting: number;
  totalHariKegiatan: number;
  totalHariBelanja: number;
  onOpenUploadDokumentasi: () => void;
  onOpenUploadExcel: () => void;
  onOpenManualEntry: () => void;
  onPrintCurrent: () => void;
  onResetData: () => void;
}

export default function Navbar({
  activeTab,
  onTabChange,
  totalBalita,
  totalStunting,
  totalHariKegiatan,
  totalHariBelanja,
  onOpenUploadDokumentasi,
  onOpenUploadExcel,
  onOpenManualEntry,
  onPrintCurrent,
  onResetData,
}: NavbarProps) {
  const stuntingRate = totalBalita > 0 ? ((totalStunting / totalBalita) * 100).toFixed(1) : '0';

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md print:hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Top Header Row */}
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Logo & Identity */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-600/20">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-slate-900">
                  PMT Stanting
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="h-3 w-3" /> Standar BOK & Kemenkes
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Dokumentasi Kegiatan, Belanja Bahan & Antropometri Balita
              </p>
            </div>
          </div>

          {/* Quick Metrics Header Badge */}
          <div className="hidden lg:flex items-center gap-4 bg-slate-50 px-3.5 py-1.5 rounded-lg border border-slate-200/80 text-xs">
            <div>
              <span className="text-slate-500">Total Sasaran: </span>
              <span className="font-bold text-slate-800">{totalBalita} Balita</span>
            </div>
            <div className="h-3.5 w-px bg-slate-300" />
            <div>
              <span className="text-slate-500">Stunting: </span>
              <span className="font-bold text-rose-600">{totalStunting} ({stuntingRate}%)</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-nav-upload-doc"
              onClick={onOpenUploadDokumentasi}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm shadow-emerald-600/25 transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 active:scale-98"
            >
              <Camera className="h-4 w-4" />
              <span>Upload Foto & Kegiatan</span>
            </button>

            {activeTab === 'antropometri' ? (
              <>
                <button
                  type="button"
                  id="btn-nav-upload-excel"
                  onClick={onOpenUploadExcel}
                  className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  <Upload className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Upload Excel</span>
                </button>
                <button
                  type="button"
                  id="btn-nav-download-template"
                  onClick={downloadExcelTemplate}
                  className="hidden md:inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Format Excel</span>
                </button>
                <button
                  type="button"
                  id="btn-nav-manual-entry"
                  onClick={onOpenManualEntry}
                  className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-emerald-600/30 bg-emerald-50/70 px-3 py-2 text-xs font-medium text-emerald-800 hover:bg-emerald-100/80"
                >
                  <PlusCircle className="h-4 w-4 text-emerald-700" />
                  <span>Input Balita</span>
                </button>
              </>
            ) : null}

            <button
              type="button"
              id="btn-nav-print"
              onClick={onPrintCurrent}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition"
              title="Cetak Laporan / Simpan PDF"
            >
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">Cetak PDF</span>
            </button>

            <button
              type="button"
              id="btn-nav-reset"
              onClick={onResetData}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
              title="Muat Ulang Data Sampel Asli"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>

        </div>

        {/* Tab Navigation Row */}
        <div className="flex border-t border-slate-100 -mb-px overflow-x-auto scrollbar-none gap-2 py-2">
          
          {/* Tab 1: Dokumentasi Menu & Kegiatan (Sesuai Gambar 1) */}
          <button
            type="button"
            id="tab-kegiatan"
            onClick={() => onTabChange('kegiatan')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-bold rounded-lg transition whitespace-nowrap ${
              activeTab === 'kegiatan'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Camera className="h-4 w-4" />
            <span>Dokumentasi Menu & Kegiatan</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
              activeTab === 'kegiatan' ? 'bg-emerald-900 text-emerald-200' : 'bg-slate-200 text-slate-700'
            }`}>
              {totalHariKegiatan}
            </span>
          </button>

          {/* Tab 2: Dokumentasi Belanja Bahan (Sesuai Gambar 2) */}
          <button
            type="button"
            id="tab-belanja"
            onClick={() => onTabChange('belanja')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-bold rounded-lg transition whitespace-nowrap ${
              activeTab === 'belanja'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Dokumentasi Belanja Bahan</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
              activeTab === 'belanja' ? 'bg-emerald-900 text-emerald-200' : 'bg-slate-200 text-slate-700'
            }`}>
              {totalHariBelanja}
            </span>
          </button>

          {/* Tab 3: Antropometri & Pertumbuhan Balita */}
          <button
            type="button"
            id="tab-antropometri"
            onClick={() => onTabChange('antropometri')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-bold rounded-lg transition whitespace-nowrap ${
              activeTab === 'antropometri'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Data Antropometri & Z-Score Balita</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
              activeTab === 'antropometri' ? 'bg-emerald-900 text-emerald-200' : 'bg-slate-200 text-slate-700'
            }`}>
              {totalBalita}
            </span>
          </button>

        </div>

      </div>
    </header>
  );
}

