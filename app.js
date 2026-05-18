<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NexusMail 2.0</title>

    <link rel="stylesheet" href="style.css">
</head>

<body>

<div class="container">

    <div class="badge">
        VERSIÓN 2.0 BETA
    </div>

    <h1>NexusMail</h1>

    <p class="subtitle">
        Plataforma segura de indexación temporal de correo electrónico
    </p>

    <div class="warning-box">
        No almacenamos contraseñas, archivos, ni contenido confidencial después de cerrar la sesión.
    </div>

    <input 
        type="text" 
        placeholder="Ingrese su código de acceso"
    >

    <div class="checkbox-area">
        <input type="checkbox" id="terms">
        <label for="terms">
            Acepto los términos y condiciones de uso temporal
        </label>
    </div>

    <button>
        INGRESAR A LA PLATAFORMA
    </button>

    <p class="footer-text">
        Acceso exclusivo para clientes autorizados.
    </p>

</div>

<script src="app.js"></script>

</body>
</html>
[4:04 p. m., 18/5/2026] Fanfa: He
[4:04 p. m., 18/5/2026] Fanfa: const button = document.querySelector("button");
const checkbox = document.querySelector('input[type="checkbox"]');
const accessInput = document.querySelector('input[type="text"]');

button.addEventListener("click", () => {

    const accessCode = accessInput.value.trim();

    // Verificar campo vacío
    if(accessCode === ""){
        alert("Ingrese su código de acceso.");
        return;
    }

    // Verificar términos
    if(!checkbox.checked){
        alert("Debe aceptar los términos y condiciones.");
        return;
    }

    // Código válido
    if(accessCode === "NEXUS2026"){

        button.innerText = "VERIFICANDO...";
        button.disabled = true;

        setTimeout(() => {

            alert("Acceso autorizado a NexusMail 2.0 Beta");

            // Redirección
            window.location.href = "https://gmail.com";

        }, 1500);

    } else {

        alert("Código inválido.");
    }

});
