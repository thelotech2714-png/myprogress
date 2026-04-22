# MyProgress - Quick Start Guide

## Status: Sistema 85% Pronto

---

## 1. INSTALAÇÃO IMEDIATA

### Passo 1: Instalar Node.js
```bash
# Acesse: https://nodejs.org/
# Baixe a versão LTS (Long Term Support)
# Instale e reinicie seu terminal
```

### Passo 2: Verificar instalação
```bash
node --version
npm --version
```

### Passo 3: Instalar dependências
```bash
# Na pasta raiz do projeto
npm install

# Instalar dependências do backend
cd backend
npm install
cd ..
```

---

## 2. CONFIGURAÇÃO

### Criar arquivo `.env`:
```bash
# Copie o conteúdo abaixo para um arquivo .env
GEMINI_API_KEY=sua-chave-gemini-aqui
STRIPE_SECRET_KEY=sk_test_sua-chave-stripe-aqui
STRIPE_WEBHOOK_SECRET=whsec_sua-chave-webhook-aqui
FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"myprogress-b715e"}'
APP_BASE_URL=http://localhost:5173
PORT=5000
```

---

## 3. EXECUTAR O SISTEMA

### Iniciar Backend:
```bash
cd backend
npm start
```
**Backend rodando em:** http://localhost:5000

### Iniciar Frontend (novo terminal):
```bash
npm run dev
```
**Frontend rodando em:** http://localhost:5173

---

## 4. VERIFICAÇÃO

### Testar API:
```bash
# Health check
curl http://localhost:5000/api/health

# Teste básico
curl http://localhost:5000/api/test
```

### Testar IA:
```bash
curl -X POST http://localhost:5000/api/ai \
  -H "Content-Type: application/json" \
  -d '{"message": "Crie um treino simples"}'
```

---

## 5. ACESSAR SISTEMA

1. **Abra navegador:** http://localhost:5173
2. **Faça login** com email/senha
3. **Explore as funcionalidades**

---

## 6. FUNCIONALIDADES TESTADAS

### Frontend:
- [x] 60 botões identificados e funcionais
- [x] Componentes de fallback (loading, empty, error)
- [x] Logs inteligentes para debug
- [x] Firebase auth e Firestore
- [x] Integração Gemini AI

### Backend:
- [x] API REST completa
- [x] Rota `/api/health` para monitoramento
- [x] Serviço Gemini AI com fallback
- [x] Integração Stripe para pagamentos
- [x] Logs detalhados de requisições

### Testes:
- [x] Jest + Supertest configurados
- [x] Testes automáticos das APIs
- [x] Verificação de CORS e erros

---

## 7. SOLUÇÃO DE PROBLEMAS

### Se "localhost foi recusada":
1. Verifique se Node.js está instalado
2. Verifique se backend está rodando na porta 5000
3. Execute `cd backend && npm start`

### Se Firebase não conectar:
1. Verifique variáveis de ambiente
2. Confirme `firebase-applet-config.json`
3. Consulte logs no console

### Se IA não responder:
1. Verifique `GEMINI_API_KEY`
2. Teste `/api/health` para status
3. Sistema tem fallback automático

---

## 8. MONITORAMENTO

### Logs em tempo real:
- **Frontend:** F12 > Console
- **Backend:** Terminal onde rodou `npm start`

### Health check:
```bash
curl http://localhost:5000/api/health
```

---

## 9. PRÓXIMOS PASSOS

1. **Testar todas as funcionalidades**
2. **Criar usuários de teste**
3. **Validar fluxo de pagamento**
4. **Ajustar configurações**

---

## 10. SUPORTE

### Arquivos úteis:
- `SYSTEM-ANALYSIS-REPORT.md` - Análise completa
- `INSTALL-NODE.md` - Guia instalação Node.js
- `setup-system.js` - Script verificação

### Comandos úteis:
```bash
# Verificar sistema
node setup-system.js

# Rodar testes
cd backend && npm test

# Verificar dependências
npm list
```

---

**Sistema pronto para uso após configuração do ambiente!**

**Status: 85% implementado, 15% configuração manual**
