import { injectable } from "inversify";
import { EntityScopeService, ResourceId, ScopeId } from "../src/authorization";
import { codeRepos } from "./data/testdata";
import { CodeRepo } from "./types/model";

@injectable()
export default class CodeEntityScopeService implements EntityScopeService {
  public async getScopeIds(resource: string, id: ResourceId, scope: string): Promise<ScopeId[]> {
    if (resource !== "repo") {
      throw new Error(`Invalid resource ${resource}`);
    }
    if (!id && scope !== "global") {
      return [];
    }
    const codeRepo: CodeRepo = codeRepos.find(repo => repo.id === id) as CodeRepo;
    if (!codeRepo) {
      throw new Error(`Invalid id ${id} for resource ${resource}`);
    }
    // ["global", "user", "team", "org", "other_user", "other_team", "other_org"]
    switch (scope) {
      case "global": return ["*"];
      case "user": return codeRepo.users || [];
      case "team": return codeRepo.teams || [];
      case "org": return codeRepo.orgs || [];
      case "other_user": return codeRepo.otherUsers || [];
      case "other_team": return codeRepo.otherTeams || [];
      case "other_org": return codeRepo.otherOrgs || [];
      default: throw new Error(`Invalid scope ${scope}`);
    }
  }
}
