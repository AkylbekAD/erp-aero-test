import express from "express";
import { signup, signin, newToken } from "../controllers/authController";
const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/signin/new_token", newToken);

export default router;
