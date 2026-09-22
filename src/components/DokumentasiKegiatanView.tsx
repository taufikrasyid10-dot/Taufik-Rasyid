import React from 'react';
import { DokumentasiKegiatanHari, PengaturanDokumentasi } from '../types';
import GpsMapCameraWatermark from './GpsMapCameraWatermark';
import { Printer, Plus, Edit, Trash2, Camera } from 'lucide-react';

interface DokumentasiKegiatanViewProps {
  data: DokumentasiKegiatanHari[];
  pengaturan: PengaturanDokumentasi;
  onOpenAddModal: (hari?: DokumentasiKegiatanHari) => void;
  onDeleteHari: (id: string) => void;
  onOpenSettingModal: () => void;
  onOpenUploadPhotoOnly?: (hariId: string, balitaId?: string) => void;
}

export default function DokumentasiKegiatanView({
  data,
  pengaturan,
  onOpenAddModal,
  onDeleteHari,
  onOpenSettingModal,
}: DokumentasiKegiatanViewProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Action Bar (Hidden when printing) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs print:hidden">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            Dokumentasi Menu & Kegiatan PMT Balita
          </h2>
          <p className="text-xs text-slate-500">
            Format resmi laporan foto menu olahan & kegiatan makan balita stunting dengan Geotag GPS Map Camera
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            id="btn-setting-kegiatan"
            onClick={onOpenSettingModal}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition"
          >
            <Edit className="h-3.5 w-3.5 text-slate-500" />
            <span>Ubah Judul & Periode</span>
          </button>

          <button
            type="button"
            id="btn-add-kegiatan"
            onClick={() => onOpenAddModal()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Tambah Dokumentasi Baru</span>
          </button>

          <button
            type="button"
            id="btn-print-kegiatan"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Cetak / Simpan PDF</span>
          </button>
        </div>
      </div>

      {/* Main Printable Document Canvas (Persis seperti Gambar WhatsApp) */}
      <div 
        id="printable-dokumen-kegiatan"
        className="bg-white p-4 sm:p-8 rounded-2xl border border-slate-300 shadow-md print:shadow-none print:border-none print:p-0"
      >
        
        {/* Document Header (Center Bold Uppercase) */}
        <div className="text-center pb-6 border-b border-slate-200 print:border-b-2 print:border-slate-800 mb-6">
          <h1 className="text-lg sm:text-xl font-bold uppercase tracking-wider text-slate-900 font-sans">
            {pengaturan.judulKegiatan}
          </h1>
          <h2 className="text-base sm:text-lg font-bold uppercase tracking-wide text-slate-800 mt-1 font-sans">
            {pengaturan.bulanTahunAnggaran}
          </h2>
        </div>

        {/* Table Structure (Exact Replica of WhatsApp Image 2026-09-22 at 08.06.28.jpeg) */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border-2 border-slate-900 text-xs sm:text-sm font-sans text-slate-900">
            
            {/* Header Columns */}
            <thead>
              <tr className="border-b-2 border-slate-900 bg-white text-center font-bold tracking-wide">
                <th className="border-r-2 border-slate-900 py-3 px-2 w-12 sm:w-14">
                  NO
                </th>
                <th className="border-r-2 border-slate-900 py-3 px-2 w-28 sm:w-32">
                  TANGGAL
                </th>
                <th className="border-r-2 border-slate-900 py-3 px-3 w-40 sm:w-48">
                  NAMA
                </th>
                <th className="border-r-2 border-slate-900 py-3 px-3 w-1/3 min-w-[240px]">
                  MENU PMT
                </th>
                <th className="py-3 px-3 w-1/3 min-w-[240px]">
                  KEGIATAN
                </th>
              </tr>
            </thead>

            {/* Body Rows */}
            <tbody>
              {data.map((hari, hariIdx) => {
                const rowCount = Math.max(hari.balitaList.length, 1);
                
                return hari.balitaList.map((balita, bIdx) => {
                  const isFirstRow = bIdx === 0;

                  return (
                    <tr 
                      key={`${hari.id}-${balita.id}`}
                      className="border-b border-slate-900 align-middle"
                    >
                      
                      {/* NO Column */}
                      <td className="border-r-2 border-slate-900 text-center font-semibold p-2 align-middle">
                        {hariIdx * 3 + bIdx + 1}
                      </td>

                      {/* TANGGAL Column (Merged / RowSpan for the day) */}
                      {isFirstRow && (
                        <td 
                          rowSpan={rowCount}
                          className="border-r-2 border-slate-900 text-center font-medium p-2 align-middle font-mono whitespace-nowrap bg-white"
                        >
                          <div className="space-y-2">
                            <span className="text-slate-900 font-bold text-sm block">
                              {hari.tanggal}
                            </span>
                            <div className="print:hidden flex justify-center gap-1 pt-2">
                              <button
                                type="button"
                                title="Edit hari & menu ini"
                                onClick={() => onOpenAddModal(hari)}
                                className="p-1 rounded bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700"
                              >
                                <Edit className="h-3 w-3" />
                              </button>
                              <button
                                type="button"
                                title="Hapus dokumentasi hari ini"
                                onClick={() => onDeleteHari(hari.id)}
                                className="p-1 rounded bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </td>
                      )}

                      {/* NAMA Balita Column */}
                      <td className="border-r-2 border-slate-900 text-center font-bold px-3 py-2 uppercase tracking-wide align-middle">
                        <div className="text-slate-900">
                          {balita.namaBalita}
                        </div>
                        {balita.nik && (
                          <div className="text-[10px] font-mono text-slate-500 mt-0.5 print:hidden">
                            NIK: {balita.nik}
                          </div>
                        )}
                      </td>

                      {/* MENU [NAMA MENU] Column (Merged / RowSpan for the day menu) */}
                      {isFirstRow && (
                        <td 
                          rowSpan={rowCount}
                          className="border-r-2 border-slate-900 p-2 align-middle bg-white text-center"
                        >
                          <div className="space-y-1.5 max-w-[340px] mx-auto">
                            {/* Menu Title */}
                            <div className="text-xs font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-1">
                              {hari.namaMenu}
                            </div>

                            {/* Menu Photo with Watermark */}
                            <div className="relative overflow-hidden rounded-md border border-slate-300 bg-slate-100 aspect-4/3 max-h-[360px] shadow-xs">
                              <img
                                src={hari.fotoMenuUrl}
                                alt={hari.namaMenu}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                              <GpsMapCameraWatermark
                                location={hari.geotagLocation || pengaturan.defaultLokasi}
                                detail={hari.geotagDetail || pengaturan.defaultDetailAlamat}
                                coord={hari.geotagCoord || pengaturan.defaultKoordinat}
                                time={hari.geotagTime || `${hari.tanggal} 08:36 AM GMT +08:00`}
                              />
                            </div>
                          </div>
                        </td>
                      )}

                      {/* KEGIATAN Column (Balita Eating with Watermark) */}
                      <td className="p-2 align-middle text-center">
                        <div className="space-y-1.5 max-w-[340px] mx-auto">
                          
                          {/* Balita Activity Photo with Watermark */}
                          <div className="relative overflow-hidden rounded-md border border-slate-300 bg-slate-100 aspect-4/3 max-h-[300px] shadow-xs">
                            <img
                              src={balita.fotoKegiatanUrl}
                              alt={`Kegiatan makan PMT ${balita.namaBalita}`}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <GpsMapCameraWatermark
                              location={balita.geotagLocation || pengaturan.defaultLokasi}
                              detail={balita.geotagDetail || pengaturan.defaultDetailAlamat}
                              coord={balita.geotagCoord || pengaturan.defaultKoordinat}
                              time={balita.geotagTime || `${hari.tanggal} 08:50 AM GMT +08:00`}
                            />
                          </div>

                          {balita.keterangan && (
                            <p className="text-[11px] text-slate-600 italic text-left print:text-[10px]">
                              Catatan: {balita.keterangan}
                            </p>
                          )}
                        </div>
                      </td>

                    </tr>
                  );
                });
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Signature Section for LPJ Dokumen Resmi */}
        <div className="mt-8 pt-6 border-t border-slate-300 grid grid-cols-2 text-center text-xs sm:text-sm font-sans text-slate-800 print:mt-10">
          <div>
            <p>Mengetahui,</p>
            <p className="font-semibold mt-1">Kepala Puskesmas / Penanggung Jawab Gizi</p>
            <div className="h-20" />
            <p className="font-bold underline text-slate-900">( ..................................................... )</p>
            <p className="text-xs text-slate-500">NIP. ............................................</p>
          </div>
          <div>
            <p>Pelaksana Program PMT Lokal</p>
            <p className="font-semibold mt-1">Bidan Desa / Koordinator Kader</p>
            <div className="h-20" />
            <p className="font-bold underline text-slate-900">( ..................................................... )</p>
            <p className="text-xs text-slate-500">Wilayah Kerja Puskesmas</p>
          </div>
        </div>

      </div>

    </div>
  );
}
