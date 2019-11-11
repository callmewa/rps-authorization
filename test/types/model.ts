export interface GotRepo {
  id: string;
  users?: number[];
  teams?: string[];
  orgs?: string[];
  otherTeams?: string[];
  otherUsers?: number[];
  otherOrgs?: string[];
}

interface GroupRoles {
  id: string;
  roles: string [];
}

export interface GotHubUser {
  name: string;
  id: number;
  userRoles?: string [];
  // roles for specific teams
  teams?: GroupRoles[];
  // roles for specific orgs
  orgs?: GroupRoles[];
  // roles for specific repositories
  repos?: GroupRoles[];
}
