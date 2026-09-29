import { useState, useEffect } from 'react';
import { BalitaPMT, UserAccount } from './types';
import { INITIAL_PMT_DATA } from './data/samplePmtData';
import Navbar from './components/Navbar';
import StatisticsOverview from './components/StatisticsOverview';
import PmtDataTable from './components/PmtDataTable';
import UploadModal from './components/UploadModal';
import ManualEntryModal from './components/ManualEntryModal';
import GrowthCurvePlot from './components/GrowthCurvePlot';
import PrintReportModal from './components/PrintReportModal';
import LoginView from './components/LoginView';
import UserSettingsModal from './components/UserSettingsModal';
import { getCurrentUser, setCurrentUser } from './utils/authData';
import { getFormattedTanggalPosyandu } from './utils/nutritionStandards';
import { CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';

const STORAGE_KEY_BALITA = 'pmt_stanting_balita_data_v7';

/**
 * Menggabungkan data balita yang memiliki NIK atau Nama yang sama agar setiap anak
 * hanya dihitung sebagai 1 balita unik (tidak ganda menjadi 6 saat upload bulan baru),
 * sedangkan hasil penimbangan lintas bulan disimpan di dalam array `riwayat`.
 */
function deduplicateAndMergeBalita(list: BalitaPMT[]): BalitaPMT[] {
  const map = new Map<string, BalitaPMT>();

  list.forEach((item) => {
    const nikKey = (item.nik || '').trim();
    const nameKey = (item.namaBalita || '').trim().toUpperCase();
    // Cari apakah sudah ada di map berdasarkan NIK atau Nama Balita
    let matchKey = nikKey || nameKey;
    for (const [k, existing] of map.entries()) {
      if (
        (nikKey && (existing.nik || '').trim() === nikKey) ||
        (nameKey && (existing.namaBalita || '').trim().toUpperCase() === nameKey)
      ) {
        matchKey = k;
        break;
      }
    }

    // Kumpulkan riwayat dari item ini beserta tanggal pengukurannya sendiri
    const itemHistories = [...(item.riwayat || [])];
    if (item.tanggalPengukuran) {
      const itemMonthYear = getFormattedTanggalPosyandu(item.tanggalPengukuran).bulanTahun.toLowerCase().trim();
      const existingHistIdx = itemHistories.findIndex(
        (h) =>
          h.tanggal === item.tanggalPengukuran ||
          getFormattedTanggalPosyandu(h.tanggal).bulanTahun.toLowerCase().trim() === itemMonthYear
      );
      const selfHist = {
        id: `hist-${item.tanggalPengukuran}-${item.id}`,
        tanggal: item.tanggalPengukuran,
        hariPMT: item.hariPMT || 30,
        tinggiBadan: item.tinggiBadan,
        beratBadan: item.beratBadan,
        kepatuhan: item.kepatuhan,
        catatan:
          item.catatanKesehatan ||
          `Pengukuran Posyandu ${getFormattedTanggalPosyandu(item.tanggalPengukuran).bulanTahun}`,
      };
      if (existingHistIdx >= 0) {
        itemHistories[existingHistIdx] = selfHist;
      } else {
        itemHistories.push(selfHist);
      }
    }

    if (!map.has(matchKey)) {
      itemHistories.sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime());
      map.set(matchKey, {
        ...item,
        riwayat: itemHistories,
      });
    } else {
      const existing = map.get(matchKey)!;
      const mergedHistories = [...(existing.riwayat || [])];

      itemHistories.forEach((newH) => {
        const newMonthYear = getFormattedTanggalPosyandu(newH.tanggal).bulanTahun.toLowerCase().trim();
        const dupIdx = mergedHistories.findIndex(
          (oldH) =>
            oldH.tanggal === newH.tanggal ||
            (newMonthYear &&
              getFormattedTanggalPosyandu(oldH.tanggal).bulanTahun.toLowerCase().trim() === newMonthYear &&
              oldH.tanggal.slice(0, 7) === newH.tanggal.slice(0, 7))
        );
        if (dupIdx >= 0) {
          mergedHistories[dupIdx] = newH;
        } else {
          mergedHistories.push(newH);
        }
      });

      mergedHistories.sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime());

      // Gunakan data pengukuran terbaru (atau yang baru diupload) sebagai status utama balita,
      // namun tetap pertahankan ID awal balita agar tidak terduplikasi
      const existingTime = new Date(existing.tanggalPengukuran || '2026-01-01').getTime();
      const itemTime = new Date(item.tanggalPengukuran || '2026-01-01').getTime();
      const latestRecord = itemTime >= existingTime ? item : existing;

      map.set(matchKey, {
        ...existing,
        ...latestRecord,
        id: existing.id,
        nik: existing.nik || latestRecord.nik,
        riwayat: mergedHistories,
      });
    }
  });

  return Array.from(map.values());
}

