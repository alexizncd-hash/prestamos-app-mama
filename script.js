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
        alert("Monto mínimo 2000");
        return;
    }

    let pagos = 0;
    let intervalo = 0;
    let tipoTexto = "";

    if(tipo === "quincenal"){
        pagos = 7;
        intervalo = 15;
        tipoTexto = "Quincenal";
    }

    if(tipo === "semanal"){
        pagos = 14;
        intervalo = 7;
        tipoTexto = "Semanal";
    }

    if(tipo === "mensual"){
        pagos = parseInt(mesesInput);
        if(!pagos || pagos < 1){
            alert("Meses inválidos");
            return;
        }
        intervalo = "mensual";
        tipoTexto = "Mensual";
    }

    const fechaInicio = fechaInput ? new Date(fechaInput) : new Date();

    const interes = monto * 0.40;
    const total = monto + interes;
    const cuota = total / pagos;

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

function calcularFecha(fechaBase, intervalo, numeroPago){
    let fecha = new Date(fechaBase);

    if(intervalo === "mensual"){
        fecha.setMonth(fecha.getMonth() + numeroPago);
    } else {
        fecha.setDate(fecha.getDate() + (numeroPago * intervalo));
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

        let calendario = "";

        for(let i=1;i<=p.pagos;i++){

            const fechaPago = calcularFecha(p.fechaInicio, p.intervalo, i);

            let estado = "Pendiente";

            if(i <= p.pagados){
                estado = "Pagado";
            } else if(fechaPago < hoy){
                estado = "Vencido";
            } else if((fechaPago - hoy)/(1000*60*60*24) <= 3){
                estado = "Próximo";
            }

            calendario += `
                <div>
                    ${i}. ${fechaPago.toLocaleDateString()} - ${estado}
                </div>
            `;
        }

        html += `
            <div style="border:1px solid #ccc; padding:10px; margin:10px 0;">
                <strong>${p.nombre}</strong><br>
                Tipo: ${p.tipoTexto}<br>
                Monto: $${p.monto.toFixed(2)}<br>
                Interés (40%): $${p.interes.toFixed(2)}<br>
                Total a cobrar: $${p.total.toFixed(2)}<br>
                Cuota: $${p.cuota.toFixed(2)}<br>
                Pagados: ${p.pagados}/${p.pagos}<br>
                <br>
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
