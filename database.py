import sqlite3
import logging
from pathlib import Path
from datetime import datetime
from config import DB_PATH, CONFIG_DB_PATH, TEST_MODE

# ================= SISTEMA ANTI-DUPLICAÇÃO DE COMANDOS =================
from discord.ext import commands

class SafeBot(commands.Bot):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._registered_commands = set()

    def safe_command(self, name: str, **kwargs):
        """Decorator seguro para comandos"""
        def decorator(func):
            if name in self._registered_commands:
                print(f'⚠️ Comando "{name}" já registrado. Ignorando duplicata.')
                return func
            self._registered_commands.add(name)
            return commands.command(name=name, **kwargs)(func)
        return decorator

# ================= BANCO DE DADOS =================
def get_db():
    """Retorna conexão com o banco de dados"""
    if TEST_MODE:
        return {
            'users': {},
            'warns': [],
            'families': [],
            'staff': []
        }
    
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON")
        return conn
    except sqlite3.Error as e:
        logging.error(f"Erro ao conectar ao banco de dados: {e}")
        raise

def init_db():
    """Inicializa o banco de dados principal"""
    if TEST_MODE:
        return
    
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
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (family_id) REFERENCES families(family_id) ON DELETE SET NULL
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
            active INTEGER DEFAULT 1,
            FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
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
            member_count INTEGER DEFAULT 1,
            FOREIGN KEY (leader_id) REFERENCES users(user_id) ON DELETE CASCADE
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
            points INTEGER DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
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
            PRIMARY KEY (server_id, user_id),
            FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
        )
        """)
        
        # Tabela de estatísticas de comandos
        conn.execute("""
        CREATE TABLE IF NOT EXISTS command_stats (
            command_name TEXT NOT NULL,
            user_id INTEGER NOT NULL,
            server_id INTEGER NOT NULL,
            timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
            success INTEGER DEFAULT 1
        )
        """)
        
        # Tabela de economia - trabalhos
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
        
        # Tabela de VIP
        conn.execute("""
        CREATE TABLE IF NOT EXISTS vip_users (
            user_id INTEGER PRIMARY KEY,
            vip_level INTEGER DEFAULT 1,
            expires_at TEXT,
            benefits TEXT,
            granted_by INTEGER,
            granted_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
        )
        """)
        
        # Índices para performance
        conn.execute("CREATE INDEX IF NOT EXISTS idx_users_money ON users (money DESC)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_users_level ON users (level DESC)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_warns_user ON warns (user_id)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_warns_server ON warns (server_id)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_families_leader ON families (leader_id)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_staff_server ON staff (server_id)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_pd_server ON primeira_dama (server_id)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_commands_user ON command_stats (user_id)")
        
        conn.commit()
        
        # Inserir trabalhos padrão se não existirem
        insert_default_jobs(conn)
        
        logging.info("✅ Banco de dados inicializado com sucesso")
        
    except sqlite3.Error as e:
        logging.error(f"❌ Erro ao inicializar banco de dados: {e}")
        raise
    finally:
        if 'conn' in locals():
            conn.close()

def init_perm_db():
    """Inicializa o banco de dados de permissões"""
    try:
        conn = sqlite3.connect(CONFIG_DB_PATH)
        conn.execute("""
        CREATE TABLE IF NOT EXISTS server_config (
            server_id INTEGER PRIMARY KEY,
            admin_role_id INTEGER DEFAULT NULL,
            mod_role_id INTEGER DEFAULT NULL,
            dono_bot_role_id INTEGER DEFAULT NULL,
            pd_role_id INTEGER DEFAULT NULL,
            prefix TEXT DEFAULT '!',
            welcome_channel INTEGER DEFAULT NULL,
            log_channel INTEGER DEFAULT NULL,
            auto_role INTEGER DEFAULT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
        """)
        conn.commit()
        conn.close()
        logging.info("✅ Banco de permissões inicializado")
    except sqlite3.Error as e:
        logging.error(f"❌ Erro ao inicializar banco de permissões: {e}")

def insert_default_jobs(conn):
    """Insere trabalhos padrão no banco"""
    default_jobs = [
        ("🍕 Entregador de Pizza", "🍕", 50, 150, "Entregue pizzas pela cidade", 3600, 1),
        ("🚗 Motorista Uber", "🚗", 80, 200, "Dirija passageiros pela cidade", 3600, 1),
        ("💻 Programador", "💻", 200, 500, "Desenvolva sistemas e aplicativos", 3600, 5),
        ("🏥 Médico", "🏥", 300, 800, "Cuide da saúde das pessoas", 3600, 10),
        ("👮‍♂️ Policial", "👮‍♂️", 150, 400, "Mantenha a ordem na cidade", 3600, 3),
        ("🎭 Artista", "🎭", 100, 300, "Crie arte e entretenimento", 3600, 2),
        ("🏗️ Engenheiro", "🏗️", 250, 600, "Construa e projete estruturas", 3600, 8),
        ("📚 Professor", "📚", 120, 350, "Ensine e eduque pessoas", 3600, 4),
        ("🍳 Chef", "🍳", 90, 250, "Prepare deliciosas refeições", 3600, 2),
        ("💼 Empresário", "💼", 500, 1200, "Gerencie seu próprio negócio", 7200, 15),
    ]
    
    try:
        for job in default_jobs:
            conn.execute("""
                INSERT OR IGNORE INTO jobs (name, emoji, min_pay, max_pay, description, cooldown, required_level)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, job)
        conn.commit()
        logging.info("✅ Trabalhos padrão inseridos")
    except sqlite3.Error as e:
        logging.error(f"❌ Erro ao inserir trabalhos padrão: {e}")

