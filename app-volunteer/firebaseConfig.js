import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Paste your Firebase Config object here!
const firebaseConfig = {
  apiKey: "AIzaSyC14XNTfCL4hsLoDijdQ8TTV4crFTEHtM0",
  authDomain: "sahayak-9a0ef.firebaseapp.com",
  projectId: "sahayak-9a0ef",
  storageBucket: "sahayak-9a0ef.firebasestorage.app",
  messagingSenderId: "972309353553",
  appId: "1:972309353553:web:464196bad1c15f9ee61470"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
