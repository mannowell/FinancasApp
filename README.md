# Finanças App

Aplicativo móvel desenvolvido com React Native e Expo focado em educação e gestão financeira pessoal.

## 📱 Funcionalidades

- **Dashboard**: Visão geral das suas finanças.
- **Transações**: Controle de entradas e saídas financeiras, com categoria e tela de criação (`AddTransactionScreen`).
- **Poupança**: Gestão de valores poupados e adição de novas economias (`SavingsScreen`, `AddSavingScreen`).
- **Metas**: Definição e acompanhamento de metas financeiras (`GoalsScreen`).
- **Configurações**: Preferências do usuário, moeda, modo escuro e notificações.
- **Armazenamento Offline**: Utiliza `AsyncStorage` para manter dados do usuário salvos no dispositivo.

## 🛠️ Tecnologias Principais

- **React Native** (0.76)
- **Expo** (~52.0)
- **React Navigation** (Bottom Tabs & Stack)
- **React Native Paper** (Componentes de UI)
- **Async Storage** (Persistência local de dados)
- **Chart Kit & SVG** (Para gráficos e visualizações de dados)

## 🚀 Como Executar

Certifique-se de ter o `Node.js` e o aplicativo **Expo Go** instalado no seu dispositivo móvel (ou um emulador configurado).

1. Instale as dependências:
   ```bash
   npm install
   # ou
   yarn
   ```

2. Inicie o servidor de desenvolvimento:
   ```bash
   npm start
   # ou
   npm run android
   ```

3. Leia o QR Code no terminal usando o Expo Go no seu smartphone ou pressione "a" para abrir no emulador Android.
