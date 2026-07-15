import express from "express";
import { authenticate, authorizeAdmin } from "../middleware/authMiddleware.js";
import { applyLeave, getMyLeaves, getAllLeaves, updateLeaveStatus, getLeaveBalances, deleteLeave } from "../controllers/leaveController.js";

const router = express.Router();

router.get("/balances", authenticate, getLeaveBalances);
router.post("/apply", authenticate, applyLeave);
router.get("/my", authenticate, getMyLeaves);

router.get("/", authenticate, authorizeAdmin, getAllLeaves);
router.put("/:id/status", authenticate, authorizeAdmin, updateLeaveStatus);
router.delete("/:id", authenticate, authorizeAdmin, deleteLeave);

export default router;
