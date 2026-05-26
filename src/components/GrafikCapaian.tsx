import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { BidangType } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  AreaChart, 
  Area,
  ComposedChart
} from 'recharts';
import { BarChart3, TrendingUp, HelpCircle, Activity, LayoutGrid, SlidersHorizontal, Eye } from 'lucide-react';

export const GrafikCapaian: React.FC = () => {
  const { realisasi, currentConfig } = useApp();

  const [activeTab, setActiveTab] = useState<'perbandingan' | 'kegiatan' | 'tren'>('perbandingan');
  const [filterBidang, setFilterBidang] = useState<string>('Semua');

  // Format currencies helpers
  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  // 1. Per Bidang Data Aggregate
  const bidangList: BidangType[] = ['Sekretariat', 'Bidang Perikanan Tangkap', 'Bidang Perikanan Budidaya', 'Bidang P2PSDP'];
  const aggregateData = useMemo(() => {
    return bidangList.map(bid => {
      const items = realisasi.filter(item => item.bidang === bid);
      const totalPagu = items.reduce((sum, item) => sum + item.paguAnggaran, 0);
      const totalKeu = items.reduce((sum, item) => sum + item.realisasiKeuangan, 0);
      const avgFisik = items.length > 0 
        ? items.reduce((sum, item) => sum + item.realisasiFisik, 0) / items.length 
        : 0;
      const avgKeu = totalPagu > 0 ? (totalKeu / totalPagu) * 100 : 0;

      return {
        name: bid.replace('Bidang ', ''),
        fullName: bid,
        'Rata-rata Fisik (%)': parseFloat(avgFisik.toFixed(1)),
        'Penyerapan Keuangan (%)': parseFloat(avgKeu.toFixed(1)),
        paguJuta: Math.round(totalPagu / 1000000),
        realKeuJuta: Math.round(totalKeu / 1000000),
        kegiatan: items.length
      };
    });
  }, [realisasi]);

  // 2. Individual Activities sorted by physical progress (ascending to highlight bottlenecks)
  const sortedActivities = useMemo(() => {
    const data = filterBidang === 'Semua' 
      ? realisasi 
      : realisasi.filter(r => r.bidang === filterBidang);

    return [...data]
      .sort((a, b) => a.realisasiFisik - b.realisasiFisik)
      .map(item => ({
        name: item.uraianPekerjaan.length > 25 ? `${item.uraianPekerjaan.substring(0, 25)}...` : item.uraianPekerjaan,
        fullName: item.uraianPekerjaan,
        'Fisik (%)': item.realisasiFisik,
        'Keuangan (%)': item.persentaseKeuangan,
        bidangShort: item.bidang.replace('Bidang ', '')
      }));
  }, [realisasi, filterBidang]);

  // 3. Prepare monthly trend data
  const monts = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const trenBulanan = useMemo(() => {
    return monts.map(bln => {
      const items = realisasi.filter(item => item.bulan === bln);
      const fisikAvg = items.length > 0
        ? items.reduce((sum, item) => sum + item.realisasiFisik, 0) / items.length
        : 0;
      const keuAvg = items.length > 0
        ? items.reduce((sum, item) => sum + (item.realisasiKeuangan / item.paguAnggaran * 100), 0) / items.length
        : 0;
      return {
        name: bln.substring(0, 3),
        bulan: bln,
        'Progres Fisik (%)': parseFloat(fisikAvg.toFixed(1)),
        'Serapan Keuangan (%)': parseFloat(keuAvg.toFixed(1)),
        jumlah: items.length
      };
    }).filter(d => d.jumlah > 0 || d.name === 'Jan' || d.name === 'Mei');
  }, [realisasi]);

  return (
    <div className="space-y-6" id="grafik-tab-view">
      
      {/* 1. SECTOR DECORATIVE BANNER */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/95 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4" id="grafik-header">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-slate-900 text-white rounded-xl shadow-md">
            <BarChart3 className="w-6 h-6 text-sky-400" />
          </div>
          <div>
            <span className="bg-sky-50 text-sky-850 border border-sky-100 text-[9px] font-bold px-2.5 py-0.5 rounded-sm">GRAPH PORTAL</span>
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight uppercase mt-0.5">Visualisasi Grafik Capaian Kinerja</h3>
          </div>
        </div>

        {/* Tab switch controller */}
        <div className="flex shadow-inner p-1 bg-slate-100 rounded-xl" id="grafik-tabs-toggle">
          <button
            onClick={() => setActiveTab('perbandingan')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              activeTab === 'perbandingan' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Rata-Rata Bidang
          </button>
          <button
            onClick={() => setActiveTab('kegiatan')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              activeTab === 'kegiatan' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Saringan Paket Pekerjaan
          </button>
          <button
            onClick={() => setActiveTab('tren')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              activeTab === 'tren' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Tren Bulanan Berjalan
          </button>
        </div>
      </div>

      {/* 2. DYNAMIC GRAFIK VIEWS DISPLAY */}
      {activeTab === 'perbandingan' && (
        <div className="grid grid-cols-1 gap-5" id="view-perbandingan-averages">
          {/* Chart 1: Physical vs Financial percentage Comparison per Bidang */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl" id="card-chart-perbandingan-persen">
            <div className="mb-4">
              <h4 className="text-sm font-extrabold text-slate-900 uppercase">Perbandingan Progres Fisik vs Penyerapan Keuangan</h4>
              <p className="text-[11px] font-semibold text-slate-450 uppercase">Rerata Persentase (%) Tiap Bidang DKP</p>
            </div>

            <div className="h-96" id="composed-chart-averages">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={aggregateData}
                  margin={{ top: 20, right: 20, bottom: 20, left: -20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 700 }} />
                  <YAxis unit="%" tick={{ fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0F172A', color: '#FFF', borderRadius: '12px', fontSize: '11px' }}
                    formatter={(v) => [`${v}%`, '']}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', marginTop: '10px' }} />
                  <Bar name="Rata-rata Progres Fisik" dataKey="Rata-rata Fisik (%)" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={28} />
                  <Line name="Serapan Keuangan" dataKey="Penyerapan Keuangan (%)" stroke="#10B981" strokeWidth={3} dot={{ r: 5 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Pagu vs Realisasi Keuangan in million rupees */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl" id="card-chart-perbandingan-rupiah">
            <div className="mb-4">
              <h4 className="text-sm font-extrabold text-slate-900 uppercase">Sebaran Nominal Anggaran dan Realisasinya</h4>
              <p className="text-[11px] font-semibold text-slate-450 uppercase">Volume Anggaran dalam Satuan Juta Rupiah (Rp Jt)</p>
            </div>

            <div className="h-80" id="composed-chart-nominal">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={aggregateData}
                  margin={{ top: 10, right: 10, bottom: 5, left: -20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 650 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1E293B', color: '#FFF', borderRadius: '12px', fontSize: '11px' }}
                    formatter={(v) => [`Rp ${v} Juta`, 'Nominal']}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar name="Alokasi Pagu Anggaran" dataKey="paguJuta" fill="#1E293B" radius={[4, 4, 0, 0]} />
                  <Bar name="Anggaran Terserap" dataKey="realKeuJuta" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'kegiatan' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl space-y-4" id="view-per-kegiatan">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h4 className="text-sm font-extrabold text-slate-900 uppercase">Grafik Capaian Tiap Paket Kerja</h4>
              <p className="text-[11px] font-semibold text-slate-450 uppercase">Diurutkan Dari Progres Terendah Untuk Analisis Bottleneck</p>
            </div>

            {/* Selector fields */}
            <div className="flex items-center gap-2" id="filter-bidang-grafik">
              <SlidersHorizontal className="w-4 h-4 text-slate-400" />
              <select
                value={filterBidang}
                onChange={(e) => setFilterBidang(e.target.value)}
                className="px-3 py-1.5 border border-slate-305 rounded-xl text-xs bg-white text-slate-755 font-semibold"
                id="grafik-bidang-dropdown"
              >
                <option value="Semua">Semua Bidang</option>
                <option value="Sekretariat">Sekretariat</option>
                <option value="Bidang Perikanan Tangkap">Perikanan Tangkap</option>
                <option value="Bidang Perikanan Budidaya">Perikanan Budidaya</option>
                <option value="Bidang P2PSDP">P2PSDP</option>
              </select>
            </div>
          </div>

          <div className="h-96" id="bar-chart-activities">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sortedActivities}
                margin={{ top: 20, right: 20, bottom: 20, left: -20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 9, angle: -15, textAnchor: 'end' }} />
                <YAxis unit="%" tick={{ fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', color: '#FFF', borderRadius: '12px', fontSize: '11px', maxWidth: '300px' }}
                  formatter={(v, name, props) => [`${v}%`, name]}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar name="Progres Fisik (%)" dataKey="Fisik (%)" fill="#EF4444" radius={[4, 4, 0, 0]} />
                <Bar name="Progres Keuangan (%)" dataKey="Keuangan (%)" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-amber-50 rounded-xl p-3 border border-amber-200 text-xs text-amber-900 flex gap-2.5 items-start" id="analysis-tip">
            <Activity className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Analisis Kinerja Strategis:</strong> Grafik di atas menampilkan komparasi fisik (Merah) dan keuangan (Hijau) per kegiatan. Batang merah yang pendek menggambarkan defisit hasil fisik kerja di lapangan yang memerlukan evaluasi/pengawasan ketat oleh Pimpinan.
            </div>
          </div>
        </div>
      )}

      {activeTab === 'tren' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl space-y-4" id="view-tren-laporan">
          <div>
            <h4 className="text-sm font-extrabold text-slate-900 uppercase">Tren Capaian Bulanan Dinas Kelautan & Perikanan</h4>
            <p className="text-[11px] font-semibold text-slate-450 uppercase">Akumulasi Kemajuan Progres Kerja Berjalan Mulai Januari s.d. Desember</p>
          </div>

          <div className="h-96" id="area-chart-trends">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={trenBulanan}
                margin={{ top: 20, right: 20, bottom: 20, left: -20 }}
              >
                <defs>
                  <linearGradient id="colorFisik" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorKeu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 700 }} />
                <YAxis unit="%" tick={{ fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', color: '#FFF', borderRadius: '12px', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Area type="monotone" name="Progres Fisik Bulanan" dataKey="Progres Fisik (%)" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorFisik)" />
                <Area type="monotone" name="Serapan Keuangan Bulanan" dataKey="Serapan Keuangan (%)" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorKeu)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

    </div>
  );
};
