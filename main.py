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
import aiohttp
import time
from datetime import timedelta, datetime, timezone
from discord.ext.commands import BucketType, cooldown
from pathlib import Path
from dotenv import load_dotenv
import collections
import threading
import json
from typing import Optional, Dict, Any

# Load environment variables
load_dotenv()

# ================= CONFIGURAÇÕES =================
intents = discord.Intents.default()
intents.members = True
intents.message_content = True
intents.presences = True
intents.voice_states = True

bot = commands.Bot(command_prefix='!', intents=intents, help_command=None)

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

# ================= VERIFICAÇÃO DE PERMISSÕES =================
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

# ================= FAMILY SYSTEM =================
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

# ================= EVENTS =================
@bot.event
async def on_ready():
    print(f'🤖 Bot {bot.user} está online!')
    print(f'📊 Conectado em {len(bot.guilds)} servidores')
    
    # Initialize database
    init_db()
    init_perm_db()
    
    # Start background tasks
    cleanup_panels.start()
    
    # Set bot status
    await bot.change_presence(
        activity=discord.Activity(type=discord.ActivityType.watching, name="!ajuda | by SquareCloud")
    )

@tasks.loop(minutes=5)
async def cleanup_panels():
    """Clean up expired panels"""
    current_time = time.time()
    expired_channels = [
        channel_id for channel_id, timestamp in panel_cooldown.items()
        if current_time - timestamp > 300  # 5 minutes
    ]
    for channel_id in expired_channels:
        if channel_id in active_panels:
            del active_panels[channel_id]
        del panel_cooldown[channel_id]

@bot.event
async def on_command_error(ctx, error):
    if isinstance(error, commands.CommandOnCooldown):
        await ctx.send(f"⏰ Calma! Tente novamente em {error.retry_after:.1f} segundos.")
    elif isinstance(error, commands.MissingPermissions):
        await ctx.send("❌ Você não tem permissão para usar este comando!")
    elif isinstance(error, commands.CommandNotFound):
        return  # Ignore unknown commands
    else:
        print(f"Erro no comando {ctx.command}: {error}")
        await ctx.send("❌ Ocorreu um erro interno. Tente novamente mais tarde.")

# ================= FAMILIA COMMAND (FIXED) =================
@bot.command(name='f', aliases=['familia'])
@cooldown(1, 10, BucketType.channel)  # Cooldown por canal, não por usuário
async def familia_panel(ctx):
    """Abre o painel de famílias - CORRIGIDO CONTRA DUPLICAÇÃO"""
    
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
        title="🤖 Painel Principal do Bot",
        description="Acesse todas as funcionalidades através dos botões abaixo:",
        color=0x3498db
    )
    
    # Aparência
    embed.add_field(
        name="🎭 Aparência",
        value="`andar`, `setavatar`, `setbanner`, `setusername`",
        inline=False
    )
    
    # Economia
    embed.add_field(
        name="💸 Economia",
        value="`carteira`, `daily`, `depositar`, `empregos`, `trabalhar`",
        inline=False
    )
    
    # Primeira Dama
    embed.add_field(
        name="💍 Primeira Dama",
        value="`pd`",
        inline=False
    )
    
    # Informativo
    embed.add_field(
        name="❗ Informativo",
        value="`ajuda`, `botinfo`, `ping`",
        inline=False
    )
    
    # Moderação
    embed.add_field(
        name="👮 Moderação",
        value="`warn`, `ban`, `kick`, `mute`, `lock`, `nuke`, `castigar`",
        inline=False
    )
    
    # Social
    embed.add_field(
        name="🎯 Social",
        value="`avatar`, `perfil`, `rep`, `sobremim`, `influencer`, `tellonym`",
        inline=False
    )
    
    # Staff
    embed.add_field(
        name="🧩 Staff",
        value="`migrar`, `recrutar`, `register`, `tempo`, `verificar`",
        inline=False
    )
    
    # VIP e Famílias
    embed.add_field(
        name="⭐ VIP & Famílias",
        value="`familia`, `addvip`, `addfamily` - Use os botões abaixo!",
        inline=False
    )
    
    # Integrações
    embed.add_field(
        name="🔗 Integrações",
        value="`instagram`, `tellonym`",
        inline=False
    )
    
    embed.set_footer(text="Use ! antes de cada comando • Este painel expira em 5 minutos")
    
    view = FamiliaView()
    message = await ctx.send(embed=embed, view=view)
    
    # Store the message to prevent duplicates
    active_panels[channel_id] = message
    
    log_command_execution("familia", ctx.author.id, ctx)

# ================= APARÊNCIA COMMANDS =================
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

@bot.command(name='setavatar')
@commands.check(check_admin)
async def set_avatar(ctx, url: str):
    """Define o avatar do bot"""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as resp:
                if resp.status == 200:
                    avatar_bytes = await resp.read()
                    await bot.user.edit(avatar=avatar_bytes)
                    await ctx.send("✅ Avatar alterado com sucesso!")
                else:
                    await ctx.send("❌ Não foi possível baixar a imagem!")
    except Exception as e:
        await ctx.send(f"❌ Erro ao alterar avatar: {e}")

@bot.command(name='setbanner')
@commands.check(check_admin)
async def set_banner(ctx, url: str):
    """Define o banner do bot"""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as resp:
                if resp.status == 200:
                    banner_bytes = await resp.read()
                    await bot.user.edit(banner=banner_bytes)
                    await ctx.send("✅ Banner alterado com sucesso!")
                else:
                    await ctx.send("❌ Não foi possível baixar a imagem!")
    except Exception as e:
        await ctx.send(f"❌ Erro ao alterar banner: {e}")

