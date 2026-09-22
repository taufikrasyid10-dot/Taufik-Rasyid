import { JenisKelamin, StatusTBU, StatusBBU, StatusBBTB, StatusIntervensi } from '../types';

/**
 * Standard Antropometri Anak sesuai Permenkes No. 2 Tahun 2020 & WHO Child Growth Standards
 * Data acuan Tinggi/Panjang Badan menurut Umur (TB/U) Balita 0 - 60 Bulan
 */

// WHO Median & SD acuan Tinggi Badan (cm) menurut Umur (Bulan)
// Format per usia: [Median 0 SD, 1 SD]
const WHO_TBU_BOYS: Record<number, [number, number]> = {
  0: [49.9, 1.9],
  1: [54.7, 2.0],
  2: [58.4, 2.1],
  3: [61.4, 2.2],
  4: [63.9, 2.2],
  5: [65.9, 2.3],
  6: [67.6, 2.3],
  7: [69.2, 2.4],
  8: [70.6, 2.4],
  9: [72.0, 2.5],
  10: [73.3, 2.5],
  11: [74.5, 2.6],
  12: [75.7, 2.6],
  15: [79.1, 2.7],
  18: [82.3, 2.8],
  21: [85.1, 2.9],
  24: [87.8, 3.0],
  27: [90.4, 3.1],
  30: [93.2, 3.2],
  33: [95.8, 3.3],
  36: [96.1, 3.4],
  40: [99.5, 3.6],
  44: [102.5, 3.7],
  48: [105.3, 3.8],
  52: [108.0, 4.0],
  56: [110.5, 4.1],
  60: [112.9, 4.2],
};

const WHO_TBU_GIRLS: Record<number, [number, number]> = {
  0: [49.1, 1.9],
  1: [53.7, 2.0],
  2: [57.1, 2.0],
  3: [59.8, 2.1],
  4: [62.1, 2.1],
  5: [64.0, 2.2],
  6: [65.7, 2.3],
  7: [67.3, 2.3],
  8: [68.7, 2.4],
  9: [70.1, 2.4],
  10: [71.5, 2.5],
  11: [72.8, 2.5],
  12: [74.0, 2.6],
  15: [77.5, 2.7],
  18: [80.7, 2.8],
  21: [83.7, 2.9],
  24: [86.4, 3.0],
  27: [89.1, 3.1],
  30: [91.9, 3.2],
  33: [94.5, 3.3],
  36: [95.1, 3.4],
  40: [98.6, 3.5],
  44: [101.6, 3.7],
  48: [104.5, 3.8],
  52: [107.2, 4.0],
  56: [109.8, 4.1],
  60: [112.2, 4.2],
};

// Interpolation helper for intermediate months
function getTBUReference(ageMonths: number, gender: JenisKelamin): { median: number; sd: number } {
  const table = gender === 'L' ? WHO_TBU_BOYS : WHO_TBU_GIRLS;
  const clampedAge = Math.max(0, Math.min(60, ageMonths));
  
  if (table[clampedAge]) {
    return { median: table[clampedAge][0], sd: table[clampedAge][1] };
  }

  // Find nearest lower and upper points
  const keys = Object.keys(table).map(Number).sort((a, b) => a - b);
  let lower = keys[0];
  let upper = keys[keys.length - 1];

  for (let i = 0; i < keys.length - 1; i++) {
    if (keys[i] <= clampedAge && clampedAge <= keys[i + 1]) {
      lower = keys[i];
      upper = keys[i + 1];
      break;
    }
  }

  const fraction = (clampedAge - lower) / (upper - lower || 1);
  const median = table[lower][0] + fraction * (table[upper][0] - table[lower][0]);
  const sd = table[lower][1] + fraction * (table[upper][1] - table[lower][1]);
  return { median, sd };
}

// WHO Median & SD acuan Berat Badan (kg) menurut Umur (Bulan)
function getBBUReference(ageMonths: number, gender: JenisKelamin): { median: number; sd: number } {
  const clampedAge = Math.max(0, Math.min(60, ageMonths));
  if (gender === 'L') {
    // Approx based on WHO Boys Weight-for-Age
    const median = 3.3 + clampedAge * (clampedAge <= 12 ? 0.55 : clampedAge <= 24 ? 0.23 : 0.17);
    const sd = 0.5 + clampedAge * 0.035;
    return { median: Number(median.toFixed(2)), sd: Number(sd.toFixed(2)) };
  } else {
    // Approx based on WHO Girls Weight-for-Age
    const median = 3.2 + clampedAge * (clampedAge <= 12 ? 0.50 : clampedAge <= 24 ? 0.22 : 0.16);
    const sd = 0.48 + clampedAge * 0.033;
    return { median: Number(median.toFixed(2)), sd: Number(sd.toFixed(2)) };
  }
}

