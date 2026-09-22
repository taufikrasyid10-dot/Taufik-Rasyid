import { useState, useEffect } from 'react';
import { 
  BalitaPMT, 
  DokumentasiKegiatanHari, 
  DokumentasiBelanjaItem, 
  PengaturanDokumentasi 
} from './types';
import { INITIAL_PMT_DATA } from './data/samplePmtData';
import { 
  INITIAL_DOKUMENTASI_KEGIATAN, 
  INITIAL_DOKUMENTASI_BELANJA, 
  DEFAULT_PENGATURAN_DOKUMENTASI 
} from './data/documentationSampleData';
import Navbar, { ActiveTabType } from './components/Navbar';
import DokumentasiKegiatanView from './components/DokumentasiKegiatanView';
import DokumentasiBelanjaView from './components/DokumentasiBelanjaView';
import UploadDokumentasiModal from './components/UploadDokumentasiModal';
import PengaturanHeaderModal from './components/PengaturanHeaderModal';
import StatisticsOverview from './components/StatisticsOverview';
import PmtDataTable from './components/PmtDataTable';
import UploadModal from './components/UploadModal';
import ManualEntryModal from './components/ManualEntryModal';
import GrowthCurvePlot from './components/GrowthCurvePlot';
import PrintReportModal from './components/PrintReportModal';
import { CheckCircle2, ShieldCheck, FileSpreadsheet, Upload, AlertCircle, Camera, ShoppingBag } from 'lucide-react';
import { downloadExcelTemplate } from './utils/excelHelper';

const STORAGE_KEY_BALITA = 'pmt_stanting_balita_data_v1';
const STORAGE_KEY_KEGIATAN = 'pmt_stanting_kegiatan_data_v1';
const STORAGE_KEY_BELANJA = 'pmt_stanting_belanja_data_v1';
const STORAGE_KEY_PENGATURAN = 'pmt_stanting_pengaturan_doc_v1';

