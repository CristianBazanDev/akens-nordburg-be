import { Router } from "express";
import UserController from "../controllers/user.controller";

const router = Router()

router.get("/", UserController.getUser )

export default router