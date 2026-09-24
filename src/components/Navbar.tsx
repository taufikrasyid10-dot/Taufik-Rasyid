import { useState, useRef, useEffect } from 'react';
import {
  Activity,
  ShieldCheck,
  ChevronDown,
  LogOut,
  Settings,
  User,
  KeyRound,
} from 'lucide-react';
import { UserAccount } from '../types';

interface NavbarProps {
  currentUser?: UserAccount | null;
  onLogout?: () => void;
  onOpenSettings?: (tab: 'pengaturan' | 'ubah_profil' | 'password') => void;
}

export default function Navbar({
  currentUser,
  onLogout,
  onOpenSettings,
}: NavbarProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md print:hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Logo & Identity */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-600/20">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm sm:text-base font-bold tracking-tight text-slate-900">
                  DAFTAR ANAK BERDASARKAN STATUS GIZI
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="h-3 w-3" /> Standar Kemenkes RI
                </span>
              </div>
            </div>
          </div>

          {/* User Account Menu (AD / Petugas) */}
          <div className="flex items-center gap-2">
            {currentUser && (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  id="btn-user-menu"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 rounded-xl p-1 sm:px-2.5 sm:py-1.5 hover:bg-slate-100 border border-slate-200/80 bg-white shadow-xs transition group text-left"
                  title="Buka menu akun & pengaturan"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-2xs group-hover:scale-105 transition">
                    {currentUser.role === 'Bidan Desa' ? 'BD' : currentUser.role === 'Kader Posyandu' ? 'KP' : currentUser.role === 'Petugas Gizi' ? 'GZ' : 'AD'}
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[140px]" title={currentUser.namaLengkap}>
                      {currentUser.namaLengkap}
                    </div>
                    <div className="text-[10px] text-emerald-700 font-semibold leading-tight flex items-center gap-1">
                      <span>{currentUser.role}</span>
                      <ChevronDown className="h-3 w-3 text-slate-400 group-hover:text-slate-600 transition" />
                    </div>
                  </div>
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white p-2 shadow-2xl border border-slate-200 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* User Card Header */}
                    <div className="rounded-xl bg-gradient-to-br from-slate-900 to-emerald-950 p-3 text-white mb-2 shadow-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-400/30">
                          {currentUser.role === 'Bidan Desa' ? 'BD' : currentUser.role === 'Kader Posyandu' ? 'KP' : currentUser.role === 'Petugas Gizi' ? 'GZ' : 'AD'}
                        </div>
                        <div className="overflow-hidden">
                          <div className="text-xs font-bold text-white truncate" title={currentUser.namaLengkap}>
                            {currentUser.namaLengkap}
                          </div>
                          <div className="text-[10px] text-emerald-300 font-mono">
                            @{currentUser.username} • {currentUser.role}
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-white/10 text-[10px] text-slate-300 truncate">
                        📍 {currentUser.posyandu}
                      </div>
                    </div>

                    {/* Menu Actions: Pengaturan, Ubah Profil, Ubah Password */}
                    <div className="space-y-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onOpenSettings?.('pengaturan');
                        }}
                        className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition text-left group"
                      >
                        <Settings className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 transition" />
                        <div>
                          <span className="block font-bold">Pengaturan</span>
                          <span className="block text-[10px] text-slate-400 group-hover:text-slate-500 font-normal">
                            Posyandu, desa & puskesmas
                          </span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onOpenSettings?.('ubah_profil');
                        }}
                        className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition text-left group"
                      >
                        <User className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 transition" />
                        <div>
                          <span className="block font-bold">Ubah Profil</span>
                          <span className="block text-[10px] text-slate-400 group-hover:text-slate-500 font-normal">
                            Nama lengkap & jabatan
                          </span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onOpenSettings?.('password');
                        }}
                        className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition text-left group"
                      >
                        <KeyRound className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 transition" />
                        <div>
                          <span className="block font-bold">Ubah Password</span>
                          <span className="block text-[10px] text-slate-400 group-hover:text-slate-500 font-normal">
                            Ganti kata sandi akun
                          </span>
                        </div>
                      </button>
                    </div>

                    {/* Divider & Logout */}
                    <div className="mt-2 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onLogout?.();
                        }}
                        className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 hover:text-rose-800 transition text-left group"
                      >
                        <LogOut className="h-4 w-4 text-rose-500 group-hover:text-rose-700 transition" />
                        <span>Keluar dari Sistem</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
