import { Router } from "express";
import { syncOneCRealization } from "../controllers/oneCController";

const router = Router();

// Эндпоинт приёма реализаций (может вызываться напрямую регламентным заданием / OData 1С)
router.post("/sync-realization", syncOneCRealization);

export default router;