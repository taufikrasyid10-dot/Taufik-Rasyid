import React, { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, X, ArrowRight, Download, Info, Calendar } from 'lucide-react';
import { BalitaPMT, UploadSummary } from '../types';
import { parseUploadedFile, downloadExcelTemplate, recalculateBalitaForDate } from '../utils/excelHelper';
import { getFormattedTanggalPosyandu } from '../utils/nutritionStandards';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmUpload: (newData: BalitaPMT[], mode: 'append' | 'replace') => void;
}

const MONTHS_LIST = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const YEARS_LIST = ['2026', '2027', '2028', '2029', '2030', '2031', '2032'];

export default function UploadModal({ isOpen, onClose, onConfirmUpload }: UploadModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [summary, setSummary] = useState<UploadSummary | null>(null);
  const [uploadMode, setUploadMode] = useState<'append' | 'replace'>('append');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pilihan Bulan & Tahun Posyandu
  const [selectedBulan, setSelectedBulan] = useState<string>(() => {
    const curIdx = new Date().getMonth();
    return MONTHS_LIST[curIdx] || 'September';
  });
  const [selectedTahun, setSelectedTahun] = useState<string>('2026');
  const [applyPeriodToAll, setApplyPeriodToAll] = useState<boolean>(true);

  if (!isOpen) return null;

  const getTargetDate = (bulan: string, tahun: string) => {
    const mIdx = MONTHS_LIST.indexOf(bulan);
    const mNum = String(mIdx >= 0 ? mIdx + 1 : 8).padStart(2, '0');
    return `${tahun}-${mNum}-01`;
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const hasValidExt = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

    if (!hasValidExt) {
      setErrorMessage('Format file tidak didukung. Silakan pilih file Excel (.xlsx, .xls) atau CSV (.csv).');
      return;
    }

    setErrorMessage(null);
    setIsProcessing(true);

    try {
      const targetDate = applyPeriodToAll ? getTargetDate(selectedBulan, selectedTahun) : undefined;
      const result = await parseUploadedFile(file, targetDate);

      // Jika user memilih terapkan ke semua baris, pastikan setiap baris dihitung ulang sesuai bulan target
      if (applyPeriodToAll && targetDate) {
        result.data = result.data.map(item => recalculateBalitaForDate(item, targetDate));
      }

      setSummary(result);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal memproses file Excel. Pastikan format kolom sesuai dengan template.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Saat user mengubah bulan atau tahun pada layar pratinjau (preview)
  const handleChangePeriod = (newBulan: string, newTahun: string) => {
    setSelectedBulan(newBulan);
    setSelectedTahun(newTahun);

    if (summary && summary.data.length > 0) {
      const newTargetDate = getTargetDate(newBulan, newTahun);
      const updatedList = summary.data.map(item => recalculateBalitaForDate(item, newTargetDate));
      setSummary({
        ...summary,
        data: updatedList,
      });
    }
  };

  const handleConfirm = () => {
    if (!summary || summary.data.length === 0) return;
    onConfirmUpload(summary.data, uploadMode);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setSummary(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div 
        id="upload-modal-container"
        className="relative flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Upload className="h-5 w-5 text-emerald-600" />
              Upload Data Penimbangan Balita
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Unggah rekapan hasil penimbangan Posyandu untuk setiap bulan (Januari s/d Desember)
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 space-y-5">
          
          {!summary ? (
            <>
              {/* Card Pilihan Periode Bulan & Tahun Posyandu */}
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-emerald-700" />
                      Pilih Periode Bulan &amp; Tahun Penimbangan Posyandu
                    </span>
                    <p className="text-[11px] text-emerald-800/80 mt-0.5">
                      Data yang Anda upload akan dicatat sebagai evaluasi penimbangan pada periode ini.
                    </p>
                  </div>

                  {/* Dropdowns Periode */}
                  <div className="flex items-center gap-2">
                    <div>
                      <select
                        aria-label="Pilih Bulan Penimbangan"
                        value={selectedBulan}
                        onChange={(e) => setSelectedBulan(e.target.value)}
                        className="rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-950 focus:border-emerald-600 focus:outline-none shadow-xs"
                      >
                        {MONTHS_LIST.map((m) => (
                          <option key={m} value={m}>
                            Bulan {m}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <select
                        aria-label="Pilih Tahun Penimbangan"
                        value={selectedTahun}
                        onChange={(e) => setSelectedTahun(e.target.value)}
                        className="rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-950 focus:border-emerald-600 focus:outline-none shadow-xs"
                      >
                        {YEARS_LIST.map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-emerald-200/60 text-xs">
                  <label className="inline-flex items-center gap-2 cursor-pointer text-emerald-900 font-medium text-[11px]">
                    <input
                      type="checkbox"
                      checked={applyPeriodToAll}
                      onChange={(e) => setApplyPeriodToAll(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Gunakan bulan &amp; tahun ini untuk semua balita dalam file yang diunggah</span>
                  </label>

                  <span className="text-[11px] text-emerald-700 font-mono">
                    Target: 01 {selectedBulan} {selectedTahun}
                  </span>
                </div>
              </div>

              {/* Dropzone Area */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-all ${
                  dragActive
                    ? 'border-emerald-500 bg-emerald-50/50 scale-[0.99]'
                    : 'border-slate-300 bg-slate-50/70 hover:border-emerald-400 hover:bg-white'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  id="file-upload-input"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileInputChange}
                  className="hidden"
                />

                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 shadow-inner">
                  <FileSpreadsheet className="h-7 w-7" />
                </div>

                <h3 className="text-base font-semibold text-slate-800">
                  Tarik &amp; Letakkan file Excel / CSV di sini
                </h3>
                <p className="mt-1 text-xs text-slate-500 max-w-sm">
                  Mendukung file <span className="font-medium text-slate-700">.xlsx, .xls, .csv</span> rekapan Posyandu bulan <span className="font-bold text-emerald-700">{selectedBulan} {selectedTahun}</span>
                </p>

                <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessing}
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 active:scale-95 transition cursor-pointer"
                  >
                    <Upload className="h-4 w-4" />
                    Pilih File dari Komputer
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadExcelTemplate(selectedBulan, selectedTahun)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                    title={`Unduh format template untuk bulan ${selectedBulan} ${selectedTahun}`}
                  >
                    <Download className="h-3.5 w-3.5 text-emerald-600" />
                    Format Template ({selectedBulan} {selectedTahun})
                  </button>
                </div>

                {isProcessing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-xs rounded-xl">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-8 w-8 animate-spin rounded-full border-3 border-emerald-600 border-t-transparent" />
                      <p className="text-xs font-semibold text-emerald-800">Menganalisis kolom &amp; menghitung Z-Score periode {selectedBulan} {selectedTahun}...</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Error Notification */}
              {errorMessage && (
                <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800">
                  <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
                  <div>
                    <p className="font-semibold">Terjadi Kesalahan Saat Membaca File</p>
                    <p className="mt-0.5 text-rose-700">{errorMessage}</p>
                  </div>
                </div>
              )}

              {/* Informational Banner on Monthly Multi-Upload */}
              <div className="rounded-xl border border-sky-200 bg-sky-50/70 p-4 text-xs text-sky-900 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-sky-950">
                  <Info className="h-4 w-4 text-sky-600 shrink-0" />
                  Mendukung Pemantauan Berkala Setiap Bulan (Januari s/d Desember)
                </div>
                <p className="text-sky-800 leading-relaxed text-[11px]">
                  Anda dapat mengunggah kembali data penimbangan untuk balita yang sama di setiap bulan. Sistem secara otomatis menyimpan data sebagai riwayat tumbuh kembang balita sehingga kurva pertumbuhan WHO dapat dipantau dari bulan ke bulan.
                </p>
              </div>

              {/* Tips & Column Requirements */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-xs text-slate-600 space-y-2">
                <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                  <Info className="h-4 w-4 text-emerald-600" />
                  Format Kolom yang Dibutuhkan Sistem:
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Pastikan dokumen Anda memuat minimal kolom: <span className="font-medium text-slate-800">Nama Balita</span>, <span className="font-medium text-slate-800">Jenis Kelamin (L/P)</span>, <span className="font-medium text-slate-800">Tanggal Lahir</span>, <span className="font-medium text-slate-800">Berat Badan (kg)</span>, dan <span className="font-medium text-slate-800">Tinggi/Panjang Badan (cm)</span>.
                </p>
                <p className="text-slate-500 text-[11px]">
                  Sistem otomatis menghitung umur balita (bulan) sesuai bulan penimbangan, Z-Score standar Permenkes No. 2/2020, serta status stunting (Sangat Pendek / Pendek / Normal).
                </p>
              </div>
            </>
          ) : (
            /* Upload Preview & Validation Screen */
            <div className="space-y-4">
              
              {/* Periode Konfirmasi Bar */}
              <div className="rounded-xl border border-emerald-300 bg-emerald-50/80 p-3.5 flex flex-col sm:flex-row justify-between sm:items-center gap-2.5">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-emerald-700" />
                  <div>
                    <span className="text-xs font-bold text-emerald-950">Periode Penimbangan Data:</span>
                    <span className="text-xs text-emerald-800 ml-1.5 font-semibold">
                      {selectedBulan} {selectedTahun}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-[11px] text-emerald-800">Ubah Periode:</span>
                  <select
                    aria-label="Ubah Bulan Penimbangan"
                    value={selectedBulan}
                    onChange={(e) => handleChangePeriod(e.target.value, selectedTahun)}
                    className="rounded-md border border-emerald-300 bg-white px-2 py-1 text-xs font-semibold text-emerald-950 shadow-2xs"
                  >
                    {MONTHS_LIST.map((m) => (
                      <option key={m} value={m}>
                        Bulan {m}
                      </option>
                    ))}
                  </select>
                  <select
                    aria-label="Ubah Tahun Penimbangan"
                    value={selectedTahun}
                    onChange={(e) => handleChangePeriod(selectedBulan, e.target.value)}
                    className="rounded-md border border-emerald-300 bg-white px-2 py-1 text-xs font-semibold text-emerald-950 shadow-2xs"
                  >
                    {YEARS_LIST.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Summary Stats Badge */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <span className="text-xs text-slate-500">Total Baris Terbaca</span>
                  <p className="text-xl font-bold text-slate-800">{summary.totalRows}</p>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3">
                  <span className="text-xs text-emerald-700">Data Siap Disimpan</span>
                  <p className="text-xl font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" />
                    {summary.validRows}
                  </p>
                </div>
                <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3">
                  <span className="text-xs text-amber-700">Baris Catatan / Warning</span>
                  <p className="text-xl font-bold text-amber-700">
                    {summary.validationList.filter(v => v.warnings.length > 0).length}
                  </p>
                </div>
                <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-3">
                  <span className="text-xs text-rose-700">Baris Tidak Valid</span>
                  <p className="text-xl font-bold text-rose-700">{summary.invalidRows}</p>
                </div>
              </div>

              {/* Upload Action Mode (Append or Replace) */}
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <label className="text-xs font-semibold text-slate-700 block mb-2">
                  Metode Penyimpanan Data:
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <label className={`flex flex-1 items-center gap-2.5 rounded-lg border p-3 cursor-pointer text-xs transition ${
                    uploadMode === 'append' ? 'border-emerald-600 bg-emerald-50/40 text-emerald-950 font-medium ring-1 ring-emerald-500/20' : 'border-slate-200 hover:bg-slate-50'
                  }`}>
                    <input
                      type="radio"
                      name="uploadMode"
                      value="append"
                      checked={uploadMode === 'append'}
                      onChange={() => setUploadMode('append')}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <div className="font-semibold text-slate-900">Tambahkan / Perbarui (Append) - Direkomendasikan</div>
                      <div className="text-slate-500 text-[11px] mt-0.5">
                        Menambahkan data bulan ini ke riwayat balita. Jika balita sudah ada di bulan yang sama, datanya akan diperbarui.
                      </div>
                    </div>
                  </label>

                  <label className={`flex flex-1 items-center gap-2.5 rounded-lg border p-3 cursor-pointer text-xs transition ${
                    uploadMode === 'replace' ? 'border-emerald-600 bg-emerald-50/40 text-emerald-950 font-medium ring-1 ring-emerald-500/20' : 'border-slate-200 hover:bg-slate-50'
                  }`}>
                    <input
                      type="radio"
                      name="uploadMode"
                      value="replace"
                      checked={uploadMode === 'replace'}
                      onChange={() => setUploadMode('replace')}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <div className="font-semibold text-slate-900">Ganti Semua Data (Replace)</div>
                      <div className="text-slate-500 text-[11px] mt-0.5">
                        Hapus seluruh database lama dan gantikan secara penuh dengan file ini.
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Preview Table */}
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-100/70 px-4 py-2.5 text-xs font-semibold text-slate-700 flex justify-between items-center">
                  <span>Pratinjau Hasil Pembacaan &amp; Kalkulasi Otomatis ({summary.data.length} baris)</span>
                  <span className="text-slate-500 text-[11px]">File: {summary.fileName}</span>
                </div>
                <div className="max-h-64 overflow-x-auto overflow-y-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase sticky top-0">
                      <tr>
                        <th className="px-3 py-2">Baris</th>
                        <th className="px-3 py-2">Nama Balita</th>
                        <th className="px-3 py-2">Bulan Posyandu</th>
                        <th className="px-3 py-2">JK &amp; Usia</th>
                        <th className="px-3 py-2">TB (cm)</th>
                        <th className="px-3 py-2">BB (kg)</th>
                        <th className="px-3 py-2">Z-Score TB/U</th>
                        <th className="px-3 py-2">Status Stunting</th>
                        <th className="px-3 py-2">Kepatuhan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {summary.data.slice(0, 15).map((item, idx) => {
                        const dateInfo = getFormattedTanggalPosyandu(item.tanggalPengukuran);
                        return (
                          <tr key={idx} className="hover:bg-slate-50/80">
                            <td className="px-3 py-2 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                            <td className="px-3 py-2 font-medium text-slate-900">
                              <div>{item.namaBalita}</div>
                              <div className="text-[10px] text-slate-400 font-mono">NIK: {item.nik}</div>
                            </td>
                            <td className="px-3 py-2">
                              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 border border-emerald-200">
                                <Calendar className="h-3 w-3" />
                                {dateInfo.bulanTahun}
                              </span>
                            </td>
                            <td className="px-3 py-2">
                              <div>{item.jk === 'L' ? 'Laki-laki' : 'Perempuan'}</div>
                              <div className="text-[10px] text-slate-500">{item.usiaBulan} bln</div>
                            </td>
                            <td className="px-3 py-2 font-semibold text-slate-800">{item.tinggiBadan} cm</td>
                            <td className="px-3 py-2">{item.beratBadan} kg</td>
                            <td className="px-3 py-2 font-mono font-medium">
                              <span className={item.zScoreTBU < -2 ? 'text-rose-600 font-bold' : 'text-emerald-700'}>
                                {item.zScoreTBU > 0 ? `+${item.zScoreTBU}` : item.zScoreTBU} SD
                              </span>
                            </td>
                            <td className="px-3 py-2">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                                item.statusTBU === 'Sangat Pendek'
                                  ? 'bg-rose-100 text-rose-800'
                                  : item.statusTBU === 'Pendek'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}>
                                {item.statusTBU}
                              </span>
                            </td>
                            <td className="px-3 py-2">{item.kepatuhan}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {summary.data.length > 15 && (
                    <div className="p-2 text-center text-xs text-slate-500 bg-slate-50 border-t border-slate-100">
                      Menampilkan 15 dari {summary.data.length} total baris data
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 bg-slate-50">
          {summary ? (
            <>
              <button
                type="button"
                onClick={handleReset}
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-white transition cursor-pointer"
              >
                Pilih File Lain
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-white transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  id="btn-save-uploaded-data"
                  onClick={handleConfirm}
                  disabled={summary.validRows === 0}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 active:scale-95 transition disabled:opacity-50 cursor-pointer"
                >
                  <span>Simpan {summary.validRows} Data Balita ({selectedBulan} {selectedTahun})</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex justify-end w-full">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-white transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
