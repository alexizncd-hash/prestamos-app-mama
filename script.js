let prestamos = JSON.parse(localStorage.getItem("prestamos")) || [];

function guardar(){

    const nombre = document.getElementById("nombre").value.trim();
    const monto = parseFloat(document.getElementById("monto").value);
    const fechaInput = document.getElementById("fechaInicio").value;
    const tipo = document.getElementById("tipo").value;
    const mesesInput = document.getElementById("meses").value;

    if(!nombre){
        alert("Ingresa nombre");
        return;
    }

    if(!monto || monto < 2000){
        alert("Monto mínimo $2000");
        return;
    }

    let pagos = 0;
    let intervalo = 0;

    if(tipo === "quincenal"){
        pagos = 7;
        intervalo = 15;
    }

    if(tipo === "semanal"){
        pagos = 14;
        intervalo = 7;
    }

    if(tipo === "mensual"){
        pagos = parseInt(mesesInput);
        if(!pagos || pagos < 1){
            alert("Ingresa meses válidos");
            return;
        }
        intervalo = 30;
    }

    const fechaInicio = fechaInput ? new Date(fechaInput) : new Date();
    const total = monto * 1.40;
    const cuota = total / pagos;

    prestamos.push({
        nombre,
        monto,
        total,
        cuota,
        pagos,
        pagados: 0,
        intervalo,
        fechaInicio
    });

    localStorage.setItem("prestamos", JSON.stringify(prestamos));

    actualizarTodo();
}

function pagar(index){
    if(prestamos[index].pagados < prestamos[index].pagos){
        prestamos[index].pagados++;
        localStorage.setItem("prestamos", JSON.stringify(prestamos));
        actualizarTodo();
    }
}

function eliminar(index){
    prestamos.splice(index,1);
    localStorage.setItem("prestamos", JSON.stringify(prestamos));
    actualizarTodo();
}

function mostrarPrestamos(){
    let html = "";

    prestamos.forEach((p,index)=>{
        html += `
            <div class="prestamo-card">
                <strong>${p.nombre}</strong><br>
                Total: $${p.total.toFixed(2)}<br>
                Pagados: ${p.pagados}/${p.pagos}<br>

                <button onclick="pagar(${index})">Registrar Pago</button>
                <button onclick="eliminar(${index})">Eliminar</button>
            </div>
        `;
    });

    document.getElementById("listaPrestamos").innerHTML = html;
}

function actualizarDashboard(){
    let total = 0;
    prestamos.forEach(p => total += p.monto);

    document.getElementById("dashboard").innerHTML =
        `💵 Total Prestado: $${total.toFixed(2)}`;
}

function actualizarTodo(){
    mostrarPrestamos();
    actualizarDashboard();
}

actualizarTodo();
