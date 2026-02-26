alert("JS CARGADO");
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { 
  getFirestore,
  collection,
  addDoc,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* ========= PEGA TU CONFIG ========= */
const firebaseConfig = {
  apiKey: "AIzaSyAr9rN6QcxhzXVmzWhL72mo9Wp9hy80Nwo",
  authDomain: "prestamos-mama.firebaseapp.com",
  projectId: "prestamos-mama",
  storageBucket: "prestamos-mama.appspot.com",
  messagingSenderId: "983642333442",
  appId: "1:983642333442:web:bec1d7f198dca61"
};
/* =================================== */

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;

/* ===== ELEMENTOS ===== */

const authContainer = document.getElementById("authContainer");
const appContainer = document.getElementById("appContainer");

const btnRegister = document.getElementById("btnRegister");
const btnLogin = document.getElementById("btnLogin");
const btnLogout = document.getElementById("btnLogout");
const btnGuardar = document.getElementById("btnGuardar");

const lista = document.getElementById("listaPrestamos");

/* ===== REGISTRO ===== */

btnRegister.addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    alert("Usuario registrado correctamente");
  } catch (error) {
    alert(error.message);
  }
});

/* ===== LOGIN ===== */

btnLogin.addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    alert(error.message);
  }
});

/* ===== LOGOUT ===== */

btnLogout.addEventListener("click", async () => {
  await signOut(auth);
});

/* ===== DETECTAR SESIÓN ===== */

onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    authContainer.classList.add("hidden");
    appContainer.classList.remove("hidden");
    cargarPrestamos();
  } else {
    currentUser = null;
    authContainer.classList.remove("hidden");
    appContainer.classList.add("hidden");
  }
});

/* ===== GUARDAR PRÉSTAMO ===== */

btnGuardar.addEventListener("click", async () => {
  if (!currentUser) return;

  const nombre = document.getElementById("nombre").value;
  const monto = parseFloat(document.getElementById("monto").value);

  if (!nombre || monto < 2000) {
    alert("Datos inválidos");
    return;
  }

  const interes = monto * 0.40;
  const total = monto + interes;

  await addDoc(collection(db, "users", currentUser.uid, "prestamos"), {
    nombre,
    monto,
    total,
    fecha: new Date()
  });

  cargarPrestamos();
});

/* ===== CARGAR PRÉSTAMOS ===== */

async function cargarPrestamos() {
  lista.innerHTML = "";

  const querySnapshot = await getDocs(collection(db, "users", currentUser.uid, "prestamos"));

  querySnapshot.forEach(doc => {
    const data = doc.data();
    const div = document.createElement("div");
    div.innerHTML = `
      <p><b>${data.nombre}</b></p>
      <p>Total: $${data.total}</p>
      <hr>
    `;
    lista.appendChild(div);
  });
}
