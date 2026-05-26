import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Image, Filter, Calendar, FolderClock, ZoomIn, X, Info, Download } from 'lucide-react';

interface PhotoItem {
  src: string;
  id: string;
  bidang: string;
  uraian: string;
  tanggal: string;
  kecamatan: string;
  desa: string;
  bulan: string;
  oleh: string;
  tahun: string;
}

export const DokumentasiKegiatan: React.FC = () => {
  const { realisasi } = useApp();
  const [activeBidang, setActiveBidang] = useState<string>('Semua');
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);

  const handleDownload = (photo: PhotoItem) => {
    const cleanUraian = photo.uraian.replace(/[^a-z0-9]/gi, '_').substring(0, 30);
    const cleanBidang = photo.bidang.replace(/[^a-z0-9]/gi, '_');
    const filename = `Dokumentasi_${cleanBidang}_${cleanUraian}.png`;
    
    const link = document.createElement('a');
    link.href = photo.src;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Extract all photos with parent activity details
  const allPhotos = useMemo(() => {
    const list: PhotoItem[] = [];
    realisasi.forEach(item => {
      if (item.dokumentasi && item.dokumentasi.length > 0) {
        item.dokumentasi.forEach(src => {
          list.push({
            src,
            id: `${item.id}-${src.substring(0, 15)}`, // safe identifier
            bidang: item.bidang,
            uraian: item.uraianPekerjaan,
            tanggal: item.tanggalEdit || item.tanggalInput,
            kecamatan: item.lokasiKecamatan,
            desa: item.lokasiDesa,
            bulan: item.bulan,
            oleh: item.terakhirDieditOleh,
            tahun: item.tahunAnggaran || '2026'
          });
        });
      }
    });
    return list;
  }, [realisasi]);

  // Filter photos by active bidang selector
  const filteredPhotos = useMemo(() => {
    if (activeBidang === 'Semua') return allPhotos;
    return allPhotos.filter(p => p.bidang === activeBidang);
  }, [allPhotos, activeBidang]);

  return (
    <div className="space-y-6" id="dokumentasi-tab-view">
      
      {/* 1. SECTOR BANNER */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/95 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4" id="dokumentasi-header">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-slate-900 text-white rounded-xl shadow-md">
            <Image className="w-6 h-6 text-sky-450" />
          </div>
          <div>
            <span className="bg-sky-50 text-sky-850 border border-sky-100 text-[9px] font-bold px-2.5 py-0.5 rounded-sm">GALLERY CENTER</span>
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight uppercase mt-0.5">Galeri Dokumentasi Progress Fisik</h3>
          </div>
        </div>

        {/* Filters Select row */}
        <div className="flex flex-wrap gap-2" id="dokumentasi-tabs-toggle">
          {['Semua', 'Sekretariat', 'Bidang Perikanan Tangkap', 'Bidang Perikanan Budidaya', 'Bidang P2PSDP'].map((bid) => (
            <button
              key={bid}
              onClick={() => setActiveBidang(bid)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeBidang === bid 
                  ? 'bg-slate-900 text-white shadow-xs' 
                  : 'bg-white text-slate-655 border border-slate-205 hover:bg-slate-50'
              }`}
              id={`tab-galeri-${bid.replace(' ', '_')}`}
            >
              {bid === 'Semua' ? 'Semua Foto' : bid.replace('Bidang ', '')}
            </button>
          ))}
        </div>
      </div>

      {/* 2. PHOTOS GRID FLOW */}
      {filteredPhotos.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 shadow-sm space-y-3" id="galeri-kosong">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <FolderClock className="w-8 h-8" />
          </div>
          <p className="text-slate-400 italic font-semibold text-xs">Belum ada dokumentasi terunggah pada kriteria filter bidang ini.</p>
          <div className="max-w-md mx-auto bg-slate-50 p-3 rounded-xl border text-[11px] text-slate-500 font-medium">
            Silakan unggah foto lampiran saat membuat atau menyunting data realisasi di tab <strong>"Data Realisasi"</strong>.
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5" id="galeri-photos-grid">
          {filteredPhotos.map((photo) => (
            <div 
              key={photo.id}
              onClick={() => setSelectedPhoto(photo)}
              className="bg-white border rounded-2xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-200 group cursor-pointer flex flex-col justify-between"
              id={`photo-card-${photo.id}`}
            >
              {/* Thumbnail Container */}
              <div className="aspect-video relative overflow-hidden bg-slate-100 shrink-0">
                <img referrerPolicy="no-referrer" src={photo.src} alt="Dokumentasi Kerja" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition duration-150 flex items-center justify-center gap-3">
                  <span 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPhoto(photo);
                    }}
                    className="p-2 bg-white/95 text-slate-900 rounded-full hover:bg-white hover:scale-105 border transition cursor-pointer"
                    title="Perbesar Foto"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </span>
                  <span 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(photo);
                    }}
                    className="p-2 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 hover:scale-105 border border-emerald-400 transition cursor-pointer"
                    title="Unduh / Download Foto"
                  >
                    <Download className="w-4 h-4" />
                  </span>
                </div>
                
                {/* Department label on top of visual */}
                <div className="absolute top-2.5 left-2.5 bg-slate-900/80 backdrop-blur-xs text-white text-[8.5px] font-black tracking-wide uppercase px-2 py-0.5 rounded-sm">
                  {photo.bidang.replace('Bidang ', '')}
                </div>
              </div>

              {/* Text context details block */}
              <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                <p className="text-[11.5px] font-bold text-slate-800 leading-tight line-clamp-2" title={photo.uraian}>
                  {photo.uraian}
                </p>

                <div className="space-y-1.5 border-t border-slate-50 pt-2 text-[10px] text-slate-500 font-medium">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                    <span>Desa {photo.desa}, Kec. {photo.kecamatan}</span>
                  </div>
                  <div className="flex justify-between items-center text-[9px] text-slate-400">
                    <span>Oleh: {photo.oleh.split(' ')[0]}</span>
                    <span>{photo.bulan}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. LIGHTBOX LARGE PHOTO PREVIEW OVERLAY */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6" id="lightbox-overlay">
          <div className="absolute top-4 right-4 z-55">
            <button 
              onClick={() => setSelectedPhoto(null)} 
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 hover:scale-105 text-white border border-white/20 transition cursor-pointer"
              id="btn-close-lightbox"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]" id="lightbox-card" onClick={(e) => e.stopPropagation()}>
            {/* Left large photo viewer */}
            <div className="flex-1 bg-black flex items-center justify-center p-4 overflow-hidden relative min-h-[300px]">
              <img referrerPolicy="no-referrer" src={selectedPhoto.src} alt="Viewing detail" className="max-w-full max-h-[60vh] md:max-h-[80vh] object-contain shadow-md" />
            </div>

            {/* Right sidebar details in Lightbox */}
            <div className="w-full md:w-80 bg-white p-5 flex flex-col justify-between shrink-0 text-slate-850" id="lightbox-sidebar">
              <div className="space-y-4">
                <div className="bg-sky-50 p-2.5 rounded-lg border border-sky-100">
                  <span className="text-[9px] uppercase font-bold text-slate-405 block">DOKUMENTASI BIDANG</span>
                  <span className="font-extrabold text-xs text-sky-800">{selectedPhoto.bidang}</span>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block trailing-side">Deskripsi Kegiatan</span>
                  <p className="text-xs font-bold leading-relaxed text-slate-900">{selectedPhoto.uraian}</p>
                </div>

                <div className="space-y-1.5 border-t border-slate-100 pt-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-semibold">Desa</span>
                    <span className="font-bold text-slate-850">{selectedPhoto.desa}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-semibold">Kecamatan</span>
                    <span className="font-bold text-slate-850">{selectedPhoto.kecamatan}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-semibold">Tahun Laporan</span>
                    <span className="font-bold text-slate-850">T.A. {selectedPhoto.tahun}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-semibold">Bulan</span>
                    <span className="font-bold text-slate-850">{selectedPhoto.bulan}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-semibold">Verifikator Input</span>
                    <span className="font-bold text-slate-850">{selectedPhoto.oleh}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-3">
                <button
                  onClick={() => handleDownload(selectedPhoto)}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded shadow-sm transition hover:scale-[1.01] cursor-pointer"
                  id="btn-download-lightbox"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh Foto Kegiatan</span>
                </button>

                <div className="bg-slate-50 p-2 rounded-md text-[10px] text-slate-500 font-medium flex gap-1.5">
                  <Info className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                  <span>Sistem mengunci foto ini berdasarkan rekam verifikasi bidang masing-masing.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
