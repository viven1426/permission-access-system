import type {
  AccessCheck,
  AccessDecision,
  PermissionGrant
} from "../types/access-control.js";
import { isScopeMatch } from "./scope.js";

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
