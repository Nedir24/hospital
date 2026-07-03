import pytest
import time
import os
from playwright.sync_api import Page

CAMINHO_BASE = f"file:///{os.path.abspath(os.path.dirname(__file__))}"

# RNF01: DESEMPENHO (Tempo de resposta do carregamento da página principal)
def test_rnf01_tempo_carregamento_index(page: Page):
    tempo_inicial = time.time()
    page.goto(f"{CAMINHO_BASE}/index.html")
    page.wait_for_selector("body")
    tempo_total = time.time() - tempo_inicial
    
    print(f"\n[Performance] Index carregou em {tempo_total:.2f}s")
    assert tempo_total < 3.0, f"Carregamento lento: {tempo_total:.2f}s"

# RNF02: SEGURANÇA (Garantia de que dados críticos estão protegidos contra exposição direta)
def test_rnf02_privacidade_dados_sensiveis(page: Page):
    page.goto(f"{CAMINHO_BASE}/index.html")
    # Garante que uma lista restrita não fica visível ao carregar o HTML crú sem login
    assert not page.locator("#lista-pacientes-criticos").is_visible(), "Dados sensíveis expostos por omissão."

# RNF03: USABILIDADE / RESPONSIVIDADE (Suporte a Viewports de Telemóveis)
def test_rnf03_responsividade_mobile(page: Page):
    page.set_viewport_size({"width": 390, "height": 844})  # Dimensões iPhone 13
    page.goto(f"{CAMINHO_BASE}/login.html")
    
    botao_login = page.locator("button, input[type='submit'], .btn").first
    botao_login.wait_for(state="visible", timeout=3000)
    assert botao_login.is_visible(), "O botão principal quebrou ou ficou oculto no layout Mobile."

# RNF04: ROBUSTEZ (Verificação de Integridade Física das Pastas de Assets)
def test_rnf04_integridade_arquivos_estaticos():
    diretorio_app = os.path.abspath(os.path.dirname(__file__))
    css_folder = os.path.join(diretorio_app, "css")
    js_folder = os.path.join(diretorio_app, "js")
    
    # Confirma se as pastas essenciais existem fisicamente
    assert os.path.exists(css_folder), "Pasta 'css' em falta no projeto!"
    assert os.path.exists(js_folder), "Pasta 'js' em falta no projeto!"