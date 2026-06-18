# 💰 Finanças App

[![React Native](https://img.shields.io/badge/React%20Native-0.76-61DAFB?style=flat-square&logo=react)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-~52.0-000020?style=flat-square&logo=expo)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-0BSD-blue?style=flat-square)](LICENSE)

Aplicativo móvel desenvolvido com **React Native** e **Expo** focado em educação e gestão financeira pessoal. Controle suas finanças de forma simples e intuitiva, com armazenamento offline e visualizações gráficas.

---

## ✨ Funcionalidades

- **📊 Dashboard** — Visão geral das suas finanças com gráficos e resumos.
- **💸 Transações** — Controle de entradas e saídas financeiras, com categorização e tela de criação (`AddTransactionScreen`).
- **🏦 Poupança** — Gestão de valores poupados e adição de novas economias (`SavingsScreen`, `AddSavingScreen`).
- **🎯 Metas** — Definição e acompanhamento de metas financeiras (`GoalsScreen`).
- **⚙️ Configurações** — Preferências do usuário, moeda, modo escuro e notificações.
- **💾 Armazenamento Offline** — Utiliza `AsyncStorage` para manter dados salvos no dispositivo.

---

## 🛠️ Stack Tecnológica

| Tecnologia | Descrição |
|---|---|
| **React Native** (0.76) | Framework mobile cross-platform |
| **Expo** (~52.0) | Plataforma de desenvolvimento e build |
| **React Navigation** | Navegação Bottom Tabs & Stack |
| **React Native Paper** | Componentes de UI Material Design |
| **Async Storage** | Persistência local de dados |
| **Chart Kit & SVG** | Gráficos e visualizações de dados |
| **TypeScript** | Tipagem estática |

---

## 📋 Pré-requisitos

- [Node.js](https://nodejs.org/) (v18+)
- [Expo Go](https://expo.dev/client) instalado no dispositivo móvel ou emulador configurado
- npm ou yarn

---

## 🚀 Instalação e Execução

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/mannowell/FinancasApp.git
   cd FinancasApp
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   # ou
   yarn
   ```

3. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm start
   # ou
   npm run android
   ```

4. **Abra o app:**
   - Leia o QR Code no terminal usando o **Expo Go** no seu smartphone
   - Ou pressione `a` para abrir no emulador Android

---

## 📁 Estrutura do Projeto

```
FinancasApp/
├── App.js              # Componente principal
├── app.json            # Configuração do Expo
├── babel.config.js     # Configuração do Babel
├── index.ts            # Ponto de entrada
├── components/         # Componentes reutilizáveis
├── screens/            # Telas do aplicativo
├── services/           # Serviços e lógica de negócio
├── utils/              # Utilitários e helpers
└── assets/             # Recursos estáticos (imagens, fontes)
```

---

## 👤 Autor

**Wellison Oliveira** — [mannowell](https://github.com/mannowell)

---

## 📄 Licença

Este projeto está sob a licença [0BSD](LICENSE) (domínio público).
