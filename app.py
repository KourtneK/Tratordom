from flask import Flask, render_template, request, jsonify, session, redirect # Importa jsonify para respostas JSON
from flask_cors import CORS # Para permitir que o frontend se comunique com este backend
import os # Para lidar com caminhos de arquivos
from config_banco import db, Usuario, Assinante, Carrinho, Pedidos, CodigoAtivacao # Importa as classes do banco de dados
from datetime import datetime, timedelta # Para lidar com datas e tempos

app = Flask(__name__)
CORS(app)
app.secret_key = 'tratordom_chave_mestra' # <-- ADICIONE ESTA LINHA

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

# --- ROTA DO PAINEL-ADM ---
@app.route('/painel-adm')
def painel_adm():
    # Pega o e-mail de quem está logado no site com o Google
    email_logado = session.get('usuario_email')
    
    # Cria uma lista com todos os e-mails que têm permissão de Admin
    admins_autorizados = [
        'lucasdanielrocha2009@gmail.com', # Lucas Rocha (Diretor)
    ]
    
    # Verifica se o e-mail logado ESTÁ DENTRO (in) da lista de autorizados
    if email_logado in admins_autorizados:
        return render_template('painel-adm.html')
    
    # Se não estiver na lista (ou não tiver feito login), mostra a tela de bloqueio
    return '''
        <body style="background:#121212; color:white; text-align:center; padding:50px; font-family:sans-serif;">
            <h2 style="color:#ff5252;">Acesso Negado</h2>
            <p>Esta área é de acesso exclusivo da diretoria da Tratordom.</p>
            <a href="/index" style="color:#2196f3; text-decoration:none; font-weight:bold;">Voltar para a loja</a>
        </body>
    ''', 403


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
    foto = dados.get('foto') # O link direto que vem da conta Google do navegador

    print(f"--- SINCRONIZANDO CONTA GOOGLE: {email} ---")

    # Procura se o utilizador já passou por aqui antes
    usuario = Usuario.query.filter_by(email=email).first()

    if not usuario:
        # Se não existe, cria o registro baseado nos dados Reais do Google
        usuario = Usuario(nome=nome, email=email, foto=foto) 
        db.session.add(usuario)
        print(f"+++ NOVO USUÁRIO SALVO: {nome}")
    else:
        # Se já existe, apenas atualiza a foto e o nome
        usuario.nome = nome
        usuario.foto = foto
        print(f"!!! DADOS ATUALIZADOS PARA: {nome}")

    db.session.commit()

    # Guarda o e-mail na sessão segura do servidor Flask
    session['usuario_email'] = usuario.email

    # Verifica o status VIP para devolver ao navegador
    is_vip = Assinante.query.filter_by(usuario_id=usuario.id).first() is not None
    
    return jsonify({
        "id": usuario.id,
        "nome": usuario.nome,
        "email": usuario.email,
        "foto": usuario.foto,
        "status_vip": is_vip
    })

@app.route('/adicionar-carrinho', methods=['POST'])
def add_carrinho():
    dados = request.json
    u_id = dados.get('usuario_id')
    p_nome = dados.get('produto_nome')
    preco = dados.get('preco')

    # Busca se o item já existe para esse usuário no banco
    item_existente = Carrinho.query.filter_by(usuario_id=u_id, produto_nome=p_nome).first()

    if item_existente:
        # Se já existe, apenas aumenta a quantidade em vez de duplicar a linha
        item_existente.quantidade += 1
        print(f"+++ QUANTIDADE ATUALIZADA: {p_nome} agora tem {item_existente.quantidade}")
    else:
        # Se é novo, cria o registro normal
        novo_item = Carrinho(usuario_id=u_id, produto_nome=p_nome, preco=preco, quantidade=1)
        db.session.add(novo_item)
        print(f"+++ NOVO ITEM NO CARRINHO: {p_nome}")

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
    # CORREÇÃO: Usando db.session.get para evitar o LegacyAPIWarning
    usuario = db.session.get(Usuario, usuario_id)
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

