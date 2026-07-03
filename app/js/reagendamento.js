const API_URL = "http://127.0.0.1:5000";
let medicos = [];
let consultas = [];
let consultaSelecionada = null;

const tbody = document.getElementById("tabelaReagendamento");

async function initReagendamento() {
    await carregarMedicos();
    await carregarConsultas();
    document.getElementById("editData").addEventListener("change", carregarHorarios);
}

async function carregarMedicos() {
    try {
        const res = await fetch(`${API_URL}/medicos`);
        if (!res.ok) throw new Error();
        medicos = await res.json();
    } catch (error) {
        const fallback = await fetch("../../medicos.txt");
        const text = await fallback.text();
        medicos = JSON.parse(text);
    }
}

async function carregarConsultas() {

    const local = localStorage.getItem("consultas");

    if(local){
        consultas = JSON.parse(local);
    }else{
        const resposta = await fetch("../../consultas.txt");
        consultas = await resposta.json();
        localStorage.setItem("consultas", JSON.stringify(consultas));
    }

    renderTabela();
}
function renderTabela() {
    tbody.innerHTML = "";

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const reagendaveis = consultas.filter(c => {
        const dataConsulta = new Date(`${c.data}T${c.hora}`);
        const statusOk = c.estado === "confirmada" || c.estado === "pendente";
        return statusOk && dataConsulta >= hoje;
    });

    if (reagendaveis.length === 0) {
        tbody.innerHTML = `
        <tr><td colspan="7" style="padding:18px; text-align:center; color:#555;">Nenhuma consulta disponível para reagendamento.</td></tr>`;
        return;
    }

    reagendaveis.forEach(c => {
        tbody.innerHTML += `
        <tr>
            <td>${c.paciente}</td>
            <td>${c.medico}</td>
            <td>${c.especialidade}</td>
            <td>${formatarData(c.data)}</td>
            <td>${c.hora}</td>
            <td>${c.estado}</td>
            <td>
                <button onclick="selecionar(${c.id})">Selecionar</button>
            </td>
        </tr>`;
    });
}

function selecionar(id) {
    consultaSelecionada = consultas.find(c => c.id === id);
    if (!consultaSelecionada) return;

    document.getElementById("selecionadoPaciente").innerText = consultaSelecionada.paciente;
    document.getElementById("selecionadoMedico").innerText = consultaSelecionada.medico;
    document.getElementById("selecionadoEspecialidade").innerText = consultaSelecionada.especialidade;
    document.getElementById("editData").value = consultaSelecionada.data;
    document.getElementById("editHora").innerHTML = `<option value="">Selecionar hora</option>`;
    carregarHorarios();
}

function carregarHorarios() {
    const horaSelect = document.getElementById("editHora");
    const dataValue = document.getElementById("editData").value;
    horaSelect.innerHTML = `<option value="">Selecionar hora</option>`;

    if (!consultaSelecionada) return;
    if (!dataValue) return;

    const medico = medicos.find(m => m.nome === consultaSelecionada.medico && m.status === "ativo");
    if (!medico) return;

    medico.horarios.split(",").forEach(h => {
        horaSelect.innerHTML += `<option value="${h}">${h}</option>`;
    });
}

function guardarEdicao(){

    if(!consultaSelecionada){
        alert("Selecione uma consulta.");
        return;
    }

    const data = document.getElementById("editData").value;
    const hora = document.getElementById("editHora").value;

    if(data==="" || hora===""){
        alert("Escolha uma nova data e horário.");
        return;
    }

    const indice = consultas.findIndex(c=>c.id===consultaSelecionada.id);

    consultas[indice].data = data;
    consultas[indice].hora = hora;

    localStorage.setItem("consultas",JSON.stringify(consultas));

    alert("Consulta reagendada com sucesso.");

    consultaSelecionada=null;

    document.getElementById("selecionadoPaciente").innerHTML="-";
    document.getElementById("selecionadoMedico").innerHTML="-";
    document.getElementById("selecionadoEspecialidade").innerHTML="-";

    document.getElementById("editData").value="";
    document.getElementById("editHora").innerHTML="<option value=''>Selecionar hora</option>";

    renderTabela();

}
window.addEventListener("DOMContentLoaded", initReagendamento);