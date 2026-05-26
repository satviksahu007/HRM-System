import React, { useState, useEffect ,useRef } from "react";
import { useNavigate } from "react-router-dom";

function Calendar_Settings() {

  const [calendarData, setCalendarData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().getMonth() + 1
  );
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear()
  );



  const downloadTemplate = () => {
    const link = document.createElement('a');
    link.href = 'http://localhost:5000/company_calendar/template';
    link.download = '';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fetchCalendar = async () => {
    try {

      setLoading(true);

      const res = await fetch(
        `http://localhost:5000/company_calendar?month=${selectedMonth}&year=${selectedYear}`,
        {
          credentials: "include"
        }
      );

      const data = await res.json();

      if (res.ok) {
        setCalendarData(data || []);
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fileInputRef = useRef(null);

  const handleUploadClick = () => {
    console.log("hello")
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      uploadCalendarExcel(file);
      e.target.value = ''; // reset so same file can be re-uploaded
    }
  };

  useEffect(() => {
    fetchCalendar();
  }, [selectedMonth, selectedYear]);




  const uploadCalendarExcel = async (file) => {
    console.log("hello")
    if (!file) return;
    try {
      setUploading(true);
      setUploadResult(null);

      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('http://localhost:5000/company_calendar/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      const data = await res.json();

      if (res.ok) {
        setUploadResult({ success: true, message: data.message, failed: data.failed || [] });
        fetchCalendar();
      } else {
        setUploadResult({ success: false, message: data.error || 'Upload failed', failed: [] });
      }
    } catch (err) {
      setUploadResult({ success: false, message: 'Something went wrong', failed: [] });
    } finally {
      setUploading(false);
    }
};

  const updateCalendarDay = async ({
    date,
    day_type,
    holiday_name = null,
    remarks = null
  }) => {

    try {

      const res = await fetch(
        "http://localhost:5000/company_calendar/update",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include",
          body: JSON.stringify({
            date,
            day_type,
            holiday_name,
            remarks
          })
        }
      );

      const data = await res.json();

      if (res.ok) {
        fetchCalendar();
      } else {
        console.error(data);
      }

    } catch (err) {
      console.error(err);
    }
  };

  const getDayData = (day) => {

    const month = String(selectedMonth).padStart(2, '0');
    const date = String(day).padStart(2, '0');

    const formattedDate = `${selectedYear}-${month}-${date}`;

    return calendarData.find(
      d => d.calendar_date === formattedDate
    );
  };

  const generateDefaultCalendar = async () => {
    try {
      const res = await fetch('http://localhost:5000/company_calendar/generate-default', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ year: selectedYear })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        fetchCalendar();
      } else {
        alert(data.error || 'Failed to generate calendar');
      }
    } catch (err) {
      alert('Something went wrong');
    }
};



  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Company Calendar</h1>
          <p className="text-gray-400 mt-2">
            Manage working days, holidays, weekoffs and special company schedules.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            onClick={generateDefaultCalendar}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg text-sm font-medium hover:bg-purple-600/30 border border-transparent transition-all duration-200 flex items-center gap-2"
          >
            Generate Default Calendar
          </button>

          <button
            onClick={downloadTemplate}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg text-sm font-medium hover:bg-purple-600/30 border border-transparent transition-all duration-200 flex items-center gap-2"
          >
            Download Holidays Template
          </button>
        
          <button
            onClick={handleUploadClick}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg text-sm font-medium hover:bg-purple-600/30 border border-transparent transition-all duration-200 flex items-center gap-2"
          >
            {uploading ? 'Uploading...' : 'Upload Holidays Excel'}
          </button>
        </div>
      </div>
      {uploadResult && (
          <div className={`rounded-2xl border p-4 mb-6 ${
            uploadResult.success
              ? 'bg-green-600/10 border-green-600/20 text-green-400'
              : 'bg-red-600/10 border-red-600/20 text-red-400'
          }`}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{uploadResult.message}</p>
              <button
                onClick={() => setUploadResult(null)}
                className="text-xs opacity-60 hover:opacity-100"
              >
                ✕
              </button>
            </div>

            {/* Failed rows */}
            {uploadResult.failed?.length > 0 && (
              <div className="mt-3 space-y-1">
                <p className="text-xs font-medium opacity-70">Failed rows:</p>
                {uploadResult.failed.map((f, i) => (
                  <p key={i} className="text-xs opacity-60">
                    Row {f.row}: {f.reason}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-5 mb-6">
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

    {/* Month */}
    <div>
      <label className="text-xs uppercase tracking-wide text-gray-500 mb-2 block">
        Month
      </label>
      <select
        value={selectedMonth}
        onChange={(e) => setSelectedMonth(Number(e.target.value))}
        className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500 text-white"
      >
        {[
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ].map((name, i) => (
          <option key={i + 1} value={i + 1}>{name}</option>
        ))}
      </select>
    </div>

    {/* Year */}
    <div>
      <label className="text-xs uppercase tracking-wide text-gray-500 mb-2 block">
        Year
      </label>
      <select
        value={selectedYear}
        onChange={(e) => setSelectedYear(Number(e.target.value))}
        className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500 text-white"
      >
        {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map((year) => (
          <option key={year} value={year}>{year}</option>
        ))}
      </select>
    </div>

    {/* Summary counts */}
    <div>
      <label className="text-xs uppercase tracking-wide text-gray-500 mb-2 block">
        Summary
      </label>
      <div className="flex gap-2 flex-wrap">
        <span className="text-xs px-3 py-2 rounded-xl bg-green-600/10 border border-green-600/20 text-green-400">
          {calendarData.filter(d => d.day_type === 'working').length} Working
        </span>
        <span className="text-xs px-3 py-2 rounded-xl bg-red-600/10 border border-red-600/20 text-red-400">
          {calendarData.filter(d => d.day_type === 'holiday').length} Holidays
        </span>
        <span className="text-xs px-3 py-2 rounded-xl bg-gray-700 border border-gray-600 text-gray-300">
          {calendarData.filter(d => d.day_type === 'weekoff').length} Weekoffs
        </span>
      </div>
    </div>

  </div>
</div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-green-600/10 border border-green-600/20 text-sm text-green-400">
          <div className="w-3 h-3 rounded-full bg-green-400" />
          Working Day
        </div>

        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-600/10 border border-red-600/20 text-sm text-red-400">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          Holiday
        </div>

        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-700 border border-gray-600 text-sm text-gray-300">
          <div className="w-3 h-3 rounded-full bg-gray-400" />
          Weekoff
        </div>

      </div>

      {/* Week Days Header */}
<div className="grid grid-cols-7 border-b border-gray-700 bg-gray-900">
  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
    <div
      key={day}
      className="p-4 text-center text-sm font-medium text-gray-400 border-r border-gray-700 last:border-r-0"
    >
      {day}
    </div>
  ))}
</div>

{/* Calendar Body */}
{(() => {
  const firstDay = new Date(selectedYear, selectedMonth - 1, 1).getDay();
  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const cells = [];

  // empty cells before first day
  for (let i = 0; i < firstDay; i++) {
    cells.push(
      <div
        key={`empty-${i}`}
        className="min-h-[140px] border border-gray-700 bg-gray-900/30"
      />
    );
  }

  // day cells
  for (let day = 1; day <= daysInMonth; day++) {
    const month = String(selectedMonth).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    const formattedDate = `${selectedYear}-${month}-${d}`;
    const dayData = calendarData.find(c => c.calendar_date === formattedDate);
    const dayType = dayData?.day_type || 'working';
    const isPast = formattedDate < new Date().toISOString().split('T')[0];

    const typeStyles = {
      working: 'bg-green-600/5 border-green-600/20 hover:bg-green-600/10',
      holiday: 'bg-red-600/5 border-red-600/20 hover:bg-red-600/10',
      weekoff: 'bg-gray-700/40 border-gray-600 hover:bg-gray-700/60',
    };

    const badgeStyles = {
      working: 'bg-green-600/10 border-green-600/20 text-green-400',
      holiday: 'bg-red-600/10 border-red-600/20 text-red-400',
      weekoff: 'bg-gray-700 border-gray-600 text-gray-300',
    };

    cells.push(
      <div
        key={day}
        className={`min-h-[140px] p-3 border transition-all ${typeStyles[dayType]} ${isPast ? 'opacity-60' : ''}`}
      >
        <div className="flex items-start justify-between mb-2">
          <span className="text-lg font-semibold text-white">{day}</span>
          <span className={`text-[10px] px-2 py-1 rounded-full border ${badgeStyles[dayType]}`}>
            {dayType.replace('_', ' ')}
          </span>
        </div>

        <div className="space-y-1">
          {dayData?.holiday_name && (
            <p className="text-xs text-red-300 truncate">{dayData.holiday_name}</p>
          )}
          {dayData?.remarks && (
            <p className="text-xs text-gray-400 truncate">{dayData.remarks}</p>
          )}
          {!dayData?.holiday_name && !dayData?.remarks && (
            <p className={`text-xs ${
              dayType === 'working' ? 'text-green-300' :
              dayType === 'holiday' ? 'text-red-300' :
              dayType === 'weekoff' ? 'text-gray-400' :
              'text-yellow-300'
            }`}>
              {dayType === 'working' ? 'Regular Working Day' :
               dayType === 'weekoff' ? 'Week Off' : ''}
            </p>
          )}
        </div>

        {/* only show edit for today and future */}
        {!isPast && (
          <div className="mt-4">
            <button
              onClick={() => setEditModal({
                date: formattedDate,
                day_type: dayType,
                holiday_name: dayData?.holiday_name || '',
                remarks: dayData?.remarks || ''
              })}
              className="text-xs px-2 py-1 rounded-lg bg-indigo-600/10 border border-indigo-600/20 text-indigo-300 hover:bg-indigo-600/20 transition-all"
            >
              View/Edit
            </button>
          </div>
        )}
      </div>
    );
  }

  return <div className="grid grid-cols-7">{cells}</div>;
})()}

     
      {editModal && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 w-full max-w-md">

      {/* Modal Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-white">Edit Day</h2>
          <p className="text-sm text-gray-400 mt-0.5">{editModal.date}</p>
        </div>
        <button
          onClick={() => setEditModal(null)}
          className="text-gray-400 hover:text-white transition-all text-xl leading-none"
        >
          ✕
        </button>
      </div>

      {/* Day Type */}
      <div className="mb-4">
        <label className="text-xs uppercase tracking-wide text-gray-500 mb-2 block">
          Day Type
        </label>
        <div className="grid grid-cols-2 gap-2">
          {['working', 'holiday', 'weekoff'].map((type) => (
            <button
              key={type}
              onClick={() => setEditModal(prev => ({ ...prev, day_type: type }))}
              className={`px-3 py-2.5 rounded-xl border text-sm capitalize transition-all ${
                editModal.day_type === type
                  ? type === 'working'   ? 'bg-green-600/20 border-green-500 text-green-300'
                  : type === 'holiday'   ? 'bg-red-600/20 border-red-500 text-red-300'
                  : type === 'weekoff'   ? 'bg-gray-600 border-gray-500 text-gray-200'
                  : 'bg-yellow-600/20 border-yellow-500 text-yellow-300'
                  : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500'
              }`}
            >
              {type.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Holiday Name — only show for holiday / half_day */}
      {['holiday'].includes(editModal.day_type) && (
        <div className="mb-4">
          <label className="text-xs uppercase tracking-wide text-gray-500 mb-2 block">
            Holiday Name
          </label>
          <input
            type="text"
            value={editModal.holiday_name}
            onChange={(e) => setEditModal(prev => ({ ...prev, holiday_name: e.target.value }))}
            placeholder="e.g. Diwali, Republic Day"
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500 text-white placeholder-gray-600"
          />
        </div>
      )}

      {/* Remarks */}
      <div className="mb-6">
        <label className="text-xs uppercase tracking-wide text-gray-500 mb-2 block">
          Remarks
        </label>
        <textarea
          value={editModal.remarks}
          onChange={(e) => setEditModal(prev => ({ ...prev, remarks: e.target.value }))}
          placeholder="Optional notes..."
          rows={2}
          className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500 text-white placeholder-gray-600 resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => setEditModal(null)}
          className="flex-1 px-4 py-3 rounded-xl bg-gray-700 hover:bg-gray-600 transition-all text-sm"
        >
          Cancel
        </button>
        <button
          onClick={async () => {
            setSaving(true);
            await updateCalendarDay({
              date: editModal.date,
              day_type: editModal.day_type,
              holiday_name: editModal.holiday_name || null,
              remarks: editModal.remarks || null
            });
            setSaving(false);
            setEditModal(null);
          }}
          disabled={saving}
          className="flex-1 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

    </div>
  </div>
)}
    </div>
  );
}


export default Calendar_Settings