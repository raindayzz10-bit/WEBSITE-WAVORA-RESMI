import { initializeApp, getApps, getApp } from 'firebase/app';
import type { FirebaseApp } from 'firebase/app';
import {
  initializeFirestore,
  getFirestore,
  setLogLevel,
  Firestore,
} from 'firebase/firestore';

// Suppress internal verbose/transient connection warnings in iframe/preview environments
try {
  setLogLevel('silent');
} catch {
  // Ignore if unsupported
}

interface ImportMetaEnv {
  VITE_FIREBASE_API_KEY?: string;
  VITE_FIREBASE_AUTH_DOMAIN?: string;
  VITE_FIREBASE_PROJECT_ID?: string;
  VITE_FIREBASE_STORAGE_BUCKET?: string;
  VITE_FIREBASE_MESSAGING_SENDER_ID?: string;
  VITE_FIREBASE_APP_ID?: string;
  VITE_FIREBASE_DATABASE_ID?: string;
}

const env: ImportMetaEnv = ((import.meta as unknown as { env?: ImportMetaEnv }).env) || {};

// Official production credentials for Wavora Aquatic Academy project
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: 'AIzaSyDAGX7cZIo9Rb10QNWr6u-gFxJ2ke6ubQA',
  authDomain: 'ornate-torus-mc9s2.firebaseapp.com',
  projectId: 'ornate-torus-mc9s2',
  storageBucket: 'ornate-torus-mc9s2.firebasestorage.app',
  messagingSenderId: '370887933203',
  appId: '1:370887933203:web:a0858c3f7f8306faaeaee6',
};

const DEFAULT_DATABASE_ID = 'ai-studio-wavoraaquaticaca-7e3fd49d-0137-4620-a782-f372035d0bac';

// Environment-backed or default Firebase config
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || DEFAULT_FIREBASE_CONFIG.apiKey,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || DEFAULT_FIREBASE_CONFIG.authDomain,
  projectId: env.VITE_FIREBASE_PROJECT_ID || DEFAULT_FIREBASE_CONFIG.projectId,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || DEFAULT_FIREBASE_CONFIG.storageBucket,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || DEFAULT_FIREBASE_CONFIG.messagingSenderId,
  appId: env.VITE_FIREBASE_APP_ID || DEFAULT_FIREBASE_CONFIG.appId,
};

// Validate databaseId: Firestore database ID must NOT be a URL (e.g. https://...firebaseio.com is Realtime Database, not Firestore)
const rawDatabaseId = (env.VITE_FIREBASE_DATABASE_ID || '').trim();
const isInvalidFirestoreDbId =
  !rawDatabaseId ||
  rawDatabaseId.startsWith('http://') ||
  rawDatabaseId.startsWith('https://') ||
  rawDatabaseId.includes('firebaseio.com');

export const databaseId = isInvalidFirestoreDbId ? DEFAULT_DATABASE_ID : rawDatabaseId;

// Singleton initialization to prevent multiple apps in HMR
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

/**
 * Initialize Firestore using HTTP long-polling (experimentalForceLongPolling).
 * This eliminates WebSocket connection drops and "Could not reach Cloud Firestore backend"
 * warnings inside sandboxed iframes, mobile proxies, and restrictive networks.
 */
let dbInstance: Firestore;
try {
  dbInstance = initializeFirestore(
    app,
    {
      experimentalForceLongPolling: true,
    },
    databaseId
  );
} catch {
  // If already initialized (e.g. during HMR update), fallback to existing instance
  dbInstance = getFirestore(app, databaseId);
}

export const db: Firestore = dbInstance;
export const isFirestoreConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId
);
