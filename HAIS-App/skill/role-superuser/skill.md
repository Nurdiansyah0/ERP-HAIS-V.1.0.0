Berikut contoh `skill.md` untuk AI agar memahami perbedaan antara Business Role dan System Role (Superuser).

# Business Role vs System Role Architecture Skill

## Objective

Ensure the AI correctly distinguishes between:

1. Business Roles (domain-driven roles)
2. System Roles (software/platform administration roles)

This distinction is mandatory when designing ERP, ARFF, HRIS, CMMS, EAM, Airport Operations, and Enterprise Systems.

---

# Core Principle

A role must be classified according to its responsibility.

If the responsibility exists because of the business process, it is a Business Role.

If the responsibility exists because of the software platform, it is a System Role.

---

# Business Roles

Business roles participate directly in operational workflows.

Examples:

* Staff
* Operator
* Technician
* Inspector
* Supervisor
* Team Leader
* Manager
* Director
* Fire Chief
* Watchroom Officer
* Maintenance Coordinator

Characteristics:

* Create business records
* Approve business transactions
* Execute operational activities
* Generate business reports
* Participate in workflow states

Examples:

Inspection:
Draft → Submitted → Reviewed → Approved

Maintenance:
Open → Assigned → In Progress → Closed

Leave Request:
Requested → Approved → Rejected

Business roles interact with these states.

---

# System Roles

System roles administer the software platform itself.

Examples:

* Superuser
* System Administrator
* Platform Administrator
* Security Administrator
* Database Administrator
* DevOps Administrator

Characteristics:

* Manage users
* Manage permissions
* Configure application settings
* Monitor audit logs
* Backup and restore data
* Manage authentication systems
* Manage integrations

System roles generally do not participate in business workflows.

---

# Superuser Definition

A Superuser is not a business role.

A Superuser is the highest software-level authority.

Responsibilities:

* Full access to all modules
* Full access to all records
* Manage RBAC
* Create roles
* Delete roles
* Configure system settings
* Access audit trails
* Manage database maintenance

The Superuser should not be used as:

* Manager
* Inspector
* Approver
* Operational staff

unless explicitly required.

---

# Architecture Pattern

```text
Application
│
├── Business Layer
│   ├── Staff
│   ├── Team Leader
│   ├── Supervisor
│   ├── Manager
│   └── Director
│
└── System Layer
    ├── Administrator
    └── Superuser
```

---

# Database Design

roles

```sql
id
name
description
is_system_role
created_at
updated_at
```

Example:

| id | name          | is_system_role |
| -- | ------------- | -------------- |
| 1  | Staff         | false          |
| 2  | Team Leader   | false          |
| 3  | Manager       | false          |
| 4  | Administrator | true           |
| 5  | Superuser     | true           |

---

# Permission Model

Recommended:

```text
Role
 └── Permission
```

Examples:

Staff

* inspection.create
* inspection.view_own

Manager

* inspection.approve
* report.view

Administrator

* user.create
* user.update
* role.manage

Superuser

* 

```

Superuser bypasses normal permission evaluation.

---

# Domain-Driven Design Rule

Never place Superuser inside the business domain model.

Incorrect:

```text
Approval Flow

Staff
→ Supervisor
→ Manager
→ Superuser
```

Correct:

```text
Approval Flow

Staff
→ Supervisor
→ Manager
```

Superuser remains outside the workflow.

---

# HAIS Recommendation

For Hang Nadim ARFF Integrated System:

Business Roles:

* Staff
* Team Leader Shift
* Team Leader Maintenance
* Team Leader Performance
* Team Leader Operation
* Manager

System Roles:

* Administrator
* Superuser

Administrator:

* User management
* Master data management
* Operational configuration

Superuser:

* Emergency recovery
* System maintenance
* Security management
* Platform governance

Superuser should be limited to IT administrators, developers, or authorized platform owners.

Skill ini cocok dijadikan referensi permanen untuk AI Architect, System Analyst, Domain-Driven Design, RBAC Design, dan ERP/ARFF system modeling.
