import { createAccessControl } from "../index.js";

const accessControl = createAccessControl({
  manager: {
    permissions: [
      { resource: "lead", action: "read", scope: "team" },
      { resource: "lead", action: "update", scope: "team" }
    ]
  }
});

const sameTeamDecision = accessControl.can({
  user: {
    id: "manager_1",
    roleKeys: ["manager"],
    teamIds: ["team_west"]
  },
  resource: "lead",
  action: "update",
  resourceOwnerId: "rep_9",
  resourceTeamId: "team_west"
});

const otherTeamDecision = accessControl.can({
  user: {
    id: "manager_1",
    roleKeys: ["manager"],
    teamIds: ["team_west"]
  },
  resource: "lead",
  action: "update",
  resourceOwnerId: "rep_4",
  resourceTeamId: "team_east"
});

console.log("same team:", sameTeamDecision);
console.log("other team:", otherTeamDecision);
