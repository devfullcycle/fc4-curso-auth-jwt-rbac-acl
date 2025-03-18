import "reflect-metadata";
import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import { CourseService } from "./CourseService";
import { TeacherService } from "./TeacherService";
import { StudentService } from "./StudentService";
import { StudentCourseService } from "./StudentCourseService";
import { createDatabaseConnection, closeDatabaseConnection } from "../database";
import { Repository } from "typeorm";
import { Course } from "../entities/Course";
import { Teacher } from "../entities/Teacher";
import { User } from "../entities/User";

let courseService: CourseService;
let teacherService: TeacherService;
let teacherId: number;

let courseRepository: Repository<Course>;
let teacherRepository: Repository<Teacher>;
let userRepository: Repository<User>;

beforeEach(async () => {
    const connection = await createDatabaseConnection();
    courseRepository = connection.courseRepository;
    teacherRepository = connection.teacherRepository;
    userRepository = connection.userRepository;

    courseService = new CourseService(courseRepository, teacherRepository);
    teacherService = new TeacherService(teacherRepository, userRepository);

    // Create a teacher first
    const teacher = await teacherService.create({
        user: {
            name: "Teacher Name",
            email: "teacher@example.com",
            password: "password123"
        },
        department: "Computer Science",
        registration: "T12345"
    });
    teacherId = teacher.id;
});

afterEach(async () => {
    await closeDatabaseConnection();
});

test('should create a course', async () => {
    const courseData = {
        name: "Programming 101",
        code: "CS101",
        description: "Introduction to Programming",
        credits: 4,
        semester: "2024.1",
        teacherId: teacherId
    };

    const course = await courseService.create(courseData);
    
    assert.strictEqual(course.name, courseData.name);
    assert.strictEqual(course.code, courseData.code);
    assert.strictEqual(course.description, courseData.description);
    assert.strictEqual(course.credits, courseData.credits);
    assert.strictEqual(course.semester, courseData.semester);
    assert.strictEqual(course.teacher.id, teacherId);
});

test('should find all courses', async () => {
    const courseData1 = {
        name: "Programming 101",
        code: "CS101",
        description: "Introduction to Programming",
        credits: 4,
        semester: "2024.1",
        teacherId: teacherId
    };

    const courseData2 = {
        name: "Data Structures",
        code: "CS102",
        description: "Advanced Programming Concepts",
        credits: 4,
        semester: "2024.1",
        teacherId: teacherId
    };

    await courseService.create(courseData1);
    await courseService.create(courseData2);

    const courses = await courseService.findAll();
    assert.strictEqual(courses.length, 2);
    assert.strictEqual(courses[0].name, courseData1.name);
    assert.strictEqual(courses[1].name, courseData2.name);
});

test('should find course by id', async () => {
    const courseData = {
        name: "Programming 101",
        code: "CS101",
        description: "Introduction to Programming",
        credits: 4,
        semester: "2024.1",
        teacherId: teacherId
    };

    const createdCourse = await courseService.create(courseData);
    const foundCourse = await courseService.findById(createdCourse.id);

    assert.strictEqual(foundCourse?.name, courseData.name);
    assert.strictEqual(foundCourse?.code, courseData.code);
    assert.strictEqual(foundCourse?.description, courseData.description);
});

test('should update course', async () => {
    const courseData = {
        name: "Programming 101",
        code: "CS101",
        description: "Introduction to Programming",
        credits: 4,
        semester: "2024.1",
        teacherId: teacherId
    };

    const createdCourse = await courseService.create(courseData);
    const updatedCourse = await courseService.update(createdCourse.id, {
        name: "Advanced Programming",
        description: "Advanced Programming Concepts",
        credits: 6
    });

    assert.strictEqual(updatedCourse?.name, "Advanced Programming");
    assert.strictEqual(updatedCourse?.description, "Advanced Programming Concepts");
    assert.strictEqual(updatedCourse?.credits, 6);
});

test('should delete course', async () => {
    const courseData = {
        name: "Programming 101",
        code: "CS101",
        description: "Introduction to Programming",
        credits: 4,
        semester: "2024.1",
        teacherId: teacherId
    };

    const createdCourse = await courseService.create(courseData);
    await courseService.delete(createdCourse.id);

    const foundCourse = await courseService.findById(createdCourse.id);
    assert.strictEqual(foundCourse, null);
});

test('should find courses by teacher', async () => {
    const courseData = {
        name: "Programming 101",
        code: "CS101",
        description: "Introduction to Programming",
        credits: 4,
        semester: "2024.1",
        teacherId: teacherId
    };
    
    await courseService.create(courseData);
    
    const courses = await courseService.findByTeacher(teacherId);
    
    assert.strictEqual(courses.length, 1);
    assert.strictEqual(courses[0].name, courseData.name);
    assert.strictEqual(courses[0].teacher.id, teacherId);
});

test('should find courses by student', async () => {
    // Get other repositories we need
    const connection = await createDatabaseConnection();
    const studentRepository = connection.studentRepository;
    const studentCourseRepository = connection.studentCourseRepository;
    
    // Create services
    const studentService = new StudentService(studentRepository, userRepository);
    const studentCourseService = new StudentCourseService(
        studentCourseRepository,
        studentRepository,
        courseRepository
    );
    
    // Create a student
    const student = await studentService.create({
        user: {
            name: "Student Name",
            email: "student@example.com",
            password: "password123"
        },
        registration: "S12345",
    });
    
    // Create a course
    const course = await courseService.create({
        name: "Programming 101",
        code: "CS101",
        description: "Introduction to Programming",
        credits: 4,
        semester: "2024.1",
        teacherId: teacherId
    });
    
    // Enroll student in course
    await studentCourseService.create({
        studentId: student.id,
        courseId: course.id,
        enrollmentDate: new Date(),
        status: 'ACTIVE'
    });
    
    // Test the findByStudent method
    const courses = await courseService.findByStudent(student.id);
    
    assert.strictEqual(courses.length, 1);
    assert.strictEqual(courses[0].id, course.id);
});
