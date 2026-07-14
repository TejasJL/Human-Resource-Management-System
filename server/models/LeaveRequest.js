import mongoose from "mongoose";

const leaveRequestSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  leaveType: { type: String, enum: ["Casual Leave", "Sick Leave", "Paid Leave", "Unpaid Leave"], required: true },
  fromDate: { type: String, required: true }, // YYYY-MM-DD
  toDate: { type: String, required: true }, // YYYY-MM-DD
  isHalfDay: { type: Boolean, default: false },
  halfDayPeriod: { type: String, enum: ["First Half", "Second Half"] },
  reason: { type: String },
  status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" }
}, { timestamps: true });

export default mongoose.model("LeaveRequest", leaveRequestSchema);
