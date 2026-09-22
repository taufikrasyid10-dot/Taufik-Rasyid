import React from 'react';
import { DokumentasiBelanjaItem, PengaturanDokumentasi } from '../types';
import GpsMapCameraWatermark from './GpsMapCameraWatermark';
import { Printer, Plus, Edit, Trash2 } from 'lucide-react';

interface DokumentasiBelanjaViewProps {
  data: DokumentasiBelanjaItem[];
  pengaturan: PengaturanDokumentasi;
  onOpenAddModal: (item?: DokumentasiBelanjaItem) => void;
  onDeleteItem: (id: string) => void;
  onOpenSettingModal: () => void;
}

export default function DokumentasiBelanjaView({
  data,
  pengaturan,
  onOpenAddModal,
  onDeleteItem,
  onOpenSettingModal,
}: DokumentasiBelanjaViewProps) {
  const handlePrint = () => {
    window.print();
  };

  // Group into pairs for 2-column table layout as seen in the photo
  const pairs: Array<[DokumentasiBelanjaItem | undefined, DokumentasiBelanjaItem | undefined]> = [];
  for (let i = 0; i < data.length; i += 2) {
    pairs.push([data[i], data[i + 1]]);
  }

  return (
    <div className="space-y-6">
      
      {/* Top Action Bar (Hidden on Print) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs print:hidden">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            Dokumentasi Belanja Bahan Konsumsi PMT Stunting
          </h2>
          <p className="text-xs text-slate-500">
            Bukti fisik belanja bahan mentah segar harian (sayur, telur, ikan, daging, buah) dengan Geotag GPS Map Camera
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            id="btn-setting-belanja"
            onClick={onOpenSettingModal}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition"
          >
            <Edit className="h-3.5 w-3.5 text-slate-500" />
            <span>Ubah Judul & Periode</span>
          </button>

          <button
            type="button"
            id="btn-add-belanja"
            onClick={() => onOpenAddModal()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Tambah Belanja Harian</span>
          </button>

          <button
            type="button"
            id="btn-print-belanja"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Cetak / Simpan PDF</span>
          </button>
        </div>
      </div>

      {/* Main Printable Document Canvas (Persis seperti Gambar 2) */}
      <div 
        id="printable-dokumen-belanja"
        className="bg-white p-4 sm:p-8 rounded-2xl border border-slate-300 shadow-md print:shadow-none print:border-none print:p-0"
      >
        
        {/* Document Header (Center Bold Uppercase) */}
        <div className="text-center pb-6 border-b border-slate-200 print:border-b-2 print:border-slate-800 mb-6">
          <h1 className="text-lg sm:text-xl font-bold uppercase tracking-wider text-slate-900 font-sans">
            {pengaturan.judulBelanja}
          </h1>
          <h2 className="text-base sm:text-lg font-bold uppercase tracking-wide text-slate-800 mt-1 font-sans">
            {pengaturan.bulanTahunAnggaran}
          </h2>
        </div>

        {/* 2-Column Table Structure Matching WhatsApp Image 2026-09-22 at 08.06.02.jpeg */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border-2 border-slate-900 text-xs sm:text-sm font-sans text-slate-900">
            
            {/* Header Columns: NO, TANGGAL, MENU | NO, TANGGAL, MENU */}
            <thead>
              <tr className="border-b-2 border-slate-900 bg-white text-center font-bold tracking-wide">
                <th className="border-r-2 border-slate-900 py-3 px-2 w-10 sm:w-12">
                  NO
                </th>
                <th className="border-r-2 border-slate-900 py-3 px-2 w-24 sm:w-28">
                  TANGGAL
                </th>
                <th className="border-r-4 border-slate-900 py-3 px-3 w-[42%] min-w-[260px]">
                  MENU & FOTO BAHAN
                </th>
                <th className="border-r-2 border-slate-900 py-3 px-2 w-10 sm:w-12">
                  NO
                </th>
                <th className="border-r-2 border-slate-900 py-3 px-2 w-24 sm:w-28">
                  TANGGAL
                </th>
                <th className="py-3 px-3 w-[42%] min-w-[260px]">
                  MENU & FOTO BAHAN
                </th>
              </tr>
            </thead>

            {/* Rows of Pairs */}
            <tbody>
              {pairs.map(([itemLeft, itemRight], rowIdx) => (
                <tr key={`row-${rowIdx}`} className="border-b-2 border-slate-900 align-top">
                  
                  {/* LEFT ITEM */}
                  {itemLeft ? (
                    <>
                      <td className="border-r-2 border-slate-900 text-center font-bold p-2 align-middle">
                        {itemLeft.nomor}
                      </td>
                      <td className="border-r-2 border-slate-900 text-center font-mono font-semibold p-2 align-middle whitespace-nowrap">
                        <div>{itemLeft.tanggal}</div>
                        <div className="print:hidden flex justify-center gap-1 mt-2">
                          <button
                            type="button"
                            onClick={() => onOpenAddModal(itemLeft)}
                            className="p-1 rounded bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700"
                            title="Edit belanja ini"
                          >
                            <Edit className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteItem(itemLeft.id)}
                            className="p-1 rounded bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700"
                            title="Hapus belanja ini"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                      <td className="border-r-4 border-slate-900 p-3 align-top">
                        <div className="space-y-2">
                          <div className="text-center font-bold text-xs uppercase tracking-wide border-b border-slate-200 pb-1">
                            {itemLeft.namaMenu}
                          </div>
                          
                          <div className="relative overflow-hidden rounded-md border border-slate-300 bg-slate-100 aspect-4/3 max-h-[340px] shadow-xs">
                            <img
                              src={itemLeft.fotoBahanUrl}
                              alt={itemLeft.namaMenu}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <GpsMapCameraWatermark
                              location={itemLeft.geotagLocation || pengaturan.defaultLokasi}
                              detail={itemLeft.geotagDetail || pengaturan.defaultDetailAlamat}
                              coord={itemLeft.geotagCoord || pengaturan.defaultKoordinat}
                              time={itemLeft.geotagTime || `${itemLeft.tanggal} 06:47 AM GMT +08:00`}
                            />
                          </div>

                          {itemLeft.daftarBahan && (
                            <p className="text-[11px] text-slate-600 leading-snug line-clamp-2 print:text-[10px]">
                              <span className="font-semibold text-slate-800">Komposisi: </span>
                              {itemLeft.daftarBahan}
                            </p>
                          )}
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="border-r-2 border-slate-900 bg-slate-50" />
                      <td className="border-r-2 border-slate-900 bg-slate-50" />
                      <td className="border-r-4 border-slate-900 bg-slate-50" />
                    </>
                  )}

                  {/* RIGHT ITEM */}
                  {itemRight ? (
                    <>
                      <td className="border-r-2 border-slate-900 text-center font-bold p-2 align-middle">
                        {itemRight.nomor}
                      </td>
                      <td className="border-r-2 border-slate-900 text-center font-mono font-semibold p-2 align-middle whitespace-nowrap">
                        <div>{itemRight.tanggal}</div>
                        <div className="print:hidden flex justify-center gap-1 mt-2">
                          <button
                            type="button"
                            onClick={() => onOpenAddModal(itemRight)}
                            className="p-1 rounded bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700"
                            title="Edit belanja ini"
                          >
                            <Edit className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteItem(itemRight.id)}
                            className="p-1 rounded bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700"
                            title="Hapus belanja ini"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                      <td className="p-3 align-top">
                        <div className="space-y-2">
                          <div className="text-center font-bold text-xs uppercase tracking-wide border-b border-slate-200 pb-1">
                            {itemRight.namaMenu}
                          </div>
                          
                          <div className="relative overflow-hidden rounded-md border border-slate-300 bg-slate-100 aspect-4/3 max-h-[340px] shadow-xs">
                            <img
                              src={itemRight.fotoBahanUrl}
                              alt={itemRight.namaMenu}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <GpsMapCameraWatermark
                              location={itemRight.geotagLocation || pengaturan.defaultLokasi}
                              detail={itemRight.geotagDetail || pengaturan.defaultDetailAlamat}
                              coord={itemRight.geotagCoord || pengaturan.defaultKoordinat}
                              time={itemRight.geotagTime || `${itemRight.tanggal} 07:00 AM GMT +08:00`}
                            />
                          </div>

                          {itemRight.daftarBahan && (
                            <p className="text-[11px] text-slate-600 leading-snug line-clamp-2 print:text-[10px]">
                              <span className="font-semibold text-slate-800">Komposisi: </span>
                              {itemRight.daftarBahan}
                            </p>
                          )}
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="border-r-2 border-slate-900 bg-slate-50" />
                      <td className="border-r-2 border-slate-900 bg-slate-50" />
                      <td className="bg-slate-50" />
                    </>
                  )}

                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Signature Section */}
        <div className="mt-8 pt-6 border-t border-slate-300 grid grid-cols-2 text-center text-xs sm:text-sm font-sans text-slate-800 print:mt-10">
          <div>
            <p>Mengetahui / Menyetujui,</p>
            <p className="font-semibold mt-1">Pejabat Pembuat Komitmen / Kepala Puskesmas</p>
            <div className="h-20" />
            <p className="font-bold underline text-slate-900">( ..................................................... )</p>
            <p className="text-xs text-slate-500">NIP. ............................................</p>
          </div>
          <div>
            <p>Penanggung Jawab Pembelanjaan PMT,</p>
            <p className="font-semibold mt-1">Pengelola / Kader Pelaksana Belanja Bahan</p>
            <div className="h-20" />
            <p className="font-bold underline text-slate-900">( ..................................................... )</p>
            <p className="text-xs text-slate-500">Kader Posyandu / Desa</p>
          </div>
        </div>

      </div>

    </div>
  );
}
