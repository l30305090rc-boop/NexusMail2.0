const CODIGO_VALIDO = "NEXUS2026";
const TIEMPO_INACTIVIDAD = 5 * 60 * 1000;

const loginBtn = document.getElementById("loginBtn");
const accessCode = document.getElementById("accessCode");
const terms = document.getElementById("terms");

if (loginBtn) {
  loginBtn.addEventListener("click", () => {
    const codigo = accessCode.value.trim();

    if (codigo === "") {
      alert("Ingrese su código de acceso.");
      return;
    }

    if (codigo !== CODIGO_VALIDO) {
      alert("Código de acceso incorrecto.");
      return;
    }

    if (!terms.checked) {
      alert("Debe aceptar los términos y condiciones.");
      return;
    }

    sessionStorage.setItem("nexus_auth", "true");

    loginBtn.innerText = "VERIFICANDO...";
    loginBtn.disabled = true;

    setTimeout(() => {
      window.location.href = "panel.html";
    }, 1200);
  });
}

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

  let cuentas = [];
  let tiempoRestante = 300;
  let intervalo;

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
  }

  function cerrarSesion() {
    limpiarSesion();
    window.location.href = "index.html";
  }

  function reiniciarTiempo() {
    tiempoRestante = 300;
  }

  function iniciarTemporizador() {
    intervalo = setInterval(() => {
      tiempoRestante--;

      if (timer) {
        const min = String(Math.floor(tiempoRestante / 60)).padStart(2, "0");
        const sec = String(tiempoRestante % 60).padStart(2, "0");
        timer.textContent = ${min}:${sec};
      }

      if (tiempoRestante <= 0) {
        clearInterval(intervalo);
        alert("Sesión cerrada automáticamente por inactividad.");
        cerrarSesion();
      }
    }, 1000);
  }

  ["click", "mousemove", "keydown", "scroll", "touchstart"].forEach(evento => {
    document.addEventListener(evento, reiniciarTiempo);
  });

  if (gmailBtn) {
    gmailBtn.addEventListener("click", () => {
      cuentas.push({
        email: gmail-demo-${cuentas.length + 1}@gmail.com,
        proveedor: "Gmail",
        estado: "Conectada"
      });

      renderCuentas();
      alert("Demo visual: Gmail conectado. Luego se reemplaza por Gmail API OAuth.");
    });
  }

  if (outlookBtn) {
    outlookBtn.addEventListener("click", () => {
      cuentas.push({
        email: outlook-demo-${cuentas.length + 1}@outlook.com,
        proveedor: "Outlook",
        estado: "Conectada"
      });

      renderCuentas();
      alert("Demo visual: Hotmail/Outlook conectado. Luego se reemplaza por Microsoft Graph OAuth.");
    });
  }

  if (searchBtn) {
    searchBtn.addEventListener("click", () => {
      const palabra = searchInput.value.trim();

      if (cuentas.length === 0) {
        alert("Primero debe conectar al menos una cuenta.");
        return;
      }

      if (palabra === "") {
        alert("Ingrese una palabra clave para buscar.");
        return;
      }

      results.innerHTML = cuentas.map(cuenta => `
        <div class="result-item">
          <strong>${cuenta.email}</strong><br>
          Proveedor: ${cuenta.proveedor}<br>
          Estado: ${cuenta.estado}<br>
          Búsqueda simultánea preparada para: <strong>${palabra}</strong><br>
          <small>Resultado real pendiente de conexión OAuth segura.</small>
        </div>
      `).join("");
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", cerrarSesion);
  }

  renderCuentas();
  iniciarTemporizador();
}
