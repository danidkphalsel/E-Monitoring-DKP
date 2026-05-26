/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Login } from './components/Login';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { RealisasiList } from './components/RealisasiList';
import { RekapBidang } from './components/RekapBidang';
import { GrafikCapaian } from './components/GrafikCapaian';
import { DokumentasiKegiatan } from './components/DokumentasiKegiatan';
import { ExportLaporan } from './components/ExportLaporan';
import { ManajemenUser } from './components/ManajemenUser';
import { Pengaturan } from './components/Pengaturan';

// Main Orchestrator component consuming context
const AppContent: React.FC = () => {
  const { currentUser, activeMenu } = useApp();

  // 1. Unauthenticated sessions render the login screen
  if (!currentUser) {
    return <Login />;
  }

  // 2. Render viewport matching selection
  const renderViewport = () => {
    switch (activeMenu) {
      case 'dashboard':
        return <Dashboard />;
      case 'realisasi':
        return <RealisasiList />;
      case 'rekap':
        return <RekapBidang />;
      case 'grafik':
        return <GrafikCapaian />;
      case 'dokumentasi':
        return <DokumentasiKegiatan />;
      case 'export':
        return <ExportLaporan />;
      case 'users':
        return <ManajemenUser />;
      case 'pengaturan':
        return <Pengaturan />;
      default:
        return <Dashboard />;
    }
  };

  return <Layout>{renderViewport()}</Layout>;
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
