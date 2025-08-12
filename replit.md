# Overview

This is a comprehensive Discord bot project written in Python that provides community management, economy, moderation, social features, and entertainment. The bot uses Discord.py and SQLite for data persistence, featuring a sophisticated anti-duplication system for the family panel commands, comprehensive database management, and full integration with SquareCloud hosting platform.

## Recent Changes (August 2025)

- **Fixed Family Panel Duplication Bug**: Implemented channel-based cooldown system to prevent multiple panels from appearing
- **Added All Missing Commands**: Completed implementation of all 50+ commands across 6 categories
- **Enhanced Anti-Duplication**: Channel-specific panel tracking and automatic cleanup system
- **SquareCloud Ready**: Optimized for 15GB storage, 2GB RAM, 2 vCPU hosting environment
- **Instagram/Tellonym Integration**: Base framework for social media integrations

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Core Bot Framework
- **Discord.py Integration**: Built using discord.py library with custom SafeBot class extending commands.Bot
- **Custom Command System**: Implements anti-duplication mechanisms to prevent command conflicts and duplicate registrations
- **Event-Driven Architecture**: Uses Discord event handlers for real-time interaction processing

## Database Design
- **SQLite Database**: Uses SQLite for local data persistence with two separate databases:
  - `config.db`: Main application data
  - `perm_config.db`: Permanent configuration storage
- **Connection Management**: Implements proper connection handling with foreign key constraints and row factory configuration
- **Test Mode Support**: Includes in-memory data structures for testing environments

## Logging and Monitoring
- **Advanced Logging System**: Multi-level logging with rotating file handlers (5MB max, 3 backups)
- **Custom Logger Classes**: BotLogger with specialized methods for command tracking and error reporting
- **Command Execution Tracking**: Maintains execution history to detect and prevent command duplications
- **Dual Output**: Logs to both file and console with detailed formatting including timestamps and function context

## Command Management
- **Safe Command Registration**: Prevents duplicate command registration through tracking mechanisms
- **Execution Monitoring**: Tracks command executions with timestamps and context for debugging
- **Cooldown Management**: Implements command rate limiting and cooldown systems

## Configuration Management
- **Environment Variables**: Uses dotenv for secure configuration management
- **Path Management**: Centralized path configuration using pathlib for cross-platform compatibility
- **Test Mode Toggle**: Global test mode configuration for development and testing

# Complete Command List

## 🎭 Aparência (4 commands)
- `!andar` - Simula uma caminhada com ações aleatórias
- `!setavatar <url>` - Define avatar do bot (admin only)
- `!setbanner <url>` - Define banner do bot (admin only) 
- `!setusername <nome>` - Altera nome do bot (admin only)

## 💸 Economia (5 commands)
- `!carteira [@user]` - Mostra carteira e estatísticas financeiras
- `!daily` - Recompensa diária (100-500 coins, 24h cooldown)
- `!depositar <quantidade>` - Deposita dinheiro no banco
- `!empregos` - Lista trabalhos disponíveis
- `!trabalhar` - Trabalha para ganhar dinheiro (1h cooldown)

## 💍 Primeira Dama (1 command)
- `!pd <@user> [cargo_name]` - Define primeira dama do servidor (admin only)

## ❗ Informativo (3 commands)
- `!ajuda` - Mostra todos os comandos disponíveis
- `!botinfo` - Informações técnicas do bot
- `!ping` - Mostra latência do bot

## 👮 Moderação (18 commands)
- `!advertence <@user> <motivo>` - Adverte usuário (alias para warn)
- `!ban <@user> [motivo]` - Bane usuário permanentemente
- `!bangif [texto]` - Bane com GIF animado
- `!castigar <@user> <tempo> [motivo]` - Timeout temporário
- `!kick <@user> [motivo]` - Expulsa usuário do servidor
- `!lock [#canal]` - Bloqueia canal para membros
- `!mutecall <@user>` - Muta usuário no voice chat
- `!mute <@user> [tempo] [motivo]` - Muta usuário no servidor
- `!nuke` - Deleta e recria canal atual
- `!removeadvertence <@user> [id]` - Remove advertência específica
- `!removecastigo <@user>` - Remove timeout de usuário
- `!removerole <@user> <cargo>` - Remove cargo de usuário
- `!unbanall` - Desbane todos os usuários (admin only)
- `!unban <user_id>` - Desbane usuário por ID
- `!unlock [#canal]` - Desbloqueia canal
- `!unmutecall <@user>` - Desmuta usuário no voice
- `!unmute <@user>` - Desmuta usuário
- `!warn <@user> <motivo>` - Adiciona advertência

