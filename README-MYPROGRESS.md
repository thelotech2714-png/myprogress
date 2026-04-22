# MyProgress - Sistema de Gestão para Instrutores de Academia

Sistema completo de gestão financeira e acadêmica focado em pagamentos PIX para instrutores de academia no Brasil.

## Visão Geral

MyProgress é uma plataforma SaaS que permite instrutores de academia gerenciar seus alunos, planos, pagamentos e finanças com foco total em pagamentos via PIX.

## Arquitetura

### Backend (Node.js + PostgreSQL)
- **API REST** com Express.js
- **Banco de dados PostgreSQL** relacional
- **Autenticação JWT** com 3 níveis de usuário
- **Sistema PIX** com geração de QR Code
- **Webhooks** para confirmação de pagamento
- **Alertas automáticos** via WhatsApp e Email
- **Agendamento de tarefas** com node-cron

### Frontend (React)
- **React 19** com hooks modernos
- **TailwindCSS** para estilização
- **Recharts** para gráficos financeiros
- **Lucide React** para ícones
- **Context API** para gerenciamento de estado

## Estrutura do Projeto

```
myprogress/
|-- backend/
|   |-- config/
|   |   `-- database.js          # Configuração PostgreSQL
|   |-- middleware/
|   |   `-- auth.js              # Middleware de autenticação
|   |-- routes/
|   |   |-- auth.js              # Rotas de autenticação
|   |   |-- students.js          # Gestão de alunos
|   |   |-- financial.js         # Dashboard financeiro
|   |   |-- plans.js             # Planos e assinaturas
|   |   |-- alerts.js            # Sistema de alertas
|   |   `-- webhooks.js          # Webhooks PIX
|   |-- services/
|   |   |-- pixService.js        # Serviço PIX
|   |   `-- alertService.js      # Alertas automáticos
|   |-- database/
|   |   `-- schema.sql           # Schema completo do banco
|   `-- .env.example             # Variáveis de ambiente
|
|-- src/
|   |-- contexts/
|   |   `-- AuthContext.js       # Contexto de autenticação
|   |-- services/
|   |   `-- api.js               # Cliente API
|   |-- pages/
|   |   |-- Login.jsx            # Página de login
|   |   |-- Dashboard.jsx        # Dashboard principal
|   |   |-- Students.jsx         # Gestão de alunos
|   |   `-- Financial.jsx        # Dashboard financeiro
|   `-- App.jsx                  # Componente principal
```

## Níveis de Usuário

### 1. Admin
- Gestão completa da plataforma
- Visualização de todos os instrutores
- Relatórios globais

### 2. Instrutor (Cliente Pagante)
- Gestão de seus alunos
- Criação de planos
- Recebimento via PIX
- Dashboard financeiro
- Alertas automáticos

### 3. Aluno (Cliente Final)
- Visualização de seus dados
- Acompanhamento de treinos
- Pagamento via PIX

## Funcionalidades Principais

### Sistema Financeiro
- **Dashboard completo** com métricas em tempo real
- **Faturamento mensal** automático
- **Controle de despesas** categorizadas
- **Fluxo de caixa** detalhado
- **Relatórios de inadimplência**

### Sistema PIX
- **Geração automática** de QR Code PIX
- **Código copia e cola** dinâmico
- **Webhook** para confirmação de pagamento
- **Atualização automática** de status
- **Integração** com APIs de PIX (Mercado Pago, PagBank)

### Gestão de Alunos
- **Cadastro completo** com dados pessoais
- **Planos personalizados** (mensal, trimestral, etc.)
- **Controle de assinaturas** automáticas
- **Histórico de pagamentos**
- **Status em tempo real**

### Alertas Automáticos
- **Lembretes de vencimento** (3 dias antes)
- **Notificações de atraso** (diário)
- **Mensagens WhatsApp** personalizadas
- **Emails automáticos** configuráveis
- **Alertas de trial** para instrutores

## Schema do Banco de Dados

### Tabelas Principais
- **users** - Usuários do sistema
- **instructors** - Dados dos instrutores
- **students** - Dados dos alunos
- **plans** - Planos de treino
- **subscriptions** - Assinaturas dos alunos
- **payments** - Pagamentos e faturas
- **financial_history** - Histórico financeiro
- **expenses** - Despesas do instrutor
- **alerts** - Sistema de alertas
- **workouts** - Treinos personalizados

## API Endpoints

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro
- `GET /api/auth/verify` - Verificar token
- `PUT /api/auth/profile` - Atualizar perfil

### Alunos
- `GET /api/students` - Listar alunos
- `POST /api/students` - Criar aluno
- `GET /api/students/:id` - Detalhes do aluno
- `POST /api/students/:id/generate-pix` - Gerar PIX

### Financeiro
- `GET /api/financial/dashboard` - Dashboard financeiro
- `GET /api/financial/revenue` - Listar receitas
- `GET /api/financial/expenses` - Listar despesas
- `POST /api/financial/expenses` - Criar despesa
- `GET /api/financial/overdue-report` - Relatório de inadimplência

