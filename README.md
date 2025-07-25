# 📄 Scheduling-Betta

📘 [Leia este documento em português](./README.pt-BR.md)

## Overview

**Scheduling-Betta** is a corporate service scheduling system with centralized authentication via **Active Directory (AD)** and access control by group. Designed for organizational environments, the system allows efficient management of events, bookings, and history, with advanced filtering, sorting, and data export features.

---

## 🏛️ Architecture & Performance

The system was refactored to adopt a **Server-Side Processing** architecture. All filtering, sorting, and pagination operations are performed in the **backend**, ensuring a lightweight and fast **frontend**, even with large data volumes. This means that data queries and table organization happen directly in the database, sending only the necessary data to the client.

---

## ✨ Features

### For End Users

#### 🔐 Corporate Authentication
- **Backend**: LDAP (`System.DirectoryServices`) + JWT.
- **Frontend**: React + React Router.
- **Flow:**
  1. Users authenticate using corporate credentials (`user@domain`).
  2. Credentials are validated via **LDAP**.
  3. A **JWT** is issued with AD group claims to enforce access control.
  4. The frontend unlocks routes based on the user’s group.

#### 📅 Booking Page (`/eventos`)
- **Interactive Calendar**: Highlights days with available events, showing only upcoming dates.
- **Time Slot Selection**: Clear display of available time slots for a given day and event.
- **Email Notifications**: Automatic emails are sent when a session is **booked** or **canceled**, confirming the action.

#### 🗓️ My Bookings (`/agendamentos`)
- Users can view and manage all their upcoming bookings.
- Allows cancellation and redirection to the events page for rescheduling.

### 🚀 For Admins (HR Group)

#### 🛠️ Event Management (`/eventos-admin`)
- **Event CRUD**: Create, edit, and delete events through a modal form.
- **Performance**: Event list supports filtering and sorting processed in the **backend**.
- **Notifications**: Any change (create, edit, delete) triggers an email to the company staff group.

#### 📊 Booking Management (`/agendamentos-admin`)
- View all **upcoming** bookings from all users.
- Includes backend-powered search and sorting.
- Allows canceling any booking on behalf of a user, who will be notified via email.

#### 📈 Booking History (`/historico-admin`)
- Access to all **past** bookings, with a powerful filtering system:
  - **Period Filter**: "Last 3 months", "Last 6 months", "This year".
  - **Dynamic Year Filter**: Year buttons (e.g., 2024, 2023) appear only if records exist for that period.
  - **Global Search**: Search by event name, user name, or email.

#### 📁 Data Export
- Both management and history pages allow exporting **filtered data** to:
  - **CSV**: Simple pipe-delimited text file (`|`).
  - **Excel (.xlsx)**: Native formatted Excel file.

---

## 🧩 Upcoming Features

- **Microsoft 365 Integration**:
  - Automatically set Teams status to “Busy”.
  - Register event in **Outlook/Teams Calendar**.

- **Advanced WebSocket**:
  - Real-time feedback.
  - Dynamic queue with up to 4 interested users.

---

## 🚧 Roadmap

1. Integrate **Microsoft Graph API**
2. Implement **advanced WebSocket**
3. Add **E2E tests**

---

## 🛠️ Tech Stack

- **Frontend**: React, React Router, TailwindCSS, Framer Motion, date-fns, xlsx (SheetJS)
- **Backend**: .NET, LDAP, JWT
- **Database**: PostgreSQL
- **ORM**: Entity Framework Core (EF Core)
- **Integrations**: SMTP

---

## ⚙️ Configuration

To run the backend project, you need to create two configuration files in the root of the `SchedulingBetta.API` project (at the same level as the `Program.cs` file).

### 1. Environment Variables (`.env`)

Create a file named `.env` and add the following content, filling in the values according to your environment.

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_db_password
DB_NAME=scheduling-db
DB_CONNECTION_STRING=Host=${DB_HOST};Port=${DB_PORT};Username=${DB_USERNAME};Password=${DB_PASSWORD};Database=${DB_NAME}

# LDAP Configuration
LDAP_SERVER=your-domain.local
LDAP_DOMAIN_DN=DC=your-domain,DC=local

# JWT Configuration
JWT_SECRET=this-is-an-example-secret-key-with-32-bytes
JWT_ISSUER=SchedulingBetta.API
JWT_AUDIENCE=SchedulingBetta.Frontend
JWT_EXPIRE_HOURS=8

# Application Vars
# MAX_WAITLIST_CAPACITY=4 / not implemented yet

# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password
SMTP_FROM=your-email@gmail.com
SMTP_GROUP_EMAIL=company-group@your-domain.com
SMTP_ENABLE_SSL=true
```

### 2. Logging (nlog.config)

Create a file named `nlog.config` to define the application's logging behavior.

```bash
<?xml version="1.0" encoding="utf-8" ?>
<nlog xmlns="[http://www.nlog-project.org/schemas/NLog.xsd](http://www.nlog-project.org/schemas/NLog.xsd)"
      xmlns:xsi="[http://www.w3.org/2001/XMLSchema-instance](http://www.w3.org/2001/XMLSchema-instance)"
      autoReload="true">

  <targets>
    <target name="logfile" xsi:type="File"
            fileName="${basedir}/Logs/log-${shortdate}.log"
            layout="${longdate}|${level:uppercase=true}|${logger}|${message} ${exception:format=tostring}" />
    
    <target name="logconsole" xsi:type="Console" 
            layout="${longdate}|${level:uppercase=true}|${logger}|${message}" />
  </targets>

  <rules>
    <logger name="Microsoft.*" minlevel="Trace" maxlevel="Info" final="true" />
    <logger name="System.Net.Http.*" minlevel="Trace" maxlevel="Info" final="true" />

    <logger name="*" minlevel="Info" writeTo="logconsole" />
    <logger name="*" minlevel="Debug" writeTo="logfile" />
  </rules>
</nlog>
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature`
3. Commit your changes
4. Open a pull request to the `main` branch

---

## 📄 License

Licensed under the **MIT License**.
