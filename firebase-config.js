// Import the required Firebase modules
// firebase-config.js
import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDXzyHOuZvDORubiwNtrZUo3cVnBYT288s",
  authDomain: "mitzvahmerch-ac346.firebaseapp.com",
  projectId: "mitzvahmerch-ac346",
  storageBucket: "mitzvahmerch-ac346.appspot.com",
  messagingSenderId: "232131426361",
  appId: "1:232131426361:web:8c7852a8da0e2f7a8d35e8",
  measurementId: "G-XXFM5DPRZ6"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const db = getFirestore(app);

export { storage, db };