@bot.command(name='setusername')
@commands.check(check_admin)
async def set_username(ctx, *, nome: str):
    """Altera o nome do bot"""
    try:
        await bot.user.edit(username=nome)
        await ctx.send(f"✅ Nome alterado para: {nome}")
    except Exception as e:
        await ctx.send(f"❌ Erro ao alterar nome: {e}")

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

# ================= PRIMEIRA DAMA =================
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

# ================= INFORMATIVO =================
@bot.command(name='ajuda', aliases=['help'])
async def ajuda(ctx):
    """Mostra todos os comandos"""
    embed = discord.Embed(
        title="🤖 Comandos do Bot",
        description="Aqui estão todos os comandos disponíveis:",
        color=0x3498db
    )
    
    # Aparência
    embed.add_field(
        name="🎭 Aparência",
        value="`andar`, `setavatar`, `setbanner`, `setusername`",
        inline=False
    )
    
    # Economia
    embed.add_field(
        name="💸 Economia",
        value="`carteira`, `daily`, `depositar`, `empregos`, `trabalhar`",
        inline=False
    )
    
    # Primeira Dama
    embed.add_field(
        name="💍 Primeira Dama",
        value="`pd`",
        inline=False
    )
    
    # Informativo
    embed.add_field(
        name="❗ Informativo",
        value="`ajuda`, `botinfo`, `ping`",
        inline=False
    )
    
    # Moderação
    embed.add_field(
        name="👮 Moderação",
        value="`warn`, `ban`, `kick`, `mute`, `unmute`, `lock`, `unlock`, `castigar`, `nuke`, `bangif`, `mutecall`, `unmutecall`, `removeadvertence`, `removecastigo`, `removerole`, `unban`, `unbanall`, `advertence`",
        inline=False
    )
    
    # Social
    embed.add_field(
        name="🎯 Social",
        value="`avatar`, `perfil`, `rep`, `sobremim`, `influencer`, `tellonym`",
        inline=False
    )
    
    # Staff
    embed.add_field(
        name="🧩 Staff",
        value="`migracoes`, `migrar`, `movchat`, `mov`, `movpoints`, `recrutamentos`, `recrutar`, `register`, `registers`, `tempo`, `verificar`, `resetmigs`, `resetmovs`, `resetrecs`, `resetregisters`, `resettime`, `resetverificacoes`",
        inline=False
    )
    
    # Utilitários
    embed.add_field(
        name="🔱 Utilitários",
        value="`cl`, `clear`, `membersrole`",
        inline=False
    )
    
    # VIP
    embed.add_field(
        name="⭐ VIP",
        value="`familia`, `f`, `addfamily`, `removefamily`, `addvip`, `addvipc`, `removevip`, `removevipc`, `setvip`",
        inline=False
    )
    
    # Integrações
    embed.add_field(
        name="🔗 Integrações",
        value="`instagram`, `insta`, `ig`, `tellonym`",
        inline=False
    )
    
    embed.set_footer(text="Use ! antes de cada comando • Total: 62+ comandos")
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

# ================= SOCIAL =================
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

# ================= BASIC MODERATION =================
@bot.command(name='warn', aliases=['advertir'])
@commands.check(check_mod)
async def warn(ctx, user: discord.Member, *, reason: str):
    """Adverte um usuário"""
    try:
        conn = get_db()
        conn.execute(
            "INSERT INTO warns (user_id, moderator_id, reason, server_id) VALUES (?, ?, ?, ?)",
            (user.id, ctx.author.id, reason, ctx.guild.id)
        )
        conn.commit()
        
        # Count total warns
        warn_count = conn.execute(
            "SELECT COUNT(*) FROM warns WHERE user_id = ? AND server_id = ? AND active = 1",
            (user.id, ctx.guild.id)
        ).fetchone()[0]
        
        conn.close()
        
        embed = discord.Embed(
            title="⚠️ Usuário Advertido",
            description=f"{user.mention} foi advertido!\n**Motivo:** {reason}\n**Total de warns:** {warn_count}",
            color=0xff9900
        )
        await ctx.send(embed=embed)
        
    except Exception as e:
        print(f"Erro ao advertir: {e}")
        await ctx.send("❌ Erro ao advertir usuário!")

@bot.command(name='kick', aliases=['expulsar'])
@commands.check(check_mod)
async def kick(ctx, user: discord.Member, *, reason: str = "Não especificado"):
    """Expulsa um usuário"""
    try:
        await user.kick(reason=reason)
        
        embed = discord.Embed(
            title="👢 Usuário Expulso",
            description=f"{user.mention} foi expulso!\n**Motivo:** {reason}",
            color=0xff0000
        )
        await ctx.send(embed=embed)
        
    except Exception as e:
        print(f"Erro ao expulsar: {e}")
        await ctx.send("❌ Erro ao expulsar usuário!")

@bot.command(name='ban', aliases=['banir'])
@commands.check(check_mod)
async def ban(ctx, user: discord.Member, *, reason: str = "Não especificado"):
    """Bane um usuário"""
    try:
        await user.ban(reason=reason)
        
        embed = discord.Embed(
            title="🔨 Usuário Banido",
            description=f"{user.mention} foi banido!\n**Motivo:** {reason}",
            color=0xff0000
        )
        await ctx.send(embed=embed)
        
    except Exception as e:
        print(f"Erro ao banir: {e}")
        await ctx.send("❌ Erro ao banir usuário!")

# ================= UTILITIES =================
@bot.command(name='clear', aliases=['cl'])
@commands.check(check_mod)
async def clear(ctx, amount: int = 10):
    """Limpa mensagens do canal"""
    if amount > 100:
        amount = 100
    
    try:
        deleted = await ctx.channel.purge(limit=amount + 1)  # +1 for the command message
        
        embed = discord.Embed(
            title="🧹 Canal Limpo",
            description=f"Foram deletadas **{len(deleted) - 1}** mensagens!",
            color=0x00ff00
        )
        msg = await ctx.send(embed=embed)
        await asyncio.sleep(3)
        await msg.delete()
        
    except Exception as e:
        print(f"Erro ao limpar: {e}")
        await ctx.send("❌ Erro ao limpar mensagens!")

