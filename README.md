# Tratordom - E-commerce Agrícola

**Nota do Autor:** Todo o código deste projeto (HTML, CSS e JavaScript) foi desenvolvido inteiramente por mim. A inteligência artificial foi utilizada exclusivamente para a criação e organização desta documentação.

---

## 🚀 Funcionalidades Principais

### 🛒 Sistema de Vendas
- **Catálogo Dinâmico:** Visualização clara de produtos com imagens, descrições e preços.
- **Carrinho de Compras Inteligente:**
  - Adição de itens em tempo real.
  - Cálculo automático do valor total.
  - Contador de itens integrado ao cabeçalho.
  - Persistência visual dos itens selecionados durante a sessão (localStorage).
  - Página dedicada ao carrinho para visualização completa.
  - Funções de remover produtos individuais e limpar carrinho.
  - Finalização de compra com confirmação.

### 🔐 Autenticação e Conta
- **Página de Login:** Integração com Google Login para autenticação segura.
- **Gerenciamento de Usuário:** Exibição do nome e avatar do usuário autenticado na navegação.

### 📞 Atendimento e Suporte
- **Página de Contatos Completa:**
  - Formulário de envio de mensagens com validação e feedback imediato.
  - Links diretos para WhatsApp e E-mail.
  - Mapa de localização interativo (Google Maps).
  - Informações detalhadas de endereço e telefone.

### 📱 Design e Experiência do Usuário
- **Interface Responsiva:** Otimizada para computadores, tablets e smartphones através de CSS Flexbox e Grid.
- **Identidade Visual Temática:** Cores e elementos visuais que remetem ao ambiente agrícola (tons de verde e terra).
- **Estilos Modularizados:** CSS organizado em arquivos separados por funcionalidade (header, login).

---

## 🛠️ Tecnologias Utilizadas

- **Front-end:**
  - **HTML5:** Estruturação semântica e acessível.
  - **CSS3:** Estilização avançada, layouts flexíveis e arquivos CSS modularizados.
  - **JavaScript (ES6+):** Lógica de negócios do carrinho, interações da interface e autenticação.
- **Infraestrutura:**
  - **Replit:** Ambiente de desenvolvimento e hospedagem utilizado para a construção e testes do projeto.
  - **Python (http.server):** Utilizado internamente para servir os arquivos estáticos de forma eficiente.
- **Serviços Externos:**
  - **Google Login:** Autenticação segura com Google.
  - **Google Maps API:** Mapa interativo na página de contatos.

---

## 📁 Estrutura de Arquivos

```text
├── index.html          # Página inicial (Boas-vindas)
├── produtos.html       # Catálogo de produtos
├── carrinho.html       # Visualização e gerenciamento do carrinho
├── contatos.html       # Página de suporte e localização
├── login.html          # Página de autenticação com Google
├── style.css           # Folha de estilos principal
├── script.js           # Lógica do carrinho de compras (localStorage)
├── google-login.js     # Integração com Google Login
├── stylecss/           # Diretório com CSS modularizado
│   ├── header.css      # Estilos do cabeçalho
│   └── login.css       # Estilos da página de login
├── imagens/            # Ativos visuais (fundo.png, produtos, etc.)
├── replit.md           # Notas técnicas específicas do ambiente
└── README.md           # Documentação geral do projeto
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

### Requisitos Adicionais:
- Conexão com a internet para usar o Google Login.
- Chave de API do Google Maps configurada para exibir o mapa de forma completa.

---

## 🎯 Fluxo do Usuário

1. **Home (index.html):** Bem-vindo com link para o catálogo.
2. **Produtos (produtos.html):** Visualizar e adicionar itens ao carrinho.
3. **Carrinho (carrinho.html):** Revisar itens, remover produtos ou finalizar compra.
4. **Login (login.html):** Autenticar com Google para acessar funcionalidades de conta.
5. **Contatos (contatos.html):** Enviar mensagens, encontrar localização ou contatar via WhatsApp.

---

© 2026 Tratordom - Desenvolvimento de Soluções para o Campo.