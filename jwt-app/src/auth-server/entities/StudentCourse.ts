import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Student } from "./Student";
import { Course } from "./Course";

@Entity()
export class StudentCourse {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Student, (student) => student.enrollments)
  student: Student;

  @ManyToOne(() => Course, (course) => course.enrollments)
  course: Course;

  @Column()
  enrollmentDate: Date;

  @Column({ default: "ACTIVE" })
  status: "ACTIVE" | "COMPLETED" | "DROPPED";

  @Column({ type: "decimal", precision: 4, scale: 2, nullable: true })
  finalGrade: number;
}
