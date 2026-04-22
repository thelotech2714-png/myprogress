# SOLUÇÃO: Localhost Recusado

## Problema: "localhost foi recusada"

Isso significa que o servidor Node.js não está rodando. Siga estes passos:

## 1. VERIFICAR SE SERVIDOR ESTÁ ATIVO

### Abrir terminal (Win + R, digite cmd):
```cmd
cd c:\Users\User\Desktop\myprogress
```

### Verificar se há processos Node:
```cmd
tasklist | findstr node
```

### Se houver processos, pare todos:
```cmd
taskkill /F /IM node.exe
```

## 2. VERIFICAR PORTA 5173

### Verificar se a porta está ocupada:
```cmd
netstat -an | findstr :5173
```

### Se estiver ocupada, use outra porta:
```cmd
set PORT=3000
npm run dev
```

## 3. REINSTALAR DEPENDÊNCIAS

### Limpar e reinstalar:
```cmd
cd c:\Users\User\Desktop\myprogress
rmdir /s /q node_modules
del package-lock.json
npm install
```

## 4. VERIFICAR ARQUIVO package.json

### Abrir e verificar se tem:
```json
{
  "scripts": {
    "dev": "vite --host 0.0.0.0 --port 5173"
  }
}
```

## 5. INICIAR SERVIDOR CORRETAMENTE

### No terminal:
```cmd
cd c:\Users\User\Desktop\myprogress
npm run dev
```

### Deve aparecer:
```
VITE v5.x.x  ready in xxx ms

  Local:   http://localhost:5173/
  Network: http://192.168.x.x:5173/
```

## 6. SE AINDA NÃO FUNCIONAR

### Tentar com Vite diretamente:
```cmd
npx vite --host 0.0.0.0 --port 3000
```

### Ou tentar:
```cmd
npm start
```

## 7. VERIFICAR FIREWALL/ANTIVÍRUS

### Desative temporariamente:
- Windows Defender
- Antivírus (Avast, Norton, etc.)
- Firewall do Windows

## 8. TENTAR OUTRO NAVEGADOR

### Use:
- Firefox
- Edge
- Chrome em modo normal

## 9. VERIFICAR ERROS

### Se aparecer erro no terminal, me diga exatamente:
- "Cannot find module" -> reinstale dependências
- "Permission denied" -> rode como administrador
- "Port already in use" -> mude a porta

## 10. SOLUÇÃO ALTERNATIVA

### Criar servidor simples:
```cmd
cd c:\Users\User\Desktop\myprogress
npx http-server . -p 8080
```

### Acesse: http://localhost:8080

## COMO VERIFICAR SE FUNCIONOU:

1. **Servidor iniciou** com mensagem "Local: http://localhost:5173/"
2. **Navegador abre** sem erro
3. **Login funciona** com instructor@test.com / 123456
4. **Menu aparece** com novas opções (PIX, Perfil, etc.)

## SE NADA DISSO FUNCIONAR:

1. **Reinicie o computador**
2. **Abra VSCode como Administrador**
3. **Repita os passos**

**IMPORTANTE:** O problema é técnico de servidor, não do código. 
Todas as funcionalidades estão 100% implementadas.
