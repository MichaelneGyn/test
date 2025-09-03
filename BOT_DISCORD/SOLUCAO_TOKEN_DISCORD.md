# Solução para Erro de Token Discord Inválido

## Problema
O bot está apresentando o erro:
```
discord.errors.LoginFailure: Improper token has been passed.
```

Este erro indica que o token do Discord no arquivo `.env` está inválido, expirado ou foi regenerado.

## Solução

### 1. Regenerar o Token do Bot

1. Acesse o [Discord Developer Portal](https://discord.com/developers/applications)
2. Faça login com sua conta Discord
3. Selecione sua aplicação/bot
4. Vá para a seção "Bot" no menu lateral
5. Na seção "Token", clique em "Reset Token"
6. Confirme a regeneração do token
7. **IMPORTANTE**: Copie o novo token imediatamente (ele só será mostrado uma vez)

### 2. Atualizar o Arquivo .env

1. Abra o arquivo `.env` no diretório do bot
2. Substitua o valor atual de `DISCORD_TOKEN` pelo novo token:
   ```
   DISCORD_TOKEN=seu_novo_token_aqui
   ```
3. Salve o arquivo

### 3. Verificar Permissões do Bot

Certifique-se de que o bot tem as seguintes permissões no servidor:
- Ler Mensagens
- Enviar Mensagens
- Gerenciar Mensagens
- Incorporar Links
- Anexar Arquivos
- Ler Histórico de Mensagens
- Usar Comandos de Barra
- Gerenciar Cargos (se necessário)
- Gerenciar Canais (se necessário)

### 4. Recriar o Arquivo ZIP para SquareCloud

Após atualizar o token, você precisará:
1. Testar o bot localmente para confirmar que funciona
2. Recriar o arquivo ZIP com o novo `.env` atualizado
3. Fazer o redeploy no SquareCloud

### 5. Comandos para Testar

```bash
# Testar localmente
cd BOT_DISCORD
python main.py
```

Se o bot iniciar sem erros e mostrar "Bot conectado como [nome_do_bot]", o token está funcionando.

## Notas Importantes

- **NUNCA** compartilhe seu token do Discord
- O token é como uma senha - mantenha-o seguro
- Se você suspeitar que o token foi comprometido, regenere-o imediatamente
- Tokens antigos param de funcionar após a regeneração

## Arquivo .env Exemplo

```env
# Token do Bot Discord (OBRIGATÓRIO)
DISCORD_TOKEN=MTxxxxxxxxxxxxxxxxxxxxx.xxxxxx.xxxxxxxxxxxxxxxxxxxxxxxxxxx

# IDs importantes
OWNER_ID=seu_discord_id_aqui
GUILD_ID=id_do_servidor_principal

# Outras configurações...
```

## Próximos Passos

1. Regenere o token no Discord Developer Portal
2. Atualize o arquivo `.env`
3. Teste localmente
4. Recrie o arquivo ZIP para SquareCloud
5. Faça o redeploy