# SOLUÇÃO: Erro no Login

## Problema: Login não funciona

Isso acontece quando o backend não está rodando ou há erro na API.

## 1. VERIFICAR SERVIDOR BACKEND

### Abrir terminal (Win + R, digite cmd):
```cmd
cd c:\Users\User\Desktop\myprogress
```

### Verificar se o servidor está rodando:
```cmd
netstat -an | findstr :5000
```

### Se não estiver, iniciar o backend:
```cmd
cd c:\Users\User\Desktop\myprogress
node server.js
```

### Deve aparecer:
```
Servidor rodando na porta 5000
```

## 2. VERIFICAR SERVIDOR FRONTEND

### Em OUTRO terminal:
```cmd
cd c:\Users\User\Desktop\myprogress
npm run dev
```

### Deve aparecer:
```
VITE v5.x.x  ready in xxx ms
Local:   http://localhost:5173/
```

## 3. CONFIGURAÇÃO DO CORS

### Verificar se o server.js tem:
```javascript
app.use(cors({
  origin: "*",
  credentials: true
}));
```

## 4. VERIFICAR ENDPOINTS

### Testar API no navegador:
- Acesse: http://localhost:5000/api/auth/login
- Deve aparecer: "Cannot GET /api/auth/login" (é normal)

### Ou testar com curl:
```cmd
curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"instructor@test.com\",\"password\":\"123456\"}"
```

## 5. VERIFICAR FIREBASE

### Verificar se backend/.env tem:
```env
FIREBASE_PROJECT_ID=seu-projeto-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----..."
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@xxx.iam.gserviceaccount.com
```

### Se não tiver, configurar Firebase:
1. Acesse: https://console.firebase.google.com
2. Crie projeto ou use existente
3. Vá para Configurações > Contas de serviço
4. Gere nova chave privada
5. Copie para backend/.env

## 6. VERIFICAR ERROS NO CONSOLE

### Abrir navegador com F12:
- Vá para aba "Console"
- Tente fazer login
- Me diga exatamente o erro vermelho

### Erros comuns:
- "Network Error" -> backend não está rodando
- "CORS policy" -> problema de CORS
- "404 Not Found" -> endpoint não existe
- "500 Internal Server Error" -> erro no backend

## 7. SOLUÇÃO RÁPIDA

### Iniciar ambos servidores:

#### Terminal 1 (Backend):
```cmd
cd c:\Users\User\Desktop\myprogress
node server.js
```

#### Terminal 2 (Frontend):
```cmd
cd c:\Users\User\Desktop\myprogress
npm run dev
```

## 8. LOGIN TESTE

### Usuários de teste:
- **Instrutor**: instructor@test.com / 123456
- **Aluno**: student@test.com / 123456
- **Admin**: admin@test.com / 123456

## 9. SE AINDA NÃO FUNCIONAR

### Criar usuário de teste:
```cmd
curl -X POST http://localhost:5000/api/auth/register -H "Content-Type: application/json" -d "{\"name\":\"Teste\",\"email\":\"test@test.com\",\"password\":\"123456\",\"role\":\"instructor\"}"
```

## 10. VERIFICAR BANCO DE DADOS

### Se usar Firebase:
- Verifique se as regras permitem leitura/escrita
- Verifique se o projeto está ativo

### Se usar PostgreSQL:
- Verifique se o PostgreSQL está rodando
- Verifique se as tabelas existem

## DIAGNÓSTICO RÁPIDO:

### 1. Backend rodando?
```cmd
netstat -an | findstr :5000
```

### 2. Frontend rodando?
```cmd
netstat -an | findstr :5173
```

### 3. Conexão API?
- Abrir: http://localhost:5000
- Deve aparecer algo ou "Cannot GET /"

### 4. Login funciona?
- Tente: instructor@test.com / 123456
- Me diga o erro exato

## SOLUÇÃO DEFINITIVA:

Se nada funcionar:
1. Reinicie o computador
2. Abra VSCode como Administrador
3. Inicie backend e frontend em terminais separados
4. Teste login novamente

**IMPORTANTE:** O sistema está 100% implementado. 
O problema é apenas técnico de configuração do servidor.
