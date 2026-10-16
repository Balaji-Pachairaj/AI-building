import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Moon,
  Sun,
  Flame,
  CheckCircle2,
  Clock,
  Calendar,
  Sparkles,
  TrendingUp,
  Brain,
  Tv,
  Code2,
  Briefcase,
  Users,
  Hammer,
  Compass,
  Youtube,
  Instagram,
  Facebook,
  Zap,
  CheckCircle,
  RotateCcw,
  Play,
  Award,
  AlertCircle,
  ArrowRight,
  Filter,
  Bed,
} from 'lucide-react';
import {
  fetchHabits,
  fetchCurrentDayStatus,
  startDay,
  pressSleep,
  recordHabitHit,
  undoHabitHit,
} from '../../features/habits/habitsSlice';
import '../../styles/habitTracker.css';

// Map icon strings to Lucide components
const ICON_MAP = {
  Brain,
  Tv,
  Code2,
  Briefcase,
  Users,
  Hammer,
  Compass,
  Youtube,
  Instagram,
  Facebook,
  Zap,
  CheckCircle,
};

const HabitDailyTrackerPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    habits,
    habitsLoading,
    isTrackerStarted,
    hasActiveDay,
    activeDay,
    todayHits,
    latestSleepEvent,
    lastCompletedDay,
    nextDayNumber,
    activeSleepRecord,
    lastCompletedSleep,
    isCurrentlySleeping,
    statusLoading,
    startingDay,
    sleepingDay,
    hittingHabitId,
  } = useSelector((state) => state.habits);

  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [showSleepModal, setShowSleepModal] = useState(false);
  const [sleepNotes, setSleepNotes] = useState('');
  const [elapsedTimer, setElapsedTimer] = useState({ hours: 0, minutes: 0, seconds: 0 });

  // Initial data load
  useEffect(() => {
    dispatch(fetchHabits());
    dispatch(fetchCurrentDayStatus());
  }, [dispatch]);

  // Live timer for active day
  useEffect(() => {
    if (!hasActiveDay || !activeDay?.startTime) return;

    const updateTimer = () => {
      const now = new Date();
      const start = new Date(activeDay.startTime);
      const diffMs = Math.max(0, now.getTime() - start.getTime());

      const totalSec = Math.floor(diffMs / 1000);
      const hours = Math.floor(totalSec / 3600);
      const minutes = Math.floor((totalSec % 3600) / 60);
      const seconds = totalSec % 60;

      setElapsedTimer({ hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [hasActiveDay, activeDay?.startTime]);

  // Map of hits for fast lookup
  const hitMap = useMemo(() => {
    const map = {};
    todayHits.forEach((hit) => {
      const hId = (hit.habitId?._id || hit.habitId)?.toString();
      if (hId) {
        map[hId] = hit;
      }
    });
    return map;
  }, [todayHits]);

  // Categories list
  const categories = useMemo(() => {
    const cats = new Set(habits.map((h) => h.category));
    return ['ALL', ...Array.from(cats)];
  }, [habits]);

  // Filtered habits
  const filteredHabits = useMemo(() => {
    if (selectedCategory === 'ALL') return habits;
    return habits.filter((h) => h.category === selectedCategory);
  }, [habits, selectedCategory]);

  // Progress metrics
  const totalCount = habits.length || 11;
  const completedCount = Object.keys(hitMap).length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Handlers
  const handleStartTracker = () => {
    dispatch(startDay({}));
  };

  const handleOpenSleepModal = () => {
    setShowSleepModal(true);
  };

  const handleConfirmSleep = async () => {
    await dispatch(pressSleep({ notes: sleepNotes }));
    setShowSleepModal(false);
    setSleepNotes('');
    dispatch(fetchCurrentDayStatus());
  };

  const handleHitHabit = (habitId) => {
    dispatch(recordHabitHit({ habitId }));
  };

  const handleUndoHit = (habitId) => {
    dispatch(undoHabitHit(habitId));
  };

  // Format date helper
  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="habit-app-container">
      {/* ================================================================= */}
      {/* HERO SECTION                                                      */}
      {/* ================================================================= */}
      <div className="habit-hero-card">
        {/* CASE 1: Tracker not started yet (empty sleep button history) */}
        {!isTrackerStarted && !hasActiveDay && (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ display: 'inline-flex', marginBottom: '1rem' }}>
              <span className="habit-badge-pill habit-badge-night">
                <Moon size={14} />
                Night Owl 12 AM - 11:59 PM Habit Tracker
              </span>
            </div>
            <h1 className="habit-hero-title" style={{ justifyContent: 'center' }}>
              6-Month Consistency Operating System
            </h1>
            <p className="habit-hero-subtitle" style={{ margin: '0.5rem auto 1.75rem' }}>
              Built specifically for your night owl workflow. The time between pressing the Sleep button
              twice defines your awake working day. Start your journey now!
            </p>

            <button
              type="button"
              className="btn-start-day"
              onClick={handleStartTracker}
              disabled={startingDay}
              style={{ fontSize: '1.1rem', padding: '1rem 2.25rem' }}
            >
              <Play size={20} />
              <span>{startingDay ? 'Starting Tracker...' : 'Start the Habit Tracker (Day 1)'}</span>
            </button>
          </div>
        )}

        {/* CASE 2: Day is currently ACTIVE */}
        {hasActiveDay && activeDay && (
          <div>
            <div className="habit-hero-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span className="habit-badge-pill habit-badge-night">
                    <Moon size={14} />
                    Day #{activeDay.dayNumber} in Progress
                  </span>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--accent-success)',
                      background: 'rgba(16, 185, 129, 0.15)',
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                    }}
                  >
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: 'var(--accent-success)',
                        boxShadow: '0 0 6px var(--accent-success)',
                      }}
                    />
                    Active
                  </span>
                </div>

                <h1 className="habit-hero-title">
                  Day {activeDay.dayNumber} Tracking
                </h1>
                <p className="habit-hero-subtitle">
                  Started at {formatDateTime(activeDay.startTime)}. Complete your 11 daily habits and hit
                  the Sleep button when your day concludes.
                </p>
              </div>

              {/* Live Day Elapsed Time & Sleep Action */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Active Day Duration
                  </span>
                  <div className="habit-live-timer">
                    <Clock size={22} color="#38bdf8" />
                    <span>
                      {String(elapsedTimer.hours).padStart(2, '0')}:
                      {String(elapsedTimer.minutes).padStart(2, '0')}:
                      {String(elapsedTimer.seconds).padStart(2, '0')}
                    </span>
                  </div>
                </div>

                <div className="habit-hero-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate('/habits/sleep-analytics')}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.75rem 1.1rem' }}
                  >
                    <Bed size={16} color="#a78bfa" />
                    <span>Sleep Analytics</span>
                  </button>

                  <button
                    type="button"
                    className="btn-sleep"
                    onClick={handleOpenSleepModal}
                    disabled={sleepingDay}
                  >
                    <Moon size={18} />
                    <span>{sleepingDay ? 'Closing Day...' : 'Sleep (Close Day)'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Habit Completion Progress Bar */}
            <div className="habit-progress-section">
              <div className="habit-progress-header">
                <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                  Today's Habit Accomplishment
                </span>
                <span style={{ color: '#38bdf8', fontWeight: 700 }}>
                  {completedCount} of {totalCount} Completed ({progressPercent}%)
                </span>
              </div>
              <div className="habit-progress-bar-bg">
                <div
                  className="habit-progress-bar-fill"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* CASE 3: Tracker started, but Day is COMPLETED (Sleep was pressed, waiting to wake up/start next day) */}
        {isTrackerStarted && !hasActiveDay && (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ display: 'inline-flex', marginBottom: '0.75rem' }}>
              <span className="habit-badge-pill" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', borderColor: 'rgba(52, 211, 153, 0.3)' }}>
                <Award size={14} />
                Day #{lastCompletedDay?.dayNumber || 1} Completed &bull; {lastCompletedDay?.totalHours || 0} Hours Logged
              </span>
            </div>
            <h1 className="habit-hero-title" style={{ justifyContent: 'center' }}>
              Good Rest! Ready for Day {nextDayNumber}?
            </h1>
            <p className="habit-hero-subtitle" style={{ margin: '0.5rem auto 1.75rem' }}>
              Last sleep button recorded at {formatDateTime(latestSleepEvent?.timestamp)}.
              Press "Wake Up &amp; Start Day {nextDayNumber}" whenever you begin your next work cycle to record your total sleep time!
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn-start-day"
                onClick={handleStartTracker}
                disabled={startingDay}
              >
                <Sun size={20} />
                <span>{startingDay ? 'Starting Day...' : `Wake Up & Start Day ${nextDayNumber}`}</span>
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/habits/sleep-analytics')}
                style={{ padding: '0.85rem 1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Bed size={16} color="#a78bfa" />
                <span>Sleep Analytics</span>
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/habits/analytics')}
                style={{ padding: '0.85rem 1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <TrendingUp size={16} />
                <span>Day History</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ================================================================= */}
      {/* QUICK STATS CARDS                                                 */}
      {/* ================================================================= */}
      <div className="habit-stats-grid">
        <div className="habit-stat-card">
          <div className="habit-stat-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#6366f1' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div className="habit-stat-value">
              {completedCount} / {totalCount}
            </div>
            <div className="habit-stat-label">Completed Today</div>
          </div>
        </div>

        <div className="habit-stat-card">
          <div className="habit-stat-icon" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
            <Clock size={24} />
          </div>
          <div>
            <div className="habit-stat-value">
              {hasActiveDay ? `${elapsedTimer.hours}h ${elapsedTimer.minutes}m` : `${lastCompletedDay?.totalHours || 0}h`}
            </div>
            <div className="habit-stat-label">
              {hasActiveDay ? 'Elapsed Today' : 'Last Day Duration'}
            </div>
          </div>
        </div>

        <div className="habit-stat-card">
          <div className="habit-stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
            <Flame size={24} />
          </div>
          <div>
            <div className="habit-stat-value">
              {hasActiveDay ? activeDay.dayNumber : lastCompletedDay?.dayNumber || 0}
            </div>
            <div className="habit-stat-label">Current Day Cycle</div>
          </div>
        </div>

        <div className="habit-stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/habits/sleep-analytics')}>
          <div className="habit-stat-icon" style={{ background: 'rgba(109, 40, 217, 0.15)', color: '#a78bfa' }}>
            <Bed size={24} />
          </div>
          <div>
            <div className="habit-stat-value" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>{lastCompletedSleep ? `${lastCompletedSleep.durationHours}h` : isCurrentlySleeping ? `${activeSleepRecord?.elapsedHours || 0}h` : 'Sleep'}</span>
              <ArrowRight size={14} />
            </div>
            <div className="habit-stat-label">
              {isCurrentlySleeping ? 'Resting Now' : lastCompletedSleep ? `Last Rest (${lastCompletedSleep.quality})` : 'Sleep Analytics'}
            </div>
          </div>
        </div>

        <div className="habit-stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/habits/analytics')}>
          <div className="habit-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="habit-stat-value" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>Analytics</span>
              <ArrowRight size={16} />
            </div>
            <div className="habit-stat-label">Charts &amp; History</div>
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* FILTER TABS & HEADER                                              */}
      {/* ================================================================= */}
      <div className="habit-filter-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={18} color="var(--accent-primary)" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Daily Habit Protocol (11 Habits)
            </h2>
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/habits/sleep-analytics')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', padding: '0.35rem 0.85rem' }}
          >
            <Moon size={13} color="#a78bfa" />
            <span>Sleep Analytics</span>
          </button>
        </div>

        <div className="habit-category-pills">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`habit-category-pill ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat === 'ALL' ? 'All Habits' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* ================================================================= */}
      {/* 11 HABITS CHECKLIST GRID                                          */}
      {/* ================================================================= */}
      {habitsLoading && habits.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
          <p>Loading habits protocol...</p>
        </div>
      ) : (
        <div className="habits-grid">
          {filteredHabits.map((habit) => {
            const hit = hitMap[habit._id];
            const isHit = Boolean(hit);
            const isHitting = hittingHabitId === habit._id;
            const IconComponent = ICON_MAP[habit.icon] || CheckCircle;

            return (
              <div
                key={habit._id}
                className={`habit-card ${isHit ? 'is-hit' : ''}`}
              >
                <div>
                  <div className="habit-card-top">
                    <div
                      className="habit-icon-box"
                      style={{
                        background: `${habit.color}25`,
                        color: habit.color,
                        border: `1px solid ${habit.color}40`,
                      }}
                    >
                      <IconComponent size={22} />
                    </div>

                    <div className="habit-card-info">
                      <h3 className="habit-title">{habit.title}</h3>
                      <div className="habit-badges-row">
                        <span className="habit-badge habit-badge-category">
                          {habit.category}
                        </span>
                        <span className="habit-badge habit-badge-time">
                          <Clock size={10} style={{ display: 'inline', marginRight: '3px' }} />
                          {habit.targetDurationText}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="habit-description">{habit.description}</p>

                  <div className="habit-target-quantity">
                    🎯 Target: {habit.targetQuantityText}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="habit-card-footer">
                  {isHit ? (
                    <>
                      <div className="btn-hit-done">
                        <CheckCircle2 size={16} />
                        <span>Hit at {formatDateTime(hit.timestamp)}</span>
                      </div>
                      <button
                        type="button"
                        className="btn-undo-hit"
                        onClick={() => handleUndoHit(habit._id)}
                        disabled={isHitting}
                        title="Undo hit"
                      >
                        <RotateCcw size={14} />
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="btn-hit-habit"
                      onClick={() => handleHitHabit(habit._id)}
                      disabled={isHitting}
                    >
                      <CheckCircle2 size={16} />
                      <span>{isHitting ? 'Saving...' : 'Hit Habit'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================================================================= */}
      {/* SLEEP CONFIRMATION MODAL                                          */}
      {/* ================================================================= */}
      {showSleepModal && (
        <div className="modal-overlay" onClick={() => setShowSleepModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(109, 40, 217, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#a78bfa',
                }}
              >
                <Moon size={22} />
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Close Day #{activeDay?.dayNumber} &amp; Sleep
              </h2>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: '1.5' }}>
              You've logged <strong>{elapsedTimer.hours}h {elapsedTimer.minutes}m</strong> of active work and completed{' '}
              <strong>{completedCount} of {totalCount}</strong> habits ({progressPercent}%). Pressing Sleep marks this day complete!
            </p>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Day Notes or Reflection (Optional)
              </label>
              <textarea
                className="form-input"
                rows={3}
                placeholder="What went well today? What will you tackle tomorrow?"
                value={sleepNotes}
                onChange={(e) => setSleepNotes(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-primary)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem',
                  fontSize: '0.85rem',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowSleepModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-sleep"
                onClick={handleConfirmSleep}
                disabled={sleepingDay}
              >
                <Moon size={16} />
                <span>{sleepingDay ? 'Closing Day...' : 'Good Night & Close Day'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HabitDailyTrackerPage;

