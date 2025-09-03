const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// Função para copiar arquivos recursivamente
function copyRecursive(src, dest) {
  const stats = fs.statSync(src);
  
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    
    const files = fs.readdirSync(src);
    files.forEach(file => {
      const srcPath = path.join(src, file);
      const destPath = path.join(dest, file);
      copyRecursive(srcPath, destPath);
    });
  } else {
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(src, dest);
  }
}

// Função principal
function createSquareCloudPackage() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const packageName = `mdbot-squarecloud-${timestamp}`;
  const packageDir = path.join(__dirname, packageName);
  
  console.log('🚀 Criando pacote para SquareCloud...');
  
  // Criar diretório do pacote
  if (fs.existsSync(packageDir)) {
    fs.rmSync(packageDir, { recursive: true, force: true });
  }
  fs.mkdirSync(packageDir, { recursive: true });
  
  const sourceDir = path.join(__dirname, 'squarecloud-site-deploy-backup-2025-09-02-16-10-17');
  
  if (!fs.existsSync(sourceDir)) {
    console.error('❌ Pasta de backup não encontrada!');
    return;
  }
  
  console.log('📁 Copiando arquivos necessários...');
  
  // Arquivos essenciais para SquareCloud
  const essentialFiles = [
    'package.json',
    'server.js',
    'squarecloud.app',
    '.env',
    '.npmrc',
    'redirect-dashboard.html'
  ];
  
  essentialFiles.forEach(file => {
    const srcPath = path.join(sourceDir, file);
    const destPath = path.join(packageDir, file);
    
    if (fs.existsSync(srcPath)) {
      console.log(`  ✓ ${file}`);
      fs.copyFileSync(srcPath, destPath);
    } else {
      console.log(`  ⚠️ ${file} não encontrado`);
    }
  });
  
  // Copiar build de produção (dist)
  const distSrc = path.join(sourceDir, 'dist');
  const distDest = path.join(packageDir, 'dist');
  
  if (fs.existsSync(distSrc)) {
    console.log('  📂 dist/ (build de produção)');
    copyRecursive(distSrc, distDest);
  }
  
  // Verificar se server.js existe, se não, criar um básico
  const serverPath = path.join(packageDir, 'server.js');
  if (!fs.existsSync(serverPath)) {
    console.log('  🔧 Criando server.js básico...');
    const basicServer = `const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'dist')));

// Rota catch-all para SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(\`🚀 Servidor rodando na porta \${PORT}\`);
});`;
    fs.writeFileSync(serverPath, basicServer);
  }
  
  // Verificar se squarecloud.app existe, se não, criar um básico
  const squarecloudPath = path.join(packageDir, 'squarecloud.app');
  if (!fs.existsSync(squarecloudPath)) {
    console.log('  🔧 Criando squarecloud.app básico...');
    const basicConfig = `MAIN=server.js
MEMORY=512
VERSION=recommended
DISPLAY_NAME=MDBot Dashboard
DESCRIPTION=Dashboard do MDBot Discord
WEBSITE=https://mdbot.squarecloud.app
AUTO_RESTART=true
START=npm start`;
    fs.writeFileSync(squarecloudPath, basicConfig);
  }
  
  // Verificar package.json e adicionar scripts se necessário
  const packageJsonPath = path.join(packageDir, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }
    
    if (!packageJson.scripts.start) {
      packageJson.scripts.start = 'node server.js';
    }
    
    // Adicionar dependências essenciais se não existirem
    if (!packageJson.dependencies) {
      packageJson.dependencies = {};
    }
    
    if (!packageJson.dependencies.express) {
      packageJson.dependencies.express = '^4.18.2';
    }
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('  ✓ package.json atualizado');
  }
  
  // Criar arquivo ZIP
  console.log('\n📦 Criando arquivo ZIP...');
  
  const zipPath = path.join(__dirname, `${packageName}.zip`);
  const output = fs.createWriteStream(zipPath);
  const archive = archiver('zip', { zlib: { level: 9 } });
  
  return new Promise((resolve, reject) => {
    output.on('close', () => {
      const sizeInMB = (archive.pointer() / 1024 / 1024).toFixed(2);
      
      console.log('\n✅ Pacote SquareCloud criado com sucesso!');
      console.log(`📁 Pasta: ${packageName}/`);
      console.log(`📦 Arquivo: ${packageName}.zip (${sizeInMB} MB)`);
      console.log('\n🎯 Conteúdo do pacote:');
      console.log('   • Build de produção otimizado (dist/)');
      console.log('   • Servidor Express configurado');
      console.log('   • Configuração SquareCloud');
      console.log('   • Variáveis de ambiente');
      console.log('   • Dependências necessárias');
      console.log('\n🚀 Próximos passos:');
      console.log('   1. Faça upload do arquivo ZIP no SquareCloud');
      console.log('   2. Configure as variáveis de ambiente se necessário');
      console.log('   3. Inicie a aplicação');
      
      // Limpar pasta temporária
      fs.rmSync(packageDir, { recursive: true, force: true });
      console.log('\n🧹 Pasta temporária removida');
      
      resolve();
    });
    
    archive.on('error', reject);
    archive.pipe(output);
    archive.directory(packageDir, false);
    archive.finalize();
  });
}

// Executar
createSquareCloudPackage().catch(console.error);