import React from 'react';
import { BalitaPMT } from '../types';
import { X, Printer } from 'lucide-react';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: BalitaPMT[];
}

export default function PrintReportModal({ isOpen, onClose, data }: PrintReportModalProps) {
  if (!isOpen) return null;

  const total = data.length;
  const sangatPendek = data.filter(d => d.statusTBU === 'Sangat Pendek').length;
  const pendek = data.filter(d => d.statusTBU === 'Pendek').length;
  const normal = data.filter(d => d.statusTBU === 'Normal').length;
  const patuh = data.filter(d => d.kepatuhan === 'Habis' || d.kepatuhan === '3/4 Porsi').length;

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs print:p-0 print:bg-white print:fixed print:inset-0">
      <div 
        id="printable-report-dialog"
        className="relative flex max-h-[95vh] w-full max-w-4xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200 print:border-none print:shadow-none print:max-h-none print:w-full"
      >
        {/* Modal Bar (Hidden on Print) */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-3.5 bg-slate-50 print:hidden">
          <div>
            <h2 className="text-sm font-bold text-slate-800">
              Pratinjau Lembar Rekapitulasi Evaluasi PMT Stunting
            </h2>
            <p className="text-xs text-slate-500">Format cetak resmi laporan posyandu / puskesmas</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-trigger-print"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Area */}
        <div className="overflow-y-auto p-8 font-sans text-slate-900 space-y-6 print:p-4 print:overflow-visible">
          
          {/* Official Letterhead (Kop Surat Laporan) */}
          <div className="text-center border-b-2 border-slate-800 pb-4">
            <h1 className="text-base font-bold uppercase tracking-wider text-slate-900">
              Laporan Rekapitulasi Pemberian Makanan Tambahan (PMT)
            </h1>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
              Program Intervensi Pencegahan & Percepatan Penurunan Stunting Balita
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Puskesmas Pengampu: <span className="font-semibold text-slate-900">{data[0]?.puskesmas || 'Puskesmas Wilayah'}</span> • Periode Evaluasi: {currentDate}
            </p>
          </div>

          {/* Key Metrics Summary Box */}
          <div className="grid grid-cols-4 gap-3 text-center border border-slate-300 rounded-lg p-3 bg-slate-50/50 print:bg-white text-xs">
            <div>
              <span className="text-slate-500 block">Total Balita Sasaran</span>
              <strong className="text-base font-bold text-slate-900">{total} Anak</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Total Kasus Stunting</span>
              <strong className="text-base font-bold text-rose-700">{sangatPendek + pendek} Anak</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Status Tinggi Normal</span>
              <strong className="text-base font-bold text-emerald-700">{normal} Anak</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Kepatuhan Makan Baik</span>
              <strong className="text-base font-bold text-indigo-700">{patuh} Anak</strong>
            </div>
          </div>

          {/* Table List */}
          <div className="overflow-hidden border border-slate-300 rounded-lg">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-[11px] font-bold text-slate-800 uppercase border-b border-slate-300">
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
                  <th className="p-2 text-center">Hari PMT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {data.map((item, idx) => (
                  <tr key={item.id} className="leading-tight">
                    <td className="p-2 text-center border-r border-slate-200 font-mono text-[11px]">{idx + 1}</td>
                    <td className="p-2 border-r border-slate-200 font-medium">{item.namaBalita}</td>
                    <td className="p-2 border-r border-slate-200 font-mono text-[10px]">{item.nik}</td>
                    <td className="p-2 text-center border-r border-slate-200">{item.jk}</td>
                    <td className="p-2 text-center border-r border-slate-200">{item.usiaBulan} bln</td>
                    <td className="p-2 border-r border-slate-200">{item.posyandu}</td>
                    <td className="p-2 text-center border-r border-slate-200 font-mono">{item.tinggiBadan}</td>
                    <td className="p-2 text-center border-r border-slate-200 font-mono">{item.beratBadan}</td>
                    <td className="p-2 text-center border-r border-slate-200 font-mono">
                      {item.zScoreTBU > 0 ? `+${item.zScoreTBU}` : item.zScoreTBU}
                    </td>
                    <td className="p-2 border-r border-slate-200 font-semibold text-[11px]">
                      {item.statusTBU}
                    </td>
                    <td className="p-2 text-center font-mono">Hari ke-{item.hariPMT}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Signature Block */}
          <div className="pt-8 grid grid-cols-2 text-center text-xs text-slate-800">
            <div>
              <p className="text-slate-500">Mengetahui,</p>
              <p className="font-semibold text-slate-900 mt-1">Penanggung Jawab Program Gizi Puskesmas</p>
              <div className="h-20" />
              <p className="font-bold underline text-slate-900">( ..................................................... )</p>
              <p className="text-[11px] text-slate-500">NIP. ............................................</p>
            </div>
            <div>
              <p className="text-slate-500">Dibuat pada tanggal {currentDate}</p>
              <p className="font-semibold text-slate-900 mt-1">Bidan Desa / Koordinator Kader Posyandu</p>
              <div className="h-20" />
              <p className="font-bold underline text-slate-900">( ..................................................... )</p>
              <p className="text-[11px] text-slate-500">Kader Pelaksana PMT Lokal</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
