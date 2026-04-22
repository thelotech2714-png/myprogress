# Criar Usuário de Teste para MyProgress

## Opção 1: Via Firebase Console (Recomendado)

### 1. Acessar Firebase Console
- URL: https://console.firebase.google.com/project/myprogress-b715e
- Clique em "Authentication"

### 2. Criar Usuário
- Clique em "Add user"
- **Email**: instructor@test.com
- **Senha**: 123456
- Marque "Add user"

### 3. Criar Documento no Firestore
- Vá para "Firestore Database"
- Coleção: "users"
- Clique "Add document"
- Document ID: (deixe o Firebase gerar)
- Campos:
  ```json
  {
    "name": "Instrutor Demo",
    "email": "instructor@test.com", 
    "phone": "11999999999",
    "role": "instructor",
    "is_active": true,
    "firebase_uid": "UID_DO_USUARIO_CRIADO"
  }
  ```

### 4. Criar Documento do Instrutor
- Coleção: "instructors"
- Clique "Add document"
- Campos:
  ```json
  {
    "user_id": "ID_DO_DOCUMENTO_USERS",
    "firebase_uid": "UID_DO_USUARIO_CRIADO",
    "cpf": "12345678900",
    "pix_key": "chave_pix_teste@email.com",
    "bank_name": "Banco Teste",
    "commission_rate": 0.00,
    "monthly_fee": 29.90,
    "is_trial": true,
    "trial_end_date": "2024-12-31T23:59:59.000Z"
  }
  ```

## Opção 2: Configurar Firebase Admin SDK

### 1. Gerar Chave Privada
- Vá para: https://console.firebase.google.com/project/myprogress-b715e/settings/serviceaccounts
- Clique "Generate new private key"
- Baixe o arquivo JSON

### 2. Configurar .env
No arquivo `backend/.env`, atualize:
```env
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@myprogress-b715e.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nSUA_CHAVE_REAL_AQUI\n-----END PRIVATE KEY-----\n"
```

### 3. Reiniciar Backend
```bash
# Parar o backend (Ctrl+C)
# Iniciar novamente
cd backend
npm run dev
```

## Login no Sistema

Use as credenciais:
- **Email**: instructor@test.com
- **Senha**: 123456

## Acesso ao Sistema

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000

## Se Continuar com Erro

1. Verifique se o backend está rodando: `http://localhost:5000`
2. Verifique logs do console do navegador (F12)
3. Confirme se o usuário foi criado no Firebase Auth
4. Confirme se os documentos foram criados no Firestore
