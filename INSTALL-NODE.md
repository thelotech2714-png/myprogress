# Instruções de Instalação do Node.js

## Problema Identificado
Node.js não está instalado no sistema Windows.

## Solução
1. Baixe o Node.js do site oficial: https://nodejs.org/
2. Instale a versão LTS (Long Term Support)
3. Reinicie o terminal/PowerShell após instalação
4. Verifique com: `node --version` e `npm --version`

## Após Instalação
1. Execute `npm install` na pasta raiz do projeto
2. Execute `cd backend && npm install` para dependências do backend
3. Execute `npm run dev` para iniciar o frontend
4. Execute `cd backend && npm start` para iniciar o backend

## Portas
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
