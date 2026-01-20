// Carrinho de compras
const botoes = document.querySelectorAll('.adicionar');
const listaCarrinho = document.getElementById('lista-carrinho');
const totalElem = document.getElementById('total');
const contador = document.getElementById('contador');

let carrinho = [];
let total = 0;

botoes.forEach(botao => {
    botao.onclick = () => {
        const nome = botao.dataset.produto;
        const preco = parseFloat(botao.dataset.preco);

        carrinho.push({ nome, preco });
        total += preco;

        atualizarCarrinho();
    };
});

function atualizarCarrinho() {
    listaCarrinho.innerHTML = '';

    if (carrinho.length === 0) {
        listaCarrinho.innerHTML = '<li>O carrinho está vazio</li>';
    } else {
        carrinho.forEach(item => {
            listaCarrinho.innerHTML += `<li>${item.nome} - R$ ${item.preco.toFixed(2)}</li>`;
        });
    }

    totalElem.textContent = `Total: R$ ${total.toFixed(2)}`;
    contador.textContent = carrinho.length;
}