@app.route('/puxar-dados-usuario', methods=['POST'])
def puxar_dados():
    # Esta rota agora só é chamada DEPOIS que o login_google confirmou quem é o usuário
    dados = request.json
    email = dados.get('email')
    
    usuario = Usuario.query.filter_by(email=email).first()
    
    if not usuario:
        # Se por algum motivo o JS chamar isso sem o usuário existir, 
        # nós usamos os dados que o JS tem da conta Google para criar agora
        nome = dados.get('nome', "Usuário")
        foto = dados.get('foto')
        usuario = Usuario(nome=nome, email=email, foto=foto)
        db.session.add(usuario)
        db.session.commit()

    # Puxa o restante das informações do banco (VIP, Carrinho, Pedidos)
    is_vip = Assinante.query.filter_by(usuario_id=usuario.id).first() is not None
    itens_db = Carrinho.query.filter_by(usuario_id=usuario.id).all()
    carrinho_lista = [{"nome": i.produto_nome, "preco": i.preco} for i in itens_db]
    
    return jsonify({
        "usuario_id": usuario.id,
        "is_vip": is_vip,
        "carrinho": carrinho_lista,
        "foto": usuario.foto
    })

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

@app.route('/salvar-pedidos', methods=['POST'])
def salvar_pedidos():
    dados = request.json
    novo_pedidos = Pedidos(
        usuario_id=dados['usuario_id'],
        itens=dados['itens'],
        total=dados['total']
    )
    db.session.add(novo_pedidos)
    
    # Limpeza automática: Sempre que alguém compra, o banco apaga os velhos (30 dias)
    limite = datetime.utcnow() - timedelta(days=30)
    Pedidos.query.filter(Pedidos.data_criacao < limite).delete()
    
    db.session.commit()
    return jsonify({"status": "sucesso", "mensagem": "Pedido salvo e limpeza realizada"})


# --- ROTA PARA VISUALIZAR O BANCO NO NAVEGADOR ---
@app.route('/ver-banco')
def ver_banco():
    # Puxa todos os dados para o painel de monitoramento
    usuarios = Usuario.query.all()
    pedidos = Pedidos.query.order_by(Pedidos.data_criacao.desc()).all()
    codigos = CodigoAtivacao.query.all()
    
    return render_template('visualizar_db.html', 
                           usuarios=usuarios, 
                           pedidos=pedidos, 
                           codigos=codigos)

# Rota para silenciar o erro 404 do Chrome DevTools
@app.route('/.well-known/appspecific/com.chrome.devtools.json')
def silenciar_chrome():
    return {}, 200 # Retorna um JSON vazio e status de Sucesso


# --- IMPORTAÇÕES DO BACKUP ---
from apscheduler.schedulers.background import BackgroundScheduler # Para agendar tarefas em segundo plano
import atexit # Para garantir que o agendador seja desligado quando o app fechar
from backup_drive import fazer_backup_drive # Importa a função de backup

if __name__ == '__main__':
    print("=== INICIANDO O SERVIDOR TRATORDOM NA PORTA 5000 ===")
    
    agendador = BackgroundScheduler(daemon=True)
    
    # 1. FAZ O BACKUP IMEDIATO AGORA
    agendador.add_job(fazer_backup_drive) 
    
    # 2. AGENDA OS PRÓXIMOS PARA AS 03:00 DA MANHÃ
    agendador.add_job(fazer_backup_drive, 'cron', hour=3, minute=0)
    
    agendador.start()
    atexit.register(lambda: agendador.shutdown())
    
    print("=== AGENDADOR DE BACKUP ATIVADO (03:00 AM) ===")

    # use_reloader=False evita que o agendador inicie duas vezes no modo debug
    app.run(debug=True, port=5000, use_reloader=False)