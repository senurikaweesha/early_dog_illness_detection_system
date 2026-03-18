import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBxvAYqCchcpxvYQQQmXVpw22xPkq3dsIM",
  authDomain: "early-dog-illness-detection.firebaseapp.com",
  projectId: "early-dog-illness-detection",
  storageBucket: "early-dog-illness-detection.firebasestorage.app",
  messagingSenderId: "1017921879436",
  appId: "1:1017921879436:web:6486569a9d79cf7b252aa9"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
