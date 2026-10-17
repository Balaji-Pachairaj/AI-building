import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
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
  TrendingUp,
  AlertCircle,
  PieChart as PieChartIcon,
  Trash2,
  BookOpen,
} from 'lucide-react';
import {
  fetchSleepAnalytics,
  deleteSleepSession,
} from '../../features/sleep/sleepSlice';
import '../../styles/sleepTracker.css';

/**
 * Format local date and time string
 */
const formatDateTime = (dateStr) => {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return d.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

const SleepAnalyticsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    metrics,
    charts,
    records,
    analyticsLoading,
    isCurrentlySleeping,
    activeSession,
  } = useSelector((state) => state.sleep);

  useEffect(() => {
    dispatch(fetchSleepAnalytics());
  }, [dispatch]);

  const handleDeleteSession = (sessionId) => {
    if (window.confirm('Are you sure you want to delete this sleep session?')) {
      dispatch(deleteSleepSession(sessionId));
    }
  };

  // ECharts Option: Nightly Duration Trend
  const trendChartOption = useMemo(() => {
    const trendData = charts.sleepTrend || [];
    const xLabels = trendData.map((d) => d.label || `Night #${d.sessionNumber}`);
    const durations = trendData.map((d) => d.durationHours);

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#0f172a',
        borderColor: '#334155',
        textStyle: { color: '#f8fafc', fontSize: 13 },
        formatter: (params) => {
          if (!params || !params.length) return '';
          const p = params[0];
          const item = trendData[p.dataIndex];
          return `
            <div style="font-weight: 700; margin-bottom: 4px; color: #818cf8;">${item?.label || p.name}</div>
            <div style="font-size: 12px; color: #94a3b8; margin-bottom: 6px;">Cycle: ${item?.cycleLabel || ''}</div>
            <div style="font-size: 13px; color: #34d399;">Duration: <b>${p.value} hrs</b> (${Math.round((item?.durationMinutes || 0))} mins)</div>
            <div style="font-size: 12px; color: #cbd5e1; margin-top: 4px;">Quality: <b>${item?.quality || 'N/A'}</b></div>
            ${item?.notes ? `<div style="font-size: 11px; color: #64748b; margin-top: 4px;">"${item.notes}"</div>` : ''}
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
        data: xLabels,
        axisLine: { lineStyle: { color: '#334155' } },
        axisLabel: { color: '#94a3b8', fontSize: 11 },
      },
      yAxis: {
        type: 'value',
        name: 'Hours Slept',
        nameTextStyle: { color: '#94a3b8', fontSize: 11 },
        min: 0,
        max: (val) => Math.max(10, Math.ceil(val.max + 1)),
        splitLine: { lineStyle: { color: '#1e293b' } },
        axisLabel: { color: '#94a3b8', formatter: '{value}h' },
      },
      series: [
        {
          name: 'Sleep Duration',
          type: 'line',
          smooth: true,
          data: durations,
          symbolSize: 8,
          lineStyle: {
            width: 3,
            color: '#6366f1',
            shadowColor: 'rgba(99, 102, 241, 0.4)',
            shadowBlur: 10,
          },
          itemStyle: {
            color: '#818cf8',
            borderWidth: 2,
            borderColor: '#ffffff',
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(99, 102, 241, 0.35)' },
                { offset: 1, color: 'rgba(99, 102, 241, 0.02)' },
              ],
            },
          },
          markLine: {
            silent: true,
            symbol: 'none',
            data: [
              {
                yAxis: 7,
                lineStyle: { color: '#10b981', type: 'dashed', width: 1.5 },
                label: { formatter: '7h Optimal Min', position: 'end', color: '#10b981', fontSize: 10 },
              },
              {
                yAxis: 9,
                lineStyle: { color: '#10b981', type: 'dashed', width: 1.5 },
                label: { formatter: '9h Optimal Max', position: 'end', color: '#10b981', fontSize: 10 },
              },
            ],
          },
        },
      ],
    };
  }, [charts.sleepTrend]);

  // ECharts Option: Quality Distribution Doughnut
  const qualityChartOption = useMemo(() => {
    const rawData = charts.qualityDistribution || [];
    const validData = rawData.filter((d) => d.value > 0);

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: '#0f172a',
        borderColor: '#334155',
        textStyle: { color: '#f8fafc' },
        formatter: '{b}: <b>{c} sessions</b> ({d}%)',
      },
      legend: {
        bottom: '0%',
        left: 'center',
        textStyle: { color: '#94a3b8', fontSize: 11 },
        itemGap: 16,
      },
      series: [
        {
          name: 'Sleep Quality',
          type: 'pie',
          radius: ['45%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 8,
            borderColor: '#0f172a',
            borderWidth: 2,
          },
          label: {
            show: false,
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 'bold',
              color: '#ffffff',
            },
          },
          data: validData.length
            ? validData.map((d) => ({
                name: d.name,
                value: d.value,
                itemStyle: { color: d.color },
              }))
            : [{ name: 'No data yet', value: 1, itemStyle: { color: '#334155' } }],
        },
      ],
    };
  }, [charts.qualityDistribution]);

  return (
    <div className="sleep-container">
      {/* Top Navigation Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => navigate('/sleep')}
            style={{
              background: '#111a2e',
              border: '1px solid #1e293b',
              color: '#94a3b8',
              borderRadius: '10px',
              padding: '0.6rem 0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.88rem',
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to Sleep Tracker</span>
          </button>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, color: '#f8fafc' }}>
            Sleep Analytics & Recovery
          </h1>
        </div>

        {/* Live Sleeping Pill if currently resting */}
        {isCurrentlySleeping && (
          <div className="sleep-hero-status-pill sleeping" style={{ margin: 0 }}>
            <span className="pulsing-dot sleeping" />
            <span>Currently Sleeping (Started {formatDateTime(activeSession?.sleepStartTime)})</span>
          </div>
        )}
      </div>

      {/* North Star Focus Banner */}
      <div className="sleep-north-star-banner" style={{ marginBottom: '2rem' }}>
        <div className="north-star-content">
          <div className="north-star-icon">
            <BookOpen size={24} color="#ffffff" />
          </div>
          <div className="north-star-text">
            <h3>
              AI Research Foundations
              <span className="north-star-badge">Google Skills</span>
            </h3>
            <p>
              Your neuro-recovery data directly impacts learning retention and theoretical mastery. Maintain 7-9 hours of consistent sleep for peak cognitive performance.
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="sleep-metrics-grid">
        <div className="sleep-metric-card">
          <div className="metric-header">
            <span className="metric-title">Average Duration</span>
            <div className="metric-icon-box" style={{ background: 'rgba(99, 102, 241, 0.15)' }}>
              <Clock size={18} color="#818cf8" />
            </div>
          </div>
          <div className="metric-value">{metrics.avgSleepHours || 0} hrs</div>
          <div className="metric-subtitle">
            Min: {metrics.minSleepHours || 0}h | Max: {metrics.maxSleepHours || 0}h
          </div>
        </div>

        <div className="sleep-metric-card">
          <div className="metric-header">
            <span className="metric-title">Optimal Recovery</span>
            <div className="metric-icon-box" style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
              <Award size={18} color="#34d399" />
            </div>
          </div>
          <div className="metric-value" style={{ color: '#34d399' }}>
            {metrics.optimalSleepPercent || 0}%
          </div>
          <div className="metric-subtitle">
            {metrics.optimalCount || 0} of {metrics.totalSleepSessions || 0} sessions in 7-9h target
          </div>
        </div>

        <div className="sleep-metric-card">
          <div className="metric-header">
            <span className="metric-title">Avg Bedtime</span>
            <div className="metric-icon-box" style={{ background: 'rgba(99, 102, 241, 0.15)' }}>
              <Moon size={18} color="#818cf8" />
            </div>
          </div>
          <div className="metric-value" style={{ fontSize: '1.45rem' }}>
            {metrics.avgBedtime || 'N/A'}
          </div>
          <div className="metric-subtitle">Night owl sleep onset</div>
        </div>

        <div className="sleep-metric-card">
          <div className="metric-header">
            <span className="metric-title">Avg Wake-Up</span>
            <div className="metric-icon-box" style={{ background: 'rgba(245, 158, 11, 0.15)' }}>
              <Sun size={18} color="#fbbf24" />
            </div>
          </div>
          <div className="metric-value" style={{ fontSize: '1.45rem' }}>
            {metrics.avgWakeTime || 'N/A'}
          </div>
          <div className="metric-subtitle">Morning awakening schedule</div>
        </div>
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {/* Trend Chart */}
        <div className="sleep-chart-panel" style={{ margin: 0 }}>
          <div className="chart-panel-header">
            <div>
              <div className="chart-panel-title">
                <TrendingUp size={20} color="#818cf8" />
                <span>Nightly Sleep Duration Trend</span>
              </div>
              <div className="chart-panel-subtitle">
                Hours rested per night with 7h–9h optimal recovery band
              </div>
            </div>
          </div>
          {charts.sleepTrend && charts.sleepTrend.length > 0 ? (
            <ReactECharts option={trendChartOption} style={{ height: '320px', width: '100%' }} />
          ) : (
            <div style={{ height: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
              No completed sleep sessions yet. Record your first night!
            </div>
          )}
        </div>

        {/* Quality Distribution Chart */}
        <div className="sleep-chart-panel" style={{ margin: 0 }}>
          <div className="chart-panel-header">
            <div>
              <div className="chart-panel-title">
                <PieChartIcon size={20} color="#34d399" />
                <span>Sleep Quality Distribution</span>
              </div>
              <div className="chart-panel-subtitle">
                Sessions classified by restorative duration
              </div>
            </div>
          </div>
          <ReactECharts option={qualityChartOption} style={{ height: '320px', width: '100%' }} />
        </div>
      </div>

      {/* History Table */}
      <div className="sleep-chart-panel">
        <div className="chart-panel-header">
          <div>
            <div className="chart-panel-title">
              <Calendar size={20} color="#38bdf8" />
              <span>Nightly Sleep History ({records.length} Recorded Nights)</span>
            </div>
            <div className="chart-panel-subtitle">
              Calculated sleep cycles from Day N Sleep button to Day N+1 Wake Up button
            </div>
          </div>
        </div>

        {records.length > 0 ? (
          <div className="sleep-table-wrapper">
            <table className="sleep-table">
              <thead>
                <tr>
                  <th>Night</th>
                  <th>Cycle</th>
                  <th>Bedtime (Sleep)</th>
                  <th>Wake-Up Time</th>
                  <th>Duration</th>
                  <th>Recovery</th>
                  <th>Notes</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r._id}>
                    <td style={{ fontWeight: 700, color: '#818cf8' }}>
                      Night #{r.sleepSessionNumber || 1}
                    </td>
                    <td>
                      <span style={{ color: '#cbd5e1' }}>
                        Day {r.fromDayNumber} ➔ Day {r.toDayNumber || r.fromDayNumber + 1}
                      </span>
                    </td>
                    <td>{formatDateTime(r.sleepStartTime)}</td>
                    <td>{r.wakeUpTime ? formatDateTime(r.wakeUpTime) : 'Sleeping...'}</td>
                    <td style={{ fontWeight: 700 }}>
                      {r.durationHours} hrs
                      <span style={{ fontSize: '0.78rem', color: '#94a3b8', marginLeft: '0.3rem' }}>
                        ({Math.round(r.durationMinutes || 0)}m)
                      </span>
                    </td>
                    <td>
                      <span className={`badge-quality ${r.quality}`}>{r.quality}</span>
                    </td>
                    <td style={{ maxWidth: '200px', color: '#94a3b8' }}>
                      {r.notes || '—'}
                    </td>
                    <td>
                      <button
                        onClick={() => handleDeleteSession(r._id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#f87171',
                          cursor: 'pointer',
                          padding: '0.3rem',
                          borderRadius: '6px',
                        }}
                        title="Delete session"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
            <Bed size={40} style={{ opacity: 0.4, marginBottom: '0.75rem' }} />
            <p style={{ margin: '0 0 1rem', fontSize: '1rem' }}>No completed sleep records found yet.</p>
            <Link
              to="/sleep"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: '#4f46e5',
                color: '#ffffff',
                padding: '0.6rem 1.2rem',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '0.88rem',
              }}
            >
              <Moon size={16} />
              <span>Go to Sleep Tracker</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default SleepAnalyticsPage;

