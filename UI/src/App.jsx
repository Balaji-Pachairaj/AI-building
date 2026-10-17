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

// Budget Padmanabhan Pages
import BudgetDashboardPage from './pages/budget/BudgetDashboardPage';
import AddTransactionPage from './pages/budget/AddTransactionPage';
import AddTagsPage from './pages/budget/AddTagsPage';
import TagAnalysisPage from './pages/budget/TagAnalysisPage';
import ViewTransactionsPage from './pages/budget/ViewTransactionsPage';

// Sleep Tracker Pages
import SleepTrackerPage from './pages/sleep/SleepTrackerPage';
import SleepAnalyticsPage from './pages/sleep/SleepAnalyticsPage';

// Habit Tracker Pages (Legacy/Redirects)
import HabitDailyTrackerPage from './pages/habits/HabitDailyTrackerPage';
import HabitAnalyticsPage from './pages/habits/HabitAnalyticsPage';
import HabitSingleAnalyticsPage from './pages/habits/HabitSingleAnalyticsPage';
import HabitSleepAnalyticsPage from './pages/habits/HabitSleepAnalyticsPage';
import HabitManagePage from './pages/habits/HabitManagePage';

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

          {/* Dedicated Sleep Tracker Application Routes */}
          <Route path="sleep" element={<SleepTrackerPage />} />
          <Route path="sleep/analytics" element={<SleepAnalyticsPage />} />

          {/* Habit Tracker Aliases & Redirects to Sleep Tracker */}
          <Route path="habits" element={<Navigate to="/sleep" replace />} />
          <Route path="habit-tracker" element={<Navigate to="/sleep" replace />} />
          <Route path="habits/sleep-analytics" element={<Navigate to="/sleep/analytics" replace />} />
          <Route path="habits/sleep" element={<Navigate to="/sleep/analytics" replace />} />
          <Route path="habits/daily" element={<HabitDailyTrackerPage />} />
          <Route path="habits/analytics" element={<HabitAnalyticsPage />} />
          <Route path="habits/single-analytics" element={<HabitSingleAnalyticsPage />} />
          <Route path="habits/single-analytics/:habitId" element={<HabitSingleAnalyticsPage />} />
          <Route path="habits/manage" element={<HabitManagePage />} />

          {/* Budget Padmanabhan Application Routes */}
          <Route path="budget_padmanabhan" element={<BudgetDashboardPage />} />
          <Route path="budget-padmanabhan" element={<Navigate to="/budget_padmanabhan" replace />} />
          <Route path="budget_padmanabhan/add-transaction" element={<AddTransactionPage />} />
          <Route path="budget_padmanabhan/add-tags" element={<AddTagsPage />} />
          <Route path="budget_padmanabhan/tags/:tagName/analysis" element={<TagAnalysisPage />} />
          <Route path="budget_padmanabhan/transactions" element={<ViewTransactionsPage />} />

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
