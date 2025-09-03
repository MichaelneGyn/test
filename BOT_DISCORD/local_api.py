from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from threading import Thread
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Permitir requisições do frontend

# Diretório para armazenar configurações
CONFIG_DIR = "config_data"
if not os.path.exists(CONFIG_DIR):
    os.makedirs(CONFIG_DIR)

def get_config_file_path(guild_id: str) -> str:
    """Retorna o caminho do arquivo de configuração para um servidor"""
    return os.path.join(CONFIG_DIR, f"{guild_id}.json")

def load_guild_config(guild_id: str) -> dict:
    """Carrega a configuração de um servidor"""
    config_file = get_config_file_path(guild_id)
    if os.path.exists(config_file):
        try:
            with open(config_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Erro ao carregar config do servidor {guild_id}: {e}")
    return {}

def save_guild_config(guild_id: str, config: dict) -> bool:
    """Salva a configuração de um servidor"""
    config_file = get_config_file_path(guild_id)
    try:
        with open(config_file, 'w', encoding='utf-8') as f:
            json.dump(config, f, indent=2, ensure_ascii=False)
        logger.info(f"✅ Configuração salva para servidor {guild_id}")
        return True
    except Exception as e:
        logger.error(f"❌ Erro ao salvar config do servidor {guild_id}: {e}")
        return False

@app.route('/test', methods=['GET'])
def health_check():
    """Endpoint para verificar se a API está funcionando"""
    return jsonify({
        'status': 'ok',
        'message': 'API local funcionando',
        'timestamp': str(os.times())
    })

@app.route('/api/config/<guild_id>', methods=['GET'])
def get_config(guild_id: str):
    """Buscar configuração de um servidor"""
    try:
        config = load_guild_config(guild_id)
        return jsonify({
            'success': True,
            'guild_id': guild_id,
            'config': config
        })
    except Exception as e:
        logger.error(f"Erro ao buscar config: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/config/<guild_id>/<section>', methods=['GET'])
def get_config_section(guild_id: str, section: str):
    """Buscar uma seção específica da configuração"""
    try:
        config = load_guild_config(guild_id)
        section_config = config.get(section, {})
        return jsonify({
            'success': True,
            'guild_id': guild_id,
            'section': section,
            'config': section_config
        })
    except Exception as e:
        logger.error(f"Erro ao buscar seção {section}: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/config/<guild_id>', methods=['POST'])
def save_config(guild_id: str):
    """Salvar configuração de um servidor"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'error': 'Dados não fornecidos'
            }), 400
        
        section = data.get('section')
        new_config = data.get('config')
        
        if not section or new_config is None:
            return jsonify({
                'success': False,
                'error': 'Seção e configuração são obrigatórias'
            }), 400
        
        # Carregar configuração existente
        current_config = load_guild_config(guild_id)
        
        # Atualizar a seção específica
        current_config[section] = new_config
        
        # Salvar configuração atualizada
        if save_guild_config(guild_id, current_config):
            logger.info(f"📝 Configuração atualizada: {guild_id}/{section}")
            return jsonify({
                'success': True,
                'guild_id': guild_id,
                'section': section,
                'message': 'Configuração salva com sucesso'
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Erro ao salvar configuração'
            }), 500
            
    except Exception as e:
        logger.error(f"Erro ao salvar config: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/guilds', methods=['GET'])
def list_guilds():
    """Lista todos os servidores configurados"""
    try:
        guilds = []
        if os.path.exists(CONFIG_DIR):
            for filename in os.listdir(CONFIG_DIR):
                if filename.endswith('.json'):
                    guild_id = filename[:-5]  # Remove .json
                    config = load_guild_config(guild_id)
                    guilds.append({
                        'id': guild_id,
                        'name': config.get('guild_name', f'Servidor {guild_id}'),
                        'config_sections': list(config.keys())
                    })
        
        return jsonify({
            'success': True,
            'guilds': guilds
        })
    except Exception as e:
        logger.error(f"Erro ao listar servidores: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/guilds/<guild_id>/channels', methods=['GET'])
def get_guild_channels(guild_id: str):
    """Busca os canais de um servidor específico"""
    try:
        # Importar bot aqui para evitar import circular
        from main import bot
        
        guild = bot.get_guild(int(guild_id))
        if not guild:
            return jsonify({
                'success': False,
                'error': 'Servidor não encontrado'
            }), 404
        
        channels = []
        for channel in guild.channels:
            if hasattr(channel, 'type'):
                channels.append({
                    'id': str(channel.id),
                    'name': channel.name,
                    'type': str(channel.type),
                    'category': channel.category.name if channel.category else None
                })
        
        return jsonify({
            'success': True,
            'channels': channels
        })
    except Exception as e:
        logger.error(f"Erro ao buscar canais do servidor {guild_id}: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/guilds/<guild_id>/log-channels', methods=['GET'])
def get_guild_log_channels(guild_id: str):
    """Busca canais que podem ser usados para logs baseado em padrões de nomes"""
    try:
        # Importar bot aqui para evitar import circular
        from main import bot
        
        guild = bot.get_guild(int(guild_id))
        if not guild:
            return jsonify({
                'success': False,
                'error': 'Servidor não encontrado'
            }), 404
        
        # Padrões comuns para canais de logs
        log_patterns = [
            'log', 'logs', 'audit', 'modlog', 'mod-log', 'moderacao', 'moderação',
            'banimento', 'banimentos', 'mute', 'mutes', 'expulsao', 'expulsão',
            'expulsoes', 'expulsões', 'advertencia', 'advertência', 'advertencias',
            'advertências', 'castigo', 'castigos', 'tempo-call', 'call-log',
            'mov-chat', 'movimento-chat', 'registro', 'verificacao', 'verificação',
            'instagram', 'migracao', 'migração', 'recrutamento', 'bio-checker'
        ]
        
        log_channels = []
        all_channels = []
        
        # Buscar todos os canais de texto
        for channel in guild.text_channels:
            channel_data = {
                'id': str(channel.id),
                'name': channel.name,
                'type': 'text',
                'category': channel.category.name if channel.category else None,
                'isLogChannel': False
            }
            
            # Verificar se o nome do canal contém algum padrão de log
            channel_name_lower = channel.name.lower()
            for pattern in log_patterns:
                if pattern in channel_name_lower:
                    channel_data['isLogChannel'] = True
                    log_channels.append(channel_data)
                    break
            
            all_channels.append(channel_data)
        
        return jsonify({
            'success': True,
            'logChannels': log_channels,
            'allChannels': all_channels,
            'detectedPatterns': len(log_channels)
        })
    except Exception as e:
        logger.error(f"Erro ao buscar canais de logs do servidor {guild_id}: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/guilds/<guild_id>/logs', methods=['GET'])
def get_guild_logs(guild_id: str):
    """Busca as logs recentes de um servidor específico"""
    try:
        # Importar bot aqui para evitar import circular
        from main import bot
        
        guild = bot.get_guild(int(guild_id))
        if not guild:
            return jsonify({
                'success': False,
                'error': 'Servidor não encontrado'
            }), 404
        
        # Por enquanto, retornar logs simuladas
        # Em uma implementação real, você buscaria de um banco de dados
        logs = [
            {
                'id': '1',
                'timestamp': '2024-01-15T10:30:00Z',
                'type': 'member_join',
                'user': 'Usuario#1234',
                'description': 'Membro entrou no servidor'
            },
            {
                'id': '2',
                'timestamp': '2024-01-15T10:25:00Z',
                'type': 'message_delete',
                'user': 'Moderador#5678',
                'description': 'Mensagem deletada no canal #geral'
            },
            {
                'id': '3',
                'timestamp': '2024-01-15T10:20:00Z',
                'type': 'voice_join',
                'user': 'Usuario#9999',
                'description': 'Entrou no canal de voz "Sala Geral"'
            }
        ]
        
        return jsonify({
            'success': True,
            'logs': logs
        })
    except Exception as e:
        logger.error(f"Erro ao buscar logs do servidor {guild_id}: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/bot/sync-guilds', methods=['POST'])
def sync_guilds():
    """Endpoint para receber sincronização de servidores do bot"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'error': 'Dados não fornecidos'
            }), 400
        
        guilds = data.get('guilds', [])
        logger.info(f"🔄 Sincronização recebida: {len(guilds)} servidores")
        
        # Processar cada servidor
        for guild in guilds:
            guild_id = guild.get('id')
            if guild_id:
                # Salvar dados básicos do servidor
                guild_config = {
                    'guild_name': guild.get('name', f'Servidor {guild_id}'),
                    'member_count': guild.get('member_count', 0),
                    'icon': guild.get('icon'),
                    'owner_id': guild.get('owner_id'),
                    'last_sync': guild.get('last_sync'),
                    'bot_present': guild.get('bot_present', True)
                }
                
                # Carregar configuração existente e atualizar
                existing_config = load_guild_config(guild_id)
                existing_config.update(guild_config)
                save_guild_config(guild_id, existing_config)
        
        return jsonify({
            'success': True,
            'message': f'Sincronização concluída: {len(guilds)} servidores processados',
            'processed_guilds': len(guilds)
        })
        
    except Exception as e:
        logger.error(f"Erro na sincronização de servidores: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

def start_api_server():
    """Inicia o servidor da API em uma thread separada"""
    try:
        logger.info("🚀 Iniciando API local na porta 3002...")
        app.run(host='127.0.0.1', port=3002, debug=False, use_reloader=False)
    except Exception as e:
        logger.error(f"❌ Erro ao iniciar API: {e}")

def run_api_in_background():
    """Executa a API em background"""
    api_thread = Thread(target=start_api_server, daemon=True)
    api_thread.start()
    logger.info("✅ API local iniciada em background")
    return api_thread

if __name__ == '__main__':
    start_api_server()