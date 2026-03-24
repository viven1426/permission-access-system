export {
  createAccessControl,
  AccessControlEngine
} from "./core/access-control-engine.js";

export { isAllowed } from "./core/evaluator.js";

export { resolveUserPermissions } from "./core/resolver.js";

export { requirePermission } from "./adapters/express.js";

export type {
  AccessCheck,
  AccessControl,
  AccessDecision,
  ConditionContext,
  PermissionGrant,
  ResourceScope,
  RoleDefinition,
  UserContext
} from "./types/access-control.js";
