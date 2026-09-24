import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeNotification } from '../../features/notifications/notificationSlice';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const NotificationToast = () => {
  const dispatch = useDispatch();
  const notifications = useSelector((state) => state.notifications.notifications);

  useEffect(() => {
    if (notifications.length > 0) {
      const timer = setTimeout(() => {
        dispatch(removeNotification(notifications[0].id));
      }, notifications[0].duration || 5000);

      return () => clearTimeout(timer);
    }
  }, [notifications, dispatch]);

  if (!notifications.length) return null;

  return (
    <div className="toast-container">
      {notifications.map((n) => {
        const isError = n.type === 'error';
        const isSuccess = n.type === 'success';
        const isWarning = n.type === 'warning';

        return (
          <div
            key={n.id}
            className={`toast ${
              isError ? 'toast-error' : isSuccess ? 'toast-success' : isWarning ? 'toast-warning' : ''
            }`}
          >
            <div style={{ marginTop: '2px' }}>
              {isSuccess && <CheckCircle2 size={18} color="var(--accent-success)" />}
              {isError && <AlertCircle size={18} color="var(--accent-danger)" />}
              {isWarning && <AlertTriangle size={18} color="var(--accent-warning)" />}
              {!isSuccess && !isError && !isWarning && <Info size={18} color="var(--accent-info)" />}
            </div>
            <div className="toast-content">
              {n.title && <div className="toast-title">{n.title}</div>}
              <div className="toast-message">{n.message}</div>
            </div>
            <button
              className="toast-close"
              onClick={() => dispatch(removeNotification(n.id))}
              title="Close"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default NotificationToast;
