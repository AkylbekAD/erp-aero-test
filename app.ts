import express from "express";
import cors from "cors";
import dotenv from "dotenv";
const app = express();

dotenv.config();

app.use(cors());
app.use(express.json());

import authRoutes from "./routes/auth";
import userRoutes from "./routes/user";
import logoutRoutes from "./routes/logout";
import fileRoutes from "./routes/file";

app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", logoutRoutes);
app.use("/api", fileRoutes);

app.get("/", (req, res) => {
	res.send("ERP.AERO API is running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server started on port ${PORT}`);
});
