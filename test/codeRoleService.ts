import { injectable } from "inversify";
import { PrincipalRoleService, ScopeId } from "../src/authorization";
import { CodeHubUser } from "./types/model";

function formatRoles(roles: Set<string>): Set<string> {
  return new Set([...roles].map(role => {
    let formattedRole = role.toLowerCase();
    if (formattedRole.startsWith("role_")) {
      formattedRole = formattedRole.substring(5);
    }
    return formattedRole;
  }));
}

/**
 * get all roles belongs to the user
 * @param user
 */
function getAllRoles(user: CodeHubUser) {
  let userRoles = new Set<string>();
  if (user.roles) {
    userRoles = new Set ([...user.roles]);
  }
  const teams = user.teams;
  if (teams) {
    for (const member of teams) {
      userRoles = new Set([...member.roles, ...userRoles]);
    }
  }
  const orgs = user.orgs;
  if (orgs) {
    for (const member of orgs) {
      userRoles = new Set([...member.roles, ...userRoles]);
    }
  }

  return userRoles;
}

/**
 * get all user scopes associated with the user scope ids
 * @param user
 * @param scopeIds
 */
function getUserRoles(user: CodeHubUser, scopeIds: ScopeId[]) {
  if (scopeIds && scopeIds.length && scopeIds.includes(user.id)) {
    return getAllRoles(user);
  } else {
    return new Set<string>();
  }
}

/**
 * get all team roles for the team (scope) ids
 * @param user
 * @param scopeIds
 */
function getTeamRoles(user: CodeHubUser, scopeIds: ScopeId[]) {
  let userRoles = new Set<string>();
  const teams = user.teams;
  if (scopeIds && scopeIds.length && teams && teams.length) {
    for (const scopeId of scopeIds) {
      const localMember = teams.find(member => scopeId === member.id);
      if (localMember) {
        userRoles = new Set([...localMember.roles, ...userRoles]);
      }
    }
  }
  return userRoles;
}

/**
 * get all org roles for the org (scope) ids
 * @param user
 * @param scopeIds
 */
function getOrgRoles(user: CodeHubUser, scopeIds: ScopeId[]) {
  let userRoles = new Set<string>();
  const orgs = user.orgs;
  if (scopeIds && scopeIds.length && orgs && orgs.length) {
    for (const scopeId of scopeIds) {
      const localMember = orgs.find(member => scopeId === member.id);
      if (localMember) {
        userRoles = new Set([...localMember.roles, ...userRoles]);
      }
    }
  }
  return userRoles;
}

@injectable()
export default class CodeRoleService implements PrincipalRoleService {
  public getRoles(user: any, scope: string, scopeIds: ScopeId[]): Set<string> {
    switch (scope) {
      case "global": return getAllRoles(user);
      case "user": return getUserRoles(user, scopeIds);
      case "team": return getTeamRoles(user, scopeIds);
      case "org": return getOrgRoles(user, scopeIds);
      case "other_user": return getUserRoles(user, scopeIds);
      case "other_team": return getTeamRoles(user, scopeIds);
      case "other_org": return getOrgRoles(user, scopeIds);
      default: throw new Error(`Invalid scope ${scope}`);
    }
  }
}
