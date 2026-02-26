let prestamos = JSON.parse(localStorage.getItem("prestamos")) || [];

function calcular() {

    const nombre = document.getElementById("nombre").value;
    const monto = parseFloat(document.getElementById("monto").value);
    const fechaInput = document.getElementById("fechaInicio").value;
    const tipo = document.getElementById("tipo").value.split("-");
    const diasIntervalo = parseInt(tipo[0]);
    const pagos = parseInt(tipo[1]);

    if(!nombre || monto < 2000){
        alert("Datos inválidos");
        return;
    }

    const interes = monto * 0.40;
    const total = monto + interes;
    const cuota = total / pagos;
    const fechaInicio = fechaInput ? new Date(fechaInput) : new Date();

    document.getElementById("resultado").innerHTML = `
        <br>
        Total: $${total.toFixed(2)}<br>
        Cuota: $${cuota.toFixed(2)}<br><br>
        <button onclick="guardar('${nombre}', ${monto}, ${total}, ${cuota}, ${pagos}, ${diasIntervalo}, '${fechaInicio.toISOString()}')">
            Guardar Préstamo
        </button>
    `;
}

function guardar(nombre, monto, total, cuota, pagos, diasIntervalo, fechaInicio){
    prestamos.push({nombre, monto, total, cuota, pagos, pagados:0, diasIntervalo, fechaInicio});
    localStorage.setItem("prestamos", JSON.stringify(prestamos));
    actualizarTodo();
}

function toggleCalendario(index){
    const el = document.getElementById("cal-"+index);
    el.style.display = el.style.display === "none" ? "block" : "none";
}

function pagar(index){
    if(prestamos[index].pagados < prestamos[index].pagos){
        prestamos[index].pagados++;
        localStorage.setItem("prestamos", JSON.stringify(prestamos));
        actualizarTodo();
    }
}

function eliminar(index){
    if(confirm("¿Eliminar préstamo?")){
        prestamos.splice(index,1);
        localStorage.setItem("prestamos", JSON.stringify(prestamos));
        actualizarTodo();
    }
}

function mostrarPrestamos(){
    let html="";
    const hoy = new Date();

    prestamos.forEach((p,index)=>{
        const fechaInicio = new Date(p.fechaInicio);
        let clase="normal";

        const proximo = new Date(fechaInicio);
        proximo.setDate(fechaInicio.getDate() + (p.pagados+1)*p.diasIntervalo);

        if(hoy > proximo && p.pagados < p.pagos) clase="atrasado";
        else if((proximo-hoy)/(1000*60*60*24)<=3 && p.pagados<p.pagos) clase="proximo";

        let calendario="";
        for(let i=1;i<=p.pagos;i++){
            let fecha=new Date(fechaInicio);
            fecha.setDate(fechaInicio.getDate()+i*p.diasIntervalo);
            calendario+=`${i}. ${fecha.toLocaleDateString()} - ${i<=p.pagados?"Pagado":"Pendiente"}<br>`;
        }

        html+=`
        <div class="prestamo-card ${clase}">
        <strong>${p.nombre}</strong><br>
        Total: $${p.total.toFixed(2)}<br>
        Pagados: ${p.pagados}/${p.pagos}<br>

        <button class="btn-toggle" onclick="toggleCalendario(${index})">Ver Calendario</button>
        <div id="cal-${index}" class="calendario">${calendario}</div>

        <button class="btn-pago" onclick="pagar(${index})">Registrar Pago</button>
        <button class="btn-eliminar" onclick="eliminar(${index})">Eliminar</button>
        </div>
        `;
    });

    document.getElementById("listaPrestamos").innerHTML=html;
}

function actualizarDashboard(){
    let totalPrestado=0;
    prestamos.forEach(p=> totalPrestado+=p.monto);
    document.getElementById("dashboard").innerHTML=`💵 Total Prestado: $${totalPrestado.toFixed(2)}`;
}

function actualizarTodo(){
    mostrarPrestamos();
    actualizarDashboard();
}

actualizarTodo();
