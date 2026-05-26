import React, { useState, useRef, useEffect } from "react";
import { Navigate, useNavigate, useLocation } from "react-router-dom";


  const FileInput = ({ name, label, accept, required, onChange, error ,reset}) => {
    const [fileName, setFileName] = useState("");
    useEffect(() => {
    if (reset) {
      setFileName("");
    }
  }, [reset]);

    return (
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
        <label className={`flex items-center gap-3 px-4 py-2.5 bg-gray-900 border rounded-lg cursor-pointer hover:border-gray-500 transition-all duration-200 ${
          error ? "border-red-500" : "border-gray-700"
        }`}>
          <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <span className={`text-sm truncate ${fileName ? "text-gray-200" : "text-gray-500"}`}>
            {fileName || "Choose file..."}
          </span>
          {fileName && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setFileName("");
                onChange({ target: { files: [] } }, name);
              }}
              className="ml-auto p-1 rounded-full hover:bg-gray-700 text-gray-400 hover:text-gray-200 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <input
            type="file"
            name={name}
            accept={accept}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files[0];
              setFileName(file ? file.name : "");
              onChange(e, name);
            }}
          />
        </label>
        {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
      </div>
    );
  };


function Add_Employee() {
  const emptyForm = {
    first_name: "",
    middle_name: "",
    last_name: "",
    dob: "",
    gender: "",
    gender_other: "",
    email: "",
    joining_date:"",
    mob_no: "",
    marital_status: "",
    spouse_name: "",
    spouse_mob: "",
    spouse_email: "",
    father_name: "",
    father_mobile: "",
    mother_name: "",
    mother_mobile: "",
    tenth_school: "",
    tenth_board: "",
    tenth_year: "",
    tenth_marks: "",
    twelfth_school: "",
    twelfth_board: "",
    twelfth_year: "",
    twelfth_marks: "",
    ug_college: "",
    ug_degree: "",
    ug_year: "",
    ug_marks: "",
    pg_college: "",
    pg_degree: "",
    pg_year: "",
    pg_marks: "",
    aadhar: "",
    pan: "",
    bank_name: "",
    bank_account_number: "",
    bank_ifsc: "",
    salary: "",
    status: "1",
    expertise: ""
  };

  const [formData, setFormData] = useState(emptyForm);
  const [files, setFiles] = useState({});
  const [errors, setErrors] = useState({});
  const debounceTimers = useRef({});
  const [fileErrors, setFileErrors] = useState({});
  const [resetKey,setResetKey] = useState(0)
  const navigate = useNavigate()
  const [verifyingFace, setVerifyingFace] = useState(false)
  const location = useLocation();
  const [success, setSuccess] = useState(null);
const [error, setError] = useState("");



  useEffect(() => {
    const { fromTrial, eha_id } = location.state || {};
    if (!fromTrial || !eha_id) return;

    const fetchTrialData = async () => {
      try {
        const res = await fetch(`http://localhost:5000/getemployee/${eha_id}`, {
          credentials: "include"
        });
        const data = await res.json();
        if (!res.ok) return;

        const emp = data.employee;
        const formatDate = (val) => {
          if (!val) return "";
          const d = new Date(val);
          if (isNaN(d.getTime())) return "";
          return d.toISOString().split('T')[0];
        };

        setFormData({
          first_name: emp.first_name || "",
          middle_name: emp.middle_name || "",
          last_name: emp.last_name || "",
          dob: formatDate(emp.dob),
          gender: emp.gender || "",
          gender_other: emp.gender_other || "",
          email: emp.email || "",
          joining_date: formatDate(emp.joining_date),
          mob_no: emp.mob_no || "",
          marital_status: emp.marital_status || "",
          spouse_name: emp.spouse_name || "",
          spouse_mob: emp.spouse_mob || "",
          spouse_email: emp.spouse_email || "",
          father_name: emp.father_name || "",
          father_mobile: emp.father_mobile || "",
          mother_name: emp.mother_name || "",
          mother_mobile: emp.mother_mobile || "",
          tenth_school: emp.tenth_school || "",
          tenth_board: emp.tenth_board || "",
          tenth_year: emp.tenth_year || "",
          tenth_marks: emp.tenth_marks || "",
          twelfth_school: emp.twelfth_school || "",
          twelfth_board: emp.twelfth_board || "",
          twelfth_year: emp.twelfth_year || "",
          twelfth_marks: emp.twelfth_marks || "",
          ug_college: emp.ug_college || "",
          ug_degree: emp.ug_degree || "",
          ug_year: emp.ug_year || "",
          ug_marks: emp.ug_marks || "",
          pg_college: emp.pg_college || "",
          pg_degree: emp.pg_degree || "",
          pg_year: emp.pg_year || "",
          pg_marks: emp.pg_marks || "",
          aadhar: emp.aadhar || "",
          pan: emp.pan || "",
          bank_name: emp.bank_name || "",
          bank_account_number: emp.bank_account_number || "",
          bank_ifsc: emp.bank_ifsc || "",
          salary: emp.salary || "",
          status: "1",
          expertise: emp.expertise || ""
        });
      } catch (err) {
        console.log("Error prefilling trial data:", err);
      }
    };

    fetchTrialData();
  }, []);


  const validateFile = (fieldName, file) => {
    let error = "";
    if (!file) {
      // Only show error for required files on submit, not on initial load
      return;
    }
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      error = "Only JPG, PNG, WebP, PDF allowed";
    } else if (file.size > 5 * 1024 * 1024) {
      error = "File must be less than 5MB";
    }
    setFileErrors(prev => ({ ...prev, [fieldName]: error }));
  };
  

  const debounce = (key, value, delay = 500) => {
    if (debounceTimers.current[key]) {
      clearTimeout(debounceTimers.current[key]);
    }
    debounceTimers.current[key] = setTimeout(() => {
      validateField(key, value);
    }, delay);
  };

  const validateField = (name, value) => {
  let error = "";

  switch (name) {
    case "first_name":
    case "last_name":
      if (!value.trim()) error = `${name === "first_name" ? "First" : "Last"} name is required`;
      else if (value.trim().length < 2) error = "At least 2 characters";
      break;

    case "middle_name":
      // optional, no validation
      break;

    case "joining_date":
      if (!value) error = "Joining date is required";
      break;

    case "dob":
      if (!value) error = "Date of birth is required";
      else {
        const dob = new Date(value);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
          age--;
        }
        if (age < 18) error = "Must be at least 18 years old";
        else if (age > 100) error = "Invalid date";
      }
      break;

    case "gender":
      if (!value) error = "Select gender";
      break;

    case "gender_other":
      if (formData.gender === "other" && !value.trim()) error = "Please specify";
      break;

    case "email":
    case "spouse_email":
      if (name === "spouse_email" && formData.marital_status !== "married") break;
      if (!value.trim()) error = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = "Invalid email";
      break;

    case "mob_no":
      if (!value.trim()) error = "Mobile is required";
      else if (!/^[6-9]\d{9}$/.test(value)) error = "Enter valid 10-digit mobile number";
      break;

    case "spouse_mob":
    case "father_mobile":
    case "mother_mobile":
      if (name === "spouse_mob" && formData.marital_status !== "married") break;
      if ((name === "father_mobile" || name === "mother_mobile") && 
          formData.marital_status === "married") break; // optional when married
      if (!value.trim()) error = "Mobile is required";
      else if (!/^[6-9]\d{9}$/.test(value)) error = "Enter valid 10-digit mobile number";
      break;

    case "marital_status":
      if (!value) error = "Select marital status";
      break;

    case "spouse_name":
      if (formData.marital_status === "married" && !value.trim()) error = "Required";
      break;

    case "father_name":
      if ((formData.marital_status === "single" || formData.marital_status === "divorced") && !value.trim())
        error = "Required";
      break;

    case "mother_name":
      if ((formData.marital_status === "single" || formData.marital_status === "divorced") && !value.trim())
        error = "Required";
      break;

    case "aadhar":
      if (!value.trim()) error = "Aadhar is required";
      else if (!/^\d{12}$/.test(value)) error = "Must be 12 digits";
      break;

    case "pan":
    if (!value.trim()) {
      error = "PAN is required";
    } else {
      const pan = value.trim().toUpperCase();
      
      if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan)) {
        error = "Invalid format. Use: ABCDE1234F";
      } 
      else {
        const fourthChar = pan[3]; 
        const fifthChar = pan[4]; 
        const validCodes = ['P', 'C', 'F', 'H', 'A', 'B', 'G', 'J', 'L', 'T'];
        if (!validCodes.includes(fourthChar)) {
          error = "Invalid format. Use: ABCDE1234F";
        }
        else if (fourthChar === 'P' && !/^[A-Z]$/.test(fifthChar)) {
          error = "Invalid format. Use: ABCPE1234F";
        }
      }
    }
    break;

    case "bank_name":
      if (formData.status !== "2" && !value.trim()) error = "Bank name is required";
        break;

    case "bank_account_number":
      if (formData.status !== "2") {
        if (!value.trim()) error = "Account number is required";
        else if (!/^\d{9,18}$/.test(value)) error = "Must be 9-18 digits";
      } else if (value.trim() && !/^\d{9,18}$/.test(value)) {
        error = "Must be 9-18 digits";
      }
      break;

    case "bank_ifsc":
      if (formData.status !== "2") {
        if (!value.trim()) error = "IFSC is required";
        else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(value)) error = "Invalid (SBIN0001234)";
      } else if (value.trim() && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(value)) {
        error = "Invalid (SBIN0001234)";
      }
      break;

    case "salary":
      if (!value && value !== "0") error = "Salary is required";
      else if (parseFloat(value) <= 0) error = "Must be > 0";
      break;

    case "expertise":
      if (!value.trim()) error = "Expertise is required";
      break;

    case "tenth_year":
    case "twelfth_year":
    case "ug_year":
    case "pg_year":
      if (value && (!/^\d{4}$/.test(value) || parseInt(value) > new Date().getFullYear()))
        error = "Invalid year";
      break;

    case "tenth_marks":
    case "twelfth_marks":
    case "ug_marks":
    case "pg_marks":
      if (value && (isNaN(value) || parseFloat(value) < 0 || parseFloat(value) > 100))
        error = "Must be 0-100";
      break;

    default:
      break;
  }

  setErrors(prev => ({ ...prev, [name]: error }));
  return error;
};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    debounce(name, value);
  };

  const handleFileChange = async(e, fieldName) => {
    const file = e.target.files[0]
    
    if (file) {
      setFiles(prev => ({ ...prev, [fieldName]: file }));
      if(fieldName === 'photo'){
        setVerifyingFace(true)
        const isValidFace = await validateFaceInImage(file);
        setVerifyingFace(false)
        if(!isValidFace){
          setFileErrors(prev =>({
            ...prev,[fieldName]:"Face Not Visible"
          }))
          return;
        }
        setFileErrors(prev => ({ ...prev, [fieldName]: "" }));
        
      }
      validateFile(fieldName, file);
    } else {
      setFiles(prev => {
        const newFiles = { ...prev };
        delete newFiles[fieldName];
        return newFiles;
      });
      setFileErrors(prev => ({ ...prev, [fieldName]: "" }));
    }
  };

