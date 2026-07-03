window.addEventListener("DOMContentLoaded", () => {
    localStorage.removeItem("utilizador");

    const form = document.getElementById("loginForm");
    if (!form) {
        console.error("loginForm não encontrado");
        return;
    }

    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        const email = document.getElementById("email").value.trim();
        const senha = document.getElementById("senha").value;
        const lembrar = document.getElementById("lembrar").checked;

        try {
            const resposta = await fetch("http://127.0.0.1:5000/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, senha })
            });

            const dados = await resposta.json();

            if (dados.sucesso) {
                if (lembrar) {
                    localStorage.setItem("email", email);
                } else {
                    localStorage.removeItem("email");
                }

                const tipo = String(dados.tipo || "").toLowerCase();
                const utilizador = { ...dados, email };
                localStorage.setItem("utilizador", JSON.stringify(utilizador));

                if (tipo === "admin") {
                    window.location.href = "Admin/index.html";
                } else if (tipo === "rececao") {
                    window.location.href = "Recepcionista/index.html";
                } else {
                    window.location.href = "pacientes/index.html";
                }
            } else {
                document.getElementById("mensagem").style.color = "red";
                document.getElementById("mensagem").innerHTML = dados.mensagem;
            }
        } catch (erro) {
            document.getElementById("mensagem").style.color = "red";
            document.getElementById("mensagem").innerHTML = "Erro ao comunicar com o servidor.";
            console.error(erro);
        }
    });
});

window.addEventListener("load", () => {
    localStorage.removeItem("email");
    document.getElementById("email").value = "";
    document.getElementById("senha").value = "";
    document.getElementById("lembrar").checked = false;
});
