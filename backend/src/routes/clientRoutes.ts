import { Router } from "express";
import {
  getClients,
  getClientById,
  createClient,
  updateClient,
  toggleClientActive,
  addClientNote,
  transferClient,
  deleteClient,
} from "../controllers/clientController";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.use(requireAuth);

router.get("/", getClients);
router.get("/:id", getClientById);
router.post("/", createClient);
router.put("/:id", updateClient);
router.patch("/:id/toggle-active", toggleClientActive);
router.post("/:id/notes", addClientNote);
router.post("/:id/transfer", transferClient);
router.delete("/:id", deleteClient);

export default router;