export type ResourceId = string | number | null;
export type ScopeId = string | number | null;
export type Resource = string;
export type Permission = string;
export type Role = string;
export type Scope = string;

export interface EntityScopeService {
  /**
   * give resource, resourceId and scope return a list of scope ids that entity belongs to
   * @param resource
   * @param id
   * @param scope
   */
  getScopeIds(resource: string, id: ResourceId, scope: string): Promise<ScopeId[]>;
}

export interface PrincipalRoleService {
  /**
   * give scope and ids return valid roles for the scopeIds
   * @param principal
   * @param scope name of the scope like account
   * @param scopeIds list of ids in the scope
   */
  getRoles(user: any, scope: string, scopeIds: ScopeId[]): Set<string>;
}

export interface PermissionEvaluator {
  hasPermission(principal: any, resourceId: ResourceId, resource: string, permission: string)
    : Promise<boolean>;
}

export interface PermissionService {
  getPermissions(resource: Resource, roles: Set<Role>, scope: string): Set<string>;
}
