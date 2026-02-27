import { register, login, logout, observeAuth } from "./authService.js";
import { createLoan, subscribeToLoans } from "./loanService.js";

console.log("APP CARGADA");

// ===== ELEMENTOS AUTH =====
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const btnLogin = document.getElementById("btnLogin");
const btnRegister = document.getElementById("btnRegister");
const btnLogout = document.getElementById("btnLogout");
const authError = document.getElementById("authError");

const authSection = document.getElementById("authSection");
const dashboardSection = document.getElementById("dashboardSection");

// ===== ELEMENTOS PRÉSTAMO =====
const clienteNombreInput = document.getElementById("clienteNombre");
const montoInput = document.getElementById("monto");
const interesInput = document.getElementById("interes");
const tipoPagoSelect = document.getElementById("tipoPago");
const btnCrearPrestamo = document.getElementById("btnCrearPrestamo");
const listaPrestamos = document.getElementById("listaPrestamos");

let currentUser = null;
let unsubscribeLoans = null;

// =======================
// AUTH
// =======================

btnRegister.addEventListener("click", async () => {
  try {
    await register(emailInput.value, passwordInput.value);
    authError.textContent = "";
  } catch (error) {
    authError.textContent = error.message;
  }
});

btnLogin.addEventListener("click", async () => {
  try {
    await login(emailInput.value, passwordInput.value);
    authError.textContent = "";
  } catch (error) {
    authError.textContent = error.message;
  }
});

btnLogout.addEventListener("click", async () => {
  await logout();
});

// Detectar sesión activa
observeAuth((user) => {
  if (user) {
    currentUser = user;

    authSection.style.display = "none";
    dashboardSection.style.display = "block";

    startLoanListener();
  } else {
    currentUser = null;

    authSection.style.display = "block";
    dashboardSection.style.display = "none";

    if (unsubscribeLoans) unsubscribeLoans();
  }
});

// =======================
// CREAR PRÉSTAMO
// =======================

btnCrearPrestamo.addEventListener("click", async () => {
  if (!currentUser) return;

  const clienteNombre = clienteNombreInput.value.trim();
  const monto = parseInt(montoInput.value);
  const interes = parseInt(interesInput.value) || 40;
  const tipoPago = tipoPagoSelect.value;

  if (!clienteNombre || !monto) {
    alert("Completa todos los campos");
    return;
  }

  // Cálculo financiero
  const interesTotal = Math.round(monto * interes / 100);
  const totalConInteres = monto + interesTotal;

  const pagosTotales =
    tipoPago === "quincenal" ? 7 :
    tipoPago === "semanal" ? 14 : 7;

  const loanData = {
    clienteNombre,
    monto,
    interes,
    interesTotal,
    totalConInteres,
    pagosTotales,
    pagosRealizados: 0,
    tipoPago,
    fechaCreacion: new Date(),
    estado: "activo"
  };

  try {
    await createLoan(currentUser.uid, loanData);

    clienteNombreInput.value = "";
    montoInput.value = "";
    interesInput.value = 40;

  } catch (error) {
    alert("Error al guardar: " + error.message);
  }
});

// =======================
// ESCUCHAR PRÉSTAMOS
// =======================

function startLoanListener() {
  if (!currentUser) return;

  if (unsubscribeLoans) unsubscribeLoans();

  unsubscribeLoans = subscribeToLoans(currentUser.uid, (loans) => {
    renderLoans(loans);
  });
}

// =======================
// RENDER
// =======================

function renderLoans(loans) {
  listaPrestamos.innerHTML = "";

  loans.forEach((loan) => {
    const div = document.createElement("div");
    div.style.border = "1px solid black";
    div.style.padding = "10px";
    div.style.marginBottom = "10px";

    div.innerHTML = `
      <strong>${loan.clienteNombre}</strong><br>
      Monto: $${loan.monto}<br>
      Interés: ${loan.interes}%<br>
      Total a pagar: $${loan.totalConInteres}<br>
      Pagos: ${loan.pagosRealizados}/${loan.pagosTotales}<br>
      Estado: ${loan.estado}
    `;

    listaPrestamos.appendChild(div);
  });
}
