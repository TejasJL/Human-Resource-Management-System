import express from "express";
import { authenticate, authorizeAdmin } from "../middleware/authMiddleware.js";
import { addHoliday, getHolidays, deleteHoliday } from "../controllers/holidayController.js";

const router = express.Router();

router.get("/", authenticate, getHolidays);
router.post("/", authenticate, authorizeAdmin, addHoliday);
router.delete("/:id", authenticate, authorizeAdmin, deleteHoliday);

export default router;
