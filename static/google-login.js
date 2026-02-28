// ============================================================
// TRATORDOM - LOGIN GOOGLE & INTEGRAÇÃO COM BANCO DE DADOS
// ============================================================

/**
 * Função chamada automaticamente pelo Google após a autenticação.
 */
function handleCredentialResponse(response) {
    const data = parseJwt(response.credential);

    // A MÁGICA ESTÁ AQUI: Usar apenas a rota relativa '/login-google'
    fetch('/login-google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            nome: data.name,
            email: data.email,
            foto: data.picture
        })
    })
    .then(res => {
        if (!res.ok) throw new Error("Erro na resposta do servidor");
        return res.json();
    })
    .then(usuarioDB => {
        // Só depois que o Python confirma, salvamos no navegador
        localStorage.setItem('usuarioGoogle', JSON.stringify({
            id: usuarioDB.id, 
            nome: data.name,
            email: data.email,
            foto: data.picture
        }));

        localStorage.setItem('assinanteVIP', usuarioDB.status_vip ? 'true' : 'false');
        
        console.log("Usuário sincronizado com o DB!");
        atualizarUsuarioHeader();
        window.location.href = "/index";
    })
    .catch(err => {
        console.error("ERRO CRÍTICO: O JavaScript não conseguiu falar com o Python!", err);
        alert("Erro ao conectar com o servidor.");
    });
}

/**
 * Função Auxiliar: Decodifica o Token JWT do Google.
 */
function parseJwt(token) {
    try {
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}

/**
 * Função para atualizar o Header: Mostra o nome/foto do usuário ou o botão de Login.
 */
function atualizarUsuarioHeader() {
    const container = document.getElementById('usuario-container');
    const usuario = JSON.parse(localStorage.getItem('usuarioGoogle'));
    const isVIP = localStorage.getItem('assinanteVIP') === 'true';

    if (!container) return;

    if (usuario && usuario.nome) {
        container.innerHTML = `
            <div class="user-info" style="display: flex; align-items: center; gap: 10px;">
                <img src="${usuario.foto}" class="user-foto ${isVIP ? 'user-foto-vip' : ''}" style="width:40px; border-radius:50%;">
                <span class="user-nome" style="color: white;">
                    ${usuario.nome.split(' ')[0]} ${isVIP ? '<span style="color: #ffd700;">★</span>' : ''}
                </span>
                <button class="btn-logout" onclick="logoutGoogleUser()">Sair</button>
            </div>
        `;
    } else {
        container.innerHTML = `<a href="/login" class="btn-login-header">Login</a>`;
    }
}

/**
 * Função de Logout: Limpa os dados do navegador e recarrega a página.
 */
function logoutGoogleUser() {
    if (confirm("Deseja realmente sair?")) {
        localStorage.removeItem('usuarioGoogle');
        localStorage.removeItem('assinanteVIP');
        localStorage.removeItem('carrinho');
        window.location.href = "/index";
    }
}

// Executa automaticamente ao carregar qualquer página para verificar sessão
document.addEventListener('DOMContentLoaded', atualizarUsuarioHeader);