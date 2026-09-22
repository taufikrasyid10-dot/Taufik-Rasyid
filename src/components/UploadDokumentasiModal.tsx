import React, { useState, useEffect } from 'react';
import { DokumentasiKegiatanHari, DokumentasiBelanjaItem, BalitaKegiatanEntry, PengaturanDokumentasi, BalitaPMT } from '../types';
import { X, Upload, Plus, Trash2, MapPin, Camera, Sparkles, Check } from 'lucide-react';

interface UploadDokumentasiModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'kegiatan' | 'belanja';
  pengaturan: PengaturanDokumentasi;
  editingKegiatan?: DokumentasiKegiatanHari | null;
  editingBelanja?: DokumentasiBelanjaItem | null;
  onSaveKegiatan: (item: DokumentasiKegiatanHari) => void;
  onSaveBelanja: (item: DokumentasiBelanjaItem) => void;
  daftarBalitaReferensi?: BalitaPMT[];
}

export default function UploadDokumentasiModal({
  isOpen,
  onClose,
  type,
  pengaturan,
  editingKegiatan,
  editingBelanja,
  onSaveKegiatan,
  onSaveBelanja,
  daftarBalitaReferensi = [],
}: UploadDokumentasiModalProps) {
  if (!isOpen) return null;

  // State untuk Kegiatan
  const [tanggalKegiatan, setTanggalKegiatan] = useState('01-08-2026');
  const [namaMenuKegiatan, setNamaMenuKegiatan] = useState('MENU NASI GORENG CERIA');
  const [fotoMenuUrl, setFotoMenuUrl] = useState('https://images.unsplash.com/photo-1512058564366-18510be2db19?w=700&auto=format&fit=crop&q=80');
  const [geotagLocation, setGeotagLocation] = useState(pengaturan.defaultLokasi);
  const [geotagDetail, setGeotagDetail] = useState(pengaturan.defaultDetailAlamat);
  const [geotagCoord, setGeotagCoord] = useState(pengaturan.defaultKoordinat);
  const [geotagTime, setGeotagTime] = useState('01/08/2026 08:36 AM GMT +08:00');

  const [balitaList, setBalitaList] = useState<BalitaKegiatanEntry[]>([
    {
      id: 'bal-temp-1',
      namaBalita: 'ARSYAD',
      fotoKegiatanUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
      keterangan: 'Makan PMT mandiri dengan nafsu makan baik',
    },
    {
      id: 'bal-temp-2',
      namaBalita: 'MUHAMMAD ALFARIZKI',
      fotoKegiatanUrl: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&auto=format&fit=crop&q=80',
      keterangan: 'Disuapi oleh ibu, porsi habis 1 porsi',
    },
    {
      id: 'bal-temp-3',
      namaBalita: 'NURHAFIZA',
      fotoKegiatanUrl: 'https://images.unsplash.com/photo-1596464716127-f2a829822301?w=600&auto=format&fit=crop&q=80',
      keterangan: 'Makan bersama pendamping kader posyandu',
    },
  ]);

  // State untuk Belanja
  const [nomorBelanja, setNomorBelanja] = useState(1);
  const [tanggalBelanja, setTanggalBelanja] = useState('01-08-2026');
  const [namaMenuBelanja, setNamaMenuBelanja] = useState('MENU MENU NASI GORENG CERIA');
  const [fotoBahanUrl, setFotoBahanUrl] = useState('https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=700&auto=format&fit=crop&q=80');
  const [daftarBahan, setDaftarBahan] = useState('Beras pandan wangi, telur ayam, daging ayam paha, pepaya manis, buncis segar, wortel, minyak goreng kelapa, wadah kotak PMT.');

  // Load existing data if editing
  useEffect(() => {
    if (editingKegiatan) {
      setTanggalKegiatan(editingKegiatan.tanggal);
      setNamaMenuKegiatan(editingKegiatan.namaMenu);
      setFotoMenuUrl(editingKegiatan.fotoMenuUrl);
      setGeotagLocation(editingKegiatan.geotagLocation || pengaturan.defaultLokasi);
      setGeotagDetail(editingKegiatan.geotagDetail || pengaturan.defaultDetailAlamat);
      setGeotagCoord(editingKegiatan.geotagCoord || pengaturan.defaultKoordinat);
      setGeotagTime(editingKegiatan.geotagTime || `${editingKegiatan.tanggal} 08:36 AM GMT +08:00`);
      setBalitaList(editingKegiatan.balitaList || []);
    } else if (editingBelanja) {
      setNomorBelanja(editingBelanja.nomor);
      setTanggalBelanja(editingBelanja.tanggal);
      setNamaMenuBelanja(editingBelanja.namaMenu);
      setFotoBahanUrl(editingBelanja.fotoBahanUrl);
      setDaftarBahan(editingBelanja.daftarBahan || '');
      setGeotagLocation(editingBelanja.geotagLocation || pengaturan.defaultLokasi);
      setGeotagDetail(editingBelanja.geotagDetail || pengaturan.defaultDetailAlamat);
      setGeotagCoord(editingBelanja.geotagCoord || pengaturan.defaultKoordinat);
      setGeotagTime(editingBelanja.geotagTime || `${editingBelanja.tanggal} 06:47 AM GMT +08:00`);
    }
  }, [editingKegiatan, editingBelanja, pengaturan]);

  // Handle image upload from computer/phone camera
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'menu' | 'bahan' | number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (target === 'menu') {
        setFotoMenuUrl(result);
      } else if (target === 'bahan') {
        setFotoBahanUrl(result);
      } else if (typeof target === 'number') {
        setBalitaList(prev => {
          const next = [...prev];
          if (next[target]) {
            next[target] = { ...next[target], fotoKegiatanUrl: result };
          }
          return next;
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // Add new Balita row in Kegiatan
  const handleAddBalita = () => {
    setBalitaList(prev => [
      ...prev,
      {
        id: `bal-new-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        namaBalita: 'NAMA BALITA BARU',
        fotoKegiatanUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
        keterangan: 'Makan porsi penuh',
      }
    ]);
  };

  // Remove Balita row
  const handleRemoveBalita = (index: number) => {
    setBalitaList(prev => prev.filter((_, i) => i !== index));
  };

  // Quick autofill GPS from device
  const handleGetDeviceLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude.toFixed(6);
          const lon = pos.coords.longitude.toFixed(6);
          setGeotagCoord(`Lat ${lat}° Long ${lon}°`);
          const now = new Date();
          const timeStr = `${now.toLocaleDateString('id-ID')} ${now.toLocaleTimeString('id-ID')} GMT +08:00`;
          setGeotagTime(timeStr);
        },
        () => {
          alert('Izin lokasi tidak diberikan, menggunakan koordinat default Puskesmas.');
        }
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (type === 'kegiatan') {
      const item: DokumentasiKegiatanHari = {
        id: editingKegiatan ? editingKegiatan.id : `keg-${Date.now()}`,
        tanggal: tanggalKegiatan,
        namaMenu: namaMenuKegiatan.toUpperCase(),
        fotoMenuUrl,
        geotagLocation,
        geotagDetail,
        geotagCoord,
        geotagTime,
        balitaList: balitaList.map(b => ({
          ...b,
          geotagLocation,
          geotagDetail,
          geotagCoord,
          geotagTime,
        })),
      };
      onSaveKegiatan(item);
    } else {
      const item: DokumentasiBelanjaItem = {
        id: editingBelanja ? editingBelanja.id : `belanja-${Date.now()}`,
        nomor: Number(nomorBelanja),
        tanggal: tanggalBelanja,
        namaMenu: namaMenuBelanja.toUpperCase(),
        fotoBahanUrl,
        daftarBahan,
        geotagLocation,
        geotagDetail,
        geotagCoord,
        geotagTime,
      };
      onSaveBelanja(item);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="relative flex max-h-[92vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Camera className="h-5 w-5 text-emerald-600" />
              {type === 'kegiatan' 
                ? (editingKegiatan ? 'Edit Dokumentasi Menu & Kegiatan' : 'Upload Foto Menu & Kegiatan PMT')
                : (editingBelanja ? 'Edit Dokumentasi Belanja Bahan' : 'Upload Foto Belanja Bahan Mentah')}
            </h2>
            <p className="text-xs text-slate-500">
              Format siap cetak dengan stamp geotag GPS Map Camera standar Kemenkes
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

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* ===================== FORM KEGIATAN ===================== */}
          {type === 'kegiatan' && (
            <div className="space-y-6">
              
              {/* Tanggal & Nama Menu */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Tanggal Kegiatan
                  </label>
                  <input
                    type="text"
                    value={tanggalKegiatan}
                    onChange={(e) => setTanggalKegiatan(e.target.value)}
                    placeholder="Contoh: 01-08-2026"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nama Menu PMT
                  </label>
                  <input
                    type="text"
                    value={namaMenuKegiatan}
                    onChange={(e) => setNamaMenuKegiatan(e.target.value)}
                    placeholder="Contoh: MENU NASI GORENG CERIA"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 uppercase"
                    required
                  />
                </div>
              </div>

              {/* Upload Foto Menu Olahan Box */}
              <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Foto Wadah / Box Menu PMT
                  </label>
                  <span className="text-[11px] text-slate-500">Otomatis berstempel GPS</span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="h-20 w-24 rounded-lg border border-slate-300 overflow-hidden bg-white shrink-0">
                    <img
                      src={fotoMenuUrl}
                      alt="Pratinjau Menu"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <label className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-100 cursor-pointer">
                      <Upload className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Pilih Foto dari Galeri / Kamera</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'menu')}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Bisa langsung unggah foto dari ponsel atau kamera dokumentasi kader
                    </p>
                  </div>
                </div>
              </div>

              {/* Daftar Balita Sasaran & Foto Kegiatan Makan */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Daftar Balita & Foto Kegiatan Makan ({balitaList.length} Anak)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddBalita}
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Tambah Balita
                  </button>
                </div>

                <div className="space-y-3">
                  {balitaList.map((balita, idx) => (
                    <div 
                      key={balita.id} 
                      className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 rounded-xl border border-slate-200 bg-white shadow-xs"
                    >
                      <div className="text-xs font-bold text-slate-500 w-6 text-center">
                        #{idx + 1}
                      </div>

                      {/* Photo preview */}
                      <div className="h-16 w-20 rounded-lg border border-slate-300 overflow-hidden bg-slate-100 shrink-0">
                        <img
                          src={balita.fotoKegiatanUrl}
                          alt={balita.namaBalita}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      {/* Name input & options */}
                      <div className="flex-1 space-y-1 w-full">
                        <input
                          type="text"
                          value={balita.namaBalita}
                          onChange={(e) => {
                            const val = e.target.value;
                            setBalitaList(prev => {
                              const next = [...prev];
                              next[idx] = { ...next[idx], namaBalita: val };
                              return next;
                            });
                          }}
                          placeholder="NAMA BALITA (Contoh: ARSYAD)"
                          className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-bold text-slate-900 uppercase"
                          required
                        />
                        <input
                          type="text"
                          value={balita.keterangan || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setBalitaList(prev => {
                              const next = [...prev];
                              next[idx] = { ...next[idx], keterangan: val };
                              return next;
                            });
                          }}
                          placeholder="Catatan kegiatan makan (opsional)"
                          className="w-full rounded-md border border-slate-200 px-2.5 py-1 text-[11px] text-slate-600"
                        />
                      </div>

                      {/* Upload Photo Button for this child */}
                      <div className="flex items-center gap-2 shrink-0">
                        <label className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 cursor-pointer">
                          <Upload className="h-3 w-3 text-emerald-600" />
                          <span>Ganti Foto</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, idx)}
                            className="hidden"
                          />
                        </label>
                        {balitaList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveBalita(idx)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ===================== FORM BELANJA ===================== */}
          {type === 'belanja' && (
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    No. Urut
                  </label>
                  <input
                    type="number"
                    value={nomorBelanja}
                    onChange={(e) => setNomorBelanja(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Tanggal Belanja
                  </label>
                  <input
                    type="text"
                    value={tanggalBelanja}
                    onChange={(e) => setTanggalBelanja(e.target.value)}
                    placeholder="Contoh: 01-08-2026"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Menu Terkait
                  </label>
                  <input
                    type="text"
                    value={namaMenuBelanja}
                    onChange={(e) => setNamaMenuBelanja(e.target.value)}
                    placeholder="Contoh: MENU NASI GORENG CERIA"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold uppercase"
                    required
                  />
                </div>
              </div>

              {/* Upload Foto Bahan Mentah di Nampan */}
              <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Foto Bahan Mentah di Nampan / Baki
                  </label>
                  <span className="text-[11px] text-slate-500">Format Laporan Belanja</span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="h-24 w-32 rounded-lg border border-slate-300 overflow-hidden bg-white shrink-0">
                    <img
                      src={fotoBahanUrl}
                      alt="Pratinjau Bahan Mentah"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <label className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-100 cursor-pointer">
                      <Upload className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Pilih Foto dari Galeri / Kamera</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'bahan')}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Foto bahan pangan lokal segar (ayam, telur, beras, sayur, buah) di nampan
                    </p>
                  </div>
                </div>
              </div>

              {/* Rincian Komposisi Bahan */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Rincian Komposisi Bahan Belanjaan
                </label>
                <textarea
                  rows={3}
                  value={daftarBahan}
                  onChange={(e) => setDaftarBahan(e.target.value)}
                  placeholder="Contoh: Beras pandan wangi, telur ayam, daging ayam paha, pepaya manis, wortel..."
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-800"
                />
              </div>

            </div>
          )}

          {/* ===================== PENGATURAN GEOTAG GPS CAMERA ===================== */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-emerald-700" />
                <span className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
                  Data Stempel Geotag GPS Map Camera
                </span>
              </div>
              <button
                type="button"
                onClick={handleGetDeviceLocation}
                className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 underline"
              >
                Gunakan Koordinat GPS HP Saat Ini
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-600 block mb-0.5">Kecamatan & Provinsi</label>
                <input
                  type="text"
                  value={geotagLocation}
                  onChange={(e) => setGeotagLocation(e.target.value)}
                  className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs"
                />
              </div>
              <div>
                <label className="text-slate-600 block mb-0.5">Koordinat (Latitude & Longitude)</label>
                <input
                  type="text"
                  value={geotagCoord}
                  onChange={(e) => setGeotagCoord(e.target.value)}
                  className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs font-mono"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-slate-600 block mb-0.5">Alamat Lengkap / Kode Pos</label>
                <input
                  type="text"
                  value={geotagDetail}
                  onChange={(e) => setGeotagDetail(e.target.value)}
                  className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-5 py-2 text-xs font-semibold text-white shadow-md hover:bg-emerald-700 transition"
            >
              <Check className="h-4 w-4" />
              <span>Simpan Dokumentasi</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
