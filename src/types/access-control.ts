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

export type JsonConditionSource = "resource" | "user";

export type JsonConditionOperator =
  | "equals"
  | "notEquals"
  | "in"
  | "notIn"
  | "exists"
  | "notExists";

export interface JsonConditionDefinition {
  source?: JsonConditionSource;
  field: string;
  operator: JsonConditionOperator;
  value?: unknown;
}

export interface PermissionGrant {
  resource: string;
  action: string;
  scope?: ResourceScope;
  effect?: "allow" | "deny";
  condition?: (context: ConditionContext) => boolean;
}

export interface JsonPermissionGrant {
  resource: string;
  action: string;
  scope?: ResourceScope;
  effect?: "allow" | "deny";
  condition?: JsonConditionDefinition;
}

export interface RoleDefinition {
  inherits?: string[];
  permissions: PermissionGrant[];
}

export interface JsonRoleDefinition {
  inherits?: string[];
  permissions: JsonPermissionGrant[];
}

export interface JsonAccessControlConfig {
  roles: Record<string, JsonRoleDefinition>;
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

export type AccessControlConfigInput =
  | string
  | JsonAccessControlConfig
  | Record<string, JsonRoleDefinition>
  | Record<string, RoleDefinition>;
