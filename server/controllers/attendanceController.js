import Attendance from "../models/Attendance.js";
import User from "../models/User.js";
import LeaveRequest from "../models/LeaveRequest.js";
import { format, differenceInMinutes, parseISO, getDaysInMonth } from "date-fns";

export const punchIn = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const dateStr = format(now, "yyyy-MM-dd");

    let attendance = await Attendance.findOne({ employeeId: userId, date: dateStr });

    const isLate = () => {
      // 09:30 AM logic
      const targetTime = new Date(now);
      targetTime.setHours(9, 30, 0, 0);
      return now > targetTime;
    };

    if (!attendance) {
      attendance = new Attendance({
        employeeId: userId,
        date: dateStr,
        punches: [{ type: "In", timestamp: now }],
        isLate: isLate()
      });
    } else {
      const lastPunch = attendance.punches[attendance.punches.length - 1];
      if (lastPunch && lastPunch.type === "In") {
        return res.status(400).json({ message: "Already punched in" });
      }
      attendance.punches.push({ type: "In", timestamp: now });
    }

    await attendance.save();
    res.status(200).json(attendance);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const punchOut = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const dateStr = format(now, "yyyy-MM-dd");

    const attendance = await Attendance.findOne({ employeeId: userId, date: dateStr });

    if (!attendance) {
      return res.status(400).json({ message: "No punch in found for today" });
    }

    const lastPunch = attendance.punches[attendance.punches.length - 1];
    if (lastPunch.type === "Out") {
      return res.status(400).json({ message: "Already punched out" });
    }

    attendance.punches.push({ type: "Out", timestamp: now });

    // Calculate times
    let totalWorkingMinutes = 0;
    let totalBreakMinutes = 0;
    let lastInTime = null;
    let lastOutTime = null;

    attendance.punches.forEach(punch => {
      if (punch.type === "In") {
        lastInTime = punch.timestamp;
        if (lastOutTime) {
          totalBreakMinutes += differenceInMinutes(punch.timestamp, lastOutTime);
        }
      } else if (punch.type === "Out") {
        if (lastInTime) {
          totalWorkingMinutes += differenceInMinutes(punch.timestamp, lastInTime);
        }
        lastOutTime = punch.timestamp;
      }
    });

    attendance.totalWorkingHours = (totalWorkingMinutes / 60).toFixed(2);
    attendance.totalBreakDuration = (totalBreakMinutes / 60).toFixed(2);

    await attendance.save();
    res.status(200).json(attendance);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getMyAttendance = async (req, res) => {
  try {
    const { month, year } = req.query; // optional filters
    let query = { employeeId: req.user.id };
    
    if (month && year) {
      query.date = { $regex: `^${year}-${month.padStart(2, '0')}` };
    }

    const attendance = await Attendance.find(query).sort({ date: -1 });
    res.status(200).json(attendance);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getAllAttendance = async (req, res) => {
  try {
    const { employeeId, dateRange, month } = req.query;
    let query = {};

    if (employeeId) query.employeeId = employeeId;
    if (month) {
      query.date = { $regex: `^${month}` };
    } else if (dateRange) {
      // dateRange format: YYYY-MM-DD,YYYY-MM-DD
      const [start, end] = dateRange.split(',');
      if (start && end) {
        query.date = { $gte: start, $lte: end };
      }
    }

    const attendance = await Attendance.find(query).populate("employeeId", "fullName employeeId email").sort({ date: -1 });
    res.status(200).json(attendance);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getAttendanceReport = async (req, res) => {
  try {
    const { month } = req.query; // YYYY-MM
    if (!month) {
      return res.status(400).json({ message: "Month is required" });
    }

    const [yearStr, monthStr] = month.split("-");
    const workingDays = getDaysInMonth(new Date(parseInt(yearStr), parseInt(monthStr) - 1));

    const employees = await User.find({ role: "Employee", status: "Active" }).select("fullName employeeId designation");

    const report = [];

    for (let emp of employees) {
      const attendances = await Attendance.find({
        employeeId: emp._id,
        date: { $regex: `^${month}` }
      });

      let presentDays = 0;
      let lateMarks = 0;

      attendances.forEach(att => {
        if (att.punches && att.punches.length > 0) presentDays += 1;
        if (att.isLate) lateMarks += 1;
      });

      const approvedLeaves = await LeaveRequest.find({
        employeeId: emp._id,
        status: "Approved",
        $or: [
          { fromDate: { $regex: `^${month}` } },
          { toDate: { $regex: `^${month}` } }
        ]
      });

      let leaveDays = 0;
      approvedLeaves.forEach(leave => {
        let days = 1;
        if (leave.fromDate !== leave.toDate) {
          days = (new Date(leave.toDate) - new Date(leave.fromDate)) / (1000 * 60 * 60 * 24) + 1;
        }
        if (leave.isHalfDay) days = 0.5;
        leaveDays += days;
      });

      const expectedDays = presentDays + leaveDays;
      const absentDays = Math.max(0, workingDays - expectedDays);

      report.push({
        employeeId: emp._id,
        fullName: emp.fullName,
        employeeCode: emp.employeeId,
        designation: emp.designation,
        totalWorkingDays: workingDays,
        presentDays,
        absentDays,
        lateMarks,
        leaveDays
      });
    }

    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    await Attendance.findByIdAndDelete(id);
    res.status(200).json({ message: "Attendance record deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};