### Planos
- `GET /api/plans` - Listar planos
- `POST /api/plans` - Criar plano
- `PUT /api/plans/:id` - Atualizar plano
- `DELETE /api/plans/:id` - Excluir plano

### Alertas
- `GET /api/alerts` - Listar alertas
- `PUT /api/alerts/:id/read` - Marcar como lido
- `POST /api/alerts/manual` - Criar alerta manual

### Webhooks
- `POST /api/webhooks/pix` - Webhook PIX
- `POST /api/webhooks/pix/test` - Teste webhook

## Instalação

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Configurar variáveis de ambiente
npm run dev
```

### Frontend
```bash
npm install
npm run dev
```

### Banco de Dados
```bash
# Criar banco PostgreSQL
psql -U postgres -c "CREATE DATABASE myprogress;"

# Importar schema
psql -U postgres -d myprogress -f backend/database/schema.sql
```

## Configuração

### Variáveis de Ambiente (.env)
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=myprogress
DB_USER=postgres
DB_PASSWORD=password

# JWT
JWT_SECRET=your_secret_key

# PIX
PIX_API_BASE=https://api.pix.provider.com
PIX_TOKEN=your_pix_token

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# WhatsApp (opcional)
WHATSAPP_API_TOKEN=your_token
WHATSAPP_PHONE_NUMBER=5511999999999
```

## Fluxo de Pagamento PIX

1. **Geração da Cobrança**
   - Instrutor seleciona aluno pendente
   - Sistema gera QR Code PIX dinâmico
   - Código copia e cola disponível

2. **Pagamento do Aluno**
   - Aluno escaneia QR Code ou copia código
   - Realiza pagamento no app bancário
   - Banco processa transação

3. **Confirmação Automática**
   - Webhook recebe notificação do banco
   - Sistema atualiza status do pagamento
   - Assinatura do aluno é renovada
   - Histórico financeiro atualizado

4. **Alertas**
   - Confirmação enviada ao instrutor
   - Aluno recebe comprovante
   - Próximo pagamento agendado

## Mensagens Automáticas

### Lembrete de Vencimento
```
Fala, [Nome do Aluno]! 

Seu pagamento do plano [Plano] no valor de R$ [Valor] vence em [Data].

Para evitar atrasos, efetue o pagamento o quanto antes.

Qualquer dúvida, fale com seu instrutor [Nome do Instrutor]!
```

### Pagamento Atrasado
```
Olá, [Nome do Aluno]!

Seu pagamento do plano [Plano] no valor de R$ [Valor] está [Dias] dias atrasado.

Por favor, regularize sua situação o quanto possível para manter seu plano ativo.

Para gerar um novo PIX, entre em contato com [Nome do Instrutor].

Atenciosamente,
Equipe MyProgress
```

## Deploy

### Backend (Render/Vercel)
- Configurar variáveis de ambiente
- Build: `npm install`
- Start: `npm start`

### Frontend (Vercel/Netlify)
- Build: `npm run build`
- Output: `dist`

### Banco (Railway/Supabase)
- PostgreSQL 13+
- Configurar connection string
- Importar schema

## Monitoramento

### Métricas Importantes
- Taxa de conversão de pagamentos
- Tempo médio de confirmação PIX
- Índice de inadimplência
- Ticket médio por aluno
- Retenção de alunos

### Logs Essenciais
- Geração de cobranças PIX
- Confirmações de webhook
- Falhas de pagamento
- Alertas enviados

## Segurança

### Implementado
- JWT tokens com expiração
- Hash de senhas (bcrypt)
- Validação de inputs
- CORS configurado
- Rate limiting (recomendado)

### Recomendações
- HTTPS obrigatório
- Validar webhooks com assinatura
- Limitar tentativas de login
- Backup diário do banco
- Monitoramento de atividades suspeitas

## Suporte

### Documentação
- API docs: `/api` endpoint
- Schema completo em `backend/database/schema.sql`
- Exemplos de webhook em `backend/routes/webhooks.js`

### Contato
- Email: support@myprogress.com
- WhatsApp: (11) 99999-9999
- Help Desk: help.myprogress.com

---

## Status do Projeto

### Concluído
- [x] Backend completo com API REST
- [x] Sistema de autenticação JWT
- [x] Schema PostgreSQL completo
- [x] Sistema PIX com QR Code
- [x] Webhooks de pagamento
- [x] Dashboard financeiro
- [x] Sistema de alertas automáticos
- [x] Frontend React básico

### Em Desenvolvimento
- [ ] Interface completa do aluno
- [ ] Módulo de treinos com IA
- [ ] Relatórios avançados
- [ ] Integração WhatsApp real
- [ ] Sistema de assinaturas recorrentes

### Futuro
- [ ] App mobile React Native
- [ ] Integração com wearables
- [ ] Análise preditiva com IA
- [ ] Marketplace de planos
- [ ] Gamificação

---

**MyProgress** © 2024 - Transformando a gestão de academias no Brasil com tecnologia PIX.
