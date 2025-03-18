import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { Teacher } from "./Teacher";
import { StudentCourse } from "./StudentCourse";

@Entity()
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  code: string;

  @Column()
  description: string;

  @Column()
  credits: number;

  @Column()
  semester: string;

  @ManyToOne(() => Teacher, (teacher) => teacher.courses)
  teacher: Teacher;

  @OneToMany(() => StudentCourse, (studentCourse) => studentCourse.course)
  enrollments: StudentCourse[];
}
