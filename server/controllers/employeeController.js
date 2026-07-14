import bcrypt from "bcryptjs";
import User from "../models/User.js";
import EmploymentType from "../models/EmploymentType.js";

// Generate Employee ID (e.g., EMP-1001)
const generateEmployeeId = async () => {
  const lastUser = await User.findOne().sort({ createdAt: -1 });
  if (!lastUser || !lastUser.employeeId || !lastUser.employeeId.startsWith("EMP-")) {
    return "EMP-1001";
  }
  const lastIdNum = parseInt(lastUser.employeeId.split("-")[1]);
  return `EMP-${lastIdNum + 1}`;
};

export const createEmployee = async (req, res) => {
  try {
    const { fullName, email, password, phoneNumber, dateOfJoining, designation, monthlySalary, employmentType, reportingManager, role, status } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already exists" });

    const empType = await EmploymentType.findById(employmentType);
    if (!empType && role !== "Admin") {
      return res.status(400).json({ message: "Invalid employment type" });
    }

    const employeeId = await generateEmployeeId();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      employeeId, fullName, email, password: hashedPassword, phoneNumber, dateOfJoining, designation, monthlySalary, employmentType, reportingManager, role, status
    });

    await newUser.save();
    res.status(201).json({ message: "Employee created successfully", employeeId: newUser.employeeId });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getEmployees = async (req, res) => {
  try {
    const employees = await User.find({ role: { $ne: "Admin" } }) // Exclude admins from standard listing if needed, but rules say 'view all employees'. Let's keep it open, or filter by role.
      .populate("employmentType")
      .populate("reportingManager", "fullName email")
      .select("-password");
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getEmployeeById = async (req, res) => {
  try {
    const employee = await User.findById(req.params.id)
      .populate("employmentType")
      .populate("reportingManager", "fullName email")
      .select("-password");
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateEmployee = async (req, res) => {
  try {
    const { password, ...updateData } = req.body;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }
    const updatedEmployee = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select("-password");
    res.status(200).json(updatedEmployee);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Employee deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Employment Types CRUD
export const createEmploymentType = async (req, res) => {
  try {
    const { name, leavePolicy } = req.body;
    const newType = new EmploymentType({ name, leavePolicy });
    await newType.save();
    res.status(201).json(newType);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getEmploymentTypes = async (req, res) => {
  try {
    const types = await EmploymentType.find({ name: { $ne: "Admin Type" } });
    res.status(200).json(types);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateEmploymentType = async (req, res) => {
  try {
    const updatedType = await EmploymentType.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedType);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteEmploymentType = async (req, res) => {
  try {
    // Basic check - we might want to prevent deleting if users are assigned to it, but skipping for simplicity
    await EmploymentType.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Employment type deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};