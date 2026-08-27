import { Router } from "express";
import {
  getScheduleEvents,
  createScheduleEvent,
  updateScheduleEvent,
  addStudentToEvent,
  deleteScheduleEvent,
} from "../controllers/scheduleController";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.use(requireAuth);

router.get("/", getScheduleEvents);
router.post("/", createScheduleEvent);
router.put("/:id", updateScheduleEvent);
router.post("/:id/students", addStudentToEvent);
router.delete("/:id", deleteScheduleEvent);

export default router;