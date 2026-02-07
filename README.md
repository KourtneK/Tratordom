# Tratordom - E-commerce Agrícola

**Nota do Autor:** Todo o código deste projeto (HTML, CSS e JavaScript) foi desenvolvido inteiramente por mim. A inteligência artificial replit foi utilizada exclusivamente para a criação e organização desta documentação.

---

## 🚀 Funcionalidades Principais

### 🛒 Sistema de Vendas
- **Catálogo Dinâmico:** Visualização clara de produtos com imagens, descrições e preços na página `produtos.html`.
- **Carrinho de Compras Inteligente:**
  - Adição de itens em tempo real.
  - Cálculo automático do valor total.
  - Contador de itens integrado ao cabeçalho.
  - Página dedicada para gerenciamento (`carrinho.html`).

### 🔐 Autenticação
- **Login com Google:** Integração com Google Identity Services para autenticação de usuários (`google-login.js`).

### 📞 Atendimento e Suporte
- **Página de Contatos Completa:**
  - Formulário de envio de mensagens com validação (via Formspree).
  - Links diretos para WhatsApp e E-mail.
  - Mapa de localização interativo (Google Maps).
  - Informações detalhadas de endereço e telefone.

### 📱 Design e Experiência do Usuário
- **Interface Responsiva:** Otimizada para computadores, tablets e smartphones através de CSS Flexbox e Grid.
- **Identidade Visual Modular:** Estilos organizados por componentes na pasta `stylecss/` (header, login, carrinho, etc.).

---

## 🛠️ Tecnologias Utilizadas

- **Front-end:**
  - **HTML5:** Estruturação semântica.
  - **CSS3:** Estilização modular e responsiva.
  - **JavaScript (ES6+):** Lógica do carrinho e integração com Google Login.
- **Integrações:**
  - **Google Identity Services:** Autenticação.
  - **Formspree:** Backend para o formulário de contato.
- **Infraestrutura:**
  - **Replit:** Ambiente de desenvolvimento e hospedagem.
  - **Python (http.server):** Servidor de arquivos estáticos.

---

## 📁 Estrutura de Arquivos

```
├── Tratordom           # Pasta raiz
├── index.html          # Página inicial
├── produtos.html       # Catálogo de produtos
├── carrinho.html       # Visualização do carrinho
├── contatos.html       # Página de contato e mapa
├── login.html          # Interface de login
├── style.css           # Estilos globais
├── stylecss/           # Estilos modulares (carrinho.css, header.css, etc.)
├── script.js           # Lógica do carrinho de compras
├── google-login.js     # Integração com login do Google
├── replit.md           # Notas técnicas do ambiente
├── README.md           # Documentação geral
└── imagens/            # Ativos visuais (produtos e interface)
```

---

## 💻 Como Executar

Para rodar este projeto:

1. No diretório raiz, execute:
   ```bash
   python3 -m http.server 5000
   ```
2. Acesse `http://localhost:5000` no navegador.

---
© 2026 Tratordom - Soluções para o Campo.
