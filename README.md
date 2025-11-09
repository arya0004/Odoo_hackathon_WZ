🏢 WorkZen HRMS

WorkZen is a modern, scalable Human Resource Management System (HRMS) built for seamless people operations.
It unifies employee management, attendance tracking, travel (airplane) management, and payroll processing into a single intuitive platform — designed and developed for the Odoo Hackathon.

⚙️ Key Features
👥 Employee & Role Management

Centralized employee directory

Role-based access control (Admin / HR / Payroll / Employee)

Profile and designation management

🕒 Attendance Tracking

Daily check-in / check-out system

Monthly attendance summary view

Auto-sync with payroll calculations

✈️ Airplane / Travel Management

Manage employee business trips and flight bookings

HR can approve or decline travel requests

Auto-integrated with payroll for expense reimbursements

Includes travel summary reports per employee

💸 Payroll & Payslip Generation

Automated monthly salary computation

Dynamic inclusion of allowances, deductions, and travel reimbursements

Generates professional PDF salary slips using Puppeteer

📊 Insights Dashboard

Unified dashboard showing attendance, travel, and payroll analytics

Clean visual summaries powered by Chart.js

🧰 Technology Stack
Layer	Technology Used
Frontend	React.js, TailwindCSS
Backend	Node.js, Express.js
Database	MySQL (Sequelize ORM)
Authentication	JWT, bcrypt
PDF Generation	Puppeteer
Charts	Chart.js
UI/UX	Custom SVG assets + Tailwind components
📁 Project Structure
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

🧩 Installation & Setup
1️⃣ Clone the Repository
git clone https://github.com/yourusername/workzen-hrms.git
cd workzen-hrms

2️⃣ Backend Setup
cd server
npm install


Create a .env file in the /server directory:

DB_NAME=workzen_hrms
DB_USER=root
DB_PASS=yourpassword
JWT_SECRET=your_secret_key


Start the backend server:

npm run start

3️⃣ Frontend Setup
cd ../client
npm install
npm run dev


Visit the app in your browser:
🌐 http://localhost:5173

🧾 Sample Salary Slip (PDF Preview)

The salary slip includes:

Company and employee details

Worked days and travel reimbursements

Detailed earnings and deductions

Net salary summary

Clean, corporate-grade layout

Generated using Puppeteer for pixel-perfect precision.

🤝 Contribution Workflow

Fork this repository

Create a new branch

git checkout -b feature-name


Commit your changes

git commit -m "Added new feature"


Push to your branch and open a Pull Request 🎉

👨‍💻 Team WorkZen
Name	Role	Responsibilities
Jineshwari Bagul	Team Lead / Frontend	UI Design, Integrations, User Flows
Member 2	Backend Developer	Payroll Logic, APIs
Member 3	Database Admin	Schema Design, Query Optimization
Member 4	UI & Documentation	Branding, Presentation
🎯 Project Vision

To deliver a clean, efficient, and automated HRMS that eliminates manual HR workflows — empowering teams to focus on people, not paperwork.

💡 Acknowledgements

Inspired by the Odoo Ecosystem

Thanks to all Hackathon Mentors and Open-Source Contributors

🌱 Built with precision, performance, and passion by Team WorkZen
