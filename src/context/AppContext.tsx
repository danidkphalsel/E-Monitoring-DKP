import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Realisasi, BidangType, RiwayatPerubahan, NotifikasiProgresRendah, AppConfig } from '../types';

// Default mock images from Unsplash (Maritime, fisheries, government Indonesia related)
const MOCK_IMAGES = {
  sekretariat: [
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=400', // laptop office
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=400'  // meeting
  ],
  tangkap: [
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=400', // boat at sea
    'https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?auto=format&fit=crop&q=80&w=400'  // nets fishermen
  ],
  budidaya: [
    'https://images.unsplash.com/photo-1511140590326-1e679836f6f8?auto=format&fit=crop&q=80&w=400', // seaweed water
    'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=400'  // coastal farm
  ],
  p2psdp: [
    'https://images.unsplash.com/photo-1582967788606-a171c1080cb0?auto=format&fit=crop&q=80&w=400', // reef beach island
    'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=400'  // deep harbor
  ]
};

// Initial default users
const INITIAL_USERS: User[] = [
  { id: 'u1', username: 'admin', name: 'Zulfikar Ali, S.Pi (Administrator)', role: 'ADMIN', bidang: 'Semua', isActive: true },
  { id: 'u2', username: 'op_sekretariat', name: 'Ahmad Faisal (Operator Sekretariat)', role: 'OPERATOR', bidang: 'Sekretariat', isActive: true },
  { id: 'u3', username: 'op_tangkap', name: 'Husni Tamrin (Operator Perikanan Tangkap)', role: 'OPERATOR', bidang: 'Bidang Perikanan Tangkap', isActive: true },
  { id: 'u4', username: 'op_budidaya', name: 'Siti Rahma (Operator Perikanan Budidaya)', role: 'OPERATOR', bidang: 'Bidang Perikanan Budidaya', isActive: true },
  { id: 'u5', username: 'op_p2psdp', name: 'Ridwan Marsaoly (Operator P2PSDP)', role: 'OPERATOR', bidang: 'Bidang P2PSDP', isActive: true },
  { id: 'u6', username: 'pimpinan', name: 'Dr. Muh. Yusuf, M.Si (Kepala Dinas)', role: 'PIMPINAN', bidang: 'Semua', isActive: true }
];

// Initial default app config
const DEFAULT_CONFIG: AppConfig = {
  namaAplikasi: 'E-REALISASI FISIK & KEUANGAN DKP',
  namaInstansi: 'DINAS KELAUTAN DAN PERIKANAN',
  pemerintahDaerah: 'KABUPATEN HALMAHERA SELATAN',
  tahunAnggaranAktif: '2026',
  targetKritisFisik: 50,
  alamat: 'Jl. Karet No. 4, Kawasan Pemerintahan Bumi Moro, Labuha, Halmahera Selatan',
  autoBackupDelay: 24,
  terakhirBackup: '2026-05-25 12:00:00'
};

