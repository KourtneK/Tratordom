/* ============================================================
   TRATORDOM - SCRIPT OFICIAL (CARRINHO + ASSINATURA)
   ============================================================ */

let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

// --- 1. FUNÇÕES DO CARRINHO ---

function adicionarAoCarrinho(nome, preco) {
    carrinho.push({ nome, preco });
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    atualizarContador();

    const usuario = JSON.parse(localStorage.getItem('usuarioGoogle'));
    
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
            ${item.nome} - R$ ${parseFloat(item.preco).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
            <span class="remover-produto" style="cursor:pointer; color:red; margin-left:10px;" 
                  onclick="removerDoCarrinho(${index})">&times;</span>
        `;
        lista.appendChild(li);
        total += item.preco;
    });

    totalElem.innerText = `Total: R$ ${total.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
}

// FUNÇÃO DE REMOVER ÚNICA E CORRIGIDA
function removerDoCarrinho(index) {
    const itemRemovido = carrinho[index];
    const usuario = JSON.parse(localStorage.getItem('usuarioGoogle'));

    // 1. Remove do LocalStorage (Visual)
    carrinho.splice(index, 1);
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    renderizarCarrinho();
    atualizarContador();

    // 2. Remove do Banco de Dados
    if (usuario && usuario.id) {
        fetch('http://localhost:5000/remover-item-carrinho', {
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
}

// FUNÇÃO DE LIMPAR CARRINHO
function limparCarrinho() {
    if (carrinho.length === 0) return; // Se já está vazio, não faz nada

    if (confirm("Deseja realmente esvaziar todo o seu carrinho?")) {
        const usuario = JSON.parse(localStorage.getItem('usuarioGoogle'));

        // 1. Limpa localmente (Visual)
        carrinho = [];
        localStorage.setItem('carrinho', JSON.stringify(carrinho));
        renderizarCarrinho();
        atualizarContador();

        // 2. Limpa no Banco de Dados
        if (usuario && usuario.id) {
            fetch('http://localhost:5000/limpar-carrinho-banco', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuario_id: usuario.id })
            })
            .then(res => res.json())
            .then(data => console.log("Servidor:", data.mensagem))
            .catch(err => console.error("Erro ao limpar banco:", err));
        }
    }
}

// FUNÇÃO DE FINALIZAR COMPRA

function finalizarCompra() {
    // 1. Verifica se há itens
    if (carrinho.length === 0) {
        if (typeof mostrarNotificacao === "function") {
            mostrarNotificacao("Seu carrinho está vazio!", "#f44336");
        } else {
            alert("Seu carrinho está vazio!");
        }
        return;
    }

    // 2. Verifica se o usuário está logado
    const usuario = JSON.parse(localStorage.getItem('usuarioGoogle'));
    if (!usuario) {
        if (typeof mostrarNotificacao === "function") {
            mostrarNotificacao("Faça login para finalizar a compra!", "#f44336");
        } else {
            alert("Faça login para finalizar a compra!");
        }
        setTimeout(() => window.location.href = "/login", 2000);
        return;
    }

    // --- PROCESSO DE FINALIZAÇÃO ---

    // A. Copia a chave PIX e MOSTRA O ALERT
    const chavePix = "SUA-CHAVE-PIX-AQUI"; 
    navigator.clipboard.writeText(chavePix).then(() => {
        // Mostra o alert que você pediu
        alert("Chave PIX copiada com sucesso! Pague para concluir seu pedido.");
        
        // B. Salva o Log no Banco (após o alert ser fechado)
        const totalCompra = carrinho.reduce((sum, item) => sum + item.preco, 0);
        const nomesItens = carrinho.map(i => i.nome).join(", ");

        fetch('http://localhost:5000/salvar-pedido', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                usuario_id: usuario.id,
                itens: nomesItens,
                total: totalCompra
            })
        }).catch(err => console.error("Erro ao salvar log:", err));

        // C. Limpa o carrinho (sua função do script.js)
        limparCarrinho();

        // D. Redireciona para o WhatsApp
        window.location.href = "https://wa.me/5511999999999"; 
    });
}
        

// --- 2. FUNÇÕES DE ASSINATURA ---

