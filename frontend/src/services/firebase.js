import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration

const firebaseConfig = {
  apiKey: "AIzaSyBxvAYqCchcpxvYQQQmXVpw22xPkq3dsIM",
  authDomain: "early-dog-illness-detection.firebaseapp.com",
  projectId: "early-dog-illness-detection",
  storageBucket: "early-dog-illness-detection.firebasestorage.app",
  messagingSenderId: "1017921879436",
  appId: "1:101792187q9436:web:6486569a9d79cf7b252aa9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;