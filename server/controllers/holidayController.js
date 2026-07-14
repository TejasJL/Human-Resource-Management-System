import Holiday from "../models/Holiday.js";

export const addHoliday = async (req, res) => {
  try {
    const { name, date, description } = req.body;
    const newHoliday = new Holiday({ name, date, description });
    await newHoliday.save();
    res.status(201).json(newHoliday);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getHolidays = async (req, res) => {
  try {
    const holidays = await Holiday.find().sort({ date: 1 });
    res.status(200).json(holidays);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteHoliday = async (req, res) => {
  try {
    await Holiday.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Holiday deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};