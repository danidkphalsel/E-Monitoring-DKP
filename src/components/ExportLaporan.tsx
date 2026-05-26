import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Printer, Download, FileSpreadsheet, FileText, CheckCircle, Sliders, MapPin } from 'lucide-react';

export const ExportLaporan: React.FC = () => {
  const { realisasi, currentConfig } = useApp();

  // Filters state
  const [filterBidang, setFilterBidang] = useState<string>('Semua');
  const [filterKecamatan, setFilterKecamatan] = useState<string>('Semua');
  const [filterStatus, setFilterStatus] = useState<string>('Semua');
  
  const kecamatanList = useMemo(() => {
    const list = realisasi.map(r => r.lokasiKecamatan);
    return ['Semua', ...Array.from(new Set(list))];
  }, [realisasi]);

  // Apply selectors
  const exportedData = useMemo(() => {
    return realisasi.filter(item => {
      const matchBidang = filterBidang === 'Semua' || item.bidang === filterBidang;
      const matchKecamatan = filterKecamatan === 'Semua' || item.lokasiKecamatan === filterKecamatan;
      const matchStatus = filterStatus === 'Semua' || item.statusKegiatan === filterStatus;
      return matchBidang && matchKecamatan && matchStatus;
    });
  }, [realisasi, filterBidang, filterKecamatan, filterStatus]);

  // Totals calculators
  const dynamicTotals = useMemo(() => {
    const pagu = exportedData.reduce((sum, item) => sum + item.paguAnggaran, 0);
    const keu = exportedData.reduce((sum, item) => sum + item.realisasiKeuangan, 0);
    const sisa = pagu - keu;
    const avgFisik = exportedData.length > 0
      ? exportedData.reduce((sum, item) => sum + item.realisasiFisik, 0) / exportedData.length
      : 0;
    const averageKeu = pagu > 0 ? (keu / pagu) * 100 : 0;

    return { pagu, keu, sisa, avgFisik: avgFisik.toFixed(1), avgKeu: averageKeu.toFixed(1) };
  }, [exportedData]);

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num);
  };

  // EXCEL CSV DOWNLOAD SIMULATOR
  const handleExportCSV = () => {
    if (exportedData.length === 0) return;

    // Headers in Indonesian Government structure
    const headers = [
      'No',
      'Bidang DKP Pelaksana',
      'Program Kerja',
      'Kegiatan',
      'Sub Kegiatan',
      'Uraian Detail Pekerjaan',
      'Desa',
      'Kecamatan',
      'Target Fisik (%)',
      'Realisasi Fisik (%)',
      'Pagu Anggaran (Rp)',
      'Realisasi Keuangan (Rp)',
      'Sisa Anggaran DPA (Rp)',
      'Persentase Keuangan (%)',
      'Tanggal Input',
      'Bulan Laporan',
      'Verifikator'
    ];

    const rows = exportedData.map((item, idx) => [
      idx + 1,
      `"${item.bidang}"`,
      `"${item.program.replace(/"/g, '""')}"`,
      `"${item.kegiatan.replace(/"/g, '""')}"`,
      `"${item.subKegiatan.replace(/"/g, '""')}"`,
      `"${item.uraianPekerjaan.replace(/"/g, '""')}"`,
      `"${item.lokasiDesa}"`,
      `"${item.lokasiKecamatan}"`,
      item.targetFisik,
      item.realisasiFisik,
      item.paguAnggaran,
      item.realisasiKeuangan,
      item.sisaAnggaran,
      item.persentaseKeuangan,
      item.tanggalInput,
      `"${item.bulan}"`,
      `"${item.terakhirDieditOleh}"`
    ]);

    // Construct text using UTF-8 BOM encoding so Excel parses Indonesian rupiah and separators cleanly
    const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Lap_Evaluasi_DKP_Halsel_${filterBidang.replace(/ /g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // PRINT / PDF RENDER CONSTRUCTOR
  const handlePrintReports = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    let tableRows = '';
    exportedData.forEach((row, i) => {
      tableRows += `
        <tr>
          <td style="text-align:center; border: 1px solid #94a3b8; padding: 6px;">${i+1}</td>
          <td style="border: 1px solid #94a3b8; padding: 6px;">
            <div style="font-[8px]; text-transform:uppercase; font-weight:bold; color:#475569;">${row.bidang}</div>
            <div style="font-weight:bold; margin-top:2px;">${row.uraianPekerjaan}</div>
            <div style="font-size:10px; color:#64748b; margin-top:1px;">Prog: ${row.program}</div>
          </td>
          <td style="text-align:center; border: 1px solid #94a3b8; padding: 6px;">${row.lokasiDesa}<br/><span style="font-size:9; color:#64748b;">Kec. ${row.lokasiKecamatan}</span></td>
          <td style="text-align:center; font-family:monospace; border: 1px solid #94a3b8; padding: 6px;">${row.targetFisik}%</td>
          <td style="text-align:center; font-family:monospace; font-weight:bold; border: 1px solid #94a3b8; padding: 6px;">${row.realisasiFisik}%</td>
          <td style="text-align:right; font-family:monospace; border: 1px solid #94a3b8; padding: 6px;">${row.paguAnggaran.toLocaleString('id-ID')}</td>
          <td style="text-align:right; font-family:monospace; border: 1px solid #94a3b8; padding: 6px; font-weight:bold;">${row.realisasiKeuangan.toLocaleString('id-ID')}<br/><span style="font-size:9px;color:green;">(${row.persentaseKeuangan}%)</span></td>
          <td style="text-align:right; font-family:monospace; border: 1px solid #94a3b8; padding: 6px; color:red; font-weight:bold;">${row.sisaAnggaran.toLocaleString('id-ID')}</td>
        </tr>
      `;
    });

    const isFiltered = filterBidang !== 'Semua' ? filterBidang : 'Seluruh Bidang Pelaksana';

    printWindow.document.write(`
      <html>
        <head>
          <title>DKP LPS - Cetak Laporan Capaian</title>
          <style>
            @media print { @page { size: landscape; margin: 1cm; } }
            body { font-family: Arial, sans-serif; padding: 20px; color: #1e293b; font-size: 11px; }
            .header-emblem { text-align: center; border-bottom: 4px double #000; padding-bottom: 8px; margin-bottom: 15px; }
            .meta { margin-bottom: 15px; font-size: 10px; color: #334155; }
            table { width: 100%; border-collapse: collapse; font-size: 10px; margin-top: 10px; }
            th { background-color: #0f172a; color: white; padding: 8px; text-transform: uppercase; border: 1px solid #94a3b8; }
            .totals { font-weight: bold; background-color: #f1f5f9; }
          </style>
        </head>
        <body>
          <div class="header-emblem">
            <h3 style="margin: 0; font-size: 13px;">PEMERINTAH DAERAH KABUPATEN HALMAHERA SELATAN</h3>
            <h2 style="margin: 4px 0; font-size: 16px;">DINAS KELAUTAN DAN PERIKANAN</h2>
            <p style="margin: 0; font-size: 9px; color:#475569;">Jl. Karet No. 4, Kawasan Pemerintahan Bumi Moro, Labuha. Halmahera Selatan • Maluku Utara</p>
          </div>
          
          <h3 style="text-transform: uppercase; text-align:center; margin-top:10px;">LAPORAN EVALUASI REALISASI FISIK & KEUANGAN TAHUN ANGGARAN ${currentConfig.tahunAnggaranAktif}</h3>
          <p class="meta">
            <strong>Kriteria Laporan Jurnal:</strong> Bidang: ${isFiltered} • Kecamatan: ${filterKecamatan} • Status Capaian: ${filterStatus}<br/>
            <strong>Waktu Pencetakan Laporan:</strong> ${new Date().toLocaleDateString('id-ID')} • Verifikasi: Portal Akreditasi DKP
          </p>

          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Program / Sub / Detail Pekerjaan</th>
                <th>Lokasi Geografis</th>
                <th>Target</th>
                <th>Rilis Fisik</th>
                <th>Alokasi Pagu (Rp)</th>
                <th>Anggaran Terserap (Rp)</th>
                <th>Sisa Anggaran DPA (Rp)</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
              <tr class="totals">
                <td colspan="3" style="border: 1px solid #94a3b8; text-align: center; padding: 8px;">TOTAL REKAPITULASI LAPORAN</td>
                <td style="border: 1px solid #94a3b8; text-align: center;">100%</td>
                <td style="border: 1px solid #94a3b8; text-align: center;">${dynamicTotals.avgFisik}%</td>
                <td style="border: 1px solid #94a3b8; text-align: right;">${dynamicTotals.pagu.toLocaleString('id-ID')}</td>
                <td style="border: 1px solid #94a3b8; text-align: right; color:green;">${dynamicTotals.keu.toLocaleString('id-ID')} (${dynamicTotals.avgKeu}%)</td>
                <td style="border: 1px solid #94a3b8; text-align: right; color:red;">${dynamicTotals.sisa.toLocaleString('id-ID')}</td>
              </tr>
            </tbody>
          </table>

          <div style="margin-top: 40px; display: flex; justify-content: space-between; font-size: 10px;">
            <div>
              <p>Mengetahui,</p>
              <p><strong>Inspektorat Kabupaten Halmahera Selatan</strong></p>
              <br/><br/><br/>
              <p>_____________________________________</p>
            </div>
            <div style="text-align: right;">
              <p>Labuha, ${new Date().toLocaleDateString('id-ID')}</p>
              <p><strong>Kepala Dinas Kelautan dan Perikanan</strong></p>
              <br/><br/><br/>
              <p><strong>Dr. Muh. Yusuf, M.Si</strong><br/>NIP. 19741012 200212 1 003</p>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-6" id="export-tab-view">
      
      {/* 1. SECTOR BANNER AND TOOLS SELECTOR */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl space-y-5" id="export-config-panel">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="p-3 bg-slate-900 text-white rounded-xl shadow-md">
            <Printer className="w-5.5 h-3.5 text-sky-400" />
          </div>
          <div>
            <span className="bg-sky-50 text-sky-850 border border-sky-100 text-[9px] font-bold px-2.5 py-0.5 rounded-sm">REPORTS AND EXPORTS</span>
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight uppercase mt-0.5">Generator Formulir Cetak & Excel SHEET</h3>
          </div>
        </div>

        {/* Filters panel inside generator */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="export-selectors-row">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Bidang Pelaksana</label>
            <select
              value={filterBidang}
              onChange={(e) => setFilterBidang(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white text-slate-800 font-semibold"
            >
              <option value="Semua">Semua Bidang</option>
              <option value="Sekretariat">Sekretariat</option>
              <option value="Bidang Perikanan Tangkap">Perikanan Tangkap</option>
              <option value="Bidang Perikanan Budidaya">Perikanan Budidaya</option>
              <option value="Bidang P2PSDP">P2PSDP</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-sans">Kecamatan</label>
            <select
              value={filterKecamatan}
              onChange={(e) => setFilterKecamatan(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white text-slate-800 font-semibold"
            >
              <option value="Semua">Semua Kecamatan</option>
              {kecamatanList.filter(k => k !== 'Semua').map(kec => (
                <option key={kec} value={kec}>{kec}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status Progres Capaian</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white text-slate-800 font-semibold"
            >
              <option value="Semua">Semua Kinerja</option>
              <option value="Tinggi">Kinerja Tinggi (&gt;= 75%)</option>
              <option value="Sedang">Kinerja Sedang (40% - 74%)</option>
              <option value="Rendah">Kinerja Rendah (&lt; 40%)</option>
            </select>
          </div>
        </div>

        {/* Action Triggers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-5" id="export-buttons-frame">
          {/* Printable trigger */}
          <button
            onClick={handlePrintReports}
            disabled={exportedData.length === 0}
            className="flex items-center justify-center gap-2 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold transition-all shadow-md shadow-slate-900/10 cursor-pointer disabled:opacity-40"
            id="btn-trigger-print-pdf"
          >
            <FileText className="w-5 h-5 text-sky-400" />
            <div className="text-left">
              <span className="block text-[8.5px] uppercase font-bold text-slate-450 leading-none">PDF / PRINT OUT</span>
              <span className="block mt-0.5 font-bold">Cetak Berkas Dinas Terkait ({exportedData.length} Data)</span>
            </div>
          </button>

          {/* Excel spreadsheet trigger */}
          <button
            onClick={handleExportCSV}
            disabled={exportedData.length === 0}
            className="flex items-center justify-center gap-2 py-3 bg-emerald-700 hover:bg-emerald-850 text-white rounded-2xl text-xs font-bold transition-all shadow-md shadow-emerald-700/10 cursor-pointer disabled:opacity-40"
            id="btn-trigger-excel-csv"
          >
            <FileSpreadsheet className="w-5 h-5 text-emerald-300" />
            <div className="text-left">
              <span className="block text-[8.5px] uppercase font-bold text-emerald-300 leading-none">MICROSOFT EXCEL SHEET</span>
              <span className="block mt-0.5 font-bold">Unduh Dokumen .CSV Excel ({exportedData.length} Baris)</span>
            </div>
          </button>
        </div>
      </div>

      {/* 2. ON-SCREEN EXPORT PREVIEW CARD */}
      <div className="bg-white p-6 rounded-3xl border border-slate-205 shadow-md space-y-4" id="export-preview-box">
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pratinjau Hasil Laporan Sebelum Di-Export</h4>
          <p className="text-[11px] text-slate-500 font-medium">Berdasarkan filter parameter aktif di atas</p>
        </div>

        <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/20 text-xs overflow-x-auto" id="preview-laporan-container">
          {exportedData.length === 0 ? (
            <div className="py-8 text-center text-slate-400 font-semibold italic">
              Sepertinya parameter filter yang dipilih tidak membuahkan data. Silakan sesuaikan filter.
            </div>
          ) : (
            <div className="min-w-[700px] space-y-4">
              {/* Header Letterhead Preview */}
              <div className="text-center border-b-2 border-slate-400 pb-3 font-sans">
                <span className="block font-extrabold uppercase text-[10px] sm:text-xs">PEMERINTAH KABUPATEN HALMAHERA SELATAN</span>
                <span className="block font-black uppercase text-xs sm:text-sm tracking-wide text-indigo-950">DINAS KELAUTAN DAN PERIKANAN</span>
                <span className="text-[9px] text-slate-455">Kawasan Bumi Moro, Labuha, Halmahera Selatan, Maluku Utara • T.A. {currentConfig.tahunAnggaranAktif}</span>
              </div>

              {/* Table Preview */}
              <table className="min-w-full text-[10px] text-slate-700 table-auto border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white uppercase text-[9px] tracking-wide">
                    <th scope="col" className="px-2 py-2 border text-center font-bold">No</th>
                    <th scope="col" className="px-3 py-2 border text-left">Deskripsi Pekerjaan / Bidang</th>
                    <th scope="col" className="px-2 py-2 border text-center">Lokasi Kerja</th>
                    <th scope="col" className="px-2 py-2 border text-center">Fisik (%)</th>
                    <th scope="col" className="px-3 py-2 border text-right">Pagu (Rp)</th>
                    <th scope="col" className="px-2 py-2 border text-right">Realisasi (Rp)</th>
                    <th scope="col" className="px-2 py-2 border text-right">Sisa Anggaran (Rp)</th>
                  </tr>
                </thead>
                <tbody className="divide-y bg-white font-medium">
                  {exportedData.slice(0, 5).map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition">
                      <td className="px-2 py-2 border text-center font-mono">{idx + 1}</td>
                      <td className="px-3 py-2 border">
                        <span className="text-[8px] font-bold uppercase text-slate-400 block">{item.bidang}</span>
                        <span className="font-extrabold text-slate-800 leading-tight">{item.uraianPekerjaan}</span>
                      </td>
                      <td className="px-2 py-2 border text-center">{item.lokasiDesa}</td>
                      <td className="px-2 py-2 border text-center font-mono font-bold">{item.realisasiFisik}%</td>
                      <td className="px-3 py-2 border text-right font-mono">{formatIDR(item.paguAnggaran)}</td>
                      <td className="px-3 py-2 border text-right font-mono text-emerald-650">{formatIDR(item.realisasiKeuangan)}</td>
                      <td className="px-3 py-2 border text-right font-mono text-rose-650">{formatIDR(item.sisaAnggaran)}</td>
                    </tr>
                  ))}
                  
                  {exportedData.length > 5 && (
                    <tr>
                      <td colSpan={7} className="px-5 py-2.5 text-center text-slate-400 font-semibold italic border">
                        ... Dan {exportedData.length - 5} data baris laporan lainnya terlipat dalam pratinjau. Unduh Excel atau Print PDF untuk melihat penuh.
                      </td>
                    </tr>
                  )}

                  {/* Totals Preview */}
                  <tr className="bg-slate-100 font-extrabold text-slate-900 uppercase">
                    <td colSpan={3} className="px-3 py-2.5 border text-center">TOTAL REKAPITULASI PREVIEW</td>
                    <td className="px-2 py-2.5 border text-center font-mono">{dynamicTotals.avgFisik}%</td>
                    <td className="px-3 py-2.5 border text-right font-mono">{formatIDR(dynamicTotals.pagu)}</td>
                    <td className="px-3 py-2.5 border text-right font-mono text-emerald-700">{formatIDR(dynamicTotals.keu)} ({dynamicTotals.avgKeu}%)</td>
                    <td className="px-3 py-2.5 border text-right font-mono text-rose-700">{formatIDR(dynamicTotals.sisa)}</td>
                  </tr>
                </tbody>
              </table>

              {/* Signature Preview */}
              <div className="flex justify-between text-[10px] text-slate-500 pt-3">
                <span>Inspektur DKP Prov. Maluku Utara</span>
                <span className="text-right">Kepala Dinas DKP Kab. Halsel</span>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
