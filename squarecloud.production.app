# Configuração SquareCloud para MDBot Dashboard
MAIN=project/server.js
MEMORY=512
VERSION=recommended
DISPLAY_NAME=MDBot Dashboard
DESCRIPTION=Dashboard administrativo para Discord Bot com sistema de tickets
SUBDOMAIN=mdbot-dashboard
AUTO_RESTART=true
START=npm --prefix ./project install --no-audit --no-fund && npm --prefix ./project run build && npm --prefix ./project start

# Variáveis de ambiente para produção
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
LOG_LEVEL=info
LOG_FORMAT=json