# ================= MODERATION COMMANDS =================
@bot.command(name='advertence', aliases=['adv'])
@commands.check(check_mod)
async def advertence(ctx, user: discord.Member, *, reason: str):
    """Adverte um usuário (alias para warn)"""
    await warn(ctx, user, reason=reason)

@bot.command(name='bangif')
@commands.check(check_mod)
async def bangif(ctx, *, gif_query: str = "ban"):
    """Bane com gif animado"""
    gifs = [
        "https://media.giphy.com/media/fe4dDMD2cAU5RfEaCU/giphy.gif",
        "https://media.giphy.com/media/H99r2HtnYs492/giphy.gif",
        "https://media.giphy.com/media/qCj1NK1rxtnna/giphy.gif"
    ]
    
    embed = discord.Embed(
        title="🔨 Ban Hammer!",
        description=f"**{gif_query}** foi banido com estilo!",
        color=0xff0000
    )
    embed.set_image(url=random.choice(gifs))
    await ctx.send(embed=embed)

@bot.command(name='castigar')
@commands.check(check_mod)
async def castigar(ctx, user: discord.Member, duration: str, *, reason: str = "Comportamento inadequado"):
    """Castiga um usuário temporariamente"""
    try:
        # Parse duration (simple implementation)
        if 'm' in duration:
            minutes = int(duration.replace('m', ''))
            timeout_until = datetime.now() + timedelta(minutes=minutes)
        elif 'h' in duration:
            hours = int(duration.replace('h', ''))
            timeout_until = datetime.now() + timedelta(hours=hours)
        else:
            await ctx.send("❌ Formato de tempo inválido! Use: 5m, 2h, etc.")
            return
        
        await user.timeout(timeout_until, reason=reason)
        
        embed = discord.Embed(
            title="🔇 Usuário Castigado",
            description=f"{user.mention} foi castigado por {duration}!\n**Motivo:** {reason}",
            color=0xff9900
        )
        await ctx.send(embed=embed)
        
    except Exception as e:
        print(f"Erro ao castigar: {e}")
        await ctx.send("❌ Erro ao castigar usuário!")

@bot.command(name='lock')
@commands.check(check_mod)
async def lock(ctx, channel: discord.TextChannel = None):
    """Bloqueia um canal"""
    if channel is None:
        channel = ctx.channel
    
    try:
        await channel.set_permissions(ctx.guild.default_role, send_messages=False)
        
        embed = discord.Embed(
            title="🔒 Canal Bloqueado",
            description=f"Canal {channel.mention} foi bloqueado!",
            color=0xff0000
        )
        await ctx.send(embed=embed)
        
    except Exception as e:
        print(f"Erro ao bloquear canal: {e}")
        await ctx.send("❌ Erro ao bloquear canal!")

@bot.command(name='unlock')
@commands.check(check_mod)
async def unlock(ctx, channel: discord.TextChannel = None):
    """Desbloqueia um canal"""
    if channel is None:
        channel = ctx.channel
    
    try:
        await channel.set_permissions(ctx.guild.default_role, send_messages=True)
        
        embed = discord.Embed(
            title="🔓 Canal Desbloqueado",
            description=f"Canal {channel.mention} foi desbloqueado!",
            color=0x00ff00
        )
        await ctx.send(embed=embed)
        
    except Exception as e:
        print(f"Erro ao desbloquear canal: {e}")
        await ctx.send("❌ Erro ao desbloquear canal!")

@bot.command(name='mutecall', aliases=['vmute'])
@commands.check(check_mod)
async def mutecall(ctx, user: discord.Member):
    """Muta usuário no voice chat"""
    if user.voice:
        try:
            await user.edit(mute=True)
            
            embed = discord.Embed(
                title="🔇 Usuário Mutado no Voice",
                description=f"{user.mention} foi mutado no chat de voz!",
                color=0xff9900
            )
            await ctx.send(embed=embed)
            
        except Exception as e:
            print(f"Erro ao mutar no voice: {e}")
            await ctx.send("❌ Erro ao mutar usuário no voice!")
    else:
        await ctx.send("❌ Usuário não está em um canal de voz!")

@bot.command(name='unmutecall', aliases=['vunmute'])
@commands.check(check_mod)
async def unmutecall(ctx, user: discord.Member):
    """Desmuta usuário no voice chat"""
    if user.voice:
        try:
            await user.edit(mute=False)
            
            embed = discord.Embed(
                title="🔊 Usuário Desmutado no Voice",
                description=f"{user.mention} foi desmutado no chat de voz!",
                color=0x00ff00
            )
            await ctx.send(embed=embed)
            
        except Exception as e:
            print(f"Erro ao desmutar no voice: {e}")
            await ctx.send("❌ Erro ao desmutar usuário no voice!")
    else:
        await ctx.send("❌ Usuário não está em um canal de voz!")

@bot.command(name='mute')
@commands.check(check_mod)
async def mute(ctx, user: discord.Member, duration: str = "indefinido", *, reason: str = "Não especificado"):
    """Muta um usuário no servidor"""
    try:
        # Try to timeout the user
        if duration != "indefinido":
            if 'm' in duration:
                minutes = int(duration.replace('m', ''))
                timeout_until = datetime.now() + timedelta(minutes=minutes)
            elif 'h' in duration:
                hours = int(duration.replace('h', ''))
                timeout_until = datetime.now() + timedelta(hours=hours)
            else:
                await ctx.send("❌ Formato de tempo inválido! Use: 5m, 2h, etc.")
                return
            
            await user.timeout(timeout_until, reason=reason)
        
        embed = discord.Embed(
            title="🔇 Usuário Mutado",
            description=f"{user.mention} foi mutado por {duration}!\n**Motivo:** {reason}",
            color=0xff9900
        )
        await ctx.send(embed=embed)
        
    except Exception as e:
        print(f"Erro ao mutar: {e}")
        await ctx.send("❌ Erro ao mutar usuário!")

