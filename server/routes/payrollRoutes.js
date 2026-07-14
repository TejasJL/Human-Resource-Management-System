import express from "express";
import { authenticate, authorizeAdmin } from "../middleware/authMiddleware.js";
import { runPayroll, getPayrollHistory, getMySalarySlips } from "../controllers/payrollController.js";

const router = express.Router();

router.post("/run", authenticate, authorizeAdmin, runPayroll);
router.get("/history", authenticate, authorizeAdmin, getPayrollHistory);

router.get("/my", authenticate, getMySalarySlips);

export default router;
