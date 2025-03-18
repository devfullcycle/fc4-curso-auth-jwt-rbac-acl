import { Router } from "express";
import { createCourseService } from "../services/CourseService";
import { Roles } from "../entities/User";
import { UnauthorizedError } from "../errors";
import { rolesMiddleware } from "./authorization-patterns";

const courseRouter = Router();

// GET /courses - Lista todos os cursos
courseRouter.get("/courses", async (req, res, next) => {
  try {
    const courseService = await createCourseService();
    const courses = await courseService.findAll();
    return res.json(courses);
  } catch (error) {
    next(error);
  }
});

// GET /courses/:id - Obtém um curso pelo ID
courseRouter.get("/courses/:id", async (req, res, next) => {
  try {
    const courseService = await createCourseService();
    const id = parseInt(req.params.id);
    const course = await courseService.findById(id);
    if (!course) {
      return res.status(404).json({ message: "Curso não encontrado" });
    }
    return res.json(course);
  } catch (error) {
    next(error);
  }
});

// POST /courses - Cria um novo curso
courseRouter.post(
  "/courses",
  rolesMiddleware([Roles.Admin, Roles.Teacher]),
  async (req, res, next) => {
    // if (
    //   !req.user.roles.includes(Roles.Admin) &&
    //   !req.user.roles.includes(Roles.Teacher)
    // ) {
    //   return next(new UnauthorizedError());
    // }

    try {
      const courseService = await createCourseService();
      const { name, code, description, credits, semester, teacherId } =
        req.body;
      const course = await courseService.create({
        name,
        code,
        description,
        credits,
        semester,
        teacherId,
      });
      return res.status(201).json(course);
    } catch (error) {
      next(error);
    }
  }
);

// PUT /courses/:id - Atualiza um curso existente
courseRouter.patch("/courses/:id", async (req, res, next) => {
  try {
    const courseService = await createCourseService();
    const id = parseInt(req.params.id);
    const { name, code, description, credits, semester, teacherId } = req.body;
    const course = await courseService.update(id, {
      name,
      code,
      description,
      credits,
      semester,
      teacherId,
    });
    if (!course) {
      return res.status(404).json({ message: "Curso não encontrado" });
    }
    return res.json(course);
  } catch (error) {
    next(error);
  }
});

// DELETE /courses/:id - Remove um curso
courseRouter.delete("/courses/:id", async (req, res, next) => {
  try {
    const courseService = await createCourseService();
    const id = parseInt(req.params.id);
    const course = await courseService.findById(id);
    if (!course) {
      return res.status(404).json({ message: "Curso não encontrado" });
    }
    await courseService.delete(id);
    return res.status(204).end();
  } catch (error) {
    next(error);
  }
});

// GET /teachers/:teacherId/courses - Lista cursos de um professor
courseRouter.get("/teachers/:teacherId/courses", async (req, res, next) => {
  try {
    const courseService = await createCourseService();
    const teacherId = parseInt(req.params.teacherId);
    const courses = await courseService.findByTeacher(teacherId);
    return res.json(courses);
  } catch (error) {
    next(error);
  }
});

// GET /students/:studentId/courses - Lista cursos de um aluno
courseRouter.get("/students/:studentId/courses", async (req, res, next) => {
  try {
    const courseService = await createCourseService();
    const studentId = parseInt(req.params.studentId);
    const courses = await courseService.findByStudent(studentId);
    return res.json(courses);
  } catch (error) {
    next(error);
  }
});

export { courseRouter };
