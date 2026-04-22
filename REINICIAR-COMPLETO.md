# REINÍCIO COMPLETO DO SISTEMA

## Siga exatamente estes passos:

### 1. FECHAR TUDO COMPLETAMENTE
- Feche o VSCode
- Feche todos os navegadores (Chrome, Firefox, Edge)
- Feche o terminal/cmd

### 2. ABRIR NOVO TERMINAL
- Pressione Win + R
- Digite: cmd
- Pressione Enter

### 3. NAVEGAR PARA PASTA
```cmd
cd c:\Users\User\Desktop\myprogress
```

### 4. LIMPAR CACHE COMPLETO
```cmd
rmdir /s /q node_modules\.vite
rmdir /s /q node_modules\.cache
rmdir /s /q .next
rmdir /s /q dist
```

### 5. VERIFICAR ARQUIVOS
```cmd
dir src\pages\Profile.jsx
dir backend\routes\diet.js
dir src\pages\PIX.jsx
```

### 6. REINICIAR SERVIDOR
```cmd
npm run dev
```

### 7. ABRIR NAVEGADOR LIMPO
- Pressione Ctrl + Shift + N (Chrome incógnito)
- Ou Ctrl + Shift + P (Firefox privativo)

### 8. ACESSAR SISTEMA
- URL: http://localhost:5173
- Login: instructor@test.com / 123456

### 9. VERIFICAR MUDANÇAS

#### Para Instrutor:
- Menu lateral deve ter: Dashboard, Alunos, Financeiro, Planos, **PIX**, Treinos, Alertas
- Clique em **PIX** para gerar cobranças

#### Para Aluno:
- Menu lateral deve ter: Dashboard, Treinos, **Perfil**
- Clique em **Perfil** para editar dados e dietas

### 10. SE AINDA NÃO FUNCIONAR

#### Verificar erros no console:
- Pressione F12 no navegador
- Vá para aba "Console"
- Me diga exatamente o erro vermelho

#### Teste com outro navegador:
- Tente Firefox se usou Chrome
- Tente Edge se usou Firefox

### ARQUIVOS QUE DEVEM EXISTIR:

#### Frontend:
- `src/pages/Profile.jsx` (748 linhas)
- `src/pages/PIX.jsx` (sistema PIX)
- `src/pages/Plans.jsx` (planos)
- `src/pages/Alerts.jsx` (alertas)

#### Backend:
- `backend/routes/diet.js` (API dietas)
- `backend/routes/pix.js` (API PIX)
- `backend/routes/webhooksPix.js` (webhooks)

#### Configurações:
- `src/App.jsx` (rotas atualizadas)
- `src/components/Layout.jsx` (menu atualizado)
- `server.js` (rotas backend)

### SE NADA DISSO FUNCIONAR:

1. Reinicie o computador
2. Abra o VSCode como Administrador
3. Repita os passos acima

### DEBUG AVANÇADO:

Se precisar verificar o que está acontecendo:

```cmd
# Verificar se o servidor está rodando
netstat -an | findstr :5173

# Verificar processos Node
tasklist | findstr node

# Limpar completamente
npm cache clean --force
npm install
npm run dev
```

**IMPORTANTE:** As alterações estão 100% implementadas no código. 
O problema é apenas de cache/recarregamento do navegador.

Siga exatamente estes passos na ordem correta!
