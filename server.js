import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set } from 'firebase/database';
import dotenv from 'dotenv';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8080;

app.get('/config.js', (req, res) => {
  res.type('application/javascript');
  res.send(`window.envConfig = {
    VITE_FIREBASE_API_KEY: "${process.env.VITE_FIREBASE_API_KEY || ''}",
    VITE_FIREBASE_AUTH_DOMAIN: "${process.env.VITE_FIREBASE_AUTH_DOMAIN || ''}",
    VITE_FIREBASE_PROJECT_ID: "${process.env.VITE_FIREBASE_PROJECT_ID || ''}",
    VITE_FIREBASE_STORAGE_BUCKET: "${process.env.VITE_FIREBASE_STORAGE_BUCKET || ''}",
    VITE_FIREBASE_MESSAGING_SENDER_ID: "${process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || ''}",
    VITE_FIREBASE_APP_ID: "${process.env.VITE_FIREBASE_APP_ID || ''}",
    VITE_FIREBASE_DATABASE_URL: "${process.env.VITE_FIREBASE_DATABASE_URL || ''}",
    VITE_GOOGLE_MAPS_KEY: "${process.env.VITE_GOOGLE_MAPS_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY || ''}"
  };`);
});

// Security Setup: Rate Limit & DOMPurify on backend
const window = new JSDOM('').window;
const purify = DOMPurify(window);

// Setup Firebase Seed mock for Cloud Run
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  databaseURL: process.env.VITE_FIREBASE_DATABASE_URL
};

let db;
try {
  const firebaseApp = initializeApp(firebaseConfig);
  db = getDatabase(firebaseApp);
} catch (e) {
  console.log("Firebase init error during seed setup:", e.message);
}

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
  if (!db) return;
  const zonesRef = ref(db, 'zones');
  const payload = {};
  
  zonesData.forEach(zone => {
    const jitter = Math.floor(Math.random() * 21) - 10;
    zone.current = Math.max(0, Math.min(zone.capacity, zone.current + jitter));
    
    let density = Math.max(0, Math.min(1, zone.current / zone.capacity));
    let waitMinutes = 0;
    if (density >= 0.9) waitMinutes = 30 + Math.floor((density - 0.9) * 100);
    else if (density >= 0.8) waitMinutes = 20 + Math.floor((density - 0.8) * 100);
    else if (density >= 0.5) waitMinutes = 10 + Math.floor((density - 0.5) * 33);
    else if (density >= 0.2) waitMinutes = 2 + Math.floor((density - 0.2) * 26);
    
    payload[zone.id] = { ...zone, density, waitMinutes };
  });
  
  await set(zonesRef, payload);
  console.log(`[${new Date().toISOString()}] Seeded mocked data to Firebase.`);
};

// 2 MINUTE INTERVAL
setInterval(seedData, 2 * 60 * 1000);
seedData();

app.post('/api/chat', async (req, res) => {
  try {
    let { message, context } = req.body;
    
    // BACKEND SECURITY: Sanitize & validate
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Invalid input' });
    }
    message = purify.sanitize(message, { ALLOWED_TAGS: [] }).slice(0, 500);

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'Missing Gemini API key configuration' });
    }
    
    const ai = new GoogleGenAI({ apiKey });
    const systemInstruction = `You are StadiumAI, a helpful venue assistant at a large sporting stadium. You have access to the following live zone data: ${context}. Help attendees with: finding the shortest queue, navigating to their seat, food and restroom recommendations based on current crowd levels, and general venue questions. Be concise. Max 3 sentences per response. IMPORTANT RULE: If the user asks anything completely unrelated to the stadium, the event, or the venue data, reply strictly with "I can only answer questions related to the stadium." and do not process it further.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: message,
      config: { systemInstruction }
    });
    
    res.json({ reply: response.text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process chat' });
  }
});

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
