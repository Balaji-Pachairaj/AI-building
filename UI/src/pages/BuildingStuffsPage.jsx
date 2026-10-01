import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  getBuildingStuffsThunk,
  getBuildingStuffByIdThunk,
  createBuildingStuffThunk,
  hitBuildingStuffThunk,
  clearActiveItem,
  clearLastHitResult,
} from '../features/buildingStuffs/buildingStuffsSlice';
import { addNotification } from '../features/notifications/notificationSlice';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Layers, Plus, Zap, RefreshCw, Eye, X, Check, Building2 } from 'lucide-react';

const BuildingStuffsPage = () => {
  const dispatch = useDispatch();
  const { items, activeItem, loading, submitting, hitting, lastHitResult, error } =
    useSelector((state) => state.buildingStuffs);

  // Form state for creating building stuff
  const [formData, setFormData] = useState({
    name: '',
    category: 'Architecture',
    status: 'Ready',
  });

  // State for hit building stuff payload
  const [hitPayload, setHitPayload] = useState(
    JSON.stringify(
      {
        action: 'inspect_structure',
        triggeredBy: 'Engineering Team',
        metadata: {
          loadCapacity: '500 Tons',
          seismicRating: 8.5,
        },
      },
      null,
      2
    )
  );

  const [jsonError, setJsonError] = useState('');

  useEffect(() => {
    dispatch(getBuildingStuffsThunk());
  }, [dispatch]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      dispatch(
        addNotification({
          type: 'warning',
          title: 'Validation Error',
          message: 'Item name is required',
        })
      );
      return;
    }

    const result = await dispatch(createBuildingStuffThunk(formData));
    if (!result.error) {
      dispatch(
        addNotification({
          type: 'success',
          title: 'Created Successfully',
          message: `Building stuff "${formData.name}" was added!`,
        })
      );
      setFormData({ name: '', category: 'Architecture', status: 'Ready' });
    }
  };

  const handleHitSubmit = async (e) => {
    e.preventDefault();
    try {
      const parsedBody = JSON.parse(hitPayload);
      setJsonError('');

      const result = await dispatch(hitBuildingStuffThunk(parsedBody));
      if (!result.error) {
        dispatch(
          addNotification({
            type: 'success',
            title: 'Hit Recorded in DB',
            message: 'Hit time and body successfully stored in MongoDB Log collection!',
          })
        );
      }
    } catch (err) {
      setJsonError('Invalid JSON format. Please check syntax.');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Layers color="var(--accent-primary)" size={28} />
            Building Stuffs API
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Manage building modules and execute tracked hits to <code>/building-stuffs/hit</code>
          </p>
        </div>

        <button
          onClick={() => dispatch(getBuildingStuffsThunk())}
          disabled={loading}
          className="btn btn-secondary"
          style={{ fontSize: '0.85rem' }}
        >
          <RefreshCw size={16} className={loading ? 'spin-icon' : ''} />
          Refresh Items
        </button>
      </div>

      <div className="grid-2">
        {/* Left Column: Create New & Trigger Hit */}
        <div>
          {/* Create Item Form */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Plus size={18} color="var(--accent-primary)" />
                <span>Add Building Stuff (POST /building-stuffs)</span>
              </div>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Microservices Gateway, Database Cluster"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="grid-2" style={{ gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="Architecture">Architecture</option>
                    <option value="Backend">Backend</option>
                    <option value="Database">Database</option>
                    <option value="Frontend">Frontend</option>
                    <option value="DevOps">DevOps</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="Ready">Ready</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Active">Active</option>
                    <option value="Planned">Planned</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                {submitting ? <LoadingSpinner size={16} inline text="Creating..." /> : <Check size={16} />}
                Create Item
              </button>
            </form>
          </div>

          {/* Trigger Hit on Building Stuffs Form */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Zap size={18} color="var(--accent-warning)" />
                <span>Hit Building Stuff (POST /building-stuffs/hit)</span>
              </div>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Sends a hit event to the server. The server automatically stores <strong>hitTime</strong>,{' '}
              <strong>hitBody</strong>, and client IP in the MongoDB <strong>Log</strong> collection.
            </p>

            <form onSubmit={handleHitSubmit}>
              <div className="form-group">
                <label className="form-label">Hit Request Body (JSON)</label>
                <textarea
                  className="form-textarea"
                  rows={6}
                  value={hitPayload}
                  onChange={(e) => setHitPayload(e.target.value)}
                />
                {jsonError && (
                  <p style={{ color: 'var(--accent-danger)', fontSize: '0.8rem', marginTop: '0.3rem' }}>
                    {jsonError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={hitting}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  background: 'var(--accent-warning)',
                  color: '#0f172a',
                }}
              >
                {hitting ? <LoadingSpinner size={16} inline text="Sending Hit..." /> : <Zap size={16} />}
                Trigger & Log Hit to MongoDB
              </button>
            </form>

            {/* Display Last Hit Output */}
            {lastHitResult && (
              <div style={{ marginTop: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-success)' }}>
                    ✓ Database Response:
                  </span>
                  <button
                    onClick={() => dispatch(clearLastHitResult())}
                    className="btn btn-outline"
                    style={{ padding: '2px 6px', fontSize: '0.75rem' }}
                  >
                    Clear
                  </button>
                </div>
                <div className="code-block">
                  {JSON.stringify(lastHitResult, null, 2)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Building Stuffs Items List */}
        <div>
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Building2 size={18} color="var(--accent-primary)" />
                <span>Existing Stuffs ({items.length})</span>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                GET /building-stuffs
              </span>
            </div>

            {loading && <LoadingSpinner text="Fetching building stuffs..." />}

            {!loading && items.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                <p>No building stuffs found.</p>
                <p style={{ fontSize: '0.8rem', marginTop: '0.4rem' }}>
                  Use the form on the left to add one!
                </p>
              </div>
            )}

            {!loading && items.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {items.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'border-color 0.2s ease',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                          {item.name}
                        </span>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            color: 'var(--accent-info)',
                            background: 'var(--accent-info-bg)',
                            padding: '1px 6px',
                            borderRadius: 'var(--radius-sm)',
                          }}
                        >
                          {item.category}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        ID: #{item.id} {item.createdAt ? `• Added ${new Date(item.createdAt).toLocaleDateString()}` : ''}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <StatusBadge status={item.status} />
                      <button
                        onClick={() => dispatch(getBuildingStuffByIdThunk(item.id))}
                        className="btn btn-outline"
                        style={{ padding: '0.4rem 0.6rem' }}
                        title="View Details"
                      >
                        <Eye size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Item Details Modal */}
      {activeItem && (
        <div className="modal-overlay" onClick={() => dispatch(clearActiveItem())}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="card-header">
              <div className="card-title">
                <Building2 size={20} color="var(--accent-primary)" />
                <span>Item Details: {activeItem.name}</span>
              </div>
              <button
                onClick={() => dispatch(clearActiveItem())}
                className="toast-close"
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <div className="code-block">
                {JSON.stringify(activeItem, null, 2)}
              </div>
            </div>

            <button
              onClick={() => dispatch(clearActiveItem())}
              className="btn btn-secondary"
              style={{ width: '100%' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuildingStuffsPage;
