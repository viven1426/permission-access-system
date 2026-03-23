# Examples Guide

This document explains the example files included in the project and what each one is meant to show.

All example source files are located in `src/examples/`.

## 01-basic-rbac.ts

This example shows the simplest role-based access control flow.

It demonstrates:

- how to define basic roles
- how to assign permissions to roles
- how to check whether a user can perform an action

Use this example when you want to understand the basic structure of the project first.

## 02-own-scope.ts

This example shows owner-based access.

It demonstrates:

- how a user can be limited to their own records
- how record ownership affects authorization decisions
- how to check access for update or read actions on owned resources

Use this example when your application has resources like:

- articles
- tickets
- tasks
- leads

where users should only access what they own.

## 03-team-scope.ts

This example shows team-based access.

It demonstrates:

- how managers or team leads can access team resources
- how team identifiers affect permission checks
- how to handle access that is broader than ownership but narrower than full admin access

Use this example when your app supports team structures.

## 04-role-inheritance.ts

This example shows role inheritance.

It demonstrates:

- how one role can inherit permissions from another
- how to reduce duplication in role definitions
- how to build more scalable role structures

Use this example when your project has related roles such as:

- member and editor
- editor and admin
- manager and senior manager

## 05-explicit-deny.ts

This example shows explicit deny rules.

It demonstrates:

- how a permission can be blocked even when a broader permission exists
- how conditional deny logic works
- how to protect sensitive actions with stricter rules

Use this example when some actions should be blocked under specific conditions.

Example situations:

- locked invoices cannot be refunded
- archived records cannot be updated
- restricted documents cannot be deleted

## crm-example.ts

This example shows a more realistic business-oriented scenario.

It demonstrates:

- multiple business roles
- role-based permissions in a CRM-style app
- team and ownership-oriented access patterns

Use this example when you want to see how the project might fit into a real product structure.

## Recommended Reading Order

If you are new to the project, review the examples in this order:

1. `01-basic-rbac.ts`
2. `02-own-scope.ts`
3. `03-team-scope.ts`
4. `04-role-inheritance.ts`
5. `05-explicit-deny.ts`
6. `crm-example.ts`

This order moves from simple permission checks to more practical and advanced authorization cases.
