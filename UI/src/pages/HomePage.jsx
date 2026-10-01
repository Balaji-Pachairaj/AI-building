import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Server,
  ArrowRight,
  Search,
  ExternalLink,
  Layers,
  Sparkles,
  PlusCircle,
  Wallet,
} from 'lucide-react';

const APPLICATIONS = [
  {
    id: 'budget-padmanabhan',
    name: 'Budget Padmanabhan',
    category: 'Finance & Money Management',
    tag: 'v1.0.0',
    status: 'Active',
    icon: <Wallet size={24} color="#e1306c" />,
    iconBg: 'linear-gradient(135deg, rgba(225, 48, 108, 0.2), rgba(64, 93, 230, 0.2))',
    description:
      'Manage personal money spent with multi-tag categorization, date range expense tracking, and interactive ECharts spending analytics.',
    dashboardRoute: '/budget_padmanabhan',
  },
  {
    id: 'next-token-prediction',
    name: 'Next Token Prediction',
    category: 'AI & Language Models',
    tag: 'v1.0.0',
    status: 'Active',
    icon: <Sparkles size={24} color="#6366f1" />,
    iconBg: 'rgba(99, 102, 241, 0.15)',
    description:
      'Explore next-word prediction with interactive probability distributions, step-by-step token generation, model cost comparison, and MongoDB history.',
    dashboardRoute: '/next_token',
  },
  {
    id: 'express-mongodb-boilerplate',
    name: 'Express & MongoDB Boilerplate',
    category: 'Backend & Infrastructure',
    tag: 'v1.0.0',
    status: 'Ready',
    icon: <Server size={24} color="#10b981" />,
    iconBg: 'rgba(16, 185, 129, 0.12)',
    description:
      'Core API suite with MongoDB Mongoose ORM, Building Stuffs module, Hit Logging engine, and health diagnostics.',
    dashboardRoute: '/boilerplate',
  },
];

const HomePage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredApps = APPLICATIONS.filter(
    (app) =>
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', padding: '1rem 0 3rem' }}>
      {/* Clean Portal Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
          <Sparkles size={20} color="var(--accent-primary)" />
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Application Portal
          </span>
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
          Applications
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
          Select an application below to open its dashboard.
        </p>
      </div>

      {/* Search Filter for Multiple Applications */}
      <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
        <Search
          size={18}
          color="var(--text-muted)"
          style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }}
        />
        <input
          type="text"
          className="form-input"
          placeholder="Search applications..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            paddingLeft: '2.75rem',
            paddingTop: '0.75rem',
            paddingBottom: '0.75rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-secondary)',
            borderColor: 'var(--border-color)',
            fontSize: '0.9rem',
          }}
        />
      </div>

      {/* Applications List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredApps.map((app) => (
          <div
            key={app.id}
            onClick={() => navigate(app.dashboardRoute)}
            className="card"
            style={{
              marginBottom: 0,
              padding: '1.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1.5rem',
              transition: 'all 0.2s ease',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-card)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent-primary)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-color)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {/* Left: App Icon & Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flex: 1 }}>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: 'var(--radius-md)',
                  background: app.iconBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {app.icon}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {app.name}
                  </h3>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      color: 'var(--text-muted)',
                      background: 'var(--bg-secondary)',
                      padding: '2px 6px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    {app.tag}
                  </span>
                  <span className="badge badge-success" style={{ fontSize: '0.7rem', padding: '1px 7px' }}>
                    {app.status}
                  </span>
                </div>

                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.5', maxWidth: '580px' }}>
                  {app.description}
                </p>

                <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>{app.category}</span>
                </div>
              </div>
            </div>

            {/* Right: Launch Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(app.dashboardRoute);
              }}
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                whiteSpace: 'nowrap',
                padding: '0.65rem 1.2rem',
                fontSize: '0.85rem',
              }}
            >
              <span>Open Dashboard</span>
              <ArrowRight size={15} />
            </button>
          </div>
        ))}

        {filteredApps.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <p>No applications match "{searchQuery}"</p>
          </div>
        )}

        {/* Future Applications Placeholder Card */}
        <div
          style={{
            border: '2px dashed var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.75rem',
            textAlign: 'center',
            background: 'rgba(30, 41, 59, 0.25)',
          }}
        >
          <PlusCircle size={26} color="var(--text-muted)" style={{ margin: '0 auto 0.5rem' }} />
          <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>
            Future Applications
          </h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto' }}>
            New applications added to the workspace will appear in this list to easily route between dashboards.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
