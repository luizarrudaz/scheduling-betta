# 📄 Scheduling-Betta

## Visão Geral

**Scheduling-Betta** é um sistema corporativo de agendamento de serviços com autenticação centralizada via **Active Directory (AD)** e controle de acesso por grupos.  
Projetado para ambientes organizacionais, o sistema permite o gerenciamento eficiente de eventos e sessões, com uma interface intuitiva e integração futura com ferramentas da Microsoft.

---

## Funcionalidades

### 🔐 Autenticação Corporativa

- **Backend**: LDAP (`System.DirectoryServices`) + JWT  
- **Frontend**: React + React Router

**Fluxo:**
1. O usuário autentica com suas credenciais corporativas (`user@dominio`).
2. As credenciais são validadas via **LDAP**.
3. Um **JWT** é emitido com os grupos do AD nos claims.
4. O frontend exibe e permite acesso às abas com base no grupo:

| Grupo   | Abas Disponíveis                          |
|---------|-------------------------------------------|
| Admin   | `/eventos-admin`, `/agendamentos-admin`, `/historico-admin` |
| Usuário | `/eventos`, `/agendamentos`                           |

**Segurança:**
- Validação de senha conforme políticas do AD.
- Token com expiração de 10h.

---

### 📅 Tela de Agendamento

**Componentes:**
- **Calendário Interativo**:
  - Destaque dos dias com eventos disponíveis.
  - Suporte futuro a atualizações em tempo real via **WebSocket**.

- **Seletor de Horários**:
  - Intervalos de 30 minutos.
  - Cores indicam status dos horários:
    - 🩶 Disponível
    - 🟨 Em reserva *(futuro)*
    - 🟦 Com fila *(futuro)*
    - 🟥 Lotado *(futuro)*

- **Formulário de Reserva**:
  - Seleção do serviço.
  - Campo descritivo.
  - Confirmação via modal.

**Notificações por Email**:
- Enviadas automaticamente ao **agendar** ou **cancelar** uma sessão.

---

### 🛠️ Gestão de Eventos (Admin)

- **EventFormModal**:
  - Formulário com validações.
  - Opção de configurar pausas.
  - Reset automático ao fechar.

- **EventsTable**:
  - Edição e exclusão de eventos.
  - Integração com o histórico.

**Notificações**:
- Toda alteração (criação, edição, exclusão) dispara e-mail para o grupo da empresa.

---

## 🧩 Implementações Futuras

- Integração com **Microsoft 365**:
  - Status automático no **Teams** como "Ocupado".
  - Registro em **Outlook/Teams Calendar**.
  - Cancelamento automático com antecedência.

- **WebSocket Avançado**:
  - Feedback em tempo real.
  - Fila dinâmica de até 4 interessados.

---

## 🚧 Roadmap

1. Integrar **Microsoft Graph API**
2. Implementar **WebSocket Avançado**
3. Adicionar **Testes E2E**

---

## 🛠️ Tecnologias

- **Frontend**: React, React Router
- **Backend**: .NET, LDAP, JWT
- **Banco de Dados**: PostgreSQL
- **ORM**: Entity Framework Core (EF Core)
- **Integrações**: Microsoft Graph (futuro), SMTP

---

## 🤝 Contribuindo

1. Fork o repositório
2. Crie uma branch: `git checkout -b feature/sua-feature`
3. Commit suas alterações
4. Envie um pull request para a branch `main`

---

## 📄 Licença

Licenciado sob a **MIT License**.

---

## ℹ️ Observação

Recursos como **fila de espera**, **WebSocket avançado** e **integração com Microsoft 365** estão em desenvolvimento.
