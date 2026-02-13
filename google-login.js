// =======================
// LOGIN COM GOOGLE
// =======================
function handleCredentialResponse(response) {
    // Decodifica JWT retornado pelo Google
    const base64Url = response.credential.split('.')[1];
    const jsonPayload = atob(base64Url.replace(/-/g, '+').replace(/_/g, '/'));
    const user = JSON.parse(jsonPayload);

    // Salva usuário no localStorage
    localStorage.setItem('usuarioGoogle', JSON.stringify({
        nome: user.name,
        email: user.email,
        foto: user.picture
    }));

    // Redireciona para a página principal
    window.location.href = "index.html";
}

// =======================
// FUNÇÃO DE LOGOUT
// =======================
function logoutGoogleUser() {
    localStorage.removeItem('usuarioGoogle');
    window.location.reload();
}

// =======================
// FUNÇÃO PARA ATUALIZAR HEADER DO USUÁRIO
// =======================
function atualizarUsuarioHeader() {
    const usuarioContainer = document.getElementById('usuario-container');
    const usuario = JSON.parse(localStorage.getItem('usuarioGoogle'));
    const isVIP = localStorage.getItem('assinanteVIP') === 'true';

    if (!usuarioContainer) return;

    if (usuario) {
        usuarioContainer.innerHTML = `
            <div class="user-info">
                <img src="${usuario.foto}" alt="${usuario.nome}" class="user-foto">
                <span class="user-nome">${usuario.nome}</span>
                <button class="btn-logout" onclick="logoutGoogleUser()">Logout</button>
            </div>
        `;
    } else {
        usuarioContainer.innerHTML = `<a href="login.html" class="btn-login-header">Login</a>`;
    }
}

// Executa automaticamente ao carregar qualquer página
document.addEventListener('DOMContentLoaded', atualizarUsuarioHeader);