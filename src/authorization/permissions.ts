
import fs from "fs-extra";
import { inject, injectable } from "inversify";
import { TYPES } from "./injectionTypes";
import { Resource, PermissionService, Permission, Scope, Role } from "./interfaces";

type NonEmptyString = never;
function isNonEmptyString(arg: any): arg is NonEmptyString {
  return typeof arg === "string" && arg.length > 0;
}

type ArrayContainingNonEmptyString = never;
function isArrayContainingNonEmptyString(arg: any): arg is ArrayContainingNonEmptyString {
  return Array.isArray(arg) && arg.every((str: string) => typeof str === "string" && str.length > 0);
}

type PermissionSet = Set<Permission>;
type PermissionScopeMap = Map<Scope, PermissionSet>;
type PermissionRoleMap = Map<Role, PermissionScopeMap>;
type PermissionResourceMap = Map<Resource, PermissionRoleMap>;

function permissionObjectToMap(o: any) {
  const m = new Map();
  for (const k of Object.keys(o)) {
    if (!isNonEmptyString(k)) {
      throw new TypeError();
    }
    if (o[k] instanceof Object && !Array.isArray(o[k])) {
      m.set(k, permissionObjectToMap(o[k]));
    } else {
      if (!isArrayContainingNonEmptyString(o[k])) {
        throw new TypeError();
      }
      m.set(k, new Set(o[k]));
    }
  }
  return m;
}

@injectable()
export class RrspPermissions implements PermissionService {
  private readonly permissionResourceMap: PermissionResourceMap = new Map();
  constructor(@inject(TYPES.FilePath) filePath: string = "permissions.json") {
    const text = fs.readFileSync(filePath, "utf8");
    const permissionsJson = JSON.parse(text);
    this.permissionResourceMap = (permissionObjectToMap(permissionsJson) as Map<Resource, PermissionRoleMap>);
  }

  public getPermissions(resource: Resource, roles: Set<Role>, scope: Scope) {
    const resourcePermissions = this.permissionResourceMap.get(resource);
    let permissions = new Set<string>();
    for (const role of roles) {
      if (resourcePermissions && resourcePermissions!.has(role) && resourcePermissions!.get(role)!.has(scope)) {
        permissions = new Set<string>([...resourcePermissions!.get(role)!.get(scope)!, ...permissions]);
      }
    }
    return permissions;
  }
}
