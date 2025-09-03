#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const archiver = require('archiver');

class SquareCloudDeployer {
  constructor(environment = 'production') {
    this.environment = environment;
    this.projectPath = path.join(__dirname, '..', 'project');
    this.deployPath = path.join(__dirname, '..', 'deploy');
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    
    // Configurações por ambiente
    this.envConfig = {
      staging: {
        appId: process.env.SQUARECLOUD_STAGING_APP_ID,
        subdomain: 'mdbot-staging',
        displayName: 'MDBot Dashboard - STAGING',
        description: 'Dashboard administrativo para Discord Bot - Ambiente de Teste',
        buildCommand: 'build:staging'
      },
      production: {
        appId: process.env.SQUARECLOUD_APP_ID,
        subdomain: 'mdbot-dashboard',
        displayName: 'MDBot Dashboard',
        description: 'Dashboard administrativo para Discord Bot',
        buildCommand: 'build'
      }
    };
    
    this.config = this.envConfig[environment];
    if (!this.config) {
      throw new Error(`Ambiente '${environment}' não suportado. Use: staging ou production`);
    }
  }

  async deploy() {
    try {
      console.log('🚀 Iniciando deploy para SquareCloud...');
      
      // 1. Verificar se o projeto existe
      if (!fs.existsSync(this.projectPath)) {
        throw new Error('Pasta do projeto não encontrada!');
      }

      // 2. Instalar dependências
      console.log('📦 Instalando dependências...');
      execSync('npm ci', { cwd: this.projectPath, stdio: 'inherit' });

      // 3. Build do projeto
      console.log(`🔨 Fazendo build do projeto para ${this.environment}...`);
      execSync(`npm run ${this.config.buildCommand}`, { cwd: this.projectPath, stdio: 'inherit' });

      // 4. Criar pasta de deploy
      if (!fs.existsSync(this.deployPath)) {
        fs.mkdirSync(this.deployPath, { recursive: true });
      }

      // 5. Criar ZIP para deploy
      const zipPath = await this.createDeployZip();
      console.log(`📦 Pacote criado: ${zipPath}`);

      // 6. Deploy usando SquareCloud CLI (se disponível)
      await this.deployToSquareCloud(zipPath);

      console.log(`✅ Deploy para ${this.environment} concluído com sucesso!`);
      
      if (this.environment === 'staging') {
        console.log(`🔗 URL de teste: https://${this.config.subdomain}.squareweb.app`);
      } else {
        console.log(`🔗 URL de produção: https://${this.config.subdomain}.squareweb.app`);
      }
      
    } catch (error) {
      console.error('❌ Erro durante o deploy:', error.message);
      process.exit(1);
    }
  }

  async createDeployZip() {
    return new Promise((resolve, reject) => {
      const zipPath = path.join(this.deployPath, `mdbot-${this.environment}-${this.timestamp}.zip`);
      const output = fs.createWriteStream(zipPath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      output.on('close', () => {
        console.log(`📦 Arquivo ZIP criado: ${archive.pointer()} bytes`);
        resolve(zipPath);
      });

      archive.on('error', (err) => {
        reject(err);
      });

      archive.pipe(output);

      // Criar configuração específica do ambiente
      this.createEnvironmentConfig();

      // Adicionar arquivos necessários para o deploy (otimizado)
      const filesToInclude = [
        'dist',
        'server.js',
        'package.json',
        'package-lock.json',
        `squarecloud.${this.environment}.app`,
        '.env.production'
      ];

      filesToInclude.forEach(file => {
        const filePath = path.join(this.projectPath, file);
        if (fs.existsSync(filePath)) {
          const stat = fs.statSync(filePath);
          if (stat.isDirectory()) {
            archive.directory(filePath, file);
          } else {
            // Renomear arquivo de config para squarecloud.app no ZIP
            const archiveName = file.includes('squarecloud.') ? 'squarecloud.app' : file;
            archive.file(filePath, { name: archiveName });
          }
        }
      });

      archive.finalize();
    });
  }

  createEnvironmentConfig() {
    // Usar arquivo de configuração pré-existente
    const configFile = `squarecloud.${this.environment}.app`;
    const configPath = path.join(this.projectPath, configFile);
    
    if (!fs.existsSync(configPath)) {
      const configContent = `MAIN=server.js
MEMORY=512
VERSION=recommended
DISPLAY_NAME=${this.config.displayName}
DESCRIPTION=${this.config.description}
SUBDOMAIN=${this.config.subdomain}
AUTO_RESTART=true
START=npm install --production --no-audit --no-fund && npm run build:${this.environment} && npm start`;
      
      fs.writeFileSync(configPath, configContent);
      console.log(`⚙️ Configuração criada para ${this.environment}`);
    } else {
      console.log(`⚙️ Usando configuração existente para ${this.environment}`);
    }
  }

  async deployToSquareCloud(zipPath) {
    try {
      // Verificar se o CLI do SquareCloud está instalado
      execSync('squarecloud --version', { stdio: 'pipe' });
      
      const appId = this.config.appId;
      if (!appId) {
        console.log(`⚠️  SQUARECLOUD_${this.environment.toUpperCase()}_APP_ID não configurado. Deploy manual necessário.`);
        console.log(`📁 Arquivo ZIP disponível em: ${zipPath}`);
        console.log(`💡 Configure a variável de ambiente ou faça upload manual no painel do SquareCloud.`);
        return;
      }

      console.log(`🌐 Fazendo deploy para SquareCloud (${this.environment})...`);
      execSync(`squarecloud deploy "${zipPath}" --app-id ${appId} --wait`, { stdio: 'inherit', timeout: 300000 });
      
    } catch (error) {
      console.log('⚠️  SquareCloud CLI não encontrado ou erro no deploy automático.');
      console.log(`📁 Arquivo ZIP disponível em: ${zipPath}`);
      console.log('💡 Faça upload manual no painel do SquareCloud.');
      if (error.message && !error.message.includes('squarecloud')) {
        console.log(`❌ Erro: ${error.message}`);
      }
    }
  }
}

// Executar deploy se chamado diretamente
if (require.main === module) {
  const environment = process.argv[2] || 'production';
  
  if (!['staging', 'production'].includes(environment)) {
    console.error('❌ Ambiente inválido. Use: staging ou production');
    console.log('\n📖 Uso:');
    console.log('  node deploy.js staging     # Deploy para ambiente de teste');
    console.log('  node deploy.js production  # Deploy para produção');
    console.log('  node deploy.js             # Deploy para produção (padrão)');
    process.exit(1);
  }
  
  console.log(`🎯 Iniciando deploy para ambiente: ${environment}`);
  const deployer = new SquareCloudDeployer(environment);
  deployer.deploy();
}

module.exports = SquareCloudDeployer;