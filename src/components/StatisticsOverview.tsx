import React from 'react';
import { BalitaPMT } from '../types';
import { Users, AlertOctagon, CheckCircle, Award, TrendingUp, HeartHandshake } from 'lucide-react';

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

  // Kepatuhan
  const kepatuhanHabis = data.filter(d => d.kepatuhan === 'Habis').length;
  const kepatuhanPersen = total > 0 ? ((kepatuhanHabis / total) * 100).toFixed(1) : '0';

  // Intervensi membaik / sesuai target
  const membaik = data.filter(d => d.statusIntervensi === 'Membaik' || d.statusIntervensi === 'Sesuai Target').length;
  const perluTindakLanjut = data.filter(d => d.statusIntervensi === 'Perlu Tindak Lanjut' || d.statusIntervensi === 'Kritis').length;

  // Posyandu breakdown
  const posyanduList = Array.from(new Set(data.map(d => d.posyandu))).filter(Boolean);

  return (
    <div className="space-y-4">
      {/* 4 Core Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Sasaran */}
        <div 
          onClick={() => onSelectStatus('Semua')}
          className={`cursor-pointer rounded-2xl border p-4 shadow-xs transition ${
            selectedStatus === 'Semua' ? 'border-slate-400 bg-white ring-2 ring-slate-400/20' : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Balita PMT</span>
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

        {/* Card 2: Balita Stunting */}
        <div 
          onClick={() => onSelectStatus('Stunting')}
          className={`cursor-pointer rounded-2xl border p-4 shadow-xs transition ${
            selectedStatus === 'Stunting' ? 'border-rose-400 bg-rose-50/40 ring-2 ring-rose-400/20' : 'border-rose-200 bg-rose-50/20 hover:border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-800 uppercase tracking-wider">Kasus Stunting (TB/U &lt; -2 SD)</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 text-rose-700">
              <AlertOctagon className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-600">{totalStunting}</span>
            <span className="text-xs font-semibold text-rose-700">({stuntingPercentage}%)</span>
          </div>
          <div className="mt-1 flex items-center gap-2 text-[11px] text-rose-700/80">
            <span>Sangat Pendek: {sangatPendek}</span>
            <span>•</span>
            <span>Pendek: {pendek}</span>
          </div>
        </div>

        {/* Card 3: Status Gizi Normal / Sesuai Target */}
        <div 
          onClick={() => onSelectStatus('Normal')}
          className={`cursor-pointer rounded-2xl border p-4 shadow-xs transition ${
            selectedStatus === 'Normal' ? 'border-emerald-400 bg-emerald-50/40 ring-2 ring-emerald-400/20' : 'border-emerald-200 bg-emerald-50/20 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Tinggi Normal / Lulus</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <CheckCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-700">{normal}</span>
            <span className="text-xs font-semibold text-emerald-800">({normalPercentage}%)</span>
          </div>
          <p className="mt-1 text-[11px] text-emerald-700/80">
            {tinggi > 0 ? `Termasuk ${tinggi} kategori tinggi (>+3 SD)` : 'Sesuai dengan kurva pertumbuhan'}
          </p>
        </div>

        {/* Card 4: Kepatuhan Konsumsi PMT */}
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/20 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-900 uppercase tracking-wider">Kepatuhan Makan 100%</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-indigo-950">{kepatuhanHabis}</span>
            <span className="text-xs font-semibold text-indigo-800">({kepatuhanPersen}% Porsi Habis)</span>
          </div>
          <p className="mt-1 text-[11px] text-indigo-800/80">
            {membaik} balita menunjukkan progres membaik
          </p>
        </div>

      </div>

      {/* Distribution Bars & Posyandu Filter Chips */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-3 mb-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Proporsi Status Stunting & Distribusi Wilayah
            </h3>
            <p className="text-xs text-slate-500">
              Distribusi status TB/U balita intervensi PMT berdasarkan standar WHO
            </p>
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
