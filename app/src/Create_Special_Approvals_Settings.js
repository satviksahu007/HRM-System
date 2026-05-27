import React, { useState, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";

function Create_Special_Approvals_Settings() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [saving, setSaving] = useState(false);
  const [empError, setEmpError] = useState("");
  const [dateError, setDateError] = useState("");
  const [showEmpModal, setShowEmpModal] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [empSearch, setEmpSearch] = useState("");
  const empSearchTimer = useRef(null);
  const debounceTimers = useRef({});
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    eha_id: "",
    early_agenda_submit: "",
    late_agenda_submit: "",
    early_report_submit: "",
    late_report_submit: "",
    submit_next_day: "",
    valid_from: "",
    valid_till: "",
  });

  const checkEmpExists = async (eha_id) => {
    if (!eha_id) { setEmpError(""); return; }
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/check-special-emp?eha_id=${eha_id}`, { credentials: "include" });
      const data = await res.json();
      setEmpError(data.exists ? "This employee already has a special approval, please delete previous to continue." : "");
    } catch (err) { console.error(err); }
  };

  const debounceCheckEmp = useCallback((value, delay = 500) => {
    if (debounceTimers.current.emp) clearTimeout(debounceTimers.current.emp);
    debounceTimers.current.emp = setTimeout(() => checkEmpExists(value), delay);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === "eha_id") debounceCheckEmp(value);
  };

  const handleValidFromChange = (e) => {
    const from = e.target.value;
    setFormData(prev => ({ ...prev, valid_from: from, valid_till: prev.valid_till && from && new Date(prev.valid_till) <= new Date(from) ? "" : prev.valid_till }));
    setDateError("");
  };

  const handleValidTillChange = (e) => {
    const till = e.target.value;
    setFormData(prev => ({ ...prev, valid_till: till }));
    if (formData.valid_from && till && new Date(till) <= new Date(formData.valid_from)) setDateError("Valid Till must be greater than Valid From");
    else setDateError("");
  };

  const fetchEmployees = async (search = "") => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/employees/search?search=${encodeURIComponent(search)}`, { credentials: "include" });
      const data = await res.json();
      if (res.ok) setEmployees(data.employees || []);
    } catch (err) { console.error(err); }
  };

  const handleEmpSearch = (value) => {
    setEmpSearch(value);
    if (empSearchTimer.current) clearTimeout(empSearchTimer.current);
    empSearchTimer.current = setTimeout(() => fetchEmployees(value), 400);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (empError || dateError) return;
    setSaving(true);
    try {
      const url = id ? `${process.env.REACT_APP_API_URL}/hr-settings/update/${id}?for=special` : "${process.env.REACT_APP_API_URL}/create_special_approval";
      const method = id ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(formData) });
      const data = await res.json();
      if (res.ok) {
        setSuccess({
          message: id
            ? "Settings updated successfully"
            : "Settings saved successfully"
        });

        setError("");

        setTimeout(() => {
          navigate("/Manage_Settings");
        }, 1500);

      } else {

        setSuccess(null);
        setError(data.message || "Something went wrong");

      }
    } catch (err) { console.error(err); }
    setSaving(false);
  };

  const inputClass = "w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-gray-200";
  const labelClass = "block text-sm font-medium text-gray-300 mb-1.5";

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">{id ? "Edit" : "Create"} Special Approval</h1>
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
        <form onSubmit={handleSubmit} className="bg-gray-900 rounded-xl p-6 space-y-6">
          <div><label className={labelClass}>Employee ID</label>
          <div className="flex gap-2"><input type="text" name="eha_id" value={formData.eha_id} 
          onChange={handleChange} className={inputClass} required readOnly />
          <button type="button" 
          onClick={() => { setShowEmpModal(true); fetchEmployees(); }} 
          className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg">
            Choose</button></div>{empError && <p className="text-red-400 text-xs mt-1">
              {empError}</p>}
              </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Early Agenda (24hrs Format)</label>
              <input type="time" name="early_agenda_submit" value={formData.early_agenda_submit} 
              onChange={handleChange} className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>Late Agenda (24hrs Format)</label>
                <input type="time" name="late_agenda_submit" value={formData.late_agenda_submit} 
                onChange={handleChange} className={inputClass} required /></div>
                </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className={labelClass}>Early Report</label><input type="time" name="early_report_submit" value={formData.early_report_submit} onChange={handleChange} className={inputClass} required /></div><div><label className={labelClass}>Late Report</label><input type="time" name="late_report_submit" value={formData.late_report_submit} onChange={handleChange} className={inputClass} required /></div></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div><label className={labelClass}>Submit Next Day</label><select name="submit_next_day" value={formData.submit_next_day} onChange={handleChange} className={inputClass} required><option value="">Select</option><option value="yes">Yes</option><option value="no">No</option></select></div><div><label className={labelClass}>Valid From</label><input type="date" name="valid_from" value={formData.valid_from} onChange={handleValidFromChange} className={inputClass} required /></div><div><label className={labelClass}>Valid Till</label><input type="date" name="valid_till" value={formData.valid_till} onChange={handleValidTillChange} className={inputClass} required />{dateError && <p className="text-red-400 text-xs mt-1">{dateError}</p>}</div></div>
          <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={() => navigate("/Manage_Settings")} className="px-6 py-2.5 bg-gray-700 text-gray-300 rounded-lg">Cancel</button><button type="submit" disabled={saving} className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg">{saving ? "Saving..." : (id ? "Update" : "Save")}</button></div>
        </form>
      </div>

      {/* Employee Modal (simplified) */}
      {showEmpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl w-full max-w-md max-h-[70vh] flex flex-col">
            <div className="p-4 border-b border-gray-700 flex justify-between"><h3 className="text-white">Select Employee</h3><button onClick={() => setShowEmpModal(false)} className="text-gray-400">&times;</button></div>
            <div className="p-4"><input type="text" placeholder="Search..." value={empSearch} onChange={(e) => handleEmpSearch(e.target.value)} className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-200" /></div>
            <div className="flex-1 overflow-y-auto p-2">
              {employees.map(emp => (
                <button key={emp.eha_id} onClick={() => { setFormData(prev => ({ ...prev, eha_id: emp.eha_id })); checkEmpExists(emp.eha_id); setShowEmpModal(false); }} className="w-full text-left px-4 py-3 hover:bg-gray-700 rounded-lg"><p className="text-white">{emp.eha_id}</p><p className="text-gray-400 text-sm">{emp.first_name} {emp.last_name}</p></button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Create_Special_Approvals_Settings;   
