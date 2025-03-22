# Documentação do Projeto Scheduling-Betta

## **Visão Geral**  
O **Scheduling-Betta** é um sistema corporativo de agendamento de serviços integrado ao Active Directory (AD), desenvolvido para:

- Criação de eventos (nome, tamanho da sessão, pausa (almoço por exemplo caso tenha pausa e de quanto a quanto tempo), localidade)
- Agendamentos com base nos eventos criados
- Autenticação centralizada via credenciais do AD  
- Controle de acesso baseado em grupos do AD (Admins/Usuários)    

---

## **Funcionalidades Principais**

### 1. **Autenticação Corporativa**  
**Tecnologias**:  
- Backend: LDAP (System.DirectoryServices) + JWT
- Frontend: React + React Router  

**Fluxo de Login**:  
1. Usuário insere credenciais corporativas (user@dominio)  
2. Sistema valida contra controlador AD via protocolo LDAP  
3. Backend gera token JWT com claims de grupo  
4. Frontend redireciona conforme perfil:
   - **Admins**: `/(página a ser criada de criação de eventos)`
   - **Admins**: `/(página a ser criada de visualização de agendamentos)`
   - **Admins**: `/(página a ser criada de histórico de eventos e seus agendamentos)`  
   - **Usuários**: `/agendamento`

**Proteções**:  
- Validação de força de senha via políticas AD  
- Tokens JWT com expiração de 'x' horas (vai ser implementado) 

### 2. **Tela de Agendamento**  
**Componentes Chave**:  
- **Calendário Interativo**:  
  - Destaque de dias com eventos disponíveis    

- **Seletor de Horários**:  
  - Slots de 'x' minutos (de xx:xx à xx:xx)  
  - Cores dinâmicas:
    - Cinza: Disponível  
    - Vermelho: Ocupado  

- **Formulário de Reserva**:  
  - Captura de:  
    - Serviço desejado (dropdown)  
    - Detalhes complementares (textarea)  
  - Confirmação via modal  

**Integrações**:  
- Notificações por email (confirmação/lembrete)  

---

## **Implementações Futuras**

- **Banco de Dados**
- **Notificações por email** (confirmação/lembrete)
- **Alterar o status do Microsoft Teams** do usuário para "Ocupado" durante o tempo de sessão e registrar no calendário do Outlook/Teams após confirmação.
- **Em caso de cancelamento com até 1 hora de antecedência**, desativar efeito do Teams/Outlook.
- **Websocket para mudanças em tempo real nos slots de horários**:
  - **Agendando no momento**: slot fica amarelo
  - **Agendado**: slot fica azul e a opção de agendar se torna "entrar em fila de interessado"
  - **Ocupado** (4 em fila de interessados): slot fica vermelho

