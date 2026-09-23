import * as XLSX from 'xlsx';
import { BalitaPMT, JenisKelamin, TingkatKepatuhan, UploadSummary, UploadRowValidation } from '../types';
import {
  calculateAgeInMonths,
  calculateZScoreTBU,
  getStatusTBU,
  calculateZScoreBBU,
  getStatusBBU,
  calculateZScoreBBTB,
  getStatusBBTB,
  determineIntervensiStatus,
  getStatusGiziBalita,
  getFormattedTanggalPosyandu,
} from './nutritionStandards';

/**
 * Normalisasi nama kolom header dari berbagai format Excel Posyandu / e-PPGBM
 */
function normalizeKey(key: string): string {
  return key
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/**
 * Template Kolom Baku Evaluasi Stunting
 */
export const TEMPLATE_COLUMNS = [
  'NIK',
  'Nama Balita',
  'Nama Ibu',
  'Jenis Kelamin (L/P)',
  'Tanggal Lahir (YYYY-MM-DD)',
  'Posyandu',
  'Desa/Kelurahan',
  'Puskesmas',
  'Tanggal Pengukuran (YYYY-MM-DD)',
  'Berat Badan (kg)',
  'Tinggi Badan (cm)',
  'Lingkar Lengan LiLA (cm)',
  'Lingkar Kepala (cm)',
  'Bulan ke-',
  'Menu Makanan Lokal',
  'Kepatuhan Konsumsi',
  'Catatan Kesehatan',
];

/**
 * Unduh Template Excel Resmi (.xlsx)
 */
export function downloadExcelTemplate() {
  const exampleRows = [
    {
      'NIK': '7209042201230001',
      'Nama Balita': 'ARSYAD',
      'Nama Ibu': 'Nurlina',
      'Jenis Kelamin (L/P)': 'L',
      'Tanggal Lahir (YYYY-MM-DD)': '2024-03-24',
      'Posyandu': 'Posyandu Kajulangko',
      'Desa/Kelurahan': 'Kajulango',
      'Puskesmas': 'Puskesmas Ampana Tete',
      'Tanggal Pengukuran (YYYY-MM-DD)': '2026-08-01',
      'Berat Badan (kg)': 9.3,
      'Tinggi Badan (cm)': 80.5,
      'Lingkar Lengan LiLA (cm)': 12.5,
      'Lingkar Kepala (cm)': 46.2,
      'Bulan ke-': 1,
      'Menu Makanan Lokal': 'MENU NASI GORENG CERIA (Ayam Suwir, Telur, Wortel, Selada)',
      'Kepatuhan Konsumsi': 'Habis',
      'Catatan Kesehatan': 'Sasaran stunting (TB/U -2.43 SD). Nafsu makan membaik saat intervensi.',
    },
    {
      'NIK': '720904161224001',
      'Nama Balita': 'MOHAMMAD ALFA RISKI',
      'Nama Ibu': 'Rina Wahyuni',
      'Jenis Kelamin (L/P)': 'L',
      'Tanggal Lahir (YYYY-MM-DD)': '2024-11-15',
      'Posyandu': 'Posyandu Kajulangko',
      'Desa/Kelurahan': 'Kajulango',
      'Puskesmas': 'Puskesmas Ampana Tete',
      'Tanggal Pengukuran (YYYY-MM-DD)': '2026-08-01',
      'Berat Badan (kg)': 8.4,
      'Tinggi Badan (cm)': 75.0,
      'Lingkar Lengan LiLA (cm)': 12.1,
      'Lingkar Kepala (cm)': 45.0,
      'Bulan ke-': 1,
      'Menu Makanan Lokal': 'MENU SOTO AYAM (Ayam Kampung, Bihun, Tauge, Kaldu Kaya Protein)',
      'Kepatuhan Konsumsi': 'Habis',
      'Catatan Kesehatan': 'Stunting Sangat Pendek (TB/U -3.48 SD). Memerlukan pendampingan makan intensif.',
    },
    {
      'NIK': '7209044508230001',
      'Nama Balita': 'NURHAFIZAH',
      'Nama Ibu': 'Mariani',
      'Jenis Kelamin (L/P)': 'P',
      'Tanggal Lahir (YYYY-MM-DD)': '2024-08-29',
      'Posyandu': 'Posyandu Kajulangko',
      'Desa/Kelurahan': 'Kajulango',
      'Puskesmas': 'Puskesmas Ampana Tete',
      'Tanggal Pengukuran (YYYY-MM-DD)': '2026-08-01',
      'Berat Badan (kg)': 8.9,
      'Tinggi Badan (cm)': 79.5,
      'Lingkar Lengan LiLA (cm)': 12.4,
      'Lingkar Kepala (cm)': 45.8,
      'Bulan ke-': 1,
      'Menu Makanan Lokal': 'MENU SUP BOLA-BOLA TAHU AYAM + WORTEL',
      'Kepatuhan Konsumsi': 'Habis',
      'Catatan Kesehatan': 'Sasaran stunting (TB/U -2.83 SD). Didampingi kader Posyandu saat makan.',
    }
  ];

  const ws = XLSX.utils.json_to_sheet(exampleRows);
  
  // Set column widths
  ws['!cols'] = [
    { wch: 18 }, // NIK
    { wch: 22 }, // Nama Balita
    { wch: 18 }, // Nama Ibu
    { wch: 16 }, // JK
    { wch: 20 }, // Tgl Lahir
    { wch: 15 }, // Posyandu
    { wch: 16 }, // Desa
    { wch: 20 }, // Puskesmas
    { wch: 20 }, // Tgl Ukur
    { wch: 16 }, // BB
    { wch: 16 }, // TB
    { wch: 18 }, // LiLA
    { wch: 16 }, // LK
    { wch: 14 }, // Bulan
    { wch: 35 }, // Menu
    { wch: 18 }, // Kepatuhan
    { wch: 30 }, // Catatan
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Template_Stunting');

  // Add petunjuk sheet
  const guidelines = [
    { 'Petunjuk Pengisian': '1. NIK balita disarankan 16 digit angka (opsional jika belum memiliki NIK).' },
    { 'Petunjuk Pengisian': '2. Jenis Kelamin diisi L (Laki-laki) atau P (Perempuan).' },
    { 'Petunjuk Pengisian': '3. Tanggal ditulis dengan format YYYY-MM-DD (contoh: 2024-05-12).' },
    { 'Petunjuk Pengisian': '4. Berat Badan dalam kilogram (gunakan titik untuk desimal, contoh: 8.5).' },
    { 'Petunjuk Pengisian': '5. Tinggi/Panjang Badan dalam sentimeter (contoh: 76.5).' },
    { 'Petunjuk Pengisian': '6. Kepatuhan Konsumsi: Habis, 3/4 Porsi, 1/2 Porsi, < 1/2 Porsi, atau Tidak Dikonsumsi.' },
    { 'Petunjuk Pengisian': '7. Sistem akan secara otomatis mengkalkulasi Usia (Bulan), Z-Score TB/U, Z-Score BB/U, dan Status Stunting.' }
  ];
  const wsGuide = XLSX.utils.json_to_sheet(guidelines);
  XLSX.utils.book_append_sheet(wb, wsGuide, 'Petunjuk_Pengisian');

  XLSX.writeFile(wb, 'Template_Data_Stanting_Balita.xlsx');
}

/**
 * Ekspor / Cetak Lembar Rekapitulasi Balita ke Excel (.xlsx)
 */
export function exportDataToExcel(data: BalitaPMT[], filename = 'Cetakan_Evaluasi_Stunting') {
  const exportRows = data.map((item, idx) => ({
    'No': idx + 1,
    'NIK': item.nik,
    'Nama Balita': item.namaBalita,
    'Nama Ibu': item.namaIbu,
    'Jenis Kelamin': item.jk === 'L' ? 'Laki-laki' : 'Perempuan',
    'Tanggal Lahir': item.tanggalLahir,
    'Usia (Bulan)': item.usiaBulan,
    'Desa/Kelurahan': item.desa,
    'Posyandu': item.posyandu,
    'Puskesmas': item.puskesmas,
    'Tanggal Pengukuran': item.tanggalPengukuran,
    'Berat Badan (kg)': item.beratBadan,
    'Tinggi Badan (cm)': item.tinggiBadan,
    'Z-Score TB/U': item.zScoreTBU,
    'Status Stunting (TB/U)': item.statusTBU,
    'Z-Score BB/U': item.zScoreBBU,
    'Status Berat Badan (BB/U)': item.statusBBU,
    'Status Gizi Balita': getStatusGiziBalita(item),
    'Status Gizi (BB/TB)': item.statusBBTB,
    'Terakhir Posyandu': getFormattedTanggalPosyandu((item.riwayat && item.riwayat.length > 0 ? item.riwayat[item.riwayat.length - 1].tanggal : '') || item.tanggalPengukuran).tglFormatted,
    'Menu Makanan': item.menuPMT,
    'Kepatuhan Konsumsi': item.kepatuhan,
    'Status Intervensi': item.statusIntervensi,
    'Catatan Kesehatan': item.catatanKesehatan,
  }));

  const ws = XLSX.utils.json_to_sheet(exportRows);

  // Atur lebar kolom agar dokumen rapi saat dibuka dan dicetak di Microsoft Excel
  ws['!cols'] = [
    { wch: 6 },  // No
    { wch: 20 }, // NIK
    { wch: 25 }, // Nama Balita
    { wch: 20 }, // Nama Ibu
    { wch: 14 }, // JK
    { wch: 15 }, // Tanggal Lahir
    { wch: 12 }, // Usia (Bulan)
    { wch: 16 }, // Desa
    { wch: 20 }, // Posyandu
    { wch: 22 }, // Puskesmas
    { wch: 18 }, // Tanggal Pengukuran
    { wch: 16 }, // Berat Badan (kg)
    { wch: 16 }, // Tinggi Badan (cm)
    { wch: 14 }, // Z-Score TB/U
    { wch: 22 }, // Status Stunting
    { wch: 14 }, // Z-Score BB/U
    { wch: 22 }, // Status BB/U
    { wch: 18 }, // Status BB/TB
    { wch: 20 }, // BULAN
    { wch: 35 }, // Menu Makanan
    { wch: 18 }, // Kepatuhan
    { wch: 20 }, // Status Intervensi
    { wch: 35 }, // Catatan Kesehatan
  ];

  const wb = XLSX.utils.book_new();

  // Sheet 1: Data Rekapitulasi Lengkap
  XLSX.utils.book_append_sheet(wb, ws, 'Rekap_Balita_Stunting');

  // Sheet 2: Ringkasan Resmi Laporan
  const total = data.length;
  const sangatPendek = data.filter(d => d.statusTBU === 'Sangat Pendek').length;
  const pendek = data.filter(d => d.statusTBU === 'Pendek').length;
  const patuh = data.filter(d => d.kepatuhan === 'Habis' || d.kepatuhan === '3/4 Porsi').length;
  const currentDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const summaryRows = [
    { 'Parameter': 'Judul Laporan', 'Keterangan': 'LAPORAN EVALUASI DATA BALITA STUNTING' },
    { 'Parameter': 'Puskesmas Pengampu', 'Keterangan': data[0]?.puskesmas || 'Puskesmas Ampana Tete' },
    { 'Parameter': 'Tanggal Cetak Laporan', 'Keterangan': currentDate },
    { 'Parameter': 'Standar Baku Antropometri', 'Keterangan': 'Permenkes RI No. 2 Tahun 2020 (WHO Child Growth Standards)' },
    { 'Parameter': 'Total Balita Sasaran', 'Keterangan': `${total} Anak` },
    { 'Parameter': 'Balita Kategori Sangat Pendek (Severely Stunted)', 'Keterangan': `${sangatPendek} Anak` },
    { 'Parameter': 'Balita Kategori Pendek (Stunted)', 'Keterangan': `${pendek} Anak` },
    { 'Parameter': 'Total Prevalensi Stunting dalam Program', 'Keterangan': `${sangatPendek + pendek} Anak (${total > 0 ? Math.round(((sangatPendek + pendek) / total) * 100) : 0}%)` },
    { 'Parameter': 'Kepatuhan Konsumsi Makanan Baik (Habis / 3/4 Porsi)', 'Keterangan': `${patuh} Anak (${total > 0 ? Math.round((patuh / total) * 100) : 0}%)` },
  ];
  const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
  wsSummary['!cols'] = [{ wch: 38 }, { wch: 60 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan_Laporan');

  XLSX.writeFile(wb, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
}

/**
 * Ekspor Data ke Format CSV
 */
export function exportDataToCSV(data: BalitaPMT[], filename = 'Data_Stunting') {
  const exportRows = data.map((item, idx) => ({
    'No': idx + 1,
    'NIK': item.nik,
    'Nama Balita': item.namaBalita,
    'Nama Ibu': item.namaIbu,
    'Jenis Kelamin': item.jk,
    'Tanggal Lahir': item.tanggalLahir,
    'Usia (Bulan)': item.usiaBulan,
    'Desa': item.desa,
    'Posyandu': item.posyandu,
    'Puskesmas': item.puskesmas,
    'Tanggal Pengukuran': item.tanggalPengukuran,
    'Berat Badan (kg)': item.beratBadan,
    'Tinggi Badan (cm)': item.tinggiBadan,
    'Z-Score TB/U': item.zScoreTBU,
    'Status Stunting': item.statusTBU,
    'Status Gizi Balita': getStatusGiziBalita(item),
    'Status Gizi (BB/TB)': item.statusBBTB,
    'Terakhir Posyandu': getFormattedTanggalPosyandu((item.riwayat && item.riwayat.length > 0 ? item.riwayat[item.riwayat.length - 1].tanggal : '') || item.tanggalPengukuran).tglFormatted,
    'Kepatuhan': item.kepatuhan,
    'Status Intervensi': item.statusIntervensi,
  }));

  const ws = XLSX.utils.json_to_sheet(exportRows);
  const csvOutput = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Parse dan validasi file upload (Excel atau CSV)
 */
export async function parseUploadedFile(file: File): Promise<UploadSummary> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });

  // Ambil sheet pertama atau sheet dengan nama yang relevan
  const sheetName = workbook.SheetNames.find(n => n.toLowerCase().includes('stunting') || n.toLowerCase().includes('balita') || n.toLowerCase().includes('data')) || workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  if (!worksheet) {
    throw new Error('Lembar kerja (worksheet) Excel tidak ditemukan atau kosong.');
  }

  const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  if (rawRows.length === 0) {
    throw new Error('File Excel tidak memiliki baris data.');
  }

  const validationList: UploadRowValidation[] = [];
  const validData: BalitaPMT[] = [];

  rawRows.forEach((row, index) => {
    const rowIndex = index + 2; // Mengingat baris 1 adalah header
    const errors: string[] = [];
    const warnings: string[] = [];

    // Map keys secara fleksibel
    const mapped: Record<string, any> = {};
    for (const [key, value] of Object.entries(row)) {
      const norm = normalizeKey(key);
      if (norm.includes('nik')) mapped.nik = String(value).trim();
      else if (norm.includes('balita') || (norm.includes('nama') && !norm.includes('ibu'))) mapped.namaBalita = String(value).trim();
      else if (norm.includes('ibu') || norm.includes('orangtua')) mapped.namaIbu = String(value).trim();
      else if (norm.includes('kelamin') || norm === 'jk' || norm === 'sex') mapped.jk = String(value).trim().toUpperCase();
      else if (norm.includes('tgllahir') || norm.includes('tanggallahir') || norm.includes('dob')) mapped.tanggalLahir = parseDateValue(value);
      else if (norm.includes('posyandu')) mapped.posyandu = String(value).trim();
      else if (norm.includes('desa') || norm.includes('kelurahan')) mapped.desa = String(value).trim();
      else if (norm.includes('puskesmas')) mapped.puskesmas = String(value).trim();
      else if (norm.includes('tglukur') || norm.includes('tanggalpengukuran') || norm.includes('tglpengukuran')) mapped.tanggalPengukuran = parseDateValue(value);
      else if (norm.includes('berat') || norm === 'bb') mapped.beratBadan = parseNumber(value);
      else if (norm.includes('tinggi') || norm.includes('panjang') || norm === 'tb' || norm === 'pb') mapped.tinggiBadan = parseNumber(value);
      else if (norm.includes('lila') || norm.includes('lengan')) mapped.lingkarLengan = parseNumber(value);
      else if (norm.includes('kepala') || norm === 'lk') mapped.lingkarKepala = parseNumber(value);
      else if (norm.includes('hari') || norm.includes('siklus')) mapped.hariPMT = parseNumber(value);
      else if (norm.includes('menu') || norm.includes('makanan')) mapped.menuPMT = String(value).trim();
      else if (norm.includes('kepatuhan') || norm.includes('konsumsi')) mapped.kepatuhan = String(value).trim();
      else if (norm.includes('catatan') || norm.includes('keterangan')) mapped.catatanKesehatan = String(value).trim();
    }

    // Validasi field wajib
    if (!mapped.namaBalita) {
      errors.push('Nama balita tidak boleh kosong');
    }

    let jk: JenisKelamin = 'L';
    if (mapped.jk) {
      const jkStr = mapped.jk.charAt(0);
      if (jkStr === 'P' || jkStr === 'W') jk = 'P';
      else if (jkStr === 'L') jk = 'L';
      else warnings.push('Format jenis kelamin ambigu, diasumsikan Laki-laki');
    } else {
      warnings.push('Jenis kelamin tidak diisi, diasumsikan Laki-laki');
    }

    const tglLahir = mapped.tanggalLahir || '2024-01-01';
    const tglUkur = mapped.tanggalPengukuran || new Date().toISOString().split('T')[0];
    const usiaBulan = calculateAgeInMonths(tglLahir, tglUkur);

    const bb = mapped.beratBadan || 0;
    const tb = mapped.tinggiBadan || 0;

    if (tb <= 0) {
      errors.push('Tinggi badan harus lebih dari 0 cm');
    } else if (tb < 30 || tb > 140) {
      warnings.push(`Tinggi badan (${tb} cm) di luar rentang wajar balita`);
    }

    if (bb <= 0) {
      errors.push('Berat badan harus lebih dari 0 kg');
    } else if (bb < 1.5 || bb > 35) {
      warnings.push(`Berat badan (${bb} kg) di luar rentang wajar balita`);
    }

    // Normalisasi Kepatuhan
    let kepatuhan: TingkatKepatuhan = 'Habis';
    const kepatuhanStr = (mapped.kepatuhan || '').toLowerCase();
    if (kepatuhanStr.includes('3/4')) kepatuhan = '3/4 Porsi';
    else if (kepatuhanStr.includes('1/2') && !kepatuhanStr.includes('<')) kepatuhan = '1/2 Porsi';
    else if (kepatuhanStr.includes('<') || kepatuhanStr.includes('kurang')) kepatuhan = '< 1/2 Porsi';
    else if (kepatuhanStr.includes('tidak') || kepatuhanStr.includes('0')) kepatuhan = 'Tidak Dikonsumsi';
    else if (kepatuhanStr.includes('habis')) kepatuhan = 'Habis';

    const zScoreTBU = calculateZScoreTBU(usiaBulan, tb, jk);
    const statusTBU = getStatusTBU(zScoreTBU);

    const zScoreBBU = calculateZScoreBBU(usiaBulan, bb, jk);
    const statusBBU = getStatusBBU(zScoreBBU);

    const zScoreBBTB = calculateZScoreBBTB(tb, bb, jk);
    const statusBBTB = getStatusBBTB(zScoreBBTB);

    const hariPMT = mapped.hariPMT || 1;
    const statusIntervensi = determineIntervensiStatus(statusTBU, kepatuhan, hariPMT);

    const isValid = errors.length === 0;

    const item: BalitaPMT = {
      id: `pmt-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 5)}`,
      nik: mapped.nik || `3201${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      namaBalita: mapped.namaBalita || `Balita Baris ${rowIndex}`,
      namaIbu: mapped.namaIbu || 'Ibu ' + (mapped.namaBalita || 'Balita'),
      jk,
      tanggalLahir: tglLahir,
      usiaBulan,
      posyandu: mapped.posyandu || 'Posyandu Mawar',
      desa: mapped.desa || 'Desa Sejahtera',
      puskesmas: mapped.puskesmas || 'Puskesmas Kecamatan',
      tanggalPengukuran: tglUkur,
      beratBadan: bb,
      tinggiBadan: tb,
      lingkarLengan: mapped.lingkarLengan || undefined,
      lingkarKepala: mapped.lingkarKepala || undefined,
      hariPMT,
      totalHariProgram: 90,
      menuPMT: mapped.menuPMT || 'Menu Pangan Lokal Bergizi',
      kepatuhan,
      statusTBU,
      statusBBU,
      statusBBTB,
      zScoreTBU,
      zScoreBBU,
      zScoreBBTB,
      statusIntervensi,
      catatanKesehatan: mapped.catatanKesehatan || '-',
      riwayat: [
        {
          id: `hist-0`,
          tanggal: tglUkur,
          hariPMT,
          tinggiBadan: tb,
          beratBadan: bb,
          kepatuhan,
          catatan: mapped.catatanKesehatan || 'Pengukuran awal penguplotan',
        }
      ]
    };

    validationList.push({
      rowIndex,
      isValid,
      errors,
      warnings,
      data: item,
    });

    if (isValid) {
      validData.push(item);
    }
  });

  return {
    fileName: file.name,
    fileSize: file.size,
    totalRows: rawRows.length,
    validRows: validData.length,
    invalidRows: rawRows.length - validData.length,
    data: validData,
    validationList,
  };
}

/**
 * Parsing angka desimal atau teks berformat angka
 */
function parseNumber(val: any): number {
  if (typeof val === 'number') return Number(val.toFixed(2));
  if (!val) return 0;
  const cleaned = String(val).replace(/,/g, '.').replace(/[^0-9.-]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : Number(num.toFixed(2));
}

/**
 * Parsing tanggal dari angka serial Excel atau format string YYYY-MM-DD
 */
function parseDateValue(val: any): string {
  if (!val) return new Date().toISOString().split('T')[0];
  if (typeof val === 'number') {
    // Excel serial number
    const date = new Date(Math.round((val - 25569) * 86400 * 1000));
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  }
  const str = String(val).trim();
  // Cek apakah YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }
  // Cek DD/MM/YYYY atau DD-MM-YYYY
  const parts = str.split(/[/.-]/);
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      // YYYY-MM-DD
      return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
    } else if (parts[2].length === 4) {
      // DD-MM-YYYY
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
  }
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }
  return new Date().toISOString().split('T')[0];
}
