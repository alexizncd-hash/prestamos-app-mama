console.log("APP JS CARGADO");
// js/app.js

import { register, login, logout, observeAuth } from "./authService.js";

// Elementos del DOM
const authSection = document.getElementById("authSection");
const dashboardSection = document.getElementById("dashboardSection");

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const btnLogin = document.getElementById("btnLogin");
const btnRegister = document.getElementById("btnRegister");
const btnLogout = document.getElementById("btnLogout");

const authError = document.getElementById("authError");

// Mostrar dashboard
function showDashboard() {
  authSection.classList.add("hidden");
  dashboardSection.classList.remove("hidden");
}

// Mostrar login
function showAuth() {
  dashboardSection.classList.add("hidden");
  authSection.classList.remove("hidden");
}

// Login
btnLogin.addEventListener("click", async () => {
  authError.textContent = "";
  try {
    await login(emailInput.value, passwordInput.value);
  } catch (error) {
    authError.textContent = error.message;
  }
});

// Registro
btnRegister.addEventListener("click", async () => {
  authError.textContent = "";
  try {
    await register(emailInput.value, passwordInput.value);
  } catch (error) {
    authError.textContent = error.message;
  }
});

// Logout
btnLogout.addEventListener("click", async () => {
  await logout();
});

// Detectar sesión activa
observeAuth((user) => {
  if (user) {
    showDashboard();
  } else {
    showAuth();
  }
});