export default function App() {
  // Navigation tab: 'kegiatan' (Gambar 1), 'belanja' (Gambar 2), 'antropometri'
  const [activeTab, setActiveTab] = useState<ActiveTabType>('kegiatan');

  // Balita Antropometri Data
  const [data, setData] = useState<BalitaPMT[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_BALITA);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading data from localStorage', e);
    }
    return INITIAL_PMT_DATA;
  });

  // Dokumentasi Menu & Kegiatan (Gambar 1)
  const [dokumentasiKegiatan, setDokumentasiKegiatan] = useState<DokumentasiKegiatanHari[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_KEGIATAN);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading kegiatan from localStorage', e);
    }
    return INITIAL_DOKUMENTASI_KEGIATAN;
  });

  // Dokumentasi Belanja Bahan Mentah (Gambar 2)
  const [dokumentasiBelanja, setDokumentasiBelanja] = useState<DokumentasiBelanjaItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_BELANJA);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading belanja from localStorage', e);
    }
    return INITIAL_DOKUMENTASI_BELANJA;
  });

  // Pengaturan Kop Dokumen & Periode
  const [pengaturanDoc, setPengaturanDoc] = useState<PengaturanDokumentasi>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PENGATURAN);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error loading pengaturan from localStorage', e);
    }
    return DEFAULT_PENGATURAN_DOKUMENTASI;
  });

  // Modals state
  const [isUploadDocOpen, setIsUploadDocOpen] = useState(false);
  const [docModalType, setDocModalType] = useState<'kegiatan' | 'belanja'>('kegiatan');
  const [editingKegiatanItem, setEditingKegiatanItem] = useState<DokumentasiKegiatanHari | null>(null);
  const [editingBelanjaItem, setEditingBelanjaItem] = useState<DokumentasiBelanjaItem | null>(null);
  const [isSettingHeaderOpen, setIsSettingHeaderOpen] = useState(false);

  // Antropometri Modals
  const [isUploadExcelOpen, setIsUploadExcelOpen] = useState(false);
  const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);
  const [editingBalita, setEditingBalita] = useState<BalitaPMT | null>(null);
  const [selectedBalitaForPlot, setSelectedBalitaForPlot] = useState<BalitaPMT | null>(null);
  const [isPrintReportOpen, setIsPrintReportOpen] = useState(false);

  // Filter Antropometri
  const [selectedPosyandu, setSelectedPosyandu] = useState<string>('Semua');
  const [selectedStatus, setSelectedStatus] = useState<string>('Semua');

  // Toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  // Auto-save all persistent states
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_BALITA, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save balita data', e);
    }
  }, [data]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_KEGIATAN, JSON.stringify(dokumentasiKegiatan));
    } catch (e) {
      console.error('Failed to save kegiatan data', e);
    }
  }, [dokumentasiKegiatan]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_BELANJA, JSON.stringify(dokumentasiBelanja));
    } catch (e) {
      console.error('Failed to save belanja data', e);
    }
  }, [dokumentasiBelanja]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PENGATURAN, JSON.stringify(pengaturanDoc));
    } catch (e) {
      console.error('Failed to save pengaturan data', e);
    }
  }, [pengaturanDoc]);

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Handlers for Kegiatan (Gambar 1)
  const handleOpenAddKegiatan = (hari?: DokumentasiKegiatanHari) => {
    setDocModalType('kegiatan');
    setEditingKegiatanItem(hari || null);
    setIsUploadDocOpen(true);
  };

  const handleSaveKegiatan = (savedHari: DokumentasiKegiatanHari) => {
    setDokumentasiKegiatan(prev => {
      const idx = prev.findIndex(item => item.id === savedHari.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = savedHari;
        return next;
      }
      return [savedHari, ...prev];
    });
    showToast(`Dokumentasi kegiatan tanggal ${savedHari.tanggal} berhasil disimpan.`);
  };

  const handleDeleteKegiatan = (id: string) => {
    if (confirm('Hapus dokumentasi kegiatan untuk hari ini?')) {
      setDokumentasiKegiatan(prev => prev.filter(k => k.id !== id));
      showToast('Dokumentasi kegiatan berhasil dihapus.', 'info');
    }
  };

  // Handlers for Belanja (Gambar 2)
  const handleOpenAddBelanja = (item?: DokumentasiBelanjaItem) => {
    setDocModalType('belanja');
    setEditingBelanjaItem(item || null);
    setIsUploadDocOpen(true);
  };

  const handleSaveBelanja = (savedItem: DokumentasiBelanjaItem) => {
    setDokumentasiBelanja(prev => {
      const idx = prev.findIndex(item => item.id === savedItem.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = savedItem;
        return next;
      }
      return [...prev, savedItem];
    });
    showToast(`Dokumentasi belanja tanggal ${savedItem.tanggal} berhasil disimpan.`);
  };

  const handleDeleteBelanja = (id: string) => {
    if (confirm('Hapus item dokumentasi belanja ini?')) {
      setDokumentasiBelanja(prev => prev.filter(b => b.id !== id));
      showToast('Dokumentasi belanja berhasil dihapus.', 'info');
    }
  };

  // General reset
  const handleResetData = () => {
    if (confirm('Kembalikan semua data ke sampel awal (Dokumentasi Kegiatan Ampana Tete, Belanja Bahan & Balita)?')) {
      setData(INITIAL_PMT_DATA);
      setDokumentasiKegiatan(INITIAL_DOKUMENTASI_KEGIATAN);
      setDokumentasiBelanja(INITIAL_DOKUMENTASI_BELANJA);
      setPengaturanDoc(DEFAULT_PENGATURAN_DOKUMENTASI);
      showToast('Data berhasil dimuat ulang ke format awal.');
    }
  };

  const handlePrintCurrent = () => {
    window.print();
  };

  const totalStunting = data.filter(d => d.statusTBU === 'Sangat Pendek' || d.statusTBU === 'Pendek').length;

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col selection:bg-emerald-500 selection:text-white font-sans antialiased">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        totalBalita={data.length}
        totalStunting={totalStunting}
        totalHariKegiatan={dokumentasiKegiatan.length}
        totalHariBelanja={dokumentasiBelanja.length}
        onOpenUploadDokumentasi={() => {
          if (activeTab === 'belanja') {
            handleOpenAddBelanja();
          } else {
            handleOpenAddKegiatan();
          }
        }}
        onOpenUploadExcel={() => setIsUploadExcelOpen(true)}
        onOpenManualEntry={() => {
          setEditingBalita(null);
          setIsManualEntryOpen(true);
        }}
        onPrintCurrent={handlePrintCurrent}
        onResetData={handleResetData}
      />

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl flex-1 px-3 sm:px-6 lg:px-8 py-5 w-full">
        
        {/* TAB 1: DOKUMENTASI MENU & KEGIATAN PMT (SESUAI GAMBAR 1) */}
        {activeTab === 'kegiatan' && (
          <div className="space-y-4">
            <DokumentasiKegiatanView
              data={dokumentasiKegiatan}
              pengaturan={pengaturanDoc}
              onOpenAddModal={handleOpenAddKegiatan}
              onDeleteHari={handleDeleteKegiatan}
              onOpenSettingModal={() => setIsSettingHeaderOpen(true)}
            />
          </div>
        )}

        {/* TAB 2: DOKUMENTASI BELANJA BAHAN KONSUMSI PMT (SESUAI GAMBAR 2) */}
        {activeTab === 'belanja' && (
          <div className="space-y-4">
            <DokumentasiBelanjaView
              data={dokumentasiBelanja}
              pengaturan={pengaturanDoc}
              onOpenAddModal={handleOpenAddBelanja}
              onDeleteItem={handleDeleteBelanja}
              onOpenSettingModal={() => setIsSettingHeaderOpen(true)}
            />
          </div>
        )}

        {/* TAB 3: DATA ANTROPOMETRI, EVALUASI Z-SCORE & WHO PLOT */}
        {activeTab === 'antropometri' && (
          <div className="space-y-6">
            
            {/* Banner Antropometri */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 p-6 text-white shadow-md print:hidden">
              <div className="relative z-10 flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div className="space-y-1.5 max-w-2xl">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 backdrop-blur-md border border-emerald-400/30">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Intervensi PMT Pangan Lokal Kemenkes RI
                  </div>
                  <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                    Penguplotan Data Antropometri & Z-Score Balita
                  </h1>
                  <p className="text-xs sm:text-sm text-emerald-100/85 leading-relaxed">
                    Pencatatan data sasaran balita, perhitungan otomatis Z-Score TB/U sesuai Permenkes No. 2/2020, dan pemantauan kurva pertumbuhan WHO.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsUploadExcelOpen(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-bold text-emerald-950 shadow-sm transition hover:bg-emerald-50 active:scale-95"
                  >
                    <Upload className="h-4 w-4 text-emerald-700" />
                    Upload File Excel/CSV
                  </button>
                  <button
                    type="button"
                    onClick={downloadExcelTemplate}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-white/25 bg-white/10 px-3 py-2 text-xs font-medium text-white backdrop-blur-md transition hover:bg-white/20"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    Format Excel
                  </button>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <StatisticsOverview
              data={data}
              selectedPosyandu={selectedPosyandu}
              onSelectPosyandu={setSelectedPosyandu}
              selectedStatus={selectedStatus}
              onSelectStatus={setSelectedStatus}
            />

            {/* Data Table */}
            <PmtDataTable
              data={data}
              onOpenPlotCurve={(balita) => setSelectedBalitaForPlot(balita)}
              onEditBalita={(balita) => {
                setEditingBalita(balita);
                setIsManualEntryOpen(true);
              }}
              onDeleteBalita={(id) => {
                setData(prev => prev.filter(b => b.id !== id));
                showToast('Data balita berhasil dihapus.', 'info');
              }}
              onAddBalita={() => {
                setEditingBalita(null);
                setIsManualEntryOpen(true);
              }}
              selectedPosyandu={selectedPosyandu}
              selectedStatus={selectedStatus}
            />

          </div>
        )}

      </main>

      {/* Footer (Hidden on Print) */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto print:hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div>
            Aplikasi Dokumentasi Menu, Kegiatan & Belanja Bahan PMT Stunting • Standar BOK & Kemenkes RI
          </div>
          <div>
            Data & foto tersimpan aman di peramban web lokal
          </div>
        </div>
      </footer>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-900 px-4 py-3 text-xs font-medium text-white shadow-xl animate-fade-in print:hidden">
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          ) : (
            <AlertCircle className="h-4 w-4 text-amber-400" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Modal Upload/Edit Foto Dokumentasi (Kegiatan & Belanja) */}
      <UploadDokumentasiModal
        isOpen={isUploadDocOpen}
        onClose={() => {
          setIsUploadDocOpen(false);
          setEditingKegiatanItem(null);
          setEditingBelanjaItem(null);
        }}
        type={docModalType}
        pengaturan={pengaturanDoc}
        editingKegiatan={editingKegiatanItem}
        editingBelanja={editingBelanjaItem}
        onSaveKegiatan={handleSaveKegiatan}
        onSaveBelanja={handleSaveBelanja}
        daftarBalitaReferensi={data}
      />

      {/* Modal Pengaturan Kop & Periode Anggaran */}
      <PengaturanHeaderModal
        isOpen={isSettingHeaderOpen}
        onClose={() => setIsSettingHeaderOpen(false)}
        pengaturan={pengaturanDoc}
        onSave={(newPengaturan) => {
          setPengaturanDoc(newPengaturan);
          showToast('Kop dokumen & periode anggaran berhasil diperbarui.');
        }}
      />

      {/* Upload Modal Antropometri Excel */}
      <UploadModal
        isOpen={isUploadExcelOpen}
        onClose={() => setIsUploadExcelOpen(false)}
        onConfirmUpload={(newData, mode) => {
          if (mode === 'replace') {
            setData(newData);
            showToast(`Berhasil mengganti database dengan ${newData.length} data balita.`);
          } else {
            setData(prev => {
              const existingNiks = new Set(prev.map(p => p.nik));
              const filtered = newData.filter(n => !existingNiks.has(n.nik));
              return [...filtered, ...prev];
            });
            showToast(`Berhasil menambahkan ${newData.length} data balita.`);
          }
        }}
      />

      {/* Manual Entry Modal Antropometri */}
      <ManualEntryModal
        isOpen={isManualEntryOpen}
        onClose={() => {
          setIsManualEntryOpen(false);
          setEditingBalita(null);
        }}
        onSave={(balita) => {
          setData(prev => {
            const idx = prev.findIndex(item => item.id === balita.id);
            if (idx >= 0) {
              const next = [...prev];
              next[idx] = balita;
              return next;
            }
            return [balita, ...prev];
          });
          showToast(editingBalita ? `Data ${balita.namaBalita} diperbarui.` : `Balita ${balita.namaBalita} ditambahkan.`);
          setEditingBalita(null);
        }}
        initialData={editingBalita}
      />

      {/* Growth Curve Plot Modal */}
      <GrowthCurvePlot
        balita={selectedBalitaForPlot}
        onClose={() => setSelectedBalitaForPlot(null)}
        onSelectAnother={(b) => setSelectedBalitaForPlot(b)}
        allBalita={data}
      />

      {/* Printable Report Antropometri Modal */}
      <PrintReportModal
        isOpen={isPrintReportOpen}
        onClose={() => setIsPrintReportOpen(false)}
        data={data}
      />

    </div>
  );
}
