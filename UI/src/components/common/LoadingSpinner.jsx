import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ size = 20, text = 'Loading...', inline = false }) => {
  if (inline) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
        <Loader2 size={size} style={{ animation: 'spin 1s linear infinite' }} />
        {text && <span style={{ fontSize: '0.85rem' }}>{text}</span>}
      </span>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', gap: '0.75rem', color: 'var(--text-muted)' }}>
      <Loader2 size={size || 32} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent-primary)' }} />
      {text && <p style={{ fontSize: '0.9rem' }}>{text}</p>}
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default LoadingSpinner;
