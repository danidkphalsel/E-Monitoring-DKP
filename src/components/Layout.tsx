import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DKPLogo } from './DKPLogo';
import { 
  LayoutDashboard, 
  Database, 
  FileText, 
  BarChart3, 
  Image as ImageIcon, 
  Printer, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Bell, 
  AlertTriangle,
  Calendar,
  ChevronRight,
  User
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { 
    currentUser, 
    logout, 
    activeMenu, 
    setActiveMenu, 
    notifikasis,
    currentConfig 
  } = useApp();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Menu Definition based on roles
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'OPERATOR', 'PIMPINAN'] },
    { id: 'realisasi', label: 'Data Realisasi', icon: Database, roles: ['ADMIN', 'OPERATOR', 'PIMPINAN'] },
    { id: 'rekap', label: 'Rekap Bidang', icon: FileText, roles: ['ADMIN', 'OPERATOR', 'PIMPINAN'] },
    { id: 'grafik', label: 'Grafik Capaian', icon: BarChart3, roles: ['ADMIN', 'OPERATOR', 'PIMPINAN'] },
    { id: 'dokumentasi', label: 'Dokumentasi', icon: ImageIcon, roles: ['ADMIN', 'OPERATOR', 'PIMPINAN'] },
    { id: 'export', label: 'Export Laporan', icon: Printer, roles: ['ADMIN', 'OPERATOR', 'PIMPINAN'] },
    { id: 'users', label: 'Manajemen User', icon: Users, roles: ['ADMIN'] },
    { id: 'pengaturan', label: 'Pengaturan', icon: Settings, roles: ['ADMIN'] },
  ];

  // Filtering visible menus by role
  const visibleMenus = menuItems.filter(item => 
    currentUser ? item.roles.includes(currentUser.role) : false
  );

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <span className="bg-red-100 text-red-900 border border-red-200 text-[10px] font-bold px-2 py-0.5 rounded-full">ADMINISTRATOR</span>;
      case 'OPERATOR':
        return <span className="bg-sky-100 text-sky-900 border border-sky-200 text-[10px] font-bold px-2 py-0.5 rounded-full">OPERATOR</span>;
      case 'PIMPINAN':
        return <span className="bg-emerald-100 text-emerald-990 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">PIMPINAN / KADIS</span>;
      default:
        return null;
    }
  };

  const handleNotifClick = (realisasiId: string) => {
    setIsNotifOpen(false);
    setActiveMenu('realisasi');
  };

  return (
    <div className="min-h-screen font-sans bg-slate-50 flex flex-col" id="app-shell">
      {/* Top Banner Pemerintah Kabupaten Halmahera Selatan */}
      <header className="bg-[#051930] text-white text-[10px] py-1.5 px-4 sm:px-6 flex justify-between items-center border-b border-white/10" id="top-badge-strip">
        <div className="flex items-center gap-1.5 font-bold tracking-wider">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-md shadow-emerald-400/50"></span>
          <span className="text-emerald-400 font-extrabold text-[9px]">E-MONITORING</span>
          <span className="text-white/20">|</span>
          <span className="text-neutral-200">PEMERINTAH DAERAH KABUPATEN HALMAHERA SELATAN</span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[9px] text-blue-300 font-bold">
          <Calendar className="w-3.5 h-3.5 text-emerald-400" />
          <span>TAHUN ANGGARAN: {currentConfig.tahunAnggaranAktif}</span>
        </div>
      </header>

      {/* Main Container - Sidebar & Content Area */}
      <div className="flex-1 flex flex-row overflow-hidden relative" id="layout-body-wrapper">
        
        {/* SIDEBAR - DESKTOP */}
        <aside className="hidden md:flex md:w-64 bg-[#0A2647] flex-col shrink-0 border-r border-[#002B5B] text-slate-150 z-30" id="desktop-sidebar">
          {/* Logo Brand Header */}
          <div className="p-3.5 bg-[#051930] border-b border-white/10" id="sidebar-logo">
            <DKPLogo showText={true} textColor="text-white" size="sm" />
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto" id="sidebar-nav">
            <div className="px-3 py-1.5 text-[10px] font-bold text-blue-300 uppercase tracking-widest opacity-60">
              Menu Utama
            </div>
            {visibleMenus.map((item) => {
              const Icon = item.icon;
              const isActive = activeMenu === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveMenu(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded text-[13px] font-semibold tracking-wide transition-colors group cursor-pointer text-left ${
                    isActive 
                      ? 'bg-blue-800/40 text-white border-l-4 border-emerald-400 font-bold' 
                      : 'text-blue-100 hover:bg-white/5'
                  }`}
                  id={`sidebar-link-${item.id}`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 shrink-0 transition-transform ${isActive ? 'text-emerald-400 scale-105' : 'text-blue-200 group-hover:scale-105'}`} />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isActive ? 'opacity-100 text-emerald-400 rotate-90' : 'opacity-0 group-hover:opacity-45 group-hover:translate-x-0.5'}`} />
                </button>
              );
            })}
          </nav>

          {/* Footer Active Profile */}
          <div className="p-3 bg-[#051930] border-t border-white/10 flex flex-col gap-2" id="sidebar-footer">
            <div className="flex items-center gap-2.5 bg-[#0A2647]/50 p-2 rounded border border-white/5">
              <div className="w-8 h-8 rounded-full bg-blue-900 flex items-center justify-center border border-white/10 shadow-inner">
                <User className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-100 truncate">{currentUser?.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 animate-pulse"></span>
                  <p className="text-[10px] font-bold text-slate-350 truncate uppercase tracking-widest">
                    {currentUser?.role === 'OPERATOR' ? currentUser.bidang : (currentUser?.role || '')}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-3 py-1.5 border border-white/15 hover:border-red-500/30 rounded text-xs font-bold text-blue-200 hover:text-white hover:bg-red-900/15 transition-all cursor-pointer"
              id="btn-logout"
            >
              <LogOut className="w-3.5 h-3.5 text-blue-300 group-hover:text-red-400" />
              <span>Keluar Sesi</span>
            </button>
          </div>
        </aside>

        {/* MOBILE SIDEBAR PANEL (Drawer overlay) */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex" id="mobile-sidebar-drawer">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setIsSidebarOpen(false)}></div>
            <div className="relative flex flex-col w-72 max-w-[85vw] bg-[#0A2647] text-white z-10 border-r border-[#002B5B]">
              <div className="p-4 bg-[#051930] flex justify-between items-center border-b border-white/10">
                <DKPLogo showText={true} textColor="text-white" size="sm" />
                <button 
                  onClick={() => setIsSidebarOpen(false)} 
                  className="p-1.5 rounded bg-blue-900 text-blue-200 hover:text-white border border-white/10"
                  id="btn-close-mobile-nav"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {visibleMenus.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeMenu === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveMenu(item.id);
                        setIsSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded text-[13px] font-bold transition-colors ${
                        isActive ? 'bg-blue-800/40 text-white border-l-4 border-emerald-400' : 'text-blue-100 hover:bg-white/5'
                      }`}
                      id={`mobile-sidebar-link-${item.id}`}
                    >
                      <Icon className="w-4 h-4 text-blue-300" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="p-4 bg-[#051930] border-t border-white/10">
                <div className="flex items-center gap-2.5 mb-3 bg-[#0A2647]/50 p-2 rounded border border-white/5">
                  <User className="w-5 h-5 text-emerald-400" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{currentUser?.name}</p>
                    <p className="text-[10px] text-blue-300 truncate tracking-widest uppercase">{currentUser?.role}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsSidebarOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 border border-white/10 hover:bg-red-950/20 active:bg-slate-900 rounded text-xs font-bold text-blue-250 hover:text-white"
                >
                  <LogOut className="w-4 h-4 text-blue-300" />
                  <span>Keluar Sesi</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* RIGHT AREA - Header & Dynamic Component Viewport */}
        <div className="flex-1 flex flex-col overflow-hidden" id="app-view-layout">
          {/* Header/Navbar */}
          <nav className="bg-white border-b border-slate-200/95 h-16 flex items-center justify-between px-4 sm:px-6 relative z-10 shrink-0" id="top-navbar">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 md:hidden"
                id="btn-hamburger-menu"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              <div className="flex flex-col md:pl-0 pl-1">
                <h1 className="text-slate-900 text-[11px] sm:text-[13px] md:text-sm font-extrabold uppercase leading-tight tracking-tight">
                  E-Realisasi Kelautan dan Perikanan
                </h1>
                <p className="text-slate-500 text-[9px] sm:text-[10px] font-semibold tracking-wider font-sans">
                  KABUPATEN HALMAHERA SELATAN
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Active Operator Scope Indicator */}
              {currentUser?.role === 'OPERATOR' && (
                <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-250 rounded-full text-[10px] font-bold text-emerald-800" id="operator-scope-badge">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Mandat: {currentUser.bidang}</span>
                </div>
              )}

              {/* Performance Warnings Center Button (Bell) */}
              <div className="relative" id="alert-notifications-wrapper">
                <button
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className={`p-1.5 rounded border transition-all relative cursor-pointer ${
                    notifikasis.length > 0 
                      ? 'bg-amber-55 border-amber-200 text-amber-700 animate-pulse hover:bg-amber-100' 
                      : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                  id="btn-notifications-toggle"
                >
                  <Bell className="w-4.5 h-4.5" />
                  {notifikasis.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-rose-600 text-white font-mono text-[9px] font-bold flex items-center justify-center animate-bounce shadow-md">
                      {notifikasis.length}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown Drawer */}
                {isNotifOpen && (
                  <div className="absolute right-0 mt-2.5 w-80 sm:w-96 bg-white border border-slate-200 rounded shadow-xl z-50 overflow-hidden" id="notifications-panel">
                    <div className="p-3 bg-[#0A2647] text-white flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4.5 h-4.5 text-amber-400" />
                        <span className="text-[10px] font-extrabold uppercase tracking-widest">Alert Progres Kritis</span>
                      </div>
                      <span className="bg-rose-600 text-white font-mono text-[10px] rounded px-1.5 py-0.5 font-extrabold">{notifikasis.length} Kasus</span>
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 text-xs" id="notifications-list">
                      {notifikasis.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 font-semibold italic">
                          Luar biasa! Tidak ada kegiatan dengan progres kritis terdeteksi. All green!
                        </div>
                      ) : (
                        notifikasis.map((notif) => (
                          <div 
                            key={notif.id} 
                            onClick={() => handleNotifClick(notif.realisasiId)}
                            className="p-3 hover:bg-slate-50 cursor-pointer transition-all flex gap-2.5"
                          >
                            <span className="w-2 h-2 shrink-0 rounded-full bg-red-600 mt-1.5"></span>
                            <div className="flex-1">
                              <p className="font-bold text-slate-900 leading-tight">
                                {notif.bidang}
                              </p>
                              <p className="text-slate-600 mt-0.5 text-[11px] leading-relaxed line-clamp-2">
                                {notif.pesan}
                              </p>
                              <div className="flex gap-2.5 mt-1 text-[10px] text-slate-400 font-medium">
                                <span>Fisik: {notif.realisasiFisik}%</span>
                                <span>•</span>
                                <span>Keuangan: {notif.realisasiKeuanganPersen}%</span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="p-2 bg-slate-50 text-center border-t border-slate-100">
                      <button 
                        onClick={() => {
                          setIsNotifOpen(false);
                          setActiveMenu('realisasi');
                        }} 
                        className="text-[11px] font-bold text-sky-700 hover:text-sky-850"
                      >
                        Lihat Seluruh Realisasi Kegiatan
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Compact Active User card on top navbar */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[120px]">{currentUser?.name.split(',')[0]}</p>
                  <p className="text-[10px] font-semibold text-emerald-600">{currentUser?.role}</p>
                </div>
                <div className="w-8 h-8 rounded bg-gradient-to-tr from-[#0A2647] to-emerald-500 flex items-center justify-center font-bold text-white text-xs shadow-inner">
                  {currentUser?.name.charAt(0)}
                </div>
              </div>
            </div>
          </nav>

          {/* Core App dynamic viewport page content wrapper */}
          <main className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4" id="main-content-viewport">
            {children}
          </main>

          {/* Status Bar Footer */}
          <footer className="h-8 bg-[#0A2647] text-blue-300 flex items-center justify-between px-6 text-[9px] uppercase font-bold tracking-widest shrink-0 border-t border-white/5" id="app-status-bar">
            <div>Dinas Kelautan dan Perikanan Kabupaten Halmahera Selatan</div>
            <div className="flex items-center gap-4">
              <span>Sistem Realisasi Fisik & Keuangan (E-Monitoring)</span>
              <span className="text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>STATUS: AKTIF (ONLINE)</span>
              </span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};
