import { createAccessControl } from "../index.js";

const accessControl = createAccessControl({
  admin: {
    permissions: [
      { resource: "project", action: "read", scope: "any" },
      { resource: "project", action: "create", scope: "any" },
      { resource: "project", action: "update", scope: "any" },
      { resource: "project", action: "delete", scope: "any" }
    ]
  },
  viewer: {
    permissions: [{ resource: "project", action: "read", scope: "any" }]
  }
});

const adminDecision = accessControl.can({
  user: {
    id: "user_admin",
    roleKeys: ["admin"]
  },
  resource: "project",
  action: "delete"
});

const viewerDecision = accessControl.can({
  user: {
    id: "user_viewer",
    roleKeys: ["viewer"]
  },
  resource: "project",
  action: "delete"
});

console.log("admin delete:", adminDecision);
console.log("viewer delete:", viewerDecision);
