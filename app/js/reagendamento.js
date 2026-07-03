const tbody = document.querySelector("#tabelaReagendamento tbody");
let consultaSelecionada = null;

listar();

function listar() {
    if (!tbody) return;
    tbody.innerHTML = "";

    const consultas = obterConsultas();
    
    // Mostra apenas as consultas que podem ser reagendadas (ignora as já canceladas)
    const filtradas = consultas.filter(c => c.estado !== "🔴 Cancelada");

    if (filtradas.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#718096;">Não existem consultas disponíveis para reagendar.</td></tr>`;
        return;
    }

    filtradas.forEach(c => {
        tbody.innerHTML += `
        <tr>
            <td>${c.paciente}</td>
            <td>${c.medico}</td>
            <td>${c.especialidade}</td>
            <td>${c.data}</td>
            <td>${c.hora}</td>
            <td><strong>${c.estado}</strong></td>
            <td>
                <button class="btn-alterar" onclick="selecionar(${c.id})">
                    <i class="fa-solid fa-pen-to-square"></i> Selecionar
                </button>
            </td>
        </tr>`;
    });
}

function selecionar(id) {
    consultaSelecionada = id;
    const consultas = obterConsultas();
    const consulta = consultas.find(c => c.id == id);

    if (consulta) {
        // Coloca a data e hora atuais da consulta nos campos para o utilizador alterar
        document.getElementById("editData").value = consulta.data;
        document.getElementById("editHora").value = consulta.hora;
        alert(`Consulta do(a) ${consulta.paciente} selecionada. Insira os novos dados nos campos acima.`);
    }
}

function guardarEdicao() {
    if (consultaSelecionada == null) {
        alert("Por favor, selecione primeiro uma consulta na tabela abaixo.");
        return;
    }

    const novaData = document.getElementById("editData").value;
    const novaHora = document.getElementById("editHora").value;

    if (!novaData || !novaHora) {
        alert("Preencha a nova data e hora.");
        return;
    }

    let consultas = obterConsultas();

    // Atualiza os dados da consulta mantendo o mesmo ID
    consultas = consultas.map(c => {
        if (c.id == consultaSelecionada) {
            c.data = novaData;
            c.hora = novaHora;
            c.estado = "🟡 Reagendada"; // Muda o estado de Confirmada para Reagendada
        }
        return c;
    });

    guardarConsultas(consultas);
    listar(); // Atualiza a tabela visualmente

    alert("✅ Consulta reagendada com sucesso!");
    
    // Limpa a seleção e os campos
    consultaSelecionada = null;
    if(typeof limparCampos === "function") limparCampos();
}