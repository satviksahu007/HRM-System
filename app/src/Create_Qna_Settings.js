import React, { useState, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const rolesAndDepartments1 = [
  { id: "hr", name: "HR", value: 1 },
  { id: "emp", name: "Employee", value: 2 },
  { id: "tl", name: "Team Leader", value: 3 },
  { id: "dir",name: "Director",value: 4}
];
const rolesAndDepartments2 = [
  { id: "hr", name: "HR", value: 1 },
  { id: "tl", name: "Team Leader", value: 3 },
  { id: "dir", name: "Director", value: 4 },
];

function Create_Qna_Settings() {
  const navigate = useNavigate();
  const location = useLocation();
  const editingQuestion = location.state?.question;
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const debounceTimers = useRef({});
  const errorClass = "text-red-400 text-xs mt-1"; 
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState(() => {
    if (editingQuestion) {
      let askToArray = [], visibleToArray = [], optionsArray = [];
      if (editingQuestion.asking_to) {
        const vals = typeof editingQuestion.asking_to === "string" ? editingQuestion.asking_to.split(",") : editingQuestion.asking_to;
        askToArray = vals.filter(Boolean).map(v => rolesAndDepartments1.find(r => r.value.toString() === v.trim())?.id).filter(Boolean);
      }
      if (editingQuestion.viewable_by) {
        const vals = typeof editingQuestion.asking_to === "string" ? editingQuestion.viewable_by.split(",") : editingQuestion.viewable_by;
        visibleToArray = vals.filter(Boolean).map(v => rolesAndDepartments2.find(r => r.value.toString() === v.trim())?.id).filter(Boolean);
      }
      if (editingQuestion.selection_option) {
        optionsArray = (typeof editingQuestion.selection_option === "string" ? editingQuestion.selection_option.split(",") : editingQuestion.selection_option).filter(v => v.trim()).map((v, idx) => ({ id: `${idx}-${v}`, value: v.trim() }));
      }
      return {
        id: editingQuestion.id || editingQuestion.hqa_id,
        questionText: editingQuestion.question,
        type: editingQuestion.question_type,
        options: optionsArray,
        maxLength: editingQuestion.length_of_desc || 255,
        askTo: askToArray,
        visibleTo: visibleToArray,
        ask_every_x_days: editingQuestion.ask_every_x_days || ""
      };
    }
    return { questionText: "", type: "", options: [], maxLength: 255, askTo: [], visibleTo: [] ,ask_every_x_days:""};
  });

  const handleInputChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
  const handleQATypeChange = (type) => {
    const t = parseInt(type);
    if (t === 3) setFormData(prev => ({ ...prev, type: t, options: [{ id: Date.now().toString(), value: "" }, { id: (Date.now()+1).toString(), value: "" }], maxLength: undefined }));
    else setFormData(prev => ({ ...prev, type: t, options: [], maxLength: 255 }));
  };
  const addOption = () => setFormData(prev => ({ ...prev, options: [...(prev.options || []), { id: Date.now().toString(), value: "" }] }));
  const removeOption = (id) => setFormData(prev => ({ ...prev, options: prev.options.filter(o => o.id !== id) }));
  const updateOption = (id, value) => setFormData(prev => ({ ...prev, options: prev.options.map(o => o.id === id ? { ...o, value } : o) }));

  const handleSubmit = async () => {
    if (!validateAll()) return;
    setSaving(true);
    try {
      const payload = {
        question: formData.questionText.trim(),
        question_type: formData.type,
        asking_to: formData.askTo
          .map(id => rolesAndDepartments1.find(r => r.id === id)?.value)
          .filter(Boolean),                        
        viewable_by: formData.visibleTo
          .map(id => rolesAndDepartments2.find(r => r.id === id)?.value)
          .filter(Boolean),                          
        ask_every_x_days: formData.ask_every_x_days,
      };
      if (formData.id) payload.id = formData.id;
      if (formData.type === 1) payload.length_of_desc = formData.maxLength;
      payload.selection_option = formData.options.map(o => o.value.trim()).filter(Boolean);
      const res = await fetch("http://localhost:5000/qa/questions", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(payload) });
      const data = await res.json();
      if (res.ok) {

        setSuccess({
          message: formData.id
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

  const validateField = useCallback((field, value, formState = formData) => {
    switch (field) {
      case "questionText":
        if (!value?.trim()) return "Question is required";
        return "";
      case "ask_every_x_days":
        if (!value || value === "") return "This field is required";
        const days = parseInt(value, 10);
        if (isNaN(days) || days < 1) return "Must be a positive number (≥ 1)";
        return "";  
      case "type":
        if (!value) return "Question type is required";
        return "";
      case "options":
        if (formState.type === 3) {
          if (!value?.length) return "At least one option is required";
          if (value.some((o) => !o.value.trim()))
            return "All options must have a value";
        }
        return "";
      case "askTo":
        if (!value?.length) return "Select who can answer";
        return "";
      case "visibleTo":
        if (!value?.length) return "Select who can view";
        return "";
      case "options":
        if (formState.type === 3) {
            if (!value?.length) return "At least one option is required";
            if (value.some((o) => !o.value.trim())) return "All options must have a value";
        }
        return "";
      default:
        return "";
    }
  }, []);

  const debounceValidate = useCallback(
    (field, value, delay = 500) => {
      if (debounceTimers.current[field])
        clearTimeout(debounceTimers.current[field]);
      debounceTimers.current[field] = setTimeout(() => {
        const error = validateField(field, value);
        setErrors((prev) => ({ ...prev, [field]: error }));
      }, delay);
    },
    [validateField]
  );

  const validateAll = () => {
    const newErrors = {
      questionText: validateField("questionText", formData.questionText),
      type: validateField("type", formData.type),
      options: validateField("options", formData.options),
      askTo: validateField("askTo", formData.askTo),
      visibleTo: validateField("visibleTo", formData.visibleTo),
          ask_every_x_days: validateField("ask_every_x_days", formData.ask_every_x_days),
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some((err) => err);
  };

  const inputClass = "w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-gray-200";
  const labelClass = "block text-sm font-medium text-gray-300 mb-1.5";

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">{formData.id ? "Edit" : "Create"} Q&A Question</h1>
        <div className="bg-gray-900 rounded-xl p-6 space-y-6">
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
          <div>
            <label 
          className={labelClass}>Question</label><input type="text" value={formData.questionText} 
          onChange={e => handleInputChange("questionText", e.target.value)} className={inputClass} />
          {errors.questionText && <p className={errorClass}>{errors.questionText}</p>}
          </div>
          <div>
            <label 
            className={labelClass}>
                Type</label>
                {errors.type && <p className={errorClass}>{errors.type}</p>}
                <select required value={formData.type} 
                onChange={e => handleQATypeChange(e.target.value)} className={inputClass}>
                    <option value="">Select</option><option value="1">Descriptive</option><option value="3">Selection</option></select></div>
          {formData.type === 3 && (
            <div>
                <label 
                className={labelClass}>Options
                </label>
                {errors.options && <p className={errorClass}>{errors.options}</p>}
                {formData.options.map((opt, idx) => (<div key={opt.id} className="flex gap-2 mb-2"><input type="text" value={opt.value} onChange={e => updateOption(opt.id, e.target.value)} className={inputClass} placeholder={`Option ${idx+1}`} />{formData.options.length > 2 && <button type="button" onClick={() => removeOption(opt.id)} className="text-red-400">✕</button>}</div>))}<button type="button" onClick={addOption} className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg">+ Add Option</button></div>
          )}
          {formData.type === 1 && <div><label className={labelClass}>Max Length</label><input type="number" value={formData.maxLength} onChange={e => handleInputChange("maxLength", parseInt(e.target.value))} className={inputClass} min="1" max="1000" /></div>}
          <div>
  <label className={labelClass}>
    Ask Every X Days
  </label>

  <input
    type="number"
    value={formData.ask_every_x_days}
    onChange={(e) =>
      handleInputChange("ask_every_x_days", e.target.value)
    }
    className={inputClass}
    placeholder="e.g. 7"
    min="1"
  />
    {errors.ask_every_x_days && <p className={errorClass}>{errors.ask_every_x_days}</p>}

</div>
          <div>
            <label className={labelClass}>
                Ask To</label>
                {errors.askTo && <p className={errorClass}>{errors.askTo}</p>}
            {rolesAndDepartments1.map(role => (<label key={role.id} 
            className="flex items-center gap-2 mt-1">
                <input type="checkbox" checked={formData.askTo.includes(role.id)} 
                onChange={e => { const updated = e.target.checked ? [...formData.askTo, role.id] : 
                    formData.askTo.filter(id => id !== role.id); handleInputChange("askTo", updated); }} 
                className="w-4 h-4" />
                <span className="text-gray-300">{role.name}</span>
                </label>
            ))}
            </div>
            <div>
            <label className={labelClass}>
                Visible To</label>
                {errors.visibleTo && <p className={errorClass}>{errors.visibleTo}</p>}
            {rolesAndDepartments2.map(role => (<label key={role.id} 
            className="flex items-center gap-2 mt-1">
                <input type="checkbox" checked={formData.visibleTo.includes(role.id)} 
                onChange={e => { const updated = e.target.checked ? [...formData.visibleTo, role.id] : 
                    formData.visibleTo.filter(id => id !== role.id); handleInputChange("visibleTo", updated); }} 
                className="w-4 h-4" />
                <span className="text-gray-300">{role.name}</span>
                </label>
            ))}
            </div>
          <div className="flex justify-end gap-3 pt-4"><button type="button" 
          onClick={() => navigate("/Manage_Settings")} className="px-6 py-2.5 bg-gray-700 text-gray-300 rounded-lg"
          >Cancel</button>
          <button onClick={handleSubmit} disabled={saving} 
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg">{saving ? "Saving..." : (formData.id ? "Update" : "Save")}
            </button></div>
        </div>
      </div>
    </div>
  );
}

export default Create_Qna_Settings;