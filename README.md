# FocusFlow - Human Resource Management System (HRMS)

![HRMS Banner](https://via.placeholder.com/1200x300/0F172A/FFFFFF?text=FocusFlow+HRMS)

FocusFlow is a robust, production-ready Human Resource Management System (HRMS) built on the MERN stack (MongoDB, Express.js, React, Node.js). It is designed to streamline employee management, time tracking, leave requests, and automated payroll processing.

---

## 🌟 Key Features

### 👤 For Employees
- **Dashboard:** View real-time attendance, working hours, and leave balances.
- **Time & Attendance:** Punch in/out with automatic tracking of working hours and late marks.
- **Leave Management:** Submit leave requests (Full day, Half day, Sick, Casual, Paid, Unpaid).
- **Payroll:** View and download beautifully formatted PDF Salary Slips.

### 👑 For Administrators
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
git clone <your-github-repo-url>
cd hrms-project
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

## 📤 How to Push to GitHub (For Beginners)

If you haven't uploaded this project to GitHub yet, follow these exact steps:

1. **Create a new repository on GitHub:**
   - Go to [GitHub.com](https://github.com/) and log in.
   - Click the **"+"** icon in the top right and select **"New repository"**.
   - Name your repository (e.g., `hrms-project`), leave it Public or Private, and click **"Create repository"**. (Do NOT initialize with a README, .gitignore, or license).

2. **Run these commands in your project terminal:**
   Open your terminal inside your project folder and run these commands one by one:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - HRMS Project"
   git branch -M main
   git remote add origin <PASTE_YOUR_GITHUB_REPO_URL_HERE>
   git push -u origin main
   ```
   *Your code is now live on GitHub!*

---

## ☁️ Deployment Guide (Render.com)

Deploying this MERN stack application to [Render](https://render.com/) is completely free and very easy.

### Step 1: Prepare for Deployment
Ensure your code is already pushed to your GitHub repository (using the steps above).

### Step 2: Deploy the Web Service
1. Go to [Render.com](https://render.com/) and sign up using your GitHub account.
2. Click on **"New +"** and select **"Web Service"**.
3. Connect your GitHub account and select your `hrms-project` repository.
4. Fill in the following details:
   - **Name:** `hrms-app` (or whatever you like)
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start` (Ensure your `package.json` has `"start": "node server.js"`)
5. Scroll down to **Environment Variables** and add the following:
   - `MONGODB_URI` : *(Paste your MongoDB Atlas connection string here)*
   - `JWT_SECRET` : `super_secret_key_123`
   - `NODE_ENV` : `production`
6. Click **"Create Web Service"**.

*Render will now build and deploy your app. This may take 5-10 minutes. Once finished, Render will give you a live URL (e.g., `https://hrms-app.onrender.com`) where your app is publicly accessible!*

---

## 🤝 Contribution

*Built with ❤️ using the MERN Stack.*
