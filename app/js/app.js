console.log("Sistema Hospital Agostinho Neto iniciado.");

const utilizador = JSON.parse(localStorage.getItem("utilizador"));

if (!utilizador) {
    irParaLogin();
}

function logout() {
    localStorage.removeItem("utilizador");
    localStorage.removeItem("email");
    irParaLogin();
}

function notificar(msg) {
    alert("Notificacao: " + msg);
}

function irParaLogin() {
    const caminho = window.location.pathname.replace(/\\/g, "/");
    const estaEmSubpasta = caminho.includes("/Admin/") ||
        caminho.includes("/Recepcionista/") ||
        caminho.includes("/pacientes/") ||
        caminho.includes("/medicos/");

    window.location.href = estaEmSubpasta ? "../login.html" : "login.html";
}
