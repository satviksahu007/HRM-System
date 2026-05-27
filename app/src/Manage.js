import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {utils,writeFile} from 'xlsx'


function Manage() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [activeTab, setActiveTab] = useState("active"); // active | inactive
  const [inactiveSubTab, setInactiveSubTab] = useState("ex");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [extendModal, setExtendModal] = useState({ open: false, eha_id: null, name: "" });
  const [extendDays, setExtendDays] = useState(7);
  const observer = useRef();
  const PER_PAGE = 20;
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState("");
  const [rejectModal, setRejectModal] = useState({
    open: false,
    eha_id: null,
    name: "",
  });

  const [rejectRemarks, setRejectRemarks] = useState("");

  // Fetch employees
  const fetchEmployees = async (pageNum, status) => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/employees?page=${pageNum}&per_page=${PER_PAGE}&status=${status}`,
        { credentials: "include" }
      );
      const data = await res.json();
      if (res.ok) {
        if (pageNum === 1) {
          setEmployees(data.employees);
          console.log(data.employees)
          setFilteredEmployees(data.employees);
        } else {
          setEmployees(prev => [...prev, ...data.employees]);
          setFilteredEmployees(prev => [...prev, ...data.employees]);
        }
        setHasMore(data.employees.length === PER_PAGE);
      }
    } catch (error) {
      console.log("Error fetching employees:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    setPage(1);
    setEmployees([]);
    fetchEmployees(1,getStatusParam());
  }, [activeTab,inactiveSubTab]);

  const getStatusParam = () => {
    if (activeTab === "active") return 1;
    if (activeTab === "trial") return 2;
    if (activeTab === "inactive") {
      return inactiveSubTab === "ex" ? 0 : 3;
    }
    return 1;
  };

  const handleExtend = async (eha_id, name, days) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/extend_trial/${eha_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ days })
      });
      const data = await res.json();
      if (res.ok) {

        setSuccess({
          message: `Trial extended successfully`
        });

        setError("");

        fetchEmployees(1, getStatusParam());

      } else {

        setSuccess(null);
        setError(data.message || "Failed to extend trial");

      }
    } catch (error) {
      console.log(error);
    }
  };


  // Infinite scroll
  const lastEmployeeRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  const downloadAllEmployees = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/getemployees/all`, {
        credentials: "include"
      });
      const data = await res.json();
      
      if (!res.ok || (!data.active?.length && !data.inactive?.length && !data.trial?.length && !data.rejected?.length)) {

        setSuccess(null);
        setError("No employees found");

        return;
      }

      const headers = [
        "Emp Code", "First Name", "Middle Name", "Last Name", "DOB", "Gender", "Email", "Mobile",
        "Marital Status", "Spouse Name", "Spouse Mobile", "Spouse Email",
        "Father Name", "Father Mobile", "Mother Name", "Mother Mobile",
        "Aadhar", "PAN", "Bank Name", "Account Number", "IFSC", "Salary", "Expertise",
        "Joining Date", "Valid Till", "Photo", "Aadhar Photo", "Pan Photo", "Tenth Marksheet Photo",
        "Twelfth Marksheet Photo", "UG Degree Photo", "PG Degree Photo", "Status","remarks"
      ];

      const convertToSheetData = (employees, statusText) => {
        const rows = employees.map(emp => [
          emp.eha_id, emp.first_name, emp.middle_name, emp.last_name, emp.dob,
          emp.gender, emp.email, emp.mob_no,
          emp.marital_status, emp.spouse_name, emp.spouse_mob, emp.spouse_email,
          emp.father_name, emp.father_mobile, emp.mother_name, emp.mother_mobile,
          emp.aadhar, emp.pan, emp.bank_name, emp.bank_account_number, emp.bank_ifsc,
          emp.salary, emp.expertise, emp.joining_date, emp.valid_till,
          emp.photo_path, emp.aadhar_image_path, emp.pan_image_path, emp.tenth_marksheet_path,
          emp.twelfth_marksheet_path, emp.ug_degree_image_path, emp.pg_degree_image_path, statusText,emp.remarks
        ]);
        return [headers, ...rows];
      };

      const workbook = utils.book_new();

      // Active sheet
      if (data.active?.length) {
        const sheet = utils.aoa_to_sheet(convertToSheetData(data.active, "Active"));
        utils.book_append_sheet(workbook, sheet, "Active Employees");
      } else {
        utils.book_append_sheet(workbook, utils.aoa_to_sheet([headers, ["No Active employees found"]]), "Active Employees");
      }

      // Inactive sheet
      if (data.inactive?.length) {
        const sheet = utils.aoa_to_sheet(convertToSheetData(data.inactive, "Inactive"));
        utils.book_append_sheet(workbook, sheet, "Inactive Employees");
      } else {
        utils.book_append_sheet(workbook, utils.aoa_to_sheet([headers, ["No Inactive employees found"]]), "Inactive Employees");
      }

      // Rejected Trials sheet
      if (data.rejected?.length) {
        const sheet = utils.aoa_to_sheet(convertToSheetData(data.rejected, "Rejected"));
        utils.book_append_sheet(workbook, sheet, "Rejected Trials");
      } else {
        utils.book_append_sheet(workbook, utils.aoa_to_sheet([headers, ["No Rejected Trial employees found"]]), "Rejected Trials");
      }

      // Trial sheet
      if (data.trial?.length) {
        const sheet = utils.aoa_to_sheet(convertToSheetData(data.trial, "Trial"));
        utils.book_append_sheet(workbook, sheet, "Trial Employees");
      } else {
        utils.book_append_sheet(workbook, utils.aoa_to_sheet([headers, ["No Trial employees found"]]), "Trial Employees");
      }

      writeFile(workbook, `employees_all_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (e) {
      console.log("Download Error:", e);
    }
};

  useEffect(() => {
    if (page > 1) {
      fetchEmployees(page,getStatusParam());
    }
  }, [page]);

  // Search filter
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredEmployees(employees);
      return;
    }
    const term = searchTerm.toLowerCase();
    const filtered = employees.filter(
      (emp) =>
        emp.eha_id?.toLowerCase().includes(term) ||
        emp.mob_no?.toLowerCase().includes(term) ||
        emp.first_name?.toLowerCase().includes(term) ||
        emp.team_designations?.toLowerCase().includes(term) ||
        emp.last_name?.toLowerCase().includes(term) ||
        `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(term)
    );
    setFilteredEmployees(filtered);
  }, [searchTerm, employees]);

  // Terminate employee
  const handleTerminate = async (eha_id, name,remarks="") => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/terminate/${eha_id}`, {
        method: "PUT",
        credentials: "include",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({remarks})
      });
      const data = await res.json();
      if (res.ok) {

        setEmployees((prev) => prev.filter((emp) => emp.eha_id !== eha_id));

        setFilteredEmployees((prev) =>
          prev.filter((emp) => emp.eha_id !== eha_id)
        );

        setSuccess({
          message: `Employee ${name} terminated successfully`
        });

        setError("");

      } else {

        setSuccess(null);
        setError(data.message || "Failed to terminate employee");

      }
    } catch (error) {
      console.log("Error:", error);
    }
  };

  const formatSalary = (salary) => {
    if (!salary) return "—";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(salary);
  };

  const handleReactivate = async (eha_id, name) => {
  try {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/reactivate/${eha_id}`, {
      method: "PUT",
      credentials: "include",
    });
    const data = await res.json();
    if (res.ok) {

      setSuccess({
        message: "Employee reactivated successfully"
      });

      setError("");

      fetchEmployees(1, getStatusParam());

    }
  } catch (error) {
    console.log(error);
  }
};

  if (loading && employees.length === 0) {
    return (
      <div className="w-full min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-gray-400 text-lg">Loading employees...</div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-900 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8 ">
        <div className="flex justify-between">
          <h1 className="text-3xl font-bold text-white mb-2">Employee Management</h1>
          <button
            onClick={() =>navigate(`/Add_Employee`)}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all duration-200 disabled:opacity-50" 
             
          >
            Add Employee
          </button>
        </div>
        
        <p className="text-gray-400">View and manage all employees</p>
        
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        {/* Tabs */}
        <div className="flex bg-gray-800 rounded-lg p-1 gap-2">
          <button
            onClick={() => setActiveTab("active")}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === "active"
                ? "bg-indigo-600 text-white"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            Active Employees
          </button>
          <button
            onClick={() => setActiveTab("inactive")}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === "inactive"
                ? "bg-indigo-600 text-white"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            Inactive Employees
          </button>
          <button
            onClick={() => setActiveTab("trial")}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === "trial"
                ? "bg-indigo-600 text-white"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            Trial Employees
          </button>
        
        </div>

        <div className="flex gap-5">
          <div className="flex items-center  mr-90">
            <button
                onClick={() => downloadAllEmployees()}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg text-sm font-medium hover:bg-purple-600/30 border border-transparent transition-all duration-200 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download All
              </button>
          </div>    
        </div>
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, mobile no, designation"
            className="w-full text-[12px] pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200"
          />
        </div>
      </div>
      {/* Inactive Sub‑Tab Toggle */}
      {activeTab === "inactive" && (
        <div className="flex gap-3 mb-5">
          <button
            onClick={() => setInactiveSubTab("ex")}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              inactiveSubTab === "ex"
                ? "bg-indigo-600 text-white"
                : "bg-gray-800 text-gray-400 hover:text-gray-200"
            }`}
          >
            Ex‑Employee
          </button>
          <button
            onClick={() => setInactiveSubTab("rejected")}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              inactiveSubTab === "rejected"
                ? "bg-indigo-600 text-white"
                : "bg-gray-800 text-gray-400 hover:text-gray-200"
            }`}
          >
            Rejected Trials
          </button>
        </div>
      )}  
      {/* Success */}
{success && (
  <div className="flex items-center gap-2 px-4 py-3 rounded-lg mb-4 border text-sm font-medium bg-green-600/20 border-green-600/30 text-green-400">
    <span>✅</span>
    {success.message}
  </div>
)}

