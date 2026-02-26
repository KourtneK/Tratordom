from flask import Flask, render_template, request, jsonify # Importa jsonify para respostas JSON
from flask_cors import CORS # Para permitir que o frontend (que pode estar em outro domínio) se comunique com este backend
import os # Para lidar com caminhos de arquivos
from config_banco import db, Usuario, Assinante, Carrinho, Pedidos, CodigoAtivacao # Importa as classes do banco de dados
from datetime import datetime, timedelta # Para lidar com datas e tempos, especialmente para expiração de pedidos

app = Flask(__name__)
CORS(app)

# Configurações
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'tratordom.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

with app.app_context():
    db.create_all()

# --- ROTAS DE PÁGINAS (HTML) ---
@app.route('/')
@app.route('/index')
def index(): return render_template('index.html')

@app.route('/login')
def login_page(): return render_template('login.html')

@app.route('/produtos')
def produtos(): return render_template('produtos.html')

@app.route('/carrinho')
def carrinho(): return render_template('carrinho.html')

@app.route('/contatos')
def contatos(): return render_template('contatos.html')

@app.route('/assinatura')
def assinatura(): return render_template('assinatura.html')

@app.route('/painel-adm')
def painel_adm(): return render_template('painel-adm.html')

@app.route('/cancelar')
def cancelar(): return render_template('cancelar.html')

@app.route('/executar-cancelamento', methods=['POST'])
def executar_cancelamento():
    dados = request.json
    email = dados.get('email')
    
    # Procura o usuário pelo email
    usuario = Usuario.query.filter_by(email=email).first()
    
    if usuario:
        # Procura a assinatura dele
        assinatura = Assinante.query.filter_by(usuario_id=usuario.id).first()
        if assinatura:
            db.session.delete(assinatura)
            db.session.commit()
            return jsonify({"status": "sucesso", "mensagem": "Assinatura removida!"})
            
    return jsonify({"status": "erro", "mensagem": "Assinatura não encontrada"}), 404

# --- ROTAS DE API (LOGICA) ---

@app.route('/login-google', methods=['POST'])
def login_google():
    dados = request.json
    nome = dados.get('nome')
    email = dados.get('email')

    print(f"--- TENTATIVA DE LOGIN RECEBIDA: {email} ---")

    usuario = Usuario.query.filter_by(email=email).first()

    if not usuario:
        usuario = Usuario(nome=nome, email=email)
        db.session.add(usuario)
        db.session.commit()
        print(f"+++ SUCESSO: {nome} GRAVADO NO DB!")
    else:
        print(f"!!! USUÁRIO JÁ EXISTIA: {nome}")

    is_vip = Assinante.query.filter_by(usuario_id=usuario.id).first() is not None
    
    return jsonify({
        "id": usuario.id,
        "nome": usuario.nome,
        "email": usuario.email,
        "status_vip": is_vip
    })

@app.route('/adicionar-carrinho', methods=['POST'])
def add_carrinho():
    dados = request.json
    item = Carrinho(
        usuario_id=dados.get('usuario_id'),
        produto_nome=dados.get('produto_nome'), # <--- Mude de 'produto' para 'produto_nome'
        preco=dados.get('preco')
    )
    db.session.add(item)
    db.session.commit()
    return jsonify({"status": "sucesso"})

@app.route('/ativar')
def ativar(): 
    return render_template('ativar.html')

def validar_codigo_matematico(codigo_completo):
    try:
        corpo = codigo_completo.split('-')[1]
        n = corpo[:7]
        dv_informado = int(corpo[7])
        soma = 0
        mult = 2
        for i in range(6, -1, -1):
            soma += int(n[i]) * mult
            mult += 1
        resto = soma % 11
        dv_calculado = 0 if resto < 2 else 11 - resto
        if dv_calculado == 10: dv_calculado = 1
        return dv_informado == dv_calculado
    except:
        return False

# --- ROTA QUE RECEBE E SALVA NA "LISTA NEGRA" ---
@app.route('/ativar-vip-banco', methods=['POST'])
def ativar_vip_banco():
    dados = request.json
    usuario_id = dados.get('usuario_id')
    codigo_recebido = dados.get('codigo')

    # 1. Filtro Matemático
    if not validar_codigo_matematico(codigo_recebido):
        return jsonify({"status": "erro", "mensagem": "Código inválido! Formato não reconhecido."}), 400

    # 2. Filtro de Reuso (Está no banco? Então já foi usado)
    ja_usado = CodigoAtivacao.query.filter_by(codigo=codigo_recebido).first()
    if ja_usado:
        return jsonify({"status": "erro", "mensagem": "Este código já foi utilizado!"}), 400

    # 3. Código passou! Ativa VIP e salva no banco.
    usuario = Usuario.query.get(usuario_id)
    if usuario:
        assinante = Assinante.query.filter_by(usuario_id=usuario.id).first()
        if not assinante:
            assinante = Assinante(usuario_id=usuario.id)
            db.session.add(assinante)
        
        # Guarda o código vinculado ao usuário para bloquear usos futuros
        novo_uso = CodigoAtivacao(codigo=codigo_recebido, usuario_id=usuario.id)
        db.session.add(novo_uso)
        
        db.session.commit()
        return jsonify({"status": "sucesso", "mensagem": "VIP Ativado!"})

    return jsonify({"status": "erro", "mensagem": "Usuário inválido"}), 400