@bot.command(name='unmute')
@commands.check(check_mod)
async def unmute(ctx, user: discord.Member):
    """Desmuta um usuário"""
    try:
        await user.timeout(None)
        
        embed = discord.Embed(
            title="🔊 Usuário Desmutado",
            description=f"{user.mention} foi desmutado!",
            color=0x00ff00
        )
        await ctx.send(embed=embed)
        
    except Exception as e:
        print(f"Erro ao desmutar: {e}")
        await ctx.send("❌ Erro ao desmutar usuário!")

@bot.command(name='nuke')
@commands.check(check_mod)
async def nuke(ctx):
    """Deleta e recria o canal (limpa tudo)"""
    try:
        channel_name = ctx.channel.name
        channel_position = ctx.channel.position
        channel_category = ctx.channel.category
        
        await ctx.channel.delete()
        
        new_channel = await ctx.guild.create_text_channel(
            name=channel_name,
            category=channel_category,
            position=channel_position
        )
        
        embed = discord.Embed(
            title="💥 Canal Nukado!",
            description="Canal foi completamente limpo e recriado!",
            color=0xff0000
        )
        await new_channel.send(embed=embed)
        
    except Exception as e:
        print(f"Erro ao nukar canal: {e}")
        await ctx.send("❌ Erro ao nukar canal!")

@bot.command(name='removeadvertence', aliases=['removewarn'])
@commands.check(check_mod)
async def remove_advertence(ctx, user: discord.Member, warn_id: int = None):
    """Remove uma advertência específica"""
    try:
        conn = get_db()
        
        if warn_id:
            # Remove specific warn
            conn.execute(
                "UPDATE warns SET active = 0 WHERE warn_id = ? AND server_id = ?",
                (warn_id, ctx.guild.id)
            )
            message = f"Advertência #{warn_id} removida"
        else:
            # Remove latest warn
            conn.execute(
                "UPDATE warns SET active = 0 WHERE user_id = ? AND server_id = ? AND active = 1 ORDER BY timestamp DESC LIMIT 1",
                (user.id, ctx.guild.id)
            )
            message = "Última advertência removida"
        
        conn.commit()
        conn.close()
        
        embed = discord.Embed(
            title="✅ Advertência Removida",
            description=f"{message} de {user.mention}!",
            color=0x00ff00
        )
        await ctx.send(embed=embed)
        
    except Exception as e:
        print(f"Erro ao remover advertência: {e}")
        await ctx.send("❌ Erro ao remover advertência!")

@bot.command(name='removecastigo')
@commands.check(check_mod)
async def remove_castigo(ctx, user: discord.Member):
    """Remove castigo/timeout de um usuário"""
    try:
        await user.timeout(None)
        
        embed = discord.Embed(
            title="✅ Castigo Removido",
            description=f"Castigo removido de {user.mention}!",
            color=0x00ff00
        )
        await ctx.send(embed=embed)
        
    except Exception as e:
        print(f"Erro ao remover castigo: {e}")
        await ctx.send("❌ Erro ao remover castigo!")

@bot.command(name='addrole')
@commands.check(check_mod)
async def add_role(ctx, user: discord.Member, *, role_name: str):
    """Adiciona cargo a um usuário"""
    try:
        role = discord.utils.get(ctx.guild.roles, name=role_name)
        if not role:
            await ctx.send("❌ Cargo não encontrado!")
            return
        
        await user.add_roles(role)
        
        embed = discord.Embed(
            title="✅ Cargo Adicionado",
            description=f"Cargo **{role.name}** adicionado a {user.mention}!",
            color=0x00ff00
        )
        await ctx.send(embed=embed)
        
    except Exception as e:
        print(f"Erro ao adicionar cargo: {e}")
        await ctx.send("❌ Erro ao adicionar cargo!")

@bot.command(name='removerole')
@commands.check(check_mod)
async def remove_role(ctx, user: discord.Member, *, role_name: str):
    """Remove cargo de um usuário"""
    try:
        role = discord.utils.get(ctx.guild.roles, name=role_name)
        if not role:
            await ctx.send("❌ Cargo não encontrado!")
            return
        
        await user.remove_roles(role)
        
        embed = discord.Embed(
            title="✅ Cargo Removido",
            description=f"Cargo **{role.name}** removido de {user.mention}!",
            color=0x00ff00
        )
        await ctx.send(embed=embed)
        
    except Exception as e:
        print(f"Erro ao remover cargo: {e}")
        await ctx.send("❌ Erro ao remover cargo!")

@bot.command(name='unban')
@commands.check(check_mod)
async def unban(ctx, user_id: int):
    """Desbane um usuário pelo ID"""
    try:
        user = await bot.fetch_user(user_id)
        await ctx.guild.unban(user)
        
        embed = discord.Embed(
            title="✅ Usuário Desbanido",
            description=f"**{user.name}** foi desbanido!",
            color=0x00ff00
        )
        await ctx.send(embed=embed)
        
    except Exception as e:
        print(f"Erro ao desbanir: {e}")
        await ctx.send("❌ Erro ao desbanir usuário!")

