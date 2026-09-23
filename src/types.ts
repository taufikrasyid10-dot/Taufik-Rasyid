export type JenisKelamin = 'L' | 'P';

export type StatusTBU = 'Sangat Pendek' | 'Pendek' | 'Normal' | 'Tinggi';
export type StatusBBU = 'Sangat Kurang' | 'Kurang' | 'Normal' | 'Risiko Lebih';
export type StatusBBTB = 'Gizi Buruk' | 'Gizi Kurang' | 'Gizi Baik' | 'Berisiko Lebih' | 'Gizi Lebih' | 'Obesitas';
export type TingkatKepatuhan = 'Habis' | '3/4 Porsi' | '1/2 Porsi' | '< 1/2 Porsi' | 'Tidak Dikonsumsi';
export type StatusIntervensi = 'Perlu Tindak Lanjut' | 'Membaik' | 'Sesuai Target' | 'Kritis';

export interface RiwayatPengukuran {
  id: string;
  tanggal: string;
  hariPMT: number;
  beratBadan: number; // kg
  tinggiBadan: number; // cm
  kepatuhan: TingkatKepatuhan;
  catatan?: string;
}

export interface BalitaPMT {
  id: string;
  nik: string;
  namaBalita: string;
  namaIbu: string;
  jk: JenisKelamin;
  tanggalLahir: string; // YYYY-MM-DD
  usiaBulan: number;
  posyandu: string;
  desa: string;
  puskesmas: string;
  tanggalPengukuran: string;
  beratBadan: number; // kg
  tinggiBadan: number; // cm (panjang badan jika <2 tahun)
  lingkarLengan?: number; // cm (LiLA)
  lingkarKepala?: number; // cm
  hariPMT: number; // e.g. 1 - 90
  totalHariProgram: number; // e.g. 90 hari
  menuPMT: string;
  kepatuhan: TingkatKepatuhan;
  statusTBU: StatusTBU;
  statusBBU: StatusBBU;
  statusBBTB: StatusBBTB;
  zScoreTBU: number;
  zScoreBBU: number;
  zScoreBBTB: number;
  statusIntervensi: StatusIntervensi;
  catatanKesehatan: string;
  riwayat: RiwayatPengukuran[];
}

export interface UploadRowValidation {
  rowIndex: number;
  isValid: boolean;
  errors: string[];
  warnings: string[];
  data: Partial<BalitaPMT>;
}

export interface UploadSummary {
  fileName: string;
  fileSize: number;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  data: BalitaPMT[];
  validationList: UploadRowValidation[];
}

export type UserRole = 'Bidan Desa' | 'Kader Posyandu' | 'Petugas Gizi' | 'Admin KPM';

export interface UserAccount {
  id: string;
  username: string;
  namaLengkap: string;
  role: UserRole;
  posyandu: string;
  desa: string;
  puskesmas: string;
}
