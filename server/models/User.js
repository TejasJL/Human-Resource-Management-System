import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phoneNumber: { type: String },
  dateOfJoining: { type: Date, required: true },
  designation: { type: String, required: true },
  monthlySalary: { type: Number, required: true },
  employmentType: { type: mongoose.Schema.Types.ObjectId, ref: "EmploymentType", required: true },
  reportingManager: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  role: { type: String, enum: ["Admin", "Employee"], default: "Employee" },
  status: { type: String, enum: ["Active", "Inactive"], default: "Active" }
}, { timestamps: true });

export default mongoose.model("User", userSchema);
