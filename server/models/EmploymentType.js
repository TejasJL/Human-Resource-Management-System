import mongoose from "mongoose";

const employmentTypeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g., "Full Time", "Intern", "Contractual"
  leavePolicy: {
    casual: { type: Number, default: 0 },
    sick: { type: Number, default: 0 },
    paid: { type: Number, default: 0 },
    unpaid: { type: Number, default: 0 } // Represents limit, but usually unlimited
  }
}, { timestamps: true });

export default mongoose.model("EmploymentType", employmentTypeSchema);
