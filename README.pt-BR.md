# 📄 Scheduling-Betta

## Visão Geral

**Scheduling-Betta** é um sistema corporativo de agendamento de serviços com autenticação centralizada via **Active Directory (AD)** e controle de acesso por grupos. Projetado para ambientes organizacionais, o sistema permite o gerenciamento eficiente de eventos, agendamentos e históricos, com recursos avançados de filtragem, ordenação e exportação de dados.

---

## 🏛️ Arquitetura e performance

O sistema foi refatorado para adotar uma arquitetura de **Server-Side Processing**. Todas as operações de filtragem, ordenação e paginação são executadas no **backend**, garantindo que o **frontend** permaneça leve e rápido, mesmo com um grande volume de dados. Isso significa que as buscas e a organização das tabelas são feitas diretamente no banco de dados, enviando ao cliente apenas os dados necessários.

---

## ✨ Funcionalidades

### Para usuários

#### 🔐 Autenticação corporativa
- **Backend**: LDAP (`System.DirectoryServices`) + JWT.
- **Frontend**: React + React Router.
- **Fluxo:**
  1. O usuário autentica com suas credenciais corporativas (`user@dominio`).
  2. As credenciais são validadas via **LDAP**.
  3. Um **JWT** é emitido com os grupos do AD nos claims, garantindo o controle de acesso.
  4. O frontend libera o acesso às rotas com base no grupo do usuário.

#### 📅 Tela de agendamento (`/eventos`)
- **Calendário interativo**: Destaque dos dias com eventos disponíveis, mostrando apenas eventos futuros.
- **Seleção de horários**: Visualização clara dos horários disponíveis para um determinado dia e evento.
- **Notificações por e-mail**: E-mails automáticos são enviados ao **agendar** ou **cancelar** uma sessão, para confirmação.

#### 🗓️ Meus agendamentos (`/agendamentos`)
- O usuário pode visualizar e gerenciar todos os seus agendamentos futuros.
- Permite cancelar um agendamento existente e editá-lo (redireciona para a tela de eventos para remarcação).

### 🚀 Para administradores (grupo RH)

#### 🛠️ Gestão de eventos (`/eventos-admin`)
- **CRUD de eventos**: Permite criar, editar e excluir eventos através de um formulário modal.
- **Performance**: A listagem de eventos é otimizada com busca e ordenação processadas no **backend**.
- **Notificações**: Toda alteração (criação, edição, exclusão) dispara um e-mail para o grupo de colaboradores da empresa.

#### 📊 Gestão de agendamentos (`/agendamentos-admin`)
- Visualização de todos os agendamentos **futuros** de todos os usuários.
- A página conta com busca e ordenação processadas no **backend**.
- Permite o cancelamento de qualquer agendamento em nome do usuário, que será notificado por e-mail.

#### 📈 Histórico de agendamentos (`/historico-admin`)
- Acesso a todos os agendamentos **passados**, com um poderoso sistema de filtros:
  - **Filtro de período:** "Últimos 3 meses", "Últimos 6 meses", "Este ano".
  - **Filtro dinâmico por ano:** Botões de ano (ex: 2024, 2023) aparecem dinamicamente apenas se existirem registros naquele período.
  - **Busca global:** Pesquisa por nome do evento, nome do usuário ou e-mail.

#### 📁 Exportação de dados
- Tanto a tela de gestão quanto a de histórico permitem exportar os dados **já filtrados** para:
  - **CSV**: Arquivo de texto simples com delimitador de pipe (`|`).
  - **Excel (.xlsx)**: Arquivo nativo com formatação.

---

## 🧩 Implementações futuras

- Integração com **Microsoft 365**:
  - Status automático no **Teams** como "Ocupado".
  - Registro em **Outlook/Teams Calendar**.

- **WebSocket avançado**:
  - Feedback em tempo real.
  - Fila dinâmica com até 4 interessados.

---

## 🚧 Roadmap

1. Integrar **Microsoft Graph API**
2. Implementar **WebSocket avançado**
3. Adicionar **testes E2E**

---

## 🛠️ Tecnologias

- **Frontend**: React, React Router, TailwindCSS, Framer Motion, date-fns, xlsx (SheetJS)
- **Backend**: .NET, LDAP, JWT
- **Banco de dados**: PostgreSQL
- **ORM**: Entity Framework Core (EF Core)
- **Integrações**: SMTP

---

## 🤝 Contribuindo

1. Fork o repositório
2. Crie uma branch: `git checkout -b feature/sua-feature`
3. Commit suas alterações
4. Envie um pull request para a branch `main`

---

## 📄 Licença

Licenciado sob a **MIT License**.
