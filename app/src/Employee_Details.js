import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const inputClass = (errors, name) =>
  `w-full px-4 py-2.5 bg-gray-900 border rounded-lg text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none transition-all duration-200 ${
    errors[name] ? "border-red-500" : "border-gray-700"
  }`;
const labelClass = "block text-sm font-medium text-gray-300 mb-1.5";
const sectionClass = "bg-gray-900 rounded-xl border border-gray-700 p-6";
const sectionTitleClass = "text-lg font-semibold text-white mb-6 flex items-center gap-3 pb-3 border-b border-gray-700";
const subHeadingClass = "text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3";
const viewValueClass = "text-gray-200 font-medium mt-1";
const requiredStar = <span className="text-red-400">*</span>;

const blockNumbers = (e) => { if (/\d/.test(e.key)) e.preventDefault(); };
const blockLetters = (e) => {
  if (["Backspace","Delete","Tab","Escape","Enter","ArrowLeft","ArrowRight"].includes(e.key) || e.key.startsWith("Arrow")) return;
  if (!/\d/.test(e.key)) e.preventDefault();
};
const blockSpecialChars = (e) => {
  if (["Backspace","Delete","Tab","Escape","Enter"].includes(e.key) || e.key.startsWith("Arrow")) return;
  if (!/[a-zA-Z0-9\s]/.test(e.key)) e.preventDefault();
};

const ALL_FIELDS = [
  "first_name","middle_name","last_name","dob","gender","gender_other",
  "email","mob_no","marital_status","spouse_name","spouse_mob","spouse_email",
  "father_name","father_mobile","mother_name","mother_mobile",
  "tenth_school","tenth_board","tenth_year","tenth_marks",
  "twelfth_school","twelfth_board","twelfth_year","twelfth_marks",
  "ug_college","ug_degree","ug_year","ug_marks",
  "pg_college","pg_degree","pg_year","pg_marks",
  "aadhar","pan","bank_name","bank_account_number","bank_ifsc",
  "salary","status","expertise","valid_till","joining_date",
];

const formatDateForInput = (val) => {
  if (!val) return "";
  const d = new Date(val);
  if (isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const formatDateDisplay = (val) => {
  if (!val) return "—";
  const d = new Date(val);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN");
};

// ─── Sub-components OUTSIDE component ────────────────────────────────────────
const ViewField = ({ label, value }) => (
  <div>
    <label className={labelClass}>{label}</label>
    <p className={viewValueClass}>{value || "—"}</p>
  </div>
);

const ViewFile = ({ label, path }) => {
  const [showPreview, setShowPreview] = useState(false);
  const fileUrl = path
    ? `${process.env.REACT_APP_API_URL}/${path.replace(/\\/g, "/")}`
    : null;

  const isImage = /\.(jpeg|jpg|png|gif|webp|bmp)$/i.test(path || "");
  const isPdf = /\.pdf$/i.test(path || "");

  return (
    <div className="space-y-2">
      <label className={labelClass}>{label}</label>

      {fileUrl ? (
        <>
          {/* Toggle button */}
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-gray-600 text-gray-300 bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            {showPreview ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
                Hide Preview
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Show Preview
              </>
            )}
          </button>

          {/* Preview content (conditionally rendered) */}
          {showPreview && (
            <div className="mt-2">
              {isImage ? (
                <img
                  src={fileUrl}
                  alt={label}
                  className="max-w-xs max-h-48 rounded border border-gray-700 object-contain"
                  loading="lazy"
                />
              ) : isPdf ? (
                <iframe
                  src={fileUrl}
                  title={label}
                  className="w-full h-64 rounded border border-gray-700"
                  frameBorder="0"
                />
              ) : (
                // Unsupported types: still show a link as fallback
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:text-indigo-300 text-sm font-medium flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Open in new tab
                </a>
              )}
            </div>
          )}
        </>
      ) : (
        <p className="text-gray-500 text-sm mt-1">Not Uploaded</p>
      )}
    </div>
  );
};

const EditField = ({ label, name, type = "text", required = false, keyBlock, maxLength, errors, formData, onChange, onBlurValidate, readOnly = false }) => (
  <div>
    <label className={labelClass}>{label} {required && requiredStar}</label>
    <input
      type={type}
      name={name}
      value={formData[name] ?? ""}
      onChange={onChange}
      onKeyDown={keyBlock || undefined}
      onBlur={() => onBlurValidate && onBlurValidate(name, formData[name])}
      className={readOnly
        ? "w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-gray-400 outline-none cursor-not-allowed"
        : inputClass(errors, name)}
      maxLength={maxLength}
      readOnly={readOnly}
    />
    {errors[name] && <p className="text-red-400 text-xs mt-1">{errors[name]}</p>}
  </div>
);

const FileInput = ({ name, label, accept, existingFile, onChange }) => {
  const [fileName, setFileName] = useState("");
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {existingFile && !fileName && (
        <p className="text-green-400 text-xs mb-1">Currently uploaded</p>
      )}
      <label className="flex items-center gap-3 px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg cursor-pointer hover:border-gray-500 transition-all duration-200">
        <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <span className={`text-sm truncate ${fileName ? "text-gray-200" : "text-gray-500"}`}>
          {fileName || "Choose file..."}
        </span>
        {fileName && (
          <button type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setFileName(""); onChange({ target: { files: [] } }, name); }}
            className="ml-auto p-1 rounded-full hover:bg-gray-700 text-gray-400 hover:text-gray-200 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        <input type="file" name={name} accept={accept} className="hidden"
          onChange={(e) => { setFileName(e.target.files[0]?.name || ""); onChange(e, name); }} />
      </label>
    </div>
  );
};

