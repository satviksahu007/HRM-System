import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

function Login({ setIsLoggedIn, setUser, setForcePasswordChange }) {
  const [empid, setEmpid] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate()
  const [inputMode,setInputMode] = useState("employee")
  const [mobileNumber,setMobileNumber] = useState("")
  const [forgotMode ,setForgotMode] = useState(false)
  const [otpSent, setOtpSent] = useState("")
  const [newPassword ,setNewPassword] = useState("")
  const [otp, setOtp] = useState("");

  const enableForgotMode = ()=>{
    setForgotMode(true)
    setOtpSent(false)
    setOtpSent("")
    setNewPassword("")
    setMessage("")
    setLoading(false)
  }
  const disableForgotMode = () => {
    setForgotMode(false);
    setOtpSent(false);
    setOtp("");
    setNewPassword("");
    setMessage("");
  };

  const handleRequestOTP = async(e)=>{
    e.preventDefault()
    if(inputMode === 'employee' && !empid){
      setMessage("Please enter your employee code")
      return
    }
    if (inputMode === "mobile" && !mobileNumber) {
      setMessage("Please enter your registered mobile number");
      return;
    }
    setLoading(true);
    setMessage("");

    try{
      const body = {}
      if(inputMode ==="employee"){
        body.empid = empid;
      }else{
        body.mobile = mobileNumber;
      }
      const res = await fetch(`${process.env.REACT_APP_API_URL}/forgot-password/request-otp`,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if(res.ok){
        setOtpSent(true)
        setMessage("")
      }else{
        setMessage(data.message || "Failed to send OTP")
      }
    }catch(error){
      setMessage("Network error.Please try again")
    }finally{
      setLoading(false)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if(inputMode === "employee" && !empid){
      setMessage("please enter your employee code")
    }
    if (inputMode === "mobile" && !mobileNumber) {
      setMessage("Please enter your mobile number");
      return;
    }
    if (!password) {
      setMessage("Please enter your password");
      return;
    }
    setLoading(true);
    setMessage("");
    
    try {
      const body = {password}
      if(inputMode=== "employee"){
        body.empid = empid
      }else{
        body.mobile = mobileNumber
      }
      const res = await fetch(`${process.env.REACT_APP_API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body)
      });
      const data = await res.json();
      
      if (res.ok) {
        setUser(data);
        if (data.is_first_login || data.requires_password_change) {
          setForcePasswordChange(true);
        }
        setIsLoggedIn(true);
        navigate("/Home")
      } else {
        setMessage(data.message || "Invalid credentials");
      }
    } catch (error) {
      setMessage("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
  const strength = passwordStrength(newPassword);
  const criteria = [
    { label: "8+ characters", met: newPassword.length >= 8 },
    { label: "Uppercase letter", met: /[A-Z]/.test(newPassword) },
    { label: "Number", met: /[0-9]/.test(newPassword) },
    { label: "Special character", met: /[^A-Za-z0-9]/.test(newPassword) },
  ];

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp || !newPassword) {
      setMessage("Please enter both OTP and new password");
      return;
    }
    if (newPassword.length < 8) {
      setMessage("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    setMessage("");

    try {
      const body = {
        otp,
        new_password: newPassword,
      };
      if (inputMode === "employee") {
        body.empid = empid;
      } else {
        body.mobile = mobileNumber;
      }

  const res = await fetch(`${process.env.REACT_APP_API_URL}/forgot-password/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage("Password reset successful! You can now log in.");
        // Return to normal login after 2 seconds
        setTimeout(() => {
          disableForgotMode();
        }, 2500);
      } else {
        setMessage(data.message || "Reset failed");
      }
    } catch (error) {
      setMessage("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };



  const identifierValue = inputMode ==="employee"? empid:mobileNumber;
  const identifierPlaceholder=
    inputMode ==="employee"?"Enter your employee ID":"Enter your registered mobile number"



  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4 relative overflow-hidden">
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>

      <div className="relative w-full max-w-md">
        <div className="bg-gray-800 rounded-2xl shadow-2xl shadow-black/50 border border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-700 px-8 py-20 text-center">
            <h1 className="text-2xl font-bold text-white">Hive Mind</h1>
          </div>

          {/* ---- Normal Login Form ---- */}
          {!forgotMode && (
            <form onSubmit={handleLogin} className="px-8 py-6 space-y-5">
              {message && (
                <div
                  className={`px-4 py-3 rounded-lg text-sm border ${
                    message.includes("success")
                      ? "bg-green-400/10 text-green-400 border-green-400/30"
                      : "bg-red-400/10 text-red-400 border-red-400/30"
                  }`}
                >
                  {message}
                </div>
              )}

              {/* Toggle */}
              <div className="flex rounded-lg bg-gray-700 p-1">
                <button
                  type="button"
                  onClick={() => {
                    setInputMode("employee");
                    setMessage("");
                  }}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    inputMode === "employee"
                      ? "bg-gradient-to-r from-indigo-600 to-purple-700 text-white shadow"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Employee Code
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInputMode("mobile");
                    setMessage("");
                  }}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    inputMode === "mobile"
                      ? "bg-gradient-to-r from-indigo-600 to-purple-700 text-white shadow"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Mobile Number
                </button>
              </div>

              {/* Identifier Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {inputMode === "employee" ? "Employee Code" : "Mobile Number"}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    {inputMode === "employee" ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    )}
                  </span>
                  <input
                    type={inputMode === "mobile" ? "tel" : "text"}
                    placeholder={identifierPlaceholder}
                    value={identifierValue}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (inputMode === "employee") {
                        setEmpid(val.toUpperCase());
                      } else {
                        const digitsOnly = val.replace(/\D/g, "").slice(0, 10);
                        setMobileNumber(digitsOnly);
                      }
                    }}
                    className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-800 transition-all duration-200 shadow-lg shadow-indigo-500/20 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </button>

              {/* Forgot Password link */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={enableForgotMode}
                  className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
            </form>
          )}

          {/* ---- Forgot Password Flow ---- */}
          {forgotMode && (
            <form
              onSubmit={otpSent ? handleResetPassword : handleRequestOTP}
              className="px-8 py-6 space-y-5"
            >
              <button
                type="button"
                onClick={disableForgotMode}
                className="text-sm text-indigo-400 hover:text-indigo-300 mb-2"
              >
                &larr; Back to login
              </button>

              <h2 className="text-xl font-semibold text-white text-center">
                Reset Password
              </h2>

              {message && (
                <div
                  className={`px-4 py-3 rounded-lg text-sm border ${
                    message.includes("success") || message.includes("sent")
                      ? "bg-green-400/10 text-green-400 border-green-400/30"
                      : "bg-red-400/10 text-red-400 border-red-400/30"
                  }`}
                >
                  {message}
                </div>
              )}

              {/* Identifier Toggle (always visible) */}
              <div className="flex rounded-lg bg-gray-700 p-1">
                <button
                  type="button"
                  onClick={() => {
                    setInputMode("employee");
                    setMessage("");
                  }}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    inputMode === "employee"
                      ? "bg-gradient-to-r from-indigo-600 to-purple-700 text-white shadow"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Employee Code
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInputMode("mobile");
                    setMessage("");
                  }}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    inputMode === "mobile"
                      ? "bg-gradient-to-r from-indigo-600 to-purple-700 text-white shadow"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Mobile Number
                </button>
              </div>

              {/* Identifier Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {inputMode === "employee" ? "Employee Code" : "Mobile Number"}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    {inputMode === "employee" ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    )}
                  </span>
                  <input
                    type={inputMode === "mobile" ? "tel" : "text"}
                    placeholder={identifierPlaceholder}
                    value={identifierValue}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (inputMode === "employee") {
                        setEmpid(val.toUpperCase());
                      } else {
                        const digitsOnly = val.replace(/\D/g, "").slice(0, 10);
                        setMobileNumber(digitsOnly);
                      }
                    }}
                    disabled={otpSent} // freeze identifier after OTP sent
                    className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 disabled:opacity-50"
                  />
                </div>
              </div>

              {/* OTP and New Password fields – appear after OTP is sent */}
              {otpSent && (
  <>
    {/* OTP Input */}
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        OTP (6 digits)
      </label>
      <input
        type="text"
        inputMode="numeric"
        maxLength={6}
        placeholder="Enter OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
        className="w-full pl-4 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200"
      />
    </div>

    {/* New Password Input with Strength Indicator */}
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        New Password
      </label>
      <input
        type="password"
        placeholder="Min. 8 characters"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        className="w-full pl-4 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200"
      />

      {/* Strength bar */}
      {newPassword && (
        <div className="mt-3">
          <div className="flex gap-1 mb-1">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className="h-1 flex-1 rounded-full transition-all duration-300"
                style={{
                  backgroundColor: s <= passwordStrength(newPassword) ? strengthColor[passwordStrength(newPassword)] : "#374151",
                }}
              />
            ))}
          </div>
          <p className="text-xs" style={{ color: strengthColor[passwordStrength(newPassword)] }}>
            {strengthLabel[passwordStrength(newPassword)]}
          </p>
        </div>
      )}

      {/* Criteria checklist */}
      {newPassword && (
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
    
  </>
)}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-800 transition-all duration-200 shadow-lg shadow-indigo-500/20 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? "Processing..."
                  : otpSent
                  ? "Reset Password"
                  : "Send OTP"}
              </button>
              {otpSent && (
      <button
        type="button"
        onClick={handleRequestOTP}
        disabled={loading}
        className="w-full py-2 bg-transparent border border-gray-600 text-gray-300 rounded-xl font-medium hover:bg-gray-700 hover:border-gray-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Sending..." : "Resend OTP"}
      </button>
    )}
            </form>
          )}

          <div className="px-8 py-4 bg-gray-900 border-t border-gray-700 text-center">
            <p className="text-xs text-gray-600">
              Micro Integrated Semiconductor Systems Pvt Ltd.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
