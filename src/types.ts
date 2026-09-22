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

export interface BalitaKegiatanEntry {
  id: string;
  namaBalita: string;
  nik?: string;
  fotoKegiatanUrl: string;
  keterangan?: string;
  geotagLocation?: string;
  geotagDetail?: string;
  geotagCoord?: string;
  geotagTime?: string;
}

export interface DokumentasiKegiatanHari {
  id: string;
  tanggal: string; // e.g. "01-08-2026"
  namaMenu: string; // e.g. "MENU NASI GORENG CERIA"
  fotoMenuUrl: string;
  geotagLocation?: string;
  geotagDetail?: string;
  geotagCoord?: string;
  geotagTime?: string;
  balitaList: BalitaKegiatanEntry[];
}

export interface DokumentasiBelanjaItem {
  id: string;
  nomor: number;
  tanggal: string; // e.g. "01-08-2026"
  namaMenu: string; // e.g. "MENU NASI GORENG CERIA"
  fotoBahanUrl: string;
  daftarBahan?: string;
  geotagLocation?: string;
  geotagDetail?: string;
  geotagCoord?: string;
  geotagTime?: string;
}

export interface PengaturanDokumentasi {
  judulKegiatan: string;
  judulBelanja: string;
  bulanTahunAnggaran: string; // e.g. "BULAN AGUSTUS TAHUN ANGGARAN 2026"
  defaultLokasi: string; // e.g. "Kecamatan Ampana Tete, Sulawesi Tengah, Indonesia"
  defaultDetailAlamat: string; // e.g. "4j2h+23w, Kajulangko, Kec. Ampana Tete, Kabupaten Tojo Una-Una, Sulawesi Tengah 94684"
  defaultKoordinat: string; // e.g. "Lat -0.900128° Long 121.627752°"
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
