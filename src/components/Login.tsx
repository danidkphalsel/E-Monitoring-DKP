import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DKPLogo } from './DKPLogo';
import { Shield, Key, UserCheck, Eye, EyeOff, Info } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, users } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('password123'); // Preset password
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [customKey, setCustomKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Nama Pengguna (Username) wajib diisi');
      return;
    }

    const success = login(username, 'OPERATOR'); // checks by username
    if (!success) {
      setError('Username tidak ditemukan atau dinonaktifkan.');
    } else {
      setError('');
    }
  };

  const handleQuickLogin = (uname: string) => {
    const success = login(uname, 'OPERATOR');
    if (!success) {
      setError('Uji coba login gagal.');
    } else {
      setError('');
    }
  };

  return (
    <div className="min-h-screen font-sans bg-radial from-slate-50 via-slate-100 to-sky-100/50 flex flex-col justify-center py-10 sm:px-6 lg:px-8 relative overflow-hidden" id="login-screen">
      {/* Background Ambience decoration representing fisheries */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-sky-200/40 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-45 -left-45 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Container */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10" id="login-header">
        <div className="flex justify-center flex-col items-center">
          <DKPLogo size="lg" className="mb-4 text-slate-800" showText={false} />
          <h2 className="text-center text-xl font-bold text-slate-900 tracking-tight leading-7 px-4">
            E-REALISASI FISIK & KEUANGAN
          </h2>
          <p className="mt-1 text-center text-xs font-semibold text-sky-700 tracking-wider uppercase">
            Dinas Kelautan dan Perikanan Kab. Halmahera Selatan
          </p>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10" id="login-card">
        <div className="bg-white py-8 px-4 shadow-xl border border-slate-100 rounded-2xl sm:px-10">
          
          <div className="mb-5 bg-sky-50 border-l-4 border-sky-600 p-3 rounded-r-md text-xs text-slate-700 flex gap-2.5 items-start" id="welcome-alert">
            <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            <div>
              Selamat datang di portal pelaporan capaian program DKP Halmahera Selatan tahun anggaran berjalan. Silakan gunakan kredensial bidang Anda.
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit} id="login-form">
            <div>
              <label htmlFor="username" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Nama Pengguna (Username)
              </label>
              <div className="mt-1 relative rounded-md shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Shield className="h-4.5 w-4.5 text-slate-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-slate-50/50"
                  placeholder="Contoh: admin, op_tangkap"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Kata Sandi (Password)
              </label>
              <div className="mt-1 relative rounded-md shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-4.5 w-4.5 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50/50 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  id="toggle-pass-visibility"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs font-medium text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-100 flex gap-2 items-center" id="login-error-msg">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                {error}
              </p>
            )}

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg text-sm font-semibold text-white bg-sky-700 hover:bg-sky-800 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all duration-150 cursor-pointer shadow-md shadow-sky-700/10"
                id="btn-login-submit"
              >
                Masuk ke Aplikasi
              </button>
            </div>
          </form>

          {/* Quick Sandbox Bypass Access list */}
          <div className="mt-6 border-t border-slate-100 pt-5" id="developer-sandbox-panel">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center mb-3">
              Uji Coba Cepat (Autentikasi Integrasi)
            </h4>
            
            <div className="grid grid-cols-2 gap-2" id="quick-roles-buttons">
              {users.map((item) => {
                let colorClass = 'border-slate-200 hover:bg-slate-50 text-slate-700';
                if (item.role === 'ADMIN') colorClass = 'border-red-100 bg-red-50/40 hover:bg-red-50 text-red-800';
                if (item.role === 'PIMPINAN') colorClass = 'border-amber-100 bg-amber-50/40 hover:bg-amber-50 text-amber-800';
                if (item.role === 'OPERATOR') colorClass = 'border-sky-100 bg-sky-50/40 hover:bg-sky-50 text-sky-800';

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleQuickLogin(item.username)}
                    className={`flex items-center gap-1.5 p-2 border rounded-xl text-[11px] font-medium leading-tight text-left transition-all ${colorClass} cursor-pointer`}
                    id={`quick-login-${item.username}`}
                  >
                    <UserCheck className="w-3.5 h-3.5 shrink-0" />
                    <div className="truncate">
                      <p className="font-bold uppercase tracking-wide text-[9px] truncate">
                        {item.role === 'OPERATOR' ? item.bidang?.replace('Bidang ', '') : item.role}
                      </p>
                      <p className="text-[11px] truncate">{item.username}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Institutional note footer */}
          <div className="mt-5 text-center text-[10px] text-slate-400 font-medium" id="login-copyright">
            © 2026 Pemerintah Daerah Kabupaten Halmahera Selatan.<br />
            Semua Hak Cipta Dilindungi Undang-Undang.
          </div>

        </div>
      </div>
    </div>
  );
};
