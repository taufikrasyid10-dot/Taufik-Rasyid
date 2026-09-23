import React, { useState } from 'react';
import { UserAccount, UserRole } from '../types';
import { authenticate, saveUser, DEFAULT_USERS } from '../utils/authData';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  Activity,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  UserCheck,
  Building,
  HeartPulse,
  Sparkles,
} from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (user: UserAccount) => void;
}

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Form State - Login
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Form State - Register
  const [regNama, setRegNama] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('Kader Posyandu');
  const [regPosyandu, setRegPosyandu] = useState('Posyandu Kajulangko');
  const [regDesa, setRegDesa] = useState('Desa Kajulangko');
  const [regPuskesmas, setRegPuskesmas] = useState('Puskesmas Ampana Tete');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regError, setRegError] = useState('');

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

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regNama.trim()) {
      setRegError('Nama lengkap petugas wajib diisi');
      return;
    }
    if (!regUsername.trim()) {
      setRegError('Username wajib diisi');
      return;
    }
    if (regPassword.length < 3) {
      setRegError('Kata sandi minimal 3 karakter');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setRegError('Konfirmasi kata sandi tidak cocok');
      return;
    }

    const newUser = {
      id: `user-${Date.now()}`,
      username: regUsername.trim().toLowerCase(),
      password: regPassword.trim(),
      namaLengkap: regNama.trim(),
      role: regRole,
      posyandu: regPosyandu.trim() || 'Posyandu Kajulangko',
      desa: regDesa.trim() || 'Desa Kajulangko',
      puskesmas: regPuskesmas.trim() || 'Puskesmas Ampana Tete',
    };

    const saved = saveUser(newUser);
    if (saved) {
      onLoginSuccess({
        id: newUser.id,
        username: newUser.username,
        namaLengkap: newUser.namaLengkap,
        role: newUser.role,
        posyandu: newUser.posyandu,
        desa: newUser.desa,
        puskesmas: newUser.puskesmas,
      });
    } else {
      setRegError('Gagal mendaftarkan akun baru.');
    }
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
            Daftar Anak Berdasarkan Status Gizi
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
          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 border-b border-slate-100 bg-slate-50/80 p-1">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage('');
              }}
              className={`py-2.5 text-xs sm:text-sm font-bold rounded-xl transition ${
                mode === 'login'
                  ? 'bg-white text-emerald-800 shadow-xs border border-emerald-100'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Masuk Akun Petugas
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setRegError('');
              }}
              className={`py-2.5 text-xs sm:text-sm font-bold rounded-xl transition ${
                mode === 'register'
                  ? 'bg-white text-emerald-800 shadow-xs border border-emerald-100'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Daftar Petugas Baru
            </button>
          </div>

          <div className="p-6">
            {mode === 'login' ? (
              /* LOGIN FORM */
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
                      <span>Masuk ke Sistem Data Balita</span>
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
            ) : (
              /* REGISTRATION FORM */
              <form onSubmit={handleRegister} className="space-y-3.5">
                {regError && (
                  <div className="rounded-xl bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-700 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                    <span>{regError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Lengkap & Gelar *
                  </label>
                  <input
                    type="text"
                    required
                    value={regNama}
                    onChange={(e) => setRegNama(e.target.value)}
                    placeholder="Contoh: Bd. Siti Rahmawati, A.Md.Keb"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Username *
                    </label>
                    <input
                      type="text"
                      required
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      placeholder="sitibidan"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Peran / Jabatan *
                    </label>
                    <select
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value as UserRole)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="Bidan Desa">Bidan Desa</option>
                      <option value="Kader Posyandu">Kader Posyandu</option>
                      <option value="Petugas Gizi">Petugas Gizi Puskesmas</option>
                      <option value="Admin KPM">Admin KPM</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nama Posyandu
                    </label>
                    <input
                      type="text"
                      value={regPosyandu}
                      onChange={(e) => setRegPosyandu(e.target.value)}
                      placeholder="Posyandu Kajulangko"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Desa / Kelurahan
                    </label>
                    <input
                      type="text"
                      value={regDesa}
                      onChange={(e) => setRegDesa(e.target.value)}
                      placeholder="Desa Kajulangko"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Kata Sandi *
                    </label>
                    <input
                      type="password"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Minimal 3 karakter"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Konfirmasi Sandi *
                    </label>
                    <input
                      type="password"
                      required
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="Ulangi kata sandi"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-emerald-600/30 hover:from-emerald-700 hover:to-teal-700 transition"
                >
                  Daftarkan & Langsung Masuk
                </button>
              </form>
            )}
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
