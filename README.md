# 🏢 **WorkZen HRMS**

**WorkZen** is a modern, scalable **Human Resource Management System (HRMS)** designed to streamline and automate HR operations.  
It combines **Employee Management**, **Attendance Tracking**, **Airplane / Travel Management**, and **Payroll Processing** — all in one unified platform.  

Built with precision for the **Odoo Hackathon**.

---

## ⚙️ **Key Features**

---

### 👥 _Employee & Role Management_

- Centralized **employee directory**  
- **Role-based access control** (Admin / HR / Payroll / Employee)  
- Profile creation, updates, and department assignments  

---

### 🕒 _Attendance Tracking_

- **Daily check-in / check-out** functionality  
- **Monthly attendance summary** with visual logs  
- **Auto-sync** with payroll for accuracy  

---

### ✈️ _Airplane / Travel Management_

- Manage **business trips and flight bookings** for employees  
- HR can **approve or decline travel requests**  
- Auto-integrated with **payroll for travel reimbursements**  
- Generate **travel summary reports** per employee  

---

### 💸 _Payroll & Payslip Generation_

- Automated **monthly salary computation**  
- Supports **allowances**, **deductions**, and **travel reimbursements**  
- Generates **professional PDF salary slips** using **Puppeteer**  
- Ensures **data accuracy** and **timely payouts**  

---

### 📊 _Insights Dashboard_

- Unified **dashboard** for attendance, travel, and payroll analytics  
- Visual insights powered by **Chart.js**  
- Minimal and responsive interface  

---

## 🧰 **Technology Stack**

---

| **Layer** | **Technology Used** |
|------------|--------------------|
| **Frontend** | React.js, TailwindCSS |
| **Backend** | Node.js, Express.js |
| **Database** | MySQL (Sequelize ORM) |
| **Authentication** | JWT, bcrypt |
| **PDF Generation** | Puppeteer |
| **Charts** | Chart.js |
| **UI/UX** | Custom SVG Assets + Tailwind Components |

---

## 📁 **Project Structure**

---


WorkZen/
│
├── client/              # Frontend (React)
│   ├── src/
│   └── package.json
│
├── server/              # Backend (Node + Express)
│   ├── routes/
│   ├── models/
│   ├── controllers/
│   ├── config/db.js
│   └── server.js
│
└── README.md


---

## 🧩 **Installation & Setup**

---

### 🪄 **1️⃣ Clone the Repository**

```bash
git clone https://github.com/yourusername/workzen-hrms.git
cd workzen-hrms


⚙️ 2️⃣ Backend Setup
cd server
npm install


Create a .env file inside the /server directory:

DB_NAME=workzen_hrms
DB_USER=root
DB_PASS=yourpassword
JWT_SECRET=your_secret_key


Run the backend server:

npm run start

💻 3️⃣ Frontend Setup
cd ../client
npm install
npm run dev


Access the app on:
🌐 http://localhost:5173

🧾 Sample Salary Slip (PDF Preview)

Includes:

Company and employee details

Worked days + travel reimbursements

Breakdown of earnings and deductions

Net salary summary

Clean, corporate-grade layout

Generated using Puppeteer for pixel-perfect precision.

_🤝 Contribution Workflow_

Fork this repository

Create a new branch

git checkout -b feature-name


Commit your changes

git commit -m "Added new feature"


Push to your branch

Open a Pull Request 🎉

**👨‍💻 Team WorkZen**

Jineshwari Bagul
Nirwani Adhau
Arya Manve
Aashana Sonarkar

**🎯 Project Vision**

To build a clean, efficient, and automated HRMS that eliminates manual HR workflows — empowering HR teams to focus on people, not paperwork.

💡 Acknowledgements

Inspired by the Odoo Ecosystem

Thanks to all Hackathon Mentors and Open-Source Contributors
