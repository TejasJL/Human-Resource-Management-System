import mongoose from "mongoose";

const payrollSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  month: { type: String, required: true }, // YYYY-MM
  grossSalary: { type: Number, required: true },
  workingDays: { type: Number, required: true },
  presentDays: { type: Number, required: true },
  absentDays: { type: Number, default: 0 },
  paidLeavesUsed: { type: Number, default: 0 },
  unpaidLeaves: { type: Number, default: 0 },
  lateMarks: { type: Number, default: 0 },
  lateMarkDeductions: { type: Number, default: 0 }, // in days
  totalDeductionAmount: { type: Number, default: 0 },
  netSalary: { type: Number, required: true }
}, { timestamps: true });

export default mongoose.model("Payroll", payrollSchema);
