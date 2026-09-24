import React, { useState, useMemo, useRef, useEffect } from 'react';
import { BalitaPMT, StatusTBU, TingkatKepatuhan } from '../types';
import {
  Search,
  Filter,
  TrendingUp,
  Edit2,
  Trash2,
  FileSpreadsheet,
  FileText,
  ChevronLeft,
  ChevronRight,
  Plus,
  AlertCircle,
  CheckSquare,
  Square,
  Printer,
  ChevronDown,
  Calendar,
  Upload,
} from 'lucide-react';
import { exportDataToExcel, exportDataToCSV } from '../utils/excelHelper';
import { getStatusGiziBalita, getFormattedTanggalPosyandu } from '../utils/nutritionStandards';

interface PmtDataTableProps {
  data: BalitaPMT[];
  onOpenPlotCurve: (balita: BalitaPMT) => void;
  onEditBalita: (balita: BalitaPMT) => void;
  onDeleteBalita: (id: string) => void;
  onAddBalita: () => void;
  onOpenPrintReport?: () => void;
  onOpenUploadExcel?: () => void;
  selectedPosyandu: string;
  selectedStatus: string;
}

export default function PmtDataTable({
  data,
  onOpenPlotCurve,
  onEditBalita,
  onDeleteBalita,
  onAddBalita,
  onOpenPrintReport,
  onOpenUploadExcel,
  selectedPosyandu,
  selectedStatus,
}: PmtDataTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>(selectedStatus || 'Semua');
  const [filterStatusGizi, setFilterStatusGizi] = useState<string>('Semua');
  const [filterBulanPosyandu, setFilterBulanPosyandu] = useState<string>('Semua');
  const [filterTahunPosyandu, setFilterTahunPosyandu] = useState<string>('Semua');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;
  const [isTablePrintMenuOpen, setIsTablePrintMenuOpen] = useState(false);
  const tablePrintMenuRef = useRef<HTMLDivElement>(null);

  // Daftar 12 Bulan
  const MONTHS_LIST = useMemo(
    () => [
      'Januari',
      'Februari',
      'Maret',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Agustus',
      'September',
      'Oktober',
      'November',
      'Desember',
    ],
    []
  );

  // List opsi tahun posyandu dari tahun 2026 sampai seterusnya
  const yearOptions = useMemo(() => {
    const startYear = 2026;
    const currentYear = new Date().getFullYear();
    // Mendukung tahun 2026 sampai seterusnya (minimal hingga 2035 atau lebih bila ada data)
    const maxFutureYear = Math.max(startYear + 9, currentYear + 5, 2035);

    const yearSet = new Set<number>();
    for (let y = startYear; y <= maxFutureYear; y++) {
      yearSet.add(y);
    }

    data.forEach((item) => {
      const lastDateStr =
        (item.riwayat && item.riwayat.length > 0
          ? item.riwayat[item.riwayat.length - 1].tanggal
          : '') ||
        item.tanggalPengukuran ||
        '';
      if (lastDateStr) {
        const y = parseInt(lastDateStr.split('-')[0], 10);
        if (!isNaN(y)) yearSet.add(y);
      }
    });

    return Array.from(yearSet).sort((a, b) => a - b);
  }, [data]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (tablePrintMenuRef.current && !tablePrintMenuRef.current.contains(event.target as Node)) {
        setIsTablePrintMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync prop changes
  React.useEffect(() => {
    if (selectedStatus) {
      setFilterStatus(selectedStatus);
    }
  }, [selectedStatus]);

  // Filtering Logic
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // Posyandu filter
      if (selectedPosyandu !== 'Semua' && item.posyandu !== selectedPosyandu) {
        return false;
      }

      // Status Stunting filter
      if (filterStatus === 'Stunting') {
        if (item.statusTBU !== 'Sangat Pendek' && item.statusTBU !== 'Pendek') return false;
      } else if (filterStatus !== 'Semua' && item.statusTBU !== filterStatus) {
        return false;
      }

      // Status Gizi filter (Normal, Stunting, Gizi Buruk, Beresiko Lebih, Gizi Lebih, Obesitas)
      if (filterStatusGizi !== 'Semua') {
        const itemStatusGizi = getStatusGiziBalita(item);
        if (filterStatusGizi === 'Stanting' || filterStatusGizi === 'Stunting') {
          if (itemStatusGizi !== 'Stunting') return false;
        } else if (filterStatusGizi === 'Beresiko Lebih' || filterStatusGizi === 'Berisiko Lebih') {
          if (itemStatusGizi !== 'Beresiko Lebih') return false;
        } else if (itemStatusGizi.toLowerCase() !== filterStatusGizi.toLowerCase()) {
          return false;
        }
      }

      // Bulan Posyandu filter (Bulan terpisah)
      if (filterBulanPosyandu !== 'Semua') {
        const targetDateStr =
          item.tanggalPengukuran ||
          (item.riwayat && item.riwayat.length > 0
            ? item.riwayat[item.riwayat.length - 1].tanggal
            : '') ||
          '';
        const info = getFormattedTanggalPosyandu(targetDateStr);
        if (
          !info.bulanTahun.toLowerCase().includes(filterBulanPosyandu.toLowerCase()) &&
          !info.tglFormatted.toLowerCase().includes(filterBulanPosyandu.toLowerCase())
        ) {
          return false;
        }
      }

      // Tahun Posyandu filter (Tahun terpisah, 2026 sampai seterusnya)
      if (filterTahunPosyandu !== 'Semua') {
        const targetDateStr =
          item.tanggalPengukuran ||
          (item.riwayat && item.riwayat.length > 0
            ? item.riwayat[item.riwayat.length - 1].tanggal
            : '') ||
          '';
        const info = getFormattedTanggalPosyandu(targetDateStr);
        if (
          !info.bulanTahun.includes(filterTahunPosyandu) &&
          !info.tglFormatted.includes(filterTahunPosyandu) &&
          !targetDateStr.startsWith(filterTahunPosyandu)
        ) {
          return false;
        }
      }

      // Search text
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchName = item.namaBalita.toLowerCase().includes(query);
        const matchNik = item.nik.toLowerCase().includes(query);
        const matchIbu = item.namaIbu.toLowerCase().includes(query);
        const matchDesa = item.desa.toLowerCase().includes(query);
        const matchPosyandu = item.posyandu.toLowerCase().includes(query);
        return matchName || matchNik || matchIbu || matchDesa || matchPosyandu;
      }

      return true;
    });
  }, [data, selectedPosyandu, filterStatus, filterStatusGizi, filterBulanPosyandu, filterTahunPosyandu, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedIds.length === paginatedData.length && paginatedData.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedData.map(d => d.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = () => {
    if (confirm(`Hapus ${selectedIds.length} data balita yang dipilih?`)) {
      selectedIds.forEach(id => onDeleteBalita(id));
      setSelectedIds([]);
    }
  };

  const handleExportSelectedOrAll = (format: 'xlsx' | 'csv') => {
    const exportTargets = selectedIds.length > 0
      ? data.filter(d => selectedIds.includes(d.id))
      : filteredData;

    if (exportTargets.length === 0) {
      alert('Tidak ada data yang dapat diekspor.');
      return;
    }

    if (format === 'xlsx') {
      exportDataToExcel(exportTargets, `Rekap_Stunting_${selectedPosyandu !== 'Semua' ? selectedPosyandu : 'Semua'}`);
    } else {
      exportDataToCSV(exportTargets, `Rekap_Stunting_${selectedPosyandu !== 'Semua' ? selectedPosyandu : 'Semua'}`);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
      
      {/* Header Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-100 space-y-3">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              DATA REKAPITULASI BALITA
            </h2>
            <p className="text-xs text-slate-500">
              Menampilkan {filteredData.length} dari {data.length} balita tercatat
            </p>
          </div>

          {/* Action Tools */}
          <div className="flex flex-wrap items-center gap-2">
            {onOpenUploadExcel && (
              <button
                type="button"
                id="btn-table-upload-excel"
                onClick={onOpenUploadExcel}
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-600 bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 active:scale-95 transition cursor-pointer"
                title="Unggah Data Balita dari File Excel / CSV"
              >
                <Upload className="h-4 w-4" />
                <span>Upload Excel/CSV</span>
              </button>
            )}

            {/* Tombol Cetak Laporan (Gabungan Pilihan Excel / PDF / CSV) */}
            <div className="relative" ref={tablePrintMenuRef}>
              <div className="inline-flex rounded-lg shadow-2xs">
                <button
                  type="button"
                  id="btn-table-cetak-laporan"
                  onClick={() => {
                    if (onOpenPrintReport) {
                      onOpenPrintReport();
                    } else {
                      handleExportSelectedOrAll('xlsx');
                    }
                  }}
                  className="inline-flex items-center gap-1.5 rounded-l-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                  title="Cetak Laporan (Pilihan Excel atau PDF)"
                >
                  <Printer className="h-4 w-4 text-slate-700" />
                  <span>Cetak Laporan</span>
                </button>
                <button
                  type="button"
                  id="btn-table-toggle-print-dropdown"
                  onClick={() => setIsTablePrintMenuOpen(!isTablePrintMenuOpen)}
                  className="inline-flex items-center rounded-r-lg border border-l-0 border-slate-300 bg-white px-2 py-2 text-slate-600 hover:bg-slate-50 transition"
                  title="Pilihan Format Cetak (Excel / PDF)"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </div>

              {isTablePrintMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-60 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl ring-1 ring-black/5 z-40">
                  <div className="px-2.5 py-1.5 border-b border-slate-100">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pilihan Format Cetak</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsTablePrintMenuOpen(false);
                      handleExportSelectedOrAll('xlsx');
                    }}
                    className="w-full flex items-start gap-2.5 rounded-lg px-2.5 py-2 text-left hover:bg-emerald-50 transition group"
                  >
                    <FileSpreadsheet className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <span className="block text-xs font-bold text-slate-800 group-hover:text-emerald-900">1. Cetak Excel (.xlsx)</span>
                      <span className="block text-[11px] text-slate-500">
                        {selectedIds.length > 0 ? `Unduh ${selectedIds.length} data terpilih` : 'Unduh seluruh data & ringkasan'}
                      </span>
                    </div>
                  </button>

                  {onOpenPrintReport && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsTablePrintMenuOpen(false);
                        onOpenPrintReport();
                      }}
                      className="w-full flex items-start gap-2.5 rounded-lg px-2.5 py-2 text-left hover:bg-slate-100 transition group"
                    >
                      <Printer className="h-4 w-4 text-slate-700 mt-0.5 shrink-0" />
                      <div>
                        <span className="block text-xs font-bold text-slate-800 group-hover:text-slate-950">2. Cetak Dokumen PDF</span>
                        <span className="block text-[11px] text-slate-500">Lembar resmi siap print / simpan PDF</span>
                      </div>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setIsTablePrintMenuOpen(false);
                      handleExportSelectedOrAll('csv');
                    }}
                    className="w-full flex items-start gap-2.5 rounded-lg px-2.5 py-2 text-left hover:bg-slate-50 transition group border-t border-slate-100 mt-1 pt-1.5"
                  >
                    <FileText className="h-4 w-4 text-slate-500 mt-0.5 shrink-0" />
                    <div>
                      <span className="block text-xs font-medium text-slate-700">3. Format CSV</span>
                      <span className="block text-[11px] text-slate-400">File teks pemisah koma</span>
                    </div>
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              id="btn-table-add-balita"
              onClick={onAddBalita}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 active:scale-95 transition"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Balita</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-1">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              id="input-search-balita"
              placeholder="Cari Nama, NIK, Ibu, Desa..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Status Stunting Filter */}
          <div className="flex items-center gap-2">
            <select
              aria-label="Filter Status Stunting"
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="Semua">Semua Status Stunting</option>
              <option value="Stunting">Semua Kasus Stunting (&lt; -2 SD)</option>
              <option value="Sangat Pendek">Sangat Pendek (&lt; -3 SD)</option>
              <option value="Pendek">Pendek (-3 s/d &lt; -2 SD)</option>
              <option value="Normal">Normal (-2 s/d +3 SD)</option>
              <option value="Tinggi">Tinggi (&gt; +3 SD)</option>
            </select>
          </div>

          {/* Status Gizi Filter */}
          <div className="flex items-center gap-2">
            <select
              aria-label="Filter Status Gizi Balita"
              value={filterStatusGizi}
              onChange={(e) => {
                setFilterStatusGizi(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="Semua">Semua Status Gizi</option>
              <option value="Normal">Normal</option>
              <option value="Stunting">Stunting</option>
              <option value="Gizi Buruk">Gizi Buruk</option>
              <option value="Beresiko Lebih">Beresiko Lebih</option>
              <option value="Gizi Lebih">Gizi Lebih</option>
              <option value="Obesitas">Obesitas</option>
            </select>
          </div>

          {/* Bulan Posyandu Filter */}
          <div className="flex items-center gap-2">
            <select
              aria-label="Filter Bulan Posyandu"
              value={filterBulanPosyandu}
              onChange={(e) => {
                setFilterBulanPosyandu(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
            >
              <option value="Semua">Semua Bulan</option>
              {MONTHS_LIST.map((m) => (
                <option key={m} value={m}>
                  Bulan {m}
                </option>
              ))}
            </select>
          </div>

          {/* Tahun Posyandu Filter */}
          <div className="flex items-center gap-2">
            <select
              aria-label="Filter Tahun Posyandu"
              value={filterTahunPosyandu}
              onChange={(e) => {
                setFilterTahunPosyandu(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
            >
              <option value="Semua">Semua Tahun</option>
              {yearOptions.map((year) => (
                <option key={year} value={String(year)}>
                  Tahun {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected rows batch banner */}
        {selectedIds.length > 0 && (
          <div className="flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-900 border border-emerald-200">
            <span>
              <strong>{selectedIds.length}</strong> balita dipilih
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleExportSelectedOrAll('xlsx')}
                className="font-medium text-emerald-700 hover:underline"
              >
                Ekspor Terpilih (.xlsx)
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={handleDeleteSelected}
                className="font-medium text-rose-600 hover:underline"
              >
                Hapus Terpilih
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3 w-10">
                <button
                  type="button"
                  aria-label="Pilih Semua Baris Halaman Ini"
                  onClick={handleSelectAll}
                  className="text-slate-400 hover:text-slate-600"
                >
                  {selectedIds.length === paginatedData.length && paginatedData.length > 0 ? (
                    <CheckSquare className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                </button>
              </th>
              <th className="px-4 py-3">Nama Balita / Ibu</th>
              <th className="px-3 py-3">JK & Usia</th>
              <th className="px-3 py-3">Posyandu / Desa</th>
              <th className="px-3 py-3">TB / BB</th>
              <th className="px-3 py-3">Status Stunting (TB/U)</th>
              <th className="px-3 py-3">Status Gizi Balita</th>
              <th className="px-3 py-3">Terakhir Posyandu</th>
              <th className="px-3 py-3">Kepatuhan</th>
              <th className="px-3 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <AlertCircle className="h-8 w-8 text-slate-300" />
                    <p className="font-semibold text-slate-600">Tidak ada data balita yang cocok</p>
                    <p className="text-xs text-slate-400">Silakan ubah filter pencarian atau unggah file data baru.</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((balita) => {
                const isSelected = selectedIds.includes(balita.id);
                return (
                  <tr
                    key={balita.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isSelected ? 'bg-emerald-50/30' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        aria-label={`Pilih ${balita.namaBalita}`}
                        onClick={() => handleToggleSelect(balita.id)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        {isSelected ? (
                          <CheckSquare className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </button>
                    </td>

                    {/* Balita & Ibu */}
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{balita.namaBalita}</div>
                      <div className="text-[11px] text-slate-500">
                        Ibu: {balita.namaIbu} • <span className="font-mono text-[10px] text-slate-400">NIK: {balita.nik}</span>
                      </div>
                    </td>

                    {/* JK & Usia */}
                    <td className="px-3 py-3">
                      <div className="font-medium text-slate-800">
                        {balita.jk === 'L' ? 'Laki-laki' : 'Perempuan'}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {balita.usiaBulan} Bulan
                      </div>
                    </td>

                    {/* Posyandu & Desa */}
                    <td className="px-3 py-3">
                      <div className="font-medium text-slate-800">{balita.posyandu}</div>
                      <div className="text-[11px] text-slate-500">{balita.desa}</div>
                    </td>

                    {/* TB & BB */}
                    <td className="px-3 py-3 font-mono">
                      <div className="font-semibold text-slate-900">{balita.tinggiBadan} cm</div>
                      <div className="text-[11px] text-slate-500">{balita.beratBadan} kg</div>
                    </td>

                    {/* Status Stunting (TB/U) */}
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            balita.statusTBU === 'Sangat Pendek'
                              ? 'bg-rose-100 text-rose-800'
                              : balita.statusTBU === 'Pendek'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {balita.statusTBU}
                        </span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                        Z-Score: {balita.zScoreTBU > 0 ? `+${balita.zScoreTBU}` : balita.zScoreTBU} SD
                      </div>
                    </td>

                    {/* Status Gizi Balita */}
                    <td className="px-3 py-3">
                      {(() => {
                        const statusGizi = getStatusGiziBalita(balita);
                        const badgeStyle =
                          statusGizi === 'Gizi Buruk'
                            ? 'bg-rose-100 text-rose-800 border-rose-200'
                            : statusGizi === 'Stunting'
                            ? 'bg-amber-100 text-amber-800 border-amber-200'
                            : statusGizi === 'Beresiko Lebih'
                            ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                            : statusGizi === 'Gizi Lebih'
                            ? 'bg-orange-100 text-orange-800 border-orange-200'
                            : statusGizi === 'Obesitas'
                            ? 'bg-red-100 text-red-800 border-red-200'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-200';

                        return (
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border ${badgeStyle}`}
                              >
                                {statusGizi}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
                              BB/TB: <span className="font-semibold text-slate-700">{balita.statusBBTB || 'Gizi Baik'}</span> ({balita.zScoreBBTB > 0 ? `+${balita.zScoreBBTB}` : balita.zScoreBBTB} SD)
                            </div>
                          </div>
                        );
                      })()}
                    </td>

                    {/* Tanggal Terakhir Posyandu */}
                    <td className="px-3 py-3">
                      {(() => {
                        const targetDateStr =
                          balita.tanggalPengukuran ||
                          (balita.riwayat && balita.riwayat.length > 0
                            ? balita.riwayat[balita.riwayat.length - 1].tanggal
                            : '') ||
                          '';
                        const tglInfo = getFormattedTanggalPosyandu(targetDateStr);

                        return (
                          <div>
                            <div className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                              <span>{tglInfo.tglFormatted}</span>
                            </div>
                            <div className="text-[10px] text-slate-500 pl-5">
                              Bulan: <span className="font-medium text-slate-700">{tglInfo.bulanTahun}</span>
                            </div>
                          </div>
                        );
                      })()}
                    </td>

                    {/* Kepatuhan */}
                    <td className="px-3 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${
                        balita.kepatuhan === 'Habis'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : balita.kepatuhan === '3/4 Porsi'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {balita.kepatuhan}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-3 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onOpenPlotCurve(balita)}
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition"
                          title="Buka Plot Kurva Pertumbuhan WHO"
                        >
                          <TrendingUp className="h-3.5 w-3.5" />
                          <span className="hidden lg:inline">Plot Kurva</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onEditBalita(balita)}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
                          title="Ubah Data"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Hapus data balita ${balita.namaBalita}?`)) {
                              onDeleteBalita(balita.id);
                            }
                          }}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                          title="Hapus Data"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 bg-slate-50/70 text-xs text-slate-600">
        <div>
          Menampilkan {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filteredData.length)} dari {filteredData.length} data
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex items-center justify-center h-8 w-8 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="px-2.5 py-1 font-semibold text-slate-800">
            Halaman {currentPage} dari {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center justify-center h-8 w-8 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

    </div>
  );
}
