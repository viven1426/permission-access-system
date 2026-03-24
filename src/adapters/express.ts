import type { AccessControl, AccessCheck } from "../types/access-control.js";

interface PermissionRequestShape {
  auth?: {
    userId: string;
    roles: string[];
    teamIds?: string[];
  };
  record?: {
    ownerId?: string;
    teamId?: string;
    [key: string]: unknown;
  };
}

interface PermissionResponseShape {
  status(code: number): {
    json(body: unknown): unknown;
  };
}

type NextFunction = () => void;

export function requirePermission(
  accessControl: AccessControl,
  resource: string,
  action: string
) {
  return (
    req: PermissionRequestShape,
    res: PermissionResponseShape,
    next: NextFunction
  ) => {
    if (!req.auth) {
      return res.status(401).json({
        error: {
          code: "UNAUTHORIZED",
          message: "Missing request auth context."
        }
      });
    }

    const check: AccessCheck = {
      user: {
        id: req.auth.userId,
        roleKeys: req.auth.roles,
        teamIds: req.auth.teamIds
      },
      resource,
      action,
      resourceOwnerId: req.record?.ownerId,
      resourceTeamId: req.record?.teamId,
      resourceData: req.record
    };

    const decision = accessControl.can(check);

    if (!decision.allowed) {
      return res.status(403).json({
        error: {
          code: "FORBIDDEN",
          message: decision.reason
        }
      });
    }

    next();
  };
}
