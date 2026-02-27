import os
from datetime import datetime
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

# Escopo que permite criar e gerenciar arquivos no seu Drive
SCOPES = ['https://www.googleapis.com/auth/drive.file']
# O seu ID continua o mesmo!
ID_PASTA_DRIVE = '1kEL5Q6W9RTFMN-H2r_MTLe4OogVwXK1T'
ARQUIVO_BANCO = 'tratordom.db'
# O novo arquivo que você baixou no Passo 1
ARQUIVO_CREDENCIAIS = 'credenciais_oauth.json'

def autenticar():
    creds = None
    # O arquivo token.json armazena a sua "senha" contínua após o 1º login
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)
    
    # Se não tiver token ou ele estiver vencido, ele resolve isso
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(ARQUIVO_CREDENCIAIS, SCOPES)
            # Isso aqui vai abrir o seu navegador na primeira vez!
            creds = flow.run_local_server(port=0)
        
        # Salva o token para a madrugada não precisar do seu navegador
        with open('token.json', 'w') as token:
            token.write(creds.to_json())
            
    return creds

def fazer_backup_drive():
    print(f"[{datetime.now().strftime('%d/%m/%Y %H:%M')}] Iniciando backup pro Google Drive...")
    
    try:
        creds = autenticar()
        servico = build('drive', 'v3', credentials=creds)

        data_hoje = datetime.now().strftime("%d-%m-%Y_%H-%M")
        nome_backup = f"backup_tratordom_{data_hoje}.db"

        metadados_arquivo = {
            'name': nome_backup,
            'parents': [ID_PASTA_DRIVE] 
        }
        
        media = MediaFileUpload(ARQUIVO_BANCO, mimetype='application/x-sqlite3', resumable=True)

        print(f"Enviando {nome_backup}...")
        arquivo_upado = servico.files().create(
            body=metadados_arquivo, 
            media_body=media, 
            fields='id'
        ).execute()

        print(f"✅ Sucesso! Backup salvo lá no seu Drive de 100GB! ID: {arquivo_upado.get('id')}")
        
    except Exception as e:
        print(f"❌ Erro ao fazer o backup: {e}")

if __name__ == '__main__':
    fazer_backup_drive()