const validateFaceInImage = async (file) => {
  const data = new FormData();
  data.append('photo', file);

  try {
    const res = await fetch('http://localhost:5000/verify-face', {
      method: 'POST',
      credentials: 'include',
      body: data
    });
    const result = await res.json();

    if (!result.faceDetected) {
      console.warn('Face check failed:', result.message);
    }

    return result.faceDetected === true;
  } catch (err) {
    console.error('Face verification request failed:', err);
    return false;
  }
};

  



  const cleanData = () => {
    setFormData(emptyForm);
    setErrors({});
    setResetKey(prev => prev + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let hasErrors = false;
    const requiredFields = [
      "first_name", "last_name", "dob", "gender", "email", "mob_no",
      "marital_status","spouse_name","spouse_mob","spouse_email", "aadhar", "pan",
      "aadhar_image","pan_image","photo","salary", "expertise","joining_date"
    ];
    if (formData.status !== "2") {
      requiredFields.push("bank_name", "bank_account_number", "bank_ifsc");
    }

    if (formData.gender === "other") requiredFields.push("gender_other");
    if (formData.marital_status === "married") {
      requiredFields.push("spouse_name", "spouse_mob", "spouse_email");
    }
    if (formData.marital_status === "single" || formData.marital_status === "divorced") {
      requiredFields.push("father_name", "father_mobile", "mother_name", "mother_mobile");
    }

    for (const field of requiredFields) {
      const error = validateField(field, formData[field]);
      if (error) hasErrors = true;
    }

    if (hasErrors) return;

    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] && formData[key] !== "") {
          submitData.append(key, formData[key]);
        }
      });
      Object.keys(files).forEach(key => {
        if (files[key]) {
          submitData.append(key, files[key]);
        }
      });
       const { fromTrial, eha_id } = location.state || {};
      if (fromTrial && eha_id) {
        submitData.append("trial_eha_id", eha_id);
      }

      const res = await fetch("http://localhost:5000/addemp", {
        method: "POST",
        credentials: "include",
        body: submitData
      });
      const data = await res.json();
      if (res.ok) {
          setSuccess({
          status: "on-time",
          message: "Employee added successfully"
          
        });
        setError("");
        cleanData();
        setTimeout(() => {
          navigate("/Manage");
        }, 3000);
      } else {
        setSuccess(null)
        setError(data.message || "Something went wrong");
      }
    } catch (error) {
      console.log("Error:", error);
    }
  };

  // Helper functions
  const blockNumbers = (e) => {
    if (/\d/.test(e.key)) {
      e.preventDefault();
    }
  };
  const blockSpecialExceptComma = (e) => {
  if (["Backspace", "Delete", "Tab", "Escape", "Enter"].includes(e.key) || e.key.startsWith("Arrow")) {
    return;
  }
  if (!/[a-zA-Z0-9,]/.test(e.key)) {
    e.preventDefault();
  }
};

  const blockLetters = (e) => {
    // Allow control keys
    if (["Backspace", "Delete", "Tab", "Escape", "Enter"].includes(e.key) || e.key.startsWith("Arrow")) {
      return;
    }
    // Block anything that's not a digit
    if (!/\d/.test(e.key)) {
      e.preventDefault();
    }
  };

  const blockSpecialChars = (e) => {
    if (!/[a-zA-Z0-9\s]/.test(e.key) && !["Backspace", "Delete", "Tab", "Escape", "Enter"].includes(e.key) && !e.key.startsWith("Arrow")) {
      e.preventDefault();
    }
  };


    const inputClass = (name) => `w-full px-4 py-2.5 bg-gray-900 border rounded-lg text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none transition-all duration-200 ${
    errors[name] ? "border-red-500" : "border-gray-700"
  }`;

