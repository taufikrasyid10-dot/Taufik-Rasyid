import React, { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, X, ArrowRight, Download, Info } from 'lucide-react';
import { BalitaPMT, UploadSummary } from '../types';
import { parseUploadedFile, downloadExcelTemplate } from '../utils/excelHelper';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmUpload: (newData: BalitaPMT[], mode: 'append' | 'replace') => void;
}

export default function UploadModal({ isOpen, onClose, onConfirmUpload }: UploadModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [summary, setSummary] = useState<UploadSummary | null>(null);
  const [uploadMode, setUploadMode] = useState<'append' | 'replace'>('append');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

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
      const result = await parseUploadedFile(file);
      setSummary(result);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal memproses file Excel. Pastikan format kolom sesuai dengan template.');
    } finally {
      setIsProcessing(false);
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
              Penguplotan Data Balita Stunting
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Unggah file rekapan Excel (.xlsx, .xls) atau CSV hasil penimbangan Posyandu
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 space-y-5">
          
          {!summary ? (
            <>
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
                  Tarik & Letakkan file Excel / CSV di sini
                </h3>
                <p className="mt-1 text-xs text-slate-500 max-w-sm">
                  Mendukung file <span className="font-medium text-slate-700">.xlsx, .xls, .csv</span> hasil rekap e-PPGBM atau laporan posyandu
                </p>

                <div className="mt-4 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessing}
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 active:scale-95 transition"
                  >
                    <Upload className="h-4 w-4" />
                    Pilih File dari Komputer
                  </button>
                  <button
                    type="button"
                    onClick={downloadExcelTemplate}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
                  >
                    <Download className="h-3.5 w-3.5 text-emerald-600" />
                    Unduh Format Template
                  </button>
                </div>

                {isProcessing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-xs rounded-xl">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-8 w-8 animate-spin rounded-full border-3 border-emerald-600 border-t-transparent" />
                      <p className="text-xs font-semibold text-emerald-800">Menganalisis kolom & menghitung Z-Score...</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Error Notification */}
              {errorMessage && (
                <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 text-rose-600" />
                  <div>
                    <p className="font-semibold">Terjadi Kesalahan Saat Membaca File</p>
                    <p className="mt-0.5 text-rose-700">{errorMessage}</p>
                  </div>
                </div>
              )}

              {/* Tips & Column Requirements */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-xs text-slate-600 space-y-2">
                <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                  <Info className="h-4 w-4 text-emerald-600" />
                  Format Kolom yang Dibutuhkan Sistem:
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Pastikan dokumen Anda memuat minimal kolom: <span className="font-medium text-slate-800">Nama Balita</span>, <span className="font-medium text-slate-800">Jenis Kelamin (L/P)</span>, <span className="font-medium text-slate-800">Tanggal Lahir</span>, <span className="font-medium text-slate-800">Berat Badan (kg)</span>, dan <span className="font-medium text-slate-800">Tinggi/Panjang Badan (cm)</span>.
                </p>
                <p className="text-slate-500">
                  Sistem otomatis menghitung umur balita (bulan), Z-Score standar Permenkes No. 2/2020, dan mengklasifikasikan status stunting (Sangat Pendek / Pendek / Normal).
                </p>
              </div>
            </>
          ) : (
            /* Upload Preview & Validation Screen */
            <div className="space-y-4">
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
                    uploadMode === 'append' ? 'border-emerald-600 bg-emerald-50/40 text-emerald-950 font-medium' : 'border-slate-200 hover:bg-slate-50'
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
                      <div className="font-semibold">Tambahkan (Append)</div>
                      <div className="text-slate-500 text-[11px]">Gabungkan baris baru dengan data balita yang sudah ada</div>
                    </div>
                  </label>

                  <label className={`flex flex-1 items-center gap-2.5 rounded-lg border p-3 cursor-pointer text-xs transition ${
                    uploadMode === 'replace' ? 'border-emerald-600 bg-emerald-50/40 text-emerald-950 font-medium' : 'border-slate-200 hover:bg-slate-50'
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
                      <div className="font-semibold">Ganti Semua Data (Replace)</div>
                      <div className="text-slate-500 text-[11px]">Hapus data lama dan gantikan sepenuhnya dengan file ini</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Preview Table */}
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-100/70 px-4 py-2.5 text-xs font-semibold text-slate-700 flex justify-between items-center">
                  <span>Pratinjau Hasil Pembacaan & Kalkulasi Otomatis ({summary.data.length} baris)</span>
                  <span className="text-slate-500 text-[11px]">File: {summary.fileName}</span>
                </div>
                <div className="max-h-64 overflow-x-auto overflow-y-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase sticky top-0">
                      <tr>
                        <th className="px-3 py-2">Baris</th>
                        <th className="px-3 py-2">Nama Balita</th>
                        <th className="px-3 py-2">JK</th>
                        <th className="px-3 py-2">Usia</th>
                        <th className="px-3 py-2">TB (cm)</th>
                        <th className="px-3 py-2">BB (kg)</th>
                        <th className="px-3 py-2">Z-Score TB/U</th>
                        <th className="px-3 py-2">Status Stunting</th>
                        <th className="px-3 py-2">Kepatuhan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {summary.data.slice(0, 15).map((item, idx) => {
                        const isStunted = item.statusTBU === 'Pendek' || item.statusTBU === 'Sangat Pendek';
                        return (
                          <tr key={idx} className="hover:bg-slate-50/80">
                            <td className="px-3 py-2 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                            <td className="px-3 py-2 font-medium text-slate-900">{item.namaBalita}</td>
                            <td className="px-3 py-2">{item.jk === 'L' ? 'Laki-laki' : 'Perempuan'}</td>
                            <td className="px-3 py-2">{item.usiaBulan} bln</td>
                            <td className="px-3 py-2">{item.tinggiBadan} cm</td>
                            <td className="px-3 py-2">{item.beratBadan} kg</td>
                            <td className="px-3 py-2 font-mono font-medium">
                              <span className={item.zScoreTBU < -2 ? 'text-rose-600' : 'text-emerald-700'}>
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
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-white transition"
              >
                Pilih File Lain
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-white transition"
                >
                  Batal
                </button>
                <button
                  type="button"
                  id="btn-save-uploaded-data"
                  onClick={handleConfirm}
                  disabled={summary.validRows === 0}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 active:scale-95 transition disabled:opacity-50"
                >
                  <span>Simpan {summary.validRows} Data Balita</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex justify-end w-full">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-white transition"
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
