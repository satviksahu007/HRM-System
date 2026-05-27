import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

function Create_Team() {
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [employees, setEmployees] = useState([]);
  const [empLoading, setEmpLoading] = useState(false);
  const [empSearch, setEmpSearch] = useState("");
  const empSearchTimer = useRef(null);
  const debounceTimers = useRef({});
  const navigate = useNavigate()
  const [designationErrors, setDesignationErrors] = useState({});
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState("");

  // Modal states
  const [showLeaderModal, setShowLeaderModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);

  const [formData, setFormData] = useState({
    team_name: "",
    team_leader: null,      // Single leader object
    team_members: [],        // Array of member objects
  });

  // Fetch employees
  const fetchEmployees = async (search = "") => {
    setEmpLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/employees/search?search=${encodeURIComponent(search)}`, {
        credentials: "include"
      });
      const data = await res.json();
      if (res.ok) {
        setEmployees(data.employees || []);
      }
    } catch (e) {
      console.log(e);
    }
    setEmpLoading(false);
  };

  // Debounced search
  const handleEmpSearch = (value) => {
    setEmpSearch(value);
    if (empSearchTimer.current) clearTimeout(empSearchTimer.current);
    empSearchTimer.current = setTimeout(() => {
      fetchEmployees(value);
    }, 400);
  };

  // Validation
  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "team_name":
        if (!value.trim()) {
          error = "Team name is required";
        } else if (value.trim().length < 3) {
          error = "At least 3 characters";
        }
        break;
      case "team_leader":
        if (!value) {
          error = "Please select a team leader";
        }
        break;
      case "team_members":
        if (!value || value.length === 0) {
          error = "Select at least one member";
        }
        break;
      case "designation":
        if (!value?.trim()) {
          error = "Designation is required";
        }
        break;
      default:
        break;
    }

    setErrors(prev => ({ ...prev, [name]: error }));
    return error;
  };

  const debounceValidate = useCallback((key, value, delay = 500) => {
    if (debounceTimers.current[key]) clearTimeout(debounceTimers.current[key]);
    debounceTimers.current[key] = setTimeout(() => validateField(key, value), delay);
  }, []);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    debounceValidate(name, value);
  };

  // Select leader from modal
  const selectLeader = (emp) => {
    setFormData(prev => ({
    ...prev,
    team_leader: {
      ...emp,
      designation: ""
    }
  }));
    setShowLeaderModal(false);
    validateField("team_leader", emp);
  };

  // Toggle member selection
  const toggleMember = (emp) => {
  const members = formData.team_members;

  const exists = members.find(m => m.eha_id === emp.eha_id);

  let updated;

  if (exists) {
    updated = members.filter(m => m.eha_id !== emp.eha_id);
  } else {
    updated = [
      ...members,
      {
        ...emp,
        designation: ""
      }
    ];
  }

  setFormData(prev => ({
    ...prev,
    team_members: updated
  }));

  validateField("team_members", updated);
};

  // Remove member
  const removeMember = (eha_id) => {
    const updated = formData.team_members.filter(m => m.eha_id !== eha_id);
    setFormData(prev => ({ ...prev, team_members: updated }));
    validateField("team_members", updated);
  };

  const clearData = () => {
    setFormData({
      team_name: "",
      team_leader: null,
      team_members: [],
    });
    setErrors({});
  };

  const handleSubmit = async (e) => {
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

      const res = await fetch(`${process.env.REACT_APP_API_URL}/create_team`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {

        setSuccess({
          message: "Team created successfully"
        });

        setError("");

        setTimeout(() => {
          navigate("/Manage_Teams");
        }, 1500);

      } else {

        setSuccess(null);
        setError(data.message || "Something went wrong");

      }
      
    } catch (e) {
      console.log(e); 
    }
    setSaving(false);
  };

  const inputClass = "w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200";
  const labelClass = "block text-sm font-medium text-gray-300 mb-1.5";
  const sectionClass = "bg-gray-900 rounded-xl p-6";

  // Filter employees for modals (exclude already selected)
  const selectedIds = [
    formData.team_leader?.eha_id,
    ...formData.team_members.map(m => m.eha_id)
  ].filter(Boolean);

  const availableEmployees = employees.filter(emp => !selectedIds.includes(emp.eha_id));

  return (
    <div className="w-full min-h-screen bg-gray-900 p-4 md:p-8">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Create Teams</h1>
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

      {/* Create Team Form */}
      <div className={sectionClass}>
        <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          Create A New Team
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Team Name */}
          <div>
            <label className={labelClass}>Team Name</label>
            <input
              type="text"
              name="team_name"
              value={formData.team_name}
              onChange={handleChange}
              className={inputClass}
              placeholder="Enter team name"
            />
            {errors.team_name && (
              <p className="text-red-400 text-xs mt-1">{errors.team_name}</p>
            )}
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
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, team_leader: null }));
                    setErrors(prev => ({ ...prev, team_leader: "Please select a team leader" }));
                  }}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setShowLeaderModal(true);
                  setEmpSearch("");
                  fetchEmployees();
                }}
                className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 border-dashed rounded-lg text-gray-400 hover:text-gray-300 hover:border-gray-500 transition-all duration-200 text-left"
              >
                + Click to select leader
              </button>
            )}
            {errors.team_leader && (
              <p className="text-red-400 text-xs mt-1">{errors.team_leader}</p>
            )}
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
                    <button
                      type="button"
                      onClick={() => removeMember(member.eha_id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
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
              onClick={() => {
                setShowMemberModal(true);
                setEmpSearch("");
                fetchEmployees();
              }}
              className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 border-dashed rounded-lg text-gray-400 hover:text-gray-300 hover:border-gray-500 transition-all duration-200 text-left"
            >
              + Click to add members
            </button>
            {errors.team_members && (
              <p className="text-red-400 text-xs mt-1">{errors.team_members}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={clearData}
              className="px-6 py-2.5 bg-gray-700 text-gray-300 rounded-lg font-medium hover:bg-gray-600 transition-all duration-200"
            >
              Clear
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all duration-200 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Create Team"}
            </button>
          </div>
        </form>
      </div>

      {/* Leader Selection Modal */}
      {showLeaderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-md max-h-[70vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">Select Team Leader</h3>
              <button onClick={() => setShowLeaderModal(false)} className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 border-b border-gray-700">
              <input
                type="text"
                placeholder="Search by name or EHA ID..."
                value={empSearch}
                onChange={(e) => handleEmpSearch(e.target.value)}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {empLoading ? (
                <p className="text-gray-400 text-center py-4">Loading...</p>
              ) : availableEmployees.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No employees found</p>
              ) : (
                availableEmployees.map((emp) => (
                  <button
                    key={emp.eha_id}
                    onClick={() => selectLeader(emp)}
                    className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors duration-150"
                  >
                    <p className="text-gray-200 font-medium">{emp.first_name} {emp.last_name}</p>
                    <p className="text-gray-400 text-sm">{emp.eha_id}</p>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Member Selection Modal */}
      {showMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-md max-h-[70vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">Select Team Members</h3>
              <button onClick={() => setShowMemberModal(false)} className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 border-b border-gray-700">
              <input
                type="text"
                placeholder="Search by name or EHA ID..."
                value={empSearch}
                onChange={(e) => handleEmpSearch(e.target.value)}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {empLoading ? (
                <p className="text-gray-400 text-center py-4">Loading...</p>
              ) : availableEmployees.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No employees found</p>
              ) : (
                availableEmployees.map((emp) => {
                  const isSelected = formData.team_members.some(m => m.eha_id === emp.eha_id);
                  return (
                    <button
                      key={emp.eha_id}
                      onClick={() => toggleMember(emp)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-colors duration-150 flex items-center justify-between ${
                        isSelected ? "bg-indigo-900/50 border border-indigo-700" : "hover:bg-gray-700"
                      }`}
                    >
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
                })
              )}
            </div>
            <div className="p-4 border-t border-gray-700">
              <button
                onClick={() => setShowMemberModal(false)}
                className="w-full px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all duration-200"
              >
                Done ({formData.team_members.length} selected)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Create_Team;
