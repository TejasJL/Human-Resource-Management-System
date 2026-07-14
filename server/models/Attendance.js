import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  punches: [{
    type: { type: String, enum: ["In", "Out"], required: true },
    timestamp: { type: Date, required: true }
  }],
  totalWorkingHours: { type: Number, default: 0 },
  totalBreakDuration: { type: Number, default: 0 },
  isLate: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model("Attendance", attendanceSchema);