@bot.command(name='unbanall')
@commands.check(check_admin)
async def unban_all(ctx):
    """Desbane todos os usuários (ADMIN ONLY)"""
    try:
        banned_users = [entry async for entry in ctx.guild.bans()]
        count = 0
        
        for ban_entry in banned_users:
            try:
                await ctx.guild.unban(ban_entry.user)
                count += 1
            except:
                pass
        
        embed = discord.Embed(
            title="✅ Usuários Desbanidos",
            description=f"**{count}** usuários foram desbanidos!",
            color=0x00ff00
        )
        await ctx.send(embed=embed)
        
    except Exception as e:
        print(f"Erro ao desbanir todos: {e}")
        await ctx.send("❌ Erro ao desbanir usuários!")

# ================= STAFF COMMANDS =================
@bot.command(name='migracoes', aliases=['migs'])
async def migracoes(ctx, user: discord.Member = None):
    """Mostra estatísticas de migrações de staff"""
    if user is None:
        user = ctx.author
    
    try:
        conn = get_db()
        staff_data = conn.execute(
            "SELECT points FROM staff WHERE user_id = ? AND server_id = ?", 
            (user.id, ctx.guild.id)
        ).fetchone()
        conn.close()
        
        migs = staff_data[0] if staff_data else 0
        
        embed = discord.Embed(
            title="📊 Migrações de Staff",
            description=f"{user.mention} possui **{migs}** migrações!",
            color=0x3498db
        )
        await ctx.send(embed=embed)
        
    except Exception as e:
        print(f"Erro ao buscar migrações: {e}")
        await ctx.send("❌ Erro ao buscar migrações!")

@bot.command(name='migrar')
@commands.check(check_mod)
async def migrar(ctx, user: discord.Member, points: int = 1):
    """Adiciona pontos de migração para staff"""
    try:
        conn = get_db()
        conn.execute(
            "INSERT OR REPLACE INTO staff (user_id, server_id, role, points) VALUES (?, ?, 'staff', COALESCE((SELECT points FROM staff WHERE user_id = ? AND server_id = ?), 0) + ?)",
            (user.id, ctx.guild.id, user.id, ctx.guild.id, points)
        )
        conn.commit()
        conn.close()
        
        embed = discord.Embed(
            title="✅ Migração Registrada",
            description=f"+{points} pontos de migração para {user.mention}!",
            color=0x00ff00
        )
        await ctx.send(embed=embed)
        
    except Exception as e:
        print(f"Erro ao migrar: {e}")
        await ctx.send("❌ Erro ao registrar migração!")

@bot.command(name='movchat', aliases=['mov'])
@commands.check(check_mod)
async def mov_chat(ctx, user: discord.Member, points: int = 1):
    """Adiciona pontos de movimentação de chat"""
    await migrar(ctx, user, points)  # Same system as migrar

@bot.command(name='movpoints')
async def mov_points(ctx, user: discord.Member = None):
    """Mostra pontos de movimentação"""
    await migracoes(ctx, user)  # Same system as migracoes

@bot.command(name='recrutamentos', aliases=['recs'])
async def recrutamentos(ctx, user: discord.Member = None):
    """Mostra estatísticas de recrutamentos"""
    await migracoes(ctx, user)  # Same system

@bot.command(name='recrutar')
@commands.check(check_mod)
async def recrutar(ctx, user: discord.Member, points: int = 1):
    """Adiciona pontos de recrutamento"""
    await migrar(ctx, user, points)  # Same system

@bot.command(name='register')
@commands.check(check_mod)
async def register_staff(ctx, user: discord.Member, *, role: str = "staff"):
    """Registra um membro como staff"""
    try:
        conn = get_db()
        conn.execute(
            "INSERT OR REPLACE INTO staff (user_id, server_id, role, points) VALUES (?, ?, ?, 0)",
            (user.id, ctx.guild.id, role)
        )
        conn.commit()
        conn.close()
        
        embed = discord.Embed(
            title="✅ Staff Registrado",
            description=f"{user.mention} foi registrado como **{role}**!",
            color=0x00ff00
        )
        await ctx.send(embed=embed)
        
    except Exception as e:
        print(f"Erro ao registrar staff: {e}")
        await ctx.send("❌ Erro ao registrar staff!")

@bot.command(name='registers')
async def registers(ctx):
    """Lista todos os staff registrados"""
    try:
        conn = get_db()
        staff_list = conn.execute(
            "SELECT user_id, role, points FROM staff WHERE server_id = ? ORDER BY points DESC",
            (ctx.guild.id,)
        ).fetchall()
        conn.close()
        
        if not staff_list:
            await ctx.send("❌ Nenhum staff registrado!")
            return
        
        embed = discord.Embed(
            title="👥 Staff Registrados",
            color=0x3498db
        )
        
        for user_id, role, points in staff_list[:10]:  # Top 10
            try:
                user = bot.get_user(user_id)
                name = user.name if user else f"ID: {user_id}"
                embed.add_field(
                    name=f"🏆 {name}",
                    value=f"Cargo: {role}\nPontos: {points}",
                    inline=True
                )
            except:
                pass
        
        await ctx.send(embed=embed)
        
    except Exception as e:
        print(f"Erro ao listar staff: {e}")
        await ctx.send("❌ Erro ao listar staff!")

# Reset commands for staff
@bot.command(name='resetmigs')
@commands.check(check_admin)
async def reset_migs(ctx, user: discord.Member = None):
    """Reseta migrações de um usuário ou todas"""
    try:
        conn = get_db()
        if user:
            conn.execute(
                "UPDATE staff SET points = 0 WHERE user_id = ? AND server_id = ?",
                (user.id, ctx.guild.id)
            )
            message = f"Migrações de {user.mention} resetadas!"
        else:
            conn.execute(
                "UPDATE staff SET points = 0 WHERE server_id = ?",
                (ctx.guild.id,)
            )
            message = "Todas as migrações foram resetadas!"
        
        conn.commit()
        conn.close()
        
        embed = discord.Embed(
            title="🔄 Reset Realizado",
            description=message,
            color=0xff9900
        )
        await ctx.send(embed=embed)
        
    except Exception as e:
        print(f"Erro ao resetar: {e}")
        await ctx.send("❌ Erro ao resetar migrações!")

