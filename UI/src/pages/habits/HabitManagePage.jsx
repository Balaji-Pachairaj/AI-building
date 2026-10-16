import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  PlusCircle,
  Edit2,
  Trash2,
  Clock,
  Sparkles,
  Layers,
  Save,
  X,
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
} from 'lucide-react';
import {
  fetchHabits,
  createCustomHabit,
  updateCustomHabit,
  deleteCustomHabit,
} from '../../features/habits/habitsSlice';
import '../../styles/habitTracker.css';

const ICON_OPTIONS = [
  'Brain',
  'Code2',
  'Briefcase',
  'Users',
  'Hammer',
  'Compass',
  'Youtube',
  'Instagram',
  'Facebook',
  'Zap',
  'Tv',
  'CheckCircle',
];

const COLOR_OPTIONS = [
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#ef4444',
  '#f59e0b',
  '#10b981',
  '#14b8a6',
  '#06b6d4',
  '#3b82f6',
  '#1877f2',
  '#e1306c',
];

const HabitManagePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { habits, habitsLoading } = useSelector((state) => state.habits);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabitId, setEditingHabitId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Learning & AI',
    description: '',
    targetMinutes: 45,
    targetDurationText: '45 mins',
    targetQuantityText: '1 session',
    color: '#6366f1',
    icon: 'CheckCircle',
  });

  useEffect(() => {
    dispatch(fetchHabits());
  }, [dispatch]);

  const handleOpenCreate = () => {
    setEditingHabitId(null);
    setFormData({
      title: '',
      category: 'Learning & AI',
      description: '',
      targetMinutes: 45,
      targetDurationText: '45 mins',
      targetQuantityText: '1 session',
      color: '#6366f1',
      icon: 'CheckCircle',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (habit) => {
    setEditingHabitId(habit._id);
    setFormData({
      title: habit.title,
      category: habit.category,
      description: habit.description || '',
      targetMinutes: habit.targetMinutes || 45,
      targetDurationText: habit.targetDurationText || `${habit.targetMinutes || 45} mins`,
      targetQuantityText: habit.targetQuantityText || '1 session',
      color: habit.color || '#6366f1',
      icon: habit.icon || 'CheckCircle',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (editingHabitId) {
      await dispatch(updateCustomHabit({ id: editingHabitId, updates: formData }));
    } else {
      await dispatch(createCustomHabit(formData));
    }
    setIsModalOpen(false);
    dispatch(fetchHabits());
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete the habit "${title}"?`)) {
      await dispatch(deleteCustomHabit(id));
    }
  };

  // Total daily scheduled duration
  const totalMinutesAllHabits = habits.reduce((acc, h) => acc + (h.targetMinutes || 0), 0);
  const totalHoursAllHabits = (totalMinutesAllHabits / 60).toFixed(1);

  return (
    <div className="habit-app-container">
      {/* Top Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate('/habits')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem' }}
        >
          <ArrowLeft size={16} />
          <span>Back to Tracker</span>
        </button>

        <button
          type="button"
          className="btn btn-primary"
          onClick={handleOpenCreate}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem' }}
        >
          <PlusCircle size={16} />
          <span>Add Custom Habit</span>
        </button>
      </div>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
          Configure Habits Protocol
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
          Manage your daily routines, adjust target durations, and review overall scheduled focus time (
          <strong>{totalHoursAllHabits} hours</strong> total awake protocol).
        </p>
      </div>

      {/* Habits List Table */}
      <div className="chart-card">
        <div className="habit-table-container">
          <table className="habit-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Habit Title</th>
                <th>Category</th>
                <th>Target Time</th>
                <th>Target Deliverable</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {habits.map((habit, index) => (
                <tr key={habit._id}>
                  <td>
                    <span
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.08)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        color: 'var(--text-muted)',
                      }}
                    >
                      {index + 1}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span
                        style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          background: habit.color,
                          boxShadow: `0 0 8px ${habit.color}`,
                        }}
                      />
                      <div>
                        <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                          {habit.title}
                        </strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {habit.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-info">{habit.category}</span>
                  </td>
                  <td>
                    <span style={{ color: '#38bdf8', fontWeight: 600 }}>
                      {habit.targetDurationText} ({habit.targetMinutes}m)
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem', color: '#a5b4fc' }}>
                      {habit.targetQuantityText}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => handleOpenEdit(habit)}
                        style={{ padding: '4px 8px' }}
                        title="Edit Habit"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => handleDelete(habit._id, habit.title)}
                        style={{ padding: '4px 8px', color: 'var(--accent-danger)' }}
                        title="Delete Habit"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create / Edit Habit */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '550px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {editingHabitId ? 'Edit Habit' : 'Create Custom Habit'}
              </h2>
              <button
                type="button"
                className="btn-undo-hit"
                onClick={() => setIsModalOpen(false)}
                style={{ padding: '4px' }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Habit Title *
                </label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Deep Learning Paper Review"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Category
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Learning & AI"
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Target Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    className="form-input"
                    min={1}
                    value={formData.targetMinutes}
                    onChange={(e) => {
                      const mins = Number(e.target.value);
                      const hrs = mins >= 60 ? `${(mins / 60).toFixed(1)} hours` : `${mins} mins`;
                      setFormData({
                        ...formData,
                        targetMinutes: mins,
                        targetDurationText: hrs,
                      });
                    }}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Target Deliverable / Quantity Text
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.targetQuantityText}
                  onChange={(e) => setFormData({ ...formData, targetQuantityText: e.target.value })}
                  placeholder="e.g., 1 page analysis or 1 problem solved"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Description
                </label>
                <textarea
                  className="form-input"
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the activity..."
                  style={{ width: '100%' }}
                />
              </div>

              {/* Color picker pills */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  Accent Color
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: c })}
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: c,
                        border: formData.color === c ? '2px solid #fff' : 'none',
                        cursor: 'pointer',
                        transform: formData.color === c ? 'scale(1.15)' : 'scale(1)',
                      }}
                    />
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Save size={15} />
                  <span>{editingHabitId ? 'Save Changes' : 'Create Habit'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HabitManagePage;

