import test from "node:test";
import assert from "node:assert/strict";

import {
  createAccessControl,
  isAllowed,
  resolveUserPermissions
} from "../dist/index.js";

test("allows an own-scope action for the record owner", () => {
  const accessControl = createAccessControl({
    author: {
      permissions: [{ resource: "article", action: "update", scope: "own" }]
    }
  });

  const decision = accessControl.can({
    user: {
      id: "user_1",
      roleKeys: ["author"]
    },
    resource: "article",
    action: "update",
    resourceOwnerId: "user_1"
  });

  assert.equal(decision.allowed, true);
  assert.deepEqual(decision.matchedScopes, ["own"]);
});

test("denies team-scope access for a different team", () => {
  const accessControl = createAccessControl({
    manager: {
      permissions: [{ resource: "lead", action: "read", scope: "team" }]
    }
  });

  const decision = accessControl.can({
    user: {
      id: "manager_1",
      roleKeys: ["manager"],
      teamIds: ["team_west"]
    },
    resource: "lead",
    action: "read",
    resourceTeamId: "team_east"
  });

  assert.equal(decision.allowed, false);
  assert.equal(
    decision.reason,
    "Permission exists, but resource scope or condition did not match."
  );
});

test("explicit deny overrides allow when the condition matches", () => {
  const decision = isAllowed(
    [
      { resource: "invoice", action: "refund", scope: "any" },
      {
        resource: "invoice",
        action: "refund",
        scope: "any",
        effect: "deny",
        condition: ({ resource }) => resource?.status === "locked"
      }
    ],
    {
      user: {
        id: "finance_1",
        roleKeys: ["billing_admin"]
      },
      resource: "invoice",
      action: "refund",
      resourceData: {
        id: "inv_1",
        status: "locked"
      }
    }
  );

  assert.equal(decision.allowed, false);
  assert.equal(decision.reason, "Access denied by an explicit deny rule.");
});

test("inherits permissions from parent roles", () => {
  const permissions = resolveUserPermissions(
    {
      member: {
        permissions: [{ resource: "task", action: "read", scope: "own" }]
      },
      editor: {
        inherits: ["member"],
        permissions: [{ resource: "task", action: "update", scope: "own" }]
      }
    },
    ["editor"]
  );

  assert.equal(permissions.length, 2);
});

test("throws when a role inherits from a missing role", () => {
  assert.throws(
    () =>
      createAccessControl({
        editor: {
          inherits: ["missing_role"],
          permissions: []
        }
      }),
    /inherits from missing role/
  );
});

test("throws when role inheritance is circular", () => {
  assert.throws(
    () =>
      createAccessControl({
        admin: {
          inherits: ["manager"],
          permissions: []
        },
        manager: {
          inherits: ["admin"],
          permissions: []
        }
      }),
    /Circular role inheritance detected/
  );
});

test("creates access control from a json file path", () => {
  const accessControl = createAccessControl(
    new URL("./fixtures/rules.json", import.meta.url).pathname
  );

  const decision = accessControl.can({
    user: {
      id: "manager_1",
      roleKeys: ["manager"],
      teamIds: ["team_west"]
    },
    resource: "lead",
    action: "read",
    resourceTeamId: "team_west"
  });

  assert.equal(decision.allowed, true);
});

test("json declarative conditions deny locked invoices", () => {
  const accessControl = createAccessControl(
    new URL("./fixtures/rules.json", import.meta.url).pathname
  );

  const decision = accessControl.can({
    user: {
      id: "finance_1",
      roleKeys: ["billing_admin"]
    },
    resource: "invoice",
    action: "refund",
    resourceData: {
      id: "inv_1",
      status: "locked"
    }
  });

  assert.equal(decision.allowed, false);
  assert.equal(decision.reason, "Access denied by an explicit deny rule.");
});
