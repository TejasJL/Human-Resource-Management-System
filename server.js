import express from "express";
import mongoose from "mongoose";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import authRoutes from "./server/routes/authRoutes.js";
import employeeRoutes from "./server/routes/employeeRoutes.js";
import attendanceRoutes from "./server/routes/attendanceRoutes.js";
import leaveRoutes from "./server/routes/leaveRoutes.js";
import holidayRoutes from "./server/routes/holidayRoutes.js";
import payrollRoutes from "./server/routes/payrollRoutes.js";
import employmentTypeRoutes from "./server/routes/employmentTypeRoutes.js";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Connect to MongoDB
  const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://localhost:27017/hrms";
  try {
    await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB");

    const User = (await import("./server/models/User.js")).default;
    const bcrypt = (await import("bcryptjs")).default;
    const EmploymentType = (await import("./server/models/EmploymentType.js")).default;

    // ---------------------------------------------------
    // 1. Seed proper Employment Types
    // ---------------------------------------------------
    const defaultTypes = [
      { name: "Full Time",    leavePolicy: { casual: 12, sick: 12, paid: 18, unpaid: 0 } },
      { name: "Intern",       leavePolicy: { casual: 0,  sick: 6,  paid: 0,  unpaid: 0 } },
      { name: "Contractual",  leavePolicy: { casual: 0,  sick: 0,  paid: 6,  unpaid: 9999 } },
    ];

    for (const t of defaultTypes) {
      const exists = await EmploymentType.findOne({ name: t.name });
      if (!exists) {
        await EmploymentType.create(t);
        console.log(`Seeded employment type: ${t.name}`);
      }
    }

    // Remove the stale "Admin Type" that was created by the old seeder
    await EmploymentType.deleteOne({ name: "Admin Type" });

    // ---------------------------------------------------
    // 2. Seed Admin user (uses Full Time type)
    // ---------------------------------------------------
    const adminExists = await User.findOne({ role: "Admin" });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("admin123", salt);
      const ftType = await EmploymentType.findOne({ name: "Full Time" });

      const admin = new User({
        employeeId: "ADMIN-001",
        fullName: "System Admin",
        email: "admin@hrms.com",
        password: hashedPassword,
        dateOfJoining: new Date(),
        designation: "Administrator",
        monthlySalary: 0,
        role: "Admin",
        status: "Active",
        employmentType: ftType._id
      });
      await admin.save();
      console.log("Seeded default admin: admin@hrms.com / admin123");
    }
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }

  // API Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/employees", employeeRoutes);
  app.use("/api/attendance", attendanceRoutes);
  app.use("/api/leaves", leaveRoutes);
  app.use("/api/holidays", holidayRoutes);
  app.use("/api/payroll", payrollRoutes);
app.use("/api/employment-types", employmentTypeRoutes);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
