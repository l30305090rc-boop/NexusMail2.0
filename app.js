// ========== CONFIGURACIÓN ==========
const CODIGO_VALIDO = "NEXUS2026";
const ID_CLIENTE_DE_GOOGLE = "279891205598-1cmheiplrhOOrOt63soodjn791j19kob.apps.googleusercontent.com";
const GMAIL_SCOPE = "https://www.googleapis.com/auth/gmail.readonly";
const TIEMPO_INACTIVIDAD = 5 * 60;

let tiempoRestante = TIEMPO_INACTIVIDAD;
let intervalo = null;
let gmailToken = null;
let tokenCliente = null;
let cuentas = [];

// ========== UTILIDADES ==========
function esperarGoogle() {
  return new Promise((resolve) => {
    if (window.google && google.accounts) {
      resolve();
      return;
    }
    const intervaloGoogle = setInterval(() => {
      if (window.google && google.accounts) {
        clearInterval(intervaloGoogle);
        resolve();
      }
    }, 100);
  });
}

function escaparHTML(texto) {
  if (!texto) return '';
  const div = document.createElement('div');
  div.textContent = texto;
  return div.innerHTML;
}

function mostrarEstado(mensaje, tipo) {
  const estadoDiv = document.getElementById("estado");
  if (!estadoDiv) return;
  estadoDiv.innerHTML = mensaje;
  if (tipo === "success") {
    estadoDiv.style.color = "#00ff00";
    estadoDiv.style.background = "rgba(0, 255, 0, 0.1)";
    estadoDiv.style.border = "1px solid #00ff00";
  } else if (tipo === "warning") {
    estadoDiv.style.color = "#ffaa00";
    estadoDiv.style.background = "rgba(255, 170, 0, 0.1)";
    estadoDiv.style.border = "1px solid #ffaa00";
  } else {
    estadoDiv.style.color = "#00ffff";
    estadoDiv.style.background = "rgba(0, 255, 255, 0.05)";
    estadoDiv.style.border = "1px solid rgba(0, 255, 255, 0.2)";
  }
  setTimeout(() => {
    if (estadoDiv.innerHTML === mensaje && tipo !== "success") {
      estadoDiv.innerHTML = "💡 Conecta Gmail para empezar";
      estadoDiv.style.color = "#888";
      estadoDiv.style.border = "none";
    }
  }, 4000);
}

// ========== LOGIN ==========
function validarCodigo() {
  const codigoInput = document.getElementById("codigo");
  const codigo = codigoInput.value.trim();
  const mensaje = document.getElementById("mensaje");
  mensaje.innerHTML = "";
  
  if (codigo === "") {
    mensaje.innerHTML = "✨ Ingresa el código NEXUS2026";
    mensaje.style.color = "#ffaa00";
    return;
  }
  
  if (codigo === CODIGO_VALIDO) {
    mensaje.innerHTML = "🎉 ¡Acceso concedido! Redirigiendo...";
    mensaje.style.color = "#00ff00";
    sessionStorage.setItem("acceso_validado", "true");
    setTimeout(() => {
      window.location.href = "panel.html";
    }, 800);
  } else {
    mensaje.innerHTML = "🔐 Código incorrecto. Prueba con: NEXUS2026";
    mensaje.style.color = "#ffaa00";
    codigoInput.value = "";
    codigoInput.focus();
  }
}

function verificarAcceso() {
  if (sessionStorage.getItem("acceso_validado") !== "true") {
    window.location.href = "index.html";
  }
}

// ========== GMAIL OAUTH ==========
async function iniciarGoogleOAuth() {
  mostrarEstado("🔄 Conectando con Google...", "info");
  
  if (!window.google || !google.accounts) {
    mostrarEstado("📡 Cargando API de Google...", "warning");
    await esperarGoogle();
  }
  
  try {
    tokenCliente = google.accounts.oauth2.initTokenClient({
      client_id: ID_CLIENTE_DE_GOOGLE,
      scope: GMAIL_SCOPE,
      callback: async (respuesta) => {
        if (respuesta.access_token) {
          gmailToken = respuesta.access_token;
          sessionStorage.setItem("gmail_token", gmailToken);
          await conectarGmail();
          iniciarTemporizador();
          activarDetectorInactividad();
          mostrarEstado("✅ ¡Conectado a Gmail exitosamente!", "success");
        } else {
          mostrarEstado("🔄 Selecciona una cuenta de Google", "warning");
        }
      },
    });
    tokenCliente.requestAccessToken();
  } catch (error) {
    mostrarEstado("💡 Haz clic en 'Conectar Gmail' y autoriza", "warning");
  }
}

async function conectarGmail() {
  if (!gmailToken) return;
  
  try {
    const respuesta = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/profile", {
      headers: { "Authorization": `Bearer ${gmailToken}` }
    });
    
    if (!respuesta.ok) {
      if (respuesta.status === 401) {
        sessionStorage.removeItem("gmail_token");
        gmailToken = null;
        mostrarEstado("🔁 Sesión expirada, reconecta Gmail", "warning");
      }
      return;
    }
    
    const datos = await respuesta.json();
    cuentas = [{
      email: datos.emailAddress,
      mensajes: datos.messagesTotal || 0,
      hilos: datos.threadsTotal || 0,
    }];
    renderCuentas();
    mostrarEstado(`✅ Bienvenido ${datos.emailAddress}`, "success");
    
  } catch (error) {
    console.log("Error controlado");
  }
}

