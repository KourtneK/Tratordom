# Tratordom - E-commerce Agrícola

**Nota do Autor:** Todo o código deste projeto (HTML, CSS e JavaScript) foi desenvolvido inteiramente por mim. A inteligência artificial foi utilizada exclusivamente para a criação e organização desta documentação.

---

## 🚀 Funcionalidades Principais

### 🛒 Sistema de Vendas
- **Catálogo Dinâmico:** Visualização de produtos com imagens, descrições e preços.
- **Carrinho de Compras:**
  - Adição de itens em tempo real.
  - Cálculo automático do valor total.
  - Contador de itens integrado ao cabeçalho.
  - Persistência visual dos itens selecionados durante a sessão.

### 📞 Atendimento e Suporte
- **Página de Contatos:**
  - Formulário de envio de mensagens com validação e feedback imediato.
  - Links diretos para WhatsApp e E-mail.
  - Mapa de localização interativo (Google Maps).
  - Informações de endereço e telefone.

### 📱 Design e Experiência do Usuário
- **Interface:** Otimizada para computadores, **NÃO** pensada para tablets e smartphones através de CSS Flexbox e Grid.
- **Identidade Visual:** Cores e elementos visuais que remetem ao ambiente agrícola (tons de verde e terra).

---

## 🛠️ Tecnologias Utilizadas

- **Back-end:**
  - **HTML5:** Estruturação semântica e acessível.
  - **JavaScript (ES6+):** Lógica de negócios do carrinho e interações da interface.
 
  - **Front-end**
  - **CSS3:** Estilização simples.
- **Infraestrutura:**
  - **Replit:** Ambiente de desenvolvimento e hospedagem utilizado para a construção e testes do projeto.
  - **Python (http.server):** Utilizado internamente para servir os arquivos estáticos de forma eficiente.

---

## 📁 Estrutura de Arquivos

```text
├── index.html          # Página inicial (Produtos e Carrinho)
├── contatos.html       # Página de suporte e localização
├── style.css           # Folha de estilos unificada
├── script.js           # Lógica do carrinho de compras
├── replit.md           # Notas técnicas específicas do ambiente
├── README.md           # Documentação geral do projeto
└── [imagens]           # Ativos visuais (milho.webp, enxada.png, etc.)
```

---

## 💻 Como Executar

Para rodar este projeto localmente ou em outros servidores:

1. Certifique-se de ter o **Python** instalado em sua máquina.
2. No diretório raiz do projeto, execute o comando:
   ```bash
   python3 -m http.server 5000
   ```
3. Acesse `http://localhost:5000` em qualquer navegador moderno.

---
© 2026 Tratordom - Desenvolvimento de Soluções para o Campo.
**EMPRESA TOTALMENTE FÍCTICIA**
