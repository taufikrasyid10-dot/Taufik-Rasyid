import { useState, useEffect } from 'react';
import { BalitaPMT } from './types';
import { INITIAL_PMT_DATA } from './data/samplePmtData';
import Navbar from './components/Navbar';
import StatisticsOverview from './components/StatisticsOverview';
import PmtDataTable from './components/PmtDataTable';
import UploadModal from './components/UploadModal';
import ManualEntryModal from './components/ManualEntryModal';
import GrowthCurvePlot from './components/GrowthCurvePlot';
import PrintReportModal from './components/PrintReportModal';
import { CheckCircle2, ShieldCheck, FileSpreadsheet, Upload, AlertCircle, PlusCircle, Printer } from 'lucide-react';
import { downloadExcelTemplate, exportDataToExcel } from './utils/excelHelper';

const STORAGE_KEY_BALITA = 'pmt_stanting_balita_data_v7';

export default function App() {
  // Balita Antropometri Data (3 Balita Sasaran: ARSYAD, MOHAMMAD ALFA RISKI, NURHAFIZAH)
  const [data, setData] = useState<BalitaPMT[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_BALITA);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Pastikan MOHAMMAD ALFA RISKI ada di dalam list
          const hasAlfa = parsed.some((b: BalitaPMT) => 
            (b.namaBalita || '').toUpperCase().includes('ALFA') || (b.nik || '').trim() === '720904161224001'
          );
          if (hasAlfa) {
            return parsed;
          }
        }
      }
    } catch (e) {
      console.error('Error loading data from localStorage', e);
    }
    return INITIAL_PMT_DATA;
  });

  // Antropometri Modals
  const [isUploadExcelOpen, setIsUploadExcelOpen] = useState(false);
  const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);
  const [editingBalita, setEditingBalita] = useState<BalitaPMT | null>(null);
  const [selectedBalitaForPlot, setSelectedBalitaForPlot] = useState<BalitaPMT | null>(null);
  const [isPrintReportOpen, setIsPrintReportOpen] = useState(false);

  // Filter Antropometri
  const [selectedPosyandu, setSelectedPosyandu] = useState<string>('Semua');
  const [selectedStatus, setSelectedStatus] = useState<string>('Semua');

  // Toast notification
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  // Auto-save all persistent states
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_BALITA, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save balita data', e);
    }
  }, [data]);

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // General reset
  const handleResetData = () => {
    if (confirm('Kembalikan data ke 3 balita sasaran stunting (ARSYAD, MOHAMMAD ALFA RISKI, NURHAFIZAH)?')) {
      setData(INITIAL_PMT_DATA);
      showToast('Data berhasil diperbarui: 3 balita stunting sasaran PMT.');
    }
  };

  const totalStunting = data.filter(d => d.statusTBU === 'Sangat Pendek' || d.statusTBU === 'Pendek').length;

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col selection:bg-emerald-500 selection:text-white font-sans antialiased">
      
      {/* Top Navbar */}
      <Navbar
        totalBalita={data.length}
        totalStunting={totalStunting}
        onOpenUploadExcel={() => setIsUploadExcelOpen(true)}
        onOpenManualEntry={() => {
          setEditingBalita(null);
          setIsManualEntryOpen(true);
        }}
        onOpenPrintReport={() => setIsPrintReportOpen(true)}
        onExportExcel={() => exportDataToExcel(data, 'Cetakan_Evaluasi_PMT_Stunting')}
        onResetData={handleResetData}
      />

      {/* Main Content Area */}
      <main className={`mx-auto max-w-7xl flex-1 px-3 sm:px-6 lg:px-8 py-5 w-full ${isPrintReportOpen ? 'print:hidden' : ''}`}>
        <div className="space-y-6">
          
          {/* Banner Antropometri */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 p-6 text-white shadow-md print:hidden">
            <div className="relative z-10 flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div className="space-y-1.5 max-w-2xl">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 backdrop-blur-md border border-emerald-400/30">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Yuli Usman
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                  Evaluasi Balita Stunting
                </h1>
                <p className="text-xs sm:text-sm text-emerald-100/85 leading-relaxed">
                  Pencatatan data sasaran balita stunting, perhitungan otomatis Z-Score TB/U &amp; BB/TB sesuai Permenkes No. 2/2020, kepatuhan menu harian, dan pemantauan kurva pertumbuhan WHO.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsUploadExcelOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-bold text-emerald-950 shadow-sm transition hover:bg-emerald-50 active:scale-95"
                >
                  <Upload className="h-4 w-4 text-emerald-700" />
                  Upload Excel/CSV
                </button>
                <button
                  type="button"
                  onClick={() => setIsPrintReportOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/30 bg-white/15 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur-md transition hover:bg-white/25 shadow-xs active:scale-95"
                  title="Cetak Laporan: Pilihan Format Excel (.xlsx) atau Dokumen PDF"
                >
                  <Printer className="h-4 w-4 text-emerald-300" />
                  <span>Cetak Laporan (Excel / PDF)</span>
                </button>
                <button
                  type="button"
                  onClick={downloadExcelTemplate}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/25 bg-white/10 px-3 py-2 text-xs font-medium text-white backdrop-blur-md transition hover:bg-white/20"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  Format Excel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingBalita(null);
                    setIsManualEntryOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/25 bg-white/10 px-3 py-2 text-xs font-medium text-white backdrop-blur-md transition hover:bg-white/20"
                >
                  <PlusCircle className="h-4 w-4" />
                  Input Balita
                </button>
              </div>
            </div>
          </div>

          {/* Statistics Overview */}
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
            onOpenPrintReport={() => setIsPrintReportOpen(true)}
            selectedPosyandu={selectedPosyandu}
            selectedStatus={selectedStatus}
          />

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto print:hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div>
            Sistem Penguplotan &amp; Evaluasi Antropometri Balita PMT Stunting • Standar Kemenkes RI
          </div>
          <div>
            Data tersimpan aman di penyimpanan lokal peramban web
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
