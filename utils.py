import asyncio
import aiohttp
import random
import time
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional, Any
import logging
import collections

# ================= LOGGER PERSONALIZADO =================
class BotLogger:
    @staticmethod
    def error(message):
        logging.error(f"❌ {message}")

    @staticmethod
    def debug(message):
        logging.debug(f"🔧 {message}")

    @staticmethod
    def command_success(command, user, details=""):
        logging.info(f"✅ Comando '{command}' executado por {user} {details}")

    @staticmethod
    def command_error(command, user, error):
        logging.error(f"❌ Comando '{command}' falhou para {user}: {error}")

logger = BotLogger()

# ================= SISTEMA DE CONTROLE DE DUPLICAÇÃO =================
command_executions = collections.defaultdict(list)
duplicate_alerts = {}

def log_command_execution(command_name, user_id, context):
    """Registra execução de comando para detectar duplicações"""
    current_time = datetime.now()
    
    # Adiciona execução à lista
    command_executions[f"{command_name}_{user_id}"].append({
        'timestamp': current_time,
        'context': context,
        'channel_id': getattr(context, 'channel_id', getattr(context.channel, 'id', 'unknown')),
        'message_id': getattr(context, 'message_id', getattr(context.message, 'id', 'unknown'))
    })
    
    # Limpa execuções antigas (mais de 1 minuto)
    cutoff_time = current_time - timedelta(minutes=1)
    command_executions[f"{command_name}_{user_id}"] = [
        exec_data for exec_data in command_executions[f"{command_name}_{user_id}"]
        if exec_data['timestamp'] > cutoff_time
    ]

def check_command_spam(command_name, user_id, threshold=3, window_minutes=1):
    """Verifica se o comando está sendo spamado"""
    executions = command_executions[f"{command_name}_{user_id}"]
    cutoff_time = datetime.now() - timedelta(minutes=window_minutes)
    
    recent_executions = [
        exec_data for exec_data in executions
        if exec_data['timestamp'] > cutoff_time
    ]
    
    return len(recent_executions) >= threshold

# ================= UTILITÁRIOS DE ECONOMIA =================
def calculate_level_from_xp(xp):
    """Calcula o nível baseado no XP"""
    if xp < 100:
        return 1
    
    # Fórmula: level = sqrt(xp / 100)
    import math
    return int(math.sqrt(xp / 100)) + 1

def calculate_xp_for_level(level):
    """Calcula XP necessário para um nível"""
    if level <= 1:
        return 0
    return (level - 1) ** 2 * 100

def format_money(amount):
    """Formata valores monetários"""
    if amount >= 1_000_000:
        return f"{amount / 1_000_000:.1f}M"
    elif amount >= 1_000:
        return f"{amount / 1_000:.1f}K"
    else:
        return f"{amount:,}"

def generate_work_result():
    """Gera resultado aleatório de trabalho"""
    jobs = [
        {"name": "🍕 Entregou pizzas", "pay": (50, 150), "emoji": "🍕"},
        {"name": "🚗 Dirigiu para o Uber", "pay": (80, 200), "emoji": "🚗"},
        {"name": "💻 Programou um sistema", "pay": (200, 500), "emoji": "💻"},
        {"name": "🏥 Atendeu pacientes", "pay": (300, 800), "emoji": "🏥"},
        {"name": "👮‍♂️ Patrulhou a cidade", "pay": (150, 400), "emoji": "👮‍♂️"},
        {"name": "🎭 Fez uma apresentação", "pay": (100, 300), "emoji": "🎭"},
        {"name": "🏗️ Construiu um prédio", "pay": (250, 600), "emoji": "🏗️"},
        {"name": "📚 Deu aulas", "pay": (120, 350), "emoji": "📚"},
        {"name": "🍳 Cozinhou no restaurante", "pay": (90, 250), "emoji": "🍳"},
    ]
    
    job = random.choice(jobs)
    payment = random.randint(*job["pay"])
    
    return {
        "description": job["name"],
        "payment": payment,
        "emoji": job["emoji"]
    }

