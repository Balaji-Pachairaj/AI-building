import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import HomePage from './pages/HomePage';
import HealthPage from './pages/HealthPage';
import BuildingStuffsPage from './pages/BuildingStuffsPage';
import HitLoggerPage from './pages/HitLoggerPage';
import LogsPage from './pages/LogsPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          {/* Landing route '/' with list linking to boilerplate code */}
          <Route index element={<HomePage />} />

          {/* Boilerplate code & health check route */}
          <Route path="boilerplate" element={<HealthPage />} />
          <Route path="boiler-plate" element={<Navigate to="/boilerplate" replace />} />

          {/* Other routes for all APIs */}
          <Route path="building-stuffs" element={<BuildingStuffsPage />} />
          <Route path="hit-logger" element={<HitLoggerPage />} />
          <Route path="logs" element={<LogsPage />} />

          {/* Catch-all 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
