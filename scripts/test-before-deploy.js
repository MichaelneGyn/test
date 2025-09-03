#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

class PreDeployTester {
  constructor() {
    this.projectPath = path.join(__dirname, '..', 'project');
    this.testResults = [];
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      warning: '\x1b[33m',
      error: '\x1b[31m',
      reset: '\x1b[0m'
    };
    console.log(`${colors[type]}${message}${colors.reset}`);
  }

  async askQuestion(question) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      rl.question(question, (answer) => {
        rl.close();
        resolve(answer.toLowerCase().trim());
      });
    });
  }

  runCommand(command, cwd = this.projectPath) {
    try {
      const result = execSync(command, { 
        cwd, 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      return { success: true, output: result };
    } catch (error) {
      return { success: false, error: error.message, output: error.stdout };
    }
  }

  checkDependencies() {
    this.log('🔍 Verificando dependências...', 'info');
    
    const packageJsonPath = path.join(this.projectPath, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      this.testResults.push({ test: 'Dependencies', status: 'FAIL', message: 'package.json não encontrado' });
      return false;
    }

    const result = this.runCommand('npm audit --audit-level=high');
    if (result.success) {
      this.testResults.push({ test: 'Dependencies', status: 'PASS', message: 'Dependências seguras' });
      this.log('✅ Dependências verificadas', 'success');
      return true;
    } else {
      this.testResults.push({ test: 'Dependencies', status: 'WARN', message: 'Vulnerabilidades encontradas' });
      this.log('⚠️ Vulnerabilidades encontradas nas dependências', 'warning');
      return true; // Não bloqueia o deploy, apenas avisa
    }
  }

  testBuild() {
    this.log('🏗️ Testando build do projeto...', 'info');
    
    const result = this.runCommand('npm run build');
    if (result.success) {
      this.testResults.push({ test: 'Build', status: 'PASS', message: 'Build realizado com sucesso' });
      this.log('✅ Build realizado com sucesso', 'success');
      return true;
    } else {
      this.testResults.push({ test: 'Build', status: 'FAIL', message: result.error });
      this.log('❌ Falha no build: ' + result.error, 'error');
      return false;
    }
  }

  checkEnvironmentFiles() {
    this.log('🔧 Verificando arquivos de ambiente...', 'info');
    
    const envFiles = ['.env.example', '.env.staging'];
    let allFound = true;
    
    envFiles.forEach(file => {
      const filePath = path.join(this.projectPath, file);
      if (!fs.existsSync(filePath)) {
        this.log(`⚠️ Arquivo ${file} não encontrado`, 'warning');
        allFound = false;
      }
    });

    if (allFound) {
      this.testResults.push({ test: 'Environment Files', status: 'PASS', message: 'Arquivos de ambiente encontrados' });
      this.log('✅ Arquivos de ambiente verificados', 'success');
    } else {
      this.testResults.push({ test: 'Environment Files', status: 'WARN', message: 'Alguns arquivos de ambiente não encontrados' });
    }
    
    return true;
  }

  checkSquareCloudConfig() {
    this.log('☁️ Verificando configuração do SquareCloud...', 'info');
    
    const configPath = path.join(this.projectPath, 'squarecloud.app');
    if (!fs.existsSync(configPath)) {
      this.testResults.push({ test: 'SquareCloud Config', status: 'FAIL', message: 'squarecloud.app não encontrado' });
      this.log('❌ Arquivo squarecloud.app não encontrado', 'error');
      return false;
    }

    const config = fs.readFileSync(configPath, 'utf8');
    const requiredFields = ['MAIN', 'MEMORY', 'VERSION', 'START'];
    const missingFields = requiredFields.filter(field => !config.includes(field));
    
    if (missingFields.length === 0) {
      this.testResults.push({ test: 'SquareCloud Config', status: 'PASS', message: 'Configuração válida' });
      this.log('✅ Configuração do SquareCloud válida', 'success');
      return true;
    } else {
      this.testResults.push({ test: 'SquareCloud Config', status: 'FAIL', message: `Campos obrigatórios ausentes: ${missingFields.join(', ')}` });
      this.log(`❌ Campos obrigatórios ausentes: ${missingFields.join(', ')}`, 'error');
      return false;
    }
  }

  async runInteractiveTests() {
    this.log('\n🧪 Testes Interativos', 'info');
    this.log('Agora vamos testar o servidor localmente...', 'info');
    
    // Iniciar servidor em background
    this.log('🚀 Iniciando servidor local...', 'info');
    const serverProcess = this.runCommand('npm run dev &');
    
    // Aguardar um pouco para o servidor iniciar
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    this.log('\n📋 Checklist Manual de Testes:', 'info');
    this.log('1. Acesse http://localhost:3000', 'info');
    this.log('2. Teste o login com Discord', 'info');
    this.log('3. Verifique se o dashboard carrega', 'info');
    this.log('4. Teste a navegação entre páginas', 'info');
    this.log('5. Verifique a responsividade mobile', 'info');
    
    const testsPassed = await this.askQuestion('\n✅ Todos os testes manuais passaram? (s/n): ');
    
    if (testsPassed === 's' || testsPassed === 'sim') {
      this.testResults.push({ test: 'Manual Tests', status: 'PASS', message: 'Testes manuais aprovados' });
      return true;
    } else {
      this.testResults.push({ test: 'Manual Tests', status: 'FAIL', message: 'Testes manuais falharam' });
      return false;
    }
  }

  generateReport() {
    this.log('\n📊 RELATÓRIO DE TESTES PRÉ-DEPLOY', 'info');
    this.log('=' .repeat(50), 'info');
    
    let passCount = 0;
    let failCount = 0;
    let warnCount = 0;
    
    this.testResults.forEach(result => {
      const statusColor = {
        'PASS': 'success',
        'FAIL': 'error',
        'WARN': 'warning'
      }[result.status];
      
      this.log(`${result.status.padEnd(4)} | ${result.test.padEnd(20)} | ${result.message}`, statusColor);
      
      if (result.status === 'PASS') passCount++;
      else if (result.status === 'FAIL') failCount++;
      else if (result.status === 'WARN') warnCount++;
    });
    
    this.log('\n' + '=' .repeat(50), 'info');
    this.log(`✅ Passou: ${passCount} | ❌ Falhou: ${failCount} | ⚠️ Avisos: ${warnCount}`, 'info');
    
    return failCount === 0;
  }

  async run() {
    this.log('🚀 INICIANDO TESTES PRÉ-DEPLOY', 'info');
    this.log('=' .repeat(50), 'info');
    
    const tests = [
      () => this.checkDependencies(),
      () => this.checkEnvironmentFiles(),
      () => this.checkSquareCloudConfig(),
      () => this.testBuild()
    ];
    
    let allPassed = true;
    
    // Executar testes automáticos
    for (const test of tests) {
      const result = test();
      if (!result) allPassed = false;
    }
    
    // Se testes automáticos passaram, executar testes interativos
    if (allPassed) {
      const interactiveResult = await this.runInteractiveTests();
      if (!interactiveResult) allPassed = false;
    }
    
    // Gerar relatório
    const reportPassed = this.generateReport();
    
    if (reportPassed && allPassed) {
      this.log('\n🎉 TODOS OS TESTES PASSARAM!', 'success');
      this.log('✅ Projeto pronto para deploy', 'success');
      
      const shouldDeploy = await this.askQuestion('\n🚀 Deseja fazer o deploy agora? (s/n): ');
      if (shouldDeploy === 's' || shouldDeploy === 'sim') {
        this.log('🚀 Executando deploy...', 'info');
        const deployResult = this.runCommand('node ../scripts/deploy.js');
        if (deployResult.success) {
          this.log('✅ Deploy realizado com sucesso!', 'success');
        } else {
          this.log('❌ Falha no deploy: ' + deployResult.error, 'error');
        }
      }
    } else {
      this.log('\n❌ ALGUNS TESTES FALHARAM!', 'error');
      this.log('🔧 Corrija os problemas antes de fazer o deploy', 'warning');
      process.exit(1);
    }
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const tester = new PreDeployTester();
  tester.run().catch(console.error);
}

module.exports = PreDeployTester;