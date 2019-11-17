import { Container, injectable } from "inversify";
import "reflect-metadata";
import { RpsEvaluator, EntityScopeService, RrspPermissions, PermissionEvaluator,
  PermissionService, PrincipalRoleService, ResourceId, TYPES
} from "../src/authorization";
import {users, scopes} from "./data/testdata";
import GotEntityScopeService from "./services/gotEntityScopeService";
import GotRoleService from "./services/gotRoleService";

describe("permission tests", () => {

  const container = new Container();
  container.bind<PermissionService>(TYPES.PermissionService).to(RrspPermissions);
  container.bind<string>(TYPES.FilePath).toConstantValue("test/permissions.json");
  const permissions: PermissionService = container.get(TYPES.PermissionService);

  it("[admin] should have [user] [delete] permission on [repo] resource ",
    () => expect(permissions.getPermissions("repo", new Set(["admin"]), "user").has("delete")).toBe(true));

  it("[org_contributor] should have [other_org] scope [commit] permission on [repo] resource ",
     () => {
       const permissionSet = permissions.getPermissions("repo", new Set(["org_contributor"]), "other_org");
       expect(permissionSet.has("commit")).toBe(true);
     });
});

describe("authorization tests", () => {
  // "selfish local admin": {
  //   name: "selfish local admin",
  //   id: 1,
  //   roles: ["admin"],
  // },
  const selfishAdmin = users["selfish admin"];

  // "team player": {
  //   name: "team player",
  //   id: 2,
  //   roles: [],
  //   teams: [
  //     {
  //       id: "t1",
  //       roles: ["team_contributor"]
  //     }
  //   ],
  //     orgs: [
  //       {
  //         id: "o1",
  //         roles: ["team_contributor"]
  //       }
  //     ]
  // },
  const teamPlayer = users["team player"];

  // "org player": {
  //   name: "org player",
  //     id: 3,
  //       roles: [],
  //         orgs: [
  //           {
  //             id: "o1",
  //             roles: ["org_contributor"]
  //           }
  //         ]
  const orgPlayer = users["org player"];

  // "superstar": {
  // name: "super star",
  // id: 4,
  // roles: ["admin", "contributor"],
  // teams: [
  //   {
  //     id: "t1",
  //     roles: ["team_admin", "team_contributor"]
  //   },
  //   {
  //     id: "t2",
  //     roles: ["team_contributor"]
  //   }
  // ],
  //   orgs: [
  //     {
  //       id: "o1",
  //       roles: ["org_contributor"]
  //     }
  //   ]
  const superstar = users.superstar;

  // "individual contributor": {
  //   name: "individual contributor",
  //   id: 5,
  //   roles: ["contributor"],
  // },
  const individualContributor = users["individual contributor"];

  // "outside admin": {
  //   name: "outside admin",
  //   id: 6,
  //   repos: [
  //     {
  //       id: "r6",
  //       roles: ["admin"]
  //     }
  //   ],
  // },
  const outsideAdmin = users["outside admin"];

  // "global admin": {
  //   name: "global admin",
  //   id: 7,
  //   userRoles: ["global_admin"]
  // },
  const globalAdmin = users["global admin"];

  const container = new Container();
  container.bind<PermissionService>(TYPES.PermissionService).to(RrspPermissions);
  container.bind<string>(TYPES.FilePath).toConstantValue("test/permissions.json");
  container.bind<string[]>(TYPES.Scopes).toConstantValue(scopes);
  container.bind<EntityScopeService>(TYPES.EntityScopeService).to(GotEntityScopeService);
  container.bind<PrincipalRoleService>(TYPES.PrincipalRoleService).to(GotRoleService);
  container.bind<PermissionEvaluator>(TYPES.PermissionEvaluator).to(RpsEvaluator);
  const rpsEvaluator: RpsEvaluator = container.get(TYPES.PermissionEvaluator);

  // admin
  it("selfishAdmin should have [delete] permission on [repo] resource at [user] scope ",
    async () => expect(await rpsEvaluator.hasPermission(selfishAdmin, "r1u1", "repo", "delete")).toBe(true));
  it("selfishAdmin should have [view] permission on [repo] resource at [user] scope ",
    async () => expect(await rpsEvaluator.hasPermission(selfishAdmin, "r1u1", "repo", "view")).toBe(true));
  it("selfishAdmin should have [commit] permission on [repo] resource at [user] scope ",
    async () => expect(await rpsEvaluator.hasPermission(selfishAdmin, "r1u1", "repo", "commit")).toBe(true));
  it("selfishAdmin should not have [commit] permission on random r6[repo] resource at [any] scope",
    async () => expect(await rpsEvaluator.hasPermission(selfishAdmin, "r6", "repo", "commit")).toBe(false));
  it("selfishAdmin should not have [commit] permission on r2t1 [repo] resource at [any] scope",
    async () => expect(await rpsEvaluator.hasPermission(selfishAdmin, "r2t1", "repo", "commit")).toBe(false));
  it("selfishAdmin should not have [commit] permission on r2t1 [repo] resource at [any] scope",
    async () => expect(await rpsEvaluator.hasPermission(selfishAdmin, "r3t2", "repo", "commit")).toBe(false));
  it("selfishAdmin should not have [commit] permission on r2t1 [repo] resource at [any] scope",
    async () => expect(await rpsEvaluator.hasPermission(selfishAdmin, "r4t2", "repo", "commit")).toBe(false));
  it("selfishAdmin should not have [commit] permission on r2t1 [repo] resource at [any] scope",
    async () => expect(await rpsEvaluator.hasPermission(selfishAdmin, "r5o1", "repo", "commit")).toBe(false));

  // team player
  it("teamPlayer should have [commit] permission on team [repo] resource at [team] scope ",
    async () => expect(await rpsEvaluator.hasPermission(teamPlayer, "r2t1", "repo", "commit")).toBe(true));
  it("teamPlayer should have [commit] permission on org [repo] resource at [org] scope ",
    async () => expect(await rpsEvaluator.hasPermission(teamPlayer, "r5o1", "repo", "commit")).toBe(true));
  it("teamPlayer should not have [delete] permission on org [repo] resource at [org] scope ",
    async () => expect(await rpsEvaluator.hasPermission(teamPlayer, "r5o1", "repo", "delete")).toBe(false));
  it("teamPlayer should have [commit] permission to help t2 [repo] resource at [other_team] scope ",
    async () => expect(await rpsEvaluator.hasPermission(teamPlayer, "r4t2", "repo", "commit")).toBe(true));
  it("teamPlayer should not have [commit] permission on team [repo] t2 resource at [tea] scope ",
    async () => expect(await rpsEvaluator.hasPermission(teamPlayer, "r3t2", "repo", "commit")).toBe(false));

  // org player
  it("orgPlayer should not have [delete] permission on org [repo] resource at [any] scope ",
    async () => expect(await rpsEvaluator.hasPermission(orgPlayer, "r5o1", "repo", "delete")).toBe(false));
  it("orgPlayer should have [commit] permission on org [repo] resource at [org] scope ",
    async () => expect(await rpsEvaluator.hasPermission(orgPlayer, "r5o1", "repo", "commit")).toBe(true));
  it("orgPlayer should not have [commit] permission on team [repo] resource at [any] scope ",
    async () => expect(await rpsEvaluator.hasPermission(orgPlayer, "r2t1", "repo", "commit")).toBe(false));
  it("orgPlayer should not have [commit] permission on team [repo] resource at [any] scope ",
    async () => expect(await rpsEvaluator.hasPermission(orgPlayer, "r3t2", "repo", "commit")).toBe(false));

  // super star
  it("superstar should have [delete] permission on team r2t1 [repo] resource at [team] scope",
    async () => expect(await rpsEvaluator.hasPermission(superstar, "r2t1", "repo", "delete")).toBe(true));
  it("superstar should not have [delete] permission on team r2t1 [repo] resource at [team] scope",
    async () => expect(await rpsEvaluator.hasPermission(superstar, "r3t2", "repo", "delete")).toBe(false));
  it("superstar should have [commit] permission on team r3t2 [repo] resource at [team] scope",
    async () => expect(await rpsEvaluator.hasPermission(superstar, "r3t2", "repo", "commit")).toBe(true));
  it("superstar should have [commit] permission on team r4t2[repo] resource at [team] scope",
    async () => expect(await rpsEvaluator.hasPermission(superstar, "r4t2", "repo", "commit")).toBe(true));
  it("superstar should have [commit] permission on team r5o1[repo] resource at [org] scope",
    async () => expect(await rpsEvaluator.hasPermission(superstar, "r5o1", "repo", "commit")).toBe(true));
  it("superstar should not have [delete] permission on org r5o1[repo] resource at [any] scope",
    async () => expect(await rpsEvaluator.hasPermission(superstar, "r5o1", "repo", "delete")).toBe(false));
  it("superstar should not have [commit] permission on random r6[repo] resource at [any] scope",
    async () => expect(await rpsEvaluator.hasPermission(superstar, "r6", "repo", "delete")).toBe(false));

  // outside admin
  it("outsideAdmin should have [delete] permission on team r6[repo] resource at [repo] scope",
    async () => expect(await rpsEvaluator.hasPermission(outsideAdmin, "r6", "repo", "delete")).toBe(true));
  it("outsideAdmin should not have [delete] permission on team r5o1[repo] resource at [any] scope",
    async () => expect(await rpsEvaluator.hasPermission(outsideAdmin, "r5o1", "repo", "delete")).toBe(false));
  it("outsideAdmin should not have [delete] permission on team r4t2[repo] resource at [any] scope",
    async () => expect(await rpsEvaluator.hasPermission(outsideAdmin, "r4t2", "repo", "delete")).toBe(false));

  // super admin
  it("globalAdmin should have [delete] permission on team r6[repo] resource at [global] scope",
    async () => expect(await rpsEvaluator.hasPermission(globalAdmin, "r6", "repo", "delete")).toBe(true));
  it("globalAdmin should have [delete] permission on team r5o1[repo] resource at [global] scope",
    async () => expect(await rpsEvaluator.hasPermission(globalAdmin, "r5o1", "repo", "delete")).toBe(true));
  it("globalAdmin should have [delete] permission on team r4t2[repo] resource at [global] scope",
    async () => expect(await rpsEvaluator.hasPermission(globalAdmin, "r4t2", "repo", "delete")).toBe(true));
  it("globalAdmin should have [delete] permission on team r3t2[repo] resource at [global] scope",
    async () => expect(await rpsEvaluator.hasPermission(globalAdmin, "r3t2", "repo", "delete")).toBe(true));
  it("globalAdmin should have [delete] permission on team r2t1[repo] resource at [global] scope",
    async () => expect(await rpsEvaluator.hasPermission(globalAdmin, "r2t1", "repo", "delete")).toBe(true));
  it("globalAdmin should have [delete] permission on team r1u1[repo] resource at [global] scope",
    async () => expect(await rpsEvaluator.hasPermission(globalAdmin, "r1u1", "repo", "delete")).toBe(true));

  // org with only specific indepedent contributor specified
  it("user with [contributor] should have [commit] permission on [repo] resource at [other_user] scope ",
    async () => expect(await rpsEvaluator.hasPermission(individualContributor, "r6", "repo", "commit")).toBe(true));

});
