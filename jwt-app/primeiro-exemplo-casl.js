import {
  AbilityBuilder,
  createMongoAbility,
  defineAbility,
} from "@casl/ability";

const adminUser = {
  id: 1,
  name: "John Doe",
  role: "admin",
  email: "admin@user.com",
};

const normalUser = {
  id: 2,
  name: "Jane Doe",
  role: "user",
  email: "user@user.com",
};

class Course{
  constructor(id, user_id) {
    this.id = id;
    this.user_id = user_id;
  }
}

const permissions = {
  admin(user, { can }) {
    can("manage", "all"); // admin can manage everything
  },
  user(user, { can }) {
    can("read", "Course", { user_id: user.id }); // user can read everything
    can("update", "Course", { user_id: user.id }); // user can update everything
  },
};

function defineAbilityFor(user) {
  const builder = new AbilityBuilder(createMongoAbility);

  permissions[user.role](user, builder);

  return builder.build();
}

const ability = defineAbilityFor(normalUser);

const course = new Course(1, 1);
console.log(ability.can("update", course));

