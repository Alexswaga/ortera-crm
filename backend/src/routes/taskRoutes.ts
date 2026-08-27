import { Router } from "express";
import {
  getTasks,
  createTask,
  completeTask,
  postponeTask,
  deleteTask,
} from "../controllers/taskController";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.use(requireAuth);

router.get("/", getTasks);
router.post("/", createTask);
router.patch("/:id/complete", completeTask);
router.patch("/:id/postpone", postponeTask);
router.delete("/:id", deleteTask);

export default router;