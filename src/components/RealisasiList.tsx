import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Realisasi, BidangType } from '../types';
import { RealisasiForm } from './RealisasiForm';
import { 
  Search, 
  Plus, 
  Trash2, 
  Edit, 
  Eye, 
  Filter, 
  Download, 
  MapPin, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  FolderOpen,
  Calendar,
  X,
  ChevronLeft,
  ChevronRight,
  Printer,
  ChevronDown,
  Image
} from 'lucide-react';

export const RealisasiList: React.FC = () => {
  const { 
    realisasi, 
    deleteRealisasi, 
    currentUser, 
    currentConfig 
  } = useApp();

  // Dialog and panel views states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEditId, setSelectedEditId] = useState<string | undefined>(undefined);
  const [selectedDetailId, setSelectedDetailId] = useState<string | null>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBidang, setFilterBidang] = useState<string>('Semua');
  const [filterKecamatan, setFilterKecamatan] = useState<string>('Semua');
  const [filterStatus, setFilterStatus] = useState<string>('Semua');
  const [filterBulan, setFilterBulan] = useState<string>('Semua');

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Populate helper lists for filters based on active data
  const kecamatanList = useMemo(() => {
    const list = realisasi.map(r => r.lokasiKecamatan);
    return ['Semua', ...Array.from(new Set(list))];
  }, [realisasi]);

  const bulanList = [
    'Semua', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  // Apply filters and search queries
  const filteredData = useMemo(() => {
    return realisasi.filter(item => {
      const matchSearch = 
        item.program.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.kegiatan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subKegiatan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.uraianPekerjaan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.lokasiDesa.toLowerCase().includes(searchQuery.toLowerCase());

      const matchBidang = filterBidang === 'Semua' || item.bidang === filterBidang;
      const matchKecamatan = filterKecamatan === 'Semua' || item.lokasiKecamatan === filterKecamatan;
      const matchStatus = filterStatus === 'Semua' || item.statusKegiatan === filterStatus;
      const matchBulan = filterBulan === 'Semua' || item.bulan === filterBulan;

      return matchSearch && matchBidang && matchKecamatan && matchStatus && matchBulan;
    });
  }, [realisasi, searchQuery, filterBidang, filterKecamatan, filterStatus, filterBulan]);

  // Paginated data set
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterBidang, filterKecamatan, filterStatus, filterBulan]);

  // Format currencies helpers
  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num);
  };

  const handleDownloadImage = (src: string, index: number, item: Realisasi) => {
    const cleanUraian = item.uraianPekerjaan.replace(/[^a-z0-9]/gi, '_').substring(0, 30);
    const filename = `Dokumentasi_${item.bidang.replace(/[^a-z0-9]/gi, '_')}_${cleanUraian}_${index + 1}.png`;
    
    const link = document.createElement('a');
    link.href = src;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Colored progress styles
  const getStatusStyle = (status: 'Rendah' | 'Sedang' | 'Tinggi') => {
    switch (status) {
      case 'Tinggi':
        return 'bg-emerald-50 text-emerald-800 border-emerald-250'; // Hijau
      case 'Sedang':
        return 'bg-amber-50 text-amber-850 border-amber-250'; // Kuning
      default:
        return 'bg-rose-50 text-rose-850 border-rose-250'; // Merah
    }
  };

  const getFisikStatusBadge = (persen: number) => {
    if (persen >= 75) return <span className="bg-emerald-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-sm">TINGGI ({persen}%)</span>;
    if (persen >= 40) return <span className="bg-amber-500 text-slate-900 text-[9px] font-extrabold px-1.5 py-0.5 rounded-sm">SEDANG ({persen}%)</span>;
    return <span className="bg-rose-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-sm">RENDAH ({persen}%)</span>;
  };

  // Checking authority rules for buttons
  const canModifyItem = (item: Realisasi) => {
    if (!currentUser) return false;
    if (currentUser.role === 'ADMIN') return true;
    if (currentUser.role === 'OPERATOR' && currentUser.bidang === item.bidang) return true;
    return false;
  };

  const selectedDetailItem = useMemo(() => {
    return realisasi.find(r => r.id === selectedDetailId) || null;
  }, [realisasi, selectedDetailId]);

  const handlePrintDetail = (item: Realisasi) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>DKP LPS - Detail Realisasi</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
            .header { text-align: center; border-bottom: 3px double #334155; padding-bottom: 15px; margin-bottom: 30px; }
            .badge { font-family: monospace; padding: 4px 8px; border-radius: 4px; font-weight: bold; }
            .meta-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .meta-table td { padding: 8px; border-bottom: 1px solid #e2e8f0; }
            .meta-table td.label { font-weight: bold; width: 180px; text-transform: uppercase; font-size: 11px; color: #64748b; }
            .amount { font-family: monospace; font-size: 15px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h3>PEMERINTAH KABUPATEN HALMAHERA SELATAN</h3>
            <h2>DINAS KELAUTAN DAN PERIKANAN</h2>
            <p style="font-size: 11px;">Jl. Karet No. 4, Kawasan Pemerintahan Bumi Moro, Labuha • T.A. ${currentConfig.tahunAnggaranAktif}</p>
          </div>
          <h3>LAPORAN DETIL REALISASI FISIK & KEUANGAN</h3>
          <table class="meta-table">
            <tr><td class="label">Pekerjaan ID</td><td>${item.id}</td></tr>
            <tr><td class="label">Bidang Pelaksana</td><td><strong>${item.bidang}</strong></td></tr>
            <tr><td class="label">Program</td><td>${item.program}</td></tr>
            <tr><td class="label">Kegiatan</td><td>${item.kegiatan}</td></tr>
            <tr><td class="label">Sub Kegiatan</td><td>${item.subKegiatan}</td></tr>
            <tr><td class="label">Uraian Pekerjaan</td><td>${item.uraianPekerjaan}</td></tr>
            <tr><td class="label">Lokasi Kerja</td><td>Desa ${item.lokasiDesa}, Kecamatan ${item.lokasiKecamatan}</td></tr>
            <tr><td class="label">Status Pencapaian</td><td><span class="badge">${item.statusKegiatan}</span></td></tr>
            <tr><td class="label">Rencana Target Fisik</td><td>${item.targetFisik}%</td></tr>
            <tr><td class="label">Realisasi Fisik Kerja</td><td>${item.realisasiFisik}%</td></tr>
            <tr><td class="label">Pagu Anggaran DPA</td><td class="amount">${formatIDR(item.paguAnggaran)}</td></tr>
            <tr><td class="label">Realisasi Keuangan</td><td class="amount">${formatIDR(item.realisasiKeuangan)} (${item.persentaseKeuangan}%)</td></tr>
            <tr><td class="label">Sisa Anggaran DPA</td><td class="amount">${formatIDR(item.sisaAnggaran)}</td></tr>
            <tr><td class="label">Tanggal Pelaporan</td><td>${item.tanggalInput} (${item.bulan})</td></tr>
            <tr><td class="label">Verifikator Pembuat</td><td>${item.terakhirDieditOleh}</td></tr>
          </table>
          <div style="margin-top: 50px; text-align: right;">
            <p>Labuha, Halmahera Selatan</p>
            <br/><br/><br/>
            <p><strong>Dr. Muh. Yusuf, M.Si</strong><br/>Kepala Dinas Kelautan dan Perikanan</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-6" id="realisasi-tab-view">
      
      {/* 1. FILTER BAR PANEL BOARD */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/95 shadow-xs space-y-4" id="filters-card">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-sky-700" />
            <h3 className="text-sm font-extrabold text-slate-900 uppercase">Penyaringan Data Realisasi</h3>
          </div>
          
          {/* Quick Clear filters */}
          {(searchQuery || filterBidang !== 'Semua' || filterKecamatan !== 'Semua' || filterStatus !== 'Semua' || filterBulan !== 'Semua') && (
            <button 
              onClick={() => {
                setSearchQuery('');
                setFilterBidang('Semua');
                setFilterKecamatan('Semua');
                setFilterStatus('Semua');
                setFilterBulan('Semua');
              }}
              className="text-[11px] font-bold text-red-650 hover:text-red-800 bg-red-50 px-2.5 py-1 rounded-lg border border-red-100"
            >
              Bersihkan Filter
            </button>
          )}
        </div>

        {/* Filters Select Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5" id="filters-selectors-grid">
          {/* Search text query */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari program/uraian..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs bg-slate-50/50 focus:ring-sky-500 focus:border-sky-500 text-slate-800"
            />
          </div>

          {/* Bidang Pelaksana Filter */}
          <div>
            <select
              value={filterBidang}
              onChange={(e) => setFilterBidang(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white text-slate-750 font-medium"
            >
              <option value="Semua">Semua Bidang</option>
              <option value="Sekretariat">Sekretariat</option>
              <option value="Bidang Perikanan Tangkap">Perikanan Tangkap</option>
              <option value="Bidang Perikanan Budidaya">Perikanan Budidaya</option>
              <option value="Bidang P2PSDP">P2PSDP</option>
            </select>
          </div>

          {/* Kecamatan Filter */}
          <div>
            <select
              value={filterKecamatan}
              onChange={(e) => setFilterKecamatan(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white text-slate-750 font-medium"
            >
              <option value="Semua">Semua Kecamatan</option>
              {kecamatanList.filter(k => k !== 'Semua').map(kec => (
                <option key={kec} value={kec}>{kec}</option>
              ))}
            </select>
          </div>

          {/* Level Fisik Status */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white text-slate-755 font-medium"
            >
              <option value="Semua">Semua Status Fisik</option>
              <option value="Tinggi">Tinggi (Fisik &gt;= 75%)</option>
              <option value="Sedang">Sedang (Fisik 40% - 74%)</option>
              <option value="Rendah">Rendah (Fisik &lt; 40%)</option>
            </select>
          </div>

          {/* Month selective */}
          <div>
            <select
              value={filterBulan}
              onChange={(e) => setFilterBulan(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white text-slate-755 font-medium"
            >
              {bulanList.map(bln => (
                <option key={bln} value={bln}>{bln === 'Semua' ? 'Semua Bulan' : bln}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. ACTIONS AND COUNTS BAR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-900 text-white p-4.5 rounded-2xl border" id="table-controls-strip">
        <div>
          <span className="bg-sky-500/20 text-sky-400 border border-sky-500/30 text-[9px] font-mono tracking-widest px-2.5 py-0.5 rounded-sm">
            E-DPA DATABASE
          </span>
          <p className="text-xs font-bold uppercase tracking-wide mt-1">
            Ditemukan {filteredData.length} Kegiatan Program / Pekerjaan
          </p>
        </div>

        {/* Create entries buttons (Locked on role authentication policies) */}
        {currentUser?.role !== 'PIMPINAN' ? (
          <button
            onClick={() => {
              setSelectedEditId(undefined);
              setIsFormOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700/90 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all shrink-0"
            id="btn-add-realisasi"
          >
            <Plus className="w-4.5 h-4.5" />
            <span>Rekam Kegiatan</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-yellow-450/20 border border-yellow-400 text-yellow-300 rounded-lg text-[10px] font-bold">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            <span>Mode Baca-Saja (Pimpinan)</span>
          </div>
        )}
      </div>

      {/* 3. CORE EDIT FORM OVERLAY MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto" id="form-modal-overlay">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto my-auto rounded-3xl shrink-0 shadow-2xl">
            <RealisasiForm 
              realisasiId={selectedEditId} 
              onClose={() => {
                setIsFormOpen(false);
                setSelectedEditId(undefined);
              }} 
            />
          </div>
        </div>
      )}

      {/* 4. DETAILS CARD PREVIEW DRAWER DRAWER */}
      {selectedDetailId && selectedDetailItem && (
        <div className="fixed inset-0 z-50 flex justify-end" id="detail-drawer-overlay">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setSelectedDetailId(null)}></div>
          
          <div className="relative w-full max-w-md sm:max-w-lg bg-white h-full shadow-2xl z-10 flex flex-col justify-between border-l border-slate-100" id="detail-drawer">
            {/* Header Drawer */}
            <div className="p-5.5 bg-slate-900 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-sky-450" />
                <h3 className="text-xs font-extrabold uppercase">Rincian Paket Pekerjaan</h3>
              </div>
              <button onClick={() => setSelectedDetailId(null)} className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable details stack */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6" id="detail-drawer-body">
              {/* Bidang and Status */}
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-xs font-bold text-slate-800">{selectedDetailItem.bidang}</span>
                {getFisikStatusBadge(selectedDetailItem.realisasiFisik)}
              </div>

              {/* Cascade texts */}
              <div className="space-y-3.5">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none block">Program</span>
                  <span className="text-xs text-slate-800 font-semibold">{selectedDetailItem.program}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none block">Kegiatan</span>
                  <span className="text-xs text-slate-800 font-semibold">{selectedDetailItem.kegiatan}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none block">Sub Kegiatan</span>
                  <span className="text-xs text-slate-800 font-semibold">{selectedDetailItem.subKegiatan}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none block">Uraian Pekerjaan</span>
                  <p className="text-sm text-slate-900 font-bold leading-relaxed">{selectedDetailItem.uraianPekerjaan}</p>
                </div>
              </div>

              {/* Geography and Metadata */}
              <div className="grid grid-cols-2 gap-4 bg-sky-50/30 p-4 border border-sky-100 rounded-xl text-xs">
                <div>
                  <span className="block text-[9px] uppercase font-bold text-slate-400">Desa</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-sky-600" />
                    {selectedDetailItem.lokasiDesa}
                  </span>
                </div>
                <div>
                  <span className="block text-[9px] uppercase font-bold text-slate-400">Kecamatan</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-sky-600" />
                    {selectedDetailItem.lokasiKecamatan}
                  </span>
                </div>
                <div>
                  <span className="block text-[9px] uppercase font-bold text-slate-400">Tahun Anggaran</span>
                  <span className="font-semibold text-slate-705 flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    T.A. {selectedDetailItem.tahunAnggaran}
                  </span>
                </div>
                <div>
                  <span className="block text-[9px] uppercase font-bold text-slate-400">Bulan</span>
                  <span className="font-semibold text-slate-705 flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    {selectedDetailItem.bulan}
                  </span>
                </div>
              </div>

              {/* Budging parameters */}
              <div className="space-y-2 bg-slate-55 p-4 rounded-xl border border-slate-100">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Nilai Pagu Anggaran</span>
                  <span className="font-mono font-extrabold text-slate-800">{formatIDR(selectedDetailItem.paguAnggaran)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Realisasi Keuangan ({selectedDetailItem.persentaseKeuangan}%)</span>
                  <span className="font-mono font-extrabold text-emerald-650">{formatIDR(selectedDetailItem.realisasiKeuangan)}</span>
                </div>
                <div className="flex justify-between items-center text-xs pt-1.5 border-t border-dashed">
                  <span className="text-slate-405 font-medium">Sisa Sisa Anggaran (Otomatis)</span>
                  <span className="font-mono font-black text-rose-650">{formatIDR(selectedDetailItem.sisaAnggaran)}</span>
                </div>
              </div>

              {/* Progress Level slider displays */}
              <div className="space-y-3 bg-slate-50 p-4 border border-slate-100 rounded-xl">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-550">Kemajuan Realisasi Fisik Lapangan</span>
                    <span className="text-slate-850 font-bold">{selectedDetailItem.realisasiFisik}% / {selectedDetailItem.targetFisik}% Target</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-sky-655 transition-all" style={{ width: `${selectedDetailItem.realisasiFisik}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-550">Kemajuan Penyerapan Keuangan</span>
                    <span className="text-emerald-700 font-bold">{selectedDetailItem.persentaseKeuangan}%</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${selectedDetailItem.persentaseKeuangan}%` }}></div>
                  </div>
                </div>
              </div>

              {/* Documentation image attachments */}
              {selectedDetailItem.dokumentasi && selectedDetailItem.dokumentasi.length > 0 ? (
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Galeri Foto Lampiran ({selectedDetailItem.dokumentasi.length})</span>
                  <div className="grid grid-cols-2 gap-2.5">
                    {selectedDetailItem.dokumentasi.map((photo, i) => (
                      <div key={i} className="aspect-video relative rounded-lg border border-slate-100 overflow-hidden shadow-xs hover:shadow-md transition group">
                        <img referrerPolicy="no-referrer" src={photo} alt={`Lampiran ${i+1}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-150 flex items-center justify-center">
                          <button
                            onClick={() => handleDownloadImage(photo, i, selectedDetailItem)}
                            className="p-1.5 bg-white text-slate-900 rounded hover:bg-slate-100 shadow-xs border transition flex items-center gap-1 text-[9px] font-bold cursor-pointer"
                            title="Download/Unduh Foto"
                          >
                            <Download className="w-3.5 h-3.5 text-blue-950" />
                            <span>Download</span>
                          </button>
                        </div>
                        <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded-xs">Slide {i+1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center italic text-slate-400 border border-dashed rounded-xl text-xs flex flex-col items-center gap-1.5 bg-slate-50/50">
                  <Image className="w-8 h-8 text-slate-300" />
                  <span>Tidak ada lampiran foto dokumentasi fisik kegiatan terpaut.</span>
                </div>
              )}
            </div>

            {/* Print Detail Action at bottom */}
            <div className="p-4.5 bg-slate-50 border-t border-slate-150 flex gap-2 shrink-0">
              <button
                onClick={() => handlePrintDetail(selectedDetailItem)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-slate-900 text-white border rounded-xl text-xs font-bold cursor-pointer transition hover:bg-slate-850"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Lembar Detail</span>
              </button>
              <button
                onClick={() => setSelectedDetailId(null)}
                className="px-4.5 py-2.5 border border-slate-305 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. GORGEOUS MAIN DATA TABLE GRID FRAME */}
      <div className="bg-white rounded-3xl border border-slate-205/95 shadow-xl overflow-hidden" id="realisasi-table-wrapper">
        <div className="overflow-x-auto min-w-full">
          <table className="min-w-full divide-y divide-slate-150 text-xs table-auto" id="realisasi-core-grid">
            <thead className="bg-slate-900 text-white uppercase font-sans font-extrabold tracking-wider border-b-2 text-[10px]" id="table-head">
              <tr>
                <th scope="col" className="px-4 py-3 text-center font-bold tracking-tight w-12">No</th>
                <th scope="col" className="px-5 py-3 text-left w-1/4">Program / Kegiatan / Sub / Uraian</th>
                <th scope="col" className="px-4 py-3 text-center">Lokasi Kerja</th>
                <th scope="col" className="px-4 py-3 text-center w-24">Target Fisik</th>
                <th scope="col" className="px-4 py-3 text-center w-28">Realisasi Fisik</th>
                <th scope="col" className="px-4 py-3 text-right">Pagu Anggaran</th>
                <th scope="col" className="px-4 py-3 text-right">Realisasi Keu</th>
                <th scope="col" className="px-4 py-3 text-right">Sisa Anggaran</th>
                <th scope="col" className="px-4 py-3 text-center w-14">Galeri</th>
                <th scope="col" className="px-4 py-3 text-center w-28">Aksi Terpadu</th>
              </tr>
            </thead>
            
            <tbody className="bg-white divide-y divide-slate-150" id="table-body">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-slate-400 italic font-semibold text-xs">
                    Data tidak ditemukan. Silakan sesuaikan penyaringan filter Anda.
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, index) => {
                  const sequentialNo = (currentPage - 1) * itemsPerPage + index + 1;
                  const isOwner = canModifyItem(item);
                  return (
                    <tr 
                      key={item.id} 
                      className="hover:bg-sky-50/15 odd:bg-slate-50/20 group transition-all"
                      id={`row-realisasi-${item.id}`}
                    >
                      {/* 1. Sequential Number */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-center font-mono font-bold text-slate-500 border-r border-slate-100">
                        {sequentialNo}
                      </td>

                      {/* 2. Program Cascade Text Block */}
                      <td className="px-5 py-3.5">
                        <div className="space-y-1 max-w-sm sm:max-w-md">
                          {/* Bidang Pelaksana tag */}
                          <p className="inline-block text-[8.5px] font-bold uppercase tracking-wider text-sky-800 bg-sky-50 border border-sky-100 px-1.5 py-0.5 rounded-sm mb-0.5">
                            {item.bidang}
                          </p>
                          <p className="text-[10px] text-slate-400 font-bold leading-tight truncate" title={item.program}>
                            PROG: {item.program}
                          </p>
                          <p className="text-[10.5px] text-slate-600 font-medium leading-tight truncate" title={item.subKegiatan}>
                            SUB: {item.subKegiatan}
                          </p>
                          <p className="text-xs text-slate-900 font-extrabold leading-normal break-words">
                            {item.uraianPekerjaan}
                          </p>
                        </div>
                      </td>

                      {/* 3. Geography location */}
                      <td className="px-4 py-3.5 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="font-extrabold text-slate-800">{item.lokasiDesa}</span>
                          <span className="text-[10px] text-slate-450 font-semibold tracking-wider uppercase">Kec. {item.lokasiKecamatan}</span>
                        </div>
                      </td>

                      {/* 4. Plan target % */}
                      <td className="px-4 py-3.5 text-center whitespace-nowrap font-mono font-bold text-slate-700">
                        {item.targetFisik}%
                      </td>

                      {/* 5. Realisation status badge with physical performance color */}
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <div className="inline-flex flex-col items-center gap-1">
                          <span className={`px-2 py-1 rounded-md text-[10px] font-black border tracking-wide uppercase shadow-xs ${getStatusStyle(item.statusKegiatan)}`}>
                            {item.statusKegiatan}
                          </span>
                          <span className="font-mono text-[10.5px] font-bold text-slate-500">{item.realisasiFisik}% Capaian</span>
                        </div>
                      </td>

                      {/* 6. Pagu IDR */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap font-mono font-bold text-slate-900">
                        {formatIDR(item.paguAnggaran)}
                      </td>

                      {/* 7. Realised Keuangan IDR + percentage */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap border-l border-slate-50">
                        <div className="flex flex-col text-right">
                          <span className="font-mono font-bold text-emerald-650">{formatIDR(item.realisasiKeuangan)}</span>
                          <span className="text-[10px] text-emerald-700 font-extrabold">({item.persentaseKeuangan}%)</span>
                        </div>
                      </td>

                      {/* 8. Sisa budget otomatis */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap font-mono font-black text-rose-650 border-l border-slate-50 bg-rose-50/5">
                        {formatIDR(item.sisaAnggaran)}
                      </td>

                      {/* 9. Image galley thumbnail preview indicator */}
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        {item.dokumentasi && item.dokumentasi.length > 0 ? (
                          <div className="flex justify-center items-center">
                            <button
                              onClick={() => setSelectedDetailId(item.id)}
                              className="relative w-8.5 h-6 rounded-md overflow-hidden bg-slate-100 border hover:ring-2 hover:ring-sky-500 transition-all cursor-pointer"
                              id={`btn-thumbnail-view-${item.id}`}
                            >
                              <img referrerPolicy="no-referrer" src={item.dokumentasi[0]} alt="thumb" className="w-full h-full object-cover" />
                              <span className="absolute inset-0 bg-black/55 text-white text-[8px] font-extrabold flex items-center justify-center font-mono">
                                +{item.dokumentasi.length}
                              </span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic italic">Nihil</span>
                        )}
                      </td>

                      {/* 10. Actions board */}
                      <td className="px-4 py-3.5 text-center whitespace-nowrap border-l border-slate-100">
                        <div className="flex items-center justify-center gap-1.5" id={`actions-deck-${item.id}`}>
                          {/* Peek Detail button */}
                          <button
                            onClick={() => setSelectedDetailId(item.id)}
                            className="p-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg border border-sky-200 transition"
                            title="Tinjau Detail Kegiatan"
                            id={`btn-view-${item.id}`}
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Conditional edit and delete triggers */}
                          {isOwner ? (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedEditId(item.id);
                                  setIsFormOpen(true);
                                }}
                                className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg border border-amber-200"
                                title="Perbarui Data"
                                id={`btn-edit-${item.id}`}
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm('Yakin ingin menghapus data realisasi untuk pekerjaan ini? Tindakan bersifat permanen.')) {
                                    deleteRealisasi(item.id);
                                  }
                                }}
                                className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg border border-rose-200"
                                title="Hapus Permanen"
                                id={`btn-delete-${item.id}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            currentUser?.role !== 'PIMPINAN' && (
                              <span className="text-[10px] bg-slate-50 text-slate-400 p-1 border rounded-sm" title="Batas Mandat Operator">
                                Terbatas
                              </span>
                            )
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 6. TABLE PAGINATION INDICATORS FOOTMENT */}
        <div className="bg-slate-50 px-5 py-4 flex items-center justify-between border-t border-slate-200/80 text-xs text-slate-500 font-medium" id="pagination-toolbar">
          <div className="flex shadow-inner">
            <span>Menampilkan data ke- <strong>{filteredData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</strong> s.d <strong>{Math.min(currentPage * itemsPerPage, filteredData.length)}</strong> dari total <strong>{filteredData.length}</strong> entri terfilter</span>
          </div>

          <div className="flex items-center gap-2" id="pagination-triggers">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border bg-white disabled:opacity-40 disabled:hover:bg-white text-slate-650 hover:bg-slate-50 transition cursor-pointer"
              id="btn-pagination-prev"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <div className="flex gap-1" id="pagination-pages-badge">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-bold font-mono cursor-pointer transition-all ${
                    currentPage === i + 1 
                      ? 'bg-slate-900 border-slate-900 text-white' 
                      : 'bg-white border-slate-250 text-slate-700 hover:bg-slate-50'
                  }`}
                  id={`btn-pagination-page-${i + 1}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border bg-white disabled:opacity-40 disabled:hover:bg-white text-slate-650 hover:bg-slate-50 transition cursor-pointer"
              id="btn-pagination-next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
