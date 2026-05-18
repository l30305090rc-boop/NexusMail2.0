const button = document.querySelector("button");
const checkbox = document.querySelector('input[type="checkbox"]');
const accessInput = document.querySelector('input[type="text"]');

button.addEventListener("click", () => {

    const accessCode = accessInput.value.trim();

    if(accessCode === ""){
        alert("Ingrese su código de acceso.");
        return;
    }

    if(!checkbox.checked){
        alert("Debe aceptar los términos y condiciones.");
        return;
    }

    button.innerText = "VERIFICANDO...";
    button.disabled = true;

    setTimeout(() => {

        alert("Acceso autorizado a NexusMail 2.0 Beta");

        button.innerText = "INGRESAR A LA PLATAFORMA";
        button.disabled = false;

    },2000);

});
