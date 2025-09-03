interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  email?: string;
  verified?: boolean;
}

interface DiscordGuild {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
  features: string[];
  approximate_member_count?: number;
}

class DiscordAuthService {
  private clientId = import.meta.env.VITE_DISCORD_CLIENT_ID || 'your_discord_client_id';
  private redirectUri = import.meta.env.VITE_DISCORD_REDIRECT_URI || `${window.location.origin}/auth/callback`;
  private scope = 'identify email guilds';

  // Inicia o processo de autenticação OAuth2
  initiateAuth(): void {
    const authUrl = new URL('https://discord.com/api/oauth2/authorize');
    authUrl.searchParams.set('client_id', this.clientId);
    authUrl.searchParams.set('redirect_uri', this.redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', this.scope);
    authUrl.searchParams.set('state', this.generateState());
    
    window.location.href = authUrl.toString();
  }

  // Gera um estado aleatório para segurança
  private generateState(): string {
    const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('discord_oauth_state', state);
    return state;
  }

  // Verifica o estado retornado
  private verifyState(state: string): boolean {
    const savedState = localStorage.getItem('discord_oauth_state');
    localStorage.removeItem('discord_oauth_state');
    return savedState === state;
  }

  // Troca o código por um token de acesso
  async exchangeCodeForToken(code: string, state: string): Promise<string> {
    if (!this.verifyState(state)) {
      throw new Error('Estado inválido');
    }

    const response = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: import.meta.env.VITE_DISCORD_CLIENT_SECRET || 'your_discord_client_secret',
        grant_type: 'authorization_code',
        code,
        redirect_uri: this.redirectUri,
      }),
    });

    if (!response.ok) {
      throw new Error('Falha ao obter token de acesso');
    }

    const data = await response.json();
    return data.access_token;
  }

  // Obtém informações do usuário
  async getUserInfo(accessToken: string): Promise<DiscordUser> {
    const response = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao obter informações do usuário');
    }

    return response.json();
  }

  // Obtém servidores do usuário
  async getUserGuilds(accessToken: string): Promise<DiscordGuild[]> {
    const response = await fetch('https://discord.com/api/users/@me/guilds', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao obter servidores do usuário');
    }

    return response.json();
  }

  // Gera URL do avatar
  getAvatarUrl(userId: string, avatarHash: string | null, size: number = 128): string {
    if (!avatarHash) {
      return `https://cdn.discordapp.com/embed/avatars/${parseInt(userId) % 5}.png`;
    }
    return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.${avatarHash.startsWith('a_') ? 'gif' : 'png'}?size=${size}`;
  }

  // Processa o callback de autenticação
  async handleAuthCallback(): Promise<{ user: DiscordUser; guilds: DiscordGuild[] }> {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');

    if (error) {
      throw new Error(`Erro de autenticação: ${error}`);
    }

    if (!code || !state) {
      throw new Error('Código ou estado ausente');
    }

    try {
      const accessToken = await this.exchangeCodeForToken(code, state);
      const [user, guilds] = await Promise.all([
        this.getUserInfo(accessToken),
        this.getUserGuilds(accessToken)
      ]);

      // Salva o token para uso futuro
      localStorage.setItem('discord_access_token', accessToken);
      
      return { user, guilds };
    } catch (error) {
      console.error('Erro no processo de autenticação:', error);
      throw error;
    }
  }

  // Verifica se o usuário está autenticado
  isAuthenticated(): boolean {
    return !!localStorage.getItem('discord_access_token');
  }

  // Faz logout
  logout(): void {
    localStorage.removeItem('discord_access_token');
  }
}

export const discordAuth = new DiscordAuthService();
export type { DiscordUser, DiscordGuild };