import User from '../models/User.js';
import EmploymentType from '../models/EmploymentType.js';
import LeaveRequest from "../models/LeaveRequest.js";
import Payroll from "../models/Payroll.js";

export const applyLeave = async (req, res) => {
  try {
    const { leaveType, fromDate, toDate, isHalfDay, halfDayPeriod, reason } = req.body;
    const employeeId = req.user.id;

    const newLeave = new LeaveRequest({
      employeeId, leaveType, fromDate, toDate, isHalfDay, halfDayPeriod, reason
    });

    await newLeave.save();
    res.status(201).json({ message: "Leave applied successfully", leave: newLeave });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getMyLeaves = async (req, res) => {
  try {
    const leaves = await LeaveRequest.find({ employeeId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(leaves);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getAllLeaves = async (req, res) => {
  try {
    const leaves = await LeaveRequest.find().populate("employeeId", "fullName employeeId").sort({ createdAt: -1 });
    res.status(200).json(leaves);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateLeaveStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const leave = await LeaveRequest.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!leave) return res.status(404).json({ message: "Leave request not found" });
    res.status(200).json({ message: `Leave ${status}`, leave });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
export const getLeaveBalances = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('employmentType');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    if (!user.employmentType) {
      // Return zero balances if no employment type
      return res.json([
        { type: 'Paid Leave', total: 0, used: 0, remaining: 0 },
        { type: 'Casual Leave', total: 0, used: 0, remaining: 0 },
        { type: 'Sick Leave', total: 0, used: 0, remaining: 0 },
        { type: 'Unpaid Leave', total: 'Unlimited', used: 0, remaining: 'Unlimited' }
      ]);
    }
    
    // The policy object is evaluated safely below
    
    const startOfYearStr = `${new Date().getFullYear()}-01-01`;
    
    const payrolls = await Payroll.find({ 
      employeeId: req.user.id,
      month: { $regex: `^${new Date().getFullYear()}` }
    });
    const payrolledMonths = payrolls.map(p => p.month);
    let payrollPaidUsed = 0;
    let payrollUnpaidUsed = 0;
    payrolls.forEach(p => {
      payrollPaidUsed += p.paidLeavesUsed || 0;
      payrollUnpaidUsed += p.unpaidLeaves || 0;
    });
    
    const approvedLeaves = await LeaveRequest.find({
      employeeId: req.user.id,
      status: 'Approved',
      fromDate: { $gte: startOfYearStr }
    });
    
    const used = { casual: 0, sick: 0, paid: 0, unpaid: 0 };
    
    approvedLeaves.forEach(leave => {
      const msPerDay = 1000 * 60 * 60 * 24;
      let days = Math.ceil((new Date(leave.toDate) - new Date(leave.fromDate)) / msPerDay) + 1;
      if (leave.isHalfDay) days = 0.5;
      
      const typeMap = {
        'casual leave': 'casual', 'sick leave': 'sick', 'paid leave': 'paid', 'unpaid leave': 'unpaid',
        'casual': 'casual', 'sick': 'sick'
      };
      const key = typeMap[leave.leaveType.toLowerCase()];
      if (key && used[key] !== undefined) {
        const leaveMonth = leave.fromDate.substring(0, 7);
        if ((key === 'paid' || key === 'unpaid') && payrolledMonths.includes(leaveMonth)) {
          return;
        }
        used[key] += days;
      }
    });

    used.paid += payrollPaidUsed;
    used.unpaid += payrollUnpaidUsed;
    
    const policy = user.employmentType.leavePolicy || {};
    const pPaid = policy.paid || 0;
    const pCasual = policy.casual || 0;
    const pSick = policy.sick || 0;
    const pUnpaid = policy.unpaid || 9999;
    
    const balances = [
      { type: 'Paid Leave', total: pPaid, used: used.paid, remaining: pPaid - used.paid },
      { type: 'Casual Leave', total: pCasual, used: used.casual, remaining: pCasual - used.casual },
      { type: 'Sick Leave', total: pSick, used: used.sick, remaining: pSick - used.sick },
      { type: 'Unpaid Leave', total: pUnpaid === 9999 ? 'Unlimited' : pUnpaid, used: used.unpaid, remaining: pUnpaid === 9999 ? 'Unlimited' : pUnpaid - used.unpaid }
    ];
    
    res.json(balances);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteLeave = async (req, res) => {
  try {
    const { id } = req.params;
    await LeaveRequest.findByIdAndDelete(id);
    res.status(200).json({ message: "Leave record deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
