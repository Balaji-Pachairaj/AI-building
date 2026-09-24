import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { LayoutGrid, Activity, Layers, Zap, Database, Server } from 'lucide-react';

const Navbar = () => {
  const { status, duration } = useSelector((state) => state.health);
  const isUp = status === 'succeeded';
  const isChecking = status === 'loading';

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="nav-brand">
          <Server size={24} color="var(--accent-primary)" />
          <span>API Manager</span>
          <span className="nav-brand-badge">Express</span>
        </NavLink>

        <nav>
          <ul className="nav-links">
            <li>
              <NavLink
                to="/"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                end
              >
                <LayoutGrid size={16} />
                <span>All Apps</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/boilerplate"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <Activity size={16} />
                <span>Boilerplate</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/building-stuffs"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <Layers size={16} />
                <span>Building Stuffs</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/hit-logger"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <Zap size={16} />
                <span>Hit Logger</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/logs"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <Database size={16} />
                <span>API Logs</span>
              </NavLink>
            </li>
          </ul>
        </nav>

        {/* Live Backend Connection Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 0.65rem',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              fontSize: '0.8rem',
            }}
          >
            <span
              className={`pulse-dot ${
                isChecking ? 'offline' : isUp ? 'online' : 'offline'
              }`}
            />
            <span style={{ color: isUp ? 'var(--accent-success)' : 'var(--text-muted)' }}>
              {isChecking ? 'Checking...' : isUp ? `API Online (${duration || 0}ms)` : 'API Offline'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
