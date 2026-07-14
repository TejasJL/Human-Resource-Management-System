import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Users, Search, Plus, Filter, MoreVertical, Mail, Phone, X } from 'lucide-react';

export default function Employees() {
  const { user, token } = useSelector(state => state.auth);
  const isAdmin = user?.role === 'Admin';
  const [employees, setEmployees] = useState([]);
  const [employmentTypes, setEmploymentTypes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const initialForm = { fullName: "", email: "", password: "", role: "Employee", designation: "", monthlySalary: "", phoneNumber: "", dateOfJoining: "", employmentType: "", status: "Active", reportingManager: "" };
  const [formData, setFormData] = useState({
    ...initialForm
  });

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...formData };
      if (editingEmployee && !payload.password) delete payload.password;
      
      if (payload.reportingManager === 'None' || !payload.reportingManager) {
        delete payload.reportingManager;
      }

      const url = editingEmployee ? `/api/employees/${editingEmployee._id}` : '/api/employees';
      const method = editingEmployee ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setIsModalOpen(false);
        setEditingEmployee(null);
        fetchEmployees();
        setFormData(initialForm);
      } else {
        const error = await res.json();
        alert(error.message);
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };
  
  const handleEditClick = (emp) => {
    setEditingEmployee(emp);
    setFormData({
      fullName: emp.fullName, email: emp.email, password: '', role: emp.role,
      designation: emp.designation, monthlySalary: emp.monthlySalary, 
      phoneNumber: emp.phoneNumber || '', dateOfJoining: emp.dateOfJoining ? emp.dateOfJoining.split('T')[0] : '', 
      employmentType: emp.employmentType?._id || '', status: emp.status, reportingManager: emp.reportingManager?._id || ''
    });
    setIsModalOpen(true);
  };

  const handleViewClick = (emp) => {
    setSelectedEmployee(emp);
    setIsViewModalOpen(true);
  };
  
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || emp.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'All' || emp.status === filterStatus;
    return matchesSearch && matchesStatus;
  });
  
  // dummy function to bypass original handleAddEmployee

  useEffect(() => {
    fetchEmployees();
    fetchEmploymentTypes();
  }, []);

  const fetchEmploymentTypes = async () => {
    try {
      const res = await fetch('/api/employment-types', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      setEmploymentTypes(data);
    } catch (err) { console.error(err); }
  };

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/employees', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setEmployees(data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Directory</h1>
          <p className="text-gray-500 mt-1">Manage your team members and their information.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-premium shadow-blue-600/20">
          <Plus size={18} />
          Add Employee
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-premium border border-gray-100 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="Search directory..." 
              value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all text-sm bg-white"
            />
          </div>
          <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-100 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors w-full sm:w-auto justify-center bg-white outline-none">
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-50">
            <thead className="bg-white">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role & Department</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="relative px-6 py-4"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="mx-auto w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                      <Users className="text-gray-500" size={24} />
                    </div>
                    <h3 className="text-sm font-medium text-gray-900">No employees found</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by adding a new team member.</p>
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp._id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-100 text-blue-700 flex items-center justify-center font-semibold text-sm border border-blue-200/50">
                          {emp.fullName.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{emp.fullName}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{emp.employeeId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{emp.designation}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{emp.employmentType?.name || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <Mail size={14} className="text-gray-500" />
                        {emp.email}
                      </div>
                      {emp.phoneNumber && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Phone size={14} className="text-gray-500" />
                          {emp.phoneNumber}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${emp.status === 'Active' ? 'bg-green-50 text-green-700 border border-green-200/50' : 'bg-red-50 text-red-700 border border-red-200/50'}`}>
                        {emp.status === 'Active' ? <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span> : <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1.5"></span>}
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleViewClick(emp)} className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">View</button>
                        {isAdmin && <button onClick={() => handleEditClick(emp)} className="text-gray-500 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">Edit</button>}
                        {isAdmin && <button onClick={async () => { if(window.confirm('Delete this employee?')) { await fetch(`/api/employees/${emp._id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } }); fetchEmployees(); }}} className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">Delete</button>}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>


      {isViewModalOpen && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50">
              <h2 className="text-xl font-semibold">Employee Profile</h2>
              <button onClick={() => setIsViewModalOpen(false)} className="text-gray-500 hover:text-gray-900"><X size={20} /></button>
            </div>
            <div className="p-8">
              <div className="flex items-center gap-6 mb-8">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-3xl font-bold">
                  {selectedEmployee.fullName.charAt(0)}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{selectedEmployee.fullName}</h1>
                  <p className="text-gray-500 font-medium">{selectedEmployee.designation}</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${
                    selectedEmployee.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedEmployee.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Employee ID</p>
                  <p className="font-medium">{selectedEmployee.employeeId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Email</p>
                  <p className="font-medium">{selectedEmployee.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Phone Number</p>
                  <p className="font-medium">{selectedEmployee.phoneNumber || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Date of Joining</p>
                  <p className="font-medium">{selectedEmployee.dateOfJoining ? new Date(selectedEmployee.dateOfJoining).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Role</p>
                  <p className="font-medium">{selectedEmployee.role}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Employment Type</p>
                  <p className="font-medium">{selectedEmployee.employmentType?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Monthly Salary</p>
                  <p className="font-medium">₹{selectedEmployee.monthlySalary?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Reporting Manager</p>
                  <p className="font-medium">{selectedEmployee.reportingManager?.fullName || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden my-8">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold">{editingEmployee ? 'Edit Employee' : 'Add Employee'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-900"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddEmployee} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                  <input required type="text" className="w-full px-4 py-2.5 rounded-xl border border-gray-100" value={formData.fullName} onChange={e=>setFormData({...formData, fullName: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <input required type="email" className="w-full px-4 py-2.5 rounded-xl border border-gray-100" value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                  <input required type="password" className="w-full px-4 py-2.5 rounded-xl border border-gray-100" value={formData.password} onChange={e=>setFormData({...formData, password: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
                  <select className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white" value={formData.role} onChange={e=>setFormData({...formData, role: e.target.value})}>
                    <option value="Employee">Employee</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Designation</label>
                  <input required type="text" className="w-full px-4 py-2.5 rounded-xl border border-gray-100" value={formData.designation} onChange={e=>setFormData({...formData, designation: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Monthly Salary</label>
                  <input required type="number" className="w-full px-4 py-2.5 rounded-xl border border-gray-100" value={formData.monthlySalary} onChange={e=>setFormData({...formData, monthlySalary: e.target.value})} />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                  <input required type="text" className="w-full px-4 py-2.5 rounded-xl border border-gray-100" value={formData.phoneNumber} onChange={e=>setFormData({...formData, phoneNumber: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Date of Joining</label>
                  <input required type="date" className="w-full px-4 py-2.5 rounded-xl border border-gray-100" value={formData.dateOfJoining} onChange={e=>setFormData({...formData, dateOfJoining: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Employment Type</label>
                  <select required className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white" value={formData.employmentType} onChange={e=>setFormData({...formData, employmentType: e.target.value})}>
                    <option value="">Select Type</option>
                    {employmentTypes.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                  <select required className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white" value={formData.status || 'Active'} onChange={e=>setFormData({...formData, status: e.target.value})}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

              </div>


              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Reporting Manager (Optional)</label>
                  <select className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white" value={formData.reportingManager || ''} onChange={e=>setFormData({...formData, reportingManager: e.target.value})}>
                    <option value="">None</option>
                    {employees.filter(e => e._id !== editingEmployee?._id).map(e => <option key={e._id} value={e._id}>{e.fullName} ({e.designation})</option>)}
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
