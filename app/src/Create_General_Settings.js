import React, { useState, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";

function Create_General_Settings() {
  const navigate = useNavigate();
  const { id } = useParams(); // for editing
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [validFromError, setValidFromError] = useState("");
  const debounceTimers = useRef({});
  const [success, setSuccess] = useState(null);
const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    hgs_id: "",
    daily_agenda_start: "",
    daily_agenda_end: "",
    daily_report_start: "",
    daily_report_end: "",
    submit_next_day: "",
    perform_verify_start: "",
    perform_verify_end: "",
    perform_verification: "",
  });

  const formatTime = (time) => {
    if (!time) return "";
    const parts = time.split(":");
    return `${parts[0].padStart(2, "0")}:${(parts[1] || "00").padStart(2, "0")}`;
  };

  const checkValidFrom = async (date) => {
    if (!date) { setValidFromError(""); return; }
    try {
      const url = id
        ? `http://localhost:5000/check-valid-fromGen?date=${date}&exclude_id=${id}`
        : `http://localhost:5000/check-valid-fromGen?date=${date}`;
      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();
      setValidFromError(data.exists ? "Settings already exist for this date" : "");
    } catch (error) { console.error(error); }
  };

  const debounceCheckDB = useCallback((value, delay = 500) => {
    if (debounceTimers.current.db) clearTimeout(debounceTimers.current.db);
    debounceTimers.current.db = setTimeout(() => checkValidFrom(value), delay);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validFromError) return;
    setSaving(true);
    const payload = {
      ...formData,
      submit_next_day: formData.submit_next_day === "yes" ? 1 : 0
    };
    try {
      const url = id ? `http://localhost:5000/hr-settings/update/${id}?for=general` : "http://localhost:5000/create_hrgen";
      const method = id ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(payload) });
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
      }, 3000);

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
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">{id ? "Edit" : "Create"} General Settings</h1>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Daily Agenda Time (24hrs Format)</label>
              <div className="flex items-center gap-2">
                <input 
                    type="time" 
                    name="daily_agenda_start" 
                    value={formData.daily_agenda_start} 
                    onChange={handleChange} 
                    className={inputClass} 
                    required 
                />
                <span className="text-gray-400 text-sm">TO</span>
                <input 
                    type="time" 
                    name="daily_agenda_end" 
                    value={formData.daily_agenda_end} 
                    onChange={handleChange} 
                    className={inputClass} 
                    required 
                />
                </div>
            </div>
            <div>
              <label className={labelClass}>Daily Report Time (24hrs Format)</label>
              <div className="flex items-center gap-2">
                <input type="time" name="daily_report_start" value={formData.daily_report_start} 
                onChange={handleChange} className={inputClass} required/>
                <span className="text-gray-400 text-sm">TO</span>
                <input type="time" name="daily_report_end" value={formData.daily_report_end} 
                onChange={handleChange} className={inputClass} required/>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div><label className={labelClass}>Submit Report Next Day</label><select name="submit_next_day" value={formData.submit_next_day} onChange={handleChange} className={inputClass} required><option value="">Select</option><option value="yes">Yes</option><option value="no">No</option></select></div>
            <div><label className={labelClass}>Performance Report Window</label>
            <div className="flex items-center gap-2">
                <input type="number" name="perform_verify_start" value={formData.perform_verify_start} 
                onChange={handleChange} placeholder="Start" className={inputClass} required/>
                <span className="text-gray-400 text-sm">TO</span><input type="number" name="perform_verify_end" value={formData.perform_verify_end} onChange={handleChange} placeholder="End" className={inputClass} required/></div></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div><label className={labelClass}>Review Days</label><div className="flex items-center gap-2">
              <span className="text-white">Within</span>
              <input type="number" name="perform_verification" value={formData.perform_verification} onChange={handleChange} className={inputClass} required/>
              <label className={labelClass}>Days</label>
              </div>
              </div>
          </div>
          <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={() => navigate("/Manage_Settings")} className="px-6 py-2.5 bg-gray-700 text-gray-300 rounded-lg">Cancel</button><button type="submit" disabled={saving} className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg">{saving ? "Saving..." : (id ? "Update" : "Save")}</button></div>
        </form>
      </div>
    </div>
  );
}

export default Create_General_Settings;