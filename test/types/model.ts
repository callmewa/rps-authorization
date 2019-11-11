export interface Guitar {
  /**
   * @isLong invalid year
   */
  id?: number;
  brand: string;
  model: string;
  /**
   * @isInt invalid year
   * @minimum 1900
   * @maximum 2100
   */
  year: number;
  color: string;

  userId: number;
  accountId: number;
}

export interface Membership {
  accountId: string;
  roles: Set<string>;
}

export interface AccountUser {
  username: string;
  userId: number;
  authorities: Set<string>;
  memberships?: Membership[];
}

export interface CodeRepo {
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

export interface CodeHubUser {
  name: string;
  id: number;
  roles?: string [];
  teams?: GroupRoles[];
  orgs?: GroupRoles[];
}