# ROTA PARA VERIFICAR SE O USUÁRIO É VIP (USADA PELO FRONTEND)
@app.route('/verificar-vip/<int:usuario_id>')
def verificar_vip(usuario_id):
    is_vip = Assinante.query.filter_by(usuario_id=usuario_id).first() is not None
    return jsonify({"is_vip": is_vip})

@app.route('/puxar-dados-usuario', methods=['POST'])
def puxar_dados():
    dados = request.json
    email = dados.get('email')
    nome = dados.get('nome')

    if not email:
        return jsonify({"erro": "Email não fornecido"}), 400

    # 1. Procura ou Cria o Utilizador
    usuario = Usuario.query.filter_by(email=email).first()
    if not usuario:
        usuario = Usuario(nome=nome if nome else "Usuário", email=email)
        db.session.add(usuario)
        db.session.commit()
        print(f"NOVO USUÁRIO CRIADO NO DB: {email}")

    # 2. Puxa o status VIP
    is_vip = Assinante.query.filter_by(usuario_id=usuario.id).first() is not None
    
    # 3. Puxa o Carrinho
    itens_db = Carrinho.query.filter_by(usuario_id=usuario.id).all()
    carrinho_lista = [{"nome": i.produto_nome, "preco": i.preco} for i in itens_db]

    # 4. Puxa os Pedidos (A limpeza de 30 dias já acontece na rota de salvar)
    pedidos_db = Pedidos.query.filter_by(usuario_id=usuario.id).all()
    pedidos_lista = [{"itens": p.itens, "total": p.total, "data": p.data_criacao.strftime("%d/%m/%Y")} for p in pedidos_db]

    # 5. Puxa os Códigos Ativados por este utilizador
    codigos_db = CodigoAtivacao.query.filter_by(usuario_id=usuario.id).all()
    codigos_lista = [c.codigo for c in codigos_db]
    
    return jsonify({
        "usuario_id": usuario.id,
        "is_vip": is_vip,
        "carrinho": carrinho_lista,
        "pedidos": pedidos_lista,
        "codigos_usados": codigos_lista
    })

@app.route('/sincronizar-vip-email', methods=['POST'])
def sincronizar_vip_email():
    dados = request.json
    email = dados.get('email')
    usuario = Usuario.query.filter_by(email=email).first()
    if usuario:
        is_vip = Assinante.query.filter_by(usuario_id=usuario.id).first() is not None
        return jsonify({"encontrado": True, "is_vip": is_vip, "usuario_id": usuario.id})
    return jsonify({"encontrado": False}), 404

# ... (mantenha as suas importações e inicialização do db)

@app.route('/remover-item-carrinho', methods=['POST'])
def remover_item_carrinho():
    dados = request.json
    usuario_id = dados.get('usuario_id')
    produto_nome = dados.get('produto_nome')

    # Busca o item exato no banco de dados
    item = Carrinho.query.filter_by(usuario_id=usuario_id, produto_nome=produto_nome).first()

    if item:
        db.session.delete(item)
        db.session.commit()
        return jsonify({"status": "sucesso", "mensagem": "Item removido do banco"})
    
    return jsonify({"status": "erro", "mensagem": "Item não encontrado"}), 404

@app.route('/limpar-carrinho-banco', methods=['POST'])
def limpar_carrinho_banco():
    dados = request.json
    usuario_id = dados.get('usuario_id')
    
    if usuario_id:
        # Remove todos os registros que pertencem a esse usuário
        Carrinho.query.filter_by(usuario_id=usuario_id).delete()
        db.session.commit()
        return jsonify({"status": "sucesso", "mensagem": "Banco de dados limpo"})
    
    return jsonify({"status": "erro", "mensagem": "Usuário não identificado"}), 400

# ROTA PARA SALVAR PEDIDO E LIMPAR PEDIDOS ANTIGOS
@app.route('/salvar-pedidos', methods=['POST'])
def salvar_pedidos():
    dados = request.json
    novo_pedidos = Pedidos(
        usuario_id=dados['usuario_id'],
        itens=dados['itens'],
        total=dados['total']
    )
    db.session.add(novo_pedidos)
    
    # Limpeza automática: Sempre que alguém compra, o banco apaga os velhos
    limite = datetime.utcnow() - timedelta(days=30)
    Pedidos.query.filter(Pedidos.data_criacao < limite).delete()
    
    db.session.commit()
    return jsonify({"status": "sucesso", "mensagem": "Pedidos guardados por 30 dias"})

# ... (mantenha todas as outras rotas: login_google, add_carrinho, puxar_dados, etc.)


if __name__ == '__main__':
    app.run(debug=True, port=5000)
    print("SERVIDOR RODANDO NA PORTA 5000")