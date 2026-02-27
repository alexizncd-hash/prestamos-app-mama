// js/loanService.js

import { db } from "./config.js";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Crear préstamo
export async function createLoan(userId, loanData) {
  const loansRef = collection(db, "users", userId, "loans");
  return await addDoc(loansRef, loanData);
}

// Obtener préstamos una sola vez
export async function getLoans(userId) {
  const loansRef = collection(db, "users", userId, "loans");
  const snapshot = await getDocs(loansRef);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

// Escuchar préstamos en tiempo real
export function subscribeToLoans(userId, callback) {
  const loansRef = collection(db, "users", userId, "loans");
  const q = query(loansRef);

  return onSnapshot(q, (snapshot) => {
    const loans = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(loans);
  });
}

// Actualizar préstamo
export async function updateLoan(userId, loanId, updates) {
  const loanRef = doc(db, "users", userId, "loans", loanId);
  return await updateDoc(loanRef, updates);
}

// Eliminar préstamo
export async function deleteLoan(userId, loanId) {
  const loanRef = doc(db, "users", userId, "loans", loanId);
  return await deleteDoc(loanRef);
}
