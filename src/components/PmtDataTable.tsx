import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';
import { exportDataToExcel, exportDataToCSV } from '../utils/excelHelper';

interface PmtDataTableProps {
  data: BalitaPMT[];
  onOpenPlotCurve: (balita: BalitaPMT) => void;
  onEditBalita: (balita: BalitaPMT) => void;
  onDeleteBalita: (id: string) => void;
  onAddBalita: () => void;
  selectedPosyandu: string;
  selectedStatus: string;
}

export default function PmtDataTable({
  data,
  onOpenPlotCurve,
  onEditBalita,
  onDeleteBalita,
  onAddBalita,
  selectedPosyandu,
  selectedStatus,
}: PmtDataTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>(selectedStatus || 'Semua');
  const [filterKepatuhan, setFilterKepatuhan] = useState<string>('Semua');
  const [filterJk, setFilterJk] = useState<string>('Semua');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

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

      // Status filter
      if (filterStatus === 'Stunting') {
        if (item.statusTBU !== 'Sangat Pendek' && item.statusTBU !== 'Pendek') return false;
      } else if (filterStatus !== 'Semua' && item.statusTBU !== filterStatus) {
        return false;
      }

      // Kepatuhan filter
      if (filterKepatuhan !== 'Semua' && item.kepatuhan !== filterKepatuhan) {
        return false;
      }

      // JK filter
      if (filterJk !== 'Semua' && item.jk !== filterJk) {
        return false;
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
  }, [data, selectedPosyandu, filterStatus, filterKepatuhan, filterJk, searchTerm]);

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
      exportDataToExcel(exportTargets, `Rekap_PMT_Stunting_${selectedPosyandu !== 'Semua' ? selectedPosyandu : 'Semua'}`);
    } else {
      exportDataToCSV(exportTargets, `Rekap_PMT_Stunting_${selectedPosyandu !== 'Semua' ? selectedPosyandu : 'Semua'}`);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
      
      {/* Header Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-100 space-y-3">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Data Penguplotan & Rekapitulasi Balita PMT
            </h2>
            <p className="text-xs text-slate-500">
              Menampilkan {filteredData.length} dari {data.length} balita tercatat
            </p>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-export-excel"
              onClick={() => handleExportSelectedOrAll('xlsx')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 transition"
              title="Ekspor ke format Excel .xlsx"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
              <span>Ekspor Excel</span>
            </button>

            <button
              type="button"
              id="btn-export-csv"
              onClick={() => handleExportSelectedOrAll('csv')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 transition"
              title="Ekspor ke CSV"
            >
              <FileText className="h-4 w-4 text-slate-600" />
              <span className="hidden sm:inline">CSV</span>
            </button>

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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 pt-1">
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

          {/* Kepatuhan Filter */}
          <div className="flex items-center gap-2">
            <select
              aria-label="Filter Kepatuhan Konsumsi"
              value={filterKepatuhan}
              onChange={(e) => {
                setFilterKepatuhan(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="Semua">Semua Kepatuhan Makan</option>
              <option value="Habis">Habis (100%)</option>
              <option value="3/4 Porsi">3/4 Porsi</option>
              <option value="1/2 Porsi">1/2 Porsi</option>
              <option value="< 1/2 Porsi">&lt; 1/2 Porsi</option>
              <option value="Tidak Dikonsumsi">Tidak Dikonsumsi</option>
            </select>
          </div>

          {/* Jenis Kelamin Filter */}
          <div className="flex items-center gap-2">
            <select
              aria-label="Filter Jenis Kelamin"
              value={filterJk}
              onChange={(e) => {
                setFilterJk(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="Semua">Semua Jenis Kelamin</option>
              <option value="L">Laki-laki (L)</option>
              <option value="P">Perempuan (P)</option>
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
              <th className="px-3 py-3">Siklus PMT</th>
              <th className="px-3 py-3">Kepatuhan</th>
              <th className="px-3 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <AlertCircle className="h-8 w-8 text-slate-300" />
                    <p className="font-semibold text-slate-600">Tidak ada data balita yang cocok</p>
                    <p className="text-xs text-slate-400">Silakan ubah filter pencarian atau unggah file data PMT baru.</p>
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

                    {/* Siklus PMT */}
                    <td className="px-3 py-3">
                      <div className="font-semibold text-indigo-700">Hari ke-{balita.hariPMT}</div>
                      <div className="text-[11px] text-slate-400">Target 90 Hari</div>
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
