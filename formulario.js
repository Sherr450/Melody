const formulario = document.querySelector("#registro");

const camposTexto = [
    { elemento: document.querySelector("#nombres"),     mensaje: "avisoNombres", nombre: "El nombre" },
    { elemento: document.querySelector("#apellidoUno"), mensaje: "avisoPaterno", nombre: "El apellido paterno" },
    { elemento: document.querySelector("#apellidoDos"), mensaje: "avisoMaterno", nombre: "El apellido materno" }
];

const fechaUsuario  = document.querySelector("#fecha");
const edadUsuario   = document.querySelector("#anios");
const numeroCuenta  = document.querySelector("#numeroCuenta");
const correoUsuario = document.querySelector("#email");

const EDAD_MINIMA = 18;
const EDAD_MAXIMA = 100;

// La fecha no puede ser futura
const hoy = new Date();
fechaUsuario.max = hoy.getFullYear() + "-" +
    String(hoy.getMonth() + 1).padStart(2, "0") + "-" +
    String(hoy.getDate()).padStart(2, "0");

function marcar(campo, aviso, texto) {
    aviso.textContent = texto;
    campo.className = texto ? "invalido" : "valido";
    return !texto;
}

// Calcula la edad a partir de la fecha de nacimiento
function edadDesdeFecha(valor) {
    const [anio, mes, dia] = valor.split("-").map(Number);
    let edad = hoy.getFullYear() - anio;
    const mesHoy = hoy.getMonth() + 1;
    if (mesHoy < mes || (mesHoy === mes && hoy.getDate() < dia)) edad--;
    return edad;
}

// Nombre y apellidos: solo letras y espacios, mayúsculas, máx. 100
function revisarLetras(objeto) {
    objeto.elemento.value = objeto.elemento.value
        .replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, "")
        .toLocaleUpperCase("es-MX")
        .substring(0, 100);

    const aviso = document.getElementById(objeto.mensaje);
    const texto = objeto.elemento.value.trim();

    if (texto.length === 0) {
        return marcar(objeto.elemento, aviso, objeto.nombre + " es obligatorio.");
    }
    if (!/[AEIOUÁÉÍÓÚÜ]/.test(texto)) {
        return marcar(objeto.elemento, aviso, objeto.nombre + " debe tener al menos una vocal.");
    }
    return marcar(objeto.elemento, aviso, "");
}

// Fecha de nacimiento + mayoría de edad
function revisarFecha() {
    const aviso = document.querySelector("#avisoFecha");

    if (!fechaUsuario.value) {
        bloquearCuenta(true);
        return marcar(fechaUsuario, aviso, "Selecciona tu fecha de nacimiento.");
    }

    const edad = edadDesdeFecha(fechaUsuario.value);

    if (edad < 0) {
        bloquearCuenta(true);
        return marcar(fechaUsuario, aviso, "La fecha no puede ser futura.");
    }
    if (edad > EDAD_MAXIMA) {
        bloquearCuenta(true);
        return marcar(fechaUsuario, aviso, "La fecha no es coherente (más de 100 años).");
    }
    if (edad < EDAD_MINIMA) {
        bloquearCuenta(true);
        return marcar(fechaUsuario, aviso, "No puedes registrarte porque eres menor de edad.");
    }

    bloquearCuenta(false);
    return marcar(fechaUsuario, aviso, "");
}

// El número de cuenta solo se habilita si es mayor de edad
function bloquearCuenta(bloquear) {
    numeroCuenta.disabled = bloquear;
    if (bloquear) {
        numeroCuenta.value = "";
        numeroCuenta.className = "";
        document.querySelector("#avisoNumeroCuenta").textContent = "";
    }
}

// Edad: solo números, máx. 3 dígitos, 1–100 y que coincida con la fecha
function revisarEdad() {
    edadUsuario.value = edadUsuario.value.replace(/\D/g, "").substring(0, 3);
    const aviso = document.querySelector("#avisoEdad");

    if (edadUsuario.value === "") {
        return marcar(edadUsuario, aviso, "Escribe tu edad.");
    }

    const edad = parseInt(edadUsuario.value, 10);

    if (edad < 1 || edad > EDAD_MAXIMA) {
        return marcar(edadUsuario, aviso, "Escribe una edad coherente (de 1 a 100).");
    }
    if (edad < EDAD_MINIMA) {
        return marcar(edadUsuario, aviso, "No puedes registrarte porque eres menor de edad.");
    }
    if (fechaUsuario.value && edad !== edadDesdeFecha(fechaUsuario.value)) {
        return marcar(edadUsuario, aviso, "La edad no coincide con la fecha de nacimiento.");
    }

    return marcar(edadUsuario, aviso, "");
}

// Número de cuenta: solo números, exactamente 16, mostrados en grupos de 4
function revisarNumeroCuenta() {
    const digitos = numeroCuenta.value.replace(/\D/g, "").substring(0, 16);
    numeroCuenta.value = digitos.replace(/(\d{4})(?=\d)/g, "$1 ");
    const aviso = document.querySelector("#avisoNumeroCuenta");

    if (numeroCuenta.disabled) {
        return marcar(numeroCuenta, aviso, "Primero captura una fecha de mayor de edad.");
    }
    if (digitos.length !== 16) {
        return marcar(numeroCuenta, aviso, "Ingresa exactamente 16 números.");
    }
    return marcar(numeroCuenta, aviso, "");
}

// Correo: formato válido y dominio permitido
const dominiosPermitidos = [
    "gmail.com", "hotmail.com", "outlook.com", "yahoo.com", "live.com", "icloud.com"
];

function revisarCorreo() {
    const aviso = document.querySelector("#avisoCorreo");
    const correo = correoUsuario.value.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
        return marcar(correoUsuario, aviso, "El formato del correo no es correcto.");
    }

    const dominio = correo.split("@")[1];
    const permitido = dominiosPermitidos.includes(dominio) ||
        dominio.endsWith(".gob.mx") || dominio.endsWith(".edu.mx");

    if (!permitido) {
        return marcar(correoUsuario, aviso,
            "Usa un correo @gmail.com, @hotmail.com, @outlook.com, .gob.mx, etc.");
    }
    return marcar(correoUsuario, aviso, "");
}

// Revisión mientras se escribe
camposTexto.forEach(function (campo) {
    campo.elemento.addEventListener("input", function () { revisarLetras(campo); });
});
fechaUsuario.addEventListener("change", function () {
    revisarFecha();
    if (edadUsuario.value) revisarEdad();
});
edadUsuario.addEventListener("input", revisarEdad);
numeroCuenta.addEventListener("input", revisarNumeroCuenta);
correoUsuario.addEventListener("input", revisarCorreo);

// Al enviar
formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();

    const resultado = document.querySelector("#resultado");

    const textosCorrectos = camposTexto.map(revisarLetras);
    const fechaCorrecta   = revisarFecha();
    const edadCorrecta    = revisarEdad();
    const cuentaCorrecta  = revisarNumeroCuenta();
    const correoCorrecto  = revisarCorreo();

    const todoCorrecto = textosCorrectos.every(Boolean) &&
        fechaCorrecta && edadCorrecta && cuentaCorrecta && correoCorrecto;

    if (todoCorrecto) {
        window.location.href = "index.html?plan=premium";
    } else {
        resultado.textContent = "Existen datos incorrectos. Revisa los campos.";
        resultado.className = "incorrecto";
    }
});