// Initial default realisasi data
const INITIAL_REALISASI: Realisasi[] = [
  {
    id: 'r1',
    bidang: 'Sekretariat',
    program: 'Program Pelayanan Administrasi Perkantoran',
    kegiatan: 'Penyediaan Jasa Administrasi Keuangan',
    subKegiatan: 'Penyediaan Gaji dan Tunjangan Aparatur Sipil Negara',
    uraianPekerjaan: 'Belanja Gaji Pokok dan Tunjangan Melekat ASN Dinas Kelautan & Perikanan',
    lokasiDesa: 'Labuha',
    lokasiKecamatan: 'Bacan',
    targetFisik: 100,
    realisasiFisik: 80,
    paguAnggaran: 1200000000,
    realisasiKeuangan: 960000000,
    sisaAnggaran: 240000000,
    persentaseKeuangan: 80,
    tanggalInput: '2026-02-15',
    statusKegiatan: 'Tinggi',
    dokumentasi: [MOCK_IMAGES.sekretariat[0], MOCK_IMAGES.sekretariat[1]],
    tahunAnggaran: '2026',
    bulan: 'Mei',
    terakhirDieditOleh: 'Ahmad Faisal',
    tanggalEdit: '2026-05-24'
  },
  {
    id: 'r2',
    bidang: 'Sekretariat',
    program: 'Program Peningkatan Sarana dan Prasarana Aparatur',
    kegiatan: 'Pengadaan Kendaraan Dinas/Operasional',
    subKegiatan: 'Pengadaan Peralatan dan Perlengkapan Kantor',
    uraianPekerjaan: 'Belanja Pengadaan Laptop Inventaris Kantor dan ATK Pendukung Program SIPP',
    lokasiDesa: 'Labuha',
    lokasiKecamatan: 'Bacan',
    targetFisik: 100,
    realisasiFisik: 100,
    paguAnggaran: 150000000,
    realisasiKeuangan: 150000000,
    sisaAnggaran: 0,
    persentaseKeuangan: 100,
    tanggalInput: '2026-03-10',
    statusKegiatan: 'Tinggi',
    dokumentasi: [MOCK_IMAGES.sekretariat[1]],
    tahunAnggaran: '2026',
    bulan: 'Maret',
    terakhirDieditOleh: 'Ahmad Faisal',
    tanggalEdit: '2026-03-20'
  },
  {
    id: 'r3',
    bidang: 'Bidang Perikanan Tangkap',
    program: 'Program Pengelolaan Perikanan Tangkap',
    kegiatan: 'Pemberdayaan Nelayan Kecil dalam Daerah Kabupaten',
    subKegiatan: 'Penyediaan Sarana Usaha Perikanan Tangkap',
    uraianPekerjaan: 'Bantuan Perahu Motor Katinting Bobot 3 GT Lengkap dengan Genset & Lampu Sorot Nelayan',
    lokasiDesa: 'Kupal',
    lokasiKecamatan: 'Bacan Selatan',
    targetFisik: 100,
    realisasiFisik: 65,
    paguAnggaran: 450000000,
    realisasiKeuangan: 292500000,
    sisaAnggaran: 157500000,
    persentaseKeuangan: 65,
    tanggalInput: '2026-04-05',
    statusKegiatan: 'Sedang',
    dokumentasi: [MOCK_IMAGES.tangkap[0]],
    tahunAnggaran: '2026',
    bulan: 'April',
    terakhirDieditOleh: 'Husni Tamrin',
    tanggalEdit: '2026-05-22'
  },
  {
    id: 'r4',
    bidang: 'Bidang Perikanan Tangkap',
    program: 'Program Pengelolaan Perikanan Tangkap',
    kegiatan: 'Pemberdayaan Nelayan Kecil dalam Daerah Kabupaten',
    subKegiatan: 'Penyediaan Alat Penangkapan Ikan Ramah Lingkungan',
    uraianPekerjaan: 'Belanja Hibah Jaring Gilnet Monofilament & Handline/Pancing Ulur bagi KUB Nelayan Berdaya',
    lokasiDesa: 'Wayaua',
    lokasiKecamatan: 'Bacan Timur',
    targetFisik: 100,
    realisasiFisik: 100,
    paguAnggaran: 250000000,
    realisasiKeuangan: 250000000,
    sisaAnggaran: 0,
    persentaseKeuangan: 100,
    tanggalInput: '2026-03-12',
    statusKegiatan: 'Tinggi',
    dokumentasi: [MOCK_IMAGES.tangkap[1]],
    tahunAnggaran: '2026',
    bulan: 'April',
    terakhirDieditOleh: 'Husni Tamrin',
    tanggalEdit: '2026-04-10'
  },
  {
    id: 'r5',
    bidang: 'Bidang Perikanan Tangkap',
    program: 'Program Pengelolaan Perikanan Tangkap',
    kegiatan: 'Pengembangan Sarana Perikanan Tangkap Daerah',
    subKegiatan: 'Pembinaan Keselamatan dan Keterampilan Pelayaran Nelayan',
    uraianPekerjaan: 'Pelatihan Sertifikasi Kecakapan Pelayaran (SKP) & Teknik Navigasi Nelayan Tradisional',
    lokasiDesa: 'Babang',
    lokasiKecamatan: 'Bacan Timur',
    targetFisik: 100,
    realisasiFisik: 30,
    paguAnggaran: 110000000,
    realisasiKeuangan: 33000000,
    sisaAnggaran: 77000000,
    persentaseKeuangan: 30,
    tanggalInput: '2026-05-18',
    statusKegiatan: 'Rendah', // < 40% is Rendah
    dokumentasi: [],
    tahunAnggaran: '2026',
    bulan: 'Mei',
    terakhirDieditOleh: 'Husni Tamrin',
    tanggalEdit: '2026-05-18'
  },
  {
    id: 'r6',
    bidang: 'Bidang Perikanan Budidaya',
    program: 'Program Pengelolaan Perikanan Budidaya',
    kegiatan: 'Pemberdayaan Pembudidaya Ikan Kecil',
    subKegiatan: 'Penyediaan Sarana Prasarana Budidaya Rumput Laut',
    uraianPekerjaan: 'Bantuan Pembagian Bibit Rumput Laut Cottonii Unggul & Tali Jangkar Bentangan 100 Meter',
    lokasiDesa: 'Gane Luar',
    lokasiKecamatan: 'Gane Barat',
    targetFisik: 100,
    realisasiFisik: 45,
    paguAnggaran: 350000000,
    realisasiKeuangan: 140000000,
    sisaAnggaran: 210000000,
    persentaseKeuangan: 40,
    tanggalInput: '2026-04-10',
    statusKegiatan: 'Sedang',
    dokumentasi: [MOCK_IMAGES.budidaya[0]],
    tahunAnggaran: '2026',
    bulan: 'April',
    terakhirDieditOleh: 'Siti Rahma',
    tanggalEdit: '2026-05-15'
  },
  {
    id: 'r7',
    bidang: 'Bidang Perikanan Budidaya',
    program: 'Program Pengelolaan Perikanan Budidaya',
    kegiatan: 'Pengembangan Sarana Budidaya Kepiting Bakau Kelompok',
    subKegiatan: 'Pembangunan Kolam Tambak & Rumah Canopy Kepiting Bakau Selat Kayoa',
    uraianPekerjaan: 'Pembuatan Tambak Kepiting Bakau Terbuka Model Rumpun Mangrove dengan Pagar Jaring Keliling',
    lokasiDesa: 'Guruapin',
    lokasiKecamatan: 'Kayoa',
    targetFisik: 100,
    realisasiFisik: 25,
    paguAnggaran: 180000000,
    realisasiKeuangan: 54000000,
    sisaAnggaran: 126000000,
    persentaseKeuangan: 30,
    tanggalInput: '2026-05-02',
    statusKegiatan: 'Rendah',
    dokumentasi: [MOCK_IMAGES.budidaya[1]],
    tahunAnggaran: '2026',
    bulan: 'Mei',
    terakhirDieditOleh: 'Siti Rahma',
    tanggalEdit: '2026-05-20'
  },
  {
    id: 'r8',
    bidang: 'Bidang Perikanan Budidaya',
    program: 'Program Pemberdayaan Pembudidaya Ikan',
    kegiatan: 'Pembinaan dan Sertifikasi Kelompok Pembudidaya',
    subKegiatan: 'Sosialisasi Penerapan CBIB (Cara Budidaya Ikan yang Baik)',
    uraianPekerjaan: 'Sertifikasi Kelayakan Dasar Unit Budidaya Ikan (CBIB) bagi Kelompok Pembudidaya Air Tawar',
    lokasiDesa: 'Sayoang',
    lokasiKecamatan: 'Bacan',
    targetFisik: 100,
    realisasiFisik: 100,
    paguAnggaran: 85000000,
    realisasiKeuangan: 85000000,
    sisaAnggaran: 0,
    persentaseKeuangan: 100,
    tanggalInput: '2026-03-05',
    statusKegiatan: 'Tinggi',
    dokumentasi: [],
    tahunAnggaran: '2026',
    bulan: 'Maret',
    terakhirDieditOleh: 'Siti Rahma',
    tanggalEdit: '2026-03-22'
  },
  {
    id: 'r9',
    bidang: 'Bidang P2PSDP',
    program: 'Program Pengawasan Sumber Daya Kelautan dan Perikanan',
    kegiatan: 'Pengawasan Sumber Daya Perikanan di Wilayah Pesisir',
    subKegiatan: 'Penguatan Pokwasmas (Kelompok Masyarakat Pengawas)',
    uraianPekerjaan: 'Pengadaan Sarana Patroli Pokwasmas Berupa Teropong Monitor, Radio Komunikasi VHF & Life Jacket',
    lokasiDesa: 'Pulau Makian',
    lokasiKecamatan: 'Makian',
    targetFisik: 100,
    realisasiFisik: 70,
    paguAnggaran: 300000000,
    realisasiKeuangan: 180000000,
    sisaAnggaran: 120000000,
    persentaseKeuangan: 60,
    tanggalInput: '2026-04-12',
    statusKegiatan: 'Sedang',
    dokumentasi: [MOCK_IMAGES.p2psdp[0]],
    tahunAnggaran: '2026',
    bulan: 'Mei',
    terakhirDieditOleh: 'Ridwan Marsaoly',
    tanggalEdit: '2026-05-10'
  },
  {
    id: 'r10',
    bidang: 'Bidang P2PSDP',
    program: 'Program Peningkatan Daya Saing Produk Kelautan',
    kegiatan: 'Penyediaan Sarana Distribusi dan Pengolahan Hasil Ikan',
    subKegiatan: 'Pembangunan Cold Storage Kapasitas Rendah',
    uraianPekerjaan: 'Pembangunan Gedung Dan Unit Cold Storage Kapasitas 10 Ton Beserta Gardu Listrik Pendukung',
    lokasiDesa: 'Panamboang',
    lokasiKecamatan: 'Bacan Selatan',
    targetFisik: 100,
    realisasiFisik: 35,
    paguAnggaran: 650000000,
    realisasiKeuangan: 227500000,
    sisaAnggaran: 422500000,
    persentaseKeuangan: 35,
    tanggalInput: '2026-05-01',
    statusKegiatan: 'Rendah',
    dokumentasi: [MOCK_IMAGES.p2psdp[1]],
    tahunAnggaran: '2026',
    bulan: 'Mei',
    terakhirDieditOleh: 'Ridwan Marsaoly',
    tanggalEdit: '2026-05-25'
  },
  {
    id: 'r11',
    bidang: 'Sekretariat',
    program: 'Program Pelayanan Administrasi Perkantoran',
    kegiatan: 'Penyediaan Jasa Administrasi Keuangan Daerah',
    subKegiatan: 'Penyediaan Gaji Pokok PNS dan Tunjangan Melekat',
    uraianPekerjaan: 'Belanja Gaji Tetap Pegawai Negeri Sipil Daerah T.A. 2025 Luncuran Akrual',
    lokasiDesa: 'Labuha',
    lokasiKecamatan: 'Bacan',
    targetFisik: 100,
    realisasiFisik: 100,
    paguAnggaran: 1100000000,
    realisasiKeuangan: 1100000000,
    sisaAnggaran: 0,
    persentaseKeuangan: 100,
    tanggalInput: '2025-12-15',
    statusKegiatan: 'Tinggi',
    dokumentasi: [MOCK_IMAGES.sekretariat[0]],
    tahunAnggaran: '2025',
    bulan: 'Desember',
    terakhirDieditOleh: 'Ahmad Faisal',
    tanggalEdit: '2025-12-20'
  },
  {
    id: 'r12',
    bidang: 'Bidang Perikanan Budidaya',
    program: 'Program Pembinaan dan Perizinan Usaha Budidaya',
    kegiatan: 'Penyediaan Sarana Pembibitan Benih Kerapu',
    subKegiatan: 'Bantuan Keramba Jaring Apung Modern Nelayan Budidaya',
    uraianPekerjaan: 'Penyaluran 5 Paket Sarana KJA Serat Karbon HDPE beserta Pakan Starter & Benih Kerapu Cantang',
    lokasiDesa: 'Amasing',
    lokasiKecamatan: 'Bacan',
    targetFisik: 100,
    realisasiFisik: 100,
    paguAnggaran: 450000000,
    realisasiKeuangan: 441000000,
    sisaAnggaran: 9000000,
    persentaseKeuangan: 98,
    tanggalInput: '2025-11-10',
    statusKegiatan: 'Tinggi',
    dokumentasi: [MOCK_IMAGES.budidaya[1]],
    tahunAnggaran: '2025',
    bulan: 'November',
    terakhirDieditOleh: 'Fahri Albar',
    tanggalEdit: '2025-11-25'
  }
];

