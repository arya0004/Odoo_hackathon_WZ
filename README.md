# 🌟 WorkZen HRMS

A modern Human Resource Management System designed to streamline HR operations — built for the Odoo Hackathon.  
WorkZen helps organizations manage **employees, attendance, leave, payroll, and payslips** from a single platform.

---

## 🚀 Features

### 👥 Employee & Role Management
- Add and manage employees
- Role-based access (Admin / HR / Payroll / Employee)

### 🕒 Attendance Tracking
- Mark daily attendance
- View monthly attendance logs

### 🌴 Leave Management
- Employees can apply for leave
- HR approves/rejects leave requests
- Leave auto-adjusts payroll calculations

### 💸 Payroll Processing
- Auto calculates monthly salary based on attendance
- Supports allowances and deductions
- **Generates a professional PDF salary slip**

### 📊 Dashboard
- Summary of attendance, leaves, and payroll insights

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React.js + TailwindCSS |
| Backend | Node.js + Express.js |
| Database | MySQL (Sequelize ORM) |
| Authentication | JWT + bcrypt |
| PDF Generator | Puppeteer |
| Charts | Chart.js |
| Assets & UI | Custom SVG Graphics |

---

## 📂 Project Structure

WorkZen/
│
├── client/ # Frontend (React)
│ ├── src/
│ └── package.json
│
├── server/ # Backend (Node + Express)
│ ├── routes/
│ ├── models/
│ ├── controllers/
│ ├── config/db.js
│ └── server.js
│
└── README.md

yaml
Copy code

---

## 🔧 Installation & Setup

### 1️⃣ Clone Project
```bash
git clone https://github.com/yourusername/workzen-hrms.git
cd workzen-hrms
2️⃣ Setup Backend
bash
Copy code
cd server
npm install
Create .env file:

ini
Copy code
DB_NAME=workzen_hrms
DB_USER=root
DB_PASS=yourpassword
JWT_SECRET=your_secret_key
Start backend:

bash
Copy code
npm run start
3️⃣ Setup Frontend
bash
Copy code
cd ../client
npm install
npm run dev
Visit App:

arduino
Copy code
http://localhost:5173
🧾 Sample Salary Slip (PDF Preview)
✔ Company & Employee Details
✔ Worked Days Calculations
✔ Earnings & Deductions
✔ Net Salary Highlighted
✔ Clean Corporate Layout

Generated using Puppeteer.

🤝 Contribution Guidelines
Fork this repository

Create a new branch:

bash
Copy code
git checkout -b feature-name
Commit your changes:

bash
Copy code
git commit -m "Added feature"
Push and open a Pull Request 🎉

👨‍💻 Team Members
Name	Role	Responsibilities
Jineshwari Bagul	Team Lead / Frontend	UI, Interactions, Integrations
Member 2	Backend Dev	Payroll + Models
Member 3	Database Admin	Schema & Query Optimization
Member 4	UI + Documentation	Branding & Presentation

(Replace names as needed.)

🏁 Goal of Project
To build a simple, intuitive, and scalable HRMS that reduces manual workload and empowers HR efficiency through clean design and automation.

⭐ Acknowledgements
Odoo ecosystem inspiration

Open-source contributors

Hackathon mentors

🌱 Built with passion by Team WorkZen

yaml
Copy code

---

Ready ✅  
If you want, I can now also:

### → **Add Screenshot Section** (automatically format your images)  
### → **Create Pitch Slide Deck**  
### → **Prepare Final Presentation Speech**

Just tell me: **"Add screenshots section"** 💜
