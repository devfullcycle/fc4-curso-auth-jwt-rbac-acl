import "reflect-metadata";
import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import { TeacherService } from "./TeacherService";
import { createDatabaseConnection, closeDatabaseConnection } from "../database";
import { Repository } from "typeorm";
import { Teacher } from "../entities/Teacher";
import { User } from "../entities/User";

let teacherService: TeacherService;
let teacherRepository: Repository<Teacher>;
let userRepository: Repository<User>;

beforeEach(async () => {
    const connection = await createDatabaseConnection();
    teacherRepository = connection.teacherRepository;
    userRepository = connection.userRepository;
    teacherService = new TeacherService(teacherRepository, userRepository);
});

afterEach(async () => {
    await closeDatabaseConnection();
});

test('should create a teacher with user', async () => {
    const teacherData = {
        user: {
            name: "John Doe",
            email: "john@example.com",
            password: "password123"
        },
        department: "Computer Science",
        registration: "T12345"
    };

    const teacher = await teacherService.create(teacherData);
    
    assert.strictEqual(teacher.department, teacherData.department);
    assert.strictEqual(teacher.registration, teacherData.registration);
    assert.strictEqual(teacher.user.name, teacherData.user.name);
    assert.strictEqual(teacher.user.email, teacherData.user.email);
});

test('should find all teachers', async () => {
    const teacherData1 = {
        user: {
            name: "John Doe",
            email: "john@example.com",
            password: "password123"
        },
        department: "Computer Science",
        registration: "T12345"
    };

    const teacherData2 = {
        user: {
            name: "Jane Smith",
            email: "jane@example.com",
            password: "password456"
        },
        department: "Mathematics",
        registration: "T67890"
    };

    await teacherService.create(teacherData1);
    await teacherService.create(teacherData2);

    const teachers = await teacherService.findAll();
    assert.strictEqual(teachers.length, 2);
    assert.strictEqual(teachers[0].user.name, teacherData1.user.name);
    assert.strictEqual(teachers[1].user.name, teacherData2.user.name);
});

test('should find teacher by id', async () => {
    const teacherData = {
        user: {
            name: "John Doe",
            email: "john@example.com",
            password: "password123"
        },
        department: "Computer Science",
        registration: "T12345"
    };

    const createdTeacher = await teacherService.create(teacherData);
    const foundTeacher = await teacherService.findById(createdTeacher.id);

    assert.strictEqual(foundTeacher?.department, teacherData.department);
    assert.strictEqual(foundTeacher?.user.name, teacherData.user.name);
});

test('should update teacher', async () => {
    const teacherData = {
        user: {
            name: "John Doe",
            email: "john@example.com",
            password: "password123"
        },
        department: "Computer Science",
        registration: "T12345"
    };

    const createdTeacher = await teacherService.create(teacherData);
    const updatedTeacher = await teacherService.update(createdTeacher.id, {
        department: "Information Systems",
        registration: "T99999"
    });

    assert.strictEqual(updatedTeacher?.department, "Information Systems");
    assert.strictEqual(updatedTeacher?.registration, "T99999");
});

test('should delete teacher', async () => {
    const teacherData = {
        user: {
            name: "John Doe",
            email: "john@example.com",
            password: "password123"
        },
        department: "Computer Science",
        registration: "T12345"
    };

    const createdTeacher = await teacherService.create(teacherData);
    await teacherService.delete(createdTeacher.id);

    const foundTeacher = await teacherService.findById(createdTeacher.id);
    assert.strictEqual(foundTeacher, null);
});