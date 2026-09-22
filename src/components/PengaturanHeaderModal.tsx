import React, { useState } from 'react';
import { PengaturanDokumentasi } from '../types';
import { X, Check, Settings, RotateCcw } from 'lucide-react';
import { DEFAULT_PENGATURAN_DOKUMENTASI } from '../data/documentationSampleData';

interface PengaturanHeaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  pengaturan: PengaturanDokumentasi;
  onSave: (p: PengaturanDokumentasi) => void;
}

export default function PengaturanHeaderModal({
  isOpen,
  onClose,
  pengaturan,
  onSave,
}: PengaturanHeaderModalProps) {
  if (!isOpen) return null;

  const [formData, setFormData] = useState<PengaturanDokumentasi>(pengaturan);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleResetDefault = () => {
    setFormData(DEFAULT_PENGATURAN_DOKUMENTASI);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">
              Pengaturan Judul & Periode Laporan
            </h2>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Bulan & Tahun Anggaran (Kop Dokumen)
            </label>
            <input
              type="text"
              value={formData.bulanTahunAnggaran}
              onChange={(e) => setFormData({ ...formData, bulanTahunAnggaran: e.target.value.toUpperCase() })}
              placeholder="BULAN AGUSTUS TAHUN ANGGARAN 2026"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 uppercase"
              required
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Tampil di bagian sub-judul atas lembar cetak dokumen
            </p>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Judul Laporan Menu & Kegiatan
            </label>
            <input
              type="text"
              value={formData.judulKegiatan}
              onChange={(e) => setFormData({ ...formData, judulKegiatan: e.target.value.toUpperCase() })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold uppercase"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Judul Laporan Belanja Bahan
            </label>
            <input
              type="text"
              value={formData.judulBelanja}
              onChange={(e) => setFormData({ ...formData, judulBelanja: e.target.value.toUpperCase() })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold uppercase"
              required
            />
          </div>

          <div className="pt-2 border-t border-slate-200 space-y-3">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wide">
              Lokasi Geotag / Posyandu Puskesmas Default
            </h3>

            <div>
              <label className="block text-slate-600 mb-1">Kecamatan & Provinsi</label>
              <input
                type="text"
                value={formData.defaultLokasi}
                onChange={(e) => setFormData({ ...formData, defaultLokasi: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-600 mb-1">Detail Alamat / Desa</label>
              <input
                type="text"
                value={formData.defaultDetailAlamat}
                onChange={(e) => setFormData({ ...formData, defaultDetailAlamat: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-600 mb-1">Koordinat Default (Lat / Long)</label>
              <input
                type="text"
                value={formData.defaultKoordinat}
                onChange={(e) => setFormData({ ...formData, defaultKoordinat: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-mono"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={handleResetDefault}
              className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset ke Contoh BOK</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700"
              >
                <Check className="h-4 w-4" />
                <span>Simpan Pengaturan</span>
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
}
