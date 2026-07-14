# FocusFlow - Human Resource Management System (HRMS)
<img width="1886" height="862" alt="image" src="https://github.com/user-attachments/assets/a00272d7-cc36-4be0-8cf4-b33500564de5" />


FocusFlow is a robust, production-ready Human Resource Management System (HRMS) built on the MERN stack (MongoDB, Express.js, React, Node.js). It is designed to streamline employee management, time tracking, leave requests, and automated payroll processing.

---

## 🌟 Key Features

### 👤 For Employees
<img width="1811" height="846" alt="image" src="https://github.com/user-attachments/assets/3465b8c9-817a-486e-855c-ea85f547eb0d" />


- **Dashboard:** View real-time attendance, working hours, and leave balances.
- **Time & Attendance:** Punch in/out with automatic tracking of working hours and late marks.
- **Leave Management:** Submit leave requests (Full day, Half day, Sick, Casual, Paid, Unpaid).
- **Payroll:** View and download beautifully formatted PDF Salary Slips.



### 👑 For Administrators
<img width="1847" height="803" alt="image" src="https://github.com/user-attachments/assets/2ec78c30-3bd5-4644-99f0-6a950cb4a29a" />



- **Employee Management:** Create, read, update, and deactivate employee profiles. Assign customized roles, employment types, and salaries.
- **Leave Approvals:** Review and approve/reject employee time-off requests.
- **Attendance Monitoring:** View company-wide punch records and generate monthly attendance reports.
- **Automated Payroll:** Automatically process monthly payrolls based on attendance, applying leave adjustment rules (e.g., auto-deducting available Paid Leaves for absent days) and calculating salary deductions.
- **Holiday & Policy Configuration:** Define organizational holidays and configure custom employment types with specific leave policies.
  


---

## 🛠️ Technology Stack

- **Frontend:** React.js (Vite), Redux Toolkit (State Management), React Router, Tailwind CSS (Styling), jsPDF (Report Generation).
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB & Mongoose.
- **Security:** JSON Web Tokens (JWT) for authentication, bcrypt for password hashing.

---

## 🚀 Getting Started (Step-by-Step Guide for Beginners)

Follow these simple steps to get the project running on your local machine.

### Prerequisites
Before you begin, ensure you have the following installed on your computer:
1. [Node.js](https://nodejs.org/) (v16 or higher)
2. [MongoDB](https://www.mongodb.com/try/download/community) (Running locally, or a MongoDB Atlas URI)

### Step 1: Clone the Repository
Open your terminal (or Command Prompt) and run:
```bash
git clone https://github.com/TejasJL/Human-Resource-Management-System
```

### Step 2: Install Dependencies
You need to install the required packages. In the project folder, run:
```bash
npm install
```

### Step 3: Configure Environment Variables
Create a file named `.env` in the root folder of the project. Open it and add the following configuration:
```env
# MongoDB Connection String (Local or Atlas)
MONGODB_URI=mongodb://127.0.0.1:27017/hrms

# JWT Secret Key (Can be any random secure string)
JWT_SECRET=super_secret_key_123

# Server Port
PORT=3000
```

### Step 4: Start the Application
Run the following command to start both the backend server and the React frontend simultaneously:
```bash
npm run dev
```

### Step 5: Access the App
Open your browser and navigate to:
**http://localhost:3000**

*(Note: If the database is empty, the system will automatically create a default Admin user upon startup so you can log in immediately.)*
- **Default Admin Email:** `admin@hrms.com`
- **Default Admin Password:** `admin123`

---

## 📄 API Documentation

A complete Postman Collection is included in this repository to help you test the backend APIs effortlessly.
- **File:** `HRMS_Postman_Collection.json`
- **How to use:** Open Postman -> Click "Import" -> Select the `HRMS_Postman_Collection.json` file. 

This collection includes all authentication, employee, leave, attendance, and payroll endpoints with pre-configured request bodies.

---

## 🤝 Contribution

*Built with ❤️ using the MERN Stack By Tejas*