function renderCuentas() {
  const contenedor = document.getElementById("lista-cuentas");
  if (!contenedor) return;
  contenedor.innerHTML = "";
  
  cuentas.forEach(cuenta => {
    const div = document.createElement("div");
    div.className = "cuenta";
    div.innerHTML = `<h3>📧 ${escaparHTML(cuenta.email)}</h3><p>📬 Mensajes: ${cuenta.mensajes.toLocaleString()}</p><p>🧵 Hilos: ${cuenta.hilos.toLocaleString()}</p>`;
    contenedor.appendChild(div);
  });
}

// ========== BÚSQUEDA ==========
async function buscarCorreos() {
  const busqueda = document.getElementById("buscar").value.trim();
  const resultadosDiv = document.getElementById("resultados");
  
  if (!busqueda) {
    resultadosDiv.innerHTML = '<div class="mensaje-info">📝 Escribe algo para buscar</div>';
    return;
  }
  
  if (!gmailToken) {
    resultadosDiv.innerHTML = '<div class="mensaje-info">🔌 Conecta Gmail para buscar</div>';
    return;
  }
  
  resultadosDiv.innerHTML = '<div class="mensaje-info">🔍 Buscando...</div>';
  
  try {
    const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(busqueda)}&maxResults=10`;
    const respuesta = await fetch(url, {
      headers: { "Authorization": `Bearer ${gmailToken}` }
    });
    
    if (!respuesta.ok) {
      if (respuesta.status === 401) {
        resultadosDiv.innerHTML = '<div class="mensaje-info">🔌 Reconecta Gmail para buscar</div>';
      }
      return;
    }
    
    const datos = await respuesta.json();
    resultadosDiv.innerHTML = "";
    
    if (!datos.messages || datos.messages.length === 0) {
      resultadosDiv.innerHTML = '<div class="mensaje-info">📭 No se encontraron correos</div>';
      return;
    }
    
    for (let msg of datos.messages) {
      try {
        const detalleResp = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject`, {
          headers: { "Authorization": `Bearer ${gmailToken}` }
        });
        const detalleData = await detalleResp.json();
        
        let from = "Desconocido", subject = "Sin asunto";
        if (detalleData.payload && detalleData.payload.headers) {
          const fromHeader = detalleData.payload.headers.find(h => h.name === "From");
          const subjectHeader = detalleData.payload.headers.find(h => h.name === "Subject");
          if (fromHeader) from = fromHeader.value;
          if (subjectHeader) subject = subjectHeader.value;
        }
        
        const div = document.createElement("div");
        div.className = "correo";
        div.innerHTML = `<strong>📧 ${escaparHTML(subject)}</strong><br>👤 ${escaparHTML(from)}<br><small>📅 ${escaparHTML(msg.id.substring(0, 15))}...</small>`;
        resultadosDiv.appendChild(div);
      } catch (error) {}
    }
    
    if (resultadosDiv.children.length > 0) {
      mostrarEstado(`📬 ${resultadosDiv.children.length} correos encontrados`, "success");
    }
  } catch (error) {}
}

// ========== TEMPORIZADOR ==========
function iniciarTemporizador() {
  if (intervalo) clearInterval(intervalo);
  tiempoRestante = TIEMPO_INACTIVIDAD;
  actualizarTemporizadorDisplay();
  
  intervalo = setInterval(() => {
    if (tiempoRestante <= 1) {
      cerrarSesion();
    } else {
      tiempoRestante--;
      actualizarTemporizadorDisplay();
    }
  }, 1000);
}

function actualizarTemporizadorDisplay() {
  const timerDiv = document.getElementById("temporizador");
  if (!timerDiv) return;
  const minutos = Math.floor(tiempoRestante / 60);
  const segundos = tiempoRestante % 60;
  timerDiv.innerHTML = `⏱️ ${minutos}:${segundos < 10 ? '0' : ''}${segundos}`;
  timerDiv.style.color = tiempoRestante <= 30 ? "#ffaa00" : "#00ffff";
}

function reiniciarTemporizador() {
  if (gmailToken && tiempoRestante > 0) {
    tiempoRestante = TIEMPO_INACTIVIDAD;
    actualizarTemporizadorDisplay();
  }
}

function activarDetectorInactividad() {
  const eventos = ["mousemove", "keydown", "click", "scroll", "touchstart"];
  eventos.forEach(evento => window.addEventListener(evento, () => reiniciarTemporizador()));
}

// ========== CIERRE DE SESIÓN ==========
function cerrarSesion() {
  gmailToken = null;
  cuentas = [];
  if (intervalo) clearInterval(intervalo);
  sessionStorage.removeItem("gmail_token");
  sessionStorage.removeItem("acceso_validado");
  document.getElementById("lista-cuentas").innerHTML = "";
  document.getElementById("resultados").innerHTML = "";
  document.getElementById("temporizador").innerHTML = "⏱️ 5:00";
  mostrarEstado("🔒 Sesión cerrada", "warning");
  setTimeout(() => window.location.href = "index.html", 1500);
}

// ========== INICIALIZACIÓN ==========
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', iniciarPanel);
} else {
  iniciarPanel();
}

function iniciarPanel() {
  if (window.location.pathname.includes("panel.html")) {
    verificarAcceso();
    const estadoDiv = document.getElementById("estado");
    if (estadoDiv) {
      estadoDiv.innerHTML = "💡 Haz clic en 'Conectar Gmail' para empezar";
      estadoDiv.style.color = "#888";
    }
    const tokenGuardado = sessionStorage.getItem("gmail_token");
    if (tokenGuardado) {
      gmailToken = tokenGuardado;
      conectarGmail();
      iniciarTemporizador();
      activarDetectorInactividad();
    }
  }
}
