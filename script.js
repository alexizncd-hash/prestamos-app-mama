let prestamos = JSON.parse(localStorage.getItem("prestamos")) || [];
let editando = null;

function mostrarMeses(){
    const tipo = document.getElementById("tipo").value;
    const campoMeses = document.getElementById("meses");
    campoMeses.style.display = tipo === "mensual" ? "block" : "none";
}

function guardar(){

    const nombre = document.getElementById("nombre").value.trim();
    const monto = parseFloat(document.getElementById("monto").value);
    const fechaInput = document.getElementById("fechaInicio").value;
    const tipo = document.getElementById("tipo").value;
    const mesesInput = document.getElementById("meses").value;

    if(!nombre){
        alert("Ingresa el nombre");
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
            alert("Ingresa número de meses");
            return;
        }
        intervalo = 30;
    }

    const fechaInicio = fechaInput ? new Date(fechaInput) : new Date();

    const total = monto * 1.40;
    const cuota = total / pagos;

    const data = {
        nombre,
        monto,
        total,
        cuota,
        pagos,
        pagados: 0,
        intervalo,
        fechaInicio
    };

    if(editando !== null){
        prestamos[editando] = data;
        editando = null;
        document.getElementById("formTitulo").innerText = "Nuevo Préstamo";
    } else {
        prestamos.push(data);
    }

    localStorage.setItem("prestamos", JSON.stringify(prestamos));

    limpiar();
    actualizarTodo();
}

function limpiar(){
    document.getElementById("nombre").value = "";
    document.getElementById("monto").value = "";
    document.getElementById("fechaInicio").value = "";
    document.getElementById("meses").value = "";
}

function editar(index){
    const p = prestamos[index];

    document.getElementById("nombre").value = p.nombre;
    document.getElementById("monto").value = p.monto;
    document.getElementById("fechaInicio").value =
        new Date(p.fechaInicio).toISOString().split("T")[0];

    editando = index;
    document.getElementById("formTitulo").innerText = "Editando Préstamo";
}

function toggleCalendario(index){
    const el = document.getElementById("cal-"+index);
    el.classList.toggle("abierto");
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
    let activos = "";
    let historial = "";
    const hoy = new Date();

    prestamos.forEach((p,index)=>{

        let calendario = "";

        for(let i=1;i<=p.pagos;i++){
            let fecha = new Date(p.fechaInicio);
            fecha.setDate(fecha.getDate() + i * p.intervalo);

            let estado = "pendiente";

            if(i <= p.pagados) estado = "pagado";
            else if(fecha < hoy) estado = "vencido";
            else if((fecha-hoy)/(1000*60*60*24) <= 3) estado = "proximo";

            calendario += `
                <div class="${estado}">
                    ${i}. ${fecha.toLocaleDateString()}
                </div>
            `;
        }

        if(p.pagados < p.pagos){
            activos += `
                <div class="prestamo-card">
                    <strong>${p.nombre}</strong><br>
                    Total: $${p.total.toFixed(2)}<br>
                    Pagados: ${p.pagados}/${p.pagos}

                    <button class="btn-editar" onclick="toggleCalendario(${index})">
                        Ver Calendario
                    </button>

                    <div id="cal-${index}" class="calendario">
                        ${calendario}
                    </div>

                    <button class="btn-pago" onclick="pagar(${index})">Registrar Pago</button>
                    <button class="btn-editar" onclick="editar(${index})">Editar</button>
                    <button class="btn-eliminar" onclick="eliminar(${index})">Eliminar</button>
                </div>
            `;
        } else {
            historial += `
                <div class="historial-card">
                    <strong>${p.nombre}</strong><br>
                    Finalizado - $${p.total.toFixed(2)}
                </div>
            `;
        }
    });

    document.getElementById("listaPrestamos").innerHTML = activos;
    document.getElementById("historialPrestamos").innerHTML = historial;
}

function actualizarDashboard(){
    let totalPrestado = 0;
    let totalRestante = 0;

    prestamos.forEach(p=>{
        totalPrestado += p.monto;
        totalRestante += p.total - (p.cuota * p.pagados);
    });

    document.getElementById("dashboard").innerHTML =
        `💵 Prestado: $${totalPrestado.toFixed(2)}<br>
         📥 Por cobrar: $${totalRestante.toFixed(2)}`;
}

function actualizarTodo(){
    mostrarPrestamos();
    actualizarDashboard();
}

actualizarTodo();
