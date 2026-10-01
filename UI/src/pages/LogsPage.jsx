import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchLogsThunk,
  fetchLogByIdThunk,
  clearAllLogsThunk,
  setSelectedLog,
  clearSelectedLog,
  setPage,
} from '../features/logs/logsSlice';
import { addNotification } from '../features/notifications/notificationSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  Database,
  RefreshCw,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
  Copy,
  Calendar,
  Layers,
} from 'lucide-react';

const LogsPage = () => {
  const dispatch = useDispatch();
  const { logs, selectedLog, pagination, loading, clearing } = useSelector(
    (state) => state.logs
  );

  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    dispatch(fetchLogsThunk({ page: pagination.page, limit: pagination.limit }));
  }, [dispatch, pagination.page]);

  const handleRefresh = () => {
    dispatch(fetchLogsThunk({ page: pagination.page, limit: pagination.limit }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      dispatch(setPage(newPage));
    }
  };

  const handleClearLogs = async () => {
    setShowClearConfirm(false);
    const result = await dispatch(clearAllLogsThunk());
    if (!result.error) {
      dispatch(
        addNotification({
          type: 'success',
          title: 'Logs Cleared',
          message: 'All logs have been removed from the database.',
        })
      );
    }
  };

  const handleCopyJson = (obj) => {
    navigator.clipboard.writeText(JSON.stringify(obj, null, 2));
    dispatch(
      addNotification({
        type: 'info',
        title: 'Copied to Clipboard',
        message: 'JSON payload copied!',
        duration: 2000,
      })
    );
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Database color="var(--accent-primary)" size={28} />
            MongoDB Hit Logs Explorer
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Browse and inspect all stored hits in the MongoDB <strong>Log</strong> collection (<code>GET /api/logs</code>)
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="btn btn-secondary"
            style={{ fontSize: '0.85rem' }}
          >
            <RefreshCw size={16} className={loading ? 'spin-icon' : ''} />
            Refresh
          </button>

          {pagination.total > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              disabled={clearing}
              className="btn btn-danger"
              style={{ fontSize: '0.85rem' }}
            >
              <Trash2 size={16} />
              Clear All Logs
            </button>
          )}
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Layers size={18} color="var(--accent-info)" />
            <span>
              Recorded Logs ({pagination.total} Total)
            </span>
          </div>

          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Page {pagination.page} of {pagination.totalPages}
          </span>
        </div>

        {loading && <LoadingSpinner text="Fetching logs from database..." />}

        {!loading && logs.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <Database size={40} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
            <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>No hit logs recorded yet</p>
            <p style={{ fontSize: '0.85rem', marginTop: '0.4rem' }}>
              Head over to <strong>Building Stuffs</strong> or the <strong>Hit Logger</strong> tab to record some hits!
            </p>
          </div>
        )}

        {!loading && logs.length > 0 && (
          <>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Hit Time</th>
                    <th>Method</th>
                    <th>Endpoint</th>
                    <th>Hit Body Preview</th>
                    <th>Client IP</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => {
                    const hitDate = new Date(log.hitTime || log.createdAt);
                    return (
                      <tr key={log._id}>
                        <td style={{ whiteSpace: 'nowrap', fontSize: '0.85rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Calendar size={14} color="var(--text-muted)" />
                            <span>{hitDate.toLocaleDateString()}</span>
                            <span style={{ color: 'var(--text-muted)' }}>{hitDate.toLocaleTimeString()}</span>
                          </div>
                        </td>

                        <td>
                          <span
                            className="badge"
                            style={{
                              background:
                                log.method === 'POST'
                                  ? 'rgba(99, 102, 241, 0.2)'
                                  : 'rgba(16, 185, 129, 0.2)',
                              color: log.method === 'POST' ? 'var(--accent-primary)' : 'var(--accent-success)',
                            }}
                          >
                            {log.method || 'POST'}
                          </span>
                        </td>

                        <td>
                          <code style={{ color: 'var(--accent-info)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                            {log.endpoint || '/api/hit'}
                          </code>
                        </td>

                        <td style={{ maxWidth: '280px' }}>
                          <code
                            style={{
                              display: 'block',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              fontSize: '0.8rem',
                              color: 'var(--text-secondary)',
                            }}
                          >
                            {JSON.stringify(log.hitBody || {})}
                          </code>
                        </td>

                        <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          {log.ip || '127.0.0.1'}
                        </td>

                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                            <button
                              onClick={() => handleCopyJson(log.hitBody)}
                              className="btn btn-outline"
                              style={{ padding: '0.35rem 0.6rem' }}
                              title="Copy Hit Body JSON"
                            >
                              <Copy size={14} />
                            </button>
                            <button
                              onClick={() => dispatch(setSelectedLog(log))}
                              className="btn btn-primary"
                              style={{ padding: '0.35rem 0.6rem' }}
                              title="View Full Log Details"
                            >
                              <Eye size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '1.25rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid var(--border-color)',
                }}
              >
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Showing {logs.length} of {pagination.total} records
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="btn btn-outline"
                    style={{ padding: '0.4rem 0.8rem' }}
                  >
                    <ChevronLeft size={16} />
                    Prev
                  </button>

                  <span style={{ fontSize: '0.85rem', padding: '0 0.5rem' }}>
                    {pagination.page} / {pagination.totalPages}
                  </span>

                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="btn btn-outline"
                    style={{ padding: '0.4rem 0.8rem' }}
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="modal-overlay" onClick={() => dispatch(clearSelectedLog())}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="card-header">
              <div className="card-title">
                <Database size={20} color="var(--accent-primary)" />
                <span>Log Record: {selectedLog._id}</span>
              </div>
              <button
                onClick={() => dispatch(clearSelectedLog())}
                className="toast-close"
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="grid-2" style={{ gap: '1rem' }}>
                <div className="stat-box" style={{ padding: '0.75rem 1rem' }}>
                  <span className="stat-label">Hit Time</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                    {new Date(selectedLog.hitTime || selectedLog.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="stat-box" style={{ padding: '0.75rem 1rem' }}>
                  <span className="stat-label">Endpoint & Method</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--accent-info)' }}>
                    {selectedLog.method || 'POST'} {selectedLog.endpoint}
                  </span>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span className="form-label" style={{ margin: 0 }}>Hit Body:</span>
                  <button
                    onClick={() => handleCopyJson(selectedLog.hitBody)}
                    className="btn btn-outline"
                    style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                  >
                    <Copy size={13} /> Copy Body
                  </button>
                </div>
                <div className="code-block">
                  {JSON.stringify(selectedLog.hitBody, null, 2)}
                </div>
              </div>

              <div>
                <span className="form-label" style={{ marginBottom: '0.4rem' }}>Full Metadata Document:</span>
                <div className="code-block" style={{ fontSize: '0.8rem' }}>
                  {JSON.stringify(selectedLog, null, 2)}
                </div>
              </div>

              <button
                onClick={() => dispatch(clearSelectedLog())}
                className="btn btn-secondary"
                style={{ width: '100%' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="modal-overlay" onClick={() => setShowClearConfirm(false)}>
          <div className="modal-content" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--accent-danger)' }}>
              Clear All Logs?
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              This will permanently delete all {pagination.total} hit log documents from your MongoDB database. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleClearLogs}
                className="btn btn-danger"
              >
                Yes, Delete All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogsPage;
