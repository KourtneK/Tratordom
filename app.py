from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import os
from config_banco import db, Usuario, Assinante, Carrinho

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

@app.route('/ativar-vip-banco', methods=['POST'])
def ativar_vip_banco():
    dados = request.json
    usuario_id = dados.get('usuario_id')
    
    # Verifica se já é assinante para não duplicar
    existe = Assinante.query.filter_by(usuario_id=usuario_id).first()
    if not existe:
        novo_assinante = Assinante(usuario_id=usuario_id)
        db.session.add(novo_assinante)
        db.session.commit()
        return jsonify({"status": "sucesso", "mensagem": "Agora você é VIP no banco!"})
    
    return jsonify({"status": "sucesso", "mensagem": "Usuário já era VIP"})

@app.route('/remover-carrinho', methods=['POST'])
def remover_carrinho():
    dados = request.json
    usuario_id = dados.get('usuario_id')
    produto_nome = dados.get('produto_nome')

@app.route('/verificar-vip/<int:usuario_id>')
def verificar_vip(usuario_id):
    is_vip = Assinante.query.filter_by(usuario_id=usuario_id).first() is not None
    return jsonify({"is_vip": is_vip})

@app.route('/puxar-dados-usuario', methods=['POST'])
def puxar_dados():
    dados = request.json
    email = dados.get('email')
    nome = dados.get('nome') # Pegamos o nome também para o caso de precisar criar

    if not email:
        return jsonify({"erro": "Email não fornecido"}), 400

    # Tenta achar o usuário no banco
    usuario = Usuario.query.filter_by(email=email).first()

    # SE NÃO EXISTE NO BANCO, VAMOS CRIAR AGORA!
    if not usuario:
        usuario = Usuario(nome=nome if nome else "Usuário", email=email)
        db.session.add(usuario)
        db.session.commit()
        print(f"NOVO USUÁRIO CRIADO NO DB: {email}")

    # Puxa os dados (VIP e Carrinho)
    is_vip = Assinante.query.filter_by(usuario_id=usuario.id).first() is not None
    itens_db = Carrinho.query.filter_by(usuario_id=usuario.id).all()
    carrinho_lista = [{"nome": i.produto_nome, "preco": i.preco} for i in itens_db]
    
    return jsonify({
        "usuario_id": usuario.id,
        "is_vip": is_vip,
        "carrinho": carrinho_lista
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

    # Busca o item no banco
    item = Carrinho.query.filter_by(usuario_id=usuario_id, produto_nome=produto_nome).first()

    if item:
        db.session.delete(item)
        db.session.commit()
        return jsonify({"status": "sucesso", "mensagem": "Item removido do banco"})
    
    return jsonify({"status": "erro", "mensagem": "Item não encontrado"}), 404

if __name__ == '__main__':
    app.run(debug=True, port=5000)