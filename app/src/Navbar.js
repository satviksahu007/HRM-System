import { useState } from "react";                                             //To manage the states of compnents(active/not active)
import { useNavigate, useLocation } from "react-router-dom";                  //nav to navigate and loc to highlight current navbtn

function Navbar({ user, handleLogout }) {         
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);                          {/* Sidebar collapse status*/}
  const [expandedSections, setExpandedSections] = useState({                  
    tasks: true,
    hr: true,
    myteam :true,
    teamtasks: true,
    hrsettings:true,
    employeeMgmt: true,
    submissions: true,
    review: true,
  });                                                                         {/*btn collapse status */}

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };                                                                          {/*toggle collapse status for btn */}

  const onLogout = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/logout`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        handleLogout();
        navigate("/");
      }
    } catch (error) {
      console.log(error);
    }
  };                                                                         

  const isActive = (path) => {
    if (path === '/Manage') {
    return location.pathname === '/Manage' || 
           location.pathname === '/Add_Employee' ||
           location.pathname.startsWith('/Employee_Details');
  }
    if (path ==='/Manage_Teams'){
        return location.pathname === '/Manage_Teams' ||
          location.pathname === '/Create_Team'
      }
    if (path ==='/Manage_Settings'){
        return location.pathname ==='/Manage_Settings' ||
          location.pathname === '/Create_General_Settings' ||
          location.pathname === '/Create_Special_Approvals_Settings' ||
          location.pathname === '/Create_QNA_Settings'
    }
    return location.pathname === path;
  };                                                                          {/*handles btn active for pages inside /employee like view->edit */}

  const navBtn = (path) =>
    `flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ease-in-out ${
      isActive(path)
        ? "bg-white/10 text-white shadow-lg"
        : "text-gray-500 hover:bg-white/5 hover:text-gray-300"
    } ${collapsed ? "justify-center px-2" : ""}`;                              {/*if active show white overlay else grey and hover and if collapsed show svg*/}

  const sectionHeaderBtn = (section) =>
    `flex items-center justify-between w-full px-3 py-1.5 rounded-lg text-sm font-bold text-gray-400 uppercase tracking-wider hover:text-gray-300 transition-all duration-200 ${
      collapsed ? "justify-center px-2" : ""
    }`;                                                                         {/*for main heading tasks,hr */}

  const subSectionHeaderBtn = (section) =>
    `flex items-center justify-between w-full px-3 py-1.5 rounded-lg text-[12px] font-bold text-gray-500 uppercase tracking-wide hover:text-gray-400 transition-all duration-200 ${
      collapsed ? "hidden" : ""
    }`;                                                                         {/*for subheadings employee mgmt ,submission */}

  const sectionDivider = `border-t border-white/[0.2] my-3 ${collapsed ? "mx-2" : "mx-3"}`;               {/*a thin line between sections */}

  const taskItems = [
    { path: "/Work_Agenda", icon: CalendarIcon, label: "Daily Agenda" },
    { path: "/Report", icon: FileTextIcon, label: "Daily Report" },
    { path: "/Qna", icon: MessageSquareIcon, label: "Questionnaire" },
    { path: "/Performance_Report", icon: TrendingUpIcon, label: "Performance Report" },
  ];                                                                              {/*maps tasksitems to path icon and label */}

  const employeeItems = [
    { path: "/Manage", icon: UsersIcon, label: "Manage Employees" },
    { path: "/Manage_Teams", icon: GridIcon, label: "Manage Teams" },
  ];                                                                              {/*maps */}

  const hrItems = [
  { path: "/Manage_Settings", icon: SettingsIcon, label: "HR Settings" },
  { path: "/Calendar_Settings", icon: CalendarSettingsIcon, label: "Calendar Settings" },
];
  const myteamItems = [
  { path: "/Team_View", icon: UsersIcon, label: "My Team" },
];

const myteamTasksItems = [
  { path: "/Performance_Review", icon: UsersIcon, label: "Performance Review" },
  { path: "/Qna_Submissions_TeamLeader", icon: MessageCircleIcon, label: "Team Questionnaires" },
];


  const submissionItems = [
    { path: "/Tasks_Submission", icon: CalendarCheckIcon, label: "Daily Tasks " },
  ];                                                                              {/*maps */}

  const ReviewItems = [
    { path: "/Qna_Submissions", icon: MessageCircleIcon, label: "Questionnaires" },
    { path: "/Hr_Performance_Review", icon: AwardIcon, label: "Performance Reviews" }
  ]

  return (
    <div className={`${collapsed ? "w-[72px]" : "w-[240px]"} h-screen flex flex-col bg-black border-r border-white/[0.08] transition-all duration-300 ease-in-out`}>
      {/* Profile Section */}
      <div className="flex items-center justify-between px-3 py-4 border-b border-white/[0.2]">
        <button
          onClick={() => navigate("/Profile")}
          className={`flex items-center gap-3 rounded-lg transition-all duration-200 cursor-pointer ${
            collapsed ? "p-2 mx-auto" : "px-2 py-1.5"
          } ${
            location.pathname === "/Profile" 
              ? "bg-white/10" 
              : "hover:bg-white/5"
          }`}
        >
          <div className={`w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 border-2 transition-all duration-200 ${
            location.pathname === "/Profile" 
              ? "border-indigo-400" 
              : "border-white/20 hover:border-white/40"
          }`}>
            {user.name?.charAt(0) || "U"}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0 text-left">
              <p className={`text-sm font-medium truncate transition-all duration-200 ${
                location.pathname === "/Profile" ? "text-white" : "text-gray-200"
              }`}>
                {user.name}
              </p>
             <p className="text-xs text-gray-500 capitalize">
              {user.role === "employee" && user.is_team_lead === 1
                ? "Team Lead"
                : user.role}
            </p>
            </div>
          )}
        </button>
        
        {/* Collapse Button - Always visible */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`p-1.5 rounded-lg text-gray-600 hover:text-gray-300 hover:bg-white/5 transition-all duration-200 flex-shrink-0 ${
            collapsed ? "hidden" : ""
          }`}
          title="Collapse sidebar"
        >
          <ChevronLeftIcon />
        </button>
      </div>

      {/* Expand button when collapsed */}
      {collapsed && (
        <div className="px-3 pt-2 pb-2 border-b border-white/[0.08]">
          <button
            onClick={() => setCollapsed(false)}
            className="p-1.5 rounded-lg text-gray-600 hover:text-gray-300 hover:bg-white/5 transition-all duration-200 w-full flex justify-center"
            title="Expand sidebar"
          >
            <ChevronRightIcon />
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5 scrollbar-none">   {/*scrollbar added to global css to none */}
        {/* Home */}
        <button
          onClick={() => navigate("/Home")}
          className={navBtn("/Home")}
          title={collapsed ? "Home" : ""}
        >
          <HomeIcon active={isActive("/Home")} />
          {!collapsed && "Home"}
        </button>

        {/* Divider */}
        <div className={sectionDivider}></div>

        {/* Tasks Section */}

        {(user.role === "employee" || user.role === "admin" || user.is_team_lead === 1|| user.role ==="hr") && (
          <>
            <button
          onClick={() => !collapsed && toggleSection('tasks')}
          className={sectionHeaderBtn('tasks')}
        >
          {!collapsed && (
            <>
              <span>Tasks</span>
              <ChevronDownIcon open={expandedSections.tasks} />
            </>
          )}
        </button>
        {(!collapsed ? expandedSections.tasks : true) && taskItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={navBtn(item.path)}
            title={collapsed ? item.label : ""}
          >
            <item.icon active={isActive(item.path)} />
            {!collapsed && item.label}
          </button>
        ))}
        <div className={sectionDivider}></div>
          </>
        )}
        
        {/* My Team */}
        {(user.role === "employee" || user.role === "admin" || user.is_team_lead === 1 || user.role === "hr") && (
          <>
            <button
              onClick={() => !collapsed && toggleSection('myteam')}
              className={sectionHeaderBtn('myteam')}
            >
              {!collapsed && (
                <>
                  <span>My Team</span>
                  <ChevronDownIcon open={expandedSections.myteam} />
                </>
              )}
            </button>

            {(!collapsed ? expandedSections.myteam : true) &&
              myteamItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={navBtn(item.path)}
                  title={collapsed ? item.label : ""}
                >
                  <item.icon active={isActive(item.path)} />
                  {!collapsed && item.label}
                </button>
              ))}
              

            {/* Team Tasks */}
            {user.is_team_lead === 1 && (
              <>
                <button
                  onClick={() => !collapsed && toggleSection('teamtasks')}
                  className={sectionHeaderBtn('teamtasks')}
                >
                  {!collapsed && (
                <>
                  <span>Team Tasks</span>
                  <ChevronDownIcon open={expandedSections.teamtasks} />
                </>
              )}
                </button>

                {(!collapsed ? expandedSections.teamtasks : true) &&
                  myteamTasksItems.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className={navBtn(item.path)}
                      title={collapsed ? item.label : ""}
                    >
                      <item.icon active={isActive(item.path)} />
                      {!collapsed && item.label}
                    </button>
                  ))}
              </>
            )}

            <div className={sectionDivider}></div>
          </>
        )}
        

        {/* HR Section */}
        {(user.role === "hr" || user.role === "admin" || user.role === 'director') && (
          <>
            <button
                  onClick={() => toggleSection('hrsettings')}
                  className={subSectionHeaderBtn('hrsettings')}
                >
                  <span>HR SETTINGS</span>
                  <ChevronDownIcon open={expandedSections.hrsettings} />
                </button>
            {(!collapsed ? expandedSections.hr : true) && (
              <>
                {/* HR SETTINGS Sub-section */}
                
                {expandedSections.hrsettings && hrItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={navBtn(item.path)}
                    title={collapsed ? item.label : ""}
                  >
                    <item.icon active={isActive(item.path)} />
                    {!collapsed && item.label}
                  </button>
                ))}

                {/* Divider between sub-sections */}
                {expandedSections.hrsettings && (
                  <div className={sectionDivider}></div>
                )}
                {/* Employee Management Sub-section */}
                <button
                  onClick={() => toggleSection('employeeMgmt')}
                  className={subSectionHeaderBtn('employeeMgmt')}
                >
                
                  <span>Employee Management</span>
                  <ChevronDownIcon open={expandedSections.employeeMgmt} />
                </button>
                {expandedSections.employeeMgmt && employeeItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={navBtn(item.path)}
                    title={collapsed ? item.label : ""}
                  >
                    <item.icon active={isActive(item.path)} />
                    {!collapsed && item.label}
                  </button>
                ))}

                {/* Divider between sub-sections */}
                {expandedSections.employeeMgmt && (
                  <div className={sectionDivider}></div>
                )}

                {/* Submissions Sub-section */}
                <button
                  onClick={() => toggleSection('submissions')}
                  className={subSectionHeaderBtn('submissions')}
                >
                  <span>Submissions</span>
                  <ChevronDownIcon open={expandedSections.submissions} />
                </button>
                {expandedSections.submissions && submissionItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={navBtn(item.path)}
                    title={collapsed ? item.label : ""}
                  >
                    <item.icon active={isActive(item.path)} />
                    {!collapsed && item.label}
                  </button>
                ))}
              </>
            )}
            <div className={sectionDivider}></div>
          </>
        )}

        {(user.role === "hr" || user.role === 'director') && (
          <>
            <button
          onClick={() => !collapsed && toggleSection('review')}
          className={subSectionHeaderBtn('review')}
        >
          {!collapsed && (
            <>
              <span>Review</span>
              <ChevronDownIcon open={expandedSections.ReviewItems} />
            </>
          )}
          </button>
            {(!collapsed ? expandedSections.review : true) && (
              <>
                {expandedSections.review && ReviewItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={navBtn(item.path)}
                    title={collapsed ? item.label : ""}
                  >
                    <item.icon active={isActive(item.path)} />
                    {!collapsed && item.label}
                  </button>
                ))}
              </>
            )}
            <div className={sectionDivider}></div>
          </>
        )}
      </nav>

      
        

      {/* Logout */}
      <div className="px-3 py-3 border-t border-white/[0.2]">
        <button
          onClick={onLogout}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-400/80 hover:bg-red-400/10 hover:text-red-400 transition-all duration-200 ${
            collapsed ? "justify-center px-2" : ""
          }`}
          title={collapsed ? "Logout" : ""}
        >
          <LogOutIcon />
          {!collapsed && "Logout"}
        </button>
      </div>
    </div>
  );
}

