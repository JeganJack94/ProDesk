import { jest } from '@jest/globals';
import '@testing-library/jest-dom';

// Mock Firebase
const mockFirebase = {
  auth: jest.fn(),
  db: jest.fn(),
  storage: jest.fn(),
  initializeApp: jest.fn()
};

jest.mock('firebase/app', () => ({
  initializeApp: jest.fn()
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => mockFirebase.auth),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn()
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => mockFirebase.db),
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn()
}));

jest.mock('firebase/storage', () => ({
  getStorage: jest.fn(() => mockFirebase.storage)
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

export default mockFirebase; 