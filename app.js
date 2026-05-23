const CODIGO_VALIDO = "NEXUS2026";

const GOOGLE_CLIENT_ID = "279891205598-1cmheip1rh00r0t63soodjn791jl9kob.apps.googleusercontent.com";

const GMAIL_SCOPE = "https://www.googleapis.com/auth/gmail.readonly";

const TIEMPO_INACTIVIDAD = 5 * 60;
let tiempoRestante = TIEMPO_INACTIVIDAD;
let intervalo = null;

let gmailToken = null;
let tokenClient = null;
let cuentas = [];

/* LOGIN */
const loginBtn = document.getElementById("loginBtn");

if (loginBtn) {
    loginBtn.addEventListener("click", () => {
        const codigo = document.getElementById("accessCode").value.trim();
        const terms = document.getElementById("terms").checked;

        if (codigo !== CODIGO_VALIDO) {
            alert("Código incorrecto.");
            return;
        }

        if (!terms) {
            alert("Debe aceptar los términos.");
            return;
        }

        sessionStorage.setItem("nexus_auth", "true");
        window.location.href = "panel.html";
    });
}

/* PANEL */
if (window.location.pathname.includes("panel.html")) {

    if (sessionStorage.getItem("nexus_auth") !== "true") {
        window.location.href = "index.html";
    }

    const gmailBtn = document.getElementById("gmailBtn");
    const outlookBtn = document.getElementById("outlookBtn");
    const searchBtn = document.getElementById("searchBtn");
    const searchInput = document.getElementById("searchInput");
    const accountsList = document.getElementById("accountsList");
    const results = document.getElementById("results");
    const logoutBtn = document.getElementById("logoutBtn");
    const timer = document.getElementById("timer");

    function esperarGoogle() {
        if (window.google && google.accounts && google.accounts.oauth2) {
            iniciarGoogleOAuth();
        } else {
            setTimeout(esperarGoogle, 300);
        }
    }

    function iniciarGoogleOAuth() {
        tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_CLIENT_ID,
            scope: GMAIL_SCOPE,
            callback: async (response) => {
                if (response.error) {
                    alert("Error conectando Gmail.");
                    return;
                }

                gmailToken = response.access_token;

                cuentas.push({
                    email: "Gmail autorizado",
                    proveedor: "Gmail",
                    estado: "Conectada"
                });

                renderCuentas();
                alert("Gmail conectado correctamente.");
            }
        });
    }

    function conectarGmail() {
        if (!tokenClient) {
            alert("Google OAuth todavía está cargando. Intenta de nuevo.");
            return;
        }

        tokenClient.requestAccessToken();
    }

    async function buscarGmail(palabra) {
        if (!gmailToken) {
            alert("Primero conecte Gmail.");
            return;
        }

        results.innerHTML = "Buscando correos...";

        try {
            const query = encodeURIComponent(palabra);

            const respuesta = await fetch(
                https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${query}&maxResults=10,
                {
                    headers: {
                        Authorization: Bearer ${gmailToken}
                    }
                }
            );

            const data = await respuesta.json();

            if (!data.messages || data.messages.length === 0) {
                results.innerHTML = "No se encontraron correos con esa búsqueda.";
                return;
            }

            let html = "";

            for (const mensaje of data.messages) {
                const detalle = await fetch(
                    https://gmail.googleapis.com/gmail/v1/users/me/messages/${mensaje.id}?format=metadata,
                    {
                        headers: {
                            Authorization: Bearer ${gmailToken}
                        }
                    }
                );

                const correo = await detalle.json();

                const headers = correo.payload.headers;

                const subject = headers.find(h => h.name === "Subject")?.value || "Sin asunto";
                const from = headers.find(h => h.name === "From")?.value || "Remitente no disponible";
                const date = headers.find(h => h.name === "Date")?.value || "";

                html += `
                    <div class="result-item">
                        <strong>${subject}</strong><br>
                        <small>De: ${from}</small><br>
                        <small>Fecha: ${date}</small><br>
                        <p>${correo.snippet || ""}</p>
                    </div>
                `;
            }

            results.innerHTML = html;

        } catch (error) {
            console.error(error);
            results.innerHTML = "Error leyendo Gmail.";
        }
    }

    function renderCuentas() {
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

    function cerrarSesion() {
        sessionStorage.clear();
        gmailToken = null;
        cuentas = [];
        window.location.href = "index.html";
    }

    function iniciarTemporizador() {
        intervalo = setInterval(() => {
            tiempoRestante--;

            const min = String(Math.floor(tiempoRestante / 60)).padStart(2, "0");
            const sec = String(tiempoRestante % 60).padStart(2, "0");

            timer.textContent = ${min}:${sec};

            if (tiempoRestante <= 0) {
                clearInterval(intervalo);
                alert("Sesión cerrada automáticamente por inactividad.");
                cerrarSesion();
            }
        }, 1000);
    }

    function reiniciarTiempo() {
        tiempoRestante = TIEMPO_INACTIVIDAD;
    }

    ["click", "mousemove", "keydown", "scroll", "touchstart"].forEach(evento => {
        document.addEventListener(evento, reiniciarTiempo);
    });

    gmailBtn.addEventListener("click", conectarGmail);

    outlookBtn.addEventListener("click", () => {
        alert("Outlook/Hotmail se conecta después con Microsoft Graph.");
    });

    searchBtn.addEventListener("click", () => {
        const palabra = searchInput.value.trim();

        if (palabra === "") {
            alert("Ingrese una palabra clave.");
            return;
        }

        buscarGmail(palabra);
    });

    logoutBtn.addEventListener("click", cerrarSesion);

    renderCuentas();
    iniciarTemporizador();
    esperarGoogle();
}
