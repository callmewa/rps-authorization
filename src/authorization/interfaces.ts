export type ResourceId = string | number | null;
export type ScopeId = string | number | null;

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
   * @param user
   * @param scope name of the scope like account
   * @param scopeIds list of ids in the scope
   */
  getRoles(user: any, scope: string, scopeIds: ScopeId[]): Set<string>;
}

export interface PermissionEvaluator {
  hasPermission(user: any, resourceId: ResourceId, resource: string, permission: string)
    : Promise<boolean>;
}
