import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBnu_5t8nGNmsD7FpEaK8KnZRtp5u5FDMc",
  authDomain: "justice-cars.firebaseapp.com",
  projectId: "justice-cars",
  storageBucket: "justice-cars.firebasestorage.app",
  messagingSenderId: "237955879916",
  appId: "1:237955879916:web:bb54bd93ada7a51d63e6c9"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
