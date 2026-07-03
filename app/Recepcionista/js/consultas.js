// =========================================================================
// VARIÁVEIS GLOBAIS E ESTADO DA APLICAÇÃO
// =========================================================================
let consultas = [];
let pacientes = [];
let medicos = [];
let consultaEmEdicao = null;

// =========================================================================
// INICIALIZADORES DE PÁGINA (ROTEAMENTO)
// =========================================================================

// Inicialização para a página de Gestão de Consultas / Dashboard
async function initConsultas() {
    marcarSidebarAtiva("consultas");
    [consultas, pacientes, medicos] = await Promise.all([loadConsultas(), loadPacientes(), loadMedicos()]);

    // Configura os ouvintes de evento para filtros e busca
    const pesquisaInput = document.getElementById("pesquisaConsulta");
    const filtroSelect = document.getElementById("filtroEstado");

    if (pesquisaInput) pesquisaInput.addEventListener("input", renderTabela);
    if (filtroSelect) filtroSelect.addEventListener("change", renderTabela);

    preencherSelectPacientes();
    preencherSelectEspecialidades();
    renderTabela();
}

// Inicialização para a página de Listagem de Pacientes Ativos
async function initPacientesAtivos() {
    marcarSidebarAtiva("pacientes");
    // Carrega em paralelo os dados necessários dos seus arquivos/APIs
    [consultas, pacientes] = await Promise.all([loadConsultas(), loadPacientes()]);
    
    renderTabelaPacientesAtivos();
}

// =========================================================================
// MÓDULO: GESTÃO DE CONSULTAS (DASHBOARD)
// =========================================================================

function preencherSelectPacientes() {
    const select = document.getElementById("consultaPaciente");
    if (!select) return;
    select.innerHTML = '<option value="">Selecionar paciente</option>' +
        pacientes.map(p => `<option value="${escapeHtml(p.nome)}">${escapeHtml(p.nome)}</option>`).join("");
}

function preencherSelectEspecialidades() {
    const select = document.getElementById("consultaEspecialidade");
    if (!select) return;
    const cacheEspecialidades = [...new Set(medicos.map(m => m.especialidade).filter(Boolean))];
    select.innerHTML = '<option value="">Selecionar especialidade</option>' +
        cacheEspecialidades.map(e => `<option value="${escapeHtml(e)}">${escapeHtml(e)}</option>`).join("");
}

function preencherMedicosModal() {
    const esp = document.getElementById("consultaEspecialidade").value;
    const select = document.getElementById("consultaMedico");
    if (!select) return;
    const filtrados = medicos.filter(m => !esp || m.especialidade === esp);
    select.innerHTML = '<option value="">Selecionar médico</option>' +
        filtrados.map(m => `<option value="${escapeHtml(m.nome)}" data-esp="${escapeHtml(m.especialidade)}">${escapeHtml(m.nome)}</option>`).join("");
}

function atualizarCards() {
    const cardPendentes = document.getElementById("cardPendentes");
    const cardConfirmadas = document.getElementById("cardConfirmadas");
    const cardCanceladas = document.getElementById("cardCanceladas");

    if (cardPendentes) cardPendentes.innerText = consultas.filter(c => c.estado === "pendente").length;
    if (cardConfirmadas) cardConfirmadas.innerText = consultas.filter(c => c.estado === "confirmada").length;
    if (cardCanceladas) cardCanceladas.innerText = consultas.filter(c => c.estado === "cancelada").length;
}

