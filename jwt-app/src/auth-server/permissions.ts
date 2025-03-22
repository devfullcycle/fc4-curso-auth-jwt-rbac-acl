import {
  AbilityBuilder,
  CreateAbility,
  createMongoAbility,
  ForcedSubject,
  MongoAbility,
} from "@casl/ability";
import { Roles, User } from "./entities/User";

const actions = ["manage", "create", "update", "delete", "get"] as const;
const resources = ["User", "Course", "all"] as const;

type AppAbilities = [
  (typeof actions)[number],
  (
    | (typeof resources)[number]
    | ForcedSubject<Exclude<(typeof resources)[number], "all">>
  )
];

export type AppAbility = MongoAbility<AppAbilities>;

type DefinePermissions = (
  user: User,
  builder: AbilityBuilder<AppAbility>
) => void;
//acl - recurso (pasta, arquivo) - 

const rolePermissions: Record<Roles, DefinePermissions> = {
  Admin(user, { can }) {
    can("manage", "all"); // admin can manage everything
  },
  Teacher(user, { can }) {
    can("get", "Course", { "teacher.user.id": user.id } as any);
    can("update", "Course", ["description"], {
      "teacher.user.id": user.id,
    } as any);
  },
  Student(user, { can }) {
    can("get", "Course", {
      "enrollments.student.user.id": user.id,
      "enrollments.status": "ACTIVE",
    } as any);
  },
};

export function defineAbilityFor(user: User): AppAbility {
  const builder = new AbilityBuilder(
    createMongoAbility as CreateAbility<AppAbility>
  );

  user.permissions?.forEach(({ resource, action, condition, attributes }) => {
    builder.can(action as any, resource as any, attributes, condition);
  });

  user.roles.forEach((role) => {
    const permissions = rolePermissions[role];
    if (typeof permissions === "function") {
      permissions(user, builder);
    } else {
      throw new Error(`Invalid permissions for role: ${role}`);
    }
  });

  return builder.build();
}
