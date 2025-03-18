import "reflect-metadata";
import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import { StudentCourseService } from "./StudentCourseService";
import { StudentService } from "./StudentService";
import { CourseService } from "./CourseService";
import { TeacherService } from "./TeacherService";
import { createDatabaseConnection, closeDatabaseConnection } from "../database";
import { Repository } from "typeorm";
import { StudentCourse } from "../entities/StudentCourse";
import { Student } from "../entities/Student";
import { Course } from "../entities/Course";
import { Teacher } from "../entities/Teacher";
import { User } from "../entities/User";

let studentCourseService: StudentCourseService;
let studentService: StudentService;
let courseService: CourseService;
let teacherService: TeacherService;
let studentId: number;
let courseId: number;

let studentCourseRepository: Repository<StudentCourse>;
let studentRepository: Repository<Student>;
let courseRepository: Repository<Course>;
let teacherRepository: Repository<Teacher>;
let userRepository: Repository<User>;

beforeEach(async () => {
    const connection = await createDatabaseConnection();
    studentCourseRepository = connection.studentCourseRepository;
    studentRepository = connection.studentRepository;
    courseRepository = connection.courseRepository;
    teacherRepository = connection.teacherRepository;
    userRepository = connection.userRepository;

    studentCourseService = new StudentCourseService(
        studentCourseRepository,
        studentRepository,
        courseRepository
    );
    studentService = new StudentService(studentRepository, userRepository);
    courseService = new CourseService(courseRepository, teacherRepository);
    teacherService = new TeacherService(teacherRepository, userRepository);

    // Create a student
    const student = await studentService.create({
        user: {
            name: "Student Name",
            email: "student@example.com",
            password: "password123"
        },
        registration: "S12345",
    });
    studentId = student.id;

    // Create a teacher and course
    const teacher = await teacherService.create({
        user: {
            name: "Teacher Name",
            email: "teacher@example.com",
            password: "password123"
        },
        department: "Computer Science",
        registration: "T12345"
    });

    const course = await courseService.create({
        name: "Programming 101",
        code: "CS101",
        description: "Introduction to Programming",
        credits: 4,
        semester: "2024.1",
        teacherId: teacher.id
    });
    courseId = course.id;
});

afterEach(async () => {
    await closeDatabaseConnection();
});

test('should create a student course enrollment', async () => {
    const enrollmentDate = new Date();
    const enrollmentData = {
        studentId,
        courseId,
        enrollmentDate,
        status: 'ACTIVE' as const
    };

    const enrollment = await studentCourseService.create(enrollmentData);
    
    assert.strictEqual(enrollment.student.id, enrollmentData.studentId);
    assert.strictEqual(enrollment.course.id, enrollmentData.courseId);
    assert.strictEqual(enrollment.status, enrollmentData.status);
    assert.deepStrictEqual(enrollment.enrollmentDate, enrollmentData.enrollmentDate);
});

test('should find all enrollments', async () => {
    const enrollmentDate = new Date();
    const enrollmentData1 = {
        studentId,
        courseId,
        enrollmentDate,
        status: 'ACTIVE' as const
    };

    const enrollmentData2 = {
        studentId,
        courseId,
        enrollmentDate: new Date(),
        status: 'ACTIVE' as const
    };

    await studentCourseService.create(enrollmentData1);
    await studentCourseService.create(enrollmentData2);

    const enrollments = await studentCourseService.findAll();
    assert.strictEqual(enrollments.length, 2);
    assert.strictEqual(enrollments[0].student.id, studentId);
    assert.strictEqual(enrollments[1].student.id, studentId);
});

test('should find enrollment by id', async () => {
    const enrollmentDate = new Date();
    const enrollmentData = {
        studentId,
        courseId,
        enrollmentDate,
        status: 'ACTIVE' as const
    };

    const createdEnrollment = await studentCourseService.create(enrollmentData);
    const foundEnrollment = await studentCourseService.findById(createdEnrollment.id);

    assert.strictEqual(foundEnrollment?.student.id, enrollmentData.studentId);
    assert.strictEqual(foundEnrollment?.course.id, enrollmentData.courseId);
    assert.strictEqual(foundEnrollment?.status, enrollmentData.status);
});

test('should find enrollments by student', async () => {
    const enrollmentDate = new Date();
    const enrollmentData = {
        studentId,
        courseId,
        enrollmentDate,
        status: 'ACTIVE' as const
    };

    await studentCourseService.create(enrollmentData);
    const enrollments = await studentCourseService.findByStudent(studentId);

    assert.strictEqual(enrollments.length, 1);
    assert.strictEqual(enrollments[0].student.id, studentId);
});

test('should find enrollments by course', async () => {
    const enrollmentDate = new Date();
    const enrollmentData = {
        studentId,
        courseId,
        enrollmentDate,
        status: 'ACTIVE' as const
    };

    await studentCourseService.create(enrollmentData);
    const enrollments = await studentCourseService.findByCourse(courseId);

    assert.strictEqual(enrollments.length, 1);
    assert.strictEqual(enrollments[0].course.id, courseId);
});

test('should update enrollment status', async () => {
    const enrollmentDate = new Date();
    const enrollmentData = {
        studentId,
        courseId,
        enrollmentDate,
        status: 'ACTIVE' as const
    };

    const createdEnrollment = await studentCourseService.create(enrollmentData);
    const updatedEnrollment = await studentCourseService.update(createdEnrollment.id, {
        status: 'COMPLETED'
    });

    assert.strictEqual(updatedEnrollment?.status, 'COMPLETED');
});

test('should delete enrollment', async () => {
    const enrollmentDate = new Date();
    const enrollmentData = {
        studentId,
        courseId,
        enrollmentDate,
        status: 'ACTIVE' as const
    };

    const createdEnrollment = await studentCourseService.create(enrollmentData);
    await studentCourseService.delete(createdEnrollment.id);

    const foundEnrollment = await studentCourseService.findById(createdEnrollment.id);
    assert.strictEqual(foundEnrollment, null);
});