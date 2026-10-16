import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import {
  Moon,
  Sun,
  Bed,
  Clock,
  Award,
  ArrowLeft,
  Calendar,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  PieChart as PieChartIcon,
  Play,
} from 'lucide-react';
import {
  fetchSleepAnalytics,
  fetchCurrentDayStatus,
  startDay,
} from '../../features/habits/habitsSlice';
import '../../styles/habitTracker.css';

const HabitSleepAnalyticsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    sleepMetrics,
    sleepCharts,
    sleepRecordsList,
    sleepLoading,
    isCurrentlySleeping,
    activeSleepRecord,
    nextDayNumber,
    startingDay,
  } = useSelector((state) => state.habits);

  useEffect(() => {
    dispatch(fetchSleepAnalytics());
    dispatch(fetchCurrentDayStatus());
  }, [dispatch]);

  const handleWakeUp = async () => {
    await dispatch(startDay({}));
    dispatch(fetchSleepAnalytics());
    dispatch(fetchCurrentDayStatus());
  };

  // Helper date formatters
  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'In Progress (Sleeping)';
    const d = new Date(dateStr);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDateOnly = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // -------------------------------------------------------------------------
  // ECharts Option 1: Sleep Duration Trend (Bar + Spline with Optimal Zone)
  // -------------------------------------------------------------------------
  const sleepTrendOption = useMemo(() => {
    const rawData = sleepCharts?.sleepTrend || [];
    if (rawData.length === 0) return null;

    const labels = rawData.map((s) => s.label);
    const hours = rawData.map((s) => s.durationHours);

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        borderColor: '#334155',
        borderWidth: 1,
        textStyle: { color: '#f8fafc', fontSize: 12 },
        formatter: (params) => {
          const item = params[0];
          const dataIndex = item.dataIndex;
          const session = rawData[dataIndex];
          const qualityColor =
            session.quality === 'OPTIMAL'
              ? '#10b981'
              : session.quality === 'FAIR'
              ? '#38bdf8'
              : session.quality === 'SHORT'
              ? '#f59e0b'
              : '#ec4899';

          return `
            <div style="font-weight: 700; margin-bottom: 4px; color: #a78bfa;">${session.label}</div>
            <div>💤 Sleep Duration: <strong>${session.durationHours} hrs</strong> (${session.durationMinutes}m)</div>
            <div>✨ Quality: <span style="color: ${qualityColor}; font-weight: bold;">${session.quality}</span></div>
            <div>🌙 Bedtime: ${formatDateTime(session.sleepStartTime)}</div>
            <div>☀️ Wake Up: ${formatDateTime(session.wakeUpTime)}</div>
            ${session.notes ? `<div style="margin-top: 4px; color: #94a3b8; font-style: italic;">"${session.notes}"</div>` : ''}
          `;
        },
      },
      grid: {
        top: '15%',
        left: '3%',
        right: '4%',
        bottom: '8%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: labels,
        axisLine: { lineStyle: { color: '#334155' } },
        axisLabel: { color: '#94a3b8', fontSize: 11 },
      },
      yAxis: {
        type: 'value',
        name: 'Sleep Hours',
        min: 0,
        max: (value) => Math.max(10, Math.ceil(value.max + 1)),
        splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.05)' } },
        axisLabel: { color: '#94a3b8', fontSize: 11 },
      },
      series: [
        {
          name: 'Sleep Duration (hrs)',
          type: 'bar',
          data: hours,
          barWidth: '40%',
          itemStyle: {
            borderRadius: [6, 6, 0, 0],
            color: (params) => {
              const val = params.value;
              if (val >= 7 && val <= 9) return '#10b981'; // Optimal
              if (val >= 6 && val < 7) return '#38bdf8'; // Fair
              if (val < 6) return '#f59e0b'; // Short
              return '#ec4899'; // Long
            },
          },
          markLine: {
            data: [
              {
                yAxis: 8,
                name: 'Ideal (8 hrs)',
                lineStyle: { color: '#a78bfa', type: 'dashed', width: 2 },
                label: { formatter: 'Target: 8h', color: '#c4b5fd', fontSize: 11 },
              },
            ],
          },
          markArea: {
            itemStyle: {
              color: 'rgba(16, 185, 129, 0.08)',
            },
            data: [
              [
                { name: 'Optimal Sleep Range (7h - 9h)', yAxis: 7 },
                { yAxis: 9 },
              ],
            ],
            label: {
              color: '#34d399',
              position: 'insideTopLeft',
              fontSize: 10,
            },
          },
        },
        {
          name: 'Duration Curve',
          type: 'line',
          smooth: true,
          data: hours,
          symbol: 'circle',
          symbolSize: 6,
          itemStyle: { color: '#a78bfa' },
          lineStyle: { width: 2, color: '#a78bfa' },
        },
      ],
    };
  }, [sleepCharts?.sleepTrend]);

  // -------------------------------------------------------------------------
  // ECharts Option 2: Quality Distribution
  // -------------------------------------------------------------------------
  const qualityPieOption = useMemo(() => {
    const rawData = sleepCharts?.qualityDistribution || [];
    if (rawData.length === 0) return null;

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        borderColor: '#334155',
        textStyle: { color: '#f8fafc', fontSize: 12 },
        formatter: '{b}: <strong>{c} sessions</strong> ({d}%)',
      },
      legend: {
        orient: 'vertical',
        right: '5%',
        top: 'center',
        textStyle: { color: '#94a3b8', fontSize: 11 },
      },
      series: [
        {
          name: 'Sleep Quality',
          type: 'pie',
          radius: ['45%', '70%'],
          center: ['40%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 6,
            borderColor: 'var(--bg-card)',
            borderWidth: 2,
          },
          label: { show: false },
          emphasis: {
            label: {
              show: true,
              fontSize: 13,
              fontWeight: 'bold',
              color: '#fff',
            },
          },
          data: rawData.map((c) => ({
            name: c.name,
            value: c.value,
            itemStyle: { color: c.color },
          })),
        },
      ],
    };
  }, [sleepCharts?.qualityDistribution]);

  return (
    <div className="habit-app-container">
      {/* Top Nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate('/habits')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem' }}
        >
          <ArrowLeft size={16} />
          <span>Back to Today's Tracker</span>
        </button>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/habits/analytics')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem' }}
          >
            <TrendingUp size={16} color="#38bdf8" />
            <span>Habits &amp; Days Analytics</span>
          </button>
        </div>
      </div>

      {/* Header Banner */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
          <span className="habit-badge-pill habit-badge-night">
            <Moon size={14} />
            Night Owl Sleep Protocol &bull; Day N Sleep ➔ Day N+1 Wake Up
          </span>
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
          Sleep Architecture &amp; Analytics
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
          Precisely calculated from when you click <strong>Sleep</strong> at the end of each day to when you click{' '}
          <strong>Wake Up</strong> to begin the next.
        </p>
      </div>

      {/* LIVE SLEEPING BANNER (If user is currently asleep) */}
      {isCurrentlySleeping && activeSleepRecord && (
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(109, 40, 217, 0.25), rgba(15, 23, 42, 0.95))',
            border: '1px solid rgba(167, 139, 250, 0.4)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem 2rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.25rem',
            boxShadow: '0 8px 30px rgba(109, 40, 217, 0.25)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(167, 139, 250, 0.2)',
                color: '#c4b5fd',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Moon size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                <span className="badge badge-info" style={{ background: '#6d28d9', color: '#fff' }}>
                  Sleep Session In Progress
                </span>
                <span style={{ fontSize: '0.8rem', color: '#c4b5fd' }}>
                  Day {activeSleepRecord.fromDayNumber} ➔ Day {nextDayNumber}
                </span>
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc' }}>
                Sleep started at {formatDateTime(activeSleepRecord.sleepStartTime)}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Elapsed Rest: <strong>{activeSleepRecord.elapsedHours || 0} hours</strong>. Click Wake Up whenever your next day begins.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="btn-start-day"
            onClick={handleWakeUp}
            disabled={startingDay}
          >
            <Sun size={20} />
            <span>{startingDay ? 'Waking Up...' : `Wake Up & Start Day ${nextDayNumber}`}</span>
          </button>
        </div>
      )}

      {/* ================================================================= */}
      {/* TOP KPI MOTIVATION METRICS                                        */}
      {/* ================================================================= */}
      <div className="habit-stats-grid">
        <div className="habit-stat-card">
          <div className="habit-stat-icon" style={{ background: 'rgba(109, 40, 217, 0.15)', color: '#a78bfa' }}>
            <Moon size={24} />
          </div>
          <div>
            <div className="habit-stat-value">
              {sleepMetrics?.avgSleepHours || 0}h
            </div>
            <div className="habit-stat-label">Avg Sleep Duration</div>
          </div>
        </div>

        <div className="habit-stat-card">
          <div className="habit-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <div className="habit-stat-value">
              {sleepMetrics?.optimalSleepPercent || 0}%
            </div>
            <div className="habit-stat-label">Optimal (7-9h Range)</div>
          </div>
        </div>

        <div className="habit-stat-card">
          <div className="habit-stat-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#6366f1' }}>
            <Clock size={24} />
          </div>
          <div>
            <div className="habit-stat-value" style={{ fontSize: '1.25rem' }}>
              {sleepMetrics?.avgBedtime || 'N/A'}
            </div>
            <div className="habit-stat-label">Avg Night Owl Bedtime</div>
          </div>
        </div>

        <div className="habit-stat-card">
          <div className="habit-stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
            <Sun size={24} />
          </div>
          <div>
            <div className="habit-stat-value" style={{ fontSize: '1.25rem' }}>
              {sleepMetrics?.avgWakeTime || 'N/A'}
            </div>
            <div className="habit-stat-label">Avg Wake Up Time</div>
          </div>
        </div>

        <div className="habit-stat-card">
          <div className="habit-stat-icon" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
            <Calendar size={24} />
          </div>
          <div>
            <div className="habit-stat-value">
              {sleepMetrics?.totalSleepSessions || 0}
            </div>
            <div className="habit-stat-label">Total Sleep Cycles</div>
          </div>
        </div>

        <div className="habit-stat-card">
          <div className="habit-stat-icon" style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#ec4899' }}>
            <Award size={24} />
          </div>
          <div>
            <div className="habit-stat-value">
              {sleepMetrics?.minSleepHours || 0}h - {sleepMetrics?.maxSleepHours || 0}h
            </div>
            <div className="habit-stat-label">Min &bull; Max Rest Hours</div>
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* CHART 1: SLEEP DURATION TREND (BAR + SPLINE WITH 7-9H BAND)       */}
      {/* ================================================================= */}
      <div className="chart-card">
        <div className="chart-header">
          <div>
            <div className="chart-title">
              <Moon size={20} color="#a78bfa" />
              <span>Nightly Sleep Duration Trend (Day N Sleep ➔ Day N+1 Wake Up)</span>
            </div>
            <div className="chart-subtitle">
              Calculated time between each Day's Sleep button press and the subsequent Wake Up button press.
            </div>
          </div>
          <span className="badge badge-success" style={{ fontSize: '0.75rem', padding: '3px 9px' }}>
            Optimal: 7.0 - 9.0 hrs
          </span>
        </div>

        {sleepTrendOption ? (
          <ReactECharts
            option={sleepTrendOption}
            style={{ height: '360px', width: '100%' }}
            opts={{ renderer: 'svg' }}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: '3.5rem 0', color: 'var(--text-muted)' }}>
            <Moon size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
            <p>No completed sleep cycles logged yet.</p>
            <p style={{ fontSize: '0.85rem', marginTop: '0.35rem' }}>
              Press Sleep on Day 1, and Wake Up on Day 2 to generate your first sleep analysis point!
            </p>
          </div>
        )}
      </div>

      {/* ================================================================= */}
      {/* CHART 2: QUALITY DISTRIBUTION DOUGHNUT                            */}
      {/* ================================================================= */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '1.75rem' }}>
        <div className="chart-card" style={{ marginBottom: 0 }}>
          <div className="chart-header">
            <div>
              <div className="chart-title">
                <PieChartIcon size={20} color="#10b981" />
                <span>Sleep Quality Distribution</span>
              </div>
              <div className="chart-subtitle">Breakdown of nights in optimal vs short/long recovery.</div>
            </div>
          </div>

          {qualityPieOption ? (
            <ReactECharts
              option={qualityPieOption}
              style={{ height: '300px', width: '100%' }}
              opts={{ renderer: 'svg' }}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
              <p>No quality distribution data yet.</p>
            </div>
          )}
        </div>

        {/* Motivational Guidance Card */}
        <div className="chart-card" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(99, 102, 241, 0.2)',
                color: 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Night Owl Sleep Optimization
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Circadian Alignment</span>
            </div>
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.6', marginBottom: '1rem' }}>
            As a night owl, your biological clock naturally peaks later into the night (12 AM - 4 AM).
            Consistency matters more than matching traditional 9-to-5 schedules. Pressing <strong>Sleep</strong> when
            your brain winds down and <strong>Wake Up</strong> when your day resumes tracks your true recovery period!
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <div style={{ color: '#10b981', fontWeight: 700, fontSize: '0.85rem' }}>Target: 7.5h - 8.5h</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>Peak cognitive recovery</div>
            </div>
            <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
              <div style={{ color: '#818cf8', fontWeight: 700, fontSize: '0.85rem' }}>Anchor Bedtime</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>Keep sleep within +/- 45m</div>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* TABLE: SLEEP LOG HISTORY                                          */}
      {/* ================================================================= */}
      <div className="chart-card">
        <div className="chart-header">
          <div>
            <div className="chart-title">
              <Bed size={20} color="#a78bfa" />
              <span>Sleep Session History Log</span>
            </div>
            <div className="chart-subtitle">
              Every night's rest linking Day N Sleep to Day N+1 Wake Up.
            </div>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {sleepRecordsList.length} Sessions Logged
          </span>
        </div>

        {sleepLoading && sleepRecordsList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
            Loading sleep records...
          </div>
        ) : sleepRecordsList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 0', color: 'var(--text-muted)' }}>
            <p>No sleep logs recorded yet. Complete Day 1 and start Day 2 to generate sleep session records!</p>
          </div>
        ) : (
          <div className="habit-table-container">
            <table className="habit-table">
              <thead>
                <tr>
                  <th>Session</th>
                  <th>Bedtime (Sleep Pressed)</th>
                  <th>Wake Up Pressed</th>
                  <th>Sleep Duration</th>
                  <th>Quality Rating</th>
                  <th>Status</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {sleepRecordsList.map((record) => {
                  const isCompleted = record.status === 'COMPLETED';
                  const qualityColor =
                    record.quality === 'OPTIMAL'
                      ? '#10b981'
                      : record.quality === 'FAIR'
                      ? '#38bdf8'
                      : record.quality === 'SHORT'
                      ? '#f59e0b'
                      : '#ec4899';

                  return (
                    <tr key={record._id}>
                      {/* Session */}
                      <td>
                        <strong style={{ color: '#a78bfa', fontSize: '0.95rem' }}>
                          Day {record.fromDayNumber} ➔ Day {record.toDayNumber || '?'}
                        </strong>
                      </td>

                      {/* Bedtime */}
                      <td>
                        <div className="table-time-cell">
                          <span className="table-time-main">{formatDateTime(record.sleepStartTime)}</span>
                          <span className="table-time-sub">{formatDateOnly(record.sleepStartTime)}</span>
                        </div>
                      </td>

                      {/* Wake Up */}
                      <td>
                        <div className="table-time-cell">
                          {isCompleted ? (
                            <>
                              <span className="table-time-main">{formatDateTime(record.wakeUpTime)}</span>
                              <span className="table-time-sub">{formatDateOnly(record.wakeUpTime)}</span>
                            </>
                          ) : (
                            <span style={{ color: '#a78bfa', fontWeight: 600 }}>
                              Asleep Right Now
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Duration */}
                      <td>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 700,
                            fontSize: '0.95rem',
                            color: '#a78bfa',
                            background: 'rgba(167, 139, 250, 0.15)',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            border: '1px solid rgba(167, 139, 250, 0.3)',
                          }}
                        >
                          {record.durationHours} hrs ({record.durationMinutes}m)
                        </span>
                      </td>

                      {/* Quality */}
                      <td>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '9999px',
                            background: `${qualityColor}20`,
                            color: qualityColor,
                            border: `1px solid ${qualityColor}40`,
                          }}
                        >
                          {record.quality}
                        </span>
                      </td>

                      {/* Status */}
                      <td>
                        {isCompleted ? (
                          <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>
                            Completed
                          </span>
                        ) : (
                          <span
                            className="badge badge-info"
                            style={{
                              fontSize: '0.75rem',
                              background: 'rgba(109, 40, 217, 0.3)',
                              color: '#c4b5fd',
                            }}
                          >
                            Sleeping
                          </span>
                        )}
                      </td>

                      {/* Notes */}
                      <td style={{ maxWidth: '220px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                        {record.notes || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default HabitSleepAnalyticsPage;

