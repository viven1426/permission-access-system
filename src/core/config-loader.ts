import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import type {
  AccessControlConfigInput,
  ConditionContext,
  JsonAccessControlConfig,
  JsonConditionDefinition,
  JsonPermissionGrant,
  JsonRoleDefinition,
  PermissionGrant,
  RoleDefinition,
  UserContext
} from "../types/access-control.js";

function getValueByPath(
  source: Record<string, unknown> | UserContext | undefined,
  field: string
): unknown {
  if (!source) {
    return undefined;
  }

  return field
    .split(".")
    .reduce<unknown>((currentValue, segment) => {
      if (
        currentValue &&
        typeof currentValue === "object" &&
        segment in currentValue
      ) {
        return (currentValue as Record<string, unknown>)[segment];
      }

      return undefined;
    }, source);
}

function evaluateJsonCondition(
  condition: JsonConditionDefinition,
  context: ConditionContext
): boolean {
  const source =
    condition.source === "user" ? context.user : context.resource;
  const actualValue = getValueByPath(source, condition.field);

  switch (condition.operator) {
    case "equals":
      return actualValue === condition.value;
    case "notEquals":
      return actualValue !== condition.value;
    case "in":
      return Array.isArray(condition.value)
        ? condition.value.includes(actualValue)
        : false;
    case "notIn":
      return Array.isArray(condition.value)
        ? !condition.value.includes(actualValue)
        : true;
    case "exists":
      return actualValue !== undefined && actualValue !== null;
    case "notExists":
      return actualValue === undefined || actualValue === null;
    default:
      return false;
  }
}

function compileJsonPermissionGrant(
  permission: JsonPermissionGrant
): PermissionGrant {
  return {
    resource: permission.resource,
    action: permission.action,
    scope: permission.scope,
    effect: permission.effect,
    condition: permission.condition
      ? (context) => evaluateJsonCondition(permission.condition!, context)
      : undefined
  };
}

function normalizeRoleDefinition(
  roleDefinition: RoleDefinition | JsonRoleDefinition
): RoleDefinition {
  return {
    inherits: roleDefinition.inherits,
    permissions: roleDefinition.permissions.map((permission) => {
      if ("condition" in permission && typeof permission.condition === "function") {
        return permission as PermissionGrant;
      }

      return compileJsonPermissionGrant(permission as JsonPermissionGrant);
    })
  };
}

function normalizeJsonConfigShape(
  config:
    | JsonAccessControlConfig
    | Record<string, JsonRoleDefinition>
    | Record<string, RoleDefinition>
): Record<string, RoleDefinition> {
  const roles = "roles" in config ? config.roles : config;

  return Object.fromEntries(
    Object.entries(roles).map(([roleKey, roleDefinition]) => [
      roleKey,
      normalizeRoleDefinition(roleDefinition)
    ])
  );
}

function loadJsonFile(filePath: string) {
  const absolutePath = resolve(filePath);
  const fileContents = readFileSync(absolutePath, "utf8");

  return JSON.parse(fileContents) as
    | JsonAccessControlConfig
    | Record<string, JsonRoleDefinition>;
}

export function loadRoleDefinitions(
  input: AccessControlConfigInput
): Record<string, RoleDefinition> {
  if (typeof input === "string") {
    return normalizeJsonConfigShape(loadJsonFile(input));
  }

  return normalizeJsonConfigShape(input);
}
