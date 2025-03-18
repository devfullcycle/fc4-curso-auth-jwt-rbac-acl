import {
  Entity,
  Column,
  OneToMany,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { StudentCourse } from "./StudentCourse";
import { User } from "./User";

@Entity()
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @Column()
  registration: string;

  @OneToMany(() => StudentCourse, (studentCourse) => studentCourse.student)
  enrollments: StudentCourse[];
}
