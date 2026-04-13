import { useAlerts } from '../hooks/useAlerts';
import CloseIcon from '@mui/icons-material/Close';
import WarningIcon from '@mui/icons-material/Warning';

export function AlertPanel() {
  const { alerts, dismissAlert } = useAlerts();

  if (alerts.length === 0) return null;

  return (
    <section aria-live="polite" aria-label="Important Alerts">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px' }}>
        {alerts.map(alert => (
          <div 
            key={alert.id}
            style={{
              backgroundColor: '#ffebee',
              color: '#c62828',
              padding: '12px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <WarningIcon aria-hidden="true" />
              <span>{alert.message}</span>
            </div>
            <button 
              onClick={() => dismissAlert(alert.id)}
              aria-label={`Dismiss alert: ${alert.message}`}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#c62828'
              }}
            >
              <CloseIcon />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
