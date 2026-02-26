let prestamos = JSON.parse(localStorage.getItem("prestamos")) || [];

function guardar(){

    const nombre = document.getElementById("nombre").value.trim();
    const monto = parseInt(document.getElementById("monto").value);
    const fechaInput = document.getElementById("fechaInicio").value;
    const tipo = document.getElementById("tipo").value;
    const mesesInput = document.getElementById("meses").value;

    if(!nombre){
        alert("Ingresa nombre");
        return;
    }

    if(!monto || monto < 2000){
        alert("Monto mínimo 2000");
        return;
    }

    let pagos = 0;
    let intervalo = 0;
    let tipoTexto = "";

    if(tipo === "quincenal"){
        pagos = 7;
        intervalo = 15;
        tipoTexto = "Quincenal (7 pagos)";
    }

    if(tipo === "semanal"){
        pagos = 14;
        intervalo = 7;
        tipoTexto = "Semanal (14 pagos)";
    }

    if(tipo === "mensual"){
        pagos = parseInt(mesesInput);
        if(!pagos || pagos < 1){
            alert("Meses inválidos");
            return;
        }
        intervalo = "mensual";
        tipoTexto = "Mensual (" + pagos + " meses)";
    }

    const fechaInicio = fechaInput ? new Date(fechaInput) : new Date();

    const interes = monto * 0.40;
    const total = monto + interes;
    const cuota = Math.round(total / pagos);

    prestamos.push({
        nombre,
        monto,
        interes,
        total,
        cuota,
        pagos,
        pagados: 0,
        intervalo,
        tipoTexto,
        fechaInicio
    });

    localStorage.setItem("prestamos", JSON.stringify(prestamos));
    mostrar();
}

function calcularFecha(base, intervalo, numero){
    let fecha = new Date(base);

    if(intervalo === "mensual"){
        fecha.setMonth(fecha.getMonth() + numero);
    } else {
        fecha.setDate(fecha.getDate() + numero * intervalo);
    }

    return fecha;
}

function pagar(index){
    if(prestamos[index].pagados < prestamos[index].pagos){
        prestamos[index].pagados++;
        localStorage.setItem("prestamos", JSON.stringify(prestamos));
        mostrar();
    }
}

function eliminar(index){
    prestamos.splice(index,1);
    localStorage.setItem("prestamos", JSON.stringify(prestamos));
    mostrar();
}

function mostrar(){

    let html = "";
    const hoy = new Date();

    prestamos.forEach((p,index)=>{

        const capitalRecuperado = Math.min(p.pagados,5) >= 5 ? p.monto : (p.monto/5) * p.pagados;
        const gananciaActual = p.pagados > 5 ? (p.pagados - 5) * p.cuota : 0;
        const capitalPendiente = p.monto - capitalRecuperado;

        let calendario = "";

        for(let i=1;i<=p.pagos;i++){

            const fecha = calcularFecha(p.fechaInicio, p.intervalo, i);

            let estado = "Pendiente";

            if(i <= p.pagados){
                estado = "Pagado";
            } else if(fecha < hoy){
                estado = "Vencido";
            } else if((fecha-hoy)/(1000*60*60*24) <= 3){
                estado = "Próximo";
            }

            calendario += `
                <div>
                    ${i}. ${fecha.toLocaleDateString()} - ${estado}
                </div>
            `;
        }

        html += `
            <div style="border:1px solid #ccc; padding:15px; margin:15px 0;">
                <strong>${p.nombre}</strong><br>
                Tipo: ${p.tipoTexto}<br><br>

                Monto prestado: $${p.monto}<br>
                Interés 40%: $${p.interes}<br>
                Total a cobrar: $${p.total}<br>
                Cuota: $${p.cuota}<br><br>

                Pagados: ${p.pagados}/${p.pagos}<br>
                Capital recuperado: $${Math.round(capitalRecuperado)}<br>
                Capital pendiente: $${Math.round(capitalPendiente)}<br>
                Ganancia real actual: $${gananciaActual}<br><br>

                <strong>Calendario:</strong><br>
                ${calendario}
                <br>
                <button onclick="pagar(${index})">Registrar Pago</button>
                <button onclick="eliminar(${index})">Eliminar</button>
            </div>
        `;
    });

    document.getElementById("lista").innerHTML = html;
}

mostrar();
