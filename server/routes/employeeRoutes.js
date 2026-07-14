import express from "express";
import { authenticate, authorizeAdmin } from "../middleware/authMiddleware.js";
import { 
  createEmployee, getEmployees, getEmployeeById, updateEmployee, deleteEmployee,
  createEmploymentType, getEmploymentTypes, updateEmploymentType, deleteEmploymentType
} from "../controllers/employeeController.js";

const router = express.Router();

// Employment Types (Admin Only)
router.post("/employment-types", authenticate, authorizeAdmin, createEmploymentType);
router.get("/employment-types", authenticate, authorizeAdmin, getEmploymentTypes);
router.put("/employment-types/:id", authenticate, authorizeAdmin, updateEmploymentType);
router.delete("/employment-types/:id", authenticate, authorizeAdmin, deleteEmploymentType);

// Employees (Admin Only)
router.post("/", authenticate, authorizeAdmin, createEmployee);
router.get("/", authenticate, authorizeAdmin, getEmployees);
router.get("/:id", authenticate, authorizeAdmin, getEmployeeById);
router.put("/:id", authenticate, authorizeAdmin, updateEmployee);
router.delete("/:id", authenticate, authorizeAdmin, deleteEmployee);

export default router;
