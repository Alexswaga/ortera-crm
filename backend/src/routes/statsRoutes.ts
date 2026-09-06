import { Router } from "express";
import { getStatistics, createPartnerOffset } from "../controllers/statsController";
import { requireAuth, requireRoles } from "../middlewares/auth";

const router = Router();

router.use(requireAuth);
router.get("/", getStatistics);
router.post("/partner-offset", requireRoles(["admin"]), createPartnerOffset);

export default router;