import Payroll from "../models/Payroll.js";
import User from "../models/User.js";
import Attendance from "../models/Attendance.js";
import LeaveRequest from "../models/LeaveRequest.js";
import { parseISO, format, getDaysInMonth, lastDayOfMonth } from "date-fns";

export const runPayroll = async (req, res) => {
  try {
    const { month } = req.body; // YYYY-MM
    
    // Parse the month to get days
    const [yearStr, monthStr] = month.split("-");
    const workingDays = getDaysInMonth(new Date(parseInt(yearStr), parseInt(monthStr) - 1));

    const employees = await User.find({ role: "Employee", status: "Active" }).populate("employmentType");

    const payrollResults = [];

    for (let emp of employees) {
      // 1. Calculate Attendance
      const attendances = await Attendance.find({
        employeeId: emp._id,
        date: { $regex: `^${month}` }
      });

      let presentDays = 0;
      let lateMarks = 0;

      attendances.forEach(att => {
        if (att.punches && att.punches.length > 0) {
          presentDays += 1;
        }
        if (att.isLate) {
          lateMarks += 1;
        }
      });

      // 2. Calculate Leaves
      const approvedLeaves = await LeaveRequest.find({
        employeeId: emp._id,
        status: "Approved",
        $or: [
          { fromDate: { $regex: `^${month}` } },
          { toDate: { $regex: `^${month}` } }
        ]
      });

      let paidLeavesUsedThisMonth = 0;
      let unpaidLeavesThisMonth = 0;
      
      // Simplifying leave counting for the assignment (assuming leaves are within the month)
      approvedLeaves.forEach(leave => {
        let days = 1;
        if (leave.fromDate !== leave.toDate) {
          days = (new Date(leave.toDate) - new Date(leave.fromDate)) / (1000 * 60 * 60 * 24) + 1;
        }
        if (leave.isHalfDay) days = 0.5;

        if (leave.leaveType === "Unpaid Leave") {
          unpaidLeavesThisMonth += days;
        } else {
          paidLeavesUsedThisMonth += days;
        }
      });

      // Calculate missing days (Absent)
      const expectedDays = presentDays + paidLeavesUsedThisMonth + unpaidLeavesThisMonth;
      const absentDays = Math.max(0, workingDays - expectedDays);

      // 3. Late Mark Rule & Deduction (Every late mark = 0.5 day deduction)
      let lateMarkDeductionDays = lateMarks * 0.5;

      // Find YTD paid leaves used to correctly calculate available paid leaves
      const startOfYearStr = `${new Date().getFullYear()}-01-01`;
      const ytdApprovedLeaves = await LeaveRequest.find({
        employeeId: emp._id,
        status: "Approved",
        leaveType: { $in: ["Paid Leave", "paid leave"] },
        fromDate: { $gte: startOfYearStr }
      });
      let ytdPaidLeavesUsed = 0;
      ytdApprovedLeaves.forEach(leave => {
        let days = 1;
        if (leave.fromDate !== leave.toDate) {
          days = (new Date(leave.toDate) - new Date(leave.fromDate)) / (1000 * 60 * 60 * 24) + 1;
        }
        if (leave.isHalfDay) days = 0.5;
        ytdPaidLeavesUsed += days;
      });

      // Leave Adjustment Rule
      let policyPaidLeaves = emp.employmentType?.leavePolicy?.paid || 0;
      let availablePaidLeaves = Math.max(0, policyPaidLeaves - ytdPaidLeavesUsed);

      let totalDaysToDeduct = absentDays + lateMarkDeductionDays;

      if (availablePaidLeaves > 0) {
        if (availablePaidLeaves >= totalDaysToDeduct) {
          // Can cover entirely with paid leaves
          paidLeavesUsedThisMonth += totalDaysToDeduct;
          totalDaysToDeduct = 0;
        } else {
          // Partially cover
          paidLeavesUsedThisMonth += availablePaidLeaves;
          totalDaysToDeduct -= availablePaidLeaves;
        }
      }

      // Add unpaid leaves to total deductions
      totalDaysToDeduct += unpaidLeavesThisMonth;

      // 4. Payroll Math
      const monthlySalary = emp.monthlySalary || 0;
      const perDaySalary = monthlySalary / workingDays;
      const totalDeductionAmount = totalDaysToDeduct * perDaySalary;
      const netSalary = Math.max(0, monthlySalary - totalDeductionAmount);

      const payrollEntry = await Payroll.findOneAndUpdate(
        { employeeId: emp._id, month },
        {
          grossSalary: monthlySalary,
          workingDays,
          presentDays,
          absentDays,
          paidLeavesUsed: paidLeavesUsedThisMonth,
          unpaidLeaves: unpaidLeavesThisMonth,
          lateMarks,
          lateMarkDeductions: lateMarkDeductionDays,
          totalDeductionAmount,
          netSalary
        },
        { new: true, upsert: true }
      );

      payrollResults.push(payrollEntry);
    }

    res.status(200).json({ message: "Payroll processed successfully", payroll: payrollResults });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getPayrollHistory = async (req, res) => {
  try {
    const history = await Payroll.find().populate("employeeId", "fullName employeeId designation email").sort({ month: -1 });
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getMySalarySlips = async (req, res) => {
  try {
    const slips = await Payroll.find({ employeeId: req.user.id }).populate("employeeId", "fullName employeeId designation email").sort({ month: -1 });
    res.status(200).json(slips);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};