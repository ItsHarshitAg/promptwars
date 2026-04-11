import { MapView } from '../components/MapView';
import ExploreIcon from '@mui/icons-material/Explore';

export default function NavigationScreen() {
  return (
    <main style={{ padding: '16px' }}>
      <h1>
        <ExploreIcon aria-hidden="true" style={{ verticalAlign: 'middle', marginRight: 8 }} />
        Navigation
      </h1>
      <p>Find the least crowded routes to your destination.</p>
      <MapView />
    </main>
  );
}
