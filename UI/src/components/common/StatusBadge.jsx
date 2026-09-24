import React from 'react';

const StatusBadge = ({ status }) => {
  const norm = String(status || '').toUpperCase();

  if (norm === 'UP' || norm === 'CONNECTED' || norm === 'ACTIVE' || norm === 'READY' || norm === 'SUCCESS') {
    return (
      <span className="badge badge-success">
        <span className="pulse-dot online"></span>
        {status}
      </span>
    );
  }

  if (norm === 'DOWN' || norm === 'FAILED' || norm === 'ERROR' || norm === 'DISCONNECTED') {
    return (
      <span className="badge badge-danger">
        <span className="pulse-dot offline"></span>
        {status}
      </span>
    );
  }

  if (norm === 'LOADING' || norm === 'PENDING' || norm === 'IN PROGRESS') {
    return (
      <span className="badge badge-warning">
        {status}
      </span>
    );
  }

  return <span className="badge badge-info">{status}</span>;
};

export default StatusBadge;