function renderTabela() {
    const tbody = document.getElementById("tabelaConsultas");
    if (!tbody) return;

    const termo = document.getElementById("pesquisaConsulta")?.value.trim().toLowerCase() || "";
    const estado = document.getElementById("filtroEstado")?.value || "";

    let lista = consultas.slice().sort((a, b) => compareConsultas(a, b));

    if (estado) lista = lista.filter(c => c.estado === estado);
    if (termo) {
        lista = lista.filter(c =>
            (c.paciente || "").toLowerCase().includes(termo) ||
            (c.medico || "").toLowerCase().includes(termo) ||
            (c.especialidade || "").toLowerCase().includes(termo)
        );
    }

    atualizarCards();

    if (lista.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:20px;color:#777;">Nenhuma consulta encontrada.</td></tr>`;
        return;
    }

    tbody.innerHTML = lista.map(c => `
        <tr>
            <td>${escapeHtml(c.paciente)}</td>
            <td>${escapeHtml(c.medico)}</td>
            <td>${escapeHtml(c.especialidade || "")}</td>
            <td>${formatDate(c.data)}</td>
            <td>${escapeHtml(c.hora)}</td>
            <td>${estadoBadge(c.estado)}</td>
            <td>
                ${c.estado === "pendente" ? `<button class="confirm" type="button" onclick="confirmarConsulta(${c.id})">Confirmar</button>` : ""}
                ${c.estado !== "cancelada" && c.estado !== "realizada" ? `<button class="edit" type="button" onclick="abrirModalReagendar(${c.id})">Reagendar</button>` : ""}
                ${c.estado !== "cancelada" && c.estado !== "realizada" ? `<button class="cancel" type="button" onclick="cancelarConsulta(${c.id})">Cancelar</button>` : ""}
                <button class="view" type="button" onclick="verDetalhes(${c.id})">Detalhes</button>
            </td>
        </tr>
    `).join("");
}

function abrirModalMarcar() {
    consultaEmEdicao = null;
    document.getElementById("modalTitulo").innerText = "Marcar Consulta";
    document.getElementById("consultaPaciente").value = "";
    document.getElementById("consultaEspecialidade").value = "";
    preencherMedicosModal();
    document.getElementById("consultaData").value = "";
    document.getElementById("consultaHora").value = "";
    document.getElementById("modalConsulta").style.display = "flex";
}

function abrirModalReagendar(id) {
    const consulta = consultas.find(c => c.id === id);
    if (!consulta) return;

    consultaEmEdicao = consulta;
    document.getElementById("modalTitulo").innerText = "Reagendar Consulta";
    document.getElementById("consultaPaciente").value = consulta.paciente;
    document.getElementById("consultaEspecialidade").value = consulta.especialidade || "";
    preencherMedicosModal();
    document.getElementById("consultaMedico").value = consulta.medico;
    document.getElementById("consultaData").value = consulta.data;
    document.getElementById("consultaHora").value = consulta.hora;
    document.getElementById("modalConsulta").style.display = "flex";
}

function fecharModal() {
    document.getElementById("modalConsulta").style.display = "none";
    consultaEmEdicao = null;
}

async function guardarConsulta() {
    const paciente = document.getElementById("consultaPaciente").value.trim();
    const medicoOpt = document.getElementById("consultaMedico");
    const medico = medicoOpt.value.trim();
    const especialidade = document.getElementById("consultaEspecialidade").value.trim() ||
        medicoOpt.selectedOptions[0]?.dataset.esp || "";
    const data = document.getElementById("consultaData").value;
    const hora = document.getElementById("consultaHora").value;

    if (!paciente || !medico || !data || !hora) {
        alert("Preencha todos os campos obrigatórios.");
        return;
    }

    try {
        if (consultaEmEdicao) {
            await atualizarConsulta(consultaEmEdicao.id, { paciente, medico, especialidade, data, hora, estado: "pendente" });
        } else {
            await criarConsulta({ paciente, medico, especialidade, data, hora });
        }
        consultas = await loadConsultas();
        fecharModal();
        renderTabela();
    } catch (error) {
        alert(error.message || "Não foi possível guardar a consulta.");
    }
}

async function confirmarConsulta(id) {
    try {
        await atualizarConsulta(id, { estado: "confirmada" });
        consultas = await loadConsultas();
        renderTabela();
    } catch (error) {
        alert(error.message || "Não foi possível confirmar a consulta.");
    }
}

async function cancelarConsulta(id) {
    if (!confirm("Deseja cancelar esta consulta?")) return;
    try {
        await atualizarConsulta(id, { estado: "cancelada" });
        consultas = await loadConsultas();
        renderTabela();
    } catch (error) {
        alert(error.message || "Não foi possível cancelar a consulta.");
    }
}

