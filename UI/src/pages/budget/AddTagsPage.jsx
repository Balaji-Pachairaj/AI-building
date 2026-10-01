import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ArrowLeft,
  Tag as TagIcon,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Search,
  Sparkles,
} from 'lucide-react';
import {
  createTag,
  fetchTags,
  deleteTag,
  resetTagCreateStatus,
} from '../../features/budget/budgetSlice';
import BudgetMobileNav from '../../components/budget/BudgetMobileNav';
import '../../styles/budgetPadmanabhan.css';

const INSTAGRAM_COLORS = [
  '#e1306c', // Classic IG pink
  '#833ab4', // IG purple
  '#fd1d1d', // IG red-orange
  '#fcb045', // IG golden yellow
  '#405de6', // IG royal blue
  '#10b981', // Emerald green
  '#06b6d4', // Cyan
  '#f59e0b', // Amber
  '#a855f7', // Purple
  '#ec4899', // Hot pink
];

const AddTagsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { tagsList, tagCreate } = useSelector((state) => state.budget);

  const [tagName, setTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState(INSTAGRAM_COLORS[0]);
  const [tagDescription, setTagDescription] = useState('');
  const [tagSearch, setTagSearch] = useState('');

  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    dispatch(fetchTags());
    dispatch(resetTagCreateStatus());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccessMessage('');

    if (!tagName.trim()) {
      setFormError('Please enter a tag name.');
      return;
    }

    const normalized = tagName.trim().toLowerCase();

    // Check if tag already exists locally
    if (tagsList.items.some((t) => t.name.toLowerCase() === normalized)) {
      setFormError(`Tag "#${normalized}" already exists! Tags are case-insensitive and unique.`);
      return;
    }

    try {
      const resultAction = await dispatch(
        createTag({
          name: normalized,
          color: selectedColor,
          description: tagDescription.trim(),
        })
      );

      if (createTag.fulfilled.match(resultAction)) {
        setSuccessMessage(`Tag "#${normalized}" added successfully!`);
        setTagName('');
        setTagDescription('');
        dispatch(fetchTags());
      } else {
        setFormError(resultAction.payload || 'Failed to create tag.');
      }
    } catch (err) {
      setFormError(err.message || 'An unexpected error occurred.');
    }
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete tag "#${name}"?`)) {
      dispatch(deleteTag(id));
    }
  };

  const filteredTags = (tagsList.items || []).filter((t) =>
    t.name.toLowerCase().includes(tagSearch.toLowerCase().trim())
  );

  return (
    <div className="budget-app">
      {/* Navigation Header */}
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
          Manage Category Tags
        </span>
      </div>

      <div className="add-tags-grid-layout">
        {/* Left: Add New Tag Form */}
        <div className="form-card" style={{ margin: 0, height: 'fit-content' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: 'var(--ig-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 0.75rem',
              }}
            >
              <TagIcon size={24} color="#ffffff" />
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>
              Add New <span className="ig-gradient-text">Tag</span>
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '0.2rem' }}>
              Tags are stored in lowercase and are strictly unique
            </p>
          </div>

          {/* Alert messages */}
          {formError && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#fca5a5',
                padding: '0.75rem',
                borderRadius: '12px',
                marginBottom: '1rem',
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <AlertCircle size={15} color="#ef4444" />
              <span>{formError}</span>
            </div>
          )}

          {successMessage && (
            <div
              style={{
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#6ee7b7',
                padding: '0.75rem',
                borderRadius: '12px',
                marginBottom: '1rem',
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <CheckCircle2 size={15} color="#10b981" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Tag Name Input */}
            <div className="form-group-custom">
              <label className="form-label-custom">Tag Name *</label>
              <div style={{ position: 'relative' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#e1306c',
                    fontWeight: 700,
                  }}
                >
                  #
                </span>
                <input
                  type="text"
                  placeholder="e.g. groceries, coffee, rent"
                  value={tagName}
                  onChange={(e) => setTagName(e.target.value.toLowerCase())}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.2rem',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1.5px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '12px',
                    color: '#ffffff',
                    outline: 'none',
                  }}
                  autoFocus
                />
              </div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem', display: 'block' }}>
                Stored automatically in lowercase (case-insensitive)
              </span>
            </div>

            {/* Tag Color Picker */}
            <div className="form-group-custom">
              <label className="form-label-custom">Accent Color</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {INSTAGRAM_COLORS.map((c) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: c,
                      border: selectedColor === c ? '2.5px solid #ffffff' : 'none',
                      cursor: 'pointer',
                      transform: selectedColor === c ? 'scale(1.15)' : 'scale(1)',
                      transition: 'all 0.15s ease',
                      boxShadow: selectedColor === c ? `0 0 10px ${c}` : 'none',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Tag Description */}
            <div className="form-group-custom">
              <label className="form-label-custom">Description (Optional)</label>
              <input
                type="text"
                placeholder="What is this tag for?"
                value={tagDescription}
                onChange={(e) => setTagDescription(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  fontSize: '0.85rem',
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
              disabled={tagCreate.status === 'loading'}
              className="ig-gradient-btn"
              style={{ width: '100%', padding: '0.85rem', borderRadius: '12px' }}
            >
              <PlusCircle size={16} />
              <span>{tagCreate.status === 'loading' ? 'Saving Tag...' : 'Create Tag'}</span>
            </button>
          </form>
        </div>

        {/* Right: Existing Tags Directory */}
        <div className="tags-section" style={{ height: 'fit-content' }}>
          <div className="tags-section-header" style={{ marginBottom: '1rem' }}>
            <div className="tags-section-title">
              <Sparkles size={18} color="#e1306c" />
              <span>Available Tags</span>
              <span
                style={{
                  fontSize: '0.75rem',
                  color: '#94a3b8',
                  background: 'rgba(255, 255, 255, 0.08)',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                }}
              >
                {filteredTags.length}
              </span>
            </div>

            {/* Search */}
            <div style={{ position: 'relative' }}>
              <Search
                size={14}
                color="#64748b"
                style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="text"
                placeholder="Search..."
                value={tagSearch}
                onChange={(e) => setTagSearch(e.target.value)}
                style={{
                  padding: '0.35rem 0.75rem 0.35rem 2rem',
                  borderRadius: '9999px',
                  background: 'rgba(15, 23, 42, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#f8fafc',
                  fontSize: '0.8rem',
                  outline: 'none',
                  width: '140px',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '520px', overflowY: 'auto' }}>
            {filteredTags.map((tag) => (
              <div
                key={tag._id || tag.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: tag.color || '#e1306c',
                    }}
                  />
                  <div>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f1f5f9' }}>
                      #{tag.name}
                    </span>
                    {tag.description && (
                      <p style={{ margin: '0.1rem 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                        {tag.description}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(tag._id, tag.name)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '6px',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
                  title={`Delete #${tag.name}`}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}

            {filteredTags.length === 0 && (
              <p style={{ textAlign: 'center', padding: '2rem', color: '#64748b', fontSize: '0.85rem' }}>
                No tags found. Add one on the left!
              </p>
            )}
          </div>
        </div>
      </div>
      <BudgetMobileNav />
    </div>
  );
};

export default AddTagsPage;
