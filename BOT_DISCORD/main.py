# ================= IMPORTS =================
import discord
from discord.ext import commands, tasks
from discord.ui import Button, View, Modal, TextInput, Select
import os
import sys
import sqlite3
import asyncio
import random
import logging
import time
from datetime import timedelta, datetime, timezone
from discord.ext.commands import BucketType, cooldown
from pathlib import Path
from dotenv import load_dotenv
import collections
import json
from typing import Optional, Dict, Any

# Comentado temporariamente para resolver problemas de compilação no SquareCloud
# import aiohttp
# import aiohttp_cors
# from aiohttp import web
# import threading
from local_api import run_api_in_background


# Load environment variables
load_dotenv()

# ================= CONFIGURAÇÕES DO SISTEMA DE TICKETS =================
# Configurações padrão para o sistema de tickets
STAFF_ROLE_NAMES = [
    "Equipe de Suporte", "Moderadores", "Administradores", "ADMIN", "Staff", "Moderador", "Suporte"
]

# Configurações padrão dos tickets
TICKET_DEFAULTS = {
    "panels": {
        "main": {
            "title": "📨 Sistema de Tickets",
            "description": "Escolha o tipo de atendimento que precisa:",
            "color": 0x00ff00,
            "banner_url": "",
            "options": {
                "suporte": {
                    "label": "🛠️ Suporte Técnico",
                    "description": "Problemas técnicos, dúvidas e ajuda geral",
                    "emoji": "🛠️",
                    "style": "green"
                },
                "denuncia": {
                    "label": "⚠️ Denúncia",
                    "description": "Reportar violações e problemas de conduta",
                    "emoji": "⚠️",
                    "style": "red"
                }
            }
        },
        "migration": {
            "title": "🔄 Migração de Conta",
            "description": "Solicite a migração da sua conta aqui.\n\n**Informações necessárias:**\n• ID da conta antiga\n• ID da conta nova\n• Motivo da migração\n• Comprovantes (se necessário)",
            "color": 0x0099ff,
            "button_label": "🔄 Iniciar Migração",
            "emoji": "🔄",
            "banner_url": ""
        },
        "denuncia": {
            "title": "⚠️ Sistema de Denúncias",
            "description": "Use este sistema para reportar violações, comportamentos inadequados ou problemas que precisam de investigação.\n\n**Suas denúncias são confidenciais e tratadas com seriedade.**",
            "color": 0xff4444,
            "banner_url": ""
        }
    },
    "buttons": {
        "close": {"label": "🔒 Fechar", "style": "red", "emoji": "🔒"},
        "confirm_close": {"label": "✅ Confirmar", "style": "red", "emoji": "✅"},
        "cancel_close": {"label": "❌ Cancelar", "style": "gray", "emoji": "❌"},
        "add_member": {"label": "➕ Adicionar", "style": "green", "emoji": "➕"},
        "remove_member": {"label": "➖ Remover", "style": "red", "emoji": "➖"},
        "create_call": {"label": "📞 Criar Call", "style": "blurple", "emoji": "📞"},
        "priority": {"label": "📈 Prioridade", "style": "blurple", "emoji": "📈"},
        "verify": {"label": "✅ Verificar", "style": "green", "emoji": "✅"},
        "investigate": {"label": "🔍 Investigar", "style": "blurple", "emoji": "🔍"},
        "archive": {"label": "📁 Arquivar", "style": "gray", "emoji": "📁"}
    },
    "voice": {
        "suporte": {"name": "🛠️ Suporte - {user}", "limit": 5, "bitrate": 64000},
        "migracao": {"name": "🔄 Migração - {user}", "limit": 2, "bitrate": 96000},
        "denuncia": {"name": "⚠️ Denúncia - {user}", "limit": 3, "bitrate": 64000}
    },
    "settings": {
        "auto_close_hours": 48,
        "rate_limit_hours": 24,
        "max_tickets_per_user": 3,
        "require_reason": True,
        "backup_enabled": True
    }
}

# ================= CONFIGURAÇÕES =================
# URL do backend Node.js
# Detectar se está rodando no SquareCloud
IS_SQUARECLOUD = os.getenv('SQUARECLOUD', 'false').lower() == 'true'
if IS_SQUARECLOUD:
    # No SquareCloud, desabilitar sincronização com backend local
    BACKEND_URL = None
    print("🔧 Executando no SquareCloud - Sincronização com backend local desabilitada")
else:
    BACKEND_URL = os.getenv('BACKEND_URL', 'http://localhost:3002')
    print(f"🔧 Executando localmente - Backend URL: {BACKEND_URL}")
intents = discord.Intents.default()
intents.members = True
intents.message_content = True
intents.presences = True
intents.voice_states = True

# Função para obter o prefixo personalizado de cada servidor
async def get_prefix(bot, message):
    if message.guild is None:
        return '!'  # Prefixo padrão para DMs
    
    try:
        # Conectar ao banco de dados principal (mesmo que o dashboard usa)
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Buscar o prefixo personalizado do servidor na tabela server_configs
        cursor.execute("SELECT prefix FROM server_configs WHERE guild_id = ?", (str(message.guild.id),))
        result = cursor.fetchone()
        
        conn.close()
        
        if result and result[0]:
            prefix = result[0]
            print(f"🔍 Prefixo encontrado para servidor {message.guild.id}: '{prefix}'")
            return prefix
        else:
            print(f"⚠️ Nenhum prefixo encontrado para servidor {message.guild.id}, usando padrão '!'")
            return '!'  # Prefixo padrão
    except Exception as e:
        print(f"❌ Erro ao carregar prefixo: {e}")
        return '!'  # Prefixo padrão em caso de erro

bot = commands.Bot(command_prefix=get_prefix, intents=intents, help_command=None)

# ================= SINCRONIZAÇÃO COM BACKEND =================
async def sync_guilds_with_backend():
    """Sincroniza dados dos servidores com o backend Node.js"""
    # Verificar se a sincronização com backend está habilitada
    if BACKEND_URL is None:
        print("ℹ️ Sincronização com backend desabilitada (executando no SquareCloud)")
        return
    
    try:
        guilds_data = []
        for guild in bot.guilds:
            # Verificar se o bot tem permissões para ver informações do servidor
            try:
                icon_key = guild.icon.key if guild.icon else None
                icon_animated = guild.icon.is_animated() if guild.icon else False
                
                print(f"🏰 Processando servidor: {guild.name}")
                print(f"   - ID: {guild.id}")
                print(f"   - Ícone key: {icon_key}")
                print(f"   - Ícone animado: {icon_animated}")
                print(f"   - Membros: {guild.member_count}")
                
                guild_data = {
                    'guild_id': str(guild.id),
                    'name': guild.name,
                    'member_count': guild.member_count,
                    'icon': icon_key,
                    'iconAnimated': icon_animated,
                    'botPresent': True,
                    'lastSync': datetime.now().isoformat(),
                    'owner_id': str(guild.owner_id) if guild.owner_id else None,
                    'features': guild.features,
                    'created_at': guild.created_at.isoformat()
                }
                guilds_data.append(guild_data)
            except Exception as e:
                print(f"❌ Erro ao processar servidor {guild.name}: {e}")
                continue
        
        # Tentar sincronizar com o backend apenas se BACKEND_URL estiver definido
        if BACKEND_URL:
            try:
                import aiohttp
                async with aiohttp.ClientSession() as session:
                    try:
                        async with session.post(
                            f"{BACKEND_URL}/api/bot/sync-guilds",
                            json={'guilds': guilds_data},
                            headers={'Content-Type': 'application/json'}
                        ) as response:
                            if response.status == 200:
                                print(f"✅ Sincronização concluída: {len(guilds_data)} servidores enviados")
                            else:
                                print(f"❌ Erro na sincronização: {response.status}")
                                text = await response.text()
                                print(f"Resposta: {text}")
                    except Exception as e:
                        print(f"❌ Erro ao conectar com backend: {e}")
            except ImportError:
                print(f"✅ Dados de {len(guilds_data)} servidores preparados (aiohttp não disponível - modo offline)")
        else:
            print(f"✅ Dados de {len(guilds_data)} servidores preparados (sincronização com backend desabilitada)")
                
    except Exception as e:
        print(f"❌ Erro na sincronização: {e}")

# ================= FUNÇÕES DE SINCRONIZAÇÃO EM TEMPO REAL =================

# async def sync_role_with_backend(guild_id, action, role):
#     """Sincroniza mudanças de cargos com o backend"""
#     try:
#         role_data = {
#             'id': str(role.id),
#             'name': role.name,
#             'color': role.color.value,
#             'hoist': role.hoist,
#             'mentionable': role.mentionable,
#             'managed': role.managed,
#             'position': role.position,
#             'permissions': str(role.permissions.value),
#             'created_at': role.created_at.isoformat() if role.created_at else None
#         }
#         
#         # Sincronizar apenas o cargo específico para evitar payload muito grande
#         async with aiohttp.ClientSession() as session:
#             async with session.post(f'{BACKEND_URL}/api/bot/sync-role', json={
#                 'guild_id': str(guild_id),
#                 'action': action,
#                 'role': role_data,
#                 'timestamp': datetime.now().isoformat()
#             }) as response:
#                 if response.status == 200:
#                     print(f"✅ Cargo sincronizado: {role.name} ({action})")
#                 else:
#                     print(f"❌ Erro ao sincronizar cargo: {response.status}")
#                         
#     except Exception as e:
#         print(f"❌ Erro ao sincronizar cargo: {e}")

async def sync_role_with_backend(guild_id, action, role):
    """Sincronização temporariamente desabilitada"""
    print(f"📝 Cargo {role.name} ({action}) - sincronização desabilitada")
    pass

# async def sync_member_with_backend(guild_id, action, member):
#     """Sincroniza mudanças de membros com o backend"""
#     try:
#         member_data = {
#             'id': str(member.id),
#             'username': member.name,
#             'discriminator': member.discriminator,
#             'display_name': member.display_name,
#             'avatar': str(member.avatar) if member.avatar else None,
#             'joined_at': member.joined_at.isoformat() if member.joined_at else None,
#             'premium_since': member.premium_since.isoformat() if member.premium_since else None,
#             'roles': [str(role.id) for role in member.roles if role.name != '@everyone'],
#             'bot': member.bot,
#             'system': member.system,
#             'pending': getattr(member, 'pending', False),
#             'nick': member.nick,
#             'guild_permissions': str(member.guild_permissions.value)
#         }
#         
#         # Sincronizar apenas o membro específico para evitar payload muito grande
#         async with aiohttp.ClientSession() as session:
#             async with session.post(f'{BACKEND_URL}/api/bot/sync-member', json={
#                 'guild_id': str(guild_id),
#                 'action': action,
#                 'member': member_data,
#                 'timestamp': datetime.now().isoformat()
#             }) as response:
#                 if response.status == 200:
#                     print(f"✅ Membro sincronizado: {member.display_name} ({action})")
#                 else:
#                     print(f"❌ Erro ao sincronizar membro: {response.status}")
#                         
#     except Exception as e:
#         print(f"❌ Erro ao sincronizar membro: {e}")

async def sync_member_with_backend(guild_id, action, member):
    """Sincronização temporariamente desabilitada"""
    print(f"📝 Membro {member.display_name} ({action}) - sincronização desabilitada")
    pass

# async def sync_channel_with_backend(guild_id, action, channel):
#     """Sincroniza mudanças de canais com o backend"""
#     try:
#         channel_data = {
#             'id': str(channel.id),
#             'name': channel.name,
#             'type': str(channel.type),
#             'position': channel.position,
#             'topic': getattr(channel, 'topic', None),
#             'nsfw': getattr(channel, 'nsfw', False),
#             'slowmode_delay': getattr(channel, 'slowmode_delay', 0),
#             'category_id': str(channel.category.id) if channel.category else None,
#             'created_at': channel.created_at.isoformat() if channel.created_at else None
#         }
#         
#         # Buscar todos os canais do servidor para sincronização completa
#         guild = bot.get_guild(int(guild_id))
#         if guild:
#             all_channels = []
#             for c in guild.channels:
#                 all_channels.append({
#                     'id': str(c.id),
#                     'name': c.name,
#                     'type': str(c.type),
#                     'position': c.position,
#                     'topic': getattr(c, 'topic', None),
#                     'nsfw': getattr(c, 'nsfw', False),
#                     'slowmode_delay': getattr(c, 'slowmode_delay', 0),
#                     'category_id': str(c.category.id) if c.category else None,
#                     'created_at': c.created_at.isoformat() if c.created_at else None
#                 })
#             
#             async with aiohttp.ClientSession() as session:
#                 async with session.post(f'{BACKEND_URL}/api/bot/sync-channels', json={
#                     'guild_id': str(guild_id),
#                     'action': action,
#                     'channel': channel_data,
#                     'all_channels': all_channels,
#                     'timestamp': datetime.now().isoformat()
#                 }) as response:
#                     if response.status == 200:
#                         print(f"✅ Canal sincronizado: {channel.name} ({action})")
#                     else:
#                         print(f"❌ Erro ao sincronizar canal: {response.status}")
#                         
#     except Exception as e:
#         print(f"❌ Erro ao sincronizar canal: {e}")

async def sync_channel_with_backend(guild_id, action, channel):
    """Sincronização temporariamente desabilitada"""
    print(f"📝 Canal {channel.name} ({action}) - sincronização desabilitada")
    pass

# ================= SISTEMA ANTI-DUPLICAÇÃO =================
active_panels = {}
panel_cooldown = {}
command_executions = collections.defaultdict(list)

def log_command_execution(command_name, user_id, context):
    """Registra execução de comando para detectar duplicações"""
    current_time = datetime.now()
    command_executions[f"{command_name}_{user_id}"].append({
        'timestamp': current_time,
        'context': context,
        'channel_id': getattr(context.channel, 'id', 'unknown')
    })

# ================= FUNÇÕES DE VERIFICAÇÃO =================
async def check_admin(ctx):
    """Verifica se usuário é admin"""
    if await ctx.bot.is_owner(ctx.author):
        return True
    return ctx.author.guild_permissions.administrator

async def check_mod(ctx):
    """Verifica se usuário é moderador"""
    if await check_admin(ctx):
        return True
    return ctx.author.guild_permissions.manage_messages
    
    # Limpa execuções antigas (mais de 1 minuto)
    cutoff_time = current_time - timedelta(minutes=1)
    command_executions[f"{command_name}_{user_id}"] = [
        exec_data for exec_data in command_executions[f"{command_name}_{user_id}"]
        if exec_data['timestamp'] > cutoff_time
    ]

# ================= BANCO DE DADOS =================
DB_PATH = Path(__file__).parent / "config.db"
CONFIG_DB_PATH = Path(__file__).parent / "perm_config.db"

def get_db():
    """Retorna conexão com banco de dados"""
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON")
        return conn
    except sqlite3.Error as e:
        print(f"Erro ao conectar ao banco: {e}")
        raise

