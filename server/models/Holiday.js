import mongoose from "mongoose";

const holidaySchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  description: { type: String }
}, { timestamps: true });

export default mongoose.model("Holiday", holidaySchema);