const labelClass = "block text-sm font-medium text-gray-300 mb-1.5";
const requiredStar = <span className="text-red-400">*</span>;
const sectionClass = "bg-gray-900 rounded-xl p-6";
const sectionTitleClass = "text-lg font-semibold text-white mb-6 flex items-center gap-3 pb-3 border-b border-gray-700";
const subHeadingClass = "text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3";

return (
  <div className="w-full min-h-screen bg-gray-900 p-4 md:p-8">
    
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-white mb-2">Add New Employee</h1>
      <p className="text-gray-400">Fill in all the details to register a new employee</p>
    </div>
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

    <form onSubmit={handleSubmit} className="space-y-6" noValidate>


      <div>
            <label className={labelClass}>Employee Status (Permanent/Trial){requiredStar}</label>
            <select name="status" value={formData.status} onChange={handleChange} className={inputClass("status")}
            disabled={!!(location.state?.fromTrial)} 
            >
              <option value="1">Active</option>
              <option value="2">Trial</option>
            </select>
          </div>
      
      {/* SECTION 1: BASIC */}
      <div className={sectionClass}>
        <h2 className={sectionTitleClass}>Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>First Name {requiredStar}</label>
            <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} className={inputClass("first_name")} placeholder="First name" 
              onKeyDown={(e) => {
                {blockNumbers(e)};
                {blockSpecialChars(e)}}}
            />
            {errors.first_name && <p className="text-red-400 text-xs mt-1">{errors.first_name}</p>}
          </div>
          <div>
            <label className={labelClass}>Middle Name</label>
            <input type="text" name="middle_name" value={formData.middle_name} onChange={handleChange} className={inputClass("middle_name")} placeholder="Middle name (optional)" 
            onKeyDown={(e) => {
                {blockNumbers(e)};
                {blockSpecialChars(e)}}}
            />
            {errors.middle_name && <p className="text-red-400 text-xs mt-1">{errors.middle_name}</p>}
          </div>
          <div>
            <label className={labelClass}>Last Name {requiredStar}</label>
            <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} className={inputClass("last_name")} placeholder="Last name" 
            onKeyDown={(e) => {
                {blockNumbers(e)};
                {blockSpecialChars(e)}}}
            />
            {errors.last_name && <p className="text-red-400 text-xs mt-1">{errors.last_name}</p>}
          </div>
          <div>
            <label className={labelClass}>Date of Birth {requiredStar}</label>
            <input type="date" name="dob" value={formData.dob} onChange={handleChange} className={inputClass("dob")} 
            max={new Date().toISOString().split('T')[0]}
            />
            {errors.dob && <p className="text-red-400 text-xs mt-1">{errors.dob}</p>}
          </div>
          <div>
            <label className={labelClass}>Gender {requiredStar}</label>
            <select name="gender" value={formData.gender} onChange={handleChange} className={inputClass("gender")}>
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Others</option>
            </select>
            {errors.gender && <p className="text-red-400 text-xs mt-1">{errors.gender}</p>}
          </div>
          {formData.gender === "other" && (
            <div>
              <label className={labelClass}>Please Specify {requiredStar}</label>
              <input type="text" name="gender_other" value={formData.gender_other} onChange={handleChange} className={inputClass("gender_other")} placeholder="Specify gender" 
              onKeyDown={(e) => {
                {blockNumbers(e)};
                {blockSpecialChars(e)}}}
              />
              {errors.gender_other && <p className="text-red-400 text-xs mt-1">{errors.gender_other}</p>}
            </div>
          )}
          <div>
            <label className={labelClass}>Email {requiredStar}</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass("email")} placeholder="Email address" />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className={labelClass}>Mobile Number {requiredStar}</label>
            <input type="tel" name="mob_no" value={formData.mob_no} onChange={handleChange} className={inputClass("mob_no")} placeholder="10-digit mobile number" maxLength="10" 
            onKeyDown={(e) => {
                {blockLetters(e)};
                {blockSpecialChars(e)}}}
            />
            {errors.mob_no && <p className="text-red-400 text-xs mt-1">{errors.mob_no}</p>}
          </div>
          <div>
            <label className={labelClass}></label>
            <FileInput 
              name="photo" 
              label="Employee Photo" 
              accept="image/*,.pdf" 
              required={true}
              onChange={handleFileChange}
              error={fileErrors.photo}
              reset={resetKey}
              />
          </div>
        </div>
      </div>

      {/* SECTION 2: FAMILY */}
      <div className={sectionClass}>
        <h2 className={sectionTitleClass}>Family Details</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className={labelClass}>Marital Status {requiredStar}</label>
            <select name="marital_status" value={formData.marital_status} onChange={handleChange} className={inputClass("marital_status")}>
              <option value="">Select Status</option>
              <option value="single">Single</option>
              <option value="married">Married</option>
              <option value="divorced">Divorced</option>
            </select>
            {errors.marital_status && <p className="text-red-400 text-xs mt-1">{errors.marital_status}</p>}
          </div>
        </div>

        {formData.marital_status === "married" && (
          <>
            <h4 className={subHeadingClass}>Spouse Details (Required)</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className={labelClass}>Spouse Name {requiredStar}</label>
                <input type="text" name="spouse_name" value={formData.spouse_name} onChange={handleChange} className={inputClass("spouse_name")} placeholder="Spouse name" 
                onKeyDown={(e) => {
                {blockNumbers(e)};
                {blockSpecialChars(e)}}}
                />
                {errors.spouse_name && <p className="text-red-400 text-xs mt-1">{errors.spouse_name}</p>}
              </div>
              <div>
                <label className={labelClass}>Spouse Mobile {requiredStar}</label>
                <input type="tel" name="spouse_mob" value={formData.spouse_mob} onChange={handleChange} className={inputClass("spouse_mob")} placeholder="Spouse mobile" maxLength="10" 
                onKeyDown={(e) => {
                {blockLetters(e)};
                {blockSpecialChars(e)}}}
                />
                {errors.spouse_mob && <p className="text-red-400 text-xs mt-1">{errors.spouse_mob}</p>}
              </div>
              <div>
                <label className={labelClass}>Spouse Email {requiredStar}</label>
                <input type="email" name="spouse_email" value={formData.spouse_email} onChange={handleChange} className={inputClass("spouse_email")} placeholder="Spouse email" 
                
                />
                {errors.spouse_email && <p className="text-red-400 text-xs mt-1">{errors.spouse_email}</p>}
              </div>
            </div>
            <h4 className={subHeadingClass}>Parents Details (Optional)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Father Name</label>
                <input type="text" name="father_name" value={formData.father_name} onChange={handleChange} className={inputClass("father_name")} placeholder="Father's name" 
                onKeyDown={(e) => {
                {blockNumbers(e)};
                {blockSpecialChars(e)}}}
                />
              </div>
              <div>
                <label className={labelClass}>Father Mobile</label>
                <input type="tel" name="father_mobile" value={formData.father_mobile} onChange={handleChange} className={inputClass("father_mobile")} placeholder="Father's mobile" maxLength="10" 
                onKeyDown={(e) => {
                {blockLetters(e)};
                {blockSpecialChars(e)}}}
                />
              </div>
              <div>
                <label className={labelClass}>Mother Name</label>
                <input type="text" name="mother_name" value={formData.mother_name} onChange={handleChange} className={inputClass("mother_name")} placeholder="Mother's name" 
                onKeyDown={(e) => {
                {blockNumbers(e)};
                {blockSpecialChars(e)}}}
                />
              </div>
              <div>
                <label className={labelClass}>Mother Mobile</label>
                <input type="tel" name="mother_mobile" value={formData.mother_mobile} onChange={handleChange} className={inputClass("mother_mobile")} placeholder="Mother's mobile" maxLength="10" 
                onKeyDown={(e) => {
                {blockLetters(e)};
                {blockSpecialChars(e)}}}
                />
              </div>
            </div>
          </>
        )}

        {(formData.marital_status === "single" || formData.marital_status === "divorced") && (
          <>
            <h4 className={subHeadingClass}>Parents Details (Required)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Father Name {requiredStar}</label>
                <input type="text" name="father_name" value={formData.father_name} onChange={handleChange} className={inputClass("father_name")} placeholder="Father's name" 
                onKeyDown={(e) => {
                {blockNumbers(e)};
                {blockSpecialChars(e)}}}
                />
                {errors.father_name && <p className="text-red-400 text-xs mt-1">{errors.father_name}</p>}
              </div>
              <div>
                <label className={labelClass}>Father Mobile {requiredStar}</label>
                <input type="tel" name="father_mobile" value={formData.father_mobile} onChange={handleChange} className={inputClass("father_mobile")} placeholder="Father's mobile" maxLength="10"
                onKeyDown={(e) => {
                {blockLetters(e)};
                {blockSpecialChars(e)}}}
                />
                {errors.father_mobile && <p className="text-red-400 text-xs mt-1">{errors.father_mobile}</p>}
              </div>
              <div>
                <label className={labelClass}>Mother Name {requiredStar}</label>
                <input type="text" name="mother_name" value={formData.mother_name} onChange={handleChange} className={inputClass("mother_name")} placeholder="Mother's name" 
                onKeyDown={(e) => {
                {blockNumbers(e)};
                {blockSpecialChars(e)}}}
                />
                {errors.mother_name && <p className="text-red-400 text-xs mt-1">{errors.mother_name}</p>}
              </div>
              <div>
                <label className={labelClass}>Mother Mobile {requiredStar}</label>
                <input type="tel" name="mother_mobile" value={formData.mother_mobile} onChange={handleChange} className={inputClass("mother_mobile")} placeholder="Mother's mobile" maxLength="10" 
                onKeyDown={(e) => {
                {blockLetters(e)};
                {blockSpecialChars(e)}}}
                />
                {errors.mother_mobile && <p className="text-red-400 text-xs mt-1">{errors.mother_mobile}</p>}
              </div>
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
            pg: ["Post Graduate", "College Name", "Discipline"]
          };const docNames = {
            tenth: "tenth_marksheet",
            twelfth: "twelfth_marksheet",
            ug: "ug_degree_image",
            pg: "pg_degree_image"
          };
          const docLabels = {
            tenth: "10th Marksheet",
            twelfth: "12th/Diploma Marksheet",
            ug: "Undergraduate Certificate",
            pg: "Postgraduate Certificate"
          };
          return (
            <div key={prefix} className={index > 0 ? "mt-6" : ""}>
              <h4 className={subHeadingClass}>{labels[prefix][0]}</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className={labelClass}>{labels[prefix][1]}</label>
                  <input type="text" name={`${prefix}_school`} value={formData[`${prefix}_school`]} onChange={handleChange} className={inputClass(`${prefix}_school`)} placeholder={labels[prefix][1]}
                  onKeyDown={(e) => {
                {blockSpecialChars(e)}}}
                  />
                </div>
                <div>
                  <label className={labelClass}>{labels[prefix][2]}</label>
                  <input type="text" name={`${prefix}_board`} value={formData[`${prefix}_board`]} onChange={handleChange} className={inputClass(`${prefix}_board`)} placeholder={labels[prefix][2]} 
                  onKeyDown={(e) => {
                {blockNumbers(e)};
                {blockSpecialChars(e)}}}
                  />
                </div>
                <div>
                  <label className={labelClass}>Year of Passing</label>
                  <input type="text" name={`${prefix}_year`} value={formData[`${prefix}_year`]} onChange={handleChange} className={inputClass(`${prefix}_year`)} placeholder="YYYY" maxLength="4"
                  onKeyDown={(e) => {
                    {blockLetters(e)};
                    {blockSpecialChars(e)}}}
                  />
                  {errors[`${prefix}_year`] && <p className="text-red-400 text-xs mt-1">{errors[`${prefix}_year`]}</p>}
                </div>
                <div>
                  <label className={labelClass}>Marks (%)</label>
                  <input type="text" name={`${prefix}_marks`} value={formData[`${prefix}_marks`]} onChange={handleChange} className={inputClass(`${prefix}_marks`)} placeholder="Percentage" maxLength="2"
                  onKeyDown={(e) => {
                    {blockLetters(e)};
                    {blockSpecialChars(e)}}}
                  />
                  {errors[`${prefix}_marks`] && <p className="text-red-400 text-xs mt-1">{errors[`${prefix}_marks`]}</p>}
                </div>
                <div>
                  <label className={labelClass}></label>
                  <FileInput 
                    name={docNames[prefix]} 
                    label={docLabels[prefix]} 
                    accept="image/*,.pdf" 
                    required={false}
                    onChange={handleFileChange}
                    error={fileErrors[docNames[prefix]]}
                    reset={resetKey}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* SECTION 4: BANK & GOVERNMENT */}
      <div className={sectionClass}>
        <h2 className={sectionTitleClass}>Bank & Government Documents</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Aadhar Number {requiredStar}</label>
            <input type="text" name="aadhar" value={formData.aadhar} onChange={handleChange} className={inputClass("aadhar")} placeholder="12-digit Aadhar" maxLength="12" 
            onKeyDown={(e) => {
                    {blockLetters(e)};
                    {blockSpecialChars(e)}}}
                  
            />
            {errors.aadhar && <p className="text-red-400 text-xs mt-1">{errors.aadhar}</p>}
          </div>
          <div>
            <label className={labelClass}>PAN Number {requiredStar}</label>
            <input type="text" name="pan" value={formData.pan} onChange={(e) => {
                const upperValue = e.target.value.toUpperCase();
                const event = { target: { name: e.target.name, value: upperValue } };
                handleChange(event);
              }} className={inputClass("pan")} placeholder="10-digit PAN" maxLength="10" 
            onKeyDown={(e) => {
                    {blockSpecialChars(e)}}}
            />
            {errors.pan && <p className="text-red-400 text-xs mt-1">{errors.pan}</p>}
          </div>
          <div>
            <label className={labelClass}>Bank Account Number {formData.status !== "2" && requiredStar}</label>
            <input type="text" name="bank_account_number" value={formData.bank_account_number} onChange={handleChange} className={inputClass("bank_account_number")} placeholder="Account number" 
            onKeyDown={(e) => {
                    {blockLetters(e)};
                    {blockSpecialChars(e)}}}
            />
            {errors.bank_account_number && <p className="text-red-400 text-xs mt-1">{errors.bank_account_number}</p>}
          </div>
          <div>
            <label className={labelClass}>Bank Name {formData.status !== "2" && requiredStar}</label>
            <input type="text" name="bank_name" value={formData.bank_name} onChange={(e) => {
                const upperValue = e.target.value.toUpperCase();
                const event = { target: { name: e.target.name, value: upperValue } };
                handleChange(event);
              }} className={inputClass("bank_name")} placeholder="Bank name" 
                onKeyDown={(e) => {
                    {blockNumbers(e)};
                    {blockSpecialChars(e)}}}
            
            />
            {errors.bank_name && <p className="text-red-400 text-xs mt-1">{errors.bank_name}</p>}
          </div>
          <div>
            <label className={labelClass}>IFSC Code {formData.status !== "2" && requiredStar}</label>
            <input type="text" name="bank_ifsc" value={formData.bank_ifsc} onChange={(e) => {
                const upperValue = e.target.value.toUpperCase();
                const event = { target: { name: e.target.name, value: upperValue } };
                handleChange(event);
              }} className={inputClass("bank_ifsc")} placeholder="IFSC code" maxLength="11"
              onKeyDown={(e) => {
                    {blockSpecialChars(e)}}}
              />
            {errors.bank_ifsc && <p className="text-red-400 text-xs mt-1">{errors.bank_ifsc}</p>}
          </div>
          
        </div>
        <div>
            <label className={labelClass}></label>
            <FileInput 
              name="aadhar_image" 
              label="Aadhar Upload" 
              accept="image/*,.pdf" 
              required={true}
              onChange={handleFileChange}
              error={fileErrors.aadhar_image}
              reset={resetKey}
            />
          </div>
          <div>
            <label className={labelClass}></label>
                <FileInput 
                  name="pan_image" 
                  label="PAN Upload" 
                  accept="image/*,.pdf" 
                  required={true}
                  onChange={handleFileChange}
                  error={fileErrors.pan_image}
                  reset={resetKey}
                />
          </div>
      </div>

      {/* SECTION 5: EMPLOYMENT */}
      <div className={sectionClass}>
        <h2 className={sectionTitleClass}>Employment Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Salary (Monthly) {requiredStar}</label>
            <input type="number" name="salary" value={formData.salary} onChange={handleChange} className={inputClass("salary")} placeholder="Salary amount" />
            {errors.salary && <p className="text-red-400 text-xs mt-1">{errors.salary}</p>}
          </div>
          
          <div>
            <label className={labelClass}>Joining Date {requiredStar}</label>
            <input 
              type="date" 
              name="joining_date" 
              value={formData.joining_date || ""} 
              onChange={handleChange} 
              max={new Date().toISOString().split('T')[0]}
              className={inputClass("joining_date")} 
            />
            {errors.joining_date && <p className="text-red-400 text-xs mt-1">{errors.joining_date}</p>}
          </div>
          <div>
            <label className={labelClass}>Expertise {requiredStar}</label>
            <input type="text" name="expertise" value={formData.expertise} onChange={handleChange} className={inputClass("expertise")} placeholder="e.g. Full Stack, DevOps" 
            onKeyDown={(e) => {
                    {blockNumbers(e)};
                    {blockSpecialExceptComma(e)}}}
            />
            {errors.expertise && <p className="text-red-400 text-xs mt-1">{errors.expertise}</p>}
          </div>
        </div>
      </div>

      {/* BUTTONS */}
      <div className="flex justify-between pt-4">
        <button type="button" onClick={cleanData} className="px-8 py-3 bg-gray-700 text-gray-300 rounded-lg font-medium hover:bg-gray-600 transition-all duration-200">
          Clear
        </button>
        <button type="submit" className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all duration-200">
          Add Employee
        </button>
      </div>

    </form>
  </div>
);
}

export default Add_Employee;