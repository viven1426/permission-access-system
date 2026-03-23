import type {
  AccessCheck,
  AccessControl,
  AccessDecision,
  PermissionGrant,
  ResourceScope,
  RoleDefinition
} from "./types.js";

function isScopeMatch(scope: ResourceScope, check: AccessCheck): boolean {
  if (scope === "any") {
    return true;
  }

  if (scope === "own") {
    return check.user.id === check.resourceOwnerId;
  }

  if (!check.resourceTeamId || !check.user.teamIds) {
    return false;
  }

  return check.user.teamIds.includes(check.resourceTeamId);
}

function flattenRolePermissions(
  roles: Record<string, RoleDefinition>,
  roleKey: string,
  visited = new Set<string>()
): PermissionGrant[] {
  if (visited.has(roleKey)) {
    return [];
  }

  visited.add(roleKey);

  const role = roles[roleKey];

  if (!role) {
    return [];
  }

  const inherited = (role.inherits ?? []).flatMap((parentRoleKey) =>
    flattenRolePermissions(roles, parentRoleKey, visited)
  );

  return [...inherited, ...role.permissions];
}

export function resolveUserPermissions(
  roles: Record<string, RoleDefinition>,
  roleKeys: string[]
): PermissionGrant[] {
  return roleKeys.flatMap((roleKey) => flattenRolePermissions(roles, roleKey));
}

export function isAllowed(
  permissions: PermissionGrant[],
  check: AccessCheck
): AccessDecision {
  const relevantPermissions = permissions.filter(
    (permission) =>
      permission.resource === check.resource && permission.action === check.action
  );

  if (relevantPermissions.length === 0) {
    return {
      allowed: false,
      reason: "No matching permission grant found.",
      matchedScopes: []
    };
  }

  const denied = relevantPermissions.find((permission) => {
    const scope = permission.scope ?? "any";
    const conditionPassed = permission.condition
      ? permission.condition({
          user: check.user,
          resource: check.resourceData
        })
      : true;

    return (
      permission.effect === "deny" &&
      conditionPassed &&
      isScopeMatch(scope, check)
    );
  });

  if (denied) {
    return {
      allowed: false,
      reason: "Access denied by an explicit deny rule.",
      matchedScopes: [denied.scope ?? "any"]
    };
  }

  const allowedScopes = relevantPermissions
    .filter((permission) => (permission.effect ?? "allow") === "allow")
    .filter((permission) => {
      const scope = permission.scope ?? "any";
      const conditionPassed = permission.condition
        ? permission.condition({
            user: check.user,
            resource: check.resourceData
          })
        : true;

      return conditionPassed && isScopeMatch(scope, check);
    })
    .map((permission) => permission.scope ?? "any");

  if (allowedScopes.length === 0) {
    return {
      allowed: false,
      reason: "Permission exists, but resource scope or condition did not match.",
      matchedScopes: []
    };
  }

  return {
    allowed: true,
    reason: "Access allowed.",
    matchedScopes: allowedScopes
  };
}

export function createAccessControl(
  roles: Record<string, RoleDefinition>
): AccessControl {
  return {
    can(check) {
      const permissions = resolveUserPermissions(roles, check.user.roleKeys);
      return isAllowed(permissions, check);
    },
    getPermissions(roleKeys) {
      return resolveUserPermissions(roles, roleKeys);
    }
  };
}
