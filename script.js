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

/* ===== ELEMENTOS ===== */

const authContainer = document.getElementById("authContainer");
const appContainer = document.getElementById("appContainer");

const btnRegister = document.getElementById("btnRegister");
const btnLogin = document.getElementById("btnLogin");
const btnLogout = document.getElementById("btnLogout");
const btnGuardar = document.getElementById("btnGuardar");

const listaActivos = document.getElementById("listaActivos");
const listaHistorial = document.getElementById("listaHistorial");

/* ===== LOGIN ===== */

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

/* ===== CREAR PRÉSTAMO ===== */

btnGuardar.onclick = async ()=>{

  const nombre = document.getElementById("nombre").value;
  const monto = parseInt(document.getElementById("monto").value);
  const porcentaje = parseInt(document.getElementById("interesInput").value) || 40;
  const tipo = document.getElementById("tipo").value;
  const meses = parseInt(document.getElementById("meses").value);
  const fecha = new Date(document.getElementById("fechaInicio").value);

  if(!nombre || monto < 2000) return;

  let pagos = 0;
  let intervalo = 0;

  if(tipo==="quincenal"){ pagos=7; intervalo=15; }
  if(tipo==="semanal"){ pagos=14; intervalo=7; }
  if(tipo==="mensual"){ pagos=meses; }

  const interes = Math.round(monto * porcentaje / 100);
  const total = monto + interes;
  const cuota = Math.round(total / pagos);

  await addDoc(collection(db,"users",currentUser.uid,"prestamos"),{
    nombre,
    monto,
    porcentaje,
    interes,
    total,
    cuota,
    pagosTotales:pagos,
    pagosRealizados:0,
    tipo,
    intervalo,
    fechaInicio:fecha,
    estado:"activo"
  });

  cargarPrestamos();
};

/* ===== GENERAR FECHAS ===== */

function generarFechas(p){
  let fechas=[];
  let base = new Date(p.fechaInicio);

  for(let i=1;i<=p.pagosTotales;i++){
    let nueva = new Date(base);

    if(p.tipo==="mensual"){
      nueva.setMonth(base.getMonth()+i);
    }else{
      nueva.setDate(base.getDate()+(p.intervalo*i));
    }

    fechas.push(nueva);
  }
  return fechas;
}

/* ===== MOSTRAR ===== */

async function cargarPrestamos(){

  listaActivos.innerHTML="";
  listaHistorial.innerHTML="";

  const snapshot = await getDocs(collection(db,"users",currentUser.uid,"prestamos"));

  snapshot.forEach(docSnap=>{
    const p = docSnap.data();
    const id = docSnap.id;

    const progreso = (p.pagosRealizados/p.pagosTotales)*100;
    const fechas = generarFechas(p);

    let calendarioHTML="";

    fechas.forEach((fecha,index)=>{
      let estado="pendiente";

      if(index < p.pagosRealizados){
        estado="pagado";
      }else if(fecha < new Date()){
        estado="vencido";
      }

      calendarioHTML+=`
        <div class="fecha ${estado}">
          ${index+1}. ${fecha.toLocaleDateString()}
        </div>
      `;
    });

    const card = document.createElement("div");
    card.className="card";
    card.innerHTML=`
      <b>${p.nombre}</b><br>
      Total: $${p.total}<br>
      Cuota: $${p.cuota}<br>
      ${p.pagosRealizados}/${p.pagosTotales}
      <div class="progress">
        <div class="progress-bar" style="width:${progreso}%"></div>
      </div>
      ${calendarioHTML}
      <button onclick="pagar('${id}',${p.pagosRealizados},${p.pagosTotales})">Registrar Pago</button>
    `;

    if(p.estado==="activo"){
      listaActivos.appendChild(card);
    }else{
      listaHistorial.appendChild(card);
    }

  });
}

window.pagar = async (id,realizados,totales)=>{
  const ref = doc(db,"users",currentUser.uid,"prestamos",id);
  let nuevo = realizados+1;
  let estado = nuevo>=totales?"finalizado":"activo";
  await updateDoc(ref,{pagosRealizados:nuevo,estado});
  cargarPrestamos();
};
