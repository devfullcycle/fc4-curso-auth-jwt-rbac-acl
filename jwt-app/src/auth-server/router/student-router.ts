import { Router } from "express";
import { createStudentService } from "../services/StudentService";

const studentRouter = Router();

// Rotas para alunos (students)
studentRouter.get("/students/", async (req, res, next) => {
  try {
    const studentService = await createStudentService();
    const students = await studentService.findAll();
    return res.json(students);
  } catch (error) {
    next(error);
  }
});

studentRouter.get("/students/:id", async (req, res, next) => {
  try {
    const studentService = await createStudentService();
    const id = parseInt(req.params.id);
    const student = await studentService.findById(id);
    if (!student) {
      return res.status(404).json({ message: "Estudante não encontrado" });
    }
    return res.json(student);
  } catch (error) {
    next(error);
  }
});

studentRouter.post("/students/", async (req, res, next) => {
  try {
    const studentService = await createStudentService();
    const { user, registration, mainCourse } = req.body;
    const student = await studentService.create({
      user,
      registration,
    });
    return res.status(201).json(student);
  } catch (error) {
    next(error);
  }
});

studentRouter.patch("/students/:id", async (req, res, next) => {
  try {
    const studentService = await createStudentService();
    const id = parseInt(req.params.id);
    const { registration } = req.body;
    const student = await studentService.update(id, {
      registration,
    });
    if (!student) {
      return res.status(404).json({ message: "Estudante não encontrado" });
    }
    return res.json(student);
  } catch (error) {
    next(error);
  }
});

studentRouter.delete("/students/:id", async (req, res, next) => {
  try {
    const studentService = await createStudentService();
    const id = parseInt(req.params.id);
    const student = await studentService.findById(id);
    if (!student) {
      return res.status(404).json({ message: "Estudante não encontrado" });
    }
    await studentService.delete(id);
    return res.status(204).end();
  } catch (error) {
    next(error);
  }
});

export { studentRouter };