/**
 * Hitung Usia dalam Satuan Bulan dari Tanggal Lahir ke Tanggal Pengukuran
 */
export function calculateAgeInMonths(birthDateStr: string, measurementDateStr?: string): number {
  if (!birthDateStr) return 0;
  const birth = new Date(birthDateStr);
  const measure = measurementDateStr ? new Date(measurementDateStr) : new Date();
  
  if (isNaN(birth.getTime()) || isNaN(measure.getTime())) return 0;
  
  let months = (measure.getFullYear() - birth.getFullYear()) * 12 + (measure.getMonth() - birth.getMonth());
  if (measure.getDate() < birth.getDate()) {
    months--;
  }
  return Math.max(0, months);
}

/**
 * Hitung Z-Score TB/U (Tinggi Badan menurut Umur)
 */
export function calculateZScoreTBU(ageMonths: number, heightCm: number, gender: JenisKelamin): number {
  if (heightCm <= 0) return 0;
  const { median, sd } = getTBUReference(ageMonths, gender);
  const zScore = (heightCm - median) / sd;
  return Number(zScore.toFixed(2));
}

/**
 * Tentukan Kategori Status TB/U (Stunting)
 */
export function getStatusTBU(zScore: number): StatusTBU {
  if (zScore < -3.0) return 'Sangat Pendek'; // Severely Stunted
  if (zScore < -2.0) return 'Pendek';        // Stunted
  if (zScore <= 3.0) return 'Normal';
  return 'Tinggi';
}

/**
 * Hitung Z-Score BB/U (Berat Badan menurut Umur)
 */
export function calculateZScoreBBU(ageMonths: number, weightKg: number, gender: JenisKelamin): number {
  if (weightKg <= 0) return 0;
  const { median, sd } = getBBUReference(ageMonths, gender);
  const zScore = (weightKg - median) / sd;
  return Number(zScore.toFixed(2));
}

/**
 * Tentukan Kategori Status BB/U
 */
export function getStatusBBU(zScore: number): StatusBBU {
  if (zScore < -3.0) return 'Sangat Kurang';
  if (zScore < -2.0) return 'Kurang';
  if (zScore <= 1.0) return 'Normal';
  return 'Risiko Lebih';
}

/**
 * Hitung Z-Score BB/TB (Berat Badan menurut Tinggi Badan)
 */
export function calculateZScoreBBTB(heightCm: number, weightKg: number, gender: JenisKelamin): number {
  if (heightCm <= 0 || weightKg <= 0) return 0;
  // Perkiraan median BB untuk TB tertentu
  const expectedWeight = gender === 'L' 
    ? Math.max(2.5, 0.0022 * Math.pow(heightCm, 1.95))
    : Math.max(2.4, 0.0021 * Math.pow(heightCm, 1.95));
  const sd = expectedWeight * 0.11;
  const zScore = (weightKg - expectedWeight) / sd;
  return Number(zScore.toFixed(2));
}

/**
 * Tentukan Kategori Status BB/TB (Wasting)
 */
export function getStatusBBTB(zScore: number): StatusBBTB {
  if (zScore < -3.0) return 'Gizi Buruk';
  if (zScore < -2.0) return 'Gizi Kurang';
  if (zScore <= 1.0) return 'Gizi Baik';
  if (zScore <= 2.0) return 'Berisiko Lebih';
  if (zScore <= 3.0) return 'Gizi Lebih';
  return 'Obesitas';
}

/**
 * Menentukan status intervensi berdasarkan tren & kepatuhan
 */
export function determineIntervensiStatus(
  statusTBU: StatusTBU,
  kepatuhan: string,
  hariPMT: number
): StatusIntervensi {
  if (statusTBU === 'Sangat Pendek' && kepatuhan === 'Tidak Dikonsumsi') {
    return 'Kritis';
  }
  if (statusTBU === 'Sangat Pendek' || statusTBU === 'Pendek') {
    if (hariPMT >= 60 && (kepatuhan === 'Habis' || kepatuhan === '3/4 Porsi')) {
      return 'Membaik';
    }
    return 'Perlu Tindak Lanjut';
  }
  return 'Sesuai Target';
}

/**
 * Dapatkan deret kurva pertumbuhan WHO standar untuk visualisasi (0 - 60 bulan)
 */
export function getWHOGrowthCurveData(gender: JenisKelamin) {
  const points = [];
  for (let age = 0; age <= 60; age += 3) {
    const { median, sd } = getTBUReference(age, gender);
    points.push({
      age,
      median: Number(median.toFixed(1)),
      plus2SD: Number((median + 2 * sd).toFixed(1)),
      minus1SD: Number((median - sd).toFixed(1)),
      minus2SD: Number((median - 2 * sd).toFixed(1)), // Garis Ambang Stunting
      minus3SD: Number((median - 3 * sd).toFixed(1)), // Garis Ambang Sangat Pendek
    });
  }
  return points;
}
