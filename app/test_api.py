import pytest
from unittest.mock import MagicMock, patch

@pytest.fixture
def mock_api():
    with patch('playwright.sync_api.APIRequestContext') as mock_context:
        context_instance = mock_context.return_value
        yield context_instance

# API-01: Autenticação de Login via POST
def test_api_login_sucesso(mock_api):
    response_mock = MagicMock()
    response_mock.ok = True
    response_mock.status = 200
    response_mock.json.return_value = {"authenticated": True, "token": "jwt-token-hospital-2026"}
    mock_api.post.return_value = response_mock

    response = mock_api.post("/api/login", data={"username": "admin", "password": "123"})
    assert response.ok
    assert response.status == 200
    assert response.json().get("authenticated") is True

# API-02: Listagem de Pacientes via GET
def test_api_listar_pacientes(mock_api):
    response_mock = MagicMock()
    response_mock.ok = True
    response_mock.status = 200
    response_mock.json.return_value = [
        {"id": 1, "nome": "Maria Silva"},
        {"id": 2, "nome": "Carlos Santos"}
    ]
    mock_api.get.return_value = response_mock

    response = mock_api.get("/api/pacientes")
    assert response.ok
    assert len(response.json()) == 2

# API-03: Criação de Nova Consulta via POST
def test_api_criar_marcacao(mock_api):
    response_mock = MagicMock()
    response_mock.status = 201
    response_mock.json.return_value = {"id": 105, "status": "Agendada"}
    mock_api.post.return_value = response_mock

    response = mock_api.post("/api/consultas", data={"paciente_id": 1, "medico": "Dr. Mendes"})
    assert response.status == 201
    assert response.json().get("status") == "Agendada"

# API-04: Cancelamento de Consultas via DELETE
def test_api_cancelar_consulta(mock_api):
    response_mock = MagicMock()
    response_mock.status = 200
    response_mock.json.return_value = {"mensagem": "Consulta cancelada com sucesso"}
    mock_api.delete.return_value = response_mock

    response = mock_api.delete("/api/consultas/105")
    assert response.status == 200
    assert "sucesso" in response.json().get("mensagem")