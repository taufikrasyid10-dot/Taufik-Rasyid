import React, { useState } from 'react';
import { UserAccount } from '../types';
import { authenticate, DEFAULT_USERS } from '../utils/authData';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  Activity,
  ShieldCheck,
  AlertCircle,
  UserCheck,
  Sparkles,
} from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (user: UserAccount) => void;
}

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  // Form State - Login
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    setTimeout(() => {
      const result = authenticate(username, password);
      setIsLoading(false);

      if (result.success && result.user) {
        onLoginSuccess(result.user);
      } else {
        setErrorMessage(result.error || 'Nama pengguna atau kata sandi salah');
      }
    }, 250);
  };

  const handleQuickLogin = (uName: string, pWord: string) => {
    setUsername(uName);
    setPassword(pWord);
    setErrorMessage('');
    setIsLoading(true);

    setTimeout(() => {
      const result = authenticate(uName, pWord);
      setIsLoading(false);
      if (result.success && result.user) {
        onLoginSuccess(result.user);
      } else {
        setErrorMessage(result.error || 'Gagal masuk akun');
      }
    }, 200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-teal-900 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden font-sans">
      {/* Decorative Background Glows */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Card Header */}
        <div className="text-center mb-6">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-xl shadow-emerald-500/30 mb-3 border-2 border-white/20">
            <Activity className="h-8 w-8" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase drop-shadow-xs">
            POSYANDU AGLONEMA
          </h1>
          <p className="text-xs sm:text-sm text-emerald-200 mt-1 font-medium">
            Sistem Evaluasi Rekapitulasi Balita & Antropometri Posyandu
          </p>
          <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 text-xs text-emerald-200">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            Standar Kemenkes RI • Permenkes No. 2 Tahun 2020
          </div>
        </div>

        {/* Auth Main Box */}
        <div className="rounded-2xl bg-white/95 backdrop-blur-xl shadow-2xl border border-white/40 overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-50/80 p-3 text-center">
            <span className="text-xs sm:text-sm font-bold text-emerald-800">
              Masuk Akun Petugas
            </span>
          </div>

          <div className="p-6">
            {/* LOGIN FORM */}
            <form onSubmit={handleLogin} className="space-y-4">
              {errorMessage && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 flex items-start gap-2 animate-fadeIn">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Pengguna (Username)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Masukkan username petugas"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-slate-50/50 focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kata Sandi (Password)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-slate-50/50 focus:bg-white transition"
                  />
                  <button
                    type="button"
                    aria-label="Tampilkan atau sembunyikan kata sandi"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Ingat saya di perangkat ini</span>
                </label>
                <span className="text-[11px] text-emerald-700 font-medium">
                  Sistem Posyandu Aktif
                </span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-xs sm:text-sm font-bold text-white shadow-md shadow-emerald-600/30 hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition active:scale-[0.99] disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span>Memverifikasi...</span>
                ) : (
                  <>
                    <UserCheck className="h-4 w-4" />
                    <span>LOGIN</span>
                  </>
                )}
              </button>

              {/* Quick 1-Click Access for Posyandu Officers */}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center gap-1.5 mb-2.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  <span className="text-xs font-bold text-slate-700">
                    Akses Cepat Petugas (1-Klik Masuk):
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {DEFAULT_USERS.map((usr) => (
                    <button
                      key={usr.id}
                      type="button"
                      onClick={() => handleQuickLogin(usr.username, usr.password)}
                      className="rounded-xl border border-slate-200 bg-slate-50/70 p-2 text-left hover:bg-emerald-50 hover:border-emerald-300 transition group"
                    >
                      <div className="font-semibold text-slate-800 text-[11px] group-hover:text-emerald-700 truncate">
                        {usr.role === 'Bidan Desa' && '🩺 '}
                        {usr.role === 'Kader Posyandu' && '🤝 '}
                        {usr.role === 'Petugas Gizi' && '🥗 '}
                        {usr.role === 'Admin KPM' && '🛡️ '}
                        {usr.role}
                      </div>
                      <div className="text-[10px] text-slate-400 group-hover:text-slate-600 truncate">
                        User: <span className="font-mono">{usr.username}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-emerald-200/80 mt-6">
          Pencatatan Antropometri Balita Stunting • Posyandu Kajulangko • Puskesmas Ampana Tete
        </p>
      </div>
    </div>
  );
}
