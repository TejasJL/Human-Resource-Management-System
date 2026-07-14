import EmploymentType from "../models/EmploymentType.js";

export const getEmploymentTypes = async (req, res) => {
  try {
    const types = await EmploymentType.find();
    res.json(types);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createEmploymentType = async (req, res) => {
  try {
    const { name, leavePolicy } = req.body;
    const newType = new EmploymentType({ name, leavePolicy });
    await newType.save();
    res.status(201).json(newType);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const updateEmploymentType = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, leavePolicy } = req.body;
    const updated = await EmploymentType.findByIdAndUpdate(id, { name, leavePolicy }, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteEmploymentType = async (req, res) => {
  try {
    const { id } = req.params;
    await EmploymentType.findByIdAndDelete(id);
    res.json({ message: 'Employment type deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
