from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta


db = SQLAlchemy()

# Tabela 1: Todos os usuários que logarem (Base)
class Usuario(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    # Relações para facilitar a busca no Python
    assinatura_ref = db.relationship('Assinante', backref='usuario_base', uselist=False)
    carrinho_ref = db.relationship('Carrinho', backref='usuario_base')

# Tabela 2: Apenas usuários assinantes
class Assinante(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    plano = db.Column(db.String(50), default='Vip')
    status = db.Column(db.String(20), default='Ativo')

# Tabela 3: Itens do carrinho por usuário
class Carrinho(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    produto_nome = db.Column(db.String(100), nullable=False)
    preco = db.Column(db.Float, nullable=False)
    quantidade = db.Column(db.Integer, default=1)

# Tabela 4: Pedidos realizados
class Pedido(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    itens = db.Column(db.Text, nullable=False) # Guardaremos como texto (ex: "Trator, Sementes")
    total = db.Column(db.Float, nullable=False)
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)

    # Função para verificar se expirou
    def esta_expirado(self):
        return datetime.utcnow() > self.data_criacao + timedelta(days=30)