import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AppConfig } from '../types';
import { Settings, Save, CheckCircle2, Copy, FileCode, HardDriveDownload, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';

const SQL_BLUEPRINTS = {
  postgresql: `-- SKEMA DDL DATABASE POSTGRESQL - DINAS KELAUTAN DAN PERIKANAN KAB. HALMAHERA SELATAN
-- Dioptimalkan dengan Indexing dan Generated Columns Otomatis

-- 1. Tabel Master Pengguna
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    nama_lengkap VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- 'ADMIN', 'OPERATOR', 'PIMPINAN'
    bidang VARCHAR(100) NOT NULL, -- 'Semua', 'Sekretariat', 'Bidang Perikanan Tangkap', etc
    is_active BOOLEAN DEFAULT TRUE
);

-- 2. Tabel Master Bidang Organisasi DKP
CREATE TABLE bidang (
    id VARCHAR(50) PRIMARY KEY,
    nama_bidang VARCHAR(255) UNIQUE NOT NULL
);

-- 3. Tabel Master Rencana Program
CREATE TABLE program (
    id VARCHAR(50) PRIMARY KEY,
    bidang_id VARCHAR(50) REFERENCES bidang(id),
    nama_program TEXT NOT NULL,
    tahun_anggaran VARCHAR(10) NOT NULL
);

-- 4. Tabel Kegiatan Kerja
CREATE TABLE kegiatan (
    id VARCHAR(50) PRIMARY KEY,
    program_id VARCHAR(50) REFERENCES program(id),
    nama_kegiatan TEXT NOT NULL
);

-- 5. Tabel Sub Kegiatan Kerja
CREATE TABLE sub_kegiatan (
    id VARCHAR(50) PRIMARY KEY,
    kegiatan_id VARCHAR(50) REFERENCES kegiatan(id),
    nama_sub_kegiatan TEXT NOT NULL
);

-- 6. Tabel Utama Realisasi Capaian
CREATE TABLE realisasi (
    id VARCHAR(50) PRIMARY KEY,
    sub_kegiatan_id VARCHAR(50) REFERENCES sub_kegiatan(id),
    uraian_pekerjaan TEXT NOT NULL,
    lokasi_desa VARCHAR(255) NOT NULL,
    lokasi_kecamatan VARCHAR(255) NOT NULL,
    target_fisik NUMERIC(5,2) DEFAULT 100.00,
    realisasi_fisik NUMERIC(5,2) DEFAULT 0.00,
    pagu_anggaran NUMERIC(15,2) NOT NULL,
    realisasi_keuangan NUMERIC(15,2) DEFAULT 0.00,
    -- Otomatis sisa dan persentase keuangan dihitung secara matematis
    sisa_anggaran NUMERIC(15,2) GENERATED ALWAYS AS (pagu_anggaran - realisasi_keuangan) STORED,
    persentase_keuangan NUMERIC(5,2) GENERATED ALWAYS AS ((realisasi_keuangan / NULLIF(pagu_anggaran, 0)) * 100) STORED,
    tanggal_input DATE NOT NULL,
    bulan VARCHAR(50) NOT NULL,
    status_kegiatan VARCHAR(50) NOT NULL, -- 'Tinggi', 'Sedang', 'Rendah'
    terakhir_diedit_oleh VARCHAR(255) NOT NULL,
    tanggal_edit DATE,
    CONSTRAINT check_real_fisik CHECK (realisasi_fisik <= 100.00),
    CONSTRAINT check_real_keu CHECK (realisasi_keuangan <= pagu_anggaran)
);

-- 7. Tabel Lampiran Dokumentasi Visual (Multi upload photos)
CREATE TABLE dokumentasi (
    id VARCHAR(50) PRIMARY KEY,
    realisasi_id VARCHAR(50) REFERENCES realisasi(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL, -- base64 atau path file storage s3
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indeks Kinerja Query
CREATE INDEX idx_realisasi_bidang ON realisasi(tanggal_input);
CREATE INDEX idx_realisasi_kecamatan ON realisasi(lokasi_kecamatan);
`,
  mysql: `-- SKEMA DDL DATABASE MYSQL - DINAS KELAUTAN DAN PERIKANAN KAB. HALMAHERA SELATAN
-- Versi MySQL 8.0+ Dengan Generated Columns

CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    nama_lengkap VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    bidang VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE bidang (
    id VARCHAR(50) PRIMARY KEY,
    nama_bidang VARCHAR(255) UNIQUE NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE program (
    id VARCHAR(50) PRIMARY KEY,
    bidang_id VARCHAR(50),
    nama_program TEXT NOT NULL,
    tahun_anggaran VARCHAR(10) NOT NULL,
    FOREIGN KEY (bidang_id) REFERENCES bidang(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE kegiatan (
    id VARCHAR(50) PRIMARY KEY,
    program_id VARCHAR(50),
    nama_kegiatan TEXT NOT NULL,
    FOREIGN KEY (program_id) REFERENCES program(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE sub_kegiatan (
    id VARCHAR(50) PRIMARY KEY,
    kegiatan_id VARCHAR(50),
    nama_sub_kegiatan TEXT NOT NULL,
    FOREIGN KEY (kegiatan_id) REFERENCES kegiatan(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE realisasi (
    id VARCHAR(50) PRIMARY KEY,
    sub_kegiatan_id VARCHAR(50),
    uraian_pekerjaan TEXT NOT NULL,
    lokasi_desa VARCHAR(255) NOT NULL,
    lokasi_kecamatan VARCHAR(255) NOT NULL,
    target_fisik DECIMAL(5,2) DEFAULT 100.00,
    realisasi_fisik DECIMAL(5,2) DEFAULT 0.00,
    pagu_anggaran DECIMAL(15,2) NOT NULL,
    realisasi_keuangan DECIMAL(15,2) DEFAULT 0.00,
    -- Generated Columns
    sisa_anggaran DECIMAL(15,2) GENERATED ALWAYS AS (pagu_anggaran - realisasi_keuangan) STORED,
    persentase_keuangan DECIMAL(5,2) GENERATED ALWAYS AS ((realisasi_keuangan / pagu_anggaran) * 100) STORED,
    tanggal_input DATE NOT NULL,
    bulan VARCHAR(50) NOT NULL,
    status_kegiatan VARCHAR(50) NOT NULL,
    terakhir_diedit_oleh VARCHAR(255) NOT NULL,
    tanggal_edit DATE,
    FOREIGN KEY (sub_kegiatan_id) REFERENCES sub_kegiatan(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE dokumentasi (
    id VARCHAR(50) PRIMARY KEY,
    realisasi_id VARCHAR(50),
    photo_url LONGTEXT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (realisasi_id) REFERENCES realisasi(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`
};

export const Pengaturan: React.FC = () => {
  const { currentConfig, updateAppConfig, triggerBackup, restoreState, clearState } = useApp();

  // Settings states
  const [namaAplikasi, setNamaAplikasi] = useState(currentConfig.namaAplikasi);
  const [namaInstansi, setNamaInstansi] = useState(currentConfig.namaInstansi);
  const [pemerintahDaerah, setPemerintahDaerah] = useState(currentConfig.pemerintahDaerah);
  const [tahunAnggaranAktif, setTahunAnggaranAktif] = useState(currentConfig.tahunAnggaranAktif);
  const [targetKritisFisik, setTargetKritisFisik] = useState(currentConfig.targetKritisFisik);
  const [alamat, setAlamat] = useState(currentConfig.alamat);

  // Status triggers
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [sqlTab, setSqlTab] = useState<'postgresql' | 'mysql'>('postgresql');
  const [copySuccess, setCopySuccess] = useState(false);
  const [restoreStatus, setRestoreStatus] = useState<'IDLE' | 'SUCCESS' | 'ERROR'>('IDLE');

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateAppConfig({
      ...currentConfig,
      namaAplikasi,
      namaInstansi,
      pemerintahDaerah,
      tahunAnggaranAktif,
      targetKritisFisik,
      alamat
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_BLUEPRINTS[sqlTab]);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRestoreStatus('IDLE');
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        const ok = restoreState(text);
        if (ok) {
          setRestoreStatus('SUCCESS');
          setTimeout(() => window.location.reload(), 1500); // Reload to flush state
        } else {
          setRestoreStatus('ERROR');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6" id="settings-tab-view">
      
      {/* 2. DPA FORM CONFIGURATION PARAMETERS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5" id="settings-bento">
        {/* Instansi config form */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/95 shadow-xl lg:col-span-2 space-y-4" id="card-config-fields">
          <div className="flex items-center gap-2 border-b border-slate-105 pb-3">
            <Settings className="w-5 h-5 text-sky-700" />
            <h3 className="text-xs font-black uppercase text-slate-905">Konfigurasi Instansi & Tahun</h3>
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-4 text-xs" id="config-form">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-705 uppercase tracking-wide mb-1">Nama Aplikasi Pelaporan</label>
                <input
                  type="text"
                  required
                  value={namaAplikasi}
                  onChange={(e) => setNamaAplikasi(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-705 uppercase tracking-wide mb-1 font-sans">Dinas Kantor Publik</label>
                <input
                  type="text"
                  required
                  value={namaInstansi}
                  onChange={(e) => setNamaInstansi(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 text-slate-900 font-extrabold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-705 uppercase tracking-wide mb-1">Pemerintah Kabupaten / Daerah</label>
                <input
                  type="text"
                  required
                  value={pemerintahDaerah}
                  onChange={(e) => setPemerintahDaerah(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 text-slate-900 font-extrabold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-405 uppercase tracking-wide mb-1">Tahun Anggaran</label>
                  <select
                    value={tahunAnggaranAktif}
                    onChange={(e) => setTahunAnggaranAktif(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-white font-mono text-center font-bold"
                  >
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                    <option value="2028">2028</option>
                    <option value="2029">2029</option>
                    <option value="2030">2030</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-405 uppercase tracking-wide mb-1">Limit Kritis Kinerja (%)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="99"
                    value={targetKritisFisik}
                    onChange={(e) => setTargetKritisFisik(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl bg-white text-center font-bold text-red-650"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-705 uppercase tracking-wide mb-1">Alamat Resmi Kantor Dinas</label>
              <input
                type="text"
                required
                value={alamat}
                onChange={(e) => setAlamat(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl bg-white"
              />
            </div>

            {saveSuccess && (
              <p className="text-xs font-semibold text-emerald-800 bg-emerald-50 border p-2 rounded-lg flex gap-1.5 items-center">
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                Parameter metadata DPA berhasil diperbarui dan disimpan!
              </p>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4.5 py-2 bg-sky-700 hover:bg-sky-850 rounded-xl text-white font-bold cursor-pointer shadow-md"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Konfigurasi</span>
              </button>
            </div>
          </form>
        </div>

        {/* Dynamic Database Backup and Actions */}
        <div className="bg-white p-6 rounded-3xl border border-slate-202 shadow-xl flex flex-col justify-between" id="card-db-actions">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b pb-2.5">
              <HardDriveDownload className="w-5 h-5 text-indigo-700" />
              <h3 className="text-xs font-black uppercase text-slate-805">Backup & Pemeliharaan</h3>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Aplikasi dibangun secara offline-first dengan persistent state. Anda dapat mengunduh seluruh data dalam format JSON sebagai bentuk salinan / arsip database yang sah.
            </p>

            <div className="space-y-2.5 pt-2">
              {/* Backup triggers */}
              <button
                onClick={triggerBackup}
                className="w-full flex items-center justify-between p-3 border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-900 rounded-xl text-xs font-bold transition cursor-pointer"
                id="btn-trigger-full-backup"
              >
                <span>Unduh Backup Database (.JSON)</span>
                <span className="bg-indigo-700 text-white text-[9px] font-semibold px-2 py-0.5 rounded-md">BACKUP</span>
              </button>

              {/* Restore triggers */}
              <div className="border border-slate-200 hover:border-sky-305 rounded-xl p-3 transition relative cursor-pointer" id="restore-uploader-ref">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleRestoreFile}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  title="Upload JSON File"
                />
                <div className="text-left text-xs text-slate-700">
                  <span className="block font-bold">Unggah & Restore Database</span>
                  <span className="block text-[10px] text-slate-400 mt-0.5">Pilih file JSON cadangan untuk dipasang</span>
                </div>
              </div>

              {restoreStatus === 'SUCCESS' && (
                <div className="text-[10px] bg-emerald-50 text-emerald-800 border p-2 rounded-lg font-bold">
                  Selesai! Database dipulihkan. Me-reload sistem...
                </div>
              )}
              {restoreStatus === 'ERROR' && (
                <div className="text-[10px] bg-rose-50 text-rose-800 border p-2 rounded-lg font-mono font-bold">
                  Galat: Berkas cadangan yang diunggah tidak valid!
                </div>
              )}
            </div>
          </div>

          <div className="pt-5 border-t border-slate-100" id="db-danger-panel">
            <span className="text-[9px] uppercase font-bold text-slate-400">DANGER ZONE</span>
            <button
              onClick={() => {
                if (window.confirm('PERINGATAN: Seluruh paket kerja, dokumentasi foto, dan rekapitulasi akan dihapus permanen! Kosongkan database?')) {
                  clearState();
                  window.location.reload();
                }
              }}
              className="mt-1.5 w-full flex items-center justify-center gap-1.5 py-2 border-rose-200 hover:border-rose-300 text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-bold transition-all cursor-pointer border"
              id="btn-clear-db"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Bersihkan & Reset Database Master</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. COPIABLE PROMPT-REQUESTED DATABASE SCHEMA (INTEGRATION COMPLIANCE) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-205 shadow-xl space-y-4" id="sql-blueprints-card">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-105 pb-3">
          <div className="flex items-center gap-2">
            <FileCode className="w-5.5 h-3.5 text-slate-800" />
            <div>
              <h3 className="text-xs font-black uppercase text-slate-905">Skema DDL Database Terpadu (Indonesian)</h3>
              <p className="text-[10px] text-slate-400 font-medium">Berdasarkan relational blueprint users, bidang, program, kegiatan, realisasi, dokumentasi</p>
            </div>
          </div>

          {/* Selector SQL syntax */}
          <div className="flex items-center gap-2 shrink-0 text-xs" id="sql-tab-switches">
            <button
              onClick={() => setSqlTab('postgresql')}
              className={`px-3 py-1 rounded-lg font-bold cursor-pointer transition ${
                sqlTab === 'postgresql' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              PostgreSQL Schema
            </button>
            <button
              onClick={() => setSqlTab('mysql')}
              className={`px-3 py-1 rounded-lg font-bold cursor-pointer transition ${
                sqlTab === 'mysql' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              MySQL DDL Schema
            </button>
            <button
              onClick={handleCopySql}
              className="flex items-center gap-1 px-2.5 py-1 border border-slate-300 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-700 font-bold transition cursor-pointer"
              title="Salin SQL"
              id="btn-copy-sql-code"
            >
              {copySuccess ? 'Tersalin!' : 'Salin SQL'} <Copy className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Copiable Code Container */}
        <div className="relative rounded-2xl bg-slate-950 p-4 border overflow-hidden max-h-96 overflow-y-auto" id="sql-code-scroll-box">
          <pre className="text-sky-305 font-mono text-[10px] leading-relaxed whitespace-pre" id="sql-code-pre">
            {SQL_BLUEPRINTS[sqlTab]}
          </pre>
        </div>

        <div className="bg-indigo-50/70 rounded-2xl p-4 border border-indigo-150 font-medium text-xs text-indigo-900 flex gap-2.5 items-start" id="relational-blueprint-notes">
          <ShieldCheck className="w-5.5 h-5.5 text-indigo-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong>Relational Blueprint Integration Note:</strong>
            <p className="leading-relaxed">
              Skema database SQL relasional di atas telah dirancang untuk mendukung integrasi web interaktif ini ke dalam sistem internal DKP Halmahera Selatan secara penuh. Semua kunci asing (foreign key) dideklarasikan dengan referensi integritas cascade untuk mendukung fungsionalitas CRUD secara aman.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
