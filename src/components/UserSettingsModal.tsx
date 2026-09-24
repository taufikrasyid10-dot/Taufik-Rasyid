import React, { useState, useEffect } from 'react';
import { UserAccount, UserRole } from '../types';
import { updateUserProfile, changeUserPassword } from '../utils/authData';
import {
  X,
  Settings,
  User,
  KeyRound,
  ShieldCheck,
  Building,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  LogOut,
  Save,
} from 'lucide-react';

interface UserSettingsModalProps {
  isOpen: boolean;
  initialTab?: 'pengaturan' | 'ubah_profil' | 'password';
  currentUser: UserAccount;
  onClose: () => void;
  onUpdateUser: (updatedUser: UserAccount) => void;
  onLogout: () => void;
}

export default function UserSettingsModal({
  isOpen,
  initialTab = 'pengaturan',
  currentUser,
  onClose,
  onUpdateUser,
  onLogout,
}: UserSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'pengaturan' | 'ubah_profil' | 'password'>(initialTab);

  // Profile / Settings Form State
  const [namaLengkap, setNamaLengkap] = useState(currentUser.namaLengkap);
  const [role, setRole] = useState<UserRole>(currentUser.role);
  const [posyandu, setPosyandu] = useState(currentUser.posyandu);
  const [desa, setDesa] = useState(currentUser.desa);
  const [puskesmas, setPuskesmas] = useState(currentUser.puskesmas);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [profileErrorMsg, setProfileErrorMsg] = useState('');

  // Password Form State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passSuccessMsg, setPassSuccessMsg] = useState('');
  const [passErrorMsg, setPassErrorMsg] = useState('');
  const [isSubmittingPass, setIsSubmittingPass] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setNamaLengkap(currentUser.namaLengkap);
      setRole(currentUser.role);
      setPosyandu(currentUser.posyandu);
      setDesa(currentUser.desa);
      setPuskesmas(currentUser.puskesmas);
      setProfileSuccessMsg('');
      setProfileErrorMsg('');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPassSuccessMsg('');
      setPassErrorMsg('');
    }
  }, [isOpen, initialTab, currentUser]);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccessMsg('');
    setProfileErrorMsg('');

    if (!namaLengkap.trim()) {
      setProfileErrorMsg('Nama lengkap tidak boleh kosong');
      return;
    }

    const res = updateUserProfile(currentUser.id, {
      namaLengkap: namaLengkap.trim(),
      role,
      posyandu: posyandu.trim() || 'Posyandu Kajulangko',
      desa: desa.trim() || 'Desa Kajulangko',
      puskesmas: puskesmas.trim() || 'Puskesmas Ampana Tete',
    });

    if (res.success && res.user) {
      onUpdateUser(res.user);
      setProfileSuccessMsg('Perubahan informasi akun berhasil disimpan!');
      setTimeout(() => setProfileSuccessMsg(''), 3000);
    } else {
      setProfileErrorMsg(res.error || 'Gagal menyimpan perubahan');
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPassSuccessMsg('');
    setPassErrorMsg('');

    if (!oldPassword) {
      setPassErrorMsg('Kata sandi saat ini wajib diisi');
      return;
    }
    if (!newPassword || newPassword.length < 3) {
      setPassErrorMsg('Kata sandi baru minimal 3 karakter');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassErrorMsg('Konfirmasi kata sandi baru tidak sesuai');
      return;
    }

    setIsSubmittingPass(true);
    setTimeout(() => {
      const res = changeUserPassword(currentUser.id, oldPassword, newPassword);
      setIsSubmittingPass(false);

      if (res.success) {
        setPassSuccessMsg('Kata sandi berhasil diperbarui! Gunakan sandi baru untuk login berikutnya.');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPassErrorMsg(res.error || 'Gagal mengubah kata sandi');
      }
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white font-bold text-sm shadow-xs">
              {currentUser.role === 'Bidan Desa' ? 'BD' : currentUser.role === 'Kader Posyandu' ? 'KP' : currentUser.role === 'Petugas Gizi' ? 'GZ' : 'AD'}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Menu Akun Petugas ({currentUser.role === 'Admin KPM' ? 'AD' : currentUser.role})
              </h2>
              <p className="text-xs text-slate-500">
                {currentUser.namaLengkap} • @{currentUser.username}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-slate-200 bg-slate-100/60 p-1">
          <button
            type="button"
            onClick={() => setActiveTab('pengaturan')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-xl transition ${
              activeTab === 'pengaturan'
                ? 'bg-white text-emerald-800 shadow-xs border border-emerald-100'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Settings className="h-3.5 w-3.5" />
            <span>Pengaturan</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ubah_profil')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-xl transition ${
              activeTab === 'ubah_profil'
                ? 'bg-white text-emerald-800 shadow-xs border border-emerald-100'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="h-3.5 w-3.5" />
            <span>Ubah Profil</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('password')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-xl transition ${
              activeTab === 'password'
                ? 'bg-white text-emerald-800 shadow-xs border border-emerald-100'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <KeyRound className="h-3.5 w-3.5" />
            <span>Ubah Password</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* TAB 1: PENGATURAN (Posyandu, Desa, Wilayah Kerja & Default) */}
          {activeTab === 'pengaturan' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="rounded-xl bg-emerald-50/70 border border-emerald-200/80 p-3 text-xs text-emerald-800 flex items-start gap-2.5">
                <Settings className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                <div>
                  <div className="font-bold">Pengaturan Instansi & Wilayah Kerja</div>
                  <div className="text-[11px] text-emerald-700 mt-0.5">
                    Konfigurasi wilayah kerja posyandu, desa, dan puskesmas yang dicantumkan pada kop cetak laporan dan tabel evaluasi.
                  </div>
                </div>
              </div>

              {profileSuccessMsg && (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>{profileSuccessMsg}</span>
                </div>
              )}
              {profileErrorMsg && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-800 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                  <span>{profileErrorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Posyandu *
                </label>
                <input
                  type="text"
                  required
                  value={posyandu}
                  onChange={(e) => setPosyandu(e.target.value)}
                  placeholder="Posyandu Kajulangko"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Desa / Kelurahan *
                  </label>
                  <input
                    type="text"
                    required
                    value={desa}
                    onChange={(e) => setDesa(e.target.value)}
                    placeholder="Desa Kajulangko"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Puskesmas Pembina *
                  </label>
                  <input
                    type="text"
                    required
                    value={puskesmas}
                    onChange={(e) => setPuskesmas(e.target.value)}
                    placeholder="Puskesmas Ampana Tete"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-xs"
                >
                  <Save className="h-3.5 w-3.5" />
                  Simpan Pengaturan
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: UBAH PROFIL (Nama Lengkap, Jabatan, Username) */}
          {activeTab === 'ubah_profil' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs text-slate-700 flex items-start gap-2.5">
                <User className="h-4 w-4 shrink-0 text-slate-500 mt-0.5" />
                <div>
                  <div className="font-bold">Ubah Informasi Profil Petugas</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Perbarui nama lengkap dan jabatan yang bertugas mengelola sistem antropometri balita.
                  </div>
                </div>
              </div>

              {profileSuccessMsg && (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>{profileSuccessMsg}</span>
                </div>
              )}
              {profileErrorMsg && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-800 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                  <span>{profileErrorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Pengguna (Username)
                </label>
                <input
                  type="text"
                  disabled
                  value={currentUser.username}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-100 text-xs text-slate-500 font-mono cursor-not-allowed"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Username bersifat unik dan tidak dapat diubah.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Lengkap Petugas *
                </label>
                <input
                  type="text"
                  required
                  value={namaLengkap}
                  onChange={(e) => setNamaLengkap(e.target.value)}
                  placeholder="Contoh: KPM Kajulangko"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Peran / Jabatan Petugas *
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="Admin KPM">Admin KPM (AD)</option>
                  <option value="Bidan Desa">Bidan Desa (BD)</option>
                  <option value="Kader Posyandu">Kader Posyandu (KP)</option>
                  <option value="Petugas Gizi">Petugas Gizi (GZ)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-xs"
                >
                  <Save className="h-3.5 w-3.5" />
                  Simpan Profil
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: UBAH PASSWORD */}
          {activeTab === 'password' && (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800 flex items-start gap-2.5">
                <KeyRound className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                <div>
                  <div className="font-bold">Keamanan Kata Sandi (Password)</div>
                  <div className="text-[11px] text-amber-700 mt-0.5">
                    Gunakan kombinasi kata sandi yang mudah Anda ingat namun aman untuk melindungi data rekapitulasi balita.
                  </div>
                </div>
              </div>

              {passSuccessMsg && (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>{passSuccessMsg}</span>
                </div>
              )}
              {passErrorMsg && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-800 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                  <span>{passErrorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kata Sandi Saat Ini *
                </label>
                <div className="relative">
                  <input
                    type={showOldPass ? 'text' : 'password'}
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Masukkan sandi saat ini"
                    className="w-full pl-3 pr-9 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPass(!showOldPass)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showOldPass ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kata Sandi Baru *
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 3 karakter"
                    className="w-full pl-3 pr-9 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showNewPass ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ulangi Kata Sandi Baru *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Konfirmasi sandi baru"
                    className="w-full pl-3 pr-9 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPass ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPass}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-xs disabled:opacity-50"
                >
                  <KeyRound className="h-3.5 w-3.5" />
                  {isSubmittingPass ? 'Menyimpan...' : 'Perbarui Kata Sandi'}
                </button>
              </div>
            </form>
          )}

          {/* Sesi Keluar di bagian bawah modal */}
          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Ingin beralih akun atau mengakhiri sesi?</span>
            <button
              type="button"
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="inline-flex items-center gap-1.5 text-rose-600 font-bold hover:text-rose-800 transition py-1 px-2 rounded-lg hover:bg-rose-50"
            >
              <LogOut className="h-3.5 w-3.5" />
              Keluar Akun
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
