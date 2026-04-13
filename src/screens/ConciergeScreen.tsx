import { ConciergeChat } from '../components/ConciergeChat';

export default function ConciergeScreen() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: 'calc(100vh - 56px)' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '24px 16px 0' }}>
        <ConciergeChat />
      </div>
    </div>
  );
}

