import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import RolController from "../controllers/rol.controller";

const router = Router()

router.get('/', RolController.getRoles)

export default router