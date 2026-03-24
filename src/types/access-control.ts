export type ResourceScope = "any" | "team" | "own";

export interface UserContext {
  id: string;
  roleKeys: string[];
  teamIds?: string[];
  attributes?: Record<string, unknown>;
}

export interface ConditionContext {
  user: UserContext;
  resource?: Record<string, unknown>;
}

export interface PermissionGrant {
  resource: string;
  action: string;
  scope?: ResourceScope;
  effect?: "allow" | "deny";
  condition?: (context: ConditionContext) => boolean;
}

export interface RoleDefinition {
  inherits?: string[];
  permissions: PermissionGrant[];
}

export interface AccessCheck {
  user: UserContext;
  resource: string;
  action: string;
  resourceOwnerId?: string;
  resourceTeamId?: string;
  resourceData?: Record<string, unknown>;
}

export interface AccessDecision {
  allowed: boolean;
  reason: string;
  matchedScopes: ResourceScope[];
}

export interface AccessControl {
  can(check: AccessCheck): AccessDecision;
  getPermissions(roleKeys: string[]): PermissionGrant[];
}
