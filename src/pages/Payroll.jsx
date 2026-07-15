import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Briefcase, Download, PlayCircle, DollarSign, Trash2 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';


export default function Payroll() {
  const { user, token } = useSelector(state => state.auth);
  const [payrollHistory, setPayrollHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const isAdmin = user?.role === 'Admin';
  
  // Format current month to run payroll for
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const handleDownloadSlip = (slip) => {
    const doc = new jsPDF();
    
    // Header background
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('HRMS', 14, 25);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Salary Slip for ' + format(new Date(slip.month + '-01'), 'MMMM yyyy'), 14, 32);
    
    doc.setFontSize(9);
    doc.text('Mobicloud Technologies', 196, 20, { align: 'right' });
    doc.text('Tech Park, Cyber City', 196, 25, { align: 'right' });
    doc.text('support@mobicloud.com', 196, 30, { align: 'right' });

    // Employee Details Section
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Employee Details', 14, 55);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const emp = slip.employeeId || user;
    doc.text('Name:', 14, 65); doc.text(emp.fullName || 'N/A', 45, 65);
    doc.text('Employee ID:', 14, 73); doc.text(emp.employeeId || 'N/A', 45, 73);
    doc.text('Designation:', 110, 65); doc.text(emp.designation || 'N/A', 140, 65);
    doc.text('Month:', 110, 73); doc.text(slip.month || 'N/A', 140, 73);
    
    // Attendance & Leaves Table
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Attendance & Leaves', 14, 90);
    
    let finalY1 = 95;
    autoTable(doc, {
      startY: 95,
      theme: 'grid',
      headStyles: { fillColor: [240, 240, 240], textColor: [50, 50, 50], fontStyle: 'bold' },
      bodyStyles: { textColor: [80, 80, 80] },
      head: [['Description', 'Days']],
      body: [
        ['Total Working Days', slip.workingDays?.toString() || '0'],
        ['Present Days', slip.presentDays?.toString() || '0'],
        ['Absent Days', slip.absentDays?.toString() || '0'],
        ['Paid Leaves Used', slip.paidLeavesUsed?.toString() || '0'],
        ['Unpaid Leaves', slip.unpaidLeaves?.toString() || '0'],
        ['Late Marks', slip.lateMarks?.toString() || '0'],
      ],
      didDrawPage: (data) => { finalY1 = data.cursor.y; }
    });

    // Salary Structure Table
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Salary Details', 14, finalY1 + 15);

    let finalY2 = finalY1 + 20;
    autoTable(doc, {
      startY: finalY1 + 20,
      theme: 'grid',
      headStyles: { fillColor: [240, 240, 240], textColor: [50, 50, 50], fontStyle: 'bold' },
      bodyStyles: { textColor: [80, 80, 80] },
      head: [['Earnings / Deductions', 'Amount (INR)']],
      body: [
        ['Gross Salary (Monthly)', formatCurrency(slip.grossSalary)],
        ['Total Deduction (Absents + Late Marks)', '-' + formatCurrency(slip.totalDeductionAmount)],
        ['Net Payable Salary', formatCurrency(slip.netSalary)],
      ],
      didDrawPage: (data) => { finalY2 = data.cursor.y; }
    });
    
    // Net Pay highlight box
    doc.setFillColor(248, 250, 252);
    doc.rect(14, finalY2 + 10, 182, 15, 'F');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text('Net Pay: ' + formatCurrency(slip.netSalary), 20, finalY2 + 19);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 150, 150);
    doc.text('This is a computer generated salary slip and does not require a signature.', 105, 280, { align: 'center' });

    doc.save(`Salary_Slip_${emp.fullName || 'Employee'}_${slip.month}.pdf`);
  };


  useEffect(() => {
    fetchPayroll();
  }, [isAdmin]);

  const fetchPayroll = async () => {
    try {
      const endpoint = isAdmin ? '/api/payroll/history' : '/api/payroll/my';
      const res = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setPayrollHistory(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePayroll = async (id) => {
    if (!window.confirm('Are you sure you want to delete this orphaned payroll record?')) return;
    try {
      const res = await fetch(`/api/payroll/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchPayroll();
      } else {
        const error = await res.json();
        alert(error.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRunPayroll = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/payroll/run', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ month: selectedMonth })
      });
      if (res.ok) {
        fetchPayroll();
      } else {
        const error = await res.json();
        alert(error.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return 'Rs. ' + new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(amount || 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Payroll</h1>
          <p className="text-gray-500 mt-1">{isAdmin ? 'Manage and run monthly payroll cycles.' : 'View your salary slips and deduction history.'}</p>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-3">
            <input 
              type="month" 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-4 py-2 border border-gray-100 rounded-xl text-sm text-gray-700 bg-white"
            />
            <button 
              onClick={handleRunPayroll}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-premium shadow-blue-600/20 disabled:bg-blue-400"
            >
              <PlayCircle size={18} />
              {loading ? 'Running...' : 'Run Payroll'}
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-3xl shadow-premium border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">{isAdmin ? 'Payroll History' : 'My Salary Slips'}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-50">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Month</th>
                {isAdmin && <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee</th>}
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Gross Salary</th>
                {isAdmin && <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Paid Leave</th>}
                {isAdmin && <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Unpaid Leave</th>}
                {isAdmin && <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Absent Days</th>}
                {isAdmin && <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Late Mark Ded.</th>}
                {isAdmin && <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Deduction</th>}
                {!isAdmin && <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Deductions (Days)</th>}
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Net Salary</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Slip</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {payrollHistory.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} className="px-6 py-12 text-center">
                    <div className="mx-auto w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                      <Briefcase className="text-gray-500" size={24} />
                    </div>
                    <h3 className="text-sm font-medium text-gray-900">No payroll records</h3>
                    <p className="mt-1 text-sm text-gray-500">Run a payroll cycle to see records here.</p>
                  </td>
                </tr>
              ) : (
                payrollHistory.map((payroll) => (
                  <tr key={payroll._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {payroll.month}
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{payroll.employeeId?.fullName || <span className="text-gray-400 italic">Deleted Employee</span>}</div>
                        <div className="text-xs text-gray-500">{payroll.employeeId?.employeeId || '-'}</div>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                      {formatCurrency(payroll.grossSalary)}
                    </td>
                    {isAdmin ? (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-blue-600">{payroll.paidLeavesUsed}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-orange-600">{payroll.unpaidLeaves}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-red-600">{payroll.absentDays}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-red-600"><span className="font-bold">{payroll.lateMarks}</span> <span className="text-xs text-gray-500">({payroll.lateMarkDeductions}d)</span></td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-red-600">-{formatCurrency(payroll.totalDeductionAmount)}</td>
                      </>
                    ) : (
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                        <div className="inline-flex items-center px-2 py-1 bg-red-50 text-red-700 rounded-md text-xs font-medium border border-red-100">
                          {payroll.absentDays + payroll.lateMarkDeductions + payroll.unpaidLeaves} days
                        </div>
                        <div className="text-[10px] text-gray-500 mt-1">
                          A:{payroll.absentDays} | L:{payroll.lateMarkDeductions} | U:{payroll.unpaidLeaves}
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-gray-900">
                      {formatCurrency(payroll.netSalary)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleDownloadSlip(payroll)} className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition-colors inline-flex items-center gap-2">
                          <Download size={16} />
                          <span className="sr-only sm:not-sr-only sm:text-xs">PDF</span>
                        </button>
                        {isAdmin && !payroll.employeeId && (
                          <button 
                            onClick={() => handleDeletePayroll(payroll._id)} 
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors inline-flex items-center"
                            title="Delete orphaned record"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
