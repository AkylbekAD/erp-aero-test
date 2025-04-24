import express, { Request, Response } from "express";
import multer from "multer";
import path from "path";
import authMiddleware from "../middleware/authMiddleware";

const router = express.Router();

const upload = multer({
	dest: path.join(__dirname, "../uploads"),
	limits: { fileSize: 100 * 1024 * 1024 },
});

router.post("/file/upload", authMiddleware, upload.single("file"));

router.get("/file/list", authMiddleware);

router.get("/file/:id", authMiddleware);

router.get("/file/download/:id", authMiddleware);

router.delete("/file/delete/:id", authMiddleware);

router.put("/file/update/:id", authMiddleware, upload.single("file"));

export default router;
