import { ConciergeChat } from '../components/ConciergeChat';
import SmartToyIcon from '@mui/icons-material/SmartToy';

export default function ConciergeScreen() {
  return (
    <main style={{ padding: '16px' }}>
      <h1>
        <SmartToyIcon aria-hidden="true" style={{ verticalAlign: 'middle', marginRight: 8 }} />
        AI Concierge
      </h1>
      <p>Ask StadiumAI anything about the venue.</p>
      <ConciergeChat />
    </main>
  );
}