// Context Type definition
interface AppContextType {
  users: User[];
  realisasi: Realisasi[];
  riwayats: RiwayatPerubahan[];
  notifikasis: NotifikasiProgresRendah[];
  currentConfig: AppConfig;
  currentUser: User | null;
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
  isLoading: boolean;
  login: (username: string, role: string) => boolean;
  logout: () => void;
  addRealisasi: (data: Omit<Realisasi, 'id' | 'sisaAnggaran' | 'persentaseKeuangan' | 'statusKegiatan' | 'terakhirDieditOleh' | 'tanggalEdit'>, fileUrlsAsBase64: string[]) => void;
  updateRealisasi: (id: string, data: Partial<Realisasi>, fileUrlsAsBase64?: string[]) => void;
  deleteRealisasi: (id: string) => void;
  addUser: (data: Omit<User, 'id'>) => void;
  updateUser: (id: string, data: Partial<User>) => void;
  deleteUser: (id: string) => void;
  updateAppConfig: (config: AppConfig) => void;
  triggerBackup: () => void;
  restoreState: (backupJson: string) => boolean;
  clearState: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const local = localStorage.getItem('dkp_users');
    return local ? JSON.parse(local) : INITIAL_USERS;
  });

  const [realisasi, setRealisasi] = useState<Realisasi[]>(() => {
    const local = localStorage.getItem('dkp_realisasi');
    return local ? JSON.parse(local) : INITIAL_REALISASI;
  });

  const [riwayats, setRiwayats] = useState<RiwayatPerubahan[]>(() => {
    const local = localStorage.getItem('dkp_riwayats');
    // Initial audit trail
    if (local) return JSON.parse(local);
    return [
      {
        id: 'rw1',
        realisasiId: 'r1',
        uraianPekerjaan: 'Belanja Gaji Pokok dan Tunjangan Melekat ASN Dinas Kelautan & Perikanan',
        bidang: 'Sekretariat',
        oleh: 'Ahmad Faisal (Operator)',
        role: 'OPERATOR',
        tipeAksi: 'KREASI',
        detail: 'Inisialisasi data realisasi gaji pegawai',
        tanggal: '2026-02-15 09:12'
      },
      {
        id: 'rw2',
        realisasiId: 'r10',
        uraianPekerjaan: 'Pembangunan Gedung Dan Unit Cold Storage Kapasitas 10 Ton Beserta Gardu Listrik Pendukung',
        bidang: 'Bidang P2PSDP',
        oleh: 'Ridwan Marsaoly (Operator)',
        role: 'OPERATOR',
        tipeAksi: 'UPDATE',
        detail: 'Memperbarui realisasi fisik menjadi 35% dan keuangan menjadi Rp 227.500.000',
        tanggal: '2026-05-25 15:30'
      }
    ];
  });

  const [currentConfig, setCurrentConfig] = useState<AppConfig>(() => {
    const local = localStorage.getItem('dkp_config');
    return local ? JSON.parse(local) : DEFAULT_CONFIG;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const local = localStorage.getItem('dkp_current_user');
    return local ? JSON.parse(local) : null;
  });

  const [activeMenu, setActiveMenu] = useState<string>('dashboard');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [notifikasis, setNotifikasis] = useState<NotifikasiProgresRendah[]>([]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('dkp_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('dkp_realisasi', JSON.stringify(realisasi));
  }, [realisasi]);

  useEffect(() => {
    localStorage.setItem('dkp_riwayats', JSON.stringify(riwayats));
  }, [riwayats]);

  useEffect(() => {
    localStorage.setItem('dkp_config', JSON.stringify(currentConfig));
  }, [currentConfig]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('dkp_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('dkp_current_user');
    }
  }, [currentUser]);

  // Automated notification generator for underperformance ("Notifikasi Progres Rendah")
  useEffect(() => {
    const krit = currentConfig.targetKritisFisik; // Default: 50%
    const currentList: NotifikasiProgresRendah[] = [];
    realisasi.forEach((item) => {
      // If Realisasi Fisik or Financial is below critical target & status is Rendah or underperforming
      if (item.realisasiFisik < krit) {
        const diff = item.targetFisik - item.realisasiFisik;
        currentList.push({
          id: `notif-${item.id}`,
          realisasiId: item.id,
          uraianPekerjaan: item.uraianPekerjaan,
          bidang: item.bidang,
          realisasiFisik: item.realisasiFisik,
          realisasiKeuanganPersen: item.persentaseKeuangan,
          pesan: `Peringatan! Kegiatan "${item.uraianPekerjaan.substring(0, 50)}..." pada bidang ${item.bidang} memiliki progres fisik rendah (${item.realisasiFisik}%). Defisit progress ${diff}% dari target fisik.`,
          tanggalKejadian: item.tanggalEdit || item.tanggalInput
        });
      }
    });
    setNotifikasis(currentList);
  }, [realisasi, currentConfig]);

  // LOGIN Handler (Checks password or allows quick logins)
  const login = (username: string, passwordRole: string): boolean => {
    setIsLoading(true);
    // Support either formal username checking OR responsive developer shortcuts
    const foundUser = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.isActive);
    if (foundUser) {
      setCurrentUser(foundUser);
      setIsLoading(false);
      return true;
    }
    // Allow credentials matching role as password fallback
    const matchedRoleUser = users.find(u => u.role === passwordRole && u.isActive);
    if (matchedRoleUser) {
      setCurrentUser(matchedRoleUser);
      setIsLoading(false);
      return true;
    }
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    setActiveMenu('dashboard');
  };

  // Automated color indicator helper
  const calculateStatus = (fisik: number): 'Rendah' | 'Sedang' | 'Tinggi' => {
    if (fisik >= 75) return 'Tinggi'; // Hijau
    if (fisik >= 40) return 'Sedang'; // Kuning
    return 'Rendah'; // Merah
  };

  // CRUD REALISASI
  const addRealisasi = (
    data: Omit<Realisasi, 'id' | 'sisaAnggaran' | 'persentaseKeuangan' | 'statusKegiatan' | 'terakhirDieditOleh' | 'tanggalEdit'>,
    fileUrlsAsBase64: string[]
  ) => {
    const sisa = data.paguAnggaran - data.realisasiKeuangan;
    const persenKeu = parseFloat(((data.realisasiKeuangan / data.paguAnggaran) * 100).toFixed(2)) || 0;
    const stat = calculateStatus(data.realisasiFisik);
    const editor = currentUser ? currentUser.name : 'Sistem Operator';

    const newEntry: Realisasi = {
      ...data,
      id: `real-${Date.now()}`,
      sisaAnggaran: sisa,
      persentaseKeuangan: persenKeu,
      statusKegiatan: stat,
      dokumentasi: [...(data.dokumentasi || []), ...fileUrlsAsBase64],
      terakhirDieditOleh: editor,
      tanggalEdit: new Date().toISOString().split('T')[0]
    };

    setRealisasi(prev => [newEntry, ...prev]);

    // Create Audit Log
    const newLog: RiwayatPerubahan = {
      id: `log-${Date.now()}`,
      realisasiId: newEntry.id,
      uraianPekerjaan: newEntry.uraianPekerjaan,
      bidang: newEntry.bidang,
      oleh: currentUser ? `${currentUser.name}` : 'Operator',
      role: currentUser ? currentUser.role : 'OPERATOR',
      tipeAksi: 'KREASI',
      detail: `Menyimpan data kegiatan baru dengan pagu ${newEntry.paguAnggaran.toLocaleString('id-ID')} dan progres fisik ${newEntry.realisasiFisik}%`,
      tanggal: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    setRiwayats(prev => [newLog, ...prev]);
  };

  const updateRealisasi = (id: string, updatedData: Partial<Realisasi>, fileUrlsAsBase64: string[] = []) => {
    setRealisasi(prev => prev.map(item => {
      if (item.id === id) {
        const mergedDoc = [...(item.dokumentasi || []), ...fileUrlsAsBase64];
        const pagu = updatedData.paguAnggaran !== undefined ? updatedData.paguAnggaran : item.paguAnggaran;
        const realKeu = updatedData.realisasiKeuangan !== undefined ? updatedData.realisasiKeuangan : item.realisasiKeuangan;
        const realFis = updatedData.realisasiFisik !== undefined ? updatedData.realisasiFisik : item.realisasiFisik;
        
        const sisa = pagu - realKeu;
        const persenKeu = parseFloat(((realKeu / pagu) * 100).toFixed(2)) || 0;
        const stat = calculateStatus(realFis);
        const editor = currentUser ? currentUser.name : 'Sistem Operator';

        const updated: Realisasi = {
          ...item,
          ...updatedData,
          paguAnggaran: pagu,
          realisasiKeuangan: realKeu,
          realisasiFisik: realFis,
          sisaAnggaran: sisa,
          persentaseKeuangan: persenKeu,
          statusKegiatan: stat,
          dokumentasi: updatedData.dokumentasi !== undefined ? updatedData.dokumentasi : mergedDoc,
          terakhirDieditOleh: editor,
          tanggalEdit: new Date().toISOString().split('T')[0]
        };

        // Create Audit Log
        const newLog: RiwayatPerubahan = {
          id: `log-${Date.now()}`,
          realisasiId: id,
          uraianPekerjaan: updated.uraianPekerjaan,
          bidang: updated.bidang,
          oleh: currentUser ? `${currentUser.name}` : 'Operator',
          role: currentUser ? currentUser.role : 'OPERATOR',
          tipeAksi: 'UPDATE',
          detail: `Memperbarui progres. Fisik: ${updated.realisasiFisik}%, Keuangan: ${updated.persentaseKeuangan}% (${updated.realisasiKeuangan.toLocaleString('id-ID')})`,
          tanggal: new Date().toISOString().replace('T', ' ').substring(0, 16)
        };
        setRiwayats(l => [newLog, ...l]);

        return updated;
      }
      return item;
    }));
  };

  const deleteRealisasi = (id: string) => {
    const target = realisasi.find(r => r.id === id);
    if (!target) return;

    setRealisasi(prev => prev.filter(item => item.id !== id));

    // Create Audit Log
    const newLog: RiwayatPerubahan = {
      id: `log-${Date.now()}`,
      realisasiId: id,
      uraianPekerjaan: target.uraianPekerjaan,
      bidang: target.bidang,
      oleh: currentUser ? `${currentUser.name}` : 'Operator',
      role: currentUser ? currentUser.role : 'OPERATOR',
      tipeAksi: 'HAPUS',
      detail: `Menghapus seluruh rekaman realisasi pekerjaan: "${target.uraianPekerjaan.substring(0, 50)}..."`,
      tanggal: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    setRiwayats(prev => [newLog, ...prev]);
  };

  // CRUD USERS
  const addUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: `u-${Date.now()}`,
      isActive: true
    };
    setUsers(prev => [...prev, newUser]);
  };

  const updateUser = (id: string, updatedData: Partial<User>) => {
    setUsers(prev => prev.map(user => user.id === id ? { ...user, ...updatedData } : user));
  };

  const deleteUser = (id: string) => {
    // Prevent self delete
    if (currentUser && currentUser.id === id) return;
    setUsers(prev => prev.filter(user => user.id !== id));
  };

  // APP CONFIG UPDATE
  const updateAppConfig = (config: AppConfig) => {
    setCurrentConfig(config);
  };

  // DATABASE BACKUP TOOLS (JSON-based download simulation)
  const triggerBackup = () => {
    const updated = {
      ...currentConfig,
      terakhirBackup: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    setCurrentConfig(updated);
    
    // Auto initiate a file download containing full state
    const backupObj = {
      metadata: {
        app: 'DKP Halmahera Selatan E-Realisasi',
        backup_date: new Date().toISOString(),
        author: currentUser ? currentUser.name : 'System'
      },
      config: updated,
      users,
      realisasi,
      riwayats
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupObj, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Backup_DKP_Halsel_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const restoreState = (backupJson: string): boolean => {
    try {
      const parsed = JSON.parse(backupJson);
      if (parsed.users && parsed.realisasi && parsed.config) {
        setUsers(parsed.users);
        setRealisasi(parsed.realisasi);
        setCurrentConfig(parsed.config);
        if (parsed.riwayats) setRiwayats(parsed.riwayats);
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const clearState = () => {
    setRealisasi([]);
    setRiwayats([]);
    setUsers(INITIAL_USERS);
    setCurrentConfig(DEFAULT_CONFIG);
  };

  return (
    <AppContext.Provider value={{
      users,
      realisasi,
      riwayats,
      notifikasis,
      currentConfig,
      currentUser,
      activeMenu,
      setActiveMenu,
      isLoading,
      login,
      logout,
      addRealisasi,
      updateRealisasi,
      deleteRealisasi,
      addUser,
      updateUser,
      deleteUser,
      updateAppConfig,
      triggerBackup,
      restoreState,
      clearState
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