function verDetalhes(id) {
    const c = consultas.find(item => item.id === id);
    if (!c) return;

    const modalDetalhes = document.getElementById("modalDetalhes");
    const conteudo = document.getElementById("detalhesConteudo");

    if (conteudo) {
        conteudo.innerHTML = `
            <p><strong>Paciente:</strong> ${escapeHtml(c.paciente)}</p>
            <p><strong>Médico:</strong> ${escapeHtml(c.medico)}</p>
            <p><strong>Especialidade:</strong> ${escapeHtml(c.especialidade || "—")}</p>
            <p><strong>Data:</strong> ${formatDate(c.data)}</p>
            <p><strong>Hora:</strong> ${escapeHtml(c.hora)}</p>
            <p><strong>Estado:</strong> ${estadoBadge(c.estado)}</p>
            <p><strong>Sintomas:</strong> ${escapeHtml(c.sintomas ? c.sintomas.join(', ') : "Não informados")}</p>
        `;
    }
    if (modalDetalhes) modalDetalhes.style.display = "flex";
}

function fecharDetalhes() {
    document.getElementById("modalDetalhes").style.display = "none";
}

// =========================================================================
// MÓDULO: LISTAGEM DE PACIENTES COM CONSULTA MARCADA (`pacientes.html`)
// =========================================================================

function renderTabelaPacientesAtivos() {
    const tbody = document.getElementById("pacientesTabela");
    if (!tbody) return; // Segurança para rodar apenas se o elemento existir na tela

    tbody.innerHTML = "";

    // Filtra consultas removendo as canceladas (mantém pendentes, confirmadas e realizadas se desejar)
    const consultasAtivas = consultas.filter(c => c.estado !== "cancelada");

    if (consultasAtivas.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:20px; color:#777;">Nenhum paciente com consulta ativa encontrado.</td></tr>`;
        return;
    }

    // Filtro de Chave Única (Evita duplicar paciente na lista se ele tiver mais de um agendamento)
    const mapaPacientes = new Map();

    consultasAtivas.forEach(c => {
        const dataFormatada = typeof formatDate === "function" ? formatDate(c.data) : c.data;
        const sintomasTexto = c.sintomas && c.sintomas.length > 0 ? c.sintomas.join(', ') : "Rotina / Geral";
        
        // A chave em caixa baixa (.toLowerCase()) evita duplicações por erros de digitação
        mapaPacientes.set(c.paciente.toLowerCase(), {
            nomeOriginal: c.paciente,
            sintomas: sintomasTexto,
            agendaInfo: `${dataFormatada} às ${escapeHtml(c.hora)}`,
            idConsulta: c.id
        });
    });

    // Converte o mapa para linhas de tabela HTML
    tbody.innerHTML = Array.from(mapaPacientes.values()).map(p => `
        <tr>
            <td style="text-transform: capitalize;"><strong>${escapeHtml(p.nomeOriginal)}</strong></td>
            <td><span style="font-size:13px; color:#666;">${escapeHtml(p.sintomas)}</span></td>
            <td>${p.agendaInfo}</td>
            <td>
                <button class="view" type="button" onclick="verDetalhes(${p.idConsulta})">
                    <i class="fa fa-eye"></i> Detalhes
                </button>
            </td>
        </tr>
    `).join("");
}

// =========================================================================
// GATILHO DE ROTEAMENTO EXECUTADO AO CARREGAR A PÁGINA
// =========================================================================
window.addEventListener("DOMContentLoaded", () => {
    // 1. Se contiver a tabela padrão de consultas, inicializa fluxo do Dashboard
    if (document.getElementById("tabelaConsultas")) {
        initConsultas();
    } 
    // 2. Se contiver o ID da tabela de pacientes, inicializa o fluxo de listagem de Pacientes
    else if (document.getElementById("pacientesTabela")) {
        initPacientesAtivos();
    }
});