import { UserAccount, UserRole } from '../types';

export interface AuthCredential extends UserAccount {
  password: string;
}

const STORAGE_USERS_KEY = 'pmt_app_registered_users_v1';
const STORAGE_CURRENT_USER_KEY = 'pmt_app_current_user_v1';

export const DEFAULT_USERS: AuthCredential[] = [
  {
    id: 'user-bidan',
    username: 'bidandesa',
    password: '123',
    namaLengkap: 'Bidan Desa Kajulangko',
    role: 'Bidan Desa',
    posyandu: 'Posyandu Kajulangko',
    desa: 'Desa Kajulangko',
    puskesmas: 'Puskesmas Ampana Tete',
  },
  {
    id: 'user-kader',
    username: 'kader',
    password: '123',
    namaLengkap: 'Kader Posyandu Kajulangko',
    role: 'Kader Posyandu',
    posyandu: 'Posyandu Kajulangko',
    desa: 'Desa Kajulangko',
    puskesmas: 'Puskesmas Ampana Tete',
  },
  {
    id: 'user-gizi',
    username: 'petugasgizi',
    password: '123',
    namaLengkap: 'Petugas Gizi Puskesmas',
    role: 'Petugas Gizi',
    posyandu: 'Semua Posyandu',
    desa: 'Kec. Ampana Tete',
    puskesmas: 'Puskesmas Ampana Tete',
  },
  {
    id: 'user-admin',
    username: 'admin',
    password: '123',
    namaLengkap: 'KPM Kajulangko',
    role: 'Admin KPM',
    posyandu: 'Posyandu Kajulangko',
    desa: 'Desa Kajulangko',
    puskesmas: 'Puskesmas Ampana Tete',
  },
];

export function getStoredUsers(): AuthCredential[] {
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load registered users:', err);
  }
  // Initialize with defaults if empty
  try {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(DEFAULT_USERS));
  } catch {
    // ignore
  }
  return DEFAULT_USERS;
}

export function saveUser(user: AuthCredential): boolean {
  try {
    const users = getStoredUsers();
    const existingIndex = users.findIndex(
      (u) => u.username.toLowerCase() === user.username.toLowerCase()
    );
    if (existingIndex >= 0) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
    return true;
  } catch (err) {
    console.error('Failed to save user:', err);
    return false;
  }
}

export function authenticate(
  username: string,
  pass: string
): { success: boolean; user?: UserAccount; error?: string } {
  const cleanUser = username.trim().toLowerCase();
  const cleanPass = pass.trim();

  if (!cleanUser || !cleanPass) {
    return { success: false, error: 'Username dan kata sandi wajib diisi' };
  }

  const users = getStoredUsers();
  const matched = users.find(
    (u) => u.username.toLowerCase() === cleanUser && u.password === cleanPass
  );

  if (matched) {
    const { password: _, ...userSafe } = matched;
    return { success: true, user: userSafe };
  }

  return { success: false, error: 'Nama pengguna (username) atau kata sandi tidak sesuai' };
}

export function getCurrentUser(): UserAccount | null {
  try {
    const raw = localStorage.getItem(STORAGE_CURRENT_USER_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to load current user:', err);
  }
  return null;
}

export function setCurrentUser(user: UserAccount | null) {
  try {
    if (user) {
      localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
    }
  } catch (err) {
    console.error('Failed to set current user:', err);
  }
}

export function updateUserProfile(
  userId: string,
  updates: Partial<Omit<UserAccount, 'id' | 'username'>>
): { success: boolean; user?: UserAccount; error?: string } {
  try {
    const users = getStoredUsers();
    const index = users.findIndex((u) => u.id === userId);
    if (index === -1) {
      return { success: false, error: 'Pengguna tidak ditemukan' };
    }
    const updatedUser = {
      ...users[index],
      ...updates,
    };
    users[index] = updatedUser;
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));

    const { password: _, ...userSafe } = updatedUser;
    setCurrentUser(userSafe);
    return { success: true, user: userSafe };
  } catch (err) {
    return { success: false, error: 'Gagal memperbarui profil pengguna' };
  }
}

export function changeUserPassword(
  userId: string,
  oldPass: string,
  newPass: string
): { success: boolean; error?: string } {
  try {
    const users = getStoredUsers();
    const index = users.findIndex((u) => u.id === userId);
    if (index === -1) {
      return { success: false, error: 'Pengguna tidak ditemukan' };
    }

    if (users[index].password !== oldPass.trim()) {
      return { success: false, error: 'Kata sandi lama tidak sesuai' };
    }

    if (!newPass || newPass.trim().length < 3) {
      return { success: false, error: 'Kata sandi baru minimal 3 karakter' };
    }

    users[index].password = newPass.trim();
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
    return { success: true };
  } catch (err) {
    return { success: false, error: 'Gagal mengganti kata sandi' };
  }
}

