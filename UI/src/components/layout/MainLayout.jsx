import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Navbar from '../common/Navbar';
import NotificationToast from '../common/NotificationToast';
import { checkServerHealth } from '../../features/health/healthSlice';

const MainLayout = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  // Hide top navbar only on the root '/' route
  const isRoot = location.pathname === '/';

  // Run initial health check on application boot
  useEffect(() => {
    dispatch(checkServerHealth());
  }, [dispatch]);

  return (
    <div className="app-layout">
      {!isRoot && <Navbar />}
      <main className="main-content" style={isRoot ? { paddingTop: '3rem' } : undefined}>
        <Outlet />
      </main>
      <NotificationToast />

      {!isRoot && (
        <footer
          style={{
            borderTop: '1px solid var(--border-color)',
            padding: '1.25rem 1.5rem',
            textAlign: 'center',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
          }}
        >
          <span>
            Connected API:{' '}
            <code style={{ color: 'var(--accent-info)', fontFamily: 'var(--font-mono)' }}>
              {import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}
            </code>
          </span>
          <span style={{ margin: '0 0.75rem' }}>•</span>
          <span>Express + MongoDB Mongoose + Redux Toolkit</span>
        </footer>
      )}
    </div>
  );
};

export default MainLayout;
