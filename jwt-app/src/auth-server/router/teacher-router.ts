import { Router } from "express";
import { createTeacherService } from "../services/TeacherService";

const teacherRouter = Router();

// Rotas para professores (teachers)
teacherRouter.get("/teachers/", async (req, res, next) => {
  try {
    const teacherService = await createTeacherService();
    const teachers = await teacherService.findAll();
    return res.json(teachers);
  } catch (error) {
    next(error);
  }
});

teacherRouter.get("/teachers/:id", async (req, res, next) => {
  try {
    const teacherService = await createTeacherService();
    const id = parseInt(req.params.id);
    const teacher = await teacherService.findById(id);
    if (!teacher) {
      return res.status(404).json({ message: "Professor não encontrado" });
    }
    return res.json(teacher);
  } catch (error) {
    next(error);
  }
});

teacherRouter.post("/teachers/", async (req, res, next) => {
  try {
    const teacherService = await createTeacherService();
    const { user, department, registration } = req.body;
    const teacher = await teacherService.create({
      user,
      department,
      registration
    });
    return res.status(201).json(teacher);
  } catch (error) {
    next(error);
  }
});

teacherRouter.patch("/teachers/:id", async (req, res, next) => {
  try {
    const teacherService = await createTeacherService();
    const id = parseInt(req.params.id);
    const { department, registration } = req.body;
    const teacher = await teacherService.update(id, {
      department,
      registration
    });
    if (!teacher) {
      return res.status(404).json({ message: "Professor não encontrado" });
    }
    return res.json(teacher);
  } catch (error) {
    next(error);
  }
});

teacherRouter.delete("/teachers/:id", async (req, res, next) => {
  try {
    const teacherService = await createTeacherService();
    const id = parseInt(req.params.id);
    const teacher = await teacherService.findById(id);
    if (!teacher) {
      return res.status(404).json({ message: "Professor não encontrado" });
    }
    await teacherService.delete(id);
    return res.status(204).end();
  } catch (error) {
    next(error);
  }
});

export { teacherRouter };