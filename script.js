// =======================
// CARRINHO DE COMPRAS GLOBAL
// =======================

// Seleciona elementos, se existirem na página
const botoes = document.querySelectorAll(".adicionar");
const listaCarrinho = document.getElementById("lista-carrinho");
const totalElem = document.getElementById("total");
const contador = document.getElementById("contador");

// Recupera carrinho do localStorage ou cria vazio
let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

// Calcula total inicial
let total = carrinho.reduce((soma, item) => soma + item.preco, 0);

// =======================
// FUNÇÃO PARA ATUALIZAR O CARRINHO NA PÁGINA
// =======================
function atualizarCarrinho() {
    // Atualiza lista do carrinho apenas se existir
    if (listaCarrinho) {
        listaCarrinho.innerHTML = "";

        if (carrinho.length === 0) {
            listaCarrinho.innerHTML = "<li>O carrinho está vazio</li>";
        } else {
            carrinho.forEach((item) => {
                listaCarrinho.innerHTML += `<li>${item.nome} - R$ ${item.preco.toFixed(2)}</li>`;
            });
        }
    }

    // Atualiza total
    if (totalElem) {
        totalElem.textContent = `Total: R$ ${total.toFixed(2)}`;
    }

    // Atualiza contador global
    if (contador) {
        contador.textContent = carrinho.length;
    }

    // Salva no localStorage
    localStorage.setItem("carrinho", JSON.stringify(carrinho));
}

// =======================
// ADICIONAR PRODUTO AO CARRINHO
// =======================
botoes.forEach((botao) => {
    botao.addEventListener("click", () => {
        const nome = botao.dataset.produto;
        const preco = parseFloat(botao.dataset.preco);

        carrinho.push({ nome, preco });
        total += preco;

        atualizarCarrinho();
    });
});

// =======================
// FUNÇÃO PARA LIMPAR CARRINHO
// =======================
function limparCarrinho() {
    if (carrinho.length === 0) return;
    if (!confirm("Deseja realmente limpar o carrinho?")) return;

    carrinho = [];
    total = 0;
    atualizarCarrinho();
}

// =======================
// FUNÇÃO PARA FINALIZAR COMPRA
// =======================
function finalizarCompra() {
    if (carrinho.length === 0) {
        alert("Seu carrinho está vazio!");
        return;
    }

    alert("Compra finalizada com sucesso! A Tratordom agradece a preferência.");
    limparCarrinho();
}

// =======================
// ATUALIZA CARRINHO AO CARREGAR A PÁGINA
// =======================
atualizarCarrinho();