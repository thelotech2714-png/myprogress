// Script de verificação e setup do sistema MyProgress
// Execute com: node setup-system.js (após instalar Node.js)

const fs = require('fs');
const path = require('path');

console.log('=== MYPROGRESS SYSTEM VERIFICATION ===\n');

// 1. Verificar estrutura de arquivos
console.log('1. Verificando estrutura de arquivos...');

const requiredFiles = [
  'package.json',
  'src/App.tsx',
  'src/firebase.ts',
  'backend/server.js',
  'backend/services/aiService.js',
  'backend/services/billingService.js',
  'backend/services/firebaseAdmin.js',
  'firebase-applet-config.json'
];

let filesOk = true;
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`  ${file}: OK`);
  } else {
    console.log(`  ${file}: MISSING`);
    filesOk = false;
  }
});

// 2. Verificar dependências
console.log('\n2. Verificando dependências...');

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const backendPackageJson = JSON.parse(fs.readFileSync('backend/package.json', 'utf8'));

console.log('  Frontend dependencies:');
Object.keys(packageJson.dependencies).forEach(dep => {
  console.log(`    ${dep}: ${packageJson.dependencies[dep]}`);
});

console.log('  Backend dependencies:');
Object.keys(backendPackageJson.dependencies).forEach(dep => {
  console.log(`    ${dep}: ${backendPackageJson.dependencies[dep]}`);
});

// 3. Verificar configuração Firebase
console.log('\n3. Verificando configuração Firebase...');

try {
  const firebaseConfig = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
  console.log('  Firebase config:');
  console.log(`    Project ID: ${firebaseConfig.projectId}`);
  console.log(`    API Key: ${firebaseConfig.apiKey ? 'Present' : 'Missing'}`);
  console.log(`    Auth Domain: ${firebaseConfig.authDomain}`);
} catch (error) {
  console.log('  Firebase config: ERROR -', error.message);
}

// 4. Verificar variáveis de ambiente necessárias
console.log('\n4. Variáveis de ambiente necessárias:');

const requiredEnvVars = [
  'GEMINI_API_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'FIREBASE_SERVICE_ACCOUNT_JSON'
];

requiredEnvVars.forEach(envVar => {
  const value = process.env[envVar];
  console.log(`  ${envVar}: ${value ? 'Present' : 'Missing'}`);
});

// 5. Criar arquivo .env.example se não existir
if (!fs.existsSync('.env.example')) {
  const envExample = `
# MyProgress Environment Variables
# Copie este arquivo para .env e preencha com seus valores

# Firebase
FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"your-project-id"}'

# Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# Stripe
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
STRIPE_SUBSCRIPTION_AMOUNT_CENTS=2990
STRIPE_SUBSCRIPTION_CURRENCY=brl

# App
APP_BASE_URL=http://localhost:5173
PORT=5000
`;

  fs.writeFileSync('.env.example', envExample.trim());
  console.log('\n5. Arquivo .env.example criado');
}

// 6. Resumo
console.log('\n=== RESUMO ===');
console.log(`Arquivos necessários: ${filesOk ? 'OK' : 'ERRO'}`);
console.log('Verifique as variáveis de ambiente acima');
console.log('\nPróximos passos:');
console.log('1. Instale Node.js (https://nodejs.org/)');
console.log('2. Copie .env.example para .env e preencha as variáveis');
console.log('3. Execute: npm install');
console.log('4. Execute: cd backend && npm install');
console.log('5. Execute: npm run dev (frontend)');
console.log('6. Execute: cd backend && npm start (backend)');
