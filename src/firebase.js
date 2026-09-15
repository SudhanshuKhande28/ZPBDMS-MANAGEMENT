import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDP0sHoBjOejVPFUsKJUz3VEe7U2j0hCYY",
  authDomain: "zpbdms-project-management.firebaseapp.com",
  projectId: "zpbdms-project-management",
  storageBucket: "zpbdms-project-management.firebasestorage.app",
  messagingSenderId: "1020961121496",
  appId: "1:1020961121496:web:e9c96c779b6fda91b8e3ad",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);