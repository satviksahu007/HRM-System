import React from "react";
import { useState, useEffect, useRef } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import Login from "./Login";
import Work_Agenda from "./Work_Agenda";
import Report from "./Report";
import Navbar from "./Navbar";
import Performance_Report from "./Performance_Report";
import Home from "./Home";
import Add_Employee from "./Add_Employee";
import Employee_details from "./Employee_Details";
import Manage from "./Manage";
import Create_Team from "./Create_Team";
import Manage_Teams from "./Manage_Teams";
import Profile from "./Profile";
import Manage_Settings from "./Manage_Settings";
import Create_General_Settings from "./Create_General_Settings";
import Create_Special_Approvals_Settings from "./Create_Special_Approvals_Settings";
import Create_Qna_Settings from "./Create_Qna_Settings";
import Team_view from "./Team_View";
import Tasks_Submission from "./Tasks_Submission";
import Calendar_Settings from "./Calendar_Settings";
import Review_Now from "./Review_Now";
import Hr_Performance_Review from "./Hr_Performance_Review";
import Performance_Review from "./Performance_Review";
import Hr_View_Review from "./Hr_View_Review";
import Qna from "./Qna";
import Qna_Submissions from "./Qna_Submissions";
import Qna_Submissions_TeamLeader from "./Qna_Submissions_TeamLeader";

function App() {
  const [tasks, setTasks] = useState([]);
  const [submittedTasks, setSubmittedTasks] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const intervalRef = useRef(null);
  const lastActivityRef = useRef(0);
  const [forcePasswordChange, setForcePasswordChange] = useState(false);
  const loggingOutRef = useRef(false); 

  const checkSession = async (isPing = false) => {
    
    try {
      const url = isPing
        ? `${process.env.REACT_APP_API_URL}/check-session?ping=true`
        : `${process.env.REACT_APP_API_URL}/check-session`;
      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();
      if (!data.valid) {
        if (data.code === "TOKEN_MISMATCH") alert("Logged in from another device.");
        else if (data.code === "ACCOUNT_INACTIVE") alert("Account has been disabled.");
        else if (data.code === "IDLE_TIMEOUT") alert("Session expired due to inactivity.");
        setIsLoggedIn(false);
        setUser(null);
        setForcePasswordChange(false);
      }
    } catch (error) {
      console.log("Session check failed:", error);
    }
  };

  useEffect(() => {
    checkSession(false);
    intervalRef.current = setInterval(() => checkSession(true), 5000);
    const handleActivity = () => {
      const now = Date.now();
      if (now - lastActivityRef.current > 2000) {
        lastActivityRef.current = now;
        checkSession(false);
      }
    };
    const events = ["mousemove", "keydown", "click", "scroll"];
    events.forEach((e) => window.addEventListener(e, handleActivity, { passive: true }));
    return () => {
      clearInterval(intervalRef.current);
      
      events.forEach((e) => window.removeEventListener(e, handleActivity));
    };
  }, [isLoggedIn]);

  const handleLogout = async () => {
    loggingOutRef.current = true; 
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    try { await fetch(`${process.env.REACT_APP_API_URL}/logout`, { method: "POST", credentials: "include" }); } catch (e) {}
    setIsLoggedIn(false);
    setUser(null);
    setForcePasswordChange(false);
  };

  // NOT LOGGED IN
  if (!isLoggedIn) {
    return (
      <BrowserRouter>
        <Login setIsLoggedIn={setIsLoggedIn} setUser={setUser} setForcePasswordChange={setForcePasswordChange} />
      </BrowserRouter>
    );
  }

  // FORCED PASSWORD CHANGE
  if (forcePasswordChange) {
    return (
      <BrowserRouter>
        <div className="flex h-screen">
          <div className="flex-1 overflow-y-auto bg-gray-900">
            <Routes>
              <Route path="*" element={<Profile forced={true} onPasswordChanged={() => setForcePasswordChange(false)}/>} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    );
  }

  // NORMAL LOGGED IN
  return (
    <BrowserRouter>
      <div className="flex h-screen">
        <Navbar user={user} handleLogout={handleLogout} />
        <div className="flex-1 overflow-y-auto bg-gray-100">
          <Routes>
            <Route path="/Profile" element={<Profile onPasswordChanged={() => setForcePasswordChange(false)}/>} />
            <Route path="/Home" element={<Home />} />
            <Route path="/Work_Agenda" element={<Work_Agenda tasks={tasks} setTasks={setTasks} setSubmittedTasks={setSubmittedTasks} />} />
            <Route path="/Report" element={<Report />} />
            <Route path="/Performance_Report" element={<Performance_Report />} />
            <Route path="/ADD_Employee" element={<Add_Employee />} />
            <Route path="/Manage" element={<Manage />} />
            <Route path="/Employee_details/:empid" element={<Employee_details />} />
            <Route path="/Create_Team" element={<Create_Team />} />
            <Route path="/Manage_Teams" element={<Manage_Teams />} />
            <Route path="/Manage_Settings" element={<Manage_Settings />} />
            <Route path="/Create_General_Settings" element={<Create_General_Settings />} />
            <Route path="/Create_Special_Approvals_Settings" element={<Create_Special_Approvals_Settings />} />
            <Route path="/Create_Qna_Settings" element={<Create_Qna_Settings />} />
            <Route path="/Team_View" element={<Team_view />} />
            <Route path="/Tasks_Submission" element={<Tasks_Submission />} />
            <Route path="/Calendar_Settings" element={<Calendar_Settings />} />
            <Route path="/Performance_Report" element={<Performance_Report />} />
            <Route path="/Performance_Review" element={<Performance_Review />} />
            <Route path="/Hr_Performance_Review" element={<Hr_Performance_Review />} />
            <Route path="/Review_Now/:pr_id" element={<Review_Now />} />
            <Route path="/Hr_View_Review/:pr_id" element={<Hr_View_Review />} />
            <Route path="/Qna" element={<Qna />} />
            <Route path="/Qna_Submissions" element={<Qna_Submissions />} />
            <Route path="/Qna_Submissions_TeamLeader" element={<Qna_Submissions_TeamLeader />} />



          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
