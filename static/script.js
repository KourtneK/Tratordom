/* ============================================================
   TRATORDOM - SCRIPT OFICIAL (CARRINHO + ASSINATURA)
   ============================================================ */

let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

// --- 1. FUNÇÕES DO CARRINHO ---


// --- 1. FUNÇÃO DE ADICIONAR (Visual + Banco) ---
function adicionarAoCarrinho(nome, preco) {
    // Parte Visual que você quer manter
    carrinho.push({ nome, preco });
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    atualizarContador();

    // Parte do Banco de Dados
    const usuario = JSON.parse(localStorage.getItem('usuarioGoogle'));
    
    // Só tenta enviar para o banco se o usuário estiver logado
    if (usuario && usuario.id) {
        fetch('http://localhost:5000/adicionar-carrinho', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                usuario_id: usuario.id,
                produto_nome: nome,
                preco: preco
            })
        })
        .then(res => res.json())
        .then(data => console.log("Salvo no banco:", data))
        .catch(err => console.error("Erro ao salvar no banco:", err));
    }
}

// --- 2. ATUALIZAR CONTADOR ---
function atualizarContador() {
    const contador = document.getElementById('contador');
    if (contador) contador.innerText = carrinho.length;
}

// --- 3. RENDERIZAR (Para a página carrinho.html) ---
function renderizarCarrinho() {
    const lista = document.getElementById('lista-carrinho');
    const totalElem = document.getElementById('total');
    if (!lista) return;

    lista.innerHTML = '';
    let total = 0;

    carrinho.forEach((item, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            ${item.nome} - R$ ${parseFloat(item.preco).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
            <span class="remover-produto" style="cursor:pointer; color:red; margin-left:10px;" 
                  onclick="removerDoCarrinho(${index})">&times;</span>
        `;
        lista.appendChild(li);
        total += item.preco;
    });

    totalElem.innerText = `Total: R$ ${total.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
}

// --- 4. REMOVER E LIMPAR ---
function removerDoCarrinho(index) {
    const itemRemovido = carrinho[index]; // Pega os dados do item antes de apagar
    const usuario = JSON.parse(localStorage.getItem('usuarioGoogle'));

    // 1. Remove do Banco de Dados (se o usuário estiver logado)
    if (usuario && usuario.id) {
        fetch('http://localhost:5000/remover-carrinho', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                usuario_id: usuario.id,
                produto_nome: itemRemovido.nome
            })
        })
        .then(res => res.json())
        .then(data => console.log("Banco atualizado:", data.mensagem))
        .catch(err => console.error("Erro ao remover do banco:", err));
    }

    // 2. Lógica Visual (O que você já tinha)
    carrinho.splice(index, 1);
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    renderizarCarrinho();
    atualizarContador();
}

// --- 2. FUNÇÕES DE ASSINATURA (PIX & WHATSAPP) ---

function assinarPlano() {
    const usuario = JSON.parse(localStorage.getItem('usuarioGoogle'));

    if (!usuario) {
        alert("Faça login para assinar o Plano VIP!");
        window.location.href = "templates/login";
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
        // --- ALGORITMO TRATORDOM (Baseado em CPF) ---
        // Calculamos o dígito verificador usando os 7 primeiros números
        const n = match[1]; // Pega os 8 dígitos
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
            const usuario = JSON.parse(localStorage.getItem('usuarioGoogle'));
            const usados = JSON.parse(localStorage.getItem('codigosUsados')) || [];

            if (usados.includes(codigo)) {
                alert("Este código já foi utilizado!");
                return;
            }

            usados.push(codigo);
            localStorage.setItem('codigosUsados', JSON.stringify(usados));

            // 1. Salva no Banco de Dados via Python
            if (usuario && usuario.id) {
                fetch('http://localhost:5000/ativar-vip-banco', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ usuario_id: usuario.id })
                })
                .then(res => res.json())
                .then(data => console.log("Resposta do banco:", data.mensagem))
                .catch(err => console.error("Erro ao salvar VIP:", err));
            }

            // 2. Salva no navegador (LocalStorage)
            localStorage.setItem('assinanteVIP', 'true');

            alert("⭐⭐⭐⭐⭐\nAUTENTICAÇÃO VIP TRATORDOM CONCLUÍDA!");
            window.location.href = "index";
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