{/* Error */}
{error && (
  <div className="flex items-center gap-2 px-4 py-3 rounded-lg mb-4 border text-sm font-medium bg-red-600/20 border-red-600/30 text-red-400">
    <span>❌</span>
    {error}
  </div>
)}

      {/* Employee List */}
      <div className="space-y-3">
        {filteredEmployees.length === 0 && !loading ? (
          <div className="bg-gray-900 rounded-xl border border-gray-700 p-12 text-center">
            <svg
              className="w-16 h-16 text-gray-600 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <p className="text-gray-500 text-lg">
              {activeTab === "active" ? "No active employees found" : "No inactive employees found"}
            </p>
          </div>
        ) : (
          filteredEmployees.map((emp, index) => {
            const isLast = index === filteredEmployees.length - 1;
            return (
              <div
                key={emp.eha_id}
                ref={isLast ? lastEmployeeRef : null}
                className="relative bg-gray-900 rounded-xl border border-gray-700 p-5 hover:border-gray-600 transition-all duration-200"
              >
                 {/* Ribbon */}
                {emp.valid_till && !isNaN(new Date(emp.valid_till).getTime()) && (
                <div className="absolute top-2 left-0 flex items-center gap-2 whitespace-nowrap bg-amber-500 text-white text-xs font-semibold px-4 py-0.5 rounded-r-lg shadow-md z-10">
                  
                  <span>Valid Till</span>

                  <span className="text-xs text-white/90">
                    {new Date(emp.valid_till).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>

                </div>
              )}
              
                <div className={`flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${emp.valid_till ? "mt-3" : ""}`}>
                  {/* Employee Info */}
                  <div className="flex-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {/* Code */}
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Code</p>
                      <p className="text-sm font-medium text-indigo-400">{emp.eha_id}</p>
                    </div>

                    {/* Name */}
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Name</p>
                      <p className="text-sm font-medium text-white">
                        {emp.first_name} {emp.middle_name ? emp.middle_name + " " : ""}{emp.last_name}
                      </p>
                    </div>

                    {/* Designation */}
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Designations</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                      {emp.team_designations
                        ? emp.team_designations.split(", ").map((item, index) => (
                            <span
                              key={index}
                              className="px-2.5 py-1 bg-indigo-600/10 border border-indigo-600/20 text-indigo-300 text-[11px] rounded-full"
                            >
                              {item}
                            </span>
                          ))
                        : (
                          <span className="text-sm text-gray-400">—</span>
                        )
                      }

                    </div>
                    </div>

                    {/* Salary */}
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Salary (Per Month)</p>
                      <p className="text-sm text-gray-300">{formatSalary(emp.salary)}</p>
                    </div>

                    {/* Mobile */}
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Mobile</p>
                      <p className="text-sm text-gray-300">{emp.mob_no || "—"}</p>
                    </div>

                    {/* Email */}
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
                      <p className="text-sm text-gray-300 truncate">{emp.email || "—"}</p>
                    </div>

                   
                  </div>

                  

                  {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">

                    {activeTab === "active" && (
                       <button
                        onClick={() => {
                          setRejectModal({
                            open: true,
                            eha_id: emp.eha_id,
                            name: `${emp.first_name} ${emp.last_name}`,
                          });

                          setRejectRemarks("");
                        }}
                        className="px-4 py-2 bg-red-600/20 text-red-400 text-sm font-medium rounded-lg hover:bg-red-600/30 border border-red-600/30 transition-all duration-200"
                      >
                        Terminate
                      </button>
                    )}
                    {activeTab === "inactive" && (
                      <button
                        onClick={() => handleReactivate(emp.eha_id, `${emp.first_name} ${emp.last_name}`)}
                        className="px-4 py-2 bg-green-600/20 text-green-400 text-sm font-medium rounded-lg hover:bg-green-600/30 border border-green-600/30 transition-all duration-200"
                      >
                        Reactivate
                      </button>
                    )}
                    {activeTab === "trial" && (
                      <>
                      <button
                        onClick={()=>navigate('/Add_Employee' ,{ state: { fromTrial: true, eha_id: emp.eha_id }})}
                        className="px-4 py-2 bg-green-600/20 text-green-400 text-sm font-medium rounded-lg hover:bg-green-600/30 border border-green-600/30 transition-all duration-200"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setExtendModal({ open: true, eha_id: emp.eha_id, name: `${emp.first_name} ${emp.last_name}` })}
                        className="px-4 py-2 bg-yellow-600/20 text-yellow-400 text-sm font-medium rounded-lg hover:bg-yellow-600/30 border border-yellow-600/30 transition-all duration-200"
                      >
                        Extend
                      </button>
                      <button
                        onClick={() => {
                          setRejectModal({
                            open: true,
                            eha_id: emp.eha_id,
                            name: `${emp.first_name} ${emp.last_name}`,
                          });

                          setRejectRemarks("");
                        }}
                        className="px-4 py-2 bg-red-600/20 text-red-400 text-sm font-medium rounded-lg hover:bg-red-600/30 border border-red-600/30 transition-all duration-200"
                      >
                        Reject
                      </button>
                      </>
                    )}
                    <button
                      onClick={() => navigate(`/Employee_Details/${emp.eha_id}`)}
                      className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-all duration-200"
                    >
                      View More
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      {rejectModal.open && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

    <div className="bg-gray-800 rounded-xl p-6 w-[420px] border border-gray-700">

      <h3 className="text-lg font-semibold text-white mb-2">
        Reject Employee
      </h3>

      <p className="text-sm text-gray-400 mb-4">
        Enter remarks for rejecting{" "}
        <span className="text-white font-medium">
          {rejectModal.name}
        </span>
      </p>

      <textarea
        value={rejectRemarks}
        onChange={(e) => setRejectRemarks(e.target.value)}
        placeholder="Enter rejection remarks..."
        rows={4}
        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
      />

      <div className="flex justify-end gap-3 mt-5">

        <button
          onClick={() => {
            setRejectModal({
              open: false,
              eha_id: null,
              name: "",
            });

            setRejectRemarks("");
          }}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-all duration-200"
        >
          Cancel
        </button>

        <button
          onClick={async () => {

            if (!rejectRemarks.trim()) {

              setSuccess(null);
              setError("Please enter remarks");

              return;
            }

            await handleTerminate(
              rejectModal.eha_id,
              rejectModal.name,
              rejectRemarks
            );

            setRejectModal({
              open: false,
              eha_id: null,
              name: "",
            });

            setRejectRemarks("");
          }}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-all duration-200"
        >
          Reject Employee
        </button>

      </div>

    </div>

  </div>
)}
        
      {extendModal.open && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    
    <div className="bg-gray-800 rounded-xl p-6 w-96">
      
      <h3 className="text-lg font-semibold text-white mb-4">
        Extend Trial
      </h3>

      <p className="text-gray-300 mb-3">
        Extend trial for {extendModal.name}
      </p>

      {/* Date Picker */}
      <input
        type="date"
        value={extendDays}
        onChange={(e) => setExtendDays(e.target.value)}
        min={new Date().toISOString().split("T")[0]}
        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white mb-4"
      />

      <div className="flex justify-end gap-3">

        <button
          onClick={() => setExtendModal({ open: false })}
          className="px-4 py-2 bg-gray-700 rounded-lg text-white"
        >
          Cancel
        </button>

        <button
          onClick={async () => {
            if (extendDays) {
              await handleExtend(
                extendModal.eha_id,
                extendModal.name,
                extendDays
              );

              setExtendModal({ open: false });
            }
          }}
          className="px-4 py-2 bg-yellow-600 rounded-lg text-white"
        >
          Extend
        </button>

      </div>

    </div>

  </div>
)}

      {/* Loading more indicator */}
      {loading && employees.length > 0 && (
        <div className="text-center py-6 text-gray-500">Loading more employees...</div>
      )}
    </div>
  );
}

export default Manage;
