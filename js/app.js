import { register, login, logout, observeAuth } from "./authService.js";

console.log("APP CARGADA");

// ELEMENTOS
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const btnLogin = document.getElementById("btnLogin");
const btnRegister = document.getElementById("btnRegister");
const btnLogout = document.getElementById("btnLogout");

const authSection = document.getElementById("authSection");
const dashboardSection = document.getElementById("dashboardSection");
const authError = document.getElementById("authError");

// REGISTRO
btnRegister.addEventListener("click", async () => {
  try {
    await register(emailInput.value, passwordInput.value);
    authError.textContent = "";
  } catch (error) {
    authError.textContent = error.message;
  }
});

// LOGIN
btnLogin.addEventListener("click", async () => {
  try {
    await login(emailInput.value, passwordInput.value);
    authError.textContent = "";
  } catch (error) {
    authError.textContent = error.message;
  }
});

// LOGOUT
btnLogout.addEventListener("click", async () => {
  await logout();
});

// OBSERVAR SESIÓN
observeAuth((user) => {
  if (user) {
    authSection.style.display = "none";
    dashboardSection.style.display = "block";
  } else {
    authSection.style.display = "block";
    dashboardSection.style.display = "none";
  }
});