// --- FUNÇÃO DE CONFIGURAÇÃO DA PÁGINA ---
function configurarPaginaCancelamento() {
    const statusDiv = document.getElementById('status-atual');
    const btnCancelar = document.getElementById('btn-confirmar-cancelar');

    if (!statusDiv || !btnCancelar) return;

    // Procura por todas as chaves possíveis
    const v1 = localStorage.getItem('assinanteVIP');
    const v2 = localStorage.getItem('AssinanteVIP');

    if (v1 === 'true' || v2 === 'true') {
        statusDiv.innerHTML = "✅ STATUS: ASSINATURA ATIVA";
        statusDiv.style.color = "#4caf50";
        btnCancelar.style.display = "block";
    } else {
        statusDiv.innerHTML = "❌ STATUS: PLANO GRATUITO";
        statusDiv.style.color = "#ff4d4d";
        btnCancelar.style.display = "none";
    }
}

// --- FUNÇÃO DE CANCELAMENTO REAL ---
function cancelarAssinatura() {
    if (confirm("Deseja realmente cancelar sua assinatura VIP?")) {
        localStorage.removeItem('assinanteVIP');
        localStorage.removeItem('AssinanteVIP');
        window.location.href = "index";
    }
}

// Inicialização (Certifique-se de que essa parte rode)
document.addEventListener('DOMContentLoaded', () => {
    if (typeof atualizarUsuarioHeader === "function") atualizarUsuarioHeader();

    const usuarioLocal = JSON.parse(localStorage.getItem('usuarioGoogle'));

    if (usuarioLocal && usuarioLocal.email) {
        fetch('http://localhost:5000/puxar-dados-usuario', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: usuarioLocal.email, nome: usuarioLocal.nome })
        })
        .then(res => res.json())
        .then(data => {
            // Sincronização padrão
            localStorage.setItem('assinanteVIP', data.is_vip ? 'true' : 'false');
            if (typeof atualizarUsuarioHeader === "function") atualizarUsuarioHeader();

            // --- AQUI DESTRAVAMOS A PÁGINA DE CANCELAMENTO ---
            const statusTexto = document.getElementById('status-atual');
            const btnCancelar = document.getElementById('btn-confirmar-cancelar');

            if (statusTexto) {
                if (data.is_vip) {
                    statusTexto.innerHTML = "Status: <span style='color: #ffd700; font-weight: bold;'>Assinatura VIP Ativa ★</span>";
                    if (btnCancelar) btnCancelar.style.display = "block"; // Mostra o botão
                } else {
                    statusTexto.innerHTML = "Status: <span style='color: #ff4d4d;'>Você não possui assinatura ativa.</span>";
                    if (btnCancelar) btnCancelar.style.display = "none"; // Garante que fica escondido
                }
            }
        })
        .catch(err => {
            console.error("Erro ao verificar status:", err);
            const statusTexto = document.getElementById('status-atual');
            if (statusTexto) statusTexto.innerText = "Erro ao conectar com o servidor.";
        });
    }
});

// A função que o botão do teu HTML chama
function cancelarAssinatura() {
    const usuario = JSON.parse(localStorage.getItem('usuarioGoogle'));
    
    if (!confirm("Confirmar o cancelamento do seu plano VIP?")) return;

    fetch('http://localhost:5000/executar-cancelamento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: usuario.email })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === "sucesso") {
            localStorage.setItem('assinanteVIP', 'false');
            window.location.href = "/index";
        }
    });
}

    // Mantém as tuas outras funções
    if (typeof atualizarContador === "function") atualizarContador();
    if (document.getElementById('lista-carrinho')) renderizarCarrinho();