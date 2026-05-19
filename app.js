// Constantes
const CODIGO_VALIDO = "NEXUS2026"; // Solo referencia, la validación ya se hizo en index.html
const TIEMPO_INACTIVIDAD_SEG = 5 * 60; // 5 minutos

// Elementos del DOM
const gmailBtn = document.getElementById("gmailBtn");
const outlookBtn = document.getElementById("outlookBtn");
const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const accountsList = document.getElementById("accountsList");
const resultsDiv = document.getElementById("results");
const logoutBtn = document.getElementById("logoutBtn");
const timerSpan = document.getElementById("timer");

let cuentas = [];           // Lista de cuentas conectadas
let tiempoRestante = TIEMPO_INACTIVIDAD_SEG;
let intervalo = null;
let buscando = false;

// --- Verificación de sesión ---
if (!sessionStorage.getItem("nexus_auth") === "true") {
    window.location.href = "index.html";
}

// --- Funciones auxiliares ---
function renderCuentas() {
    if (!accountsList) return;
    if (cuentas.length === 0) {
        accountsList.innerHTML = "Ninguna cuenta conectada todavía.";
        return;
    }
    accountsList.innerHTML = cuentas.map((cuenta, index) => `
        <div class="account-ok">
            ✔️ Cuenta ${index + 1}: ${cuenta.email} — ${cuenta.estado}
        </div>
    `).join("");
}

function limpiarSesion() {
    sessionStorage.clear();
    cuentas = [];
    if (intervalo) {
        clearInterval(intervalo);
        intervalo = null;
    }
}

function cerrarSesion() {
    limpiarSesion();
    window.location.href = "index.html";
}

function reiniciarTiempo() {
    tiempoRestante = TIEMPO_INACTIVIDAD_SEG;
    actualizarTextoContador();
}

function actualizarTextoContador() {
    if (timerSpan) {
        const min = String(Math.floor(tiempoRestante / 60)).padStart(2, "0");
        const seg = String(tiempoRestante % 60).padStart(2, "0");
        timerSpan.textContent = `${min}:${seg}`;
    }
}

function iniciarTemporizador() {
    if (intervalo) clearInterval(intervalo);
    intervalo = setInterval(() => {
        if (tiempoRestante <= 0) {
            clearInterval(intervalo);
            intervalo = null;
            alert("Sesión cerrada automáticamente por inactividad.");
            cerrarSesion();
        } else {
            tiempoRestante--;
            actualizarTextoContador();
        }
    }, 1000);
}

// --- Eventos de inactividad (reinician el contador) ---
const eventosActividad = ["click", "mousemove", "keydown", "scroll", "touchstart"];
eventosActividad.forEach(evento => {
    document.addEventListener(evento, reiniciarTiempo);
});

// --- Conectar cuentas (simulación con OAuth en el futuro) ---
function conectarCuenta(proveedor, dominio) {
    // Evitar duplicados exactos (simplificado)
    const emailDemo = `${proedor.toLowerCase()}-demo-${cuentas.length + 1}@${dominio}`;
    if (cuentas.some(c => c.email === emailDemo)) {
        alert(`La cuenta ${emailDemo} ya está conectada.`);
        return;
    }
    cuentas.push({
        email: emailDemo,
        proveedor: proveedor,
        estado: "Conectada (demo)"
    });
    renderCuentas();
    alert(`Demo: ${proveedor} conectado correctamente.\nEn un entorno real se usaría OAuth 2.0.`);
}

if (gmailBtn) {
    gmailBtn.addEventListener("click", () => conectarCuenta("Gmail", "gmail.com"));
}
if (outlookBtn) {
    outlookBtn.addEventListener("click", () => conectarCuenta("Outlook/Hotmail", "outlook.com"));
}

// --- Búsqueda simultánea ---
if (searchBtn) {
    searchBtn.addEventListener("click", async () => {
        const palabra = searchInput.value.trim();
        if (cuentas.length === 0) {
            alert("Primero debe conectar al menos una cuenta.");
            return;
        }
        if (palabra === "") {
            alert("Ingrese una palabra clave para buscar.");
            return;
        }
        if (buscando) return;
        buscando = true;
        const originalText = searchBtn.innerText;
        searchBtn.innerText = "BUSCANDO...";
        searchBtn.disabled = true;

        // Simulamos búsqueda asíncrona (en el futuro aquí irían las llamadas a APIs)
        await new Promise(resolve => setTimeout(resolve, 1000));

        resultsDiv.innerHTML = cuentas.map(cuenta => `
            <div class="result-item">
                <strong>${escapeHtml(cuenta.email)}</strong><br>
                Proveedor: ${cuenta.proveedor}<br>
                Búsqueda: <strong>${escapeHtml(palabra)}</strong><br>
                <small>✅ Simulación: se encontrarían correos relacionados con "${palabra}" (integración real pendiente).</small>
            </div>
        `).join("");

        searchBtn.innerText = originalText;
        searchBtn.disabled = false;
        buscando = false;
    });
}

// --- Cerrar sesión manual ---
if (logoutBtn) {
    logoutBtn.addEventListener("click", cerrarSesion);
}

// --- Pequeña utilidad para evitar XSS ---
function escapeHtml(str) {
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// --- Inicialización ---
renderCuentas();
iniciarTemporizador();
