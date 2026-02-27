// js/authService.js

import { auth } from "./config.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// Registrar usuario
export async function register(email, password) {
  return await createUserWithEmailAndPassword(auth, email, password);
}

// Iniciar sesión
export async function login(email, password) {
  return await signInWithEmailAndPassword(auth, email, password);
}

// Cerrar sesión
export async function logout() {
  return await signOut(auth);
}

// Observar estado de autenticación
export function observeAuth(callback) {
  onAuthStateChanged(auth, callback);
}
