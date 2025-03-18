import {
  Entity,
  Column,
  OneToMany,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { Course } from "./Course";
import { User } from "./User";

@Entity()
export class Teacher {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @Column()
  department: string;

  @Column()
  registration: string;

  @OneToMany(() => Course, (course) => course.teacher)
  courses: Course[];
}
