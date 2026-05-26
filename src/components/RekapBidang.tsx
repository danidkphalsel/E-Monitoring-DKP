import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { BidangType } from '../types';
import { FileText, Printer, CheckSquare, ListFilter, Percent, TrendingUp } from 'lucide-react';

export const RekapBidang: React.FC = () => {
  const { realisasi, currentConfig } = useApp();
  
  // Filter states
  const [selectedTriwulan, setSelectedTriwulan] = useState<string>('Semua');
  const [selectedBulan, setSelectedBulan] = useState<string>('Semua');

  const triwulans = [
    { name: 'Semua', label: 'Semua Triwulan (Tahunan)' },
    { name: 'T1', label: 'Triwulan I (Januari - Maret)', months: ['Januari', 'Februari', 'Maret'] },
    { name: 'T2', label: 'Triwulan II (April - Juni)', months: ['April', 'Mei', 'Juni'] },
    { name: 'T3', label: 'Triwulan III (Juli - September)', months: ['Juli', 'Agustus', 'September'] },
    { name: 'T4', label: 'Triwulan IV (Oktober - Desember)', months: ['Oktober', 'November', 'Desember'] }
  ];

  const bulans = [
    'Semua', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  // Helper formats
  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num);
  };

  // Filter dynamic dataset
  const filteredData = useMemo(() => {
    return realisasi.filter(item => {
      // Quarter filter
      let matchTriwulan = true;
      if (selectedTriwulan !== 'Semua') {
        const found = triwulans.find(t => t.name === selectedTriwulan);
        if (found && found.months) {
          matchTriwulan = found.months.includes(item.bulan);
        }
      }

      // Month filter
      const matchBulan = selectedBulan === 'Semua' || item.bulan === selectedBulan;

      return matchTriwulan && matchBulan;
    });
  }, [realisasi, selectedTriwulan, selectedBulan]);

  // Aggregate stats per Bidang based on filter
  const rekapData = useMemo(() => {
    const bidangList: BidangType[] = ['Sekretariat', 'Bidang Perikanan Tangkap', 'Bidang Perikanan Budidaya', 'Bidang P2PSDP'];
    
    return bidangList.map(bid => {
      const items = filteredData.filter(item => item.bidang === bid);
      const totalPagu = items.reduce((sum, item) => sum + item.paguAnggaran, 0);
      const totalKeuangan = items.reduce((sum, item) => sum + item.realisasiKeuangan, 0);
      const sisaAnggaran = totalPagu - totalKeuangan;
      
      const avgFisik = items.length > 0
        ? items.reduce((sum, item) => sum + item.realisasiFisik, 0) / items.length
        : 0;

      const persenKeuangan = totalPagu > 0
        ? (totalKeuangan / totalPagu) * 100
        : 0;

      return {
        bidang: bid,
        jumlahKegiatan: items.length,
        totalPagu,
        totalKeuangan,
        sisaAnggaran,
        avgFisik: parseFloat(avgFisik.toFixed(1)),
        persenKeuangan: parseFloat(persenKeuangan.toFixed(1))
      };
    });
  }, [filteredData]);

  // General Summary Totals
  const ringkasanUmum = useMemo(() => {
    const totalPagu = rekapData.reduce((sum, d) => sum + d.totalPagu, 0);
    const totalKeuangan = rekapData.reduce((sum, d) => sum + d.totalKeuangan, 0);
    const totalSisa = totalPagu - totalKeuangan;
    const totalFisikSum = rekapData.reduce((sum, d) => sum + (d.avgFisik * d.jumlahKegiatan), 0);
    const totalKegiatanCount = rekapData.reduce((sum, d) => sum + d.jumlahKegiatan, 0);
    
    const avgFisikTotal = totalKegiatanCount > 0 ? (totalFisikSum / totalKegiatanCount) : 0;
    const persenKeuTotal = totalPagu > 0 ? (totalKeuangan / totalPagu) * 100 : 0;

    return {
      kegiatan: totalKegiatanCount,
      pagu: totalPagu,
      realisasi: totalKeuangan,
      sisa: totalSisa,
      fisik: parseFloat(avgFisikTotal.toFixed(1)),
      keuangan: parseFloat(persenKeuTotal.toFixed(1))
    };
  }, [rekapData]);

  const handlePrintRekap = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    let rowsHtml = '';
    rekapData.forEach((row, i) => {
      rowsHtml += `
        <tr>
          <td style="text-align:center; padding: 10px; border: 1px solid #cbd5e1;">${i+1}</td>
          <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: bold;">${row.bidang}</td>
          <td style="text-align:center; padding: 10px; border: 1px solid #cbd5e1;">${row.jumlahKegiatan}</td>
          <td style="text-align:right; padding: 10px; border: 1px solid #cbd5e1; font-family: monospace;">${formatIDR(row.totalPagu)}</td>
          <td style="text-align:right; padding: 10px; border: 1px solid #cbd5e1; font-family: monospace;">${formatIDR(row.totalKeuangan)}</td>
          <td style="text-align:right; padding: 10px; border: 1px solid #cbd5e1; font-family: monospace; color: red;">${formatIDR(row.sisaAnggaran)}</td>
          <td style="text-align:center; padding: 10px; border: 1px solid #cbd5e1; font-family: monospace; font-weight: bold;">${row.avgFisik}%</td>
          <td style="text-align:center; padding: 10px; border: 1px solid #cbd5e1; font-family: monospace; font-weight: bold; color: green;">${row.persenKeuangan}%</td>
        </tr>
      `;
    });

    printWindow.document.write(`
      <html>
        <head>
          <title>DKP Rekapitulasi Pelaksana</title>
          <style>
            body { font-family: sans-serif; padding: 30px; color: #1e293b; }
            .header { text-align: center; border-bottom: 3px double #334155; padding-bottom: 10px; margin-bottom: 20px; }
            .meta { font-size: 11px; color: #475569; margin-bottom: 25px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 11.5px; }
            th { background-color: #0f172a; color: white; padding: 10px; text-transform: uppercase; font-size: 10px; }
            .totals { font-weight: bold; background-color: #f1f5f9; }
          </style>
        </head>
        <body>
          <div class="header">
            <h3>PEMERINTAH KABUPATEN HALMAHERA SELATAN</h3>
            <h2>DINAS KELAUTAN DAN PERIKANAN</h2>
            <p>Kawasan Bumi Moro, Labuha. Program Laporan Capaian T.A. ${currentConfig.tahunAnggaranAktif}</p>
          </div>
          
          <h3 style="text-transform: uppercase;">Laporan Rekapitulasi Capaian Realisasi Per Bidang Kerja</h3>
          <p class="meta">
            <strong>Parameter Filter:</strong> Triwulan: ${triwulans.find(t=>t.name === selectedTriwulan)?.label} • Bulan: ${selectedBulan}<br>
            <strong>Waktu Cetak-Laporan:</strong> ${new Date().toLocaleDateString('id-ID')}
          </p>

          <table>
            <thead>
              <tr>
                <th style="border: 1px solid #cbd5e1;">No</th>
                <th style="border: 1px solid #cbd5e1;">Bidang Pelaksana</th>
                <th style="border: 1px solid #cbd5e1;">Jumlah Kerja</th>
                <th style="border: 1px solid #cbd5e1;">Total Pagu</th>
                <th style="border: 1px solid #cbd5e1;">Realisasi Keuangan</th>
                <th style="border: 1px solid #cbd5e1;">Sisa Anggaran</th>
                <th style="border: 1px solid #cbd5e1;">Rerata Fisik</th>
                <th style="border: 1px solid #cbd5e1;">Keuangan (%)</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
              <tr class="totals">
                <td colspan="2" style="border: 1px solid #cbd5e1; text-align: center; padding:10px;">TOTAL REKAPITULASI</td>
                <td style="border: 1px solid #cbd5e1; text-align: center;">${ringkasanUmum.kegiatan}</td>
                <td style="border: 1px solid #cbd5e1; text-align: right; padding:12px; font-family: monospace;">${formatIDR(ringkasanUmum.pagu)}</td>
                <td style="border: 1px solid #cbd5e1; text-align: right; padding:12px; font-family: monospace;">${formatIDR(ringkasanUmum.realisasi)}</td>
                <td style="border: 1px solid #cbd5e1; text-align: right; padding:12px; font-family: monospace; color: red;">${formatIDR(ringkasanUmum.sisa)}</td>
                <td style="border: 1px solid #cbd5e1; text-align: center;">${ringkasanUmum.fisik}%</td>
                <td style="border: 1px solid #cbd5e1; text-align: center; color: green;">${ringkasanUmum.keuangan}%</td>
              </tr>
            </tbody>
          </table>
          <div style="margin-top: 50px; text-align: right; font-size: 11px;">
            <p>Dinas Kelautan dan Perikanan Halmahera Selatan</p>
            <br/><br/><br/>
            <p><strong>Kepala Dinas Kelautan dan Perikanan</strong></p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-6" id="rekap-tab-view">
      
      {/* 1. FILTER CONTROLLER DECK */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/95 shadow-xs space-y-4" id="rekap-filters-deck">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListFilter className="w-5 h-5 text-sky-700" />
            <span className="text-sm font-extrabold text-slate-900 uppercase">Parameter Analisis Laporan</span>
          </div>
          <button
            onClick={handlePrintRekap}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-md hover:bg-slate-800 transition cursor-pointer"
            id="btn-print-rekap-tab"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Rekapan</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Select Triwulan */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Pilah Triwulan (Quarter)</label>
            <div className="flex flex-wrap gap-2" id="triwulans-buttons-deck">
              {triwulans.map(t => (
                <button
                  key={t.name}
                  onClick={() => {
                    setSelectedTriwulan(t.name);
                    setSelectedBulan('Semua'); // reset month when changing quarter
                  }}
                  className={`px-3 py-2 border rounded-xl text-xs font-extrabold transition cursor-pointer ${
                    selectedTriwulan === t.name 
                      ? 'bg-sky-50 text-sky-800 border-sky-305' 
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                  id={`rekap-triwulan-${t.name}`}
                >
                  {t.name === 'Semua' ? 'Tahunan' : t.name}
                </button>
              ))}
            </div>
          </div>

          {/* Select Bulan */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Pilah Bulan Kerja</label>
            <select
              value={selectedBulan}
              onChange={(e) => {
                setSelectedBulan(e.target.value);
                setSelectedTriwulan('Semua'); // reset triwulan context to be clean
              }}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-xs bg-white text-slate-800 font-semibold"
              id="rekap-bulan-dropdown"
            >
              {bulans.map(b => (
                <option key={b} value={b}>{b === 'Semua' ? 'Semua Bulan' : b}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. DYNAMIC GENERAL SUMMARY CARDS BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4" id="rekap-agg-cards">
        <div className="bg-white p-4.5 rounded-xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[9px] uppercase font-bold text-slate-400 block leading-none">Total Kerja Terfilter</span>
            <span className="text-2xl font-extrabold text-slate-800 block mt-1">{ringkasanUmum.kegiatan} Paket</span>
          </div>
          <CheckSquare className="w-6 h-6 text-sky-600" />
        </div>
        
        <div className="bg-white p-4.5 rounded-xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[9px] uppercase font-bold text-slate-400 block leading-none">Total Pagu Kerja</span>
            <span className="text-lg font-extrabold text-slate-800 block mt-1 font-mono truncate max-w-[150px]" title={formatIDR(ringkasanUmum.pagu)}>
              {formatIDR(ringkasanUmum.pagu)}
            </span>
          </div>
          <Percent className="w-5 h-5 text-indigo-600" />
        </div>

        <div className="bg-white p-4.5 rounded-xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[9px] uppercase font-bold text-slate-400 block leading-none">Total Realisasi Keuangan</span>
            <span className="text-[14px] font-extrabold text-emerald-600 block mt-1 font-mono truncate max-w-[150px]" title={formatIDR(ringkasanUmum.realisasi)}>
              {formatIDR(ringkasanUmum.realisasi)} <span className="text-[10px]">({ringkasanUmum.keuangan}%)</span>
            </span>
          </div>
          <TrendingUp className="w-5 h-5 text-emerald-600" />
        </div>

        <div className="bg-white p-4.5 rounded-xl border border-slate-200/90 shadow-sm flex items-center justify-between font-sans">
          <div>
            <span className="text-[9px] uppercase font-bold text-slate-400 block leading-none">Rata-rata Fisik</span>
            <span className="text-2xl font-black text-slate-800 block mt-1">{ringkasanUmum.fisik}%</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px]">%</div>
        </div>
      </div>

      {/* 3. CORE SUMMARY TABULAR DISPLAY */}
      <div className="bg-white rounded-3xl border border-slate-200/95 shadow-xl overflow-hidden" id="rekap-table-card">
        <div className="bg-slate-900 text-white p-4 flex gap-2 border-b">
          <FileText className="w-5 h-5 text-sky-400" />
          <h3 className="text-xs font-black uppercase tracking-wide">
            Rekapitulasi Capaian Bidang Kerja DKP T.A. {currentConfig.tahunAnggaranAktif}
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-150 text-xs table-auto">
            <thead className="bg-slate-50 uppercase text-slate-500 font-extrabold text-[10px]">
              <tr>
                <th className="px-5 py-3 text-center w-12 border-r">No</th>
                <th className="px-6 py-3 text-left">Nama Bidang Pelaksana (DKP)</th>
                <th className="px-5 py-3 text-center">Jumlah Kegiatan</th>
                <th className="px-5 py-3 text-right">Pagu Anggaran</th>
                <th className="px-5 py-3 text-right">Realisasi Keuangan</th>
                <th className="px-5 py-3 text-right">Sisa Anggaran DPA</th>
                <th className="px-5 py-3 text-center w-36">Average Progres Fisik</th>
                <th className="px-5 py-3 text-center w-36">Capaian Keuangan (%)</th>
              </tr>
            </thead>
            
            <tbody className="bg-white divide-y divide-slate-150 text-slate-800 font-medium">
              {rekapData.map((bid, i) => (
                <tr key={bid.bidang} className="hover:bg-slate-50/70 transition">
                  <td className="px-5 py-4 whitespace-nowrap text-center font-mono font-bold text-slate-400 border-r">{i+1}</td>
                  <td className="px-6 py-4 whitespace-nowrap"><span className="font-extrabold text-slate-900 text-xs">{bid.bidang}</span></td>
                  <td className="px-5 py-4 whitespace-nowrap text-center font-mono font-semibold">{bid.jumlahKegiatan} Paket</td>
                  <td className="px-5 py-4 whitespace-nowrap text-right font-mono font-bold">{formatIDR(bid.totalPagu)}</td>
                  <td className="px-5 py-4 whitespace-nowrap text-right font-mono font-bold text-emerald-650">{formatIDR(bid.totalKeuangan)}</td>
                  <td className="px-5 py-4 whitespace-nowrap text-right font-mono font-bold text-rose-650">{formatIDR(bid.sisaAnggaran)}</td>
                  
                  {/* Physical accomplishment bar indicator */}
                  <td className="px-5 py-4 whitespace-nowrap text-center">
                    <div className="flex flex-col items-center gap-1.5 px-3">
                      <span className="font-bold text-slate-800">{bid.avgFisik}%</span>
                      <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${
                          bid.avgFisik >= 75 ? 'bg-emerald-500' : bid.avgFisik >= 40 ? 'bg-amber-500' : 'bg-rose-500'
                        }`} style={{ width: `${bid.avgFisik}%` }}></div>
                      </div>
                    </div>
                  </td>

                  {/* Financial achievement percentage bar */}
                  <td className="px-5 py-4 whitespace-nowrap text-center">
                    <div className="flex flex-col items-center gap-1.5 px-3">
                      <span className="font-bold text-emerald-700">{bid.persenKeuangan}%</span>
                      <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${bid.persenKeuangan}%` }}></div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}

              {/* Total Aggregate Bottom row */}
              <tr className="bg-slate-100 font-black text-slate-900 border-t border-slate-300">
                <td colSpan={2} className="px-6 py-4 text-center text-xs">TOTAL REKAPITULASI DPA</td>
                <td className="px-5 py-4 text-center font-mono">{ringkasanUmum.kegiatan} Paket</td>
                <td className="px-5 py-4 text-right font-mono">{formatIDR(ringkasanUmum.pagu)}</td>
                <td className="px-5 py-4 text-right font-mono text-emerald-750">{formatIDR(ringkasanUmum.realisasi)}</td>
                <td className="px-5 py-4 text-right font-mono text-rose-750">{formatIDR(ringkasanUmum.sisa)}</td>
                <td className="px-5 py-4 text-center">
                  <span className="font-extrabold">{ringkasanUmum.fisik}% Rerata</span>
                </td>
                <td className="px-5 py-4 text-center">
                  <span className="font-extrabold text-emerald-700">{ringkasanUmum.keuangan}% Capaian</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
