// Import the required Firebase modules
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; 
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDXzyHOuZvDORubiwNtrZUo3cVnBYT288s",
  authDomain: "mitzvahmerch-ac346.firebaseapp.com",
  projectId: "mitzvahmerch-ac346",
  storageBucket: "mitzvahmerch-ac346.appspot.com",
  messagingSenderId: "232131426361",
  appId: "1:232131426361:web:8c7852a8da0e2f7a8d35e8",
  measurementId: "G-XXFM5DPRZ6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };
