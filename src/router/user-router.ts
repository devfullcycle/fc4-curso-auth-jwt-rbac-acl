import { Router, Request, Response, NextFunction } from "express";
import { createUserService } from "../services/UserService";

const userRouter = Router();

userRouter.get("/users/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userService = await createUserService();
    const id = parseInt(req.params.id);
    const user = await userService.findById(id);
    
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }
    
    return res.json(user);
  } catch (error) {
    next(error);
  }
});

userRouter.post("/users", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userService = await createUserService();
    const { name, email, password } = req.body;
    const user = await userService.create({ name, email, password });
    return res.status(201).json(user);
  } catch (error) {
    next(error);
  }
});

userRouter.patch("/users/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userService = await createUserService();
    const id = parseInt(req.params.id);
    const { name, email, password } = req.body;
    
    const user = await userService.update(id, { name, email, password });
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }
    
    return res.json(user);
  } catch (error) {
    next(error);
  }
});

userRouter.delete("/users/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userService = await createUserService();
    const id = parseInt(req.params.id);
    
    const user = await userService.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }
    
    await userService.delete(id);
    return res.status(204).end();
  } catch (error) {
    next(error);
  }
});

export { userRouter };