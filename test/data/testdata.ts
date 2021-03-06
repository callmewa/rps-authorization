export const users = {
  "selfish admin": {
    name: "selfish local admin",
    id: 1,
    userRoles: ["admin"],
  },
  "team player": {
    name: "team player",
    id: 2,
    teams: [
      {
        id: "t1",
        roles: ["team_contributor"]
      }
    ],
    orgs: [
      {
        id: "o1",
        roles: ["team_contributor"]
      }
    ]
  },
  "org player": {
    name: "org player",
    id: 3,
    orgs: [
      {
        id: "o1",
        roles: ["org_contributor"]
      }
    ]
  },
  "superstar": {
    name: "super star",
    id: 4,
    userRoles: ["admin", "contributor"],
    teams: [
      {
        id: "t1",
        roles: ["team_admin", "team_contributor"]
      },
      {
        id: "t2",
        roles: ["team_contributor"]
      }
    ],
    orgs: [
      {
        id: "o1",
        roles: ["org_contributor"]
      }
    ]
  },
  "individual contributor": {
    name: "individual contributor",
    id: 5,
    userRoles: ["contributor"],
  },
  "outside admin": {
    name: "outside admin",
    id: 6,
    repos: [
      {
        id: "r6",
        roles: ["admin"]
      }
    ],
  },
  "global admin": {
    name: "global admin",
    id: 7,
    userRoles: ["global_admin"]
  },
};

export const codeRepos = [
  {
    name: "self project",
    id: "r1u1",
    users: [1],
  },
  {
    name: "team 1 project",
    id: "r2t1",
    users: [],
    teams: ["t1"]
  },
  {
    name: "team 2 project",
    id: "r3t2",
    users: [],
    teams: ["t2"]
  },
  {
    name: "team 2 project needs team 1 help",
    id: "r4t2",
    users: [],
    teams: ["t2"],
    otherTeams: ["t1"]
  },
  {
    name: "org project",
    id: "r5o1",
    users: [],
    orgs: ["o1"]
  },
  {
    name: "random project using individual contributor",
    id: "r6",
    users: [],
    otherUsers: [5],
  }
];

export const scopes = ["global", "user", "team", "org", "repo", "other_user", "other_team", "other_org"];