# ================= FUNÇÕES DE USUÁRIO =================
def create_user(user_id):
    """Cria um novo usuário no banco de dados"""
    if TEST_MODE:
        return
    
    conn = get_db()
    try:
        conn.execute("""
            INSERT OR IGNORE INTO users (user_id, created_at)
            VALUES (?, ?)
        """, (user_id, datetime.now().isoformat()))
        conn.commit()
    finally:
        conn.close()

def get_user_data(user_id):
    """Obtém dados de um usuário"""
    if TEST_MODE:
        return {'money': 0, 'bank': 0, 'rep': 0, 'xp': 0, 'level': 1}
    
    conn = get_db()
    try:
        user_data = conn.execute("""
            SELECT * FROM users WHERE user_id = ?
        """, (user_id,)).fetchone()
        
        if not user_data:
            create_user(user_id)
            return get_user_data(user_id)
        
        return dict(user_data)
    finally:
        conn.close()

def update_user_money(user_id, money_change, bank_change=0):
    """Atualiza o dinheiro de um usuário"""
    if TEST_MODE:
        return True
    
    conn = get_db()
    try:
        conn.execute("""
            UPDATE users 
            SET money = money + ?, bank = bank + ?
            WHERE user_id = ?
        """, (money_change, bank_change, user_id))
        conn.commit()
        return True
    except sqlite3.Error:
        return False
    finally:
        conn.close()

# ================= FUNÇÕES DE FAMÍLIA =================
def get_family_by_user(user_id):
    """Obtém a família de um usuário"""
    if TEST_MODE:
        return None
    
    conn = get_db()
    try:
        family = conn.execute("""
            SELECT f.* FROM families f
            JOIN users u ON f.family_id = u.family_id
            WHERE u.user_id = ?
        """, (user_id,)).fetchone()
        
        return dict(family) if family else None
    finally:
        conn.close()

def get_family_members(family_id):
    """Obtém membros de uma família"""
    if TEST_MODE:
        return []
    
    conn = get_db()
    try:
        members = conn.execute("""
            SELECT user_id FROM users WHERE family_id = ?
        """, (family_id,)).fetchall()
        
        return [member['user_id'] for member in members]
    finally:
        conn.close()

