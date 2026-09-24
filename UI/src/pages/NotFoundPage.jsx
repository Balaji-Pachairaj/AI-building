import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Home } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
      <AlertCircle size={56} color="var(--accent-warning)" style={{ marginBottom: '1rem' }} />
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>404 - Page Not Found</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
        The route you are trying to visit does not exist.
      </p>
      <Link to="/" className="btn btn-primary">
        <Home size={16} />
        Back to Health Check
      </Link>
    </div>
  );
};

export default NotFoundPage;
