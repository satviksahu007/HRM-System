import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

function Manage_Teams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [employees, setEmployees] = useState([]);
  const [empLoading, setEmpLoading] = useState(false);
  const [empSearch, setEmpSearch] = useState("");
  const empSearchTimer = useRef(null);
  const debounceTimers = useRef({});
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("active")
  const [searchTerm, setSearchTerm] = useState("");
  const [success, setSuccess] = useState(null);
const [error, setError] = useState("");

  // Modal states
  const [showLeaderModal, setShowLeaderModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  

  const [statusFilter, setStatusFilter] = useState("all")

  const [designationErrors, setDesignationErrors] = useState({});

  const debounceDesignationValidation = (key, value) => {

  if (debounceTimers.current[key]) {
    clearTimeout(debounceTimers.current[key]);
  }

  debounceTimers.current[key] = setTimeout(() => {

    if (!value.trim()) {
      setDesignationErrors(prev => ({
        ...prev,
        [key]: "Designation is required"
      }));
    } else {
      setDesignationErrors(prev => ({
        ...prev,
        [key]: ""
      }));
    }

  }, 500);

};

 

  const [formData, setFormData] = useState({
    team_name: "",
    team_leader: null,
    team_members: [],
  });

  // Fetch all teams
  const fetchTeams = async (status) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/teams?status=${status}`, {
        credentials: "include"
      });
      const data = await res.json();
      console.log(data)
      if (res.ok) {
        setTeams(data.teams || []);
      }
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTeams(activeTab);
  }, [activeTab]);

  // Fetch employees for modals
  const fetchEmployees = async (search = "") => {
    setEmpLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/employees/search?search=${encodeURIComponent(search)}`, {
        credentials: "include"
      });
      const data = await res.json();
      console.log(data)
      if (res.ok) {
        setEmployees(data.employees || []);
      }
    } catch (e) {
      console.log(e);
    }
    setEmpLoading(false);
  };

  const handleEmpSearch = (value) => {
    setEmpSearch(value);
    if (empSearchTimer.current) clearTimeout(empSearchTimer.current);
    empSearchTimer.current = setTimeout(() => {
      fetchEmployees(value);
    }, 400);
  };

  // Start editing a team
  const startEdit = (team) => {
    setEditingTeam(team);
    setFormData({
      team_name: team.team_name || "",
      team_leader: team._leader || null,
      team_members: team._members || [],
    });
    setErrors({});
  };

  // Cancel editing
  const cancelEdit = () => {

  setEditingTeam(null);

  setFormData({
    team_name: "",
    team_leader: null,
    team_members: [],
  });

  setErrors({});

  Object.values(debounceTimers.current).forEach(clearTimeout);

  debounceTimers.current = {};

  setDesignationErrors({});

};

  // Validation
  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "team_name":
        if (!value.trim()) error = "Team name is required";
        else if (value.trim().length < 3) error = "At least 3 characters";
        break;
      case "team_leader":
        if (!value) error = "Please select a team leader";
        break;
      case "team_members":
        if (!value || value.length === 0) error = "Select at least one member";
        break;
    }
    setErrors(prev => ({ ...prev, [name]: error }));
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const selectLeader = (emp) => {
    setFormData(prev => ({ ...prev, team_leader: emp }));
    setShowLeaderModal(false);
    validateField("team_leader", emp);
  };

  const filteredTeams = teams.filter(team => {
    if (!searchTerm.trim()) return true;
    const search = searchTerm.toLowerCase();
    const memberMatch = team._members?.some(member =>
      `${member.first_name} ${member.last_name}`
        .toLowerCase()
        .includes(search)
    );

    const designationMatch =
      team.leader_designation?.toLowerCase().includes(search) ||

      team._members?.some(member =>
        member.designation?.toLowerCase().includes(search)
      );

    return (
      team.team_name?.toLowerCase().includes(search) ||
      team.tha_id?.toLowerCase().includes(search) ||
      team.leader_name?.toLowerCase().includes(search) ||
      memberMatch ||
      designationMatch
    );

});

  const toggleMember = (emp) => {
    const members = formData.team_members;
    const exists = members.find(m => m.eha_id === emp.eha_id);
    let updated;
    if (exists) {
      updated = members.filter(m => m.eha_id !== emp.eha_id);
    } else {
      updated = [...members, emp];
    }
    setFormData(prev => ({ ...prev, team_members: updated }));
    validateField("team_members", updated);
  };

  const removeMember = (eha_id) => {
    const updated = formData.team_members.filter(m => m.eha_id !== eha_id);
    setFormData(prev => ({ ...prev, team_members: updated }));
  };

  const removeLeader = () => {
    setFormData(prev => ({ ...prev, team_leader: null }));
  };

  const handleTabSwitch=(tab)=>{
    setActiveTab(tab)
  }


  const handleUpdate = async (e) => {
    e.preventDefault();

    const nameError = validateField("team_name", formData.team_name);
    const leaderError = validateField("team_leader", formData.team_leader);
    const membersError = validateField("team_members", formData.team_members);

    if (
      nameError ||
      leaderError ||
      membersError ||
      Object.values(designationErrors).some(error => error)
    ) return;

    setSaving(true);
    try {
      const payload = {
      team_name: formData.team_name.trim(),

      team_leader: {
        eha_id: formData.team_leader.eha_id,
        designation: formData.team_leader.designation || ""
      },

      team_members: formData.team_members.map(m => ({
        eha_id: m.eha_id,
        designation: m.designation || ""
      })),
    };

      const res = await fetch(`http://localhost:5000/teams/${editingTeam.tha_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {

        setSuccess({
          message: "Team updated successfully"
        });

        setError("");

        cancelEdit();

        fetchTeams(activeTab);

      } else {

        setSuccess(null);
        setError(data.message || "Failed to update team");

      }
      } catch (e) {

    console.log(e);

    setSuccess(null);
    setError("Failed to update team");

  }
    setSaving(false);
  };

  // Toggle team status
  const toggleStatus = async (team) => {
    const newStatus = team.status === 1 ? 0 : 1;
    const action = newStatus === 1 ? "Reactivate" : "Deactivate";
    

    try {
      const res = await fetch(`http://localhost:5000/teams/${team.tha_id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus })
      });

      const data = await res.json();
      if (res.ok) {

        setSuccess({
          message: `Team ${action}d successfully`
        });

        setError("");

        fetchTeams(activeTab);

      } else {

        setSuccess(null);
        setError(data.message || "Failed to update status");

      }
    } catch (e) {
      console.log(e);
    }
  };

  const inputClass = "w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200";
  const labelClass = "block text-sm font-medium text-gray-300 mb-1.5";
  const sectionClass = "bg-gray-900 rounded-xl  p-1";

  const selectedIds = [
    formData.team_leader?.eha_id,
    ...formData.team_members.map(m => m.eha_id)
  ].filter(Boolean);

  const availableEmployees = employees.filter(emp => !selectedIds.includes(emp.eha_id));

  return (
    <div className="w-full min-h-screen bg-gray-900 p-4 md:p-8">
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between">
          <h1 className="text-3xl font-bold text-white mb-2">Manage Teams</h1>
            <button
              type="submit"
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all duration-200 disabled:opacity-50"
              onClick={()=>navigate(`/Create_Team`)}
            >
              Create Team
            </button>
        </div>
        
        <p className="text-gray-400">View, edit and manage all teams</p>
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

      {/* Teams List */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        {/* Tabs */}
        <div className="flex bg-gray-900 rounded-lg p-1 gap-2">
          <button
            onClick={() => handleTabSwitch("active")}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === "active"
                ? "bg-indigo-600 text-white"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            Active Employees
          </button>
          <button
            onClick={() => handleTabSwitch("inactive")}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === "inactive"
                ? "bg-indigo-600 text-white"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            Inactive Employees
          </button>
        
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
            placeholder="Search by team, members, designations"
            className="w-full pl-10 text-[12px] pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200"
          />
        </div>
      </div>
      <div className={sectionClass}>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-400">Loading...</p>
          </div>
        ) : teams.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No teams found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTeams.map((team) => (
              <div key={team.tha_id} className={`bg-gray-900 rounded-xl border border-gray-700 p-3 hover:border-gray-600 transition-all duration-200 border-gray-700"
              }`}>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-1 rounded-lg">
                {/* Team Name */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Team Name</p>
                  <p className="text-sm font-medium text-indigo-400">{team.team_name}</p>
                </div>
                
                {/* Leader */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 tracking-wide">Leader</p>
                  <p className="text-sm font-medium text-gray-200">{team.leader_name || "—"}</p>
                  {team.leader_designation && (
                  <p className="text-xs text-indigo-400 mt-1">
                    {team.leader_designation}
                  </p>
                )}
                </div>
                
                {/* Members */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Members</p>
                  <p className="text-sm font-medium text-gray-200">{team.member_count || 0} members</p>
                </div>
                
                
                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startEdit(team)}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-all duration-200"
                  >
                    View More/Edit
                  </button>
                  <button
                    onClick={() => toggleStatus(team)}
                    className={`${
                    team.status === 1
                      ?  "px-4 py-2 bg-red-600/20 text-red-400 text-sm font-medium rounded-lg hover:bg-red-600/30 border border-red-600/30 transition-all duration-200"
                      : "px-4 py-2 bg-green-600/20 text-green-400 text-sm font-medium rounded-lg hover:bg-green-600/30 border border-green-600/30 transition-all duration-200"
                  }`}
                  >
                    {team.status === 1 ? "Deactivate" : "Reactivate"}
                  </button>
                </div>
              </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-700 sticky top-0 bg-gray-800 rounded-t-xl">
              <h3 className="text-lg font-semibold text-white">Edit Team: {editingTeam.tha_id}</h3>
              <button onClick={cancelEdit} className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-6 space-y-6">
              {/* Team Name */}
              <div>
                <label className={labelClass}>Team Name</label>
                <input
                  type="text"
                  name="team_name"
                  value={formData.team_name}
                  onChange={handleChange}
                  className={inputClass}
                />
                {errors.team_name && <p className="text-red-400 text-xs mt-1">{errors.team_name}</p>}
              </div>

              {/* Team Leader */}
              <div>
                <label className={labelClass}>Team Leader</label>
                {formData.team_leader ? (
                  <div className="flex items-center justify-between bg-gray-900 border border-gray-700 rounded-lg p-3">
                    <div>
                      <p className="text-white font-medium">{formData.team_leader.first_name} {formData.team_leader.last_name}</p>
                      <p className="text-gray-400 text-sm">{formData.team_leader.eha_id}</p>
                    <input
                      type="text"
                      placeholder="Leader designation"
                      value={formData.team_leader.designation || ""}
                      onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        team_leader: {
                          ...prev.team_leader,
                          designation: e.target.value
                        }
                      }));

                      debounceDesignationValidation(
                        "leader_designation",
                        e.target.value
                      );

                    }}
                      className="mt-3 w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    {designationErrors.leader_designation && (
                      <p className="text-red-400 text-xs mt-1">
                        {designationErrors.leader_designation}
                      </p>
                    )}
                    </div>
                    <button type="button" onClick={removeLeader} className="text-red-400 hover:text-red-300">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setShowLeaderModal(true); setEmpSearch(""); fetchEmployees(); }}
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 border-dashed rounded-lg text-gray-400 hover:text-gray-300 text-left"
                  >
                    + Click to select leader
                  </button>
                )}
                {errors.team_leader && <p className="text-red-400 text-xs mt-1">{errors.team_leader}</p>}
              </div>

              {/* Team Members */}
              <div>
                <label className={labelClass}>Team Members</label>
                {formData.team_members.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {formData.team_members.map((member) => (
                      <div key={member.eha_id} className="flex items-center justify-between bg-gray-900 border border-gray-700 rounded-lg p-3">
                        <div>
                          <p className="text-white font-medium">{member.first_name} {member.last_name}</p>
                          <p className="text-gray-400 text-sm">{member.eha_id}</p>
                          
                          <input
                            type="text"
                            placeholder="Member designation"
                            value={member.designation || ""}
                            onChange={(e) => {

                              const updated = formData.team_members.map((m) =>
                                m.eha_id === member.eha_id
                                  ? { ...m, designation: e.target.value }
                                  : m
                              );

                              setFormData(prev => ({
                                ...prev,
                                team_members: updated
                              }));
                              debounceDesignationValidation(
                                member.eha_id,
                                e.target.value
                              );

                            }}
                            className="mt-3 w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none"
                          />
                          {designationErrors[member.eha_id] && (
                          <p className="text-red-400 text-xs mt-1">
                            {designationErrors[member.eha_id]}
                          </p>
                        )}
                        </div>
                        <button type="button" onClick={() => removeMember(member.eha_id)} className="text-red-400 hover:text-red-300">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => { setShowMemberModal(true); setEmpSearch(""); fetchEmployees(); }}
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 border-dashed rounded-lg text-gray-400 hover:text-gray-300 text-left"
                >
                  + Add members
                </button>
                {errors.team_members && <p className="text-red-400 text-xs mt-1">{errors.team_members}</p>}
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                <button type="button" onClick={cancelEdit} className="px-6 py-2.5 bg-gray-700 text-gray-300 rounded-lg font-medium hover:bg-gray-600 transition-all duration-200">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all duration-200 disabled:opacity-50">
                  {saving ? "Saving..." : "Update Team"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Leader Selection Modal */}
      {showLeaderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-md max-h-[70vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">Select Team Leader</h3>
              <button onClick={() => setShowLeaderModal(false)} className="text-gray-400 hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 border-b border-gray-700">
              <input type="text" placeholder="Search..." value={empSearch}
                onChange={(e) => handleEmpSearch(e.target.value)}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {empLoading ? <p className="text-gray-400 text-center py-4">Loading...</p> :
               availableEmployees.length === 0 ? <p className="text-gray-500 text-center py-4">No employees found</p> :
               availableEmployees.map((emp) => (
                <button key={emp.eha_id} onClick={() => selectLeader(emp)}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors">
                  <p className="text-gray-200 font-medium">{emp.first_name} {emp.last_name}</p>
                  <p className="text-gray-400 text-sm">{emp.eha_id}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Member Selection Modal */}
      {showMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-md max-h-[70vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">Select Members</h3>
              <button onClick={() => setShowMemberModal(false)} className="text-gray-400 hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 border-b border-gray-700">
              <input type="text" placeholder="Search..." value={empSearch}
                onChange={(e) => handleEmpSearch(e.target.value)}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {empLoading ? <p className="text-gray-400 text-center py-4">Loading...</p> :
               availableEmployees.length === 0 ? <p className="text-gray-500 text-center py-4">No employees found</p> :
               availableEmployees.map((emp) => {
                const isSelected = formData.team_members.some(m => m.eha_id === emp.eha_id);
                return (
                  <button key={emp.eha_id} onClick={() => toggleMember(emp)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center justify-between ${
                      isSelected ? "bg-indigo-900/50 border border-indigo-700" : "hover:bg-gray-700"
                    }`}>
                    <div>
                      <p className="text-gray-200 font-medium">{emp.first_name} {emp.last_name}</p>
                      <p className="text-gray-400 text-sm">{emp.eha_id}</p>
                    </div>
                    {isSelected && (
                      <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="p-4 border-t border-gray-700">
              <button onClick={() => setShowMemberModal(false)}
                className="w-full px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all duration-200">
                Done ({formData.team_members.length} selected)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Manage_Teams;