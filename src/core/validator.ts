import type { RoleDefinition } from "../types/access-control.js";

export function assertRoleExists(
  roles: Record<string, RoleDefinition>,
  roleKey: string
): RoleDefinition {
  const role = roles[roleKey];

  if (!role) {
    throw new Error(`Unknown role definition "${roleKey}".`);
  }

  return role;
}

export function validateRoleDefinitions(
  roles: Record<string, RoleDefinition>
): void {
  const visited = new Set<string>();
  const activePath = new Set<string>();

  const visit = (roleKey: string) => {
    if (activePath.has(roleKey)) {
      throw new Error(
        `Circular role inheritance detected involving "${roleKey}".`
      );
    }

    if (visited.has(roleKey)) {
      return;
    }

    const role = assertRoleExists(roles, roleKey);

    activePath.add(roleKey);

    for (const inheritedRoleKey of role.inherits ?? []) {
      if (!roles[inheritedRoleKey]) {
        throw new Error(
          `Role "${roleKey}" inherits from missing role "${inheritedRoleKey}".`
        );
      }

      visit(inheritedRoleKey);
    }

    activePath.delete(roleKey);
    visited.add(roleKey);
  };

  for (const roleKey of Object.keys(roles)) {
    visit(roleKey);
  }
}
