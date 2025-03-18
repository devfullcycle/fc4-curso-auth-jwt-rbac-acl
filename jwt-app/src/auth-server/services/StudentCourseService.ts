import { Repository } from "typeorm";
import { StudentCourse } from "../entities/StudentCourse";
import { Student } from "../entities/Student";
import { Course } from "../entities/Course";

export class StudentCourseService {
    constructor(
        private studentCourseRepository: Repository<StudentCourse>,
        private studentRepository: Repository<Student>,
        private courseRepository: Repository<Course>
    ) {}

    async create(data: {
        studentId: number;
        courseId: number;
        enrollmentDate: Date;
        status?: 'ACTIVE' | 'COMPLETED' | 'DROPPED';
    }): Promise<StudentCourse> {
        const student = await this.studentRepository.findOneBy({ id: data.studentId });
        if (!student) {
            throw new Error('Student not found');
        }

        const course = await this.courseRepository.findOneBy({ id: data.courseId });
        if (!course) {
            throw new Error('Course not found');
        }

        const enrollment = this.studentCourseRepository.create({
            student,
            course,
            enrollmentDate: data.enrollmentDate,
            status: data.status || 'ACTIVE'
        });

        return this.studentCourseRepository.save(enrollment);
    }

    async findAll(): Promise<StudentCourse[]> {
        return this.studentCourseRepository.find({
            relations: ['student', 'course']
        });
    }

    async findById(id: number): Promise<StudentCourse | null> {
        return this.studentCourseRepository.findOne({
            where: { id },
            relations: ['student', 'course']
        });
    }

    async findByStudent(studentId: number): Promise<StudentCourse[]> {
        return this.studentCourseRepository.find({
            where: { student: { id: studentId } },
            relations: ['student', 'course']
        });
    }

    async findByCourse(courseId: number): Promise<StudentCourse[]> {
        return this.studentCourseRepository.find({
            where: { course: { id: courseId } },
            relations: ['student', 'course']
        });
    }

    async update(id: number, data: {
        status?: 'ACTIVE' | 'COMPLETED' | 'DROPPED';
        finalGrade?: number;
    }): Promise<StudentCourse | null> {
        const enrollment = await this.findById(id);
        if (!enrollment) {
            return null;
        }

        Object.assign(enrollment, {
            status: data.status ?? enrollment.status,
            finalGrade: data.finalGrade ?? enrollment.finalGrade
        });

        return this.studentCourseRepository.save(enrollment);
    }

    async delete(id: number): Promise<void> {
        await this.studentCourseRepository.delete(id);
    }
}