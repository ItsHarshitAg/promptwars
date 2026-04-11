import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set } from 'firebase/database';
import { calculateQueueWaitTime } from '../src/utils/queuePredictor';
import * as dotenv from 'dotenv';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import type { Zone } from '../src/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env') });

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  databaseURL: process.env.VITE_FIREBASE_DATABASE_URL
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const zonesData = [
  { id: "gate-a", name: "Gate A", capacity: 500, current: 120 },
  { id: "gate-b", name: "Gate B", capacity: 500, current: 430 },
  { id: "food-north", name: "Food Court North", capacity: 200, current: 170 },
  { id: "food-south", name: "Food Court South", capacity: 200, current: 40 },
  { id: "restroom-e", name: "Restroom East", capacity: 80, current: 75 },
  { id: "restroom-w", name: "Restroom West", capacity: 80, current: 10 },
  { id: "block-100", name: "Seat Block 100", capacity: 1000, current: 820 },
  { id: "block-200", name: "Seat Block 200", capacity: 1000, current: 310 }
];

const seedData = async () => {
  const zonesRef = ref(db, 'zones');
  const payload: Record<string, Zone> = {};
  
  zonesData.forEach(zone => {
    const jitter = Math.floor(Math.random() * 21) - 10;
    const nextCurrent = Math.max(0, Math.min(zone.capacity, zone.current + jitter));
    zone.current = nextCurrent;
    
    const { density, waitMinutes } = calculateQueueWaitTime(zone.current, zone.capacity);
    payload[zone.id] = {
      ...zone,
      density,
      waitMinutes
    };
  });
  
  await set(zonesRef, payload);
  console.log(`[${new Date().toISOString()}] Seeded data.`);
};

// Run immediately and then every 10 seconds
seedData();
setInterval(seedData, 10000);
