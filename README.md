# Documentação do Projeto **Scheduling-Betta**

## Visão Geral

O **Scheduling-Betta** é um sistema corporativo de agendamento de serviços integrado ao **Active Directory (AD)**. Seu objetivo é otimizar a criação e o gerenciamento de eventos e agendamentos dentro de uma organização. O sistema permite a autenticação centralizada via AD, controle de acesso baseado em grupos, e oferece diversas funcionalidades relacionadas ao agendamento de serviços.

---

## Funcionalidades Principais

### 1. **Autenticação Corporativa**

#### Tecnologias Utilizadas:
- **Backend**: LDAP (System.DirectoryServices) + JWT
- **Frontend**: React + React Router

#### Fluxo de Login:
1. O usuário insere suas credenciais corporativas (ex: `user@dominio`).
2. O sistema valida as credenciais contra o controlador **AD** via protocolo **LDAP**.
3. O backend gera um **token JWT** com os **claims** de grupo.
4. O frontend redireciona o usuário conforme seu perfil:

   - **Admins**: `/eventos` (Gerenciamento de eventos)
   - **Admins**: `/agendamentos-admin` (Visualização de agendamentos)
   - **Admins**: `/historico-eventos` (Histórico de eventos e agendamentos)
   - **Usuários**: `/agendamentos` (Agendamento de serviços)

#### Proteções:
- **Validação de força de senha**: Conforme políticas do AD.
- **Tokens JWT** com expiração de 8 horas.

---

### 2. **Tela de Agendamento**

#### Componentes Principais:

- **Calendário Interativo**:
  - Destaque de dias com eventos disponíveis.
  - Atualização em tempo real via **WebSocket**.

- **Seletor de Horários**:
  - **Slots** de 30 minutos (das 08:00 às 18:00).
  - **Cores Dinâmicas**:
    - **Cinza**: Disponível.
    - **Amarelo**: Em processo de reserva.
    - **Azul**: Agendado (com opção de entrar na fila de interessados).
    - **Vermelho**: Ocupado (4 ou mais na fila).

- **Formulário de Reserva**:
  - Captura de:
    - Serviço desejado (dropdown).
    - Detalhes complementares (campo de texto).
  - Confirmação via modal.

---

### 3. **Gestão de Eventos (Admin)**

#### Novos Recursos Implementados:

- **EventFormModal**:
  - Formulário dinâmico com validação em tempo real.
  - Seleção de **pausas programadas** (início/fim).
  - Reset automático dos dados após fechamento.

- **EventsTable**:
  - Tabela animada com ações de edição e exclusão.
  - Integração com o histórico de eventos.

---

## Implementações Futuras

### 1. **Banco de Dados**:
- Migrar os dados **mock** para um banco de dados **PostgreSQL** utilizando o **Prisma ORM**.

### 2. **Notificações por Email**:
- Envio automático de confirmações e lembretes via **SMTP**.

### 3. **Integração com Microsoft 365**:
- Alteração do status do **Microsoft Teams** para **"Ocupado"** durante sessões agendadas.
- Registro de eventos no **Outlook/Teams Calendar**.
- **Cancelamento Automático**: Remoção do status/reserva se o evento for cancelado com pelo menos 1 hora de antecedência.

### 4. **WebSocket Avançado**:
- Atualização em tempo real dos slots:
  - Feedback visual imediato para reservas simultâneas.
  - **Fila de Interessados** com limite de 4 posições.

---

## Próximos Passos

1. **Implementar Conexão com Banco de Dados**.
2. **Desenvolver Serviço de Notificações por Email**.
3. **Integrar API do Microsoft Graph** para controle do **Teams/Outlook**.
4. **Adicionar Testes E2E** para fluxos críticos.

---

## Tecnologias Utilizadas

- **Frontend**: React, React Router, WebSocket
- **Backend**: .NET, LDAP, JWT
- **Banco de Dados**: PostgreSQL (futuro)
- **ORM**: Prisma (futuro)
- **API de Integração**: Microsoft Graph
- **SMTP**: Para envio de notificações por e-mail

---

## Contribuições

Se você deseja contribuir para este projeto, siga os seguintes passos:

1. Faça um **fork** do repositório.
2. Crie uma **branch** para sua feature (`git checkout -b feature/nova-feature`).
3. Faça suas alterações e **commit**.
4. Envie um **pull request** para a branch `main`.

---

**Licença**: Este projeto está licenciado sob a **MIT License**.
