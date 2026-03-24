import type {
  AccessCheck,
  AccessControl,
  AccessDecision,
  PermissionGrant,
  RoleDefinition
} from "../types/access-control.js";
import { isAllowed } from "./evaluator.js";
import { resolveUserPermissions } from "./resolver.js";
import { validateRoleDefinitions } from "./validator.js";

export class AccessControlEngine implements AccessControl {
  constructor(private readonly roles: Record<string, RoleDefinition>) {
    validateRoleDefinitions(this.roles);
  }

  can(check: AccessCheck): AccessDecision {
    const permissions = resolveUserPermissions(this.roles, check.user.roleKeys);
    return isAllowed(permissions, check);
  }

  getPermissions(roleKeys: string[]): PermissionGrant[] {
    return resolveUserPermissions(this.roles, roleKeys);
  }

  getRoles(): Record<string, RoleDefinition> {
    return this.roles;
  }
}

export function createAccessControl(
  roles: Record<string, RoleDefinition>
): AccessControlEngine {
  return new AccessControlEngine(roles);
}
