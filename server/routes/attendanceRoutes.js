import express from "express";
import { authenticate, authorizeAdmin } from "../middleware/authMiddleware.js";
import { punchIn, punchOut, getMyAttendance, getAllAttendance, getAttendanceReport, deleteAttendance } from "../controllers/attendanceController.js";

const router = express.Router();

router.post("/punch-in", authenticate, punchIn);
router.post("/punch-out", authenticate, punchOut);
router.get("/my", authenticate, getMyAttendance);

// Admin
router.get("/report", authenticate, authorizeAdmin, getAttendanceReport);
router.get("/", authenticate, authorizeAdmin, getAllAttendance);
router.delete("/:id", authenticate, authorizeAdmin, deleteAttendance);

export default router;
