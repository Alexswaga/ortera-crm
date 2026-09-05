import { Router } from "express";
import { getStatistics } from "../controllers/statsController";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.use(requireAuth);
router.get("/", getStatistics);

export default router;