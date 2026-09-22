import React from 'react';
import { BalitaPMT } from '../types';
import { Users, AlertOctagon, CheckCircle, ShieldCheck } from 'lucide-react';

interface StatisticsOverviewProps {
  data: BalitaPMT[];
  selectedPosyandu: string;
  onSelectPosyandu: (posyandu: string) => void;
  selectedStatus: string;
  onSelectStatus: (status: string) => void;
}

export default function StatisticsOverview({
  data,
  selectedPosyandu,
  onSelectPosyandu,
  selectedStatus,
  onSelectStatus,
}: StatisticsOverviewProps) {
  const total = data.length;
  
  // Categorizations
  const sangatPendek = data.filter(d => d.statusTBU === 'Sangat Pendek').length;
  const pendek = data.filter(d => d.statusTBU === 'Pendek').length;
  const totalStunting = sangatPendek + pendek;
  const normal = data.filter(d => d.statusTBU === 'Normal').length;
  const tinggi = data.filter(d => d.statusTBU === 'Tinggi').length;

  const stuntingPercentage = total > 0 ? ((totalStunting / total) * 100).toFixed(1) : '0';
  const normalPercentage = total > 0 ? ((normal / total) * 100).toFixed(1) : '0';

  // Posyandu breakdown
  const posyanduList = Array.from(new Set(data.map(d => d.posyandu))).filter(Boolean);

  return (
    <div className="space-y-4">
      {/* Core Summary Cards - Sejajar 3 Kolom */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-stretch">
        
        {/* Card 1: Total Balita */}
        <div 
          onClick={() => onSelectStatus('Semua')}
          className={`cursor-pointer rounded-2xl border p-4 shadow-xs transition flex flex-col justify-between h-full ${
            selectedStatus === 'Semua' ? 'border-slate-400 bg-white ring-2 ring-slate-400/20' : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Balita</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{total}</span>
            <span className="text-xs text-slate-500">anak terdata</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Tersebar di {posyanduList.length} Posyandu / Desa
          </p>
        </div>

        {/* Card 2: Kasus Stunting */}
        <div 
          onClick={() => onSelectStatus('Stunting')}
          className={`cursor-pointer rounded-2xl border p-4 shadow-xs transition flex flex-col justify-between h-full ${
            selectedStatus === 'Stunting' ? 'border-rose-400 bg-rose-50/40 ring-2 ring-rose-400/20' : 'border-rose-200 bg-rose-50/20 hover:border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-800 uppercase tracking-wider">Kasus Stunting</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 text-rose-700">
              <AlertOctagon className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-600">{totalStunting}</span>
            <span className="text-xs font-semibold text-rose-700">({stuntingPercentage}%)</span>
          </div>
          <p className="mt-1 text-[11px] text-rose-700/80">
            TB/U &lt; -2 SD Standar WHO
          </p>
        </div>

        {/* Card 3: Sasaran Stunting */}
        <div 
          onClick={() => onSelectStatus(selectedStatus === 'Sangat Pendek' ? 'Pendek' : 'Sangat Pendek')}
          className={`cursor-pointer rounded-2xl border p-4 shadow-xs transition flex flex-col justify-between h-full ${
            selectedStatus === 'Sangat Pendek' || selectedStatus === 'Pendek'
              ? 'border-amber-400 bg-amber-50/40 ring-2 ring-amber-400/20' 
              : 'border-amber-200 bg-amber-50/20 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-900 uppercase tracking-wider">Sasaran Stunting</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-900">{totalStunting}</span>
            <span className="text-xs font-semibold text-amber-800">Sasaran Prioritas</span>
          </div>
          <div className="mt-1 flex items-center gap-2 text-[11px] text-amber-800/80">
            <span>Sangat Pendek: {sangatPendek}</span>
            <span>•</span>
            <span>Pendek: {pendek}</span>
          </div>
        </div>

      </div>

      {/* Distribution Bars & Posyandu Filter Chips */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-3 mb-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Proporsi Status Stunting & Distribusi Wilayah
            </h3>
          </div>

          {/* Quick Posyandu Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 text-[11px] whitespace-nowrap">Filter Posyandu:</span>
            <button
              type="button"
              onClick={() => onSelectPosyandu('Semua')}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium whitespace-nowrap transition ${
                selectedPosyandu === 'Semua'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Semua Posyandu
            </button>
            {posyanduList.map(pos => (
              <button
                key={pos}
                type="button"
                onClick={() => onSelectPosyandu(pos)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium whitespace-nowrap transition ${
                  selectedPosyandu === pos
                    ? 'bg-emerald-700 text-white font-semibold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {pos}
              </button>
            ))}
          </div>
        </div>

        {/* Stacked Proportional Bar */}
        <div className="space-y-2">
          <div className="flex h-3.5 w-full overflow-hidden rounded-full bg-slate-100">
            {sangatPendek > 0 && (
              <div
                style={{ width: `${(sangatPendek / (total || 1)) * 100}%` }}
                className="bg-rose-500 transition-all"
                title={`Sangat Pendek: ${sangatPendek} balita`}
              />
            )}
            {pendek > 0 && (
              <div
                style={{ width: `${(pendek / (total || 1)) * 100}%` }}
                className="bg-amber-400 transition-all"
                title={`Pendek: ${pendek} balita`}
              />
            )}
            {normal > 0 && (
              <div
                style={{ width: `${(normal / (total || 1)) * 100}%` }}
                className="bg-emerald-500 transition-all"
                title={`Normal: ${normal} balita`}
              />
            )}
            {tinggi > 0 && (
              <div
                style={{ width: `${(tinggi / (total || 1)) * 100}%` }}
                className="bg-blue-400 transition-all"
                title={`Tinggi: ${tinggi} balita`}
              />
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
              <span className="text-slate-600">Sangat Pendek: <strong className="text-slate-900">{sangatPendek}</strong> ({total > 0 ? ((sangatPendek / total) * 100).toFixed(0) : 0}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <span className="text-slate-600">Pendek (Stunted): <strong className="text-slate-900">{pendek}</strong> ({total > 0 ? ((pendek / total) * 100).toFixed(0) : 0}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span className="text-slate-600">Tinggi Normal: <strong className="text-slate-900">{normal}</strong> ({total > 0 ? ((normal / total) * 100).toFixed(0) : 0}%)</span>
            </div>
            {tinggi > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-400" />
                <span className="text-slate-600">Tinggi: <strong className="text-slate-900">{tinggi}</strong></span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