export default function App() {
  // User Authentication State
  const [currentUser, setCurUser] = useState<UserAccount | null>(() => getCurrentUser());
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [settingsModalTab, setSettingsModalTab] = useState<'pengaturan' | 'ubah_profil' | 'password'>('pengaturan');

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
            return deduplicateAndMergeBalita(parsed);
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
  const [printBulan, setPrintBulan] = useState<string>('Semua');
  const [printTahun, setPrintTahun] = useState<string>('Semua');

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
      showToast('Data berhasil diperbarui: 3 balita sasaran stunting.');
    }
  };

  const totalStunting = data.filter(d => d.statusTBU === 'Sangat Pendek' || d.statusTBU === 'Pendek').length;

  if (!currentUser) {
    return (
      <LoginView
        onLoginSuccess={(user) => {
          setCurUser(user);
          setCurrentUser(user);
          showToast(`Selamat datang, ${user.namaLengkap} (${user.role})!`);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col selection:bg-emerald-500 selection:text-white font-sans antialiased">
      
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        onOpenSettings={(tab) => {
          setSettingsModalTab(tab);
          setIsSettingsModalOpen(true);
        }}
        onLogout={() => {
          if (confirm(`Apakah Anda yakin ingin keluar dari akun ${currentUser.namaLengkap}?`)) {
            setCurUser(null);
            setCurrentUser(null);
            showToast('Anda telah keluar dari sistem.');
          }
        }}
      />

      {/* Main Content Area */}
      <main className={`mx-auto max-w-7xl flex-1 px-3 sm:px-6 lg:px-8 py-5 w-full ${isPrintReportOpen ? 'print:hidden' : ''}`}>
        <div className="space-y-6">
          
          {/* Banner Antropometri */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 p-6 text-white shadow-md print:hidden">
            <div className="relative z-10 space-y-2 max-w-3xl">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 backdrop-blur-md border border-emerald-400/30">
                <ShieldCheck className="h-3.5 w-3.5" />
                {currentUser.role} • {currentUser.posyandu}
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                Evaluasi Balita Stunting
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100/85 leading-relaxed">
                Pencatatan data sasaran balita stunting, perhitungan otomatis Z-Score TB/U &amp; BB/TB sesuai Permenkes No. 2/2020, kepatuhan menu harian, dan pemantauan kurva pertumbuhan WHO.
              </p>
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
            onOpenPrintReport={(bulan, tahun) => {
              setPrintBulan(bulan || 'Semua');
              setPrintTahun(tahun || 'Semua');
              setIsPrintReportOpen(true);
            }}
            onOpenUploadExcel={() => setIsUploadExcelOpen(true)}
            selectedPosyandu={selectedPosyandu}
            selectedStatus={selectedStatus}
          />

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto print:hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div>
            Sistem Penguplotan &amp; Evaluasi Antropometri Balita Stunting • Standar Kemenkes RI
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
            const deduped = deduplicateAndMergeBalita(newData);
            setData(deduped);
            showToast(`Berhasil mengganti database dengan ${deduped.length} data balita.`);
          } else {
            setData(prev => deduplicateAndMergeBalita([...prev, ...newData]));

            const firstInfo = newData.length > 0 ? getFormattedTanggalPosyandu(newData[0].tanggalPengukuran).bulanTahun : '';
            showToast(`Berhasil memperbarui riwayat penimbangan ${newData.length} balita${firstInfo ? ` periode ${firstInfo}` : ''}.`);
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
        initialBulan={printBulan}
        initialTahun={printTahun}
        selectedPosyandu={selectedPosyandu}
      />

      {/* User Settings & Account Modal */}
      {currentUser && (
        <UserSettingsModal
          isOpen={isSettingsModalOpen}
          initialTab={settingsModalTab}
          currentUser={currentUser}
          onClose={() => setIsSettingsModalOpen(false)}
          onUpdateUser={(updatedUser) => {
            setCurUser(updatedUser);
            showToast('Profil pengguna berhasil diperbarui.');
          }}
          onLogout={() => {
            if (confirm(`Apakah Anda yakin ingin keluar dari akun ${currentUser.namaLengkap}?`)) {
              setIsSettingsModalOpen(false);
              setCurUser(null);
              setCurrentUser(null);
              showToast('Anda telah keluar dari sistem.');
            }
          }}
        />
      )}

    </div>
  );
}
