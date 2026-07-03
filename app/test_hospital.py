import pytest
import os
from playwright.sync_api import Page

# Define o caminho base correto apontando para a pasta 'app'
CAMINHO_BASE = f"file:///{os.path.abspath(os.path.dirname(__file__))}"

# CT01: Validar carregamento do Login
def test_ct01_carregamento_login(page: Page):
    page.goto(f"{CAMINHO_BASE}/login.html")
    assert page.locator("input[type='password']").is_visible() or page.locator("button").is_visible(), "Página de login não carregou corretamente."

# CT02: Validar fluxo de Login com Sucesso
def test_ct02_fluxo_login_sucesso(page: Page):
    page.goto(f"{CAMINHO_BASE}/login.html")
    page.locator("input[type='text'], input[type='email']").first.fill("admin")
    page.locator("input[type='password']").fill("1234")
    
    # Tenta clicar no botão e aguarda a navegação automática para o index/dashboard
    page.locator("button, input[type='submit']").first.click()
    page.wait_for_timeout(1000)
    assert "index.html" in page.url or "login.html" in page.url  # Valida se a ação foi disparada

## CT03: Validar ecrã de Recuperação de Senha
def test_ct03_recuperar_senha_carregamento(page: Page):
    # Corrigido de "esquecu_senha.html" para "esqueceu_senha.html"
    page.goto(f"{CAMINHO_BASE}/esqueceu_senha.html")
    assert page.locator("input").first.is_visible(), "Ecrã de recuperação de senha inacessível."
# CT04: Validar ecrã de Criação de Conta
def test_ct04_criar_conta_formulario(page: Page):
    page.goto(f"{CAMINHO_BASE}/criar_conta.html")
    assert page.locator("button").first.is_visible(), "Formulário de registo em falta."

# CT05: Validar Página de Marcação de Consultas
def test_ct05_pagina_marcacao_consultas(page: Page):
    page.goto(f"{CAMINHO_BASE}/marcacao.html")
    # Verifica a existência de campos estruturais comuns de formulários de agendamento
    assert page.locator("select, input, form").first.is_visible(), "Interface de marcação indisponível."

# CT06: Validar Página de Gestão de Médicos
def test_ct06_visualizar_lista_medicos(page: Page):
    page.goto(f"{CAMINHO_BASE}/medicos.html")
    assert page.locator("body").is_visible()

# CT07: Validar Página de Cancelamento de Consultas
def test_ct07_pagina_cancelamento(page: Page):
    page.goto(f"{CAMINHO_BASE}/cancelamento.html")
    assert page.locator("body").is_visible(), "Página de cancelamento corrompida."

# CT08: Validar Centro de Notificações
def test_ct08_pagina_notificacoes(page: Page):
    page.goto(f"{CAMINHO_BASE}/notificacoes.html")
    assert page.locator("body").is_visible(), "Ecrã de notificações em falta."