const EditSelect = ({ label, name, options, required = false, errors, formData, onChange }) => (
  <div>
    <label className={labelClass}>{label} {required && requiredStar}</label>
    <select name={name} value={formData[name] || ""} onChange={onChange} className={inputClass(errors, name)}>
      <option value="">Select</option>
      {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
    {errors[name] && <p className="text-red-400 text-xs mt-1">{errors[name]}</p>}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
function Employee_details() {
  const { empid } = useParams();
  const navigate = useNavigate();
  const [emp, setEmp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [files, setFiles] = useState({});
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const debounceTimers = useRef({});
  const [activeTab, setActiveTab] = useState("active");
  const [success, setSuccess] = useState(null);
   const [actionError, setActionError] = useState("");

  const fetchEmployee = useCallback(async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/getemployee/${empid}`, { credentials: "include" });
      const data = await res.json();
      if (res.ok) { setEmp(data.employee); setError(null); }
      else setError(data.message);
    } catch { setError("Failed to load employee data"); }
    finally { setLoading(false); }
  }, [empid]);

  useEffect(() => { fetchEmployee(); }, [fetchEmployee]);

  useEffect(() => {
  if (emp) {
    setActiveTab(emp.status === 1 ? "active" : "inactive");
  }
}, [emp]);

  const validateField = useCallback((name, value) => {
    let err = "";
    switch (name) {
      case "first_name": case "last_name":
        if (!value?.trim()) err = `${name === "first_name" ? "First" : "Last"} name is required`;
        else if (value.trim().length < 2) err = "At least 2 characters";
        break;
      case "email": case "spouse_email":
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) err = "Invalid email";
        break;
      case "mob_no":
        if (!value?.trim()) err = "Mobile is required";
        else if (!/^[6-9]\d{9}$/.test(value)) err = "Enter valid 10-digit mobile number";
        break;
      case "spouse_mob": case "father_mobile": case "mother_mobile":
        if (value && !/^[6-9]\d{9}$/.test(value)) err = "Enter valid 10-digit mobile number";
        break;
      case "aadhar":
        if (value && !/^\d{12}$/.test(value)) err = "Must be 12 digits";
        break;
      case "pan":
        if (value && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value)) err = "Invalid format (ABCDE1234F)";
        break;
      case "bank_account_number":
        if (value && !/^\d{9,18}$/.test(value)) err = "Must be 9-18 digits";
        break;
      case "bank_ifsc":
        if (value && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(value)) err = "Invalid IFSC (SBIN0001234)";
        break;
      case "salary":
        if (value && parseFloat(value) <= 0) err = "Must be > 0";
        break;
      case "tenth_year": case "twelfth_year": case "ug_year": case "pg_year":
        if (value && !/^\d{4}$/.test(value)) err = "Invalid year";
        break;
      case "tenth_marks": case "twelfth_marks": case "ug_marks": case "pg_marks":
        if (value && (isNaN(value) || parseFloat(value) < 0 || parseFloat(value) > 100)) err = "Must be 0-100";
        break;
      default: break;
    }
    setErrors(prev => ({ ...prev, [name]: err }));
    return err;
  }, []);

  const debounceValidate = useCallback((key, value, delay = 500) => {
    if (debounceTimers.current[key]) clearTimeout(debounceTimers.current[key]);
    debounceTimers.current[key] = setTimeout(() => validateField(key, value), delay);
  }, [validateField]);

  // ── FIX: don't convert "" to null — keep as "" so skip logic works correctly
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    debounceValidate(name, value);
  }, [debounceValidate]);

  const handleFileChange = useCallback((e, fieldName) => {
    const file = e.target.files[0];
    if (file) setFiles(prev => ({ ...prev, [fieldName]: file }));
    else setFiles(prev => { const n = { ...prev }; delete n[fieldName]; return n; });
  }, []);

  const toggleEditMode = () => {
    if (!editMode) {
      const populated = {};
      const dateFields = ["dob", "valid_till", "joining_date"];
      ALL_FIELDS.forEach(field => {
        populated[field] = dateFields.includes(field)
          ? formatDateForInput(emp[field])
          : emp[field] ?? "";
      });
      setFormData(populated);
    }
    setEditMode(prev => !prev);
    setErrors({});
    setFiles({});
  };

  const handleSave = async () => {
  let hasErrors = false;
  for (const field of ["first_name", "last_name", "email", "mob_no"]) {
    if (validateField(field, formData[field] || "")) hasErrors = true;
  }
  if (hasErrors) return;
  setSaving(true);
  try {
    const submitData = new FormData();
    const clearableFields = ["valid_till"]; // fields that can be intentionally cleared
    ALL_FIELDS.forEach(field => {
      const val = formData[field];
      if (clearableFields.includes(field)) {
        submitData.append(field, val ?? ""); // always send, even if empty
      } else if (val !== undefined && val !== null && val !== "") {
        submitData.append(field, val);
      }
    });
    Object.keys(files).forEach(key => { if (files[key]) submitData.append(key, files[key]); });
    const res = await fetch(`${process.env.REACT_APP_API_URL}/updateemployee/${empid}`, {
      method: "PUT", credentials: "include", body: submitData,
    });
    const data = await res.json();
      if (res.ok) {

    setSuccess({
      message: "Employee updated successfully"
    });

    setActionError("");

    setEditMode(false);
    setFiles({});

    fetchEmployee();

  } else {

    setSuccess(null);
    setActionError(data.message || "Failed to update employee");

  }} catch (e) {
  console.log(e);

  setSuccess(null);
  setActionError("Failed to update employee");
}
  setSaving(false);
};




  

  const downloadEmployeePDF = () => {
    if(!emp) return;
    const doc = new jsPDF();
    console.log("doc type:", typeof doc);
    console.log("doc.getFontSize:", typeof doc.getFontSize);
    console.log("doc.internal?", !!doc.internal);
    doc.setFontSize(18);
    doc.setTextColor(40)
    doc.text(`Employee: ${emp.first_name} ${emp.middle_name ? emp.middle_name + " " : ""}${emp.last_name}`, 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`EHA ID: ${emp.eha_id}`, 14, 30);
    doc.text(`Status: ${emp.status === 1 ? "Active" : "Inactive"}`, 14, 36);

     const rows = [
      ["First Name", emp.first_name || "—", "Middle Name", emp.middle_name || "—"],
      ["Last Name", emp.last_name || "—", "Date of Birth", formatDateDisplay(emp.dob)],
      ["Gender", emp.gender || "—", "Email", emp.email || "—"],
      ["Mobile", emp.mob_no || "—", "Marital Status", emp.marital_status || "—"],
      ["Spouse Name", emp.spouse_name || "—", "Spouse Mobile", emp.spouse_mob || "—"],
      ["Spouse Email", emp.spouse_email || "—", "Father Name", emp.father_name || "—"],
      ["Father Mobile", emp.father_mobile || "—", "Mother Name", emp.mother_name || "—"],
      ["Mother Mobile", emp.mother_mobile || "—", "Aadhar", emp.aadhar || "—"],
      ["PAN", emp.pan || "—", "Bank Name", emp.bank_name || "—"],
      ["Account Number", emp.bank_account_number || "—", "IFSC", emp.bank_ifsc || "—"],
      ["Salary", formatSalary(emp.salary), "Expertise", emp.expertise || "—"],
      ["Joining Date", formatDateDisplay(emp.joining_date), "Valid Till", formatDateDisplay(emp.valid_till)],
    ];

    const education = [];
    if (emp.tenth_school) education.push(["10th School", emp.tenth_school, "10th Marks", emp.tenth_marks + "%"]);
    if (emp.twelfth_school) education.push(["12th School", emp.twelfth_school, "12th Marks", emp.twelfth_marks + "%"]);
    if (emp.ug_college) education.push(["UG College", emp.ug_college, "UG Marks", emp.ug_marks + "%"]);
    if (emp.pg_college) education.push(["PG College", emp.pg_college, "PG Marks", emp.pg_marks + "%"]);
    
    autoTable(doc, {
      startY: 42,
      head: [["Field", "Value", "Field", "Value"]],
      body: [...rows, ...education],
      theme: "grid",
      headStyles: { fillColor: [79, 70, 229] },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 40 },
        1: { cellWidth: 55 },
        2: { fontStyle: "bold", cellWidth: 40 },
        3: { cellWidth: 55 },
      },
      margin: { top: 42 },
    });

    // Save
    doc.save(`${emp.first_name}_${emp.last_name}_${emp.eha_id}.pdf`);
  };

    

  const formatSalary = (salary) => {
    if (!salary) return "—";
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(salary);
  };

  const fp = { errors, formData, onChange: handleChange, onBlurValidate: validateField };

  if (loading) return (
    <div className="w-full min-h-screen bg-gray-900 flex items-center justify-center">
      <p className="text-gray-400 text-lg">Loading employee details...</p>
    </div>
  );
  if (error || !emp) return (
    <div className="w-full min-h-screen bg-gray-900 flex items-center justify-center">
      <p className="text-red-400">{error || "Employee not found"}</p>
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-gray-900 p-4 md:p-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl">
            {emp.first_name?.charAt(0) || "?"}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">
              {emp.first_name} {emp.middle_name ? emp.middle_name + " " : ""}{emp.last_name}
            </h1>
            <p className="text-gray-400">{emp.eha_id}</p>
            <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium ${emp.status === 1 ? "bg-green-400/20 text-green-400" : "bg-red-400/20 text-red-400"}`}>
              {emp.status === 1 ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
        
        <div className="flex gap-3">
          {editMode ? (
            <>
              <button onClick={() => { setEditMode(false); setFormData({}); setErrors({}); setFiles({}); }}
                className="px-5 py-2.5 bg-gray-700 text-gray-300 rounded-lg font-medium hover:bg-gray-600 transition-all duration-200">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="px-5 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all duration-200 disabled:opacity-50">
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </>
          ) : (
            <>
              <button onClick={downloadEmployeePDF}
                className="px-5 py-2.5 bg-gray-700 text-white rounded-lg text-sm font-medium hover:bg-purple-600/30 border border-transparent transition-all duration-200 flex items-center">
                Download
              </button>
              <button onClick={toggleEditMode}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all duration-200">
                Edit
              </button>
              
            </>
          )}
        </div>
      </div>
      {/* Success */}
          {success && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg mb-4 border text-sm font-medium bg-green-600/20 border-green-600/30 text-green-400">
              <span>✅</span>
              {success.message}
            </div>
          )}

          {/* Error */}
          {actionError && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg mb-4 border text-sm font-medium bg-red-600/20 border-red-600/30 text-red-400">
              <span>❌</span>
              {actionError}
            </div>
          )}

      <div className="space-y-6">
        {emp.remarks && (
  <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
    
    <div className="flex items-start gap-3">

      <div className="mt-0.5">
        <svg
          className="w-5 h-5 text-red-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      <div>
        <p className="text-sm font-semibold text-red-400 uppercase tracking-wide">
          Reason For Termination/Rejection
        </p>

        <p className="text-sm text-gray-200 mt-1 whitespace-pre-wrap">
          {emp.remarks}
        </p>
      </div>

    </div>

  </div>
)}

        {/* SECTION 1: BASIC */}
        <div className={sectionClass}>
          <h2 className={sectionTitleClass}>Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {editMode ? (
              <>
                <EditField label="First Name" name="first_name" required keyBlock={blockNumbers} {...fp} />
                <EditField label="Middle Name" name="middle_name" keyBlock={blockNumbers} {...fp} />
                <EditField label="Last Name" name="last_name" required keyBlock={blockNumbers} {...fp} />
                <EditField label="Date of Birth" name="dob" type="date" max={new Date().toISOString().split("T")[0]} {...fp} />
                <EditSelect label="Gender" name="gender" options={[
                  { value: "male", label: "Male" }, { value: "female", label: "Female" }, { value: "other", label: "Others" }
                ]} {...fp} />
                {formData.gender === "other" && <EditField label="Please Specify" name="gender_other" keyBlock={blockNumbers} {...fp} />}
                <EditField label="Email" name="email" type="email" required {...fp} />
                <EditField label="Mobile" name="mob_no" required keyBlock={blockLetters} maxLength={10} {...fp} />
                <FileInput name="photo" label="Employee Photo" accept="image/*" existingFile={emp.photo_path} onChange={handleFileChange} />
              </>
            ) : (
              <>
                <ViewField label="First Name" value={emp.first_name} />
                <ViewField label="Middle Name" value={emp.middle_name} />
                <ViewField label="Last Name" value={emp.last_name} />
                <ViewField label="Date of Birth" value={formatDateDisplay(emp.dob)} />
                <ViewField label="Gender" value={emp.gender} />
                {emp.gender === "other" && <ViewField label="Gender (Other)" value={emp.gender_other} />}
                <ViewField label="Email" value={emp.email} />
                <ViewField label="Mobile" value={emp.mob_no} />
                <ViewFile label="Employee Photo" path={emp?.photo_path} />
              </>
            )}
          </div>
        </div>

        {/* SECTION 2: FAMILY */}
        <div className={sectionClass}>
          <h2 className={sectionTitleClass}>Family Details</h2>
          {editMode ? (
            <>
              <EditSelect label="Marital Status" name="marital_status" options={[
                { value: "single", label: "Single" }, { value: "married", label: "Married" }, { value: "divorced", label: "Divorced" }
              ]} {...fp} />
              {formData.marital_status === "married" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <EditField label="Spouse Name" name="spouse_name" keyBlock={blockNumbers} {...fp} />
                  <EditField label="Spouse Mobile" name="spouse_mob" keyBlock={blockLetters} {...fp} />
                  <EditField label="Spouse Email" name="spouse_email" {...fp} />
                </div>
              )}
              <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mt-6 mb-3">Parents Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <EditField label="Father Name" name="father_name" keyBlock={blockNumbers} {...fp} />
                <EditField label="Father Mobile" name="father_mobile" keyBlock={blockLetters} {...fp} />
                <EditField label="Mother Name" name="mother_name" keyBlock={blockNumbers} {...fp} />
                <EditField label="Mother Mobile" name="mother_mobile" keyBlock={blockLetters} {...fp} />
              </div>
            </>
          ) : (
            <>
              <ViewField label="Marital Status" value={emp?.marital_status} />
              {emp?.marital_status === "married" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <ViewField label="Spouse Name" value={emp?.spouse_name} />
                  <ViewField label="Spouse Mobile" value={emp?.spouse_mob} />
                  <ViewField label="Spouse Email" value={emp?.spouse_email} />
                </div>
              )}
              <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mt-6 mb-3">Parents Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ViewField label="Father Name" value={emp?.father_name} />
                <ViewField label="Father Mobile" value={emp?.father_mobile} />
                <ViewField label="Mother Name" value={emp?.mother_name} />
                <ViewField label="Mother Mobile" value={emp?.mother_mobile} />
              </div>
            </>
          )}
        </div>

        {/* SECTION 3: EDUCATION */}
        <div className={sectionClass}>
          <h2 className={sectionTitleClass}>Education Details <span className="text-sm font-normal text-gray-500">(Optional)</span></h2>
          {["tenth", "twelfth", "ug", "pg"].map((prefix, index) => {
            const labels = {
              tenth: ["10th Standard", "School Name", "Board"],
              twelfth: ["12th / Diploma", "School/College Name", "Board/University"],
              ug: ["Undergraduate", "College Name", "Discipline"],
              pg: ["Post Graduate", "College Name", "Discipline"],
            };
            return (
              <div key={prefix} className={index > 0 ? "mt-6" : ""}>
                <h4 className={subHeadingClass}>{labels[prefix][0]}</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {editMode ? (
                    <>
                      <EditField label={labels[prefix][1]} name={`${prefix}_school`} {...fp} />
                      <EditField label={labels[prefix][2]} name={`${prefix}_board`} {...fp} />
                      <EditField label="Year of Passing" name={`${prefix}_year`} keyBlock={blockLetters} maxLength={4} {...fp} />
                      <EditField label="Marks (%)" name={`${prefix}_marks`} keyBlock={blockLetters} {...fp} />
                    </>
                  ) : (
                    <>
                      <ViewField label={labels[prefix][1]} value={emp[`${prefix}_school`] || emp[`${prefix}_college`]} />
                      <ViewField label={labels[prefix][2]} value={emp[`${prefix}_board`] || emp[`${prefix}_degree`]} />
                      <ViewField label="Year of Passing" value={emp[`${prefix}_year`]} />
                      <ViewField label="Marks (%)" value={emp[`${prefix}_marks`]} />
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* SECTION 4: BANK & GOV */}
        <div className={sectionClass}>
          <h2 className={sectionTitleClass}>Bank & Government Documents</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {editMode ? (
              <>
                <EditField label="Aadhar Number" name="aadhar" keyBlock={blockLetters} maxLength={12} {...fp} />
                <EditField label="PAN Number" name="pan" keyBlock={blockSpecialChars} maxLength={10} {...fp} />
                <EditField label="Bank Name" name="bank_name" {...fp} />
                <EditField label="Account Number" name="bank_account_number" keyBlock={blockLetters} {...fp} />
                <EditField label="IFSC Code" name="bank_ifsc" keyBlock={blockSpecialChars} maxLength={11} {...fp} />
                <FileInput name="aadhar_image" label="Aadhar Card" accept="image/*,.pdf" existingFile={emp.aadhar_image_path} onChange={handleFileChange} />
                <FileInput name="pan_image" label="PAN Card" accept="image/*,.pdf" existingFile={emp.pan_image_path} onChange={handleFileChange} />
                
              </>
            ) : (
              <>
                <ViewField label="Aadhar Number" value={emp?.aadhar} />
                <ViewField label="PAN Number" value={emp?.pan} />
                <ViewField label="Bank Name" value={emp?.bank_name} />
                <ViewField label="Account Number" value={emp?.bank_account_number} />
                <ViewField label="IFSC Code" value={emp?.bank_ifsc} />
                <ViewFile label="Aadhar Card" path={emp?.aadhar_image_path} />
                <ViewFile label="PAN Card" path={emp?.pan_image_path} />
              </>
            )}
          </div>
        </div>

        {/* SECTION 5: EMPLOYMENT */}
        <div className={sectionClass}>
          <h2 className={sectionTitleClass}>Employment Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {editMode ? (
              <>
                <EditField label="Salary" name="salary" type="number" keyBlock={blockLetters} {...fp} />
                <EditField label="Expertise" name="expertise" {...fp} />
                <div>
                  <label className={labelClass}>Valid Till</label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      name="valid_till"
                      value={formData.valid_till ?? ""}
                      onChange={handleChange}
                      className={inputClass(errors, "valid_till")}
                    />
                    {formData.valid_till && (
                      <button type="button"
                        onClick={() => setFormData(prev => ({ ...prev, valid_till: "" }))}
                        className="px-3 py-2 bg-gray-700 text-gray-400 rounded-lg hover:bg-gray-600 hover:text-gray-200 transition-all duration-200 text-xs whitespace-nowrap">
                        Clear
                      </button>
                    )}
                  </div>
                </div>
                <EditField label="Joining Date" name="joining_date" type="date" max={new Date().toISOString().split("T")[0]} {...fp} />
              </>
            ) : (
              <>
                <ViewField label="Salary" value={formatSalary(emp.salary)} />
                <ViewField label="Expertise" value={emp.expertise} />
                <ViewField label="Valid Till" value={formatDateDisplay(emp.valid_till)} />
                <ViewField label="Joining Date" value={formatDateDisplay(emp.joining_date)} />
              </>
            )}
            <ViewField label="Status" value={emp.status === 1 ? "Active" : "Inactive"} />
          </div>
        </div>

      </div>
    </div>
  );
}

export default Employee_details;
