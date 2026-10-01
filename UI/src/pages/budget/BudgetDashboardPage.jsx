import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Wallet,
  TrendingDown,
  Calendar,
  PlusCircle,
  Tag as TagIcon,
  Receipt,
  Search,
  ArrowRight,
  Calculator,
  RefreshCw,
} from 'lucide-react';
import {
  fetchDashboardSummary,
  setDateRange,
} from '../../features/budget/budgetSlice';
import BudgetMobileNav from '../../components/budget/BudgetMobileNav';
import '../../styles/budgetPadmanabhan.css';

const BudgetDashboardPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { dateRange, dashboard, currency } = useSelector((state) => state.budget);
  const { data, status, error } = dashboard;

  const [tagSearch, setTagSearch] = useState('');
  const [sortBy, setSortBy] = useState('spent-desc'); // 'spent-desc' | 'name-asc' | 'count-desc'

  // Fetch dashboard summary when dateRange changes
  useEffect(() => {
    dispatch(
      fetchDashboardSummary({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      })
    );
  }, [dispatch, dateRange.startDate, dateRange.endDate]);

  // Handle Preset Date Filters
  const handlePreset = (preset) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    let start = '';
    let end = `${year}-${month}-${day}`;

    if (preset === 'this-month') {
      start = `${year}-${month}-01`;
    } else if (preset === 'last-7') {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      start = d.toISOString().split('T')[0];
    } else if (preset === 'last-30') {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      start = d.toISOString().split('T')[0];
    } else if (preset === 'all-time') {
      start = '2020-01-01';
    }

    dispatch(setDateRange({ startDate: start, endDate: end }));
  };

  const overview = data?.budgetOverview || {
    totalSpent: 0,
    totalTransactions: 0,
    averageSpent: 0,
    currency: currency || '₹',
  };

  const cur = overview.currency || currency || '₹';
  const totalSpent = overview.totalSpent || 0;
  const totalTransactions = overview.totalTransactions || 0;
  const averageSpent =
    overview.averageSpent || (totalTransactions > 0 ? Math.round(totalSpent / totalTransactions) : 0);

  // Filter and sort tags
  const tagsList = (data?.tagsSummary || []).filter((tag) =>
    tag.name.toLowerCase().includes(tagSearch.toLowerCase().trim())
  );

  tagsList.sort((a, b) => {
    if (sortBy === 'spent-desc') return b.totalSpent - a.totalSpent;
    if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
    if (sortBy === 'count-desc') return b.transactionCount - a.transactionCount;
    return 0;
  });

  return (
    <div className="budget-app">
      {/* Top Header */}
      <div className="budget-header">
        <div className="budget-title-group">
          <div className="budget-avatar-ring">
            <div className="budget-avatar-inner">
              <Wallet size={26} color="#e1306c" />
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>
                Budget <span className="ig-gradient-text">Padmanabhan</span>
              </h1>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  background: 'rgba(225, 48, 108, 0.15)',
                  color: '#e1306c',
                  border: '1px solid rgba(225, 48, 108, 0.3)',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                }}
              >
                SPEND TRACKER
              </span>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0.2rem 0 0' }}>
              Manage money spent & tag-based expense analytics
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="budget-header-actions">
          <button
            onClick={() => navigate('/budget_padmanabhan/transactions')}
            className="ig-outline-btn"
          >
            <Receipt size={16} />
            <span>View Transactions</span>
          </button>

          <button
            onClick={() => navigate('/budget_padmanabhan/add-transaction')}
            className="ig-gradient-btn"
          >
            <PlusCircle size={18} />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Date Range Filter Bar */}
      <div className="budget-filter-bar">
        <div className="date-pickers-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', fontSize: '0.85rem' }}>
            <Calendar size={16} color="#e1306c" />
            <span style={{ fontWeight: 600 }}>Filter Dates:</span>
          </div>

          <div className="date-input-wrapper">
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>From:</span>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) =>
                dispatch(setDateRange({ startDate: e.target.value, endDate: dateRange.endDate }))
              }
            />
          </div>

          <div className="date-input-wrapper">
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>To:</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) =>
                dispatch(setDateRange({ startDate: dateRange.startDate, endDate: e.target.value }))
              }
            />
          </div>
        </div>

        {/* Quick Date Presets */}
        <div className="date-presets-group">
          <button
            className="preset-chip"
            onClick={() => handlePreset('this-month')}
          >
            This Month
          </button>
          <button
            className="preset-chip"
            onClick={() => handlePreset('last-7')}
          >
            Last 7 Days
          </button>
          <button
            className="preset-chip"
            onClick={() => handlePreset('last-30')}
          >
            Last 30 Days
          </button>
          <button
            className="preset-chip"
            onClick={() => handlePreset('all-time')}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Two Big Boxes Side-by-Side on Top (Focused on Money Spent) */}
      <div className="budget-summary-grid">
        {/* Box 1: Money Spent */}
        <div className="summary-box box-spent">
          <div className="summary-box-header">
            <span className="summary-box-label">
              <TrendingDown size={17} color="#f43f5e" />
              <span>Money Spent</span>
            </span>
            <span
              style={{
                fontSize: '0.75rem',
                color: '#cbd5e1',
                background: 'rgba(244, 63, 94, 0.15)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                padding: '2px 8px',
                borderRadius: '9999px',
                fontWeight: 600,
              }}
            >
              {totalTransactions} transactions
            </span>
          </div>

          <div className="summary-box-amount">
            {cur} {totalSpent.toLocaleString()}
          </div>

          <div className="summary-box-meta">
            <span>
              Total money spent from{' '}
              <strong style={{ color: '#f1f5f9' }}>{dateRange.startDate}</strong> to{' '}
              <strong style={{ color: '#f1f5f9' }}>{dateRange.endDate}</strong>
            </span>
          </div>
        </div>

        {/* Box 2: Average Spent per Transaction */}
        <div className="summary-box box-secondary">
          <div className="summary-box-header">
            <span className="summary-box-label">
              <Calculator size={17} color="#405de6" />
              <span>Average Spend / Transaction</span>
            </span>
            <span
              style={{
                fontSize: '0.75rem',
                color: '#93c5fd',
                background: 'rgba(64, 93, 230, 0.15)',
                border: '1px solid rgba(64, 93, 230, 0.3)',
                padding: '2px 8px',
                borderRadius: '9999px',
                fontWeight: 600,
              }}
            >
              {totalTransactions > 0 ? `${totalTransactions} logs` : 'No logs'}
            </span>
          </div>

          <div className="summary-box-amount">
            {cur} {averageSpent.toLocaleString()}
          </div>

          <div className="summary-box-meta">
            <span>
              Average cost per transaction in selected date range
            </span>
          </div>
        </div>
      </div>

      {/* Below Two Boxes: List of Tags with Individual Spending */}
      <div className="tags-section">
        <div className="tags-section-header">
          <div className="tags-section-title">
            <TagIcon size={20} color="#e1306c" />
            <span>Spending by Tags</span>
            <span
              style={{
                fontSize: '0.75rem',
                color: '#94a3b8',
                background: 'rgba(255, 255, 255, 0.07)',
                padding: '2px 8px',
                borderRadius: '9999px',
                fontWeight: 500,
              }}
            >
              {tagsList.length} tags
            </span>
          </div>

          {/* Above Table: Add Tags List button + Search & Sort */}
          <div className="tags-section-actions">
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <Search
                size={14}
                color="#64748b"
                style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="text"
                placeholder="Search tags..."
                value={tagSearch}
                onChange={(e) => setTagSearch(e.target.value)}
                style={{
                  padding: '0.4rem 0.75rem 0.4rem 2rem',
                  borderRadius: '9999px',
                  background: 'rgba(15, 23, 42, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#f8fafc',
                  fontSize: '0.82rem',
                  outline: 'none',
                  width: '160px',
                }}
              />
            </div>

            {/* Sort Selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '0.4rem 0.75rem',
                borderRadius: '9999px',
                background: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#f8fafc',
                fontSize: '0.82rem',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="spent-desc">Sort: Spent (High to Low)</option>
              <option value="name-asc">Sort: Name (A to Z)</option>
              <option value="count-desc">Sort: Transaction Count</option>
            </select>

            {/* Add Tags List Button */}
            <button
              onClick={() => navigate('/budget_padmanabhan/add-tags')}
              className="ig-outline-btn"
              style={{ padding: '0.45rem 1rem', fontSize: '0.82rem' }}
            >
              <TagIcon size={14} color="#e1306c" />
              <span>Add Tags</span>
            </button>
          </div>
        </div>

        {/* Tags List */}
        {status === 'loading' && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
            <RefreshCw size={24} className="spin" style={{ margin: '0 auto 0.5rem' }} />
            <p>Loading tags analytics...</p>
          </div>
        )}

        {status !== 'loading' && tagsList.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
            <TagIcon size={36} color="#334155" style={{ margin: '0 auto 0.75rem' }} />
            <p style={{ fontSize: '0.95rem', color: '#cbd5e1', fontWeight: 600 }}>No tags found</p>
            <p style={{ fontSize: '0.82rem', marginTop: '0.25rem' }}>
              Create your first tag or clear your search to get started.
            </p>
            <button
              onClick={() => navigate('/budget_padmanabhan/add-tags')}
              className="ig-gradient-btn"
              style={{ marginTop: '1rem', padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
            >
              <PlusCircle size={15} />
              <span>Create New Tag</span>
            </button>
          </div>
        )}

        {status !== 'loading' && tagsList.length > 0 && (
          <div className="tags-list-container">
            {tagsList.map((tag) => (
              <div key={tag._id || tag.name} className="tag-row-card">
                {/* Left: Tag Badge & Metadata */}
                <div className="tag-info-left">
                  <div
                    className="tag-badge-pill"
                    style={{
                      background: `rgba(${tag.color ? parseInt(tag.color.slice(1, 3), 16) : 225}, ${
                        tag.color ? parseInt(tag.color.slice(3, 5), 16) : 48
                      }, ${tag.color ? parseInt(tag.color.slice(5, 7), 16) : 108}, 0.15)`,
                      border: `1px solid ${tag.color || '#e1306c'}40`,
                      color: tag.color || '#e1306c',
                    }}
                  >
                    <span
                      className="tag-color-dot"
                      style={{ background: tag.color || '#e1306c' }}
                    />
                    <span>#{tag.name}</span>
                  </div>

                  <div>
                    <div className="tag-meta-sub">
                      <span>{tag.transactionCount} transactions</span>
                      {tag.percentage > 0 && (
                        <span>• {tag.percentage}% of total spent</span>
                      )}
                    </div>
                    {/* Visual Progress Bar */}
                    <div className="tag-progress-track">
                      <div
                        className="tag-progress-fill"
                        style={{
                          width: `${Math.min(tag.percentage || 0, 100)}%`,
                          background: tag.color || 'var(--ig-gradient)',
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Right: Spent Amount & Analysis Button */}
                <div className="tag-amount-group">
                  <span className="tag-spent-number">
                    {cur} {tag.totalSpent.toLocaleString()}
                  </span>

                  <button
                    onClick={() =>
                      navigate(
                        `/budget_padmanabhan/tags/${encodeURIComponent(tag.name)}/analysis?startDate=${
                          dateRange.startDate
                        }&endDate=${dateRange.endDate}`
                      )
                    }
                    className="btn-analysis"
                    title={`View analytics for #${tag.name}`}
                  >
                    <span>Analysis</span>
                    <ArrowRight size={13} />
                  </button>
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

export default BudgetDashboardPage;
