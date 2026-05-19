const VALID_ACCESS_CODE = "NEXUS2026";
const INACTIVITY_LIMIT = 5 * 60;
let connectedAccounts = [];

const loginBtn = document.getElementById("loginBtn");

if (loginBtn) {
    loginBtn.addEventListener("click", () => {
        const code = document.getElementById("accessCode").value.trim();
        const terms = document.getElementById("terms");

        if (code === "") {
            alert("Ingrese su código de acceso.");
            return;
        }

        if (!terms.checked) {
            alert("Debe aceptar los términos y condiciones.");
            return;
        }

        if (code !== VALID_ACCESS_CODE) {
            alert("Código inválido.");
            return;
        }

        sessionStorage.setItem("nexus_auth", "true");
        window.location.href = "panel.html";
    });
}

if (window.location.pathname.includes("panel.html")) {
    if (sessionStorage.getItem("nexus_auth") !== "true") {
        window.location.href = "index.html";
    }

    const gmailBtn = document.getElementById("gmailBtn");
    const outlookBtn = document.getElementById("outlookBtn");
    const accountsList = document.getElementById("accountsList");
    const searchBtn = document.getElementById("searchBtn");
    const searchInput = document.getElementById("searchInput");
    const results = document.getElementById("results");
    const logoutBtn = document.getElementById("logoutBtn");
    const timerElement = document.getElementById("timer");

    let remainingTime = INACTIVITY_LIMIT;
    let countdown;

    function resetTimer() {
        remainingTime = INACTIVITY_LIMIT;
    }

    function startTimer() {
        countdown = setInterval(() => {
            remainingTime--;

            const minutes = String(Math.floor(remainingTime / 60)).padStart(2, "0");
            const seconds = String(remainingTime % 60).padStart(2, "0");

            timerElement.textContent = ${minutes}:${seconds};

            if (remainingTime <= 0) {
                clearSession();
                alert("Sesión cerrada automáticamente por inactividad.");
                window.location.href = "index.html";
            }
        }, 1000);
    }

    function clearSession() {
        sessionStorage.clear();
        connectedAccounts = [];
    }

    ["click", "mousemove", "keydown", "scroll", "touchstart"].forEach(event => {
        document.addEventListener(event, resetTimer);
    });

    startTimer();

    function renderAccounts() {
        if (connectedAccounts.length === 0) {
            accountsList.innerHTML = "Ninguna cuenta conectada todavía.";
            return;
        }

        accountsList.innerHTML = connectedAccounts.map((account, index) => {
            return `
                <div class="${account.status === 'Conectada' ? 'account-ok' : 'account-error'}">
                    ${account.status === 'Conectada' ? '✔️' : '✖️'} 
                    Cuenta ${index + 1}: ${account.email} — ${account.status}
                </div>
            `;
        }).join("");
    }

    gmailBtn.addEventListener("click", () => {
        const demoEmail = gmail-demo-${connectedAccounts.length + 1}@gmail.com;

        connectedAccounts.push({
            email: demoEmail,
            provider: "Gmail",
            status: "Conectada"
        });

        renderAccounts();

        alert("Demo visual: Gmail conectado. Luego se reemplaza por Gmail API OAuth.");
    });

    outlookBtn.addEventListener("click", () => {
        const demoEmail = outlook-demo-${connectedAccounts.length + 1}@outlook.com;

        connectedAccounts.push({
            email: demoEmail,
            provider: "Outlook",
            status: "Conectada"
        });

        renderAccounts();

        alert("Demo visual: Hotmail/Outlook conectado. Luego se reemplaza por Microsoft Graph OAuth.");
    });

    searchBtn.addEventListener("click", () => {
        const keyword = searchInput.value.trim();

        if (connectedAccounts.length === 0) {
            alert("Primero debe conectar al menos una cuenta.");
            return;
        }

        if (keyword === "") {
            alert("Ingrese una palabra clave para buscar.");
            return;
        }

        results.innerHTML = connectedAccounts.map(account => {
            return `
                <div class="result-item">
                    <strong>${account.email}</strong><br>
                    Proveedor: ${account.provider}<br>
                    Estado: ${account.status}<br>
                    Búsqueda simultánea preparada para: <strong>${keyword}</strong><br>
                    <small>Resultado real pendiente de conexión OAuth segura.</small>
                </div>
            `;
        }).join("");
    });

    logoutBtn.addEventListener("click", () => {
        clearSession();
        window.location.href = "index.html";
    });
}
