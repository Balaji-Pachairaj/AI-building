import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import {
  TrendingUp,
  Clock,
  Calendar,
  Flame,
  Award,
  BarChart3,
  CheckCircle2,
  PieChart as PieChartIcon,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Target,
  Moon,
} from 'lucide-react';
import {
  fetchOverviewAnalytics,
  fetchDaysList,
} from '../../features/habits/habitsSlice';
import '../../styles/habitTracker.css';

const HabitAnalyticsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    analyticsMetrics,
    analyticsCharts,
    analyticsLoading,
    daysList,
    daysLoading,
    habits,
  } = useSelector((state) => state.habits);

  useEffect(() => {
    dispatch(fetchOverviewAnalytics());
    dispatch(fetchDaysList({ limit: 100 }));
  }, [dispatch]);

  // Format date helper
  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'Active (In Progress)';
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
  // ECharts Option 1: Line Chart: Total Hours vs Day
  // -------------------------------------------------------------------------
  const hoursLineChartOption = useMemo(() => {
    const rawData = analyticsCharts?.daysChartData || [];
    if (rawData.length === 0) return null;

    const days = rawData.map((d) => `Day ${d.dayNumber}`);
    const hours = rawData.map((d) => d.totalHours);

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
          const dayInfo = rawData[dataIndex];
          return `
            <div style="font-weight: 700; margin-bottom: 4px; color: #38bdf8;">${item.name} (${formatDateOnly(dayInfo?.startTime)})</div>
            <div>⏱ Total Hours: <strong>${item.value} hrs</strong></div>
            <div>✅ Habits Done: <strong>${dayInfo?.completedHabitsCount || 0} / ${dayInfo?.totalHabitsCount || 11}</strong> (${dayInfo?.completionRate || 0}%)</div>
            <div>🌙 Start: ${formatDateTime(dayInfo?.startTime)}</div>
            <div>💤 Sleep: ${formatDateTime(dayInfo?.endTime)}</div>
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
        data: days,
        axisLine: { lineStyle: { color: '#334155' } },
        axisLabel: { color: '#94a3b8', fontSize: 11 },
      },
      yAxis: {
        type: 'value',
        name: 'Hours (hrs)',
        nameTextStyle: { color: '#94a3b8', fontSize: 11 },
        splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.05)' } },
        axisLabel: { color: '#94a3b8', fontSize: 11 },
      },
      series: [
        {
          name: 'Total Hours Active',
          type: 'line',
          smooth: true,
          data: hours,
          symbol: 'circle',
          symbolSize: 8,
          itemStyle: {
            color: '#38bdf8',
            borderColor: '#0284c7',
            borderWidth: 2,
          },
          lineStyle: {
            width: 3,
            color: '#38bdf8',
            shadowColor: 'rgba(56, 189, 248, 0.4)',
            shadowBlur: 10,
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(56, 189, 248, 0.35)' },
                { offset: 1, color: 'rgba(56, 189, 248, 0.0)' },
              ],
            },
          },
          markLine: {
            data: [
              {
                type: 'average',
                name: 'Average Hours',
                lineStyle: { color: '#f59e0b', type: 'dashed', width: 2 },
                label: {
                  formatter: 'Avg: {c}h',
                  color: '#f59e0b',
                  position: 'insideEndTop',
                  fontSize: 11,
                },
              },
            ],
          },
        },
      ],
    };
  }, [analyticsCharts?.daysChartData]);

  // -------------------------------------------------------------------------
  // ECharts Option 2: Habits Completion per Day
  // -------------------------------------------------------------------------
  const completionChartOption = useMemo(() => {
    const rawData = analyticsCharts?.daysChartData || [];
    if (rawData.length === 0) return null;

    const days = rawData.map((d) => `Day ${d.dayNumber}`);
    const completed = rawData.map((d) => d.completedHabitsCount || 0);

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        borderColor: '#334155',
        textStyle: { color: '#f8fafc', fontSize: 12 },
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
        data: days,
        axisLine: { lineStyle: { color: '#334155' } },
        axisLabel: { color: '#94a3b8', fontSize: 11 },
      },
      yAxis: {
        type: 'value',
        name: 'Habits Completed',
        max: 11,
        min: 0,
        splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.05)' } },
        axisLabel: { color: '#94a3b8', fontSize: 11 },
      },
      series: [
        {
          name: 'Habits Completed',
          type: 'bar',
          data: completed,
          barWidth: '35%',
          itemStyle: {
            borderRadius: [6, 6, 0, 0],
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: '#10b981' },
                { offset: 1, color: '#047857' },
              ],
            },
          },
          markLine: {
            data: [
              {
                yAxis: 11,
                name: 'Target (11/11)',
                lineStyle: { color: '#6366f1', type: 'dotted', width: 2 },
                label: { formatter: 'Target: 11', color: '#818cf8', fontSize: 11 },
              },
            ],
          },
        },
      ],
    };
  }, [analyticsCharts?.daysChartData]);

  // -------------------------------------------------------------------------
  // ECharts Option 3: Category Breakdown
  // -------------------------------------------------------------------------
  const categoryPieOption = useMemo(() => {
    const rawData = analyticsCharts?.categoryBreakdown || [];
    if (rawData.length === 0) return null;

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        borderColor: '#334155',
        textStyle: { color: '#f8fafc', fontSize: 12 },
        formatter: '{b}: <strong>{c} hits</strong> ({d}%)',
      },
      legend: {
        orient: 'vertical',
        right: '5%',
        top: 'center',
        textStyle: { color: '#94a3b8', fontSize: 11 },
      },
      series: [
        {
          name: 'Category Hits',
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
  }, [analyticsCharts?.categoryBreakdown]);

  return (
    <div className="habit-app-container">
      {/* Top Navigation Row */}
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
            onClick={() => navigate('/habits/sleep-analytics')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem' }}
          >
            <Moon size={16} color="#a78bfa" />
            <span>Sleep Analytics</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/habits/single-analytics')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem' }}
          >
            <BarChart3 size={16} color="var(--accent-primary)" />
            <span>Per-Habit Analytics</span>
          </button>
        </div>
      </div>

      {/* Header Banner */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
          <span className="habit-badge-pill habit-badge-night">
            <Moon size={14} />
            6-Month Consistency OS
          </span>
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
          Habit &amp; Day Cycle Analytics
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
          Track daily awake duration between sleep button presses, consistency trends, and habit accomplishment.
        </p>
      </div>

      {/* ================================================================= */}
      {/* TOP KPI MOTIVATION METRICS                                        */}
      {/* ================================================================= */}
      <div className="habit-stats-grid">
        <div className="habit-stat-card">
          <div className="habit-stat-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#6366f1' }}>
            <Calendar size={24} />
          </div>
          <div>
            <div className="habit-stat-value">
              {analyticsMetrics?.totalDays || 0}
            </div>
            <div className="habit-stat-label">Total Days Tracked</div>
          </div>
        </div>

        <div className="habit-stat-card">
          <div className="habit-stat-icon" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
            <Clock size={24} />
          </div>
          <div>
            <div className="habit-stat-value">
              {analyticsMetrics?.totalTrackedHours || 0}h
            </div>
            <div className="habit-stat-label">Total Hours Active</div>
          </div>
        </div>

        <div className="habit-stat-card">
          <div className="habit-stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
            <Clock size={24} />
          </div>
          <div>
            <div className="habit-stat-value">
              {analyticsMetrics?.avgHoursPerDay || 0}h
            </div>
            <div className="habit-stat-label">Avg Hours / Day</div>
          </div>
        </div>

        <div className="habit-stat-card">
          <div className="habit-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <Flame size={24} />
          </div>
          <div>
            <div className="habit-stat-value">
              {analyticsMetrics?.currentStreak || 0} Days
            </div>
            <div className="habit-stat-label">
              Current Streak (Best: {analyticsMetrics?.bestStreak || 0})
            </div>
          </div>
        </div>

        <div className="habit-stat-card">
          <div className="habit-stat-icon" style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#ec4899' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div className="habit-stat-value">
              {analyticsMetrics?.totalHabitHits || 0}
            </div>
            <div className="habit-stat-label">Total Habit Hits</div>
          </div>
        </div>

        <div className="habit-stat-card">
          <div className="habit-stat-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
            <Target size={24} />
          </div>
          <div>
            <div className="habit-stat-value">
              {analyticsMetrics?.avgCompletionRate || 0}%
            </div>
            <div className="habit-stat-label">Average Completion</div>
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* CHART 1: LINE CHART - TOTAL HOURS VS DAY                          */}
      {/* ================================================================= */}
      <div className="chart-card">
        <div className="chart-header">
          <div>
            <div className="chart-title">
              <TrendingUp size={20} color="#38bdf8" />
              <span>Day Cycle Duration: Total Hours vs Day</span>
            </div>
            <div className="chart-subtitle">
              Calculated duration between wake/start time and sleep button press for each day.
            </div>
          </div>
          <span className="badge badge-info" style={{ fontSize: '0.75rem', padding: '3px 9px' }}>
            Target: 14h 15m Awake Flow
          </span>
        </div>

        {hoursLineChartOption ? (
          <ReactECharts
            option={hoursLineChartOption}
            style={{ height: '360px', width: '100%' }}
            opts={{ renderer: 'svg' }}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
            <Clock size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
            <p>No day records logged yet. Start tracking and click Sleep to generate your line chart!</p>
          </div>
        )}
      </div>

      {/* ================================================================= */}
      {/* 2-COLUMN GRID: HABITS COMPLETED & CATEGORY BREAKDOWN              */}
      {/* ================================================================= */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '1.75rem' }}>
        {/* Chart 2: Habits Completed per Day */}
        <div className="chart-card" style={{ marginBottom: 0 }}>
          <div className="chart-header">
            <div>
              <div className="chart-title">
                <BarChart3 size={20} color="#10b981" />
                <span>Habits Completed per Day</span>
              </div>
              <div className="chart-subtitle">Count of habits hit out of 11 daily targets.</div>
            </div>
          </div>

          {completionChartOption ? (
            <ReactECharts
              option={completionChartOption}
              style={{ height: '300px', width: '100%' }}
              opts={{ renderer: 'svg' }}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
              <p>No completion data yet.</p>
            </div>
          )}
        </div>

        {/* Chart 3: Category Breakdown */}
        <div className="chart-card" style={{ marginBottom: 0 }}>
          <div className="chart-header">
            <div>
              <div className="chart-title">
                <PieChartIcon size={20} color="#ec4899" />
                <span>Habit Hits by Category</span>
              </div>
              <div className="chart-subtitle">Focus distribution across core life areas.</div>
            </div>
          </div>

          {categoryPieOption ? (
            <ReactECharts
              option={categoryPieOption}
              style={{ height: '300px', width: '100%' }}
              opts={{ renderer: 'svg' }}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
              <p>No category hit data yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* ================================================================= */}
      {/* TABLE: DAY LIST (Start & End Time, Total Hours in that Day)        */}
      {/* ================================================================= */}
      <div className="chart-card">
        <div className="chart-header">
          <div>
            <div className="chart-title">
              <Calendar size={20} color="var(--accent-primary)" />
              <span>Day History &amp; Sleep Log</span>
            </div>
            <div className="chart-subtitle">
              Comprehensive log showing Start Time, End / Sleep Time, Total Hours in that day, and Accomplishment.
            </div>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {daysList.length} Total Days Recorded
          </span>
        </div>

        {daysLoading && daysList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
            Loading day list records...
          </div>
        ) : daysList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 0', color: 'var(--text-muted)' }}>
            <p>No days recorded yet. Hit habits and press Sleep to generate your day history table!</p>
          </div>
        ) : (
          <div className="habit-table-container">
            <table className="habit-table">
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Start Time (Wake)</th>
                  <th>End Time (Sleep)</th>
                  <th>Total Hours</th>
                  <th>Habits Done</th>
                  <th>Completion</th>
                  <th>Status</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {daysList.map((day) => {
                  const isCompleted = day.status === 'COMPLETED';
                  const rate = day.completionRate || 0;
                  const rateColor =
                    rate >= 80 ? 'var(--accent-success)' : rate >= 50 ? 'var(--accent-warning)' : 'var(--accent-danger)';

                  return (
                    <tr key={day._id}>
                      {/* Day Number */}
                      <td>
                        <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                          Day {day.dayNumber}
                        </strong>
                      </td>

                      {/* Start Time */}
                      <td>
                        <div className="table-time-cell">
                          <span className="table-time-main">{formatDateTime(day.startTime)}</span>
                          <span className="table-time-sub">{formatDateOnly(day.startTime)}</span>
                        </div>
                      </td>

                      {/* End Time (Sleep) */}
                      <td>
                        <div className="table-time-cell">
                          {isCompleted ? (
                            <>
                              <span className="table-time-main">{formatDateTime(day.endTime)}</span>
                              <span className="table-time-sub">{formatDateOnly(day.endTime)}</span>
                            </>
                          ) : (
                            <span style={{ color: 'var(--accent-info)', fontWeight: 600 }}>
                              In Progress
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Total Hours in that Day */}
                      <td>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 700,
                            fontSize: '0.95rem',
                            color: '#38bdf8',
                            background: 'rgba(56, 189, 248, 0.12)',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            border: '1px solid rgba(56, 189, 248, 0.25)',
                          }}
                        >
                          {day.totalHours} hrs
                        </span>
                      </td>

                      {/* Habits Done */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 600 }}>
                            {day.completedHabitsCount || 0} / {day.totalHabitsCount || 11}
                          </span>
                        </div>
                      </td>

                      {/* Completion % */}
                      <td>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '9999px',
                            background: `${rateColor}20`,
                            color: rateColor,
                            border: `1px solid ${rateColor}40`,
                          }}
                        >
                          {rate}%
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
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <span
                              style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                background: '#38bdf8',
                              }}
                            />
                            Active
                          </span>
                        )}
                      </td>

                      {/* Notes */}
                      <td style={{ maxWidth: '220px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                        {day.notes || '-'}
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

export default HabitAnalyticsPage;

