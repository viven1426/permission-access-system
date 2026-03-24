# API Guide

This document describes the public API exposed by `permission-access-system`.

## Module Format

The project currently exposes an ESM package interface.

Use it with:

```ts
import { createAccessControl } from "permission-access-system";
```

If your application is still CommonJS-based, you should either:

- migrate the integration point to ESM
- clone the repository and adapt it to your project setup

## Main Exports

The package exposes:

- `AccessControlEngine`
- `createAccessControl`
- `isAllowed`
- `resolveUserPermissions`
- `requirePermission`

## createAccessControl

Creates an access-control instance from a role definition object.

```ts
const accessControl = createAccessControl({
  admin: {
    permissions: [{ resource: "project", action: "read", scope: "any" }]
  }
});
```

The returned object includes:

- `can(check)`
- `getPermissions(roleKeys)`

Internally, `createAccessControl(...)` returns an `AccessControlEngine` instance.

## AccessControlEngine

This is the class-based engine that owns the role configuration and exposes the main authorization API.

Example:

```ts
import { AccessControlEngine } from "permission-access-system";

const accessControl = new AccessControlEngine({
  admin: {
    permissions: [{ resource: "project", action: "read", scope: "any" }]
  }
});
```

Main methods:

- `can(check)`
- `getPermissions(roleKeys)`
- `getRoles()`

## accessControl.can(check)

Evaluates whether a user can perform an action on a resource.

Example:

```ts
const decision = accessControl.can({
  user: {
    id: "user_1",
    roleKeys: ["admin"],
    teamIds: ["team_a"]
  },
  resource: "project",
  action: "read",
  resourceOwnerId: "user_1",
  resourceTeamId: "team_a",
  resourceData: {
    id: "project_10",
    status: "active"
  }
});
```

## Decision Shape

The result of a permission check looks like this:

```ts
{
  allowed: true,
  reason: "Access allowed.",
  matchedScopes: ["any"]
}
```

Fields:

- `allowed`: whether access is granted
- `reason`: explanation of the decision
- `matchedScopes`: the scopes that matched the request

## Role Definition Shape

Each role can define:

- `permissions`
- optional `inherits`

Example:

```ts
{
  member: {
    permissions: [{ resource: "task", action: "read", scope: "own" }]
  },
  editor: {
    inherits: ["member"],
    permissions: [{ resource: "task", action: "update", scope: "own" }]
  }
}
```

## Permission Grant Shape

Each permission can define:

- `resource`
- `action`
- optional `scope`
- optional `effect`
- optional `condition`

Example:

```ts
{
  resource: "invoice",
  action: "refund",
  scope: "any",
  effect: "deny",
  condition: ({ resource }) => resource?.status === "locked"
}
```

## Supported Scopes

Supported scopes are:

- `any`
- `team`
- `own`

## Validation Behavior

The package validates role definitions when `createAccessControl` is called.

It throws errors when:

- a role inherits from a role that does not exist
- role inheritance is circular

This helps catch configuration problems early instead of failing silently during authorization checks.

## Express Adapter

The package also exposes `requirePermission` as an adapter helper for request middleware use cases.

For integration details, see `docs/middleware-integration.md`.
