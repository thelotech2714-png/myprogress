# 🚀 Instalação do MyProgress com Firebase

## Pré-requisitos Obrigatórios

### 1. Instalar Node.js
```bash
# Baixe e instale o Node.js 18+ de:
# https://nodejs.org/pt-br/download/

# Ou use Chocolatey (Windows):
choco install nodejs

# Ou use Winget (Windows 11+):
winget install OpenJS.NodeJS
```

### 2. Instalar Git
```bash
# Baixe e instale o Git de:
# https://git-scm.com/download/win

# Ou use Chocolatey:
choco install git

# Ou use Winget:
winget install Git.Git
```

### 3. Configurar Firebase
```bash
# O projeto já está configurado com Firebase
# Project ID: myprogress-b715e
# Não precisa instalar PostgreSQL!
```

## Passo a Passo

### 1. Verificar Instalações
```bash
# Verificar Node.js
node -v
npm -v

# Verificar Git
git --version
```

### 2. Configurar Firebase Admin SDK
```bash
# No diretório backend
cd backend

# Criar arquivo .env com as chaves do Firebase
cp .env.example .env

# Configurar variáveis de ambiente (veja abaixo)
```

### 3. Instalar Dependências do Backend
```bash
cd backend
npm install
```

### 4. Configurar Variáveis de Ambiente (.env)
```env
# Firebase Admin SDK
FIREBASE_PROJECT_ID=myprogress-b715e
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@myprogress-b715e.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nSUA_CHAVE_PRIVADA_AQUI\n-----END PRIVATE KEY-----\n"

# JWT
JWT_SECRET=myprogress_super_secret_key

# PIX (simulação)
PIX_API_BASE=https://api.pix.example.com
PIX_TOKEN=your_pix_token

# Email (opcional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# WhatsApp (opcional)
WHATSAPP_API_TOKEN=your_token
WHATSAPP_PHONE_NUMBER=5511999999999

# Gemini AI (já configurado)
GEMINI_API_KEY=AIzaSyAgbdvM_hgD646UovY06R6cK2A5ap6cAeg

# Server
PORT=5000
NODE_ENV=development
```

### 5. Obter Chave do Firebase Admin SDK

1. Vá para: https://console.firebase.google.com/project/myprogress-b715e/settings/serviceaccounts
2. Clique em "Generate new private key"
3. Baixe o arquivo JSON
4. Copie o conteúdo para o .env:
   - `clientEmail` → FIREBASE_CLIENT_EMAIL
   - `privateKey` → FIREBASE_PRIVATE_KEY

### 6. Iniciar Backend
```bash
# No diretório backend
npm run dev

# Backend vai rodar em: http://localhost:5000
```

### 7. Instalar Dependências do Frontend
```bash
# Voltar para raiz
cd ..

# Instalar dependências
npm install
```

### 8. Iniciar Frontend
```bash
npm run dev

# Frontend vai rodar em: http://localhost:5173
```

## Acessar o Sistema

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Info**: http://localhost:5000/api
- **Firebase Console**: https://console.firebase.google.com/project/myprogress-b715e

## Estrutura de Dados no Firebase Firestore

### Coleções Principais
- **users** - Dados dos usuários
- **instructors** - Dados dos instrutores
- **students** - Dados dos alunos
- **plans** - Planos de treino
- **subscriptions** - Assinaturas
- **payments** - Pagamentos
- **financial_history** - Histórico financeiro
- **expenses** - Despesas
- **alerts** - Alertas
- **workouts** - Treinos

## Criar Usuário Demo (Manualmente)

### 1. Criar usuário no Firebase Auth
```bash
# Via Firebase Console > Authentication > Add user
Email: instructor@test.com
Senha: 123456
UID: (gerado automaticamente)
```

### 2. Criar documento no Firestore
```javascript
// No Firebase Console > Firestore Database
// Coleção: users
// Document ID: UID do usuário criado

{
  name: "Instrutor Demo",
  email: "instructor@test.com",
  phone: "11999999999",
  role: "instructor",
  is_active: true,
  created_at: timestamp,
  updated_at: timestamp
}
```

### 3. Criar documento do instrutor
```javascript
// Coleção: instructors
// Document ID: auto

{
  user_id: "UID_DO_USUARIO",
  cpf: "12345678900",
  pix_key: "chave_pix_teste@email.com",
  bank_name: "Banco Teste",
  commission_rate: 0.00,
  monthly_fee: 29.90,
  is_trial: true,
  trial_end_date: timestamp,
  created_at: timestamp
}
```

## Testar Sistema

1. **Acessar**: http://localhost:5173
2. **Login**: instructor@test.com / 123456
3. **Dashboard**: Ver dados financeiros
4. **Alunos**: Gerenciar alunos
5. **PIX**: Gerar cobranças

## Vantagens do Firebase

✅ **Sem instalação de banco de dados**
✅ **Scalability automática**
✅ **Real-time updates**
✅ **Offline support**
✅ **Segurança integrada**
✅ **Backup automático**

## Problemas Comuns

### "npm não é reconhecido"
- **Solução**: Instalar Node.js primeiro
- **Link**: https://nodejs.org/pt-br/download/

### "git não é reconhecido"  
- **Solução**: Instalar Git
- **Link**: https://git-scm.com/download/win

### Erro de permissão Firebase
- **Solução**: Configurar regras no Firestore
- **Arquivo**: firestore.rules (já configurado)

### Erro de chave privada
- **Solução**: Gerar nova chave no Firebase Console
- **Caminho**: Project Settings > Service Accounts

## Deploy

### Backend (Render/Vercel)
- Configurar variáveis de ambiente
- Build: `npm install`
- Start: `npm start`

### Frontend (Vercel/Netlify)
- Build: `npm run build`
- Output: `dist`

### Firebase Hosting
```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Deploy
firebase deploy --only hosting
```

---

## Suporte

Se tiver problemas:
1. Verifique se Node.js está instalado: `node -v`
2. Confirme as chaves do Firebase no .env
3. Verifique as regras do Firestore
4. Reinicie os servidores após configurar .env
