import React, { useState, useEffect } from 'react';
import { BalitaPMT, JenisKelamin, TingkatKepatuhan } from '../types';
import {
  calculateAgeInMonths,
  calculateZScoreTBU,
  getStatusTBU,
  calculateZScoreBBU,
  getStatusBBU,
  calculateZScoreBBTB,
  getStatusBBTB,
  determineIntervensiStatus,
} from '../utils/nutritionStandards';
import { X, Save, Calculator, AlertCircle, Check } from 'lucide-react';

interface ManualEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (balita: BalitaPMT) => void;
  initialData?: BalitaPMT | null;
}

export default function ManualEntryModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: ManualEntryModalProps) {
  const [nik, setNik] = useState('');
  const [namaBalita, setNamaBalita] = useState('');
  const [namaIbu, setNamaIbu] = useState('');
  const [jk, setJk] = useState<JenisKelamin>('L');
  const [tanggalLahir, setTanggalLahir] = useState('2024-01-15');
  const [posyandu, setPosyandu] = useState('Posyandu Melati 1');
  const [desa, setDesa] = useState('Desa Sukatani');
  const [puskesmas, setPuskesmas] = useState('Puskesmas Sukatani');
  const [tanggalPengukuran, setTanggalPengukuran] = useState(new Date().toISOString().split('T')[0]);
  const [beratBadan, setBeratBadan] = useState<number>(9.5);
  const [tinggiBadan, setTinggiBadan] = useState<number>(80.0);
  const [lingkarLengan, setLingkarLengan] = useState<number | undefined>(13.0);
  const [lingkarKepala, setLingkarKepala] = useState<number | undefined>(46.0);
  const [hariPMT, setHariPMT] = useState<number>(30);
  const [totalHariProgram, setTotalHariProgram] = useState<number>(90);
  const [menuPMT, setMenuPMT] = useState('Nasi Tim Ikan Kembung Daun Kelor + Telur Puyuh');
  const [kepatuhan, setKepatuhan] = useState<TingkatKepatuhan>('Habis');
  const [catatanKesehatan, setCatatanKesehatan] = useState('');

  // Synchronize initialData when editing
  useEffect(() => {
    if (initialData) {
      setNik(initialData.nik);
      setNamaBalita(initialData.namaBalita);
      setNamaIbu(initialData.namaIbu);
      setJk(initialData.jk);
      setTanggalLahir(initialData.tanggalLahir);
      setPosyandu(initialData.posyandu);
      setDesa(initialData.desa);
      setPuskesmas(initialData.puskesmas);
      setTanggalPengukuran(initialData.tanggalPengukuran);
      setBeratBadan(initialData.beratBadan);
      setTinggiBadan(initialData.tinggiBadan);
      setLingkarLengan(initialData.lingkarLengan);
      setLingkarKepala(initialData.lingkarKepala);
      setHariPMT(initialData.hariPMT);
      setTotalHariProgram(initialData.totalHariProgram || 90);
      setMenuPMT(initialData.menuPMT);
      setKepatuhan(initialData.kepatuhan);
      setCatatanKesehatan(initialData.catatanKesehatan);
    } else {
      // Reset form
      setNik(`3201${Math.floor(100000000000 + Math.random() * 900000000000)}`);
      setNamaBalita('');
      setNamaIbu('');
      setJk('L');
      setTanggalLahir('2024-03-01');
      setBeratBadan(9.0);
      setTinggiBadan(78.0);
      setHariPMT(1);
      setKepatuhan('Habis');
      setCatatanKesehatan('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // Real-time calculations
  const usiaBulan = calculateAgeInMonths(tanggalLahir, tanggalPengukuran);
  const zScoreTBU = calculateZScoreTBU(usiaBulan, tinggiBadan, jk);
  const statusTBU = getStatusTBU(zScoreTBU);
  const zScoreBBU = calculateZScoreBBU(usiaBulan, beratBadan, jk);
  const statusBBU = getStatusBBU(zScoreBBU);
  const zScoreBBTB = calculateZScoreBBTB(tinggiBadan, beratBadan, jk);
  const statusBBTB = getStatusBBTB(zScoreBBTB);
  const statusIntervensi = determineIntervensiStatus(statusTBU, kepatuhan, hariPMT);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaBalita.trim()) return;

    const updatedRiwayat = initialData?.riwayat ? [...initialData.riwayat] : [];
    // Add current measurement if not present
    const existingIndex = updatedRiwayat.findIndex(r => r.hariPMT === hariPMT);
    const newPoint = {
      id: `m-${Date.now()}`,
      tanggal: tanggalPengukuran,
      hariPMT,
      beratBadan,
      tinggiBadan,
      kepatuhan,
      catatan: catatanKesehatan,
    };

    if (existingIndex >= 0) {
      updatedRiwayat[existingIndex] = newPoint;
    } else {
      updatedRiwayat.push(newPoint);
      updatedRiwayat.sort((a, b) => a.hariPMT - b.hariPMT);
    }

    const payload: BalitaPMT = {
      id: initialData?.id || `pmt-${Date.now()}`,
      nik: nik.trim(),
      namaBalita: namaBalita.trim(),
      namaIbu: namaIbu.trim() || 'Ibu ' + namaBalita.trim(),
      jk,
      tanggalLahir,
      usiaBulan,
      posyandu,
      desa,
      puskesmas,
      tanggalPengukuran,
      beratBadan,
      tinggiBadan,
      lingkarLengan,
      lingkarKepala,
      hariPMT,
      totalHariProgram,
      menuPMT,
      kepatuhan,
      statusTBU,
      statusBBU,
      statusBBTB,
      zScoreTBU,
      zScoreBBU,
      zScoreBBTB,
      statusIntervensi,
      catatanKesehatan: catatanKesehatan.trim() || '-',
      riwayat: updatedRiwayat,
    };

    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div 
        id="manual-entry-modal"
        className="relative flex max-h-[92vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {initialData ? 'Ubah Data Balita PMT' : 'Input Data Balita PMT Baru'}
            </h2>
            <p className="text-xs text-slate-500">
              Formulir pencatatan pengukuran dan kalkulasi status stunting otomatis
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="overflow-y-auto p-6 space-y-6">

            {/* Instant Z-Score Calculator Banner */}
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
              <div className="flex items-center gap-2 mb-2 text-xs font-bold text-emerald-950">
                <Calculator className="h-4 w-4 text-emerald-600" />
                Kalkulasi Antropometri Real-Time (Kemenkes/WHO):
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="rounded-lg bg-white p-2.5 border border-emerald-100 shadow-2xs">
                  <span className="text-slate-500 block text-[11px]">Usia Terhitung</span>
                  <span className="font-bold text-slate-900 text-sm">{usiaBulan} Bulan</span>
                </div>
                <div className="rounded-lg bg-white p-2.5 border border-emerald-100 shadow-2xs">
                  <span className="text-slate-500 block text-[11px]">TB/U (Stunting)</span>
                  <span className="font-bold text-sm">
                    {zScoreTBU > 0 ? `+${zScoreTBU}` : zScoreTBU} SD
                  </span>
                  <span className={`block text-[10px] font-semibold mt-0.5 ${
                    statusTBU === 'Sangat Pendek' ? 'text-rose-600' : statusTBU === 'Pendek' ? 'text-amber-600' : 'text-emerald-700'
                  }`}>
                    {statusTBU}
                  </span>
                </div>
                <div className="rounded-lg bg-white p-2.5 border border-emerald-100 shadow-2xs">
                  <span className="text-slate-500 block text-[11px]">BB/U (Berat/Umur)</span>
                  <span className="font-bold text-sm">
                    {zScoreBBU > 0 ? `+${zScoreBBU}` : zScoreBBU} SD
                  </span>
                  <span className="block text-[10px] font-semibold text-slate-600 mt-0.5">{statusBBU}</span>
                </div>
                <div className="rounded-lg bg-white p-2.5 border border-emerald-100 shadow-2xs">
                  <span className="text-slate-500 block text-[11px]">BB/TB (Wasting)</span>
                  <span className="font-bold text-sm">
                    {zScoreBBTB > 0 ? `+${zScoreBBTB}` : zScoreBBTB} SD
                  </span>
                  <span className="block text-[10px] font-semibold text-slate-600 mt-0.5">{statusBBTB}</span>
                </div>
              </div>
            </div>

            {/* Section 1: Identitas Balita */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                1. Identitas Sasaran & Wilayah
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Balita *
                  </label>
                  <input
                    type="text"
                    required
                    value={namaBalita}
                    onChange={(e) => setNamaBalita(e.target.value)}
                    placeholder="Contoh: Muhammad Rayhan"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    NIK Balita (16 Digit)
                  </label>
                  <input
                    type="text"
                    value={nik}
                    onChange={(e) => setNik(e.target.value)}
                    placeholder="3201xxxxxxxxxxxx"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-mono text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Ibu / Orang Tua
                  </label>
                  <input
                    type="text"
                    value={namaIbu}
                    onChange={(e) => setNamaIbu(e.target.value)}
                    placeholder="Contoh: Siti Nurhaliza"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jenis Kelamin *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setJk('L')}
                      className={`flex items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-medium transition ${
                        jk === 'L'
                          ? 'border-emerald-600 bg-emerald-50 font-bold text-emerald-800'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {jk === 'L' && <Check className="h-3.5 w-3.5" />}
                      Laki-laki
                    </button>
                    <button
                      type="button"
                      onClick={() => setJk('P')}
                      className={`flex items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-medium transition ${
                        jk === 'P'
                          ? 'border-emerald-600 bg-emerald-50 font-bold text-emerald-800'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {jk === 'P' && <Check className="h-3.5 w-3.5" />}
                      Perempuan
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal Lahir *
                  </label>
                  <input
                    type="date"
                    required
                    value={tanggalLahir}
                    onChange={(e) => setTanggalLahir(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Posyandu
                  </label>
                  <input
                    type="text"
                    value={posyandu}
                    onChange={(e) => setPosyandu(e.target.value)}
                    placeholder="Contoh: Posyandu Melati 1"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Desa / Kelurahan
                  </label>
                  <input
                    type="text"
                    value={desa}
                    onChange={(e) => setDesa(e.target.value)}
                    placeholder="Desa Sukatani"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Puskesmas Pengampu
                  </label>
                  <input
                    type="text"
                    value={puskesmas}
                    onChange={(e) => setPuskesmas(e.target.value)}
                    placeholder="Puskesmas Sukatani"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Hasil Pengukuran & Intervensi PMT */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                2. Data Pengukuran & Intervensi PMT
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal Pengukuran *
                  </label>
                  <input
                    type="date"
                    required
                    value={tanggalPengukuran}
                    onChange={(e) => setTanggalPengukuran(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tinggi Badan (cm) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="30"
                    max="130"
                    required
                    value={tinggiBadan}
                    onChange={(e) => setTinggiBadan(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-mono text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Berat Badan (kg) *
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="1.5"
                    max="35"
                    required
                    value={beratBadan}
                    onChange={(e) => setBeratBadan(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-mono text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    LiLA (Lingkar Lengan, cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={lingkarLengan || ''}
                    onChange={(e) => setLingkarLengan(parseFloat(e.target.value) || undefined)}
                    placeholder="12.5"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-mono text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Hari PMT ke-
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={hariPMT}
                    onChange={(e) => setHariPMT(parseInt(e.target.value) || 1)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-mono text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kepatuhan Konsumsi
                  </label>
                  <select
                    value={kepatuhan}
                    onChange={(e) => setKepatuhan(e.target.value as TingkatKepatuhan)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="Habis">Habis (100%)</option>
                    <option value="3/4 Porsi">3/4 Porsi (75%)</option>
                    <option value="1/2 Porsi">1/2 Porsi (50%)</option>
                    <option value="< 1/2 Porsi">&lt; 1/2 Porsi (25%)</option>
                    <option value="Tidak Dikonsumsi">Tidak Dikonsumsi</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Menu PMT Pangan Lokal
                </label>
                <input
                  type="text"
                  value={menuPMT}
                  onChange={(e) => setMenuPMT(e.target.value)}
                  placeholder="Contoh: Nasi Tim Ikan Kembung Daun Kelor + Telur Puyuh"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan Kesehatan / Keterangan Tambahan
                </label>
                <textarea
                  rows={2}
                  value={catatanKesehatan}
                  onChange={(e) => setCatatanKesehatan(e.target.value)}
                  placeholder="Contoh: Anak aktif, tidak ada demam atau diare, nafsu makan stabil..."
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

            </div>

          </div>

          {/* Form Footer */}
          <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-6 py-4 bg-slate-50">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-white transition"
            >
              Batal
            </button>
            <button
              type="submit"
              id="btn-save-balita-form"
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 active:scale-95 transition"
            >
              <Save className="h-4 w-4" />
              <span>Simpan Data</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
