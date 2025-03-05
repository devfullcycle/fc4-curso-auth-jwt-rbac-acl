import { createUserService } from "./services/UserService";

export async function loadFixtures() {

  const userService = await createUserService();

  await userService.create({
    name: "Admin User",
    email: "admin@user.com",
    password: "admin",
  });
}
