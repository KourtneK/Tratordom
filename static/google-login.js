// ============================================================
// TRATORDOM - LOGIN GOOGLE & INTEGRAÇÃO COM BANCO DE DADOS
// ============================================================

/**
 * Função chamada automaticamente pelo Google após a autenticação.
 */
function handleCredentialResponse(response) {
    const data = parseJwt(response.credential);

    // ESTA É A PARTE QUE SALVA NO DB:
    fetch('http://localhost:5000/login-google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            nome: data.name,
            email: data.email,
            foto: data.picture
        })
    })
    .then(res => res.json())
    .then(usuarioDB => {
        // Só depois que o Python confirma, salvamos no navegador
        localStorage.setItem('usuarioGoogle', JSON.stringify({
            id: usuarioDB.id, // ID REAL DO BANCO
            nome: data.name,
            email: data.email,
            foto: data.picture
        }));

        localStorage.setItem('assinanteVIP', usuarioDB.status_vip ? 'true' : 'false');
        
        console.log("Usuário sincronizado com o DB!");
        atualizarUsuarioHeader();
        window.location.href = "/index";
    })
    .catch(err => console.error("ERRO CRÍTICO: O JavaScript não conseguiu falar com o Python!", err));
}

    // 2. Envia os dados para o servidor Flask salvar no banco de dados SQLite
    // Certifique-se de que o endereço bate com o que você autorizou no Google Cloud
    fetch('http://localhost:5000/login-google', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json' 
        },
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
        // 3. Salva os dados retornados pelo Python (incluindo o ID do banco) no navegador
        localStorage.setItem('usuarioGoogle', JSON.stringify({
            id: usuarioDB.id,
            nome: data.name,
            email: data.email,
            foto: data.picture,
            is_assinante: usuarioDB.is_assinante
        }));

        console.log("Usuário registrado/logado com sucesso!");

        // 4. Redireciona para a Home usando a ROTA do Flask (não o arquivo físico)
        window.location.href = "/index"; 
    })
    .catch(err => {
        console.error("Erro ao processar login no banco:", err);
        alert("Erro ao conectar com o servidor de banco de dados.");
    });


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
 * Função de Logout: Limpa os dados do navegador e recarrega a página.
 */
function logoutGoogleUser() {
    if (confirm("Deseja realmente sair?")) {
        localStorage.removeItem('usuarioGoogle');
        localStorage.removeItem('assinanteVIP'); // Limpa status de assinante se houver
        window.location.href = "/index";
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
        // Usa as tuas classes: user-foto, user-nome e btn-logout
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



function logoutGoogleUser() {
    localStorage.removeItem('usuarioGoogle');
    localStorage.removeItem('assinanteVIP');
    localStorage.removeItem('carrinho');
    window.location.href = "/index";
}

// Executa automaticamente ao carregar qualquer página para verificar sessão
document.addEventListener('DOMContentLoaded', atualizarUsuarioHeader);