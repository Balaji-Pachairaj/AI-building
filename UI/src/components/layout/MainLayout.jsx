import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Menu, Server } from 'lucide-react';
import Sidebar from './Sidebar';
import NotificationToast from '../common/NotificationToast';
import { checkServerHealth } from '../../features/health/healthSlice';

const MainLayout = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Real-time backend status for top bar pill
  const { status, duration } = useSelector((state) => state.health);
  const isUp = status === 'succeeded';
  const isChecking = status === 'loading';

  // Run initial health check on application boot
  useEffect(() => {
    dispatch(checkServerHealth());
  }, [dispatch]);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="app-layout">
      {/* Universal Top Bar with Hamburger Menu Button */}
      <header className="app-topbar">
        <div className="app-topbar-left">
          <button
            type="button"
            onClick={() => setSidebarOpen((prev) => !prev)}
            className="topbar-hamburger-btn"
            aria-label="Toggle Navigation Menu"
            title="Open side navigation menu"
          >
            <Menu size={22} />
          </button>

          <Link to="/" className="topbar-brand">
            <div className="topbar-brand-icon">
              <Server size={18} color="var(--accent-primary)" />
            </div>
            <span className="topbar-brand-title">API Manager</span>
            <span className="nav-brand-badge">Hub</span>
          </Link>
        </div>

        <div className="topbar-right">
          <div className="topbar-health-pill" title="Backend API Connection Status">
            <span
              className={`pulse-dot ${
                isChecking ? 'checking' : isUp ? 'online' : 'offline'
              }`}
            />
            <span className="topbar-health-label">
              {isChecking ? 'Checking...' : isUp ? `API Online (${duration || 0}ms)` : 'API Offline'}
            </span>
          </div>
        </div>
      </header>

      {/* Side Navigation Bar with Expandable Application Menus */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="app-main-wrapper">
        <main className="main-content">
          <Outlet />
        </main>

        <footer className="app-footer">
          <div>
            <span>
              Connected API:{' '}
              <code style={{ color: 'var(--accent-info)', fontFamily: 'var(--font-mono)' }}>
                {import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}
              </code>
            </span>
            <span style={{ margin: '0 0.75rem' }}>•</span>
            <span>Express + MongoDB Mongoose + Redux Toolkit</span>
          </div>
        </footer>
      </div>

      <NotificationToast />
    </div>
  );
};

export default MainLayout;
