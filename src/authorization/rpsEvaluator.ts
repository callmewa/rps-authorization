import { inject, injectable } from "inversify";
import { TYPES } from "./injectionTypes";
import { PrincipalRoleService, EntityScopeService, PermissionEvaluator, ResourceId, PermissionService} from "./interfaces";

const DefaultScopes = ["user", "group", "global"];

@injectable()
export class RpsEvaluator implements PermissionEvaluator {

  private readonly scopes: string[];

  public constructor(@inject(TYPES.PermissionService) public permissionService: PermissionService,
                     @inject(TYPES.PrincipalRoleService) public roleService: PrincipalRoleService,
                     @inject(TYPES.EntityScopeService) public entityScopeService: EntityScopeService,
                     // inversify bug not correctly handling default array value
                     @inject(TYPES.Scopes) scopes: string[]) {
                      this.scopes = scopes ? scopes : DefaultScopes;
                     }
  // Given RP and resourceId(optional)
  // For each scope
  // ScopeIdFunc(scope, resourceId) = ScopeIds
  // RolesFunc(authority, ScopeIds) = Roles
  // RPfunction(Roles, Scope) = RPs
  // RP exist in RPs ?

  public async hasPermission(user: any, resourceId: ResourceId, resource: string, permission: string)
  : Promise<boolean> {
    for (const scope of this.scopes) {
      const scopesIds = await this.entityScopeService.getScopeIds(resource, resourceId, scope);
      const userRoles = this.roleService.getRoles(user, scope, scopesIds);
      const resourcePermissions = this.permissionService.getPermissions(resource, userRoles, scope);
      if (resourcePermissions.has(permission)) {
        return true;
      }
    }
    return false;
  }
}