# Add aliases for other reset commands
@bot.command(name='resetmovchat')
@commands.check(check_admin)
async def reset_movchat(ctx, user: discord.Member = None):
    """Reseta movimentações de chat"""
    await reset_migs(ctx, user)

@bot.command(name='resetmovs')
@commands.check(check_admin) 
async def reset_movs(ctx, user: discord.Member = None):
    """Reseta movimentações"""
    await reset_migs(ctx, user)

@bot.command(name='resetrecs')
@commands.check(check_admin)
async def reset_recs(ctx, user: discord.Member = None):
    """Reseta recrutamentos"""
    await reset_migs(ctx, user)

@bot.command(name='resetregisters')
@commands.check(check_admin)
async def reset_registers(ctx):
    """Reseta todos os registros de staff"""
    try:
        conn = get_db()
        conn.execute("DELETE FROM staff WHERE server_id = ?", (ctx.guild.id,))
        conn.commit()
        conn.close()
        
        embed = discord.Embed(
            title="🔄 Registros Resetados",
            description="Todos os registros de staff foram limpos!",
            color=0xff9900
        )
        await ctx.send(embed=embed)
        
    except Exception as e:
        print(f"Erro ao resetar registros: {e}")
        await ctx.send("❌ Erro ao resetar registros!")

@bot.command(name='resettime')
@commands.check(check_admin)
async def reset_time(ctx):
    """Reseta todos os cooldowns de tempo"""
    try:
        conn = get_db()
        conn.execute(
            "UPDATE users SET last_daily = NULL, last_work = NULL, last_rep = NULL"
        )
        conn.commit()
        conn.close()
        
        embed = discord.Embed(
            title="🔄 Tempos Resetados",
            description="Todos os cooldowns foram resetados!",
            color=0xff9900
        )
        await ctx.send(embed=embed)
        
    except Exception as e:
        print(f"Erro ao resetar tempos: {e}")
        await ctx.send("❌ Erro ao resetar tempos!")

@bot.command(name='resetverificacoes')
@commands.check(check_admin)
async def reset_verificacoes(ctx):
    """Reseta verificações (placeholder)"""
    embed = discord.Embed(
        title="🔄 Verificações Resetadas",
        description="Sistema de verificações foi resetado!",
        color=0xff9900
    )
    await ctx.send(embed=embed)

@bot.command(name='tempo')
async def tempo(ctx, user: discord.Member = None):
    """Mostra tempo de atividade de um usuário"""
    if user is None:
        user = ctx.author
    
    embed = discord.Embed(
        title="⏱️ Tempo de Atividade",
        description=f"Tempo de {user.mention} no servidor: **Calculando...**",
        color=0x3498db
    )
    embed.add_field(name="📅 Entrou no servidor", value=user.joined_at.strftime("%d/%m/%Y") if user.joined_at else "N/A", inline=True)
    embed.add_field(name="📅 Conta criada", value=user.created_at.strftime("%d/%m/%Y"), inline=True)
    
    await ctx.send(embed=embed)

@bot.command(name='verificar')
@commands.check(check_mod)
async def verificar(ctx, user: discord.Member):
    """Verifica um usuário (adiciona cargo de verificado se existir)"""
    try:
        # Try to find a "Verificado" or similar role
        verified_role = discord.utils.get(ctx.guild.roles, name="Verificado")
        if not verified_role:
            verified_role = discord.utils.get(ctx.guild.roles, name="Verified")
        if not verified_role:
            verified_role = discord.utils.get(ctx.guild.roles, name="Membro")
        
        if verified_role:
            await user.add_roles(verified_role)
            message = f"Cargo **{verified_role.name}** adicionado!"
        else:
            message = "Nenhum cargo de verificação encontrado!"
        
        embed = discord.Embed(
            title="✅ Usuário Verificado",
            description=f"{user.mention} foi verificado!\n{message}",
            color=0x00ff00
        )
        await ctx.send(embed=embed)
        
    except Exception as e:
        print(f"Erro ao verificar: {e}")
        await ctx.send("❌ Erro ao verificar usuário!")

# ================= UTILITIES COMMANDS =================
@bot.command(name='membersrole')
async def members_role(ctx, *, role_name: str):
    """Lista membros com um cargo específico"""
    try:
        role = discord.utils.get(ctx.guild.roles, name=role_name)
        if not role:
            await ctx.send("❌ Cargo não encontrado!")
            return
        
        members = [member for member in ctx.guild.members if role in member.roles]
        
        if not members:
            await ctx.send(f"❌ Nenhum membro possui o cargo **{role.name}**!")
            return
        
        embed = discord.Embed(
            title=f"👥 Membros com o cargo {role.name}",
            description=f"Total: **{len(members)}** membros",
            color=role.color
        )
        
        # Show first 20 members
        member_list = []
        for i, member in enumerate(members[:20], 1):
            member_list.append(f"{i}. {member.mention}")
        
        embed.add_field(
            name="Membros:",
            value="\n".join(member_list) if member_list else "Nenhum",
            inline=False
        )
        
        if len(members) > 20:
            embed.set_footer(text=f"Mostrando 20 de {len(members)} membros")
        
        await ctx.send(embed=embed)
        
    except Exception as e:
        print(f"Erro ao listar membros: {e}")
        await ctx.send("❌ Erro ao listar membros!")

