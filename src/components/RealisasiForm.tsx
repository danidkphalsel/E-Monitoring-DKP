import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Realisasi, BidangType } from '../types';
import { X, Upload, CheckCircle2, AlertCircle, Sparkles, Image as ImageIcon } from 'lucide-react';

interface RealisasiFormProps {
  realisasiId?: string; // If provided, mode is EDIT
  onClose: () => void;
}

export const RealisasiForm: React.FC<RealisasiFormProps> = ({ realisasiId, onClose }) => {
  const { 
    realisasi, 
    addRealisasi, 
    updateRealisasi, 
    currentUser, 
    currentConfig 
  } = useApp();

  const isEditMode = !!realisasiId;
  const targetItem = isEditMode ? realisasi.find(r => r.id === realisasiId) : null;

  // Form states
  const [bidang, setBidang] = useState<BidangType>('Sekretariat');
  const [program, setProgram] = useState('');
  const [kegiatan, setKegiatan] = useState('');
  const [subKegiatan, setSubKegiatan] = useState('');
  const [uraianPekerjaan, setUraianPekerjaan] = useState('');
  const [lokasiDesa, setLokasiDesa] = useState('');
  const [lokasiKecamatan, setLokasiKecamatan] = useState('');
  const [targetFisik, setTargetFisik] = useState<number>(100);
  const [realisasiFisik, setRealisasiFisik] = useState<number>(0);
  const [paguAnggaran, setPaguAnggaran] = useState<number>(0);
  const [realisasiKeuangan, setRealisasiKeuangan] = useState<number>(0);
  
  // Auxiliary states
  const [tanggalInput, setTanggalInput] = useState(() => new Date().toISOString().split('T')[0]);
  const [bulan, setBulan] = useState('Januari');
  const [tahunAnggaran, setTahunAnggaran] = useState(currentConfig.tahunAnggaranAktif);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDragOver, setIsDragOver] = useState(false);

  // Auto populate on Edit Mode
  useEffect(() => {
    if (isEditMode && targetItem) {
      setBidang(targetItem.bidang);
      setProgram(targetItem.program);
      setKegiatan(targetItem.kegiatan);
      setSubKegiatan(targetItem.subKegiatan);
      setUraianPekerjaan(targetItem.uraianPekerjaan);
      setLokasiDesa(targetItem.lokasiDesa);
      setLokasiKecamatan(targetItem.lokasiKecamatan);
      setTargetFisik(targetItem.targetFisik);
      setRealisasiFisik(targetItem.realisasiFisik);
      setPaguAnggaran(targetItem.paguAnggaran);
      setRealisasiKeuangan(targetItem.realisasiKeuangan);
      setTanggalInput(targetItem.tanggalInput);
      setBulan(targetItem.bulan);
      setTahunAnggaran(targetItem.tahunAnggaran);
      setUploadedPhotos(targetItem.dokumentasi || []);
    }
  }, [isEditMode, targetItem]);

  // Enforce Operator restrictions: Sets operators' fields to their configured bidang only
  useEffect(() => {
    if (currentUser?.role === 'OPERATOR' && currentUser.bidang !== 'Semua') {
      setBidang(currentUser.bidang as BidangType);
    }
  }, [currentUser]);

  // Automatic calculations computed variables
  const computedSisaAnggaran = Math.max(0, paguAnggaran - realisasiKeuangan);
  const computedPersentaseKeuangan = paguAnggaran > 0 
    ? parseFloat(((realisasiKeuangan / paguAnggaran) * 100).toFixed(2)) 
    : 0;

  // Real-time automatic validations
  useEffect(() => {
    const freshErrors: Record<string, string> = {};
    if (realisasiFisik > 100) {
      freshErrors.realisasiFisik = 'Realisasi capaian fisik lapangan tidak boleh melebihi 100%';
    }
    if (realisasiKeuangan > paguAnggaran) {
      freshErrors.realisasiKeuangan = 'Realisasi penyusutan keuangan tidak boleh melebihi Pagu Anggaran';
    }
    setErrors(prev => {
      // Preserve other fields, update real-time ones
      const next = { ...prev };
      delete next.realisasiFisik;
      delete next.realisasiKeuangan;
      return { ...next, ...freshErrors };
    });
  }, [realisasiFisik, realisasiKeuangan, paguAnggaran]);

  // Input sanitizations and format triggers
  const formatRupiahDisplay = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num);
  };

  // Convert files to base64 images for localStorage saving simulation
  const handleFileProcessing = (files: FileList) => {
    const errorList: string[] = [];
    const currentCount = uploadedPhotos.length;
    const allowedNewCount = 10 - currentCount;

    if (allowedNewCount <= 0) {
      setErrors(prev => ({ ...prev, upload: 'Batas maksimum upload adalah 10 foto kegiatan. Silakan hapus foto yang tidak diperlukan terlebih dahulu.' }));
      return;
    }

    if (files.length > allowedNewCount) {
      errorList.push(`Maksimal 10 foto kegiatan yang diperbolehkan. Hanya ${allowedNewCount} file pertama yang akan diproses.`);
    }

    const filesToProcess = Array.from(files).slice(0, allowedNewCount);

    filesToProcess.forEach(file => {
      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        errorList.push(`Format file ${file.name} tidak valid. Hanya JPG/JPEG/PNG.`);
        return;
      }
      if (file.size > 2 * 1024 * 1024) { // 2MB limit to prevent storage quota choke
        errorList.push(`Ukuran ${file.name} terlalu besar (Maksimal 2 MB).`);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setUploadedPhotos(prev => {
            if (prev.length >= 10) return prev;
            return [...prev, reader.result as string];
          });
        }
      };
      reader.readAsDataURL(file);
    });

    if (errorList.length > 0) {
      setErrors(prev => ({ ...prev, upload: errorList.join(', ') }));
    } else {
      setErrors(prev => {
        const next = { ...prev };
        delete next.upload;
        return next;
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcessing(e.dataTransfer.files);
    }
  };

  const removePhoto = (index: number) => {
    setUploadedPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const validateFullForm = (): boolean => {
    const fullErrors: Record<string, string> = {};
    if (!program.trim()) fullErrors.program = 'Program wajib diisi';
    if (!kegiatan.trim()) fullErrors.kegiatan = 'Nama kegiatan wajib diisi';
    if (!subKegiatan.trim()) fullErrors.subKegiatan = 'Sub kegiatan wajib diisi';
    if (!uraianPekerjaan.trim()) fullErrors.uraianPekerjaan = 'Uraian pekerjaan wajib didetailkan';
    if (!lokasiDesa.trim()) fullErrors.lokasiDesa = 'Lokasi desa kerja wajib diisi';
    if (!lokasiKecamatan.trim()) fullErrors.lokasiKecamatan = 'Nama kecamatan wilayah wajib diisi';
    
    if (realisasiFisik < 0 || realisasiFisik > 100) {
      fullErrors.realisasiFisik = 'Progres fisik harus di antara 0% s.d. 100%';
    }
    if (paguAnggaran <= 0) {
      fullErrors.paguAnggaran = 'Nilai pagu anggaran harus di atas Rp 0';
    }
    if (realisasiKeuangan < 0 || realisasiKeuangan > paguAnggaran) {
      fullErrors.realisasiKeuangan = 'Anggaran terpakai tidak boleh lebih dari pagu';
    }

    setErrors(fullErrors);
    return Object.keys(fullErrors).length === 0;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateFullForm()) return;

    // Package payload
    const payload = {
      bidang,
      program: program.trim(),
      kegiatan: kegiatan.trim(),
      subKegiatan: subKegiatan.trim(),
      uraianPekerjaan: uraianPekerjaan.trim(),
      lokasiDesa: lokasiDesa.trim(),
      lokasiKecamatan: lokasiKecamatan.trim(),
      targetFisik,
      realisasiFisik,
      paguAnggaran,
      realisasiKeuangan,
      tanggalInput,
      bulan,
      tahunAnggaran,
      dokumentasi: uploadedPhotos
    };

    if (isEditMode && realisasiId) {
      updateRealisasi(realisasiId, payload, []);
    } else {
      addRealisasi(payload, []);
    }

    onClose();
  };

  // Restrict access
  const isOperatorRestricted = currentUser?.role === 'OPERATOR' && isEditMode && targetItem?.bidang !== currentUser.bidang;
  const isPimpinanRestricted = currentUser?.role === 'PIMPINAN';

  if (isOperatorRestricted || isPimpinanRestricted) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-rose-200 shadow-sm text-center max-w-lg mx-auto" id="restricted-warning-overlay">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h4 className="text-md font-extrabold text-slate-800 uppercase">AKSES DIBATASI (READ ONLY)</h4>
        <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
          {isPimpinanRestricted 
            ? 'Akun Pimpinan hanya diizinkan untuk memantau visualisasi dashboard dan mengunduh laporan rekapitulasi kerja.' 
            : `Operator Bidang ${currentUser?.bidang} hanya diizinkan memodifikasi data program dalam lingkup bidang kerja Anda sendiri.`}
        </p>
        <button onClick={onClose} className="mt-4 text-xs font-bold text-slate-650 hover:text-slate-900 border px-3 py-1.5 rounded-lg">
          Kembali ke Tabel
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200/95 shadow-xl overflow-hidden" id="realisasi-form-card">
      {/* Decorative Title Header */}
      <div className="px-6 py-4.5 bg-slate-900 text-white flex justify-between items-center" id="form-header">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-5 h-5 text-sky-400" />
          <div>
            <span className="bg-sky-500/25 border border-sky-400/40 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm">
              Formulir Input
            </span>
            <h3 className="text-sm font-extrabold tracking-tight uppercase mt-0.5">
              {isEditMode ? 'PEMBARUAN DATA REALISASI KEGIATAN' : 'PENCATATAN REALISASI FISIK & KEUANGAN BARU'}
            </h3>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          id="btn-close-form"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSave} className="p-6 space-y-5" id="form-body">
        
        {/* ROW 1: Bidang & Waktu */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
              Bidang DKP Pelaksana <span className="text-red-500">*</span>
            </label>
            <select
              value={bidang}
              onChange={(e) => setBidang(e.target.value as BidangType)}
              disabled={currentUser?.role === 'OPERATOR'} // Operators are locked on their department
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-slate-50 font-semibold focus:ring-sky-500 focus:border-sky-500"
              id="input-bidang"
            >
              <option value="Sekretariat">Sekretariat</option>
              <option value="Bidang Perikanan Tangkap">Bidang Perikanan Tangkap</option>
              <option value="Bidang Perikanan Budidaya">Bidang Perikanan Budidaya</option>
              <option value="Bidang P2PSDP">Bidang P2PSDP (Peningkatan Daya Saing & Pengawasan)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
              Bulan Berjalan Laporan <span className="text-red-500">*</span>
            </label>
            <select
              value={bulan}
              onChange={(e) => setBulan(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-sky-500 text-slate-800"
              id="input-bulan"
            >
              <option value="Januari">Januari</option>
              <option value="Februari">Februari</option>
              <option value="Maret">Maret</option>
              <option value="April">April</option>
              <option value="Mei">Mei</option>
              <option value="Juni">Juni</option>
              <option value="Juli">Juli</option>
              <option value="Agustus">Agustus</option>
              <option value="September">September</option>
              <option value="Oktober">Oktober</option>
              <option value="November">November</option>
              <option value="Desember">Desember</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
              Tahun Anggaran <span className="text-red-500">*</span>
            </label>
            <select
              value={tahunAnggaran}
              onChange={(e) => setTahunAnggaran(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-sky-500 text-slate-800"
              id="input-tahun-anggaran"
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
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
              Tanggal Pelaporan / Update
            </label>
            <input
              type="date"
              required
              value={tanggalInput}
              onChange={(e) => setTanggalInput(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-800"
              id="input-tanggal"
            />
          </div>
        </div>

        {/* ROW 2: Program & Kegiatan */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
              Nama Rencana Program <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Program Pengelolaan Perikanan Tangkap"
              value={program}
              onChange={(e) => setProgram(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-sky-500 focus:border-sky-500 text-slate-800"
              id="input-program"
            />
            {errors.program && <p className="text-[10px] text-rose-600 mt-1 font-semibold">{errors.program}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
              Nama Kegiatan Bidang <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Pemberdayaan Nelayan Tradisional Lokal"
              value={kegiatan}
              onChange={(e) => setKegiatan(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800"
              id="input-kegiatan"
            />
            {errors.kegiatan && <p className="text-[10px] text-rose-600 mt-1 font-semibold">{errors.kegiatan}</p>}
          </div>
        </div>

        {/* ROW 3: Sub Kegiatan & Uraian Pekerjaan */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
              Sub Kegiatan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Penyediaan Sarana Prasarana Katinting Nelayan"
              value={subKegiatan}
              onChange={(e) => setSubKegiatan(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800"
              id="input-subkegiatan"
            />
            {errors.subKegiatan && <p className="text-[10px] text-rose-600 mt-1 font-semibold">{errors.subKegiatan}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
              Uraian Pekerjaan Detail <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Pengadaan bantuan perahu motor 3 GT bagi KUB nelayan di Babang"
              value={uraianPekerjaan}
              onChange={(e) => setUraianPekerjaan(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800"
              id="input-uraian"
            />
            {errors.uraianPekerjaan && <p className="text-[10px] text-rose-600 mt-1 font-semibold">{errors.uraianPekerjaan}</p>}
          </div>
        </div>

        {/* ROW 4: Wilayah Geografis Lokasi */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
              Kecamatan Wilayah Halmahera Selatan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Bacan Selatan, Gane Barat, Makian"
              value={lokasiKecamatan}
              onChange={(e) => setLokasiKecamatan(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800"
              id="input-kecamatan"
            />
            {errors.lokasiKecamatan && <p className="text-[10px] text-rose-600 mt-1 font-semibold">{errors.lokasiKecamatan}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
              Nama Desa / Lokasi Lapangan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Desa Kupal, Babang, Guruapin"
              value={lokasiDesa}
              onChange={(e) => setLokasiDesa(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800"
              id="input-desa"
            />
            {errors.lokasiDesa && <p className="text-[10px] text-rose-600 mt-1 font-semibold">{errors.lokasiDesa}</p>}
          </div>
        </div>

        {/* ROW 5: TARGET % DAN REALISASI FISIK % */}
        <div className="grid grid-cols-2 gap-5 bg-slate-50 p-4 border border-slate-200/60 rounded-xl">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide">
              Target Capaian Fisik (%) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              min="0"
              max="100"
              value={targetFisik}
              onChange={(e) => setTargetFisik(Number(e.target.value))}
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-850 font-semibold text-center"
              id="input-target-fisik"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide">
              Realisasi Fisik Lapangan (%) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              min="0"
              max="100"
              value={realisasiFisik}
              onChange={(e) => setRealisasiFisik(Number(e.target.value))}
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-850 font-bold text-center"
              id="input-realisasi-fisik"
            />
            {errors.realisasiFisik && <p className="text-[10.5px] text-rose-600 mt-1 font-semibold">{errors.realisasiFisik}</p>}
          </div>
        </div>

        {/* ROW 6: BUDGET PAGU DAN REALISASI KEUANGAN (Automatic computations inline updates) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-sky-50/50 p-4 border border-sky-150/60 rounded-xl">
          <div>
            <label className="flex justify-between text-[11px] font-bold text-slate-700 uppercase tracking-wide">
              <span>Pagu Anggaran DPA Kecil (Rp) <span className="text-red-500">*</span></span>
              <span className="text-sky-700 font-mono text-[10px]">{formatRupiahDisplay(paguAnggaran)}</span>
            </label>
            <input
              type="number"
              required
              min="0"
              placeholder="Masukkan angka nominal"
              value={paguAnggaran || ''}
              onChange={(e) => setPaguAnggaran(Math.max(0, Number(e.target.value)))}
              className="mt-1 block w-full px-3 py-2 border border-slate-350 rounded-lg text-xs text-slate-900 font-bold"
              id="input-pagu"
            />
            {errors.paguAnggaran && <p className="text-[10px] text-rose-600 mt-1 font-semibold">{errors.paguAnggaran}</p>}
          </div>

          <div>
            <label className="flex justify-between text-[11px] font-bold text-slate-700 uppercase tracking-wide">
              <span>Realisasi Keuangan Terpakap (Rp) <span className="text-red-500">*</span></span>
              <span className="text-emerald-700 font-mono text-[10px]">{formatRupiahDisplay(realisasiKeuangan)}</span>
            </label>
            <input
              type="number"
              required
              min="0"
              placeholder="Masukkan angka nominal"
              value={realisasiKeuangan || ''}
              onChange={(e) => setRealisasiKeuangan(Math.max(0, Number(e.target.value)))}
              className="mt-1 block w-full px-3 py-2 border border-slate-350 rounded-lg text-xs text-slate-900 font-bold"
              id="input-realisasi-keuangan"
            />
            {errors.realisasiKeuangan && <p className="text-[10px] text-rose-600 mt-1 font-semibold">{errors.realisasiKeuangan}</p>}
          </div>

          {/* Automatic Results Banner */}
          <div className="md:col-span-2 grid grid-cols-2 gap-3.5 pt-2 border-t border-sky-100">
            <div className="bg-white p-2.5 rounded-lg border border-sky-100">
              <span className="block text-[9px] uppercase font-bold text-slate-400 leading-none">Sisa Anggaran Terhitung</span>
              <span className="font-mono text-xs font-extrabold text-red-650">{formatRupiahDisplay(computedSisaAnggaran)}</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-sky-105">
              <span className="block text-[9px] uppercase font-bold text-slate-400 leading-none">Realisasi Keuangan</span>
              <span className="font-mono text-xs font-extrabold text-emerald-650">{computedPersentaseKeuangan}%</span>
            </div>
          </div>
        </div>

        {/* ROW 7: MULTIPLE IMAGES UPLOAD (Drag & Drop + Preview card tags) */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-750 uppercase tracking-wide">
            Dokumentasi Kegiatan Fisik (JPG, PNG, JPEG)
          </label>
          
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
              isDragOver 
                ? 'border-sky-500 bg-sky-50' 
                : 'border-slate-300 hover:border-sky-400 bg-slate-50/50 hover:bg-slate-50'
            }`}
            onClick={() => document.getElementById('image-uploader-ref')?.click()}
            id="drag-and-drop-deck"
          >
            <input 
              type="file" 
              multiple 
              accept="image/jpeg,image/png,image/jpg"
              onChange={(e) => {
                if (e.target.files) handleFileProcessing(e.target.files);
              }}
              className="hidden" 
              id="image-uploader-ref"
            />
            
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 bg-white rounded-full text-sky-600 border shadow-xs">
                <Upload className="w-5.5 h-3.5" />
              </div>
              <p className="text-xs font-bold text-slate-800">Tarik gambar kemari atau <span className="text-sky-600 underline">klik untuk mencari berkas</span></p>
              <p className="text-[10px] text-slate-400">File maks 2 MB tiap upload. Maksimal 10 foto kegiatan. Foto disimpan berdasarkan Bidang Kerja.</p>
            </div>
          </div>

          {errors.upload && <p className="text-[10px] text-rose-600 font-semibold">{errors.upload}</p>}

          {/* Previews Frame */}
          {uploadedPhotos.length > 0 && (
            <div className="pt-2">
              <span className="text-[10px] uppercase font-extrabold text-slate-400">Preview Berkas Terpilih ({uploadedPhotos.length}/10 Gambar)</span>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mt-1.5" id="photo-previews-list">
                {uploadedPhotos.map((p, idx) => (
                  <div key={idx} className="aspect-square relative rounded-xl border border-slate-200 overflow-hidden group shadow-inner">
                    <img referrerPolicy="no-referrer" src={p} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removePhoto(idx);
                      }}
                      className="absolute top-1 right-1 p-0.5 bg-slate-900/85 hover:bg-slate-900 text-white rounded-full transition-all"
                      id={`btn-remove-photo-${idx}`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white py-0.5 text-center text-[8px] tracking-tighter uppercase font-bold">
                      Slide {idx + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* FORM CONTROLS FOOTER */}
        <div className="flex gap-3 justify-end pt-4 border-t border-slate-100" id="form-actions-buttons">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600 cursor-pointer"
            id="btn-cancel-form"
          >
            Batal
          </button>
          <button
            type="submit"
            className="flex items-center gap-1.5 px-5 py-2.5 bg-sky-700 hover:bg-sky-800 rounded-xl text-xs font-bold text-white shadow-md shadow-sky-800/10 cursor-pointer"
            id="btn-save-form"
          >
            <CheckCircle2 className="w-4.5 h-4.5" />
            <span>Simpan Capaian</span>
          </button>
        </div>

      </form>
    </div>
  );
};
