ID=809d0a1406b843aba21c391d77fbb8bc
DISPLAY_NAME=MDBot Dashboard
DESCRIPTION=Dashboard administrativo para Discord Bot com sistema de tickets
MAIN=project/server.js
VERSION=recommended
MEMORY=512
START=npm --prefix ./project install --no-audit --no-fund && npm --prefix ./project run build && npm --prefix ./project start
