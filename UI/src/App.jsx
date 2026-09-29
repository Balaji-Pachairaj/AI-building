import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import NextTokenDashboardPage from './pages/NextTokenDashboardPage';
import HomePage from './pages/HomePage';
import HealthPage from './pages/HealthPage';
import BuildingStuffsPage from './pages/BuildingStuffsPage';
import HitLoggerPage from './pages/HitLoggerPage';
import LogsPage from './pages/LogsPage';
import NotFoundPage from './pages/NotFoundPage';

import GraphNextTokenPage from './pages/GraphNextTokenPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Fullscreen Cosmic "Graph the next token" View (No Navbar or Standard Layout) */}
        <Route path="next_token/graph" element={<GraphNextTokenPage />} />
        <Route path="next-token/graph" element={<Navigate to="/next_token/graph" replace />} />
        <Route path="graph-next-token" element={<Navigate to="/next_token/graph" replace />} />

        <Route path="/" element={<MainLayout />}>
          {/* Landing route '/' with list linking to all applications */}
          <Route index element={<HomePage />} />
          <Route path="apps" element={<Navigate to="/" replace />} />

          {/* Next Token Prediction Dashboard */}
          <Route path="next_token" element={<NextTokenDashboardPage />} />
          <Route path="next-token" element={<Navigate to="/next_token" replace />} />

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