function assinarPlano() {
    const usuario = JSON.parse(localStorage.getItem('usuarioGoogle'));
    if (!usuario) {
        alert("Faça login para assinar o Plano VIP!");
        window.location.href = "login";
        return;
    }

    const chavePix = "SUA-CHAVE-PIX-AQUI"; // Substitua pela sua chave PIX real
    const foneWhatsApp = "5511999999999"; // Substitua pelo número do WhatsApp
    const msg = `Olá! Sou ${usuario.nome} (${usuario.email}). Acabei de pagar o PIX de R$ 12,00. Pode me enviar o código VIP?`;

    navigator.clipboard.writeText(chavePix).then(() => {
        alert(`Chave PIX Copiada: ${chavePix}\n\nAbriremos seu WhatsApp.`);
        window.location.href = `https://wa.me/${foneWhatsApp}?text=${encodeURIComponent(msg)}`;
    });
}

// --- 3. VALIDAÇÃO E STATUS ---

function verificarCodigo() {
    const input = document.getElementById('codigo-vip');
    if (!input) return;

    const codigo = input.value.trim().toUpperCase();
    const padrao = /^TD-(\d{8})-VIP$/;
    const match = codigo.match(padrao);

    if (match) {
        const n = match[1];
        let soma = 0;
        let multiplicador = 2;
        for (let i = 6; i >= 0; i--) {
            soma += parseInt(n[i]) * multiplicador;
            multiplicador++;
        }
        let resto = soma % 11;
        let dvCalculado = (resto < 2) ? 0 : 11 - resto;
        if (dvCalculado === 10) dvCalculado = 1;

        if (parseInt(n[7]) === dvCalculado) {
            const usuario = JSON.parse(localStorage.getItem('usuarioGoogle'));
            localStorage.setItem('assinanteVIP', 'true');
            
            if (usuario && usuario.id) {
                fetch('http://localhost:5000/ativar-vip-banco', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ usuario_id: usuario.id })
                });
            }
            alert("AUTENTICAÇÃO VIP CONCLUÍDA!");
            window.location.href = "index";
        } else {
            alert("Código inválido!");
        }
    }
}

function verificarStatusAssinante() {
    const isVIP = localStorage.getItem('assinanteVIP') === 'true';
    const totalElem = document.getElementById("total");
    if (isVIP && totalElem && !document.querySelector('.aviso-vip')) {
        const aviso = document.createElement("p");
        aviso.className = "aviso-vip";
        aviso.style.color = "gold";
        aviso.innerHTML = "🚀 Entrega Prioritária Ativada!";
        totalElem.after(aviso);
    }
}

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
            window.location.href = "index";
        }
    });
}

// --- 4. INICIALIZAÇÃO (Onde o perfil é carregado) ---

document.addEventListener('DOMContentLoaded', () => {
    // 1. Atualiza elementos visuais básicos
    atualizarContador();
    if (document.getElementById('lista-carrinho')) renderizarCarrinho();
    verificarStatusAssinante();

    // 2. Lógica de Perfil e Sincronização
    const usuarioLocal = JSON.parse(localStorage.getItem('usuarioGoogle'));
    if (usuarioLocal && usuarioLocal.email) {
        // Chama a função global que você deve ter em outro script para o Header
        if (typeof atualizarUsuarioHeader === "function") atualizarUsuarioHeader();

        fetch('http://localhost:5000/puxar-dados-usuario', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: usuarioLocal.email, nome: usuarioLocal.nome })
        })
        .then(res => res.json())
        .then(data => {
            localStorage.setItem('assinanteVIP', data.is_vip ? 'true' : 'false');
            
            // Atualiza status na página de cancelamento se ela existir
            const statusTexto = document.getElementById('status-atual');
            const btnCancelar = document.getElementById('btn-confirmar-cancelar');
            if (statusTexto) {
                statusTexto.innerHTML = data.is_vip ? "Status: VIP Ativo ★" : "Status: Plano Gratuito";
                if (btnCancelar) btnCancelar.style.display = data.is_vip ? "block" : "none";
            }
        })
        .catch(err => console.error("Erro na sincronização:", err));
    }
});