# HiveMind ERP

## Enterprise Resource Planning & Workforce Management Platform

HiveMind ERP is a role-based workforce management platform designed to streamline employee operations, task tracking, team collaboration, performance evaluation, questionnaire management, and organizational administration.

The system supports four stakeholder roles:

* HR
* Director
* Team Leader
* Employee

Each role is provided with dedicated workflows, permissions, dashboards, and review mechanisms.

---

## Core Modules

### Employee Management

Manage the complete employee lifecycle:

* Add employees
* Edit employee information
* Search employees
* View employee details
* Active employee management
* Trial employee management
* Employee termination
* Employee reactivation
* Trial extension
* Trial-to-permanent conversion

Employee categories include:

* Active Employees
* Inactive Employees
* Trial Employees
* Rejected Trial Employees

---

### Team Management

Create and manage organizational teams.

Features include:

* Team creation
* Team leader assignment
* Team member assignment
* Designation mapping
* Team editing
* Team activation and deactivation
* Team hierarchy management

---

### Daily Agenda Management

Employees can submit daily agendas according to configurable submission windows.

Features:

* Daily agenda submission
* On-time tracking
* Delayed submission tracking
* Missed submission tracking
* Calendar-based agenda history
* Settings-driven submission windows

---

### Daily Reporting

Track work completed throughout the day.

Features:

* Daily report submission
* Task status updates
* Previous-day report submission support
* Calendar-based report history
* On-time and delayed tracking

Task statuses include:

* Untouched
* Pending
* Completed

---

### Performance Management

Monthly performance reporting and review workflow.

Employee Functions:

* Submit monthly performance reports

Team Leader Functions:

* Review team performance reports
* Track pending reviews
* Track missed reviews

HR & Director Functions:

* Review organization-wide reports
* Track submission status
* Monitor review completion

---

### Questionnaire Management

Create and manage role-based questionnaires.

Features:

* Descriptive questionnaires
* Multiple-choice questionnaires
* Role-specific visibility
* Response tracking
* Submission monitoring
* Missed response tracking

Supported visibility levels:

* Employee
* Team Lead
* HR
* Director

---

### Employee Submission Analytics

HR and Directors can monitor:

* Daily agendas
* Daily reports
* Performance reports
* Questionnaire responses

Data can be viewed:

* Date-wise
* Month-wise

Submission status categories:

* On Time
* Delayed
* Missed

---

### Company Calendar Management

Centralized company calendar administration.

Features:

* Holiday calendar generation
* Excel calendar download
* Excel calendar upload
* Holiday management
* Working day management
* Week-off management
* Calendar synchronization with agenda and reporting modules

---

### Settings Management

#### General Settings

Configure organization-wide rules:

* Daily agenda windows
* Daily report windows
* Next-day report permissions
* Performance report windows
* Performance review windows

#### Special Approval Settings

Provide exceptions for specific employees:

* Early agenda access
* Late agenda access
* Early report access
* Late report access
* Next-day reporting permissions

---

### Notice Board

Employee notification system.

Tracks pending:

* Daily agendas
* Daily reports
* Performance reports
* Questionnaires

---

### Authentication & Session Management

Secure user management features:

* Employee ID login
* Mobile number login
* OTP-based password reset
* First-login password change
* Single-device login enforcement
* Session timeout handling
* Automatic logout after inactivity
* 24-hour maximum session duration

---

### Document Management

Employee document storage and verification.

Supported documents:

* Aadhaar
* PAN
* Employee Photograph
* 10th Marksheet
* 12th Marksheet
* UG Degree
* PG Degree

---

### Face Verification

OpenCV-based image validation for employee onboarding.

Features:

* Face detection
* Invalid image detection
* Multiple-face prevention

---

## Technology Stack

### Backend

* Python
* Flask
* Flask Sessions
* Flask-CORS

### Database

* MySQL

### Security

* SHA-256 Password Hashing
* OTP Authentication
* Session Token Validation

### Computer Vision

* OpenCV
* NumPy

### Reporting & Export

* OpenPyXL
* Excel Import/Export

### Notifications

* SMTP Email Services

---

## Author

Satvik Sahu
