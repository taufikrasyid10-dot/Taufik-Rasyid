import React, { useState, useMemo, useEffect } from 'react';
import { BalitaPMT } from '../types';
import { X, Printer, FileSpreadsheet, Download, FileCheck, Check, LayoutTemplate, Calendar } from 'lucide-react';
import { exportDataToExcel, getBalitaDataForPeriod, getAvailablePeriodsFromData } from '../utils/excelHelper';
import { getStatusGiziBalita, getFormattedTanggalPosyandu } from '../utils/nutritionStandards';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: BalitaPMT[];
  initialBulan?: string;
  initialTahun?: string;
  selectedPosyandu?: string;
}

const MONTHS_LIST = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export default function PrintReportModal({
  isOpen,
  onClose,
  data,
  initialBulan = 'Semua',
  initialTahun = 'Semua',
  selectedPosyandu = 'Semua',
}: PrintReportModalProps) {
  const [paperOrientation, setPaperOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const [filterBulan, setFilterBulan] = useState<string>(initialBulan);
  const [filterTahun, setFilterTahun] = useState<string>(initialTahun);

  useEffect(() => {
    if (isOpen) {
      setFilterBulan(initialBulan || 'Semua');
      setFilterTahun(initialTahun || 'Semua');
    }
  }, [isOpen, initialBulan, initialTahun]);

  // Daftar periode bulan & tahun yang memiliki data di riwayat Posyandu
  const availablePeriods = useMemo(() => getAvailablePeriodsFromData(data), [data]);

  const yearOptions = useMemo(() => {
    const startYear = 2026;
    const yearSet = new Set<number>();
    for (let y = startYear; y <= 2035; y++) {
      yearSet.add(y);
    }
    availablePeriods.forEach((p) => {
      const y = parseInt(p.tahun, 10);
      if (!isNaN(y)) yearSet.add(y);
    });
    return Array.from(yearSet).sort((a, b) => a - b);
  }, [availablePeriods]);

  // Data balita yang sudah disesuaikan dengan bulan & tahun Posyandu yang dipilih
  const reportData = useMemo(() => {
    const posyanduFiltered =
      selectedPosyandu && selectedPosyandu !== 'Semua'
        ? data.filter((d) => d.posyandu === selectedPosyandu)
        : data;
    return getBalitaDataForPeriod(posyanduFiltered, filterBulan, filterTahun);
  }, [data, selectedPosyandu, filterBulan, filterTahun]);

  // Label Periode Bulan Posyandu untuk Kop Surat & Cetakan
  const periodePosyanduLabel = useMemo(() => {
    if (filterBulan !== 'Semua' && filterTahun !== 'Semua') {
      return `${filterBulan} ${filterTahun}`;
    }
    if (filterBulan !== 'Semua') {
      const years = Array.from(
        new Set(
          reportData
            .map((d) => getFormattedTanggalPosyandu(d.tanggalPengukuran).bulanTahun.split(' ')[1])
            .filter(Boolean)
        )
      );
      return years.length > 0 ? `${filterBulan} ${years.join(', ')}` : `Bulan ${filterBulan}`;
    }
    if (reportData.length > 0) {
      const uniqueMonthYears = Array.from(
        new Set(
          reportData
            .map((d) => {
              const tgl =
                d.tanggalPengukuran ||
                (d.riwayat && d.riwayat.length > 0 ? d.riwayat[d.riwayat.length - 1].tanggal : '');
              return getFormattedTanggalPosyandu(tgl).bulanTahun;
            })
            .filter((b) => b && b !== '-')
        )
      );
      if (uniqueMonthYears.length > 0) {
        return uniqueMonthYears.join(' / ');
      }
    }
    return filterTahun !== 'Semua' ? `Tahun ${filterTahun}` : 'Semua Periode';
  }, [filterBulan, filterTahun, reportData]);

  // Tanggal laporan sesuai bulan Posyandu yang dipilih
  const tanggalLaporanPosyandu = useMemo(() => {
    if (reportData.length > 0) {
      const firstDate =
        reportData[0].tanggalPengukuran ||
        (reportData[0].riwayat && reportData[0].riwayat.length > 0
          ? reportData[0].riwayat[reportData[0].riwayat.length - 1].tanggal
          : '');
      const formatted = getFormattedTanggalPosyandu(firstDate);
      if (formatted.tglFormatted && formatted.tglFormatted !== '-') {
        return formatted.tglFormatted;
      }
    }
    return new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, [reportData]);

  if (!isOpen) return null;

  const total = reportData.length;
  const sangatPendek = reportData.filter(d => d.statusTBU === 'Sangat Pendek').length;
  const pendek = reportData.filter(d => d.statusTBU === 'Pendek').length;
  const normal = reportData.filter(d => d.statusTBU === 'Normal').length;
  const patuh = reportData.filter(d => d.kepatuhan === 'Habis' || d.kepatuhan === '3/4 Porsi').length;

  const handlePrintPdf = () => {
    window.print();
  };

  const handleExportExcel = () => {
    exportDataToExcel(reportData, 'Cetakan_Evaluasi_Stunting_F4', periodePosyanduLabel);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs print:static print:block print:inset-auto print:p-0 print:m-0 print:bg-transparent print:h-auto print:w-full">
      {/* Dynamic Print Style for F4 / Folio Paper Size - Aligned strictly from the top */}
      <style>
        {`
          @media print {
            @page {
              size: ${paperOrientation === 'landscape' ? '330mm 215mm' : '215mm 330mm'};
              margin: ${paperOrientation === 'landscape' ? '5mm 8mm 5mm 8mm' : '8mm 8mm 8mm 8mm'};
            }
            html, body, #root {
              margin: 0 !important;
              padding: 0 !important;
              height: auto !important;
              min-height: 0 !important;
              background-color: white !important;
              display: block !important;
            }
            #printable-report-dialog {
              position: static !important;
              display: block !important;
              margin: 0 !important;
              padding: 0 !important;
              top: 0 !important;
              width: 100% !important;
              max-width: 100% !important;
              box-shadow: none !important;
              border: none !important;
            }
            #printable-content-body {
              margin: 0 !important;
              padding: 0 !important;
              display: block !important;
            }
          }
        `}
      </style>

      <div 
        id="printable-report-dialog"
        className="relative flex max-h-[95vh] w-full max-w-5xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200 print:static print:block print:border-none print:shadow-none print:max-h-none print:w-full print:m-0 print:p-0"
      >
        {/* Modal Bar (Hidden on Print) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 px-6 py-3.5 bg-slate-50 print:hidden">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-800">
                Cetakan Laporan Evaluasi Stunting
              </h2>
              <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold border border-emerald-300">
                Ukuran Kertas: F4 / Folio (215 × 330 mm)
              </span>
            </div>
            <p className="text-xs text-slate-500">Format cetakan resmi telah disesuaikan dengan standar kertas F4 untuk Excel (.xlsx) dan Dokumen PDF</p>
          </div>
          
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Tombol Cetak Excel */}
            <button
              type="button"
              id="btn-cetak-excel-modal"
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-600/30 bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-800 shadow-xs hover:bg-emerald-100 hover:border-emerald-500 active:scale-95 transition"
              title="Unduh Cetakan Laporan Format Excel (.xlsx) Ukuran F4"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-700" />
              <span>Cetak Excel (F4)</span>
            </button>

            {/* Tombol Cetak PDF */}
            <button
              type="button"
              id="btn-cetak-pdf-modal"
              onClick={handlePrintPdf}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 active:scale-95 transition"
              title="Cetak langsung atau simpan dokumen sebagai PDF F4"
            >
              <Printer className="h-4 w-4" />
              <span>Cetak PDF (F4)</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition ml-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Area */}
        <div 
          id="printable-content-body"
          className="overflow-y-auto p-6 sm:p-8 font-sans text-slate-900 space-y-6 print:p-0 print:m-0 print:space-y-3 print:overflow-visible"
        >
          
          {/* Pilihan Cetak & Konfigurasi F4 (Hidden on Print) */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 print:hidden space-y-4">
            
            {/* Filter Bulan & Tahun Posyandu untuk Cetakan */}
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div>
                  <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-emerald-700" />
                    Pilih Periode Bulan Posyandu yang Dicetak
                  </span>
                  <p className="text-[11px] text-emerald-800/85 mt-0.5">
                    Data TB, BB, Usia, Z-Score, dan Bulan Posyandu pada laporan otomatis menyesuaikan dengan bulan yang dipilih.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    aria-label="Pilih Bulan Posyandu Cetak"
                    value={filterBulan}
                    onChange={(e) => setFilterBulan(e.target.value)}
                    className="rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-950 focus:border-emerald-600 focus:outline-none shadow-2xs"
                  >
                    <option value="Semua">Semua Bulan (Data Terbaru)</option>
                    {MONTHS_LIST.map((m) => (
                      <option key={m} value={m}>
                        Bulan {m}
                      </option>
                    ))}
                  </select>

                  <select
                    aria-label="Pilih Tahun Posyandu Cetak"
                    value={filterTahun}
                    onChange={(e) => setFilterTahun(e.target.value)}
                    className="rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-950 focus:border-emerald-600 focus:outline-none shadow-2xs"
                  >
                    <option value="Semua">Semua Tahun</option>
                    {yearOptions.map((y) => (
                      <option key={y} value={String(y)}>
                        Tahun {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {availablePeriods.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-emerald-200/60">
                  <span className="text-[11px] font-medium text-emerald-900 mr-1">
                    Bulan Posyandu Tersedia:
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setFilterBulan('Semua');
                      setFilterTahun('Semua');
                    }}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition cursor-pointer ${
                      filterBulan === 'Semua' && filterTahun === 'Semua'
                        ? 'bg-emerald-700 text-white shadow-2xs'
                        : 'bg-white text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    Terbaru ({availablePeriods[availablePeriods.length - 1]?.label})
                  </button>
                  {availablePeriods.map((p) => {
                    const isActive = filterBulan === p.bulan && (filterTahun === p.tahun || filterTahun === 'Semua');
                    return (
                      <button
                        key={`${p.bulan}-${p.tahun}`}
                        type="button"
                        onClick={() => {
                          setFilterBulan(p.bulan);
                          setFilterTahun(p.tahun);
                        }}
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition cursor-pointer ${
                          isActive
                            ? 'bg-emerald-700 text-white shadow-2xs'
                            : 'bg-white text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Informasi Standar Ukuran Kertas F4 */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <FileCheck className="h-4 w-4 text-emerald-600" />
                  Format Cetak Kertas F4 / Folio (215 × 330 mm)
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Ukuran kertas standar administrasi di Indonesia. Telah diatur otomatis pada dokumen Excel dan PDF.
                </p>
              </div>

              {/* Orientasi Kertas F4 untuk PDF */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-semibold text-slate-500 px-2 flex items-center gap-1">
                  <LayoutTemplate className="h-3 w-3" /> Orientasi PDF:
                </span>
                <button
                  type="button"
                  onClick={() => setPaperOrientation('landscape')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                    paperOrientation === 'landscape'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                  title="F4 Landscape (330 × 215 mm) - Sangat cocok untuk tabel antropometri lebar"
                >
                  {paperOrientation === 'landscape' && <Check className="h-3 w-3" />}
                  <span>F4 Landscape</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaperOrientation('portrait')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                    paperOrientation === 'portrait'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                  title="F4 Portrait (215 × 330 mm) - Memanjang vertikal"
                >
                  {paperOrientation === 'portrait' && <Check className="h-3 w-3" />}
                  <span>F4 Portrait</span>
                </button>
              </div>
            </div>

            {/* Opsi Kartu Cetak */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Opsi 1: Excel */}
              <button
                type="button"
                id="btn-pilih-cetak-excel"
                onClick={handleExportExcel}
                className="flex items-start gap-3 rounded-xl border border-emerald-300 bg-emerald-50/60 p-3.5 text-left transition hover:bg-emerald-100 hover:border-emerald-500 hover:shadow-sm active:scale-98 group cursor-pointer"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs group-hover:bg-emerald-700 transition">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-emerald-950">1. Cetakan Excel (.xlsx) Ukuran F4</span>
                    <span className="rounded-full bg-emerald-200/80 px-2 py-0.5 text-[10px] font-bold text-emerald-900">
                      {periodePosyanduLabel}
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-800/90 mt-0.5 leading-snug">
                    File Excel lengkap dengan Page Setup Folio (8.5 × 13 inci), sesuai data Posyandu bulan <strong>{periodePosyanduLabel}</strong>.
                  </p>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 mt-2 group-hover:underline">
                    <Download className="h-3.5 w-3.5" /> Unduh Excel F4 ({periodePosyanduLabel})
                  </span>
                </div>
              </button>

              {/* Opsi 2: PDF */}
              <button
                type="button"
                id="btn-pilih-cetak-pdf"
                onClick={handlePrintPdf}
                className="flex items-start gap-3 rounded-xl border border-slate-300 bg-white p-3.5 text-left transition hover:bg-slate-100 hover:border-slate-400 hover:shadow-sm active:scale-98 group cursor-pointer"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs group-hover:bg-slate-800 transition">
                  <Printer className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-slate-900">2. Cetakan Dokumen PDF Ukuran F4</span>
                    <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-800">
                      F4 {paperOrientation === 'landscape' ? '330×215mm' : '215×330mm'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                    Cetak langsung ke kertas fisik F4 / Folio atau simpan ke PDF untuk periode <strong>{periodePosyanduLabel}</strong>.
                  </p>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 mt-2 group-hover:underline">
                    <Printer className="h-3.5 w-3.5" /> Cetak / Simpan PDF F4 ({periodePosyanduLabel})
                  </span>
                </div>
              </button>
            </div>

            <div className="rounded-xl bg-amber-50/70 border border-amber-200 p-2.5 text-[11px] text-amber-800 flex items-start gap-2">
              <span className="font-bold">💡 Tips Cetak Printer:</span>
              <span>
                Pada jendela cetak (Ctrl+P), pilih ukuran kertas <strong>Folio / F4 (8.5 × 13 inci)</strong>. Jika printer hanya mendeteksi Letter/A4, aktifkan opsi <strong>"Fit to printable area" (Sesuaikan dengan area cetak)</strong> agar seluruh kolom tabel tertata rapi.
              </span>
            </div>
          </div>
          
          {/* Official Letterhead (Kop Surat Laporan) */}
          <div className="text-center border-b-2 border-slate-800 pb-3">
            <h1 className="text-base sm:text-lg font-bold uppercase tracking-wider text-slate-900">
              Laporan Rekapitulasi Data Evaluasi Stunting Balita
            </h1>
            <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-slate-700">
              Program Intervensi Pencegahan & Percepatan Penurunan Stunting Balita
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Puskesmas Pengampu: <span className="font-semibold text-slate-900">{reportData[0]?.puskesmas || data[0]?.puskesmas || 'Puskesmas Wilayah'}</span> • Bulan Posyandu: <span className="font-semibold text-slate-900">{periodePosyanduLabel}</span>
            </p>
          </div>

          {/* Key Metrics Summary Box */}
          <div className="grid grid-cols-4 gap-3 text-center border border-slate-300 rounded-lg p-2.5 bg-slate-50/50 print:bg-white text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">Total Balita Sasaran</span>
              <strong className="text-sm sm:text-base font-bold text-slate-900">{total} Anak</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Total Kasus Stunting</span>
              <strong className="text-sm sm:text-base font-bold text-rose-700">
                {sangatPendek + pendek} Anak ({total > 0 ? Math.round(((sangatPendek + pendek) / total) * 100) : 0}%)
              </strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">
                {normal === 0 ? 'Sangat Pendek / Pendek' : 'Status Tinggi Normal'}
              </span>
              <strong className={`text-sm sm:text-base font-bold ${normal === 0 ? 'text-amber-800' : 'text-emerald-700'}`}>
                {normal === 0 ? `${sangatPendek} SP / ${pendek} P` : `${normal} Anak`}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Kepatuhan Makan Baik</span>
              <strong className="text-sm sm:text-base font-bold text-indigo-700">{patuh} Anak</strong>
            </div>
          </div>

          {/* Table List */}
          <div className="overflow-x-auto border border-slate-300 rounded-lg print:border-slate-400">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-[10px] font-bold text-slate-800 uppercase border-b border-slate-300 print:bg-slate-200">
                <tr>
                  <th className="p-2 border-r border-slate-300 text-center w-8">No</th>
                  <th className="p-2 border-r border-slate-300">Nama Balita</th>
                  <th className="p-2 border-r border-slate-300">NIK</th>
                  <th className="p-2 border-r border-slate-300 text-center">JK</th>
                  <th className="p-2 border-r border-slate-300 text-center">Usia</th>
                  <th className="p-2 border-r border-slate-300">Posyandu</th>
                  <th className="p-2 border-r border-slate-300 text-center">TB (cm)</th>
                  <th className="p-2 border-r border-slate-300 text-center">BB (kg)</th>
                  <th className="p-2 border-r border-slate-300 text-center">Z-Score TB/U</th>
                  <th className="p-2 border-r border-slate-300">Status Stunting</th>
                  <th className="p-2 border-r border-slate-300">Status Gizi Balita</th>
                  <th className="p-2 text-center">Bulan Posyandu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 print:divide-slate-300 text-[10px] sm:text-[11px]">
                {reportData.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="p-6 text-center text-slate-500">
                      Tidak ada data penimbangan balita pada periode bulan <strong>{periodePosyanduLabel}</strong>.
                    </td>
                  </tr>
                ) : (
                  reportData.map((item, idx) => {
                    const targetDateStr =
                      item.tanggalPengukuran ||
                      (item.riwayat && item.riwayat.length > 0 ? item.riwayat[item.riwayat.length - 1].tanggal : '') ||
                      '';
                    const tglInfo = getFormattedTanggalPosyandu(targetDateStr);
                    const statusGizi = getStatusGiziBalita(item);

                    return (
                      <tr key={item.id} className="leading-tight print:break-inside-avoid">
                        <td className="p-2 text-center border-r border-slate-200 print:border-slate-300 font-mono text-[10px]">{idx + 1}</td>
                        <td className="p-2 border-r border-slate-200 print:border-slate-300 font-bold text-slate-900">{item.namaBalita}</td>
                        <td className="p-2 border-r border-slate-200 print:border-slate-300 font-mono text-[10px]">{item.nik}</td>
                        <td className="p-2 text-center border-r border-slate-200 print:border-slate-300">{item.jk}</td>
                        <td className="p-2 text-center border-r border-slate-200 print:border-slate-300">{item.usiaBulan} bln</td>
                        <td className="p-2 border-r border-slate-200 print:border-slate-300">{item.posyandu}</td>
                        <td className="p-2 text-center border-r border-slate-200 print:border-slate-300 font-mono font-medium">{item.tinggiBadan}</td>
                        <td className="p-2 text-center border-r border-slate-200 print:border-slate-300 font-mono font-medium">{item.beratBadan}</td>
                        <td className="p-2 text-center border-r border-slate-200 print:border-slate-300 font-mono font-bold">
                          {item.zScoreTBU > 0 ? `+${item.zScoreTBU}` : item.zScoreTBU}
                        </td>
                        <td className="p-2 border-r border-slate-200 print:border-slate-300 font-semibold">
                          <span className={item.statusTBU === 'Sangat Pendek' ? 'text-rose-700 font-bold' : item.statusTBU === 'Pendek' ? 'text-amber-700 font-bold' : 'text-emerald-700 font-bold'}>
                            {item.statusTBU}
                          </span>
                        </td>
                        <td className="p-2 border-r border-slate-200 print:border-slate-300">
                          <span className="font-bold text-slate-900">{statusGizi}</span>
                          <span className="text-slate-500 block text-[9px]">BB/TB: {item.statusBBTB || 'Gizi Baik'}</span>
                        </td>
                        <td className="p-2 text-center font-mono text-[9px]">
                          <div className="font-semibold text-slate-900">{tglInfo.tglFormatted}</div>
                          <div className="text-[8px] text-slate-600 font-bold">{tglInfo.bulanTahun}</div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Signature Block */}
          <div className="pt-6 grid grid-cols-2 text-center text-xs text-slate-800 print:pt-4">
            <div>
              <p className="text-slate-500">Mengetahui,</p>
              <p className="font-semibold text-slate-900 mt-1">Bidan Desa / Koordinator Posyandu</p>
              <div className="h-16 print:h-14" />
              <p className="font-bold underline text-slate-900">( ..................................................... )</p>
              <p className="text-[10px] text-slate-500">NIP. ............................................</p>
            </div>
            <div>
              <p className="text-slate-500">Dibuat pada tanggal {tanggalLaporanPosyandu}</p>
              <p className="font-semibold text-slate-900 mt-1">KPM Kajulangko</p>
              <div className="h-16 print:h-14" />
              <p className="font-bold underline text-slate-900">( ..................................................... )</p>
              <p className="text-[10px] text-slate-500">Petugas KPM / Pendamping Gizi</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
