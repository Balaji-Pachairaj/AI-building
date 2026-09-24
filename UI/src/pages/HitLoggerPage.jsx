import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { sendHitThunk, clearRecentHits } from '../features/hitLogger/hitLoggerSlice';
import { addNotification } from '../features/notifications/notificationSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Zap, Send, RotateCcw, Clock, Code2, CheckCheck } from 'lucide-react';

const PRESETS = {
  userAction: {
    event: 'user_checkout_completed',
    userId: 'usr_84920',
    cartTotal: 249.99,
    itemsCount: 3,
    currency: 'USD',
  },
  sensorData: {
    sensorId: 'TEMP-ZONE-04',
    reading: 23.4,
    unit: 'celsius',
    humidity: 48,
    status: 'OPTIMAL',
  },
  systemNotice: {
    service: 'auth_microservice',
    action: 'jwt_refresh_issued',
    ipAddress: '192.168.1.100',
    clientApp: 'Mobile-iOS',
  },
};

const HitLoggerPage = () => {
  const dispatch = useDispatch();
  const { sending, lastResponse, recentHits } = useSelector((state) => state.hitLogger);

  const [endpointType, setEndpointType] = useState('direct'); // 'direct' (/api/hit) or 'logs' (/api/logs/hit)
  const [jsonText, setJsonText] = useState(JSON.stringify(PRESETS.userAction, null, 2));
  const [jsonError, setJsonError] = useState('');

  const handleApplyPreset = (presetKey) => {
    setJsonText(JSON.stringify(PRESETS[presetKey], null, 2));
    setJsonError('');
  };

  const handleSendHit = async (e) => {
    e.preventDefault();
    try {
      const parsedBody = JSON.parse(jsonText);
      setJsonError('');

      const result = await dispatch(
        sendHitThunk({ payload: parsedBody, endpointType })
      );

      if (!result.error) {
        dispatch(
          addNotification({
            type: 'success',
            title: 'Hit Recorded',
            message: `Hit successfully saved to MongoDB Log collection via ${
              endpointType === 'logs' ? '/api/logs/hit' : '/api/hit'
            }!`,
          })
        );
      }
    } catch (err) {
      setJsonError('Invalid JSON format. Please verify your JSON payload.');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Zap color="var(--accent-primary)" size={28} />
            Hit Logger Test Pad
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Dispatch custom request bodies and record exact timestamps into MongoDB
          </p>
        </div>

        {recentHits.length > 0 && (
          <button
            onClick={() => dispatch(clearRecentHits())}
            className="btn btn-outline"
            style={{ fontSize: '0.85rem' }}
          >
            <RotateCcw size={15} />
            Clear Session History
          </button>
        )}
      </div>

      <div className="grid-2">
        {/* Left Form: Request Composer */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Code2 size={18} color="var(--accent-primary)" />
              <span>Hit Request Composer</span>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              POST {endpointType === 'logs' ? '/api/logs/hit' : '/api/hit'}
            </span>
          </div>

          <form onSubmit={handleSendHit}>
            {/* Target Endpoint Selector */}
            <div className="form-group">
              <label className="form-label">Target Endpoint</label>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <label
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 0.75rem',
                    background: endpointType === 'direct' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    color: endpointType === 'direct' ? 'white' : 'var(--text-secondary)',
                  }}
                >
                  <input
                    type="radio"
                    name="endpointType"
                    checked={endpointType === 'direct'}
                    onChange={() => setEndpointType('direct')}
                    style={{ display: 'none' }}
                  />
                  <strong>/api/hit</strong> (Primary)
                </label>

                <label
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 0.75rem',
                    background: endpointType === 'logs' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    color: endpointType === 'logs' ? 'white' : 'var(--text-secondary)',
                  }}
                >
                  <input
                    type="radio"
                    name="endpointType"
                    checked={endpointType === 'logs'}
                    onChange={() => setEndpointType('logs')}
                    style={{ display: 'none' }}
                  />
                  <strong>/api/logs/hit</strong> (Alias)
                </label>
              </div>
            </div>

            {/* Presets */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label className="form-label" style={{ margin: 0 }}>Payload Quick Presets</label>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('userAction')}
                    className="btn btn-outline"
                    style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                  >
                    User Action
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('sensorData')}
                    className="btn btn-outline"
                    style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                  >
                    Telemetry
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('systemNotice')}
                    className="btn btn-outline"
                    style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                  >
                    System Notice
                  </button>
                </div>
              </div>

              <textarea
                className="form-textarea"
                rows={9}
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                placeholder="Enter valid JSON payload..."
              />
              {jsonError && (
                <p style={{ color: 'var(--accent-danger)', fontSize: '0.8rem', marginTop: '0.3rem' }}>
                  {jsonError}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={sending}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem' }}
            >
              {sending ? (
                <LoadingSpinner size={16} inline text="Recording Hit in MongoDB..." />
              ) : (
                <>
                  <Send size={16} />
                  Send & Record Hit
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Instant DB Output & Session Stream */}
        <div>
          {/* Last Response Card */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <CheckCheck size={18} color="var(--accent-success)" />
                <span>MongoDB Storage Result</span>
              </div>
            </div>

            {lastResponse ? (
              <div>
                <p style={{ fontSize: '0.85rem', color: 'var(--accent-success)', marginBottom: '0.5rem', fontWeight: 600 }}>
                  ✓ {lastResponse.message || 'Hit saved to MongoDB!'}
                </p>
                <div className="code-block">
                  {JSON.stringify(lastResponse.data || lastResponse, null, 2)}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                <p>No hits dispatched yet in this session.</p>
                <p style={{ fontSize: '0.8rem', marginTop: '0.3rem' }}>
                  Click "Send & Record Hit" to test the logger!
                </p>
              </div>
            )}
          </div>

          {/* Session History Stream */}
          {recentHits.length > 0 && (
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <Clock size={18} color="var(--accent-info)" />
                  <span>Session Stream ({recentHits.length})</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '280px', overflowY: 'auto' }}>
                {recentHits.map((hit, index) => (
                  <div
                    key={hit._id || index}
                    style={{
                      padding: '0.65rem 0.85rem',
                      background: 'var(--bg-secondary)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.85rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>
                        {hit.endpoint || '/api/hit'}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(hit.hitTime || hit.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <code style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {JSON.stringify(hit.hitBody)}
                    </code>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HitLoggerPage;
