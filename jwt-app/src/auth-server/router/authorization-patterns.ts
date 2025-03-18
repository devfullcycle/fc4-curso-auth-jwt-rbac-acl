import { Request, Response, NextFunction } from "express";
import { Roles } from "../entities/User";
import { UnauthorizedError } from "../errors";

export function rolesMiddleware(roles: Roles[]) {
  return function (req: Request, res: Response, next: NextFunction) {
    const hasRole = roles.some((role) => req.user.roles.includes(role));

    if (!hasRole) {
      return next(new UnauthorizedError());
    }

    next();
  };
}

// class XptoController{

//   variable: string;

//   @rolesDecorator([Roles.Admin, Roles.Teacher])
//   metodo(){

//   }
// }

//decorator - executar antes da rota
export function rolesDecorator(roles: Roles[] = []) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (
      req: Request,
      res: Response,
      next: NextFunction
    ) {
      try {
        const hasAuthorizedRole = roles.some((role) =>
          req.user.roles.includes(role)
        );

        if (!hasAuthorizedRole) {
          throw new UnauthorizedError();
        }

        return await originalMethod.apply(this, [req, res, next]);
      } catch (error) {
        next(error);
      }
    };

    return descriptor;
  };
}

const permissionMap: Record<string, string[]> = {
  //Admin: ['all'],
  Teacher: ["createCourse", "updateCourse"],
};

export function permissionDecorator(permission: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (
      req: Request,
      res: Response,
      next: NextFunction
    ) {
      try {
        const roles = req.user.roles;

        if(roles.includes(Roles.Admin)){
          return next();
        }

        const permissions = roles.map((role) => permissionMap[role]).flat();
        const hasPermission = permissions.includes(permission);

        if (!hasPermission) {
          throw new UnauthorizedError();
        }

        return await originalMethod.apply(this, [req, res, next]);
      } catch (error) {
        next(error);
      }
    };

    return descriptor;
  };
}

export function permissionMiddleware(permission: string) {
  return function (req: Request, res: Response, next: NextFunction) {
    const roles = req.user.roles;

    if(roles.includes(Roles.Admin)){
      return next();
    }

    const permissions = roles.map((role) => permissionMap[role]).flat();
    const hasPermission = permissions.includes(permission);
    if (!hasPermission) {
      return next(new UnauthorizedError());
    }
    next();
  };
}

function middlewareXpto(req: Request, res: Response, next: NextFunction): void {
  // context ===> extrair as info dos decorators
  // const roles = context ===> extrair as roles
  //comparar as roles do context com as do req.user
}
