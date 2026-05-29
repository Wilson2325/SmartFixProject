# SmartFix – Apartment Maintenance Management System

## Project Overview

SmartFix is a web-based Apartment Maintenance Management System designed to simplify maintenance service requests and management within apartments and residential communities. The system allows residents to raise maintenance complaints such as electrical issues, plumbing problems, AC repair, water leakage, appliance servicing, and other apartment-related services.

The platform helps apartment residents connect with maintenance staff or technicians efficiently. Admins can manage residents, technicians, complaints, and service status through a centralized dashboard.

---

# Features

## Resident Features

* User Registration & Login
* Raise Maintenance Complaints
* Request Maintenance Services
* Track Complaint Status
* View Service History
* Secure Payment Integration
* Ratings & Reviews

## Technician Features

* Technician Registration & Login
* View Assigned Jobs
* Update Work Status
* Manage Availability
* Accept or Reject Service Requests

## Admin Features

* Manage Residents
* Manage Technicians
* Approve Technician Accounts
* Monitor Maintenance Requests
* Manage Categories & Services
* View Reports & Analytics

---

# Technologies Used

## Frontend

* HTML
* CSS
* JavaScript
* Bootstrap

## Backend

* ASP.NET Core / .NET
* C#
* ASP.NET MVC / Web API

## Database

* SQL Server
* SQL Server Management Studio (SSMS)

## Tools & Platforms

* Visual Studio
* Git & GitHub

---

# System Architecture

1. Resident raises a maintenance complaint.
2. Complaint details are stored in the database.
3. Admin or system assigns available technicians.
4. Technician accepts and updates the task.
5. Maintenance status is updated.
6. Resident receives completion notification.

---

# Database Tables

* Users
* Residents
* Technicians
* Complaints
* MaintenanceRequests
* Payments
* Reviews
* Admin

---

# Modules

## Resident Module

Handles resident registration, login, profile management, and maintenance requests.

## Technician Module

Allows technicians to manage jobs, availability, and service updates.

## Complaint Management Module

Handles complaint registration, technician assignment, and status tracking.

## Payment Module

Manages online payments and transaction records.

## Admin Module

Controls overall system management and monitoring.

---

# Installation Steps

## Prerequisites

* Visual Studio
* SQL Server
* .NET SDK

## Steps to Run the Project

1. Clone the repository:

```bash
git clone https://github.com/your-username/smartfix.git
```

2. Open the project in Visual Studio.

3. Restore NuGet packages.

4. Configure the SQL Server connection string in `appsettings.json`.

5. Run database migrations or import the SQL script.

6. Build and run the project.

---

# Sample Login Credentials

## Admin

* Email: [admin@smartfix.com](mailto:admin@smartfix.com)
* Password: admin123

## Customer

* Email: [customer@smartfix.com](mailto:customer@smartfix.com)
* Password: customer123

## Technician

* Email: [tech@smartfix.com](mailto:tech@smartfix.com)
* Password: tech123

---

# Future Enhancements

* AI-based Technician Assignment
* Real-time Technician Tracking
* Mobile Application
* Chat Support System
* OTP Verification
* Multi-language Support

---

# Advantages

* Easy Complaint Registration
* Time Saving
* Reliable Technician Management
* User Friendly Interface
* Secure Data Handling

---

# Conclusion

SmartFix provides an efficient and user-friendly solution for managing apartment maintenance services. The system simplifies complaint handling, technician assignment, and maintenance tracking using modern web technologies.

---

# Author

Wilson Ebanesar G

---

# License

This project is developed for educational and academic purposes.
