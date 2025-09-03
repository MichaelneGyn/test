ID=391067125392401aa8b753d64dad574d
DISPLAY_NAME=MDBot Dashboard
DESCRIPTION=Dashboard administrativo para Discord Bot com sistema de tickets
MAIN=project/server.js
VERSION=recommended
MEMORY=512
SUBDOMAIN=mdbot-dashboard
START=npm --prefix ./project install --no-audit --no-fund && npm --prefix ./project run build && npm --prefix ./project start
