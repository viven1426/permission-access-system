import type {
  AccessCheck,
  ResourceScope
} from "../types/access-control.js";

export function isScopeMatch(
  scope: ResourceScope,
  check: AccessCheck
): boolean {
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
