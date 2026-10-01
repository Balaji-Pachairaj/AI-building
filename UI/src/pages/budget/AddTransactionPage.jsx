import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
  Search,
  Sparkles,
} from 'lucide-react';
import {
  logTransaction,
  fetchTags,
  createTag,
  resetTransactionCreateStatus,
} from '../../features/budget/budgetSlice';
import BudgetMobileNav from '../../components/budget/BudgetMobileNav';
import '../../styles/budgetPadmanabhan.css';

// Helper to format Date into local datetime-local string (YYYY-MM-DDTHH:mm)
const formatToLocalDateTime = (date) => {
  const pad = (n) => String(n).padStart(2, '0');
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  return `${y}-${m}-${d}T${hh}:${mm}`;
};

const AddTransactionPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { tagsList, transactionCreate, currency } = useSelector((state) => state.budget);
  const cur = currency || '₹';

  // Form states
  const [amount, setAmount] = useState('');
  const [transactionTime, setTransactionTime] = useState(formatToLocalDateTime(new Date()));
  const [selectedTags, setSelectedTags] = useState([]);
  const [description, setDescription] = useState('');

  // Tags search & selection state
  const [tagSearch, setTagSearch] = useState('');
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch all tags on mount
  useEffect(() => {
    dispatch(fetchTags());
    dispatch(resetTransactionCreateStatus());
  }, [dispatch]);

  // Helper buttons to adjust time backwards
  const shiftTimeBackward = (minutes) => {
    const current = new Date(transactionTime || new Date());
    current.setMinutes(current.getMinutes() - minutes);
    setTransactionTime(formatToLocalDateTime(current));
  };

  const resetTimeToNow = () => {
    setTransactionTime(formatToLocalDateTime(new Date()));
  };

  // Quick amount helper
  const addAmount = (val) => {
    const currentVal = Number(amount) || 0;
    setAmount(String(currentVal + val));
  };

  // Handle tag selection / toggle
  const toggleTag = (tagName) => {
    const normalized = tagName.toLowerCase();
    if (selectedTags.includes(normalized)) {
      setSelectedTags(selectedTags.filter((t) => t !== normalized));
    } else {
      setSelectedTags([...selectedTags, normalized]);
    }
  };

  // Quick inline tag creation if search not found
  const handleCreateNewTagInline = async (e) => {
    e.preventDefault();
    if (!tagSearch.trim()) return;
    const normalized = tagSearch.trim().toLowerCase();
    if (!selectedTags.includes(normalized)) {
      setSelectedTags([...selectedTags, normalized]);
    }
    // Also save in tag database
    await dispatch(createTag({ name: normalized }));
    setTagSearch('');
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccessMessage('');

    const parsedAmount = Number(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setFormError('Please enter a valid transaction amount greater than 0.');
      return;
    }

    if (!transactionTime) {
      setFormError('Please select a valid transaction time.');
      return;
    }

    if (selectedTags.length === 0) {
      setFormError('Please select at least one tag for this transaction.');
      return;
    }

    const payload = {
      amount: parsedAmount,
      time: new Date(transactionTime).toISOString(),
      tags: selectedTags,
      description: description.trim(),
    };

    try {
      const resultAction = await dispatch(logTransaction(payload));
      if (logTransaction.fulfilled.match(resultAction)) {
        setSuccessMessage('Transaction logged successfully!');
        setTimeout(() => {
          navigate('/budget_padmanabhan');
        }, 1200);
      } else {
        setFormError(resultAction.payload || 'Failed to save transaction.');
      }
    } catch (err) {
      setFormError(err.message || 'An unexpected error occurred.');
    }
  };

  const allAvailableTags = tagsList.items || [];
  const filteredTags = allAvailableTags.filter((tag) =>
    tag.name.toLowerCase().includes(tagSearch.toLowerCase().trim())
  );

  return (
    <div className="budget-app">
      {/* Back button header */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button
          onClick={() => navigate('/budget_padmanabhan')}
          className="ig-outline-btn"
          style={{ padding: '0.45rem 0.9rem' }}
        >
          <ArrowLeft size={16} />
          <span>Dashboard</span>
        </button>
        <span style={{ color: '#64748b' }}>/</span>
        <span style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 600 }}>
          New Spend Entry
        </span>
      </div>

      <div className="form-card">
        {/* Form Title */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'var(--ig-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 0.75rem',
              boxShadow: '0 4px 15px rgba(225, 48, 108, 0.4)',
            }}
          >
            <Sparkles size={28} color="#ffffff" />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>
            Log <span className="ig-gradient-text">Spend</span>
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            Record money spent with amount, time & multiple tags
          </p>
        </div>

        {/* Error / Success Alerts */}
        {formError && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
              padding: '0.75rem 1rem',
              borderRadius: '12px',
              marginBottom: '1.5rem',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <AlertCircle size={16} color="#ef4444" />
            <span>{formError}</span>
          </div>
        )}

        {successMessage && (
          <div
            style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#6ee7b7',
              padding: '0.75rem 1rem',
              borderRadius: '12px',
              marginBottom: '1.5rem',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <CheckCircle2 size={16} color="#10b981" />
            <span>{successMessage} Redirecting to dashboard...</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* FIELD 1: Transaction Amount */}
          <div className="form-group-custom">
            <label className="form-label-custom">
              1) Transaction Amount (Amount I spend) *
            </label>
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  left: '1.25rem',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: '#e1306c',
                }}
              >
                {cur}
              </span>
              <input
                type="number"
                inputMode="decimal"
                step="any"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{
                  width: '100%',
                  padding: '1rem 1rem 1rem 3rem',
                  fontSize: '1.6rem',
                  fontWeight: 800,
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1.5px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '16px',
                  color: '#ffffff',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#e1306c')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)')}
                autoFocus
              />
            </div>

            {/* Quick Amount Helper Chips */}
            <div className="quick-amounts-bar">
              <span style={{ fontSize: '0.75rem', color: '#64748b', alignSelf: 'center' }}>
                Quick add:
              </span>
              {[50, 100, 200, 500, 1000, 2000].map((val) => (
                <button
                  type="button"
                  key={val}
                  onClick={() => addAmount(val)}
                  className="quick-amount-chip"
                >
                  +{cur}{val}
                </button>
              ))}
            </div>
          </div>

          {/* FIELD 2: Time with Helper Buttons (-10m, -30m, -1h) */}
          <div className="form-group-custom">
            <label className="form-label-custom">
              2) Time (When did I spend?) *
            </label>

            {/* Helper Buttons Above Field */}
            <div className="time-helpers-bar">
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginRight: '0.25rem' }}>
                Helper options:
              </span>
              <button
                type="button"
                onClick={() => shiftTimeBackward(10)}
                className="time-helper-btn"
                title="Shift time backward by 10 minutes"
              >
                <Clock size={12} />
                <span>-10 mins</span>
              </button>
              <button
                type="button"
                onClick={() => shiftTimeBackward(30)}
                className="time-helper-btn"
                title="Shift time backward by 30 minutes"
              >
                <Clock size={12} />
                <span>-30 mins</span>
              </button>
              <button
                type="button"
                onClick={() => shiftTimeBackward(60)}
                className="time-helper-btn"
                title="Shift time backward by 1 hour"
              >
                <Clock size={12} />
                <span>-1 hour</span>
              </button>
              <button
                type="button"
                onClick={resetTimeToNow}
                className="time-helper-btn"
                style={{ marginLeft: 'auto', background: 'rgba(225, 48, 108, 0.1)', color: '#fda4af' }}
              >
                Now
              </button>
            </div>

            {/* DateTime Input */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1.5px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '14px',
                padding: '0.75rem 1rem',
              }}
            >
              <Calendar size={18} color="#e1306c" />
              <input
                type="datetime-local"
                value={transactionTime}
                onChange={(e) => setTransactionTime(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  width: '100%',
                  outline: 'none',
                  colorScheme: 'dark',
                }}
              />
            </div>
            <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem', display: 'block' }}>
              Default selected as current date and time. Click buttons above to shift backward.
            </span>
          </div>

          {/* FIELD 3: Multi-Select and Searchable Tags */}
          <div className="form-group-custom">
            <label className="form-label-custom">
              3) Tags (Multi-select and searchable) *
            </label>

            <div className="tags-selector-box">
              {/* Selected Tags Display */}
              <div className="tags-selected-chips">
                {selectedTags.length === 0 ? (
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    No tags selected yet. Pick or search from below.
                  </span>
                ) : (
                  selectedTags.map((t) => (
                    <span key={t} className="selected-tag-chip">
                      <span>#{t}</span>
                      <button
                        type="button"
                        onClick={() => toggleTag(t)}
                        title="Remove tag"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))
                )}
              </div>

              {/* Tag Search Input */}
              <div style={{ position: 'relative' }}>
                <Search
                  size={15}
                  color="#64748b"
                  style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type="text"
                  placeholder="Search tags or type to add new..."
                  value={tagSearch}
                  onChange={(e) => setTagSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleCreateNewTagInline(e);
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.75rem 0.6rem 2.25rem',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Tags Options List (Scrollable) */}
              <div className="tag-options-scroll">
                {filteredTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag.name.toLowerCase());
                  return (
                    <button
                      type="button"
                      key={tag._id || tag.name}
                      onClick={() => toggleTag(tag.name)}
                      className={`tag-option-item ${isSelected ? 'selected' : ''}`}
                    >
                      <span
                        className="tag-color-dot"
                        style={{ background: tag.color || '#e1306c' }}
                      />
                      <span>#{tag.name}</span>
                      {isSelected ? <X size={12} /> : <Plus size={12} />}
                    </button>
                  );
                })}

                {/* If searched tag doesn't exist, show quick add option */}
                {tagSearch.trim() &&
                  !allAvailableTags.some(
                    (t) => t.name.toLowerCase() === tagSearch.trim().toLowerCase()
                  ) && (
                    <button
                      type="button"
                      onClick={handleCreateNewTagInline}
                      className="tag-option-item"
                      style={{
                        background: 'rgba(225, 48, 108, 0.15)',
                        borderColor: '#e1306c',
                        color: '#fda4af',
                      }}
                    >
                      <Plus size={12} />
                      <span>Create tag "#{tagSearch.trim().toLowerCase()}"</span>
                    </button>
                  )}
              </div>
            </div>
          </div>

          {/* Optional Note / Description */}
          <div className="form-group-custom">
            <label className="form-label-custom">
              Note / Description (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Swiggy biryani dinner with friends"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                fontSize: '0.9rem',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1.5px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '12px',
                color: '#ffffff',
                outline: 'none',
              }}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={transactionCreate.status === 'loading'}
            className="ig-gradient-btn"
            style={{
              width: '100%',
              padding: '1rem',
              fontSize: '1.05rem',
              borderRadius: '16px',
              marginTop: '0.5rem',
            }}
          >
            {transactionCreate.status === 'loading' ? (
              <span>Saving Transaction...</span>
            ) : (
              <>
                <CheckCircle2 size={20} />
                <span>Save Spend Transaction</span>
              </>
            )}
          </button>
        </form>
      </div>
      <BudgetMobileNav />
    </div>
  );
};

export default AddTransactionPage;
