import express, { Response, RequestHandler } from "express";
import authMiddleware from "../middleware/authMiddleware";
import refreshAuthToken from "../middleware/refreshAuthToken";
import { logoutHandler } from "../controllers/loginController";

const router = express.Router();

router.get("/logout", authMiddleware, refreshAuthToken, logoutHandler);

export default router;
