# Tratordom - E-commerce Agrícola

## Visão Geral
Um site de e-commerce estático simples em HTML/CSS/JavaScript para produtos agrícolas. O site está em português (Brasil) e possui funcionalidade de carrinho de compras e login via Google.

## Estrutura do Projeto
- `index.html` - Página inicial principal
- `produtos.html` - Listagem detalhada de produtos
- `carrinho.html` - Visualização e gerenciamento do carrinho
- `contatos.html` - Página de contato e localização
- `style.css` - Estilização base global
- `stylecss/` - Estilos modulares (carrinho.css, contatos.css, header.css, login.css, produtos.css)
- `script.js` - Funcionalidade do carrinho de compras (lado do cliente)
- `google-login.js` - Integração com login do Google
- `imagens/` - Ativos visuais dos produtos e interface

## Pilha Tecnológica
- HTML5 Puro, CSS3, JavaScript (sem frameworks)
- Google Identity Services (Autenticação)
- Servidor de arquivos estáticos via servidor HTTP Python

## Desenvolvimento
O projeto roda usando o servidor HTTP integrado do Python na porta 5000.

## Implantação (Deployment)
Configurado como uma implantação de site estático servindo a partir do diretório raiz.
