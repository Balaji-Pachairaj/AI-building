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
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Real-time backend status for mobile header pill
  const { status, duration } = useSelector((state) => state.health);
  const isUp = status === 'succeeded';
  const isChecking = status === 'loading';

  // Run initial health check on application boot
  useEffect(() => {
    dispatch(checkServerHealth());
  }, [dispatch]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="app-layout">
      {/* Mobile Top Header (Visible on screen widths < 992px) */}
      <header className="mobile-header">
        <button
          type="button"
          onClick={() => setMobileSidebarOpen(true)}
          className="mobile-menu-btn"
          aria-label="Open Navigation Menu"
        >
          <Menu size={22} />
        </button>

        <Link to="/" className="mobile-brand">
          <Server size={20} color="var(--accent-primary)" />
          <span>API Manager</span>
          <span className="nav-brand-badge">Hub</span>
        </Link>

        <div className="mobile-health-pill">
          <span
            className={`pulse-dot ${
              isChecking ? 'offline' : isUp ? 'online' : 'offline'
            }`}
          />
          <span className="mobile-health-label">
            {isChecking ? 'Checking' : isUp ? `${duration || 0}ms` : 'Offline'}
          </span>
        </div>
      </header>

      {/* Side Navigation Bar with Expandable Application Menus */}
      <Sidebar
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
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
