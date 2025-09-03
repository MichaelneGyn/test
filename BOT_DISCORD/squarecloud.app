# Configuração SquareCloud para MDBot Discord Admin
MAIN=main.py
MEMORY=512
VERSION=python
DISPLAY_NAME=MDBot Admin
DESCRIPTION=Bot Discord de moderação com sistema de tickets e dashboard integrado
SUBDOMAIN=mdbot-discord-admin
AUTO_RESTART=true
START=python main.py

# Arquivos importantes para incluir no deploy
INCLUDE=main.py,local_api.py,requirements.txt,config.db,perm_config.db,config_data,dashboard_configs,dashboard_config.json

# Configurações de ambiente para produção
SQUARECLOUD=true
ENVIRONMENT=production
DEBUG=false
LOG_LEVEL=INFO
SYNC_ENABLED=false
PORT=80
HOST=0.0.0.0

# IMPORTANTE: Configure estas variáveis no painel do SquareCloud:
# DISCORD_TOKEN=seu_token_do_bot_aqui
# OWNER_ID=seu_discord_id_aqui
# GUILD_ID=id_do_servidor_principal
# DASHBOARD_URL=https://seu-dominio-dashboard.squareweb.app
# DASHBOARD_API_URL=https://seu-dominio-backend.squareweb.app/api
# BACKEND_URL=https://seu-dominio-backend.squareweb.app
