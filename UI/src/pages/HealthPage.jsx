import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  checkServerHealth,
  checkRootApi,
  toggleAutoRefresh,
} from '../features/health/healthSlice';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Activity, RefreshCw, Clock, Wifi, Server, CheckCircle, AlertOctagon } from 'lucide-react';

const HealthPage = () => {
  const dispatch = useDispatch();
  const { status, healthData, rootData, lastChecked, duration, error, autoRefresh } =
    useSelector((state) => state.health);

  const isOnline = status === 'succeeded';
  const isLoading = status === 'loading';

  const handleRefresh = () => {
    dispatch(checkServerHealth());
    dispatch(checkRootApi());
  };

  useEffect(() => {
    handleRefresh();
  }, [dispatch]);

  // Auto polling effect
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      dispatch(checkServerHealth());
    }, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, dispatch]);

  const formatUptime = (seconds) => {
    if (!seconds && seconds !== 0) return 'N/A';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hrs > 0 ? `${hrs}h ` : ''}${mins > 0 ? `${mins}m ` : ''}${secs}s`;
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Activity color="var(--accent-primary)" size={28} />
            Server Health Status
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Real-time diagnostics and availability check for the backend API
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => dispatch(toggleAutoRefresh())}
            className={`btn ${autoRefresh ? 'btn-primary' : 'btn-outline'}`}
            style={{ fontSize: '0.85rem' }}
          >
            <Clock size={16} />
            {autoRefresh ? 'Auto-Polling (5s)' : 'Enable Auto-Poll'}
          </button>

          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="btn btn-secondary"
            style={{ fontSize: '0.85rem' }}
          >
            <RefreshCw size={16} className={isLoading ? 'spin-icon' : ''} />
            {isLoading ? 'Pinging...' : 'Ping Now'}
          </button>
        </div>
      </div>

      {/* Main Health Card */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Server size={20} color="var(--accent-primary)" />
            <span>Connection Overview</span>
          </div>
          <div>
            <StatusBadge status={isOnline ? 'UP' : status === 'loading' ? 'CHECKING' : 'DOWN'} />
          </div>
        </div>

        {/* Status Metrics Grid */}
        <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
          <div className="stat-box">
            <span className="stat-label">Health Status</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
              {isOnline ? (
                <CheckCircle size={22} color="var(--accent-success)" />
              ) : (
                <AlertOctagon size={22} color="var(--accent-danger)" />
              )}
              <span className="stat-value" style={{ color: isOnline ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
                {isOnline ? 'Operational' : isLoading ? 'Checking...' : 'Unreachable'}
              </span>
            </div>
          </div>

          <div className="stat-box">
            <span className="stat-label">Response Latency</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
              <Wifi size={22} color="var(--accent-info)" />
              <span className="stat-value" style={{ color: 'var(--accent-info)' }}>
                {duration ? `${duration} ms` : 'N/A'}
              </span>
            </div>
          </div>

          <div className="stat-box">
            <span className="stat-label">Server Uptime</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
              <Clock size={22} color="var(--accent-warning)" />
              <span className="stat-value" style={{ color: 'var(--text-primary)', fontSize: '1.3rem' }}>
                {healthData?.uptime !== undefined ? formatUptime(healthData.uptime) : 'Offline'}
              </span>
            </div>
          </div>
        </div>

        {/* If Offline: Troubleshooting banner */}
        {!isOnline && !isLoading && (
          <div
            style={{
              padding: '1.2rem',
              backgroundColor: 'var(--accent-danger-bg)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.5rem',
            }}
          >
            <h4 style={{ color: 'var(--accent-danger)', fontWeight: 700, marginBottom: '0.4rem' }}>
              Cannot reach the backend server
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              Error: <span style={{ color: 'var(--accent-danger)' }}>{error || 'Connection refused'}</span>
            </p>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
              <strong>Troubleshooting Steps:</strong>
              <ol style={{ paddingLeft: '1.25rem', marginTop: '0.4rem', lineHeight: '1.6' }}>
                <li>Make sure MongoDB is connected in <code>API/.env</code>.</li>
                <li>Start the Express backend: <code>cd API && npm run dev</code>.</li>
                <li>Verify the backend is listening on <code>{import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}</code>.</li>
              </ol>
            </div>
          </div>
        )}

        {/* Diagnostics & Raw JSON */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Raw Response from <code>GET /api/health</code>
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Last checked: {lastChecked ? new Date(lastChecked).toLocaleTimeString() : 'Never'}
            </span>
          </div>

          <div className="code-block">
            {isLoading && !healthData
              ? 'Pinging server diagnostics...'
              : JSON.stringify(healthData || { status: 'DOWN', error }, null, 2)}
          </div>
        </div>
      </div>

      {/* Available Endpoints Catalog (from GET /) */}
      {rootData && rootData.endpoints && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Activity size={18} color="var(--accent-info)" />
              <span>Available Backend Routes Catalog</span>
            </div>
          </div>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Feature Name</th>
                  <th>Route / Endpoint</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(rootData.endpoints).map(([key, route]) => (
                  <tr key={key}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                      {key.replace(/([A-Z])/g, ' $1')}
                    </td>
                    <td>
                      <code style={{ color: 'var(--accent-info)', fontFamily: 'var(--font-mono)' }}>
                        {route}
                      </code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthPage;
