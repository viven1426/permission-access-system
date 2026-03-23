import { createAccessControl } from "../index.js";

const accessControl = createAccessControl({
  author: {
    permissions: [
      { resource: "article", action: "read", scope: "own" },
      { resource: "article", action: "update", scope: "own" }
    ]
  }
});

const ownArticleDecision = accessControl.can({
  user: {
    id: "user_1",
    roleKeys: ["author"]
  },
  resource: "article",
  action: "update",
  resourceOwnerId: "user_1"
});

const otherArticleDecision = accessControl.can({
  user: {
    id: "user_1",
    roleKeys: ["author"]
  },
  resource: "article",
  action: "update",
  resourceOwnerId: "user_2"
});

console.log("own article:", ownArticleDecision);
console.log("other article:", otherArticleDecision);
