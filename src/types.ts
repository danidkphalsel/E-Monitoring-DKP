export type UserRole = 'ADMIN' | 'OPERATOR' | 'PIMPINAN';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  bidang: string; // 'Semua' or specific Bidang
  isActive: boolean;
}

export type BidangType = 'Sekretariat' | 'Bidang Perikanan Tangkap' | 'Bidang Perikanan Budidaya' | 'Bidang P2PSDP';

export interface Realisasi {
  id: string;
  bidang: BidangType;
  program: string;
  kegiatan: string;
  subKegiatan: string;
  uraianPekerjaan: string;
  lokasiDesa: string;
  lokasiKecamatan: string;
  targetFisik: number; // in %
  realisasiFisik: number; // in %
  paguAnggaran: number; // in Rupiah
  realisasiKeuangan: number; // in Rupiah
  sisaAnggaran: number; // otomatis (paguAnggaran - realisasiKeuangan)
  persentaseKeuangan: number; // otomatis ((realisasiKeuangan / paguAnggaran) * 100)
  tanggalInput: string;
  statusKegiatan: 'Rendah' | 'Sedang' | 'Tinggi'; // Otomatis/Manual berdasarkan realisasi fisik atau % keuangan
  dokumentasi: string[]; // array contains base64 images or mock image paths
  tahunAnggaran: string;
  bulan: string; // 'Januari', 'Februari', etc.
  terakhirDieditOleh: string;
  tanggalEdit: string;
}

export interface RiwayatPerubahan {
  id: string;
  realisasiId: string;
  uraianPekerjaan: string;
  bidang: string;
  oleh: string;
  role: string;
  tipeAksi: 'KREASI' | 'UPDATE' | 'HAPUS';
  detail: string;
  tanggal: string;
}

export interface NotifikasiProgresRendah {
  id: string;
  realisasiId: string;
  uraianPekerjaan: string;
  bidang: BidangType;
  realisasiFisik: number;
  realisasiKeuanganPersen: number;
  pesan: string;
  tanggalKejadian: string;
}

export interface AppConfig {
  namaAplikasi: string;
  namaInstansi: string;
  pemerintahDaerah: string;
  tahunAnggaranAktif: string;
  targetKritisFisik: number; // Misal < 50% di bulan berjalan dianggap 'Rendah'
  alamat: string;
  autoBackupDelay: number; // jam
  terakhirBackup: string;
}
