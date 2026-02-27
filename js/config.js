import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAr9rN6QcxhzXVmzWhL72mo9Wp9hy80Nwo",
  authDomain: "prestamos-mama.firebaseapp.com",
  projectId: "prestamos-mama",
  storageBucket: "prestamos-mama.appspot.com",
  messagingSenderId: "983642333442",
  appId: "1:983642333442:web:bec1d7f198dca6",
  measurementId: "G-P8MT5E2NCK"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