## 🎯 Social (6 commands)
- `!avatar [@user]` - Mostra avatar de usuário
- `!influencer [@user]` - Ranking de influência baseado em rep/level
- `!perfil [@user]` - Perfil completo com estatísticas
- `!rep <@user>` - Dá reputação para usuário (24h cooldown)
- `!sobremim <texto>` - Define descrição pessoal
- `!tellonym [@user]` - Sistema de mensagens anônimas

## 🧩 Staff (15 commands)
- `!migracoes [@user]` - Mostra pontos de migração
- `!migrar <@user> [pontos]` - Adiciona pontos de migração
- `!movchat <@user> [pontos]` - Adiciona pontos de movimentação
- `!mov <@user> [pontos]` - Alias para movchat
- `!movpoints [@user]` - Mostra pontos de movimentação
- `!recrutamentos [@user]` - Mostra estatísticas de recrutamento
- `!recrutar <@user> [pontos]` - Adiciona pontos de recrutamento
- `!register <@user> [cargo]` - Registra membro como staff
- `!registers` - Lista todos os staff registrados
- `!resetmigs [@user]` - Reseta migrações (admin only)
- `!resetmovchat [@user]` - Reseta movimentações de chat (admin only)
- `!resetmovs [@user]` - Reseta movimentações (admin only)
- `!resetrecs [@user]` - Reseta recrutamentos (admin only)
- `!resetregisters` - Limpa todos os registros de staff (admin only)
- `!resettime` - Reseta todos os cooldowns (admin only)
- `!resetverificacoes` - Reseta sistema de verificações (admin only)
- `!tempo [@user]` - Mostra tempo de atividade
- `!verificar <@user>` - Verifica usuário (adiciona cargo se existir)

## 🔱 Utilitários (3 commands)
- `!cl [quantidade]` - Limpa mensagens do canal
- `!clear [quantidade]` - Alias para cl
- `!membersrole <cargo>` - Lista membros com cargo específico

## ⭐ VIP (8 commands)
- `!addfamily <@user> <nome_familia>` - Adiciona família VIP (admin only)
- `!addvipc <@user>` - Adiciona VIP Comum (admin only)
- `!addvip <@user> [level]` - Adiciona VIP Premium (admin only)
- `!familia` ou `!f` - **PAINEL PRINCIPAL DE FAMÍLIAS** (FIXED: sem duplicação)
- `!removefamily <@user>` - Remove família VIP (admin only)
- `!removevipc <@user>` - Remove VIP Comum (admin only)
- `!removevip <@user>` - Remove VIP (admin only)
- `!setvip <@user> <level>` - Define nível VIP específico (admin only)

## 🔗 Integrações Sociais (2 systems)
- `!instagram [username]` - Sistema Instagram (framework preparado)
- `!tellonym [@user]` - Sistema Tellonym (mensagens anônimas funcionais)

**Total: 62+ comandos implementados**

# External Dependencies

## Discord Integration
- **discord.py**: Primary framework for Discord bot functionality
- **Discord UI Components**: Uses Button, View, Modal, TextInput, and Select components for interactive interfaces

## Database and Storage
- **SQLite3**: Local database for data persistence
- **pathlib**: File system path management

## HTTP and Networking
- **aiohttp**: Asynchronous HTTP client for external API calls
- **asyncio**: Asynchronous programming support

## Development and Utilities
- **python-dotenv**: Environment variable management
- **logging**: Built-in Python logging with rotating file handlers
- **collections**: Data structure utilities for command tracking
- **datetime**: Time and date management for logging and cooldowns
- **random**: Random number generation for bot features
- **threading**: Multi-threading support for concurrent operations
- **json**: JSON data handling
- **typing**: Type hints for better code documentation

## System Integration
- **os and sys**: Operating system and Python system interface
- **time**: Time-related utilities