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
            alert("Meses inválidos");
            return;
        }
        intervalo = 30;
    }

    const fechaInicio = fechaInput ? new Date(fechaInput) : new Date();
    const total = monto * 1.4;

    prestamos.push({
        nombre,
        monto,
        total,
        pagos,
        pagados: 0,
        intervalo,
        fechaInicio
    });

    localStorage.setItem("prestamos", JSON.stringify(prestamos));

    mostrar();
}

function mostrar(){

    let html = "";

    prestamos.forEach((p, index)=>{
        html += `
            <div>
                <strong>${p.nombre}</strong> - $${p.total.toFixed(2)}
            </div>
        `;
    });

    document.getElementById("lista").innerHTML = html;
}

mostrar();
