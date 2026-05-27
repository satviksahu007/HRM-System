import React, { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";


const PasswordInput = ({ name, value, onChange, showPassword, onToggle, placeholder, error }) => (
  <div className="relative">
    <input
      type={showPassword ? "text" : "password"}
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full px-4 py-2.5 bg-gray-800 border rounded-lg text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none transition-all duration-200 ${
        error ? "border-red-500" : "border-gray-700"
      }`}
      placeholder={placeholder}
    />
    <button
      type="button"
      onClick={onToggle}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
    >
      {showPassword ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      )}
    </button>
  </div>
);

function Profile({forced = false,onPasswordChanged}) {
  const emptyForm = {
    new_password: "",
    confirm_password: "",
  };

  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
    const currentLocation = useLocation();
    const navigate = useNavigate();
    const [viewSubTab, setViewSubTab] = useState({ General: "present", "Special Approval": "present" });
    const [listSettings, setListSettings] = useState([]);
    const [listLoading, setListLoading] = useState(false);
    const [editingId, setEditingId] = useState(null); // tracks which item is being edited
    const [otpSent,setOtpSent] = useState(false)
    const [otp,setOtp] = useState("")
    const [sendingOtp,setSendingOtp] = useState(false)
    const [success, setSuccess] = useState(null);
    const [apiError, setApiError] = useState("");
  const [showPasswords, setShowPasswords] = useState({
    new_password: false,
    confirm_password: false,
  });
  const debounceTimers = useRef({});

  const passwordStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"];
  const strengthColor = ["", "#e24b4a", "#ef9f27", "#639922", "#1d9e75"];

  const debounce = (key, value, delay = 500) => {
    if (debounceTimers.current[key]) clearTimeout(debounceTimers.current[key]);
    debounceTimers.current[key] = setTimeout(() => {
      validateField(key, value);
    }, delay);
  };

  const handleSendOTP = async() =>{
    setSendingOtp(true)
    setErrors(prev => ({ ...prev, otp: "" }));  // Clear old error
    setOtp(""); 
    try{
      const res = await fetch(`${process.env.REACT_APP_API_URL}/send-otp`,{
        method:"POST",
        credentials:"include"
      })
      const data = await res.json();
      if (res.ok) {

        setOtpSent(true);

        setSuccess({
          message: "OTP sent to your registered email"
        });

        setApiError("");

      } else {

        setSuccess(null);
        setApiError(data.message || "Failed to send OTP");

      }
    }catch(e){
      console.log(e)
    }
    setSendingOtp(false)
  }

  const validateField = (name, value) => {
    let error = "";

    switch (name) {

      case "new_password":
        if (!value.trim()) error = "New password is required";
        else if (value.length < 8) error = "At least 8 characters required";
        else if (!/[A-Z]/.test(value)) error = "Must contain an uppercase letter";
        else if (!/[0-9]/.test(value)) error = "Must contain a number";
        else if (!/[^A-Za-z0-9]/.test(value)) error = "Must contain a special character";
        // Re-validate confirm if already filled
        if (formData.confirm_password) {
          setErrors((prev) => ({
            ...prev,
            confirm_password:
              formData.confirm_password !== value ? "Passwords do not match" : "",
          }));
        }
        break;

      case "confirm_password":
        if (!value.trim()) error = "Please confirm your password";
        else if (value !== formData.new_password) error = "Passwords do not match";
        break;
      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    debounce(name, value);
  };

  const toggleShow = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const cleanData = () => {
    setFormData(emptyForm);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if(otpSent){
      if(!otp || otp.length!==6){
        setErrors(prev=>({...prev,otp:"Enter the 6-digit OTP"}))
        return;
      }
    }

    let hasErrors = false;
    for (const field of ["new_password", "confirm_password"]) {
      const error = validateField(field, formData[field]);
      if (error) hasErrors = true;
    }
    if (hasErrors) return;
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/change_password`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          otp:otp,
          new_password: formData.new_password,
        }),
      });
      
      const data = await res.json();
      if (res.ok) {

        setSuccess({
          message: "Password changed successfully"
        });

        setApiError("");

        cleanData();

        if (onPasswordChanged) onPasswordChanged();

        setTimeout(() => {
          navigate("/Home");
        }, 1500);

      }
         else if (res.status === 400 || res.status === 401) {
        if (data.message.toLowerCase().includes("otp")) {
          setErrors((prev) => ({ ...prev, otp: data.message }));
        } else if (data.message.toLowerCase().includes("password")) {
          setErrors((prev) => ({ ...prev, new_password: data.message }));
        }
        } else {

          setSuccess(null);
          setApiError(data.message || "Something went wrong");

        }
    } catch (error) {

      console.log("Error:", error);

      setSuccess(null);
      setApiError("Failed to change password");

    }
  };

  const inputClass = (name) =>
    `w-full px-4 py-2.5 bg-gray-800 border rounded-lg text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none transition-all duration-200 ${
      errors[name] ? "border-red-500" : "border-gray-700"
    }`;

  const labelClass = "block text-sm font-medium text-gray-300 mb-1.5";
  const requiredStar = <span className="text-red-400">*</span>;
  const sectionClass = "bg-gray-900 rounded-xl p-6";
  const sectionTitleClass =
    "text-lg font-semibold text-white mb-6 flex items-center gap-3 pb-3 border-b border-gray-700";

  const strength = passwordStrength(formData.new_password);

  

  const criteria = [
    { label: "8+ characters", met: formData.new_password.length >= 8 },
    { label: "Uppercase letter", met: /[A-Z]/.test(formData.new_password) },
    { label: "Number", met: /[0-9]/.test(formData.new_password) },
    { label: "Special character", met: /[^A-Za-z0-9]/.test(formData.new_password) },
  ];

    return (
  <div className="w-full min-h-screen bg-gray-900 p-4 md:p-8">
    {forced && (
                <div className="mb-6 p-4 bg-yellow-900/50 border border-yellow-600 rounded-lg">
                    <p className="text-yellow-200">
                        ⚠️ This is your first login. Please change your password to continue.
                    </p>
                </div>
            )}

     
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-white mb-2">Change Password</h1>
      <p className="text-gray-400">Update your account password securely</p>
    </div>
     {/* Success */}
{success && (
  <div className="flex items-center gap-2 px-4 py-3 rounded-lg mb-4 border text-sm font-medium bg-green-600/20 border-green-600/30 text-green-400">
    <span>✅</span>
    {success.message}
  </div>
)}

{/* Error */}
{apiError && (
  <div className="flex items-center gap-2 px-4 py-3 rounded-lg mb-4 border text-sm font-medium bg-red-600/20 border-red-600/30 text-red-400">
    <span>❌</span>
    {apiError}
  </div>
)}

    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div className={sectionClass}>
        <h2 className={sectionTitleClass}>Password Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  
          {/* New Password */}
          <div>
            <label className={labelClass}>New Password {requiredStar}</label>
            <PasswordInput
              name="new_password"
              value={formData.new_password}
              onChange={handleChange}
              showPassword={showPasswords.new_password}
              onToggle={() => toggleShow("new_password")}
              placeholder="Enter new password"
              error={errors.new_password}
            />
            {errors.new_password && (
              <p className="text-red-400 text-xs mt-1">{errors.new_password}</p>
            )}

            {/* Strength bar */}
            {formData.new_password && (
              <div className="mt-3">
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4].map((s) => (
                    <div
                      key={s}
                      className="h-1 flex-1 rounded-full transition-all duration-300"
                      style={{
                        backgroundColor: s <= strength ? strengthColor[strength] : "#374151",
                      }}
                    />
                  ))}
                </div>
                <p className="text-xs" style={{ color: strengthColor[strength] }}>
                  {strengthLabel[strength]}
                </p>
              </div>
            )}

            {/* Criteria checklist */}
            {formData.new_password && (
              <div className="mt-3 grid grid-cols-2 gap-1">
                {criteria.map(({ label, met }) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <svg
                      className="w-3.5 h-3.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      style={{ color: met ? "#1d9e75" : "#6b7280" }}
                    >
                      {met ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 12m-4 0a4 4 0 108 0 4 4 0 00-8 0" />
                      )}
                    </svg>
                    <span className="text-xs" style={{ color: met ? "#1d9e75" : "#6b7280" }}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className={labelClass}>Confirm New Password {requiredStar}</label>
            <PasswordInput
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
              showPassword={showPasswords.confirm_password}
              onToggle={() => toggleShow("confirm_password")}
              placeholder="Re-enter new password"
              error={errors.confirm_password}
            />
            {errors.confirm_password && (
              <p className="text-red-400 text-xs mt-1">{errors.confirm_password}</p>
            )}
            {!errors.confirm_password &&
              formData.confirm_password &&
              formData.confirm_password === formData.new_password && (
                <p className="text-green-400 text-xs mt-1 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                  Passwords match
                </p>
              )}
          </div>
          <button
          type="button"
          onClick={handleSendOTP}
          disabled={sendingOtp ||otpSent}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-all duration-200 disabled:opacity-50 mb-4"
          >
            {sendingOtp? "Sending...":otpSent?"OTP Sent":"Generate OTP"}
          </button>

          {otpSent && (
  <div>
    <label className={labelClass}>Enter 6-Digit OTP {requiredStar}</label>
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={otp}
        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
        className={inputClass("otp")}
        placeholder="6-digit OTP"
        maxLength={6}
      />
      <button
        type="button"
        onClick={handleSendOTP}
        disabled={sendingOtp}
        className="px-3 py-2 text-xs text-indigo-400 hover:text-indigo-300 border border-indigo-400/30 rounded-lg hover:border-indigo-400/50 transition-colors flex-shrink-0"
      >
        {sendingOtp ? "..." : "Resend"}
      </button>
    </div>
    {errors.otp && <p className="text-red-400 text-xs mt-1">{errors.otp}</p>}
  </div>
)}

        </div>
      </div>

      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={cleanData}
          className="px-8 py-3 bg-gray-700 text-gray-300 rounded-lg font-medium hover:bg-gray-600 transition-all duration-200"
        >
          Clear
        </button>
        <button
          type="submit"
          className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all duration-200"
        >
          Change Password
        </button>
        
      </div>
    </form>
  </div>

  );
}

export default Profile;