# ================= VIP COMMANDS =================
@bot.command(name='addfamily')
@commands.check(check_admin)
async def add_family_vip(ctx, user: discord.Member, *, family_name: str):
    """Adiciona família VIP para um usuário"""
    try:
        conn = get_db()
        
        # Create or get family
        family = conn.execute(
            "SELECT family_id FROM families WHERE name = ?", (family_name,)
        ).fetchone()
        
        if not family:
            cursor = conn.execute(
                "INSERT INTO families (name, leader_id, created_at) VALUES (?, ?, ?)",
                (family_name, user.id, datetime.now().isoformat())
            )
            family_id = cursor.lastrowid
        else:
            family_id = family[0]
        
        # Add user to family and mark as VIP
        conn.execute(
            "INSERT OR REPLACE INTO users (user_id, family_id, vip, vip_level) VALUES (?, ?, 1, 1)",
            (user.id, family_id)
        )
        conn.commit()
        conn.close()
        
        embed = discord.Embed(
            title="✅ Família VIP Adicionada",
            description=f"{user.mention} foi adicionado à família VIP **{family_name}**!",
            color=0x9b59b6
        )
        await ctx.send(embed=embed)
        
    except Exception as e:
        print(f"Erro ao adicionar família VIP: {e}")
        await ctx.send("❌ Erro ao adicionar família VIP!")

@bot.command(name='removefamily')
@commands.check(check_admin)
async def remove_family_vip(ctx, user: discord.Member):
    """Remove família VIP de um usuário"""
    try:
        conn = get_db()
        conn.execute(
            "UPDATE users SET family_id = NULL, vip = 0, vip_level = 0 WHERE user_id = ?",
            (user.id,)
        )
        conn.commit()
        conn.close()
        
        embed = discord.Embed(
            title="✅ Família VIP Removida",
            description=f"Família VIP removida de {user.mention}!",
            color=0xff9900
        )
        await ctx.send(embed=embed)
        
    except Exception as e:
        print(f"Erro ao remover família VIP: {e}")
        await ctx.send("❌ Erro ao remover família VIP!")

@bot.command(name='addvipc')
@commands.check(check_admin)
async def add_vipc(ctx, user: discord.Member):
    """Adiciona VIP Comum"""
    try:
        conn = get_db()
        conn.execute(
            "INSERT OR REPLACE INTO users (user_id, vip, vip_level) VALUES (?, 1, 1)",
            (user.id,)
        )
        conn.commit()
        conn.close()
        
        embed = discord.Embed(
            title="✅ VIP Comum Adicionado",
            description=f"{user.mention} agora é VIP Comum!",
            color=0x9b59b6
        )
        await ctx.send(embed=embed)
        
    except Exception as e:
        print(f"Erro ao adicionar VIP: {e}")
        await ctx.send("❌ Erro ao adicionar VIP!")

@bot.command(name='addvip')
@commands.check(check_admin)
async def add_vip(ctx, user: discord.Member, level: int = 2):
    """Adiciona VIP Premium"""
    try:
        conn = get_db()
        conn.execute(
            "INSERT OR REPLACE INTO users (user_id, vip, vip_level) VALUES (?, 1, ?)",
            (user.id, level)
        )
        conn.commit()
        conn.close()
        
        vip_types = {1: "Comum", 2: "Premium", 3: "Ultimate"}
        vip_name = vip_types.get(level, "Premium")
        
        embed = discord.Embed(
            title="✅ VIP Adicionado",
            description=f"{user.mention} agora é VIP {vip_name}!",
            color=0x9b59b6
        )
        await ctx.send(embed=embed)
        
    except Exception as e:
        print(f"Erro ao adicionar VIP: {e}")
        await ctx.send("❌ Erro ao adicionar VIP!")

@bot.command(name='removevipc')
@commands.check(check_admin)
async def remove_vipc(ctx, user: discord.Member):
    """Remove VIP Comum"""
    await remove_vip(ctx, user)

@bot.command(name='removevip')
@commands.check(check_admin)
async def remove_vip(ctx, user: discord.Member):
    """Remove VIP"""
    try:
        conn = get_db()
        conn.execute(
            "UPDATE users SET vip = 0, vip_level = 0 WHERE user_id = ?",
            (user.id,)
        )
        conn.commit()
        conn.close()
        
        embed = discord.Embed(
            title="✅ VIP Removido",
            description=f"VIP removido de {user.mention}!",
            color=0xff9900
        )
        await ctx.send(embed=embed)
        
    except Exception as e:
        print(f"Erro ao remover VIP: {e}")
        await ctx.send("❌ Erro ao remover VIP!")

@bot.command(name='setvip')
@commands.check(check_admin)
async def set_vip(ctx, user: discord.Member, level: int):
    """Define nível VIP específico"""
    await add_vip(ctx, user, level)

# ================= SOCIAL ENHANCEMENTS =================
@bot.command(name='influencer')
async def influencer(ctx, user: discord.Member = None):
    """Mostra ranking de influência"""
    if user is None:
        user = ctx.author
    
    ensure_user_exists(user.id)
    
    try:
        conn = get_db()
        user_data = conn.execute(
            "SELECT rep, level FROM users WHERE user_id = ?", (user.id,)
        ).fetchone()
        conn.close()
        
        rep = user_data[0] if user_data else 0
        level = user_data[1] if user_data else 1
        
        influence_score = rep * 2 + level * 10
        
        # Determine influence level
        if influence_score >= 1000:
            rank = "🔥 Mega Influencer"
        elif influence_score >= 500:
            rank = "⭐ Super Influencer"
        elif influence_score >= 200:
            rank = "🌟 Influencer"
        elif influence_score >= 50:
            rank = "📈 Crescendo"
        else:
            rank = "👶 Iniciante"
        
        embed = discord.Embed(
            title=f"🎯 Status de Influência",
            color=0xe91e63
        )
        embed.add_field(name="👤 Usuário", value=user.mention, inline=True)
        embed.add_field(name="📊 Pontuação", value=f"{influence_score}", inline=True)
        embed.add_field(name="🏆 Ranking", value=rank, inline=True)
        embed.add_field(name="⭐ Reputação", value=f"{rep}", inline=True)
        embed.add_field(name="🎯 Nível", value=f"{level}", inline=True)
        embed.set_thumbnail(url=user.display_avatar.url)
        
        await ctx.send(embed=embed)
        
    except Exception as e:
        print(f"Erro no influencer: {e}")
        await ctx.send("❌ Erro ao calcular influência!")

