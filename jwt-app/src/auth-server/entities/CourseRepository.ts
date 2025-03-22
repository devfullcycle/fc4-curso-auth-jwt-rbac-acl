import { Repository, SelectQueryBuilder } from "typeorm";
import { Course } from "./Course";
import { AppAbility } from "../permissions";
import { toTypeOrmQuery } from "../typeorm-casl";


export class CourseRepository extends Repository<Course>{

    withAbility(ability: AppAbility, action: string): SelectQueryBuilder<Course>{
        const queryBuilder = this.createQueryBuilder('course');
        return toTypeOrmQuery(ability, action, "Course", queryBuilder);
    }
}
