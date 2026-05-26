import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Realisasi, BidangType } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Ship, 
  Layers, 
  Activity, 
  AlertTriangle,
  History,
  FileSpreadsheet,
  ArrowUpRight,
  Calendar
} from 'lucide-react';

const BIDANG_COLORS = {
  Sekretariat: '#3B82F6', // Blue
  'Bidang Perikanan Tangkap': '#10B981', // Emerald
  'Bidang Perikanan Budidaya': '#F59E0B', // Amber
  'Bidang P2PSDP': '#8B5CF6' // Purple
};

const COLORS_ARRAY = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];

export const Dashboard: React.FC = () => {
  const { realisasi, riwayats, notifikasis, currentConfig, setActiveMenu } = useApp();

  // Dynamic state for filtering by fiscal year
  const [filterTahun, setFilterTahun] = useState<string>('Semua');

  // Dynamically obtain available years from the realisasi data of the system (and preseed 2025 to 2030)
  const availableYears = useMemo(() => {
    const yearsSet = new Set<string>(['2025', '2026', '2027', '2028', '2029', '2030']);
    realisasi.forEach(item => {
      if (item.tahunAnggaran) yearsSet.add(item.tahunAnggaran);
    });
    // Ensure active year from config is also in the options
    if (currentConfig.tahunAnggaranAktif) {
      yearsSet.add(currentConfig.tahunAnggaranAktif);
    }
    return Array.from(yearsSet).sort((a, b) => b.localeCompare(a));
  }, [realisasi, currentConfig.tahunAnggaranAktif]);

  // Generate multi-year performance statistics dynamically
  const statsPerTahun = useMemo(() => {
    const yearsMap: Record<string, {
      tahun: string;
      kegiatan: number;
      pagu: number;
      keuangan: number;
      fisikTotal: number;
    }> = {};

    realisasi.forEach(item => {
      const yr = item.tahunAnggaran || 'Tidak Diketahui';
      if (!yearsMap[yr]) {
        yearsMap[yr] = {
          tahun: yr,
          kegiatan: 0,
          pagu: 0,
          keuangan: 0,
          fisikTotal: 0
        };
      }
      yearsMap[yr].kegiatan += 1;
      yearsMap[yr].pagu += item.paguAnggaran;
      yearsMap[yr].keuangan += item.realisasiKeuangan;
      yearsMap[yr].fisikTotal += item.realisasiFisik;
    });

    return Object.values(yearsMap).map(y => ({
      tahun: y.tahun,
      kegiatan: y.kegiatan,
      pagu: y.pagu,
      keuangan: y.keuangan,
      sisa: y.pagu - y.keuangan,
      persenKeuangan: y.pagu > 0 ? (y.keuangan / y.pagu) * 100 : 0,
      rataFisik: y.kegiatan > 0 ? y.fisikTotal / y.kegiatan : 0
    })).sort((a, b) => b.tahun.localeCompare(a.tahun));
  }, [realisasi]);

  // Filtered realisasi based on fiscal year selection
  const filteredRealisasi = useMemo(() => {
    if (filterTahun === 'Semua') return realisasi;
    return realisasi.filter(item => item.tahunAnggaran === filterTahun);
  }, [realisasi, filterTahun]);

  // 1. Calculate General Metrics (based on filtered data)
  const totalKegiatan = filteredRealisasi.length;
  const totalPagu = filteredRealisasi.reduce((sum, item) => sum + item.paguAnggaran, 0);
  const totalKeuangan = filteredRealisasi.reduce((sum, item) => sum + item.realisasiKeuangan, 0);
  const sisaPagu = totalPagu - totalKeuangan;
  const rataFisik = filteredRealisasi.length > 0 
    ? filteredRealisasi.reduce((sum, item) => sum + item.realisasiFisik, 0) / filteredRealisasi.length 
    : 0;
  const persenKeuangan = totalPagu > 0 ? (totalKeuangan / totalPagu) * 100 : 0;

  // 2. Format Rupiah helper
  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  const formatMillions = (num: number) => {
    return `Rp ${(num / 1000000).toFixed(1)} Jt`;
  };

  // 3. Prepare Bidang data
  const bidangList: BidangType[] = ['Sekretariat', 'Bidang Perikanan Tangkap', 'Bidang Perikanan Budidaya', 'Bidang P2PSDP'];
  const dataPerBidang = bidangList.map((bid, index) => {
    const items = filteredRealisasi.filter(item => item.bidang === bid);
    const pagu = items.reduce((sum, item) => sum + item.paguAnggaran, 0);
    const keu = items.reduce((sum, item) => sum + item.realisasiKeuangan, 0);
    const avgFisik = items.length > 0 
      ? items.reduce((sum, item) => sum + item.realisasiFisik, 0) / items.length 
      : 0;
    const persenKeu = pagu > 0 ? (keu / pagu) * 100 : 0;

    return {
      name: bid.replace('Bidang ', ''),
      fullName: bid,
      paguJutaan: Math.round(pagu / 1000000),
      keuJutaan: Math.round(keu / 1000000),
      paguRaw: pagu,
      keuRaw: keu,
      fisik: parseFloat(avgFisik.toFixed(1)),
      keuangan: parseFloat(persenKeu.toFixed(1)),
      jumlahKegiatan: items.length,
      fill: COLORS_ARRAY[index % COLORS_ARRAY.length]
    };
  });

  // 4. Prepare monthly trend data (Grouped by Realisasi Date)
  const monts = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const dataBulanan = monts.map((bln) => {
    const items = filteredRealisasi.filter(item => item.bulan === bln);
    const fisikAvg = items.length > 0
      ? items.reduce((sum, item) => sum + item.realisasiFisik, 0) / items.length
      : 0;
    const keuAvg = items.length > 0
      ? items.reduce((sum, item) => sum + (item.realisasiKeuangan / item.paguAnggaran * 100), 0) / items.length
      : 0;
    return {
      name: bln.substring(0, 3),
      'Fisik (%)': parseFloat(fisikAvg.toFixed(1)),
      'Keuangan (%)': parseFloat(keuAvg.toFixed(1)),
      kegiatanCount: items.length
    };
  }).filter(d => d.kegiatanCount > 0 || d.name === 'Jan' || d.name === 'Mei'); // Keep active month ranges or defaults

  const budgetAllocationPieData = dataPerBidang.map(d => ({
    name: d.name,
    value: d.paguRaw,
    percentage: totalPagu > 0 ? ((d.paguRaw / totalPagu) * 100).toFixed(1) : '0'
  }));

  const getProgressColor = (percent: number) => {
    if (percent >= 75) return 'bg-emerald-500'; // Green
    if (percent >= 40) return 'bg-amber-500'; // Yellow
    return 'bg-rose-500'; // Red
  };

  const getProgressBg = (percent: number) => {
    if (percent >= 75) return 'bg-emerald-50';
    if (percent >= 40) return 'bg-amber-50';
    return 'bg-rose-50';
  };

  const getProgressBorder = (percent: number) => {
    if (percent >= 75) return 'border-emerald-200';
    if (percent >= 40) return 'border-amber-200';
    return 'border-rose-200';
  };

  const getProgressTextColor = (percent: number) => {
    if (percent >= 75) return 'text-emerald-800';
    if (percent >= 40) return 'text-amber-800';
    return 'text-rose-800';
  };

  return (
    <div className="space-y-4" id="dashboard-tab">
      
      {/* 1. Welcoming Indonesian Government Maritime Banner */}
      <div className="bg-gradient-to-r from-[#0A2647] via-[#002B5B] to-emerald-950 border border-slate-200 rounded p-4 text-white shadow-xs relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-4" id="dashboard-banner">
        {/* Abstract marine graphics overlays */}
        <div className="absolute top-0 right-0 w-80 h-full opacity-10 pointer-events-none">
          <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
            <path d="M0 50 Q 25 35, 50 50 T 100 50 L 100 100 L 0 100 Z" />
          </svg>
        </div>
        
        <div className="max-w-2xl relative z-10 space-y-1">
          <span className="bg-emerald-400/20 text-emerald-300 border border-emerald-400/35 text-[9px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded whitespace-nowrap">
            SISTEM PELAPORAN TERPADU
          </span>
          <h2 className="text-lg font-black tracking-tight uppercase">
            E-Realisasi Fisik & Keuangan
          </h2>
          <p className="text-sky-100 text-xs leading-relaxed max-w-xl">
            Sistem Pemantauan Capaian Rencana Pembangunan Dinas Kelautan dan Perikanan Kabupaten Halmahera Selatan. Melayani pelaporan anggaran program secara akuntabel, transparan, dan real-time.
          </p>
          <div className="flex flex-wrap gap-3 pt-0.5 text-slate-200 text-[10px] font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Kamera, GPS & File Upload Aktif</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              <span>Integrasi SIPP Kemendagri</span>
            </div>
          </div>
        </div>

        {/* Dynamic decorative widget for interactive feels */}
        <div className="bg-white/10 backdrop-blur-md rounded p-3.5 border border-white/10 shrink-0 text-center w-full md:w-auto min-w-[180px]" id="quick-overview-mini-card">
          <p className="text-[9px] font-extrabold text-blue-300 tracking-wider uppercase mb-0.5 animate-pulse">Rata-rata Capaian Fisik</p>
          <p className="text-3xl font-black font-mono tracking-tight text-white">{rataFisik.toFixed(1)}%</p>
          <div className="mt-1.5 bg-white/20 rounded h-1 overflow-hidden">
            <div className="bg-emerald-400 h-full rounded transition-all" style={{ width: `${rataFisik}%` }}></div>
          </div>
          <p className="mt-1 text-[8px] text-blue-200 font-bold uppercase">Tahun Anggaran {currentConfig.tahunAnggaranAktif}</p>
        </div>
      </div>

      {/* 1.5. Interactive Fiscal Year Filter & Comparative Section heading */}
      <div className="bg-slate-100/90 p-3 rounded border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-inner" id="fiscal-year-filter-bar">
        <div className="flex items-center gap-2.5">
          <Calendar className="w-5 h-5 text-sky-700" id="icon-filter-calendar" />
          <div>
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-tight">Pilih Tahun Anggaran Teraktif</h3>
            <p className="text-[10px] text-slate-500 font-semibold">Tampilkan data dan analisis rekapitulasi realisasi per periode</p>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <span className="text-[10px] font-black text-slate-500 uppercase shrink-0">Filter Tahun:</span>
          <select
            value={filterTahun}
            onChange={(e) => setFilterTahun(e.target.value)}
            className="bg-white border text-xs font-black text-[#0A2647] rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full sm:w-44 shadow-xs cursor-pointer hover:bg-slate-50"
            id="select-filter-tahun-dashboard"
          >
            <option value="Semua">Semua Tahun Anggaran</option>
            {availableYears.map(yr => (
              <option key={yr} value={yr}>Tahun Anggaran {yr}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. STATISTIC CARDS BOARD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3" id="stats-grid">
        {/* Total Kegiatan */}
        <div className="bg-white p-3.5 rounded border border-slate-200 shadow-xs hover:shadow-sm transition-all flex items-center justify-between group" id="stat-card-total-kegiatan">
          <div className="space-y-0.5">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Total Kegiatan Program</p>
            <p className="text-2xl font-black text-slate-900 group-hover:text-[#0A2647] transition-colors">{totalKegiatan}</p>
            <p className="text-[10px] text-slate-500 font-bold">Paket Pekerjaan Terinput</p>
          </div>
          <div className="p-2.5 bg-blue-50 rounded border border-blue-100 text-blue-600">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        {/* Total Pagu Anggaran */}
        <div className="bg-white p-3.5 rounded border border-slate-200 shadow-xs hover:shadow-sm transition-all flex items-center justify-between group" id="stat-card-total-pagu">
          <div className="space-y-0.5">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Total Pagu DPA</p>
            <p className="text-xl font-black tracking-tight text-slate-900 truncate max-w-[170px]" title={formatIDR(totalPagu)}>
              {formatMillions(totalPagu)}
            </p>
            <p className="text-[10px] text-slate-500 font-bold">Pagu Anggaran Disetujui</p>
          </div>
          <div className="p-2.5 bg-emerald-50 rounded border border-emerald-100 text-emerald-600">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* Total Realisasi Keuangan */}
        <div className="bg-white p-3.5 rounded border border-slate-200 shadow-xs hover:shadow-sm transition-all flex items-center justify-between group" id="stat-card-total-realisasi">
          <div className="space-y-0.5">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Realisasi Keuangan</p>
            <p className="text-xl font-black tracking-tight text-slate-900 truncate max-w-[170px]" title={formatIDR(totalKeuangan)}>
              {formatMillions(totalKeuangan)}
            </p>
            <div className="flex items-center gap-1 text-[10px] font-extrabold text-emerald-600 animate-pulse">
              <TrendingUp className="w-3 h-3" />
              <span>SDA: {persenKeuangan.toFixed(1)}%</span>
            </div>
          </div>
          <div className="p-2.5 bg-indigo-50 rounded border border-indigo-100 text-indigo-600">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        {/* Sisa Anggaran */}
        <div className="bg-white p-3.5 rounded border border-slate-200 shadow-xs hover:shadow-sm transition-all flex items-center justify-between group" id="stat-card-sisa">
          <div className="space-y-0.5">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Sisa Anggaran DPA</p>
            <p className="text-xl font-black tracking-tight text-rose-700 truncate max-w-[170px]" title={formatIDR(sisaPagu)}>
              {formatMillions(sisaPagu)}
            </p>
            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-450">
              <TrendingDown className="w-3 h-3 text-rose-500" />
              <span>Belum Direalisasikan</span>
            </div>
          </div>
          <div className="p-2.5 bg-rose-50 rounded border border-rose-100 text-rose-600">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 4. CHART & MAP GRAFIK PLOTS BENTO RANGE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3" id="charts-bento-grid">
        {/* Pagu vs Realisasi Keuangan Bar Chart */}
        <div className="bg-white p-3.5 rounded border border-slate-200 shadow-xs lg:col-span-2 flex flex-col justify-between" id="card-chart-bar-pagu-realisasi">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h3 className="text-xs font-black text-slate-900 uppercase">Perbandingan Pagu & Realisasi Keuangan</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nilai dalam Juta Rupiah (Rp Jt)</p>
            </div>
            <button 
              onClick={() => setActiveMenu('grafik')} 
              className="text-[10px] font-bold text-[#0A2647] hover:text-sky-850 flex items-center gap-1 bg-slate-100 hover:bg-slate-200/70 px-2 py-1 rounded"
            >
              Cetak Grafik <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="h-64" id="recharts-bar-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dataPerBidang}
                margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 700 }} />
                <YAxis tick={{ fontSize: 9 }} />
                <Tooltip 
                  formatter={(value) => [`Rp ${value} Juta`, '']}
                  contentStyle={{ backgroundColor: '#051930', border: 'none', color: '#FFF', borderRadius: '4px', fontSize: '10px' }}
                />
                <Legend wrapperStyle={{ fontSize: '10px', marginTop: '5px' }} />
                <Bar name="Pagu Anggaran" dataKey="paguJutaan" fill="#0A2647" radius={[2, 2, 0, 0]} />
                <Bar name="Realisasi Keuangan" dataKey="keuJutaan" fill="#10B981" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Allocation Pie Chart */}
        <div className="bg-white p-3.5 rounded border border-slate-200 shadow-xs flex flex-col justify-between" id="card-chart-pie-allocation">
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase">Porsi Alokasi Pagu Bidang</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Distribusi Anggaran DPA</p>
          </div>

          <div className="h-40 relative flex items-center justify-center my-2" id="recharts-pie-container">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={budgetAllocationPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {budgetAllocationPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS_ARRAY[index % COLORS_ARRAY.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [formatIDR(Number(value)), 'Pagu']}
                  contentStyle={{ backgroundColor: '#051930', border: 'none', color: '#FFF', borderRadius: '4px', fontSize: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center label */}
            <div className="absolute flex flex-col items-center">
              <span className="text-[9px] uppercase font-bold text-slate-400 leading-none">Total Pagu</span>
              <span className="text-sm font-black text-slate-800 mt-0.5">{formatMillions(totalPagu).split(' ')[1]} Jt</span>
            </div>
          </div>

          <div className="space-y-1 mt-1" id="pie-legend">
            {budgetAllocationPieData.map((item, index) => (
              <div key={item.name} className="flex justify-between items-center text-[11px]">
                <div className="flex items-center gap-1.5 font-bold text-slate-600">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS_ARRAY[index] }}></span>
                  <span className="truncate max-w-[130px]">{item.name}</span>
                </div>
                <span className="font-extrabold text-slate-950 font-mono">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. PERFORMANCE ACCUMULATED RANGE PER BIDANG & WARNING PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3" id="progres-warning-grid">
        {/* Progress List per Bidang */}
        <div className="bg-white p-3.5 rounded border border-slate-200 shadow-xs lg:col-span-2" id="card-bidang-progress-track">
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase">Kemajuan Realisasi per Bidang Pelaksana</h3>
            <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mb-3">Rata-Rata Capaian Tiap Bagian Kerja</p>
          </div>

          <div className="space-y-2" id="bidang-progress-lines">
            {dataPerBidang.map((bid) => {
              const capFisik = bid.fisik;
              const capKeu = bid.keuangan;
              return (
                <div key={bid.fullName} className="bg-slate-50/50 p-3 border border-slate-200/60 rounded space-y-2">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                    <div>
                      <span className="font-extrabold text-[#0A2647] text-xs uppercase">{bid.fullName}</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[9px] bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded font-mono font-bold leading-none">{bid.jumlahKegiatan} Kegiatan</span>
                        <span className="text-[10px] text-slate-500 font-bold">• Pagu: {formatIDR(bid.paguRaw)}</span>
                      </div>
                    </div>

                    <div className="flex gap-4 shrink-0 font-sans text-xs">
                      <div className="text-right">
                        <span className="block text-[8px] uppercase font-bold text-slate-400 leading-none">Realisasi Fisik</span>
                        <span className="font-black text-slate-900">{capFisik}%</span>
                      </div>
                      <div className="text-right">
                        <span className="block text-[8px] uppercase font-bold text-slate-400 leading-none">Realisasi Keu</span>
                        <span className="font-black text-[#059669]">{capKeu}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                    {/* Fisik tracker */}
                    <div>
                      <div className="flex justify-between text-[9px] font-bold text-slate-500 mb-0.5">
                        <span className="uppercase tracking-wider">Fisik Kerja</span>
                        <span className="font-mono">{capFisik}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200 rounded overflow-hidden">
                        <div className={`h-full rounded transition-all ${getProgressColor(capFisik)}`} style={{ width: `${capFisik}%` }}></div>
                      </div>
                    </div>

                    {/* Keuangan tracker */}
                    <div>
                      <div className="flex justify-between text-[9px] font-bold text-slate-500 mb-0.5">
                        <span className="uppercase tracking-wider">Penyerapan Keuangan</span>
                        <span className="font-mono">{capKeu}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200 rounded overflow-hidden">
                        <div className="h-full rounded bg-emerald-500 transition-all" style={{ width: `${capKeu}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Underperforming Alert & Recent Logs Column */}
        <div className="space-y-3" id="alerts-logs-column">
          {/* Low Progress Dashboard Panel */}
          <div className="bg-white p-3.5 rounded border border-slate-200 shadow-xs flex flex-col" id="card-alert-low-progres">
            <div className="flex items-center gap-2 mb-2.5">
              <AlertTriangle className="w-4.5 h-4.5 text-amber-500 shrink-0" />
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase leading-none">Peringatan Kritis</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Fisik &lt; {currentConfig.targetKritisFisik}%</p>
              </div>
            </div>

            <div className="space-y-1.5 flex-1 max-h-48 overflow-y-auto pr-1" id="mini-alert-list">
              {notifikasis.length === 0 ? (
                <div className="p-4 text-center text-slate-400 italic font-bold text-[11px] border border-dashed border-slate-200 rounded">
                  Tidak ada kekritisan progres kerja. Program berkinerja baik!
                </div>
              ) : (
                notifikasis.slice(0, 3).map((item) => (
                  <div 
                    key={item.id} 
                    className={`p-2 border rounded text-xs space-y-1 transition hover:bg-slate-100 cursor-pointer ${getProgressBg(item.realisasiFisik)} ${getProgressBorder(item.realisasiFisik)}`}
                    onClick={() => setActiveMenu('realisasi')}
                  >
                    <div className="flex justify-between items-start">
                      <span className={`font-extrabold uppercase text-[9px] ${getProgressTextColor(item.realisasiFisik)}`}>
                        {item.bidang.replace('Bidang ', '')}
                      </span>
                      <span className="text-[9px] font-bold font-mono bg-white px-1.5 py-0.5 rounded shadow-xs border text-slate-600">
                        {item.realisasiFisik}% Fisik
                      </span>
                    </div>
                    <p className="text-slate-850 text-[11px] leading-tight font-bold font-sans truncate" title={item.uraianPekerjaan}>
                      {item.uraianPekerjaan}
                    </p>
                  </div>
                ))
              )}
            </div>
            
            <button 
              onClick={() => setActiveMenu('realisasi')}
              className="mt-2 text-center text-[10px] font-bold text-white bg-[#0A2647] hover:bg-blue-900 py-1.5 rounded transition-colors uppercase tracking-widest"
            >
              Ulas Semua Masalah Capaian
            </button>
          </div>

          {/* Audit Logs Trail Panel */}
          <div className="bg-white p-3.5 rounded border border-slate-200 shadow-xs" id="card-audit-trail">
            <div className="flex items-center gap-2 mb-2.5">
              <History className="w-4 h-4 text-slate-500" />
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase leading-none">Aktivitas Terkini</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.1">Log Perubahan Data Terakhir</p>
              </div>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 text-xs" id="dashboard-audit-logs">
              {riwayats.slice(0, 4).map((item) => (
                <div key={item.id} className="relative pl-3.5 pb-2 border-l border-slate-200 last:pb-0">
                  {/* log node point */}
                  <span className={`absolute -left-1.5 top-1 w-3.5 h-3.5 rounded-full border border-white shadow-xs ${
                    item.tipeAksi === 'KREASI' ? 'bg-emerald-500' : item.tipeAksi === 'UPDATE' ? 'bg-sky-500' : 'bg-rose-500'
                  }`}></span>
                  
                  <div className="flex justify-between items-start gap-1">
                    <p className="font-extrabold text-[#0A2647] text-[10px] uppercase truncate leading-none">
                      {item.oleh.split(' ')[0]} ({item.role})
                    </p>
                    <span className="text-[9px] text-slate-400 font-mono tracking-tighter">{item.tanggal.split(' ')[1] || item.tanggal}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5 font-bold leading-relaxed">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 6. COMPARATIVE TABLE BY FISCAL YEAR */}
      <div className="bg-white p-4 rounded border border-slate-200 shadow-xs" id="card-comparison-by-fiscal-year">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-4">
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight flex items-center gap-1.5" id="title-comparison-multi-year">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
              Rekapitulasi Realisasi & Kinerja Berdasarkan Tahun Anggaran
            </h3>
            <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mt-0.5">Analisis Komparasi Capaian Multi-Tahun DKP Halmahera Selatan</p>
          </div>
          <span className="text-[10px] bg-slate-100 text-[#0A2647] px-2.5 py-1 rounded font-bold uppercase tracking-wider border border-slate-200 self-start sm:self-auto">
            Mode Analisis Multi-Tahun
          </span>
        </div>

        <div className="overflow-x-auto" id="table-comparison-tahun-wrapper">
          <table className="w-full text-left border-collapse" id="table-comparison-tahun">
            <thead>
              <tr className="bg-slate-50 border-y border-slate-200 text-slate-500 text-[9px] uppercase font-black tracking-wider">
                <th className="p-3">Tahun Anggaran</th>
                <th className="p-3 text-center">Jumlah Kegiatan</th>
                <th className="p-3">Total Pagu DPA</th>
                <th className="p-3">Realisasi Keuangan (SP2D)</th>
                <th className="p-3 text-center">Persentase Keu</th>
                <th className="p-3">Sisa Keuangan</th>
                <th className="p-3">Rata-rata Fisik</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 text-xs">
              {statsPerTahun.map((st) => (
                <tr 
                  key={st.tahun} 
                  className={`hover:bg-slate-50/75 transition-colors cursor-pointer ${filterTahun === st.tahun ? 'bg-blue-50/70 font-semibold border-l-4 border-l-[#0A2647]' : ''}`}
                  onClick={() => setFilterTahun(st.tahun)}
                >
                  <td className="p-3 font-black text-slate-800">
                    TA {st.tahun}
                    {st.tahun === currentConfig.tahunAnggaranAktif && (
                      <span className="ml-2 text-[8px] bg-emerald-500 text-white px-1.5 py-0.5 rounded uppercase font-bold tracking-widest animate-pulse">
                        Aktif
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-center font-mono font-bold text-slate-700">{st.kegiatan}</td>
                  <td className="p-3 font-bold text-slate-900">{formatIDR(st.pagu)}</td>
                  <td className="p-3 text-emerald-600 font-extrabold">{formatIDR(st.keuangan)}</td>
                  <td className="p-3 text-center">
                    <div className="inline-flex items-center gap-2">
                      <span className="font-mono font-black text-[#059669]">{st.persenKeuangan.toFixed(1)}%</span>
                      <div className="w-14 bg-slate-100 h-1.5 rounded overflow-hidden hidden sm:block">
                        <div className="bg-emerald-500 h-full rounded" style={{ width: `${Math.min(100, st.persenKeuangan)}%` }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 font-bold text-rose-700">{formatIDR(st.sisa)}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-slate-900">{st.rataFisik.toFixed(1)}%</span>
                      <div className="w-12 bg-slate-200 h-1.5 rounded overflow-hidden">
                        <div className={`h-full rounded ${getProgressColor(st.rataFisik)}`} style={{ width: `${Math.min(100, st.rataFisik)}%` }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFilterTahun(st.tahun);
                      }}
                      className={`text-[9.5px] font-extrabold uppercase tracking-widest px-3 py-1.5 rounded transition shadow-inner font-sans ${
                        filterTahun === st.tahun 
                          ? 'bg-[#0A2647] text-white' 
                          : 'bg-slate-150 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {filterTahun === st.tahun ? 'Aktif' : 'Tinjau'}
                    </button>
                  </td>
                </tr>
              ))}
              {statsPerTahun.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 italic font-bold">
                    Belum ada data realisasi tahunan yang terdaftar pada sistem.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