// Icons
const HomeIcon = ({ active }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? "0" : "1.5"}>
    <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const CalendarIcon = ({ active }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
    <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" />
  </svg>
);

const FileTextIcon = ({ active }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const MessageSquareIcon = ({ active }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const TrendingUpIcon = ({ active }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const UserPlusIcon = ({ active }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <line x1="20" y1="8" x2="20" y2="14" />
    <line x1="23" y1="11" x2="17" y2="11" />
  </svg>
);

const CalendarSettingsIcon = ({ active }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Calendar Body */}
    <rect x="3" y="5" width="18" height="16" rx="2" ry="2" />

    {/* Calendar Header */}
    <line x1="3" y1="10" x2="21" y2="10" />

    {/* Rings */}
    <line x1="8" y1="3" x2="8" y2="7" />
    <line x1="16" y1="3" x2="16" y2="7" />

    {/* Settings Gear */}
    <circle cx="17" cy="16" r="2.5" />

    <path d="M17 12.8v1" />
    <path d="M17 18.2v1" />
    <path d="M13.8 16h1" />
    <path d="M19.2 16h1" />
  </svg>
);

const UsersIcon = ({ active }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87" />
    <path d="M16 3.13a4 4 0 010 7.75" />
  </svg>
);

const FolderPlusIcon = ({ active }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
    <line x1="12" y1="11" x2="12" y2="17" />
    <line x1="9" y1="14" x2="15" y2="14" />
  </svg>
);

const GridIcon = ({ active }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);

const CalendarCheckIcon = ({ active }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
    <polyline points="9 16 11 18 15 14" />
  </svg>
);

const FileCheckIcon = ({ active }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <polyline points="9 15 11 17 15 13" />
  </svg>
);

const MessageCircleIcon = ({ active }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
  </svg>
);

const AwardIcon = ({ active }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="7" />
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
  </svg>
);

const LogOutIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
);

const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 11l3 3L22 4" />
    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
  </svg>
);

const QAIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const ChevronDownIcon = ({ open }) => (
  <svg 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={`transition-transform duration-200 ${open ? "" : "-rotate-90"}`}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export default Navbar;
