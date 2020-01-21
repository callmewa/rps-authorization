# RPS Authorization

## run tests

``` bash
npm test
```

## Quick Start

check **./test** for a comprehensive example  
learn more about RPS [medium article](https://medium.com/@callmewa/the-birth-of-rps-e6bfc5eb41c5)  

## Introduction

RPS Authorization provides a generalized authorization solution that’s suitable for early stage startups as well as large corporations.  RPS supports direct interactions between organizations in a multi-tenant system.  The system solves the shortcomings of role based authorization without inheriting the complications of rule based access control.  

## Key Concepts

RPS has three main concepts: Resource Permission or RP, Roles, and Scopes.  

* **RP**: the action that’s being performed on a resource such read:book, add:user, calculateFinancialResults:taxReturn.  Each instance of a resource should have a unique identifier (ResourceId).  
* **Roles**: a principal’s roles such as admin, customer, sales manager.  RPs are assigned to roles.  
* **Scope**: a dimension that limits a role’s presence and power.  Scope is modeled after unix file scopes: User (User), Group (Group), Other (Global).  Similar to Resource, every Scope except for global should have a list of unique ids (ScopeId).   Scope modifies roles in two ways:  
it controls which roles are present for a given ScopeId.  A principal may have group admin roles in groups A and B, but the principal may not access group C.  A,B and C in this example are the scopeIds identifying the Group scope.  
it defines the area of each RP when assigned to a role.  A global admin role may possess all RPs at the global scope - meaning it can perform all actions on all resources in a system, while a group admin role may only have resource permissions at the group scope - meaning it can only perform RPs for the same group.  
Scopes can be arbitrarily defined; predefined scopes are global, group (Group), user (User), observer types (discussed later).  Each resourceId may be associated with one or more ScopeIds.  For example a truck may belong to a user and a company.  At the user scope the truck is associated with the specified userId; at the company (group) scope the truck is associated with the specified companyId.

## Design Principles

* Separation of authorization concerns from business logic.  Authorization should be able to determine whether someone is able to perform an action on a resource.  
* Favor RP over roles for access control.  RP are much more fine grained and can be attached to any number of roles.  
* Favor roles over RP for principal assignment.  Roles easier to manage than list of RPs.  
* Scopes should model the organization structure as much as possible.  Doing so will reduce confusion and abstraction.  
* Scopes supports inheritance and polymorphism.  For example, a `group` scope may be used to describe any number types of groups.  For example, a company may contain many individual groups of Sales, Support and Engineering.  All scopeIds of the same scope must be unique.  
* ScopeIds can oversee each other.  The philosophy behind this is fairly simple: one user, group, organization should be able to “oversee” another user, group, organization; one is granted certain RPs on overseen resourceIds.  Overseer scopes narrows the scope of specific RPs when assigned to the desired roles.
* Unopinionated about a principal’s data structure.
* Unopinionated about the organization structure.  Scopes can accommodate any org structure.

## Requirements

* each resourceId is associated with the necessary ScopeIds.  

```javascript
{resourceId: $id,  
authorization: { $scope: [$scopeIds...] ...} }
```

* every role is associated with the necessary ScopeIds.  All roles are associated with the global scope.  
* **Role** -0< (0 to many) **Scopes** -0< **RPs**  
* Global scope has no scopeId  

## Generalized Solution

Given an RP and a principal we want to check every role in the principal’s possession for a matching RP at the global scope.  If no match found and a resourceId is provided, then for each scopeId associated with the resourceId, we want to find a role belonging to the same scopeId with the matching RP and scope.  Once we find a match we would authorize; otherwise, deny.

## Functional Representation

```psedo
Given RP and resourceId (optional)  
For each scope  
  ScopeIdFunc(scope, resourceId) = ScopeIds  
  RolesFunc(principal, ScopeIds) = Roles  
  RPfunction(Roles, Scope) = RPs  
  RP exist in RPs ?
```

## Implementation

RPS has four components.  All components are interfaced and two of them are implemented.  

**PermissionService**
Permission service is dual purposed:  
Consume the permission configuration.
Provide a set of permissions when given a resource, a set of roles and a scope.
A default RRSP (resource role scope permission) implementation is provided.  RRSP expects a json file tiered by resources, roles, scopes and permissions respectively.

**PrincipleRoleService**
Provide a set of roles available to a principal when given a scope and a list of respective scopeIds.  

**EntityScopeService**
Provide a list of scopeIds when given a resourceId and a scope.  

**PermissionEvaluator**
Given a resourceId and a specific permission, determine whether a principal possesses the given permission.  The RPSevaluator accomplishes this by using the three above components.  

* EntityScopeService: ScopeIdFunc(scope, resourceId) = ScopeIds
* PrincipleRoleService: RolesFunc(principal, ScopeIds) = Roles
* PermissionService: RPfunction(Roles, Scope) = RPs
* PermissionEvaluator: RP exist in RPs ?

## Example  

Suppose there is a resource `truck` with resourceId `t1`.  We want to determine if a user with id `u1` may drive the truck.  User `u1` has `owner` role at the `user` scope.

```javascript
`truck`: {        #resource
    `owner`: {`   #role
       `user`:    #scope
          [`drive`, `sell`]}}}  #permissions
```
  
ScopeIdFunc(`truck`,`t1`) = `u1`  (user is associated with the truck)  
RolesFunc(u1, `user`, `u1` )  = `owner` (u1 is the owner of the truck at the user scope)  
RPfunction([`owner`], `user`) = [`drive`, `sell`] (u1 may drive, sell the truck t1)  
`drive` exists in [`drive`, `sell`] = true (u1 may indeed drive the truck)  

## FAQ

*What’s the meaning of global scope?*  
Global when referring a RP it means the role may perform the said permission against all resourceIds of the given resource.  When referring to the scope of a role it means all roles.

*How do I define custom scopes?*  
Handle the scope in your implementation of `EntityScopeService` and `PrincipalRoleService`.  Bind the scopes to the container.  `authorization.test.ts` has a complete implementation of this.  

*May I use use my own `PermissionService`?*  
Yes.  Simply provide your own implementation and inject into the service.  

*For a principal, how do I represent a role that’s associated with multiple scopes?*  
Make sure the role is associated with the desired scopes and scopeIds.

*How do I allow one user access resources belongs to another user?*  

* Define a new scope.  For the targeted resources, add the assessor userIds.  Give the assessor users the necessary permissions at the new scope. The same logic can be applied for organizations, teams etc.
* Share the resource.  For the targeted resources, add the assessor userIds.  

## security

### decorators

`@Resource("{resourceName}")` class level: indicate the resource the controller class represents  
`@Permission("{permission}")` method level: indicate the specific permission the end point requires for access  
`@ResourceId` parameter level: indicate the parameter used to evaluate the permission against.

### example

```typescript
@Resource("guitar")
@Route("/api/guitars")
export class GuitarController extends Controller {
    @Get("{id}")
    @Permission("view")
    public async getGuitar(@ResourceId id: number): Promise<Guitar> {...}
    ...
```

## License

[MIT](https://choosealicense.com/licenses/mit/)
