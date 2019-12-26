/**
 * reference implementation for authorization decorators
 */

import httpContext from "express-http-context";
import httpError from "http-errors";
import "reflect-metadata";
import { PermissionEvaluator } from "./interfaces";

export const MetaKeys = {
  ResourceId: "resourceId",
  Resource: "resource",
};

export function decoractorFactory(permissionEvaluator: PermissionEvaluator) {
  return {
    /**
     * class level decorator indicating the resource name
     * @param name
     */
    Resource: (name: string = ""): ClassDecorator => {
      return (target: any) => {
        Reflect.defineMetadata("resource", name, target);
      };
    },

    /**
     * parameter decorator
     * @param target class object's prototype
     * @param methodName method's name
     * @param index index of the argument
     */
    ResourceId: (target: any, methodName: string, index: number) => {
      Reflect.defineMetadata(MetaKeys.ResourceId, index, target, methodName);
    },

    /**
     * class method level decorator to enforce permission requirement
     * @param permission the permission required to authorize
     */
    Permission: (permission: string = "") => {
      return (target: any, methodName: string, propertyDesciptor: PropertyDescriptor) => {
        const method = propertyDesciptor.value;
        propertyDesciptor.value = async function(...args: any[]) {
          const user = httpContext.get("user");
          const resource = Reflect.getMetadata(MetaKeys.Resource, this.constructor);
          const resourceIdIndex = Reflect.getOwnMetadata(MetaKeys.ResourceId, target, methodName);
          const resourceId = Number.isInteger(resourceIdIndex) ? args[resourceIdIndex] : null;
          if (!user) {
            throw (httpError(401));
          }
          const hasPermission = await permissionEvaluator.hasPermission(user, resourceId, resource, permission);
          if (!hasPermission) {
            throw (httpError(403));
          }
          // invoke original method
          return method.apply(this, args);
        };

        return propertyDesciptor;
      };
    }
  };
}
