import express from "express";
import { authenticate, authorizeAdmin } from "../middleware/authMiddleware.js";
import { applyLeave, getMyLeaves, getAllLeaves, updateLeaveStatus, getLeaveBalances } from "../controllers/leaveController.js";

const router = express.Router();

router.get("/balances", authenticate, getLeaveBalances);
router.post("/apply", authenticate, applyLeave);
router.get("/my", authenticate, getMyLeaves);

router.get("/", authenticate, authorizeAdmin, getAllLeaves);
router.put("/:id/status", authenticate, authorizeAdmin, updateLeaveStatus);

export default router;
