import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  LayoutGrid,
  Wallet,
  Sparkles,
  Server,
  ChevronDown,
  Activity,
  Layers,
  Zap,
  Database,
  Receipt,
  PlusCircle,
  Tag,
  LayoutDashboard,
  Cpu,
  Compass,
  RefreshCw,
  X,
} from 'lucide-react';
import { checkServerHealth } from '../../features/health/healthSlice';
import '../../styles/sidebar.css';

/**
 * Application & Sub-Page Navigation Registry
 * Defines each application, its metadata, route prefixes, and expandable sub-pages
 */
export const APPLICATIONS_CONFIG = [
  {
    id: 'budget-padmanabhan',
    name: 'Budget Padmanabhan',
    category: 'Finance',
    tag: 'v1.0.0',
    accentColor: '#e1306c',
    icon: Wallet,
    iconBg: 'rgba(225, 48, 108, 0.15)',
    baseRoute: '/budget_padmanabhan',
    matchPatterns: ['/budget_padmanabhan', '/budget-padmanabhan'],
    subPages: [
      {
        id: 'budget-dashboard',
        name: 'Dashboard Overview',
        path: '/budget_padmanabhan',
        exact: true,
        icon: LayoutDashboard,
        badge: 'Analytics',
      },
      {
        id: 'budget-transactions',
        name: 'Spending History',
        path: '/budget_padmanabhan/transactions',
        icon: Receipt,
        badge: null,
      },
      {
        id: 'budget-add-transaction',
        name: 'Add Expense',
        path: '/budget_padmanabhan/add-transaction',
        icon: PlusCircle,
        badge: 'New',
      },
      {
        id: 'budget-tags',
        name: 'Category Tags',
        path: '/budget_padmanabhan/add-tags',
        icon: Tag,
        badge: null,
      },
    ],
  },
  {
    id: 'next-token',
    name: 'Next Token Prediction',
    category: 'AI / LLM',
    tag: 'v1.0.0',
    accentColor: '#6366f1',
    icon: Sparkles,
    iconBg: 'rgba(99, 102, 241, 0.15)',
    baseRoute: '/next_token',
    matchPatterns: ['/next_token', '/next-token'],
    subPages: [
      {
        id: 'next-token-dashboard',
        name: 'Token Playground',
        path: '/next_token',
        exact: true,
        icon: Cpu,
        badge: 'Playground',
      },
      {
        id: 'next-token-graph',
        name: 'Cosmic 3D Graph',
        path: '/next_token/graph',
        icon: Compass,
        badge: '3D Space',
      },
    ],
  },
  {
    id: 'boilerplate-suite',
    name: 'Express & MongoDB Suite',
    category: 'Backend',
    tag: 'v1.0.0',
    accentColor: '#10b981',
    icon: Server,
    iconBg: 'rgba(16, 185, 129, 0.15)',
    baseRoute: '/boilerplate',
    matchPatterns: [
      '/boilerplate',
      '/boiler-plate',
      '/building-stuffs',
      '/hit-logger',
      '/logs',
    ],
    subPages: [
      {
        id: 'boilerplate-health',
        name: 'Server Diagnostics',
        path: '/boilerplate',
        exact: true,
        icon: Activity,
        badge: 'Health',
      },
      {
        id: 'boilerplate-building-stuffs',
        name: 'Building Stuffs',
        path: '/building-stuffs',
        icon: Layers,
        badge: 'CRUD',
      },
      {
        id: 'boilerplate-hit-logger',
        name: 'Hit Logger',
        path: '/hit-logger',
        icon: Zap,
        badge: 'Events',
      },
      {
        id: 'boilerplate-logs',
        name: 'API Audit Logs',
        path: '/logs',
        icon: Database,
        badge: 'History',
      },
    ],
  },
];

