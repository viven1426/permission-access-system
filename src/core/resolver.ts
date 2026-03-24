import type {
  PermissionGrant,
  RoleDefinition
} from "../types/access-control.js";
import { assertRoleExists } from "./validator.js";

function flattenRolePermissions(
  roles: Record<string, RoleDefinition>,
  roleKey: string,
  visited = new Set<string>()
): PermissionGrant[] {
  if (visited.has(roleKey)) {
    return [];
  }

  visited.add(roleKey);

  const role = assertRoleExists(roles, roleKey);

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
