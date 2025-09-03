# Configuração SquareCloud para MDBot Dashboard (Staging)
MAIN=server.js
MEMORY=512
VERSION=recommended
DISPLAY_NAME=MDBot Dashboard - STAGING
DESCRIPTION=Dashboard administrativo para Discord Bot - Ambiente de Teste
SUBDOMAIN=mdbot-staging
AUTO_RESTART=true
START=npm install --production --no-audit --no-fund && npm run build:staging && npm start

# Variáveis de ambiente para staging
NODE_ENV=production
PORT=3000

# Configurações de segurança
ENABLE_GZIP=true
ENABLE_RATE_LIMIT=true
MAX_REQUEST_SIZE=10mb

# Health check
HEALTH_CHECK_PATH=/health
HEALTH_CHECK_TIMEOUT=30s

# Logs
LOG_LEVEL=debug
LOG_FORMAT=json