# ================= UTILITÁRIOS DE TEMPO =================
def format_time_delta(seconds):
    """Formata diferença de tempo em formato legível"""
    if seconds < 60:
        return f"{int(seconds)}s"
    elif seconds < 3600:
        return f"{int(seconds // 60)}m {int(seconds % 60)}s"
    elif seconds < 86400:
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        return f"{hours}h {minutes}m"
    else:
        days = int(seconds // 86400)
        hours = int((seconds % 86400) // 3600)
        return f"{days}d {hours}h"

def get_time_until_reset(last_time_str, cooldown_seconds):
    """Calcula tempo até reset de cooldown"""
    if not last_time_str:
        return 0
    
    try:
        last_time = datetime.fromisoformat(last_time_str.replace('Z', '+00:00'))
        if last_time.tzinfo is None:
            last_time = last_time.replace(tzinfo=timezone.utc)
        
        now = datetime.now(timezone.utc)
        elapsed = (now - last_time).total_seconds()
        
        return max(0, cooldown_seconds - elapsed)
    except:
        return 0

# ================= UTILITÁRIOS DE TEXTO =================
def truncate_text(text, max_length=100, suffix="..."):
    """Trunca texto se for muito longo"""
    if len(text) <= max_length:
        return text
    return text[:max_length - len(suffix)] + suffix

def clean_text(text):
    """Remove caracteres especiais do texto"""
    import re
    return re.sub(r'[^\w\s-]', '', text).strip()

def generate_random_color():
    """Gera cor hexadecimal aleatória"""
    return random.randint(0, 0xFFFFFF)

# ================= UTILITÁRIOS DE VALIDAÇÃO =================
def is_valid_url(url):
    """Verifica se uma URL é válida"""
    import re
    url_pattern = re.compile(
        r'^https?://'  # http:// or https://
        r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|'  # domain...
        r'localhost|'  # localhost...
        r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  # ...or ip
        r'(?::\d+)?'  # optional port
        r'(?:/?|[/?]\S+)$', re.IGNORECASE)
    return url_pattern.match(url) is not None

def is_valid_discord_id(user_id):
    """Verifica se um ID do Discord é válido"""
    try:
        id_int = int(user_id)
        return 17 <= len(str(id_int)) <= 19  # Discord IDs têm entre 17-19 dígitos
    except:
        return False

# ================= UTILITÁRIOS DE EMBED =================
def create_error_embed(title, description):
    """Cria embed de erro padronizado"""
    import discord
    embed = discord.Embed(
        title=f"❌ {title}",
        description=description,
        color=0xff0000
    )
    return embed

def create_success_embed(title, description):
    """Cria embed de sucesso padronizado"""
    import discord
    embed = discord.Embed(
        title=f"✅ {title}",
        description=description,
        color=0x00ff00
    )
    return embed

def create_info_embed(title, description, color=0x3498db):
    """Cria embed informativo padronizado"""
    import discord
    embed = discord.Embed(
        title=f"ℹ️ {title}",
        description=description,
        color=color
    )
    return embed

# ================= UTILITÁRIOS DE RANKINGS =================
def create_money_leaderboard(users_data, limit=10):
    """Cria ranking de dinheiro"""
    sorted_users = sorted(users_data, key=lambda x: x.get('money', 0) + x.get('bank', 0), reverse=True)
    return sorted_users[:limit]

def create_level_leaderboard(users_data, limit=10):
    """Cria ranking de level"""
    sorted_users = sorted(users_data, key=lambda x: x.get('level', 1), reverse=True)
    return sorted_users[:limit]

def create_rep_leaderboard(users_data, limit=10):
    """Cria ranking de reputação"""
    sorted_users = sorted(users_data, key=lambda x: x.get('rep', 0), reverse=True)
    return sorted_users[:limit]

# ================= UTILITÁRIOS DE API =================
async def fetch_url(url, headers=None, timeout=10):
    """Faz requisição HTTP assíncrona"""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url, headers=headers, timeout=timeout) as response:
                if response.status == 200:
                    return await response.json()
                else:
                    logger.error(f"HTTP Error {response.status} para {url}")
                    return None
    except asyncio.TimeoutError:
        logger.error(f"Timeout na requisição para {url}")
        return None
    except Exception as e:
        logger.error(f"Erro na requisição para {url}: {e}")
        return None

# ================= UTILITÁRIOS DE CACHE =================
class SimpleCache:
    def __init__(self, max_size=1000, ttl=300):
        self.cache = {}
        self.timestamps = {}
        self.max_size = max_size
        self.ttl = ttl  # Time to live in seconds
    
    def get(self, key):
        if key not in self.cache:
            return None
        
        # Check if expired
        if time.time() - self.timestamps[key] > self.ttl:
            self.delete(key)
            return None
        
        return self.cache[key]
    
    def set(self, key, value):
        # Clean up if cache is too big
        if len(self.cache) >= self.max_size:
            oldest_key = min(self.timestamps.keys(), key=lambda k: self.timestamps[k])
            self.delete(oldest_key)
        
        self.cache[key] = value
        self.timestamps[key] = time.time()
    
    def delete(self, key):
        self.cache.pop(key, None)
        self.timestamps.pop(key, None)
    
    def clear(self):
        self.cache.clear()
        self.timestamps.clear()

# Instância global do cache
cache = SimpleCache()

# ================= UTILITÁRIOS DE MODERAÇÃO =================
def parse_time_string(time_str):
    """Converte string de tempo para segundos"""
    import re
    
    time_regex = re.compile(r'(\d+)([smhd])')
    matches = time_regex.findall(time_str.lower())
    
    total_seconds = 0
    for amount, unit in matches:
        amount = int(amount)
        if unit == 's':
            total_seconds += amount
        elif unit == 'm':
            total_seconds += amount * 60
        elif unit == 'h':
            total_seconds += amount * 3600
        elif unit == 'd':
            total_seconds += amount * 86400
    
    return total_seconds

def format_permissions(permissions):
    """Formata permissões do Discord"""
    perm_names = {
        'administrator': 'Administrador',
        'manage_guild': 'Gerenciar Servidor',
        'manage_channels': 'Gerenciar Canais',
        'manage_messages': 'Gerenciar Mensagens',
        'manage_roles': 'Gerenciar Cargos',
        'kick_members': 'Expulsar Membros',
        'ban_members': 'Banir Membros',
        'moderate_members': 'Moderar Membros',
    }
    
    active_perms = []
    for perm, has_perm in permissions:
        if has_perm and perm in perm_names:
            active_perms.append(perm_names[perm])
    
    return active_perms

# ================= UTILITÁRIOS DE FAMÍLIA =================
def generate_family_invite_code():
    """Gera código de convite para família"""
    import string
    characters = string.ascii_uppercase + string.digits
    return ''.join(random.choices(characters, k=8))

# ================= UTILITÁRIOS DE ESTATÍSTICAS =================
def calculate_activity_score(user_data):
    """Calcula pontuação de atividade do usuário"""
    score = 0
    
    # Baseado em dinheiro
    total_money = user_data.get('money', 0) + user_data.get('bank', 0)
    score += min(total_money / 1000, 50)  # Max 50 pontos
    
    # Baseado em level
    score += min(user_data.get('level', 1) * 2, 40)  # Max 40 pontos
    
    # Baseado em reputação
    score += min(user_data.get('rep', 0), 10)  # Max 10 pontos
    
    return min(int(score), 100)

# ================= CONSTANTES =================
WORK_COOLDOWN = 3600  # 1 hora
DAILY_COOLDOWN = 86400  # 24 horas
REP_COOLDOWN = 86400  # 24 horas

DEFAULT_EMBED_COLOR = 0x3498db
SUCCESS_COLOR = 0x00ff00
ERROR_COLOR = 0xff0000
WARNING_COLOR = 0xffff00
VIP_COLOR = 0x9b59b6

# Mensagens padrão
DEFAULT_MESSAGES = {
    'no_money': "❌ Você não possui dinheiro suficiente!",
    'cooldown_active': "⏰ Você precisa esperar {time} para usar este comando novamente.",
    'user_not_found': "❌ Usuário não encontrado!",
    'invalid_amount': "❌ Quantidade inválida!",
    'success': "✅ Operação realizada com sucesso!",
    'error': "❌ Ocorreu um erro. Tente novamente mais tarde.",
    'no_permission': "❌ Você não tem permissão para usar este comando!",
}

# ================= FUNÇÕES DE DEBUG =================
def debug_log(message, level="INFO"):
    """Log de debug com timestamp"""
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"[{timestamp}] [{level}] {message}")

def measure_performance(func):
    """Decorator para medir performance de funções"""
    import functools
    
    @functools.wraps(func)
    async def wrapper(*args, **kwargs):
        start_time = time.time()
        try:
            result = await func(*args, **kwargs)
            end_time = time.time()
            debug_log(f"Função {func.__name__} executada em {end_time - start_time:.3f}s", "PERF")
            return result
        except Exception as e:
            end_time = time.time()
            debug_log(f"Função {func.__name__} falhou após {end_time - start_time:.3f}s: {e}", "ERROR")
            raise
    
    return wrapper
