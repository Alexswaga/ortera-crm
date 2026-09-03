import { Router } from "express";
import {
  getScheduleEvents,
  createScheduleEvent,
  updateScheduleEvent,
  addStudentToEvent,
  updateStudentPaymentStatus,
  removeStudentFromEvent,
  deleteScheduleEvent,
} from "../controllers/scheduleController";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.use(requireAuth);

router.get("/", getScheduleEvents);
router.post("/", createScheduleEvent);
router.put("/:id", updateScheduleEvent);
router.post("/:id/students", addStudentToEvent);
router.patch("/:eventId/students/:studentId/status", updateStudentPaymentStatus);
router.delete("/:eventId/students/:studentId", removeStudentFromEvent);
router.delete("/:id", deleteScheduleEvent);

export default router;