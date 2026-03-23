import { createAccessControl } from "../index.js";

const accessControl = createAccessControl({
  member: {
    permissions: [{ resource: "task", action: "read", scope: "own" }]
  },
  editor: {
    inherits: ["member"],
    permissions: [{ resource: "task", action: "update", scope: "own" }]
  },
  admin: {
    inherits: ["editor"],
    permissions: [{ resource: "task", action: "delete", scope: "any" }]
  }
});

const editorReadDecision = accessControl.can({
  user: {
    id: "user_10",
    roleKeys: ["editor"]
  },
  resource: "task",
  action: "read",
  resourceOwnerId: "user_10"
});

const adminDeleteDecision = accessControl.can({
  user: {
    id: "user_99",
    roleKeys: ["admin"]
  },
  resource: "task",
  action: "delete",
  resourceOwnerId: "user_10"
});

console.log("editor inherited read:", editorReadDecision);
console.log("admin inherited delete:", adminDeleteDecision);
