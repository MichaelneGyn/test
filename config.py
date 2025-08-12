import os
import logging
from pathlib import Path
from logging.handlers import RotatingFileHandler

# ================= CONFIGURAÇÕES GLOBAIS =================
TEST_MODE = False

# Configuração avançada de logging
def setup_logging():
    """Configura o sistema de logging"""
    logger = logging.getLogger('BotDebug')
    logger.setLevel(logging.DEBUG)
    
    # Handler para arquivo rotativo (máx 5MB, 3 backups)
    log_path = Path(__file__).parent / "bot_debug.log"
    file_handler = RotatingFileHandler(log_path, maxBytes=5*1024*1024, backupCount=3, encoding='utf-8')
    file_handler.setLevel(logging.DEBUG)
    
    # Handler para console
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    
    # Formatação detalhada
    detailed_formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(funcName)s:%(lineno)d - %(message)s'
    )
    file_handler.setFormatter(detailed_formatter)
    console_handler.setFormatter(detailed_formatter)
    
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)
    
    return logger

# Configuração do banco de dados
DB_PATH = Path(__file__).parent / "config.db"
CONFIG_DB_PATH = Path(__file__).parent / "perm_config.db"

# Garante que os arquivos de banco existem
try:
    DB_PATH.parent.mkdir(exist_ok=True, parents=True)
    if not DB_PATH.exists():
        with open(DB_PATH, 'w'): 
            pass
    if not CONFIG_DB_PATH.exists():
        with open(CONFIG_DB_PATH, 'w'): 
            pass
except Exception as e:
    print(f"Erro ao configurar banco de dados: {e}")
    # Fallback para local temporário
    DB_PATH = Path(os.getenv('TEMP', '/tmp')) / "bot_data_fallback.db"
    CONFIG_DB_PATH = Path(os.getenv('TEMP', '/tmp')) / "perm_config_fallback.db"
    print(f"Usando caminhos alternativos: {DB_PATH}, {CONFIG_DB_PATH}")

# Configurações do Discord
DISCORD_TOKEN = os.getenv('DISCORD_TOKEN')

# Configurações de economia
DAILY_MIN = 100
DAILY_MAX = 500
WORK_MIN = 50
WORK_MAX = 800

# Configurações de cooldown (em segundos)
COOLDOWNS = {
    'daily': 86400,  # 24 horas
    'work': 3600,    # 1 hora
    'rep': 86400,    # 24 horas
    'panel': 10,     # 10 segundos
}

# Configurações de limites
LIMITS = {
    'bio_length': 200,
    'family_name_length': 50,
    'max_warns': 5,
}

# URLs e APIs (para futuras integrações)
APIS = {
    'instagram': {
        'base_url': 'https://www.instagram.com/',
        'api_key': os.getenv('INSTAGRAM_API_KEY', 'default_key')
    },
    'tellonym': {
        'base_url': 'https://tellonym.me/',
        'api_key': os.getenv('TELLONYM_API_KEY', 'default_key')
    }
}

# Mensagens padrão
MESSAGES = {
    'no_permission': "❌ Você não tem permissão para usar este comando!",
    'cooldown': "⏰ Calma! Tente novamente em {:.1f} segundos.",
    'error': "❌ Ocorreu um erro interno. Tente novamente mais tarde.",
    'success': "✅ Operação realizada com sucesso!",
    'not_found': "❌ Não encontrado!",
}

# Cores para embeds
COLORS = {
    'success': 0x00ff00,
    'error': 0xff0000, 
    'warning': 0xffff00,
    'info': 0x3498db,
    'primary': 0x7289da,
    'vip': 0x9b59b6,
    'money': 0xf1c40f,
    'instagram': 0xe4405f,
    'tellonym': 0xff6b6b,
}

# Emojis padrão
EMOJIS = {
    'money': '💰',
    'bank': '🏦',
    'xp': '⭐',
    'level': '🏆',
    'rep': '⭐',
    'vip': '👑',
    'family': '👨‍👩‍👧‍👦',
    'warning': '⚠️',
    'success': '✅',
    'error': '❌',
    'loading': '⏳',
    'info': 'ℹ️',
}
