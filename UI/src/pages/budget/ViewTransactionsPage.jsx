import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ArrowLeft,
  Calendar,
  Receipt,
  TrendingDown,
  Calculator,
  Search,
  Trash2,
  PlusCircle,
  Tag as TagIcon,
} from 'lucide-react';
import {
  fetchTransactions,
  deleteTransaction,
  setDateRange,
} from '../../features/budget/budgetSlice';
import BudgetMobileNav from '../../components/budget/BudgetMobileNav';
import '../../styles/budgetPadmanabhan.css';

const ViewTransactionsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { dateRange, transactions, currency } = useSelector((state) => state.budget);
  const { items, summary, status } = transactions;
  const cur = currency || '₹';

  const [selectedTagFilter, setSelectedTagFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch transactions when dateRange or tag filter changes
  useEffect(() => {
    dispatch(
      fetchTransactions({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        tag: selectedTagFilter || undefined,
      })
    );
  }, [dispatch, dateRange.startDate, dateRange.endDate, selectedTagFilter]);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      dispatch(deleteTransaction(id));
    }
  };

  const totalAmount = summary?.totalAmount || 0;
  const averageAmount = summary?.averageAmount || 0;
  const count = summary?.transactionCount || items.length;

  // Filter transactions locally by search term
  const filteredList = items.filter((tx) => {
    const descMatch = (tx.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const tagMatch = tx.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));
    return descMatch || tagMatch;
  });

  return (
    <div className="budget-app">
      {/* Header */}
      <div className="budget-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => navigate('/budget_padmanabhan')}
            className="ig-outline-btn"
            style={{ padding: '0.45rem 0.85rem' }}
          >
            <ArrowLeft size={16} />
            <span>Dashboard</span>
          </button>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>
              Transaction <span className="ig-gradient-text">Logs</span>
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: '0.2rem 0 0' }}>
              Detailed expense log with date and tag filters
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/budget_padmanabhan/add-transaction')}
          className="ig-gradient-btn"
        >
          <PlusCircle size={16} />
          <span>Add Transaction</span>
        </button>
      </div>

      {/* Date Filter Bar */}
      <div className="budget-filter-bar">
        <div className="date-pickers-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', fontSize: '0.85rem' }}>
            <Calendar size={16} color="#e1306c" />
            <span style={{ fontWeight: 600 }}>Date Range:</span>
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

        {/* Search & Tag Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <Search
              size={14}
              color="#64748b"
              style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              placeholder="Search note or tag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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

          {selectedTagFilter && (
            <button
              onClick={() => setSelectedTagFilter('')}
              className="preset-chip active"
              style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
            >
              Tag: #{selectedTagFilter} ✕
            </button>
          )}
        </div>
      </div>

      {/* Top Stat Cards: Total Amount and Average Amount on View Transaction page top */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        {/* Total Amount Card */}
        <div className="summary-box box-spent">
          <div className="summary-box-header">
            <span className="summary-box-label">
              <TrendingDown size={16} color="#f43f5e" />
              <span>Total Amount Spent</span>
            </span>
          </div>
          <div className="summary-box-amount" style={{ fontSize: '2rem' }}>
            {cur} {totalAmount.toLocaleString()}
          </div>
          <div className="summary-box-meta">
            <span>In selected date range</span>
          </div>
        </div>

        {/* Average Amount Card */}
        <div
          className="summary-box box-secondary"
          style={{ borderColor: 'rgba(64, 93, 230, 0.3)' }}
        >
          <div className="summary-box-header">
            <span className="summary-box-label">
              <Calculator size={16} color="#405de6" />
              <span>Average Amount Spent</span>
            </span>
          </div>
          <div className="summary-box-amount" style={{ fontSize: '2rem', color: '#93c5fd' }}>
            {cur} {averageAmount.toLocaleString()}
          </div>
          <div className="summary-box-meta">
            <span>Per transaction ({count} logged)</span>
          </div>
        </div>
      </div>

      {/* Below that: Add the list */}
      <div className="tags-section">
        <div className="tags-section-header">
          <div className="tags-section-title">
            <Receipt size={18} color="#e1306c" />
            <span>Transaction Logs</span>
            <span
              style={{
                fontSize: '0.75rem',
                color: '#94a3b8',
                background: 'rgba(255, 255, 255, 0.08)',
                padding: '2px 8px',
                borderRadius: '9999px',
              }}
            >
              {filteredList.length} records
            </span>
          </div>
        </div>

        {status === 'loading' && (
          <p style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
            Loading transactions...
          </p>
        )}

        {status !== 'loading' && filteredList.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
            <Receipt size={36} color="#334155" style={{ margin: '0 auto 0.75rem' }} />
            <p style={{ fontSize: '0.95rem', color: '#cbd5e1', fontWeight: 600 }}>No transactions found</p>
            <p style={{ fontSize: '0.82rem', marginTop: '0.25rem' }}>
              Try adjusting the date filter or add your first transaction.
            </p>
            <button
              onClick={() => navigate('/budget_padmanabhan/add-transaction')}
              className="ig-gradient-btn"
              style={{ marginTop: '1rem', padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
            >
              <PlusCircle size={15} />
              <span>Add Transaction</span>
            </button>
          </div>
        )}

        {status !== 'loading' && filteredList.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filteredList.map((tx) => (
              <div
                key={tx._id}
                className="transaction-log-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem 1.25rem',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '14px',
                  flexWrap: 'wrap',
                  gap: '0.85rem',
                  transition: 'all 0.2s',
                }}
              >
                {/* Left: Amount & Details */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: '0', flex: '1 1 200px' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      background: 'rgba(244, 63, 94, 0.12)',
                      border: '1px solid rgba(244, 63, 94, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Receipt size={20} color="#f43f5e" />
                  </div>

                  <div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f1f5f9' }}>
                      {cur} {tx.amount.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                      {new Date(tx.time).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}{' '}
                      at{' '}
                      {new Date(tx.time).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                    {tx.description && (
                      <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: '#cbd5e1' }}>
                        {tx.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Center / Right: Tags Chips */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {tx.tags.map((t) => (
                    <button
                      key={t}
                      onClick={() => setSelectedTagFilter(t)}
                      className="preset-chip"
                      style={{
                        background: 'rgba(225, 48, 108, 0.12)',
                        borderColor: 'rgba(225, 48, 108, 0.25)',
                        color: '#fda4af',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                      title={`Filter by #${t}`}
                    >
                      #{t}
                    </button>
                  ))}
                </div>

                {/* Right: Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleDelete(tx._id)}
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      color: '#f87171',
                      padding: '6px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s',
                    }}
                    title="Delete Transaction"
                  >
                    <Trash2 size={16} />
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

export default ViewTransactionsPage;
