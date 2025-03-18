import "reflect-metadata";
import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import { StudentService } from "./StudentService";
import { createDatabaseConnection, closeDatabaseConnection } from "../database";
import { Repository } from "typeorm";
import { Student } from "../entities/Student";
import { User } from "../entities/User";

let studentService: StudentService;
let studentRepository: Repository<Student>;
let userRepository: Repository<User>;

beforeEach(async () => {
    const connection = await createDatabaseConnection();
    studentRepository = connection.studentRepository;
    userRepository = connection.userRepository;
    studentService = new StudentService(studentRepository, userRepository);
});

afterEach(async () => {
    await closeDatabaseConnection();
});

test('should create a student with user', async () => {
    const studentData = {
        user: {
            name: "John Doe",
            email: "john@example.com",
            password: "password123"
        },
        registration: "S12345",
    };

    const student = await studentService.create(studentData);
    
    assert.strictEqual(student.registration, studentData.registration);
    assert.strictEqual(student.user.name, studentData.user.name);
    assert.strictEqual(student.user.email, studentData.user.email);
});

test('should find all students', async () => {
    const studentData1 = {
        user: {
            name: "John Doe",
            email: "john@example.com",
            password: "password123"
        },
        registration: "S12345",
    };

    const studentData2 = {
        user: {
            name: "Jane Smith",
            email: "jane@example.com",
            password: "password456"
        },
        registration: "S67890",
    };

    await studentService.create(studentData1);
    await studentService.create(studentData2);

    const students = await studentService.findAll();
    assert.strictEqual(students.length, 2);
    assert.strictEqual(students[0].user.name, studentData1.user.name);
    assert.strictEqual(students[1].user.name, studentData2.user.name);
});

test('should find student by id', async () => {
    const studentData = {
        user: {
            name: "John Doe",
            email: "john@example.com",
            password: "password123"
        },
        registration: "S12345",
    };

    const createdStudent = await studentService.create(studentData);
    const foundStudent = await studentService.findById(createdStudent.id);

    assert.strictEqual(foundStudent?.registration, studentData.registration);
    assert.strictEqual(foundStudent?.user.name, studentData.user.name);
});

test('should update student', async () => {
    const studentData = {
        user: {
            name: "John Doe",
            email: "john@example.com",
            password: "password123"
        },
        registration: "S12345",
    };

    const createdStudent = await studentService.create(studentData);
    const updatedStudent = await studentService.update(createdStudent.id, {
        registration: "S99999",
    });

    assert.strictEqual(updatedStudent?.registration, "S99999");
});

test('should delete student', async () => {
    const studentData = {
        user: {
            name: "John Doe",
            email: "john@example.com",
            password: "password123"
        },
        registration: "S12345",
    };

    const createdStudent = await studentService.create(studentData);
    await studentService.delete(createdStudent.id);

    const foundStudent = await studentService.findById(createdStudent.id);
    assert.strictEqual(foundStudent, null);
});