/* ============================================================
   TRATORDOM - SCRIPT OFICIAL (CARRINHO + ASSINATURA)
   ============================================================ */

let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

// --- 1. FUNÇÕES DO CARRINHO ---

function adicionarAoCarrinho(nome, preco) {
    carrinho.push({ nome, preco });
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    atualizarContador();
    alert(`${nome} adicionado ao carrinho!`);
}

function atualizarContador() {
    const contador = document.getElementById('contador');
    if (contador) contador.innerText = carrinho.length;
}

function renderizarCarrinho() {
    const lista = document.getElementById('lista-carrinho');
    const totalElem = document.getElementById('total');
    if (!lista) return;

    lista.innerHTML = '';
    let total = 0;

    carrinho.forEach((item, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            ${item.nome} - R$ ${item.preco.toFixed(2)}
            <span class="remover-produto" onclick="removerDoCarrinho(${index})">&times;</span>
        `;
        lista.appendChild(li);
        total += item.preco;
    });

    totalElem.innerText = `Total: R$ ${total.toFixed(2)}`;
    verificarStatusAssinante(); 
}

function removerDoCarrinho(index) {
    carrinho.splice(index, 1);
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    renderizarCarrinho();
    atualizarContador();
}

function limparCarrinho() {
    if (confirm("Limpar carrinho?")) {
        carrinho = [];
        localStorage.setItem('carrinho', JSON.stringify(carrinho));
        renderizarCarrinho();
        atualizarContador();
    }
}

// --- 2. FUNÇÕES DE ASSINATURA (PIX & WHATSAPP) ---

function assinarPlano() {
    const usuario = JSON.parse(localStorage.getItem('usuarioGoogle'));

    if (!usuario) {
        alert("Faça login para assinar o Plano VIP!");
        window.location.href = "login.html";
        return;
    }

    // --- CONFIGURAÇÕES DO NEGÓCIO ---
    const chavePix = "SEU-EMAIL-OU-CHAVE-AQUI"; 
    const foneWhatsApp = "5511999999999"; // Seu número real aqui
    const msg = `Olá! Sou ${usuario.nome} (${usuario.email}). Acabei de pagar o PIX de R$ 12,00. Pode me enviar o código VIP?`;

    // Copia a chave PIX automaticamente
    navigator.clipboard.writeText(chavePix).then(() => {
        alert(`Chave PIX Copiada: ${chavePix}\n\nAbriremos seu WhatsApp para você enviar o comprovante.`);
        window.location.href = `https://wa.me/${foneWhatsApp}?text=${encodeURIComponent(msg)}`;
    });
}

// --- 3. VALIDAÇÃO DO CÓDIGO (PÁGINA ATIVAR.HTML) ---

function verificarCodigo() {
    const input = document.getElementById('codigo-vip');
    if (!input) return;

    const codigo = input.value.trim().toUpperCase();
    const padrao = /^TD-(\d{8})-VIP$/;
    const match = codigo.match(padrao);

    if (match) {
        const n = match[1]; // Pega os 8 números
        
        // --- ALGORITMO TRATORDOM (Baseado em CPF) ---
        // Calculamos o dígito verificador usando os 7 primeiros números
        let soma = 0;
        let multiplicador = 2;

        // Multiplicamos os 7 primeiros dígitos por pesos (2, 3, 4...)
        for (let i = 6; i >= 0; i--) {
            soma += parseInt(n[i]) * multiplicador;
            multiplicador++;
        }

        // A regra do dígito: 11 menos o resto da divisão por 11
        let resto = soma % 11;
        let dvCalculado = (resto < 2) ? 0 : 11 - resto;
        if (dvCalculado === 10) dvCalculado = 1; // Ajuste para ficar com 1 dígito

        // O 8º dígito (n[7]) tem que ser igual ao dvCalculado
        if (parseInt(n[7]) === dvCalculado) {
            const usados = JSON.parse(localStorage.getItem('codigosUsados')) || [];

            if (usados.includes(codigo)) {
                alert("Este código já foi utilizado!");
                return;
            }

            usados.push(codigo);
            localStorage.setItem('codigosUsados', JSON.stringify(usados));
            localStorage.setItem('assinanteVIP', 'true');

            alert("⭐⭐⭐⭐⭐\nAUTENTICAÇÃO VIP TRATORDOM CONCLUÍDA!");
            window.location.href = "index.html";
        } else {
            alert("Código de segurança inválido ou forjado!");
        }
    } else {
        alert("Formato incorreto! Use: TD-XXXXXXXX-VIP");
    }
}

// --- 4. VERIFICAÇÃO DE STATUS ---

function verificarStatusAssinante() {
    const isVIP = localStorage.getItem('assinanteVIP') === 'true';
    const totalElem = document.getElementById("total");

    if (isVIP && totalElem && !document.querySelector('.aviso-vip')) {
        const aviso = document.createElement("p");
        aviso.className = "aviso-vip";
        aviso.style.color = "var(--accent-blue)";
        aviso.style.fontWeight = "bold";
        aviso.innerHTML = "🚀 Entrega Prioritária Ativada!";
        totalElem.after(aviso);
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    atualizarContador();
    if (document.getElementById('lista-carrinho')) renderizarCarrinho();
    verificarStatusAssinante();
});