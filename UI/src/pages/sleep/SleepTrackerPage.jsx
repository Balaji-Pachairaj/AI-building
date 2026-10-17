import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Moon,
  Sun,
  Bed,
  Sparkles,
  Clock,
  ArrowRight,
  TrendingUp,
  Award,
  Zap,
  CheckCircle,
  X,
  AlertCircle,
  BookOpen,
} from 'lucide-react';
import {
  fetchSleepStatus,
  recordSleep,
  recordWakeUp,
  clearActionMessage,
  clearSleepError,
} from '../../features/sleep/sleepSlice';
import '../../styles/sleepTracker.css';

/**
 * Format milliseconds into HH:MM:SS
 */
const formatDuration = (ms) => {
  if (ms <= 0) return '00:00:00';
  const totalSecs = Math.floor(ms / 1000);
  const hours = Math.floor(totalSecs / 3600);
  const minutes = Math.floor((totalSecs % 3600) / 60);
  const seconds = totalSecs % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Format local time to 12h AM/PM
 */
const formatTime = (dateStr) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Format date nicely
 */
const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

const SleepTrackerPage = () => {
  const dispatch = useDispatch();
  const {
    isCurrentlySleeping,
    activeSession,
    lastCompletedSession,
    totalSessionsCount,
    statusLoading,
    actionLoading,
    error,
    lastActionMessage,
  } = useSelector((state) => state.sleep);

  const [notes, setNotes] = useState('');
  const [elapsedMs, setElapsedMs] = useState(0);

  // Initial load
  useEffect(() => {
    dispatch(fetchSleepStatus());
  }, [dispatch]);

  // Live timer tick when currently sleeping
  useEffect(() => {
    let interval = null;
    if (isCurrentlySleeping && activeSession?.sleepStartTime) {
      const startTime = new Date(activeSession.sleepStartTime).getTime();
      const updateTimer = () => {
        const now = Date.now();
        setElapsedMs(Math.max(0, now - startTime));
      };
      updateTimer();
      interval = setInterval(updateTimer, 1000);
    } else {
      setElapsedMs(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isCurrentlySleeping, activeSession]);

  const handleGoingToSleep = () => {
    dispatch(recordSleep({ notes }));
    setNotes('');
  };

  const handleWakeUp = () => {
    dispatch(recordWakeUp({ notes }));
    setNotes('');
  };

  return (
    <div className="sleep-container">
      {/* Toast Feedback */}
      {lastActionMessage && (
        <div className="sleep-toast-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <CheckCircle size={18} />
            <span>{lastActionMessage}</span>
          </div>
          <button className="btn-toast-close" onClick={() => dispatch(clearActionMessage())}>
            <X size={16} />
          </button>
        </div>
      )}

      {error && (
        <div className="sleep-toast-banner error">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
          <button className="btn-toast-close" onClick={() => dispatch(clearSleepError())}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* North Star Focus Banner: AI Research Foundations */}
      <div className="sleep-north-star-banner">
        <div className="north-star-content">
          <div className="north-star-icon">
            <BookOpen size={24} color="#ffffff" />
          </div>
          <div className="north-star-text">
            <h3>
              🎯 Single Focus: AI Research Foundations
              <span className="north-star-badge">Google Skills</span>
            </h3>
            <p>
              Master deep AI architectures by protecting high-quality sleep recovery. Deep sleep fuels mathematical memory, neural comprehension, and sustained focus.
            </p>
          </div>
        </div>
        <Link
          to="/sleep/analytics"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'rgba(99, 102, 241, 0.2)',
            color: '#a5b4fc',
            padding: '0.6rem 1.1rem',
            borderRadius: '10px',
            textDecoration: 'none',
            fontSize: '0.85rem',
            fontWeight: '600',
            whiteSpace: 'nowrap',
            border: '1px solid rgba(99, 102, 241, 0.3)',
          }}
        >
          <span>Analytics</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Main Sleep Action Hero Card */}
      <div className="sleep-hero-card">
        <div className={`sleep-hero-status-pill ${isCurrentlySleeping ? 'sleeping' : ''}`}>
          <span className={`pulsing-dot ${isCurrentlySleeping ? 'sleeping' : ''}`} />
          {isCurrentlySleeping ? 'Currently Resting (Session in Progress)' : 'Awake & Ready'}
        </div>

        <h1 className="sleep-hero-title">
          {isCurrentlySleeping ? 'Resting for Tomorrow' : 'Ready for Quality Sleep?'}
        </h1>
        <p className="sleep-hero-subtitle">
          {isCurrentlySleeping
            ? `You fell asleep at ${formatTime(activeSession?.sleepStartTime)} on ${formatDate(
                activeSession?.sleepStartTime
              )}. Wake up refreshed tomorrow and hit the button below!`
            : 'Press the Sleep button before closing your eyes tonight. When you wake up tomorrow morning, hit Wake Up to automatically calculate your recovery duration.'}
        </p>

        {/* Live Elapsed Counter if sleeping */}
        {isCurrentlySleeping && (
          <div className="live-sleep-timer-box">
            <div className="live-timer-label">Elapsed Sleep Time</div>
            <div className="live-timer-digits">{formatDuration(elapsedMs)}</div>
            <div className="live-timer-meta">
              Started at {formatTime(activeSession?.sleepStartTime)}
            </div>
          </div>
        )}

        {/* Notes input */}
        <div className="sleep-notes-input-wrapper">
          <input
            type="text"
            className="sleep-notes-input"
            placeholder={
              isCurrentlySleeping
                ? 'Morning note (e.g., Slept deeply, feeling energized)...'
                : 'Night note (e.g., Finished AI Foundations Chapter 1)...'
            }
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Main Action Button */}
        <div className="sleep-action-btn-container">
          {isCurrentlySleeping ? (
            <button
              className="btn-wake-up"
              onClick={handleWakeUp}
              disabled={actionLoading}
              title="Click when you wake up to complete your sleep cycle"
            >
              <Sun size={48} color="#fbbf24" className="btn-action-icon" />
              <span className="btn-action-label">Wake Up</span>
              <span className="btn-action-hint">Good morning! Click to log</span>
            </button>
          ) : (
            <button
              className="btn-sleep-primary"
              onClick={handleGoingToSleep}
              disabled={actionLoading}
              title="Click when going to bed tonight"
            >
              <Moon size={48} color="#818cf8" className="btn-action-icon" />
              <span className="btn-action-label">Going to Sleep</span>
              <span className="btn-action-hint">Click & rest well tonight</span>
            </button>
          )}
        </div>

        {/* Last Sleep Cycle Snapshot */}
        {lastCompletedSession && !isCurrentlySleeping && (
          <div
            style={{
              marginTop: '1.5rem',
              padding: '1rem 1.5rem',
              background: 'rgba(15, 23, 42, 0.5)',
              borderRadius: '12px',
              border: '1px solid #1e293b',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '1.5rem',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>
                Previous Night
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#f8fafc' }}>
                {lastCompletedSession.durationHours} hrs ({Math.round(lastCompletedSession.durationMinutes)} mins)
              </div>
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>
                Schedule
              </div>
              <div style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>
                {formatTime(lastCompletedSession.sleepStartTime)} ➔ {formatTime(lastCompletedSession.wakeUpTime)}
              </div>
            </div>
            <div>
              <span className={`badge-quality ${lastCompletedSession.quality}`}>
                {lastCompletedSession.quality}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Metrics Grid */}
      <div className="sleep-metrics-grid">
        <div className="sleep-metric-card">
          <div className="metric-header">
            <span className="metric-title">Sleep Status</span>
            <div className="metric-icon-box" style={{ background: 'rgba(99, 102, 241, 0.15)' }}>
              <Bed size={18} color="#818cf8" />
            </div>
          </div>
          <div className="metric-value" style={{ fontSize: '1.4rem' }}>
            {isCurrentlySleeping ? 'Sleeping 🌙' : 'Awake ☀️'}
          </div>
          <div className="metric-subtitle">
            {isCurrentlySleeping ? 'Sleep timer running' : 'Ready for tonight'}
          </div>
        </div>

        <div className="sleep-metric-card">
          <div className="metric-header">
            <span className="metric-title">Total Sessions</span>
            <div className="metric-icon-box" style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
              <TrendingUp size={18} color="#34d399" />
            </div>
          </div>
          <div className="metric-value">{totalSessionsCount}</div>
          <div className="metric-subtitle">Tracked nights recorded</div>
        </div>

        <div className="sleep-metric-card">
          <div className="metric-header">
            <span className="metric-title">Last Duration</span>
            <div className="metric-icon-box" style={{ background: 'rgba(245, 158, 11, 0.15)' }}>
              <Clock size={18} color="#fbbf24" />
            </div>
          </div>
          <div className="metric-value">
            {lastCompletedSession ? `${lastCompletedSession.durationHours}h` : '0h'}
          </div>
          <div className="metric-subtitle">
            {lastCompletedSession ? `${lastCompletedSession.quality} recovery` : 'No sessions yet'}
          </div>
        </div>

        <div className="sleep-metric-card">
          <div className="metric-header">
            <span className="metric-title">Target Goal</span>
            <div className="metric-icon-box" style={{ background: 'rgba(56, 189, 248, 0.15)' }}>
              <Award size={18} color="#38bdf8" />
            </div>
          </div>
          <div className="metric-value" style={{ color: '#38bdf8' }}>7h – 9h</div>
          <div className="metric-subtitle">Optimal neuro-recovery band</div>
        </div>
      </div>

      {/* Link to Analytics Card */}
      <div
        style={{
          background: 'linear-gradient(135deg, #111a2e 0%, #0d1527 100%)',
          border: '1px solid #1e293b',
          borderRadius: '16px',
          padding: '1.5rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h4 style={{ margin: '0 0 0.3rem', fontSize: '1.05rem', color: '#ffffff' }}>
            Want to see your duration trends & sleep schedules?
          </h4>
          <p style={{ margin: 0, fontSize: '0.88rem', color: '#94a3b8' }}>
            Explore interactive ECharts, optimal sleep consistency %, average bedtime, and session history.
          </p>
        </div>
        <Link
          to="/sleep/analytics"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'linear-gradient(135deg, #4f46e5, #4338ca)',
            color: '#ffffff',
            padding: '0.75rem 1.4rem',
            borderRadius: '10px',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '0.9rem',
            boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)',
          }}
        >
          <span>View Sleep Analytics</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
};

export default SleepTrackerPage;

