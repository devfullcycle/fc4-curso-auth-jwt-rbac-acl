import { DataSource } from "typeorm";
import { User } from "./entities/User";

export let dataSource: DataSource | null = null;

export async function createDatabaseConnection() {
  if (!dataSource || !dataSource.isInitialized) {
    dataSource = new DataSource({
      type: "sqlite",
      database: ":memory:",
      entities: [User],
      synchronize: true,
    });
    await dataSource.initialize();
  }

  return {
    userRepository: dataSource.getRepository(User),
  };
}

export async function closeDatabaseConnection() {
  if (dataSource && dataSource.isInitialized) {
    await dataSource.destroy();
    dataSource = null;
  }
}