const Sidebar = ({ isOpen = false, onClose = () => {} }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Live Backend status from Redux
  const { status, duration } = useSelector((state) => state.health);
  const isUp = status === 'succeeded';
  const isChecking = status === 'loading';

  // Expandable states for each application menu
  const [expandedApps, setExpandedApps] = useState(() => {
    const initial = {};
    APPLICATIONS_CONFIG.forEach((app) => {
      // Auto-expand if current route matches this app on initial load
      const isMatch = app.matchPatterns.some((pattern) =>
        location.pathname.startsWith(pattern)
      );
      initial[app.id] = isMatch || false;
    });
    return initial;
  });

  // Keep the current active application expanded when location changes
  useEffect(() => {
    const currentApp = APPLICATIONS_CONFIG.find((app) =>
      app.matchPatterns.some((pattern) => location.pathname.startsWith(pattern))
    );
    if (currentApp) {
      setExpandedApps((prev) => ({
        ...prev,
        [currentApp.id]: true,
      }));
    }
  }, [location.pathname]);

  // Toggle application expand/collapse
  const handleToggleExpand = (appId, e) => {
    e?.stopPropagation();
    setExpandedApps((prev) => ({
      ...prev,
      [appId]: !prev[appId],
    }));
  };

  // Click on Application Header: navigates to application base route & ensures expanded
  const handleAppHeaderClick = (app) => {
    setExpandedApps((prev) => ({
      ...prev,
      [app.id]: true,
    }));
    navigate(app.baseRoute);
    onClose();
  };

  // Helper to check if an app group has an active route
  const isAppActive = (app) => {
    return app.matchPatterns.some((pattern) =>
      location.pathname.startsWith(pattern)
    );
  };

  // Helper to check if a specific sub-page is active
  const isSubPageActive = (subPage) => {
    if (subPage.exact) {
      return location.pathname === subPage.path;
    }
    return location.pathname.startsWith(subPage.path);
  };

  // Manual Health Check refresh
  const handleRefreshHealth = (e) => {
    e.stopPropagation();
    dispatch(checkServerHealth());
  };

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      <div
        className={`sidebar-overlay ${isOpen ? 'is-open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Main Sidebar Element */}
      <aside className={`sidebar ${isOpen ? 'is-open' : ''}`} aria-label="Sidebar Navigation">
        {/* Sidebar Brand Header */}
        <div className="sidebar-header">
          <NavLink to="/" className="sidebar-brand" onClick={onClose}>
            <div className="sidebar-brand-icon">
              <Server size={20} color="var(--accent-primary)" />
            </div>
            <div>
              <span>API Manager</span>
            </div>
            <span className="sidebar-brand-badge">Hub</span>
          </NavLink>

          <button
            type="button"
            className="sidebar-close-btn"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Navigation Items */}
        <nav className="sidebar-nav">
          {/* Main / Home Link */}
          <div className="sidebar-section-title">Overview</div>
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
            onClick={onClose}
          >
            <div className="sidebar-link-content">
              <LayoutGrid size={17} />
              <span>All Applications</span>
            </div>
            <span className="sidebar-link-badge">
              {APPLICATIONS_CONFIG.length} Apps
            </span>
          </NavLink>

          {/* Applications Header */}
          <div className="sidebar-section-title" style={{ marginTop: '0.6rem' }}>
            Applications &amp; Modules
          </div>

          {/* Each Application in the Application Suite */}
          {APPLICATIONS_CONFIG.map((app) => {
            const AppIcon = app.icon;
            const isExpanded = !!expandedApps[app.id];
            const isActive = isAppActive(app);

            return (
              <div key={app.id} className="app-group">
                {/* Application Header Row */}
                <div
                  className={`app-group-header ${isActive ? 'is-active-app' : ''}`}
                  onClick={() => handleAppHeaderClick(app)}
                  title={`Open ${app.name}`}
                >
                  <div className="app-group-left">
                    <div
                      className="app-icon-container"
                      style={{ background: app.iconBg }}
                    >
                      <AppIcon size={17} color={app.accentColor} />
                    </div>

                    <div className="app-info-block">
                      <span className="app-name">{app.name}</span>
                      <span className="app-category">{app.category}</span>
                    </div>
                  </div>

                  <div className="app-group-actions">
                    <button
                      type="button"
                      className={`app-chevron-btn ${isExpanded ? 'is-expanded' : ''}`}
                      onClick={(e) => handleToggleExpand(app.id, e)}
                      aria-label={isExpanded ? `Collapse ${app.name}` : `Expand ${app.name}`}
                    >
                      <ChevronDown size={15} />
                    </button>
                  </div>
                </div>

                {/* Expandable Sub-Pages Menu */}
                <div
                  className={`app-sub-menu ${
                    isExpanded ? 'is-expanded' : 'is-collapsed'
                  }`}
                  style={{
                    maxHeight: isExpanded ? `${app.subPages.length * 52}px` : '0px',
                  }}
                >
                  {app.subPages.map((subPage) => {
                    const SubIcon = subPage.icon;
                    const subActive = isSubPageActive(subPage);

                    return (
                      <NavLink
                        key={subPage.id}
                        to={subPage.path}
                        end={subPage.exact}
                        className={`sub-menu-link ${subActive ? 'active' : ''}`}
                        onClick={onClose}
                      >
                        <div className="sub-menu-link-content">
                          <SubIcon
                            size={14}
                            color={subActive ? app.accentColor : 'var(--text-muted)'}
                          />
                          <span>{subPage.name}</span>
                        </div>

                        {subPage.badge && (
                          <span className="sub-badge">{subPage.badge}</span>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Sidebar Footer with Live API Connection Status */}
        <div className="sidebar-footer">
          <div className="sidebar-health-card">
            <div className="sidebar-health-header">
              <div className="sidebar-health-indicator">
                <span
                  className={`pulse-dot ${
                    isChecking ? 'checking' : isUp ? 'online' : 'offline'
                  }`}
                />
                <div className="sidebar-health-text">
                  <span className="sidebar-health-title">
                    {isChecking ? 'Checking API...' : isUp ? 'API Online' : 'API Offline'}
                  </span>
                  <span className="sidebar-health-duration">
                    {isChecking
                      ? 'Connecting...'
                      : isUp
                      ? `Latency: ${duration || 0}ms`
                      : 'Disconnected'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRefreshHealth}
                className={`sidebar-refresh-btn ${isChecking ? 'is-spinning' : ''}`}
                title="Refresh API Health Check"
                aria-label="Refresh API Health Check"
              >
                <RefreshCw size={13} />
              </button>
            </div>

            <div className="sidebar-api-badge">
              <span className="sidebar-api-endpoint" title={import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}>
                {import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