def init_db():
    """Inicializa banco de dados"""
    try:
        conn = get_db()
        
        # Tabela de usuários
        conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            user_id INTEGER PRIMARY KEY,
            money INTEGER DEFAULT 0,
            bank INTEGER DEFAULT 0,
            rep INTEGER DEFAULT 0,
            xp INTEGER DEFAULT 0,
            level INTEGER DEFAULT 1,
            last_daily TEXT,
            last_rep TEXT,
            last_work TEXT,
            about_me TEXT,
            vip INTEGER DEFAULT 0,
            vip_level INTEGER DEFAULT 0,
            family_id INTEGER,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
        """)
        
        # Tabela de famílias
        conn.execute("""
        CREATE TABLE IF NOT EXISTS families (
            family_id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            leader_id INTEGER NOT NULL,
            description TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            member_count INTEGER DEFAULT 1
        )
        """)
        
        # Tabela de advertências
        conn.execute("""
        CREATE TABLE IF NOT EXISTS warns (
            warn_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            moderator_id INTEGER NOT NULL,
            reason TEXT NOT NULL,
            timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
            server_id INTEGER NOT NULL,
            active INTEGER DEFAULT 1
        )
        """)
        
        # Tabela de staff
        conn.execute("""
        CREATE TABLE IF NOT EXISTS staff (
            user_id INTEGER PRIMARY KEY,
            role TEXT NOT NULL,
            permissions TEXT,
            join_date TEXT DEFAULT CURRENT_TIMESTAMP,
            server_id INTEGER NOT NULL,
            points INTEGER DEFAULT 0
        )
        """)
        
        # Tabela de primeira dama
        conn.execute("""
        CREATE TABLE IF NOT EXISTS primeira_dama (
            server_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            cargo_name TEXT DEFAULT 'Primeira Dama',
            data_indicacao TEXT DEFAULT CURRENT_TIMESTAMP,
            active INTEGER DEFAULT 1,
            PRIMARY KEY (server_id, user_id)
        )
        """)
        
        # Tabela de trabalhos
        conn.execute("""
        CREATE TABLE IF NOT EXISTS jobs (
            job_id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            emoji TEXT,
            min_pay INTEGER NOT NULL,
            max_pay INTEGER NOT NULL,
            description TEXT,
            cooldown INTEGER DEFAULT 3600,
            required_level INTEGER DEFAULT 1
        )
        """)
        
        # Tabela de configurações de servidor (para prefixos personalizados)
        conn.execute("""
        CREATE TABLE IF NOT EXISTS server_configs (
            guild_id TEXT PRIMARY KEY,
            prefix TEXT DEFAULT '!',
            family_command TEXT DEFAULT 'f',
            family_prefix TEXT DEFAULT NULL,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
        """)
        
        # ================= TABELAS DO SISTEMA DE TICKETS =================
        # Tabela de configurações de tickets por servidor
        conn.execute("""
        CREATE TABLE IF NOT EXISTS ticket_configs (
            guild_id TEXT PRIMARY KEY,
            config_data TEXT NOT NULL,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
        """)
        
        # Tabela de tickets ativos
        conn.execute("""
        CREATE TABLE IF NOT EXISTS active_tickets (
            channel_id TEXT PRIMARY KEY,
            guild_id TEXT NOT NULL,
            user_id TEXT NOT NULL,
            ticket_type TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            voice_channel_id TEXT,
            priority TEXT DEFAULT 'normal',
            staff_assigned TEXT
        )
        """)
        
        # Tabela de logs de tickets
        conn.execute("""
        CREATE TABLE IF NOT EXISTS ticket_logs (
            log_id INTEGER PRIMARY KEY AUTOINCREMENT,
            guild_id TEXT NOT NULL,
            channel_id TEXT NOT NULL,
            user_id TEXT NOT NULL,
            action TEXT NOT NULL,
            details TEXT,
            timestamp TEXT DEFAULT CURRENT_TIMESTAMP
        )
        """)
        
        # Tabela de controle de rate limit de tickets por usuário
        conn.execute("""
        CREATE TABLE IF NOT EXISTS user_tickets (
            user_id TEXT NOT NULL,
            guild_id TEXT NOT NULL,
            last_ticket TEXT DEFAULT CURRENT_TIMESTAMP,
            ticket_count INTEGER DEFAULT 0,
            PRIMARY KEY (user_id, guild_id)
        )
        """)
        
        conn.commit()
        conn.close()
        print("✅ Banco de dados inicializado!")
        
    except Exception as e:
        print(f"❌ Erro ao inicializar banco: {e}")

def init_perm_db():
    """Inicializa banco de permissões"""
    try:
        conn = sqlite3.connect(CONFIG_DB_PATH)
        conn.execute("""
        CREATE TABLE IF NOT EXISTS server_config (
            server_id INTEGER PRIMARY KEY,
            admin_role_id INTEGER DEFAULT NULL,
            mod_role_id INTEGER DEFAULT NULL,
            dono_bot_role_id INTEGER DEFAULT NULL,
            pd_role_id INTEGER DEFAULT NULL,
            prefix TEXT DEFAULT '!'
        )
        """)
        conn.commit()
        conn.close()
        print("✅ Banco de permissões inicializado!")
    except Exception as e:
        print(f"❌ Erro ao inicializar permissões: {e}")

# ================= SISTEMA DE TICKETS - CLASSES E FUNÇÕES =================
class TicketConfig:
    """Classe para gerenciar configurações de tickets por servidor"""
    
    def __init__(self, guild_id):
        self.guild_id = str(guild_id)
        self.config = self._load_config()
    
    def _load_config(self):
        """Carrega configuração do banco de dados"""
        try:
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            cursor.execute("SELECT config_data FROM ticket_configs WHERE guild_id = ?", (self.guild_id,))
            result = cursor.fetchone()
            conn.close()
            
            if result:
                return json.loads(result[0])
            else:
                # Usar configuração padrão
                return TICKET_DEFAULTS.copy()
        except Exception as e:
            print(f"Erro ao carregar config de tickets: {e}")
            return TICKET_DEFAULTS.copy()
    
    def save_config(self):
        """Salva configuração no banco de dados"""
        try:
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            cursor.execute("""
                INSERT OR REPLACE INTO ticket_configs (guild_id, config_data, updated_at)
                VALUES (?, ?, datetime('now'))
            """, (self.guild_id, json.dumps(self.config)))
            conn.commit()
            conn.close()
            return True
        except Exception as e:
            print(f"Erro ao salvar config de tickets: {e}")
            return False
    
    def get_field(self, path):
        """Obtém um campo específico da configuração usando path (lista)"""
        current = self.config
        for key in path:
            if isinstance(current, dict) and key in current:
                current = current[key]
            else:
                return None
        return current
    
    def set_field(self, path, value):
        """Define um campo específico da configuração usando path (lista)"""
        current = self.config
        for key in path[:-1]:
            if key not in current:
                current[key] = {}
            current = current[key]
        current[path[-1]] = value
        return self.save_config()

async def log_ticket_action(guild_id, channel_id, user_id, action, details=None):
    """Registra uma ação de ticket no log"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO ticket_logs (guild_id, channel_id, user_id, action, details)
            VALUES (?, ?, ?, ?, ?)
        """, (str(guild_id), str(channel_id), str(user_id), action, details))
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Erro ao registrar log de ticket: {e}")

async def check_rate_limit(user_id, guild_id):
    """Verifica se o usuário pode criar um novo ticket"""
    try:
        config = TicketConfig(guild_id)
        rate_limit_hours = config.get_field(["settings", "rate_limit_hours"]) or 24
        max_tickets = config.get_field(["settings", "max_tickets_per_user"]) or 3
        
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Verificar tickets ativos do usuário
        cursor.execute("""
            SELECT COUNT(*) FROM active_tickets 
            WHERE user_id = ? AND guild_id = ?
        """, (str(user_id), str(guild_id)))
        active_count = cursor.fetchone()[0]
        
        if active_count >= max_tickets:
            conn.close()
            return False, f"Você já possui {active_count} tickets ativos. Limite: {max_tickets}"
        
        # Verificar rate limit
        cursor.execute("""
            SELECT last_ticket, ticket_count FROM user_tickets 
            WHERE user_id = ? AND guild_id = ?
        """, (str(user_id), str(guild_id)))
        result = cursor.fetchone()
        
        if result:
            last_ticket_str, ticket_count = result
            last_ticket = datetime.fromisoformat(last_ticket_str)
            hours_since = (datetime.now() - last_ticket).total_seconds() / 3600
            
            if hours_since < rate_limit_hours:
                conn.close()
                remaining = rate_limit_hours - hours_since
                return False, f"Aguarde {remaining:.1f}h para criar outro ticket"
        
        conn.close()
        return True, "OK"
        
    except Exception as e:
        print(f"Erro ao verificar rate limit: {e}")
        return True, "OK"  # Em caso de erro, permitir

async def add_rate_limit(user_id, guild_id):
    """Adiciona/atualiza rate limit do usuário"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT OR REPLACE INTO user_tickets (user_id, guild_id, last_ticket, ticket_count)
            VALUES (?, ?, datetime('now'), 
                COALESCE((SELECT ticket_count FROM user_tickets WHERE user_id = ? AND guild_id = ?), 0) + 1)
        """, (str(user_id), str(guild_id), str(user_id), str(guild_id)))
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Erro ao adicionar rate limit: {e}")

async def create_voice_channel(guild, ticket_type, user, category=None):
    """Cria canal de voz para o ticket"""
    try:
        config = TicketConfig(guild.id)
        voice_config = config.get_field(["voice", ticket_type])
        
        if not voice_config:
            return None
        
        # Configurar nome do canal
        channel_name = voice_config["name"].format(user=user.display_name)
        
        # Configurar permissões
        overwrites = {
            guild.default_role: discord.PermissionOverwrite(view_channel=False),
            user: discord.PermissionOverwrite(view_channel=True, connect=True, speak=True),
            guild.me: discord.PermissionOverwrite(view_channel=True, connect=True, manage_channels=True)
        }
        
        # Adicionar permissões para staff
        for role in guild.roles:
            if any(staff_name.lower() in role.name.lower() for staff_name in STAFF_ROLE_NAMES):
                overwrites[role] = discord.PermissionOverwrite(view_channel=True, connect=True, speak=True)
        
        # Criar canal
        voice_channel = await guild.create_voice_channel(
            name=channel_name,
            category=category,
            overwrites=overwrites,
            user_limit=voice_config.get("limit", 5),
            bitrate=voice_config.get("bitrate", 64000)
        )
        
        return voice_channel
        
    except Exception as e:
        print(f"Erro ao criar canal de voz: {e}")
        return None

async def backup_ticket_messages(channel):
    """Faz backup das mensagens do ticket"""
    try:
        messages_data = []
        async for message in channel.history(limit=None, oldest_first=True):
            message_data = {
                "author": str(message.author),
                "content": message.content,
                "timestamp": message.created_at.isoformat(),
                "attachments": [att.url for att in message.attachments]
            }
            messages_data.append(message_data)
        
        # Salvar backup
        backup_dir = Path(__file__).parent / "backups"
        backup_dir.mkdir(exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_file = backup_dir / f"ticket_{channel.id}_{timestamp}.json"
        
        with open(backup_file, 'w', encoding='utf-8') as f:
            json.dump({
                "channel_id": str(channel.id),
                "channel_name": channel.name,
                "guild_id": str(channel.guild.id),
                "backup_date": datetime.now().isoformat(),
                "messages": messages_data
            }, f, ensure_ascii=False, indent=2)
        
        return backup_file
        
    except Exception as e:
        print(f"Erro ao fazer backup: {e}")
        return None

def find_member_by_name(guild, name):
    """Busca um membro pelo nome ou apelido no servidor"""
    name = name.lower()
    for member in guild.members:
        if member.name.lower() == name or (member.nick and member.nick.lower() == name):
            return member
    return None

# ================= SERVIDOR HTTP PARA DASHBOARD =================
# from aiohttp import web
# import aiohttp_cors

# async def handle_config_update(request):
#     """Endpoint para receber atualizações de configuração do dashboard"""
#     try:
#         data = await request.json()
#         guild_id = data.get('guildId')
#         section = data.get('section')
#         config = data.get('config')
#         
#         print(f"📥 Configuração recebida do dashboard: {guild_id}/{section}")
#         
#         # Processar configuração de prefixo
#         if section == 'prefix' and config:
#             prefix = config.get('prefix')
#             family_command = config.get('family_command', 'f')
#             
#             if prefix and guild_id:
#                 try:
#                     # Conectar ao banco de dados e atualizar prefixo
#                     conn = sqlite3.connect(DB_PATH)
#                     cursor = conn.cursor()
#                     
#                     # Atualizar ou inserir configuração de prefixo
#                     cursor.execute("""
#                         INSERT OR REPLACE INTO server_configs (guild_id, prefix, family_command, updated_at)
#                         VALUES (?, ?, ?, datetime('now'))
#                     """, (guild_id, prefix, family_command))
#                     
#                     conn.commit()
#                     conn.close()
#                     
#                     print(f"✅ Prefixo atualizado no bot: {prefix} para servidor {guild_id}")
#                     
#                     # Registrar comandos dinâmicos se necessário
#                     if family_command and family_command not in ['f', 'familia']:
#                         register_dynamic_commands()
#                     
#                     return web.json_response({
#                         'success': True, 
#                         'message': f'Prefixo "{prefix}" aplicado com sucesso!',
#                         'config': {
#                             'prefix': prefix,
#                             'family_command': family_command
#                         }
#                     })
#                     
#                 except Exception as db_error:
#                     print(f"❌ Erro ao salvar prefixo no banco: {db_error}")
#                     return web.json_response({'error': 'Erro ao salvar configuração no banco de dados'}, status=500)
#             else:
#                 return web.json_response({'error': 'Prefixo ou guild_id inválido'}, status=400)
#         
#         # Processar configuração de prefixo de família (VIP)
#         elif section == 'family_prefix' and config:
#             family_prefix = config.get('family_prefix')
#             user_id = config.get('user_id')
#             
#             if family_prefix and guild_id and user_id:
#                 try:
#                     # Verificar se o usuário tem VIP
#                     conn = sqlite3.connect(DB_PATH)
#                     cursor = conn.cursor()
#                     
#                     cursor.execute("SELECT vip, vip_level FROM users WHERE user_id = ?", (user_id,))
#                     user_data = cursor.fetchone()
#                     
#                     if not user_data or user_data[0] != 1:
#                         conn.close()
#                         return web.json_response({'error': 'Usuário não possui assinatura VIP'}, status=403)
#                     
#                     # Atualizar prefixo de família
#                     cursor.execute("""
#                         INSERT OR REPLACE INTO server_configs (guild_id, family_prefix, updated_at)
#                         VALUES (?, ?, datetime('now'))
#                         ON CONFLICT(guild_id) DO UPDATE SET
#                         family_prefix = excluded.family_prefix,
#                         updated_at = excluded.updated_at
#                     """, (guild_id, family_prefix))
#                     
#                     conn.commit()
#                     conn.close()
#                     
#                     print(f"✅ Prefixo de família atualizado: {family_prefix} para servidor {guild_id}")
#                     
#                     return web.json_response({
#                         'success': True,
#                         'message': f'Prefixo de família "{family_prefix}" configurado com sucesso!',
#                         'config': {
#                             'family_prefix': family_prefix
#                         }
#                     })
#                     
#                 except Exception as db_error:
#                     print(f"❌ Erro ao salvar prefixo de família: {db_error}")
#                     return web.json_response({'error': 'Erro ao salvar configuração no banco de dados'}, status=500)
#             else:
#                 return web.json_response({'error': 'Dados inválidos para prefixo de família'}, status=400)
#         
#         # Outras configurações podem ser processadas aqui
#         return web.json_response({'success': True, 'message': 'Configuração processada'})
#         
#     except Exception as e:
#         print(f"❌ Erro ao processar configuração: {e}")
#         return web.json_response({'error': str(e)}, status=500)

# async def handle_bot_status(request):
#     """Endpoint para fornecer status do bot"""
#     try:
#         return web.json_response({
#             'success': True,
#             'status': 'online' if bot.is_ready() else 'offline',
#             'guilds': len(bot.guilds) if bot.is_ready() else 0,
#             'latency': round(bot.latency * 1000, 2) if bot.is_ready() else None
#         })
#     except Exception as e:
#         return web.json_response({'error': str(e)}, status=500)

# async def handle_root(request):
#     """Endpoint raiz do servidor"""
#     html_content = """
#     <!DOCTYPE html>
#     <html lang="pt-BR">
#     <head>
#         <meta charset="UTF-8">
#         <meta name="viewport" content="width=device-width, initial-scale=1.0">
#         <title>MDBot API Server</title>
#         <style>
#             body {
#                 font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
#                 background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
#                 margin: 0;
#                 padding: 20px;
#                 min-height: 100vh;
#                 display: flex;
#                 align-items: center;
#                 justify-content: center;
#             }
#             .container {
#                 background: white;
#                 border-radius: 15px;
#                 padding: 40px;
#                 box-shadow: 0 20px 40px rgba(0,0,0,0.1);
#                 max-width: 600px;
#                 width: 100%;
#             }
#             h1 {
#                 color: #333;
#                 text-align: center;
#                 margin-bottom: 30px;
#                 font-size: 2.5em;
#             }
#             .status {
#                 background: #4CAF50;
#                 color: white;
#                 padding: 10px 20px;
#                 border-radius: 25px;
#                 display: inline-block;
#                 margin-bottom: 30px;
#                 font-weight: bold;
#             }
#             .endpoints {
#                 background: #f8f9fa;
#                 border-radius: 10px;
#                 padding: 20px;
#                 margin: 20px 0;
#             }
#             .endpoint {
#                 display: flex;
#                 justify-content: space-between;
#                 padding: 10px 0;
#                 border-bottom: 1px solid #eee;
#             }
#             .endpoint:last-child {
#                 border-bottom: none;
#             }
#             .endpoint-path {
#                 font-family: monospace;
#                 background: #e9ecef;
#                 padding: 5px 10px;
#                 border-radius: 5px;
#                 font-weight: bold;
#             }
#             .info {
#                 text-align: center;
#                 color: #666;
#                 margin-top: 30px;
#             }
#             .version {
#                 color: #007bff;
#                 font-weight: bold;
#             }
#         </style>
#     </head>
#     <body>
#         <div class="container">
#             <h1>🤖 MDBot API Server</h1>
#             <div class="status">✅ Online</div>
#             
#             <div class="endpoints">
#                 <h3>📋 Endpoints Disponíveis:</h3>
#                 <div class="endpoint">
#                     <span class="endpoint-path">/</span>
#                     <span>Informações do servidor</span>
#                 </div>
#                 <div class="endpoint">
#                     <span class="endpoint-path">/health</span>
#                     <span>Verificação de saúde</span>
#                 </div>
#                 <div class="endpoint">
#                     <span class="endpoint-path">/api/bot/status</span>
#                     <span>Status do bot</span>
#                 </div>
#                 <div class="endpoint">
#                     <span class="endpoint-path">/api/config/update</span>
#                     <span>Verificar configurações</span>
#                 </div>
#             </div>
#             
#             <div class="info">
#                 <p><strong>Versão:</strong> <span class="version">1.0.0</span></p>
#                 <p><strong>Dashboard:</strong> <a href="http://localhost:5173" target="_blank">http://localhost:5173</a></p>
#                 <p><strong>Última atualização:</strong> """ + datetime.now().strftime('%d/%m/%Y %H:%M:%S') + """</p>
#             </div>
#         </div>
#     </body>
#     </html>
#     """
#     return web.Response(text=html_content, content_type='text/html')

# Comentado temporariamente para resolver problemas de compilação no SquareCloud
# async def handle_health(request):
#     """Endpoint de verificação de saúde"""
#     return web.json_response({
#         'status': 'healthy',
#         'bot_connected': bot.is_ready() if 'bot' in globals() else False,
#         'guilds_count': len(bot.guilds) if 'bot' in globals() and bot.is_ready() else 0,
#         'timestamp': datetime.now().isoformat()
#     })

# async def start_http_server():
#     """Inicia servidor HTTP para comunicação com dashboard"""
#     app = web.Application()
#     
#     # Configurar CORS
#     cors = aiohttp_cors.setup(app, defaults={
#         "*": aiohttp_cors.ResourceOptions(
#             allow_credentials=True,
#             expose_headers="*",
#             allow_headers="*",
#             allow_methods="*"
#         )
#     })
#     
#     # Adicionar rotas
#     app.router.add_post('/api/config/update', handle_config_update)
#     app.router.add_get('/api/bot/status', handle_bot_status)
#     app.router.add_get('/', handle_root)
#     app.router.add_get('/health', handle_health)
#     
#     # Aplicar CORS a todas as rotas
#     for route in list(app.router.routes()):
#         cors.add(route)
#     
#     # Iniciar servidor
#     port = int(os.getenv('PORT', '8080'))
#     runner = web.AppRunner(app)
#     await runner.setup()
#     site = web.TCPSite(runner, '0.0.0.0', port)
#     await site.start()
    print(f"🌐 Servidor HTTP iniciado na porta {port}")

# ================= FAMILY SYSTEM =================
class HelpCategoryView(View):
    def __init__(self):
        super().__init__(timeout=300)  # 5 minutes timeout
        
    @discord.ui.button(label="Informação", style=discord.ButtonStyle.primary, emoji="ℹ️")
    async def informacao(self, interaction: discord.Interaction, button: Button):
        embed = discord.Embed(
            title="ℹ️ Comandos Informativos",
            description="Comandos para obter informações:",
            color=0x3498db
        )
        embed.add_field(name="Comandos:", value="`ajuda`, `botinfo`, `ping`", inline=False)
        await interaction.response.send_message(embed=embed, ephemeral=True)
        
    @discord.ui.button(label="Moderação", style=discord.ButtonStyle.danger, emoji="🛡️")
    async def moderacao(self, interaction: discord.Interaction, button: Button):
        embed = discord.Embed(
            title="🛡️ Comandos de Moderação",
            description="Comandos para moderação do servidor:",
            color=0xff0000
        )
        embed.add_field(name="Comandos:", value="`warn`, `ban`, `kick`, `mute`, `unmute`, `lock`, `unlock`", inline=False)
        await interaction.response.send_message(embed=embed, ephemeral=True)
        
    @discord.ui.button(label="Economia", style=discord.ButtonStyle.success, emoji="💰")
    async def economia(self, interaction: discord.Interaction, button: Button):
        embed = discord.Embed(
            title="💰 Sistema Econômico",
            description="Comandos do sistema de economia:",
            color=0x00ff00
        )
        embed.add_field(name="Comandos:", value="`carteira`, `daily`, `depositar`, `empregos`, `trabalhar`", inline=False)
        await interaction.response.send_message(embed=embed, ephemeral=True)
        
    @discord.ui.button(label="Diversão", style=discord.ButtonStyle.secondary, emoji="🎉")
    async def diversao(self, interaction: discord.Interaction, button: Button):
        embed = discord.Embed(
            title="🎉 Comandos de Entretenimento",
            description="Comandos divertidos e sociais:",
            color=0x9b59b6
        )
        embed.add_field(name="Comandos:", value="`avatar`, `perfil`, `rep`, `sobremim`", inline=False)
        await interaction.response.send_message(embed=embed, ephemeral=True)
        
    @discord.ui.button(label="Utilidade", style=discord.ButtonStyle.primary, emoji="🔧")
    async def utilidade(self, interaction: discord.Interaction, button: Button):
        embed = discord.Embed(
            title="🔧 Ferramentas Úteis",
            description="Comandos utilitários e de staff:",
            color=0x3498db
        )
        embed.add_field(name="Comandos:", value="`cl`, `clear`, `membersrole`", inline=False)
        await interaction.response.send_message(embed=embed, ephemeral=True)

    @discord.ui.button(label="VIP", style=discord.ButtonStyle.primary, emoji="⭐", row=1)
    async def vip(self, interaction: discord.Interaction, button: Button):
        embed = discord.Embed(
            title="⭐ Comandos VIP",
            description="Comandos exclusivos para VIP:",
            color=0xffd700
        )
        embed.add_field(name="Comandos:", value="`familia`, `addfamily`, `removefamily`", inline=False)
        await interaction.response.send_message(embed=embed, ephemeral=True)
        
    @discord.ui.button(label="PrimDama", style=discord.ButtonStyle.secondary, emoji="👑", row=1)
    async def primdama(self, interaction: discord.Interaction, button: Button):
        embed = discord.Embed(
            title="👑 Comandos da Primeira Dama",
            description="Comandos exclusivos da Primeira Dama:",
            color=0x9b59b6
        )
        embed.add_field(name="Comandos:", value="`pd`", inline=False)
        await interaction.response.send_message(embed=embed, ephemeral=True)

class FamiliaView(View):
    def __init__(self):
        super().__init__(timeout=300)
        
    async def on_timeout(self):
        # Remove from active panels when timeout
        for channel_id, view in list(active_panels.items()):
            if view == self:
                del active_panels[channel_id]
                break

    @discord.ui.button(label="👨‍👩‍👧‍👦 Criar Família", style=discord.ButtonStyle.green, emoji="➕")
    async def criar_familia(self, interaction: discord.Interaction, button: Button):
        modal = CriarFamiliaModal()
        await interaction.response.send_modal(modal)

    @discord.ui.button(label="👥 Entrar na Família", style=discord.ButtonStyle.primary, emoji="🚪")
    async def entrar_familia(self, interaction: discord.Interaction, button: Button):
        modal = EntrarFamiliaModal()
        await interaction.response.send_modal(modal)

    @discord.ui.button(label="📊 Info da Família", style=discord.ButtonStyle.secondary, emoji="ℹ️")
    async def info_familia(self, interaction: discord.Interaction, button: Button):
        await mostrar_info_familia(interaction)

    @discord.ui.button(label="🚪 Sair da Família", style=discord.ButtonStyle.red, emoji="❌")
    async def sair_familia(self, interaction: discord.Interaction, button: Button):
        await deixar_familia(interaction)

class CriarFamiliaModal(Modal):
    def __init__(self):
        super().__init__(title="Criar Nova Família")
        
        self.nome_familia = TextInput(
            label="Nome da Família",
            placeholder="Digite o nome da sua família...",
            max_length=50,
            required=True
        )
        self.add_item(self.nome_familia)

    async def on_submit(self, interaction: discord.Interaction):
        nome = self.nome_familia.value
        user_id = interaction.user.id
        
        try:
            conn = get_db()
            
            # Check if user already has a family
            existing = conn.execute(
                "SELECT family_id FROM users WHERE user_id = ?", (user_id,)
            ).fetchone()
            
            if existing and existing[0]:
                await interaction.response.send_message("❌ Você já está em uma família!", ephemeral=True)
                return
            
            # Check if family name exists
            name_exists = conn.execute(
                "SELECT family_id FROM families WHERE name = ?", (nome,)
            ).fetchone()
            
            if name_exists:
                await interaction.response.send_message("❌ Já existe uma família com este nome!", ephemeral=True)
                return
            
            # Create family
            cursor = conn.execute(
                "INSERT INTO families (name, leader_id, created_at) VALUES (?, ?, ?)",
                (nome, user_id, datetime.now().isoformat())
            )
            family_id = cursor.lastrowid
            
            # Add user to family
            conn.execute(
                "INSERT OR REPLACE INTO users (user_id, family_id) VALUES (?, ?)",
                (user_id, family_id)
            )
            
            conn.commit()
            conn.close()
            
            embed = discord.Embed(
                title="✅ Família Criada!",
                description=f"A família **{nome}** foi criada com sucesso!\n\nVocê agora é o líder desta família.",
                color=0x00ff00
            )
            await interaction.response.send_message(embed=embed, ephemeral=True)
            
        except Exception as e:
            print(f"Erro ao criar família: {e}")
            await interaction.response.send_message("❌ Erro ao criar família!", ephemeral=True)

class EntrarFamiliaModal(Modal):
    def __init__(self):
        super().__init__(title="Entrar em Família")
        
        self.nome_familia = TextInput(
            label="Nome da Família",
            placeholder="Digite o nome da família que deseja entrar...",
            max_length=50,
            required=True
        )
        self.add_item(self.nome_familia)

    async def on_submit(self, interaction: discord.Interaction):
        nome = self.nome_familia.value
        user_id = interaction.user.id
        
        try:
            conn = get_db()
            
            # Check if user already has a family
            existing = conn.execute(
                "SELECT family_id FROM users WHERE user_id = ?", (user_id,)
            ).fetchone()
            
            if existing and existing[0]:
                await interaction.response.send_message("❌ Você já está em uma família!", ephemeral=True)
                return
            
            # Find family
            family = conn.execute(
                "SELECT family_id FROM families WHERE name = ?", (nome,)
            ).fetchone()
            
            if not family:
                await interaction.response.send_message("❌ Família não encontrada!", ephemeral=True)
                return
            
            # Add user to family
            conn.execute(
                "INSERT OR REPLACE INTO users (user_id, family_id) VALUES (?, ?)",
                (user_id, family[0])
            )
            
            conn.commit()
            conn.close()
            
            embed = discord.Embed(
                title="✅ Entrou na Família!",
                description=f"Você agora faz parte da família **{nome}**!",
                color=0x00ff00
            )
            await interaction.response.send_message(embed=embed, ephemeral=True)
            
        except Exception as e:
            print(f"Erro ao entrar na família: {e}")
            await interaction.response.send_message("❌ Erro ao entrar na família!", ephemeral=True)

async def mostrar_info_familia(interaction: discord.Interaction):
    user_id = interaction.user.id
    
    try:
        conn = get_db()
        
        # Get user's family info
        family_info = conn.execute("""
            SELECT f.name, f.leader_id, f.created_at, COUNT(u.user_id) as member_count
            FROM users u
            JOIN families f ON u.family_id = f.family_id
            WHERE u.user_id = ?
            GROUP BY f.family_id, f.name, f.leader_id, f.created_at
        """, (user_id,)).fetchone()
        
        conn.close()
        
        if not family_info:
            await interaction.response.send_message("❌ Você não está em nenhuma família!", ephemeral=True)
            return
        
        name, leader_id, created_at, member_count = family_info
        
        embed = discord.Embed(
            title=f"👨‍👩‍👧‍👦 Família: {name}",
            color=0x3498db
        )
        embed.add_field(name="👑 Líder", value=f"<@{leader_id}>", inline=True)
        embed.add_field(name="👥 Membros", value=str(member_count), inline=True)
        embed.add_field(name="📅 Criada em", value=created_at[:10], inline=True)
        
        await interaction.response.send_message(embed=embed, ephemeral=True)
        
    except Exception as e:
        print(f"Erro ao buscar info da família: {e}")
        await interaction.response.send_message("❌ Erro ao buscar informações da família!", ephemeral=True)

async def deixar_familia(interaction: discord.Interaction):
    user_id = interaction.user.id
    
    try:
        conn = get_db()
        
        # Check if user is in a family
        family_info = conn.execute(
            "SELECT family_id FROM users WHERE user_id = ?", (user_id,)
        ).fetchone()
        
        if not family_info or not family_info[0]:
            await interaction.response.send_message("❌ Você não está em nenhuma família!", ephemeral=True)
            return
        
        family_id = family_info[0]
        
        # Check if user is the leader
        is_leader = conn.execute(
            "SELECT family_id FROM families WHERE family_id = ? AND leader_id = ?",
            (family_id, user_id)
        ).fetchone()
        
        if is_leader:
            await interaction.response.send_message("❌ Líderes não podem sair da família! Transfira a liderança primeiro.", ephemeral=True)
            return
        
        # Remove user from family
        conn.execute(
            "UPDATE users SET family_id = NULL WHERE user_id = ?", (user_id,)
        )
        
        conn.commit()
        conn.close()
        
        embed = discord.Embed(
            title="✅ Saiu da Família!",
            description="Você saiu da família com sucesso.",
            color=0xff9900
        )
        await interaction.response.send_message(embed=embed, ephemeral=True)
        
    except Exception as e:
        print(f"Erro ao sair da família: {e}")
        await interaction.response.send_message("❌ Erro ao sair da família!", ephemeral=True)

# ================= FAMILIA COMMAND =================
@bot.command(name='f', aliases=['familia'])
@cooldown(1, 10, BucketType.channel)
async def familia_panel(ctx):
    """Abre o painel de famílias"""
    
    # Check if there's already an active panel in this channel
    channel_id = ctx.channel.id
    current_time = time.time()
    
    # Check cooldown for this channel
    if channel_id in panel_cooldown:
        if current_time - panel_cooldown[channel_id] < 10:  # 10 second cooldown
            await ctx.send("⏰ Aguarde alguns segundos antes de abrir outro painel!", delete_after=3)
            return
    
    # Remove existing panel from this channel
    if channel_id in active_panels:
        try:
            old_message = active_panels[channel_id]
            if hasattr(old_message, 'delete'):
                await old_message.delete()
        except:
            pass
        del active_panels[channel_id]
    
    # Update cooldown
    panel_cooldown[channel_id] = current_time
    
    embed = discord.Embed(
        title="🔧 PAINEL DE AJUDA FOLK APP",
        description="Escolha uma categoria de comandos:",
        color=0x3498db
    )
    
    embed.add_field(
        name="📚 Categorias Disponíveis:",
        value="",
        inline=False
    )
    
    embed.add_field(
        name="ℹ️ Informação",
        value="→ Comandos informativos",
        inline=True
    )
    
    embed.add_field(
        name="🛡️ Moderação",
        value="→ Comandos de moderação",
        inline=True
    )
    
    embed.add_field(
        name="🎉 Diversão",
        value="→ Comandos de entretenimento",
        inline=True
    )
    
    embed.add_field(
        name="🔧 Utilidade",
        value="→ Ferramentas úteis",
        inline=True
    )
    
    embed.add_field(
        name="💰 Economia",
        value="→ Sistema econômico",
        inline=True
    )
    
    embed.add_field(
        name="⭐ VIP",
        value="→ Comandos exclusivos VIP",
        inline=True
    )
    
    embed.add_field(
        name="👑 PrimDama",
        value="→ Comandos da Primeira Dama",
        inline=True
    )
    
    embed.set_footer(text=f"FOLK APP • {datetime.now().strftime('%d/%m/%Y %H:%M')}")
    
    view = HelpCategoryView()
    message = await ctx.send(embed=embed, view=view)
    
    # Store the message to prevent duplicates
    active_panels[channel_id] = message
    
    log_command_execution("familia", ctx.author.id, ctx)

# ================= PAINEL COMMAND =================
@bot.command(name='painel', aliases=['dashboard', 'config'])
@cooldown(1, 5, BucketType.user)
async def painel_dashboard(ctx):
    """Abre o painel de configuração do bot"""
    
    embed = discord.Embed(
        title="🔧 Painel de Configuração",
        description="Acesse o painel web para configurar o bot!",
        color=0x3498db
    )
    
    embed.add_field(
        name="🌐 Link do Dashboard",
        value="[Clique aqui para acessar](http://localhost:3000)",
        inline=False
    )
    
    embed.add_field(
        name="⚙️ Configurações Disponíveis",
        value="• Prefixo personalizado\n• Configurações de moderação\n• Permissões de comandos\n• E muito mais!",
        inline=False
    )
    
    embed.set_footer(text=f"FOLK APP • {datetime.now().strftime('%d/%m/%Y %H:%M')}")
    
    await ctx.send(embed=embed)
    log_command_execution("painel", ctx.author.id, ctx)

# ================= H! COMMAND =================
@bot.command(name='h')
@cooldown(1, 5, BucketType.user)
async def help_panel(ctx):
    """Abre o painel do bot (comando h!)"""
    
    embed = discord.Embed(
        title="🤖 Painel do Bot - FOLK APP",
        description="Bem-vindo ao painel de ajuda do bot!",
        color=0x3498db
    )
    
    embed.add_field(
        name="🌐 Dashboard Web",
        value="[Acesse o painel completo](http://localhost:5173)\nConfigure o bot de forma visual e intuitiva!",
        inline=False
    )
    
    embed.add_field(
        name="📚 Comandos Principais",
        value="• `!f` ou `!familia` - Painel de famílias\n• `!ajuda` - Lista todos os comandos\n• `!painel` - Configurações do bot",
        inline=False
    )
    
    embed.add_field(
        name="⚙️ Configurações Rápidas",
        value="• `!setprefix <prefixo>` - Alterar prefixo\n• `!cl <número>` - Limpar mensagens",
        inline=False
    )
    
    embed.set_footer(text=f"FOLK APP • Use h! para abrir este painel • {datetime.now().strftime('%d/%m/%Y %H:%M')}")
    
    await ctx.send(embed=embed)
    log_command_execution("h!", ctx.author.id, ctx)

# ================= SISTEMA DE TICKETS - VIEWS E MODALS =================
class TicketPanelView(View):
    """View para o painel principal de tickets"""
    
    def __init__(self, config):
        super().__init__(timeout=None)
        self.config = config
        
        # Adicionar botões baseados na configuração
        panel_config = config.get_field(["panels", "main"])
        if panel_config and "options" in panel_config:
            for option_key, option_data in panel_config["options"].items():
                button = Button(
                    label=option_data["label"],
                    emoji=option_data["emoji"],
                    style=getattr(discord.ButtonStyle, option_data["style"], discord.ButtonStyle.primary),
                    custom_id=f"ticket_{option_key}"
                )
                button.callback = self.create_ticket_callback(option_key)
                self.add_item(button)
    
    def create_ticket_callback(self, ticket_type):
        async def callback(interaction):
            await self.create_ticket(interaction, ticket_type)
        return callback
    
    async def create_ticket(self, interaction, ticket_type):
        """Cria um novo ticket"""
        try:
            # Verificar rate limit
            can_create, message = await check_rate_limit(interaction.user.id, interaction.guild.id)
            if not can_create:
                await interaction.response.send_message(f"❌ {message}", ephemeral=True)
                return
            
            # Verificar se já existe um ticket ativo deste tipo
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            cursor.execute("""
                SELECT channel_id FROM active_tickets 
                WHERE user_id = ? AND guild_id = ? AND ticket_type = ?
            """, (str(interaction.user.id), str(interaction.guild.id), ticket_type))
            existing = cursor.fetchone()
            conn.close()
            
            if existing:
                channel = interaction.guild.get_channel(int(existing[0]))
                if channel:
                    await interaction.response.send_message(
                        f"❌ Você já possui um ticket de {ticket_type} ativo: {channel.mention}", 
                        ephemeral=True
                    )
                    return
            
            # Criar canal do ticket
            category = None
            if hasattr(interaction.guild, 'categories'):
                for cat in interaction.guild.categories:
                    if 'ticket' in cat.name.lower():
                        category = cat
                        break
            
            # Configurar permissões
            overwrites = {
                interaction.guild.default_role: discord.PermissionOverwrite(view_channel=False),
                interaction.user: discord.PermissionOverwrite(view_channel=True, send_messages=True, read_message_history=True),
                interaction.guild.me: discord.PermissionOverwrite(view_channel=True, send_messages=True, manage_channels=True)
            }
            
            # Adicionar permissões para staff
            for role in interaction.guild.roles:
                if any(staff_name.lower() in role.name.lower() for staff_name in STAFF_ROLE_NAMES):
                    overwrites[role] = discord.PermissionOverwrite(view_channel=True, send_messages=True, read_message_history=True)
            
            # Criar canal
            channel_name = f"{ticket_type}-{interaction.user.name}".lower().replace(" ", "-")
            ticket_channel = await interaction.guild.create_text_channel(
                name=channel_name,
                category=category,
                overwrites=overwrites,
                topic=f"Ticket de {ticket_type} - {interaction.user.mention}"
            )
            
            # Registrar ticket no banco
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO active_tickets (guild_id, channel_id, user_id, ticket_type, created_at)
                VALUES (?, ?, ?, ?, datetime('now'))
            """, (str(interaction.guild.id), str(ticket_channel.id), str(interaction.user.id), ticket_type))
            conn.commit()
            conn.close()
            
            # Adicionar rate limit
            await add_rate_limit(interaction.user.id, interaction.guild.id)
            
            # Criar embed de boas-vindas
            embed = discord.Embed(
                title=f"🎫 Ticket de {ticket_type.title()}",
                description=f"Olá {interaction.user.mention}! Seu ticket foi criado com sucesso.\n\nDescreva seu problema ou dúvida e nossa equipe irá ajudá-lo em breve.",
                color=0x00ff00
            )
            embed.add_field(name="📋 Tipo", value=ticket_type.title(), inline=True)
            embed.add_field(name="👤 Usuário", value=interaction.user.mention, inline=True)
            embed.add_field(name="🕒 Criado em", value=datetime.now().strftime("%d/%m/%Y %H:%M"), inline=True)
            
            # Criar view com botões do ticket
            ticket_view = TicketView(ticket_type)
            
            # Enviar mensagem no canal do ticket
            await ticket_channel.send(embed=embed, view=ticket_view)
            
            # Criar canal de voz se configurado
            voice_channel = await create_voice_channel(interaction.guild, ticket_type, interaction.user, category)
            if voice_channel:
                embed.add_field(name="🔊 Canal de Voz", value=voice_channel.mention, inline=False)
                await ticket_channel.send(f"🔊 Canal de voz criado: {voice_channel.mention}")
            
            # Log da ação
            await log_ticket_action(interaction.guild.id, ticket_channel.id, interaction.user.id, "created", ticket_type)
            
            await interaction.response.send_message(
                f"✅ Ticket criado com sucesso! {ticket_channel.mention}", 
                ephemeral=True
            )
            
        except Exception as e:
            print(f"Erro ao criar ticket: {e}")
            await interaction.response.send_message("❌ Erro ao criar ticket!", ephemeral=True)

class TicketView(View):
    """View para gerenciar tickets individuais"""
    
    def __init__(self, ticket_type):
        super().__init__(timeout=None)
        self.ticket_type = ticket_type
    
    @discord.ui.button(label="🔒 Fechar", style=discord.ButtonStyle.red, emoji="🔒")
    async def close_ticket(self, interaction: discord.Interaction, button: Button):
        """Fecha o ticket atual"""
        # Verificar se é staff ou dono do ticket
        is_staff = any(role.name in STAFF_ROLE_NAMES for role in interaction.user.roles)
        
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute(
            "SELECT user_id FROM active_tickets WHERE channel_id = ?", 
            (str(interaction.channel.id),)
        )
        result = cursor.fetchone()
        conn.close()
        
        is_owner = result and str(interaction.user.id) == result[0]
        
        if not (is_staff or is_owner):
            await interaction.response.send_message("❌ Apenas staff ou o dono do ticket podem fechá-lo!", ephemeral=True)
            return
        
        # Mostrar confirmação
        confirm_view = ConfirmCloseView()
        await interaction.response.send_message(
            "⚠️ Tem certeza que deseja fechar este ticket?", 
            view=confirm_view, 
            ephemeral=True
        )
    
    @discord.ui.button(label="➕ Adicionar", style=discord.ButtonStyle.green, emoji="➕")
    async def add_member(self, interaction: discord.Interaction, button: Button):
        """Adiciona um membro ao ticket"""
        # Verificar se é staff
        is_staff = any(role.name in STAFF_ROLE_NAMES for role in interaction.user.roles)
        if not is_staff:
            await interaction.response.send_message("❌ Apenas staff pode adicionar membros!", ephemeral=True)
            return
        
        modal = AddMemberModal()
        await interaction.response.send_modal(modal)
    
    @discord.ui.button(label="📞 Criar Call", style=discord.ButtonStyle.blurple, emoji="📞")
    async def create_call(self, interaction: discord.Interaction, button: Button):
        """Cria um canal de voz para o ticket"""
        try:
            # Verificar se já existe canal de voz
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            cursor.execute(
                "SELECT user_id FROM active_tickets WHERE channel_id = ?", 
                (str(interaction.channel.id),)
            )
            result = cursor.fetchone()
            conn.close()
            
            if not result:
                await interaction.response.send_message("❌ Ticket não encontrado!", ephemeral=True)
                return
            
            user = interaction.guild.get_member(int(result[0]))
            if not user:
                await interaction.response.send_message("❌ Usuário não encontrado!", ephemeral=True)
                return
            
            # Criar canal de voz
            voice_channel = await create_voice_channel(
                interaction.guild, 
                self.ticket_type, 
                user, 
                interaction.channel.category
            )
            
            if voice_channel:
                await interaction.response.send_message(
                    f"🔊 Canal de voz criado: {voice_channel.mention}", 
                    ephemeral=False
                )
            else:
                await interaction.response.send_message(
                    "❌ Erro ao criar canal de voz!", 
                    ephemeral=True
                )
                
        except Exception as e:
            print(f"Erro ao criar call: {e}")
            await interaction.response.send_message("❌ Erro ao criar canal de voz!", ephemeral=True)

class ConfirmCloseView(View):
    """View para confirmar fechamento de ticket"""
    
    def __init__(self):
        super().__init__(timeout=30)
    
    @discord.ui.button(label="✅ Confirmar", style=discord.ButtonStyle.red, emoji="✅")
    async def confirm(self, interaction: discord.Interaction, button: Button):
        """Confirma o fechamento do ticket"""
        try:
            # Fazer backup das mensagens
            backup_file = await backup_ticket_messages(interaction.channel)
            
            # Remover do banco de dados
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            
            # Buscar informações do ticket
            cursor.execute(
                "SELECT user_id, ticket_type FROM active_tickets WHERE channel_id = ?", 
                (str(interaction.channel.id),)
            )
            ticket_info = cursor.fetchone()
            
            if ticket_info:
                user_id, ticket_type = ticket_info
                
                # Remover ticket ativo
                cursor.execute(
                    "DELETE FROM active_tickets WHERE channel_id = ?", 
                    (str(interaction.channel.id),)
                )
                
                # Log da ação
                await log_ticket_action(
                    interaction.guild.id, 
                    interaction.channel.id, 
                    interaction.user.id, 
                    "closed", 
                    f"Ticket de {ticket_type} fechado"
                )
            
            conn.commit()
            conn.close()
            
            # Buscar e deletar canal de voz relacionado
            for channel in interaction.guild.voice_channels:
                if f"{ticket_type}-{interaction.guild.get_member(int(user_id)).name}" in channel.name.lower():
                    await channel.delete()
                    break
            
            await interaction.response.send_message("🔒 Ticket será fechado em 5 segundos...")
            await asyncio.sleep(5)
            await interaction.channel.delete()
            
        except Exception as e:
            print(f"Erro ao fechar ticket: {e}")
            await interaction.response.send_message("❌ Erro ao fechar ticket!", ephemeral=True)
    
    @discord.ui.button(label="❌ Cancelar", style=discord.ButtonStyle.gray, emoji="❌")
    async def cancel(self, interaction: discord.Interaction, button: Button):
        """Cancela o fechamento"""
        await interaction.response.edit_message(content="❌ Fechamento cancelado.", view=None)

class AddMemberModal(Modal):
    """Modal para adicionar membro ao ticket"""
    
    def __init__(self):
        super().__init__(title="Adicionar Membro ao Ticket")
        
        self.member_input = TextInput(
            label="Nome ou ID do usuário",
            placeholder="Digite o nome ou ID do usuário...",
            required=True,
            max_length=100
        )
        self.add_item(self.member_input)
    
    async def on_submit(self, interaction: discord.Interaction):
        try:
            member_identifier = self.member_input.value.strip()
            
            # Tentar encontrar o membro
            member = None
            
            # Tentar por ID
            if member_identifier.isdigit():
                member = interaction.guild.get_member(int(member_identifier))
            
            # Tentar por nome
            if not member:
                member = find_member_by_name(interaction.guild, member_identifier)
            
            if not member:
                await interaction.response.send_message(
                    f"❌ Usuário '{member_identifier}' não encontrado!", 
                    ephemeral=True
                )
                return
            
            # Adicionar permissões ao canal
            await interaction.channel.set_permissions(
                member, 
                view_channel=True, 
                send_messages=True, 
                read_message_history=True
            )
            
            await interaction.response.send_message(
                f"✅ {member.mention} foi adicionado ao ticket!"
            )
            
            # Log da ação
            await log_ticket_action(
                interaction.guild.id, 
                interaction.channel.id, 
                interaction.user.id, 
                "member_added", 
                f"Adicionado: {member.name}"
            )
            
        except Exception as e:
            print(f"Erro ao adicionar membro: {e}")
            await interaction.response.send_message("❌ Erro ao adicionar membro!", ephemeral=True)

class MigrationModal(Modal):
    """Modal para tickets de migração"""
    
    def __init__(self):
        super().__init__(title="Solicitação de Migração")
        
        self.old_account = TextInput(
            label="ID da conta antiga",
            placeholder="Digite o ID da sua conta antiga...",
            required=True,
            max_length=20
        )
        
        self.new_account = TextInput(
            label="ID da conta nova",
            placeholder="Digite o ID da sua conta nova...",
            required=True,
            max_length=20
        )
        
        self.reason = TextInput(
            label="Motivo da migração",
            placeholder="Explique o motivo da migração...",
            required=True,
            style=discord.TextStyle.paragraph,
            max_length=500
        )
        
        self.add_item(self.old_account)
        self.add_item(self.new_account)
        self.add_item(self.reason)
    
    async def on_submit(self, interaction: discord.Interaction):
        # Processar solicitação de migração
        embed = discord.Embed(
            title="📋 Dados da Migração",
            color=0x0099ff
        )
        embed.add_field(name="👤 Solicitante", value=interaction.user.mention, inline=True)
        embed.add_field(name="🆔 Conta Antiga", value=self.old_account.value, inline=True)
        embed.add_field(name="🆔 Conta Nova", value=self.new_account.value, inline=True)
        embed.add_field(name="📝 Motivo", value=self.reason.value, inline=False)
        embed.set_footer(text=f"Solicitado em {datetime.now().strftime('%d/%m/%Y %H:%M')}")
        
        await interaction.response.send_message(embed=embed)

# ================= ECONOMIA COMMANDS =================
def ensure_user_exists(user_id):
    """Garante que o usuário existe no banco"""
    try:
        conn = get_db()
        conn.execute(
            "INSERT OR IGNORE INTO users (user_id) VALUES (?)", (user_id,)
        )
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Erro ao criar usuário: {e}")

@bot.command(name='carteira', aliases=['wallet', 'bal', 'balance'])
@cooldown(1, 3, BucketType.user)
async def carteira(ctx, user: discord.Member = None):
    """Mostra a carteira do usuário"""
    if user is None:
        user = ctx.author
    
    ensure_user_exists(user.id)
    
    try:
        conn = get_db()
        user_data = conn.execute(
            "SELECT money, bank, rep, level FROM users WHERE user_id = ?", (user.id,)
        ).fetchone()
        conn.close()
        
        if not user_data:
            money = bank = rep = 0
            level = 1
        else:
            money, bank, rep, level = user_data
        
        total = money + bank
        
        embed = discord.Embed(
            title=f"💰 Carteira de {user.display_name}",
            color=0xf1c40f
        )
        embed.add_field(name="💵 Dinheiro", value=f"${money:,}", inline=True)
        embed.add_field(name="🏦 Banco", value=f"${bank:,}", inline=True)
        embed.add_field(name="💎 Total", value=f"${total:,}", inline=True)
        embed.add_field(name="⭐ Reputação", value=f"{rep}", inline=True)
        embed.add_field(name="🏆 Nível", value=f"{level}", inline=True)
        embed.set_thumbnail(url=user.display_avatar.url)
        
        await ctx.send(embed=embed)
        
    except Exception as e:
        print(f"Erro na carteira: {e}")
        await ctx.send("❌ Erro ao buscar informações da carteira!")

@bot.command(name='daily', aliases=['diario'])
@cooldown(1, 86400, BucketType.user)  # 24 horas
async def daily(ctx):
    """Recompensa diária"""
    user_id = ctx.author.id
    ensure_user_exists(user_id)
    
    # Valor aleatório entre 100-500
    amount = random.randint(100, 500)
    
    try:
        conn = get_db()
        conn.execute(
            "UPDATE users SET money = money + ?, last_daily = ? WHERE user_id = ?",
            (amount, datetime.now().isoformat(), user_id)
        )
        conn.commit()
        conn.close()
        
        embed = discord.Embed(
            title="💰 Daily Coletado!",
            description=f"Você recebeu **${amount:,}**!",
            color=0x00ff00
        )
        await ctx.send(embed=embed)
        
    except Exception as e:
        print(f"Erro no daily: {e}")
        await ctx.send("❌ Erro ao coletar daily!")

@bot.command(name='depositar', aliases=['dep'])
@cooldown(1, 3, BucketType.user)
async def depositar(ctx, amount: int):
    """Deposita dinheiro no banco"""
    if amount <= 0:
        await ctx.send("❌ Quantidade inválida!")
        return
    
    user_id = ctx.author.id
    ensure_user_exists(user_id)
    
    try:
        conn = get_db()
        user_data = conn.execute(
            "SELECT money FROM users WHERE user_id = ?", (user_id,)
        ).fetchone()
        
        if not user_data or user_data[0] < amount:
            await ctx.send("❌ Você não tem dinheiro suficiente!")
            return
        
        conn.execute(
            "UPDATE users SET money = money - ?, bank = bank + ? WHERE user_id = ?",
            (amount, amount, user_id)
        )
        conn.commit()
        conn.close()
        
        embed = discord.Embed(
            title="🏦 Depósito Realizado!",
            description=f"Você depositou **${amount:,}** no banco!",
            color=0x00ff00
        )
        await ctx.send(embed=embed)
        
    except Exception as e:
        print(f"Erro no depósito: {e}")
        await ctx.send("❌ Erro ao depositar!")

@bot.command(name='empregos', aliases=['jobs'])
@cooldown(1, 5, BucketType.user)
async def empregos(ctx):
    """Lista trabalhos disponíveis"""
    jobs = [
        {"name": "🍕 Entregador de Pizza", "pay": "50-150", "level": 1},
        {"name": "🚗 Motorista Uber", "pay": "80-200", "level": 1},
        {"name": "💻 Programador", "pay": "200-500", "level": 5},
        {"name": "🏥 Médico", "pay": "300-800", "level": 10},
        {"name": "👮‍♂️ Policial", "pay": "150-400", "level": 3},
    ]
    
    embed = discord.Embed(
        title="💼 Trabalhos Disponíveis",
        description="Use `!trabalhar` para ganhar dinheiro!",
        color=0x3498db
    )
    
    for job in jobs:
        embed.add_field(
            name=job["name"],
            value=f"💰 ${job['pay']}\n🏆 Nível {job['level']}+",
            inline=True
        )
    
    await ctx.send(embed=embed)

@bot.command(name='trabalhar', aliases=['work'])
@cooldown(1, 3600, BucketType.user)  # 1 hora
async def trabalhar(ctx):
    """Trabalha para ganhar dinheiro"""
    user_id = ctx.author.id
    ensure_user_exists(user_id)
    
    jobs = [
        {"name": "🍕 Entregou pizzas", "pay": (50, 150)},
        {"name": "🚗 Dirigiu para o Uber", "pay": (80, 200)},
        {"name": "💻 Programou um sistema", "pay": (200, 500)},
        {"name": "🏥 Atendeu pacientes", "pay": (300, 800)},
        {"name": "👮‍♂️ Patrulhou a cidade", "pay": (150, 400)},
    ]
    
    job = random.choice(jobs)
    payment = random.randint(*job["pay"])
    
    try:
        conn = get_db()
        conn.execute(
            "UPDATE users SET money = money + ?, last_work = ? WHERE user_id = ?",
            (payment, datetime.now().isoformat(), user_id)
        )
        conn.commit()
        conn.close()
        
        embed = discord.Embed(
            title="💼 Trabalho Concluído!",
            description=f"{job['name']} e ganhou **${payment:,}**!",
            color=0x00ff00
        )
        await ctx.send(embed=embed)
        
    except Exception as e:
        print(f"Erro no trabalho: {e}")
        await ctx.send("❌ Erro ao trabalhar!")

# ================= MODERAÇÃO COMMANDS =================
@bot.command(name='warn', aliases=['advertir'])
@commands.has_permissions(kick_members=True)
async def warn(ctx, user: discord.Member, *, reason: str = "Sem motivo especificado"):
    """Adverte um usuário"""
    try:
        conn = get_db()
        conn.execute(
            "INSERT INTO warnings (user_id, server_id, moderator_id, reason, timestamp) VALUES (?, ?, ?, ?, ?)",
            (user.id, ctx.guild.id, ctx.author.id, reason, datetime.now().isoformat())
        )
        conn.commit()
        conn.close()
        
        embed = discord.Embed(
            title="⚠️ Usuário Advertido",
            description=f"{user.mention} foi advertido!",
            color=0xff9900
        )
        embed.add_field(name="Motivo", value=reason, inline=False)
        embed.add_field(name="Moderador", value=ctx.author.mention, inline=True)
        
        await ctx.send(embed=embed)
        
        # DM para o usuário
        try:
            dm_embed = discord.Embed(
                title="⚠️ Você foi advertido!",
                description=f"Servidor: {ctx.guild.name}",
                color=0xff9900
            )
            dm_embed.add_field(name="Motivo", value=reason, inline=False)
            await user.send(embed=dm_embed)
        except:
            pass
            
    except Exception as e:
        print(f"Erro ao advertir: {e}")
        await ctx.send("❌ Erro ao advertir usuário!")

@bot.command(name='kick', aliases=['expulsar'])
@commands.has_permissions(kick_members=True)
async def kick(ctx, user: discord.Member, *, reason: str = "Sem motivo especificado"):
    """Expulsa um usuário"""
    try:
        await user.kick(reason=reason)
        
        embed = discord.Embed(
            title="👢 Usuário Expulso",
            description=f"{user.mention} foi expulso do servidor!",
            color=0xff0000
        )
        embed.add_field(name="Motivo", value=reason, inline=False)
        embed.add_field(name="Moderador", value=ctx.author.mention, inline=True)
        
        await ctx.send(embed=embed)
        
    except Exception as e:
        print(f"Erro ao expulsar: {e}")
        await ctx.send("❌ Erro ao expulsar usuário!")

@bot.command(name='ban', aliases=['banir'])
@commands.has_permissions(ban_members=True)
async def ban(ctx, user: discord.Member, *, reason: str = "Sem motivo especificado"):
    """Bane um usuário"""
    try:
        await user.ban(reason=reason)
        
        embed = discord.Embed(
            title="🔨 Usuário Banido",
            description=f"{user.mention} foi banido do servidor!",
            color=0xff0000
        )
        embed.add_field(name="Motivo", value=reason, inline=False)
        embed.add_field(name="Moderador", value=ctx.author.mention, inline=True)
        
        await ctx.send(embed=embed)
        
    except Exception as e:
        print(f"Erro ao banir: {e}")
        await ctx.send("❌ Erro ao banir usuário!")

@bot.command(name='unban')
@commands.has_permissions(ban_members=True)
async def unban(ctx, *, user_id: int):
    """Desbane um usuário pelo ID"""
    try:
        user = await bot.fetch_user(user_id)
        await ctx.guild.unban(user)
        
        embed = discord.Embed(
            title="✅ Usuário Desbanido",
            description=f"{user.mention} foi desbanido!",
            color=0x00ff00
        )
        await ctx.send(embed=embed)
        
    except Exception as e:
        print(f"Erro ao desbanir: {e}")
        await ctx.send("❌ Erro ao desbanir usuário!")

@bot.command(name='unbanall')
@commands.has_permissions(administrator=True)
async def unban_all(ctx):
    """Desbane todos os usuários"""
    try:
        banned_users = [entry async for entry in ctx.guild.bans()]
        count = 0
        
        for ban_entry in banned_users:
            await ctx.guild.unban(ban_entry.user)
            count += 1
        
        embed = discord.Embed(
            title="✅ Todos Desbanidos",
            description=f"{count} usuários foram desbanidos!",
            color=0x00ff00
        )
        await ctx.send(embed=embed)
        
    except Exception as e:
        print(f"Erro ao desbanir todos: {e}")
        await ctx.send("❌ Erro ao desbanir usuários!")

@bot.command(name='mute')
@commands.has_permissions(manage_roles=True)
async def mute(ctx, user: discord.Member, duration: int = None, *, reason: str = "Sem motivo especificado"):
    """Muta um usuário"""
    try:
        # Criar ou encontrar cargo de mutado
        mute_role = discord.utils.get(ctx.guild.roles, name="Mutado")
        if not mute_role:
            mute_role = await ctx.guild.create_role(name="Mutado")
            
            # Configurar permissões do cargo
            for channel in ctx.guild.channels:
                await channel.set_permissions(mute_role, send_messages=False, speak=False)
        
        await user.add_roles(mute_role, reason=reason)
        
        duration_text = f" por {duration} minutos" if duration else ""
        
        embed = discord.Embed(
            title="🔇 Usuário Mutado",
            description=f"{user.mention} foi mutado{duration_text}!",
            color=0xff9900
        )
        embed.add_field(name="Motivo", value=reason, inline=False)
        embed.add_field(name="Moderador", value=ctx.author.mention, inline=True)
        
        await ctx.send(embed=embed)
        
        # Auto-unmute se duração especificada
        if duration:
            await asyncio.sleep(duration * 60)
            await user.remove_roles(mute_role)
            
    except Exception as e:
        print(f"Erro ao mutar: {e}")
        await ctx.send("❌ Erro ao mutar usuário!")

@bot.command(name='unmute')
@commands.has_permissions(manage_roles=True)
async def unmute(ctx, user: discord.Member):
    """Desmuta um usuário"""
    try:
        mute_role = discord.utils.get(ctx.guild.roles, name="Mutado")
        if mute_role in user.roles:
            await user.remove_roles(mute_role)
            
            embed = discord.Embed(
                title="🔊 Usuário Desmutado",
                description=f"{user.mention} foi desmutado!",
                color=0x00ff00
            )
            await ctx.send(embed=embed)
        else:
            await ctx.send("❌ Usuário não está mutado!")
            
    except Exception as e:
        print(f"Erro ao desmutar: {e}")
        await ctx.send("❌ Erro ao desmutar usuário!")

@bot.command(name='mutecall', aliases=['vmute'])
@commands.has_permissions(mute_members=True)
async def mute_call(ctx, user: discord.Member):
    """Muta usuário na call"""
    try:
        await user.edit(mute=True)
        
        embed = discord.Embed(
            title="🔇 Usuário Mutado na Call",
            description=f"{user.mention} foi mutado na call!",
            color=0xff9900
        )
        await ctx.send(embed=embed)
        
    except Exception as e:
        print(f"Erro ao mutar na call: {e}")
        await ctx.send("❌ Erro ao mutar usuário na call!")

@bot.command(name='unmutecall', aliases=['vunmute'])
@commands.has_permissions(mute_members=True)
async def unmute_call(ctx, user: discord.Member):
    """Desmuta usuário na call"""
    try:
        await user.edit(mute=False)
        
        embed = discord.Embed(
            title="🔊 Usuário Desmutado na Call",
            description=f"{user.mention} foi desmutado na call!",
            color=0x00ff00
        )
        await ctx.send(embed=embed)
        
    except Exception as e:
        print(f"Erro ao desmutar na call: {e}")
        await ctx.send("❌ Erro ao desmutar usuário na call!")

@bot.command(name='clear', aliases=['cl'])
async def clear(ctx, amount: int = None):
    """Limpa mensagens do canal ou abre painel de famílias"""
    # Verificar se este comando está sendo usado como family_command personalizado
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT family_command FROM server_configs WHERE guild_id = ?", (ctx.guild.id,))
        result = cursor.fetchone()
        conn.close()
        
        # Se o family_command configurado for 'cl' e não foi passado amount, abrir painel
        if result and result[0] == 'cl' and amount is None:
            await familia_panel(ctx)
            return
    except Exception as e:
        print(f"Erro ao verificar configuração: {e}")
    
    # Verificar permissões para limpeza de mensagens
    if not ctx.author.guild_permissions.manage_messages:
        await ctx.send("❌ Você não tem permissão para limpar mensagens!")
        return
    
    # Função de limpeza de mensagens
    if amount is None:
        amount = 10
        
    if amount > 100:
        await ctx.send("❌ Máximo de 100 mensagens por vez!")
        return
    
    try:
        deleted = await ctx.channel.purge(limit=amount + 1)
        
        embed = discord.Embed(
            title="🧹 Mensagens Limpas",
            description=f"{len(deleted) - 1} mensagens foram deletadas!",
            color=0x00ff00
        )
        msg = await ctx.send(embed=embed)
        await asyncio.sleep(3)
        await msg.delete()
        
    except Exception as e:
        print(f"Erro ao limpar: {e}")
        await ctx.send("❌ Erro ao limpar mensagens!")

@bot.command(name='nuke')
@commands.has_permissions(administrator=True)
async def nuke(ctx):
    """Recria o canal (deleta e cria novo)"""
    try:
        channel_name = ctx.channel.name
        channel_position = ctx.channel.position
        channel_category = ctx.channel.category
        
        await ctx.channel.delete()
        
        new_channel = await ctx.guild.create_text_channel(
            name=channel_name,
            position=channel_position,
            category=channel_category
        )
        
        embed = discord.Embed(
            title="💥 Canal Recriado!",
            description="O canal foi completamente limpo!",
            color=0xff0000
        )
        await new_channel.send(embed=embed)
        
    except Exception as e:
        print(f"Erro ao recriar canal: {e}")

@bot.command(name='setprefix')
@commands.has_permissions(administrator=True)
async def setprefix(ctx, novo_prefixo: str, comando_familia: str = None):
    """Define um novo prefixo para o servidor"""
    try:
        from local_api import load_guild_config, save_guild_config
        
        # Validar o prefixo
        if len(novo_prefixo) > 5:
            await ctx.send("❌ O prefixo não pode ter mais de 5 caracteres!")
            return
            
        if ' ' in novo_prefixo:
            await ctx.send("❌ O prefixo não pode conter espaços!")
            return
        
        # Carregar configuração atual
        config = load_guild_config(str(ctx.guild.id))
        
        # Definir novo prefixo
        config['prefix'] = novo_prefixo
        
        # Se foi especificado um comando para família, salvar também
        if comando_familia:
            config['comando_familia'] = comando_familia
        
        # Salvar configuração
        if save_guild_config(str(ctx.guild.id), config):
            embed = discord.Embed(
                title="✅ Prefixo Alterado!",
                description=f"Novo prefixo: `{novo_prefixo}`",
                color=0x00ff00
            )
            
            if comando_familia:
                embed.add_field(
                    name="Comando Família",
                    value=f"`{novo_prefixo}{comando_familia}`",
                    inline=False
                )
            
            embed.add_field(
                name="Exemplo de uso",
                value=f"`{novo_prefixo}help` - Ver comandos\n`{novo_prefixo}f` - Painel de famílias",
                inline=False
            )
            
            await ctx.send(embed=embed)
        else:
            await ctx.send("❌ Erro ao salvar o novo prefixo!")
            
    except Exception as e:
        print(f"Erro ao definir prefixo: {e}")
        await ctx.send("❌ Erro ao definir o novo prefixo!")

@bot.command(name='lock')
@commands.has_permissions(manage_channels=True)
async def lock(ctx):
    """Tranca o canal"""
    try:
        await ctx.channel.set_permissions(ctx.guild.default_role, send_messages=False)
        
        embed = discord.Embed(
            title="🔒 Canal Trancado",
            description="O canal foi trancado!",
            color=0xff9900
        )
        await ctx.send(embed=embed)
        
    except Exception as e:
        print(f"Erro ao trancar canal: {e}")
        await ctx.send("❌ Erro ao trancar canal!")

@bot.command(name='unlock')
@commands.has_permissions(manage_channels=True)
async def unlock(ctx):
    """Destranca o canal"""
    try:
        await ctx.channel.set_permissions(ctx.guild.default_role, send_messages=True)
        
        embed = discord.Embed(
            title="🔓 Canal Destrancado",
            description="O canal foi destrancado!",
            color=0x00ff00
        )
        await ctx.send(embed=embed)
        
    except Exception as e:
        print(f"Erro ao destrancar canal: {e}")
        await ctx.send("❌ Erro ao destrancar canal!")

# ================= SOCIAL COMMANDS =================
@bot.command(name='avatar', aliases=['av'])
async def avatar(ctx, user: discord.Member = None):
    """Mostra o avatar de um usuário"""
    if user is None:
        user = ctx.author
    
    embed = discord.Embed(
        title=f"🖼️ Avatar de {user.display_name}",
        color=0x3498db
    )
    embed.set_image(url=user.display_avatar.url)
    
    await ctx.send(embed=embed)

@bot.command(name='perfil', aliases=['profile'])
async def perfil(ctx, user: discord.Member = None):
    """Mostra o perfil de um usuário"""
    if user is None:
        user = ctx.author
    
    ensure_user_exists(user.id)
    
    try:
        conn = get_db()
        user_data = conn.execute(
            "SELECT money, bank, rep, level, about_me FROM users WHERE user_id = ?", (user.id,)
        ).fetchone()
        conn.close()
        
        if not user_data:
            money = bank = rep = 0
            level = 1
            about_me = "Nenhuma descrição definida."
        else:
            money, bank, rep, level, about_me = user_data
            if not about_me:
                about_me = "Nenhuma descrição definida."
        
        total = money + bank
        
        embed = discord.Embed(
            title=f"👤 Perfil de {user.display_name}",
            description=about_me,
            color=0x3498db
        )
        embed.add_field(name="💰 Dinheiro Total", value=f"${total:,}", inline=True)
        embed.add_field(name="⭐ Reputação", value=f"{rep}", inline=True)
        embed.add_field(name="🏆 Nível", value=f"{level}", inline=True)
        embed.set_thumbnail(url=user.display_avatar.url)
        
        await ctx.send(embed=embed)
        
    except Exception as e:
        print(f"Erro no perfil: {e}")
        await ctx.send("❌ Erro ao buscar perfil!")

@bot.command(name='rep', aliases=['reputacao'])
@cooldown(1, 86400, BucketType.user)  # 24 horas
async def rep(ctx, user: discord.Member):
    """Dá reputação para um usuário"""
    if user.id == ctx.author.id:
        await ctx.send("❌ Você não pode dar reputação para si mesmo!")
        return
    
    ensure_user_exists(user.id)
    
    try:
        conn = get_db()
        conn.execute(
            "UPDATE users SET rep = rep + 1, last_rep = ? WHERE user_id = ?",
            (datetime.now().isoformat(), user.id)
        )
        conn.commit()
        conn.close()
        
        embed = discord.Embed(
            title="⭐ Reputação Dada!",
            description=f"{ctx.author.mention} deu reputação para {user.mention}!",
            color=0x00ff00
        )
        await ctx.send(embed=embed)
        
    except Exception as e:
        print(f"Erro na reputação: {e}")
        await ctx.send("❌ Erro ao dar reputação!")

@bot.command(name='sobremim', aliases=['aboutme'])
async def sobremim(ctx, *, texto: str):
    """Define sua descrição pessoal"""
    if len(texto) > 200:
        await ctx.send("❌ A descrição deve ter no máximo 200 caracteres!")
        return
    
    user_id = ctx.author.id
    ensure_user_exists(user_id)
    
    try:
        conn = get_db()
        conn.execute(
            "UPDATE users SET about_me = ? WHERE user_id = ?",
            (texto, user_id)
        )
        conn.commit()
        conn.close()
        
        embed = discord.Embed(
            title="✅ Descrição Atualizada!",
            description=f"Sua nova descrição: {texto}",
            color=0x00ff00
        )
        await ctx.send(embed=embed)
        
    except Exception as e:
        print(f"Erro ao atualizar descrição: {e}")
        await ctx.send("❌ Erro ao atualizar descrição!")

@bot.command(name='membersrole')
async def members_role(ctx, role: discord.Role):
    """Lista membros de um cargo"""
    members = [member for member in ctx.guild.members if role in member.roles]
    
    if not members:
        await ctx.send(f"❌ Nenhum membro encontrado com o cargo {role.mention}!")
        return
    
    embed = discord.Embed(
        title=f"👥 Membros com o cargo {role.name}",
        description=f"Total: {len(members)} membros",
        color=role.color
    )
    
    member_list = "\n".join([f"• {member.display_name}" for member in members[:20]])
    if len(members) > 20:
        member_list += f"\n... e mais {len(members) - 20} membros"
    
    embed.add_field(name="Membros:", value=member_list, inline=False)
    
    await ctx.send(embed=embed)

# ================= INFORMATIVO COMMANDS =================
@bot.command(name='ajuda', aliases=['help'])
async def ajuda(ctx):
    """Mostra todos os comandos"""
    embed = discord.Embed(
        title="🤖 Comandos do Bot",
        description="Aqui estão todos os comandos disponíveis:",
        color=0x3498db
    )
    
    # Básicos
    embed.add_field(
        name="📚 Básicos",
        value="`ajuda`, `help`, `f`, `familia`, `botinfo`, `ping`",
        inline=False
    )
    
    # Perfil e Social
    embed.add_field(
        name="👤 Perfil e Social",
        value="`avatar`, `av`, `perfil`, `profile`, `rep`, `reputacao`, `sobremim`, `aboutme`, `membersrole`",
        inline=False
    )
    
    # Sistema Econômico
    embed.add_field(
        name="💰 Sistema Econômico",
        value="`carteira`, `wallet`, `bal`, `balance`, `daily`, `diario`, `depositar`, `dep`, `empregos`, `jobs`, `trabalhar`, `work`",
        inline=False
    )
    
    # Moderação
    embed.add_field(
        name="🛡️ Moderação",
        value="`warn`, `advertir`, `kick`, `expulsar`, `ban`, `banir`, `unban`, `unbanall`, `mute`, `unmute`, `mutecall`, `vmute`, `unmutecall`, `vunmute`, `clear`, `cl`, `nuke`, `lock`, `unlock`",
        inline=False
    )
    
    # Sistema de Advertências
    embed.add_field(
        name="⚠️ Sistema de Advertências",
        value="`advertence`, `adv`, `removeadvertence`, `removewarn`, `castigar`, `removecastigo`",
        inline=False
    )
    
    # Cargos e Permissões
    embed.add_field(
        name="👑 Cargos e Permissões",
        value="`addrole`, `removerole`, `pd`",
        inline=False
    )
    
    # Sistema de Famílias
    embed.add_field(
        name="👨‍👩‍👧‍👦 Sistema de Famílias",
        value="`addfamily`, `removefamily`",
        inline=False
    )
    
    # Sistema VIP
    embed.add_field(
        name="💎 Sistema VIP",
        value="`addvip`, `removevip`, `addvipc`, `removevipc`, `setvip`",
        inline=False
    )
    
    # Personalização
    embed.add_field(
        name="🎨 Personalização",
        value="`setavatar`, `setbanner`, `setusername`, `andar`",
        inline=False
    )
    
    # Integrações Sociais
    embed.add_field(
        name="🔗 Integrações Sociais",
        value="`instagram`, `insta`, `ig`, `tellonym`, `influencer`",
        inline=False
    )
    
    # Comandos Especiais
    embed.add_field(
        name="🎯 Comandos Especiais",
        value="`bangif`",
        inline=False
    )
    
    # Administração
    embed.add_field(
        name="⚙️ Administração",
        value="`restart`, `reload`, `forceclear`, `debug`",
        inline=False
    )
    
    embed.set_footer(text="Use ! antes de cada comando • Total: 60+ comandos")
    await ctx.send(embed=embed)

@bot.command(name='botinfo')
async def botinfo(ctx):
    """Informações do bot"""
    embed = discord.Embed(
        title="🤖 Informações do Bot",
        color=0x3498db
    )
    embed.add_field(name="📊 Servidores", value=len(bot.guilds), inline=True)
    embed.add_field(name="👥 Usuários", value=len(bot.users), inline=True)
    embed.add_field(name="🏓 Latência", value=f"{bot.latency * 1000:.0f}ms", inline=True)
    embed.add_field(name="🐍 Python", value="3.11", inline=True)
    embed.add_field(name="📚 Discord.py", value=discord.__version__, inline=True)
    embed.set_footer(text="Hospedado na SquareCloud")
    
    await ctx.send(embed=embed)

@bot.command(name='ping')
async def ping(ctx):
    """Mostra a latência do bot"""
    latency = bot.latency * 1000
    embed = discord.Embed(
        title="🏓 Pong!",
        description=f"Latência: **{latency:.0f}ms**",
        color=0x00ff00 if latency < 100 else 0xffff00 if latency < 200 else 0xff0000
    )
    await ctx.send(embed=embed)

# ================= PERSONALIZAÇÃO COMMANDS =================
@bot.command(name='andar')
@cooldown(1, 5, BucketType.user)
async def andar(ctx):
    """Simula uma caminhada"""
    actions = [
        "🚶‍♂️ deu uma volta pela praça",
        "🏃‍♂️ correu até o parque",
        "🚶‍♀️ caminhou pela praia",
        "🏃‍♀️ fez uma corrida matinal",
        "🚶‍♂️ passeou pelo centro da cidade"
    ]
    
    action = random.choice(actions)
    embed = discord.Embed(
        title="🚶‍♂️ Caminhada",
        description=f"{ctx.author.mention} {action}!",
        color=0x00ff00
    )
    await ctx.send(embed=embed)

# @bot.command(name='setavatar')
# @commands.check(check_admin)
# async def set_avatar(ctx, url: str):
#     """Define o avatar do bot"""
#     try:
#         async with aiohttp.ClientSession() as session:
#             async with session.get(url) as resp:
#                 if resp.status == 200:
#                     avatar_bytes = await resp.read()
#                     await bot.user.edit(avatar=avatar_bytes)
#                     await ctx.send("✅ Avatar alterado com sucesso!")
#                 else:
#                     await ctx.send("❌ Não foi possível baixar a imagem!")
#     except Exception as e:
#         await ctx.send(f"❌ Erro ao alterar avatar: {e}")

@bot.command(name='setavatar')
@commands.check(check_admin)
async def set_avatar(ctx, url: str):
    """Comando temporariamente desabilitado"""
    await ctx.send("⚠️ Comando temporariamente desabilitado devido a problemas de compilação.")

# @bot.command(name='setbanner')
# @commands.check(check_admin)
# async def set_banner(ctx, url: str):
#     """Define o banner do bot"""
#     try:
#         async with aiohttp.ClientSession() as session:
#             async with session.get(url) as resp:
#                 if resp.status == 200:
#                     banner_bytes = await resp.read()
#                     await bot.user.edit(banner=banner_bytes)
#                     await ctx.send("✅ Banner alterado com sucesso!")
#                 else:
#                     await ctx.send("❌ Não foi possível baixar a imagem!")
#     except Exception as e:
#         await ctx.send(f"❌ Erro ao alterar banner: {e}")

@bot.command(name='setbanner')
@commands.check(check_admin)
async def set_banner(ctx, url: str):
    """Comando temporariamente desabilitado"""
    await ctx.send("⚠️ Comando temporariamente desabilitado devido a problemas de compilação.")

@bot.command(name='setusername')
@commands.check(check_admin)
async def set_username(ctx, *, nome: str):
    """Altera o nome do bot"""
    try:
        await bot.user.edit(username=nome)
        await ctx.send(f"✅ Nome alterado para: {nome}")
    except Exception as e:
        await ctx.send(f"❌ Erro ao alterar nome: {e}")

# ================= CARGOS E PERMISSÕES =================
@bot.command(name='addrole')
@commands.has_permissions(manage_roles=True)
async def add_role(ctx, user: discord.Member, *, role_name: str):
    """Adiciona cargo a um usuário"""
    role = discord.utils.get(ctx.guild.roles, name=role_name)
    if not role:
        await ctx.send(f"❌ Cargo '{role_name}' não encontrado!")
        return
    
    try:
        await user.add_roles(role)
        embed = discord.Embed(
            title="✅ Cargo Adicionado",
            description=f"Cargo {role.mention} adicionado a {user.mention}!",
            color=0x00ff00
        )
        await ctx.send(embed=embed)
    except Exception as e:
        await ctx.send(f"❌ Erro ao adicionar cargo: {e}")

@bot.command(name='removerole')
@commands.has_permissions(manage_roles=True)
async def remove_role(ctx, user: discord.Member, *, role_name: str):
    """Remove cargo de um usuário"""
    role = discord.utils.get(ctx.guild.roles, name=role_name)
    if not role:
        await ctx.send(f"❌ Cargo '{role_name}' não encontrado!")
        return
    
    try:
        await user.remove_roles(role)
        embed = discord.Embed(
            title="✅ Cargo Removido",
            description=f"Cargo {role.mention} removido de {user.mention}!",
            color=0x00ff00
        )
        await ctx.send(embed=embed)
    except Exception as e:
        await ctx.send(f"❌ Erro ao remover cargo: {e}")

@bot.command(name='pd')
@commands.check(check_admin)
async def primeira_dama(ctx, user: discord.Member, *, cargo_name: str = "Primeira Dama"):
    """Define primeira dama do servidor"""
    try:
        conn = get_db()
        
        # Remove current PD
        conn.execute(
            "UPDATE primeira_dama SET active = 0 WHERE server_id = ?", (ctx.guild.id,)
        )
        
        # Add new PD
        conn.execute(
            "INSERT OR REPLACE INTO primeira_dama (server_id, user_id, cargo_name) VALUES (?, ?, ?)",
            (ctx.guild.id, user.id, cargo_name)
        )
        
        conn.commit()
        conn.close()
        
        embed = discord.Embed(
            title="👑 Primeira Dama Definida!",
            description=f"{user.mention} agora é a **{cargo_name}** do servidor!",
            color=0x9b59b6
        )
        await ctx.send(embed=embed)
        
    except Exception as e:
        print(f"Erro ao definir PD: {e}")
        await ctx.send("❌ Erro ao definir primeira dama!")

# ================= VIP SYSTEM =================
@bot.command(name='addvip')
@commands.check(check_admin)
async def add_vip(ctx, user: discord.Member, days: int = 30):
    """Adiciona VIP a um usuário"""
    try:
        conn = get_db()
        expiry_date = datetime.now() + timedelta(days=days)
        
        conn.execute(
            "INSERT OR REPLACE INTO vip_users (user_id, server_id, expiry_date) VALUES (?, ?, ?)",
            (user.id, ctx.guild.id, expiry_date.isoformat())
        )
        conn.commit()
        conn.close()
        
        embed = discord.Embed(
            title="💎 VIP Adicionado!",
            description=f"{user.mention} agora é VIP por {days} dias!",
            color=0xffd700
        )
        await ctx.send(embed=embed)
        
    except Exception as e:
        print(f"Erro ao adicionar VIP: {e}")
        await ctx.send("❌ Erro ao adicionar VIP!")

@bot.command(name='removevip')
@commands.check(check_admin)
async def remove_vip(ctx, user: discord.Member):
    """Remove VIP de um usuário"""
    try:
        conn = get_db()
        conn.execute(
            "DELETE FROM vip_users WHERE user_id = ? AND server_id = ?",
            (user.id, ctx.guild.id)
        )
        conn.commit()
        conn.close()
        
        embed = discord.Embed(
            title="❌ VIP Removido!",
            description=f"VIP removido de {user.mention}!",
            color=0xff0000
        )
        await ctx.send(embed=embed)
        
    except Exception as e:
        print(f"Erro ao remover VIP: {e}")
        await ctx.send("❌ Erro ao remover VIP!")

@bot.command(name='addvipc')
@commands.check(check_admin)
async def add_vip_config(ctx, user: discord.Member, days: int = 30, *, config: str = "default"):
    """Adiciona VIP com configurações"""
    try:
        conn = get_db()
        expiry_date = datetime.now() + timedelta(days=days)
        
        conn.execute(
            "INSERT OR REPLACE INTO vip_users (user_id, server_id, expiry_date, config) VALUES (?, ?, ?, ?)",
            (user.id, ctx.guild.id, expiry_date.isoformat(), config)
        )
        conn.commit()
        conn.close()
        
        embed = discord.Embed(
            title="💎 VIP Configurado!",
            description=f"{user.mention} agora é VIP por {days} dias com configuração: {config}!",
            color=0xffd700
        )
        await ctx.send(embed=embed)
        
    except Exception as e:
        print(f"Erro ao configurar VIP: {e}")
        await ctx.send("❌ Erro ao configurar VIP!")

@bot.command(name='removevipc')
@commands.check(check_admin)
async def remove_vip_config(ctx, user: discord.Member):
    """Remove VIP com configurações"""
    try:
        conn = get_db()
        conn.execute(
            "DELETE FROM vip_users WHERE user_id = ? AND server_id = ?",
            (user.id, ctx.guild.id)
        )
        conn.commit()
        conn.close()
        
        embed = discord.Embed(
            title="❌ VIP Removido!",
            description=f"VIP e configurações removidos de {user.mention}!",
            color=0xff0000
        )
        await ctx.send(embed=embed)
        
    except Exception as e:
        print(f"Erro ao remover VIP: {e}")
        await ctx.send("❌ Erro ao remover VIP!")

@bot.command(name='setvip')
@commands.check(check_admin)
async def set_vip(ctx, user: discord.Member, days: int, *, benefits: str = "Benefícios padrão"):
    """Configura VIP personalizado"""
    try:
        conn = get_db()
        expiry_date = datetime.now() + timedelta(days=days)
        
        conn.execute(
            "INSERT OR REPLACE INTO vip_users (user_id, server_id, expiry_date, benefits) VALUES (?, ?, ?, ?)",
            (user.id, ctx.guild.id, expiry_date.isoformat(), benefits)
        )
        conn.commit()
        conn.close()
        
        embed = discord.Embed(
            title="💎 VIP Personalizado!",
            description=f"{user.mention} agora tem VIP personalizado por {days} dias!",
            color=0xffd700
        )
        embed.add_field(name="Benefícios", value=benefits, inline=False)
        await ctx.send(embed=embed)
        
    except Exception as e:
        print(f"Erro ao configurar VIP: {e}")
        await ctx.send("❌ Erro ao configurar VIP!")

# ================= SISTEMA DE FAMÍLIAS =================
@bot.command(name='addfamily')
@commands.check(check_admin)
async def add_family(ctx, *, family_name: str):
    """Cria uma nova família"""
    try:
        conn = get_db()
        conn.execute(
            "INSERT INTO families (name, server_id, owner_id, created_at) VALUES (?, ?, ?, ?)",
            (family_name, ctx.guild.id, ctx.author.id, datetime.now().isoformat())
        )
        conn.commit()
        conn.close()
        
        embed = discord.Embed(
            title="👨‍👩‍👧‍👦 Família Criada!",
            description=f"Família **{family_name}** foi criada com sucesso!",
            color=0x00ff00
        )
        await ctx.send(embed=embed)
        
    except Exception as e:
        print(f"Erro ao criar família: {e}")
        await ctx.send("❌ Erro ao criar família!")

@bot.command(name='removefamily')
@commands.check(check_admin)
async def remove_family(ctx, *, family_name: str):
    """Remove uma família"""
    try:
        conn = get_db()
        
        # Remove family and all members
        conn.execute(
            "DELETE FROM family_members WHERE family_id IN (SELECT id FROM families WHERE name = ? AND server_id = ?)",
            (family_name, ctx.guild.id)
        )
        
        conn.execute(
            "DELETE FROM families WHERE name = ? AND server_id = ?",
            (family_name, ctx.guild.id)
        )
        
        conn.commit()
        conn.close()
        
        embed = discord.Embed(
            title="❌ Família Removida!",
            description=f"Família **{family_name}** foi removida!",
            color=0xff0000
        )
        await ctx.send(embed=embed)
        
    except Exception as e:
        print(f"Erro ao remover família: {e}")
        await ctx.send("❌ Erro ao remover família!")

# ================= INTEGRAÇÕES SOCIAIS =================
@bot.command(name='instagram', aliases=['insta', 'ig'])
async def instagram(ctx, *, username: str = None):
    """Integração com Instagram"""
    if username is None:
        await ctx.send("❌ Por favor, forneça um nome de usuário do Instagram!")
        return
    
    embed = discord.Embed(
        title="📸 Instagram",
        description=f"Perfil do Instagram: [@{username}](https://instagram.com/{username})",
        color=0xe4405f
    )
    embed.set_footer(text="Clique no link para visitar o perfil")
    
    await ctx.send(embed=embed)

@bot.command(name='tellonym')
async def tellonym(ctx, *, username: str = None):
    """Integração com Tellonym"""
    if username is None:
        await ctx.send("❌ Por favor, forneça um nome de usuário do Tellonym!")
        return
    
    embed = discord.Embed(
        title="💬 Tellonym",
        description=f"Perfil do Tellonym: [@{username}](https://tellonym.me/{username})",
        color=0x00d4aa
    )
    embed.set_footer(text="Clique no link para enviar uma mensagem anônima")
    
    await ctx.send(embed=embed)

@bot.command(name='influencer')
async def influencer(ctx, user: discord.Member = None):
    """Sistema de influenciadores"""
    if user is None:
        user = ctx.author
    
    embed = discord.Embed(
        title="🌟 Sistema de Influenciadores",
        description=f"Perfil de influenciador de {user.display_name}",
        color=0xff6b6b
    )
    embed.add_field(name="Status", value="Ativo", inline=True)
    embed.add_field(name="Seguidores", value="1,234", inline=True)
    embed.add_field(name="Engajamento", value="85%", inline=True)
    embed.set_thumbnail(url=user.display_avatar.url)
    
    await ctx.send(embed=embed)

# ================= COMANDOS ESPECIAIS =================
@bot.command(name='bangif')
@commands.has_permissions(ban_members=True)
async def ban_gif(ctx, user: discord.Member, *, reason: str = "Sem motivo especificado"):
    """Comando especial de ban com GIF"""
    try:
        await user.ban(reason=reason)
        
        embed = discord.Embed(
            title="🔨 BANIDO COM ESTILO!",
            description=f"{user.mention} foi banido do servidor!",
            color=0xff0000
        )
        embed.add_field(name="Motivo", value=reason, inline=False)
        embed.add_field(name="Moderador", value=ctx.author.mention, inline=True)
        embed.set_image(url="https://media.giphy.com/media/fe4dDMD2cAU5RfEaCU/giphy.gif")
        
        await ctx.send(embed=embed)
        
    except Exception as e:
        print(f"Erro no bangif: {e}")
        await ctx.send("❌ Erro ao banir usuário!")

# ================= ADMINISTRAÇÃO =================
@bot.command(name='restart')
@commands.check(check_admin)
async def restart(ctx):
    """Reinicia o bot"""
    embed = discord.Embed(
        title="🔄 Reiniciando Bot...",
        description="O bot será reiniciado em alguns segundos.",
        color=0xff9900
    )
    await ctx.send(embed=embed)
    
    # Aqui você implementaria a lógica de restart
    await bot.close()

@bot.command(name='reload')
@commands.check(check_admin)
async def reload(ctx):
    """Recarrega o bot"""
    embed = discord.Embed(
        title="🔄 Recarregando Bot...",
        description="Configurações recarregadas com sucesso!",
        color=0x00ff00
    )
    await ctx.send(embed=embed)

@bot.command(name='forceclear')
@commands.check(check_admin)
async def force_clear(ctx, amount: int = 100):
    """Limpeza forçada de mensagens"""
    try:
        deleted = await ctx.channel.purge(limit=amount + 1)
        
        embed = discord.Embed(
            title="🧹 Limpeza Forçada Concluída!",
            description=f"{len(deleted) - 1} mensagens foram deletadas!",
            color=0x00ff00
        )
        msg = await ctx.send(embed=embed)
        await asyncio.sleep(5)
        await msg.delete()
        
    except Exception as e:
        print(f"Erro na limpeza forçada: {e}")
        await ctx.send("❌ Erro na limpeza forçada!")

@bot.command(name='debug')
@commands.check(check_admin)
async def debug(ctx):
    """Modo debug"""
    embed = discord.Embed(
        title="🐛 Modo Debug",
        description="Informações de debug do bot:",
        color=0x9b59b6
    )
    embed.add_field(name="Servidores", value=len(bot.guilds), inline=True)
    embed.add_field(name="Usuários", value=len(bot.users), inline=True)
    embed.add_field(name="Latência", value=f"{bot.latency * 1000:.0f}ms", inline=True)
    embed.add_field(name="Comandos Carregados", value=len(bot.commands), inline=True)
    
    await ctx.send(embed=embed)

# ================= ESTATÍSTICAS E REGISTROS =================
@bot.command(name='migracoes', aliases=['migs'])
async def migracoes(ctx, user: discord.Member = None):
    """Ver migrações de um usuário"""
    if user is None:
        user = ctx.author
    
    try:
        conn = get_db()
        migrations = conn.execute(
            "SELECT COUNT(*) FROM migrations WHERE user_id = ? AND server_id = ?",
            (user.id, ctx.guild.id)
        ).fetchone()[0]
        conn.close()
        
        embed = discord.Embed(
            title="📊 Migrações",
            description=f"{user.display_name} tem **{migrations}** migrações registradas.",
            color=0x3498db
        )
        await ctx.send(embed=embed)
        
    except Exception as e:
        print(f"Erro ao buscar migrações: {e}")
        await ctx.send("❌ Erro ao buscar migrações!")

@bot.command(name='migrar')
async def migrar(ctx, user: discord.Member = None):
    """Registrar migração"""
    if user is None:
        user = ctx.author
    
    try:
        conn = get_db()
        conn.execute(
            "INSERT INTO migrations (user_id, server_id, migrated_at) VALUES (?, ?, ?)",
            (user.id, ctx.guild.id, datetime.now().isoformat())
        )
        conn.commit()
        conn.close()
        
        embed = discord.Embed(
            title="✅ Migração Registrada!",
            description=f"Migração de {user.mention} foi registrada com sucesso!",
            color=0x00ff00
        )
        await ctx.send(embed=embed)
        
    except Exception as e:
        print(f"Erro ao registrar migração: {e}")
        await ctx.send("❌ Erro ao registrar migração!")

@bot.command(name='movchat', aliases=['mov'])
async def movchat(ctx, user: discord.Member = None):
    """Movimentação no chat"""
    if user is None:
        user = ctx.author
    
    try:
        conn = get_db()
        movements = conn.execute(
            "SELECT COUNT(*) FROM chat_movements WHERE user_id = ? AND server_id = ?",
            (user.id, ctx.guild.id)
        ).fetchone()[0]
        conn.close()
        
        embed = discord.Embed(
            title="💬 Movimentação no Chat",
            description=f"{user.display_name} tem **{movements}** movimentações no chat.",
            color=0x3498db
        )
        await ctx.send(embed=embed)
        
    except Exception as e:
        print(f"Erro ao buscar movimentações: {e}")
        await ctx.send("❌ Erro ao buscar movimentações!")

@bot.command(name='movpoints')
async def movpoints(ctx, user: discord.Member = None):
    """Pontos de movimentação"""
    if user is None:
        user = ctx.author
    
    try:
        conn = get_db()
        points = conn.execute(
            "SELECT COALESCE(SUM(points), 0) FROM movement_points WHERE user_id = ? AND server_id = ?",
            (user.id, ctx.guild.id)
        ).fetchone()[0]
        conn.close()
        
        embed = discord.Embed(
            title="🎯 Pontos de Movimentação",
            description=f"{user.display_name} tem **{points}** pontos de movimentação.",
            color=0x3498db
        )
        await ctx.send(embed=embed)
        
    except Exception as e:
        print(f"Erro ao buscar pontos: {e}")
        await ctx.send("❌ Erro ao buscar pontos!")

@bot.command(name='recrutamentos', aliases=['recs'])
async def recrutamentos(ctx, user: discord.Member = None):
    """Ver recrutamentos"""
    if user is None:
        user = ctx.author
    
    try:
        conn = get_db()
        recruitments = conn.execute(
            "SELECT COUNT(*) FROM recruitments WHERE user_id = ? AND server_id = ?",
            (user.id, ctx.guild.id)
        ).fetchone()[0]
        conn.close()
        
        embed = discord.Embed(
            title="👥 Recrutamentos",
            description=f"{user.display_name} tem **{recruitments}** recrutamentos registrados.",
            color=0x3498db
        )
        await ctx.send(embed=embed)
        
    except Exception as e:
        print(f"Erro ao buscar recrutamentos: {e}")
        await ctx.send("❌ Erro ao buscar recrutamentos!")

@bot.command(name='recrutar')
async def recrutar(ctx, user: discord.Member):
    """Registrar recrutamento"""
    try:
        conn = get_db()
        conn.execute(
            "INSERT INTO recruitments (user_id, recruiter_id, server_id, recruited_at) VALUES (?, ?, ?, ?)",
            (user.id, ctx.author.id, ctx.guild.id, datetime.now().isoformat())
        )
        conn.commit()
        conn.close()
        
        embed = discord.Embed(
            title="✅ Recrutamento Registrado!",
            description=f"{ctx.author.mention} recrutou {user.mention}!",
            color=0x00ff00
        )
        await ctx.send(embed=embed)
        
    except Exception as e:
        print(f"Erro ao registrar recrutamento: {e}")
        await ctx.send("❌ Erro ao registrar recrutamento!")

@bot.command(name='register')
async def register(ctx, *, activity: str):
    """Registrar atividade"""
    try:
        conn = get_db()
        conn.execute(
            "INSERT INTO activity_logs (user_id, server_id, activity, registered_at) VALUES (?, ?, ?, ?)",
            (ctx.author.id, ctx.guild.id, activity, datetime.now().isoformat())
        )
        conn.commit()
        conn.close()
        
        embed = discord.Embed(
            title="✅ Atividade Registrada!",
            description=f"Atividade registrada: {activity}",
            color=0x00ff00
        )
        await ctx.send(embed=embed)
        
    except Exception as e:
        print(f"Erro ao registrar atividade: {e}")
        await ctx.send("❌ Erro ao registrar atividade!")

@bot.command(name='registers')
async def registers(ctx, user: discord.Member = None):
    """Ver registros"""
    if user is None:
        user = ctx.author
    
    try:
        conn = get_db()
        registers = conn.execute(
            "SELECT COUNT(*) FROM activity_logs WHERE user_id = ? AND server_id = ?",
            (user.id, ctx.guild.id)
        ).fetchone()[0]
        conn.close()
        
        embed = discord.Embed(
            title="📋 Registros de Atividade",
            description=f"{user.display_name} tem **{registers}** atividades registradas.",
            color=0x3498db
        )
        await ctx.send(embed=embed)
        
    except Exception as e:
        print(f"Erro ao buscar registros: {e}")
        await ctx.send("❌ Erro ao buscar registros!")

@bot.command(name='verificar')
async def verificar(ctx, user: discord.Member):
    """Verificar usuário"""
    try:
        conn = get_db()
        conn.execute(
            "INSERT OR REPLACE INTO verifications (user_id, server_id, verified_by, verified_at) VALUES (?, ?, ?, ?)",
            (user.id, ctx.guild.id, ctx.author.id, datetime.now().isoformat())
        )
        conn.commit()
        conn.close()
        
        embed = discord.Embed(
            title="✅ Usuário Verificado!",
            description=f"{user.mention} foi verificado por {ctx.author.mention}!",
            color=0x00ff00
        )
        await ctx.send(embed=embed)
        
    except Exception as e:
        print(f"Erro ao verificar usuário: {e}")
        await ctx.send("❌ Erro ao verificar usuário!")

@bot.command(name='tempo')
async def tempo(ctx, user: discord.Member = None):
    """Ver tempo de atividade"""
    if user is None:
        user = ctx.author
    
    try:
        conn = get_db()
        time_data = conn.execute(
            "SELECT COALESCE(SUM(time_spent), 0) FROM user_time WHERE user_id = ? AND server_id = ?",
            (user.id, ctx.guild.id)
        ).fetchone()[0]
        conn.close()
        
        hours = time_data // 3600
        minutes = (time_data % 3600) // 60
        
        embed = discord.Embed(
            title="⏰ Tempo de Atividade",
            description=f"{user.display_name} tem **{hours}h {minutes}m** de atividade registrada.",
            color=0x3498db
        )
        await ctx.send(embed=embed)
        
    except Exception as e:
        print(f"Erro ao buscar tempo: {e}")
        await ctx.send("❌ Erro ao buscar tempo!")

# ================= RESET DE DADOS =================
@bot.command(name='resetmigs')
@commands.check(check_admin)
async def reset_migs(ctx):
    """Resetar migrações"""
    try:
        conn = get_db()
        conn.execute("DELETE FROM migrations WHERE server_id = ?", (ctx.guild.id,))
        conn.commit()
        conn.close()
        
        embed = discord.Embed(
            title="🔄 Migrações Resetadas!",
            description="Todas as migrações do servidor foram resetadas.",
            color=0xff9900
        )
        await ctx.send(embed=embed)
        
    except Exception as e:
        print(f"Erro ao resetar migrações: {e}")
        await ctx.send("❌ Erro ao resetar migrações!")

@bot.command(name='resetmovchat')
@commands.check(check_admin)
async def reset_movchat(ctx):
    """Resetar movimentação chat"""
    try:
        conn = get_db()
        conn.execute("DELETE FROM chat_movements WHERE server_id = ?", (ctx.guild.id,))
        conn.commit()
        conn.close()
        
        embed = discord.Embed(
            title="🔄 Movimentações Resetadas!",
            description="Todas as movimentações do chat foram resetadas.",
            color=0xff9900
        )
        await ctx.send(embed=embed)
        
    except Exception as e:
        print(f"Erro ao resetar movimentações: {e}")
        await ctx.send("❌ Erro ao resetar movimentações!")

@bot.command(name='resetmovs')
@commands.check(check_admin)
async def reset_movs(ctx):
    """Resetar movimentações"""
    try:
        conn = get_db()
        conn.execute("DELETE FROM movement_points WHERE server_id = ?", (ctx.guild.id,))
        conn.commit()
        conn.close()
        
        embed = discord.Embed(
            title="🔄 Pontos de Movimentação Resetados!",
            description="Todos os pontos de movimentação foram resetados.",
            color=0xff9900
        )
        await ctx.send(embed=embed)
        
    except Exception as e:
        print(f"Erro ao resetar pontos: {e}")
        await ctx.send("❌ Erro ao resetar pontos!")

@bot.command(name='resetrecs')
@commands.check(check_admin)
async def reset_recs(ctx):
    """Resetar recrutamentos"""
    try:
        conn = get_db()
        conn.execute("DELETE FROM recruitments WHERE server_id = ?", (ctx.guild.id,))
        conn.commit()
        conn.close()
        
        embed = discord.Embed(
            title="🔄 Recrutamentos Resetados!",
            description="Todos os recrutamentos foram resetados.",
            color=0xff9900
        )
        await ctx.send(embed=embed)
        
    except Exception as e:
        print(f"Erro ao resetar recrutamentos: {e}")
        await ctx.send("❌ Erro ao resetar recrutamentos!")

@bot.command(name='resetregisters')
@commands.check(check_admin)
async def reset_registers(ctx):
    """Resetar registros"""
    try:
        conn = get_db()
        conn.execute("DELETE FROM activity_logs WHERE server_id = ?", (ctx.guild.id,))
        conn.commit()
        conn.close()
        
        embed = discord.Embed(
            title="🔄 Registros Resetados!",
            description="Todos os registros de atividade foram resetados.",
            color=0xff9900
        )
        await ctx.send(embed=embed)
        
    except Exception as e:
        print(f"Erro ao resetar registros: {e}")
        await ctx.send("❌ Erro ao resetar registros!")

@bot.command(name='resetverificacoes')
@commands.check(check_admin)
async def reset_verificacoes(ctx):
    """Resetar verificações"""
    try:
        conn = get_db()
        conn.execute("DELETE FROM verifications WHERE server_id = ?", (ctx.guild.id,))
        conn.commit()
        conn.close()
        
        embed = discord.Embed(
            title="🔄 Verificações Resetadas!",
            description="Todas as verificações foram resetadas.",
            color=0xff9900
        )
        await ctx.send(embed=embed)
        
    except Exception as e:
        print(f"Erro ao resetar verificações: {e}")
        await ctx.send("❌ Erro ao resetar verificações!")

@bot.command(name='resettime')
@commands.check(check_admin)
async def reset_time(ctx):
    """Resetar tempo"""
    try:
        conn = get_db()
        conn.execute("DELETE FROM user_time WHERE server_id = ?", (ctx.guild.id,))
        conn.commit()
        conn.close()
        
        embed = discord.Embed(
            title="🔄 Tempo Resetado!",
            description="Todos os tempos de atividade foram resetados.",
            color=0xff9900
        )
        await ctx.send(embed=embed)
        
    except Exception as e:
        print(f"Erro ao resetar tempo: {e}")
        await ctx.send("❌ Erro ao resetar tempo!")

# ================= SISTEMA DE ADVERTÊNCIAS =================
@bot.command(name='advertence', aliases=['adv'])
@commands.has_permissions(manage_messages=True)
async def advertence(ctx, user: discord.Member, *, reason: str = "Sem motivo especificado"):
    """Sistema de advertências"""
    try:
        conn = get_db()
        conn.execute(
            "INSERT INTO warnings (user_id, server_id, moderator_id, reason, warned_at) VALUES (?, ?, ?, ?, ?)",
            (user.id, ctx.guild.id, ctx.author.id, reason, datetime.now().isoformat())
        )
        conn.commit()
        
        # Count total warnings
        warning_count = conn.execute(
            "SELECT COUNT(*) FROM warnings WHERE user_id = ? AND server_id = ?",
            (user.id, ctx.guild.id)
        ).fetchone()[0]
        
        conn.close()
        
        embed = discord.Embed(
            title="⚠️ Usuário Advertido!",
            description=f"{user.mention} foi advertido!",
            color=0xff9900
        )
        embed.add_field(name="Motivo", value=reason, inline=False)
        embed.add_field(name="Moderador", value=ctx.author.mention, inline=True)
        embed.add_field(name="Total de Advertências", value=f"{warning_count}", inline=True)
        
        await ctx.send(embed=embed)
        
    except Exception as e:
        print(f"Erro ao advertir: {e}")
        await ctx.send("❌ Erro ao advertir usuário!")

@bot.command(name='removeadvertence', aliases=['removewarn'])
@commands.has_permissions(manage_messages=True)
async def remove_advertence(ctx, user: discord.Member, warning_id: int = None):
    """Remover advertência"""
    try:
        conn = get_db()
        
        if warning_id:
            # Remove specific warning
            conn.execute(
                "DELETE FROM warnings WHERE id = ? AND user_id = ? AND server_id = ?",
                (warning_id, user.id, ctx.guild.id)
            )
        else:
            # Remove last warning
            conn.execute(
                "DELETE FROM warnings WHERE user_id = ? AND server_id = ? ORDER BY warned_at DESC LIMIT 1",
                (user.id, ctx.guild.id)
            )
        
        conn.commit()
        conn.close()
        
        embed = discord.Embed(
            title="✅ Advertência Removida!",
            description=f"Advertência removida de {user.mention}!",
            color=0x00ff00
        )
        await ctx.send(embed=embed)
        
    except Exception as e:
        print(f"Erro ao remover advertência: {e}")
        await ctx.send("❌ Erro ao remover advertência!")

@bot.command(name='castigar')
@commands.has_permissions(manage_messages=True)
async def castigar(ctx, user: discord.Member, duration: int, *, reason: str = "Sem motivo especificado"):
    """Aplicar castigo"""
    try:
        conn = get_db()
        end_time = datetime.now() + timedelta(minutes=duration)
        
        conn.execute(
            "INSERT INTO punishments (user_id, server_id, moderator_id, reason, end_time, created_at) VALUES (?, ?, ?, ?, ?, ?)",
            (user.id, ctx.guild.id, ctx.author.id, reason, end_time.isoformat(), datetime.now().isoformat())
        )
        conn.commit()
        conn.close()
        
        embed = discord.Embed(
            title="⚖️ Castigo Aplicado!",
            description=f"{user.mention} foi castigado por {duration} minutos!",
            color=0xff0000
        )
        embed.add_field(name="Motivo", value=reason, inline=False)
        embed.add_field(name="Moderador", value=ctx.author.mention, inline=True)
        embed.add_field(name="Duração", value=f"{duration} minutos", inline=True)
        
        await ctx.send(embed=embed)
        
    except Exception as e:
        print(f"Erro ao castigar: {e}")
        await ctx.send("❌ Erro ao aplicar castigo!")

@bot.command(name='removecastigo')
@commands.has_permissions(manage_messages=True)
async def remove_castigo(ctx, user: discord.Member):
    """Remover castigo"""
    try:
        conn = get_db()
        conn.execute(
            "DELETE FROM punishments WHERE user_id = ? AND server_id = ?",
            (user.id, ctx.guild.id)
        )
        conn.commit()
        conn.close()
        
        embed = discord.Embed(
            title="✅ Castigo Removido!",
            description=f"Castigo removido de {user.mention}!",
            color=0x00ff00
        )
        await ctx.send(embed=embed)
        
    except Exception as e:
        print(f"Erro ao remover castigo: {e}")
        await ctx.send("❌ Erro ao remover castigo!")

if __name__ == "__main__":
    # Inicializar banco de dados
    init_db()
    init_perm_db()
    
    # Verificar token
    token = os.getenv('DISCORD_TOKEN')
    if not token:
        print("❌ Token do Discord não encontrado! Configure a variável DISCORD_TOKEN.")
        sys.exit(1)
    
    # Configurar integração com dashboard
    # ================= SISTEMA DE COMANDOS DINÂMICOS =================
    async def familia_panel(ctx):
        """Função para exibir o painel de famílias/configuração"""
        embed = discord.Embed(
            title="🔧 Painel de Configuração",
            description="Acesse o painel web para configurar seu servidor!",
            color=0x00ff00
        )
        
        embed.add_field(
            name="🌐 Link do Painel",
            value="[Clique aqui para acessar](http://localhost:3000)",
            inline=False
        )
        
        embed.add_field(
            name="⚙️ Configurações Disponíveis",
            value="• Prefixo personalizado\n• Comando de família personalizado\n• Configurações de moderação\n• E muito mais!",
            inline=False
        )
        
        embed.set_footer(text="Configure seu servidor de forma fácil e intuitiva!")
        
        await ctx.send(embed=embed)
    
    def register_dynamic_commands():
        """Registra comandos dinâmicos baseados nas configurações do banco de dados"""
        try:
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            
            # Buscar todas as configurações de family_command personalizadas
            cursor.execute("SELECT DISTINCT family_command FROM server_configs WHERE family_command IS NOT NULL AND family_command != 'f' AND family_command != 'familia'")
            custom_commands = cursor.fetchall()
            
            conn.close()
            
            # Obter lista de comandos e aliases existentes
            existing_commands = set()
            for cmd in bot.commands:
                existing_commands.add(cmd.name)
                if hasattr(cmd, 'aliases'):
                    existing_commands.update(cmd.aliases)
            
            # Registrar cada comando personalizado
            for (command_name,) in custom_commands:
                if command_name and command_name not in existing_commands:
                    # Criar função do comando dinamicamente
                    def create_dynamic_command(cmd_name):
                        async def dynamic_familia_command(ctx):
                            """Comando dinâmico para painel de famílias"""
                            await familia_panel(ctx)
                        return dynamic_familia_command
                    
                    # Registrar o comando
                    dynamic_command = commands.Command(
                        create_dynamic_command(command_name),
                        name=command_name,
                        help=f"Abre o painel de famílias (comando personalizado: {command_name})"
                    )
                    
                    bot.add_command(dynamic_command)
                    print(f"✅ Comando dinâmico registrado: {command_name}")
                else:
                    print(f"⚠️ Comando '{command_name}' já existe, pulando registro dinâmico")
            
        except Exception as e:
            print(f"❌ Erro ao registrar comandos dinâmicos: {e}")
    
    @bot.event
    async def on_ready():
        print(f"✅ Bot conectado como {bot.user}")
        print(f"📊 Conectado a {len(bot.guilds)} servidores")
        
        # Armazenar tempo de início para uptime
        bot.start_time = datetime.now()
        
        # Registrar comandos dinâmicos baseados nas configurações
        print("🔧 Registrando comandos dinâmicos...")
        register_dynamic_commands()
        
        # Iniciar API local para sincronização com dashboard
        try:
            run_api_in_background()
            print('✅ API local iniciada com sucesso na porta 3002')
            
            # Aguardar um pouco para a API inicializar completamente
            await asyncio.sleep(3)
            
            # Sincronizar dados dos servidores com o backend APÓS a API estar rodando
            print("🔄 Sincronizando dados dos servidores com o backend...")
            await sync_guilds_with_backend()
            
        except Exception as e:
            print(f'❌ Erro ao iniciar API local: {e}')
        
        print("🎯 Bot pronto para uso!")
        
        # Listar servidores conectados
        for guild in bot.guilds:
            print(f"   - {guild.name} ({guild.member_count} membros)")
    
    @bot.event
    async def setup_hook():
        """Configurações iniciais do bot"""
        print("🔧 Configurando sistema de tickets...")
        
        # Iniciar task de auto-fechamento de tickets
        if not auto_close_inactive_tickets.is_running():
            auto_close_inactive_tickets.start()
            print("✅ Task de auto-fechamento de tickets iniciada")
        
        print("✅ Sistema de tickets configurado com sucesso!")
    
    @bot.event
    async def on_message(message):
        """Evento para processar mensagens e detectar prefixo personalizado"""
        # Ignorar mensagens do próprio bot
        if message.author == bot.user:
            return
        
        # Atualizar última atividade se for um canal de ticket
        if message.channel.name.startswith("ticket-"):
            try:
                conn = sqlite3.connect(DB_PATH)
                cursor = conn.cursor()
                cursor.execute(
                    "UPDATE active_tickets SET last_activity = ? WHERE channel_id = ?",
                    (datetime.now().isoformat(), str(message.channel.id))
                )
                conn.commit()
                conn.close()
            except Exception as e:
                print(f"Erro ao atualizar atividade do ticket: {e}")
        
        # Processar comandos normais primeiro
        await bot.process_commands(message)
        
        # Verificar se a mensagem é apenas o prefixo personalizado ou prefixo de família
        if message.guild:
            try:
                # Buscar prefixos personalizados do servidor
                conn = sqlite3.connect(DB_PATH)
                cursor = conn.cursor()
                cursor.execute("SELECT prefix, family_prefix FROM server_configs WHERE guild_id = ?", (str(message.guild.id),))
                result = cursor.fetchone()
                conn.close()
                
                if result:
                    custom_prefix = result[0]
                    family_prefix = result[1]
                    
                    # Se a mensagem for exatamente o prefixo personalizado
                    if custom_prefix and message.content.strip() == custom_prefix:
                        print(f"🎯 Prefixo personalizado detectado: '{custom_prefix}' no servidor {message.guild.id}")
                        
                        # Criar contexto fake para usar a função do painel
                        ctx = await bot.get_context(message)
                        
                        # Abrir painel principal (mesmo do comando 'h')
                        embed = discord.Embed(
                            title="🤖 Painel do Bot - FOLK APP",
                            description="Bem-vindo ao painel de ajuda do bot!",
                            color=0x3498db
                        )
                        
                        embed.add_field(
                            name="🌐 Dashboard Web",
                            value="[Acesse o painel completo](http://localhost:5173)\nConfigure o bot de forma visual e intuitiva!",
                            inline=False
                        )
                        
                        embed.add_field(
                            name="📚 Comandos Principais",
                            value=f"• `{custom_prefix}f` ou `{custom_prefix}familia` - Painel de famílias\n• `{custom_prefix}ajuda` - Lista todos os comandos\n• `{custom_prefix}painel` - Configurações do bot",
                            inline=False
                        )
                        
                        embed.add_field(
                            name="⚙️ Configurações Rápidas",
                            value=f"• `{custom_prefix}setprefix <prefixo>` - Alterar prefixo\n• `{custom_prefix}cl <número>` - Limpar mensagens",
                            inline=False
                        )
                        
                        embed.set_footer(text=f"FOLK APP • Use {custom_prefix} para abrir este painel • {datetime.now().strftime('%d/%m/%Y %H:%M')}")
                        
                        await message.channel.send(embed=embed)
                        return
                    
                    # Se a mensagem for exatamente o prefixo de família personalizado
                    elif family_prefix and message.content.strip() == family_prefix:
                        print(f"👨‍👩‍👧‍👦 Prefixo de família detectado: '{family_prefix}' no servidor {message.guild.id}")
                        
                        # Verificar se o usuário tem VIP
                        conn = sqlite3.connect(DB_PATH)
                        cursor = conn.cursor()
                        cursor.execute("SELECT vip FROM users WHERE user_id = ?", (str(message.author.id),))
                        user_data = cursor.fetchone()
                        conn.close()
                        
                        if user_data and user_data[0] == 1:
                            # Abrir painel de famílias
                            embed = discord.Embed(
                                title="👨‍👩‍👧‍👦 Painel de Famílias VIP",
                                description="Gerencie sua família exclusiva!",
                                color=0xFFD700
                            )
                            
                            embed.add_field(
                                name="🏠 Comandos de Família",
                                value=f"• `{family_prefix}criar` - Criar nova família\n• `{family_prefix}entrar <nome>` - Entrar em família\n• `{family_prefix}sair` - Sair da família\n• `{family_prefix}info` - Informações da família",
                                inline=False
                            )
                            
                            embed.add_field(
                                name="👑 Comandos de Líder",
                                value=f"• `{family_prefix}convidar <@usuário>` - Convidar membro\n• `{family_prefix}expulsar <@usuário>` - Expulsar membro\n• `{family_prefix}promover <@usuário>` - Promover membro",
                                inline=False
                            )
                            
                            embed.set_footer(text=f"FOLK APP VIP • Prefixo personalizado: {family_prefix} • {datetime.now().strftime('%d/%m/%Y %H:%M')}")
                            
                            await message.channel.send(embed=embed)
                            return
                        else:
                            # Usuário não tem VIP
                            embed = discord.Embed(
                                title="🔒 Acesso Restrito",
                                description="Este prefixo de família é exclusivo para usuários VIP!",
                                color=0xFF0000
                            )
                            embed.add_field(
                                name="💎 Como obter VIP?",
                                value="Acesse nosso [dashboard](http://localhost:5173) e adquira sua assinatura mensal!",
                                inline=False
                            )
                            await message.channel.send(embed=embed)
                            return
            except Exception as e:
                print(f"❌ Erro ao processar prefixo personalizado: {e}")
    
    @bot.event
    async def on_guild_join(guild):
        """Evento quando o bot entra em um servidor"""
        print(f"✅ Bot adicionado ao servidor: {guild.name}")
        await sync_guilds_with_backend()
    
    @bot.event
    async def on_guild_remove(guild):
        """Evento quando o bot sai de um servidor"""
        print(f"❌ Bot removido do servidor: {guild.name}")
        await sync_guilds_with_backend()
    
    @bot.event
    async def on_guild_update(before, after):
        """Evento quando um servidor é atualizado"""
        if before.name != after.name or before.icon != after.icon:
            print(f"🔄 Servidor atualizado: {after.name}")
            await sync_guilds_with_backend()
    
    # ================= EVENTOS DE SINCRONIZAÇÃO EM TEMPO REAL =================
    
    @bot.event
    async def on_guild_role_create(role):
        """Evento quando um cargo é criado"""
        print(f"🎭 Cargo criado: {role.name} no servidor {role.guild.name}")
        await sync_role_with_backend(role.guild.id, 'create', role)
    
    @bot.event
    async def on_guild_role_update(before, after):
        """Evento quando um cargo é atualizado"""
        print(f"🔄 Cargo atualizado: {after.name} no servidor {after.guild.name}")
        await sync_role_with_backend(after.guild.id, 'update', after)
    
    @bot.event
    async def on_guild_role_delete(role):
        """Evento quando um cargo é removido"""
        print(f"❌ Cargo removido: {role.name} no servidor {role.guild.name}")
        await sync_role_with_backend(role.guild.id, 'delete', role)
    
    @bot.event
    async def on_member_join(member):
        """Evento quando um membro entra no servidor"""
        if not member.bot:  # Ignorar bots
            print(f"👋 Membro entrou: {member.display_name} no servidor {member.guild.name}")
            await sync_member_with_backend(member.guild.id, 'join', member)
    
    @bot.event
    async def on_member_remove(member):
        """Evento quando um membro sai do servidor"""
        if not member.bot:  # Ignorar bots
            print(f"👋 Membro saiu: {member.display_name} do servidor {member.guild.name}")
            await sync_member_with_backend(member.guild.id, 'leave', member)
    
    @bot.event
    async def on_member_update(before, after):
        """Evento quando um membro é atualizado (cargos, nick, etc.)"""
        if not after.bot and (before.roles != after.roles or before.display_name != after.display_name):
            print(f"🔄 Membro atualizado: {after.display_name} no servidor {after.guild.name}")
            await sync_member_with_backend(after.guild.id, 'update', after)
    
    @bot.event
    async def on_guild_channel_create(channel):
        """Evento quando um canal é criado"""
        print(f"📺 Canal criado: {channel.name} no servidor {channel.guild.name}")
        await sync_channel_with_backend(channel.guild.id, 'create', channel)
    
    @bot.event
    async def on_guild_channel_update(before, after):
        """Evento quando um canal é atualizado"""
        if before.name != after.name or before.type != after.type:
            print(f"🔄 Canal atualizado: {after.name} no servidor {after.guild.name}")
            await sync_channel_with_backend(after.guild.id, 'update', after)
    
    @bot.event
    async def on_guild_channel_delete(channel):
        """Evento quando um canal é removido"""
        print(f"❌ Canal removido: {channel.name} do servidor {channel.guild.name}")
        await sync_channel_with_backend(channel.guild.id, 'delete', channel)
    
    # Iniciar servidor HTTP em background
    async def main():
        # await start_http_server()  # Comentado temporariamente
        print("🚀 Iniciando bot...")
        await bot.start(token)
    
    # ================= FUNCIONALIDADES AVANÇADAS =================
    
    # Sistema de restrições de call
    call_restrictions = {}
    
    @bot.event
    async def on_voice_state_update(member, before, after):
        """Gerencia restrições de call e gravação"""
        try:
            # Restrições de call
            if after.channel and str(member.guild.id) in call_restrictions:
                restrictions = call_restrictions[str(member.guild.id)]
                
                # Verificar se o usuário está restrito
                if str(member.id) in restrictions.get('restricted_users', []):
                    # Desconectar usuário restrito
                    await member.move_to(None)
                    
                    # Enviar mensagem de aviso
                    try:
                        embed = discord.Embed(
                            title="🚫 Acesso Negado",
                            description=f"{member.mention}, você está restrito de entrar em calls de voz!",
                            color=0xFF0000
                        )
                        
                        # Tentar enviar no canal de logs ou canal geral
                        log_channel = member.guild.get_channel(restrictions.get('log_channel_id'))
                        if log_channel:
                            await log_channel.send(embed=embed)
                        else:
                            # Enviar no primeiro canal de texto disponível
                            for channel in member.guild.text_channels:
                                if channel.permissions_for(member.guild.me).send_messages:
                                    await channel.send(embed=embed)
                                    break
                    except Exception as e:
                        print(f"❌ Erro ao enviar mensagem de restrição: {e}")
                    
                    return
                
                # Verificar limite de membros por canal
                if 'max_members_per_channel' in restrictions:
                    max_members = restrictions['max_members_per_channel']
                    if len(after.channel.members) > max_members:
                        await member.move_to(None)
                        
                        embed = discord.Embed(
                            title="⚠️ Canal Lotado",
                            description=f"{member.mention}, o canal de voz está lotado! Limite: {max_members} membros.",
                            color=0xFFA500
                        )
                        
                        log_channel = member.guild.get_channel(restrictions.get('log_channel_id'))
                        if log_channel:
                            await log_channel.send(embed=embed)
                        
                        return
            
            # Sistema de gravação (simulado - Discord não permite gravação real)
            if after.channel and str(member.guild.id) in call_restrictions:
                restrictions = call_restrictions[str(member.guild.id)]
                
                if restrictions.get('recording_enabled', False):
                    log_channel = member.guild.get_channel(restrictions.get('log_channel_id'))
                    if log_channel:
                        embed = discord.Embed(
                            title="🎙️ Atividade de Voz",
                            description=f"{member.mention} entrou no canal {after.channel.mention}",
                            color=0x00FF00,
                            timestamp=datetime.now()
                        )
                        embed.add_field(name="Canal", value=after.channel.name, inline=True)
                        embed.add_field(name="Membros no Canal", value=len(after.channel.members), inline=True)
                        await log_channel.send(embed=embed)
            
            # Log de saída de canal
            if before.channel and not after.channel and str(member.guild.id) in call_restrictions:
                restrictions = call_restrictions[str(member.guild.id)]
                
                if restrictions.get('recording_enabled', False):
                    log_channel = member.guild.get_channel(restrictions.get('log_channel_id'))
                    if log_channel:
                        embed = discord.Embed(
                            title="🎙️ Atividade de Voz",
                            description=f"{member.mention} saiu do canal {before.channel.mention}",
                            color=0xFF0000,
                            timestamp=datetime.now()
                        )
                        embed.add_field(name="Canal", value=before.channel.name, inline=True)
                        embed.add_field(name="Tempo na Call", value="Não disponível", inline=True)
                        await log_channel.send(embed=embed)
                        
        except Exception as e:
            print(f"❌ Erro no evento de voz: {e}")
    
    # Comandos de restrição de call
    @bot.command(name='restrictcall')
    @commands.has_permissions(administrator=True)
    async def restrict_call(ctx, member: discord.Member, *, reason="Sem motivo especificado"):
        """Restringe um membro de entrar em calls de voz"""
        guild_id = str(ctx.guild.id)
        
        if guild_id not in call_restrictions:
            call_restrictions[guild_id] = {'restricted_users': [], 'log_channel_id': ctx.channel.id}
        
        if str(member.id) not in call_restrictions[guild_id]['restricted_users']:
            call_restrictions[guild_id]['restricted_users'].append(str(member.id))
            
            # Desconectar se estiver em call
            if member.voice:
                await member.move_to(None)
            
            embed = discord.Embed(
                title="🚫 Usuário Restrito de Calls",
                description=f"{member.mention} foi restrito de entrar em calls de voz.",
                color=0xFF0000
            )
            embed.add_field(name="Motivo", value=reason, inline=False)
            embed.add_field(name="Moderador", value=ctx.author.mention, inline=True)
            embed.set_footer(text=f"ID do usuário: {member.id}")
            
            await ctx.send(embed=embed)
        else:
            await ctx.send(f"❌ {member.mention} já está restrito de calls!")
    
    @bot.command(name='unrestrictcall')
    @commands.has_permissions(administrator=True)
    async def unrestrict_call(ctx, member: discord.Member):
        """Remove a restrição de call de um membro"""
        guild_id = str(ctx.guild.id)
        
        if guild_id in call_restrictions and str(member.id) in call_restrictions[guild_id]['restricted_users']:
            call_restrictions[guild_id]['restricted_users'].remove(str(member.id))
            
            embed = discord.Embed(
                title="✅ Restrição Removida",
                description=f"{member.mention} pode novamente entrar em calls de voz.",
                color=0x00FF00
            )
            embed.add_field(name="Moderador", value=ctx.author.mention, inline=True)
            
            await ctx.send(embed=embed)
        else:
            await ctx.send(f"❌ {member.mention} não está restrito de calls!")
    
    @bot.command(name='callconfig')
    @commands.has_permissions(administrator=True)
    async def call_config(ctx, action=None, *, value=None):
        """Configura sistema de calls"""
        guild_id = str(ctx.guild.id)
        
        if guild_id not in call_restrictions:
            call_restrictions[guild_id] = {'restricted_users': [], 'log_channel_id': ctx.channel.id}
        
        if action == "logchannel":
            if value:
                try:
                    channel = await commands.TextChannelConverter().convert(ctx, value)
                    call_restrictions[guild_id]['log_channel_id'] = channel.id
                    await ctx.send(f"✅ Canal de logs definido para {channel.mention}")
                except:
                    await ctx.send("❌ Canal inválido!")
            else:
                await ctx.send("❌ Especifique um canal! Exemplo: `!callconfig logchannel #logs`")
        
        elif action == "maxmembers":
            if value and value.isdigit():
                call_restrictions[guild_id]['max_members_per_channel'] = int(value)
                await ctx.send(f"✅ Limite de membros por canal definido para {value}")
            else:
                await ctx.send("❌ Especifique um número válido! Exemplo: `!callconfig maxmembers 5`")
        
        elif action == "recording":
            if value and value.lower() in ['on', 'off', 'true', 'false']:
                recording_enabled = value.lower() in ['on', 'true']
                call_restrictions[guild_id]['recording_enabled'] = recording_enabled
                status = "ativado" if recording_enabled else "desativado"
                await ctx.send(f"✅ Sistema de logs de voz {status}")
            else:
                await ctx.send("❌ Use 'on' ou 'off'! Exemplo: `!callconfig recording on`")
        
        else:
            embed = discord.Embed(
                title="⚙️ Configurações de Call",
                description="Configure o sistema de restrições e logs de call",
                color=0x3498db
            )
            embed.add_field(
                name="Comandos Disponíveis",
                value="`!callconfig logchannel #canal` - Define canal de logs\n"
                      "`!callconfig maxmembers <número>` - Limite de membros por canal\n"
                      "`!callconfig recording on/off` - Ativa/desativa logs de voz",
                inline=False
            )
            embed.add_field(
                name="Comandos de Restrição",
                value="`!restrictcall @usuário [motivo]` - Restringe usuário\n"
                      "`!unrestrictcall @usuário` - Remove restrição",
                inline=False
            )
            
            # Mostrar configurações atuais
            config = call_restrictions[guild_id]
            current_config = f"Canal de logs: <#{config.get('log_channel_id', 'Não definido')}>\n"
            current_config += f"Limite por canal: {config.get('max_members_per_channel', 'Sem limite')}\n"
            current_config += f"Logs de voz: {'Ativado' if config.get('recording_enabled', False) else 'Desativado'}\n"
            current_config += f"Usuários restritos: {len(config.get('restricted_users', []))}"
            
            embed.add_field(name="Configuração Atual", value=current_config, inline=False)
            
            await ctx.send(embed=embed)
    
    # Sistema de clonagem de servidores
    @bot.command(name='cloneserver')
    @commands.has_permissions(administrator=True)
    async def clone_server(ctx, server_id: int = None):
        """Clona um servidor Discord"""
        if not server_id:
            await ctx.send("❌ Especifique o ID do servidor a ser clonado! Exemplo: `!cloneserver 123456789`")
            return
        
        try:
            # Buscar servidor original
            original_guild = bot.get_guild(server_id)
            if not original_guild:
                await ctx.send("❌ Servidor não encontrado ou o bot não está nele!")
                return
            
            # Verificar permissões
            if not original_guild.me.guild_permissions.administrator:
                await ctx.send("❌ O bot precisa de permissões de administrador no servidor original!")
                return
            
            # Criar embed de progresso
            progress_embed = discord.Embed(
                title="🔄 Clonando Servidor",
                description=f"Iniciando clonagem de **{original_guild.name}**...",
                color=0xFFA500
            )
            progress_msg = await ctx.send(embed=progress_embed)
            
            # Criar novo servidor
            new_guild = await ctx.author.create_guild(
                name=f"{original_guild.name} - Clone",
                icon=await original_guild.icon.read() if original_guild.icon else None
            )
            
            # Atualizar progresso
            progress_embed.description = f"✅ Servidor criado: **{new_guild.name}**\n🔄 Clonando categorias e canais..."
            await progress_msg.edit(embed=progress_embed)
            
            # Clonar categorias e canais
            channel_mapping = {}
            
            for category in original_guild.categories:
                try:
                    new_category = await new_guild.create_category(
                        name=category.name,
                        overwrites=category.overwrites,
                        position=category.position
                    )
                    channel_mapping[category.id] = new_category.id
                    
                    # Clonar canais da categoria
                    for channel in category.channels:
                        if isinstance(channel, discord.TextChannel):
                            new_channel = await new_category.create_text_channel(
                                name=channel.name,
                                topic=channel.topic,
                                slowmode_delay=channel.slowmode_delay,
                                nsfw=channel.nsfw,
                                overwrites=channel.overwrites,
                                position=channel.position
                            )
                            channel_mapping[channel.id] = new_channel.id
                        
                        elif isinstance(channel, discord.VoiceChannel):
                            new_channel = await new_category.create_voice_channel(
                                name=channel.name,
                                bitrate=channel.bitrate,
                                user_limit=channel.user_limit,
                                overwrites=channel.overwrites,
                                position=channel.position
                            )
                            channel_mapping[channel.id] = new_channel.id
                            
                except Exception as e:
                    print(f"❌ Erro ao clonar categoria {category.name}: {e}")
            
            # Clonar canais sem categoria
            for channel in original_guild.channels:
                if not channel.category:
                    try:
                        if isinstance(channel, discord.TextChannel):
                            new_channel = await new_guild.create_text_channel(
                                name=channel.name,
                                topic=channel.topic,
                                slowmode_delay=channel.slowmode_delay,
                                nsfw=channel.nsfw,
                                overwrites=channel.overwrites,
                                position=channel.position
                            )
                            channel_mapping[channel.id] = new_channel.id
                        
                        elif isinstance(channel, discord.VoiceChannel):
                            new_channel = await new_guild.create_voice_channel(
                                name=channel.name,
                                bitrate=channel.bitrate,
                                user_limit=channel.user_limit,
                                overwrites=channel.overwrites,
                                position=channel.position
                            )
                            channel_mapping[channel.id] = new_channel.id
                            
                    except Exception as e:
                        print(f"❌ Erro ao clonar canal {channel.name}: {e}")
            
            # Atualizar progresso
            progress_embed.description = f"✅ Servidor criado: **{new_guild.name}**\n✅ Canais clonados\n🔄 Clonando cargos..."
            await progress_msg.edit(embed=progress_embed)
            
            # Clonar cargos (exceto @everyone)
            role_mapping = {}
            for role in reversed(original_guild.roles[1:]):  # Pular @everyone
                try:
                    new_role = await new_guild.create_role(
                        name=role.name,
                        permissions=role.permissions,
                        color=role.color,
                        hoist=role.hoist,
                        mentionable=role.mentionable
                    )
                    role_mapping[role.id] = new_role.id
                except Exception as e:
                    print(f"❌ Erro ao clonar cargo {role.name}: {e}")
            
            # Atualizar progresso
            progress_embed.description = f"✅ Servidor criado: **{new_guild.name}**\n✅ Canais clonados\n✅ Cargos clonados\n🔄 Configurando emojis..."
            await progress_msg.edit(embed=progress_embed)
            
            # Clonar emojis
            emoji_count = 0
            for emoji in original_guild.emojis:
                try:
                    if emoji_count >= 50:  # Limite do Discord
                        break
                    
                    emoji_data = await emoji.read()
                    await new_guild.create_custom_emoji(
                        name=emoji.name,
                        image=emoji_data
                    )
                    emoji_count += 1
                except Exception as e:
                    print(f"❌ Erro ao clonar emoji {emoji.name}: {e}")
            
            # Criar convite para o servidor clonado
            invite = None
            for channel in new_guild.text_channels:
                try:
                    invite = await channel.create_invite(max_age=0, max_uses=0)
                    break
                except:
                    continue
            
            # Embed final
            final_embed = discord.Embed(
                title="✅ Servidor Clonado com Sucesso!",
                description=f"**{original_guild.name}** foi clonado para **{new_guild.name}**",
                color=0x00FF00
            )
            
            final_embed.add_field(
                name="📊 Estatísticas",
                value=f"Canais: {len(new_guild.channels)}\n"
                      f"Cargos: {len(new_guild.roles)}\n"
                      f"Emojis: {emoji_count}",
                inline=True
            )
            
            if invite:
                final_embed.add_field(
                    name="🔗 Convite",
                    value=f"[Clique aqui para entrar]({invite.url})",
                    inline=True
                )
            
            final_embed.set_footer(text=f"ID do servidor clonado: {new_guild.id}")
            
            await progress_msg.edit(embed=final_embed)
            
        except discord.Forbidden:
            await ctx.send("❌ Sem permissões para criar servidor ou acessar dados!")
        except discord.HTTPException as e:
            await ctx.send(f"❌ Erro HTTP: {e}")
        except Exception as e:
            await ctx.send(f"❌ Erro inesperado: {e}")
            print(f"❌ Erro na clonagem: {e}")
    
    # Comando para listar servidores disponíveis para clonagem
    @bot.command(name='listservers')
    @commands.has_permissions(administrator=True)
    async def list_servers(ctx):
        """Lista servidores onde o bot está presente"""
        embed = discord.Embed(
            title="🌐 Servidores Disponíveis para Clonagem",
            description="Lista de servidores onde o bot tem acesso:",
            color=0x3498db
        )
        
        server_list = []
        for guild in bot.guilds:
            permissions = "✅" if guild.me.guild_permissions.administrator else "❌"
            server_list.append(f"{permissions} **{guild.name}** (ID: `{guild.id}`) - {guild.member_count} membros")
        
        if server_list:
            # Dividir em páginas se necessário
            for i in range(0, len(server_list), 10):
                page_servers = server_list[i:i+10]
                embed.add_field(
                    name=f"Página {i//10 + 1}",
                    value="\n".join(page_servers),
                    inline=False
                )
        else:
            embed.add_field(
                name="Nenhum servidor",
                value="O bot não está em nenhum servidor.",
                inline=False
            )
        
        embed.set_footer(text="✅ = Permissões de admin | ❌ = Sem permissões suficientes")
        await ctx.send(embed=embed)
    
    # ==================== COMANDOS DO SISTEMA DE TICKETS ====================
    
    @bot.command(name='ticket_panel')
    @commands.has_permissions(manage_channels=True)
    async def ticket_panel(ctx, panel_type: str = "main"):
        """Cria um painel de tickets"""
        config = TicketConfig(ctx.guild.id)
        
        if panel_type not in config.panels:
            await ctx.send(f"❌ Tipo de painel inválido. Tipos disponíveis: {', '.join(config.panels.keys())}")
            return
        
        panel_data = config.panels[panel_type]
        
        embed = discord.Embed(
            title=panel_data["title"],
            description=panel_data["description"],
            color=panel_data["color"]
        )
        
        if panel_data.get("banner_url"):
            embed.set_image(url=panel_data["banner_url"])
        
        embed.set_footer(text=f"Sistema de Tickets • {ctx.guild.name}")
        
        view = TicketPanelView(panel_type, config)
        await ctx.send(embed=embed, view=view)
        
        # Log da ação
        await log_ticket_action(ctx.guild.id, "panel_created", ctx.author.id, f"Painel {panel_type} criado")
    
    @bot.command(name='ticket')
    async def ticket_command(ctx, tipo: str = "suporte", *, motivo: str = None):
        """Comando slash para criar tickets"""
        config = TicketConfig(ctx.guild.id)
        
        # Verificar rate limit
        if not await check_rate_limit(ctx.author.id, config.settings["rate_limit_hours"]):
            await ctx.send("❌ Você precisa aguardar antes de criar outro ticket!")
            return
        
        # Verificar limite de tickets por usuário
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute(
            "SELECT COUNT(*) FROM active_tickets WHERE user_id = ? AND guild_id = ?",
            (str(ctx.author.id), str(ctx.guild.id))
        )
        ticket_count = cursor.fetchone()[0]
        conn.close()
        
        if ticket_count >= config.settings["max_tickets_per_user"]:
            await ctx.send(f"❌ Você já tem {ticket_count} tickets ativos. Limite: {config.settings['max_tickets_per_user']}")
            return
        
        # Criar o ticket
        
        # Buscar categoria de tickets
        category = None
        for cat in ctx.guild.categories:
            if "ticket" in cat.name.lower():
                category = cat
                break
        
        if not category:
            category = await ctx.guild.create_category("📨 Tickets")
        
        # Criar canal do ticket
        ticket_name = f"ticket-{ctx.author.name}-{int(time.time())}"
        
        overwrites = {
            ctx.guild.default_role: discord.PermissionOverwrite(read_messages=False),
            ctx.author: discord.PermissionOverwrite(read_messages=True, send_messages=True),
            ctx.guild.me: discord.PermissionOverwrite(read_messages=True, send_messages=True)
        }
        
        # Adicionar permissões para staff
        for role in ctx.guild.roles:
            if any(staff_name.lower() in role.name.lower() for staff_name in STAFF_ROLE_NAMES):
                overwrites[role] = discord.PermissionOverwrite(read_messages=True, send_messages=True)
        
        channel = await ctx.guild.create_text_channel(
            ticket_name,
            category=category,
            overwrites=overwrites
        )
        
        # Salvar no banco de dados
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO active_tickets (guild_id, channel_id, user_id, ticket_type, created_at, last_activity) VALUES (?, ?, ?, ?, ?, ?)",
            (str(ctx.guild.id), str(channel.id), str(ctx.author.id), tipo, datetime.now().isoformat(), datetime.now().isoformat())
        )
        conn.commit()
        conn.close()
        
        # Adicionar rate limit
        await add_rate_limit(ctx.author.id)
        
        # Embed de boas-vindas
        embed = discord.Embed(
            title=f"🎫 Ticket de {tipo.title()}",
            description=f"Olá {ctx.author.mention}! Seu ticket foi criado com sucesso.\n\n**Tipo:** {tipo}\n**Motivo:** {motivo or 'Não especificado'}",
            color=0x00ff00
        )
        embed.add_field(
            name="📋 Informações",
            value="• Um membro da equipe irá atendê-lo em breve\n• Use os botões abaixo para gerenciar o ticket\n• Mantenha a conversa respeitosa e clara",
            inline=False
        )
        embed.set_footer(text=f"Ticket criado em {datetime.now().strftime('%d/%m/%Y às %H:%M')}")
        
        view = TicketView(config)
        await channel.send(embed=embed, view=view)
        
        # Log da ação
        await log_ticket_action(ctx.guild.id, "ticket_created", ctx.author.id, f"Ticket {tipo} criado: {channel.mention}")
        
        await ctx.send(f"✅ Ticket criado: {channel.mention}")
    
    @bot.command(name='fechar')
    async def close_ticket_command(ctx):
        """Comando slash para fechar tickets"""
        if not ctx.channel.name.startswith("ticket-"):
            await ctx.send("❌ Este comando só pode ser usado em canais de ticket!")
            return
        
        # Verificar se é o autor do ticket ou staff
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute(
            "SELECT user_id FROM active_tickets WHERE channel_id = ?",
            (str(ctx.channel.id),)
        )
        result = cursor.fetchone()
        conn.close()
        
        if not result:
            await ctx.send("❌ Ticket não encontrado no banco de dados!")
            return
        
        ticket_owner_id = result[0]
        is_owner = str(ctx.author.id) == ticket_owner_id
        is_staff = any(any(staff_name.lower() in role.name.lower() for staff_name in STAFF_ROLE_NAMES) for role in ctx.author.roles)
        
        if not (is_owner or is_staff):
            await ctx.send("❌ Apenas o autor do ticket ou membros da equipe podem fechá-lo!")
            return
        
        config = TicketConfig(ctx.guild.id)
        
        embed = discord.Embed(
            title="🔒 Fechar Ticket",
            description="Tem certeza que deseja fechar este ticket?\n\n⚠️ **Esta ação não pode ser desfeita!**",
            color=0xff4444
        )
        
        view = ConfirmCloseView(config)
        await ctx.send(embed=embed, view=view)
    
    @bot.command(name='forceclose')
    @commands.has_permissions(manage_channels=True)
    async def force_close_ticket(ctx, channel: discord.TextChannel = None):
        """Força o fechamento de um ticket"""
        target_channel = channel or ctx.channel
        
        if not target_channel.name.startswith("ticket-"):
            await ctx.send("❌ Este canal não é um ticket!")
            return
        
        config = TicketConfig(ctx.guild.id)
        
        # Fazer backup das mensagens se habilitado
        if config.settings["backup_enabled"]:
            await backup_ticket_messages(target_channel)
        
        # Remover do banco de dados
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("DELETE FROM active_tickets WHERE channel_id = ?", (str(target_channel.id),))
        conn.commit()
        conn.close()
        
        # Log da ação
        await log_ticket_action(ctx.guild.id, "ticket_force_closed", ctx.author.id, f"Ticket {target_channel.name} fechado à força")
        
        await ctx.send(f"✅ Ticket {target_channel.mention} será fechado em 5 segundos...")
        await asyncio.sleep(5)
        await target_channel.delete()
    
    # Task para fechar tickets inativos automaticamente
    @tasks.loop(hours=1)
    async def auto_close_inactive_tickets():
        """Fecha tickets inativos automaticamente"""
        try:
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            
            # Buscar tickets inativos
            cursor.execute(
                "SELECT guild_id, channel_id, user_id, last_activity FROM active_tickets"
            )
            tickets = cursor.fetchall()
            
            for guild_id, channel_id, user_id, last_activity_str in tickets:
                try:
                    guild = bot.get_guild(int(guild_id))
                    if not guild:
                        continue
                    
                    config = TicketConfig(int(guild_id))
                    auto_close_hours = config.settings["auto_close_hours"]
                    
                    last_activity = datetime.fromisoformat(last_activity_str)
                    hours_inactive = (datetime.now() - last_activity).total_seconds() / 3600
                    
                    if hours_inactive >= auto_close_hours:
                        channel = guild.get_channel(int(channel_id))
                        if channel:
                            # Fazer backup se habilitado
                            if config.settings["backup_enabled"]:
                                await backup_ticket_messages(channel)
                            
                            # Notificar sobre fechamento
                            embed = discord.Embed(
                                title="⏰ Ticket Fechado Automaticamente",
                                description=f"Este ticket foi fechado automaticamente por inatividade de {auto_close_hours} horas.",
                                color=0xff9900
                            )
                            await channel.send(embed=embed)
                            
                            # Remover do banco
                            cursor.execute("DELETE FROM active_tickets WHERE channel_id = ?", (channel_id,))
                            
                            # Log da ação
                            await log_ticket_action(int(guild_id), "ticket_auto_closed", None, f"Ticket {channel.name} fechado por inatividade")
                            
                            await asyncio.sleep(5)
                            await channel.delete()
                        else:
                            # Canal não existe mais, remover do banco
                            cursor.execute("DELETE FROM active_tickets WHERE channel_id = ?", (channel_id,))
                    
                except Exception as e:
                    print(f"Erro ao processar ticket {channel_id}: {e}")
                    continue
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            print(f"Erro na task de auto-fechamento: {e}")
    
    # ==================== FIM DOS COMANDOS DE TICKETS ====================
    
    # Executar bot com servidor HTTP
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n🛑 Bot interrompido pelo usuário")