export interface Zone {
  id: string; // e.g. "gate-a"
  name: string; // e.g. "Gate A"
  capacity: number; // max people
  current: number; // current people (from Firebase)
  density: number; // 0–1 float, computed
  waitMinutes: number; // computed from density
}

export interface Alert {
  id: string;
  message: string;
  zoneId: string;
  timestamp: number;
  read: boolean;
}

export interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}
