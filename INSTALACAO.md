# 🚀 Instalação do MyProgress

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

### 3. Instalar PostgreSQL
```bash
# Baixe e instale o PostgreSQL de:
# https://www.postgresql.org/download/windows/

# Ou use Chocolatey:
choco install postgresql

# Ou use Docker:
docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:13
```

## Passo a Passo

### 1. Verificar Instalações
```bash
# Verificar Node.js
node -v
npm -v

# Verificar Git
git --version

# Verificar PostgreSQL
psql --version
```

### 2. Instalar Dependências do Backend
```bash
cd backend
npm install
```

### 3. Configurar Variáveis de Ambiente
```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar o arquivo .env com suas configurações
```

### 4. Criar Banco de Dados
```bash
# Conectar ao PostgreSQL
psql -U postgres

# Criar banco
CREATE DATABASE myprogress;

# Sair do psql (\q)
\q

# Importar schema
psql -U postgres -d myprogress -f database/schema.sql
```

### 5. Iniciar Backend
```bash
# No diretório backend
npm run dev

# Ou se não tiver script dev:
node server.js
```

### 6. Instalar Dependências do Frontend
```bash
# Voltar para raiz
cd ..

# Instalar dependências
npm install
```

### 7. Iniciar Frontend
```bash
npm run dev
```

## Acessar o Sistema

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Info**: http://localhost:5000/api

## Problemas Comuns

### "npm não é reconhecido"
- **Solução**: Instalar Node.js primeiro
- **Link**: https://nodejs.org/pt-br/download/

### "git não é reconhecido"  
- **Solução**: Instalar Git
- **Link**: https://git-scm.com/download/win

### "psql não é reconhecido"
- **Solução**: Instalar PostgreSQL e adicionar ao PATH
- **Link**: https://www.postgresql.org/download/windows/

### Erro de conexão PostgreSQL
```bash
# Verificar se o serviço está rodando
# Windows: Services > postgresql-x64-13

# Ou iniciar manualmente
net start postgresql-x64-13
```

## Configuração Rápida

### 1. .env (Backend)
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=myprogress
DB_USER=postgres
DB_PASSWORD=sua_senha
JWT_SECRET=seu_secret_key
```

### 2. Criar Usuário Demo
```sql
-- No psql
INSERT INTO users (name, email, password_hash, role) 
VALUES ('Instrutor Demo', 'instructor@test.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'instructor');

-- Pegar o ID do usuário criado
SELECT id FROM users WHERE email = 'instructor@test.com';

-- Inserir como instrutor
INSERT INTO instructors (user_id, cpf, pix_key) 
VALUES ('ID_DO_USUARIO', '12345678900', 'chave_pix_teste@email.com');
```

## Testar Sistema

1. **Acessar**: http://localhost:5173
2. **Login**: instructor@test.com / 123456
3. **Dashboard**: Ver dados financeiros
4. **Alunos**: Gerenciar alunos
5. **PIX**: Gerar cobranças

---

## Suporte

Se tiver problemas:
1. Verifique se Node.js está instalado: `node -v`
2. Verifique se PostgreSQL está rodando: Services > postgresql
3. Confirme as portas: 5173 (frontend) e 5000 (backend)
