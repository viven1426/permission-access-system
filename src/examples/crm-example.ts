import { createAccessControl } from "../index.js";

const accessControl = createAccessControl({
  admin: {
    permissions: [
      { resource: "account", action: "read", scope: "any" },
      { resource: "account", action: "create", scope: "any" },
      { resource: "account", action: "update", scope: "any" },
      { resource: "account", action: "delete", scope: "any" },
      { resource: "user", action: "manage", scope: "any" }
    ]
  },
  manager: {
    permissions: [
      { resource: "account", action: "read", scope: "team" },
      { resource: "account", action: "create", scope: "team" },
      { resource: "account", action: "update", scope: "team" }
    ]
  },
  sales_rep: {
    permissions: [
      { resource: "account", action: "read", scope: "own" },
      { resource: "account", action: "create", scope: "own" },
      { resource: "account", action: "update", scope: "own" }
    ]
  }
});

const decision = accessControl.can({
  user: {
    id: "user_123",
    roleKeys: ["manager"],
    teamIds: ["team_west"]
  },
  resource: "account",
  action: "update",
  resourceOwnerId: "user_555",
  resourceTeamId: "team_west",
  resourceData: {
    id: "account_7",
    status: "active"
  }
});

console.log(decision);
