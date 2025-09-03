# Solução para Erro de Compilação do aiohttp no SquareCloud

## Problema Identificado
O erro `'PyLongObject' has no member named 'ob_digit'` indica incompatibilidade entre a versão do aiohttp e a versão do Python no ambiente SquareCloud.

## Soluções Implementadas

### 1. Requirements.txt Atualizado
O arquivo `requirements.txt` foi modificado para usar ranges de versões mais flexíveis:
```
discord.py>=2.3.0,<2.5.0
aiohttp>=3.9.0,<4.0.0
python-dotenv>=1.0.0
python-dateutil>=2.8.0
flask>=3.0.0,<4.0.0
flask-cors>=4.0.0
```

### 2. Requirements Mínimo (Alternativa)
Criado `requirements-minimal.txt` com apenas dependências essenciais:
```
discord.py==2.3.2
python-dotenv==1.0.0
```

## Próximos Passos

1. **Fazer novo deploy** com o requirements.txt atualizado
2. **Se o erro persistir**, renomear `requirements-minimal.txt` para `requirements.txt` e fazer novo deploy
3. **Verificar logs** do SquareCloud após cada tentativa

## Configuração do SquareCloud
O arquivo `squarecloud.app` está correto:
- MEMORY=512 (suficiente)
- VERSION=recommended (usa Python mais estável)
- AUTO_RESTART=true (reinicia automaticamente)

## Comandos para Deploy
1. Compactar arquivos: `main.py`, `requirements.txt`, `config.db`, `perm_config.db`, `squarecloud.app`
2. Fazer upload no painel do SquareCloud
3. Configurar variável `DISCORD_TOKEN` no painel
4. Iniciar aplicação

## Monitoramento
Após deploy, verificar:
- ✅ Instalação das dependências
- ✅ Bot online no Discord
- ✅ Comandos funcionando
- ✅ Sincronização com dashboard