# ================= FUNÇÕES DE STAFF =================
def add_staff_points(user_id, points, category):
    """Adiciona pontos de staff"""
    if TEST_MODE:
        return
    
    conn = get_db()
    try:
        conn.execute("""
            INSERT OR REPLACE INTO staff (user_id, points)
            VALUES (?, COALESCE((SELECT points FROM staff WHERE user_id = ?), 0) + ?)
        """, (user_id, user_id, points))
        conn.commit()
        
        # Log da atividade
        conn.execute("""
            INSERT INTO command_stats (command_name, user_id, server_id)
            VALUES (?, ?, 0)
        """, (f"staff_{category}", user_id))
        conn.commit()
        
    finally:
        conn.close()

# ================= FUNÇÕES DE MODERAÇÃO =================
def add_warn(user_id, moderator_id, reason, server_id):
    """Adiciona uma advertência"""
    if TEST_MODE:
        return 1
    
    conn = get_db()
    try:
        cursor = conn.execute("""
            INSERT INTO warns (user_id, moderator_id, reason, server_id)
            VALUES (?, ?, ?, ?)
        """, (user_id, moderator_id, reason, server_id))
        
        warn_id = cursor.lastrowid
        conn.commit()
        return warn_id
        
    finally:
        conn.close()

def get_user_warns(user_id, server_id):
    """Obtém advertências ativas de um usuário"""
    if TEST_MODE:
        return []
    
    conn = get_db()
    try:
        warns = conn.execute("""
            SELECT * FROM warns 
            WHERE user_id = ? AND server_id = ? AND active = 1
            ORDER BY timestamp DESC
        """, (user_id, server_id)).fetchall()
        
        return [dict(warn) for warn in warns]
    finally:
        conn.close()

def remove_warn(warn_id):
    """Remove uma advertência"""
    if TEST_MODE:
        return True
    
    conn = get_db()
    try:
        conn.execute("""
            UPDATE warns SET active = 0 WHERE warn_id = ?
        """, (warn_id,))
        conn.commit()
        return True
    except:
        return False
    finally:
        conn.close()

# ================= VERIFICAÇÃO DE PERMISSÕES =================
async def check_admin(ctx):
    """Verifica se o usuário tem permissão de administrador"""
    if await ctx.bot.is_owner(ctx.author):
        return True
    
    if ctx.author.guild_permissions.administrator:
        return True
    
    conn = sqlite3.connect(CONFIG_DB_PATH)
    try:
        config = conn.execute(
            "SELECT admin_role_id, dono_bot_role_id FROM server_config WHERE server_id = ?",
            (ctx.guild.id,)
        ).fetchone()
        
        if config:
            admin_role = ctx.guild.get_role(config[0]) if config[0] else None
            dono_role = ctx.guild.get_role(config[1]) if config[1] else None
            return any(role in ctx.author.roles for role in [admin_role, dono_role] if role)
        
    finally:
        conn.close()
    
    return False

async def check_mod(ctx):
    """Verifica se o usuário tem permissão de moderador"""
    if await check_admin(ctx):
        return True
    
    conn = sqlite3.connect(CONFIG_DB_PATH)
    try:
        config = conn.execute(
            "SELECT mod_role_id FROM server_config WHERE server_id = ?",
            (ctx.guild.id,)
        ).fetchone()
        
        if config and config[0]:
            mod_role = ctx.guild.get_role(config[0])
            return mod_role in ctx.author.roles if mod_role else False
        
    finally:
        conn.close()
    
    return ctx.author.guild_permissions.manage_messages

# ================= LIMPEZA DO BANCO =================
def cleanup_old_data():
    """Remove dados antigos do banco"""
    if TEST_MODE:
        return
    
    conn = get_db()
    try:
        # Remove estatísticas de comandos antigas (mais de 30 dias)
        conn.execute("""
            DELETE FROM command_stats 
            WHERE datetime(timestamp) < datetime('now', '-30 days')
        """)
        
        # Remove warns inativos antigos (mais de 90 dias)
        conn.execute("""
            DELETE FROM warns 
            WHERE active = 0 AND datetime(timestamp) < datetime('now', '-90 days')
        """)
        
        conn.commit()
        logging.info("✅ Limpeza de dados antigos concluída")
        
    except sqlite3.Error as e:
        logging.error(f"❌ Erro na limpeza de dados: {e}")
    finally:
        conn.close()