@bot.command(name='tellonym')
async def tellonym(ctx, user: discord.Member = None):
    """Sistema de mensagens anônimas (como Tellonym)"""
    if user is None:
        embed = discord.Embed(
            title="💌 Tellonym - Mensagens Anônimas",
            description="Use `!tellonym @usuário` para enviar uma mensagem anônima!",
            color=0xff6b6b
        )
        embed.add_field(
            name="📝 Como usar:",
            value="1. `!tellonym @usuário` - Abre formulário\n2. Escreva sua mensagem\n3. Mensagem é enviada anonimamente",
            inline=False
        )
        embed.add_field(
            name="⚠️ Regras:",
            value="• Não envie spam\n• Seja respeitoso\n• Mensagens ofensivas serão punidas",
            inline=False
        )
        await ctx.send(embed=embed)
        return
    
    if user.id == ctx.author.id:
        await ctx.send("❌ Você não pode enviar mensagem anônima para si mesmo!")
        return
    
    modal = TellonymModal(user)
    
    # Since we can't directly send modal from command, we create a button
    class TellonymView(View):
        def __init__(self, target_user):
            super().__init__(timeout=300)
            self.target_user = target_user
            
        @discord.ui.button(label="📝 Enviar Mensagem Anônima", style=discord.ButtonStyle.primary, emoji="💌")
        async def send_anonymous(self, interaction: discord.Interaction, button: Button):
            modal = TellonymModal(self.target_user)
            await interaction.response.send_modal(modal)
    
    embed = discord.Embed(
        title="💌 Tellonym",
        description=f"Envie uma mensagem anônima para {user.mention}!",
        color=0xff6b6b
    )
    
    view = TellonymView(user)
    await ctx.send(embed=embed, view=view)

class TellonymModal(Modal):
    def __init__(self, target_user):
        super().__init__(title=f"Mensagem para {target_user.display_name}")
        self.target_user = target_user
        
        self.message_input = TextInput(
            label="Sua mensagem anônima:",
            placeholder="Digite sua mensagem aqui...",
            style=discord.TextStyle.paragraph,
            max_length=500,
            required=True
        )
        self.add_item(self.message_input)
    
    async def on_submit(self, interaction: discord.Interaction):
        message = self.message_input.value
        
        try:
            # Send anonymous message to target user
            embed = discord.Embed(
                title="💌 Você recebeu uma mensagem anônima!",
                description=message,
                color=0xff6b6b
            )
            embed.set_footer(text="Esta mensagem foi enviada anonimamente")
            
            try:
                await self.target_user.send(embed=embed)
                await interaction.response.send_message("✅ Mensagem anônima enviada!", ephemeral=True)
            except discord.Forbidden:
                # If can't DM, send in channel
                await interaction.response.send_message(
                    f"{self.target_user.mention}, você recebeu uma mensagem anônima:",
                    embed=embed
                )
                
        except Exception as e:
            print(f"Erro no tellonym: {e}")
            await interaction.response.send_message("❌ Erro ao enviar mensagem!", ephemeral=True)

# ================= INSTAGRAM INTEGRATION (Basic) =================
@bot.command(name='instagram', aliases=['insta', 'ig'])
async def instagram(ctx, *, username: str = None):
    """Sistema de Instagram (placeholder para integração futura)"""
    if not username:
        embed = discord.Embed(
            title="📸 Instagram Integration",
            description="Sistema de integração com Instagram!",
            color=0xe4405f
        )
        embed.add_field(
            name="📱 Como usar:",
            value="`!instagram @username` - Ver perfil\n`!instagram stories` - Ver stories (VIP)",
            inline=False
        )
        embed.add_field(
            name="🔧 Status:",
            value="Sistema em desenvolvimento!\nEm breve você poderá ver posts e stories diretamente no Discord.",
            inline=False
        )
        embed.set_thumbnail(url="https://cdn-icons-png.flaticon.com/512/174/174855.png")
        await ctx.send(embed=embed)
        return
    
    # Placeholder for Instagram integration
    embed = discord.Embed(
        title=f"📸 Instagram: {username}",
        description="Perfil do Instagram (simulado)",
        color=0xe4405f
    )
    embed.add_field(name="👥 Seguidores", value="10.2K", inline=True)
    embed.add_field(name="📸 Posts", value="234", inline=True)
    embed.add_field(name="👤 Seguindo", value="892", inline=True)
    embed.add_field(
        name="📝 Bio:",
        value="Esta é uma simulação do sistema Instagram.\nEm breve teremos integração real!",
        inline=False
    )
    embed.set_footer(text="Sistema em desenvolvimento - dados simulados")
    
    await ctx.send(embed=embed)

# ================= RUN BOT =================
if __name__ == "__main__":
    token = os.getenv('DISCORD_TOKEN')
    if not token:
        print("❌ Token do Discord não encontrado! Configure a variável DISCORD_TOKEN.")
        sys.exit(1)
    
    print("🚀 Iniciando bot...")
    bot.run(token)