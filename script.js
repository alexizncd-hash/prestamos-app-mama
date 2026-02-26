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
  getDocs,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAr9rN6QcxhzXVmzWhL72mo9Wp9hy80Nwo",
  authDomain: "prestamos-mama.firebaseapp.com",
  projectId: "prestamos-mama",
  storageBucket: "prestamos-mama.appspot.com",
  messagingSenderId: "983642333442",
  appId: "1:983642333442:web:bec1d7f198dca61"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;

/* ELEMENTOS */
const authContainer = document.getElementById("authContainer");
const appContainer = document.getElementById("appContainer");
const btnRegister = document.getElementById("btnRegister");
const btnLogin = document.getElementById("btnLogin");
const btnLogout = document.getElementById("btnLogout");
const btnGuardar = document.getElementById("btnGuardar");
const listaActivos = document.getElementById("listaActivos");
const listaHistorial = document.getElementById("listaHistorial");

/* DASHBOARD ELEMENTOS */
const dashInvertido = document.getElementById("dashInvertido");
const dashRecuperado = document.getElementById("dashRecuperado");
const dashGananciaProyectada = document.getElementById("dashGananciaProyectada");
const dashGananciaReal = document.getElementById("dashGananciaReal");

/* LOGIN */
btnRegister.onclick = async () => {
  await createUserWithEmailAndPassword(auth,email.value,password.value);
};
btnLogin.onclick = async () => {
  await signInWithEmailAndPassword(auth,email.value,password.value);
};
btnLogout.onclick = async () => {
  await signOut(auth);
};

onAuthStateChanged(auth, user=>{
  if(user){
    currentUser = user;
    authContainer.classList.add("hidden");
    appContainer.classList.remove("hidden");
    cargarPrestamos();
  }else{
    authContainer.classList.remove("hidden");
    appContainer.classList.add("hidden");
  }
});

/* CREAR PRÉSTAMO */
btnGuardar.onclick = async ()=>{

  const nombre = document.getElementById("nombre").value;
  const monto = parseInt(document.getElementById("monto").value);
  const porcentaje = parseInt(document.getElementById("interesInput").value) || 40;
  const tipo = document.getElementById("tipo").value;
  const meses = parseInt(document.getElementById("meses").value);
  const fechaInicio = new Date(document.getElementById("fechaInicio").value);

  if(!nombre || monto < 2000) return;

  let pagos = 0;
  let intervalo = 0;

  if(tipo==="quincenal"){ pagos=7; intervalo=15; }
  if(tipo==="semanal"){ pagos=14; intervalo=7; }
  if(tipo==="mensual"){ pagos=meses; }

  const interesTotal = Math.round(monto * porcentaje / 100);
  const totalConInteres = monto + interesTotal;
  const cuota = Math.round(totalConInteres / pagos);

  let fechas = [];
  for(let i=1;i<=pagos;i++){
    let fecha = new Date(fechaInicio);
    if(tipo==="mensual"){
      fecha.setMonth(fechaInicio.getMonth()+i);
    } else {
      fecha.setDate(fechaInicio.getDate()+(intervalo*i));
    }
    fechas.push({
      fecha: fecha.toISOString(),
      monto: cuota,
      estado: "pendiente"
    });
  }

  await addDoc(collection(db,"users",currentUser.uid,"prestamos"),{
    nombre,
    monto,
    porcentaje,
    interesTotal,
    totalConInteres,
    cuota,
    pagosTotales:pagos,
    pagosRealizados:0,
    totalRecuperado:0,
    gananciaReal:0,
    tipo,
    fechaInicio:fechaInicio.toISOString(),
    fechas,
    estado:"activo"
  });

  cargarPrestamos();
};

/* CARGAR */
async function cargarPrestamos(){

  listaActivos.innerHTML="";
  listaHistorial.innerHTML="";

  let invertido=0;
  let recuperado=0;
  let gananciaProyectada=0;
  let gananciaReal=0;

  const snapshot = await getDocs(collection(db,"users",currentUser.uid,"prestamos"));

  snapshot.forEach(docSnap=>{
    const p = docSnap.data();
    const id = docSnap.id;

    if(p.estado==="activo") invertido += p.monto;
    recuperado += p.totalRecuperado;
    gananciaProyectada += p.interesTotal;
    gananciaReal += p.gananciaReal;

    const progreso = (p.pagosRealizados/p.pagosTotales)*100;

    let calendarioHTML="";
    p.fechas.forEach((f,index)=>{
      let clase = f.estado;
      calendarioHTML += `
        <div class="fecha ${clase}">
          ${index+1}. ${new Date(f.fecha).toLocaleDateString()}
        </div>
      `;
    });

    const card = document.createElement("div");
    card.className="card";
    card.innerHTML=`
      <b>${p.nombre}</b><br>
      Total: $${p.totalConInteres}<br>
      Cuota: $${p.cuota}<br>
      ${p.pagosRealizados}/${p.pagosTotales}
      <div class="progress">
        <div class="progress-bar" style="width:${progreso}%"></div>
      </div>
      ${calendarioHTML}
      <button onclick="registrarPago('${id}')">Registrar Pago</button>
    `;

    if(p.estado==="activo"){
      listaActivos.appendChild(card);
    }else{
      listaHistorial.appendChild(card);
    }

  });

  dashInvertido.textContent="$"+invertido;
  dashRecuperado.textContent="$"+recuperado;
  dashGananciaProyectada.textContent="$"+gananciaProyectada;
  dashGananciaReal.textContent="$"+gananciaReal;
}

window.registrarPago = async (id)=>{
  const ref = doc(db,"users",currentUser.uid,"prestamos",id);
  const snapshot = await getDocs(collection(db,"users",currentUser.uid,"prestamos"));
};
