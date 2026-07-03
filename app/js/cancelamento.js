const corpo = document.querySelector("#tabelaCancelamento tbody");

listarCancelamento();

function listarCancelamento() {
    if (!corpo) return;
    corpo.innerHTML = "";

    const consultas = obterConsultas();
    
    // Só mostra consultas que ainda não foram canceladas
    const cancelaveis = consultas.filter(c => c.estado !== "🔴 Cancelada");

    if (cancelaveis.length === 0) {
        corpo.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#718096;">Nenhuma consulta ativa disponível para cancelar.</td></tr>`;
        return;
    }

    cancelaveis.forEach(c => {
        corpo.innerHTML += `
        <tr>
            <td data-label="Paciente">${c.paciente}</td>
            <td data-label="Médico">${c.medico}</td>
            <td data-label="Especialidade">${c.especialidade}</td>
            <td data-label="Data">${c.data}</td>
            <td data-label="Hora">${c.hora}</td>
            <td data-label="Estado"><strong>${c.estado}</strong></td>
            <td data-label="Ação">
                <button class="btn-cancelar" onclick="cancelar(${c.id})" style="background-color:#dc3545; color:white; border:none; padding:6px 12px; border-radius:6px; cursor:pointer;">
                    <i class="fa-solid fa-trash-can"></i> Cancelar
                </button>
            </td>
        </tr>`;
    });
}

function cancelar(id) {
    if (!confirm("Tem a certeza que deseja cancelar esta consulta?")) return;

    let consultas = obterConsultas();

    // Muda o estado para Cancelada
    consultas = consultas.map(c => {
        if (c.id == id) {
            c.estado = "🔴 Cancelada";
        }
        return c;
    });

    guardarConsultas(consultas);
    listarCancelamento(); // Remove da lista na hora

    alert("❌ Consulta cancelada com sucesso!");
}