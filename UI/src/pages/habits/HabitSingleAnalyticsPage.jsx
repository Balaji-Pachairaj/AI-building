import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import {
  ArrowLeft,
  Clock,
  Flame,
  Award,
  CheckCircle2,
  Calendar,
  Sparkles,
  BarChart2,
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
  Moon,
} from 'lucide-react';
import {
  fetchHabits,
  fetchSingleHabitAnalytics,
} from '../../features/habits/habitsSlice';
import '../../styles/habitTracker.css';

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

const HabitSingleAnalyticsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { habitId: paramHabitId } = useParams();

  const { habits, habitsLoading, singleHabitData, singleHabitLoading } = useSelector(
    (state) => state.habits
  );

  const [selectedHabitId, setSelectedHabitId] = useState(paramHabitId || '');

  // Load habits if not loaded
  useEffect(() => {
    if (habits.length === 0) {
      dispatch(fetchHabits());
    }
  }, [dispatch, habits.length]);

  // Set default selected habit once habits are loaded
  useEffect(() => {
    if (!selectedHabitId && habits.length > 0) {
      setSelectedHabitId(habits[0]._id);
    }
  }, [habits, selectedHabitId]);

  // Fetch analytics for selected habit
  useEffect(() => {
    if (selectedHabitId) {
      dispatch(fetchSingleHabitAnalytics(selectedHabitId));
    }
  }, [dispatch, selectedHabitId]);

  const activeHabit = singleHabitData?.habit;
  const metrics = singleHabitData?.metrics;
  const dayTimeline = singleHabitData?.dayTimeline || [];
  const hourlyDistribution = singleHabitData?.hourlyDistribution || [];

  const IconComponent = (activeHabit?.icon && ICON_MAP[activeHabit.icon]) || CheckCircle;

  // -------------------------------------------------------------------------
  // ECharts Option 1: Hourly Distribution (12 AM to 11:59 PM Night Owl Breakdown)
  // -------------------------------------------------------------------------
  const hourlyChartOption = useMemo(() => {
    if (!hourlyDistribution || hourlyDistribution.length === 0) return null;

    const hours = hourlyDistribution.map((h) => h.label);
    const counts = hourlyDistribution.map((h) => h.count);

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        borderColor: '#334155',
        textStyle: { color: '#f8fafc', fontSize: 12 },
        formatter: (params) => {
          const item = params[0];
          return `
            <div style="font-weight: 700; color: #38bdf8;">${item.name}</div>
            <div>Hits Recorded: <strong>${item.value}</strong></div>
          `;
        },
      },
      grid: {
        top: '12%',
        left: '3%',
        right: '4%',
        bottom: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: hours,
        axisLine: { lineStyle: { color: '#334155' } },
        axisLabel: {
          color: '#94a3b8',
          fontSize: 10,
          interval: 1, // Show every 2nd hour label
        },
      },
      yAxis: {
        type: 'value',
        name: 'Hits',
        minInterval: 1,
        splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.05)' } },
        axisLabel: { color: '#94a3b8', fontSize: 11 },
      },
      series: [
        {
          name: 'Hits at this hour',
          type: 'bar',
          data: counts,
          barWidth: '55%',
          itemStyle: {
            borderRadius: [4, 4, 0, 0],
            color: (params) => {
              // Highlight night owl hours (12 AM to 5 AM and 10 PM to 12 AM)
              const hourIndex = params.dataIndex;
              if (hourIndex <= 5 || hourIndex >= 22) {
                return '#8b5cf6'; // Violet glow for night owl hours
              }
              return activeHabit?.color || '#6366f1';
            },
          },
        },
      ],
    };
  }, [hourlyDistribution, activeHabit?.color]);

  // -------------------------------------------------------------------------
  // ECharts Option 2: Day Timeline (Success vs Missed)
  // -------------------------------------------------------------------------
  const dayTimelineChartOption = useMemo(() => {
    if (!dayTimeline || dayTimeline.length === 0) return null;

    const days = dayTimeline.map((d) => d.label);
    const values = dayTimeline.map((d) => (d.isHit ? 1 : 0));

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        borderColor: '#334155',
        textStyle: { color: '#f8fafc', fontSize: 12 },
        formatter: (params) => {
          const item = params[0];
          const itemData = dayTimeline[item.dataIndex];
          const statusText = itemData?.isHit
            ? `<span style="color: #10b981; font-weight: bold;">✅ Hit</span> at ${new Date(itemData.timestamp).toLocaleTimeString()}`
            : '<span style="color: #94a3b8;">❌ Not Hit</span>';
          return `
            <div style="font-weight: 700; color: #f8fafc;">${item.name}</div>
            <div>Status: ${statusText}</div>
          `;
        },
      },
      grid: {
        top: '15%',
        left: '3%',
        right: '4%',
        bottom: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: days,
        axisLine: { lineStyle: { color: '#334155' } },
        axisLabel: { color: '#94a3b8', fontSize: 11 },
      },
      yAxis: {
        type: 'value',
        max: 1,
        min: 0,
        splitNumber: 1,
        axisLabel: {
          formatter: (v) => (v === 1 ? 'Hit' : 'Missed'),
          color: '#94a3b8',
          fontSize: 10,
        },
        splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.05)' } },
      },
      series: [
        {
          name: 'Hit Status',
          type: 'bar',
          data: values,
          barWidth: '40%',
          itemStyle: {
            borderRadius: [4, 4, 0, 0],
            color: (params) => (params.value === 1 ? '#10b981' : 'rgba(148, 163, 184, 0.2)'),
          },
        },
      ],
    };
  }, [dayTimeline]);

  return (
    <div className="habit-app-container">
      {/* Top Nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate('/habits/analytics')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem' }}
        >
          <ArrowLeft size={16} />
          <span>Back to All Analytics</span>
        </button>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate('/habits')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem' }}
        >
          <span>Today's Tracker</span>
        </button>
      </div>

      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
          Single Habit Deep-Dive Analytics
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
          Select any habit below to inspect its hit patterns, hourly completion distribution, and streak metrics.
        </p>
      </div>

      {/* Habit Selector Pills */}
      <div style={{ marginBottom: '2rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {habits.map((h) => {
            const isSelected = h._id === selectedHabitId;
            return (
              <button
                key={h._id}
                type="button"
                onClick={() => setSelectedHabitId(h._id)}
                style={{
                  background: isSelected ? h.color : 'var(--bg-card)',
                  color: isSelected ? '#fff' : 'var(--text-secondary)',
                  border: `1px solid ${isSelected ? h.color : 'var(--border-color)'}`,
                  borderRadius: '9999px',
                  padding: '0.45rem 0.95rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  boxShadow: isSelected ? `0 2px 10px ${h.color}50` : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: isSelected ? '#fff' : h.color,
                  }}
                />
                <span>{h.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Habit Overview Card */}
      {activeHabit && (
        <div
          className="card"
          style={{
            border: `1px solid ${activeHabit.color}40`,
            background: `linear-gradient(135deg, ${activeHabit.color}15, rgba(15, 23, 42, 0.9))`,
            padding: '1.75rem',
            marginBottom: '2rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: 'var(--radius-md)',
                background: `${activeHabit.color}30`,
                color: activeHabit.color,
                border: `1px solid ${activeHabit.color}50`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <IconComponent size={28} />
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {activeHabit.title}
                </h2>
                <span className="badge badge-info">{activeHabit.category}</span>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#38bdf8',
                    background: 'rgba(56, 189, 248, 0.15)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                  }}
                >
                  {activeHabit.targetDurationText}
                </span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '750px' }}>
                {activeHabit.description}
              </p>
              <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#a5b4fc' }}>
                🎯 Target: <strong>{activeHabit.targetQuantityText}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="habit-stats-grid">
        <div className="habit-stat-card">
          <div className="habit-stat-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#6366f1' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div className="habit-stat-value">{metrics?.totalHits || 0}</div>
            <div className="habit-stat-label">Total Times Hit</div>
          </div>
        </div>

        <div className="habit-stat-card">
          <div className="habit-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <Award size={24} />
          </div>
          <div>
            <div className="habit-stat-value">{metrics?.completionRate || 0}%</div>
            <div className="habit-stat-label">Consistency Rate</div>
          </div>
        </div>

        <div className="habit-stat-card">
          <div className="habit-stat-icon" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
            <Clock size={24} />
          </div>
          <div>
            <div className="habit-stat-value">{metrics?.totalHoursInvested || 0}h</div>
            <div className="habit-stat-label">Hours Invested</div>
          </div>
        </div>

        <div className="habit-stat-card">
          <div className="habit-stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
            <Flame size={24} />
          </div>
          <div>
            <div className="habit-stat-value">{metrics?.currentStreak || 0} Days</div>
            <div className="habit-stat-label">Current Streak (Best: {metrics?.bestStreak || 0})</div>
          </div>
        </div>
      </div>

      {/* Chart 1: Hourly Distribution */}
      <div className="chart-card">
        <div className="chart-header">
          <div>
            <div className="chart-title">
              <Clock size={20} color="#38bdf8" />
              <span>Time-of-Day Hit Distribution (12 AM - 11:59 PM)</span>
            </div>
            <div className="chart-subtitle">
              Breakdown of which hour of the day this habit is completed. Violet bars indicate night owl hours (10 PM to 5 AM).
            </div>
          </div>
        </div>

        {hourlyChartOption ? (
          <ReactECharts
            option={hourlyChartOption}
            style={{ height: '320px', width: '100%' }}
            opts={{ renderer: 'svg' }}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
            <p>No hourly hit data yet.</p>
          </div>
        )}
      </div>

      {/* Chart 2: Day Timeline */}
      <div className="chart-card">
        <div className="chart-header">
          <div>
            <div className="chart-title">
              <Calendar size={20} color="#10b981" />
              <span>Day-by-Day Consistency Timeline</span>
            </div>
            <div className="chart-subtitle">
              Visual ledger showing whether this habit was hit on each tracked day.
            </div>
          </div>
        </div>

        {dayTimelineChartOption ? (
          <ReactECharts
            option={dayTimelineChartOption}
            style={{ height: '240px', width: '100%' }}
            opts={{ renderer: 'svg' }}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
            <p>No timeline data yet.</p>
          </div>
        )}
      </div>

      {/* Timeline Table */}
      <div className="chart-card">
        <div className="chart-header">
          <div className="chart-title">
            <BarChart2 size={20} color="var(--accent-primary)" />
            <span>Day-by-Day Log for "{activeHabit?.title}"</span>
          </div>
        </div>

        {dayTimeline.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
            No day records recorded yet.
          </div>
        ) : (
          <div className="habit-table-container">
            <table className="habit-table">
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Status</th>
                  <th>Timestamp of Hit</th>
                  <th>Day Start</th>
                  <th>Day Sleep</th>
                </tr>
              </thead>
              <tbody>
                {dayTimeline.map((item) => (
                  <tr key={item.dayNumber}>
                    <td>
                      <strong>Day {item.dayNumber}</strong>
                    </td>
                    <td>
                      {item.isHit ? (
                        <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>
                          ✅ Hit Completed
                        </span>
                      ) : (
                        <span className="badge badge-danger" style={{ fontSize: '0.75rem' }}>
                          Missed
                        </span>
                      )}
                    </td>
                    <td>
                      {item.timestamp
                        ? new Date(item.timestamp).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true,
                          })
                        : '-'}
                    </td>
                    <td>
                      {item.dayStartTime
                        ? new Date(item.dayStartTime).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true,
                          })
                        : '-'}
                    </td>
                    <td>
                      {item.dayEndTime
                        ? new Date(item.dayEndTime).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true,
                          })
                        : 'Active'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default HabitSingleAnalyticsPage;

