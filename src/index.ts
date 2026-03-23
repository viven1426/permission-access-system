export {
  createAccessControl,
  isAllowed,
  resolveUserPermissions
} from "./lib/create-access-control.js";

export type {
  AccessCheck,
  AccessControl,
  AccessDecision,
  ConditionContext,
  PermissionGrant,
  ResourceScope,
  RoleDefinition,
  UserContext
} from "./lib/types.js";
