import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, UserRole } from '../types';
import { Users, UserPlus, Trash2, ShieldCheck, CheckCircle2, AlertCircle, X, ShieldAlert } from 'lucide-react';

export const ManajemenUser: React.FC = () => {
  const { users, addUser, deleteUser, updateUser, currentUser } = useApp();

  const [isAdding, setIsAdding] = useState(false);
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('OPERATOR');
  const [bidang, setBidang] = useState<string>('Sekretariat');
  const [errorCode, setErrorCode] = useState('');

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorCode('');

    if (!username.trim() || !name.trim()) {
      setErrorCode('Semua kolom data wajib diisi.');
      return;
    }

    if (users.some(u => u.username.toLowerCase() === username.trim().toLowerCase())) {
      setErrorCode('Nama pengguna (username) sudah terpakai.');
      return;
    }

    addUser({
      username: username.trim().toLowerCase(),
      name: name.trim(),
      role,
      bidang: role === 'OPERATOR' ? bidang : 'Semua',
      isActive: true
    });

    // Reset Form
    setUsername('');
    setName('');
    setRole('OPERATOR');
    setBidang('Sekretariat');
    setIsAdding(false);
  };

  const getRoleBadge = (r: UserRole) => {
    switch (r) {
      case 'ADMIN':
        return <span className="bg-red-100 text-red-900 border border-red-200 text-[10px] font-bold px-2 py-0.5 rounded-full">ADMIN</span>;
      case 'PIMPINAN':
        return <span className="bg-amber-100 text-amber-900 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full">PIMPINAN</span>;
      default:
        return <span className="bg-sky-100 text-sky-900 border border-sky-200 text-[10px] font-bold px-2 py-0.5 rounded-full">OPERATOR</span>;
    }
  };

  const isSelfDeletion = (targetId: string) => {
    return currentUser?.id === targetId;
  };

  return (
    <div className="space-y-6" id="users-tab-view">
      
      {/* 1. SECTOR BANNER AND TRIGGER BUTTON */}
      <div className="bg-white p-5 rounded-2xl border border-slate-205/95 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" id="users-header">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-slate-900 text-white rounded-xl shadow-md">
            <Users className="w-6 h-6 text-sky-400" />
          </div>
          <div>
            <span className="bg-sky-50 text-sky-850 border border-sky-100 text-[9px] font-bold px-2.5 py-0.5 rounded-sm">USER MANAGEMENT</span>
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight uppercase mt-0.5">Daftar Akun Pengguna Terdaftar</h3>
          </div>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-xl text-xs font-bold transition shadow-md cursor-pointer shrink-0"
          id="btn-toggle-add-user"
        >
          <UserPlus className="w-4.5 h-4.5" />
          <span>{isAdding ? 'Sembunyikan Form' : 'Tambah Akun baru'}</span>
        </button>
      </div>

      {/* 2. INLINE ADD USER CARD */}
      {isAdding && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl max-w-2xl" id="add-user-card">
          <div className="flex justify-between items-center pb-3 border-b border-slate-150 mb-4">
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4.5 h-4.5 text-sky-655" />
              Pendaftaran Kredensial Pengguna Baru
            </h4>
            <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          <form onSubmit={handleSaveUser} className="space-y-4" id="add-user-form">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-705 uppercase tracking-wide">Nama Akun Pengguna (Username) <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: op_p2psdp"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-850 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-705 uppercase tracking-wide">Nama Lengkap & Gelar ASN <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Husnul Mubarak, S.Pi"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-850"
                  id="input-full-name-field"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-705 uppercase tracking-wide">Hak Akses Sistem (Role) <span className="text-red-500">*</span></label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-800"
                  id="select-role-user"
                >
                  <option value="OPERATOR">Operator Bidang Kerja</option>
                  <option value="ADMIN">Administrator Sistem</option>
                  <option value="PIMPINAN">Pimpinan / Kepala Dinas (Readonly)</option>
                </select>
              </div>

              {role === 'OPERATOR' && (
                <div>
                  <label className="block text-xs font-bold text-slate-705 uppercase tracking-wide">Mandat Lingkup Bidang Pelaksana <span className="text-red-500">*</span></label>
                  <select
                    value={bidang}
                    onChange={(e) => setBidang(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-800"
                    id="select-bidang-user"
                  >
                    <option value="Sekretariat">Sekretariat</option>
                    <option value="Bidang Perikanan Tangkap">Bidang Perikanan Tangkap</option>
                    <option value="Bidang Perikanan Budidaya">Bidang Perikanan Budidaya</option>
                    <option value="Bidang P2PSDP">Bidang P2PSDP</option>
                  </select>
                </div>
              )}
            </div>

            {errorCode && (
              <p className="text-xs font-semibold text-rose-650 bg-rose-50 p-2 rounded-lg border flex gap-1.5 items-center">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {errorCode}
              </p>
            )}

            <div className="flex justify-end gap-2.5 pt-3.5 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3.5 py-1.5 border border-slate-250 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-650"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-sky-700 hover:bg-sky-850 text-white rounded-xl text-xs font-bold font-sans shadow-md"
              >
                Simpan Pengguna
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. CORE USERS ACCOUNTS LIST TABLE */}
      <div className="bg-white rounded-3xl border border-slate-205 shadow-xl overflow-hidden" id="users-table-card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-150 text-xs table-auto">
            <thead className="bg-slate-900 text-white uppercase font-black text-[10px] tracking-wider" id="users-table-head">
              <tr>
                <th className="px-5 py-3.5 text-center w-12 border-r">No</th>
                <th className="px-6 py-3.5 text-left">Nama Pengguna (Username)</th>
                <th className="px-6 py-3.5 text-left">Nama Lengkap & Gelar ASN</th>
                <th className="px-5 py-3.5 text-center">Hak Akses Role</th>
                <th className="px-5 py-3.5 text-left">Bidang Kerja Mandat</th>
                <th className="px-5 py-3.5 text-center w-28">Status Pengguna</th>
                <th className="px-5 py-3.5 text-center w-24">Aksi</th>
              </tr>
            </thead>
            
            <tbody className="bg-white divide-y divide-slate-150 text-slate-800 font-medium">
              {users.map((u, i) => {
                const selfCheck = isSelfDeletion(u.id);
                return (
                  <tr key={u.id} className="hover:bg-slate-50 transition" id={`row-user-${u.username}`}>
                    <td className="px-5 py-3.5 whitespace-nowrap text-center font-mono font-bold text-slate-400 border-r">{i+1}</td>
                    
                    {/* Username */}
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <code className="bg-slate-100 px-2 py-0.5 rounded-md font-bold font-mono text-slate-700 text-[11px]">
                        {u.username}
                      </code>
                    </td>

                    {/* Full Name */}
                    <td className="px-6 py-3.5 whitespace-nowrap font-extrabold text-slate-900 text-xs">{u.name}</td>
                    
                    {/* Role badge */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-center">{getRoleBadge(u.role)}</td>
                    
                    {/* Scope field */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="text-slate-600 text-xs font-semibold">{u.bidang}</span>
                    </td>

                    {/* Active/In-active state toggles */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-center">
                      <button
                        onClick={() => {
                          if (selfCheck) return; // Cannot suspend yourself
                          updateUser(u.id, { isActive: !u.isActive });
                        }}
                        disabled={selfCheck}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                          u.isActive 
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-250 hover:bg-emerald-100' 
                            : 'bg-rose-50 text-rose-850 border-rose-250 hover:bg-rose-100'
                        }`}
                        title={selfCheck ? 'Akun Anda yang sedang aktif masuk.' : 'Klik untuk mengubah status aktif akun ini'}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                        <span>{u.isActive ? 'AKTIF' : 'NON-AKTIF'}</span>
                      </button>
                    </td>

                    {/* Actions dropdown */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-center">
                      <button
                        onClick={() => {
                          if (selfCheck) {
                            alert('Anda tidak dapat menghapus akun Anda sendiri saat sedang login masuk.');
                            return;
                          }
                          if (window.confirm(`Yakin ingin mencabut hak akses pengguna "${u.name}" dari sistem secara permanen?`)) {
                            deleteUser(u.id);
                          }
                        }}
                        disabled={selfCheck}
                        className={`p-1.5 text-rose-700 rounded-lg border transition ${
                          selfCheck 
                            ? 'opacity-30 border-slate-200 text-slate-400 cursor-not-allowed' 
                            : 'border-rose-200 bg-rose-50 hover:bg-rose-100 cursor-pointer'
                        }`}
                        title={selfCheck ? 'Akun Anda yang sedang masuk' : 'Cabut akses pengguna'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. SECURITY AUDIT MESSAGE BAR */}
      <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 font-medium text-xs text-amber-900 flex gap-3 items-start" id="security-notice-users">
        <ShieldAlert className="w-5.5 h-5.5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong>Standard Operasional Kredensial:</strong> Akses akun Operator dibatasi oleh bidang kerjanya demi menjaga akuntabilitas input. Pastikan setiap operator bidang menjaga nama pengguna mereka dengan baik. Segala bentuk kecurangan atau manipulasi capaian fisik dicatat otomatis pada tab <strong>"Aktivitas Terkini"</strong>.
        </div>
      </div>

    </div>
  );
};
