import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import ReactECharts from 'echarts-for-react';
import {
  ArrowLeft,
  Calendar,
  Tag as TagIcon,
  TrendingDown,
  Calculator,
  Layers,
  Columns,
  Rows,
  Receipt,
  RefreshCw,
  PlusCircle,
} from 'lucide-react';
import { fetchTagAnalysis, setDateRange } from '../../features/budget/budgetSlice';
import BudgetMobileNav from '../../components/budget/BudgetMobileNav';
import '../../styles/budgetPadmanabhan.css';

const TagAnalysisPage = () => {
  const { tagName } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const { dateRange, tagAnalysis, currency } = useSelector((state) => state.budget);
  const { data, status, error } = tagAnalysis;
  const cur = currency || '₹';

  // Date range state
  const initialStart = searchParams.get('startDate') || dateRange.startDate;
  const initialEnd = searchParams.get('endDate') || dateRange.endDate;

  const [startDate, setLocalStartDate] = useState(initialStart);
  const [endDate, setLocalEndDate] = useState(initialEnd);

  // Chart Layout mode: 'row' (side by side) or 'column' (stacked vertically)
  const [layoutMode, setLayoutMode] = useState('row');

  useEffect(() => {
    if (tagName) {
      dispatch(
        fetchTagAnalysis({
          tagName,
          params: { startDate, endDate },
        })
      );
    }
  }, [dispatch, tagName, startDate, endDate]);

  const handleDateChange = (newStart, newEnd) => {
    setLocalStartDate(newStart);
    setLocalEndDate(newEnd);
    setSearchParams({ startDate: newStart, endDate: newEnd });
    dispatch(setDateRange({ startDate: newStart, endDate: newEnd }));
  };

  const analytics = data?.analytics || {
    totalSpent: 0,
    transactionCount: 0,
    averageSpent: 0,
  };

  const tagColor = data?.tag?.color || '#e1306c';
  const timeline = data?.timeline || [];
  const transactions = data?.transactions || [];

  // Prepare data for Echarts
  const dates = timeline.map((t) => t.date);
  const amounts = timeline.map((t) => t.amount);

  // ECharts Bar Chart Option
  const barChartOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params) => {
        const item = params[0];
        return `<div style="font-family: Roboto, sans-serif; font-size: 13px;">
          <strong>${item.name}</strong><br/>
          Spent: <span style="color: #fda4af; font-weight: 700;">${cur} ${Number(item.value).toLocaleString()}</span>
        </div>`;
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: dates.length > 0 ? dates : ['No Data'],
      axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.2)' } },
      axisLabel: { color: '#94a3b8', fontSize: 11, rotate: dates.length > 7 ? 30 : 0 },
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.2)' } },
      axisLabel: { color: '#94a3b8', fontSize: 11, formatter: (v) => `${cur}${v}` },
      splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.06)' } },
    },
    series: [
      {
        name: 'Amount Spent',
        type: 'bar',
        data: amounts.length > 0 ? amounts : [0],
        barWidth: '40%',
        itemStyle: {
          borderRadius: [6, 6, 0, 0],
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: tagColor },
              { offset: 1, color: 'rgba(225, 48, 108, 0.3)' },
            ],
          },
        },
      },
    ],
  };

  // ECharts Line Chart Option
  const lineChartOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const item = params[0];
        return `<div style="font-family: Roboto, sans-serif; font-size: 13px;">
          <strong>${item.name}</strong><br/>
          Spent: <span style="color: #6ee7b7; font-weight: 700;">${cur} ${Number(item.value).toLocaleString()}</span>
        </div>`;
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: dates.length > 0 ? dates : ['No Data'],
      axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.2)' } },
      axisLabel: { color: '#94a3b8', fontSize: 11, rotate: dates.length > 7 ? 30 : 0 },
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.2)' } },
      axisLabel: { color: '#94a3b8', fontSize: 11, formatter: (v) => `${cur}${v}` },
      splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.06)' } },
    },
    series: [
      {
        name: 'Spending Trend',
        type: 'line',
        smooth: true,
        data: amounts.length > 0 ? amounts : [0],
        lineStyle: { width: 3, color: '#10b981' },
        itemStyle: { color: '#10b981' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(16, 185, 129, 0.35)' },
              { offset: 1, color: 'rgba(16, 185, 129, 0.0)' },
            ],
          },
        },
      },
    ],
  };

  return (
    <div className="budget-app">
      {/* Top Header */}
      <div className="budget-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => navigate('/budget_padmanabhan')}
            className="ig-outline-btn"
            style={{ padding: '0.45rem 0.85rem' }}
          >
            <ArrowLeft size={16} />
            <span>Dashboard</span>
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.35rem 0.85rem',
                  borderRadius: '9999px',
                  background: 'rgba(225, 48, 108, 0.15)',
                  border: `1.5px solid ${tagColor}`,
                  color: tagColor,
                  fontWeight: 800,
                  fontSize: '1.25rem',
                }}
              >
                <TagIcon size={18} />
                <span>#{tagName}</span>
              </span>
              <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
                Spend Analytics
              </span>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: '0.2rem 0 0' }}>
              Spending metrics & timeline charts
            </p>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => navigate('/budget_padmanabhan/add-transaction')}
          className="ig-gradient-btn"
        >
          <PlusCircle size={16} />
          <span>Add Transaction</span>
        </button>
      </div>

      {/* Date Range Filter Bar */}
      <div className="budget-filter-bar">
        <div className="date-pickers-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', fontSize: '0.85rem' }}>
            <Calendar size={16} color="#e1306c" />
            <span style={{ fontWeight: 600 }}>Analytics Range:</span>
          </div>

          <div className="date-input-wrapper">
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => handleDateChange(e.target.value, endDate)}
            />
          </div>

          <div className="date-input-wrapper">
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => handleDateChange(startDate, e.target.value)}
            />
          </div>
        </div>

        {/* Layout Toggle: Row View / Column View */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Chart View:</span>
          <button
            onClick={() => setLayoutMode('row')}
            className={`preset-chip ${layoutMode === 'row' ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <Columns size={13} />
            <span>Row View</span>
          </button>
          <button
            onClick={() => setLayoutMode('column')}
            className={`preset-chip ${layoutMode === 'column' ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <Rows size={13} />
            <span>Column View</span>
          </button>
        </div>
      </div>

      {/* Analytics Summary Stats (No Charts for #1 and #2) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        {/* Metric 1: Total Amount spent in given date range */}
        <div className="summary-box box-spent">
          <div className="summary-box-header">
            <span className="summary-box-label">
              <TrendingDown size={16} color="#f43f5e" />
              <span>1) Total Amount Spent</span>
            </span>
          </div>
          <div className="summary-box-amount" style={{ fontSize: '1.9rem' }}>
            {cur} {analytics.totalSpent.toLocaleString()}
          </div>
          <div className="summary-box-meta">
            <span>In selected date range</span>
          </div>
        </div>

        {/* Metric 2: Average Amount spent in given date range */}
        <div
          className="summary-box box-secondary"
          style={{
            borderColor: 'rgba(64, 93, 230, 0.3)',
          }}
        >
          <div className="summary-box-header">
            <span className="summary-box-label">
              <Calculator size={16} color="#405de6" />
              <span>2) Average Amount Spent</span>
            </span>
          </div>
          <div className="summary-box-amount" style={{ fontSize: '1.9rem', color: '#93c5fd' }}>
            {cur} {analytics.averageSpent.toLocaleString()}
          </div>
          <div className="summary-box-meta">
            <span>Total Spent / Number of times</span>
          </div>
        </div>

        {/* Metric 3: Total Transactions Count */}
        <div
          className="summary-box"
          style={{
            borderColor: 'rgba(16, 185, 129, 0.3)',
          }}
        >
          <div className="summary-box-header">
            <span className="summary-box-label">
              <Receipt size={16} color="#10b981" />
              <span>Times Logged</span>
            </span>
          </div>
          <div className="summary-box-amount" style={{ fontSize: '1.9rem', color: '#6ee7b7' }}>
            {analytics.transactionCount} times
          </div>
          <div className="summary-box-meta">
            <span>Transactions tagged #{tagName}</span>
          </div>
        </div>
      </div>

      {/* Metric 3: The bar and line chart of time and amount row and columns view */}
      <div style={{ marginBottom: '2rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={18} color="#e1306c" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
              Time & Amount Visualizations
            </h3>
          </div>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            Showing {dates.length} active spend dates
          </span>
        </div>

        {/* Charts Container - Row or Column View */}
        <div
          className="tag-charts-grid-wrapper"
          style={{
            gridTemplateColumns: layoutMode === 'row' ? '1fr 1fr' : '1fr',
          }}
        >
          {/* Bar Chart Box */}
          <div
            className="card"
            style={{
              background: 'var(--budget-card-bg)',
              border: '1px solid var(--budget-card-border)',
              borderRadius: '20px',
              padding: '1.25rem',
              backdropFilter: 'blur(12px)',
              marginBottom: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f1f5f9', margin: 0 }}>
                Bar Chart: Amount by Date
              </h4>
              <span style={{ fontSize: '0.75rem', color: '#fda4af', fontWeight: 600 }}>Daily Spending</span>
            </div>
            {status === 'loading' ? (
              <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                <RefreshCw size={24} className="spin" />
              </div>
            ) : (
              <ReactECharts
                option={barChartOption}
                style={{ height: '300px', width: '100%' }}
                notMerge={true}
                lazyUpdate={true}
              />
            )}
          </div>

          {/* Line Chart Box */}
          <div
            className="card"
            style={{
              background: 'var(--budget-card-bg)',
              border: '1px solid var(--budget-card-border)',
              borderRadius: '20px',
              padding: '1.25rem',
              backdropFilter: 'blur(12px)',
              marginBottom: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f1f5f9', margin: 0 }}>
                Line Chart: Spending Progression
              </h4>
              <span style={{ fontSize: '0.75rem', color: '#6ee7b7', fontWeight: 600 }}>Daily Trend</span>
            </div>
            {status === 'loading' ? (
              <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                <RefreshCw size={24} className="spin" />
              </div>
            ) : (
              <ReactECharts
                option={lineChartOption}
                style={{ height: '300px', width: '100%' }}
                notMerge={true}
                lazyUpdate={true}
              />
            )}
          </div>
        </div>
      </div>

      {/* Transactions List for this Tag */}
      <div className="tags-section">
        <div className="tags-section-header">
          <div className="tags-section-title">
            <Receipt size={18} color="#e1306c" />
            <span>Recent Transactions for #{tagName}</span>
            <span
              style={{
                fontSize: '0.75rem',
                color: '#94a3b8',
                background: 'rgba(255, 255, 255, 0.08)',
                padding: '2px 8px',
                borderRadius: '9999px',
              }}
            >
              {transactions.length}
            </span>
          </div>
        </div>

        {transactions.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: '#64748b', fontSize: '0.85rem' }}>
            No transactions found for #{tagName} within this date range.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {transactions.map((tx) => (
              <div
                key={tx._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1.25rem',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fda4af' }}>
                      {cur} {tx.amount.toLocaleString()}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                      • {new Date(tx.time).toLocaleDateString()} {new Date(tx.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {tx.description && (
                    <p style={{ margin: 0, fontSize: '0.82rem', color: '#cbd5e1' }}>
                      {tx.description}
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                  {tx.tags.map((t) => (
                    <span
                      key={t}
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: t === tagName ? '#ffffff' : '#94a3b8',
                        background: t === tagName ? 'var(--ig-gradient)' : 'rgba(255, 255, 255, 0.06)',
                        padding: '2px 8px',
                        borderRadius: '9999px',
                      }}
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <BudgetMobileNav />
    </div>
  );
};

export default TagAnalysisPage;
