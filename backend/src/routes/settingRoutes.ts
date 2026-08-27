import { Router } from "express";
import {
  getSettings,
  createSetting,
  updateSetting,
  deleteSetting,
} from "../controllers/settingController";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.use(requireAuth);

router.get("/", getSettings);
router.post("/", createSetting);
router.put("/:id", updateSetting);
router.delete("/:id", deleteSetting);

export default router;