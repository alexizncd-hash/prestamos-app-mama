let prestamos = JSON.parse(localStorage.getItem("prestamos")) || [];

function calcular() {

    const nombre = document.getElementById("nombre").value;
    const monto = parseFloat(document.getElementById("monto").value);
    const pagos = parseInt(document.getElementById("tipo").value);

    if(!nombre){
        alert("Escribe el nombre del cliente");
        return;
    }

    if(monto < 2000){
        alert("El monto mínimo es $2,000");
        return;
    }

    const interes = monto * 0.40;
    const total = monto + interes;
    const cuota = total / pagos;

    document.getElementById("resultado").innerHTML = `
        <strong>${nombre}</strong><br><br>
        Total: $${total.toFixed(2)}<br>
        Cuota: $${cuota.toFixed(2)}<br><br>
        <button onclick="guardar('${nombre}', ${monto}, ${total}, ${cuota}, ${pagos})">
            Guardar Préstamo
        </button>
    `;
}

function guardar(nombre, monto, total, cuota, pagos){

    prestamos.push({
        nombre,
        monto,
        total,
        cuota,
        pagos,
        pagados: 0
    });

    localStorage.setItem("prestamos", JSON.stringify(prestamos));

    document.getElementById("resultado").innerHTML = "";
    document.getElementById("nombre").value = "";
    document.getElementById("monto").value = "";

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
    if(confirm("¿Eliminar este préstamo?")){
        prestamos.splice(index, 1);
        localStorage.setItem("prestamos", JSON.stringify(prestamos));
        actualizarTodo();
    }
}

function actualizarTodo(){
    mostrarPrestamos();
    actualizarDashboard();
}

function mostrarPrestamos(){

    let html = "";

    prestamos.forEach((p, index) => {

        const progreso = (p.pagados / p.pagos) * 100;
        const restante = p.total - (p.cuota * p.pagados);

        html += `
        <div class="prestamo-card">
            <strong>${p.nombre}</strong><br>
            Total: $${p.total.toFixed(2)}<br>
            Pagados: ${p.pagados}/${p.pagos}<br>
            Restante: $${restante.toFixed(2)}

            <div class="progress-bar">
                <div class="progress" style="width:${progreso}%"></div>
            </div>

            ${p.pagados < p.pagos 
                ? `<button onclick="pagar(${index})">Registrar Pago</button>` 
                : `<button class="disabled-btn" disabled>Completado</button>`
            }

            <button class="delete-btn" onclick="eliminar(${index})">Eliminar</button>
        </div>
        `;
    });

    document.getElementById("listaPrestamos").innerHTML = html;
}

function actualizarDashboard(){

    let totalPrestado = 0;
    let totalRestante = 0;

    prestamos.forEach(p => {
        totalPrestado += p.monto;
        totalRestante += p.total - (p.cuota * p.pagados);
    });

    document.getElementById("dashboard").innerHTML = `
        💵 Total Prestado: $${totalPrestado.toFixed(2)}<br>
        📥 Total por Cobrar: $${totalRestante.toFixed(2)}
    `;
}

actualizarTodo();
