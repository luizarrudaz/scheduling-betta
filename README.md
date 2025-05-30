# 📄 Scheduling-Betta

## Visão Geral

O **Scheduling-Betta** é um sistema corporativo de agendamento de serviços integrado ao **Active Directory (AD)**.  
Seu objetivo é otimizar a criação e o gerenciamento de eventos e agendamentos dentro de uma organização.  
O sistema permite **autenticação centralizada via AD**, **controle de acesso baseado em grupos** e oferece funcionalidades robustas relacionadas ao agendamento de serviços.

---

## Funcionalidades Principais

### 1. Autenticação Corporativa

**Tecnologias Utilizadas:**
- Backend: LDAP (`System.DirectoryServices`) + JWT
- Frontend: React + React Router

**Fluxo de Login:**
1. O usuário insere suas credenciais corporativas (ex: `user@dominio`).
2. O sistema valida as credenciais contra o **AD** via protocolo **LDAP**.
3. O backend gera um **token JWT** com os **claims** de grupo.
4. O frontend redireciona o usuário conforme seu perfil:
   - **Admins**:
     - `/eventos` → Gerenciamento de eventos
     - `/agendamentos-admin` → Visualização de agendamentos
     - `/historico-eventos` → Histórico de eventos e agendamentos
   - **Usuários**:
     - `/agendamentos` → Agendamento de serviços

**Proteções:**
- Validação de força de senha conforme políticas do AD.
- Tokens JWT com expiração de 10 horas.

---

### 2. Tela de Agendamento

**Componentes Principais:**
- **Calendário Interativo**:
  - Destaque dos dias com eventos disponíveis.
  - Atualização em tempo real via **WebSocket** (futuro).

- **Seletor de Horários**:
  - Slots de 30 minutos (das 08:00 às 18:00, por exemplo).
  - Cores Dinâmicas:
    - 🩶 Cinza: Disponível
    - 🟨 Amarelo: Em processo de reserva *(futuro)*
    - 🟦 Azul: Agendado, com fila de interessados *(futuro)*
    - 🟥 Vermelho: Ocupado (4 ou mais na fila) *(futuro)*

- **Formulário de Reserva**:
  - Seleção do serviço desejado.
  - Campo de texto para detalhes.
  - Confirmação via modal.

---

### 3. Gestão de Eventos (Admin)

**Novos Recursos:**
- **EventFormModal**:
  - Formulário dinâmico com validação.
  - Seleção de pausas programadas (início/fim).
  - Reset automático ao fechar.

- **EventsTable**:
  - Tabela animada com edição e exclusão.
  - Integração com histórico de eventos.

---

## Implementações Futuras

1. Substituir dados **mock** por banco **PostgreSQL** com **Entity Framework Core (EF Core)**.
2. Serviço de notificações por email via **SMTP**.
3. Integração com **Microsoft 365**:
   - Alteração automática de status do **Teams** para **"Ocupado"**.
   - Registro de eventos no **Outlook/Teams Calendar**.
   - Cancelamento automático com antecedência.
4. **WebSocket Avançado**:
   - Feedback visual imediato.
   - Fila de interessados (até 4).

---

## Próximos Passos

1. Desenvolver **serviço de notificações por email**.
2. Integrar **API do Microsoft Graph**.
3. Adicionar **Testes End-to-End (E2E)**.

---

## Tecnologias Utilizadas

- **Frontend**: React, React Router, WebSocket *(futuro)*
- **Backend**: .NET, LDAP, JWT
- **Banco de Dados**: PostgreSQL *(em andamento)*
- **ORM**: Entity Framework Core (EF Core)
- **Integração**: Microsoft Graph
- **SMTP**: Notificações por email

---

## Contribuições

1. Faça um **fork**.
2. Crie uma branch:  
   `git checkout -b feature/nova-feature`
3. Realize alterações e commit.
4. Envie um **pull request** para `main`.

---

## Licença

Este projeto está licenciado sob a **MIT License**.

---

## ℹ️ Observação

O sistema de **fila**, **WebSocket avançado** e a **integração com a API da Microsoft** são **implementações futuras**.
