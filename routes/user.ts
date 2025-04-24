import express, { Response, RequestHandler } from "express";
import authMiddleware from "../middleware/authMiddleware";
import { getUserInfoHandler } from "../controllers/userController";

const router = express.Router();

router.get("/info", authMiddleware, getUserInfoHandler);

export default router;
