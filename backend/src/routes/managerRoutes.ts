import { Router } from "express";
import {
  getManagers,
  getManagerById,
  createManager,
  updateManager,
  deleteManager,
} from "../controllers/managerController";
import { requireAuth, requireRoles } from "../middlewares/auth";

const router = Router();

router.use(requireAuth);

router.get("/", getManagers);
router.get("/:id", getManagerById);
router.post("/", requireRoles(["admin"]), createManager);
router.put("/:id", requireRoles(["admin"]), updateManager);
router.delete("/:id", requireRoles(["admin"]), deleteManager);

export default router;