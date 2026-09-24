import React, { useState } from 'react';
import { BalitaPMT } from '../types';
import { getWHOGrowthCurveData, getStatusGiziBalita, getFormattedTanggalPosyandu, calculateAgeInMonths } from '../utils/nutritionStandards';
import { TrendingUp, X, CheckCircle, AlertTriangle, Calendar, User, Scale, Ruler, Award } from 'lucide-react';

interface GrowthCurvePlotProps {
  balita: BalitaPMT | null;
  onClose: () => void;
  onSelectAnother?: (balita: BalitaPMT) => void;
  allBalita?: BalitaPMT[];
}

export default function GrowthCurvePlot({ balita, onClose, onSelectAnother, allBalita = [] }: GrowthCurvePlotProps) {
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);

  if (!balita) return null;

  // Reference points from WHO based on child's gender
  const whoCurve = getWHOGrowthCurveData(balita.jk);

  // SVG Dimension Constants
  const width = 640;
  const height = 360;
  const padding = { top: 30, right: 30, bottom: 45, left: 55 };

  // Axis ranges: Age 0 - 60 months, Height 45 - 120 cm
  const minAge = 0;
  const maxAge = 60;
  const minHeight = 45;
  const maxHeight = 120;

  const scaleX = (age: number) => {
    return padding.left + ((age - minAge) / (maxAge - minAge)) * (width - padding.left - padding.right);
  };

  const scaleY = (h: number) => {
    return height - padding.bottom - ((h - minHeight) / (maxHeight - minHeight)) * (height - padding.top - padding.bottom);
  };

  // Convert points to SVG path string
  const createPath = (points: { age: number; val: number }[]) => {
    return points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(p.age).toFixed(1)} ${scaleY(p.val).toFixed(1)}`)
      .join(' ');
  };

  const medianPath = createPath(whoCurve.map(p => ({ age: p.age, val: p.median })));
  const plus2SDPath = createPath(whoCurve.map(p => ({ age: p.age, val: p.plus2SD })));
  const minus2SDPath = createPath(whoCurve.map(p => ({ age: p.age, val: p.minus2SD })));
  const minus3SDPath = createPath(whoCurve.map(p => ({ age: p.age, val: p.minus3SD })));

  // Shaded area for Stunting Zone (< -2 SD to -3 SD)
  const stuntingZonePath = `${minus2SDPath} ` + whoCurve.slice().reverse().map(p => `L ${scaleX(p.age).toFixed(1)} ${scaleY(p.minus3SD).toFixed(1)}`).join(' ') + ' Z';

  // Sort child measurement history chronologically by date
  const historyPoints = (balita.riwayat && balita.riwayat.length > 0)
    ? [...balita.riwayat].sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime())
    : [
        {
          id: 'single',
          tanggal: balita.tanggalPengukuran,
          hariPMT: balita.hariPMT,
          tinggiBadan: balita.tinggiBadan,
          beratBadan: balita.beratBadan,
          kepatuhan: balita.kepatuhan,
          catatan: balita.catatanKesehatan,
        }
      ];

  // Calculate accurate age in months at each history point
  const childPointsWithAge = historyPoints.map((h) => {
    const estAge = calculateAgeInMonths(balita.tanggalLahir, h.tanggal);
    return {
      ...h,
      estAge,
      cx: scaleX(estAge),
      cy: scaleY(h.tinggiBadan),
    };
  });

  const activePoint = selectedPointIndex !== null 
    ? childPointsWithAge[selectedPointIndex] 
    : childPointsWithAge[childPointsWithAge.length - 1];

  // Calculate Total Gain during PMT
  const firstPoint = childPointsWithAge[0];
  const lastPoint = childPointsWithAge[childPointsWithAge.length - 1];
  const tbGain = Number((lastPoint.tinggiBadan - firstPoint.tinggiBadan).toFixed(1));
  const bbGain = Number((lastPoint.beratBadan - firstPoint.beratBadan).toFixed(2));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/65 p-4 backdrop-blur-xs">
      <div 
        id="growth-curve-modal"
        className="relative flex max-h-[92vh] w-full max-w-4xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-slate-900">{balita.namaBalita}</h2>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                  balita.statusTBU === 'Sangat Pendek'
                    ? 'bg-rose-100 text-rose-800'
                    : balita.statusTBU === 'Pendek'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  Stunting: {balita.statusTBU}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                  Status Gizi: {getStatusGiziBalita(balita)}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                NIK: {balita.nik} • {balita.jk === 'L' ? 'Laki-laki' : 'Perempuan'} • Usia: {balita.usiaBulan} Bulan • Posyandu: {balita.posyandu} • Terakhir Posyandu: {getFormattedTanggalPosyandu(balita.tanggalPengukuran).tglFormatted}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {allBalita.length > 1 && onSelectAnother && (
              <select
                aria-label="Pilih Balita Lain"
                value={balita.id}
                onChange={(e) => {
                  const found = allBalita.find(b => b.id === e.target.value);
                  if (found) onSelectAnother(found);
                }}
                className="text-xs rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-slate-700 focus:ring-1 focus:ring-emerald-500"
              >
                {allBalita.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.namaBalita} ({b.statusTBU})
                  </option>
                ))}
              </select>
            )}

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="overflow-y-auto p-6 space-y-6">
          
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <Ruler className="h-3.5 w-3.5 text-emerald-600" />
                Pertumbuhan TB
              </span>
              <p className="text-base font-bold text-slate-800 mt-0.5">
                {tbGain >= 0 ? `+${tbGain}` : tbGain} cm
              </p>
              <span className="text-[10px] text-slate-400">Selama pemantauan</span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <Scale className="h-3.5 w-3.5 text-blue-600" />
                Pertumbuhan BB
              </span>
              <p className="text-base font-bold text-slate-800 mt-0.5">
                {bbGain >= 0 ? `+${bbGain}` : bbGain} kg
              </p>
              <span className="text-[10px] text-slate-400">Target kenaikan berat</span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-indigo-600" />
                Kemajuan Program
              </span>
              <p className="text-base font-bold text-indigo-700 mt-0.5">
                Bulan ke-{Math.max(1, Math.ceil(balita.hariPMT / 30))} (Hari {balita.hariPMT})
              </p>
              <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1">
                <div 
                  className="bg-indigo-600 h-1.5 rounded-full" 
                  style={{ width: `${Math.min(100, (balita.hariPMT / balita.totalHariProgram) * 100)}%` }} 
                />
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <Award className="h-3.5 w-3.5 text-amber-600" />
                Tingkat Kepatuhan
              </span>
              <p className="text-base font-bold text-amber-800 mt-0.5">
                {balita.kepatuhan}
              </p>
              <span className="text-[10px] text-slate-400">{balita.statusIntervensi}</span>
            </div>
          </div>

          {/* SVG Growth Plot (WHO Curve TB/U) */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Plot Kurva Pertumbuhan TB/U (Tinggi Badan vs Umur Standar WHO)
                </h3>
                <p className="text-xs text-slate-500">
                  Grafik acuan Kemenkes & WHO untuk balita {balita.jk === 'L' ? 'laki-laki' : 'perempuan'}.
                </p>
              </div>

              {/* Legends */}
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-600">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-4 rounded-full bg-emerald-500 inline-block" />
                  Median (0 SD)
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-4 rounded-full bg-amber-500 inline-block" />
                  Batas Stunting (-2 SD)
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-4 rounded-full bg-rose-500 inline-block" />
                  Sangat Pendek (-3 SD)
                </span>
                <span className="flex items-center gap-1 font-semibold text-emerald-900">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-600 ring-2 ring-emerald-300 inline-block" />
                  Data Balita
                </span>
              </div>
            </div>

            {/* Interactive SVG Chart */}
            <div className="relative w-full overflow-x-auto">
              <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto max-h-[360px] font-sans">
                {/* Horizontal Gridlines */}
                {[50, 60, 70, 80, 90, 100, 110, 120].map((h) => (
                  <g key={`grid-${h}`}>
                    <line
                      x1={padding.left}
                      y1={scaleY(h)}
                      x2={width - padding.right}
                      y2={scaleY(h)}
                      stroke="#f1f5f9"
                      strokeWidth="1"
                    />
                    <text
                      x={padding.left - 8}
                      y={scaleY(h) + 4}
                      textAnchor="end"
                      fontSize="10"
                      fill="#94a3b8"
                    >
                      {h}
                    </text>
                  </g>
                ))}

                {/* Vertical Gridlines (Months) */}
                {[0, 6, 12, 18, 24, 30, 36, 42, 48, 54, 60].map((m) => (
                  <g key={`grid-m-${m}`}>
                    <line
                      x1={scaleX(m)}
                      y1={padding.top}
                      x2={scaleX(m)}
                      y2={height - padding.bottom}
                      stroke="#f1f5f9"
                      strokeWidth="1"
                    />
                    <text
                      x={scaleX(m)}
                      y={height - padding.bottom + 15}
                      textAnchor="middle"
                      fontSize="10"
                      fill="#94a3b8"
                    >
                      {m}
                    </text>
                  </g>
                ))}

                {/* Axis Labels */}
                <text
                  x={width / 2}
                  y={height - 8}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="600"
                  fill="#475569"
                >
                  Usia Anak (Bulan)
                </text>
                <text
                  x={-height / 2}
                  y={16}
                  transform="rotate(-90)"
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="600"
                  fill="#475569"
                >
                  Tinggi Badan (cm)
                </text>

                {/* Stunting Risk Filled Zone */}
                <path d={stuntingZonePath} fill="#fffbeb" opacity="0.8" />

                {/* WHO Standard Reference Curves */}
                <path d={plus2SDPath} fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4,4" />
                <path d={medianPath} fill="none" stroke="#10b981" strokeWidth="2" />
                <path d={minus2SDPath} fill="none" stroke="#f59e0b" strokeWidth="2" />
                <path d={minus3SDPath} fill="none" stroke="#f43f5e" strokeWidth="2" strokeDasharray="3,3" />

                {/* Child Growth Trajectory Line */}
                {childPointsWithAge.length > 1 && (
                  <path
                    d={childPointsWithAge.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.cx} ${p.cy}`).join(' ')}
                    fill="none"
                    stroke="#047857"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                )}

                {/* Child Plot Points */}
                {childPointsWithAge.map((p, idx) => {
                  const isSelected = activePoint === p;
                  return (
                    <g 
                      key={p.id || idx} 
                      className="cursor-pointer transition-transform"
                      onClick={() => setSelectedPointIndex(idx)}
                    >
                      <circle
                        cx={p.cx}
                        cy={p.cy}
                        r={isSelected ? "8" : "6"}
                        fill="#059669"
                        stroke="#ffffff"
                        strokeWidth={isSelected ? "3" : "2"}
                        className="transition-all hover:scale-125"
                      />
                      <text
                        x={p.cx}
                        y={p.cy - 12}
                        textAnchor="middle"
                        fontSize="10"
                        fontWeight="700"
                        fill="#065f46"
                      >
                        {p.tinggiBadan} cm
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            <p className="text-[11px] text-slate-400 mt-2 text-center">
              💡 Klik salah satu lingkaran hijau pada grafik untuk melihat rincian pengukuran pada hari tersebut.
            </p>
          </div>

          {/* Active Milestone Card */}
          {activePoint && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-emerald-200/60 pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                    {activePoint.hariPMT}
                  </span>
                  <span className="text-sm font-bold text-emerald-950">
                    Pengukuran Hari ke-{activePoint.hariPMT} ({activePoint.tanggal})
                  </span>
                </div>
                {balita.menuPMT ? (
                  <div className="text-xs font-medium text-emerald-800">
                    Menu: <span className="font-semibold text-emerald-950">{balita.menuPMT}</span>
                  </div>
                ) : null}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3 text-xs">
                <div>
                  <span className="text-slate-500">Tinggi / Panjang:</span>
                  <p className="font-bold text-slate-900 text-sm">{activePoint.tinggiBadan} cm</p>
                </div>
                <div>
                  <span className="text-slate-500">Berat Badan:</span>
                  <p className="font-bold text-slate-900 text-sm">{activePoint.beratBadan} kg</p>
                </div>
                <div>
                  <span className="text-slate-500">Kepatuhan Makan:</span>
                  <p className="font-bold text-slate-900 text-sm">{activePoint.kepatuhan}</p>
                </div>
                <div>
                  <span className="text-slate-500">Catatan Petugas:</span>
                  <p className="font-medium text-slate-700 text-xs">{activePoint.catatan || '-'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Full History Timeline Table */}
          <div>
            <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">
              Log Riwayat Pengukuran Bulanan
            </h4>
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2.5">Bulan</th>
                    <th className="px-3 py-2.5">Tanggal</th>
                    <th className="px-3 py-2.5">Tinggi (cm)</th>
                    <th className="px-3 py-2.5">Berat (kg)</th>
                    <th className="px-3 py-2.5">Kepatuhan</th>
                    <th className="px-3 py-2.5">Catatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {childPointsWithAge.map((p, idx) => (
                    <tr 
                      key={idx} 
                      onClick={() => setSelectedPointIndex(idx)}
                      className={`cursor-pointer hover:bg-slate-50 ${activePoint === p ? 'bg-emerald-50/60 font-medium' : ''}`}
                    >
                      <td className="px-3 py-2 font-semibold text-emerald-800">Bulan ke-{Math.max(1, Math.ceil(p.hariPMT / 30))} (Hari {p.hariPMT})</td>
                      <td className="px-3 py-2">{p.tanggal}</td>
                      <td className="px-3 py-2 font-mono">{p.tinggiBadan} cm</td>
                      <td className="px-3 py-2 font-mono">{p.beratBadan} kg</td>
                      <td className="px-3 py-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-700">
                          {p.kepatuhan}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-slate-500 max-w-xs truncate">{p.catatan || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-3.5 bg-slate-50">
          <span className="text-xs text-slate-500">
            Standar Rujukan: Permenkes RI No. 2 Tahun 2020 tentang Standar Antropometri Anak.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-900 transition"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
}
